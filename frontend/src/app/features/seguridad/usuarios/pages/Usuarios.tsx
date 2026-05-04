import Btn from "../../../../ui/componentes/Btn.tsx";
import GenericTable from "../../../../ui/componentes/GenericTable/GenericTable";
import FiltroUsuarios from "../components/FiltroUsuarios";
import CrearUsuarioModal from "../modals/CrearUsuarioModal.tsx";
import EditarUsuarioModal from "../modals/EditarUsuarioModal.tsx";
import Header from "../../../../ui/componentes/Header";
import ConfirmarAccion from "../../../../ui/componentes/ConfirmarAccion";
import ContenedorDatos from "../../../../ui/componentes/ContenedorDatos";
import { useState } from "react";
import { usuariosMock } from "../usuarios.mock.ts";
import type { Usuario } from "../usuarios.mock.ts";
import { columnasUsuario } from "../usuarios.columns.ts";

// ── TIPOS ────────────────────────────────────────────────────────────────────

type ModalUsuarios = "crearUsuario" | "editarUsuario" | "eliminarUsuario" | null;

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
                    columns={columnasUsuario}
                    data={usuariosMock}
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
                                
