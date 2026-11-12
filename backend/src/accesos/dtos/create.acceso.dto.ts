import { IsNotEmpty, IsString } from 'class-validator';

/*
    Ingreso por escaneo: lo único que llega es el código que lee el lector de QR.

    La jornada viene de la URL y el usuario del token: no se aceptan en el
    cuerpo, así nadie puede registrar un ingreso en otra jornada ni a nombre de otro.
*/
export class CreateAccesoDto {
    @IsString()
    @IsNotEmpty()
    codigoQR!: string;
}
