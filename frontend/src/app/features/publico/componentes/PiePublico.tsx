import escudo from "../../../../assets/escudo.png";

const PiePublico = () => {
    return (
        <footer className="bg-noche text-gray-400">
            <div className="max-w-10/12 mx-auto px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center sm:items-start gap-2">
                    <div className="flex items-center gap-3">
                        <img src={escudo} alt="Escudo de El Arañado" className="h-30 w-auto" />
                        <div className="leading-tight">
                            <p className="text-white font-semibold">El Arañado</p>
                            <p className="text-xs">Festivales y Eventos</p>
                        </div>
                    </div>
                    <p className="text-xs">© {new Date().getFullYear()} El Arañado. Todos los derechos reservados.</p>
                </div>
                

                {/* Datos de contacto: se suman cuando los tengas definidos */}
                <div>
                    <strong>Datos de contacto</strong>
                    <p><strong> Teléfono: </strong> +54 3533437131</p>
                    <p><strong> Email: </strong> tomya2196@gmail.com</p>


                    
                </div>
                
            </div>
        </footer>
    );
};

export default PiePublico;
