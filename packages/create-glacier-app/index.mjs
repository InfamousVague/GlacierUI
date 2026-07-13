#!/usr/bin/env node
/**
 * create-glacier-app
 *
 * Scaffolds a desktop app skeleton built with Glacier UI. Copies the vendored
 * template, fills in the name, and keeps or drops the Tauri backend. Zero
 * runtime dependencies: everything here is Node built-ins.
 */
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(HERE, 'template');

const c = {
  bold: (s) => `[1m${s}[0m`,
  dim: (s) => `[2m${s}[0m`,
  cyan: (s) => `[36m${s}[0m`,
  green: (s) => `[32m${s}[0m`,
  red: (s) => `[31m${s}[0m`,
};

// Files that carry the placeholders / the sample name. Kept to text files so we
// never rewrite the vendored bundle or the icons.
const TEXT_EXT = /\.(json|ts|tsx|html|css|md|rs|toml)$/;

function slugify(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'glacier-app'
  );
}

function fail(message) {
  console.error(`\n${c.red('Error:')} ${message}\n`);
  process.exit(1);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function replaceInTree(root, replacements) {
  for (const file of walk(root)) {
    if (!TEXT_EXT.test(file)) continue;
    let text = readFileSync(file, 'utf8');
    let changed = false;
    for (const [from, to] of replacements) {
      if (text.includes(from)) {
        text = text.split(from).join(to);
        changed = true;
      }
    }
    if (changed) writeFileSync(file, text);
  }
}

async function main() {
  if (!existsSync(TEMPLATE)) {
    fail('the template is missing. If you are running from source, build it first with `node build.mjs`.');
  }

  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: 'string' },
      tauri: { type: 'string' }, // 'tauri' | 'web'
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
    },
  });

  if (values.help) {
    console.log(`
${c.bold('create-glacier-app')} - scaffold a Glacier UI desktop app

${c.bold('Usage')}
  npm create glacier-app@latest [directory] -- [options]

${c.bold('Options')}
  --name <name>     App name (defaults to the directory name)
  --tauri <mode>    Backend: ${c.cyan('tauri')} (Rust desktop) or ${c.cyan('web')} (web only)
  -y, --yes         Accept defaults, skip prompts
  -h, --help        Show this help
`);
    return;
  }

  const rl = values.yes ? null : createInterface({ input: stdin, output: stdout });
  const ask = async (question, fallback) => {
    if (!rl) return fallback;
    const answer = (await rl.question(question)).trim();
    return answer || fallback;
  };

  console.log(`\n${c.bold(c.cyan('  Glacier'))} ${c.dim('desktop app scaffold')}\n`);

  // --- directory + name ---
  let dir = positionals[0];
  if (!dir) dir = await ask(`${c.bold('Project directory')} ${c.dim('(glacier-app)')} `, 'glacier-app');
  const targetDir = resolve(process.cwd(), dir);
  const displayDefault = values.name ?? basename(targetDir).replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const displayName = values.name ?? (await ask(`${c.bold('App name')} ${c.dim(`(${displayDefault})`)} `, displayDefault));
  const slug = slugify(displayName);
  const identifier = `com.example.${slug.replace(/-/g, '')}`;

  // --- backend ---
  let mode = values.tauri;
  if (!mode) {
    const answer = await ask(
      `${c.bold('Backend')} ${c.dim('[T]auri desktop (Rust) / [w]eb only (T)')} `,
      'tauri',
    );
    mode = /^w/i.test(answer) ? 'web' : 'tauri';
  }
  if (mode !== 'tauri' && mode !== 'web') fail(`--tauri must be "tauri" or "web", got "${mode}"`);

  rl?.close();

  if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
    fail(`${targetDir} already exists and is not empty.`);
  }

  // --- copy + fill in ---
  console.log(`\n  ${c.dim('scaffolding into')} ${targetDir}`);
  cpSync(TEMPLATE, targetDir, { recursive: true });

  // npm strips a .gitignore from published packages, so it ships as _gitignore.
  const shippedIgnore = join(targetDir, '_gitignore');
  if (existsSync(shippedIgnore)) renameSync(shippedIgnore, join(targetDir, '.gitignore'));

  replaceInTree(targetDir, [
    ['__APP_SLUG__', slug],
    ['__APP_IDENTIFIER__', identifier],
    ['__APP_NAME__', displayName],
    ['Glacier Starter', displayName],
  ]);

  if (mode === 'web') {
    rmSync(join(targetDir, 'src-tauri'), { recursive: true, force: true });
  } else {
    // Wire the Tauri toolchain into the app's package.json.
    const pkgPath = join(targetDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.scripts = {
      ...pkg.scripts,
      tauri: 'tauri',
      'tauri:dev': 'tauri dev',
      'tauri:build': 'tauri build',
    };
    pkg.devDependencies = { ...pkg.devDependencies, '@tauri-apps/cli': '^2' };
    pkg.dependencies = {
      ...pkg.dependencies,
      '@tauri-apps/api': '^2',
      '@tauri-apps/plugin-opener': '^2',
    };
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }

  // --- done ---
  const rel = dir === '.' ? '' : `cd ${dir}\n  `;
  console.log(`\n  ${c.green('Done.')} Created ${c.bold(displayName)} ${c.dim(`(${mode === 'tauri' ? 'Tauri desktop' : 'web only'})`)}\n`);
  console.log(`  ${c.bold('Next steps')}\n`);
  console.log(`  ${rel}npm install`);
  console.log(`  npm run dev${c.dim('            # web app on http://localhost:5240')}`);
  if (mode === 'tauri') {
    console.log(`  npm run tauri:dev${c.dim('      # desktop window (needs the Rust toolchain)')}`);
  }
  console.log('');
}

main().catch((error) => fail(error?.message ?? String(error)));
