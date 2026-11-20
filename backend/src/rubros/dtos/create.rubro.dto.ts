import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { TipoRubro } from '@prisma/client';
import { limpiarTexto } from '../../utils/texto';

export class CreateRubroDto {
    // Se recortan los espacios antes de validar (y antes de comparar con los rubros que ya existen)
    @Transform(limpiarTexto)
    @IsString({ message: 'El nombre del rubro tiene que ser texto' })
    @IsNotEmpty({ message: 'Ingresá el nombre del rubro' })
    @MinLength(3, { message: 'El nombre del rubro debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El nombre del rubro no puede superar los 100 caracteres' })
    nombre!: string;

    /*
        @IsEnum recibe el enum generado por Prisma (TipoRubro es un objeto en
        tiempo de ejecución, no solo un tipo de TS), así que si mandan un valor
        que no sea Ingreso/Gasto/Mixto el request se rechaza solo.
    */
    @IsEnum(TipoRubro, { message: 'El tipo debe ser Ingreso, Gasto o Mixto' })
    tipo!: TipoRubro;
}
