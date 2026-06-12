import { Injectable } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";

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

    create (data: { 
        idUsuario: number,
        idPerfil: number}) 
        {
        return this.prisma.usuarioPerfil.create({
            data})
    }

    remove(idUsuario: number, idPerfil: number) {
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
