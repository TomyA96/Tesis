import { IsString, IsOptional, IsArray, ArrayMinSize, ValidateNested, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";
import { CreateJornadaDto } from "../../jornadas/dtos/create.jornada.dto";

export class CreateEventoDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsArray()
    @ArrayMinSize(1)
    // Valida cada elemento con las reglas de CreateJornadaDto; Type indica qué clase instanciar
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaDto)
    jornadas!: CreateJornadaDto[];
}
