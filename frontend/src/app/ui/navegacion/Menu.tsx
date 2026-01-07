
import Opcion from "./Opcion";


//Parametros que recibe el menu.
type MenuProps = {
    area: string;
    opciones: { label: string; onClick: () => void }[];
    isOpen: boolean;
    onToggle: () => void;
};

//Componente de menu para el sidebar, contiene las opciones correspondientes a cada area del sistema.
const Menu = ({area, opciones, isOpen, onToggle}: MenuProps) => {
    
    return (
        <li className=" w-full ">
            <button className="text-x1 w-full text-left font-bold p-2 pl-8 hover:bg-neutral-700 cursor-pointer" 
            onClick={onToggle}
            
            >
                {area}
                
            </button>
            { isOpen && (
                <ul className="bg-neutral-500">
                    {opciones.map((opcion, index) => (
                        <Opcion
                            key={index}
                            label={opcion.label}
                            onClick={opcion.onClick}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default Menu;