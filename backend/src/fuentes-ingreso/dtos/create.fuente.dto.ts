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
} from 'class-validator';
import { EstadoFuenteIngreso } from '@prisma/client';

export class CreateFuenteDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    nombre!: string;

    @IsOptional()
    @IsEmail({}, { message: 'El email no tiene un formato válido' })
    email?: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    // Si no viene, el service lo crea como Activo (mismo criterio que proveedores)
    @IsOptional()
    @IsEnum(EstadoFuenteIngreso, { message: 'El estado debe ser Activo o Bloqueado' })
    estado?: EstadoFuenteIngreso;

    @IsArray()
    @ArrayNotEmpty({ message: 'Debe seleccionar al menos un rubro' })
    @IsInt({ each: true })
    idsRubros!: number[];
}
