import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import GenericTable from "../../../ui/componentes/GenericTabla";
import Btn from "../../../ui/componentes/Btn";
import ListarProductosEvento from "../componentes/ListarProductosEvento";
import { useState } from "react";
import GastoModal from "../modales/GastoModal";
import IngresoModal from "../modales/IngresoModal";
import ModificarListaModal from "../modales/ModificarListaModal";
import { CalendarDays } from "lucide-react";

// ── TIPOS ──────────────────────────────────────────────────────────────────────
type Estado    = "activo" | "suspendido";
type Categoria = "comida" | "bebida";

type EventoPageProps = {
    nombre: string;
    fecha:  string;
    estado: Estado;
};

type ProductosProps = {
    id:        string;
    nombre:    string;
    categoria: Categoria;
    precio:    number;
};

type GastoEvento = {
    id:          string;
    fecha:       string;
    proveedor:   string;
    rubro:       string;
    descripcion: string;
    monto:       number;
};

type IngresoEvento = {
    id:          string;
    fecha:       string;
    concepto:    string;
    descripcion: string;
    monto:       number;
};

// ── UN SOLO TIPO DE MODAL ──────────────────────────────────────────────────────
// En lugar de 4 estados separados, uno solo controla todos los modales.
// Mismo patrón que Usuarios.tsx y otras páginas del sistema.
type ModalAdministrar =
    | "nuevoGasto"
    | "nuevoIngreso"
    | "modificarLista"
    | null;

// ── DATA MOCK ──────────────────────────────────────────────────────────────────
// Fuera del componente — no se recrea en cada render
const productos: ProductosProps[] = [
    { id: "prod-001", nombre: "Jarra de Fernet",      categoria: "bebida", precio: 6000 },
    { id: "prod-002", nombre: "Hamburguesa Completa",  categoria: "comida", precio: 4500 },
    { id: "prod-003", nombre: "Gaseosa 500ml",         categoria: "bebida", precio: 2000 },
];

const ingresosEvento: IngresoEvento[] = [
    { id: "ing-001", fecha: "2024-05-05", concepto: "Publicidad", descripcion: "Banner marca de bebidas",  monto: 150000 },
    { id: "ing-002", fecha: "2024-05-08", concepto: "Sponsor",    descripcion: "Aporte empresa local",     monto: 200000 },
];

const gastosEvento: GastoEvento[] = [
    { id: "gasto-001", fecha: "2024-05-10", proveedor: "Sonido Pro",      rubro: "Sonido",       descripcion: "Alquiler de equipos de sonido",  monto: 120000 },
    { id: "gasto-002", fecha: "2024-05-12", proveedor: "Luces Stage",     rubro: "Iluminación",  descripcion: "Iluminación escenario principal", monto: 80000  },
    { id: "gasto-003", fecha: "2024-05-15", proveedor: "Seguridad Norte", rubro: "Seguridad",    descripcion: "Personal de seguridad",           monto: 60000  },
];

// ── BADGE DE ESTADO ────────────────────────────────────────────────────────────
// Mismo patrón que en CardEvent y Ventas
const BadgeEstado = ({ estado }: { estado: Estado }) => {
    const estilos: Record<Estado, string> = {
        activo:     "bg-emerald-100 text-emerald-700",
        suspendido: "bg-amber-100   text-amber-700",
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[estado]}`}>
            {estado === "activo" ? "Activo" : "Suspendido"}
        </span>
    );
};

// ── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────────
const AdministrarEvento = ({
    nombre = "Evento1",
    fecha  = "2024/05/21",
    estado = "activo",
}: EventoPageProps) => {

    // Un solo estado para todos los modales — consistente con el resto del sistema
    const [modalActivo, setModalActivo] = useState<ModalAdministrar>(null);

    return (
        <main className="flex flex-col gap-6 p-8">

            {/* ── MODALES ─────────────────────────────────────────────────────
                Agrupados arriba, fuera del layout visual.
                Se renderizan siempre pero solo se muestran cuando isOpen es true.
            ──────────────────────────────────────────────────────────────────── */}
            <GastoModal
                isOpen={modalActivo === "nuevoGasto"}
                closeModal={() => setModalActivo(null)}
                modo="crear"
            />
            <IngresoModal
                isOpen={modalActivo === "nuevoIngreso"}
                closeModal={() => setModalActivo(null)}
                modo="crear"
            />
            <ModificarListaModal
                isOpen={modalActivo === "modificarLista"}
                closeModal={() => setModalActivo(null)}
            />

            {/* ── HEADER DEL EVENTO ───────────────────────────────────────────
                En lugar de pasar JSX al prop titulo, usamos el action
                para el badge y la fecha — Header maneja el h1 internamente.
            ──────────────────────────────────────────────────────────────────── */}
            <ContenedorDatos>
                <Header
                    titulo={nombre}
                    action={
                        <div className="flex items-center gap-3">
                            {/* Fecha con ícono */}
                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                <CalendarDays className="w-4 h-4" />
                                <span>{fecha}</span>
                            </div>
                            <BadgeEstado estado={estado} />
                        </div>
                    }
                />
            </ContenedorDatos>

            {/* ── LAYOUT PRINCIPAL ────────────────────────────────────────────
                lg:flex-row: en pantallas grandes van lado a lado
                flex-col: en pantallas chicas se apilan verticalmente
                Reemplaza el w-3/5 / w-2/5 hardcodeado que no era responsive
            ──────────────────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* ── COLUMNA IZQUIERDA: GASTOS + INGRESOS ──────────────────── */}
                {/*
                    flex-1: ocupa el espacio disponible
                    min-w-0: permite que se encoja correctamente
                */}
                <div className="flex flex-col gap-6 flex-1 min-w-0">

                    {/* GASTOS */}
                    <ContenedorDatos>
                        <Header
                            titulo="Gastos"
                            action={
                                <Btn size="sm" onClick={() => setModalActivo("nuevoGasto")}>
                                    + Gasto
                                </Btn>
                            }
                        />
                        <GenericTable<GastoEvento>
                            columns={["fecha", "proveedor", "rubro", "descripcion", "monto"]}
                            data={gastosEvento}
                            actions={(_row) => (
                                <div className="flex gap-2">
                                    <Btn variant="outline" size="sm">Modificar</Btn>
                                    <Btn variant="danger"  size="sm">Eliminar</Btn>
                                </div>
                            )}
                        />
                    </ContenedorDatos>

                    {/* INGRESOS */}
                    <ContenedorDatos>
                        <Header
                            titulo="Ingresos"
                            action={
                                <Btn size="sm" onClick={() => setModalActivo("nuevoIngreso")}>
                                    + Ingreso
                                </Btn>
                            }
                        />
                        <GenericTable<IngresoEvento>
                            columns={["fecha", "concepto", "descripcion", "monto"]}
                            data={ingresosEvento}
                            actions={(_row) => (
                                <div className="flex gap-2">
                                    <Btn variant="outline" size="sm">Modificar</Btn>
                                    <Btn variant="danger"  size="sm">Eliminar</Btn>
                                </div>
                            )}
                        />
                    </ContenedorDatos>

                </div>

                {/* ── COLUMNA DERECHA: PRODUCTOS ────────────────────────────── */}
                {/*
                    lg:w-80: ancho fijo en pantallas grandes
                    w-full: ancho completo en móvil
                    Reemplaza el w-2/5 hardcodeado
                */}
                <div className="w-full lg:w-80">
                    <ContenedorDatos>
                        <Header
                            titulo="Lista de Productos"
                            action={
                                <Btn
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setModalActivo("modificarLista")}
                                >
                                    Modificar lista
                                </Btn>
                            }
                        />
                        <div className="p-4">
                            <ListarProductosEvento items={productos} />
                        </div>
                    </ContenedorDatos>
                </div>

            </div>
        </main>
    );
};

export default AdministrarEvento;