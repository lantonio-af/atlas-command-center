"use client";

import { useEffect } from "react";
import { useCommandCenter } from "@/store/command-center";

export function useAgentStream() {
  const setSnapshot = useCommandCenter((s) => s.setSnapshot);
  const setConnected = useCommandCenter((s) => s.setConnected);

  useEffect(() => {
    let es: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource("/api/agents/stream");

      es.onopen = () => setConnected(true);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setSnapshot(data);
        } catch {
          /* ignore malformed */
        }
      };

      es.onerror = () => {
        setConnected(false);
        es?.close();
        retryTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimer);
      es?.close();
    };
  }, [setSnapshot, setConnected]);
}
