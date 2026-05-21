import Input from "../../../../ui/componentes/Input";
import Select from "../../../../ui/componentes/Select";
import DateRange from "../../../../ui/componentes/DateRange";
import Btn from "../../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../../ui/componentes/ContenedorFiltros";
 
// ── TIPOS ──────────────────────────────────────────────────────────────────────
// Importar ResultadoAuditoria desde el archivo de tipos cuando lo tengas separado.
// Por ahora lo redefinimos localmente para que el componente sea independiente.
type ResultadoAuditoria = "t" | "f";
 
type ResultadosProp = {
    // res ahora es ResultadoAuditoria en lugar de string genérico
    // TypeScript te avisará si pasás un valor que no sea "t" o "f"
    resultado: { res: ResultadoAuditoria; label: string }[];
};
 
const FiltroAuditorias = ({ resultado }: ResultadosProp) => {
    return (
        /*
            ContenedorFiltros ya maneja el layout externo.
            Adentro usamos flex-wrap para que en pantallas chicas
            los filtros se acomoden en varias filas en lugar de comprimirse.
        */
        <ContenedorFiltros>
 
            {/*
                flex-wrap: si no hay espacio, los filtros pasan a la siguiente línea
                en lugar de comprimirse o romperse el layout
                gap-4: espacio uniforme entre todos los filtros
                flex-1: el contenedor de filtros ocupa el espacio disponible
            */}
            <div className="flex flex-wrap items-end gap-4 flex-1">
 
                {/*
                    min-w-[200px]: ancho mínimo para que el input no quede muy chico
                    flex-1: crece para ocupar el espacio disponible
                    Reemplaza el w-2/6 hardcodeado
                */}
                <div className="flex-1 min-w-[200px]">
                    <Input
                        label="Buscar"
                        placeholder="Usuario o acción realizada"
                    />
                </div>
 
                <Select
                    label="Resultado"
                    opciones={[
                        { label: "Todos", value: "" },
                        // Spread del array de resultados pasado por props
                        ...resultado.map((r) => ({
                            label: r.label,
                            value: r.res,
                        })),
                    ]}
                />
 
                <DateRange />
 
            </div>
 
            {/*
                items-end necesita un padre con flex para funcionar.
                Como ContenedorFiltros ya es flex, el botón se alinea
                al fondo automáticamente con self-end.
                self-end: alinea este elemento al fondo del contenedor flex padre.
            */}
            <Btn variant="outline" className="self-end whitespace-nowrap">
                Limpiar Filtros
            </Btn>
 
        </ContenedorFiltros>
    );
};
 
export default FiltroAuditorias;
