
import Modal from "../../../ui/componentes/Modal";
import CrearUsuarioForm from "../forms/CrearUsuarioForm";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
};

const CrearUsuarioModal = ({isOpen, closeModal: onClose}: ModalProps) => {
    const perfiles = [
        { label: "Administrador", value: 1 },
        { label: "Usuario", value: 2 }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Usuario">
            <CrearUsuarioForm perfiles={perfiles} />
        </Modal>
    );
};

export default CrearUsuarioModal;