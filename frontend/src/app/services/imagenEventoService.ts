import { api } from "./api";

export interface ImagenEvento {
    id: number;
    idEvento: number;
    url: string;
}

export function subirImagenEvento(idEvento: number, archivo: File) {
    // Armar un FormData nuevo, agregarle 'idEvento' y 'imagen' (mismo nombre
    // que espera FileInterceptor en el backend), y llamar a api.postFile.
    const formData = new FormData();
    formData.append('idEvento', String(idEvento));
    formData.append('imagen', archivo)

    return api.postFile<ImagenEvento>('/imagen-evento', formData)
}

export function buscarImagenesPorEvento(idEvento: number) {
    // Llamar a api.get contra "/imagen-evento?idEvento=..."
    return api.get<ImagenEvento[]>(`/imagen-evento?idEvento=${String(idEvento)}`)
}
