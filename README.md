# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Guide du Développeur (Rappel)

### 1. Développement Quotidien (`npm run dev`)
Utilisez cette commande tous les jours pour créer votre site.
-   Lance le Backend (5000) et le Frontend (5173).
-   Rechargement instantané (Hot Reload).
-   **Note**: Le "Mode Maintenance" ne s'affiche pas ici.

### 2. Test de Production (`npm run dev:prod`)
Utilisez cette commande pour tester le comportement exact de la production tout en développant.
-   Lance le Backend (5000) et le Frontend en mode "Watch".
-   Tout est accessible sur **http://localhost:5000**.
-   Permet de tester le "Mode Maintenance".

### 3. Vérification Finale (`npm start`)
À utiliser après un `npm run build` juste pour vérifier que tout marchera bien une fois en ligne (sans rechargement automatique).
