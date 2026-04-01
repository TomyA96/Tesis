
export const RUTAS = {
    inicio: "/",

    seguridad: {
        inicio: "/seguridad",
        usuarios: "/seguridad/usuarios",
        perfiles: "/seguridad/perfiles", 
        auditorias: "/seguridad/auditorias" ,
        
    },

    administracion: {
        inicio: "/administracion",
        proveedores: "/administracion/proveedores",  
        productos: "/administracion/productos",       
        rubros: "/administracion/rubros"   ,        
        administrarEvento: (idEvento: number | string) => `/eventos/${idEvento}/administracion` 
    },

    eventos: {
        inicio: "/eventos",
        crear: "/eventos/crear",  
        detalle:(idEvento: number | string) => `/eventos/${idEvento}`, 
        ventas:(idEvento: number | string) => `/eventos/${idEvento}/ventas`, 
    },

    informes: {
        inicio: "/informes",
        entradas: (idEvento: number | string) => `/eventos/${idEvento}/informes/entradas`,  
        consumos: (idEvento: number | string) => `/eventos/${idEvento}/informes/consumos`,  
        balance: (idEvento: number | string) => `/eventos/${idEvento}/informes/balance`,  
    },
    operaciones: {
        inicio: "/operaciones",
        puerta: (idEvento: number | string) => `/eventos/${idEvento}/operaciones/puerta`,  
        buffet: (idEvento: number | string) => `/eventos/${idEvento}/operaciones/buffet`,  
        accesos: (idEvento: number | string) => `/eventos/${idEvento}/operaciones/accesos`,  
    }
}