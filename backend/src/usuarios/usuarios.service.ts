import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {  Prisma } from '@prisma/client';
import { CreateUsuarioDto } from './dtos/create.usuario.dto';
import { UpdateUsuarioDto } from './dtos/update.usuario.dto';
import * as bcrypt from 'bcrypt'
import { administradorActivo, exigirOtroAdministrador } from './utils/administradores';
import { permisosDelUsuario, validarPerfilesQueCambian } from './utils/delegacion';



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
        where: { usuario: usuario.trim().toLowerCase(), eliminado: false }
    })
    }

    // Los permisos del usuario (con el perfil Administrador, todos): ver permisosDelUsuario
    async getPermissionsUser(id: number): Promise<string[]> {
        return [...(await permisosDelUsuario(this.prisma, id))];
    }

    /*
        Un nombre de usuario no se reutiliza, ni siquiera el de un usuario
        eliminado: el borrado es lógico y sus ventas, accesos y rendiciones
        siguen apuntando a él. Si otro usara el mismo nombre, en la historia no
        se sabría quién fue quién.
    */
    private async validarNombreDeUsuarioLibre(usuario: string, idIgnorado?: number) {
        const existente = await this.prisma.usuario.findUnique({ where: { usuario }, select: { id: true, eliminado: true } });
        if (!existente || existente.id === idIgnorado) return;
        throw new ConflictException(
            existente.eliminado
                ? 'Ese nombre de usuario perteneció a un usuario eliminado: elegí otro'
                : 'Ese nombre de usuario ya existe',
        );
    }

    // idUsuarioActual: quien crea. Solo puede dar perfiles cuyos permisos ya tiene
    async createUser(data: CreateUsuarioDto, idUsuarioActual: number) {
        const { idPerfiles, password, ...resto } = data
        await this.validarNombreDeUsuarioLibre(data.usuario);
        await validarPerfilesQueCambian(this.prisma, idUsuarioActual, { agregados: idPerfiles ?? [], quitados: [] });
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

    // idUsuarioActual: quien edita. Solo puede agregar o quitar perfiles cuyos permisos ya tiene
    async updateUser(id: number, data: UpdateUsuarioDto, idUsuarioActual: number) {
        const { idPerfiles, password, ...resto } = data

        /*
            Si el cambio le saca al usuario la condición de administrador
            activo (lo bloquea, lo desactiva o le quita el perfil), tiene que
            quedar otro administrador.
        */
        const actual = await this.prisma.usuario.findUnique({ where: { id }, include: { perfiles: { include: { perfil: true } } } });
        // Un usuario eliminado ya no existe para el sistema: no se edita
        if (!actual || actual.eliminado) {
            throw new NotFoundException('Usuario no encontrado');
        }
        if (data.usuario) {
            await this.validarNombreDeUsuarioLibre(data.usuario, id);
        }
        // Solo se revisan los perfiles que cambian: los que ya tenía y siguen no se juzgan de nuevo
        if (idPerfiles !== undefined) {
            const anteriores = actual.perfiles.map((up) => up.idPerfil);
            await validarPerfilesQueCambian(this.prisma, idUsuarioActual, {
                agregados: idPerfiles.filter((idPerfil) => !anteriores.includes(idPerfil)),
                quitados: anteriores.filter((idPerfil) => !idPerfiles.includes(idPerfil)),
            });
        }
        const eraAdministrador = await this.prisma.usuario.count({ where: { ...administradorActivo(), id } }) > 0;
        if (eraAdministrador) {
            const idsAdministrador = (await this.prisma.perfil.findMany({ where: { esAdministrador: true }, select: { id: true } })).map((p) => p.id);
            const perfilesFinales = idPerfiles ?? actual.perfiles.map((up) => up.idPerfil);
            const sigueAdministrador = (data.estado ?? actual.estado) === 'Activo' && perfilesFinales.some((idPerfil) => idsAdministrador.includes(idPerfil));
            if (!sigueAdministrador) {
                await exigirOtroAdministrador(this.prisma, id);
            }
        }

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

    // Nadie se borra a sí mismo, y no se puede borrar al último administrador activo
    async remove(id: number, idUsuarioActual: number) {
        if (id === idUsuarioActual) {
            throw new ConflictException('No podés eliminar tu propio usuario');
        }
        const usuario = await this.prisma.usuario.findUnique({ where: { id } });
        // Ya eliminado cuenta como inexistente: no se "borra" dos veces
        if (!usuario || usuario.eliminado) {
            throw new NotFoundException('Usuario no encontrado');
        }
        const esAdministrador = await this.prisma.usuario.count({ where: { ...administradorActivo(), id } });
        if (esAdministrador > 0) {
            await exigirOtroAdministrador(this.prisma, id);
        }
        return this.prisma.usuario.update({
            where: { id },
            data: { eliminado: true }
        })
    }
}
