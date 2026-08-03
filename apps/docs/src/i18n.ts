/**
 * Docs translation catalog - re-export barrel.
 *
 * The catalog now lives in ./i18n/ as one folder per language, each split into
 * section files (foundations, atoms, molecules, organisms, structures, common)
 * plus nav (group + page titles). ./i18n/index.ts zips those per-language
 * sections back into the { key: { en, es, … } } shape the app consumes, so this
 * file - and every `from './i18n.ts'` import across the docs - keeps working
 * unchanged. Edit the per-language section files; keep keys identical across
 * every language folder.
 */
export { m, groupTitles, pageTitles, LANGUAGES, pageConcepts, pageTags } from './i18n/index.ts';
