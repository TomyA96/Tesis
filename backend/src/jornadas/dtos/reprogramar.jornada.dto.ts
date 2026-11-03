import { IsDate } from "class-validator";
import { Type } from "class-transformer";

/*
    A diferencia de UpdateJornadaDto, acá las fechas son obligatorias:
    reprogramar sin proponer una fecha nueva no tiene sentido.
*/
export class ReprogramarJornadaDto {
    @Type(() => Date)
    @IsDate()
    fechaHoraInicio!: Date;

    @Type(() => Date)
    @IsDate()
    fechaHoraFin!: Date;
}
