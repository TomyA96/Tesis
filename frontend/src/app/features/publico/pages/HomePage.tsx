import { useEffect, useState } from "react";
import Carrusel from "../componentes/Carrusel";
import{ getEventosConImagenes, type EventoConImagenes } from "../../../services/eventosService";
import ListaEventosPublicos from "../componentes/ListaEventosPublicos";
import FondoMosaico from "../../../ui/componentes/FondoMosaico";

const HomePage = () => {
    const [eventos, setEventos] = useState<EventoConImagenes[]>([])
    const [error, setError] = useState('')
    useEffect(() => {
        setError('')
        getEventosConImagenes()
            .then((response) => setEventos(response))
            .catch(() => setError('Se produjo un error al cargar los eventos'))
    }, [])
    return (
        <main className="relative isolate flex-1 bg-gray-200">
            <FondoMosaico className="bg-size-[500px]" />
            <Carrusel eventos={eventos} errorDeCarga={error}/>
            <ListaEventosPublicos eventos={eventos}/>
        </main>
    );
};

export default HomePage;
