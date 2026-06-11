import type { Connector } from "./types";

export const higgsfieldConnector: Connector = {
  id: "higgsfield",
  name: "Higgsfield Creative",
  isConfigured: () => Boolean(process.env.HIGGSFIELD_API_KEY),
  async execute(ctx) {
    const apiKey = process.env.HIGGSFIELD_API_KEY;
    const baseUrl = process.env.HIGGSFIELD_API_URL ?? "https://api.higgsfield.ai";

    if (!apiKey) {
      await ctx.onLog("Higgsfield API key missing — simulating creative brief", "warn");
      await ctx.onProgress(50, "Drafting creative brief (stub)");
      return {
        ok: true,
        summary:
          "Higgsfield not configured. Stub brief: 15s vertical ad, Atlas Funded brand kit, hook on 100% profit split, CTA Get Funded.",
        data: {
          stub: true,
          format: "9:16 video",
          hook: "100% profit split — trade our capital",
          cta: "Get Funded",
        },
      };
    }

    await ctx.onLog("Submitting creative job to Higgsfield", "info");
    await ctx.onProgress(25, "Creating generation request");

    // Generic REST shape — adjust when real API docs are wired
    const res = await fetch(`${baseUrl}/v1/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: ctx.prompt,
        brand: "atlasfunded",
        aspect_ratio: "9:16",
      }),
    });

    const text = await res.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text.slice(0, 500) };
    }

    if (!res.ok) {
      return {
        ok: false,
        summary: "Higgsfield API error",
        error: typeof json === "object" && json && "message" in json
          ? String((json as { message: string }).message)
          : text.slice(0, 200),
      };
    }

    await ctx.onProgress(90, "Creative job queued");

    return {
      ok: true,
      summary: "Creative generation submitted to Higgsfield.",
      data: json,
    };
  },
};
