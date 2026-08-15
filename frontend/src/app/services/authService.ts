import { api } from './api';

interface Usuario {
    id: number;
    nombre: string;
    usuario: string;
}

interface LoginResponse {
    
    token: string;
    user: Usuario;
    
}

interface MeResponse {
    user: Usuario;
    permissions: string[];
}

export function getMe() {
    return api.get<MeResponse>('/auth/me');
}

export function login(usuario: string, password: string) {
   
    return api.post<LoginResponse>('/auth/login', { usuario, password });
}
