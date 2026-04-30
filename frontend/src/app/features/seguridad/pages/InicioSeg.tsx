import Btn from "../../../ui/componentes/Btn";
import Card from "../../../ui/componentes/Card";
import GenericTable from "../../../ui/componentes/GenericTable/GenericTable";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import Header from "../../../ui/componentes/Header";
import { useNavigate } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import { Users, UserCheck, Shield, AlertTriangle } from "lucide-react";
import type { Auditoria } from "../../../../../../app/data/auditorias";
import { auditoriasMock } from "../../../../../../app/data/auditorias";
// ── TIPOS ─────────────────────────────────────────────────────────────────────
// Definís la forma del objeto fuera del JSX — más limpio y reutilizable.
// Cuando conectes el backend, este tipo ya está listo para tipar la respuesta.
type ActividadUsuario = {
    usuario: string;
    cantidadAcciones: number;
    ultimaActividad: string;
    hora: string;
};

// ── DATA DE PRUEBA ─────────────────────────────────────────────────────────────
// Separar la data del JSX hace que el componente sea más legible.
// Cuando conectes el backend, reemplazás esto por un fetch/hook.

 

const InicioSeg = () => {
    const navigate = useNavigate();
    return (
        // gap-8 separa las secciones verticalmente de forma uniforme
        <main className="flex flex-col gap-8 p-8">

            {/* ── TÍTULO PRINCIPAL ──────────────────────────────────────────── */}
            {/* Solo un h1 por página — los demás títulos son h2 */}
            <ContenedorDatos>
                <Header titulo="Panel de Seguridad"/>
            </ContenedorDatos>
            

            {/* ── CARDS DE MÉTRICAS ─────────────────────────────────────────── */}
            
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"               >
                    <Card title="Usuarios creados"    content={20} icono={<Users        className="w-5 h-5" />} colorIcono="blue"   />
                    <Card title="Usuarios activos"    content={8}  icono={<UserCheck     className="w-5 h-5" />} colorIcono="green"  />
                    <Card title="Perfiles creados"    content={8}  icono={<Shield        className="w-5 h-5" />} colorIcono="purple" />
                    <Card title="Alertas de seguridad" content={3} icono={<AlertTriangle className="w-5 h-5" />} colorIcono="orange" />
                </div>
            

            {/* ── TABLA + ACCIONES RÁPIDAS ──────────────────────────────────── */}
            
                {/* 
                    ContenedorDatos ya tiene el bg-white, rounded, shadow.
                    No hace falta repetir esos estilos acá.
                */}
                <ContenedorDatos>
                    <Header titulo="Resumen de Actividad de Usuarios" />

                    <div className="flex gap-8 p-6">

                        {/* Tabla — ocupa el espacio disponible */}
                        <div className="flex-1 min-w-0">
                            {/* 
                                Usamos camelCase en las columnas.
                                formatColumnName las convierte automáticamente:
                                "cantidadAcciones" → "Cantidad Acciones"
                            */}
                            <GenericTable<Auditoria>
                                columns={["idAuditoria", "idUsuario", "nombreUsuario", "accion", "fecha", "hora", "idEntidadAfectada", "nombreEntidadAfectada"]}
                                data={auditoriasMock}
                                actions={(_row) => (
                                    <Btn variant="outline" size="sm">
                                        Ver Actividad
                                    </Btn>
                                )}
                            />
                        </div>
                        {/* ── ACCIONES RÁPIDAS ──────────────────────────────── */}
                        {/* 
                            Separador visual — divide la tabla de las acciones.
                            border-l crea una línea vertical sutil.
                        */}
                        <div className="border-l border-gray-100 pl-8 flex flex-col gap-3  min-w-fit">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Acciones rápidas
                            </p>
                            {/* 
                                asChild no existe en tu Btn, por eso usamos Link que envuelve al Btn.
                                Alternativa: pasarle className directamente al Link.
                            */}
                            
                            <Btn size="md" className="w-full">Crear Usuario</Btn>
                        
                        
                            <Btn size="md" className="w-full">Crear Perfil</Btn>
                           

                            {/* Separador visual entre crear y ver */}
                            <hr className="border-gray-100 my-1" />

                            
                            <Btn 
                            variant="outline" 
                            size="md" 
                            className="w-full" 
                            onClick={() => navigate(RUTAS.seguridad.usuarios)}>
                                Ver Usuarios
                            </Btn>
                            
                            <Btn 
                            variant="outline" 
                            size="md" 
                            className="w-full" 
                            onClick={() => navigate(RUTAS.seguridad.perfiles)}>
                                Ver Perfiles
                            </Btn>
                            
                            
                            <Btn 
                            variant="outline" 
                            size="md" 
                            className="w-full" 
                            onClick={() => navigate(RUTAS.seguridad.auditorias,{
                                        state: { usuarioId: 1}
                                    })}
                            >
                                Ver Actividad
                            </Btn>
                            
                        </div>
                    </div>
                </ContenedorDatos>
            
            {/* ── ALERTAS ───────────────────────────────────────────────────── */}
            
                <ContenedorDatos>
                    <Header titulo="Alertas" />
                    {/* 
                        Estado vacío mientras no tenés datos reales.
                        Cuando conectes el backend, reemplazás esto.
                    */}
                    <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
                        No hay alertas activas
                    </div>
                </ContenedorDatos>
            
        </main>
    );
};

export default InicioSeg;
