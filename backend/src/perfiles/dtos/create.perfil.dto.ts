import { IsArray, IsInt, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';

export class CreatePerfilDto {
    @IsNotEmpty()
    @IsString()
    nombre!: string;

    @IsString()
    descripcion!: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({each: true})
    idsPermisos!: number[]
}