import Btn from "./Btn";
import { cn } from "../../../lib/cn";

type ModalProps ={
    isOpen: boolean;
    closeModal: () => void;
    title?: string;
    children: React.ReactNode;
    /*
        Sin maxWidth el modal mide lo que mide su contenido: cada formulario
        ya define su propio ancho. Pasalo solo cuando el contenido es texto
        libre que podría estirar el modal (ej: ConfirmarAccion).
    */
    maxWidth?: string;
};

const Modal = ({isOpen, closeModal, title, children, maxWidth}: ModalProps) => {
    if (!isOpen) return null;
    return(
        <div className=" fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
            />
            <div className={cn("relative bg-white rounded-lg p-6 z-10 mx-4", maxWidth && "w-full")} style={{ maxWidth }}>
                <div className="flex justify-between mb-4">
                    {/* Header */}
                    {title && <h2 className="text-2xl font-bold">{title}</h2>}
                    
                    <Btn 
                    variant="danger"
                    size="sm"
                    onClick={closeModal}
                    >
                        X
                    </Btn>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;