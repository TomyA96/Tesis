import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsNumber, Max, Min } from "class-validator";

/*
    Configurar la boletería: solo el precio y en qué jornadas. El nombre
    ("General Boletería") y el tipo los pone el sistema, y no hay cantidad:
    los tickets se crean a medida que se venden en la puerta.
*/
export class ConfigurarBoleteriaDto {
    @IsArray()
    @ArrayMinSize(1, { message: "Elegí al menos una jornada" })
    @ArrayUnique()
    @IsInt({ each: true })
    idsJornadas!: number[];

    @IsNumber({ maxDecimalPlaces: 2 }, { message: "El precio tiene que ser un número con hasta 2 decimales" })
    @Min(0, { message: "El precio no puede ser negativo" })
    @Max(100_000_000, { message: "El precio es demasiado alto" })
    precio!: number;
}
