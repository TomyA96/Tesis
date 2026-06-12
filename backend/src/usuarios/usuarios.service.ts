import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoUsuario } from '@prisma/client';


@Injectable()
export class UsuariosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.usuario.findMany();
    }

    findOne(id: number) {
        return this.prisma.usuario.findUnique({ where: { id } });
    }

    create(data: {
        usuario: string,
        nombre: string,
        password: string,
        estado?: EstadoUsuario;})
        {
            return this.prisma.usuario.create({ data });
        }
    
    update(id: number, data: { 
        usuario?: string, 
        nombre?: string, 
        password?: string, 
        estado?: EstadoUsuario }) 
        {
            return this.prisma.usuario.update({
                where: { id },
                data
            })
        }

    remove(id: number) {
        return this.prisma.usuario.delete({
            where: { id }
        })
    }
}
