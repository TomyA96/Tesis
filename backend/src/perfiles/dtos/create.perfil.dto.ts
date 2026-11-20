import { IsArray, IsInt, IsNotEmpty, IsString, ArrayNotEmpty, ArrayUnique, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { limpiarTexto } from '../../utils/texto';

export class CreatePerfilDto {
    // Se recortan los espacios antes de validar: "    " llega vacío y se rechaza
    @Transform(limpiarTexto)
    @IsNotEmpty({ message: 'Ingresá el nombre del perfil' })
    @IsString({ message: 'El nombre del perfil tiene que ser texto' })
    @MinLength(3, { message: 'El nombre del perfil debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'El nombre del perfil no puede superar los 50 caracteres' })
    nombre!: string;

    @Transform(limpiarTexto)
    @IsString({ message: 'La descripción tiene que ser texto' })
    @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
    descripcion!: string;

    @IsArray({ message: 'Los permisos tienen que venir en una lista' })
    @ArrayNotEmpty({ message: 'Seleccioná al menos un permiso' })
    // Un permiso repetido no suma nada y rompía el alta con un mensaje equivocado
    @ArrayUnique({ message: 'No se puede repetir un permiso' })
    @IsInt({ each: true, message: 'Cada permiso tiene que indicarse con su id (un número)' })
    idsPermisos!: number[]
}