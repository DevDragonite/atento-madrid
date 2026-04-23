"use client";

import { useState } from "react";
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
        message: "",
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
            className="bg-background-dark min-h-screen flex flex-col items-center justify-center px-4 py-32 relative overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_100%)] mix-blend-screen"></div>
            </div>

            <div className="max-w-3xl w-full relative z-10 p-8 md:p-16">
                {/* Heading */}
                <ScrollReveal className="text-center mb-24">
                    <span className="text-primary text-[10px] font-sans tracking-[0.4em] uppercase mb-6 block">
                        La Invitación
                    </span>
                    <h2 className="font-serif-title text-5xl md:text-6xl lg:text-7xl font-light text-cream mb-8 tracking-tight leading-tight">
                        Tu asiento <br/> <span className="italic text-primary/90">te espera.</span>
                    </h2>
                    <p className="text-neutral-gold font-sans text-sm md:text-base max-w-lg mx-auto leading-relaxed opacity-80">
                        Atendemos a un número muy exclusivo de personas cada mes. Contáctanos con tus preferencias y permítenos organizar una velada que no olvidarás.
                    </p>
                </ScrollReveal>

                {/* Reservation Form */}
                <ScrollReveal delay={0.2} className="relative">
                    <AnimatePresence mode="wait">
                        {formState === "success" ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col items-center text-center gap-6 py-16 px-8"
                            >
                                <span className="font-serif-title text-6xl text-primary italic mb-4">Gracias.</span>
                                <h3 className="font-sans text-xl text-cream font-light">Hemos recibido tu solicitud.</h3>
                                <p className="font-sans text-sm leading-relaxed text-neutral-gold max-w-sm">
                                    Nos pondremos en contacto contigo pronto en <strong>{form.email || "tu correo"}</strong> para confirmar los detalles de tu mesa y asegurar que todo sea perfecto.
                                </p>
                                <button
                                    className="font-sans text-[10px] tracking-[0.2em] uppercase text-primary/60 hover:text-primary transition-colors mt-8"
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
                                className="flex flex-col gap-16"
                            >
                                {/* Massive input for Name */}
                                <div className="flex flex-col relative group">
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Tu nombre completo"
                                        className="bg-transparent border-0 border-b border-primary/20 focus:border-primary focus:ring-0 text-3xl md:text-5xl font-serif-title placeholder:text-neutral-gold/20 text-cream w-full py-4 transition-colors duration-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
                                    <div className="flex flex-col relative group">
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="Tu correo electrónico"
                                            className="bg-transparent border-0 border-b border-primary/20 focus:border-primary focus:ring-0 text-xl font-serif-title placeholder:text-neutral-gold/20 text-cream w-full py-3 transition-colors duration-500 outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col relative group">
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            value={form.date}
                                            onChange={handleChange}
                                            className="bg-transparent border-0 border-b border-primary/20 focus:border-primary focus:ring-0 text-xl font-serif-title text-cream w-full py-3 transition-colors duration-500 outline-none"
                                            style={{ colorScheme: "dark" }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col relative group">
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="¿Algún deseo especial, alergia o detalle que debamos conocer?"
                                        rows={2}
                                        className="bg-transparent border-0 border-b border-primary/20 focus:border-primary focus:ring-0 text-xl font-serif-title placeholder:text-neutral-gold/20 text-cream w-full py-3 resize-none transition-colors duration-500 outline-none block"
                                    />
                                </div>

                                {/* Submit Action */}
                                <div className="mt-8 flex flex-col items-center">
                                    <div className="mb-8">
                                        <MagneticButton onClick={handleSubmit as () => void} className="relative inline-flex items-center justify-center px-12 py-5 border border-primary/40 rounded-full group hover:border-primary transition-colors duration-300">
                                            {formState === "loading" ? (
                                                <span className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest text-primary">
                                                    <span className="animate-pulse">Preparando mesa...</span>
                                                </span>
                                            ) : (
                                                <span className="font-sans text-xs tracking-[0.2em] uppercase text-cream group-hover:text-primary transition-colors duration-300">Solicitar Mesa</span>
                                            )}
                                        </MagneticButton>
                                    </div>
                                    <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-neutral-gold/40">
                                        Nos contactaremos contigo en menos de 24h.
                                    </p>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </ScrollReveal>
            </div>
        </section>
    );
}
