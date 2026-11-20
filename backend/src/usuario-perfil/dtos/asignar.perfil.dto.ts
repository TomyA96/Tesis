import { IsInt } from 'class-validator';

// Asignarle un perfil a un usuario: los dos ids tienen que ser números enteros
export class AsignarPerfilDto {
    @IsInt({ message: 'El usuario tiene que indicarse con su id (un número)' })
    idUsuario!: number;

    @IsInt({ message: 'El perfil tiene que indicarse con su id (un número)' })
    idPerfil!: number;
}
