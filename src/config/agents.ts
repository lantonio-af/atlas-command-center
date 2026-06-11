import { brand } from "./brand";

export type AgentRole =
  | "finance"
  | "operations"
  | "marketing"
  | "developer"
  | "affiliate"
  | "creative";

export type AgentDefinition = {
  id: AgentRole;
  name: string;
  title: string;
  description: string;
  zone: string;
  color: string;
  keywords: string[];
  connectors: string[];
  position: [number, number, number];
  deskRotation: number;
};

/** Hex layout around central command hub — static camera faces +Z */
export const AGENTS: AgentDefinition[] = [
  {
    id: "finance",
    name: "Ledger",
    title: "Finance",
    description: "ROAS, revenue, payouts, and budget intelligence",
    zone: "Finance Desk",
    color: brand.colors.success,
    keywords: [
      "roas",
      "revenue",
      "budget",
      "finance",
      "payout",
      "spend",
      "profit",
      "ledger",
      "money",
      "cpa",
    ],
    connectors: ["meta", "docs"],
    position: [-4.5, 0, -1.5],
    deskRotation: 0.35,
  },
  {
    id: "operations",
    name: "Mercury",
    title: "Operations",
    description: "Workflows, approvals, and day-to-day ops",
    zone: "Ops Console",
    color: brand.colors.neonCyan,
    keywords: [
      "ops",
      "operations",
      "workflow",
      "approve",
      "queue",
      "process",
      "mercury",
      "schedule",
      "digest",
    ],
    connectors: ["docs"],
    position: [-2.2, 0, -3.8],
    deskRotation: 0.15,
  },
  {
    id: "marketing",
    name: "Pulse",
    title: "Marketing",
    description: "Campaign strategy, Meta ads, and growth loops",
    zone: "Growth Hub",
    color: brand.colors.primary,
    keywords: [
      "marketing",
      "campaign",
      "meta",
      "ads",
      "ad set",
      "audience",
      "funnel",
      "pulse",
      "growth",
      "roas",
    ],
    connectors: ["meta", "docs"],
    position: [2.2, 0, -3.8],
    deskRotation: -0.15,
  },
  {
    id: "developer",
    name: "Forge",
    title: "Developer",
    description: "Code, integrations, and technical infrastructure",
    zone: "Dev Lab",
    color: "#a78bfa",
    keywords: [
      "code",
      "dev",
      "developer",
      "api",
      "bug",
      "deploy",
      "forge",
      "github",
      "integration",
      "build",
    ],
    connectors: ["docs"],
    position: [4.5, 0, -1.5],
    deskRotation: -0.35,
  },
  {
    id: "affiliate",
    name: "Broker",
    title: "Affiliate Manager",
    description: "Partners, referrals, and affiliate performance",
    zone: "Partner Lounge",
    color: brand.colors.warning,
    keywords: [
      "affiliate",
      "partner",
      "referral",
      "broker",
      "commission",
      "influencer",
    ],
    connectors: ["docs"],
    position: [3.2, 0, 1.2],
    deskRotation: -0.6,
  },
  {
    id: "creative",
    name: "Muse",
    title: "Creative",
    description: "Ad creative, brand assets, and Higgsfield generation",
    zone: "Creative Studio",
    color: "#f472b6",
    keywords: [
      "creative",
      "image",
      "video",
      "higgsfield",
      "muse",
      "design",
      "asset",
      "brief",
      "ad creative",
      "generate",
    ],
    connectors: ["higgsfield", "docs"],
    position: [-3.2, 0, 1.2],
    deskRotation: 0.6,
  },
];

export const AGENT_MAP = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentRole, AgentDefinition>;

export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_MAP[id as AgentRole];
}
