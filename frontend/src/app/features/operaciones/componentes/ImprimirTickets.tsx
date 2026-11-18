import { useEffect, useRef, useState } from "react";
import Modal from "../../../ui/componentes/Modal";
import Btn from "../../../ui/componentes/Btn";

type ImprimirTicketsProps = {
    // El PDF que devolvió el backend al vender o reemitir; null = cerrado
    pdf: Blob | null;
    titulo: string;
    onCerrar: () => void;
};

/*
    Muestra los tickets recién vendidos (o reemitidos) y abre el diálogo de
    impresión apenas se cargan. Se muestra dentro de la pantalla (en un
    iframe) en vez de abrir otra pestaña: los navegadores bloquean las
    ventanas que se abren después de esperar una respuesta del servidor.

    El PDF solo existe mientras esta ventana está abierta: al cerrarla se
    descarta. No hay un botón para imprimirlo otra vez ni forma de volver a
    pedirlo (reimprimir el mismo QR dejaría dos papeles válidos): si el
    papel no salió, se reemite.
*/
const ImprimirTickets = ({ pdf, titulo, onCerrar }: ImprimirTicketsProps) => {
    const marco = useRef<HTMLIFrameElement>(null);
    const [url, setUrl] = useState<string | null>(null);
    const [sinDialogo, setSinDialogo] = useState(false);

    useEffect(() => {
        if (!pdf) return;
        const creada = URL.createObjectURL(pdf);
        setUrl(creada);
        setSinDialogo(false);
        return () => {
            URL.revokeObjectURL(creada);
            setUrl(null);
        };
    }, [pdf]);

    const imprimir = () => {
        try {
            marco.current?.contentWindow?.focus();
            marco.current?.contentWindow?.print();
        } catch {
            // Algunos navegadores no dejan imprimir el visor de PDF desde afuera: queda su propio botón
            setSinDialogo(true);
        }
    };

    return (
        <Modal isOpen={pdf !== null} closeModal={onCerrar} title={titulo} maxWidth="560px">
            <div className="flex flex-col gap-4">
                {url && (
                    <iframe
                        ref={marco}
                        src={url}
                        title="Tickets para imprimir"
                        className="h-[60vh] w-full rounded-lg border border-slate-200"
                        onLoad={imprimir}
                    />
                )}
                {sinDialogo && (
                    <p className="text-sm text-amber-700">
                        No se pudo abrir la impresión automática: usá el botón de imprimir del visor.
                    </p>
                )}
                <p className="text-xs text-slate-500">
                    Si el papel no sale bien, cerrá esta ventana y usá «Reemitir» en la venta: se anulan estos
                    tickets y salen otros nuevos.
                </p>
                <Btn onClick={onCerrar}>Listo</Btn>
            </div>
        </Modal>
    );
};

export default ImprimirTickets;
