import type { ReactNode } from 'react';
import { EmptyState, Heading, Meter, Pill, Row, StatTile, Text, Size, TextTone } from '@glacier/react';
import { HighlightedCode } from '../../docs-ui.tsx';
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
  if (pass == null) return <Pill size="sm">unknown</Pill>;
  return pass ? (
    <Pill size="sm" tone="success">
      pass
    </Pill>
  ) : (
    <Pill size="sm" tone="danger">
      fail
    </Pill>
  );
}

function sectionEmpty(title: string, description: string) {
  return <EmptyState title={title} description={description} />;
}

const RERUN_HINT = 'Run npm run report at the repo root and commit the refreshed JSON.';

// --- sections -----------------------------------------------------------------

function VitestBlock({ data }: { data: VitestSection | null }) {
  if (!data) {
    return sectionEmpty('No unit test data', `The last report run had no vitest results. ${RERUN_HINT}`);
  }
  const projects = Object.entries(data.projects);
  return (
    <>
      <Row gap={3} wrap style={{ marginBottom: 'var(--glacier-space-4)' }}>
        <StatTile value={data.total} label="Tests" hint={`${data.files} files`} />
        <StatTile value={data.passed} label="Passed" />
        <StatTile
          value={data.failed}
          label="Failed"
          hint={passPill(data.failed === 0)}
        />
        <StatTile value={formatDuration(data.durationMs)} label="Suite duration" />
      </Row>
      <div className="propsTableWrap">
        <table className="tokenTable">
          <thead>
            <tr>
              <th>Project</th>
              <th>Files</th>
              <th>Tests</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Status</th>
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
            Failing tests in the last committed run:
          </Text>
          <div className="propsTableWrap">
            <table className="tokenTable">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Test</th>
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
  if (!data) {
    return sectionEmpty(
      'No coverage data',
      `Generate coverage/coverage-summary.json with a coverage run first. ${RERUN_HINT}`,
    );
  }
  const packages = Object.entries(data.packages);
  return (
    <div className="propsTableWrap">
      <table className="tokenTable">
        <thead>
          <tr>
            <th>Package</th>
            <th>Files</th>
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
              <strong>Total</strong>
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
  if (data == null) {
    return sectionEmpty(
      'No contrast audit',
      `The tokens contrast audit was not available when the report was generated. ${RERUN_HINT}`,
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
            <th>Pair</th>
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
  if (data == null) {
    return sectionEmpty(
      'No spec strictness data',
      `The spec strictness audit was not available when the report was generated. ${RERUN_HINT}`,
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
            label="Catalog strictness"
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
                  no strict checks
                </Text>
              ) : category.total != null && category.filled != null ? (
                // One segment per strictness check so the bar reads as filled/total.
                <Meter
                  value={category.filled}
                  segments={category.total}
                  aria-label={`${category.name} strictness`}
                />
              ) : (
                <Meter
                  value={Math.round(category.ratio * 100)}
                  max={100}
                  segments={10}
                  aria-label={`${category.name} strictness`}
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
  if (!data) {
    return sectionEmpty('No axe stats', `The axe suite scan produced no data. ${RERUN_HINT}`);
  }
  return (
    <Row gap={3} wrap>
      <StatTile value={data.testFiles} label="Test files" />
      <StatTile value={data.axeTestFiles} label="Files with axe checks" />
      <StatTile value={data.axeAssertions} label="Axe assertions" />
    </Row>
  );
}

// ---------------------------------------------------------------------------

export function TestReportPage() {
  const generated = new Date(report.generatedAt);
  return (
    <>
      <Heading level={1}>Test Report</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        A snapshot of the kit&rsquo;s quality gates: the vitest suite, code coverage, the token
        contrast audit, spec strictness, and the axe accessibility checks, all in one place.
      </Text>
      <Text size={Size.Small} tone={TextTone.Muted}>
        This data is regenerated by <code>npm run report</code> and committed alongside the code, so
        the page shows the last committed run
        {Number.isNaN(generated.getTime()) ? '' : `, generated ${generated.toISOString().slice(0, 10)}`}.
      </Text>

      <Heading level={2}>Unit tests</Heading>
      <SectionBody>
        <VitestBlock data={report.vitest} />
      </SectionBody>

      <Heading level={2}>Coverage</Heading>
      <Text tone={TextTone.Muted}>
        Istanbul summary per workspace package, aggregated from{' '}
        <code>coverage/coverage-summary.json</code>.
      </Text>
      <SectionBody>
        <CoverageBlock data={report.coverage} />
      </SectionBody>

      <Heading level={2}>Contrast audit</Heading>
      <Text tone={TextTone.Muted}>
        WCAG contrast ratios for the token pairings the kit relies on, checked per theme by{' '}
        <code>@glacier/tokens</code>.
      </Text>
      <SectionBody>
        <ContrastBlock data={report.contrast} />
      </SectionBody>

      <Heading level={2}>Spec strictness</Heading>
      <Text tone={TextTone.Muted}>
        How much of the component contract in <code>@glacier/spec</code> is pinned down strictly,
        per category.
      </Text>
      <SectionBody>
        <StrictnessBlock data={report.specStrictness} />
      </SectionBody>

      <Heading level={2}>Accessibility suite</Heading>
      <Text tone={TextTone.Muted}>
        Static counts over <code>packages/react/test</code>: every component suite renders into
        axe-core and asserts zero violations.
      </Text>
      <SectionBody>
        <AxeBlock data={report.axe} />
      </SectionBody>
    </>
  );
}
