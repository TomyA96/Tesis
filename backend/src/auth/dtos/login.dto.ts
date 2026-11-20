import { IsString, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import { normalizarUsuario } from "../../usuarios/dtos/create.usuario.dto";

export class LoginDto {
    // Igual que al crearlo: sin espacios en los extremos y en minúsculas ("Admin" entra como "admin")
    @Transform(normalizarUsuario)
    @IsString({ message: 'El usuario tiene que ser texto' })
    @IsNotEmpty({ message: 'Ingresá el usuario' })
    usuario!: string;
    @IsString({ message: 'La contraseña tiene que ser texto' })
    @IsNotEmpty({ message: 'Ingresá la contraseña' })
    password!:string;
}