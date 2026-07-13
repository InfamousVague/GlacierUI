import type { ReactNode } from 'react';
import { EmptyState, Heading, Meter, Pill, Row, StatTile, Text, Size, TextTone, useT } from '@glacier/react';
import { HighlightedCode, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';
import reportData from '../../generated/test-report.json';

// ---------------------------------------------------------------------------
// The committed JSON is a snapshot, so every section is nullable and the
// audit sections (contrast, spec strictness) are treated as untyped data and
// normalised defensively - the audits live in sibling packages and their
// exact shape may evolve without this page needing to know.
// ---------------------------------------------------------------------------

interface ProjectStats {
  files: number;
  tests: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface VitestSection {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  files: number;
  success: boolean;
  durationMs: number;
  projects: Record<string, ProjectStats>;
  failures: { file: string; test: string }[];
}

interface CoverageMetric {
  total: number;
  covered: number;
  pct: number;
}

type MetricName = 'lines' | 'statements' | 'functions' | 'branches';
const METRICS: MetricName[] = ['lines', 'statements', 'functions', 'branches'];

interface CoverageSection {
  total: Partial<Record<MetricName, CoverageMetric>>;
  packages: Record<string, { files: number; metrics: Partial<Record<MetricName, CoverageMetric>> }>;
}

interface AxeSection {
  testFiles: number;
  axeTestFiles: number;
  axeAssertions: number;
}

interface TestReport {
  generatedAt: string;
  vitest: VitestSection | null;
  coverage: CoverageSection | null;
  contrast: unknown;
  specStrictness: unknown;
  axe: AxeSection | null;
}

const report = reportData as unknown as TestReport;

// --- tolerant readers --------------------------------------------------------

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

// --- contrast normalisation --------------------------------------------------

interface ContrastRow {
  pair: string;
  theme: string;
  ratio: number | null;
  pass: boolean | null;
}

function contrastRow(raw: unknown, fallbackTheme: string, fallbackPair: string | null): ContrastRow | null {
  const entry = asRecord(raw);
  if (!entry) return null;
  const ratio = asNumber(entry.ratio) ?? asNumber(entry.contrast) ?? asNumber(entry.value);
  const fg = asString(entry.foreground) ?? asString(entry.fg) ?? asString(entry.text);
  const bg = asString(entry.background) ?? asString(entry.bg) ?? asString(entry.surface);
  const pair =
    asString(entry.pair) ??
    asString(entry.name) ??
    asString(entry.label) ??
    asString(entry.id) ??
    (fg != null && bg != null ? `${fg} on ${bg}` : fallbackPair);
  if (pair == null || ratio == null) return null;
  let pass =
    asBoolean(entry.pass) ??
    asBoolean(entry.passes) ??
    asBoolean(entry.passed) ??
    asBoolean(entry.ok) ??
    asBoolean(entry.aa);
  const required = asNumber(entry.required) ?? asNumber(entry.min) ?? asNumber(entry.threshold);
  if (pass == null && required != null) pass = ratio >= required;
  const theme = asString(entry.theme) ?? asString(entry.mode) ?? fallbackTheme;
  return { pair, theme, ratio, pass };
}

function normalizeContrast(section: unknown): ContrastRow[] {
  if (Array.isArray(section)) {
    return section
      .map((entry) => contrastRow(entry, 'default', null))
      .filter((row): row is ContrastRow => row !== null);
  }
  const record = asRecord(section);
  if (!record) return [];
  const rows: ContrastRow[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        const row = contrastRow(entry, key, null);
        if (row) rows.push(row);
      }
    } else {
      const row = contrastRow(value, 'default', key);
      if (row) rows.push(row);
    }
  }
  return rows;
}

// --- spec strictness normalisation -------------------------------------------

interface StrictCategory {
  name: string;
  ratio: number;
  detail: string;
  /** Passed checks and total checks, when the audit reports discrete counts. */
  filled?: number;
  total?: number;
}

function extractRatio(value: unknown): { ratio: number; detail: string; filled?: number; total?: number } | null {
  const direct = asNumber(value);
  if (direct != null) {
    const ratio = direct <= 1 ? direct : direct <= 100 ? direct / 100 : null;
    return ratio == null ? null : { ratio, detail: `${Math.round(ratio * 100)}%` };
  }
  const record = asRecord(value);
  if (!record) return null;
  const numeratorKeys = ['strict', 'pass', 'passed', 'passing', 'covered', 'count', 'met', 'ok'];
  const denominatorKeys = ['total', 'max', 'all', 'of'];
  let numerator: number | null = null;
  for (const key of numeratorKeys) {
    numerator ??= asNumber(record[key]);
  }
  let denominator: number | null = null;
  for (const key of denominatorKeys) {
    denominator ??= asNumber(record[key]);
  }
  if (numerator != null && denominator != null && denominator > 0) {
    return { ratio: numerator / denominator, detail: `${numerator}/${denominator}`, filled: numerator, total: denominator };
  }
  const pctKeys = ['pct', 'percent', 'percentage', 'ratio', 'score', 'value'];
  for (const key of pctKeys) {
    const nested = extractRatio(record[key]);
    if (nested) return nested;
  }
  return null;
}

interface StrictnessView {
  overall: StrictCategory | null;
  categories: StrictCategory[];
}

function strictnessEntry(raw: unknown, name: string | null): StrictCategory | null {
  const entry = asRecord(raw);
  if (!entry) return null;
  const id = name ?? asString(entry.id) ?? asString(entry.name) ?? asString(entry.category) ?? asString(entry.key);
  const completeness = asNumber(entry.completeness);
  const checks = asNumber(entry.checks);
  const missingCount = Array.isArray(entry.missing) ? entry.missing.length : asNumber(entry.missing);
  if (id != null && completeness != null) {
    if (checks != null && missingCount != null) {
      const passed = checks - missingCount;
      return { name: id, ratio: completeness, detail: `${passed}/${checks}`, filled: passed, total: checks };
    }
    return { name: id, ratio: completeness, detail: `${Math.round(completeness * 100)}%` };
  }
  const found = extractRatio(entry) ?? extractRatio(entry.summary);
  return id != null && found ? { name: id, ...found } : null;
}

function normalizeStrictness(section: unknown): StrictnessView {
  if (Array.isArray(section)) {
    return {
      overall: null,
      categories: section
        .map((raw) => strictnessEntry(raw, null))
        .filter((entry): entry is StrictCategory => entry !== null),
    };
  }
  const record = asRecord(section);
  if (!record) return { overall: null, categories: [] };
  // The catalog roll-up from @glacier/spec's auditCatalogStrictness: a
  // components array plus catalog-wide checks/missing/completeness.
  const listKey = ['components', 'categories'].find((key) => Array.isArray(record[key]));
  if (listKey != null) {
    const nested = normalizeStrictness(record[listKey]);
    return { overall: strictnessEntry(record, 'catalog'), categories: nested.categories };
  }
  const categories: StrictCategory[] = [];
  for (const [key, value] of Object.entries(record)) {
    const found = extractRatio(value);
    if (found) categories.push({ name: key, ...found });
  }
  return { overall: null, categories };
}

// --- formatting ---------------------------------------------------------------

function formatDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

function formatPct(pct: number): string {
  return `${pct.toFixed(pct === 100 ? 0 : 1)}%`;
}

function passPill(pass: boolean | null) {
  const t = useT();
  if (pass == null) return <Pill size="sm">{t(m.testreportUnknown)}</Pill>;
  return pass ? (
    <Pill size="sm" tone="success">
      {t(m.testreportPass)}
    </Pill>
  ) : (
    <Pill size="sm" tone="danger">
      {t(m.testreportFail)}
    </Pill>
  );
}

function sectionEmpty(title: string, description: string) {
  return <EmptyState title={title} description={description} />;
}

// --- sections -----------------------------------------------------------------

function VitestBlock({ data }: { data: VitestSection | null }) {
  const t = useT();
  if (!data) {
    return sectionEmpty(t(m.trEmptyVitestTitle), `${t(m.trEmptyVitestDesc)} ${t(m.trRerunHint)}`);
  }
  const projects = Object.entries(data.projects);
  return (
    <>
      <Row gap={3} wrap style={{ marginBottom: 'var(--glacier-space-4)' }}>
        <StatTile value={data.total} label={t(m.trTests)} hint={`${data.files} ${t(m.trFilesLower)}`} />
        <StatTile value={data.passed} label={t(m.trPassed)} />
        <StatTile
          value={data.failed}
          label={t(m.trFailed)}
          hint={passPill(data.failed === 0)}
        />
        <StatTile value={formatDuration(data.durationMs)} label={t(m.trSuiteDuration)} />
      </Row>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>{t(m.trThProject)}</th>
              <th>{t(m.trFiles)}</th>
              <th>{t(m.trTests)}</th>
              <th>{t(m.trPassed)}</th>
              <th>{t(m.trFailed)}</th>
              <th>{t(m.trThStatus)}</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(([name, stats]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>{stats.files}</td>
                <td>{stats.tests}</td>
                <td>{stats.passed}</td>
                <td>{stats.failed}</td>
                <td>{passPill(stats.failed === 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.failures.length > 0 && (
        <>
          <Text tone={TextTone.Muted} style={{ marginTop: 'var(--glacier-space-3)' }}>
            {t(m.trFailuresLabel)}
          </Text>
          <div className="propsTableWrap">
            <table className="tokenTable">
              <thead>
                <tr>
                  <th>{t(m.trThFile)}</th>
                  <th>{t(m.trThTest)}</th>
                </tr>
              </thead>
              <tbody>
                {data.failures.map((failure, index) => (
                  <tr key={index}>
                    <td>
                      <code>{failure.file}</code>
                    </td>
                    <td>{failure.test}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

function CoverageBlock({ data }: { data: CoverageSection | null }) {
  const t = useT();
  if (!data) {
    return sectionEmpty(
      t(m.trEmptyCoverageTitle),
      `${t(m.trEmptyCoverageDesc)} ${t(m.trRerunHint)}`,
    );
  }
  const packages = Object.entries(data.packages);
  return (
    <div className="propsTableWrap">
      <table className="tokenTable">
        <thead>
          <tr>
            <th>{t(m.trThPackage)}</th>
            <th>{t(m.trFiles)}</th>
            {METRICS.map((metric) => (
              <th key={metric}>{metric[0]?.toUpperCase() + metric.slice(1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {packages.map(([name, pkg]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{pkg.files}</td>
              {METRICS.map((metric) => {
                const m = pkg.metrics[metric];
                return <td key={metric}>{m ? `${formatPct(m.pct)} (${m.covered}/${m.total})` : '-'}</td>;
              })}
            </tr>
          ))}
          <tr>
            <td>
              <strong>{t(m.trTotal)}</strong>
            </td>
            <td />
            {METRICS.map((metric) => {
              const m = data.total[metric];
              return (
                <td key={metric}>
                  <strong>{m ? formatPct(m.pct) : '-'}</strong>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ContrastBlock({ data }: { data: unknown }) {
  const t = useT();
  if (data == null) {
    return sectionEmpty(
      t(m.trEmptyContrastTitle),
      `${t(m.trEmptyContrastDesc)} ${t(m.trRerunHint)}`,
    );
  }
  const rows = normalizeContrast(data);
  if (rows.length === 0) {
    return <HighlightedCode language="json" code={JSON.stringify(data, null, 2)} />;
  }
  const themes = [...new Set(rows.map((row) => row.theme))];
  const pairs = [...new Set(rows.map((row) => row.pair))];
  const cell = new Map<string, ContrastRow>();
  for (const row of rows) cell.set(`${row.theme} ${row.pair}`, row);
  return (
    <div className="propsTableWrap">
      <table className="tokenTable">
        <thead>
          <tr>
            <th>{t(m.trThPair)}</th>
            {themes.map((theme) => (
              <th key={theme}>{theme}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pairs.map((pair) => (
            <tr key={pair}>
              <td>
                <code>{pair}</code>
              </td>
              {themes.map((theme) => {
                const row = cell.get(`${theme} ${pair}`);
                if (!row) return <td key={theme}>-</td>;
                return (
                  <td key={theme}>
                    <Row gap={2} align="center">
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {row.ratio == null ? '-' : row.ratio.toFixed(2)}
                      </span>
                      {passPill(row.pass)}
                    </Row>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StrictnessBlock({ data }: { data: unknown }) {
  const t = useT();
  if (data == null) {
    return sectionEmpty(
      t(m.trEmptyStrictnessTitle),
      `${t(m.trEmptyStrictnessDesc)} ${t(m.trRerunHint)}`,
    );
  }
  const { overall, categories } = normalizeStrictness(data);
  if (categories.length === 0 && overall == null) {
    return <HighlightedCode language="json" code={JSON.stringify(data, null, 2)} />;
  }
  return (
    <>
      {overall != null && (
        <Row gap={3} wrap style={{ marginBottom: 'var(--glacier-space-4)' }}>
          <StatTile
            value={`${Math.round(overall.ratio * 100)}%`}
            label={t(m.trStatCatalogStrictness)}
            hint={overall.detail}
          />
        </Row>
      )}
      <div style={{ display: 'grid', gap: 'var(--glacier-space-3)', width: '100%' }}>
        {categories.map((category) => (
          <Row key={category.name} gap={3} align="center">
            <Text as="span" size={Size.Small} style={{ minWidth: '11rem' }}>
              {category.name}
            </Text>
            <div style={{ flex: 1 }}>
              {category.total === 0 ? (
                <Text as="span" size={Size.Small} tone={TextTone.Subtle}>
                  {t(m.trNoStrictChecks)}
                </Text>
              ) : category.total != null && category.filled != null ? (
                // One segment per strictness check so the bar reads as filled/total.
                <Meter
                  value={category.filled}
                  segments={category.total}
                  aria-label={`${category.name} ${t(m.trStrictnessWord)}`}
                />
              ) : (
                <Meter
                  value={Math.round(category.ratio * 100)}
                  max={100}
                  segments={10}
                  aria-label={`${category.name} ${t(m.trStrictnessWord)}`}
                />
              )}
            </div>
            <Text as="span" size={Size.Small} tone={TextTone.Muted} mono>
              {category.detail}
            </Text>
          </Row>
        ))}
      </div>
    </>
  );
}

// Every report section is a Heading, a muted subtext line, then its content
// block; this wrapper gives the content a consistent gap below the subtext.
function SectionBody({ children }: { children: ReactNode }) {
  return <div style={{ marginBlockStart: 'var(--glacier-space-5)' }}>{children}</div>;
}

function AxeBlock({ data }: { data: AxeSection | null }) {
  const t = useT();
  if (!data) {
    return sectionEmpty(t(m.trEmptyAxeTitle), `${t(m.trEmptyAxeDesc)} ${t(m.trRerunHint)}`);
  }
  return (
    <Row gap={3} wrap>
      <StatTile value={data.testFiles} label={t(m.trStatTestFiles)} />
      <StatTile value={data.axeTestFiles} label={t(m.trStatAxeFiles)} />
      <StatTile value={data.axeAssertions} label={t(m.trStatAxeAssertions)} />
    </Row>
  );
}

// ---------------------------------------------------------------------------

export function TestReportPage() {
  const t = useT();
  const generated = new Date(report.generatedAt);
  return (
    <>
      <Heading level={1}>{t(m.trName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.trLede)}
      </Text>
      <Text size={Size.Small} tone={TextTone.Muted}>
        {prose(t(m.trRegenNote))}
        {Number.isNaN(generated.getTime()) ? '' : `, ${t(m.trGeneratedWord)} ${generated.toISOString().slice(0, 10)}`}.
      </Text>

      <Heading level={2}>{t(m.trSecUnitTests)}</Heading>
      <SectionBody>
        <VitestBlock data={report.vitest} />
      </SectionBody>

      <Heading level={2}>{t(m.trSecCoverage)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.trCoverageDesc))}</Text>
      <SectionBody>
        <CoverageBlock data={report.coverage} />
      </SectionBody>

      <Heading level={2}>{t(m.trSecContrast)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.trContrastDesc))}</Text>
      <SectionBody>
        <ContrastBlock data={report.contrast} />
      </SectionBody>

      <Heading level={2}>{t(m.trSecStrictness)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.trStrictnessDesc))}</Text>
      <SectionBody>
        <StrictnessBlock data={report.specStrictness} />
      </SectionBody>

      <Heading level={2}>{t(m.trSecAxe)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(m.trAxeDesc))}</Text>
      <SectionBody>
        <AxeBlock data={report.axe} />
      </SectionBody>
    </>
  );
}
