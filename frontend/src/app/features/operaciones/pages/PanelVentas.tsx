import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CreditCard, PackageOpen, QrCode, Receipt, Wallet } from "lucide-react";
import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import CategoriaProductos from "../componentes/CategoriaProductos";
import ResumenOrdenItem from "../componentes/ResumenOrdenItem";
import VentasDeLaJornada from "../componentes/VentasDeLaJornada";
import { cn } from "../../../../lib/cn";
import { formatPrecio } from "../../../utils/formatoPrecio";
import type { Producto, TipoProducto } from "../../../services/productosService";
import type { Jornada } from "../../../services/jornadasService";
import {
  anularVentaBuffet,
  getProductosBuffet,
  getVentasBuffet,
  registrarVentaBuffet,
  type MedioPagoBuffet,
  type VentasDeJornada,
} from "../../../services/buffetService";

const iconoMedio: Record<MedioPagoBuffet, React.ReactNode> = {
  Efectivo: <Wallet className="h-4 w-4" />,
  Tarjeta: <CreditCard className="h-4 w-4" />,
  QR: <QrCode className="h-4 w-4" />,
};

// El más común en un buffet: queda elegido de entrada y después de cada venta
const MEDIO_POR_DEFECTO: MedioPagoBuffet = "Efectivo";

// Las pestañas del catálogo, en el orden en que se muestran
const PESTANAS: { tipo: TipoProducto; titulo: string; vacio: string }[] = [
  { tipo: "Comida", titulo: "Comidas", vacio: "No hay comidas asignadas a este evento." },
  { tipo: "Bebida", titulo: "Bebidas", vacio: "No hay bebidas asignadas a este evento." },
];

/*
    La caja del buffet en una jornada. El catálogo son los productos
    asignados al evento de la jornada (se asignan desde Administración) que
    siguen a la venta. La jornada llega del layout (OperacionesJornadaLayout),
    que ya la cargó para mostrar sobre qué se está trabajando.

    La venta se arma en pantalla y al registrarla solo se mandan productos,
    cantidades y medio de pago: los precios y el total los pone el backend.
    Arriba, desplegable, las ventas de la jornada (con la opción de anular).

    El catálogo se separa en pestañas (Comidas y Bebidas) para no scrollear
    buscando un producto: se cambia de una a otra con un toque y lo cargado
    en la venta se mantiene. Cada pestaña dice cuántas unidades de ese tipo
    hay en la venta en curso, así no se pierde de vista lo del otro lado.
*/
const PanelVentas = () => {
  const jornada = useOutletContext<Jornada>();

  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [error, setError] = useState("");
  // Cantidad elegida de cada producto (por id): lo que va en la venta en curso
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [medioPago, setMedioPago] = useState<MedioPagoBuffet>(MEDIO_POR_DEFECTO);
  const [registrando, setRegistrando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [ventas, setVentas] = useState<VentasDeJornada | null>(null);
  // null = todavía no se eligió: se muestra la primera pestaña que tenga productos
  const [pestanaElegida, setPestanaElegida] = useState<TipoProducto | null>(null);

  const cargarVentas = useCallback(async () => {
    try {
      setVentas(await getVentasBuffet(jornada.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las ventas");
    }
  }, [jornada.id]);

  useEffect(() => {
    getProductosBuffet(jornada.id)
      .then(setProductos)
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar los productos"));
    cargarVentas();
  }, [jornada.id, cargarVentas]);

  const cambiarCantidad = (producto: Producto, cambio: number) => {
    setAviso(null);
    setCantidades((prev) => {
      const nueva = Math.max(0, (prev[producto.id] ?? 0) + cambio);
      const { [producto.id]: _, ...resto } = prev;
      return nueva === 0 ? resto : { ...resto, [producto.id]: nueva };
    });
  };

  // Los renglones de la venta, en el orden del catálogo
  const lineas = useMemo(
    () =>
      (productos ?? [])
        .filter((p) => cantidades[p.id])
        .map((p) => ({ producto: p, cantidad: cantidades[p.id], precio: Number(p.precio) })),
    [productos, cantidades],
  );
  const total = lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
  const unidades = lineas.reduce((suma, l) => suma + l.cantidad, 0);

  const delTipo = (tipo: TipoProducto) => (productos ?? []).filter((p) => p.tipo === tipo);
  const unidadesDelTipo = (tipo: TipoProducto) => lineas.filter((l) => l.producto.tipo === tipo).reduce((suma, l) => suma + l.cantidad, 0);
  const pestana = pestanaElegida ?? PESTANAS.find((p) => delTipo(p.tipo).length > 0)?.tipo ?? "Comida";
  const datosPestana = PESTANAS.find((p) => p.tipo === pestana)!;

  const limpiarVenta = () => {
    setCantidades({});
    setMedioPago(MEDIO_POR_DEFECTO);
  };

  const registrar = async () => {
    if (lineas.length === 0 || registrando) return;
    setRegistrando(true);
    setAviso(null);
    try {
      const venta = await registrarVentaBuffet(jornada.id, {
        medioPago,
        items: lineas.map((l) => ({ idProducto: l.producto.id, cantidad: l.cantidad })),
      });
      setAviso({ tipo: "ok", texto: `Venta N° ${venta.id} registrada: ${formatPrecio(Number(venta.total))} en ${venta.medioPago}` });
      limpiarVenta();
      cargarVentas();
    } catch (err) {
      setAviso({ tipo: "error", texto: err instanceof Error ? err.message : "No se pudo registrar la venta" });
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-6">
      <VentasDeLaJornada
        datos={ventas}
        onAnular={async (venta) => {
          await anularVentaBuffet(jornada.id, venta.id);
          await cargarVentas();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        {/* ── VENTA EN CURSO ──────────────────────────────────────────── */}
        <ContenedorDatos className="h-fit xl:sticky xl:top-4">
          <Header
            titulo="Venta en curso"
            action={
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {unidades} {unidades === 1 ? "producto" : "productos"}
              </span>
            }
          />
          <div className="flex flex-col gap-6 p-6">
            {lineas.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                Tocá un producto del catálogo para sumarlo a la venta.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-[1.3fr_48px_88px_88px] gap-3 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <span>Producto</span>
                  <span className="text-center">Cant.</span>
                  <span className="text-right">Precio</span>
                  <span className="text-right">Total</span>
                </div>
                {lineas.map((l) => (
                  <ResumenOrdenItem key={l.producto.id} producto={l.producto.nombre} cantidad={l.cantidad} precioUnitario={l.precio} />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Total</span>
              <span className="text-3xl font-bold tracking-tight text-slate-900">{formatPrecio(total)}</span>
            </div>

            <div role="radiogroup" aria-label="Medio de pago" className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Medio de pago</p>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(iconoMedio) as MedioPagoBuffet[]).map((medio) => (
                  <button
                    key={medio}
                    type="button"
                    role="radio"
                    aria-checked={medioPago === medio}
                    onClick={() => setMedioPago(medio)}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      medioPago === medio
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {iconoMedio[medio]}
                    {medio}
                  </button>
                ))}
              </div>
            </div>

            {aviso && (
              <p
                role={aviso.tipo === "error" ? "alert" : "status"}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm",
                  aviso.tipo === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700",
                )}
              >
                {aviso.texto}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Btn
                variant="success"
                size="lg"
                className="justify-center gap-2"
                disabled={lineas.length === 0 || registrando}
                onClick={registrar}
              >
                <Receipt className="h-4 w-4" />
                {registrando ? "Registrando…" : "Registrar venta"}
              </Btn>
              <Btn variant="danger" size="lg" disabled={lineas.length === 0 || registrando} onClick={limpiarVenta}>
                Cancelar
              </Btn>
            </div>
          </div>
        </ContenedorDatos>

        {/* ── CATÁLOGO ────────────────────────────────────────────────── */}
        <ContenedorDatos className="h-fit">
          <Header titulo="Productos del evento" />
          <div className="flex flex-col gap-6 p-6">
            {error ? (
              <p role="alert" className="text-sm text-red-600">{error}</p>
            ) : productos === null ? (
              <p className="text-sm text-slate-500">Cargando productos…</p>
            ) : productos.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <PackageOpen className="h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-700">Este evento no tiene productos asignados</p>
                <p className="max-w-sm text-sm text-slate-500">
                  Para vender en el buffet, primero hay que asignarle productos al evento desde Administración.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div role="tablist" aria-label="Tipo de producto" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  {PESTANAS.map(({ tipo, titulo }) => {
                    const activa = pestana === tipo;
                    const enVenta = unidadesDelTipo(tipo);
                    return (
                      <button
                        key={tipo}
                        type="button"
                        role="tab"
                        aria-selected={activa}
                        onClick={() => setPestanaElegida(tipo)}
                        className={cn(
                          "flex cursor-pointer flex-col items-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                          activa ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
                        )}
                      >
                        <span>
                          {titulo} <span className="font-normal text-slate-400">({delTipo(tipo).length})</span>
                        </span>
                        <span className={cn("text-xs font-medium", enVenta > 0 ? "text-blue-600" : "text-transparent")}>
                          {enVenta > 0 ? `${enVenta} en la venta` : "·"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div role="tabpanel" aria-label={datosPestana.titulo}>
                  <CategoriaProductos
                    productos={delTipo(pestana)}
                    cantidades={cantidades}
                    onCambiarCantidad={cambiarCantidad}
                    vacio={datosPestana.vacio}
                  />
                </div>
              </div>
            )}
          </div>
        </ContenedorDatos>
      </div>
    </div>
  );
};

export default PanelVentas;
