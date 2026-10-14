import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

/*
    Todo opcional: viaja solo lo que se quiere cambiar.
    idEvento y tipoMovimiento no se editan: un ingreso no cambia de evento ni pasa a ser gasto.
    nroFactura y descripcion aceptan null para poder borrarlos (undefined = no tocar).
*/
export class UpdateIngresoDto {
    @IsOptional()
    @IsInt()
    idRubro?: number;

    @IsOptional()
    @IsInt()
    idFuente?: number;

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
