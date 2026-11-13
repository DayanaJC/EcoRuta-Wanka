import { Inter } from "next/font/google";
import { preconnect } from "react-dom";
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

// Origen de la API: se abre la conexión (DNS + TLS) mientras se descarga el JavaScript,
// así la primera consulta de pedidos no espera el saludo con el servidor (mejora el LCP).
const ORIGEN_API = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1").origin;
  } catch {
    return null;
  }
})();

export default function RootLayout({ children }) {
  if (ORIGEN_API) preconnect(ORIGEN_API, { crossOrigin: "anonymous" });
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
