import GastosForm from "../forms/GastosForm";
import Modal from "../../../ui/componentes/Modal";
import type { Rubro } from "../../../services/rubrosService";
import type { Proveedor } from "../../../services/proveedoresService";
import type { GastoEvento } from "../../../services/movimientoFinancieroService";

type GastoModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    idEvento: number;
    rubros: Rubro[];
    proveedores: Proveedor[];
    // Si viene, el modal edita ese gasto
    registro?: GastoEvento;
    // Para que quien abre el modal pueda, por ejemplo, recargar su lista
    onSaved?: () => void;
}

const GastoModal = ({ isOpen, closeModal, idEvento, rubros, proveedores, registro, onSaved }: GastoModalProps) => {
    return(
        <Modal isOpen={isOpen} closeModal={closeModal} title={registro ? "Editar Gasto" : "Nuevo Gasto"}>
            <GastosForm
                idEvento={idEvento}
                rubros={rubros}
                proveedores={proveedores}
                registro={registro}
                onSaved={() => {
                    onSaved?.();
                    closeModal();
                }}
                onCancel={closeModal}
            />
        </Modal>
    )
}
export default GastoModal;
