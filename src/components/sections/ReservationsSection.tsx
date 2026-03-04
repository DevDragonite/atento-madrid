"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";
import MagneticButton from "@/components/MagneticButton";

type FormState = "idle" | "loading" | "success";

export default function ReservationsSection() {
    const [formState, setFormState] = useState<FormState>("idle");
    const [form, setForm] = useState({
        name: "",
        email: "",
        date: "",
        guests: "2",
        dietary: "",
    });

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormState("loading");
        setTimeout(() => setFormState("success"), 1800);
    }

    return (
        <section
            id="reservas"
            className="bg-background-dark min-h-screen flex flex-col items-center justify-center px-4 py-24 relative overflow-hidden"
        >
            {/* Background elements (subtle gradients/images) */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-charcoal)_0%,_transparent_100%)]"></div>
            </div>

            <div className="max-w-4xl w-full relative z-10">

                {/* Hero Heading */}
                <ScrollReveal className="text-center mb-20">
                    <span className="text-primary text-xs md:text-sm font-medium tracking-[0.4em] uppercase mb-4 block">Supper Club Clandestino</span>
                    <h2 className="font-serif-title text-5xl md:text-6xl lg:text-7xl font-light text-slate-100 mb-6 tracking-tight">Solicita tu Acceso</h2>
                    <p className="text-neutral-gold font-serif-title italic text-xl max-w-2xl mx-auto leading-relaxed">
                        Las cenas están limitadas a solo cinco comensales. Una sola mesa por noche. Escríbeme tus fechas preferidas y te confirmo disponibilidad en menos de 24 horas.
                    </p>
                </ScrollReveal>

                {/* Reservation Form */}
                <ScrollReveal delay={0.2} className="relative">
                    <AnimatePresence mode="wait">
                        {formState === "success" ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col items-center text-center gap-8 py-16 px-8 border border-primary/20 bg-charcoal/50 backdrop-blur-md rounded-xl"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                                    className="w-16 h-16 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center text-primary"
                                >
                                    <span className="material-symbols-outlined text-3xl">check</span>
                                </motion.div>
                                <h3 className="font-serif-title text-3xl md:text-4xl text-slate-100">Solicitud Recibida</h3>
                                <p className="font-sans text-base leading-relaxed text-slate-400 max-w-md">
                                    Gracias, <span className="text-primary">{form.name || "querido invitado"}</span>.<br />
                                    Te escribiré en las próximas 24 horas con la confirmación y las instrucciones de acceso.
                                </p>
                                <button
                                    className="font-sans text-xs tracking-[0.2em] uppercase text-primary hover:text-primary/70 border-b border-primary/30 hover:border-primary/70 transition-colors pb-1 mt-4"
                                    onClick={() => setFormState("idle")}
                                >
                                    Realizar otra solicitud
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12"
                            >
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-primary/50">Identidad Completa</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Tu nombre completo"
                                        className="bg-transparent border-0 border-b border-neutral-gold/30 focus:border-primary focus:ring-0 text-lg font-serif-title placeholder:text-primary/20 text-slate-100 w-full py-3 transition-colors duration-300 outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-primary/50">Correspondencia Digital</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="hola@ejemplo.com"
                                        className="bg-transparent border-0 border-b border-neutral-gold/30 focus:border-primary focus:ring-0 text-lg font-serif-title placeholder:text-primary/20 text-slate-100 w-full py-3 transition-colors duration-300 outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-primary/50">La Velada</label>
                                    <input
                                        type="date"
                                        name="date"
                                        required
                                        value={form.date}
                                        onChange={handleChange}
                                        className="bg-transparent border-0 border-b border-neutral-gold/30 focus:border-primary focus:ring-0 text-lg font-serif-title text-slate-100 w-full py-3 transition-colors duration-300 outline-none"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-primary/50">La Asamblea</label>
                                    <select
                                        name="guests"
                                        value={form.guests}
                                        onChange={handleChange}
                                        className="bg-transparent border-0 border-b border-neutral-gold/30 focus:border-primary focus:ring-0 text-lg font-serif-title text-slate-100 w-full py-3 transition-colors duration-300 appearance-none cursor-pointer outline-none"
                                    >
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <option key={n} value={n} className="bg-background-dark text-slate-100">{n} {n === 1 ? "invitado" : "invitados"}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2 flex flex-col gap-2 mt-4">
                                    <label className="text-[10px] uppercase tracking-[0.3em] text-primary/50">Requisitos Especiales</label>
                                    <textarea
                                        name="dietary"
                                        value={form.dietary}
                                        onChange={handleChange}
                                        placeholder="Restricciones alimentarias, alergias o peticiones únicas…"
                                        rows={2}
                                        className="bg-transparent border-0 border-b border-neutral-gold/30 focus:border-primary focus:ring-0 text-lg font-serif-title placeholder:text-primary/20 text-slate-100 w-full py-3 resize-none transition-colors duration-300 outline-none"
                                    />
                                </div>

                                {/* Submit Action */}
                                <div className="md:col-span-2 mt-12 flex flex-col items-center">
                                    <div className="mb-6">
                                        <MagneticButton onClick={handleSubmit as () => void} variant="primary">
                                            {formState === "loading" ? (
                                                <span className="flex items-center gap-3">
                                                    <motion.span
                                                        className="w-4 h-4 border border-background-dark/30 border-t-background-dark rounded-full inline-block"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                                    />
                                                    Procesando…
                                                </span>
                                            ) : (
                                                "Solicitar Acceso →"
                                            )}
                                        </MagneticButton>
                                    </div>
                                    <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary/40">Respuesta habitual en 24 horas mediante invitación privada.</p>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </ScrollReveal>
            </div>
        </section>
    );
}
