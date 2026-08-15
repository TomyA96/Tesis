import Modal from "../../../ui/componentes/Modal";
import EditarProductoForm from "../forms/EditarProductoForm";
import type { Producto } from "../../../services/productosService";

type ModalProps = {
    isOpen: boolean;
    producto: Producto | null;
    closeModal: () => void;
    onUpdated: () => void;
};

const EditarProductoModal = ({ isOpen, producto, closeModal, onUpdated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Producto">
            {producto && (
                <EditarProductoForm producto={producto} onCancel={closeModal} onUpdated={onUpdated} />
            )}
        </Modal>
    );
};

export default EditarProductoModal;
