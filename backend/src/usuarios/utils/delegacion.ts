import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type Db = Prisma.TransactionClient;

/*
    Los permisos de un usuario: la unión de los de todos sus perfiles. Con el
    perfil Administrador son todos los del sistema, incluidos los que se
    agreguen después (no depende de que el perfil tenga cargada cada fila).
*/
export const permisosDelUsuario = async (db: Db, idUsuario: number): Promise<Set<string>> => {
    const esAdministrador = await db.usuarioPerfil.count({
        where: { idUsuario, perfil: { esAdministrador: true } },
    });
    if (esAdministrador > 0) {
        return new Set((await db.permiso.findMany({ select: { codigo: true } })).map((p) => p.codigo));
    }
    const filas = await db.usuarioPerfil.findMany({
        where: { idUsuario },
        select: { perfil: { select: { permisos: { select: { permiso: { select: { codigo: true } } } } } } },
    });
    return new Set(filas.flatMap((f) => f.perfil.permisos.map((p) => p.permiso.codigo)));
};

/*
    "No podés dar más de lo que tenés" (principio de mínimo privilegio): quien
    asigna o quita un perfil tiene que tener todos los permisos de ese perfil.
    Si no, alguien con permiso para editar usuarios podría darse a sí mismo
    (o a una cuenta que maneja) un perfil con más poder que el suyo. Quitar
    sigue la misma regla: así nadie deja sin acceso a otro usando un perfil
    que no le corresponde.

    Solo se revisan los perfiles que CAMBIAN (los que se agregan o se quitan):
    editar el nombre o la contraseña de alguien no falla porque ese alguien
    tenga un perfil más alto.
*/
export const validarPerfilesQueCambian = async (
    db: Db,
    idUsuarioActual: number,
    cambios: { agregados: number[]; quitados: number[] },
) => {
    const ids = [...new Set([...cambios.agregados, ...cambios.quitados])];
    if (ids.length === 0) return;

    const propios = await permisosDelUsuario(db, idUsuarioActual);
    const todos = (await db.permiso.findMany({ select: { codigo: true } })).map((p) => p.codigo);
    const perfiles = await db.perfil.findMany({
        where: { id: { in: ids } },
        select: { id: true, nombre: true, esAdministrador: true, permisos: { select: { permiso: { select: { codigo: true } } } } },
    });

    for (const perfil of perfiles) {
        // El perfil Administrador tiene todos los permisos, aunque le falte alguna fila
        const delPerfil = perfil.esAdministrador ? todos : perfil.permisos.map((p) => p.permiso.codigo);
        const faltan = delPerfil.filter((codigo) => !propios.has(codigo));
        if (faltan.length > 0) {
            const accion = cambios.agregados.includes(perfil.id) ? 'asignar' : 'quitar';
            const lista = faltan.slice(0, 5).join(', ') + (faltan.length > 5 ? ` y ${faltan.length - 5} más` : '');
            throw new ForbiddenException(
                `No podés ${accion} el perfil «${perfil.nombre}»: incluye permisos que vos no tenés (${lista})`,
            );
        }
    }
};
