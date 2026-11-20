import { IsOptional, IsString, IsNumber, Min, Max, IsInt, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";
import { limpiarTexto } from "../../jornadas/dtos/create.jornada.dto";


export class UpdateEntradaDto {
    @IsOptional()
    @Transform(limpiarTexto)
    @IsString()
    @IsNotEmpty()
    descripcion?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    // Mismo tope que la boletería: más que esto no entra en la base (y daba un error 500)
    @Max(100_000_000, { message: 'El precio no puede superar los $100.000.000' })
    precio?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    cantidad?: number;
}