import type { AgentRole } from "@/config/agents";

export type AgentStatus = "idle" | "working" | "waiting" | "error";
export type TaskStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type TaskDuration = "quick" | "long_running";

export type AgentSnapshot = {
  id: AgentRole;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string | null;
  statusLabel: string;
  progress: number;
  updatedAt: string;
};

export type TaskSnapshot = {
  id: string;
  prompt: string;
  agentId: AgentRole;
  status: TaskStatus;
  duration: TaskDuration;
  progress: number;
  result: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  logs: { id: string; message: string; level: string; createdAt: string }[];
};

export type ConnectorResult = {
  ok: boolean;
  summary: string;
  data?: unknown;
  error?: string;
};

export type ConnectorContext = {
  prompt: string;
  agentId: AgentRole;
  onLog: (message: string, level?: string) => Promise<void>;
  onProgress: (progress: number, label?: string) => Promise<void>;
};
