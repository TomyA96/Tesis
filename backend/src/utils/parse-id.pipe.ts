import { BadRequestException, Injectable, ParseIntPipe } from '@nestjs/common';

/*
    Convierte un id de la URL (o de la query) a número, y si no es un número
    entero responde 400 con un mensaje en castellano. Es el ParseIntPipe de
    Nest con otro mensaje: sin esto, "/eventos/abc" llegaba al servicio como
    NaN, Prisma lo rechazaba y la respuesta era un 500.

    Uso: @Param('id', ParseIdPipe) id: number
*/
@Injectable()
export class ParseIdPipe extends ParseIntPipe {
    constructor() {
        super({ exceptionFactory: () => new BadRequestException('El id tiene que ser un número') });
    }
}

/*
    Igual, para un id que puede no venir (un filtro opcional de la query):
    ausente queda undefined; presente tiene que ser un número.
*/
@Injectable()
export class ParseIdOpcionalPipe extends ParseIntPipe {
    constructor() {
        super({ optional: true, exceptionFactory: () => new BadRequestException('El id tiene que ser un número') });
    }
}
