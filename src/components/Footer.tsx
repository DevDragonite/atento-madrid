import ScrollReveal from "@/components/ScrollReveal";

const socials = [
    {
        name: "Instagram",
        href: "https://instagram.com",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
        ),
    },
    {
        name: "TikTok",
        href: "https://tiktok.com",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
            </svg>
        ),
    },
];

export default function Footer() {
    return (
        <footer className="bg-charcoal text-cream/70 py-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pb-16 border-b border-cream/10">
                    {/* Brand */}
                    <ScrollReveal delay={0}>
                        <p className="font-serif text-5xl italic font-light text-cream mb-4">atento.</p>
                        <p className="font-sans text-sm leading-relaxed text-cream/50 max-w-xs">
                            Una mesa pequeña.<br />
                            Una atención infinita.<br />
                            Aquí eres atendido.
                        </p>
                    </ScrollReveal>

                    {/* Philosophy */}
                    <ScrollReveal delay={0.1}>
                        <h4 className="font-sans text-xs tracking-[0.14em] uppercase text-cream/40 mb-5">Filosofía</h4>
                        <p className="font-sans text-sm leading-relaxed text-cream/60">
                            La buena comida no debería ser inaccesible. Por eso nace atento. — una cena privada en casa donde la hospitalidad se siente en cada plato y cada invitado.
                        </p>
                    </ScrollReveal>

                    {/* Contact & Socials */}
                    <ScrollReveal delay={0.2}>
                        <h4 className="font-sans text-xs tracking-[0.14em] uppercase text-cream/40 mb-5">Contacto</h4>
                        <a
                            href="mailto:hola@atento.madrid"
                            className="font-sans text-sm text-cream/60 hover:text-cream transition-colors duration-300 mb-6 block"
                        >
                            hola@atento.madrid
                        </a>
                        <div className="flex gap-4">
                            {socials.map((s) => (
                                <a
                                    key={s.name}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.name}
                                    className="text-cream/40 hover:text-cream transition-colors duration-300"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>

                {/* Bottom */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <p className="font-sans text-xs text-cream/25 tracking-wide">
                        © {new Date().getFullYear()} atento. — Madrid, España
                    </p>
                    <p className="font-sans text-xs text-cream/25">
                        Con cariño y mucha citronela. — Antonio
                    </p>
                </div>
            </div>
        </footer>
    );
}
