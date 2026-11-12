import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as loginRequest, getMe } from '../services/authService';

interface Usuario {
    id: number;
    nombre: string;
    usuario: string;
}

interface AuthContextValue {
    token: string | null;
    user: Usuario | null;
    // null mientras todavía no se trajeron del backend (distinto de "no tiene ninguno": [])
    permisos: string[] | null;
    // Solo sirve para decidir qué se muestra: el backend es el que valida de verdad
    puede: (permiso: string) => boolean;
    login: (usuario: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
    const [user, setUser] = useState<Usuario | null>(null)
    const [permisos, setPermisos] = useState<string[] | null>(null)

    useEffect(() => {
        if (token && !user) {
            getMe()
                .then((data) => {

                    setUser(data.user);
                    setPermisos(data.permissions);
                })
                .catch(() => {
                    
                    logout();
                });
        }
    }, []);


    const login = async (usuario: string, password: string) => {
        const data = await loginRequest(usuario, password);
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        // El login no devuelve los permisos: se piden con el token recién guardado
        const me = await getMe();
        setPermisos(me.permissions);
    }

    const logout = () => {
        setToken(null);
        setUser(null);
        setPermisos(null);
        localStorage.removeItem('token');
    }

    const puede = (permiso: string) => permisos?.includes(permiso) ?? false;

    const value: AuthContextValue = {
        token,
        user,
        permisos,
        puede,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}
