
# Copilot Instructions for scene7-import-for-figma

## Project Overview
- Figma plugin and web app for importing and customizing Scene7 dynamic images.
- Built with React, TypeScript, Vite (UI), and ESBuild (plugin code bundling).
- UI (React) and plugin (Figma) logic are strictly separated: UI in root/components, plugin in `plugin/code.ts`.
- Core features: input Scene7 image names, apply Scene7 parameters (e.g., sharpen, clipping path), preview images, place/replace images in Figma, dark/light theme toggle.

## Key Files & Structure
- `App.tsx`, `index.tsx`: React app entry points.
- `components/`: UI controls, organized by function (e.g., `BackgroundControls.tsx`, `common/` for shared UI widgets).
- `plugin/code.ts`: Figma plugin entry point (runs in Figma's sandbox, not the browser).
- `contexts/`, `hooks/`: React context and custom hooks.
- `types.ts`, `constants.ts`: Shared types and constants.
- `vite.config.ts`: Vite build config for both UI and plugin. Note: styling is handled via Tailwind CDN, not local PostCSS/Tailwind.
- `tsconfig.json`: TypeScript config, includes both browser and Figma plugin typings.
- `manifest.json`: Figma plugin manifest. `networkAccess > allowedDomains` must explicitly list all external domains (e.g., cdn.tailwindcss.com, s7d4.scene7.com) due to Figma's strict allowlist policy.

## Developer Workflows
- **Install dependencies:** `npm install`
- **Run locally:** `npm run dev` (starts Vite dev server)
- **Build for production:** `npm run build`
- **Figma plugin build:** Output is typically in `dist/` or as configured in `vite.config.ts`.
- **TypeScript types:** Both `@figma/plugin-typings` and `@types/node` are required for type safety.
- **If build fails or index.html is empty:** Try deleting `node_modules` and lockfiles, reinstall, and simplify `vite.config.ts`. Use Tailwind CDN for styling to avoid local PostCSS/Tailwind issues.
- **Restart TypeScript server** in VS Code if typings are not picked up after install.

## Patterns & Conventions
- **UI/plugin separation:** UI logic (React) and plugin logic (Figma) are strictly separated. Communication is via message passing: `window.parent.postMessage` (UI to plugin), `figma.ui.postMessage` (plugin to UI).
- **Theme persistence:** Use Figma's `figma.clientStorage` for theme state (not localStorage, which is blocked in Figma sandbox). All storage and settings must use message passing to/from plugin code.
- **Component structure:** Colocate related UI logic in `components/`, use `common/` for shared widgets.
- **Styling:** Tailwind CSS is loaded via CDN in `index.html` for maximum compatibility with Figma's iframe sandbox.
- **Image formats:** `png-alpha` is forced for top layers (for transparency/clipping), `jpeg` for shadow layers.
- **Type safety:** All code is TypeScript; keep types in `types.ts` and use explicit types for props and state.
- **Path aliases:** Use `@/` as a path alias for root imports (see `tsconfig.json`).

## Integration Points
- **Figma plugin API:** All plugin logic must run in `plugin/code.ts`.
- **External APIs:** Use environment variables for secrets; never hardcode API keys.
- **Build system:** Vite is used for both UI and plugin builds; check `vite.config.ts` for customizations.
- **Network access:** All external domains (e.g., cdn.tailwindcss.com, s7d4.scene7.com) must be allowlisted in `manifest.json` under `networkAccess > allowedDomains`.

## Example: Adding a New UI Control
1. Create a new component in `components/` or `components/common/`.
2. Import and use it in `App.tsx` or another parent component.
3. If it needs to communicate with the plugin, use `window.parent.postMessage` and handle messages in `plugin/code.ts`.


---

## Known Issues & Notes
- Debugging: Some `console.log` statements remain in `App.tsx` and `ThemeContext.tsx` for debugging.
- If the UI fails to load or throws a SecurityError, check for localStorage usage (should be replaced with `figma.clientStorage`) and ensure all required domains are allowlisted in `manifest.json`.
- For any build or runtime issues, refer to the README and these instructions for troubleshooting steps.

If you are unsure about a workflow or pattern, check the README or look for examples in `components/` and `plugin/code.ts`.
