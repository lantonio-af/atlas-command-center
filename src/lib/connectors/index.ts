import { docsConnector } from "./docs";
import { higgsfieldConnector } from "./higgsfield";
import { metaConnector } from "./meta";
import type { Connector } from "./types";

export const CONNECTORS: Record<string, Connector> = {
  docs: docsConnector,
  meta: metaConnector,
  higgsfield: higgsfieldConnector,
};

export function getConnector(id: string): Connector | undefined {
  return CONNECTORS[id];
}

export function connectorStatus() {
  return Object.values(CONNECTORS).map((c) => ({
    id: c.id,
    name: c.name,
    configured: c.isConfigured(),
  }));
}
