import { AGENTS, type AgentRole } from "@/config/agents";

const LONG_RUNNING_PATTERNS =
  /\b(monitor|watch|track|over\s+\d+\s+(hours?|days?)|daily|weekly|ongoing|continuous)\b/i;

export function isLongRunningTask(prompt: string): boolean {
  return LONG_RUNNING_PATTERNS.test(prompt);
}

export function routeTask(prompt: string): AgentRole {
  const lower = prompt.toLowerCase();
  let best: AgentRole = "operations";
  let bestScore = 0;

  for (const agent of AGENTS) {
    let score = 0;
    for (const kw of agent.keywords) {
      if (lower.includes(kw)) score += kw.length > 5 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = agent.id;
    }
  }

  return best;
}

export function routingExplanation(prompt: string, agentId: AgentRole): string {
  const agent = AGENTS.find((a) => a.id === agentId);
  return `Routed to ${agent?.name ?? agentId} (${agent?.title}) based on task keywords.`;
}
