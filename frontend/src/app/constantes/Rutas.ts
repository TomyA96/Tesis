
export const RUTAS = {
    publico: {
        inicio: "/",
        detalle: (idEvento: number | string) => `/eventos/${idEvento}`,
        comprar: (idEvento: number | string) => `/eventos/${idEvento}/comprar`,
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
        ventas:(idEvento: number | string) => `/admin/eventos/${idEvento}/ventas`,
    },

    informes: {
        inicio: "/admin/informes",
        resumenAnual: "/admin/informes/resumen-anual",
        entradas: (idEvento: number | string) => `/admin/eventos/${idEvento}/informes/entradas`,
        buffet: (idEvento: number | string) => `/admin/eventos/${idEvento}/informes/buffet`,
        finanzas: (idEvento: number | string) => `/admin/eventos/${idEvento}/informes/finanzas`,
    },
    operaciones: {
        inicio: "/admin/operaciones",
        ventaEntradas: (idEvento: number | string) => `/admin/eventos/${idEvento}/operaciones/venta-entradas`,
        puerta: (idEvento: number | string) => `/admin/eventos/${idEvento}/operaciones/puerta`,
        buffet: (idEvento: number | string) => `/admin/eventos/${idEvento}/operaciones/buffet`,
        accesos: (idEvento: number | string) => `/admin/eventos/${idEvento}/operaciones/accesos`,
    }
}
