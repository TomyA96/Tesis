import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type Db = Prisma.TransactionClient;

/*
    Reglas del perfil Administrador (Perfil.esAdministrador): es un perfil del
    sistema, tiene siempre todos los permisos y tiene que quedar al menos un
    usuario activo con él. Si no, nadie podría administrar el sistema.
*/

// Un usuario cuenta como administrador si no está borrado, está Activo y tiene el perfil
export const administradorActivo = (excluirIdUsuario?: number): Prisma.UsuarioWhereInput => ({
    eliminado: false,
    estado: 'Activo',
    perfiles: { some: { perfil: { esAdministrador: true } } },
    id: excluirIdUsuario === undefined ? undefined : { not: excluirIdUsuario },
});

/*
    Antes de un cambio que le saca a un usuario su condición de administrador
    activo (borrarlo, bloquearlo, desactivarlo o quitarle el perfil): tiene que
    quedar otro.
*/
export const exigirOtroAdministrador = async (db: Db, idUsuario: number) => {
    const otros = await db.usuario.count({ where: administradorActivo(idUsuario) });
    if (otros === 0) {
        throw new ConflictException(
            'Es el único administrador activo del sistema: asigná el perfil Administrador a otro usuario antes de hacer este cambio',
        );
    }
};
