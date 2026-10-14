import { IsArray, IsInt } from 'class-validator';

/*
    La lista completa de productos que tiene que quedar asignada al evento.
    Puede venir vacía: es la forma de dejar el evento sin productos.
*/
export class AsignarProductosDto {
    @IsArray()
    @IsInt({ each: true })
    idsProductos!: number[];
}
