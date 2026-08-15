import { TIPOS_RUBRO, type Rubro, type TipoRubro } from "../../../services/rubrosService";
import { colorTipoRubro } from "../rubros.columns";
import Etiqueta from "../../../ui/componentes/Etiqueta";

type SelectorRubrosProps = {
    // Catálogo completo de rubros del sistema
    rubros: Rubro[];
    // Ids de los rubros que están marcados
    seleccionados: number[];
    // Avisa al formulario padre cuál es la nueva selección
    onChange: (seleccionados: number[]) => void;
};

/*
    Mismo patrón que SelectorPermisos, pero agrupando por tipo de rubro en vez de
    por área. Un proveedor puede trabajar en más de un rubro (ej: te vende bebidas
    y además te alquila equipamiento), por eso son checkboxes y no un select.
*/
const SelectorRubros = ({ rubros, seleccionados, onChange }: SelectorRubrosProps) => {
    // Marca o desmarca un rubro individual
    const toggleRubro = (idRubro: number) => {
        onChange(
            seleccionados.includes(idRubro)
                ? seleccionados.filter((id) => id !== idRubro)
                : [...seleccionados, idRubro]
        );
    };

    // Marca o desmarca de una sola vez todos los rubros de un tipo
    const toggleTipo = (idsTipo: number[], todosMarcados: boolean) => {
        onChange(
            todosMarcados
                // Estaban todos marcados -> saco los del tipo y dejo el resto intacto
                ? seleccionados.filter((id) => !idsTipo.includes(id))
                // Faltaba alguno -> agrego los del tipo (Set evita duplicados)
                : [...new Set([...seleccionados, ...idsTipo])]
        );
    };

    return (
        <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-3">
            {/*
                Recorremos los tipos en orden fijo (Ingreso, Gasto, Mixto) y por
                cada uno filtramos sus rubros. Si un tipo no tiene ninguno, no
                dibujamos la tarjeta vacía.
            */}
            {TIPOS_RUBRO.map((tipo: TipoRubro) => {
                const rubrosTipo = rubros.filter((rubro) => rubro.tipo === tipo);
                if (rubrosTipo.length === 0) return null;

                const idsTipo = rubrosTipo.map((rubro) => rubro.id);
                const cantidadMarcados = idsTipo.filter((id) => seleccionados.includes(id)).length;
                const todosMarcados = cantidadMarcados === idsTipo.length;

                return (
                    <div key={tipo} className="rounded-lg border border-gray-200">
                        {/* Encabezado del tipo: etiqueta de color, contador y atajo "Todos" */}
                        <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-2">
                            <span className="flex items-center gap-2">
                                <Etiqueta color={colorTipoRubro[tipo]}>{tipo}</Etiqueta>
                                <span className="text-xs text-gray-500">
                                    {cantidadMarcados}/{idsTipo.length}
                                </span>
                            </span>

                            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                    checked={todosMarcados}
                                    onChange={() => toggleTipo(idsTipo, todosMarcados)}
                                />
                                Todos
                            </label>
                        </div>

                        {/* Rubros de ese tipo */}
                        <ul className="flex flex-col gap-0.5 p-2">
                            {rubrosTipo.map((rubro) => (
                                <li key={rubro.id}>
                                    {/*
                                        El label envuelve al checkbox, así se puede hacer
                                        click en toda la fila (no solo en el cuadradito).
                                    */}
                                    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 cursor-pointer accent-blue-600"
                                            checked={seleccionados.includes(rubro.id)}
                                            onChange={() => toggleRubro(rubro.id)}
                                        />
                                        {rubro.nombre}
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
};

export default SelectorRubros;
