import Modal from "../../../ui/componentes/Modal"
import IngresosForm from "../forms/IngresosForm"

type Modo= "crear" | "editar";
type IngresoModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    modo: Modo;
};
const IngresoModal = ({isOpen, closeModal, modo="crear"}:IngresoModalProps ) => {
    return(
    <Modal isOpen={isOpen} closeModal={closeModal} title={modo === "crear" ? "Nuevo Ingreso" : "Editar Ingreso"}>
        <IngresosForm rubros={[{label:"alquiler" , value:1}]} modo={modo} />
    </Modal>
    )
};
export default IngresoModal;