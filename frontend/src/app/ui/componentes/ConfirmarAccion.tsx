import Btn from "./Btn"
import Modal from "./Modal";

type ConfirmarAccionProps = {
    title: string;
    mensaje: string;
    isOpen: boolean;
    entidad?: string;
    variante?: "danger" | "primary";
    onConfirmar: () => void;
    onCancelar: () => void;
}

const ConfirmarAccion = ({ title, mensaje, onConfirmar, entidad, isOpen, variante , onCancelar }: ConfirmarAccionProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={onCancelar} title={title}>
            <div className=" w-full justify-center min-h-[150px]  flex flex-col">
                
                
                <p className=" text-lg p-6">{mensaje}{entidad && <strong className="ml-2">{entidad}</strong>}</p>
                <div className="flex justify-end gap-4">
                    <Btn variant={variante ?? "danger"} className="min-w-[105px]" onClick={onConfirmar}>Confirmar</Btn>
                    <Btn variant="outline" className="min-w-[105px]" onClick={onCancelar}>Cancelar</Btn>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmarAccion;