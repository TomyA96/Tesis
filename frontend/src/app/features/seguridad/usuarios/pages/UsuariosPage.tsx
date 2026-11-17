import Btn from "../../../../ui/componentes/Btn.tsx";
import GenericTable from "../../../../ui/componentes/GenericTable/GenericTable";
import FiltroUsuarios, { aplicarFiltrosUsuarios, filtrosUsuariosVacios, type FiltrosUsuarios } from "../components/FiltroUsuarios";
import CrearUsuarioModal from "../modals/CrearUsuarioModal.tsx";
import EditarUsuarioModal from "../modals/EditarUsuarioModal.tsx";
import EncabezadoPagina from "../../../../ui/componentes/EncabezadoPagina";
import { Shield } from "lucide-react";
import ConfirmarAccion from "../../../../ui/componentes/ConfirmarAccion";
import ContenedorDatos from "../../../../ui/componentes/ContenedorDatos";
import { useState, useEffect, useMemo } from "react";
import { deleteUsuario, getUsuarios } from "../../../../services/usuariosService.ts";
import type { Usuario } from "../../../../services/usuariosService.ts";
import { columnasUsuario } from "../usuarios.columns.ts";
import { getPerfiles, type Perfil } from "../../../../services/perfilesService.ts";

// ── TIPOS ────────────────────────────────────────────────────────────────────

type ModalUsuarios = "crearUsuario" | "editarUsuario" | "eliminarUsuario" | null;

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const UsuariosPage = () => {
    const [activarModal, setActivarModal] = useState<ModalUsuarios>(null);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [error, setError] = useState("");
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [perfiles, setPerfiles] = useState<Perfil[]>([]);
    const [filtros, setFiltros] = useState<FiltrosUsuarios>(filtrosUsuariosVacios);


    useEffect(() => {
        getUsuarios()
            .then((response) => {
                setUsuarios(response);
            })
            .catch(() => {
                setError("No se pudieron cargar los usuarios.");
            });
    }, []);

    useEffect(() => {
        getPerfiles()
            .then((response) => {
                setPerfiles(response);
            })
            .catch(() => {
                setError("No se pudieron cargar los perfiles.");
            });
    }, []);
    
    const usuariosFiltrados = useMemo(
        () => aplicarFiltrosUsuarios(usuarios, filtros),
        [usuarios, filtros]
    );
    console.log(usuarios)
  
    
    return (
        <main className="flex flex-col gap-6 px-6 pb-8">
            <EncabezadoPagina
                icono={<Shield />}
                seccion="Seguridad"
                titulo="Usuarios"
                acciones={
                    <Btn onClick={() => setActivarModal("crearUsuario")}>
                        + Crear Usuario
                    </Btn>
                }
            />

            {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────── */}
            <ContenedorDatos>

                {error && (
                    <p className="px-6 pt-4 text-sm text-red-600">{error}</p>
                )}

                {/* Filtros */}
                <div className="px-6 pt-4">
                    <FiltroUsuarios
                        filtros={filtros}
                        onChange={setFiltros}
                        perfiles={perfiles}
                    />
                </div>

                {/* Tabla */}
                <GenericTable<Usuario>
                    columns={columnasUsuario}
                    data={usuariosFiltrados}
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
                perfiles={perfiles}
                onCreated={() => {
                    getUsuarios().then(setUsuarios);
                    setActivarModal(null);
                }}
            />
            <EditarUsuarioModal
                isOpen={activarModal === "editarUsuario"}
                closeModal={() => setActivarModal(null)}
                usuario={usuarioSeleccionado}
                perfiles={perfiles}
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

export default UsuariosPage;
                                
