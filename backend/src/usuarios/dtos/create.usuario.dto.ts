import { EstadoUsuario } from '@prisma/client';
import { ArrayUnique, IsArray, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';


export class CreateUsuarioDto {
    @IsString()
    usuario!: string

    @IsString()
    nombre!: string

    @IsString()
    @MinLength(6)
    password!: string

    @IsOptional()
    @IsEnum(EstadoUsuario)
    estado?: EstadoUsuario;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })   // each: true valida cada elemento del array
    idPerfiles?: number[]
}