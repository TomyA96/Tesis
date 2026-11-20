import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { Transform, Type } from "class-transformer";

/*
    Quita los espacios de los extremos ANTES de validar: así "   " llega vacío a
    IsNotEmpty y se rechaza. Si el valor no es texto lo deja igual, para que
    IsString sea la regla que lo rechace.
*/
export const limpiarTexto = ({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value;

export class CreateJornadaDto {
    @IsOptional()
    @Transform(limpiarTexto)
    @IsString()
    @MaxLength(100)
    nombre?: string;

    @Transform(limpiarTexto)
    @IsString()
    @IsNotEmpty()
    direccion!: string;

    // El JSON manda las fechas como string: Type las convierte a Date antes de validar
    @Type(() => Date)
    @IsDate()
    fechaHoraInicio!: Date;

    @Type(() => Date)
    @IsDate()
    fechaHoraFin!: Date;

    @IsInt()
    @Min(1)
    // Tope razonable: más que esto no entra en la base (y daba un error 500)
    @Max(100_000, { message: 'La capacidad no puede superar las 100.000 personas' })
    capacidad!: number;
}
