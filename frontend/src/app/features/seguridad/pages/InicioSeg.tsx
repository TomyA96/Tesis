
import Btn from "../../../ui/componentes/Btn";
import Card from "../../../ui/componentes/Card";
import GenericTable from "../../../ui/componentes/GenericTabla";


export default function InicioSeg () {
    return (
        <main>
            <h1 className="font-bold text-3xl p-9">Panel de Seguridad</h1>
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-10 w-full  justify-items-center">
                <Card title="Usuarios creados" content={20}/>
                <Card title="Usuarios activos" content={8}/>
                <Card title="Perfiles creados" content={8}/>
                <Card title="Usuarios bloqueados" content={8}/>
            </section>
            <section>
                <div className="flex w-full  justify-between content bg-white p-8 rounded-xl shadow-md h-fit ">
                    <div className="w-6/8">
                    <h1 className="font-bold text-2xl mb-4">
                        Resumen de Actividad de Usuarios
                    </h1>
                        <GenericTable
                    columns={["Usuario", "Cantidad de acciones", "Ultima actividad", "Hora"]}
                    data={[
                        {
                        Usuario: "Andres Gomez",
                        "Cantidad de acciones": "6",
                        "Ultima actividad": "Crear evento",
                        Hora: "15:50"
                        },
                        {
                        Usuario: "Juan Arguello",
                        "Cantidad de acciones": "6",
                        "Ultima actividad": "Crear evento",
                        Hora: "20:10"
                        },
                        {
                        Usuario: "Toams Arroyo",
                        "Cantidad de acciones": "2",
                        "Ultima actividad": "Crear producto",
                        Hora: "09:30"
                        },
                        {
                        Usuario: "Valentin Diaz",
                        "Cantidad de acciones": "6",
                        "Ultima actividad": "Registrar compra",
                        Hora: "12:15"
                        },
                    ]}
                    actions={(_row) => (
                        <Btn variant="primary" size="sm">
                        Ver Actividad
                        </Btn>
                    )}
                    />
                    </div>
                    
                    <div className="flex flex-col gap-4  ">
                        <Btn size="lg">
                            Crear Usuario
                        </Btn>
                        <Btn size="lg">
                            Crear Perfil
                        </Btn>
                        
                        <Btn size="lg">
                            Ver Usuarios
                        </Btn>
                        <Btn size="lg">
                            Ver Perfiles
                        </Btn>
                        <Btn size="lg">
                            Ver Actividad de Usuarios
                        </Btn >
                    </div>
                </div>
                
            </section>
            <section>
                <div>
                    <h1 className="font-bold text-2xl mb-4">Alertas</h1>
                    <div>
                        
                    </div>
                </div>
                
            </section>
        </main>
    );
}

