import Modal from "../../../ui/componentes/Modal";
import CrearRubroForm from "../forms/CrearRubroForm";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    onCreated: () => void;
};

const CrearRubroModal = ({ isOpen, closeModal, onCreated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Crear Nuevo Rubro">
            <CrearRubroForm onCancel={closeModal} onCreated={onCreated} />
        </Modal>
    );
};

export default CrearRubroModal;
