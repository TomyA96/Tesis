import Btn from "../../../ui/componentes/Btn";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import LoteEntrada from "./LoteEntrada";
import CrearEntradaModal from "../modales/EntradaModal";
import { useState } from "react";

// ── TIPOS ──────────────────────────────────────────────────────────────────────
// Importar desde LoteEntrada si los exportás desde ahí,
// o redefinirlos acá si este es el punto de entrada de los datos
type TipoEntrada = "online" | "fisica";
type EstadoLote  = "borrador" | "publicado" | "deshabilitado";

type Lote = {
    id:        string;
    nombre:    string;
    cantidadVendida:  number;
    cantidadTotal: number;
    precio:    number;
    estado:    EstadoLote;
    tipoEntrada: TipoEntrada;
};

type ListaEntradasProps = {
    // El padre pasa los lotes — este componente solo los muestra
    lotes?: Lote[];
};

// ── TIPO DE MODAL ──────────────────────────────────────────────────────────────
// Mismo patrón que el resto del sistema
type ModalEntradas = "crearEntrada" | null;

// ── DATA MOCK ──────────────────────────────────────────────────────────────────
// Fuera del componente — cuando el padre pase lotes reales, esto desaparece
const lotesMock: Lote[] = [
    { id: "lot-1", nombre: "Generales 1",  cantidadVendida: 10, cantidadTotal: 100, precio: 6000,  estado: "publicado", tipoEntrada: "online" },
    { id: "lot-2", nombre: "Generales 2",  cantidadVendida: 5,  cantidadTotal: 50,  precio: 6000,  estado: "publicado", tipoEntrada: "online" },
    { id: "lot-3", nombre: "VIP",          cantidadVendida: 2,  cantidadTotal: 20,  precio: 12000, estado: "publicado", tipoEntrada: "online" },
    { id: "lot-4", nombre: "Estudiante",   cantidadVendida: 15, cantidadTotal: 150, precio: 3000,  estado: "publicado", tipoEntrada: "online" },
];

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────
const ListaEntradas = ({ lotes = lotesMock }: ListaEntradasProps) => {
    // Mismo patrón que el resto del sistema
    const [modalActivo, setModalActivo] = useState<ModalEntradas>(null);

    return (
        <>
            {/* ── MODAL ─────────────────────────────────────────────────────────
                Arriba, fuera del layout visual — igual que en todas las páginas
            ──────────────────────────────────────────────────────────────────── */}
            <CrearEntradaModal
                isOpen={modalActivo === "crearEntrada"}
                closeModal={() => setModalActivo(null)}
            />

            <ContenedorDatos>
                <Header
                    titulo="Lista de Entradas"
                    action={
                        <Btn onClick={() => setModalActivo("crearEntrada")}>
                            + Agregar Entrada
                        </Btn>
                    }
                />

                {/* ── LISTA DE LOTES ─────────────────────────────────────────── */}
                {lotes.length === 0 ? (
                    // Estado vacío — mismo patrón que GenericTable
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                        No hay entradas configuradas para este evento
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-6 pt-2">
                        {lotes.map((lote) => (
                            <LoteEntrada
                                key={lote.id}
                                nombre={lote.nombre}
                                cantidadVendida={lote.cantidadVendida}
                                cantidadTotal={lote.cantidadTotal}
                                precio={lote.precio}
                                estado={lote.estado}
                                tipoEntrada={lote.tipoEntrada}
                                // Los callbacks por ahora vacíos — cuando conectes
                                // el backend los completás con las llamadas a la API
                                onEditar={()    => {}}
                                onEliminar={()  => {}}
                                onPublicar={()  => {}}
                                onImprimir={()  => {}}
                            />
                        ))}
                    </div>
                )}
            </ContenedorDatos>
        </>
    );
};

export default ListaEntradas;