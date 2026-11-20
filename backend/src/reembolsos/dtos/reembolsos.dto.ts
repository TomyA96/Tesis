import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayNotEmpty, ArrayUnique, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { MedioDevolucion } from '@prisma/client';

const limpiar = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/*
    Buscar el ticket de quien pide la devolución, de UNA de estas formas:
    - el código QR (escaneado con el lector o pegado),
    - el lote y el número impreso en el papel,
    - el número de orden o el DNI del comprador online.
*/
export class BuscarTicketsDto {
    @IsInt()
    idEvento!: number;

    @IsOptional()
    @Transform(limpiar)
    @IsString()
    @IsNotEmpty()
    codigoQR?: string;

    @IsOptional()
    @IsInt()
    idEntrada?: number;

    @IsOptional()
    @Transform(limpiar)
    @IsString()
    @IsNotEmpty()
    numero?: string;

    @IsOptional()
    @IsInt()
    idOrden?: number;

    @IsOptional()
    @Transform(limpiar)
    @Matches(/^\d{7,8}$/, { message: 'El DNI debe tener 7 u 8 números, sin puntos' })
    dni?: string;
}

// Cargar la solicitud de los tickets que presentó la persona (o que pidió por otro medio)
export class RegistrarReembolsoDto {
    @IsInt()
    idEvento!: number;

    @IsArray()
    @ArrayNotEmpty({ message: 'Elegí al menos un ticket' })
    @ArrayUnique()
    @ArrayMaxSize(50)
    @IsInt({ each: true })
    idsTickets!: number[];

    @Transform(limpiar)
    @IsString()
    @IsNotEmpty({ message: 'Ingresá el motivo' })
    @MaxLength(300)
    motivo!: string;
}

// Aprobar una o varias solicitudes de una vez (por ejemplo, todas las de una cancelación)
export class AprobarReembolsosDto {
    @IsInt()
    idEvento!: number;

    @IsArray()
    @ArrayNotEmpty({ message: 'Elegí al menos una solicitud' })
    @ArrayUnique()
    @IsInt({ each: true })
    ids!: number[];

    @IsEnum(MedioDevolucion, { message: 'Elegí cómo se devuelve la plata: Mercado Pago, efectivo o transferencia' })
    medioDevolucion!: MedioDevolucion;
}

export class RechazarReembolsoDto {
    @Transform(limpiar)
    @IsString()
    @IsNotEmpty({ message: 'Explicá por qué se rechaza' })
    @MaxLength(300)
    comentario!: string;
}
