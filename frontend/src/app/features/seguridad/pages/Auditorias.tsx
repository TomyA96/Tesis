import GenericTable from "../../../ui/componentes/GenericTabla";
import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import FiltroAuditorias from "../componentes/FiltroAuditorias";
 
// ── TIPOS ──────────────────────────────────────────────────────────────────────
// "t" y "f" son los valores que viene del backend (true/false simplificado)
// Usamos un tipo literal para que TypeScript nos avise si ponemos otro valor
type ResultadoAuditoria = "t" | "f";
 
type Auditoria = {
    usuario:        string;
    accionRealizada: string;
    fecha:          string;
    hora:           string;
    resultado:      ResultadoAuditoria;
};
 
// ── DATA MOCK ──────────────────────────────────────────────────────────────────
// Fuera del componente — cuando conectes el backend, reemplazás esto por un hook
// Usamos camelCase en las claves — formatColumnName las convierte automáticamente:
// "accionRealizada" → "Accion Realizada"
const auditoriasData: Auditoria[] = [
    { usuario: "Tomas",  accionRealizada: "Iniciar Sesion",   fecha: "21/11/2025", hora: "10:15", resultado: "t" },
    { usuario: "Tomas",  accionRealizada: "Crear Usuario",    fecha: "21/11/2025", hora: "10:45", resultado: "t" },
    { usuario: "Tomas",  accionRealizada: "Eliminar Usuario", fecha: "21/11/2025", hora: "10:15", resultado: "f" },
];
 
// ── BADGE DE RESULTADO ─────────────────────────────────────────────────────────
// "t" → verde (éxito), "f" → rojo (fracaso)
// Mismo patrón que BadgeEstado en Ventas y otras páginas
const BadgeResultado = ({ resultado }: { resultado: ResultadoAuditoria }) => {
    const estilos: Record<ResultadoAuditoria, string> = {
        t: "bg-emerald-100 text-emerald-700",
        f: "bg-red-100     text-red-600",
    };
 
    const etiquetas: Record<ResultadoAuditoria, string> = {
        t: "Éxito",
        f: "Fracaso",
    };
 
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[resultado]}`}>
            {etiquetas[resultado]}
        </span>
    );
};
 
// ── PÁGINA PRINCIPAL ───────────────────────────────────────────────────────────
const Auditorias = () => {
    return (
        <main className="flex flex-col gap-6 px-6">
            <ContenedorDatos>
                <Header titulo="Auditorías" />
 
                {/* Filtros con padding lateral para alinearse con la tabla */}
                <div className="px-6 pt-2 pb-4">
                    <FiltroAuditorias
                        resultado={[
                            { res: "t", label: "Éxito"   },
                            { res: "f", label: "Fracaso" },
                        ]}
                    />
                </div>
 
                {/*
                    cellRenderers: le decimos a GenericTable que la columna "resultado"
                    debe renderizar un badge en lugar de mostrar "t" o "f" como texto
                */}
                <GenericTable<Auditoria>
                    columns={["usuario", "accionRealizada", "fecha", "hora", "resultado"]}
                    data={auditoriasData}
                    cellRenderers={{
                        resultado: (val) => <BadgeResultado resultado={val} />,
                    }}
                />
            </ContenedorDatos>
        </main>
    );
};
 
export default Auditorias;

