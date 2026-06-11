import fs from "fs/promises";
import path from "path";
import type { Connector } from "./types";

const DEFAULT_DOCS = [
  "Atlas-Funded-Meta-Ads-Agent-Plan.md",
  ".cursor/plans/meta_ads_agent_system_fa6385e9.plan.md",
];

function resolveDocsRoot(): string {
  return process.env.DOCS_ROOT ?? path.join(process.env.HOME ?? "", "Documents");
}

async function readDoc(filename: string): Promise<string | null> {
  const full = path.join(resolveDocsRoot(), filename);
  try {
    return await fs.readFile(full, "utf-8");
  } catch {
    return null;
  }
}

function extractRelevantLines(content: string, query: string, maxLines = 12): string[] {
  const terms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 3);
  const lines = content.split("\n");
  const scored = lines
    .map((line, i) => {
      const lower = line.toLowerCase();
      const score = terms.reduce((s, t) => s + (lower.includes(t) ? 1 : 0), 0);
      return { line, i, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLines);
  return scored.map((x) => x.line.trim()).filter(Boolean);
}

export const docsConnector: Connector = {
  id: "docs",
  name: "Connected Documents",
  isConfigured: () => true,
  async execute(ctx) {
    const docsRoot = resolveDocsRoot();
    const filenames = process.env.DOCS_FILES
      ? process.env.DOCS_FILES.split(",").map((s) => s.trim())
      : DEFAULT_DOCS;

    await ctx.onLog(`Scanning docs in ${docsRoot}`, "info");

    const hits: string[] = [];
    for (const file of filenames) {
      const content = await readDoc(file);
      if (!content) {
        await ctx.onLog(`Doc not found: ${file}`, "warn");
        continue;
      }
      const relevant = extractRelevantLines(content, ctx.prompt);
      if (relevant.length) {
        hits.push(`**${file}**\n${relevant.join("\n")}`);
      }
    }

    if (!hits.length) {
      return {
        ok: true,
        summary: "No matching passages in connected documents.",
        data: { filesScanned: filenames.length },
      };
    }

    return {
      ok: true,
      summary: hits.slice(0, 3).join("\n\n"),
      data: { matchCount: hits.length },
    };
  },
};
