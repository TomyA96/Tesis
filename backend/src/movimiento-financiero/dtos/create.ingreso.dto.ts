import { TipoMovimiento } from '@prisma/client';
import { Type } from 'class-transformer';

import { IsDate, IsNumber, IsString, Min, IsInt, IsOptional  } from 'class-validator';


export class CreateIngresoDto {
    @IsInt()
    idEvento!: number;

    @IsInt()
    idRubro!: number;

    @IsInt()
    idFuente!: number;

    @IsOptional()
    @IsString()
    nroFactura?: string;

    @Type(() => Date)
    @IsDate()
    fecha!: Date;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    monto!: number;
    
    @IsString()
    @IsOptional()
    descripcion?: string;
}