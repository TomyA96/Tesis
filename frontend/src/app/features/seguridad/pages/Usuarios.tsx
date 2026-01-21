import Btn from "../../../ui/componentes/Btn";
import GenericTable from "../../../ui/componentes/GenericTabla";
import FiltroUsuarios from "../componentes/FiltroUsuarios";
import CrearUsuarioModal from "../modales/CrearUsuarioModal";
import EditarUsuarioModal from "../modales/EditarUsuarioModal";
import Header from "../../../ui/componentes/Header";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import {useState} from "react";

type DatosProps = {
    nombre: string;
    perfil: string;
    estado: string;
    ultimoAcceso: Date;
}
type ModalUsuarios = "crearUsuario" | "editarUsuario" | "eliminarUsuario" |  null;

export default function Usuarios () {
    const [activarModal, setActivarModal] = useState<ModalUsuarios>(null);
    
    
    const DatosUsuarios: DatosProps[] = [
        { nombre: "Juan Pérez", perfil: "Admin", estado: "Activo", ultimoAcceso: new Date("2025-12-27T10:30:00") },
        { nombre: "María Gómez", perfil: "Usuario", estado: "Inactivo", ultimoAcceso: new Date("2025-12-26T18:15:00") },
        { nombre: "Carlos López", perfil: "Supervisor", estado: "Activo", ultimoAcceso: new Date("2025-12-25T09:00:00") },
        { nombre: "Lucía Fernández", perfil: "Usuario", estado: "Activo", ultimoAcceso: new Date("2025-12-24T14:45:00") },
        { nombre: "Martín Rodríguez", perfil: "Admin", estado: "Inactivo", ultimoAcceso: new Date("2025-12-23T20:10:00") },
        { nombre: "Sofía Martínez", perfil: "Supervisor", estado: "Activo", ultimoAcceso: new Date("2025-12-22T11:25:00") },
        {  nombre: "Diego Torres", perfil: "Usuario", estado: "Activo", ultimoAcceso: new Date("2025-12-21T08:55:00") },
        { nombre: "Valentina Castro", perfil: "Admin", estado: "Inactivo", ultimoAcceso: new Date("2025-12-20T16:40:00") },

    ]
    return (
        <main>  
            <Header 
                encabezado="Gestión de usuarios"
                action={
                <Btn className=" h-12 p-9" onClick={()=> setActivarModal("crearUsuario")}>
                    Crear Usuario
                </Btn>}
            />
            <div>
                <CrearUsuarioModal
                isOpen={activarModal === "crearUsuario"}
                
                closeModal={() => setActivarModal(null)}
                />
                    
                
                <EditarUsuarioModal
                isOpen={activarModal === "editarUsuario"}
                closeModal={() => setActivarModal(null)}
                />

                <ConfirmarAccion
                    isOpen={activarModal === "eliminarUsuario"}
                    title="Eliminar usuario"
                    mensaje="Desea confirmar la eliminacion del usuario"
                    entidad="Nombre Usuario"
                    onConfirmar={() => {}}
                    onCancelar={() => setActivarModal(null)}
                />  
                
            </div>
            <section>
                <div className="flex w-full gap-15 justify-center content bg-white p-6 rounded-xl shadow-md h-fit ">    
                    <div className="w-full">
                        
                        <FiltroUsuarios
                            
                            perfiles={[
                                { id: 1, nombre: "Administrador" },
                                { id: 2, nombre: "Operador" },
                                { id: 3, nombre: "Supervisor" }
                            ]}  
                            estados={[
                                { id: 1, nombre: "Activo" },
                                { id: 2, nombre: "Bloqueado" }  
                            ]}
                            onFilterChange={(filtros) => {
                                console.log("Filtros actualizados:", filtros);
                            }}
                        />
                        <GenericTable
                            columns={["nombre", "perfil", "estado", "ultimoAcceso"]}  
                            data={
                                DatosUsuarios
                            }
                            actions={(_row) => (
                                <div>
                                    <Btn size="sm" className="mr-2 min-w-20"  onClick={() => setActivarModal("editarUsuario")}>
                                        Editar
                                    </Btn>
                                    <Btn variant="danger" size="sm" className="min-w-20" onClick={() => setActivarModal("eliminarUsuario")}>
                                        Eliminar
                                    </Btn>
                                </div>
                                
                                
                            )}
                        />  
                    </div>
                </div>
            </section>
            
        </main>
    );
}   

                                