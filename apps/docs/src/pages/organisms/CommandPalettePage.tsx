import { Button, Heading, Row, Size, Text, TextTone, useT, type CommandDescriptor } from '@glacier/react';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * Each palette demo owns its own open state, so - as with Modal - it lives in a
 * module-level wrapper the render callback mounts once per pane (a callback
 * cannot hold hooks). The trigger stays on the web kit, since it is
 * token-identical across bindings and its press fires in both panes; only the
 * overlay under test swaps to `K.CommandPalette`, so the Native pane exercises
 * the real react-native <Modal> shell.
 */
function useDemoCommands(): CommandDescriptor[] {
  const t = useT();
  return [
    { id: 'new', label: t(m.cpCmdNewFile), group: t(m.cpGroupFile), shortcut: '⌘N' },
    { id: 'open', label: t(m.cpCmdOpenProject), group: t(m.cpGroupFile), keywords: 'load import', shortcut: '⌘O' },
    { id: 'save', label: t(m.cpCmdSave), group: t(m.cpGroupFile), shortcut: '⌘S', disabled: true },
    { id: 'theme', label: t(m.cpCmdToggleTheme), group: t(m.cpGroupView), keywords: 'dark light appearance' },
    { id: 'zen', label: t(m.cpCmdZenMode), group: t(m.cpGroupView), keywords: 'focus distraction-free' },
    { id: 'invite', label: t(m.cpCmdInvite), group: t(m.cpGroupAccount), keywords: 'members people share' },
    { id: 'signout', label: t(m.cpCmdSignOut), group: t(m.cpGroupAccount), keywords: 'logout leave' },
  ];
}

function PaletteDemo({ K, size }: { K: PlatformKit; size?: 'sm' | 'md' | 'lg' }) {
  const t = useT();
  const commands = useDemoCommands();
  const [open, setOpen] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  return (
    <Row gap={4} wrap align="center">
      <Button onClick={() => setOpen(true)}>{t(m.cpOpenPalette)}</Button>
      {lastRun && (
        <Text tone={TextTone.Muted} size={Size.Small}>
          {t(m.cpLastRun, { id: lastRun })}
        </Text>
      )}
      <K.CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        onRun={setLastRun}
        size={size}
        // The docs page itself binds ⌘K for its own search, so the demos do not
        // also claim the chord and fight it.
        shortcut={false}
      />
    </Row>
  );
}

export function CommandPalettePage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(m.cpName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.cpLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.cpAnatomy)}</Text>
      <ComponentBlueprint specId="command-palette" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.cpExBasicDesc)}
        component="CommandPalette"
        render={(K) => <PaletteDemo K={K} />}
        code={`import { CommandPalette } from '@glacier/react';

const commands = [
  { id: 'new', label: 'New file', group: 'File', shortcut: '⌘N' },
  { id: 'open', label: 'Open project', group: 'File', keywords: 'load import' },
  { id: 'theme', label: 'Toggle theme', group: 'View', keywords: 'dark light' },
];

const [open, setOpen] = useState(false);

<CommandPalette
  open={open}
  onOpenChange={setOpen}
  commands={commands}
  onRun={(id) => run(id)}
/>`}
      />

      <Example
        title={t(m.cpExKeywordsTitle)}
        description={t(m.cpExKeywordsDesc)}
        component="CommandPalette"
        render={(K) => <PaletteDemo K={K} />}
        code={`const commands = [
  // 'dark' finds this even though the label never says it, and the row
  // leads with the matched word so the hit is not a mystery.
  { id: 'theme', label: 'Toggle theme', group: 'View', keywords: 'dark light appearance' },

  // Listed but not runnable: the cursor steps over it and Enter ignores it.
  { id: 'save', label: 'Save', group: 'File', shortcut: '⌘S', disabled: true },
];`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.cpExSizesDesc)}
        component="CommandPalette"
        render={(K) => (
          <Row gap={4} wrap>
            <PaletteDemo K={K} size="sm" />
            <PaletteDemo K={K} size="lg" />
          </Row>
        )}
        code={`<CommandPalette size="sm" … />
<CommandPalette size="lg" … />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(m.cpPropOpen) },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: t(m.cpPropOnOpenChange) },
          { name: 'commands', type: 'CommandDescriptor[]', description: t(m.cpPropCommands) },
          { name: 'onRun', type: '(id: string) => void', description: t(m.cpPropOnRun) },
          { name: 'query', type: 'string', description: t(m.cpPropQuery) },
          { name: 'defaultQuery', type: 'string', default: "''", description: t(m.cpPropDefaultQuery) },
          { name: 'emptyLabel', type: 'ReactNode', description: t(m.cpPropEmptyLabel) },
          { name: 'footer', type: 'ReactNode', description: t(m.cpPropFooter) },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: t(m.cpPropSize) },
          { name: 'shortcut', type: 'boolean', default: 'true', description: t(m.cpPropShortcut) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.cpA11y1))}</li>
        <li>{prose(t(m.cpA11y2))}</li>
        <li>{prose(t(m.cpA11y3))}</li>
        <li>{prose(t(m.cpA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.cpUse1))}</li>
        <li>{prose(t(m.cpUse2))}</li>
        <li>{prose(t(m.cpUse3))}</li>
        <li>{prose(t(m.cpUse4))}</li>
      </ul>
    </>
  );
}