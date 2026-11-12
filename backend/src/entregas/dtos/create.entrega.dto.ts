import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

// Cuántos tickets de un lote se le dan al local: se toman los que están en mano, de número más bajo
export class ItemEntregaDto {
    @IsInt()
    idEntrada!: number;

    @IsInt()
    @Min(1, { message: 'La cantidad de cada lote tiene que ser al menos 1' })
    cantidad!: number;
}

export class CreateEntregaDto {
    @IsInt()
    idEvento!: number;

    @IsInt()
    idPuntoVenta!: number;

    @IsArray()
    @ArrayNotEmpty({ message: 'Cargá la cantidad en al menos un lote' })
    @ValidateNested({ each: true })
    @Type(() => ItemEntregaDto)
    items!: ItemEntregaDto[];

    @IsOptional()
    @IsString()
    @MaxLength(500)
    observacion?: string;
}
