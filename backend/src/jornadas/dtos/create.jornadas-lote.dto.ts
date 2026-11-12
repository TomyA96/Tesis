import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateJornadaDto } from "./create.jornada.dto";

// Varias jornadas para agregar de una vez a un evento ya creado
export class CreateJornadasLoteDto {
    @IsArray()
    @ArrayMinSize(1)
    // Cada elemento se valida con las reglas de CreateJornadaDto
    @ValidateNested({ each: true })
    @Type(() => CreateJornadaDto)
    jornadas!: CreateJornadaDto[];
}
