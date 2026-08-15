import Modal from "../../../ui/componentes/Modal";
import EditarProveedorForm from "../forms/EditarProveedorForm";
import type { Proveedor } from "../../../services/proveedoresService";
import type { Rubro } from "../../../services/rubrosService";

type ModalProps = {
    isOpen: boolean;
    proveedor: Proveedor | null;
    rubros: Rubro[];
    closeModal: () => void;
    onUpdated: () => void;
};

const EditarProveedorModal = ({ isOpen, proveedor, rubros, closeModal, onUpdated }: ModalProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Editar Proveedor">
            {proveedor && (
                <EditarProveedorForm
                    proveedor={proveedor}
                    rubros={rubros}
                    onCancel={closeModal}
                    onUpdated={onUpdated}
                />
            )}
        </Modal>
    );
};

export default EditarProveedorModal;
