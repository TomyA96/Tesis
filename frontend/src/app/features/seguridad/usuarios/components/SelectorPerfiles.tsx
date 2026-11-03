import type { Perfil } from "../../../../services/perfilesService";

type SelectorPerfilesProps = {
    // Catálogo completo de perfiles del sistema
    perfiles: Perfil[];
    // undefined = el usuario no activó la asignación (no se tocan los perfiles)
    // number[]  = asignación activada; puede ser [] (ninguno marcado)
    seleccionados: number[] | undefined;
    // Avisa al formulario padre cuál es la nueva selección (o undefined al desactivar)
    onChange: (seleccionados: number[] | undefined) => void;
    // Ids con los que arranca la selección al activar (en editar: los perfiles actuales)
    inicial?: number[];
};

const SelectorPerfiles = ({ perfiles, seleccionados, onChange, inicial = [] }: SelectorPerfilesProps) => {
    const activo = seleccionados !== undefined;

    // Activa o desactiva la asignación de perfiles
    const toggleActivo = () => {
        onChange(activo ? undefined : inicial);
    };

    // Marca o desmarca un perfil individual
    const togglePerfil = (idPerfil: number) => {
        // Solo se llama con la asignación activa, por eso seleccionados no es undefined
        const actuales = seleccionados ?? [];
        onChange(
            actuales.includes(idPerfil)
                ? actuales.filter((id) => id !== idPerfil)
                : [...actuales, idPerfil]
        );
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Click para activar: mientras esté apagado, los perfiles no se envían */}
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-blue-600"
                    checked={activo}
                    onChange={toggleActivo}
                />
                Asignar perfiles
            </label>

            {activo && (
                <ul className="flex max-h-48 flex-col gap-0.5 overflow-y-auto rounded-lg border border-gray-200 p-2">
                    {perfiles.length === 0 && (
                        <li className="px-2 py-1.5 text-sm text-gray-500">No hay perfiles creados</li>
                    )}
                    {perfiles.map((perfil) => (
                        <li key={perfil.id}>
                            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 cursor-pointer accent-blue-600"
                                    checked={seleccionados.includes(perfil.id)}
                                    onChange={() => togglePerfil(perfil.id)}
                                />
                                {perfil.nombre}
                            </label>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SelectorPerfiles;
