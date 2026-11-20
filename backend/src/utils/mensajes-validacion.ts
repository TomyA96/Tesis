import { BadRequestException, ValidationError } from '@nestjs/common';

/*
    Red de seguridad para los mensajes de validación.

    Cuando un decorador de class-validator no tiene { message: '...' }, el
    mensaje sale en inglés ("nombre should not be empty"). Los formularios
    tienen mensajes propios en castellano; esto traduce los que quedan
    (sobre todo los de datos que no vienen de un formulario, como un id que
    llega como texto) según la regla que falló.

    Los mensajes que ya están en castellano se dejan tal cual. Los de un
    objeto anidado (la jornada 2 de un evento, el producto 1 de una venta)
    llevan delante dónde está el error: "Jornada 2: La capacidad...".
*/

type Traduccion = (campo: string) => string;

const TRADUCCIONES: Record<string, Traduccion> = {
    isNotEmpty: (c) => `Falta completar el campo ${c}`,
    isDefined: (c) => `Falta el campo ${c}`,
    isString: (c) => `El campo ${c} tiene que ser texto`,
    isInt: (c) => `El campo ${c} tiene que ser un número entero`,
    isNumber: (c) => `El campo ${c} tiene que ser un número`,
    isPositive: (c) => `El campo ${c} tiene que ser mayor a 0`,
    isBoolean: (c) => `El campo ${c} tiene que ser verdadero o falso`,
    isDate: (c) => `El campo ${c} tiene que ser una fecha válida`,
    isDateString: (c) => `El campo ${c} tiene que ser una fecha válida`,
    isEmail: (c) => `El campo ${c} tiene que ser un email válido`,
    isEnum: (c) => `El valor del campo ${c} no es válido`,
    isIn: (c) => `El valor del campo ${c} no es válido`,
    isArray: (c) => `El campo ${c} tiene que ser una lista`,
    arrayNotEmpty: (c) => `La lista ${c} no puede estar vacía`,
    arrayMinSize: (c) => `La lista ${c} tiene menos elementos de los necesarios`,
    arrayMaxSize: (c) => `La lista ${c} tiene más elementos de los permitidos`,
    arrayUnique: (c) => `La lista ${c} tiene elementos repetidos`,
    min: (c) => `El campo ${c} es menor al mínimo permitido`,
    max: (c) => `El campo ${c} supera el máximo permitido`,
    minLength: (c) => `El campo ${c} es demasiado corto`,
    maxLength: (c) => `El campo ${c} es demasiado largo`,
    matches: (c) => `El campo ${c} no tiene un formato válido`,
    nestedValidation: (c) => `El campo ${c} no tiene un formato válido`,
    whitelistValidation: (c) => `El campo ${c} no está permitido`,
};

// class-validator escribe en inglés con "must"/"should"; los nuestros nunca los usan
const estaEnIngles = (mensaje: string) => /\b(must|should|elements)\b/.test(mensaje);

// Nombre que se muestra para un elemento de una lista anidada: "jornadas" + "1" → "Jornada 2"
const NOMBRES_DE_LISTAS: Record<string, string> = {
    jornadas: 'Jornada',
    entradas: 'Entrada',
    items: 'Ítem',
};

function ubicacion(padre: string, propiedad: string): string {
    if (/^\d+$/.test(propiedad)) {
        const nombre = NOMBRES_DE_LISTAS[padre] ?? padre;
        return `${nombre} ${Number(propiedad) + 1}`;
    }
    return propiedad;
}

/*
    De un mismo campo se muestra solo el error que importa: si falta, no tiene
    sentido decir además que es corto y largo a la vez; si es del tipo
    equivocado (texto en vez de número), tampoco el mínimo o el máximo.
*/
const FALTA = ['isDefined', 'isNotEmpty'];
const TIPO = ['isString', 'isInt', 'isNumber', 'isBoolean', 'isDate', 'isDateString', 'isEnum', 'isIn', 'isArray', 'isEmail'];

function reglasAMostrar(constraints: Record<string, string>): [string, string][] {
    // class-validator las arma de abajo hacia arriba: se dan vuelta para respetar el orden del DTO
    const todas = Object.entries(constraints).reverse();
    for (const grupo of [FALTA, TIPO]) {
        const delGrupo = todas.filter(([regla]) => grupo.includes(regla));
        if (delGrupo.length > 0) return delGrupo.slice(0, 1);
    }
    return todas;
}

function mensajesDe(error: ValidationError, prefijo: string, padre: string): string[] {
    const mensajes: string[] = [];
    const lugar = ubicacion(padre, error.property);

    for (const [regla, mensaje] of reglasAMostrar(error.constraints ?? {})) {
        const traducir = TRADUCCIONES[regla];
        const texto = estaEnIngles(mensaje)
            ? (traducir ? traducir(error.property) : `El campo ${error.property} no es válido`)
            : mensaje;
        mensajes.push(prefijo + texto);
    }

    // Un objeto anidado: el prefijo dice en qué elemento está el error ("Jornada 2: ")
    const esElementoDeLista = /^\d+$/.test(error.property);
    const nuevoPrefijo = esElementoDeLista ? `${prefijo}${lugar}: ` : prefijo;
    for (const hijo of error.children ?? []) {
        mensajes.push(...mensajesDe(hijo, nuevoPrefijo, error.property));
    }
    return mensajes;
}

export function errorDeValidacion(errores: ValidationError[]) {
    const mensajes = errores.flatMap((e) => mensajesDe(e, '', ''));
    return new BadRequestException(mensajes);
}
