"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useCommandCenter } from "@/store/command-center";
import { useAgentStream } from "@/hooks/useAgentStream";
import { Header } from "@/components/ui/Header";
import { CommandBar } from "@/components/ui/CommandBar";
import { TaskPanel } from "@/components/ui/TaskPanel";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false },
);

const CommandCenterRoom = dynamic(
  () =>
    import("./CommandCenterRoom").then((m) => m.CommandCenterRoom),
  { ssr: false },
);

export function CommandCenterCanvas() {
  useAgentStream();
  const agents = useCommandCenter((s) => s.agents);
  const connected = useCommandCenter((s) => s.connected);

  return (
    <div className="command-center">
      <Header connected={connected} />
      <div className="room-viewport">
        <Suspense fallback={<div className="room-loading">Loading command center…</div>}>
          <Canvas
            shadows
            camera={{ position: [0, 5.5, 9.5], fov: 42, near: 0.1, far: 100 }}
            gl={{ antialias: true, alpha: false }}
          >
            <CommandCenterRoom agents={agents} />
          </Canvas>
        </Suspense>
      </div>
      <CommandBar />
      <TaskPanel />
    </div>
  );
}
