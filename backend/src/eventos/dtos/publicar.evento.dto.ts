import { IsBoolean, IsOptional } from "class-validator";

/*
    Publicar deja en Borrador las jornadas incompletas. Para que eso no pase
    sin que el usuario lo sepa, el cliente tiene que confirmarlo de forma
    explícita; si no lo hace y hay alguna incompleta, la operación se rechaza.
*/
export class PublicarEventoDto {
    @IsOptional()
    @IsBoolean()
    confirmarIncompletas?: boolean;
}
