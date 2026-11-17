
// "?jornada=2&lote=3": solo las claves con valor; si no hay ninguna, nada
const conQuery = (filtros: Record<string, number | undefined>) => {
    const query = new URLSearchParams(
        Object.entries(filtros)
            .filter((par): par is [string, number] => par[1] !== undefined)
            .map(([clave, valor]) => [clave, String(valor)]),
    ).toString();
    return query ? `?${query}` : "";
};

export const RUTAS = {
    publico: {
        inicio: "/",
        detalle: (idEvento: number | string) => `/eventos/${idEvento}`,
        comprar: (idEvento: number | string) => `/eventos/${idEvento}/comprar`,
        // A esta pantalla vuelve el cliente desde Mercado Pago (ver MercadoPagoService.crearOrder en el backend)
        resultadoCompra: "/compra/resultado",
    },

    admin: {
        inicio: "/admin",
    },

    seguridad: {
        inicio: "/admin/seguridad",
        usuarios: "/admin/seguridad/usuarios",
        perfiles: "/admin/seguridad/perfiles",
        auditorias: "/admin/seguridad/auditorias",

    },

    administracion: {
        inicio: "/admin/administracion",
        proveedores: "/admin/administracion/proveedores",
        fuentesIngreso: "/admin/administracion/fuentes-ingreso",
        productos: "/admin/administracion/productos",
        rubros: "/admin/administracion/rubros",
        administrarEvento: (idEvento: number | string) => `/admin/eventos/${idEvento}/administracion`
    },

    eventos: {
        inicio: "/admin/eventos",
        crear: "/admin/eventos/crear",
        detalle:(idEvento: number | string) => `/admin/eventos/${idEvento}`,
        jornada: (idEvento: number | string, idJornada: number | string) => `/admin/eventos/${idEvento}/jornadas/${idJornada}`,
        ventas:(idEvento: number | string) => `/admin/eventos/${idEvento}/ventas`,
        // Los locales a los que se les reparten tickets físicos (su listado es general, no de un evento)
        puntosVenta: "/admin/eventos/puntos-venta",
        // Tickets físicos del evento: entregar por cantidad, o la lista de un lote (?lote=) para corregir
        tickets: (idEvento: number | string, filtros: { jornada?: number; lote?: number } = {}) =>
            `/admin/eventos/${idEvento}/tickets${conQuery(filtros)}`,
        rendiciones: (idEvento: number | string, idLocal?: number) =>
            `/admin/eventos/${idEvento}/rendiciones${conQuery({ local: idLocal })}`,
    },

    informes: {
        // El inicio de Informes es el resumen anual
        inicio: "/admin/informes",
        // Informe de un evento: General es la pestaña a la que se entra; las otras tres cuelgan de ella
        general: (idEvento: number | string) => `/admin/eventos/${idEvento}/informes`,
        entradas: (idEvento: number | string) => `/admin/eventos/${idEvento}/informes/entradas`,
        buffet: (idEvento: number | string) => `/admin/eventos/${idEvento}/informes/buffet`,
        finanzas: (idEvento: number | string) => `/admin/eventos/${idEvento}/informes/finanzas`,
    },
    // Cada noche se opera por separado: las entradas, la capacidad y el buffet son de la jornada
    operaciones: {
        inicio: "/admin/operaciones",
        accesos: (idJornada: number | string) => `/admin/operaciones/jornadas/${idJornada}/accesos`,
        ventaEntradas: (idJornada: number | string) => `/admin/operaciones/jornadas/${idJornada}/venta-entradas`,
        buffet: (idJornada: number | string) => `/admin/operaciones/jornadas/${idJornada}/buffet`,
    }
}
