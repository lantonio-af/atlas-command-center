import type { Connector } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

export const metaConnector: Connector = {
  id: "meta",
  name: "Meta Marketing API",
  isConfigured: () =>
    Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID),
  async execute(ctx) {
    const token = process.env.META_ACCESS_TOKEN;
    const accountId = process.env.META_AD_ACCOUNT_ID;

    if (!token || !accountId) {
      await ctx.onLog("Meta credentials missing — returning stub insights", "warn");
      return {
        ok: true,
        summary:
          "Meta API not configured. Set META_ACCESS_TOKEN and META_AD_ACCOUNT_ID. Stub: target ROAS band 4–5×, account healthy.",
        data: { stub: true, targetRoas: { min: 4, max: 5 } },
      };
    }

    const actId = accountId.startsWith("act_") ? accountId : `act_${accountId}`;
    await ctx.onLog(`Fetching insights for ${actId}`, "info");
    await ctx.onProgress(30, "Querying Meta Insights API");

    const params = new URLSearchParams({
      access_token: token,
      fields: "spend,impressions,clicks,actions,action_values",
      date_preset: "last_7d",
      level: "account",
    });

    const res = await fetch(`${GRAPH}/${actId}/insights?${params}`);
    const json = (await res.json()) as {
      data?: Array<Record<string, unknown>>;
      error?: { message: string };
    };

    if (!res.ok || json.error) {
      return {
        ok: false,
        summary: "Meta API error",
        error: json.error?.message ?? `HTTP ${res.status}`,
      };
    }

    const row = json.data?.[0];
    if (!row) {
      return { ok: true, summary: "No insights data for last 7 days.", data: {} };
    }

    const spend = Number(row.spend ?? 0);
    const actions = (row.actions as Array<{ action_type: string; value: string }>) ?? [];
    const values =
      (row.action_values as Array<{ action_type: string; value: string }>) ?? [];
    const purchases = values.find((v) => v.action_type === "purchase");
    const revenue = purchases ? Number(purchases.value) : 0;
    const roas = spend > 0 ? revenue / spend : 0;

    await ctx.onProgress(80, "Computing ROAS");

    const band =
      roas >= 4 ? "on target (4–5×)" : roas >= 3 ? "watch zone" : "cut zone";

    return {
      ok: true,
      summary: `7d spend $${spend.toFixed(0)} · revenue $${revenue.toFixed(0)} · ROAS ${roas.toFixed(2)}× (${band})`,
      data: { spend, revenue, roas, impressions: row.impressions, clicks: row.clicks, actions },
    };
  },
};
