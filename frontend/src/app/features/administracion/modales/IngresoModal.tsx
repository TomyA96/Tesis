import Modal from "../../../ui/componentes/Modal"
import IngresosForm from "../forms/IngresosForm"
import type { Rubro } from "../../../services/rubrosService";
import type { FuenteIngreso } from "../../../services/fuentesIngresoService";
import type { IngresoEvento } from "../../../services/movimientoFinancieroService";

type IngresoModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    idEvento: number;
    rubros: Rubro[];
    fuentes: FuenteIngreso[];
    // Si viene, el modal edita ese ingreso
    registro?: IngresoEvento;
    // Para que quien abre el modal pueda, por ejemplo, recargar su lista
    onSaved?: () => void;
};

const IngresoModal = ({ isOpen, closeModal, idEvento, rubros, fuentes, registro, onSaved }: IngresoModalProps) => {
    return(
        <Modal isOpen={isOpen} closeModal={closeModal} title={registro ? "Editar Ingreso" : "Nuevo Ingreso"}>
            <IngresosForm
                idEvento={idEvento}
                rubros={rubros}
                fuentes={fuentes}
                registro={registro}
                onSaved={() => {
                    onSaved?.();
                    closeModal();
                }}
                onCancel={closeModal}
            />
        </Modal>
    )
};
export default IngresoModal;
