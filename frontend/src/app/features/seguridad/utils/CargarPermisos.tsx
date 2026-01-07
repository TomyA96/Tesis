
export type Permiso = {
    id: number;
    codigo: string;
    descripcion: string;
}
export const CargarPermisos = (permisos: Permiso[]) => {
    //Creo un array funcional que recorra los permisos y los agrupe por area
    // Agrupa los permisos por área usando reduce (objeto { area: Permiso[] })
    return permisos.reduce<Record<string, Permiso[]>>((areas, permiso) => {
        //Split divide el codigo del permiso por el punto y toma la primera parte como area
        const area = permiso.codigo.split(".") [0];
        //Si el area no existe en el objeto, la creo como un array vacio
        if (!areas[area]) {
            areas[area] = [];
        }
        //Agrego el permiso al array del area correspondiente
        areas[area].push(permiso);
        return areas;
        },
        //Objeto inicial vacio
     {}
    )
}

