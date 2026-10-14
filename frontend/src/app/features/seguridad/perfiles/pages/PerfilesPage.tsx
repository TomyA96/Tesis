import Btn from "../../../../ui/componentes/Btn";
import Header from "../../../../ui/componentes/Header";
import GenericTable from "../../../../ui/componentes/GenericTable/GenericTable";
import FiltroPerfiles from "../components/FiltroPerfiles";
import CrearPerfilModal from "../modals/CrearPerfilModal";
import { useState, useEffect } from "react";
import EditarPerfilModal from "../modals/EditarPerfilModal";
import ContenedorDatos from "../../../../ui/componentes/ContenedorDatos";
import { columnasPerfiles } from "../perfiles.column";
import type { Perfil } from "../../../../services/perfilesService";
import { deletePerfil, getPerfiles } from "../../../../services/perfilesService";
import type { Permiso  } from "../../../../services/permisosService";
import { getPermisos } from "../../../../services/permisosService";
import { arrayPermisos} from "../../../../services/permisoPerfilService";
import ConfirmarAccion from "../../../../ui/componentes/ConfirmarAccion";


type ModalPerfiles = "crearPerfil" | "editarPerfil" | "eliminarPerfil" |  null;

const Perfiles = () => {

    const [perfiles, setPerfiles] = useState<Perfil[]>([]);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState<Perfil | null>(null)
    const [permisosPerfil, setPermisosPerfil] = useState<number[]>([]);

    const [error, setError] = useState("");

    useEffect(() => {
        getPerfiles()
            .then((response) => {
                setPerfiles(response);
            })
            .catch(() => {
                setError("No se pudieron cargar los perfiles");
            });
    }, []);

    useEffect(() => {
        getPermisos()
            .then((response) => setPermisos(response))
            .catch(() => setError("No se pudieron cargar los permisos"));
    }, []);


    const [activarModal, setActivarModal] = useState<ModalPerfiles>(null);
    
    return (
        <main className=" gap-6 px-8 ">  
                
            <ContenedorDatos>
                <Header titulo="Gestion de Perfiles"
                action={
                    <Btn onClick={() => setActivarModal("crearPerfil")}>
                        + Crear perfil
                    </Btn>
                }
                />
                
                {error && (
                    <p className="px-6 pt-4 text-sm text-red-600">{error}</p>
                )}

                <div className="px-6 pt-4">
                  <FiltroPerfiles
                    areas={[
                        
                        {id: 1, nombre: "Seguridad"},
                        {id: 2, nombre: "Eventos"},
                        {id:3, nombre:"Administracion"},
                        {id:4, nombre:"Operaciones"},
                        {id:5, nombre:"Informes"}
                        
                    ]}/>
                </div>   
                
                <GenericTable<Perfil>
                    columns={columnasPerfiles}
                    data={perfiles}  
                    
                    actions={(row) => (
                        <div>
                            <Btn size="sm" className="mr-2 min-w-20" 
                              onClick={() => {
                                arrayPermisos(row.id)
                                    .then((idsPermisos) => {
                                        setPermisosPerfil(idsPermisos);
                                        setPerfilSeleccionado(row);
                                        setActivarModal("editarPerfil");
                                    })
                                    .catch(() => setError("No se pudieron cargar los permisos del perfil"));
                            }}>
                                Editar
                            </Btn>
                            <Btn size="sm" className="min-w-20" variant="danger"
                              onClick={() => {
                                setPerfilSeleccionado(row)
                                setActivarModal("eliminarPerfil")
                              }}
                            >
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />

            </ContenedorDatos>

            <CrearPerfilModal 
              isOpen={activarModal === "crearPerfil"} 
              closeModal={() => setActivarModal(null)} 
              permisos={permisos} 
              onCreated={()=>{
                getPerfiles().then(setPerfiles)
                setActivarModal(null)
              }}
            />
            <EditarPerfilModal 
              isOpen={activarModal === "editarPerfil"} 
              closeModal={() => setActivarModal(null)} 
              perfil={perfilSeleccionado}
              permisos={permisos}
              permisosPerfil={permisosPerfil}
              onUpdated={()=>{
                getPerfiles().then(setPerfiles)
                setActivarModal(null)
              }}
            />

            <ConfirmarAccion
              isOpen={activarModal === "eliminarPerfil"}
              title="Eliminar Perfil"
              mensaje="Desea eliminar el perfil"
              entidad={perfilSeleccionado?.nombre || ""}
              onCancelar={() => setActivarModal(null)}
              onConfirmar={async () => {
                if (!perfilSeleccionado) return;
                await deletePerfil(perfilSeleccionado.id);
                getPerfiles().then(setPerfiles);
                setActivarModal(null);
              }}
            />
        </main>
    );
};

export default Perfiles;
