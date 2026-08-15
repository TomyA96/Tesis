import Formulario from "../../../../ui/componentes/Formulario";
import Input from "../../../../ui/componentes/Input";
import Textarea from "../../../../ui/componentes/Textarea";
import Btn from "../../../../ui/componentes/Btn";
import SelectorPermisos from "../components/SelectorPermisos";
import type { Permiso } from "../../../../services/permisosService";
import { useState, type FormEvent } from "react";
import { createPerfil } from "../../../../services/perfilesService";


type CrearPerfilFormProps = {
    permisos: Permiso[];
    onCancel: () => void;
    onCreated: () => void;
};

const CrearPerfilForm = ({ permisos, onCancel, onCreated }: CrearPerfilFormProps) => {

    
    
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);
    const [error, setError] = useState("");

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (nombre.length < 3){
            setError("Ingrese un nombre valido")
            return;
        }
        if (permisosSeleccionados.length < 1){
            setError("Debe seleccionar al menos un permiso")
            return;
        }
        try{
            await createPerfil({nombre, descripcion, idsPermisos: permisosSeleccionados})
            onCreated(); 
        } catch (err){
            setError(err instanceof Error ? err.message : "Error al crear el usuario");
        }
    }
    // Sin catálogo de permisos no tiene sentido mostrar el formulario
    if (permisos.length === 0) {
        return (
            <div className="w-[46rem] max-w-[calc(100vw-4rem)] px-6 py-10 text-center">
                <p className="text-base font-semibold text-red-600">
                    No se pudieron cargar los permisos
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Volvé a intentarlo o comunicate con el administrador.
                </p>
                <Btn variant="cancel" type="button" className="mt-6" onClick={onCancel}>
                    Cerrar
                </Btn>
            </div>
        );
    }
    
    return (
        <Formulario className="w-[46rem] max-w-[calc(100vw-4rem)] gap-5" onSubmit={onSubmit}>
            <Input
                label="Nombre del perfil"
                name="nombre"
                type="text"
                placeholder="Ej: Supervisor de eventos"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />

            <Textarea
                label="Descripción"
                name="descripcion"
                rows={2}
                placeholder="Describí brevemente qué hace este perfil"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
            />

            <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-gray-700">Permisos</span>
                    <span className="text-xs text-gray-500">
                        {permisosSeleccionados.length} seleccionados
                    </span>
                </div>

                <SelectorPermisos
                    permisos={permisos}
                    seleccionados={permisosSeleccionados}
                    onChange={setPermisosSeleccionados}
                />
            </div>
            <span className="text-red-600">{error}</span>
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <Btn type="submit">Crear perfil</Btn>
                <Btn type="button" variant="cancel" onClick={onCancel}>
                    Cancelar
                </Btn>
            </div>
        </Formulario>
    );
};

export default CrearPerfilForm;
