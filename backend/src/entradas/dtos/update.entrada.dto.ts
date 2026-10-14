import { IsOptional, IsString, IsNumber, Min, IsInt } from "class-validator";


export class UpdateEntradaDto {
    @IsOptional()
    @IsString()
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