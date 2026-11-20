import { EstadoUsuario } from '@prisma/client';
import { ArrayUnique, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

/*
    El nombre de usuario se guarda sin espacios en los extremos y siempre en
    minúsculas: así "Juan" y "juan" no pueden ser dos cuentas distintas, y el
    login no distingue mayúsculas. Si no es texto lo deja igual, para que la
    regla de tipo sea la que lo rechace.
*/
export const normalizarUsuario = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value;

const limpiarTexto = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Letras, números, punto, guion y guion bajo; sin espacios
export const FORMATO_USUARIO = /^[a-z0-9._-]{3,30}$/;


export class CreateUsuarioDto {
    @Transform(normalizarUsuario)
    @IsString({ message: 'El usuario tiene que ser texto' })
    @Matches(FORMATO_USUARIO, {
        message: 'El usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo, sin espacios',
    })
    usuario!: string

    @Transform(limpiarTexto)
    @IsString({ message: 'El nombre completo tiene que ser texto' })
    @IsNotEmpty({ message: 'Ingresá el nombre completo' })
    @MinLength(3, { message: 'El nombre completo debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El nombre completo no puede superar los 100 caracteres' })
    nombre!: string

    @IsString({ message: 'La contraseña tiene que ser texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password!: string

    @IsOptional()
    @IsEnum(EstadoUsuario, { message: 'El estado debe ser Activo, Inactivo o Bloqueado' })
    estado?: EstadoUsuario;

    @IsOptional()
    @IsArray({ message: 'Los perfiles tienen que venir en una lista' })
    @ArrayUnique({ message: 'No se puede repetir un perfil' })
    @IsInt({ each: true, message: 'Cada perfil tiene que indicarse con su id (un número)' })   // each: true valida cada elemento del array
    idPerfiles?: number[]
}