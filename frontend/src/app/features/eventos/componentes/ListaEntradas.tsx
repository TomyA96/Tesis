import Btn from "../../../ui/componentes/Btn";
import LoteEntrada from "./LoteEntrada";
import CrearEntradaModal from "../modales/EntradaModal";
import { useState } from "react";

const ListaEntradas = () => {
    const [isEntradaModalOpen, setIsEntradaModalOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-2xl">Lista de entradas</h2>
                <Btn className="" onClick={() => setIsEntradaModalOpen(true)}>+ Agregar Entrada</Btn>
            </div>

            <CrearEntradaModal
                isOpen={isEntradaModalOpen}
                closeModal={() => setIsEntradaModalOpen(false)}
            />

            <div className="flex flex-col gap-4 mt-4">
                <LoteEntrada />
                <LoteEntrada />
                <LoteEntrada />
                <LoteEntrada />
            </div>
            <div>
                <Btn variant="ghost" className="mt-4 min-w-[150px]">Ver Ventas</Btn>
            </div>
        </div>
    );
}
export default ListaEntradas;