import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { EstadoPuntoVenta } from '@prisma/client';

export class CreatePuntoVentaDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'El nombre del punto de venta debe tener al menos 3 caracteres' })
    nombre!: string;

    @IsOptional()
    @IsString()
    telefono?: string;

    // Si no viene, el service lo crea como Activo (mismo criterio que proveedores)
    @IsOptional()
    @IsEnum(EstadoPuntoVenta, { message: 'El estado debe ser Activo o Inactivo' })
    estado?: EstadoPuntoVenta;
}
