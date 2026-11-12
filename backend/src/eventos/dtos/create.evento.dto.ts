import { IsString, IsOptional, IsArray, ArrayMinSize, ValidateNested, IsNotEmpty } from "class-validator";
import { Transform, Type } from "class-transformer";
import { CreateJornadaDto, limpiarTexto } from "../../jornadas/dtos/create.jornada.dto";

export class CreateEventoDto {
    @Transform(limpiarTexto)
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsOptional()
    @Transform(limpiarTexto)
    @IsString()
    descripcion?: string;

    @IsArray()
    @ArrayMinSize(1)
    // Valida cada elemento con las reglas de CreateJornadaDto; Type indica qué clase instanciar
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaDto)
    jornadas!: CreateJornadaDto[];
}
