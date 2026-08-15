import Modal from "../../../ui/componentes/Modal";
import EditarRubroForm from "../forms/EditarRubroForm";
import type { Rubro } from "../../../services/rubrosService";

type ModalProps = {
    isOpen: boolean;
    rubro: Rubro | null;
    closeModal: () => void;
    onUpdated: () => void;
};

const EditarRubroModal = ({ isOpen, rubro, closeModal, onUpdated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Rubro">
            {/*
                El form se monta recién cuando hay un rubro elegido. Como Modal
                devuelve null mientras está cerrado, cada vez que se abre el
                formulario se crea de nuevo y toma los datos de la fila actual.
            */}
            {rubro && <EditarRubroForm rubro={rubro} onCancel={closeModal} onUpdated={onUpdated} />}
        </Modal>
    );
};

export default EditarRubroModal;
