
type Items = {
    id: string;
    label: string;
    precio: number;
}
type ListaProps = {
    items: Items[]

}

const ListaSeleccionable = ({items}: ListaProps) => {
    return(
        <div>
            {items ? "Hago algo" : 
            <h1>No hay ningun producto seleccionado para este evento</h1>
            }
        </div>
    )
};

export default ListaSeleccionable;