import { SetMetadata } from '@nestjs/common';

export const PERMISOS_KEY = 'permisos';

export const Permisos = (...codigos: string[]) => SetMetadata(PERMISOS_KEY, codigos);

/*PERMISOS_KEY es una constante que guarda el string 'permisos', un nombre de etiqueta. Yo creo una función 
(Permisos) que empaqueta los códigos que le paso como argumentos, y usa SetMetadata (que sí pertenece a Nest)
 para pegar esos códigos como una etiqueta pasiva sobre el método que estoy decorando — sin ejecutar ni enviar
  nada. Más adelante, en cada request real, el PermissionsGuard va a leer esa etiqueta (con Reflector) para
   decidir si el usuario tiene los permisos necesarios para ejecutar esa acción.*/