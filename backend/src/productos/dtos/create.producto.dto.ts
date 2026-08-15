import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoProducto, TipoProducto } from '@prisma/client';

export class CreateProductoDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3, { message: 'El nombre del producto debe tener al menos 3 caracteres' })
    nombre!: string;

    @IsEnum(TipoProducto, { message: 'El tipo debe ser Comida o Bebida' })
    tipo!: TipoProducto;

    /*
        maxDecimalPlaces: 2 porque es plata. @Type(() => Number) convierte el
        valor por si llega como string desde el formulario.
    */
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio debe ser un número con hasta 2 decimales' })
    @Min(0, { message: 'El precio no puede ser negativo' })
    precio!: number;

    // Si no viene, el service lo crea como Disponible.
    @IsOptional()
    @IsEnum(EstadoProducto, { message: 'El estado debe ser Disponible o Descontinuado' })
    estado?: EstadoProducto;
}
