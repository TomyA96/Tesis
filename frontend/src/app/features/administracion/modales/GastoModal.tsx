import GastosForm from "../forms/GastosForm";
import Modal from "../../../ui/componentes/Modal";

type Modo= "crear" | "editar";
type GastoModalProps = {
    isOpen: boolean;
    closeModal: () => void;
    modo: Modo;
}

const GastoModal = ({closeModal, isOpen, modo="crear"}: GastoModalProps) => {
    return(
        <Modal isOpen={isOpen} closeModal={closeModal} title={modo ==="crear" ? "Nuevo Gasto" : "Editar Gasto" }>
            <GastosForm rubros={[{label:"alquiler" , value:1}]} proveedores={[{label:"Juancito", value:1}]} modo={modo} />
        </Modal>
    )
}
export default GastoModal;