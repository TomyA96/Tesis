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
    login: (usuario: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
    const [user, setUser] = useState<Usuario | null>(null)

    useEffect(() => {
        if (token && !user) {
            getMe()
                .then((data) => {
                   
                    setUser(data.user);
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
    }

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    }

    const value: AuthContextValue = {
        token,
        user,
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
