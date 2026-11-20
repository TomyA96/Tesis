import {
    ArrayNotEmpty,
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    MaxLength,
    ArrayUnique,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { limpiarTexto, normalizarEmail } from '../../utils/texto';
import { EstadoProveedor } from '@prisma/client';

export class CreateProveedorDto {
    // Se recortan los espacios antes de validar (y antes de comparar con los que ya existen)
    @Transform(limpiarTexto)
    @IsString({ message: 'El nombre tiene que ser texto' })
    @IsNotEmpty({ message: 'Ingresá el nombre del proveedor' })
    @MinLength(3, { message: 'El nombre del proveedor debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
    nombre!: string;

    // Sin espacios y en minúsculas: "AUDIO@x.com" y "audio@x.com" son el mismo email
    @Transform(normalizarEmail)
    @IsOptional()
    @IsEmail({}, { message: 'El email no tiene un formato válido' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'El teléfono tiene que ser texto' })
    telefono?: string;

    /*
        El estado es opcional: si no viene, el service lo crea como Activo.
        No lo pedimos en el formulario de alta porque un proveedor nuevo
        siempre nace activo — bloquearlo es una acción posterior.
    */
    @IsOptional()
    @IsEnum(EstadoProveedor, { message: 'El estado debe ser Activo o Bloqueado' })
    estado?: EstadoProveedor;

    /*
        Mismo criterio que los permisos de un perfil: un proveedor sin rubro no
        sirve para nada (no sabríamos contra qué imputar sus movimientos), así
        que exigimos al menos uno.
    */
    @IsArray({ message: 'Los rubros tienen que venir en una lista' })
    @ArrayNotEmpty({ message: 'Debe seleccionar al menos un rubro' })
    @ArrayUnique({ message: 'No se puede repetir un rubro' })
    @IsInt({ each: true, message: 'Cada rubro tiene que indicarse con su id (un número)' })
    idsRubros!: number[];
}
