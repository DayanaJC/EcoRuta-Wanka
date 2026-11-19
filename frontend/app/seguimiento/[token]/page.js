import { SeguimientoPedido } from "@/components/SeguimientoPedido";

// Página pública para el cliente: se llega desde el enlace del aviso de WhatsApp.
// El token no se puede adivinar; la página no se indexa en buscadores.
export const metadata = {
  title: "Seguimiento de tu pedido · WankaLogística",
  description: "Estado de tu pedido en tiempo real.",
  robots: { index: false, follow: false },
};

export default async function PaginaSeguimiento({ params }) {
  const { token } = await params;
  return <SeguimientoPedido token={token} />;
}
