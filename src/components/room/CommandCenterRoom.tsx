"use client";

import { Float, Stars } from "@react-three/drei";
import { AGENTS } from "@/config/agents";
import { brand } from "@/config/brand";
import { AgentZone } from "./AgentZone";
import type { AgentSnapshot } from "@/lib/types";
import type { AgentRole } from "@/config/agents";

type Props = {
  agents: AgentSnapshot[];
};

export function CommandCenterRoom({ agents }: Props) {
  const agentMap = Object.fromEntries(agents.map((a) => [a.id, a])) as Partial<
    Record<AgentRole, AgentSnapshot>
  >;

  return (
    <>
      <color attach="background" args={[brand.colors.dark]} />
      <fog attach="fog" args={[brand.colors.dark, 12, 28]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 10, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 4, 0]} intensity={0.6} color={brand.colors.primary} />
      <pointLight position={[-5, 2, -2]} intensity={0.4} color={brand.colors.neonCyan} />
      <pointLight position={[5, 2, -2]} intensity={0.4} color={brand.colors.primary} />

      <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={0.4} />

      {/* Floor — glass platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Grid lines */}
      <gridHelper args={[20, 20, brand.colors.primary, "#1e293b"]} position={[0, 0.01, 0]} />

      {/* Central command hub */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <group position={[0, 1.2, 0]}>
          <mesh>
            <octahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial
              color={brand.colors.primary}
              emissive={brand.colors.primary}
              emissiveIntensity={0.6}
              metalness={0.7}
              roughness={0.2}
              wireframe
            />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial
              color={brand.colors.neonCyan}
              emissive={brand.colors.neonCyan}
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      </Float>

      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.4, 48]} />
        <meshStandardMaterial
          color={brand.colors.primary}
          emissive={brand.colors.primary}
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>

      {AGENTS.map((agent) => (
        <AgentZone
          key={agent.id}
          agentId={agent.id}
          snapshot={agentMap[agent.id]}
        />
      ))}
    </>
  );
}
