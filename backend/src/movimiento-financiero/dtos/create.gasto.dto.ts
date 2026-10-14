import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateGastoDto {
    @IsInt()
    idEvento!: number;

    @IsInt()
    idRubro!: number;

    @IsInt()
    idProveedor!: number;

    @IsOptional()
    @IsString()
    nroFactura?: string;

    @Type(() => Date)
    @IsDate()
    fecha!: Date;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto!: number;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
