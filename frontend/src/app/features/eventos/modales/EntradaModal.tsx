import EntradaForm from "../forms/EntradaForm";
import Modal from "../../../ui/componentes/Modal";
import type { Entrada } from "../../../services/entradasService";


type EntradaModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    idJornada: number;
    entrada?:Entrada;
    onSaved: (entrada: Entrada) => void;
}

const EntradaModal = ({isOpen, closeModal, idJornada, entrada, onSaved}: EntradaModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            closeModal={closeModal}
            title={entrada ? "Editar entrada" : "Crear entrada"}
            >
            <EntradaForm idJornada={idJornada}onSaved={onSaved} onCancel={closeModal} entrada={entrada} />
        </Modal>
    );
}

export default EntradaModal;