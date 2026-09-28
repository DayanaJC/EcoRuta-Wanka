import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--fuente" });

export const metadata = {
  title: "EcoRuta Wanka · Gestión logística — Huancayo",
  description: "Gestión de vehículos, pedidos, asignaciones y rutas optimizadas de reparto para WankaLogística S.A.C.",
  icons: { icon: "/favicon.svg" },
};

export const viewport = {
  themeColor: "#0b2e1c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
