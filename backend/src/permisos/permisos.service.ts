import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermisosService {
    constructor(private prisma: PrismaService) {}

    findAll() {
        return this.prisma.permiso.findMany();
    }
}
