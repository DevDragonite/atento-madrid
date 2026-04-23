"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const menuItems = [
    { num: "01", title: "Buñuelo de Maíz Thai", desc: "Dulce, ligeramente picante y cremoso. Un bocado explosivo para despertar el paladar.", img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2069&auto=format&fit=crop" },
    { num: "02", title: "Ensaladilla de Gamba", desc: "Pura confitería del mar. Aceite de langostinos, polvo de coral y texturas marinas.", img: "https://images.unsplash.com/photo-1626804475297-41607ea0ba4eb?q=80&w=2070&auto=format&fit=crop" },
    { num: "03", title: "Lubina al Curry", desc: "Confort y exotismo. Leche de coco tostado, chiles aromáticos sedosos y pesca del día.", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=2026&auto=format&fit=crop" },
    { num: "04", title: "Sorbete Thai", desc: "Cítricos, jengibre y frescura absoluta para resetear por completo los sentidos.", img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=2070&auto=format&fit=crop" },
    { num: "05", title: "Arroz con Leche Frito", desc: "Un final que abraza. Crujiente en el exterior, denso y fundente por dentro.", img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2157&auto=format&fit=crop" }
];

export default function FusionSection() {
    return (
        <section id="menu" className="relative py-32 bg-background-dark overflow-hidden flex flex-col justify-center">
            
            {/* Header Title */}
            <div className="px-6 md:px-20 mb-16 relative z-10 w-full max-w-[100vw]">
                <span className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-primary/80 mb-4 block">
                    Menú Degustación
                </span>
                <h2 className="font-serif-title text-4xl md:text-6xl lg:text-7xl text-cream tracking-tight leading-[1.1]">
                    Un Viaje de <br/>
                    <span className="italic text-primary/90">Cinco Tiempos.</span>
                </h2>
            </div>

            {/* Endless Marquee Gallery */}
            <div className="relative w-full overflow-hidden flex items-center">
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 35, repeat: Infinity }}
                    className="flex gap-8 md:gap-12 w-[max-content] pb-8 relative z-10 pl-6 md:pl-20"
                >
                    {/* Duplicate the array to make the infinite loop seamless */}
                    {[...menuItems, ...menuItems].map((dish, i) => (
                        <div key={`${dish.title}-${i}`} className="relative flex-shrink-0 w-[80vw] md:w-[30vw] max-w-sm flex flex-col border border-white/5 bg-background-light p-6 md:p-8 rounded-sm group overflow-hidden">
                            {/* Number background */}
                            <span className="absolute -top-4 -right-2 text-[8rem] font-serif-title text-white/5 opacity-50 select-none transition-transform duration-500 group-hover:scale-110">
                                {dish.num}
                            </span>

                            {/* Content */}
                            <div className="relative z-10 flex flex-col h-full w-full justify-between gap-12 pt-8">
                                <div className="space-y-4">
                                    <h3 className="font-serif-title text-2xl md:text-3xl text-cream">{dish.title}</h3>
                                    <p className="font-sans text-neutral-gold text-sm md:text-base leading-relaxed">
                                        {dish.desc}
                                    </p>
                                </div>
                                
                                <div className="relative w-full aspect-square overflow-hidden rounded-full self-end border border-primary/20 p-2">
                                    <div className="relative w-full h-full rounded-full overflow-hidden">
                                        <img
                                            src={dish.img}
                                            alt={dish.title}
                                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
                
                {/* Lateral Fade Gradients to blend marquee into background */}
                <div className="absolute top-0 bottom-0 left-0 w-12 md:w-32 bg-gradient-to-r from-background-dark to-transparent z-20 pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-12 md:w-32 bg-gradient-to-l from-background-dark to-transparent z-20 pointer-events-none" />
            </div>
            
        </section>
    );
}
