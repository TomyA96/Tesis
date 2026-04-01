import Modal from "../../../ui/componentes/Modal";
import CrearPerfilForm from "../forms/CrearPerfilForm";
import type { Permiso } from "../utils/CargarPermisos";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    permisos: Permiso[];
};


const CrearPerfilModal = ({isOpen, closeModal, permisos}: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Crear Perfil">
            <CrearPerfilForm permisos={permisos} onCancel={closeModal} />
        </Modal>
    );
}
export default CrearPerfilModal;