import Btn from "../../../../ui/componentes/Btn.tsx";
import GenericTable from "../../../../ui/componentes/GenericTable/GenericTable";
import FiltroUsuarios from "../components/FiltroUsuarios";
import CrearUsuarioModal from "../modals/CrearUsuarioModal.tsx";
import EditarUsuarioModal from "../modals/EditarUsuarioModal.tsx";
import Header from "../../../../ui/componentes/Header";
import ConfirmarAccion from "../../../../ui/componentes/ConfirmarAccion";
import ContenedorDatos from "../../../../ui/componentes/ContenedorDatos";
import { useState, useEffect } from "react";
import { deleteUsuario, getUsuarios } from "../../../../services/usuariosService.ts";
import type { Usuario } from "../../../../services/usuariosService.ts";
import { columnasUsuario } from "../usuarios.columns.ts";

// ── TIPOS ────────────────────────────────────────────────────────────────────

type ModalUsuarios = "crearUsuario" | "editarUsuario" | "eliminarUsuario" | null;

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const Usuarios = () => {
    const [activarModal, setActivarModal] = useState<ModalUsuarios>(null);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [error, setError] = useState("");
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

    useEffect(() => {
        getUsuarios()
            .then((response) => {
                setUsuarios(response);
            })
            .catch(() => {
                setError("No se pudieron cargar los usuarios");
            });
    }, []);

    
    return (
        <main className=" gap-6 px-8 ">

            

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

                {error && (
                    <p className="px-6 pt-4 text-sm text-red-600">{error}</p>
                )}

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
                    columns={columnasUsuario}
                    data={usuarios}
                    actions={(row) => (
                        // flex + gap reemplaza el mr-2 hardcodeado
                        <div className="grid grid-cols-2 gap-2">
                            <Btn
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setUsuarioSeleccionado(row);
                                    setActivarModal("editarUsuario");
                                }}
                            >
                                Editar
                            </Btn>
                            <Btn
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                    setUsuarioSeleccionado(row);
                                    setActivarModal("eliminarUsuario");
                                }}
                            >
                                Eliminar
                            </Btn>
                        </div>
                    )}
                />
            </ContenedorDatos>


            {/* ── MODALES ──────────────────────────────────────────────────────── */}
            
            <CrearUsuarioModal
                isOpen={activarModal === "crearUsuario"}
                closeModal={() => setActivarModal(null)}
                onCreated={() => {
                    getUsuarios().then(setUsuarios);
                    setActivarModal(null);
                }}
            />
            <EditarUsuarioModal
                isOpen={activarModal === "editarUsuario"}
                closeModal={() => setActivarModal(null)}
                usuario={usuarioSeleccionado}
                onUpdated={() => {
                    getUsuarios().then(setUsuarios);
                    setActivarModal(null);
                }}
            />
            <ConfirmarAccion
                isOpen={activarModal === "eliminarUsuario"}
                title="Eliminar usuario"
                mensaje="Desea confirmar la eliminación del usuario"
                entidad={usuarioSeleccionado?.usuario || ""}
                onConfirmar={async () => {
                    if (!usuarioSeleccionado) return;
                    await deleteUsuario(usuarioSeleccionado.id);
                    getUsuarios().then(setUsuarios);
                    setActivarModal(null);
}}
                onCancelar={() => setActivarModal(null)}
            />
        </main>
    );
};

export default Usuarios;
                                
