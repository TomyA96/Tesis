import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

// El perfil Administrador es del sistema: siempre tiene todos los permisos
const PERFIL_DEL_SISTEMA = 'El perfil Administrador es del sistema: no se puede modificar ni eliminar';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerfilDto } from './dtos/create.perfil.dto';
import { UpdatePerfilDto } from './dtos/update.perfil.dto';
import {  Prisma } from '@prisma/client';
import { mismoNombre } from '../utils/texto';


@Injectable()
export class PerfilesService {
    constructor(private prisma: PrismaService) {}

    findAll() {
    return this.prisma.perfil.findMany();
  }

    findOne(id: number) {
    return this.prisma.perfil.findUnique({ where: { id } });
  }

    /*
        El nombre del perfil es único sin distinguir mayúsculas ni tildes: "Cajero" y
        "cajero" serían el mismo perfil para quien los ve en la lista. La base
        solo controla el nombre exacto (@unique), así que se revisa acá.
    */
    private async validarNombreDisponible(nombre: string, idIgnorado?: number) {
        const otros = await this.prisma.perfil.findMany({
            where: { id: idIgnorado ? { not: idIgnorado } : undefined },
            select: { nombre: true },
        });
        if (otros.some((otro) => mismoNombre(otro.nombre, nombre))) {
            throw new ConflictException('Ya existe un perfil con ese nombre');
        }
    }

    async createPerfil(data: CreatePerfilDto)  {
        //separo los datos
        const {idsPermisos, ...datosPerfil} = data
        await this.validarNombreDisponible(data.nombre);
        //armo una transaccion conjunta de 2 querys 
        try{ 
            return await this.prisma.$transaction(async (tx) => {
            //creo el perfil
            const perfil = await tx.perfil.create({data: datosPerfil})
            //creo la convinacion con los permisos para el perfil
            
            await tx.permisoPerfil.createMany({
                data: idsPermisos.map(idPermiso => ({
                    idPerfil: perfil.id , idPermiso: idPermiso
                }))
            })
            return perfil
        })}
        catch(err){
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new ConflictException('Ya existe un perfil con ese nombre');
            }
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
                throw new BadRequestException('Uno de los permisos indicados no existe');
            }
            throw err
        }}
        
        
        
  
    // El perfil tiene que existir, y no puede ser el Administrador del sistema (ese no se modifica)
    private async validarNoEsAdministrador(id: number) {
        const perfil = await this.prisma.perfil.findUnique({ where: { id }, select: { esAdministrador: true } });
        if (!perfil) {
            throw new NotFoundException('No existe el perfil');
        }
        if (perfil.esAdministrador) {
            throw new ConflictException(PERFIL_DEL_SISTEMA);
        }
    }

    async updatePerfil(id: number, data: UpdatePerfilDto) {
        await this.validarNoEsAdministrador(id);
        const {idsPermisos, ...datosPerfil} = data;
        if (data.nombre) {
            await this.validarNombreDisponible(data.nombre, id);
        }
        try{
            return await this.prisma.$transaction(async (tx) => {
                const perfil = await tx.perfil.update({where: {id}, data: datosPerfil})
                if (idsPermisos){
                    await tx.permisoPerfil.deleteMany({where: {idPerfil: id}})
                    await tx.permisoPerfil.createMany({
                        data: idsPermisos.map(idPermiso => ({
                            idPerfil: id , idPermiso: idPermiso
                        }))
                    })
                }
                return perfil
            })
        }catch(err){
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new ConflictException('Ya existe un perfil con ese nombre');
            }
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
                throw new BadRequestException('Uno de los permisos indicados no existe');
            }
            throw err
        }}
        
       
    
    async removePerfil(id: number) {
        await this.validarNoEsAdministrador(id);

        const getUsuarioPerfil = await this.prisma.usuarioPerfil.count({where: {idPerfil: id}})
        if (getUsuarioPerfil !== 0) {
            throw new ConflictException('No se puede eliminar: el perfil tiene usuarios asignados');
        }
        try{
            return await this.prisma.$transaction(async (tx) => {
                await tx.permisoPerfil.deleteMany({where: {idPerfil: id}});
                const perfil = await tx.perfil.delete({where: { id }})
                return perfil
            }) 
            
        }
        catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new NotFoundException('No existe el perfil');
            }
            throw err;
        }}
        

        
  
}
