import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class ImagenEventoService {
    constructor(private prisma: PrismaService) {}

    findAllByEvento(idEvento: number) {
        return this.prisma.imagenEvento.findMany({where: {idEvento}});
    }

    findOne(id: number) {
        return this.prisma.imagenEvento.findUnique({ where: { id } });
    }

    async subirImagen(data: { idEvento: number, url: string}) {
        const evento = await this.prisma.evento.findUnique({where: {id: data.idEvento} })
        if (!evento){
            await this.borrarArchivo(data.url)
            throw new NotFoundException('No existe el evento')
        }
        if (evento.estado === 'Finalizado' || evento.estado === 'Cancelado'){
            await this.borrarArchivo(data.url)
            throw new ConflictException('No se puede asociar una imagen a un evento que ya concluyo')
        }
        const img = await this.prisma.imagenEvento.findMany({where: {idEvento: data.idEvento}})
        if (img.length !== 0) {
            await this.remove(img[0].id)
        }
        return this.prisma.imagenEvento.create({ data });
    }

    async remove(id: number) {
        const imagen = await this.prisma.imagenEvento.findUnique({ where: { id } });
        if (!imagen) return;

        await this.borrarArchivo(imagen.url);
        return this.prisma.imagenEvento.delete({ where: { id } });
    }

    private async borrarArchivo(url: string) {
        try {
            await unlink(join(process.cwd(), url));
        } catch {
            // el archivo ya no estaba en disco — no importa
        }
    }
}
