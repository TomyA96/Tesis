import { IsDate,  IsString, IsOptional,  IsInt } from "class-validator";
import { Type } from "class-transformer";
import { EstadoEvento } from "@prisma/client";

export class CreateEventoDto {
    @IsString()
    nombre!: string;

    @Type(() => Date)
    @IsDate()
    fechaHoraInicio!: Date;

    @Type(() => Date)
    @IsDate()
    fechaHoraFin!: Date;

    @IsString()
    ubicacion!: string;
    @IsString()
    @IsOptional()
    direccion?: string;

    @IsInt()
    capacidad!: number;

    @IsOptional()
    @IsString()
    descripcion?: string;

}