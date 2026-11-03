import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
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
            omit: { password: true},
            include: { perfiles: { select: { 
                idPerfil: true, 
                perfil: { select: { nombre: true } }
             } } },
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

    async createUser(data: CreateUsuarioDto) {
        const { idPerfiles, password, ...resto } = data
        const hashPassword = await bcrypt.hash(password, 10)

        try {
            return await this.prisma.usuario.create({ 
                data: {
                    ...resto,
                    password: hashPassword,
                    perfiles: idPerfiles?.length  ? { create: idPerfiles.map((id) => ({ idPerfil: id })) } : undefined
                }
             });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async updateUser(id: number, data: UpdateUsuarioDto) {
        const { idPerfiles, password, ...resto } = data

        try {
            return await this.prisma.usuario.update({
                where: { id },
                data: {
                    ...resto,
                    password: password ? await bcrypt.hash(password, 10) : undefined,
                    perfiles: idPerfiles === undefined
                        ? undefined
                        : {
                            deleteMany: {},   // borra todas las filas de este usuario
                            create: idPerfiles.map((idPerfil) => ({ idPerfil })),
                        },
                },
            })
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new ConflictException('Ese nombre de usuario ya existe');
            }
            if (error.code === 'P2003') {
                throw new BadRequestException('Alguno de los perfiles indicados no existe');
            }
            if (error.code === 'P2025') {
                throw new NotFoundException('Usuario no encontrado');
            }
        }
        throw error;
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
