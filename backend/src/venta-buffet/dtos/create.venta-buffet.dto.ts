import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, Max, Min, ValidateNested } from "class-validator";
import { MedioPagoBuffet } from "@prisma/client";

/*
    Un renglón de la venta: qué producto y cuántos. El precio NO viene acá:
    lo pone el backend con el precio guardado del producto, así nadie puede
    cobrar un monto distinto desde la pantalla.
*/
class ItemVentaBuffetDto {
    @IsInt()
    idProducto!: number;

    @IsInt()
    @Min(1)
    @Max(99)
    cantidad!: number;
}

/*
    Lo que manda la caja al registrar una venta. La jornada viene de la URL y
    el usuario del token: no se aceptan en el cuerpo.
*/
export class CreateVentaBuffetDto {
    @IsEnum(MedioPagoBuffet, { message: "Elegí el medio de pago: Efectivo, Tarjeta o QR" })
    medioPago!: MedioPagoBuffet;

    @IsArray()
    @ArrayNotEmpty({ message: "La venta no tiene productos" })
    @ValidateNested({ each: true })
    @Type(() => ItemVentaBuffetDto)
    items!: ItemVentaBuffetDto[];
}
