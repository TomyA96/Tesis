
import Modal from "../../../../ui/componentes/Modal";
import CrearUsuarioForm from "../forms/CrearUsuarioForm";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    onCreated: () => void;
};

const CrearUsuarioModal = ({isOpen, closeModal, onCreated}: ModalProps) => {
    
    return (
        <Modal isOpen={isOpen} closeModal={closeModal}  title="Crear Nuevo Usuario">
            <CrearUsuarioForm onCreated={onCreated}/>
        </Modal>
    );
};

export default CrearUsuarioModal;
