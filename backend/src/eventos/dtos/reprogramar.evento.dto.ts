import { IsDate } from "class-validator";
import { Type } from "class-transformer";

/*
    A diferencia de UpdateEventoDto, acá las fechas son obligatorias:
    reprogramar sin proponer una fecha nueva no tiene sentido — para
    reactivar sin cambiar nada, esa sería la Opción A que no elegimos.
*/
export class ReprogramarEventoDto {
    @Type(() => Date)
    @IsDate()
    fechaHoraInicio!: Date;

    @Type(() => Date)
    @IsDate()
    fechaHoraFin!: Date;
}
