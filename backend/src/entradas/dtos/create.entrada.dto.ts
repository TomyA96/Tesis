import { IsInt, IsString, IsNumber, IsBoolean, Min, Max, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import { limpiarTexto } from "../../jornadas/dtos/create.jornada.dto";


export class CreateEntradaDto {

    @IsInt()
    idJornada!: number;

    // Se recortan los espacios antes de validar: "   " llega vacío y se rechaza
    @Transform(limpiarTexto)
    @IsString()
    @IsNotEmpty()
    descripcion!: string;


    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    // Mismo tope que la boletería: más que esto no entra en la base (y daba un error 500)
    @Max(100_000_000, { message: 'El precio no puede superar los $100.000.000' })
    precio!: number;

    @IsBoolean()
    esFisica!: boolean;

    // Obligatoria para los dos tipos: es la cantidad de tickets que se crean
    // al publicar (online) o imprimir (física) el lote
    @IsInt()
    @Min(1)
    cantidad!: number;
}
