import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ImagenEventoService } from './imagen-evento.service';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { ParseIdPipe } from '../utils/parse-id.pipe';

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

/*
    Las imágenes de los eventos desde el panel. Verlas solo pide estar
    logueado (las usan también las pantallas de Operaciones; el sitio
    público las recibe por /eventos-publicos). Subirlas o borrarlas es
    editar el evento. Los guards corren ANTES que el FileInterceptor: un
    pedido sin permiso se rechaza sin llegar a guardar el archivo.
*/
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('imagen-evento')
export class ImagenEventoController {
    constructor(private imagenEventoService: ImagenEventoService) {}

    @Get()
    findAllByEvento(@Query('idEvento', ParseIdPipe) idEvento: number) {
        return this.imagenEventoService.findAllByEvento(idEvento)
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: number) {
        return this.imagenEventoService.findOne(id)
    }

    @Permisos('eventos.editar')
    @UseInterceptors(FileInterceptor('imagen', {
        storage: storageImages,
        fileFilter: filterImages,
        limits: limitImages,
    }))
    @Post()
    subirImagen(@Body('idEvento', ParseIdPipe) idEvento: number, @UploadedFile() file: Express.Multer.File) {
        const url = `/uploads/eventos/${file.filename}`
        return this.imagenEventoService.subirImagen({idEvento, url})
    }

  

    @Permisos('eventos.editar')
    @Delete(':id')
    remove(@Param('id', ParseIdPipe) id: number) {
        return this.imagenEventoService.remove(id)
    }
}
