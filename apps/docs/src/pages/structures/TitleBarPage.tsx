import { Box, Button, IconButton, SearchField, Text, TitleBar, Heading, Size, TextTone, Variant } from '@glacier/react';
import { PanelLeft, Share } from '@glacier/icons';
import type { ReactNode } from 'react';
import { Example, PropsTable } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';

const panelIcon = <PanelLeft size={16} />;
const shareIcon = <Share size={16} />;

// A mock desktop window so each example reads as the strip at the very top of
// a Tauri or Electron window, sitting over a pane of content.
function Window({ children, trafficLights = false }: { children: ReactNode; trafficLights?: boolean }) {
  const line = (width: string) => (
    <div
      style={{
        width,
        height: '0.6rem',
        borderRadius: 'var(--glacier-radius-full)',
        background: 'var(--glacier-surface-sunken)',
      }}
    />
  );
  const dot = (color: string) => (
    <span
      style={{
        width: '12px',
        height: '12px',
        borderRadius: 'var(--glacier-radius-full)',
        background: color,
      }}
    />
  );
  return (
    <Box border radius="lg" width="full" style={{ overflow: 'hidden', position: 'relative' }}>
      {trafficLights && (
        // Stands in for the macOS window controls the OS paints over an
        // overlay title bar; the real buttons are not DOM at all.
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            insetInlineStart: '20px',
            insetBlockStart: 0,
            height: '3.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 1,
          }}
        >
          {dot('var(--glacier-danger-solid)')}
          {dot('var(--glacier-warning-solid)')}
          {dot('var(--glacier-success-solid)')}
        </div>
      )}
      {children}
      <div
        aria-hidden="true"
        style={{
          padding: 'var(--glacier-space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--glacier-space-4)',
        }}
      >
        {line('38%')}
        {line('86%')}
        {line('72%')}
      </div>
    </Box>
  );
}

export function TitleBarPage() {
  return (
    <>
      <Heading level={1}>TitleBar</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        The standardized window bar for Tauri and Electron style desktop apps: the fixed 3.25rem
        strip at the very top of the window. It owns window dragging through{' '}
        <code>data-tauri-drag-region</code>, centers a one-line title, and can reserve the gutter
        where macOS paints its window controls.
      </Text>

      <Heading level={2}>Anatomy</Heading>
      <Text tone={TextTone.Muted}>A schematic of the anatomy with the exact spec measurements labelled.</Text>
      <ComponentBlueprint specId="title-bar" />

      <Heading level={2}>Examples</Heading>

      <Example
        title="Plain window bar"
        description="The default bar: glass surface, bottom hairline, and a small muted title centered in the window. The whole strip is a drag region, so grabbing it moves the window."
        code={`import { TitleBar } from '@glacier/react';

<TitleBar title="Untitled.md" />`}
      >
        <Window>
          <TitleBar title="Untitled.md" />
        </Window>
      </Example>

      <Example
        title="Traffic-light inset with actions"
        description="trafficLightInset reserves an 88px inline-start gutter for the macOS close, minimize, and zoom buttons that a titleBarStyle Overlay window paints over the bar. The dots here are a mock of those macOS window controls: in a real window the OS draws them. Slot buttons are not drag regions, so they stay clickable."
        code={`import { PanelLeft, Share } from '@glacier/icons';

<TitleBar
  trafficLightInset
  title="Quarterly notes"
  start={<IconButton variant={Variant.Ghost} aria-label="Toggle sidebar"><PanelLeft size={16} /></IconButton>}
  end={<Button size={Size.Small} variant={Variant.Soft}>Share</Button>}
/>`}
      >
        <Window trafficLights>
          <TitleBar
            trafficLightInset
            title="Quarterly notes"
            start={
              <IconButton variant={Variant.Ghost} aria-label="Toggle sidebar">
                {panelIcon}
              </IconButton>
            }
            end={
              <Button size={Size.Small} variant={Variant.Soft}>
                Share
              </Button>
            }
          />
        </Window>
      </Example>

      <Example
        title="Centered search"
        description="Children render beside the title in the centered middle, which is where a library or browser style window puts its search. The field is interactive, so it does not take the drag attribute; drag from the space around it."
        code={`<TitleBar
  trafficLightInset
  end={<IconButton variant={Variant.Ghost} aria-label="Share"><Share size={16} /></IconButton>}
>
  <SearchField size={Size.Small} aria-label="Search library" style={{ width: '18rem' }} />
</TitleBar>`}
      >
        <Window trafficLights>
          <TitleBar
            trafficLightInset
            end={
              <IconButton variant={Variant.Ghost} aria-label="Share">
                {shareIcon}
              </IconButton>
            }
          >
            <SearchField size={Size.Small} aria-label="Search library" style={{ width: '18rem' }} />
          </TitleBar>
        </Window>
      </Example>

      <Example
        title="Skeleton"
        description="skeleton renders the same bar geometry with a shimmer where the title sits, so nothing shifts when the window content arrives. The bar keeps its drag attribute, so the window stays movable while loading."
        code={`<TitleBar skeleton trafficLightInset />`}
      >
        <Window trafficLights>
          <TitleBar skeleton trafficLightInset />
        </Window>
      </Example>

      <Heading level={2}>Props</Heading>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: 'One-line centered title, small and muted. It truncates instead of wrapping.',
          },
          {
            name: 'start',
            type: 'ReactNode',
            description: 'Content pinned to the start, after the traffic-light gutter. Stays clickable.',
          },
          {
            name: 'end',
            type: 'ReactNode',
            description: 'Content pinned to the end, such as window-level actions. Stays clickable.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'Extra centered content beside the title, such as a search field.',
          },
          {
            name: 'trafficLightInset',
            type: 'boolean',
            default: 'false',
            description: 'Reserves an 88px inline-start gutter for the macOS window controls painted by an overlay window.',
          },
          {
            name: 'surface',
            type: 'boolean',
            default: 'true',
            description: 'The translucent glass background with backdrop blur, like the app header.',
          },
          {
            name: 'border',
            type: 'boolean',
            default: 'true',
            description: 'A bottom hairline separating the bar from the window content.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: 'Renders a placeholder with the exact bar geometry.',
          },
        ]}
      />

      <Heading level={2}>Accessibility</Heading>
      <ul>
        <li>
          The bar is a <code>banner</code> landmark by default; pass a <code>role</code> to
          override it when the page already has one.
        </li>
        <li>
          <code>data-tauri-drag-region</code> is a plain string attribute, harmless outside Tauri,
          and it never lands on interactive slot children, so buttons and fields keep their normal
          pointer and keyboard behavior.
        </li>
        <li>
          Give icon-only controls in <code>start</code> and <code>end</code> an{' '}
          <code>aria-label</code>, since the bar adds no labels of its own.
        </li>
        <li>
          Text selection is disabled on the bar because it is window chrome; keep body copy out of
          it.
        </li>
      </ul>

      <Heading level={2}>Usage</Heading>
      <ul>
        <li>
          Use TitleBar only for the real window strip in a desktop shell; inside the page, reach
          for Toolbar instead.
        </li>
        <li>
          Turn on <code>trafficLightInset</code> when the window uses a transparent or overlay
          title bar on macOS, so content clears the close, minimize, and zoom buttons.
        </li>
        <li>
          Keep the title to one short line; it truncates rather than wraps, and long names belong
          in the document, not the chrome.
        </li>
        <li>
          Put at most a couple of quiet controls in each slot; the bar should read as chrome, not
          as a toolbar.
        </li>
      </ul>
    </>
  );
}
