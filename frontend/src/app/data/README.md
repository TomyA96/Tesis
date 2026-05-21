# 📊 Mocks de Datos

Carpeta que contiene los datos de prueba (mocks) para el desarrollo del Sistema Integral Para Eventos.

## 📁 Estructura

```
data/
├── types.ts              # Definiciones de tipos compartidas
├── usuarios.mock.ts      # Mock de usuarios (10 registros)
├── perfiles.mock.ts      # Mock de perfiles (5 registros)
├── permisos.mock.ts      # Mock de permisos (13 registros)
├── eventos.mock.ts       # Mock de eventos (10 registros)
├── index.ts              # Exportador centralizado
└── README.md             # Este archivo
```

## 🚀 Cómo usar

### Importar todos los mocks
```typescript
import { usuariosMock, perfilesMock, eventosMock, permisosMock } from "@/app/data";
```

### Importar mocks específicos
```typescript
import { usuariosMock } from "@/app/data/usuarios.mock";
import { perfilesMock } from "@/app/data/perfiles.mock";
import { eventosMock } from "@/app/data/eventos.mock";
import { permisosMock } from "@/app/data/permisos.mock";
```

### Importar tipos
```typescript
import type { Usuario, Perfil, Evento, Permiso } from "@/app/data/types";
```

## 📋 Contenido de cada mock

### Usuarios (`usuarios.mock.ts`)
- **Registros**: 10 usuarios
- **Campos**:
  - `id`: Identificador único
  - `nombre`: Nombre completo
  - `perfil`: Perfil asignado (Administrador, Operador, Supervisor)
  - `estado`: Activo, Inactivo, Bloqueado
  - `ultimoAcceso`: Fecha del último acceso

### Perfiles (`perfiles.mock.ts`)
- **Registros**: 5 perfiles
- **Campos**:
  - `id`: Identificador único
  - `nombre`: Nombre del perfil
  - `areas`: Array de áreas de acceso
  - `permisos`: Array de IDs de permisos asignados
  - `usuariosAsignados`: Cantidad de usuarios con este perfil

### Permisos (`permisos.mock.ts`)
- **Registros**: 13 permisos
- **Campos**:
  - `id`: Identificador único
  - `codigo`: Código único del permiso (ej: "seguridad.crearUsuario")
  - `descripcion`: Descripción legible
- **Categorías**:
  - 🔐 Seguridad (5 permisos)
  - 🎉 Eventos (3 permisos)
  - 💰 Finanzas (3 permisos)
  - 📊 Informes (2 permisos)

### Eventos (`eventos.mock.ts`)
- **Registros**: 10 eventos
- **Campos**:
  - `id`: Identificador único
  - `nombre`: Nombre del evento
  - `fecha`: Fecha del evento (YYYY-MM-DD)
  - `estado`: activo, borrador, finalizado, cancelado
  - `lugar`: Ubicación del evento
  - `capacidad`: Capacidad máxima
  - `entradasVendidas`: Entradas vendidas

## 🔄 Integración con el backend

Cuando conectes tu API backend:

1. **Reemplaza las importaciones** en tus componentes:
   ```typescript
   // ❌ Antes (desarrollo)
   import { usuariosMock } from "@/app/data";
   
   // ✅ Después (producción)
   import { useUsuarios } from "@/app/hooks/useUsuarios"; // tu hook de API
   ```

2. **Crea hooks personalizados** en `src/app/hooks/`:
   ```typescript
   export const useUsuarios = () => {
     const [data, setData] = useState([]);
     // lógica de fetching
     return data;
   };
   ```

3. **Elimina los archivos mock** una vez que el backend esté completamente integrado.

## 💡 Notas de desarrollo

- Los mocks están configurados para reflejar la estructura real esperada del backend
- Las fechas usan `Date` objects para simular comportamiento real
- Los datos contienen valores realistas para facilitar el testeo
- Cada mock es independiente y puede ser usado sin necesidad de los otros

## 📖 Ejemplo de uso en un componente

```typescript
import { usuariosMock } from "@/app/data";
import type { Usuario } from "@/app/data/types";

const MiComponente = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    // En desarrollo
    setUsuarios(usuariosMock);
    
    // En producción: descomentar y usar API real
    // fetchUsuariosDelAPI().then(setUsuarios);
  }, []);

  return (
    <div>
      {usuarios.map(u => <p key={u.id}>{u.nombre}</p>)}
    </div>
  );
};
```
