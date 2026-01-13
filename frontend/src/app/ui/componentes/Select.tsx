
export type Opcion = {
    label: string;
    value: string | number;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    opciones: Opcion[];
    label?: string;
    
};

const Select = ({ label, opciones, className = "", ...props }: SelectProps) => {
    return (
        <div className="flex flex-col">
            {label && <label className="text-sm font-medium mr-2">{label}</label>}
            <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" {...props}>
                {opciones.map((opcion) => (
                    <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;

        