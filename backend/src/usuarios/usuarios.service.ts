import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoUsuario } from '@prisma/client';
import { CreateUsuarioDto } from './dtos/create.usuario.dto';
import { UpdateUsuarioDto } from './dtos/update.usuario.dto';
import * as bcrypt from 'bcrypt'



@Injectable()
export class UsuariosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.usuario.findMany();
    }

    findOne(id: number) {
        return this.prisma.usuario.findUnique({ where: { id } });
    }

    findByUser(usuario: string) {
    return this.prisma.usuario.findUnique({
        where: { usuario }})
    }

    async getPermissionsUser(id: number): Promise<string[]> {
        const permissions = await this.prisma.usuarioPerfil.findMany({
            where: { idUsuario: id },
            include: {
                perfil: {
                    include: {
                        permisos: {
                            include: {
                                permiso: true,
                            },
                        },
                    },
                }
            }
        })
        
        const permissionsUser = (permissions.flatMap((up) => up.perfil.permisos.map((p) => p.permiso.codigo)));
        
        return [...new Set(permissionsUser)];
    }

    async create(data: CreateUsuarioDto) {
        const hashPassword = await bcrypt.hash(data.password, 10)

            return this.prisma.usuario.create({ data:{...data, password: hashPassword }});
        }
    
    update(id: number, data: UpdateUsuarioDto) {
        
            return this.prisma.usuario.update({
                where: { id },
                data
            })
        }
    updateLastLogin(id: number){
        return this.prisma.usuario.update({
            where:{id},
            data: {ultimoAcceso: new Date()}
        })
    }

    remove(id: number) {
        return this.prisma.usuario.delete({
            where: { id }
        })
    }
}
