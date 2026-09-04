import EntradaForm from "../forms/EntradaForm";
import Modal from "../../../ui/componentes/Modal";
import type { Entrada } from "../../../services/entradasService";


type EntradaModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    idEvento: number;
    entrada?:Entrada;
    onSaved: (entrada: Entrada) => void;
}

const EntradaModal = ({isOpen, closeModal, idEvento, entrada, onSaved}: EntradaModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            closeModal={closeModal}
            title="Crear Nueva Entrada"
            >
            <EntradaForm idEvento={Number(idEvento)} onSaved={onSaved} onCancel={closeModal} entrada={entrada} />
        </Modal>
    );
}

export default EntradaModal;