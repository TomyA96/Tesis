import { Link } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";
import escudo from "../../../../assets/escudo.png";

const EncabezadoPublico = () => {
    return (
        <header className="bg-noche border-b-4 border-sol">
            <div className="max-w-10/12 mx-auto px-8 h-16 flex items-center">
                {/* El logo y el nombre son un link para volver al inicio */}
                <Link to={RUTAS.publico.inicio} className="flex items-center gap-3">
                    <img src={escudo} alt="Escudo de El Arañado" className="h-15 w-auto" />
                    <div className="leading-tight">
                        <p className="text-white text-lg font-bold">El Arañado</p>
                        <p className="text-gray-400 text-xs">Festivales y Eventos</p>
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default EncabezadoPublico;
