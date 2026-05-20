"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SCENES } from "@/lib/casa-abierta/scenes";
import { HOTSPOTS, type HotspotConfig } from "@/lib/casa-abierta/hotspots";
import HotspotMarker from "./HotspotMarker";
import IntroName from "./IntroName";
import LetterForm from "./LetterForm";
import HotspotDetail from "./HotspotDetail";

interface Props {
  guestName: string;
}

/* En móvil no hay scroll-jack: cada escena ocupa una pantalla completa
   y el usuario hace swipe horizontal nativo entre ellas (scroll-snap).
   Al llegar a la última, la carta sube como en desktop. */
export default function MobileExperience({ guestName }: Props) {
  const [introVisible, setIntroVisible] = useState(true);
  const [hotspotOpen, setHotspotOpen] = useState<HotspotConfig | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);

  function onScrollEnd(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    if (atEnd && !letterOpen) setLetterOpen(true);
  }

  return (
    <>
      <IntroName
        guestName={guestName}
        visible={introVisible}
        onComplete={() => setIntroVisible(false)}
      />

      <div
        onScroll={onScrollEnd}
        style={{
          display: "flex",
          width: "100vw", height: "100vh",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          background: "#0e1a2e",
        }}
      >
        {SCENES.map((scene) => {
          const sceneHotspots = HOTSPOTS.filter((h) => h.sceneId === scene.id);
          return (
            <div
              key={scene.id}
              style={{
                position: "relative",
                flex: "0 0 100vw",
                height: "100vh",
                scrollSnapAlign: "center",
              }}
            >
              <Image src={scene.image} alt={scene.alt} fill style={{ objectFit: "cover" }} />
              {sceneHotspots.map((h) => (
                <HotspotMarker key={h.id} hotspot={h} onClick={() => setHotspotOpen(h)} />
              ))}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {hotspotOpen && (
          <HotspotDetail hotspot={hotspotOpen} onClose={() => setHotspotOpen(null)} />
        )}
      </AnimatePresence>

      <LetterForm guestName={guestName} visible={letterOpen} onClose={() => setLetterOpen(false)} />
    </>
  );
}
