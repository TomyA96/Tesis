import Formulario from "../../../../ui/componentes/Formulario";
import Input from "../../../../ui/componentes/Input";
import Btn from "../../../../ui/componentes/Btn";
import {CargarPermisos}  from "../utils/CargarPermisos";
import type { Permiso } from "../utils/CargarPermisos";



type CrearPerfilFormProps = {
    permisos: Permiso[];
    onCancel: () => void;
}
//funcion para agrupar los permisos por area



const CrearPerfilForm = ({permisos, onCancel}:CrearPerfilFormProps) => {
    const permisosAgrupados = CargarPermisos(permisos);
    return (
        <Formulario className="min-w-[800px]" >
            
            <div className="">
                {permisos.length > 0 ? (
                    
                <div className="flex flex-col gap-6">
                    <Input label="Nombre del perfil" name="perfilname" placeholder="Introduzca el nombre del perfil" type="text" required />
                    <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto border p-4 rounded-md border-gray-200">
                        {/*Object.entries convierte el objeto en un array de arrays con clave y valor.
                        el primer map es para recorrer las areas y en el segundo recorro cada permiso que corresponda
                        al area del objeto */}

                        {Object.entries(permisosAgrupados).map(([area, permisosArea]) => (
                            <div key={area}>
                                <h4>
                                    <strong>{area.toUpperCase()}</strong>
                                </h4>
                                <ul>
                                    {permisosArea.map((permiso) => (
                                        <li className="flex gap-3 justify-start items-center" key={permiso.id}>
                                            <Input  type="checkbox" /><label htmlFor="">{permiso.descripcion}</label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <Btn type="submit">
                        Crear Perfil
                    </Btn>
                    <Btn type="button" variant="secondary" onClick={onCancel}>
                        Cancelar
                    </Btn>
                </div>) : (<div className="p-8 flex justify-center items-center text-center  text-red-500"> <h4>
                    <strong><h1 className="text-3xl mb-4">Error en la carga de datos!!!</h1> Comunicarse con el administrador...</strong></h4> </div>)
                
                }
            </div>
            
        </Formulario>
    );
}

export default CrearPerfilForm;
