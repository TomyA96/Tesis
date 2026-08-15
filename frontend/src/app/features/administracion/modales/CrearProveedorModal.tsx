import Modal from "../../../ui/componentes/Modal";
import CrearProveedorForm from "../forms/CrearProveedorForm";
import type { Rubro } from "../../../services/rubrosService";

type ModalProps = {
    isOpen: boolean;
    rubros: Rubro[];
    closeModal: () => void;
    onCreated: () => void;
};

const CrearProveedorModal = ({ isOpen, rubros, closeModal, onCreated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Crear Nuevo Proveedor">
            <CrearProveedorForm rubros={rubros} onCancel={closeModal} onCreated={onCreated} />
        </Modal>
    );
};

export default CrearProveedorModal;
