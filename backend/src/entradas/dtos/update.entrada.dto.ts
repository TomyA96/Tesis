import { IsOptional, IsString, IsNumber, Min, IsInt, IsNotEmpty } from "class-validator";
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
    precio?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    cantidad?: number;
}