import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import { administradorActivo, exigirOtroAdministrador } from '../usuarios/utils/administradores';
import { validarPerfilesQueCambian } from '../usuarios/utils/delegacion';

@Injectable()
export class UsuarioPerfilService {
    constructor(private prisma: PrismaService) {}

    findByUsuario (idUsuario: number) {
        return this.prisma.usuarioPerfil.findMany({
            where: { idUsuario} ,
            include: { perfil: true }
        })
    }

    findByPerfil (idPerfil: number) {
        return this.prisma.usuarioPerfil.findMany({
            where: { idPerfil} ,
            include: { usuario: true }
        })
    }

    // Misma regla que al editar un usuario: solo se asignan perfiles cuyos permisos ya tiene quien asigna
    async create (data: { 
        idUsuario: number,
        idPerfil: number}, idUsuarioActual: number) 
        {
        // A un usuario eliminado no se le asignan perfiles: para el sistema ya no existe
        const usuario = await this.prisma.usuario.findUnique({ where: { id: data.idUsuario }, select: { eliminado: true } });
        if (!usuario || usuario.eliminado) {
            throw new NotFoundException('Usuario no encontrado');
        }
        const perfil = await this.prisma.perfil.findUnique({ where: { id: data.idPerfil }, select: { id: true } });
        if (!perfil) {
            throw new NotFoundException('No existe el perfil');
        }
        await validarPerfilesQueCambian(this.prisma, idUsuarioActual, { agregados: [data.idPerfil], quitados: [] });
        const yaLoTiene = await this.prisma.usuarioPerfil.findUnique({
            where: { idPerfil_idUsuario: { idPerfil: data.idPerfil, idUsuario: data.idUsuario } },
        });
        if (yaLoTiene) {
            throw new ConflictException('El usuario ya tiene ese perfil');
        }
        return this.prisma.usuarioPerfil.create({
            data})
    }

    async remove(idUsuario: number, idPerfil: number, idUsuarioActual: number) {
        const asignacion = await this.prisma.usuarioPerfil.findUnique({
            where: { idPerfil_idUsuario: { idPerfil, idUsuario } },
        });
        if (!asignacion) {
            throw new NotFoundException('El usuario no tiene ese perfil');
        }
        await validarPerfilesQueCambian(this.prisma, idUsuarioActual, { agregados: [], quitados: [idPerfil] });
        // Quitarle el perfil Administrador al último administrador activo dejaría el sistema sin nadie que lo administre
        const perfil = await this.prisma.perfil.findUnique({ where: { id: idPerfil }, select: { esAdministrador: true } });
        if (perfil?.esAdministrador) {
            const esAdministrador = await this.prisma.usuario.count({ where: { ...administradorActivo(), id: idUsuario } });
            if (esAdministrador > 0) {
                await exigirOtroAdministrador(this.prisma, idUsuario);
            }
        }
        return this.prisma.usuarioPerfil.delete({
            where: {
                idPerfil_idUsuario: {
                    idPerfil,
                    idUsuario
                }
            }
        })
    }
}
