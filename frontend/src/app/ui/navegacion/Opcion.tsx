
type OpcionProps = {
    label: string;
    onClick: () => void;
};
//Componente para integrar en menu, funciona como opcion seleccionable accediendo a una pantalla del sistema
const Opcion = ({ label, onClick }: OpcionProps) => {
    return (
        //Estilo de la opcion en el sidebar
        <li className="cursor-pointer hover:bg-neutral-700 p-1 text-sm"
        //Parametros de la opcion
        onClick={onClick}>
            <span className="ml-10">{label}</span>
        </li>
    );
}

export default Opcion;

