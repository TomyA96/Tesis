import Formulario from "../../../../ui/componentes/Formulario";
import Input from "../../../../ui/componentes/Input";
import {CargarPermisos}  from "../utils/CargarPermisos";
import type { Permiso } from "../utils/CargarPermisos";
import React, { useState } from "react";
import Btn from "../../../../ui/componentes/Btn";

type EditarPerfilFormProps = {
    nombrePerfil: string;
    onCancel: () => void;
    id:  number;
    permisos: Permiso[];
    permisosPerfil: number[];
}

const EditarPerfilForm = ({nombrePerfil, permisos, permisosPerfil, onCancel}: EditarPerfilFormProps) => {
    const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>(permisosPerfil);
    const [cambiarNombre, setCambiarNombre] = useState(false);
    const permisosAgrupados = CargarPermisos(permisos);
    const [nuevoNombre, setNuevoNombre] = useState(nombrePerfil);
    const togglePermiso = (idPermiso: number) => {
        setPermisosSeleccionados((permisoAntes) => (
            //permisoAntes devuelve true si el idPermiso ya está en el array
            permisoAntes.includes(idPermiso)
            //permisoAntes.filter devuelve un nuevo array quitando el permiso clickeado, id 
            ? permisoAntes.filter(id => id !== idPermiso)
            //Filters recorre el array uno por uno y devuelve un nuevo array solo con los elementos que cumplan la condicion, id es el indice actual
        : [...permisoAntes, idPermiso]
        //...permisoAntes, idPermiso 
        ));
    };
   

    return (
        <Formulario className="min-w-[800px]">
            <div>
                {permisos.length > 0 ? (
                    <div className="flex flex-col gap-6 ">
                        <div className="flex items-end w-full gap-4">
                            <Input className="w-full"
                             label="Nombre del perfil" name="perfilName" 
                            value={nuevoNombre} type="text" disabled={!cambiarNombre} 
                            //Onchange evento que se dispara cuando cambia el valor del input

                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNuevoNombre(e.target.value)} 
                            //e es el evento que se dispara, e.target.value es el valor actual del input
                            />
                            <div>
                                <Input type="checkbox"  className="w-6 mb-3" checked={cambiarNombre} onChange={() => setCambiarNombre(prev => !prev)}/>
                                
                            </div>
                            
                        </div>
                        

                            <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto border p-4 rounded-md border-gray-200">

                                {Object.entries(permisosAgrupados).map(([area, permisosArea]) => (
                                    <div key={area}>
                                        <strong>{area}</strong>
                                        <ul>
                                            {permisosArea.map((permiso) => (
                                                <li className="flex gap-3 justify-start items-center" key={permiso.id}>
                                                    <Input  type="checkbox" checked={permisosSeleccionados.includes(permiso.id)}
                                                        onChange={() => togglePermiso(permiso.id)} />
                                                    <label htmlFor="">{permiso.descripcion}</label>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                <Btn type="submit">
                                    Crear Perfil
                                </Btn>
                                <Btn type="button" variant="secondary" onClick={onCancel}>
                                    Cancelar
                                </Btn>
                            </div>
                        </div>
                    
                    ) : (<div className="p-8 flex justify-center items-center text-center  text-red-500"> <h4>
                            <strong><h1 className="text-3xl mb-4">Error en la carga de datos!!!</h1> Comunicarse con el administrador...</strong></h4> 
                        </div>
                )}
            </div>
            
        </Formulario>)
     
};

export default EditarPerfilForm;
