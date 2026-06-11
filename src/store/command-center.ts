import { create } from "zustand";
import type { AgentSnapshot, TaskSnapshot } from "@/lib/types";

type CommandCenterState = {
  agents: AgentSnapshot[];
  tasks: TaskSnapshot[];
  connectors: { id: string; name: string; configured: boolean }[];
  connected: boolean;
  setSnapshot: (data: {
    agents: AgentSnapshot[];
    tasks: TaskSnapshot[];
    connectors: { id: string; name: string; configured: boolean }[];
  }) => void;
  setConnected: (v: boolean) => void;
};

export const useCommandCenter = create<CommandCenterState>((set) => ({
  agents: [],
  tasks: [],
  connectors: [],
  connected: false,
  setSnapshot: (data) => set(data),
  setConnected: (connected) => set({ connected }),
}));
