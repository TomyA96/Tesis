import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermisoPerfilService {
    constructor(private prisma: PrismaService) {}

    findByPerfil(idPerfil: number) {
        return this.prisma.permisoPerfil.findMany({
            where: { idPerfil }
        })}

}
