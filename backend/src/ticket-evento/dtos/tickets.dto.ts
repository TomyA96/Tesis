import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

// Los tickets elegidos en la pantalla (uno, varios o un rango: al backend siempre le llegan los ids)
export class IdsTicketsDto {
    @IsArray()
    @ArrayNotEmpty({ message: 'Elegí al menos un ticket' })
    @IsInt({ each: true })
    idsTickets!: number[];
}

export class AsignarTicketsDto extends IdsTicketsDto {
    @IsInt({ message: 'Elegí el punto de venta' })
    idPuntoVenta!: number;
}
