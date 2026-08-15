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
import { EstadoProveedor } from '@prisma/client';

export class CreateProveedorDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'El nombre del proveedor debe tener al menos 3 caracteres' })
    nombre!: string;

    @IsOptional()
    @IsEmail({}, { message: 'El email no tiene un formato válido' })
    email?: string;

    @IsOptional()
    @IsString()
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
    @IsArray()
    @ArrayNotEmpty({ message: 'Debe seleccionar al menos un rubro' })
    @IsInt({ each: true })
    idsRubros!: number[];
}
