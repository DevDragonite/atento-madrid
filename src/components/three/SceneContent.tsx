"use client";

import { useRef, useMemo, useState, useEffect, createContext, useContext } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { easing } from "maath";

/* ═══════════════════════════════════════════════════════════════════
   QUALITY CONTEXT — threaded down to light-heavy components so they
   can skip expensive lights / shadows on 'low' without prop drilling.
   ═══════════════════════════════════════════════════════════════════ */

type Quality = "low" | "medium" | "ultra";
const QualityContext = createContext<Quality>("medium");
const useQuality = () => useContext(QualityContext);

/* ── Context that signals "camera is locked on a hotspot" — heavy
     idle animations can pause to free GPU cycles while the side panel
     covers ~42% of the viewport. ── */
const PausedContext = createContext<boolean>(false);
const usePaused = () => useContext(PausedContext);

/* ═══════════════════════════════════════════════════════════════════
   SHARED MATERIALS — Hoisted at module scope so all instances reuse
   the same GPU material. Crítico para performance: antes cada silla
   creaba sus propias copias del velvet/wood (8 sillas = 16 materiales
   duplicados). Ahora son 2 instancias globales compartidas.
   ═══════════════════════════════════════════════════════════════════ */
const SHARED_CHAIR_WOOD = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#8b6a42"), roughness: 0.65, metalness: 0.06,
});
const SHARED_CHAIR_VELVET = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#c97b5c"), roughness: 0.95, metalness: 0,
});
const SHARED_PLATE = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#f5f0e8"), roughness: 0.25, metalness: 0.04,
});
const SHARED_SILVER = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#c0c0c0"), roughness: 0.15, metalness: 0.92,
});
const SHARED_NAPKIN = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#f8f4ee"), roughness: 0.85, metalness: 0,
});
const SHARED_WINE_GOLD = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#c9a96e"), roughness: 0.3, metalness: 0.7,
});
const SHARED_CANDLE_WAX = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#f5eee0"), roughness: 0.82,
});
const SHARED_CANDLE_GOLD_DARK = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#b8963e"), roughness: 0.25, metalness: 0.82,
});
const SHARED_CANDLE_GOLD_LIGHT = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#c9a96e"), roughness: 0.28, metalness: 0.75,
});

/* ═══════════════════════════════════════════════════════════════════
   VIEWPOINT DEFINITIONS — Cinematic camera positions
   ═══════════════════════════════════════════════════════════════════ */

export type ViewpointKey =
  | "entrance"
  | "throughDoor"
  | "overview"
  | "chair"
  | "plate"
  | "wine"
  | "candle"
  | "ritual";

interface Viewpoint {
  position: [number, number, number];
  target: [number, number, number];
}

export const VIEWPOINTS: Record<ViewpointKey, Viewpoint> = {
  entrance:    { position: [0, 1.7, 6.5],   target: [0, 1.8, 0] },
  throughDoor: { position: [0, 2.5, 2.5],   target: [0, 0.9, -1] },
  overview:    { position: [3.5, 2.8, 4.5], target: [0, 0.8, -0.5] },
  chair:       { position: [-3.2, 1.8, 2.8],target: [-2.2, 0.85, 0] },
  plate:       { position: [-1.2, 2.2, 2.2],target: [-1.2, 0.88, 0] },
  wine:        { position: [-5.5, 1.8, -2.5], target: [-5.5, 1.8, -4.93] },
  gallery:     { position: [0, 2.6, -2.5], target: [0, 2.6, -4.9] },
  candle:      { position: [0.5, 2.5, 1.8], target: [0, 1.2, 0] },
  ritual:      { position: [2, 2, 2.2],     target: [1.5, 0.88, 0] },
};

/* ═══════════════════════════════════════════════════════════════════
   CAMERA RIG — Smooth cinematic transitions via maath easing
   ═══════════════════════════════════════════════════════════════════ */

function CameraRig({ viewpoint }: { viewpoint: ViewpointKey }) {
  const lookTarget = useRef(new THREE.Vector3(0, 1.5, 0));
  const { pointer } = useThree();

  useFrame(({ camera, clock }, delta) => {
    const vp = VIEWPOINTS[viewpoint];

    /* Subtle idle sway based on mouse position */
    const sway = viewpoint === "entrance" ? 0.15 : viewpoint === "overview" ? 0.08 : 0.03;
    const targetPos: [number, number, number] = [
      vp.position[0] + pointer.x * sway,
      vp.position[1] + pointer.y * sway * 0.5,
      vp.position[2],
    ];

    easing.damp3(camera.position, targetPos, 0.35, delta);
    easing.damp3(lookTarget.current, vp.target, 0.28, delta);
    camera.lookAt(lookTarget.current);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   MOUSE-FOLLOW LIGHT — Subtle warm fill that follows cursor
   ═══════════════════════════════════════════════════════════════════ */

function MouseFollowLight() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { pointer, viewport } = useThree();

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    const tx = (pointer.x * viewport.width) / 2;
    const ty = (pointer.y * viewport.height) / 2 + 2;
    easing.damp3(lightRef.current.position, [tx, ty, 3], 0.15, delta);
  });

  return (
    <pointLight
      ref={lightRef}
      color="#ffe8cc"
      intensity={0.15}
      distance={8}
      decay={2}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ENTRANCE DOORS — Double doors that swing open
   ═══════════════════════════════════════════════════════════════════ */

function EntranceDoors({ isOpen }: { isOpen: boolean }) {
  const leftDoor = useRef<THREE.Group>(null);
  const rightDoor = useRef<THREE.Group>(null);

  const doorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#3a1f0d"), roughness: 0.55, metalness: 0.12,
  }), []);
  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2d1608"), roughness: 0.65, metalness: 0.1,
  }), []);
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c9a96e"), roughness: 0.25, metalness: 0.85,
  }), []);
  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#1a0e05"), roughness: 0.7, metalness: 0.2,
  }), []);

  useFrame((_, delta) => {
    if (!leftDoor.current || !rightDoor.current) return;
    const t = isOpen ? -Math.PI * 0.42 : 0;
    leftDoor.current.rotation.y  = THREE.MathUtils.lerp(leftDoor.current.rotation.y, t, delta * 1.2);
    rightDoor.current.rotation.y = THREE.MathUtils.lerp(rightDoor.current.rotation.y, -t, delta * 1.2);
  });

  const DoorPanel = ({ mirror }: { mirror: boolean }) => {
    const sign = mirror ? -1 : 1;
    return (
      <group>
        {/* Main slab */}
        <mesh position={[sign * 0.75, 1.75, 0]} material={doorMat} castShadow>
          <boxGeometry args={[1.5, 3.5, 0.12]} />
        </mesh>
        {/* Upper panel inset */}
        <mesh position={[sign * 0.75, 2.6, 0.065]} material={panelMat}>
          <boxGeometry args={[1.1, 1.2, 0.015]} />
        </mesh>
        {/* Lower panel inset */}
        <mesh position={[sign * 0.75, 1.0, 0.065]} material={panelMat}>
          <boxGeometry args={[1.1, 1.2, 0.015]} />
        </mesh>
        {/* Gold molding (decorative strip between panels) */}
        <mesh position={[sign * 0.75, 1.85, 0.07]} material={goldMat}>
          <boxGeometry args={[1.15, 0.025, 0.008]} />
        </mesh>
        {/* Handle */}
        <mesh position={[sign * 1.3, 1.75, 0.1]} material={goldMat}>
          <cylinderGeometry args={[0.025, 0.025, 0.22, 8]} />
        </mesh>
        <mesh position={[sign * 1.3, 1.86, 0.12]} material={goldMat}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
        <mesh position={[sign * 1.3, 1.64, 0.12]} material={goldMat}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
      </group>
    );
  };

  return (
    <group position={[0, 0, 4]}>
      {/* Frame — archway */}
      <mesh position={[0, 3.6, 0]} material={frameMat}><boxGeometry args={[3.6, 0.25, 0.35]} /></mesh>
      <mesh position={[-1.7, 1.75, 0]} material={frameMat}><boxGeometry args={[0.22, 3.5, 0.35]} /></mesh>
      <mesh position={[1.7, 1.75, 0]} material={frameMat}><boxGeometry args={[0.22, 3.5, 0.35]} /></mesh>
      {/* Gold crown molding */}
      <mesh position={[0, 3.72, 0.05]} material={goldMat}><boxGeometry args={[3.8, 0.04, 0.04]} /></mesh>

      {/* Left door – pivots from left edge */}
      <group ref={leftDoor} position={[-1.58, 0, 0]}>
        <DoorPanel mirror={false} />
      </group>

      {/* Right door – pivots from right edge */}
      <group ref={rightDoor} position={[1.58, 0, 0]}>
        <DoorPanel mirror={true} />
      </group>

      {/* Accent light spilling from behind doors */}
      <pointLight position={[0, 2.5, -0.5]} color="#ffe0b0" intensity={isOpen ? 2 : 0} distance={8} decay={2} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DINING TABLE
   ═══════════════════════════════════════════════════════════════════ */

function DiningTable() {
  /* Mesa de madera maciza tipo roble francés — cálida, hogareña,
     no el espresso-bar oscuro original. */
  const topMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#a47551"), roughness: 0.5, metalness: 0.06,
  }), []);
  const legMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#8b6a42"), roughness: 0.6, metalness: 0.08,
  }), []);

  return (
    <group>
      <mesh position={[0, 0.85, 0]} material={topMat} castShadow receiveShadow>
        <boxGeometry args={[5, 0.08, 1.8]} />
      </mesh>
      {/* Borde biselado en latón apagado (menos brillante que el oro original) */}
      <mesh position={[0, 0.895, 0]}>
        <boxGeometry args={[5.02, 0.005, 1.82]} />
        <meshStandardMaterial color="#b08968" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Camino de mesa (lino crudo, reemplaza el runner borgoña) */}
      <mesh position={[0, 0.898, 0]}>
        <boxGeometry args={[4.6, 0.003, 0.45]} />
        <meshStandardMaterial color="#e8d9bc" roughness={0.9} />
      </mesh>
      {/* Legs */}
      {[[-2.2, -0.7], [-2.2, 0.7], [2.2, -0.7], [2.2, 0.7]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.42, z]} material={legMat} castShadow>
          <boxGeometry args={[0.09, 0.84, 0.09]} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHAIR
   ═══════════════════════════════════════════════════════════════════ */

function Chair({ position, rotation, isHovered }: { position: [number, number, number]; rotation: [number, number, number]; isHovered?: boolean }) {
  /* Materiales compartidos a nivel de módulo (todos las sillas usan
     las mismas instancias — ahorra 14 materiales duplicados) */
  const wood = SHARED_CHAIR_WOOD;
  const velvet = SHARED_CHAIR_VELVET;

  const groupRef = useRef<THREE.Group>(null);
  const initialZ = position[2];
  const initialX = position[0];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    // Animate backward if hovered. Calculate vector based on rotation.
    // If it's on the top side (rotation y = PI), backward means Z increases.
    // If it's on the bottom side (rotation y = 0), backward means Z decreases.
    const dirZ = Math.cos(rotation[1]);
    const dirX = Math.sin(rotation[1]);
    
    // target offset
    const offsetAmount = isHovered ? -0.8 : 0;
    
    const targetX = initialX + dirX * offsetAmount;
    const targetZ = initialZ + dirZ * offsetAmount;

    easing.damp3(groupRef.current.position, [targetX, groupRef.current.position.y, targetZ], 0.4, delta);
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh position={[0, 0.5, 0]} material={velvet} castShadow><boxGeometry args={[0.48, 0.06, 0.48]} /></mesh>
      <mesh position={[0, 0.88, -0.22]} material={wood} castShadow><boxGeometry args={[0.46, 0.7, 0.04]} /></mesh>
      <mesh position={[0, 0.85, -0.19]} material={velvet}><boxGeometry args={[0.38, 0.52, 0.02]} /></mesh>
      {[[-0.2, -0.2], [-0.2, 0.2], [0.2, -0.2], [0.2, 0.2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.25, z]} material={wood}>
          <cylinderGeometry args={[0.018, 0.018, 0.5, 8]} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PLACE SETTING — Plate + cutlery
   ═══════════════════════════════════════════════════════════════════ */

function PlaceSetting({ position, isHovered }: { position: [number, number, number]; isHovered?: boolean }) {
  /* Materiales compartidos — 8 place settings reutilizan la misma GPU material */
  const plate = SHARED_PLATE;
  const silver = SHARED_SILVER;

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = isHovered ? 0.35 : 0;
    easing.damp3(groupRef.current.position, [position[0], position[1] + targetY, position[2]], 0.3, delta);
    
    // Add subtle floating oscillation if hovered
    if (isHovered) {
        groupRef.current.position.y += Math.sin(_.clock.elapsedTime * 3) * 0.001;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.9, 0]} material={plate} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.012, 32]} />
      </mesh>
      <mesh position={[0, 0.908, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.155, 0.004, 8, 32]} />
        <meshStandardMaterial color="#ddd7cf" roughness={0.3} metalness={0.08} />
      </mesh>
      {/* Fork */}
      <mesh position={[-0.25, 0.895, 0]} rotation={[Math.PI / 2, 0, 0]} material={silver}>
        <boxGeometry args={[0.013, 0.18, 0.004]} />
      </mesh>
      {/* Knife */}
      <mesh position={[0.25, 0.895, 0]} rotation={[Math.PI / 2, 0, 0]} material={silver}>
        <boxGeometry args={[0.01, 0.2, 0.004]} />
      </mesh>
      {/* Napkin (folded linen) */}
      <Napkin position={[-0.25, 0, 0.18]} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   NAPKIN — Folded linen triangle
   ═══════════════════════════════════════════════════════════════════ */

function Napkin({ position }: { position: [number, number, number] }) {
  const linen = SHARED_NAPKIN;

  return (
    <group position={position}>
      {/* Base fold */}
      <mesh position={[0, 0.9, 0]} rotation={[-Math.PI / 12, 0, 0]} material={linen}>
        <boxGeometry args={[0.12, 0.003, 0.12]} />
      </mesh>
      {/* Upper fold */}
      <mesh position={[0, 0.91, -0.02]} rotation={[-Math.PI / 6, 0, 0]} material={linen}>
        <boxGeometry args={[0.1, 0.003, 0.08]} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SIDEBOARD — Elegant dark bufetera for the back wall
   ═══════════════════════════════════════════════════════════════════ */

function Sideboard() {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0e0805", roughness: 0.4, metalness: 0.1,
  }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a96e", roughness: 0.35, metalness: 0.7,
  }), []);

  return (
    <group position={[0, 0, -4.6]}>
      {/* Body */}
      <mesh position={[0, 0.45, 0]} material={wood} castShadow>
        <boxGeometry args={[3.2, 0.9, 0.55]} />
      </mesh>
      {/* Top slab (marble-ish detail) */}
      <mesh position={[0, 0.9, 0]} receiveShadow>
        <boxGeometry args={[3.25, 0.04, 0.58]} />
        <meshStandardMaterial color="#1a1512" roughness={0.1} metalness={0.2} />
      </mesh>
      {/* Inset handles / gold trim */}
      <mesh position={[0, 0.5, 0.28]} material={gold}>
        <boxGeometry args={[3.22, 0.008, 0.005]} />
      </mesh>
      {/* Small decor — minimalist vase */}
      <mesh position={[-0.8, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.45, 12]} />
        <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WALL ART — Minimalist gold frames with abstract touches
   ═══════════════════════════════════════════════════════════════════ */

function WallArt({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number }) {
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9a96e", roughness: 0.3, metalness: 0.8 }), []);
  const canvas = useMemo(() => new THREE.MeshStandardMaterial({ color: "#060403", roughness: 0.8 }), []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Frame */}
      <mesh material={frame}>
        <boxGeometry args={[1.5, 2.2, 0.08]} />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0, 0.05]} material={canvas}>
        <planeGeometry args={[1.35, 2.05]} />
      </mesh>
      {/* Abstract gold streak (built-in "art") */}
      <mesh position={[0.2, -0.4, 0.06]} rotation={[0, 0, 0.5]}>
        <planeGeometry args={[0.05, 1.8]} />
        <meshStandardMaterial color="#c9a96e" emissive="#c9a96e" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CENTERPIECE — Decorative golden bowl with accents
   ═══════════════════════════════════════════════════════════════════ */

function Centerpiece({ isHovered }: { isHovered?: boolean }) {
  const bowl = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c9a96e"), roughness: 0.3, metalness: 0.65,
  }), []);
  const accent = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#2a1510"), roughness: 0.7, metalness: 0.1,
  }), []);

  const groupRef = useRef<THREE.Group>(null);
  const paused = usePaused();

  useFrame((_, delta) => {
    if (!groupRef.current || paused) return;
    // Rotate faster if hovered, slower if not
    const speed = isHovered ? 1.5 : 0.2;
    groupRef.current.rotation.y += speed * delta;

    // Slight vertical magic lift
    const targetY = isHovered ? 0.95 : 0.9;
    easing.damp(groupRef.current.position, 'y', targetY, 0.4, delta);
  });

  return (
    <group position={[0, 0.9, 0]} ref={groupRef}>
      {/* Bowl base */}
      <mesh material={bowl}>
        <cylinderGeometry args={[0.12, 0.08, 0.06, 24]} />
      </mesh>
      {/* Bowl rim */}
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.008, 8, 24]} />
        <meshStandardMaterial color="#d4b07a" roughness={0.25} metalness={0.7} />
      </mesh>
      {/* Decorative spheres (like dried flowers / ornaments) */}
      {[
        [0.04, 0.06, 0.03],
        [-0.03, 0.07, -0.04],
        [0, 0.08, 0],
        [-0.05, 0.055, 0.02],
        [0.03, 0.065, -0.03],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} material={accent}>
          <sphereGeometry args={[0.022 + i * 0.003, 8, 8]} />
        </mesh>
      ))}
      {/* Small golden accent spheres */}
      {[
        [0.06, 0.05, 0],
        [-0.02, 0.075, 0.03],
      ].map((p, i) => (
        <mesh key={`g${i}`} position={p as [number, number, number]} material={bowl}>
          <sphereGeometry args={[0.015, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHANDELIER — Elegant multi-arm ceiling fixture
   ═══════════════════════════════════════════════════════════════════ */

function Chandelier({ position, isHovered }: { position: [number, number, number], isHovered?: boolean }) {
  const q = useQuality();
  const paused = usePaused();
  const gold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a96e", roughness: 0.25, metalness: 0.8,
  }), []);
  const crystal = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f8f4ee", roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.6,
  }), []);
  /* Emissive "fake" candle glow — replaces 6 real pointLights */
  const candleGlow = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f5eee0", roughness: 0.8, emissive: new THREE.Color("#ffb070"),
    emissiveIntensity: 1.8,
  }), []);

  const arms = 6;
  const radius = 0.6;
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || paused) return;
    const t = clock.elapsedTime;
    const hoverOffsetZ = isHovered ? Math.sin(t * 1.5) * 0.08 : 0;
    const hoverOffsetX = isHovered ? Math.cos(t * 1.2) * 0.04 : 0;

    easing.damp3(groupRef.current.rotation, [Math.sin(t*0.5)*0.01 + hoverOffsetZ, groupRef.current.rotation.y, Math.cos(t*0.3)*0.01 + hoverOffsetX], 0.5, delta);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Central rod from ceiling */}
      <mesh material={gold}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
      </mesh>
      {/* Canopy plate (ceiling mount) */}
      <mesh position={[0, 0.4, 0]} material={gold}>
        <cylinderGeometry args={[0.12, 0.1, 0.04, 16]} />
      </mesh>
      {/* Hub ring */}
      <mesh position={[0, -0.3, 0]} material={gold}>
        <torusGeometry args={[0.15, 0.02, 8, 24]} />
      </mesh>
      {/* Bottom finial */}
      <mesh position={[0, -0.45, 0]} material={gold}>
        <sphereGeometry args={[0.04, 12, 12]} />
      </mesh>

      {/* Arms with lights */}
      {Array.from({ length: arms }).map((_, i) => {
        const angle = (i / arms) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i}>
            {/* Arm bar */}
            <mesh position={[x * 0.5, -0.3, z * 0.5]} rotation={[0, -angle, Math.PI / 12]} material={gold}>
              <cylinderGeometry args={[0.008, 0.008, radius, 6]} />
            </mesh>
            {/* Candle cup */}
            <mesh position={[x, -0.25, z]} material={gold}>
              <cylinderGeometry args={[0.035, 0.025, 0.04, 10]} />
            </mesh>
            {/* Faux candle — emissive replaces real light on low/medium */}
            <mesh position={[x, -0.15, z]} material={candleGlow}>
              <cylinderGeometry args={[0.012, 0.014, 0.16, 8]} />
            </mesh>
            {/* Crystal drop */}
            <mesh position={[x, -0.35, z]} material={crystal}>
              <octahedronGeometry args={[0.025, 0]} />
            </mesh>
            {/* Real point light — ultra only */}
            {q === "ultra" && (
              <pointLight position={[x, -0.08, z]} color="#ffe4a0" intensity={0.35} distance={4} decay={2} />
            )}
          </group>
        );
      })}

      {/* Single central glow — cheap substitute on low/medium (1 light instead of 6) */}
      {q !== "ultra" && (
        <pointLight position={[0, -0.25, 0]} color="#ffe4a0" intensity={0.7} distance={4} decay={2} />
      )}

      {/* Central crystal cluster */}
      {[0, 0.04, -0.04].map((yOff, i) => (
        <mesh key={`cc${i}`} position={[0.02 * i, -0.38 + yOff, 0.02 * (i - 1)]} material={crystal}>
          <octahedronGeometry args={[0.018, 0]} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WALL SCONCE — Decorative bracket lamp
   ═══════════════════════════════════════════════════════════════════ */

function WallSconce({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const q = useQuality();
  const gold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a96e", roughness: 0.3, metalness: 0.75,
  }), []);
  /* Emissive shade — fakes warm glow without a real light */
  const shadeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#2a1f14", roughness: 0.9, side: THREE.DoubleSide,
    transparent: true, opacity: 0.85,
    emissive: new THREE.Color("#ffb070"), emissiveIntensity: 0.6,
  }), []);

  return (
    <group position={position} rotation={rotation}>
      {/* Backplate */}
      <mesh material={gold}>
        <boxGeometry args={[0.12, 0.2, 0.02]} />
      </mesh>
      {/* Arm */}
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 6, 0, 0]} material={gold}>
        <cylinderGeometry args={[0.01, 0.01, 0.22, 6]} />
      </mesh>
      {/* Cup */}
      <mesh position={[0, -0.04, 0.2]} material={gold}>
        <cylinderGeometry args={[0.04, 0.025, 0.03, 10]} />
      </mesh>
      {/* Shade (conical, emissive on low/medium) */}
      <mesh position={[0, 0.06, 0.2]} material={shadeMat}>
        <cylinderGeometry args={[0.03, 0.06, 0.1, 12, 1, true]} />
      </mesh>
      {/* Real point light only on ultra (6 sconces = 6 lights) */}
      {q === "ultra" && (
        <pointLight position={[0, 0, 0.22]} color="#ffe0a0" intensity={0.4} distance={3.5} decay={2} />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLAT SCREEN TV — Slim panel on wall
   ═══════════════════════════════════════════════════════════════════ */

function FlatScreenTV({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Bezel */}
      <mesh>
        <boxGeometry args={[1.8, 1.05, 0.04]} />
        <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.6} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[1.7, 0.95]} />
        <meshStandardMaterial
          color="#0a0a12"
          roughness={0.05}
          metalness={0.1}
          emissive="#0a0a18"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Subtle screen glow line (ambient bar at bottom) */}
      <mesh position={[0, -0.48, 0.03]}>
        <boxGeometry args={[1.2, 0.005, 0.005]} />
        <meshBasicMaterial color="#c9a96e" transparent opacity={0.5} />
      </mesh>
      {/* Wall mount bracket */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[0.3, 0.15, 0.03]} />
        <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CONSOLE TABLE — Side table against the wall
   ═══════════════════════════════════════════════════════════════════ */

function ConsoleTable({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0e0805", roughness: 0.4, metalness: 0.1,
  }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a96e", roughness: 0.3, metalness: 0.7,
  }), []);
  const marble = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1512", roughness: 0.12, metalness: 0.15,
  }), []);

  return (
    <group position={position} rotation={rotation}>
      {/* Top slab (marble) */}
      <mesh position={[0, 0.82, 0]} material={marble} castShadow>
        <boxGeometry args={[1.2, 0.03, 0.4]} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.55, 0]} material={wood} castShadow>
        <boxGeometry args={[1.15, 0.5, 0.38]} />
      </mesh>
      {/* Gold trim */}
      <mesh position={[0, 0.81, 0.19]} material={gold}>
        <boxGeometry args={[1.18, 0.006, 0.005]} />
      </mesh>
      {/* Legs */}
      {[[-0.52, 0.15, 0.14], [-0.52, 0.15, -0.14], [0.52, 0.15, 0.14], [0.52, 0.15, -0.14]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} material={wood}>
          <boxGeometry args={[0.06, 0.3, 0.06]} />
        </mesh>
      ))}

      {/* Decor: books stack */}
      <mesh position={[-0.35, 0.88, 0]}>
        <boxGeometry args={[0.2, 0.08, 0.14]} />
        <meshStandardMaterial color="#1a0e08" roughness={0.85} />
      </mesh>
      <mesh position={[-0.35, 0.93, 0]}>
        <boxGeometry args={[0.18, 0.03, 0.13]} />
        <meshStandardMaterial color="#2a1510" roughness={0.85} />
      </mesh>
      {/* Decor: small sculpture */}
      <mesh position={[0.3, 0.92, 0]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#c9a96e" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOOR LAMP — Elegant standing lamp for corners
   ═══════════════════════════════════════════════════════════════════ */

function FloorLamp({ position }: { position: [number, number, number] }) {
  const q = useQuality();
  const gold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a96e", roughness: 0.3, metalness: 0.75,
  }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0a0705", roughness: 0.4, metalness: 0.15,
  }), []);
  const shadeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1510", roughness: 0.85, side: THREE.DoubleSide,
    transparent: true, opacity: 0.9,
    emissive: new THREE.Color("#ffc080"), emissiveIntensity: 0.5,
  }), []);

  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} material={dark}>
        <cylinderGeometry args={[0.15, 0.18, 0.04, 16]} />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.9, 0]} material={gold}>
        <cylinderGeometry args={[0.012, 0.012, 1.75, 8]} />
      </mesh>
      {/* Shade with emissive fake glow */}
      <mesh position={[0, 1.85, 0]} material={shadeMat}>
        <cylinderGeometry args={[0.1, 0.2, 0.3, 16, 1, true]} />
      </mesh>
      {/* Shade top cap */}
      <mesh position={[0, 2.0, 0]} material={gold}>
        <sphereGeometry args={[0.02, 8, 8]} />
      </mesh>
      {/* Real light only on medium/ultra */}
      {q !== "low" && (
        <pointLight position={[0, 1.7, 0]} color="#ffe0a0" intensity={0.6} distance={5} decay={2} />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AREA RUG — Under the dining table
   ═══════════════════════════════════════════════════════════════════ */

function AreaRug() {
  /* Alfombra tipo kilim artesanal — terracota suave con bordes en ocre.
     Contrasta con el piso de roble claro sin romper la paleta cálida. */
  return (
    <group>
      {/* Main rug body */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 3.5]} />
        <meshStandardMaterial color="#9e5a3e" roughness={0.95} metalness={0} />
      </mesh>
      {/* Border trim — ocre cálido */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.0, 4]} />
        <meshStandardMaterial color="#c89968" roughness={0.8} metalness={0.1} transparent opacity={0.35} />
      </mesh>
      {/* Inner border */}
      <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.85, 4]} />
        <meshStandardMaterial color="#e8d9bc" roughness={0.9} metalness={0} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WINE RACK — Wall-mounted interactive bottle display
   ═══════════════════════════════════════════════════════════════════ */

const SPANISH_WINES = [
  "Reserva Acanal", "Tinto Joven", "Blanco Nieves", "Gran Sol", 
  "Tierra Madre", "Viña Dorada", "Ocaso Tinto", "Rocío de Uva", 
  "Cepa Antigua", "Mar del Sur", "Cumbres Rojas", "Roble Blanco"
];

function WineBottleInteractive({ x, y, name, isActive }: { x: number, y: number, name: string, isActive: boolean }) {
  const bottleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0a1a0a", roughness: 0.15, metalness: 0.3,
  }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a96e", roughness: 0.35, metalness: 0.7,
  }), []);
  
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetZ = (hovered && isActive) ? 0.2 : 0;
    easing.damp3(groupRef.current.position, [x, y, targetZ], 0.3, delta);
  });

  // The base bottle rotation was [0, 0, Math.PI / 2], meaning Y-axis of the cylinder goes along X-axis.
  // Original children were positioned relative to the parent group.
  return (
    <group 
      ref={groupRef} position={[x, y, 0]}
      onPointerOver={(e) => { 
        if (isActive) { 
          e.stopPropagation(); 
          setHovered(true); 
          document.body.style.cursor = 'pointer'; 
        } 
      }}
      onPointerOut={() => { 
        setHovered(false); 
        document.body.style.cursor = 'auto'; 
      }}
    >
      {/* Bottle body */}
      <mesh material={bottleMat} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.16, 12]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0, 0.11]} material={bottleMat} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.025, 0.06, 12]} />
      </mesh>
      {/* Foil */}
      <mesh position={[0, 0, 0.14]} material={gold} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.013, 0.013, 0.015, 8]} />
      </mesh>

      {/* Wine Name Tooltip */}
      {hovered && isActive && (
        <Html position={[0, 0.05, 0.17]} center zIndexRange={[100, 0]}>
          <div style={{
            background: "rgba(6,4,2,0.9)", border: "1px solid rgba(201,169,110,0.5)", 
            padding: "4px 8px", borderRadius: 4, color: "#e8d5b7", 
            fontSize: "10px", whiteSpace: "nowrap", pointerEvents: "none",
            letterSpacing: "0.1em", textTransform: "uppercase",
            backdropFilter: "blur(4px)"
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

function WineRack({ position, rotation, isActive }: { position: [number, number, number]; rotation: [number, number, number]; isActive?: boolean }) {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0e0805", roughness: 0.5, metalness: 0.08,
  }), []);
  const gold = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#c9a96e", roughness: 0.35, metalness: 0.7,
  }), []);

  const rows = 3;
  const cols = 4;

  return (
    <group position={position} rotation={rotation}>
      {/* Backboard */}
      <mesh position={[0, 0, -0.1]} material={wood} receiveShadow>
        <boxGeometry args={[1.0, 1.2, 0.05]} />
      </mesh>
      {/* Top Shelf */}
      <mesh position={[0, 0.575, 0.025]} material={wood} receiveShadow castShadow>
        <boxGeometry args={[1.0, 0.05, 0.2]} />
      </mesh>
      {/* Bottom Shelf */}
      <mesh position={[0, -0.575, 0.025]} material={wood} receiveShadow castShadow>
        <boxGeometry args={[1.0, 0.05, 0.2]} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-0.475, 0, 0.025]} material={wood} receiveShadow castShadow>
        <boxGeometry args={[0.05, 1.1, 0.2]} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[0.475, 0, 0.025]} material={wood} receiveShadow castShadow>
        <boxGeometry args={[0.05, 1.1, 0.2]} />
      </mesh>
      {/* Gold trims (top & bottom front) */}
      <mesh position={[0, 0.575, 0.125]} material={gold}>
        <boxGeometry args={[1.02, 0.055, 0.005]} />
      </mesh>
      <mesh position={[0, -0.575, 0.125]} material={gold}>
        <boxGeometry args={[1.02, 0.055, 0.005]} />
      </mesh>

      {/* Bottles in slots */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const x = (c - (cols - 1) / 2) * 0.22;
          const y = (r - (rows - 1) / 2) * 0.35;
          const idx = r * cols + c;
          return (
            <WineBottleInteractive 
              key={`${r}-${c}`} x={x} y={y} 
              name={SPANISH_WINES[idx % SPANISH_WINES.length]} 
              isActive={!!isActive} 
            />
          );
        })
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WINE GLASS
   ═══════════════════════════════════════════════════════════════════ */

function WineGlass({ position }: { position: [number, number, number] }) {
  const q = useQuality();
  /* Segmentos de geometría adaptativos: en low reducimos de 16→8 para
     ahorrar ~50% de vértices. 8 copas × ~3 meshes cada una = gran ahorro. */
  const seg = q === "low" ? 8 : 16;
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.895, 0]}>
        <cylinderGeometry args={[0.038, 0.04, 0.008, seg]} />
        <meshStandardMaterial color="#d8d8d8" roughness={0.08} metalness={0.3} transparent opacity={0.7} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.955, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.11, 8]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.08} metalness={0.2} transparent opacity={0.55} />
      </mesh>
      {/* Bowl */}
      <mesh position={[0, 1.06, 0]}>
        <cylinderGeometry args={[0.048, 0.018, 0.1, seg, 1, true]} />
        <meshStandardMaterial
          color="#f4f4f4" roughness={0.04} metalness={0.08}
          transparent opacity={0.3} side={THREE.DoubleSide}
        />
      </mesh>
      {/* Wine inside */}
      <mesh position={[0, 1.03, 0]}>
        <cylinderGeometry args={[0.032, 0.016, 0.035, 16]} />
        <meshStandardMaterial color="#5a0a1a" roughness={0.35} metalness={0.08} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CANDLE — With animated flame + point light
   ═══════════════════════════════════════════════════════════════════ */

function Candle({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const paused = usePaused();

  useFrame(({ clock }) => {
    if (paused) return;
    const t = clock.elapsedTime;
    if (flameRef.current) {
      flameRef.current.scale.x = 1 + Math.sin(t * 9) * 0.12;
      flameRef.current.scale.y = 1 + Math.sin(t * 7 + 1) * 0.18;
      flameRef.current.position.x = Math.sin(t * 4) * 0.003;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 5) * 0.15);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(t * 6) * 0.08;
    }
  });

  return (
    <group position={position}>
      {/* Holder base */}
      <mesh position={[0, 0.895, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.006, 12]} />
        <meshStandardMaterial color="#b8963e" roughness={0.25} metalness={0.82} />
      </mesh>
      {/* Holder cup */}
      <mesh position={[0, 0.91, 0]}>
        <cylinderGeometry args={[0.032, 0.028, 0.025, 12]} />
        <meshStandardMaterial color="#c9a96e" roughness={0.28} metalness={0.75} />
      </mesh>
      {/* Wax body */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.014, 0.016, 0.26, 8]} />
        <meshStandardMaterial color="#f5eee0" roughness={0.82} />
      </mesh>
      {/* Wick */}
      <mesh position={[0, 1.185, 0]}>
        <cylinderGeometry args={[0.001, 0.001, 0.02, 4]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Flame core (bright, unlit material) */}
      <mesh ref={flameRef} position={[0, 1.21, 0]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#ffe4a0" />
      </mesh>
      {/* Flame outer glow */}
      <mesh ref={glowRef} position={[0, 1.21, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ff9930" transparent opacity={0.25} />
      </mesh>
      {/* We removed the individual pointLight here for performance. A central table light will be used instead. */}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOTSPOT MARKER — Glowing interactive ring
   ═══════════════════════════════════════════════════════════════════ */

function PulseRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const startOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const paused = usePaused();

  useFrame(({ clock }) => {
    if (!ref.current || paused) return;
    const t = clock.elapsedTime + startOffset;
    const s = 1 + Math.sin(t * 2) * 0.4;
    ref.current.scale.set(s, s, s);
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.35 - Math.sin(t * 2) * 0.3;
  });

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.35, 0.006, 10, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.35} />
    </mesh>
  );
}

  const HOTSPOT_LABELS: Record<string, string> = {
    chair: "RESERVA TU SILLA",
    plate: "EL MENÚ",
    wine: "EL MARIDAJE",
    ritual: "EL RITUAL",
    candle: "EL ESPACIO",
    gallery: "GALLERY"
  };

function HotspotMarker({
  id, position, color, isActive, isHovered, onClick, onPointerOver, onPointerOut, isMobile,
}: {
  id: string;
  position: [number, number, number];
  color: string;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  isMobile?: boolean;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  const q = useQuality();
  const paused = usePaused();

  useFrame(({ clock }) => {
    if (paused) return;
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2;
      ringRef.current.rotation.z = clock.elapsedTime * 0.5;
    }
    if (outerRef.current) {
      outerRef.current.rotation.x = Math.PI / 2;
      outerRef.current.rotation.z = -clock.elapsedTime * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 0.4 + Math.sin(clock.elapsedTime * 2) * 0.2;
    }
  });

  /* Show real light only when: ultra, OR active hotspot, OR hovered+medium.
     Previously 6 hotspots × always-on pointLight = 6 permanent lights. */
  const showLight = q === "ultra" || isActive || (isHovered && q !== "low");

  return (
    <group position={position}>
      {showLight && (
        <pointLight ref={glowRef} color={color} intensity={0.5} distance={1.5} decay={2} />
      )}

      {/* INVISIBLE hit sphere — large click target */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e) => { e.stopPropagation(); onPointerOut(); document.body.style.cursor = "auto"; }}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Inner ring — BIGGER */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.22, 0.012, 12, 64]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 1 : isHovered ? 0.9 : 0.6} />
      </mesh>

      {/* Outer ring (counter-rotating) — BIGGER */}
      <mesh ref={outerRef}>
        <torusGeometry args={[0.3, 0.006, 12, 64]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.7 : isHovered ? 0.5 : 0.3} />
      </mesh>

      {/* Breathing pulse (idle) */}
      {!isActive && <PulseRing color={color} />}

      {/* Center dot — bigger */}
      <mesh>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={isHovered || isActive ? 1 : 0.7} />
      </mesh>

      {/* Glow sphere — much more visible */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.25 : 0.1} />
      </mesh>

      {/* Vertical beam — thicker */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.7, 4]} />
        <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.5 : 0.2} />
      </mesh>

      {/* ALWAYS-VISIBLE floating label */}
      <Html
        position={[0, 0.55, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
      >
        <div style={{
          background: isHovered || isActive ? "rgba(8,6,4,0.92)" : "rgba(8,6,4,0.65)",
          border: `1px solid ${color}${isHovered || isActive ? "80" : "30"}`,
          backdropFilter: "blur(8px)",
          padding: isMobile ? (isHovered || isActive ? "4px 10px" : "2px 8px") : (isHovered || isActive ? "6px 18px" : "4px 12px"),
          borderRadius: 20,
          textAlign: "center",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          transform: `scale(${isHovered || isActive ? (isMobile ? 1.05 : 1.1) : (isMobile ? 0.75 : 1)})`,
          boxShadow: isHovered || isActive ? `0 0 16px ${color}30` : "none",
        }}>
          <p style={{
            fontSize: isHovered || isActive ? (isMobile ? 9 : 11) : (isMobile ? 7 : 9),
            fontFamily: "var(--font-work-sans, sans-serif)",
            textTransform: "uppercase",
            letterSpacing: isMobile ? "0.15em" : "0.2em",
            color: isHovered || isActive ? "#f5f0e8" : `${color}cc`,
            lineHeight: 1,
            margin: 0,
            transition: "all 0.4s",
          }}>
            {HOTSPOT_LABELS[id] || id}
          </p>
        </div>
      </Html>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCENE LIGHTING — Cinematic warm ambiance
   ═══════════════════════════════════════════════════════════════════ */

function SceneLighting() {
  const q = useQuality();
  const shadowMap = q === "ultra" ? 1024 : 512;

  /* Iluminación "atardecer cálido en casa": más ambient, menos foco teatral.
     La paleta ya es clara — no necesitamos saturar de spots como en el look
     bar oscuro original. */
  return (
    <>
      {/* Ambient fuerte — clave del look hogareño: luz difusa, no dramática */}
      <ambientLight intensity={q === "low" ? 0.55 : 0.4} color="#ffe8cc" />

      {/* Hemisphere light simulando cielo/suelo — añade profundidad natural */}
      <hemisphereLight args={["#fff2d6", "#a47551", 0.35]} />

      {/* Luz cenital principal — más suave (2 en vez de 3) */}
      <spotLight
        position={[0, 7, 1]}
        angle={0.55}
        penumbra={0.95}
        intensity={2}
        color="#fff3dc"
        castShadow={q === "ultra"}
        shadow-mapSize-width={shadowMap}
        shadow-mapSize-height={shadowMap}
      />

      {/* Fill secundario más suave */}
      <spotLight
        position={[0, 6, -2]}
        angle={0.7}
        penumbra={0.95}
        intensity={0.7}
        color="#ffeed6"
      />

      {/* "Ventana" lateral simulando luz de atardecer entrando por un lado */}
      <directionalLight position={[-8, 4, 2]} intensity={0.5} color="#ffd28c" />

      {/* Rim lights laterales — menos saturados (antes #ff8844 bar naranja) */}
      <pointLight position={[-5, 3, -2]} intensity={0.4} color="#ffb878" distance={14} />
      <pointLight position={[5, 3, -2]} intensity={0.4} color="#ffb878" distance={14} />

      {/* Luz detrás de las puertas — menos intensa en el nuevo ambiente claro */}
      <spotLight position={[0, 4, 5.5]} angle={0.3} penumbra={0.7} intensity={0.9} color="#ffe0b0" />

      {/* Fills adicionales solo en medium+ ultra */}
      {q !== "low" && (
        <>
          <pointLight position={[-4, 2.5, 3]} intensity={0.25} color="#ffe8cc" distance={10} />
          <pointLight position={[4, 2.5, 3]} intensity={0.25} color="#ffe8cc" distance={10} />
        </>
      )}

      {/* Acentos de muros + fondo fresco — ultra only */}
      {q === "ultra" && (
        <>
          <pointLight position={[-6, 2, -3]} intensity={0.2} color="#ffd9a6" distance={6} />
          <pointLight position={[6, 2, -3]} intensity={0.2} color="#ffd9a6" distance={6} />
          <pointLight position={[0, 2.5, 7]} intensity={0.12} color="#d4e4f0" distance={15} />
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WALL PANELS — Decorative wainscoting + molding
   ═══════════════════════════════════════════════════════════════════ */

function WallPanels() {
  /* Wainscoting estilo campestre francés: panel en crema más cálido que el
     muro, baseboard de roble miel, molduras en latón apagado (no el oro
     lujoso original). */
  const panelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#c9b598"), roughness: 0.88, metalness: 0.04,
  }), []);
  const moldingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#b08968"), roughness: 0.55, metalness: 0.35,
  }), []);
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color("#8b6a42"), roughness: 0.75, metalness: 0.08,
  }), []);

  const WallSection = ({ pos, rot }: { pos: [number, number, number]; rot: [number, number, number] }) => (
    <group position={pos} rotation={rot}>
      {/* Baseboard */}
      <mesh position={[0, 0.08, 0.01]} material={baseMat}>
        <boxGeometry args={[12, 0.16, 0.03]} />
      </mesh>
      {/* Chair rail molding */}
      <mesh position={[0, 1.1, 0.012]} material={moldingMat}>
        <boxGeometry args={[12, 0.02, 0.015]} />
      </mesh>
      {/* Crown molding */}
      <mesh position={[0, 3.8, 0.012]} material={moldingMat}>
        <boxGeometry args={[12, 0.025, 0.018]} />
      </mesh>
      {/* Wainscot panels */}
      {[-4.5, -2.5, -0.5, 1.5, 3.5].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.008]} material={panelMat}>
          <boxGeometry args={[1.6, 0.8, 0.01]} />
        </mesh>
      ))}
      {/* Upper wall panels */}
      {[-4.5, -2.5, -0.5, 1.5, 3.5].map((x, i) => (
        <mesh key={`u${i}`} position={[x, 2.4, 0.008]} material={panelMat}>
          <boxGeometry args={[1.6, 2.2, 0.008]} />
        </mesh>
      ))}
    </group>
  );

  return (
    <>
      {/* Back wall panels */}
      <WallSection pos={[0, 0, -4.98]} rot={[0, 0, 0]} />
      {/* Left wall panels */}
      <WallSection pos={[-7.98, 0, 0]} rot={[0, Math.PI / 2, 0]} />
      {/* Right wall panels */}
      <WallSection pos={[7.98, 0, 0]} rot={[0, -Math.PI / 2, 0]} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SMART TV GALLERY — Looping image carousel
   ═══════════════════════════════════════════════════════════════════ */

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1549488344-c1044ffc2020?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"
];

function SmartTVFurniture({ position, rotation, isActive, showScreen = true }: { position: [number, number, number]; rotation: [number, number, number]; isActive?: boolean; showScreen?: boolean }) {
  const tvFrame = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#050505", roughness: 0.2, metalness: 0.6,
  }), []);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <group position={position} rotation={rotation}>
      {/* Bezel */}
      <mesh>
        <boxGeometry args={[1.8, 1.05, 0.04]} />
        <meshStandardMaterial color="#050505" roughness={0.2} metalness={0.6} />
      </mesh>
      
      {/* Glow behind TV */}
      {isActive && (
         <pointLight position={[0, 0, 0.2]} intensity={0.5} distance={1.5} color="#c9a96e" />
      )}
      
      {/* TV Screen HTML Surface */}
      <Html position={[0, 0, 0.026]} transform scale={0.08} zIndexRange={[5, 0]}>
        <div style={{
          display: showScreen ? "block" : "none",
          width: "2125px", height: "1187px", background: "#000", overflow: "hidden",
          borderRadius: "4px", position: "relative",
          boxShadow: isActive ? "0 0 100px rgba(201,169,110,0.5)" : "none",
          transition: "box-shadow 0.5s ease"
        }}>
           <img 
             key={currentIndex}
             src={GALLERY_IMAGES[currentIndex]} 
             alt="Gallery" 
             style={{
               width: "100%", height: "100%", objectFit: "cover",
               opacity: 0.9, filter: "brightness(0.9) contrast(1.1)",
               animation: "fadeIn 1s ease-in-out"
             }} 
           />
           <style>{`
             @keyframes fadeIn { 0% { opacity: 0.4; transform: scale(1.02); } 100% { opacity: 0.9; transform: scale(1); } }
           `}</style>
        </div>
      </Html>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RESERVATION DESK — Host stand with floating ledger
   ═══════════════════════════════════════════════════════════════════ */

function ReservationDesk({ position, rotation, isActive }: { position: [number, number, number]; rotation: [number, number, number]; isActive?: boolean }) {
  const paper = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#f4eedd", roughness: 0.9, metalness: 0.05,
  }), []);
  
  const ledgerRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const paused = usePaused();

  useFrame(({ clock }, delta) => {
    if (!ledgerRef.current || paused) return;
    const t = clock.elapsedTime;
    const targetY = isActive ? 0.08 + Math.sin(t * 2) * 0.015 : 0.02;
    easing.damp(ledgerRef.current.position, 'y', targetY, 0.4, delta);
    
    if (sphereRef.current) {
      sphereRef.current.position.y = 0.05 + Math.sin(t * 3) * 0.015;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Floating Ledger */}
      <group ref={ledgerRef} position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 8, 0, 0]} material={paper} castShadow>
          <boxGeometry args={[0.3, 0.015, 0.4]} />
        </mesh>
        {isActive && (
          <mesh ref={sphereRef} position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.015, 16, 16]} />
            <meshBasicMaterial color="#c9a96e" transparent opacity={0.8} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOTSPOT 3D POSITION DATA
   ═══════════════════════════════════════════════════════════════════ */

const HOTSPOT_3D = [
  { id: "chair",  position: [-1.8, 1.4, 1.3] as [number, number, number], color: "#c9a96e" },
  { id: "plate",  position: [-0.6, 1.4, 0.55] as [number, number, number], color: "#e8d5b7" },
  { id: "wine",   position: [-5.5, 1.8, -4.7] as [number, number, number], color: "#8B1928" },
  { id: "gallery",position: [0, 2.6, -4.85] as [number, number, number], color: "#a0b0d0" },
  { id: "ritual", position: [0.35, 1.3, 0] as [number, number, number], color: "#c0c0c0" },
  { id: "candle", position: [0, 2.5, -0.6] as [number, number, number],     color: "#f0c040" },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN SCENE — Exported component
   ═══════════════════════════════════════════════════════════════════ */

interface SceneContentProps {
  scene: "ENTRANCE" | "OPENING" | "ROOM";
  viewpoint: ViewpointKey;
  activeHotspot: string | null;
  hoveredHotspot: string | null;
  onHotspotClick: (id: string) => void;
  onHotspotHover: (id: string | null) => void;
  quality?: "low" | "medium" | "ultra";
  isMobile?: boolean;
}

export default function SceneContent({
  scene, viewpoint, activeHotspot, hoveredHotspot, onHotspotClick, onHotspotHover, quality = "ultra", isMobile,
}: SceneContentProps) {
  const doorsOpen = scene === "OPENING" || scene === "ROOM";
  /* Pause idle animations while a hotspot panel is open (covers ~42% of the
     viewport) — keeps CameraRig running so zoom still feels alive. */
  const paused = activeHotspot !== null;

  /* Chair layout: 4 per side */
  const chairs: { pos: [number, number, number]; rot: [number, number, number] }[] = [
    { pos: [-1.8, 0, 1.3], rot: [0, Math.PI, 0] },
    { pos: [-0.6, 0, 1.3], rot: [0, Math.PI, 0] },
    { pos: [0.6, 0, 1.3],  rot: [0, Math.PI, 0] },
    { pos: [1.8, 0, 1.3],  rot: [0, Math.PI, 0] },
    { pos: [-1.8, 0, -1.3], rot: [0, 0, 0] },
    { pos: [-0.6, 0, -1.3], rot: [0, 0, 0] },
    { pos: [0.6, 0, -1.3],  rot: [0, 0, 0] },
    { pos: [1.8, 0, -1.3],  rot: [0, 0, 0] },
  ];

  const placeSettings: [number, number, number][] = [
    [-1.8, 0, 0.55], [-0.6, 0, 0.55], [0.6, 0, 0.55], [1.8, 0, 0.55],
    [-1.8, 0, -0.55], [-0.6, 0, -0.55], [0.6, 0, -0.55], [1.8, 0, -0.55],
  ];

  const winePositions: [number, number, number][] = [
    [-1.8, 0, 0.32], [-0.6, 0, 0.32], [0.6, 0, 0.32], [1.8, 0, 0.32],
    [-1.8, 0, -0.32], [-0.6, 0, -0.32], [0.6, 0, -0.32], [1.8, 0, -0.32],
  ];

  const candles: [number, number, number][] = [
    [-1.5, 0, 0], [-0.5, 0, 0], [0.5, 0, 0], [1.5, 0, 0],
  ];

  return (
    <QualityContext.Provider value={quality}>
    <PausedContext.Provider value={paused}>
      <CameraRig viewpoint={viewpoint} />
      <MouseFollowLight />
      <SceneLighting />

      {/* Atmospheric fog — warm honey tone, pushed further so the room breathes */}
      <fog attach="fog" args={["#c9a57b", 14, 32]} />

      {/* Environment preset — solo en medium+ (en low se omite para
          ahorrar el IBL que es caro en móviles débiles) */}
      {quality !== "low" && <Environment preset="apartment" />}

      {/* ── Room shell ── */}
      {/* Floor — light honey oak, lightly polished */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#b88c5f" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Ceiling — warm plaster cream */}
      <mesh position={[0, 4.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#ede0c6" roughness={0.95} />
      </mesh>
      {/* Back wall — warm espresso */}
      <mesh position={[0, 2, -5]}><planeGeometry args={[16, 4.2]} /><meshStandardMaterial color="#d9c7a7" roughness={0.92} /></mesh>
      {/* Side walls — warm espresso, double-sided so entrance can't see through */}
      <mesh position={[-8, 2, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[20, 4.2]} /><meshStandardMaterial color="#d9c7a7" roughness={0.92} side={THREE.DoubleSide} /></mesh>
      <mesh position={[8, 2, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[20, 4.2]} /><meshStandardMaterial color="#d9c7a7" roughness={0.92} side={THREE.DoubleSide} /></mesh>
      {/* Front wall — with door cutout (left section, right section, transom above) */}
      <mesh position={[-5.8, 2, 5]} rotation={[0, Math.PI, 0]}><planeGeometry args={[4.3, 4.2]} /><meshStandardMaterial color="#d9c7a7" roughness={0.92} side={THREE.DoubleSide} /></mesh>
      <mesh position={[5.8, 2, 5]} rotation={[0, Math.PI, 0]}><planeGeometry args={[4.3, 4.2]} /><meshStandardMaterial color="#d9c7a7" roughness={0.92} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 3.85, 5]} rotation={[0, Math.PI, 0]}><planeGeometry args={[3.4, 0.5]} /><meshStandardMaterial color="#d9c7a7" roughness={0.92} side={THREE.DoubleSide} /></mesh>

      {/* ── Wall decoration panels ── */}
      <WallPanels />

      {/* ── Objects ── */}
      <EntranceDoors isOpen={doorsOpen} />
      <DiningTable />
      <Sideboard />
      <AreaRug />

      {/* ── Chandelier — above the dining table ── */}
      <Chandelier position={[0, 4.2, 0]} isHovered={hoveredHotspot === "candle"} />

      {/* ── Wall Sconces — warm side lighting ── */}
      <WallSconce position={[-7.92, 2.5, -2.5]} rotation={[0, Math.PI / 2, 0]} />
      <WallSconce position={[-7.92, 2.5, 2.5]} rotation={[0, Math.PI / 2, 0]} />
      <WallSconce position={[7.92, 2.5, -2.5]} rotation={[0, -Math.PI / 2, 0]} />
      <WallSconce position={[7.92, 2.5, 2.5]} rotation={[0, -Math.PI / 2, 0]} />
      <WallSconce position={[-3, 2.8, -4.95]} rotation={[0, 0, 0]} />
      <WallSconce position={[3, 2.8, -4.95]} rotation={[0, 0, 0]} />

      {/* ── Console Tables — side walls ── */}
      <ConsoleTable position={[-7.6, 0, -2]} rotation={[0, Math.PI / 2, 0]} />
      <ConsoleTable position={[7.6, 0, -2]} rotation={[0, -Math.PI / 2, 0]} />

      {/* ── Floor Lamps — back corners ── */}
      <FloorLamp position={[-6.5, 0, -4]} />
      <FloorLamp position={[6.5, 0, -4]} />

      {/* ── Wine Rack — beside the sideboard ── */}
      <WineRack position={[-5.5, 1.8, -4.93]} rotation={[0, 0, 0]} isActive={activeHotspot === "wine"} />

      {/* ── Smart TV Gallery (above sideboard) ── */}
      <SmartTVFurniture position={[0, 2.6, -4.93]} rotation={[0, 0, 0]} isActive={activeHotspot === "gallery"} showScreen={scene === "ROOM"} />

      {/* Surface Contact Shadows (on table) */}
      {quality !== "low" && (
        <ContactShadows
          position={[0, 0.89, 0]}
          opacity={0.4}
          scale={5}
          blur={2}
          far={0.5}
          color="#000000"
        />
      )}

      {/* Floor Contact Shadows */}
      {quality !== "low" && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.6}
          scale={15}
          blur={1.5}
          far={0.8}
          color="#000000"
        />
      )}

      {/* Wall Art */}
      <WallArt position={[-3.6, 2.5, -4.95]} rotation={[0, 0, 0]} scale={0.7} />
      <WallArt position={[3.6, 2.5, -4.95]} rotation={[0, 0, 0]} scale={0.7} />
      <WallArt position={[-7.95, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={1.1} />
      <WallArt position={[7.95, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={1.1} />

      {chairs.map((c, i) => <Chair key={i} position={c.pos} rotation={c.rot} isHovered={hoveredHotspot === "chair" && i === 0} />)}
      {placeSettings.map((p, i) => <PlaceSetting key={i} position={p} isHovered={hoveredHotspot === "plate" && i === 1} />)}
      {winePositions.map((p, i) => <WineGlass key={i} position={p} />)}
      {candles.map((p, i) => <Candle key={i} position={p} />)}
      <Centerpiece isHovered={hoveredHotspot === "ritual"} />

      {/* ── GROUND FLOOR (visible fuera de los muros durante la entrada) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[20, 32]} />
        <meshStandardMaterial
          color="#5c3f26"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* ── Atmospheric dust ── */}
      <Sparkles 
        count={quality === "ultra" ? 80 : (quality === "low" ? 0 : 30)} 
        size={1.2} 
        scale={[12, 7, 12]} 
        position={[0, 3.5, 0]} 
        color="#c9a96e" 
        opacity={0.12} 
        speed={0.25} 
      />

      {/* ── Hotspot markers (ROOM only) ── */}
      {scene === "ROOM" && HOTSPOT_3D.map((s) => (
        <HotspotMarker
          key={s.id}
          id={s.id}
          position={s.position}
          color={s.color}
          isActive={activeHotspot === s.id}
          isHovered={hoveredHotspot === s.id}
          onClick={() => onHotspotClick(s.id)}
          onPointerOver={() => onHotspotHover(s.id)}
          onPointerOut={() => onHotspotHover(null)}
        />
      ))}
    </PausedContext.Provider>
    </QualityContext.Provider>
  );
}
