"use client";

import Image from "next/image";
import type { BloqueConfig } from "@/lib/casa-abierta/scenes";
import { HOTSPOTS, type HotspotConfig } from "@/lib/casa-abierta/hotspots";
import HotspotMarker from "./HotspotMarker";

interface Props {
  bloque: BloqueConfig;
  onHotspotClick: (hotspot: HotspotConfig) => void;
}

/* Un bloque = todas las escenas de su cluster concatenadas horizontalmente.
   Cada escena es una <img> con ancho fijo (de scenes.ts). Los hotspots
   se posicionan en porcentaje sobre la escena que les corresponde. */
export default function Bloque({ bloque, onHotspotClick }: Props) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        flexShrink: 0,
      }}
      data-bloque={bloque.id}
    >
      {bloque.scenes.map((scene) => {
        const sceneHotspots = HOTSPOTS.filter((h) => h.sceneId === scene.id);
        return (
          <div
            key={scene.id}
            style={{
              position: "relative",
              width: scene.widthPx,
              height: "100vh",
              flexShrink: 0,
            }}
            data-scene={scene.id}
          >
            <Image
              src={scene.image}
              alt={scene.alt}
              fill
              priority={scene.bloqueId === "cocina"}
              sizes={`${scene.widthPx}px`}
              style={{ objectFit: "cover" }}
            />
            {sceneHotspots.map((h) => (
              <HotspotMarker key={h.id} hotspot={h} onClick={() => onHotspotClick(h)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
