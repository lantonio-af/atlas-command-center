import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setAgentIdle } from "@/lib/queue/processor";
import type { AgentRole } from "@/config/agents";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: { logs: { orderBy: { createdAt: "asc" } } },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ task });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as { action?: string };

  if (body.action === "complete") {
    const task = await prisma.task.update({
      where: { id },
      data: { status: "completed", completedAt: new Date(), progress: 100 },
    });
    await setAgentIdle(task.agentId as AgentRole);
    return NextResponse.json({ task });
  }

  if (body.action === "cancel") {
    const task = await prisma.task.update({
      where: { id },
      data: { status: "cancelled", completedAt: new Date() },
    });
    await setAgentIdle(task.agentId as AgentRole);
    return NextResponse.json({ task });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
