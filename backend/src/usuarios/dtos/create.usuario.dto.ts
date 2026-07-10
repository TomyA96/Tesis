import { EstadoUsuario } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';


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
}