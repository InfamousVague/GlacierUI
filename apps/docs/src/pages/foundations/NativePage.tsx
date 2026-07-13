import { Heading, Pill, Size, Text, TextTone, useT } from '@glacier/react';
import * as Native from '@glacier/native';
import { groupTitles, m, pageTitles } from '../../i18n.ts';

/**
 * The parity catalog. Each documented component is listed under the docs
 * section it lives in, paired with the name it carries (or *would* carry) in
 * `@glacier/native`. Support is never asserted here — it is read live from the
 * native kit's runtime exports, so a component flips to "at parity" the moment
 * `@glacier/native` exports its binding, with no edit to this file.
 *
 * `id` is the docs route id (its `pageTitles` label and `#/section/id` link both
 * derive from it); `native` is the export name to look for in the native kit.
 */
type Row = { id: keyof typeof pageTitles; native: string };

const SECTIONS: { group: keyof typeof groupTitles; rows: Row[] }[] = [
  {
    group: 'Atoms',
    rows: [
      { id: 'button', native: 'Button' },
      { id: 'icon', native: 'Icon' },
      { id: 'text', native: 'Text' },
      { id: 'kbd', native: 'Kbd' },
      { id: 'pill', native: 'Pill' },
      { id: 'counterbadge', native: 'CounterBadge' },
      { id: 'statusdot', native: 'StatusDot' },
      { id: 'avatar', native: 'Avatar' },
      { id: 'divider', native: 'Divider' },
      { id: 'callout', native: 'Callout' },
      { id: 'banner', native: 'Banner' },
      { id: 'codeblock', native: 'CodeBlock' },
      { id: 'selection', native: 'Checkbox' },
      { id: 'radiocard', native: 'RadioCard' },
      { id: 'textarea', native: 'Textarea' },
      { id: 'searchfield', native: 'SearchField' },
      { id: 'numberinput', native: 'NumberInput' },
      { id: 'otpfield', native: 'OtpField' },
      { id: 'slider', native: 'Slider' },
      { id: 'toggle', native: 'Toggle' },
      { id: 'meter', native: 'Meter' },
      { id: 'progress', native: 'ProgressBar' },
      { id: 'spinner', native: 'Spinner' },
      { id: 'progressring', native: 'ProgressRing' },
      { id: 'steps', native: 'Steps' },
      { id: 'segmentedbar', native: 'SegmentedBar' },
      { id: 'skeleton', native: 'Skeleton' },
      { id: 'emptystate', native: 'EmptyState' },
      { id: 'surfaces', native: 'Surface' },
      { id: 'stattile', native: 'StatTile' },
      { id: 'deviceframe', native: 'DeviceFrame' },
      { id: 'filterchip', native: 'FilterChip' },
      { id: 'image', native: 'Image' },
      { id: 'rating', native: 'Rating' },
      { id: 'sparkline', native: 'Sparkline' },
    ],
  },
  {
    group: 'Molecules',
    rows: [
      { id: 'field', native: 'Field' },
      { id: 'select', native: 'Select' },
      { id: 'combobox', native: 'Combobox' },
      { id: 'multiselect', native: 'MultiSelect' },
      { id: 'segmented', native: 'SegmentedControl' },
      { id: 'tabs', native: 'Tabs' },
      { id: 'tooltip', native: 'Tooltip' },
      { id: 'toast', native: 'Toast' },
      { id: 'scrollarea', native: 'ScrollArea' },
      { id: 'carousel', native: 'Carousel' },
      { id: 'heatmap', native: 'Heatmap' },
      { id: 'spotlight', native: 'Spotlight' },
      { id: 'breadcrumbs', native: 'Breadcrumbs' },
      { id: 'pagination', native: 'Pagination' },
      { id: 'accordion', native: 'Accordion' },
      { id: 'datepicker', native: 'DatePicker' },
      { id: 'fileupload', native: 'FileUpload' },
      { id: 'fieldset', native: 'Fieldset' },
      { id: 'list', native: 'List' },
    ],
  },
  {
    group: 'Organisms',
    rows: [
      { id: 'appshell', native: 'AppShell' },
      { id: 'modal', native: 'Modal' },
      { id: 'drawer', native: 'Drawer' },
      { id: 'alertdialog', native: 'AlertDialog' },
      { id: 'popover', native: 'Popover' },
      { id: 'menu', native: 'Menu' },
      { id: 'treeview', native: 'TreeView' },
      { id: 'table', native: 'Table' },
      { id: 'datagrid', native: 'DataGrid' },
      { id: 'timeline', native: 'Timeline' },
      { id: 'wizard', native: 'Wizard' },
      { id: 'timelinescrubber', native: 'TimelineScrubber' },
      { id: 'timeserieschart', native: 'TimeSeriesChart' },
      { id: 'floatingpanel', native: 'FloatingPanel' },
      { id: 'tabbedpanel', native: 'TabbedPanel' },
      { id: 'tabbedmodal', native: 'TabbedModal' },
      { id: 'tabstrip', native: 'TabStrip' },
      { id: 'resizablesplitpane', native: 'ResizableSplitPane' },
    ],
  },
  {
    group: 'Structures',
    rows: [
      { id: 'sidebar', native: 'Sidebar' },
      { id: 'toolbar', native: 'Toolbar' },
      { id: 'titlebar', native: 'TitleBar' },
      { id: 'navbar', native: 'NavBar' },
      { id: 'pageheader', native: 'PageHeader' },
      { id: 'section', native: 'Section' },
      { id: 'cardgroup', native: 'CardGroup' },
    ],
  },
];

/** Live source of truth: the capitalized runtime exports of the native kit. */
const NATIVE_EXPORTS = new Set(Object.keys(Native).filter((name) => /^[A-Z]/.test(name)));
const supports = (row: Row) => NATIVE_EXPORTS.has(row.native);

function hashFor(group: string, id: string): string {
  return `#/${group.toLowerCase()}/${id}`;
}

const CHIP = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--glacier-space-2)',
  paddingBlock: 'var(--glacier-space-2)',
  paddingInline: 'var(--glacier-space-3)',
  borderRadius: 'var(--glacier-radius-full)',
  border: 'var(--glacier-hairline) solid var(--glacier-border)',
  background: 'var(--glacier-surface)',
  color: 'var(--glacier-text)',
  fontFamily: 'var(--glacier-font-sans)',
  fontSize: 'var(--glacier-font-size-sm)',
  fontWeight: 'var(--glacier-font-weight-medium)',
  textDecoration: 'none',
  // Keep chip contents on one line; long names truncate with an ellipsis.
  whiteSpace: 'nowrap',
  overflow: 'hidden',
} as const;

export function NativePage() {
  const t = useT();
  const unsupported = SECTIONS.flatMap((s) =>
    s.rows.filter((r) => !supports(r)).map((r) => ({ ...r, group: s.group })),
  );

  return (
    <>
      <Heading level={1}>{t(m.nativeNative)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.nativeGlacierShipsTwoBindingsOf)}
        <code> @glacier/spec</code> {t(m.nativeContractAndTheSame)} <code>--glacier-*</code> {t(m.nativeTokensSoAComponentLooks)}
      </Text>

      <Heading level={2}>{t(m.nativeParityBySection)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.nativeParityBySectionLede)}</Text>

      {SECTIONS.map((section) => {
        const supported = section.rows.filter(supports).length;
        const full = supported === section.rows.length;
        return (
          <div key={section.group} style={{ marginBlockStart: 'var(--glacier-space-6)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--glacier-space-3)',
                marginBlockEnd: 'var(--glacier-space-3)',
              }}
            >
              <Heading level={3} noMargin>
                {t(groupTitles[section.group])}
              </Heading>
              <Pill size="sm" tone={full ? 'success' : supported > 0 ? 'accent' : 'neutral'}>
                {t(m.nativeParityRatio, { n: supported, total: section.rows.length })}
              </Pill>
            </div>

            <div
              style={{
                display: 'grid',
                gap: 'var(--glacier-space-3)',
                gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
              }}
            >
              {section.rows.map((row) => {
                const ok = supports(row);
                return (
                  <a
                    key={row.id}
                    href={hashFor(section.group, row.id)}
                    style={{ ...CHIP, justifyContent: 'space-between' }}
                  >
                    <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t(pageTitles[row.id])}
                    </span>
                    <span style={{ display: 'inline-flex', flexShrink: 0, gap: 'var(--glacier-space-1)' }}>
                      <Pill size="sm" tone="success" variant="soft">
                        {t(m.platformWeb)}
                      </Pill>
                      <Pill size="sm" tone={ok ? 'success' : 'danger'} variant="soft">
                        {t(m.platformNative)}
                      </Pill>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}

      <Heading level={2}>{t(m.nativeUnsupported)}</Heading>
      <Text tone={TextTone.Muted}>
        {unsupported.length === 0 ? t(m.nativeUnsupportedNone) : t(m.nativeUnsupportedLede)}
      </Text>
      {unsupported.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--glacier-space-3)', marginBlockStart: 'var(--glacier-space-4)' }}>
          {unsupported.map((row) => (
            <a key={row.id} href={hashFor(row.group, row.id)} style={CHIP}>
              {t(pageTitles[row.id])}
            </a>
          ))}
        </div>
      )}

      <Heading level={2}>{t(m.nativeHowItWorks)}</Heading>
      <ul>
        <li>
          <code>@glacier/native</code> {t(m.nativeComponentsRender)} <code>View</code>, <code>Text</code>{t(m.nativeAnd)}
          <code> Pressable</code>{t(m.nativeWithPaintAndGeometryTranscri)}
        </li>
        <li>
          {t(m.nativeStylesReferenceTokensAs)} <code>var(--glacier-*)</code>{t(m.nativeOnWebThatResolvesThrough)}
        </li>
        <li>
          {t(m.nativeRendererAgnosticLogicControl)}
          <code> @glacier/commons</code>{t(m.nativeSharedByBothBindingsSo)}
        </li>
      </ul>
    </>
  );
}
