import { useState } from 'react';
import { SPEC_VERSION, cssValue, specs, type ComponentSpec, type Measure, type SizeSpec } from '@perfect/spec';
import { Pill, Row, Select, Stack } from '@perfect/react';
import { CodeBlock } from '../docs-ui.tsx';
import { Blueprint } from '../Blueprint.tsx';

// Render a measurement as its token reference plus what it resolves to.
function MeasureCell({ value }: { value?: Measure }) {
  if (!value) return <span style={{ color: 'var(--perfect-text-subtle)' }}>—</span>;
  const isToken = value.startsWith('$');
  return (
    <span>
      <code>{value}</code>
      {isToken && (
        <span style={{ color: 'var(--perfect-text-subtle)', marginLeft: 'var(--perfect-space-2)' }}>
          {cssValue(value)}
        </span>
      )}
    </span>
  );
}

const SIZE_ROWS: { key: keyof SizeSpec; label: string }[] = [
  { key: 'height', label: 'height' },
  { key: 'diameter', label: 'diameter' },
  { key: 'paddingInline', label: 'padding-inline' },
  { key: 'paddingBlock', label: 'padding-block' },
  { key: 'gap', label: 'gap' },
  { key: 'fontSize', label: 'font-size' },
  { key: 'radius', label: 'radius' },
  { key: 'thickness', label: 'thickness' },
  { key: 'border', label: 'border' },
];

function SpecView({ spec }: { spec: ComponentSpec }) {
  const sizeCols = spec.sizes ?? [];
  const usedRows = SIZE_ROWS.filter((row) => sizeCols.some((s) => s[row.key]));
  return (
    <Stack gap={6}>
      <p style={{ margin: 0 }}>
        <strong>{spec.name}</strong> {spec.summary}
      </p>
      <Row gap={3} wrap>
        <Pill tone="accent" variant="soft" size="sm">
          {spec.category}
        </Pill>
        <Pill tone={spec.status === 'stable' ? 'success' : 'warning'} variant="soft" size="sm">
          {spec.status}
        </Pill>
        {spec.element && (
          <Pill tone="neutral" variant="outline" size="sm">
            &lt;{spec.element}&gt;
          </Pill>
        )}
      </Row>

      <div>
        <h3>Props</h3>
        <div className="propsTableWrap">
          <table className="tokenTable">
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {spec.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>{prop.name}</code>
                    {prop.required && <span style={{ color: 'var(--perfect-danger-text)' }}> *</span>}
                  </td>
                  <td>
                    {prop.type === 'enum' ? (
                      <code>{prop.values?.join(' | ')}</code>
                    ) : (
                      <code>{prop.type}</code>
                    )}
                  </td>
                  <td>{prop.default !== undefined ? <code>{String(prop.default)}</code> : '—'}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sizeCols.length > 0 && (
        <div>
          <h3>Anatomy</h3>
          <p>An inspection of each size, with the exact spec measurements labelled on the box.</p>
          <Row gap={4} wrap>
            {sizeCols.map((s) => (
              <div key={s.name} style={{ flex: '1 1 18rem', minWidth: '16rem' }}>
                <Blueprint size={s} dimensions={spec.dimensions} />
              </div>
            ))}
          </Row>
        </div>
      )}

      {usedRows.length > 0 && (
        <div>
          <h3>Measurements</h3>
          <p>Every value is a unit of the shared token scale, so any framework builds the same box.</p>
          <div className="propsTableWrap">
            <table className="tokenTable">
              <thead>
                <tr>
                  <th></th>
                  {sizeCols.map((s) => (
                    <th key={s.name}>{s.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usedRows.map((row) => (
                  <tr key={String(row.key)}>
                    <td>
                      <code>{row.label}</code>
                    </td>
                    {sizeCols.map((s) => (
                      <td key={s.name}>
                        <MeasureCell value={s[row.key] as Measure | undefined} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {spec.dimensions && (
        <div>
          <h3>Fixed dimensions</h3>
          <div className="propsTableWrap">
            <table className="tokenTable">
              <tbody>
                {Object.entries(spec.dimensions).map(([key, value]) => (
                  <tr key={key}>
                    <td>
                      <code>{key}</code>
                    </td>
                    <td>
                      <MeasureCell value={value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {spec.variants && (
        <div>
          <h3>Variants</h3>
          <Stack gap={2}>
            {spec.variants.map((v) => (
              <div key={v.name}>
                <code>{v.name}</code> <span style={{ color: 'var(--perfect-text-muted)' }}>{v.description}</span>
              </div>
            ))}
          </Stack>
        </div>
      )}

      {spec.tones && (
        <div>
          <h3>Tones</h3>
          <Row gap={3} wrap>
            {spec.tones.map((t) => (
              <Pill key={t.name} tone={t.name as never} variant="soft" size="sm">
                {t.name}
              </Pill>
            ))}
          </Row>
        </div>
      )}

      <div>
        <h3>Tokens consumed</h3>
        <Row gap={2} wrap>
          {(spec.tokens ?? []).map((t) => (
            <code key={t}>{t}</code>
          ))}
        </Row>
      </div>

      <div>
        <h3>Generated JSON</h3>
        <p>
          This is the language-agnostic artifact at{' '}
          <code>packages/spec/dist/components/{spec.id}.json</code>, read by any framework binding.
        </p>
        <CodeBlock code={JSON.stringify(spec, null, 2)} />
      </div>
    </Stack>
  );
}

export function SpecPage() {
  const [id, setId] = useState(specs[0]!.id);
  const spec = specs.find((s) => s.id === id) ?? specs[0]!;

  return (
    <>
      <h1>Specification</h1>
      <p className="lede">
        Every component has a language-agnostic specification: a single contract that describes its
        API, its variants, and its measurements in units of the shared token scale rather than raw
        pixels. React, or a future Angular or Rust kit, reads the same spec and builds the same
        component.
      </p>

      <h2>How it works</h2>
      <ul>
        <li>
          Specs are authored in TypeScript in <code>@perfect/spec</code> for type safety, then
          generated to JSON. The JSON, plus a JSON Schema, is what non-JavaScript consumers read.
        </li>
        <li>
          Measurements are token references like <code>$space-5</code> or <code>$control-height-md</code>,
          which resolve against the token catalog. A spec never hardcodes a pixel it could name.
        </li>
        <li>
          Shared vocabulary lives once in the spec package: the size steps, the tones, and the
          mapping from a control size to its height and font size. The React kit imports these
          instead of redeclaring them.
        </li>
        <li>
          The React kit is held to its spec by a conformance test. Add a variant or change a default
          in one place without the other and the test fails, so the two never drift.
        </li>
      </ul>
      <p>
        Schema version <code>{SPEC_VERSION}</code>. The full catalog is at{' '}
        <code>packages/spec/dist/spec.json</code> and the schema at{' '}
        <code>packages/spec/dist/schema.json</code>.
      </p>

      <h2>Browse a spec</h2>
      <Stack gap={5}>
        <Select
          aria-label="Component"
          value={id}
          onValueChange={setId}
          options={specs.map((s) => ({ value: s.id, label: s.name }))}
        />
        <SpecView spec={spec} />
      </Stack>
    </>
  );
}
