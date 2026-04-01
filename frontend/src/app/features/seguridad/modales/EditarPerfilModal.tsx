
import Modal from "../../../ui/componentes/Modal";
import EditarPerfilForm from "../forms/EditarPerfilForm";
import type { Permiso } from "../utils/CargarPermisos";
type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    nombrePerfil: string;
    id: number;
    permisos: Permiso[];
    permisosPerfil: number[];
};

const EditarPerfilModal = ({isOpen, closeModal, nombrePerfil, id, permisos, permisosPerfil}: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Perfil">
            <EditarPerfilForm nombrePerfil={nombrePerfil} id={id} permisos={permisos} permisosPerfil={permisosPerfil} onCancel={closeModal} />
        </Modal>
    );
};  
export default EditarPerfilModal;