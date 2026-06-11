"use client";

import { FormEvent, useState } from "react";

export function CommandBar() {
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastRouting, setLastRouting] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || submitting) return;
    setSubmitting(true);
    setLastRouting(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (data.routing) setLastRouting(data.routing);
      if (res.ok) setPrompt("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="command-bar">
      <form onSubmit={onSubmit} className="command-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Give the team a task — e.g. “Check 7-day Meta ROAS” or “Generate a 15s ad brief”"
          className="command-input"
          disabled={submitting}
        />
        <button type="submit" className="command-submit" disabled={submitting || !prompt.trim()}>
          {submitting ? "Dispatching…" : "Dispatch"}
        </button>
      </form>
      {lastRouting && <p className="command-routing">{lastRouting}</p>}
    </div>
  );
}
