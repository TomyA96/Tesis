import GenericTable from "../../../ui/componentes/GenericTabla";
import Header from "../../../ui/componentes/Header";
import FiltroAuditorias from "../componentes/FiltroAuditorias";

export default function Auditorias () {
    return(
        <main>
            <section>
                <Header title="Auditorias"
                
                />
            </section>
            <section>
                <div className=" w-full gap-15 justify-center content bg-white p-6 rounded-xl shadow-md h-fit ">
                    <FiltroAuditorias
                    resultado={[
                        {res:"t", label:"Exito"},
                        {res:"f", label:"Fracaso"}

                    ]}/>
                    <GenericTable
                    columns={["Usuario", "Accion Realizada", "Fecha", "Hora", "Resultado"]}
                    data={[{
                        "Usuario": "Toams",
                        "Accion Realizada": "Iniciar Sesion",
                        "Fecha": "21/11/2025",
                        "Hora":"10:15",
                        "Resultado": "Exito"
                    },
                    {
                        "Usuario": "Tomas",
                        "Accion Realizada": "Crear Usuario",
                        "Fecha": "21/11/2025",
                        "Hora":"10:45",
                        "Resultado": "Exito"
                    },
                    {
                        "Usuario": "Toams",
                        "Accion Realizada": "Eliminar Usuario",
                        "Fecha": "21/11/2025",
                        "Hora":"10:15",
                        "Resultado": "Fracaso"
                    }]}
                    />
                </div>
                
            </section>


                
        </main>
    );
}

