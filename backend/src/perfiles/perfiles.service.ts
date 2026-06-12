import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class PerfilesService {
    constructor(private prisma: PrismaService) {}

    findAll() {
    return this.prisma.perfil.findMany();
  }

    findOne(id: number) {
    return this.prisma.perfil.findUnique({ where: { id } });
  }

    create(data: {
        nombre: string;
        descripcion?: string;
    })  {
        return this.prisma.perfil.create({ data });
    }
  
    update(id: number, data: { nombre?: string, descripcion?: string }) {
        return this.prisma.perfil.update({
            where: { id }, 
            data
        })}
    
    remove(id: number) {
        return this.prisma.perfil.delete({
            where: { id }
        })}
  
}
