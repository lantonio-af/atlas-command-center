import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resumeLongRunningTasks, seedAgents } from "@/lib/queue/processor";
import { connectorStatus } from "@/lib/connectors";

let bootstrapped = false;

async function ensureBootstrapped() {
  if (bootstrapped) return;
  await seedAgents();
  await resumeLongRunningTasks();
  bootstrapped = true;
}

export async function GET() {
  await ensureBootstrapped();

  const agents = await prisma.agentState.findMany({ orderBy: { id: "asc" } });
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { logs: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  return NextResponse.json({
    agents: agents.map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      currentTask: a.currentTask,
      statusLabel: a.statusLabel,
      progress: a.progress,
      updatedAt: a.updatedAt.toISOString(),
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      prompt: t.prompt,
      agentId: t.agentId,
      status: t.status,
      duration: t.duration,
      progress: t.progress,
      result: t.result,
      error: t.error,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      logs: t.logs.map((l) => ({
        id: l.id,
        message: l.message,
        level: l.level,
        createdAt: l.createdAt.toISOString(),
      })),
    })),
    connectors: connectorStatus(),
  });
}
