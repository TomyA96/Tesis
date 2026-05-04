import Formulario from "../../../../ui/componentes/Formulario";
import Input from "../../../../ui/componentes/Input";
import Btn from "../../../../ui/componentes/Btn";
import Select from "../../../../ui/componentes/Select";
import { useState } from "react";


type EditarUsuarioFormProps = {
    nombre: string;
    perfiles: {label: string; value: string | number}[];
    onCancel: () => void;
}

type camposEditables = {
    password: boolean;
    perfil: boolean;
    estado: boolean; 
}

const EditarUsuarioForm = ({nombre, perfiles, onCancel}: EditarUsuarioFormProps) => {
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
    return (
        <Formulario>
            {/* Aquí irían los campos del formulario */}
            <Input label="Nombre de Usuario" name="username" type="text" value={nombre} disabled className="bg-gray-200 cursor-not-allowed"/>
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
                    <Input label="Contraseña" name="password" type="password" placeholder="Introduzca la nueva contraseña" required={camposEditables.password} />
                    <Input label="Confirmar Contraseña" name="confirmPassword" type="password" placeholder="Confirme la nueva contraseña" required={camposEditables.password}/>
                </div>)}
            </div>
            
            <div className="border border-gray-200 rounded-lg p-2">
                <div className="flex items-center justify-between   cursor-pointer hover:bg-gray-50"
                onClick={() => activarCampo("perfil")}>
                    <h2 className="font-semibold ">Cambiar perfil</h2>
                    <span className="text-sm">
                        {camposEditables.perfil ? "▲" : "▼"}
                    </span>
                </div>
                {camposEditables.perfil && (<Select label="Perfiles" name="perfil" opciones={perfiles}/>)}
            </div>
            <div className="border border-gray-200 rounded-lg p-2">
                <div className="flex items-center justify-between   cursor-pointer hover:bg-gray-50"
                onClick={() => activarCampo("estado")}>
                    <h2 className="font-semibold ">Cambiar estado</h2>
                    <span className="text-sm">{camposEditables.estado ? "▲" : "▼"}</span>
                </div>
                {camposEditables.estado && (<Select label="Estado" name="estado" 
                opciones={[{label: "Activo", value: "activo"}, {label: "Inactivo", value: "inactivo"}, {label: "Bloqueado", value: "bloqueado"}]}/>)}
            </div>
            <Btn type="submit">
                Guardar Cambios
            </Btn>
            <Btn variant="cancel" type="button" onClick={onCancel} >
                Cancelar
            </Btn>
        </Formulario>
    );
};

export default EditarUsuarioForm;
