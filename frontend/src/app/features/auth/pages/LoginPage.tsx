import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Formulario from "../../../ui/componentes/Formulario";
import Input from "../../../ui/componentes/Input";
import Btn from "../../../ui/componentes/Btn";

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            await login(usuario, password);
            navigate("/");
        } catch {
            setError("Credenciales inválidas. Por favor, inténtalo de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#E8E8E8]">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                    Iniciar sesión
                </h1>

                <Formulario onSubmit={onSubmit}>
                    <Input
                        label="Usuario"
                        name="usuario"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        disabled={cargando}
                    />

                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={cargando}
                    />

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <Btn type="submit" variant="primary" disabled={cargando} className="mt-2">
                        {cargando ? "Ingresando..." : "Ingresar"}
                    </Btn>
                </Formulario>
            </div>
        </div>
    );
};

export default LoginPage;
