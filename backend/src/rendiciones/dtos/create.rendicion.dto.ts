import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TipoComision } from '@prisma/client';

export class CreateRendicionDto {
    @IsInt()
    idEvento!: number;

    @IsInt()
    idPuntoVenta!: number;

    /*
        Viajan los ids de los vendidos (no "los que le quedan"): si mientras
        se armaba la rendición alguien le asignó más tickets al local, esos
        nuevos no se cuentan como vendidos sin que nadie los haya visto.
    */
    @IsArray()
    @IsInt({ each: true })
    idsVendidos!: number[];

    // Los que el local devuelve: se anulan
    @IsArray()
    @IsInt({ each: true })
    idsDevueltos!: number[];

    @IsEnum(TipoComision, { message: 'La comisión tiene que ser Ninguna, Porcentaje o MontoFijo' })
    tipoComision!: TipoComision;

    // El porcentaje (Porcentaje) o el monto (MontoFijo). Con Ninguna no se manda.
    @IsOptional()
    @IsNumber({}, { message: 'La comisión tiene que ser un número' })
    @Min(0, { message: 'La comisión no puede ser negativa' })
    valorComision?: number;

    @IsNumber({}, { message: 'Ingresá el monto que entregó el local' })
    @Min(0, { message: 'El monto recibido no puede ser negativo' })
    montoRecibido!: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    observacion?: string;
}
