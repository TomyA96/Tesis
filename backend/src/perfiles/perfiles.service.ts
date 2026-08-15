import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerfilDto } from './dtos/create.perfil.dto';
import { UpdatePerfilDto } from './dtos/update.perfil.dto';
import {  Prisma } from '@prisma/client';


@Injectable()
export class PerfilesService {
    constructor(private prisma: PrismaService) {}

    findAll() {
    return this.prisma.perfil.findMany();
  }

    findOne(id: number) {
    return this.prisma.perfil.findUnique({ where: { id } });
  }

    async createPerfil(data: CreatePerfilDto)  {
        //separo los datos
        const {idsPermisos, ...datosPerfil} = data
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
        
        
        
  
    async updatePerfil(id: number, data: UpdatePerfilDto) {
        const {idsPermisos, ...datosPerfil} = data;
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
                throw new ConflictException('El perfil ya no existe o fue eliminado por otro usuario');
            }
            throw err;
        }}
        

        
  
}
