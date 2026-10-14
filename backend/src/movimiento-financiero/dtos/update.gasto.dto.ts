import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// Mismo criterio que UpdateIngresoDto, con proveedor en lugar de fuente
export class UpdateGastoDto {
    @IsOptional()
    @IsInt()
    idRubro?: number;

    @IsOptional()
    @IsInt()
    idProveedor?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    fecha?: Date;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto?: number;

    @IsOptional()
    @IsString()
    nroFactura?: string | null;

    @IsOptional()
    @IsString()
    descripcion?: string | null;
}
