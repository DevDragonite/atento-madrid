"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { BLOQUES, getTotalCanvasWidth } from "@/lib/casa-abierta/scenes";
import type { HotspotConfig } from "@/lib/casa-abierta/hotspots";
import Bloque from "./Bloque";
import Transition from "./Transition";
import IntroName from "./IntroName";
import LetterForm from "./LetterForm";
import HotspotDetail from "./HotspotDetail";

interface Props {
  guestName: string;
}

const SCROLL_FACTOR = 1; // 1 = pan idéntico al scroll. >1 = pan más rápido.

/* Wrapper principal del recorrido horizontal:
   - Lenis para smooth scroll
   - scrollYProgress (0..1) mapeado a translateX del canvas
   - Muestra IntroName la primera vez, LetterForm al final, HotspotDetail al clicar */
export default function CasaAbiertaExperience({ guestName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [introVisible, setIntroVisible] = useState(true);
  const [hotspotOpen, setHotspotOpen] = useState<HotspotConfig | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const [canvasWidth] = useState(() => getTotalCanvasWidth());

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.4, smoothWheel: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [`0px`, `calc(-${canvasWidth}px + 100vw)`],
  );

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v > 0.985 && !letterOpen) setLetterOpen(true);
    });
    return () => unsubscribe();
  }, [scrollYProgress, letterOpen]);

  return (
    <>
      <IntroName
        guestName={guestName}
        visible={introVisible}
        onComplete={() => setIntroVisible(false)}
      />

      <div
        ref={containerRef}
        style={{
          height: `${canvasWidth * SCROLL_FACTOR}px`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky", top: 0,
            width: "100vw", height: "100vh",
            overflow: "hidden",
            background: "#0e1a2e",
          }}
        >
          <motion.div
            style={{
              x,
              display: "flex",
              height: "100vh",
              width: `${canvasWidth}px`,
            }}
          >
            {BLOQUES.map((bloque, i) => (
              <div key={bloque.id} style={{ display: "flex" }}>
                <Bloque bloque={bloque} onHotspotClick={setHotspotOpen} />
                {i < BLOQUES.length - 1 && <Transition />}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {hotspotOpen && (
          <HotspotDetail hotspot={hotspotOpen} onClose={() => setHotspotOpen(null)} />
        )}
      </AnimatePresence>

      <LetterForm
        guestName={guestName}
        visible={letterOpen}
        onClose={() => setLetterOpen(false)}
      />
    </>
  );
}
