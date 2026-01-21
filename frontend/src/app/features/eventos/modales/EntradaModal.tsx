import EntradaForm from "../forms/EntradaForm";
import Modal from "../../../ui/componentes/Modal";


type EntradaModalProps = {
    isOpen: boolean;
    closeModal: () => void;
}

const EntradaModal = ({isOpen, closeModal}: EntradaModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            title="Crear Nueva Entrada"
            >
            <EntradaForm />
        </Modal>
    );
}

export default EntradaModal;