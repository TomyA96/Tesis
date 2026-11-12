import { IsInt, IsNotEmpty, IsString } from 'class-validator';

/*
    Ingreso manual, para supervisores, cuando el QR del ticket no se puede leer:
    el ticket se identifica por su lote y por el número impreso en el papel
    (el número es único dentro de cada lote).

    El ticket físico no trae el id del lote impreso, solo su descripción
    ("General", "VIP"): la pantalla muestra la lista de lotes de la jornada y
    manda el id del elegido.
*/
export class CreateAccesoManualDto {
    @IsInt()
    idEntrada!: number;

    @IsString()
    @IsNotEmpty()
    numero!: string;
}
