# create-glacier-app

Scaffold a desktop app skeleton built with [Glacier UI](https://github.com/InfamousVague/GlacierUI).

```sh
npm create glacier-app@latest my-app
```

You get a Vite + React 19 + TypeScript app with a worked, agnostic shell:

- a window title bar with custom minimize / maximize / close controls
- a collapsible sidebar with sections and a brand lockup
- a page toolbar and a hash router across Dashboard, Library, Settings, and About
- a settings page that live-themes the app (theme, accent, density, haptics)
- a data grid with a create modal, a destructive confirm dialog, and a toast system

The Glacier kit is **vendored** into the generated app (`vendor/@glacier/*`), so it
installs and runs with nothing published to npm.

## Options

| flag | description |
| --- | --- |
| `--name <name>` | App name (defaults to the directory name) |
| `--tauri <mode>` | `tauri` for a Rust desktop backend, or `web` for web only |
| `-y, --yes` | Accept defaults, skip the prompts |

```sh
npm create glacier-app@latest my-app -- --tauri tauri --name "Aurora Notes"
```

## Backends

- **Tauri desktop** ships a Tauri v2 Rust crate under `src-tauri/` with a sample
  `greet` command wired to the About page. Needs the Rust toolchain.
- **Web only** ships the same app without the Rust crate; the Tauri bridge in
  `src/app/tauri.ts` no-ops gracefully, so you can add a backend later.

## Maintainers

The template's source of truth is `apps/starter` in the GlacierUI monorepo.
`build.mjs` (run on `prepack`) copies it here, rewrites the monorepo-only bits
for standalone use, and vendors the built kit.
