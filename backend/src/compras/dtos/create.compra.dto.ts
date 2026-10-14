import { Transform, Type } from "class-transformer";
import {
    ArrayNotEmpty, IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional,
    IsString, Matches, Max, Min, ValidateNested,
} from "class-validator";

// Quita espacios de los extremos; si no es texto lo deja igual para que
// la regla de tipo (IsString, IsEmail...) sea la que lo rechace.
const limpiarTexto = ({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value;

// Una entrada de la compra: qué tipo de entrada y cuántas. El precio NO viene
// acá: lo calcula el backend a partir de la entrada guardada en la base.
// (El tope de 10 por entrada repite el de MAX_POR_COMPRA del frontend.)
class EntradaCompraDto {
    @IsInt()
    idEntrada!: number;

    @IsInt()
    @Min(1)
    @Max(10)
    cantidad!: number;
}

class CompradorDto {
    @Transform(limpiarTexto)
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    // 7 u 8 dígitos, sin puntos (mismo criterio que el formulario del frontend).
    @Transform(limpiarTexto)
    @Matches(/^\d{7,8}$/, { message: "El DNI debe tener 7 u 8 números, sin puntos" })
    dni!: string;

    // Se guarda en minúsculas y sin espacios.
    @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
    @IsEmail()
    email!: string;

    @IsOptional()
    @Transform(limpiarTexto)
    @IsString()
    telefono?: string;
}

export class CreateCompraDto {
    @IsInt()
    idEvento!: number;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => EntradaCompraDto)
    entradas!: EntradaCompraDto[];

    @ValidateNested()
    @Type(() => CompradorDto)
    comprador!: CompradorDto;
}
