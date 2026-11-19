import { ConsultaPedido } from "@/components/ConsultaPedido";

// Portal del cliente: consulta el estado de su pedido con un solo dato.
export const metadata = {
  title: "Consulta tu pedido · WankaLogística",
  description: "Escribe el código de tu pedido, tu DNI o tu teléfono y mira en qué estado está.",
};

export default function PaginaConsulta() {
  return <ConsultaPedido />;
}
