import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ImagenEventoService } from './imagen-evento.service';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';

const storageImages = diskStorage({
    destination: (_req, _file, cb) => {cb(null, join(process.cwd(), 'uploads', 'eventos'))},
    filename: (_req, file, cb) => {
        const nombreUnico = randomUUID() + extname(file.originalname)
        cb(null, nombreUnico)
    },
})

const filterImages = (req, file, cb) => {
    const permitidas = ['image/jpeg', 'image/png', 'image/webp']
    if (permitidas.includes(file.mimetype)){
        cb(null, true)
    }else{
        cb(null, false)
    }
}

const limitImages = {
    fileSize: 5 * 1024 * 1024
}

@Controller('imagen-evento')
export class ImagenEventoController {
    constructor(private imagenEventoService: ImagenEventoService) {}

    @Get()
    findAllByEvento(@Query('idEvento') idEvento: string) {
        return this.imagenEventoService.findAllByEvento(Number(idEvento))
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.imagenEventoService.findOne(Number(id))
    }

    @UseInterceptors(FileInterceptor('imagen', {
        storage: storageImages,
        fileFilter: filterImages,
        limits: limitImages,
    }))
    @Post()
    subirImagen(@Body('idEvento') idEvento: string, @UploadedFile() file: Express.Multer.File) {
        const url = `/uploads/eventos/${file.filename}`
        return this.imagenEventoService.subirImagen({idEvento: Number(idEvento), url})
    }

  

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.imagenEventoService.remove(Number(id))
    }
}
