
import Select from "../../../../ui/componentes/Select";
import Input from "../../../../ui/componentes/Input";
import Btn from "../../../../ui/componentes/Btn";
import ContenedorFiltros from "../../../../ui/componentes/ContenedorFiltros";
import { opcionesEstadoUsuario, type EstadoUsuario, type Usuario } from "../../../../services/usuariosService";
import type { Perfil } from "../../../../services/perfilesService";

export type FiltrosUsuarios = {
    idPerfil: number ;
    estado: EstadoUsuario | "";
    nombreUsuario : string;
    
};

export const filtrosUsuariosVacios: FiltrosUsuarios = { 
    idPerfil: 0,
    estado: "",
    nombreUsuario: "",
};

export const aplicarFiltrosUsuarios = (usuarios: Usuario[], filtros: FiltrosUsuarios) => {
    const texto = filtros.nombreUsuario.trim().toLowerCase();

    return usuarios.filter((usuario) => {
        const coincideNombre = usuario.nombre.toLowerCase().includes(texto) || usuario.usuario.toLowerCase().includes(texto);
        const coincideEstado = filtros.estado === "" || filtros.estado === usuario.estado;
        const coincidePerfil = filtros.idPerfil === 0 || usuario.perfiles.some((p) => p.idPerfil === filtros.idPerfil);
        return coincideNombre && coincideEstado && coincidePerfil;
    })}
        

type FiltroUsuariosProps = {
    filtros : FiltrosUsuarios;
    onChange: (filtros: FiltrosUsuarios) => void;
    perfiles: Perfil[];
};


const FiltroUsuarios = ({ filtros, onChange, perfiles }: FiltroUsuariosProps) => {
    
    return (
        <ContenedorFiltros>
            <div className="flex gap-6  items-end">
                <Input
                    type="text"
                    placeholder="Buscar usuario por nombre"
                    className="min-w-[500px]"   
                    value={filtros.nombreUsuario}
                    onChange={(e) => onChange({...filtros, nombreUsuario: e.target.value})}
                />  
                <Select
                    label="Perfil"
                     className="min-w-40"
                    opciones={[{label: "Todos", value: 0} , ...perfiles.map((p) => ( {label: p.nombre, value: p.id}))]}
                    value={filtros.idPerfil}
                    onChange={(e) => onChange({ ...filtros, idPerfil: Number(e.target.value) })} 
                />
                <Select
                    label="Estado"  
                    className="min-w-40"
                    opciones={[{ label: "Todos", value: "" }, ...opcionesEstadoUsuario]}
                    value={filtros.estado}
                    onChange={(e) => onChange({ ...filtros, estado: e.target.value as EstadoUsuario | ""})}
                />
            </div>
            <div className="flex items-end">
                <Btn variant="outline" onClick={() => onChange(filtrosUsuariosVacios)}>
                    Limpiar Filtros
                </Btn>
            </div>
        </ContenedorFiltros>
        
    );
};

export default FiltroUsuarios;
