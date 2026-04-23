"use client";

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        lenisRef.current = new Lenis({
            duration: 1.5, // Más lento para dar sensación de 'lujo' y 'pesadez'
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing cinemático
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        function raf(time: number) {
            lenisRef.current?.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenisRef.current?.destroy();
        }
    }, []);

    return <>{children}</>;
}
