
type ContFiltrosProps = {
    children: React.ReactNode;
}
const ContenedorFiltros = ({children}: ContFiltrosProps) => {
    return(
        <div className="flex overflow-x-auto justify-between gap-4 mb-4 -mt-2 w-full  p-4 pt-0">
            {children}
        </div>
    );
};

export default ContenedorFiltros;