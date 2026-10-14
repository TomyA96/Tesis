import Modal from "../../../ui/componentes/Modal";
import EditarFuenteIngresoForm from "../forms/EditarFuenteIngresoForm";
import type { FuenteIngreso } from "../../../services/fuentesIngresoService";
import type { Rubro } from "../../../services/rubrosService";

type ModalProps = {
    isOpen: boolean;
    fuente: FuenteIngreso | null;
    rubros: Rubro[];
    closeModal: () => void;
    onUpdated: () => void;
};

const EditarFuenteIngresoModal = ({ isOpen, fuente, rubros, closeModal, onUpdated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Fuente de Ingreso">
            {fuente && (
                <EditarFuenteIngresoForm
                    fuente={fuente}
                    rubros={rubros}
                    onCancel={closeModal}
                    onUpdated={onUpdated}
                />
            )}
        </Modal>
    );
};

export default EditarFuenteIngresoModal;
