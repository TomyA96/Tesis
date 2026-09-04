import { IsOptional, IsString, IsNumber, Min, IsInt, ValidateIf } from "class-validator";


export class UpdateEntradaDto {
    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    precio?: number;

    @ValidateIf((entrada) => entrada.esFisica)
    @IsInt()
    @Min(1)
    cantidad?: number;
}