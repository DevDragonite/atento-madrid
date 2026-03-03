"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const navLinks = [
    { label: "La Experiencia", href: "#experiencia" },
    { label: "Fusión", href: "#fusion" },
    { label: "Reservas", href: "#reservas" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handle = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", handle);
        return () => window.removeEventListener("scroll", handle);
    }, []);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-cream/90 backdrop-blur-md shadow-sm" : "bg-transparent"
                }`}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
                {/* Logo */}
                <a
                    href="#"
                    className="font-serif text-2xl italic font-light text-charcoal tracking-tight hover:text-terracotta transition-colors duration-300"
                >
                    atento.
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="font-sans text-xs tracking-[0.12em] uppercase text-warm-gray hover:text-charcoal transition-colors duration-300"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* CTA */}
                <a
                    href="#reservas"
                    className="hidden md:inline-flex items-center gap-2 font-sans text-xs tracking-[0.12em] uppercase px-6 py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-300"
                >
                    Reservar
                </a>

                {/* Mobile menu button */}
                <button
                    className="md:hidden flex flex-col gap-1.5 cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <motion.span
                        className="w-6 h-px bg-charcoal block"
                        animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 8 : 0 }}
                        transition={{ duration: 0.3 }}
                    />
                    <motion.span
                        className="w-6 h-px bg-charcoal block"
                        animate={{ opacity: menuOpen ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.span
                        className="w-6 h-px bg-charcoal block"
                        animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -8 : 0 }}
                        transition={{ duration: 0.3 }}
                    />
                </button>
            </div>

            {/* Mobile Menu */}
            <motion.div
                className="md:hidden bg-cream border-t border-linen"
                initial={false}
                animate={{ height: menuOpen ? "auto" : 0, opacity: menuOpen ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ overflow: "hidden" }}
            >
                <div className="px-6 py-8 flex flex-col gap-6">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="font-sans text-sm tracking-[0.12em] uppercase text-warm-gray hover:text-charcoal transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                    <a
                        href="#reservas"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex w-fit items-center gap-2 font-sans text-xs tracking-[0.12em] uppercase px-6 py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-300"
                    >
                        Reservar
                    </a>
                </div>
            </motion.div>
        </motion.header>
    );
}
