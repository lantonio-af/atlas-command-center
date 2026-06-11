import { NextRequest, NextResponse } from "next/server";
import type { AgentRole } from "@/config/agents";
import {
  isLongRunningTask,
  routeTask,
  routingExplanation,
} from "@/lib/agents/router";
import { createTask } from "@/lib/queue/processor";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { prompt?: string; agentId?: AgentRole };
  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }

  const agentId = body.agentId ?? routeTask(prompt);
  const duration = isLongRunningTask(prompt) ? "long_running" : "quick";

  const task = await createTask(prompt, agentId, duration);

  return NextResponse.json({
    task: {
      id: task.id,
      prompt: task.prompt,
      agentId: task.agentId,
      status: task.status,
      duration: task.duration,
    },
    routing: routingExplanation(prompt, agentId),
  });
}

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { logs: { orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json({ tasks });
}
