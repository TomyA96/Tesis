# Sistema Integral Para Eventos - Frontend

Guia rapida para que cualquier companero pueda levantar el proyecto localmente sin friccion.

## Stack del proyecto
- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- React Router 7
- ESLint 9

## Prerrequisitos
Antes de empezar, tener instalado:
- Node.js `>= 20.19` (recomendado: version LTS actual)
- npm (viene con Node.js)
- Git

Para verificar versiones:

```bash
node -v
npm -v
git --version
```

## Instalacion
Desde la carpeta `frontend`:

```bash
npm ci
```

`npm ci` instala exactamente las versiones definidas en `package-lock.json`, ideal para que todo el equipo use el mismo entorno.

Si no tienes lockfile actualizado y necesitas una instalacion comun, puedes usar:

```bash
npm install
```

## Como correr el proyecto en desarrollo
Desde `frontend`:

```bash
npm run dev
```

Esto levanta Vite en modo desarrollo (normalmente en `http://localhost:5173`).

## Scripts disponibles
Desde `frontend`:

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compila TypeScript y genera build de produccion
npm run preview  # Sirve localmente el build de produccion
npm run lint     # Ejecuta ESLint
```

## Flujo recomendado para nuevos integrantes
1. Clonar el repositorio.
2. Entrar a la carpeta del frontend:
   ```bash
   cd frontend
   ```
3. Instalar dependencias:
   ```bash
   npm ci
   ```
4. Levantar entorno local:
   ```bash
   npm run dev
   ```
5. Antes de subir cambios, validar:
   ```bash
   npm run lint
   npm run build
   ```

## Dependencias principales
Se instalan automaticamente con `npm ci`/`npm install`:
- `react`, `react-dom`
- `react-router-dom`
- `tailwindcss`, `@tailwindcss/vite`, `tailwind-merge`
- `clsx`
- `lucide-react`

## Dependencias de desarrollo
Tambien se instalan automaticamente:
- `vite`, `@vitejs/plugin-react-swc`
- `typescript`
- `eslint` y plugins (`@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)
- Tipados (`@types/node`, `@types/react`, `@types/react-dom`)

## Problemas comunes
- Error de version de Node: actualizar Node.js a una version compatible (20.19+).
- Dependencias corruptas: borrar `node_modules` y reinstalar:
  ```bash
  rm -rf node_modules
  npm ci
  ```
  En PowerShell:
  ```powershell
  Remove-Item -Recurse -Force node_modules
  npm ci
  ```
- Puerto ocupado (5173): ejecutar `npm run dev -- --port 5174`.
