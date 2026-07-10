import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePerfilDto } from './dtos/create.perfil.dto';
import { UpdatePerfilDto } from './dtos/update.perfil.dto';


@Injectable()
export class PerfilesService {
    constructor(private prisma: PrismaService) {}

    findAll() {
    return this.prisma.perfil.findMany();
  }

    findOne(id: number) {
    return this.prisma.perfil.findUnique({ where: { id } });
  }

    create(data: CreatePerfilDto)  {
        return this.prisma.perfil.create({ data });
    }
  
    update(id: number, data: UpdatePerfilDto) {
        return this.prisma.perfil.update({
            where: { id }, 
            data
        })}
    
    remove(id: number) {
        return this.prisma.perfil.delete({
            where: { id }
        })}
  
}
