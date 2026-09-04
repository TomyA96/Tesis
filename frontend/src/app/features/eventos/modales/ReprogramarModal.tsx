import Modal from "../../../ui/componentes/Modal";
import ReprogramarForm from "../forms/ReprogramarForm";
import type { Evento } from "../../../services/eventosService";

type ReprogramarModalProps = {
    isOpen: boolean;
    evento: Evento;
    closeModal: () => void;
    onReprogramado: (evento: Evento) => void;
};

const ReprogramarModal = ({ isOpen, evento, closeModal, onReprogramado }: ReprogramarModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Reprogramar evento">
            <ReprogramarForm evento={evento} onReprogramado={onReprogramado} onCancel={closeModal} />
        </Modal>
    );
};

export default ReprogramarModal;
