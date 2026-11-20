import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { limpiarTexto } from '../../utils/texto';
import { EstadoProducto, TipoProducto } from '@prisma/client';

export class CreateProductoDto {
    // Se recortan los espacios antes de validar (y antes de comparar con los productos que ya existen)
    @Transform(limpiarTexto)
    @IsString({ message: 'El nombre del producto tiene que ser texto' })
    @IsNotEmpty({ message: 'Ingresá el nombre del producto' })
    @MinLength(3, { message: 'El nombre del producto debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'El nombre del producto no puede superar los 100 caracteres' })
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
    @Max(100_000_000, { message: 'El precio no puede superar los $100.000.000' })
    precio!: number;

    // Si no viene, el service lo crea como Disponible.
    @IsOptional()
    @IsEnum(EstadoProducto, { message: 'El estado debe ser Disponible o Descontinuado' })
    estado?: EstadoProducto;
}
