import React from "react";
import Select from "../../../ui/componentes/Select";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../ui/componentes/ContenedorFiltros";

type FiltroUsuariosProps = {
    perfiles: { id: number; nombre: string }[];
    estados: { id: number; nombre: string }[];
    onFilterChange?: (filtros: { perfilId: number | null; estadoId: number | null; searchTerm: string }) => void;
};

const FiltroUsuarios = ({ perfiles, estados, onFilterChange }: FiltroUsuariosProps) => {
    const [perfilId, setPerfilId] = React.useState<number | null>(null);
    const [estadoId, setEstadoId] = React.useState<number | null>(null);
    const [searchTerm, setSearchTerm] = React.useState<string>("");
    const handleFilterChange = () => {
        if (onFilterChange) {
            onFilterChange({ perfilId, estadoId, searchTerm });
        }
    };

    React.useEffect(() => {
        handleFilterChange();
    }, [perfilId, estadoId, searchTerm]);
    return (
        <ContenedorFiltros>
            <div className="flex gap-6  items-end">
                <Input
                    type="text"
                    placeholder="Buscar usuario por nombre"
                    className="min-w-[500px]"   
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />  
                <Select
                    label="Perfil"
                    className="w-1/6"   
                    opciones={[{ label: "Todos", value: "" }, ...perfiles.map((p) => ({ label: p.nombre, value: p.id }))]}
                    value={perfilId ?? ""}
                    onChange={(e) => setPerfilId(e.target.value ? Number(e.target.value) : null)}
                />
                <Select
                    label="Estado"  
                    className="w-1/6"
                    opciones={[{ label: "Todos", value: "" }, ...estados.map((e) => ({ label: e.nombre, value: e.id }))]}
                    value={estadoId ?? ""}
                    onChange={(e) => setEstadoId(e.target.value ? Number(e.target.value) : null)}
                />
            </div>
            <div className="flex items-end">
                <Btn >
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
        
    );
};

export default FiltroUsuarios;