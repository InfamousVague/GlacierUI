#!/usr/bin/env node
/**
 * Assembles the standalone template shipped inside create-glacier-app.
 *
 * The live source of truth is apps/starter (a real workspace app that builds
 * and runs in the monorepo). This script copies it into ./template, rewrites
 * the few monorepo-only bits for standalone use, and vendors the built Glacier
 * kit next to it so a scaffolded app installs and runs with no npm publish.
 *
 * Runs from prepack, so the published package always carries a fresh template.
 * Pass --build-kit to force a rebuild of @glacier/react first.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const STARTER = join(ROOT, 'apps', 'starter');
const TEMPLATE = join(HERE, 'template');
const forceBuild = process.argv.includes('--build-kit');

const REACT_DIST = join(ROOT, 'packages', 'react', 'dist');
const TOKENS = join(ROOT, 'packages', 'tokens');
const ICONS = join(ROOT, 'packages', 'icons');

const write = (rel, contents) => {
  const target = join(TEMPLATE, rel);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, typeof contents === 'string' ? contents : JSON.stringify(contents, null, 2) + '\n');
};

const TOKENS_DEPS = JSON.parse(readFileSync(join(TOKENS, 'package.json'), 'utf8')).dependencies ?? {};

// ---- 1. ensure the kit is built -------------------------------------------
if (forceBuild || !existsSync(join(REACT_DIST, 'index.js'))) {
  console.log('> building @glacier/react ...');
  execFileSync('npm', ['run', 'build', '-w', '@glacier/react'], { cwd: ROOT, stdio: 'inherit' });
}
for (const f of ['index.js', 'index.d.ts', 'styles.css']) {
  if (!existsSync(join(REACT_DIST, f))) throw new Error(`missing @glacier/react/dist/${f}; run with --build-kit`);
}

// ---- 2. reset and copy the starter app ------------------------------------
rmSync(TEMPLATE, { recursive: true, force: true });
mkdirSync(TEMPLATE, { recursive: true });
cpSync(join(STARTER, 'src'), join(TEMPLATE, 'src'), { recursive: true });
cpSync(join(STARTER, 'index.html'), join(TEMPLATE, 'index.html'));

// The standalone app is styled by the built stylesheet, not the source CSS
// modules the monorepo alias serves.
cpSync(join(REACT_DIST, 'styles.css'), join(TEMPLATE, 'src', 'styles.css'));

// ---- 3. standalone config (no monorepo aliases) ---------------------------
write('package.json', {
  name: '__APP_SLUG__',
  private: true,
  version: '0.1.0',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'tsc --noEmit && vite build',
    preview: 'vite preview',
    typecheck: 'tsc --noEmit',
  },
  dependencies: {
    '@glacier/react': 'file:./vendor/@glacier/react',
    '@glacier/tokens': 'file:./vendor/@glacier/tokens',
    '@glacier/icons': 'file:./vendor/@glacier/icons',
    react: '^19.1.0',
    'react-dom': '^19.1.0',
    motion: '^12.23.0',
    'lucide-react': '^1.23.0',
  },
  devDependencies: {
    '@types/react': '^19.2.0',
    '@types/react-dom': '^19.2.0',
    '@vitejs/plugin-react': '^5.0.0',
    typescript: '^5.9.0',
    vite: '^7.0.0',
  },
});

write(
  'vite.config.ts',
  `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A relative base so the built app works when Tauri serves it from a custom
// protocol rather than the server root. @glacier/react resolves from the
// vendored copy in node_modules (installed via the file: dependency).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5240,
    strictPort: true,
  },
  clearScreen: false,
});
`,
);

write(
  'tsconfig.json',
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noUncheckedIndexedAccess: true,
        skipLibCheck: true,
        isolatedModules: true,
        allowImportingTsExtensions: true,
        noEmit: true,
        resolveJsonModule: true,
      },
      include: ['src', 'vite.config.ts'],
    },
    null,
    2,
  ) + '\n',
);

// ---- 4. vendor the kit ----------------------------------------------------
// @glacier/react: the built bundle (spec, tokens, motion already inlined).
for (const f of ['index.js', 'index.d.ts', 'styles.css']) {
  cpSync(join(REACT_DIST, f), join(TEMPLATE, 'vendor', '@glacier', 'react', 'dist', f));
}
write('vendor/@glacier/react/package.json', {
  name: '@glacier/react',
  version: '0.1.0',
  type: 'module',
  main: './dist/index.js',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  exports: {
    '.': { types: './dist/index.d.ts', import: './dist/index.js' },
    './styles.css': './dist/styles.css',
  },
  dependencies: { motion: '^12.23.0' },
  peerDependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
});

// @glacier/tokens: source (minus the build-only generator) plus the generated
// CSS and JSON the app imports directly.
cpSync(join(TOKENS, 'src'), join(TEMPLATE, 'vendor', '@glacier', 'tokens', 'src'), {
  recursive: true,
  filter: (src) => !src.endsWith('generate.ts'),
});
cpSync(join(TOKENS, 'css'), join(TEMPLATE, 'vendor', '@glacier', 'tokens', 'css'), { recursive: true });
cpSync(join(TOKENS, 'json'), join(TEMPLATE, 'vendor', '@glacier', 'tokens', 'json'), { recursive: true });
write('vendor/@glacier/tokens/package.json', {
  name: '@glacier/tokens',
  version: '0.1.0',
  type: 'module',
  exports: {
    '.': './src/index.ts',
    './css/tokens.css': './css/tokens.css',
    './css/fonts.css': './css/fonts.css',
    './json/tokens.json': './json/tokens.json',
  },
  dependencies: TOKENS_DEPS,
});

// @glacier/icons: the lucide proxy source.
cpSync(join(ICONS, 'src'), join(TEMPLATE, 'vendor', '@glacier', 'icons', 'src'), { recursive: true });
write('vendor/@glacier/icons/package.json', {
  name: '@glacier/icons',
  version: '0.1.0',
  type: 'module',
  exports: { '.': './src/index.ts' },
  dependencies: { 'lucide-react': '^1.23.0' },
});

// ---- 5. the Tauri crate ---------------------------------------------------
// apps/starter/src-tauri is the runnable reference crate; copy it in and put
// the per-app identifier back to a placeholder so the CLI can fill it. The
// productName / window title stay "Glacier Starter" and are replaced with the
// chosen app name by the CLI's global rename. The target dir is excluded so a
// local `cargo build` never leaks into the template. The CLI keeps this crate
// for the Tauri backend option and drops it for the web-only option.
cpSync(join(STARTER, 'src-tauri'), join(TEMPLATE, 'src-tauri'), {
  recursive: true,
  filter: (src) => !src.includes(`${sep}target${sep}`) && !src.endsWith(`${sep}target`),
});
{
  const conf = join(TEMPLATE, 'src-tauri', 'tauri.conf.json');
  writeFileSync(conf, readFileSync(conf, 'utf8').replace('com.glacier.starter', '__APP_IDENTIFIER__'));
}

// ---- 6. project files -----------------------------------------------------
write('_gitignore', 'node_modules\ndist\n.DS_Store\nsrc-tauri/target\n');

write(
  'README.md',
  `# __APP_NAME__

A desktop app skeleton built with [Glacier UI](https://github.com/InfamousVague/GlacierUI),
scaffolded by \`create-glacier-app\`.

## Develop

\`\`\`sh
npm install
npm run dev        # web app on http://localhost:5240
\`\`\`

Everything under \`src/app\` is yours to replace: the sidebar navigation, the
window title bar, the settings, the modal, and the toast system are all worked
examples composed from Glacier components. The kit is vendored under
\`vendor/@glacier/*\`, so the app installs and runs with no extra setup.

## Desktop (Tauri)

When you scaffolded with the Tauri backend, \`src-tauri/\` holds a Tauri v2 Rust
crate with a sample \`greet\` command wired to the About page:

\`\`\`sh
npm run tauri:dev     # run the desktop window
npm run tauri:build   # produce an installer
\`\`\`

Requires the [Rust toolchain](https://www.rust-lang.org/tools/install) and the
[Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).
`,
);

console.log(`> template assembled at ${TEMPLATE}`);
