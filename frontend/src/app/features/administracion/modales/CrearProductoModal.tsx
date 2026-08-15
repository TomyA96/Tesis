import Modal from "../../../ui/componentes/Modal";
import CrearProductoForm from "../forms/CrearProductoForm";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    onCreated: () => void;
};

const CrearProductoModal = ({ isOpen, closeModal, onCreated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Crear Nuevo Producto">
            <CrearProductoForm onCancel={closeModal} onCreated={onCreated} />
        </Modal>
    );
};

export default CrearProductoModal;
