import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import CardEvent from "../componentes/CardEvent";
import Btn from "../../../ui/componentes/Btn";
import { useNavigate } from "react-router-dom";
import { RUTAS } from "../../../constantes/Rutas";


const InicioAdministracionPage = () => {
    const navigate = useNavigate();

    return (
        <main>
            
            
            
            <ContenedorDatos >
                <Header titulo={<h1 className="text-2xl font-semibold text-gray-800">Administración</h1>}/>
                <div className="flex">
                    <div className="flex-1 grid grid-cols-3 gap-8 p-4 ">
                        <CardEvent nombre="Concierto de Rock" estado="activo" fecha="2024-07-15" />
                        <CardEvent nombre="Feria de Tecnología" estado="suspendido" fecha="2024-08-20" />
                        <CardEvent nombre="Festival de Cine" estado="activo" fecha="2024-09-10" />
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4 border-l border-gray-100 w-fit px-8 my-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Administrar
                        </p>
                        <Btn className="w-[150px]" variant="outline" size="sm" onClick={() => navigate(RUTAS.administracion.productos)}>
                            Productos
                        </Btn>
                        <Btn className="w-[150px]" variant="outline" size="sm" onClick={() => navigate(RUTAS.administracion.proveedores)}>
                            Proveedores
                        </Btn>
                        <Btn className="w-[150px]" variant="outline" size="sm" onClick={() => navigate(RUTAS.administracion.rubros)}>
                            Rubros
                        </Btn>
                        
                    </div>
                </div>
                
            </ContenedorDatos>
            
            
        </main>
    );
};

export default InicioAdministracionPage;
