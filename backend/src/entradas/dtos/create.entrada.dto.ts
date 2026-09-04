import { IsInt, IsString, IsNumber, IsBoolean, ValidateIf, Min } from "class-validator";


export class CreateEntradaDto {

    @IsInt()
    idEvento!: number;

    @IsString()
    descripcion!: string;


    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    precio!: number;

    @IsBoolean()
    esFisica!: boolean;

    // Obligatoria solo para físicas: el lote de tickets se genera con una
    // cantidad fija. Las online, sin cantidad, quedan limitadas únicamente
    // por la capacidad del evento.
    @ValidateIf((entrada) => entrada.esFisica)
    @IsInt()
    @Min(1)
    cantidad?: number;
}
