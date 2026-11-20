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
import { EstadoFuenteIngreso } from '@prisma/client';

export class CreateFuenteDto {
    // Se recortan los espacios antes de validar (y antes de comparar con los que ya existen)
    @Transform(limpiarTexto)
    @IsString({ message: 'El nombre tiene que ser texto' })
    @IsNotEmpty({ message: 'Ingresá el nombre de la fuente de ingreso' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
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

    // Si no viene, el service lo crea como Activo (mismo criterio que proveedores)
    @IsOptional()
    @IsEnum(EstadoFuenteIngreso, { message: 'El estado debe ser Activo o Bloqueado' })
    estado?: EstadoFuenteIngreso;

    @IsArray({ message: 'Los rubros tienen que venir en una lista' })
    @ArrayNotEmpty({ message: 'Debe seleccionar al menos un rubro' })
    @ArrayUnique({ message: 'No se puede repetir un rubro' })
    @IsInt({ each: true, message: 'Cada rubro tiene que indicarse con su id (un número)' })
    idsRubros!: number[];
}
