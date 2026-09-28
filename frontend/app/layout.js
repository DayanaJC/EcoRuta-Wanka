import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata = {
  title: "EcoRuta Wanka · Gestión logística — Huancayo",
  description: "Gestión de vehículos, pedidos, asignaciones y rutas optimizadas de reparto para WankaLogística S.A.C.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
