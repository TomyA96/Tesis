import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { TipoRubro } from '@prisma/client';

export class CreateRubroDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'El nombre del rubro debe tener al menos 3 caracteres' })
    nombre!: string;

    /*
        @IsEnum recibe el enum generado por Prisma (TipoRubro es un objeto en
        tiempo de ejecución, no solo un tipo de TS), así que si mandan un valor
        que no sea Ingreso/Gasto/Mixto el request se rechaza solo.
    */
    @IsEnum(TipoRubro, { message: 'El tipo debe ser Ingreso, Gasto o Mixto' })
    tipo!: TipoRubro;
}
