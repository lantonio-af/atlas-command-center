"use client";

import { brand } from "@/config/brand";
import { useCommandCenter } from "@/store/command-center";

type Props = { connected: boolean };

export function Header({ connected }: Props) {
  const connectors = useCommandCenter((s) => s.connectors);

  return (
    <header className="header">
      <div className="header-brand">
        <img src={brand.logoUrl} alt={brand.name} className="header-logo" />
        <div>
          <h1 className="header-title">{brand.productName}</h1>
          <p className="header-tagline">{brand.tagline}</p>
        </div>
      </div>
      <div className="header-meta">
        <span className={`status-dot ${connected ? "status-dot--live" : ""}`} />
        <span className="header-status">{connected ? "Live" : "Reconnecting…"}</span>
        <div className="connector-pills">
          {connectors.map((c) => (
            <span
              key={c.id}
              className={`connector-pill ${c.configured ? "connector-pill--on" : "connector-pill--off"}`}
              title={c.configured ? `${c.name} connected` : `${c.name} — needs config`}
            >
              {c.id}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
