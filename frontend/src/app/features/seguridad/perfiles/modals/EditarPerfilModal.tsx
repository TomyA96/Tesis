
import Modal from "../../../../ui/componentes/Modal";
import EditarPerfilForm from "../forms/EditarPerfilForm";
import type { Permiso } from "../../../../services/permisosService";
import type { Perfil } from "../../../../services/perfilesService";

type ModalProps = {
    isOpen: boolean;
    perfil: Perfil | null;
    permisos: Permiso[];
    permisosPerfil: number[];
    closeModal: () => void;
    onUpdated: () => void;
};

const EditarPerfilModal = ({isOpen, closeModal, perfil, permisos, permisosPerfil, onUpdated}: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Perfil">
            {perfil &&
            <EditarPerfilForm
                perfil={perfil}
                permisos={permisos}
                permisosPerfil={permisosPerfil}
                onCancel={closeModal}
                onUpdated={onUpdated}
            />}
        </Modal>
    );
};
export default EditarPerfilModal;
