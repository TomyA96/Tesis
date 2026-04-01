import Btn from "../../../ui/componentes/Btn";
import GenericTable from "../../../ui/componentes/GenericTabla";
import FiltroUsuarios from "../componentes/FiltroUsuarios";
import CrearUsuarioModal from "../modales/CrearUsuarioModal";
import EditarUsuarioModal from "../modales/EditarUsuarioModal";
import Header from "../../../ui/componentes/Header";
import ConfirmarAccion from "../../../ui/componentes/ConfirmarAccion";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import { useState } from "react";

// ── TIPOS ─────────────────────────────────────────────────────────────────────
// "Usuario" es más claro que "DatosProps" — Props por convención
// se reserva para las propiedades que recibe un componente React.
type Usuario = {
    nombre: string;
    perfil: string;
    estado: string;
    ultimoAcceso: Date;
};

type ModalUsuarios = "crearUsuario" | "editarUsuario" | "eliminarUsuario" | null;

// ── DATA DE PRUEBA ─────────────────────────────────────────────────────────────
// Fuera del componente — es estática, no necesita estar adentro.
// Si estuviera adentro, React la recrearía en cada render innecesariamente.
// Cuando conectes el backend, reemplazás esto por un hook (ej: useUsuarios).
const usuariosData: Usuario[] = [
    { nombre: "Juan Pérez",         perfil: "Admin",      estado: "Activo",   ultimoAcceso: new Date("2025-12-27T10:30:00") },
    { nombre: "María Gómez",        perfil: "Usuario",    estado: "Inactivo", ultimoAcceso: new Date("2025-12-26T18:15:00") },
    { nombre: "Carlos López",       perfil: "Supervisor", estado: "Activo",   ultimoAcceso: new Date("2025-12-25T09:00:00") },
    { nombre: "Lucía Fernández",    perfil: "Usuario",    estado: "Activo",   ultimoAcceso: new Date("2025-12-24T14:45:00") },
    { nombre: "Martín Rodríguez",   perfil: "Admin",      estado: "Inactivo", ultimoAcceso: new Date("2025-12-23T20:10:00") },
    { nombre: "Sofía Martínez",     perfil: "Supervisor", estado: "Activo",   ultimoAcceso: new Date("2025-12-22T11:25:00") },
    { nombre: "Diego Torres",       perfil: "Usuario",    estado: "Activo",   ultimoAcceso: new Date("2025-12-21T08:55:00") },
    { nombre: "Valentina Castro",   perfil: "Admin",      estado: "Inactivo", ultimoAcceso: new Date("2025-12-20T16:40:00") },
];

const Usuarios = () => {
    const [activarModal, setActivarModal] = useState<ModalUsuarios>(null);

    return (
        <main className=" gap-6 px-8 ">

            {/* ── MODALES ───────────────────────────────────────────────────────
                Los modales se renderizan siempre pero solo se muestran cuando
                isOpen es true. Los agrupamos arriba, fuera del layout visual,
                porque no ocupan espacio en el DOM visible.
            ──────────────────────────────────────────────────────────────────── */}
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
                mensaje="¿Desea confirmar la eliminación del usuario?"
                entidad="Nombre Usuario"
                onConfirmar={() => {}}
                onCancelar={() => setActivarModal(null)}
            />

            {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────── */}
            <ContenedorDatos>
                {/* 
                    Header dentro del ContenedorDatos — así el título,
                    el botón y la tabla son una sola unidad visual cohesiva.
                */}
                <Header
                    titulo="Gestión de Usuarios"
                    action={
                        <Btn onClick={() => setActivarModal("crearUsuario")}>
                            + Crear Usuario
                        </Btn>
                    }
                />

                {/* Filtros */}
                <div className="px-6 pt-4">
                    <FiltroUsuarios
                        perfiles={[
                            { id: 1, nombre: "Administrador" },
                            { id: 2, nombre: "Operador" },
                            { id: 3, nombre: "Supervisor" },
                        ]}
                        estados={[
                            { id: 1, nombre: "Activo" },
                            { id: 2, nombre: "Bloqueado" },
                        ]}
                        onFilterChange={(filtros) => {
                            // TODO: conectar con la lógica de filtrado cuando
                            // integres el backend
                            console.log("Filtros actualizados:", filtros);
                        }}
                    />
                </div>

                {/* Tabla */}
                <GenericTable<Usuario>
                    columns={["nombre", "perfil", "estado", "ultimoAcceso"]}
                    data={usuariosData}
                    actions={(_row) => (
                        // flex + gap reemplaza el mr-2 hardcodeado
                        <div className="flex gap-2">
                            <Btn
                                size="sm"
                                variant="outline"
                                onClick={() => setActivarModal("editarUsuario")}
                            >
                                Editar
                            </Btn>
                            <Btn
                                size="sm"
                                variant="danger"
                                onClick={() => setActivarModal("eliminarUsuario")}
                            >
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>

        </main>
    );
};

export default Usuarios;
                                