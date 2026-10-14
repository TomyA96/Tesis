import Header from "../../../ui/componentes/Header";
import ContenedorDatos from "../../../ui/componentes/ContenedorDatos";
import CardEvent from "../componentes/CardEvent";
import LinkBtn from "../../../ui/componentes/LinkBtn";
import { RUTAS } from "../../../constantes/Rutas";
import { useEffect, useMemo, useState } from "react";
import { getEventosPublicados, type Evento } from "../../../services/eventosService";
import { cn } from "../../../../lib/cn";
import { fechaArgentina } from "../../../utils/zonaHoraria";
import DropdownAnio from "../../../ui/componentes/DropdownAnio";
import { cargarAñosEventos } from "../../../utils/cargarAñosEventos";
import { getRubros, type Rubro } from "../../../services/rubrosService";
import { getProveedores, type Proveedor } from "../../../services/proveedoresService";
import AccionesCardEvento from "../componentes/AccionesCardEvento";
import { getFuentesIngreso, type FuenteIngreso } from "../../../services/fuentesIngresoService";

type ErrorDeCarga = {
    proveedores: string;
    rubrosError: string;
    fuentesError: string;
}


const AdministracionHomePage = () => {
    const añoActual = new Date().getFullYear();
    const [añoSeleccionado, setAñoSeleccionado] = useState<number>(añoActual);
    const [rubros, setRubros] = useState<Rubro[]>([])
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [fuentes, setFuentes] = useState<FuenteIngreso[]>([])
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [error, setError] = useState<string>("");
    const [errorDeCarga, setErrorDeCarga] = useState<ErrorDeCarga>({rubrosError: "", proveedores: "", fuentesError: ""})

    const eventosDelAño = useMemo(
        () => eventos.filter(
            (evento) => new Date(evento.fechaHoraInicio).getFullYear() === añoSeleccionado),
        [eventos, añoSeleccionado]);

    useEffect(() => {
        setError("");
        getEventosPublicados()
            .then((response) => setEventos(response))
            .catch(() => setError("No se pudieron cargar los eventos"));
    }, []);

    useEffect(() => {
    getRubros()
        .then((response) => setRubros(response))
        .catch(() => setErrorDeCarga((prev) => ({ ...prev, rubrosError: "No se pudieron cargar los rubros" })))
}, []);

useEffect(() => {
    getProveedores()
        .then((response) => setProveedores(response))
        .catch(() => setErrorDeCarga((prev) => ({ ...prev, proveedores: "No se pudieron cargar los proveedores" })))
}, []);

useEffect(() => {
    getFuentesIngreso()
        .then((response) => setFuentes(response))
        .catch(() => setErrorDeCarga((prev) => ({ ...prev, fuentesError: "No se pudieron cargar las fuentes de ingreso" })))
}, []);

    return (
        <main>    
            <ContenedorDatos className="max-h-[800px]" >
                <Header
                    titulo={<h1 className="text-2xl font-semibold text-gray-800">Administración</h1>}
                    action={
                        <DropdownAnio
                            años={cargarAñosEventos(eventos, añoActual)}
                            value={añoSeleccionado}
                            onChange={setAñoSeleccionado}
                        />
                    }
                />
                <div className="flex">
                    <div className={cn("flex-1 max-h-[650px] overflow-y-auto overflow-x-hidden gap-6 p-4 ", eventosDelAño.length > 0 ? 'flex flex-wrap content-start gap-6 justify-center' : 'flex flex-col justify-center items-center')}>
                        {error && <p className="text-red-500">{error}</p>}
                        {eventosDelAño.length > 0 ? (
                            eventosDelAño.map((evento) => (
                                <CardEvent key={evento.id}
                                    nombre={evento.nombre}
                                    fecha={fechaArgentina(evento.fechaHoraInicio)}
                                    estado={evento.estado}
                                    acciones={
                                        <AccionesCardEvento
                                            idEvento={evento.id}
                                            rubros={rubros}
                                            proveedores={proveedores}
                                            fuentes={fuentes}
                                        />
                                    }
                                />
                            ))
                        ) : (
                                <p className="text-gray-500">No hay eventos registrados para el año {añoSeleccionado}.</p>
                        )}
                    </div>
                    <div className="flex flex-col  items-center gap-4 border-l border-gray-100 w-fit  px-8 my-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                Administrar
                        </p>
                        <LinkBtn className="w-[150px]" variant="outline" size="sm" to={RUTAS.administracion.productos}>
                            Productos
                        </LinkBtn>
                        <LinkBtn className="w-[150px]" variant="outline" size="sm" to={RUTAS.administracion.proveedores}>
                            Proveedores
                        </LinkBtn>
                        <LinkBtn className="w-[150px]" variant="outline" size="sm" to={RUTAS.administracion.fuentesIngreso}>
                            Fuentes de ingreso
                        </LinkBtn>
                        <LinkBtn className="w-[150px]" variant="outline" size="sm" to={RUTAS.administracion.rubros}>
                            Rubros
                        </LinkBtn>
                        
                        
                    </div>
                </div>
                
            </ContenedorDatos>
            
            
        </main>
    );
};

export default AdministracionHomePage;
