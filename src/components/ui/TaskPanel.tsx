"use client";

import { useCommandCenter } from "@/store/command-center";
import { AGENT_MAP } from "@/config/agents";
import type { AgentRole } from "@/config/agents";

export function TaskPanel() {
  const tasks = useCommandCenter((s) => s.tasks);
  const active = tasks.filter((t) => t.status === "running" || t.status === "queued").slice(0, 3);
  const recent = tasks.filter((t) => t.status === "completed" || t.status === "failed").slice(0, 4);

  return (
    <aside className="task-panel">
      <section>
        <h2 className="panel-heading">Active</h2>
        {active.length === 0 ? (
          <p className="panel-empty">No active tasks — dispatch one above.</p>
        ) : (
          active.map((task) => {
            const agent = AGENT_MAP[task.agentId as AgentRole];
            return (
              <div key={task.id} className="task-card task-card--active">
                <div className="task-card-header">
                  <span style={{ color: agent?.color }}>{agent?.name}</span>
                  <span className="task-status">{task.status}</span>
                </div>
                <p className="task-prompt">{task.prompt}</p>
                <div className="task-progress-bar">
                  <div className="task-progress-fill" style={{ width: `${task.progress}%`, background: agent?.color }} />
                </div>
                {task.logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="task-log-line">
                    {log.message}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </section>
      {recent.length > 0 && (
        <section>
          <h2 className="panel-heading">Recent</h2>
          {recent.map((task) => {
            const agent = AGENT_MAP[task.agentId as AgentRole];
            return (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <span style={{ color: agent?.color }}>{agent?.name}</span>
                  <span className={`task-status task-status--${task.status}`}>{task.status}</span>
                </div>
                <p className="task-prompt">{task.prompt}</p>
                {task.result && <p className="task-result">{task.result.slice(0, 180)}…</p>}
              </div>
            );
          })}
        </section>
      )}
    </aside>
  );
}
