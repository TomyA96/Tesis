import Formulario from "../../../../ui/componentes/Formulario";
import Input from "../../../../ui/componentes/Input";
//import Select from "../../../../ui/componentes/Select";
import Btn from "../../../../ui/componentes/Btn";
import type { FormEvent } from "react";
import { createUsuario } from "../../../../services/usuariosService";
import { useState } from "react";
import type { Perfil } from "../../../../services/perfilesService";
import SelectorPerfiles from "../components/SelectorPerfiles";
import { normalizarUsuario, validarNombreCompleto, validarUsuario } from "../utils/usuarioForm";

type CreateUsuarioFormProps = {
    onCreated: () => void;
    perfiles:  Perfil[] ; // Opcional, para el select de perfiles
};

const CrearUsuarioForm = ({ onCreated, perfiles }: CreateUsuarioFormProps) => {
    // Adentro de CrearUsuarioForm
    
    const [usuario, setUsuario] = useState("");
    const [nombre, setNombre] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [seleccionados, setSeleccionados] = useState<number[] | undefined>(undefined);
    

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        // Se manda como se va a guardar: sin espacios en los extremos y en minúsculas
        const usuarioNormalizado = normalizarUsuario(usuario);
        const problema = validarUsuario(usuarioNormalizado) ?? validarNombreCompleto(nombre);
        if (problema) {
            setError(problema);
            return;
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }
        try {
            await createUsuario({ usuario: usuarioNormalizado, nombre: nombre.trim(), password, idPerfiles: seleccionados });
            
            onCreated(); 
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el usuario");
        }

    
    };
    return(
        <Formulario className="min-w-sm" onSubmit={onSubmit} >
            
            {/* Aquí irían los campos del formulario */}
            <Input 
                label="Usuario" 
                name="username" 
                placeholder="Ej: juan.perez (se guarda en minúsculas)" 
                type="text" 
                required 
                autoComplete="off"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
            />

            <Input 
                label="Nombre" 
                name="name" 
                placeholder="Introduzca el nombre completo" 
                type="text" 
                
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            {/* <Select label="Perfiles" name="perfil" opciones={perfiles} required/> */}
            <Input 
                label="Contraseña" 
                name="password" 
                type="password" 
                placeholder="Introduzca la contraseña" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
                label="Confirmar Contraseña" 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirme la contraseña" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}   
            />
            <SelectorPerfiles perfiles={perfiles} 
                inicial={[]} 
                seleccionados={seleccionados} 
                onChange={setSeleccionados}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Btn type="submit">
                Crear Usuario
            </Btn>
        </Formulario>
    );

}

export default CrearUsuarioForm;
