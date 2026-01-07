import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Select from "../../../ui/componentes/Select";
import Btn from "../../../ui/componentes/Btn";
type PerfilesProps = {
    perfiles: {label: string; value: string | number}[];
}

const CrearUsuarioForm = ({perfiles}: PerfilesProps) => {
    return(
        <Formulario >
            
            {/* Aquí irían los campos del formulario */}
            <Input label="Nombre de Usuario" name="username" placeholder="Introduzca el nombre de usuario" type="text" required />
            <Select label="Perfiles" name="perfil" opciones={perfiles} required/>
            <Input label="Contraseña" name="password" type="password" placeholder="Introduzca la contraseña" required />
            <Input label="Confirmar Contraseña" name="confirmPassword" type="password" placeholder="Confirme la contraseña" required />
            
            <Btn type="submit">
                Crear Usuario
            </Btn>
        </Formulario>
    );

}

export default CrearUsuarioForm;