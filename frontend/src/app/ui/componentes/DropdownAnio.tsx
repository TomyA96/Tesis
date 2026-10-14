type DropdownAnioProps = {
    años: number[];
    value: number;
    onChange: (anio: number) => void;
};

const DropdownAnio = ({ años, value, onChange }: DropdownAnioProps) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
                Año:
            </span>
            <select
                id="selector-anio"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
            >
                {años.map((opcion) => (
                    <option key={opcion} value={opcion}>{opcion}</option>
                ))}
            </select>
        </div>
    );
};

export default DropdownAnio;
