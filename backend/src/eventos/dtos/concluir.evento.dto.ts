import { IsBoolean, IsOptional } from "class-validator";

/*
    Finalizar o cancelar un evento deja afuera a las jornadas que nunca se
    publicaron (Borrador). Borrarlas es irreversible, así que solo se hace si
    el cliente lo pide de forma explícita; si no, la operación se rechaza.
*/
export class ConcluirEventoDto {
    @IsOptional()
    @IsBoolean()
    descartarBorradores?: boolean;
}
