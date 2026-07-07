/**
 * Emits the language-agnostic artifacts from the TypeScript specs:
 *   dist/spec.json            the whole catalog
 *   dist/components/<id>.json one file per component
 *   dist/schema.json          a JSON Schema any language can validate against
 *
 * Run with: npm run gen -w @perfect/spec  (Node runs .ts natively)
 * Validation runs first, so a malformed spec fails the build instead of
 * shipping. Output is deterministic (no timestamps) so it diffs cleanly.
 */

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { SPEC_VERSION, specs } from './index.ts';
import { validateSpec } from './schema.ts';
import { schemaJson } from './schema-json.ts';

const issues = specs.flatMap((spec) => validateSpec(spec));
if (issues.length > 0) {
  console.error(`spec validation failed (${issues.length}):`);
  for (const i of issues) console.error(`  ${i.spec} ${i.path}: ${i.message}`);
  process.exit(1);
}

const distUrl = new URL('../dist/', import.meta.url);
rmSync(distUrl, { recursive: true, force: true });
mkdirSync(new URL('components/', distUrl), { recursive: true });

const write = (relative: string, data: unknown) =>
  writeFileSync(new URL(relative, distUrl), `${JSON.stringify(data, null, 2)}\n`);

write('spec.json', { version: SPEC_VERSION, components: specs });
for (const spec of specs) write(`components/${spec.id}.json`, spec);
write('schema.json', schemaJson);

console.log(`wrote ${specs.length} component specs + schema to ${distUrl.pathname}`);
