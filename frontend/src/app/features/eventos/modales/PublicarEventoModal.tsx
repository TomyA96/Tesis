import { useState } from "react";
import Modal from "../../../ui/componentes/Modal";
import Btn from "../../../ui/componentes/Btn";
import type { EstadoEvento, RevisionJornada } from "../../../services/eventosService";

type PublicarEventoModalProps = {
    isOpen: boolean;
    estadoEvento: EstadoEvento;
    // Las jornadas en Borrador con lo que le falta a cada una
    revision: RevisionJornada[];
    // Nombre a mostrar de cada jornada, por id ("Jornada N" si no tiene)
    titulos: Record<number, string>;
    // Sin imagen el backend rechaza publicar: se avisa antes en vez de dejar confirmar
    tieneImagen: boolean;
    // Recibe si el usuario aceptó dejar afuera las incompletas
    onConfirmar: (confirmarIncompletas: boolean) => Promise<void>;
    onCancelar: () => void;
};

/*
    Antes de publicar muestra qué se va a publicar y qué queda afuera. No usa
    ConfirmarAccion porque acá el mensaje no es una frase: es una lista de
    jornadas con lo que le falta a cada una.
*/
const PublicarEventoModal = ({ isOpen, estadoEvento, revision, titulos, tieneImagen, onConfirmar, onCancelar }: PublicarEventoModalProps) => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const completas = revision.filter((r) => r.faltantes.length === 0);
    // Se puede confirmar solo si hay algo para publicar y el evento tiene su imagen
    const sePuedePublicar = completas.length > 0 && tieneImagen;
    const incompletas = revision.filter((r) => r.faltantes.length > 0);
    // Se publican igual, pero conviene que se sepa que en esas no hay venta anticipada
    const soloPuerta = completas.filter((r) => r.soloBoleteria);
    const conEvento = estadoEvento === "Borrador";

    const cerrar = () => {
        setError("");
        onCancelar();
    };

    const handleConfirmar = async () => {
        setError("");
        setCargando(true);
        try {
            await onConfirmar(incompletas.length > 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo publicar");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal isOpen={isOpen} closeModal={cerrar} title={conEvento ? "Publicar evento" : "Publicar jornadas"} maxWidth="520px">
            <div className="flex flex-col gap-4 text-sm">
                {completas.length === 0 ? (
                    <p className="text-gray-700">
                        Todavía no hay ninguna jornada completa. Completá lo que falta para poder publicar.
                    </p>
                ) : (
                    <p className="text-gray-700">
                        {conEvento ? "Se va a publicar el evento junto con " : "Se van a publicar "}
                        <strong>{completas.length} jornada(s)</strong>: {completas.map((r) => titulos[r.id]).join(", ")}.
                    </p>
                )}

                {soloPuerta.length > 0 && (
                    <p className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900">
                        {soloPuerta.length === 1 ? (
                            <><strong>{titulos[soloPuerta[0].id]}</strong> solo tiene configurada la boletería: no va a haber venta anticipada, solo venta en puerta.</>
                        ) : (
                            <><strong>{soloPuerta.map((r) => titulos[r.id]).join(", ")}</strong> solo tienen configurada la boletería: no va a haber venta anticipada, solo venta en puerta.</>
                        )}
                    </p>
                )}

                {incompletas.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                        <span className="font-medium">
                            {completas.length > 0
                                ? "Estas jornadas no están completas y van a quedar en borrador:"
                                : "Lo que le falta a cada jornada:"}
                        </span>
                        <ul className="flex flex-col gap-1.5">
                            {incompletas.map((r) => (
                                <li key={r.id}>
                                    <strong>{titulos[r.id]}</strong>: {r.faltantes.join(". ")}
                                </li>
                            ))}
                        </ul>
                        {completas.length > 0 && (
                            <span className="text-xs">Podés completarlas y publicarlas más adelante.</span>
                        )}
                    </div>
                )}

                {!tieneImagen && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        El evento no tiene imagen publicitaria. Subila desde la miniatura antes de publicar.
                    </p>
                )}

                {error && <p className="text-red-600">{error}</p>}

                <div className="grid grid-cols-2 gap-4">
                    {sePuedePublicar ? (
                        <Btn variant="success" onClick={handleConfirmar} disabled={cargando}>
                            {cargando ? "Publicando..." : incompletas.length > 0 ? "Publicar las completas" : "Publicar"}
                        </Btn>
                    ) : (
                        <span />
                    )}
                    <Btn variant="outline" onClick={cerrar} disabled={cargando}>
                        {sePuedePublicar ? "Cancelar" : "Cerrar"}
                    </Btn>
                </div>
            </div>
        </Modal>
    );
};

export default PublicarEventoModal;
