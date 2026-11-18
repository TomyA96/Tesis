import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { MedioPagoBuffet } from "@prisma/client";

/*
    Lo que manda la boletería al vender. El precio NO viene: lo pone el
    backend con el de la boletería. La jornada viene de la URL y quien vende
    del token.
*/
export class CreateVentaPuertaDto {
    // Un grupo que llega junto se cobra en una sola venta (mismo tope que la compra online)
    @IsInt({ message: "La cantidad tiene que ser un número entero" })
    @Min(1, { message: "Vendé al menos un ticket" })
    @Max(10, { message: "Se venden hasta 10 tickets por venta" })
    cantidad!: number;

    @IsEnum(MedioPagoBuffet, { message: "Elegí el medio de pago: Efectivo, Tarjeta o QR" })
    medioPago!: MedioPagoBuffet;

    /*
        Con la jornada llena (o que se llenaría con esta venta) la venta no se
        bloquea, pero quien vende tiene que aceptar la sobreventa: sin esto
        en true, el backend la rechaza y la pantalla pide confirmarla.
    */
    @IsOptional()
    @IsBoolean()
    confirmarSobreventa?: boolean;
}
