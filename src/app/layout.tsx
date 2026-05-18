import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["700","800","900"] });

export const metadata: Metadata = {
  title: "VIMEX — Importa a Bolivia sin complicaciones",
  description: "Plataforma de importaciones para Bolivia. Calculadora de tributos, tracking en tiempo real, proveedores verificados y asesoría experta.",
  keywords: "importaciones bolivia, aranceles bolivia, calculadora tributos, courier bolivia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable} h-full`}>
      <body className="min-h-full font-sans antialiased bg-white text-[#0f1f17]">
        {children}
      </body>
    </html>
  );
}
