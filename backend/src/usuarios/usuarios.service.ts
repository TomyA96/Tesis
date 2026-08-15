import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {  Prisma } from '@prisma/client';
import { CreateUsuarioDto } from './dtos/create.usuario.dto';
import { UpdateUsuarioDto } from './dtos/update.usuario.dto';
import * as bcrypt from 'bcrypt'



@Injectable()
export class UsuariosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.usuario.findMany({
            where: { eliminado: false },
        });
    }

    findOne(id: number) {
        return this.prisma.usuario.findUnique({ where: { id, eliminado: false  } });
    }

    findByUser(usuario: string) {
    return this.prisma.usuario.findUnique({
        where: { usuario, eliminado: false }
    })
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

        try {
            return await this.prisma.usuario.create({ data: { ...data, password: hashPassword } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Ese nombre de usuario ya existe');
            }
            throw error;
        }
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
        return this.prisma.usuario.update({
            where: { id },
            data: { eliminado: true }
        })
    }
}
