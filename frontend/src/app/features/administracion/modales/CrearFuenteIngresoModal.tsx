import Modal from "../../../ui/componentes/Modal";
import CrearFuenteIngresoForm from "../forms/CrearFuenteIngresoForm";
import type { Rubro } from "../../../services/rubrosService";

type ModalProps = {
    isOpen: boolean;
    rubros: Rubro[];
    closeModal: () => void;
    onCreated: () => void;
};

const CrearFuenteIngresoModal = ({ isOpen, rubros, closeModal, onCreated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Crear Nueva Fuente de Ingreso">
            <CrearFuenteIngresoForm rubros={rubros} onCancel={closeModal} onCreated={onCreated} />
        </Modal>
    );
};

export default CrearFuenteIngresoModal;
