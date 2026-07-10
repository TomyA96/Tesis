import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePerfilDto {
    @IsNotEmpty()
    @IsString()
    nombre!: string;

    @IsString()
    descripcion!: string;
}