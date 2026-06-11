"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { AgentSnapshot } from "@/lib/types";
import { getAgentById, type AgentRole } from "@/config/agents";

type Props = {
  agentId: AgentRole;
  snapshot?: AgentSnapshot;
};

function ActivityFeed({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <div className="activity-feed">
      {lines.slice(0, 4).map((line, i) => (
        <div key={i} className="activity-feed-line">
          {line}
        </div>
      ))}
    </div>
  );
}

export function AgentZone({ agentId, snapshot }: Props) {
  const def = getAgentById(agentId)!;
  const glowRef = useRef<THREE.Mesh>(null);
  const avatarRef = useRef<THREE.Group>(null);
  const isActive = snapshot?.status === "working";
  const isError = snapshot?.status === "error";
  const color = isError ? "#ef4444" : def.color;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      const pulse = isActive ? 0.35 + Math.sin(t * 4) * 0.15 : 0.08;
      mat.emissiveIntensity = pulse;
      glowRef.current.scale.setScalar(isActive ? 1 + Math.sin(t * 3) * 0.06 : 1);
    }
    if (avatarRef.current && isActive) {
      avatarRef.current.position.y = 0.85 + Math.sin(t * 2.5) * 0.04;
      avatarRef.current.rotation.y = Math.sin(t * 0.8) * 0.08;
    }
  });

  const [x, , z] = def.position;

  return (
    <group position={[x, 0, z]} rotation={[0, def.deskRotation, 0]}>
      {/* Zone floor glow */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.08}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Glass desk */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 0.9]} />
        <meshPhysicalMaterial
          color="#1e293b"
          metalness={0.6}
          roughness={0.15}
          transmission={0.35}
          thickness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Desk legs */}
      {[
        [-0.75, 0.2, -0.35],
        [0.75, 0.2, -0.35],
        [-0.75, 0.2, 0.35],
        [0.75, 0.2, 0.35],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Holographic screen */}
      <mesh position={[0, 0.95, -0.25]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.8 : 0.15}
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.95, -0.24]}>
        <planeGeometry args={[1.05, 0.55]} />
        <meshBasicMaterial color="#020617" transparent opacity={0.7} />
      </mesh>

      {/* Zone props by role */}
      <ZoneProps agentId={agentId} active={isActive} color={color} />

      {/* Agent avatar */}
      <group ref={avatarRef} position={[0, 0.85, 0.35]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.18, 0.45, 8, 16]} />
          <meshStandardMaterial
            color={isActive ? color : "#64748b"}
            emissive={isActive ? color : "#000000"}
            emissiveIntensity={isActive ? 0.4 : 0}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      </group>

      {/* HTML overlays */}
      <Html
        position={[0, 1.65, 0]}
        center
        distanceFactor={8}
        transform
        occlude={false}
        zIndexRange={[100, 0]}
      >
        <div className={`agent-label ${isActive ? "agent-label--active" : ""}`}>
          <div className="agent-label-name">{def.name}</div>
          <div className="agent-label-role">{def.title}</div>
          {snapshot && (
            <div className="agent-label-status" style={{ color }}>
              {snapshot.statusLabel}
              {isActive && snapshot.progress > 0 ? ` · ${snapshot.progress}%` : ""}
            </div>
          )}
        </div>
      </Html>

      {isActive && snapshot && (
        <Html position={[0, 2.15, 0]} center distanceFactor={8} transform>
          <ActivityFeed lines={[snapshot.statusLabel]} />
        </Html>
      )}
    </group>
  );
}

function ZoneProps({
  agentId,
  active,
  color,
}: {
  agentId: AgentRole;
  active: boolean;
  color: string;
}) {
  if (agentId === "finance") {
    return (
      <group position={[0.5, 0.5, 0.1]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[i * 0.15, i * 0.12, 0]}>
            <boxGeometry args={[0.08, 0.08 + i * 0.08, 0.04]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={active ? 0.6 : 0.1}
            />
          </mesh>
        ))}
      </group>
    );
  }
  if (agentId === "creative") {
    return (
      <mesh position={[-0.4, 0.55, 0.2]} rotation={[0, 0.4, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.7 : 0.2} />
      </mesh>
    );
  }
  if (agentId === "developer") {
    return (
      <mesh position={[0.3, 0.52, 0]}>
        <boxGeometry args={[0.35, 0.22, 0.03]} />
        <meshStandardMaterial color="#0f172a" emissive={color} emissiveIntensity={active ? 0.5 : 0.05} />
      </mesh>
    );
  }
  if (agentId === "marketing") {
    return (
      <mesh position={[-0.35, 0.52, 0.15]}>
        <coneGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.5 : 0.1} />
      </mesh>
    );
  }
  return null;
}
