import { ArrayMinSize, ArrayUnique, IsArray, IsInt } from "class-validator";
import { OmitType } from "@nestjs/mapped-types";
import { CreateEntradaDto } from "./create.entrada.dto";

/*
    Los datos de UNA entrada (sin idJornada, con las mismas validaciones) más
    la lista de jornadas donde crearla: se crea un lote igual en cada una.
*/
export class CreateEntradasLoteDto extends OmitType(CreateEntradaDto, ['idJornada'] as const) {
    @IsArray()
    @ArrayMinSize(1)
    // Una jornada repetida crearía dos lotes iguales en la misma jornada
    @ArrayUnique()
    @IsInt({ each: true })
    idsJornadas!: number[];
}
