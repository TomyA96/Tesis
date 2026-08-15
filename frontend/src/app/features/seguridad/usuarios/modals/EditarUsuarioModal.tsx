import Modal from "../../../../ui/componentes/Modal";
import EditarUsuarioForm from "../forms/EditarUsuarioForm";
import type { Usuario } from "../../../../services/usuariosService";

type ModalProps = {
    isOpen: boolean;
    usuario: Usuario | null;
    closeModal: () => void;
    onUpdated: () => void; 
};

const EditarUsuarioModal = ({isOpen, usuario, closeModal, onUpdated }: ModalProps) => {
    
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Usuario">
            {usuario && <EditarUsuarioForm usuario={usuario} onCancel={closeModal} onUpdated={onUpdated}/>}
        </Modal>
        
    );
}
export default EditarUsuarioModal;
