import Modal from "../../../ui/componentes/Modal"
import SeleccionarProductosForm from "../forms/SeleccionarProductosForm"
import type { Producto } from "../../../services/productosService";

type ModificarListaProps = {
    isOpen: boolean;
    closeModal: () => void;
    idEvento: number;
    productos: Producto[];
    asignados: Producto[];
    onSaved?: () => void;
};

const ModificarListaModal = ({ isOpen, closeModal, idEvento, productos, asignados, onSaved }: ModificarListaProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Productos del evento">
            <SeleccionarProductosForm
                idEvento={idEvento}
                productos={productos}
                asignados={asignados}
                onCancel={closeModal}
                onSaved={() => {
                    onSaved?.();
                    closeModal();
                }}
            />
        </Modal>
    )
}
export default ModificarListaModal;
