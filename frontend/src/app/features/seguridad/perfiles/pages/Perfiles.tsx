import Btn from "../../../../ui/componentes/Btn";
import Header from "../../../../ui/componentes/Header";
import GenericTable from "../../../../ui/componentes/GenericTable/GenericTable";
import FiltroPerfiles from "../components/FiltroPerfiles";
import CrearPerfilModal from "../modals/CrearPerfilModal";
import { useState } from "react";
import EditarPerfilModal from "../modals/EditarPerfilModal";
import ContenedorDatos from "../../../../ui/componentes/ContenedorDatos";
import type { Column } from "../../../../ui/componentes/GenericTable/GenericTable.types";

type ModalPerfiles = "crearPerfil" | "editarPerfil" | "eliminarPerfil" |  null;

type PerfilTabla = {
    id: number;
    perfil: string;
    areas: string;
    permisos: string;
    usuariosAsignados: number;
};

const columnasPerfiles: Column<PerfilTabla>[] = [
    { key: "perfil", label: "Perfil" },
    { key: "areas", label: "Areas" },
    { key: "permisos", label: "Permisos" },
    { key: "usuariosAsignados", label: "Usuarios asignados" },
];

const perfilesTabla: PerfilTabla[] = [
    {
        id: 1,
        perfil: "Administrador",
        areas: "Todas",
        permisos: "Todos",
        usuariosAsignados: 5,
    },
    {
        id: 2,
        perfil: "Operador",
        areas: "Eventos, Productos",
        permisos: "Crear, Editar",
        usuariosAsignados: 8,
    },
    {
        id: 3,
        perfil: "Supervisor",
        areas: "Eventos",
        permisos: "Ver",
        usuariosAsignados: 3,
    },
];

const Perfiles = () => {
    const [activarModal, setActivarModal] = useState<ModalPerfiles>(null);
    const permisosEjemplo = [
  // 🔐 Seguridad
  {
    id: 1,
    codigo: "seguridad.crearUsuario",
    descripcion: "Crear usuario",
  },
  {
    id: 2,
    codigo: "seguridad.editarUsuario",
    descripcion: "Editar usuario",
  },
  {
    id: 3,
    codigo: "seguridad.eliminarUsuario",
    descripcion: "Eliminar usuario",
  },
  {
    id: 4,
    codigo: "seguridad.crearPerfil",
    descripcion: "Crear perfil",
  },
  {
    id: 5,
    codigo: "seguridad.editarPerfil",
    descripcion: "Editar perfil",
  },

  // 🎉 Eventos
  {
    id: 6,
    codigo: "eventos.crearEvento",
    descripcion: "Crear evento",
  },
  {
    id: 7,
    codigo: "eventos.editarEvento",
    descripcion: "Editar evento",
  },
  {
    id: 8,
    codigo: "eventos.eliminarEvento",
    descripcion: "Eliminar evento",
  },

  // 💰 Finanzas
  {
    id: 9,
    codigo: "finanzas.verIngresos",
    descripcion: "Ver ingresos",
  },
  {
    id: 10,
    codigo: "finanzas.verGastos",
    descripcion: "Ver gastos",
  },
  {
    id: 11,
    codigo: "finanzas.generarBalance",
    descripcion: "Generar balance",
  },

  // 📊 Informes
  {
    id: 12,
    codigo: "informes.verReportes",
    descripcion: "Ver reportes",
  },
  {
    id: 13,
    codigo: "informes.exportarReportes",
    descripcion: "Exportar reportes",
  },
];
    return (
        <main className=" gap-6 px-8 ">  
            <CrearPerfilModal 
              isOpen={activarModal === "crearPerfil"} 
              closeModal={() => setActivarModal(null)} 
              permisos={permisosEjemplo} 
            />
            <EditarPerfilModal 
              isOpen={activarModal === "editarPerfil"} 
              closeModal={() => setActivarModal(null)} 
              nombrePerfil="Operador" id={2} 
              permisos={permisosEjemplo} 
              permisosPerfil={[1,3,6,7]} 
            />
                
                
           
            <ContenedorDatos>
                <Header titulo="Gestion de Perfiles"
                action={
                    <Btn onClick={() => setActivarModal("crearPerfil")}>
                        + Crear perfil
                    </Btn>
                }
                />
                
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
                
                <GenericTable<PerfilTabla>
                    columns={columnasPerfiles}
                    data={perfilesTabla}  
                    
                    actions={(_row) => (
                        <div>
                            <Btn size="sm" className="mr-2 min-w-20" onClick={() => setActivarModal("editarPerfil")}>
                                Editar
                            </Btn>
                            <Btn size="sm" className="min-w-20" variant="danger">
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />

                    

                            

                
            </ContenedorDatos>
        </main>
    );
};

export default Perfiles;
