import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermisoPerfilService {
    constructor(private prisma: PrismaService) {}

    findByPerfil(idPerfil: number) {
        return this.prisma.permisoPerfil.findMany({
            where: { idPerfil },
            include: { permiso: true }
        })}

    
    async updatePermisos(idPerfil: number, idsPermisos: number[]) {
    return this.prisma.$transaction(async (tx) => {
        await tx.permisoPerfil.deleteMany({
            where: { idPerfil }
        })

        await tx.permisoPerfil.createMany({
            data: idsPermisos.map(idPermiso => ({ idPerfil, idPermiso }))
        })
    })}
}
