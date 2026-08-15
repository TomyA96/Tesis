import type { Permiso } from "../../../../services/permisosService";
import { CargarPermisos } from "../utils/CargarPermisos";

type SelectorPermisosProps = {
    // Catálogo completo de permisos del sistema
    permisos: Permiso[];
    // Ids de los permisos que están marcados
    seleccionados: number[];
    // Avisa al formulario padre cuál es la nueva selección
    onChange: (seleccionados: number[]) => void;
};

// "usuarios" -> "Usuarios"
const tituloArea = (area: string) => area.charAt(0).toUpperCase() + area.slice(1);

const SelectorPermisos = ({ permisos, seleccionados, onChange }: SelectorPermisosProps) => {
    const permisosAgrupados = CargarPermisos(permisos);

    // Marca o desmarca un permiso individual
    const togglePermiso = (idPermiso: number) => {
        onChange(
            seleccionados.includes(idPermiso)
                ? seleccionados.filter((id) => id !== idPermiso)
                : [...seleccionados, idPermiso]
        );
    };

    // Marca o desmarca de una sola vez todos los permisos de un área
    const toggleArea = (idsArea: number[], todosMarcados: boolean) => {
        onChange(
            todosMarcados
                // Estaban todos marcados -> saco los del área y dejo el resto intacto
                ? seleccionados.filter((id) => !idsArea.includes(id))
                // Faltaba alguno -> agrego los del área (Set evita duplicados)
                : [...new Set([...seleccionados, ...idsArea])]
        );
    }; 

    return (
        <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
            {/*
                Object.entries convierte el objeto agrupado en pares [area, permisos].
                El primer map recorre las áreas (una tarjeta cada una) y el segundo
                los permisos de esa área.
            */}
            {Object.entries(permisosAgrupados).map(([area, permisosArea]) => {
                const idsArea = permisosArea.map((permiso) => permiso.id);
                const cantidadMarcados = idsArea.filter((id) => seleccionados.includes(id)).length;
                const todosMarcados = cantidadMarcados === idsArea.length;

                return (
                    <div key={area} className="rounded-lg border border-gray-200">
                        {/* Encabezado del área: nombre, contador y atajo "Todos" */}
                        <div className="flex items-center justify-between gap-2 rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-2">
                            <span className="text-sm font-semibold text-gray-700">
                                {tituloArea(area)}
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                    {cantidadMarcados}/{idsArea.length}
                                </span>
                            </span>

                            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                    checked={todosMarcados}
                                    onChange={() => toggleArea(idsArea, todosMarcados)}
                                />
                                Todos
                            </label>
                        </div>

                        {/* Permisos del área */}
                        <ul className="flex flex-col gap-0.5 p-2">
                            {permisosArea.map((permiso) => (
                                <li key={permiso.id}>
                                    {/*
                                        El label envuelve al checkbox, así se puede hacer
                                        click en toda la fila (no solo en el cuadradito).
                                    */}
                                    <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 cursor-pointer accent-blue-600"
                                            checked={seleccionados.includes(permiso.id)}
                                            onChange={() => togglePermiso(permiso.id)}
                                        />
                                        {permiso.descripcion ?? permiso.codigo}
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

export default SelectorPermisos;
