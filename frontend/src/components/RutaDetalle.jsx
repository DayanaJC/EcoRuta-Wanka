import {
  ETIQUETAS_MOTIVO_EXCLUSION,
  formatearCO2,
  formatearKm,
  formatearLitros,
  formatearMinutos,
  sumarMinutos,
} from '../utils/formatos.js'

function Metricas({ ruta }) {
  const metricas = [
    { etiqueta: 'Distancia', valor: formatearKm(ruta.distancia_total_km) },
    { etiqueta: 'Tiempo estimado', valor: formatearMinutos(ruta.tiempo_estimado_min) },
    { etiqueta: 'Paradas', valor: String(ruta.cantidad_paradas) },
    { etiqueta: 'Peso total', valor: `${ruta.peso_total_kg} kg` },
    { etiqueta: 'Combustible', valor: formatearLitros(ruta.combustible_estimado_l) },
    { etiqueta: 'Emisiones CO₂', valor: formatearCO2(ruta.emisiones_co2_kg) },
  ]
  return (
    <div className="grid-metricas">
      {metricas.map((m) => (
        <div className="tarjeta-metrica" key={m.etiqueta}>
          <p className="valor">{m.valor}</p>
          <p className="etiqueta">{m.etiqueta}</p>
        </div>
      ))}
    </div>
  )
}

export function RutaDetalle({ ruta, onGenerarOtra, onVolver }) {
  const horaFin = sumarMinutos(ruta.hora_inicio, ruta.tiempo_estimado_min)

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>Ruta optimizada</h2>
        <div className="acciones">
          <button className="boton boton-secundario" type="button" onClick={onGenerarOtra}>
            Generar otra ruta
          </button>
          <button className="boton boton-secundario" type="button" onClick={onVolver}>
            ← Volver
          </button>
        </div>
      </div>

      <Metricas ruta={ruta} />

      <div className="tarjeta-detalle">
        <h3>Vehículo</h3>
        <p className="detalle-fuerte">{ruta.vehiculo_placa}</p>
        <p className="detalle-suave">
          ID: {ruta.vehiculo_id} · Salida {ruta.hora_inicio} · Llegada estimada {horaFin}
        </p>
        <p className="detalle-suave">
          Velocidad media {ruta.velocidad_media_kmh} km/h · {ruta.tiempo_servicio_min} min de
          atención por parada
        </p>
        <p className="detalle-suave">
          Punto de partida: {ruta.punto_partida_latitud}, {ruta.punto_partida_longitud}
        </p>
      </div>

      {ruta.paradas.length === 0 ? (
        <p className="aviso aviso-error">
          No hay pedidos con ubicación válida para generar la ruta. Revisa las exclusiones
          abajo.
        </p>
      ) : (
        <div className="lista-paradas">
          {ruta.paradas.map((p, i) => {
            const esUltima = i === ruta.paradas.length - 1
            return (
              <div className="parada-item" key={p.pedido_id}>
                <span
                  className={`parada-numero${esUltima ? ' parada-numero-final' : ''}`}
                  title={esUltima ? 'Última parada' : `Parada ${p.orden}`}
                >
                  {p.orden}
                </span>
                <div className="parada-contenido">
                  <div className="parada-titulo">
                    <span className="texto-principal">{p.cliente_nombre}</span>
                    <span
                      className={
                        p.cumple_ventana
                          ? 'badge cumple-ventana'
                          : 'badge fuera-ventana'
                      }
                    >
                      {p.cumple_ventana ? 'En ventana' : 'Fuera de ventana'}
                    </span>
                  </div>
                  <span className="parada-direccion">{p.direccion}</span>
                  <span className="parada-datos">
                    <span>LLega: {p.hora_estimada_llegada}</span>
                    <span>
                      Ventana: {p.ventana_entrega_inicio}–{p.ventana_entrega_fin}
                    </span>
                    <span>{p.peso_kg} kg</span>
                    <span>+{formatearKm(p.distancia_desde_origen_km)}</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {ruta.paradas_excluidas.length > 0 && (
        <div className="tarjeta-detalle">
          <h3>Pedidos excluidos ({ruta.paradas_excluidas.length})</h3>
          <ul className="lista-excluidos">
            {ruta.paradas_excluidas.map((x) => (
              <li key={x.pedido_id} className="texto-secundario">
                {x.pedido_id} · {ETIQUETAS_MOTIVO_EXCLUSION[x.motivo] || x.motivo}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ruta.cumplimiento_ventanas ? null : (
        <p className="aviso aviso-info">
          Hay paradas fuera de su ventana de entrega. El optimizador prioriza cumplir horarios,
          pero con estos pedidos no es posible atenderlos todos dentro de su ventana.
        </p>
      )}
    </section>
  )
}