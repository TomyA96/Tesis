import Modal from "../../../../ui/componentes/Modal";
import EditarUsuarioForm from "../forms/EditarUsuarioForm";
import type { Usuario } from "../../../../services/usuariosService";
import type { Perfil } from "../../../../services/perfilesService";

type ModalProps = {
    isOpen: boolean;
    usuario: Usuario | null;
    perfiles: Perfil[];
    closeModal: () => void;
    onUpdated: () => void; 
};

const EditarUsuarioModal = ({isOpen, usuario, perfiles, closeModal, onUpdated }: ModalProps) => {
    
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Usuario">
            {usuario && <EditarUsuarioForm usuario={usuario} perfiles={perfiles} onCancel={closeModal} onUpdated={onUpdated}/>}
        </Modal>
        
    );
}
export default EditarUsuarioModal;
