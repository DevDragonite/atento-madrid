import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "atento. — experiencia culinaria privada en Madrid",
  description:
    "Una cena íntima y sofisticada en casa. Fusión de alta cocina española y tailandesa. Supper club privado en Madrid. Solicita tu reserva.",
  keywords: [
    "supper club Madrid",
    "cena privada Madrid",
    "restaurante privado",
    "fusión española tailandesa",
    "experiencia gastronómica",
    "atento Madrid",
  ],
  openGraph: {
    title: "atento. — experiencia culinaria privada",
    description:
      "Una cena íntima. Una fusión audaz. Un hogar convertido en escenario.",
    type: "website",
    locale: "es_ES",
  },
};

export const viewport = {
  themeColor: "#FAF6F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
