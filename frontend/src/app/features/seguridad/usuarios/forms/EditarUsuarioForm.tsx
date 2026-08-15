import Formulario from "../../../../ui/componentes/Formulario";
import Input from "../../../../ui/componentes/Input";
import Btn from "../../../../ui/componentes/Btn";
import Select from "../../../../ui/componentes/Select";
import { useState, type FormEvent } from "react";
import { opcionesEstadoUsuario, updateUsuario, type EstadoUsuario, type Usuario , type UpdateUsuario} from "../../../../services/usuariosService";



type EditarUsuarioFormProps = {
    usuario: Usuario;
    onCancel: () => void;
    onUpdated: () => void; 
}

type camposEditables = {
    password: boolean;
    perfil: boolean;
    estado: boolean; 
}

const EditarUsuarioForm = ({usuario, onCancel, onUpdated}: EditarUsuarioFormProps) => {
    const [nombre, setNombre] = useState(usuario.nombre);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [estado, setEstado] = useState<EstadoUsuario>(usuario.estado);
    const [error, setError] = useState("");
    const [camposEditables, setCamposEditables] = useState<camposEditables>({
        password: false,
        perfil: false ,
        estado: false
    });
    const activarCampo = (campo: keyof camposEditables) => {
    setCamposEditables(prev => ({
      ...prev,
      [campo]: !prev[campo],
    }));
  };

  const onSubmit = async (e:FormEvent) => {
        e.preventDefault();

        if (camposEditables.password && password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }
        const newData: UpdateUsuario = {}

        if (nombre !== usuario.nombre) {
            newData.nombre = nombre;
        }
        if (camposEditables.password && password) {
            newData.password = password;
        }
        if (camposEditables.estado) {
            newData.estado = estado;
        }
        

        try {
            await updateUsuario(usuario.id, newData); 
            
            onUpdated();

        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al modificar el usuario");
        }
    };
  
    return (
        <Formulario className="min-w-sm" onSubmit={onSubmit} >
            {/* Aquí irían los campos del formulario */}
            <Input label="Usuario" 
                name="user" type="text" 
                value={usuario.usuario} disabled 
                className="bg-gray-200 cursor-not-allowed"
            />
            <Input label="Nombre"
                name="name"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <div className="border border-gray-200 rounded-lg p-2 ">
                <div className="flex items-center justify-between   cursor-pointer hover:bg-gray-50"
                 onClick={() => activarCampo("password")}>
                    <h2 className="font-semibold ">Cambiar contraseña</h2>

                    <span className="text-sm">
                        {camposEditables.password ? "▲" : "▼"}
                    </span>
                </div>
                {camposEditables.password && (
                 <div className="flex flex-col gap-4" >
                    <Input label="Contraseña" 
                        name="password" 
                        type="password" 
                        placeholder="Introduzca la nueva contraseña" 
                        required={camposEditables.password} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input label="Confirmar Contraseña" 
                        name="confirmPassword" 
                        type="password" 
                        placeholder="Confirme la nueva contraseña" 
                        required={camposEditables.password} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>)}
            </div>
            {/* Aquí irían los campos del formulario 
            <div className="border border-gray-200 rounded-lg p-2">
                <div className="flex items-center justify-between   cursor-pointer hover:bg-gray-50"
                onClick={() => activarCampo("perfil")}>
                    <h2 className="font-semibold ">Cambiar perfil</h2>
                    <span className="text-sm">
                        {camposEditables.perfil ? "▲" : "▼"}
                    </span>
                </div>
                {camposEditables.perfil && (<Select label="Perfiles" name="perfil" opciones={usuario.perfiles}/>)}
            </div>
            */}
            <div className="border border-gray-200 rounded-lg p-2">
                <div className="flex items-center justify-between   cursor-pointer hover:bg-gray-50"
                onClick={() => activarCampo("estado")}>
                    <h2 className="font-semibold ">Cambiar estado</h2>
                    <span className="text-sm">{camposEditables.estado ? "▲" : "▼"}</span>
                </div>
                {camposEditables.estado && (
                    <Select label="Estado" name="estado" 
                        onChange={(e) => setEstado(e.target.value as EstadoUsuario)}
                        opciones={opcionesEstadoUsuario}
                        
                        value={estado}
                        
                    />)}
                    
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Btn type="submit">
                    Guardar Cambios
                </Btn>
                <Btn variant="cancel" type="button" onClick={onCancel} >
                    Cancelar
                </Btn>
            </div>
            
        </Formulario>
    );
};

export default EditarUsuarioForm;
