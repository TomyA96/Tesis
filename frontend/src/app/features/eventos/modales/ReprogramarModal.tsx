import Modal from "../../../ui/componentes/Modal";
import ReprogramarForm from "../forms/ReprogramarForm";
import type { Jornada } from "../../../services/jornadasService";

type ReprogramarModalProps = {
    isOpen: boolean;
    jornada: Jornada;
    closeModal: () => void;
    onReprogramado: (jornada: Jornada) => void;
};

// Reprogramar es de cada jornada suspendida: le da fecha nueva y la vuelve a Activo
const ReprogramarModal = ({ isOpen, jornada, closeModal, onReprogramado }: ReprogramarModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Reprogramar jornada">
            <ReprogramarForm jornada={jornada} onReprogramado={onReprogramado} onCancel={closeModal} />
        </Modal>
    );
};

export default ReprogramarModal;
