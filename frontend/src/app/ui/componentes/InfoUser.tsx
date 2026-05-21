type InfoUserProps = {
    username: string;
    perfil: string;
};

/*
    Componente que muestra la información del usuario logueado en el sidebar.
    Cambios visuales:
    - Avatar con iniciales generado automáticamente (sin necesitar una imagen)
    - Layout horizontal (avatar a la izquierda, texto a la derecha) — más compacto
    - Eliminé el border-t y el w-5/6 m-auto: el Sidebar ya maneja ese espaciado
    - Punto verde de "en línea" — detalle profesional que usan apps como Slack/Discord
*/
const InfoUser = ({ username, perfil }: InfoUserProps) => {

    // ── INICIALES ─────────────────────────────────────────────────────────────
    // Toma las primeras letras de cada palabra del nombre.
    // "Andres Gomez" → "AG"
    // Así el avatar siempre tiene contenido sin necesitar una imagen real.
    const iniciales = username
            .split(" ")         // "Andres Gomez" → ["Andres", "Gomez"]
            .map(p => p[0])     // toma la primera letra de cada palabra → ["A", "G"]
            .join("")           // une las letras sin separador → "AG"
            .toUpperCase()      // por si vienen minúsculas → "AG"
            .slice(0, 2);       // máximo 2 letras (por si el nombre tiene 3 palabras)

    return (
        <div className="flex items-center gap-3 px-1 py-1">

            {/* ── AVATAR CON INICIALES ──────────────────────────────────────── */}
            {/* relative + absolute del punto verde: el punto se posiciona
                en la esquina del avatar usando posición absoluta dentro
                del contenedor relativo */}
            <div className="relative">
                <div className="
                    w-9 h-9 rounded-full
                    bg-blue-600
                    flex items-center justify-center
                    text-white text-xs font-bold
                    select-none        
                ">
                    {iniciales}
                </div>

                {/* Punto verde — indica que el usuario está activo/conectado */}
                <span className="
                    absolute bottom-0 right-0
                    w-2.5 h-2.5 rounded-full
                    bg-emerald-500
                    border-2 border-gray-950  
                " />
            </div>

            {/* ── NOMBRE Y PERFIL ───────────────────────────────────────────── */}
            {/* min-w-0 + truncate evitan que un nombre largo rompa el layout */}
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                    {username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                    {perfil}
                </p>
            </div>

        </div>
    );
}

export default InfoUser;
