import { useState } from "react";
import Btn from "./Btn"
import Modal from "./Modal";

type ConfirmarAccionProps = {
    title: string;
    mensaje: string;
    isOpen: boolean;
    entidad?: string;
    variante?: "danger" | "primary";
    onConfirmar: () => void | Promise<void>;
    onCancelar: () => void;
}

const ConfirmarAccion = ({ title, mensaje, onConfirmar, entidad, isOpen, variante , onCancelar }: ConfirmarAccionProps) => {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const handleConfirmar = async () => {
        setError("");
        setCargando(true);
        try {
            await onConfirmar();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocurrió un error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal isOpen={isOpen} closeModal={onCancelar} title={title}>
            <div className=" w-full justify-between min-h-[150px] max-w-[450px] flex flex-col">


                <p className=" text-sm p-6">¿{mensaje}{entidad && <strong className="ml-2">{entidad}</strong>}?</p>
                {error && <p className="px-6 text-sm text-red-600">{error}</p>}
                <div className="grid grid-cols-2  gap-4 px-6 pb-2">
                    <Btn variant={variante ?? "danger"} className="min-w-[105px]" onClick={handleConfirmar} disabled={cargando}>
                        {cargando ? "Confirmando..." : "Confirmar"}
                    </Btn>
                    <Btn variant="outline" className="min-w-[105px]" onClick={onCancelar} disabled={cargando}>
                        Cancelar
                    </Btn>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmarAccion;