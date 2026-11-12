import Modal from "../../../ui/componentes/Modal";
import PuntoVentaForm from "../forms/PuntoVentaForm";
import type { PuntoVenta } from "../../../services/puntosVentaService";

type ModalProps = {
    isOpen: boolean;
    // undefined = crear uno nuevo
    puntoVenta?: PuntoVenta;
    closeModal: () => void;
    onSaved: () => void;
};

const PuntoVentaModal = ({ isOpen, puntoVenta, closeModal, onSaved }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title={puntoVenta ? "Editar Punto de Venta" : "Crear Punto de Venta"}>
            {/* key: al pasar de un punto de venta a otro, el formulario arranca de cero con sus datos */}
            {isOpen && (
                <PuntoVentaForm
                    key={puntoVenta?.id ?? "nuevo"}
                    puntoVenta={puntoVenta}
                    onCancel={closeModal}
                    onSaved={onSaved}
                />
            )}
        </Modal>
    );
};

export default PuntoVentaModal;
