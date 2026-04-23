import type { Metadata } from "next";
import { Playfair_Display, Work_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "atento. — experiencia culinaria privada en Madrid",
  description:
    "Una cena íntima y sofisticada en casa. Fusión de alta cocina española y tailandesa. Supper club privado en Madrid. Solicita tu reserva.",
  keywords: [
    "supper club Madrid",
    "cena privada Madrid",
  ],
};

import CustomCursor from "@/components/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${playfair.variable} ${workSans.variable} font-sans antialiased`}
        style={{ overflow: "hidden", margin: 0, padding: 0, height: "100vh" }}
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
