<!-- Purpose: concise guidance for AI coding agents working on this repo -->
# Copilot instructions — Sistema Integral Para Eventos (frontend)

Overview
- This repository contains a React + TypeScript frontend built with Vite (see `frontend/package.json`).
- UI is component-driven and organized by feature: `src/app/features/*` (e.g., `seguridad`, `eventos`).
- Shared UI primitives live under `src/app/ui/componentes` and `src/app/ui/navegacion`.

Key files and where to look
- Entry point: `src/main.tsx` -> `src/App.tsx` (App currently mounts a `Sidebar` and directly renders pages like `Perfiles`).
- Feature folders: `src/app/features/<feature>/pages` and `.../componentes` — add pages and feature-specific components here.
- Shared UI: `src/app/ui/componentes/*` (e.g., `Btn.tsx`, `Card.tsx`, `GenericTabla.tsx`, `InfoUser.tsx`). Prefer these for consistent styling.
- Services/hooks: `src/app/services` and `src/app/hooks` — place API clients and reusable hooks here.
- Build/config: `frontend/package.json` (scripts: `dev`, `build`, `preview`, `lint`), `vite.config.ts`, `eslint.config.js`, `tsconfig.*`.

Architecture and conventions (do not improvise)
- Feature-first layout: Add feature code under `src/app/features/<feature>` not at root. Each feature should have `pages` and `componentes` subfolders.
- Styling: TailwindCSS is used (see `index.css` + Tailwind plugin in `package.json`). Use Tailwind utility classes; shared components expose `className` props.
- Routing: There is currently no global React Router setup (App mounts pages directly). If adding routes, prefer centralizing them in `App.tsx` or a new `src/app/layouts/Router.tsx` and update `Sidebar` `Menu` items to navigate accordingly.
- Reuse UI primitives: Prefer `GenericTabla` for tabular views and `Card`/`Btn` for layout and actions. Look at existing usages in `src/app/features/seguridad/*`.
- Naming: Components use PascalCase filenames and default exports (follow existing style).

Build, run, lint (exact commands)
- Start dev server with Vite (HMR): from `frontend` run `npm run dev`.
- Build production bundle: `npm run build` (runs `tsc -b` then `vite build`).
- Preview production build: `npm run preview`.
- Lint: `npm run lint`.

PR / code change expectations for AI agents
- Small focused changes only: update a single feature or shared UI file per PR unless asked otherwise.
- Preserve existing styles and Tailwind utility classes. When adding props to shared components, keep backward compatibility (optional props with defaults).
- Tests: There are no test files in the frontend; do not add broad test scaffolding unless requested.

Examples (how to implement common tasks)
- Add a new feature page:
  1. Create `src/app/features/<newFeature>/pages/<PageName>.tsx` and `.../componentes/` for shared pieces.
  2. Export default the page component and wire into `App.tsx` (or `Router.tsx`) and add a `Menu` entry in `src/app/ui/navegacion/Sidebar.tsx`.
- Use shared table:
  - Import `GenericTabla` from `src/app/ui/componentes/GenericTabla.tsx` and pass `columns` and `data` as in existing `Perfiles`/`Usuarios` pages.

Integration points & external deps
- Bundler/dev server: Vite (`vite` and `@vitejs/plugin-react-swc`).
- CSS: Tailwind (`tailwindcss`) and `@tailwindcss/vite` plugin.
- Routing: `react-router-dom` is available; currently not used globally.

When unsure
- Prefer minimal, non-invasive edits. If you need to change cross-cutting behavior (routing, global state, build scripts), ask the human first.
- If you modify component props, update all direct call sites in the same PR.

Where to look for context
- Implementations to copy patterns from: `src/app/features/seguridad/pages/Perfiles.tsx`, `src/app/ui/componentes/Btn.tsx`, `src/app/ui/navegacion/Sidebar.tsx`.
- Build/runtime config: `frontend/package.json`, `vite.config.ts`, `eslint.config.js`, `tsconfig.app.json`.

Feedback
- If something in these instructions is unclear or incomplete, leave a short note in the PR description and request clarification from a maintainer.

-- End of file
