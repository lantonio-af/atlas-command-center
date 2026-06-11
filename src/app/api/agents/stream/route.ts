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

async function buildSnapshot() {
  const agents = await prisma.agentState.findMany({ orderBy: { id: "asc" } });
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { logs: { orderBy: { createdAt: "desc" }, take: 8 } },
  });

  return {
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
  };
}

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureBootstrapped();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const push = async () => {
        if (closed) return;
        try {
          const snapshot = await buildSnapshot();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`),
          );
        } catch {
          /* client may have disconnected */
        }
      };

      await push();
      const interval = setInterval(push, 1500);

      const cleanup = () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      // @ts-expect-error — cancel exists on ReadableStreamDefaultController in runtime
      controller.signal?.addEventListener?.("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
