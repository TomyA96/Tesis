
import type { Perfil } from "../../../../services/perfilesService";
import Modal from "../../../../ui/componentes/Modal";
import CrearUsuarioForm from "../forms/CrearUsuarioForm";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    onCreated: () => void;
    perfiles: Perfil[] ; // Opcional, para el select de perfiles
};

const CrearUsuarioModal = ({isOpen, closeModal, onCreated, perfiles}: ModalProps) => {
    
    return (
        <Modal isOpen={isOpen} closeModal={closeModal}  title="Crear Nuevo Usuario">
            <CrearUsuarioForm onCreated={onCreated} perfiles={perfiles} />
        </Modal>
    );
};

export default CrearUsuarioModal;
