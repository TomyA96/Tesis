/*
    Las mismas reglas que el backend (CreateUsuarioDto), para avisar antes de
    mandar. El nombre de usuario se guarda sin espacios en los extremos y en
    minúsculas: "Juan" y "juan" son la misma cuenta.
*/
export const normalizarUsuario = (usuario: string) => usuario.trim().toLowerCase();

// Letras, números, punto, guion y guion bajo; sin espacios
const FORMATO_USUARIO = /^[a-z0-9._-]{3,30}$/;

// El problema del nombre de usuario (ya normalizado), o null si está bien
export const validarUsuario = (usuario: string): string | null =>
    FORMATO_USUARIO.test(usuario)
        ? null
        : "El usuario debe tener entre 3 y 30 caracteres: letras, números, punto, guion o guion bajo, sin espacios";

export const validarNombreCompleto = (nombre: string): string | null => {
    const limpio = nombre.trim();
    if (limpio.length < 3) return "El nombre completo debe tener al menos 3 caracteres";
    if (limpio.length > 100) return "El nombre completo no puede superar los 100 caracteres";
    return null;
};
