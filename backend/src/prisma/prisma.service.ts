import {Injectable, OnModuleInit} from '@nestjs/common';
import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL,
        });
        super({
            adapter,
            /*
                La contraseña (su hash) no sale nunca de la base: ninguna
                consulta la trae, aunque haga include del usuario. El único que
                la pide, a propósito con omit: { password: false }, es el login
                (AuthService), para compararla. Así el sistema queda seguro por
                defecto: una consulta nueva no puede filtrarla por olvido.

                Ojo: TypeScript sigue creyendo que las consultas traen
                `password` (declarar el tipo con el omit rompe las funciones que
                reciben la conexión como Prisma.TransactionClient). En la
                práctica no viene: no leer `.password` salvo en el login.
            */
            omit: { usuario: { password: true } },
        });
    }

    async onModuleInit() {
         // NestJS ejecuta esto automáticamente cuando arranca el servidor
        // Abre la conexión a la base de datos una sola vez
        await this.$connect();
    }
}
