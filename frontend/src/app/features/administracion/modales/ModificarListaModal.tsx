import Modal from "../../../ui/componentes/Modal"
import SeleccionarProductosForm from "../forms/SeleccionarProductosForm"

type ModificarListaProps = {
    isOpen: boolean;
    closeModal: () => void;
    
};
const ModificarListaModal = ({isOpen, closeModal}: ModificarListaProps) => {
    return (
        <Modal isOpen={isOpen} closeModal={closeModal} title="Productos evento">
            <SeleccionarProductosForm productos={[{id:1, nombreProducto:"Hambur", categoria:"comida", selected:true}]}/>
        </Modal>
    )
}
export default ModificarListaModal;