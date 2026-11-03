import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateJornadaDto {
    @IsOptional()
    @IsString()
    nombre?: string;

    @IsString()
    @IsNotEmpty()
    direccion!: string;

    // El JSON manda las fechas como string: Type las convierte a Date antes de validar
    @Type(() => Date)
    @IsDate()
    fechaHoraInicio!: Date;

    @Type(() => Date)
    @IsDate()
    fechaHoraFin!: Date;

    @IsInt()
    @Min(1)
    capacidad!: number;
}
