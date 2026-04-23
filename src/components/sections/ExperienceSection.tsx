"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const philosophy = [
    {
        num: "01",
        title: "Intimidad Privilegiada",
        desc: "Creemos que las mejores conversaciones ocurren a puerta cerrada. Una sola mesa para tu grupo asegura que la noche sea exclusivamente tuya, sin interrupciones.",
        img: "https://images.unsplash.com/photo-1414235077428-33898dd1444c?q=80&w=2070&auto=format&fit=crop"
    },
    {
        num: "02",
        title: "El Origen del Sabor",
        desc: "Seleccionamos cada ingrediente buscando su historia. Productores locales, temporadas respetadas y una ejecución que honra la pureza y calidez de cada sabor.",
        img: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2070&auto=format&fit=crop"
    },
    {
        num: "03",
        title: "Una Sobremesa Infinita",
        desc: "Aquí el reloj no existe. Te invitamos a desconectar y extender la charla todo lo que desees con una buena copa de vino. El espacio te pertenece por esta noche.",
        img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
    }
];

export default function ExperienceSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const yTitle = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);

    return (
        <section ref={containerRef} id="experience" className="bg-background-dark py-32 px-6 lg:px-20 relative overflow-hidden">
            {/* Background Texture/Gradient */}
            <div className="absolute top-0 right-0 w-full md:w-[60%] h-full bg-gradient-to-b from-primary/5 to-transparent pointer-events-none opacity-50" />
            
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 relative">
                {/* Sticky Left Sidebar */}
                <div className="w-full md:w-1/3 relative">
                    <div className="sticky top-40">
                        <motion.div style={{ y: yTitle }}>
                            <span className="font-sans text-[10px] md:text-xs tracking-[0.3em] uppercase text-primary mb-6 block">Nuestro Ethos</span>
                            <h2 className="font-serif-title text-4xl md:text-5xl lg:text-6xl text-cream tracking-tight leading-[1.05] mb-8">
                                Donde todo <br/>
                                <span className="italic text-primary/90 text-5xl md:text-6xl lg:text-7xl ml-8 block mt-2">fluye.</span>
                            </h2>
                            <p className="text-neutral-gold text-base leading-relaxed max-w-sm mt-8 border-l-2 border-primary/20 pl-6">
                                Rompemos con el ritmo frenético de la ciudad para ofrecerte un santuario íntimo. Ven con tu círculo más querido y permítenos cuidar cada detalle de tu mesa.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Right Scrolling Content */}
                <div className="w-full md:w-2/3 flex flex-col gap-32 pt-10 md:pt-40 relative z-10">
                    {philosophy.map((item, i) => (
                        <div key={item.num} className="flex flex-col gap-8 group">
                            {/* Mask Reveal Image */}
                            <div className="relative w-full aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-md bg-background-light">
                                <motion.div 
                                    initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }}
                                    whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1] }}
                                    className="absolute inset-0"
                                >
                                    <img
                                        src={item.img}
                                        alt={item.title}
                                        className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Warm gradient on image bottom - no gloomy black and white filters! */}
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background-dark/60 to-transparent mix-blend-multiply opacity-50" />
                                </motion.div>
                            </div>

                            {/* Number & Text */}
                            <div className="flex flex-col md:flex-row gap-4 md:gap-10 pl-2 md:pl-0">
                                <span className="font-serif-title text-2xl md:text-3xl italic text-primary/40 shrink-0 mt-1">{item.num}.</span>
                                <div>
                                    <h3 className="font-serif-title text-2xl md:text-3xl text-cream mb-4">{item.title}</h3>
                                    <p className="font-sans text-neutral-gold leading-relaxed max-w-xl text-sm md:text-base">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
