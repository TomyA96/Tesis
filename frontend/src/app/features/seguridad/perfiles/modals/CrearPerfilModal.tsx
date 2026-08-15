import Modal from "../../../../ui/componentes/Modal";
import CrearPerfilForm from "../forms/CrearPerfilForm";
import type { Permiso } from "../../../../services/permisosService";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    permisos: Permiso[];
    onCreated: () => void;
};


const CrearPerfilModal = ({isOpen, closeModal, permisos, onCreated}: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Crear Perfil">
            <CrearPerfilForm permisos={permisos} onCancel={closeModal} onCreated={onCreated}/>
        </Modal>
    );
}
export default CrearPerfilModal;
