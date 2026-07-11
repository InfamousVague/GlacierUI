// Generates apps/docs/src/generated/test-report.json - the data behind the
// docs Test Report page. Run with `npm run report` from the repo root.
//
// Every section is nullable: the script probes for the vitest suite, the
// istanbul coverage summary, the tokens contrast audit, and the spec
// strictness audit, and records null for anything absent or failing so the
// report can always be written. The JSON is committed like tokens.css, so the
// output must stay machine-portable: no absolute paths.

import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'apps', 'docs', 'src', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'test-report.json');

const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join('/');

// ---------------------------------------------------------------------------
// vitest
// ---------------------------------------------------------------------------

/** Maps a repo-relative test file path to the vitest project that owns it. */
function projectFor(relPath) {
  const m = relPath.match(/^packages\/([^/]+)\//) ?? relPath.match(/^apps\/([^/]+)\//);
  return m ? m[1] : 'other';
}

async function runVitest() {
  let stdout;
  const startedAt = Date.now();
  try {
    const result = await execFileAsync('npx', ['vitest', 'run', '--reporter=json'], {
      cwd: ROOT,
      maxBuffer: 1024 * 1024 * 512,
      env: { ...process.env, CI: 'true' },
    }).catch((error) => {
      // vitest exits non-zero when tests fail; the JSON is still on stdout.
      if (error && typeof error.stdout === 'string' && error.stdout.trim()) return error;
      throw error;
    });
    stdout = result.stdout;
  } catch (error) {
    console.error(`vitest run failed: ${error.message ?? error}`);
    return null;
  }
  const wallMs = Date.now() - startedAt;

  // The reporter prints a single JSON object; trim any stray noise around it.
  const first = stdout.indexOf('{');
  const last = stdout.lastIndexOf('}');
  if (first === -1 || last === -1) {
    console.error('vitest produced no JSON output');
    return null;
  }
  let json;
  try {
    json = JSON.parse(stdout.slice(first, last + 1));
  } catch (error) {
    console.error(`could not parse vitest JSON: ${error.message}`);
    return null;
  }

  const projects = {};
  const failures = [];
  let maxEnd = 0;
  for (const file of json.testResults ?? []) {
    const fileRel = rel(file.name ?? '');
    const project = projectFor(fileRel);
    const bucket = (projects[project] ??= { files: 0, tests: 0, passed: 0, failed: 0, skipped: 0 });
    bucket.files += 1;
    if (typeof file.endTime === 'number') maxEnd = Math.max(maxEnd, file.endTime);
    for (const assertion of file.assertionResults ?? []) {
      bucket.tests += 1;
      if (assertion.status === 'passed') bucket.passed += 1;
      else if (assertion.status === 'failed') {
        bucket.failed += 1;
        failures.push({ file: fileRel, test: assertion.fullName ?? assertion.title ?? '' });
      } else bucket.skipped += 1;
    }
  }

  const durationMs =
    typeof json.startTime === 'number' && maxEnd > json.startTime ? maxEnd - json.startTime : wallMs;

  return {
    total: json.numTotalTests ?? 0,
    passed: json.numPassedTests ?? 0,
    failed: json.numFailedTests ?? 0,
    skipped: (json.numPendingTests ?? 0) + (json.numTodoTests ?? 0),
    files: json.numTotalTestSuites ?? Object.values(projects).reduce((n, p) => n + p.files, 0),
    success: json.success === true,
    durationMs: Math.round(durationMs),
    projects,
    failures,
  };
}

// ---------------------------------------------------------------------------
// coverage (istanbul json-summary written by a separate coverage run)
// ---------------------------------------------------------------------------

function readCoverage() {
  const file = path.join(ROOT, 'coverage', 'coverage-summary.json');
  if (!existsSync(file)) return null;
  let summary;
  try {
    summary = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`could not parse coverage summary: ${error.message}`);
    return null;
  }

  const METRICS = ['lines', 'statements', 'functions', 'branches'];
  const pickTotals = (entry) => {
    const out = {};
    for (const metric of METRICS) {
      const m = entry?.[metric];
      if (!m || typeof m.total !== 'number') continue;
      out[metric] = { total: m.total, covered: m.covered ?? 0, pct: m.pct ?? 0 };
    }
    return out;
  };

  const packages = {};
  for (const [key, entry] of Object.entries(summary)) {
    if (key === 'total') continue;
    const relPath = path.isAbsolute(key) ? rel(key) : key.split(path.sep).join('/');
    const pkg = relPath.match(/^(packages|apps)\/([^/]+)\//)?.[2] ?? 'other';
    const bucket = (packages[pkg] ??= { files: 0, metrics: {} });
    bucket.files += 1;
    for (const metric of METRICS) {
      const m = entry?.[metric];
      if (!m || typeof m.total !== 'number') continue;
      const agg = (bucket.metrics[metric] ??= { total: 0, covered: 0, pct: 0 });
      agg.total += m.total;
      agg.covered += m.covered ?? 0;
    }
  }
  for (const bucket of Object.values(packages)) {
    for (const agg of Object.values(bucket.metrics)) {
      agg.pct = agg.total === 0 ? 100 : Math.round((agg.covered / agg.total) * 10000) / 100;
    }
  }

  return { total: pickTotals(summary.total), packages };
}

// ---------------------------------------------------------------------------
// TS audits (contrast + spec strictness), run the same way `npm run gen`
// runs .ts sources: node with --experimental-transform-types.
// ---------------------------------------------------------------------------

const MARKER = '__GLACIER_REPORT__';

async function runTsAudit(name, code) {
  try {
    const { stdout } = await execFileAsync(
      process.execPath,
      ['--experimental-transform-types', '--input-type=module', '-e', code],
      { cwd: ROOT, maxBuffer: 1024 * 1024 * 64 },
    );
    const line = stdout.split('\n').find((l) => l.startsWith(MARKER));
    if (!line) return null;
    return JSON.parse(line.slice(MARKER.length));
  } catch (error) {
    console.error(`${name} audit failed: ${(error.stderr ?? error.message ?? '').toString().slice(0, 400)}`);
    return null;
  }
}

async function runContrastAudit() {
  const tsFile = path.join(ROOT, 'packages', 'tokens', 'src', 'contrast.ts');
  if (!existsSync(tsFile)) return null;
  const code = [
    `const mod = await import(${JSON.stringify(pathToFileURL(tsFile).href)});`,
    `const fn = mod.contrastAudit;`,
    `if (typeof fn !== 'function') { console.log(${JSON.stringify(MARKER)} + 'null'); }`,
    `else { const result = await fn(); console.log(${JSON.stringify(MARKER)} + JSON.stringify(result ?? null)); }`,
  ].join('\n');
  return runTsAudit('contrast', code);
}

async function runStrictnessAudit() {
  const srcDir = path.join(ROOT, 'packages', 'spec', 'src');
  const indexTs = path.join(srcDir, 'index.ts');
  if (!existsSync(indexTs)) return null;
  // The audit may live in (or be re-exported from) the entry; schema.ts holds
  // the implementation today. Merge both so parent wiring order cannot break us.
  const modules = [pathToFileURL(indexTs).href];
  const schemaTs = path.join(srcDir, 'schema.ts');
  if (existsSync(schemaTs) && readFileSync(schemaTs, 'utf8').includes('auditStrictness')) {
    modules.push(pathToFileURL(schemaTs).href);
  }
  const code = [
    `let api = {};`,
    `for (const href of ${JSON.stringify(modules)}) { try { api = { ...api, ...(await import(href)) }; } catch {} }`,
    `const specs = Array.isArray(api.specs) ? api.specs : Array.isArray(api.catalog) ? api.catalog : null;`,
    `let result = null;`,
    `if (typeof api.auditCatalogStrictness === 'function' && specs) result = api.auditCatalogStrictness(specs);`,
    `else if (typeof api.auditStrictness === 'function' && specs) {`,
    `  const components = specs.map((spec) => ({ id: spec.id, ...api.auditStrictness(spec) }));`,
    `  const checks = components.reduce((sum, c) => sum + (c.checks ?? 0), 0);`,
    `  const missing = components.reduce((sum, c) => sum + (c.missing?.length ?? 0), 0);`,
    `  result = { components, checks, missing, completeness: checks === 0 ? 1 : (checks - missing) / checks };`,
    `}`,
    `else if (typeof api.auditStrictness === 'function' && api.auditStrictness.length === 0) result = await api.auditStrictness();`,
    `console.log(${JSON.stringify(MARKER)} + JSON.stringify(result ?? null));`,
  ].join('\n');
  return runTsAudit('strictness', code);
}

// ---------------------------------------------------------------------------
// axe suite stats (static count over packages/react/test)
// ---------------------------------------------------------------------------

function countAxe() {
  const dir = path.join(ROOT, 'packages', 'react', 'test');
  if (!existsSync(dir)) return null;
  let testFiles = 0;
  let axeTestFiles = 0;
  let axeAssertions = 0;
  for (const name of readdirSync(dir)) {
    if (!/\.test\.tsx?$/.test(name)) continue;
    testFiles += 1;
    const source = readFileSync(path.join(dir, name), 'utf8');
    const calls = source.match(/\baxe\.run\(/g)?.length ?? 0;
    if (calls > 0) {
      axeTestFiles += 1;
      axeAssertions += calls;
    }
  }
  return { testFiles, axeTestFiles, axeAssertions };
}

// ---------------------------------------------------------------------------

const [vitest, contrast, specStrictness] = await Promise.all([
  runVitest(),
  runContrastAudit(),
  runStrictnessAudit(),
]);

const report = {
  generatedAt: new Date().toISOString(),
  vitest,
  coverage: readCoverage(),
  contrast,
  specStrictness,
  axe: countAxe(),
};

// The report is committed, so it must never leak machine-local paths.
let serialized = JSON.stringify(report, null, 2) + '\n';
serialized = serialized.split(ROOT + path.sep).join('').split(ROOT).join('.');

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, serialized);

const sections = Object.entries(report)
  .filter(([key]) => key !== 'generatedAt')
  .map(([key, value]) => `${key}=${value === null ? 'null' : 'ok'}`)
  .join(' ');
console.log(`wrote ${rel(OUT_FILE)} (${sections})`);
