import Modal from "../../../ui/componentes/Modal";
import EditarUsuarioForm from "../forms/EditarUsuarioForm";

type ModalProps = {
    isOpen: boolean;
    closeModal: () => void;
};

const EditarUsuarioModal = ({isOpen, closeModal}: ModalProps) => {
    const perfiles = [
        { label: "Administrador", value: 1 },
        { label: "Usuario", value: 2 }
    ];
    const nombreUsuario = "juan.perez"; // Este valor debería venir de las props o del estado   
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Usuario">
            <EditarUsuarioForm nombre={nombreUsuario} perfiles={perfiles} onCancel={closeModal}/>
        </Modal>
        
    );
}
export default EditarUsuarioModal;