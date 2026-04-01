// ═══════════════════════════════════════════════════════════════════════════════
// DateRange.tsx
// ═══════════════════════════════════════════════════════════════════════════════
 import { cn } from "../../../lib/cn";
/*
    Ahora DateRange acepta props desde afuera para ser controlable.
    "Controlable" significa que el padre puede manejar los valores con useState:
 
    const [desde, setDesde] = useState("");
    const [hasta, setHasta] = useState("");
    <DateRange desde={desde} hasta={hasta} onDesdeChange={setDesde} onHastaChange={setHasta} />
*/
type DateRangeProps = {
    desde?:          string;
    hasta?:          string;
    onDesdeChange?:  (value: string) => void;
    onHastaChange?:  (value: string) => void;
};
 
const DateRange = ({ desde, hasta, onDesdeChange, onHastaChange }: DateRangeProps) => {
    // Estilos compartidos para los dos inputs de fecha
    // Los definimos una sola vez para no repetirlos
    const inputStyles = cn(
        "border border-gray-300 rounded-md px-3 py-2 text-sm",
        "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none",
        "transition-colors duration-150",
        "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
    );
 
    return (
        <div className="flex gap-3 items-end">
 
            <div className="flex flex-col gap-1">
                <label htmlFor="date-desde" className="text-sm font-medium text-gray-700">
                    Desde
                </label>
                <input
                    type="date"
                    id="date-desde"
                    name="desde"
                    value={desde}
                    onChange={(e) => onDesdeChange?.(e.target.value)}
                    className={inputStyles}
                />
            </div>
 
            {/* Separador visual entre los dos campos de fecha */}
            <span className="text-gray-400 text-sm pb-2">—</span>
 
            <div className="flex flex-col gap-1">
                <label htmlFor="date-hasta" className="text-sm font-medium text-gray-700">
                    Hasta
                </label>
                <input
                    type="date"
                    id="date-hasta"
                    name="hasta"
                    value={hasta}
                    onChange={(e) => onHastaChange?.(e.target.value)}
                    className={inputStyles}
                />
            </div>
 
        </div>
    );
};
 
export default DateRange;