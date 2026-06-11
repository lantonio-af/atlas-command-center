import { AGENTS, getAgentById, type AgentRole } from "@/config/agents";
import { getConnector } from "@/lib/connectors";
import { prisma } from "@/lib/db";
import type { TaskDuration } from "@/lib/types";

async function appendLog(taskId: string, message: string, level = "info") {
  await prisma.taskLog.create({ data: { taskId, message, level } });
}

async function setAgentWorking(
  agentId: AgentRole,
  taskId: string,
  label: string,
  progress: number,
) {
  const agent = getAgentById(agentId)!;
  await prisma.agentState.upsert({
    where: { id: agentId },
    create: {
      id: agentId,
      name: agent.name,
      role: agent.title,
      status: "working",
      currentTask: taskId,
      statusLabel: label,
      progress,
    },
    update: {
      status: "working",
      currentTask: taskId,
      statusLabel: label,
      progress,
    },
  });
}

export async function setAgentIdle(agentId: AgentRole) {
  const agent = getAgentById(agentId)!;
  await prisma.agentState.upsert({
    where: { id: agentId },
    create: {
      id: agentId,
      name: agent.name,
      role: agent.title,
      status: "idle",
      currentTask: null,
      statusLabel: "Standing by",
      progress: 0,
    },
    update: {
      status: "idle",
      currentTask: null,
      statusLabel: "Standing by",
      progress: 0,
    },
  });
}

async function updateTaskProgress(
  taskId: string,
  progress: number,
  statusLabel?: string,
) {
  await prisma.task.update({
    where: { id: taskId },
    data: { progress },
  });
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (task && statusLabel) {
    await setAgentWorking(task.agentId as AgentRole, taskId, statusLabel, progress);
  }
}

export async function seedAgents() {
  for (const agent of AGENTS) {
    await prisma.agentState.upsert({
      where: { id: agent.id },
      create: {
        id: agent.id,
        name: agent.name,
        role: agent.title,
        status: "idle",
        statusLabel: "Standing by",
        progress: 0,
      },
      update: {},
    });
  }
}

export async function processTask(taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.status !== "queued") return;

  const agentId = task.agentId as AgentRole;
  const agent = getAgentById(agentId);
  if (!agent) return;

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "running", startedAt: new Date(), progress: 5 },
  });
  await setAgentWorking(agentId, taskId, "Starting up…", 5);
  await appendLog(taskId, `${agent.name} received task`);

  const ctx = {
    prompt: task.prompt,
    agentId,
    onLog: async (message: string, level = "info") => {
      await appendLog(taskId, message, level);
    },
    onProgress: async (progress: number, label?: string) => {
      await updateTaskProgress(taskId, progress, label);
    },
  };

  try {
    const results: string[] = [];

    for (let i = 0; i < agent.connectors.length; i++) {
      const connectorId = agent.connectors[i];
      const connector = getConnector(connectorId);
      if (!connector) continue;

      const baseProgress = 10 + Math.floor((i / agent.connectors.length) * 70);
      await ctx.onProgress(baseProgress, `Running ${connector.name}`);

      const result = await connector.execute(ctx);
      if (result.summary) results.push(result.summary);
      if (!result.ok) {
        throw new Error(result.error ?? `${connector.name} failed`);
      }
    }

    await ctx.onProgress(95, "Wrapping up");

    const resultText = results.join("\n\n") || "Task completed.";

    if (task.duration === "long_running") {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          status: "running",
          progress: 100,
          result: resultText,
        },
      });
      await setAgentWorking(agentId, taskId, "Monitoring (long-running)", 100);
      await appendLog(taskId, "Long-running task — agent stays in monitoring mode");
      return;
    }

    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "completed",
        progress: 100,
        result: resultText,
        completedAt: new Date(),
      },
    });
    await appendLog(taskId, "Task completed");
    await setAgentIdle(agentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.task.update({
      where: { id: taskId },
      data: { status: "failed", error: message, completedAt: new Date() },
    });
    await appendLog(taskId, message, "error");
    const agentDef = getAgentById(agentId)!;
    await prisma.agentState.update({
      where: { id: agentId },
      data: {
        status: "error",
        statusLabel: `Error — ${message.slice(0, 40)}`,
        currentTask: taskId,
      },
    });
    // Reset to idle after brief error display
    setTimeout(() => void setAgentIdle(agentId), 8000);
  }
}

export async function createTask(
  prompt: string,
  agentId: AgentRole,
  duration: TaskDuration,
) {
  const task = await prisma.task.create({
    data: { prompt, agentId, duration, status: "queued" },
  });
  await appendLog(task.id, `Task queued for ${getAgentById(agentId)?.name}`);

  // Fire-and-forget processing
  void processTask(task.id);

  return task;
}

/** Resume long-running tasks on server boot */
export async function resumeLongRunningTasks() {
  const running = await prisma.task.findMany({
    where: { duration: "long_running", status: "running" },
  });
  for (const task of running) {
    const agent = getAgentById(task.agentId as AgentRole);
    if (agent) {
      await prisma.agentState.update({
        where: { id: task.agentId },
        data: {
          status: "working",
          currentTask: task.id,
          statusLabel: "Monitoring (long-running)",
          progress: task.progress,
        },
      });
    }
  }
}
