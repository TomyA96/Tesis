import Formulario from "../../../ui/componentes/Formulario";
import Btn from "../../../ui/componentes/Btn";
import Etiqueta from "../../../ui/componentes/Etiqueta";
import { useState, type FormEvent } from "react";
import {
    TIPOS_PRODUCTO,
    asignarProductosEvento,
    type Producto,
    type TipoProducto,
} from "../../../services/productosService";
import { colorTipoProducto } from "../productos.columns";
import { formatPrecio } from "../../../utils/formatoPrecio";

type SeleccionarProductosFormProps = {
    idEvento: number;
    // Catálogo completo de productos del sistema
    productos: Producto[];
    // Productos que el evento ya tiene asignados
    asignados: Producto[];
    onCancel: () => void;
    onSaved: () => void;
};

const titulosTipo: Record<TipoProducto, string> = {
    Comida: "Comidas",
    Bebida: "Bebidas",
};

/*
    Mismo patrón que SelectorRubros: una tarjeta por tipo, con contador y atajo
    "Todos". Se muestran los productos disponibles y, además, los que ya estaban
    asignados aunque hoy estén descontinuados, así se pueden destildar.
*/
const SeleccionarProductosForm = ({ idEvento, productos, asignados, onCancel, onSaved }: SeleccionarProductosFormProps) => {
    const idsAsignados = asignados.map((producto) => producto.id);
    const [seleccionados, setSeleccionados] = useState<number[]>(idsAsignados);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    const opciones = productos.filter(
        (producto) => producto.estado === "Disponible" || idsAsignados.includes(producto.id),
    );

    const toggleProducto = (idProducto: number) => {
        setSeleccionados((prev) =>
            prev.includes(idProducto) ? prev.filter((id) => id !== idProducto) : [...prev, idProducto],
        );
    };

    const toggleTipo = (idsTipo: number[], todosMarcados: boolean) => {
        setSeleccionados((prev) =>
            todosMarcados
                ? prev.filter((id) => !idsTipo.includes(id))
                : [...new Set([...prev, ...idsTipo])],
        );
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setGuardando(true);
        try {
            await asignarProductosEvento(idEvento, seleccionados);
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar la lista de productos");
        } finally {
            setGuardando(false);
        }
    };

    // Sin productos para elegir no hay nada que armar
    if (opciones.length === 0) {
        return (
            <div className="w-[40rem] max-w-[calc(100vw-4rem)] px-6 py-10 text-center">
                <p className="text-base font-semibold text-red-600">
                    {productos.length === 0
                        ? "No existen productos cargados en el sistema"
                        : "No hay productos disponibles para asignar"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Cargá productos desde Administración → Productos para poder armar la lista del evento.
                </p>
                <Btn variant="cancel" type="button" className="mt-6" onClick={onCancel}>
                    Cerrar
                </Btn>
            </div>
        );
    }

    return (
        <Formulario className="w-[44rem] max-w-[calc(100vw-4rem)] gap-5" onSubmit={onSubmit}>
            <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-700">Productos que se venden en el evento</span>
                <span className="text-xs text-gray-500">{seleccionados.length} seleccionados</span>
            </div>

            <div className="grid max-h-96 grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                {TIPOS_PRODUCTO.map((tipo) => {
                    const productosTipo = opciones.filter((producto) => producto.tipo === tipo);
                    const idsTipo = productosTipo.map((producto) => producto.id);
                    const cantidadMarcados = idsTipo.filter((id) => seleccionados.includes(id)).length;
                    const todosMarcados = idsTipo.length > 0 && cantidadMarcados === idsTipo.length;

                    return (
                        <div key={tipo} className="rounded-lg border border-gray-200">
                            {/* Encabezado del tipo: etiqueta de color, contador y atajo "Todos" */}
                            <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-2">
                                <span className="flex items-center gap-2">
                                    <Etiqueta color={colorTipoProducto[tipo]}>{titulosTipo[tipo]}</Etiqueta>
                                    <span className="text-xs text-gray-500">
                                        {cantidadMarcados}/{idsTipo.length}
                                    </span>
                                </span>

                                {idsTipo.length > 0 && (
                                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 cursor-pointer accent-blue-600"
                                            checked={todosMarcados}
                                            onChange={() => toggleTipo(idsTipo, todosMarcados)}
                                        />
                                        Todos
                                    </label>
                                )}
                            </div>

                            {productosTipo.length === 0 ? (
                                <p className="px-3 py-6 text-center text-sm text-gray-400">
                                    No hay {titulosTipo[tipo].toLowerCase()} disponibles
                                </p>
                            ) : (
                                <ul className="flex flex-col gap-0.5 p-2">
                                    {productosTipo.map((producto) => (
                                        <li key={producto.id}>
                                            {/* El label envuelve al checkbox: se puede hacer click en toda la fila */}
                                            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                                    checked={seleccionados.includes(producto.id)}
                                                    onChange={() => toggleProducto(producto.id)}
                                                />
                                                <span className="flex-1 truncate">{producto.nombre}</span>
                                                {producto.estado === "Descontinuado" && (
                                                    <Etiqueta color="gris">Descontinuado</Etiqueta>
                                                )}
                                                <span className="tabular-nums text-gray-500">
                                                    {formatPrecio(Number(producto.precio))}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <Btn type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar Lista"}
                </Btn>
                <Btn variant="cancel" type="button" onClick={onCancel}>
                    Cancelar
                </Btn>
            </div>
        </Formulario>
    );
};

export default SeleccionarProductosForm;
