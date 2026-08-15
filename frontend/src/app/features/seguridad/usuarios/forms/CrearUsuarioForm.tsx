import Formulario from "../../../../ui/componentes/Formulario";
import Input from "../../../../ui/componentes/Input";
//import Select from "../../../../ui/componentes/Select";
import Btn from "../../../../ui/componentes/Btn";
import type { FormEvent } from "react";
import { createUsuario } from "../../../../services/usuariosService";
import { useState } from "react";

type CreateUsuarioFormProps = {
    onCreated: () => void;
};

const CrearUsuarioForm = ({ onCreated }: CreateUsuarioFormProps) => {
    // Adentro de CrearUsuarioForm
    
    const [usuario, setUsuario] = useState("");
    const [nombre, setNombre] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }
        try {
            await createUsuario({ usuario, nombre, password });
            
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
                placeholder="Introduzca el nombre de usuario" 
                type="text" 
                required 
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
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Btn type="submit">
                Crear Usuario
            </Btn>
        </Formulario>
    );

}

export default CrearUsuarioForm;
