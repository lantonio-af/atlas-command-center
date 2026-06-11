import type { ConnectorContext, ConnectorResult } from "@/lib/types";

export interface Connector {
  id: string;
  name: string;
  isConfigured: () => boolean;
  execute: (ctx: ConnectorContext) => Promise<ConnectorResult>;
}
