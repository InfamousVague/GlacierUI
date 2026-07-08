import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import {
  buttonSpec,
  cardElevations,
  cardSpec,
  cardVariants,
  dividerSpec,
  pillSpec,
  specs,
  validateSpec,
  type ComponentSpec,
} from '@glacier/spec';
import {
  Avatar,
  Banner,
  Button,
  Callout,
  Card,
  Checkbox,
  CodeBlock,
  CounterBadge,
  Divider,
  EmptyState,
  Heading,
  IconButton,
  Input,
  Kbd,
  Label,
  Link,
  Meter,
  NumberInput,
  Pill,
  ProgressBar,
  ProgressRing,
  Radio,
  RadioCard,
  SearchField,
  SegmentedBar,
  Skeleton,
  Slider,
  Spinner,
  StatusDot,
  Steps,
  Surface,
  Switch,
  Text,
  Textarea,
  Toast,
  Toggle,
  Toolbar,
  Tooltip,
  Field,
  Select,
  SegmentedControl,
  Tabs,
  Modal,
  Popover,
  Menu,
  MenuItem,
  StatTile,
  DeviceFrame,
  FilterChip,
  Image,
  Rating,
  ScrollArea,
  Carousel,
  Heatmap,
  Spotlight,
  FloatingPanel,
  TabbedPanel,
  TabbedModal,
  TabStrip,
  ResizableSplitPane,
  AppShell,
  Sidebar,
  SidebarSection,
  SidebarItem,
} from '../src/index.ts';
import type { ReactElement } from 'react';

/**
 * The spec is the contract; these tests hold the React kit to it. Every
 * component's enums are derived from its spec, so the types cannot drift at
 * compile time. This suite adds the runtime half: it renders every component
 * across every variant, tone, and size the spec declares, and checks that a
 * few representative defaults agree.
 */

describe('spec catalog', () => {
  it('every spec is structurally valid', () => {
    expect(specs.flatMap(validateSpec)).toEqual([]);
  });
});

const names = (list?: readonly { name: string }[]) => list?.map((x) => x.name) ?? [undefined];

/** Every variant x tone x size combination a spec declares. */
function combos(spec: ComponentSpec): { variant?: string; tone?: string; size?: string }[] {
  const out: { variant?: string; tone?: string; size?: string }[] = [];
  for (const variant of names(spec.variants))
    for (const tone of names(spec.tones))
      for (const size of names(spec.sizes)) out.push({ variant, tone, size });
  return out;
}

type Combo = { variant?: string; tone?: string; size?: string };
type Renderer = (o: Combo) => ReactElement;

// One renderer per component: required props baked in, the spec's variant /
// tone / size threaded to the real prop. Heading and Surface render bare
// because the spec expresses their level enum as strings while React uses
// ergonomic numbers, so a size/variant sweep would not be meaningful.
const RENDER: Record<string, Renderer> = {
  avatar: (o) => <Avatar size={o.size as never} name="Ada Lovelace" />,
  button: (o) => (
    <Button variant={o.variant as never} size={o.size as never}>
      Go
    </Button>
  ),
  callout: (o) => <Callout tone={o.tone as never}>Note</Callout>,
  banner: (o) => <Banner tone={o.tone as never}>Heads up</Banner>,
  card: (o) => <Card variant={o.variant as never}>Body</Card>,
  checkbox: () => <Checkbox />,
  'code-block': () => <CodeBlock code="const x = 1;" />,
  'counter-badge': (o) => <CounterBadge tone={o.tone as never} size={o.size as never} count={3} />,
  divider: () => <Divider />,
  heading: () => <Heading>Title</Heading>,
  'icon-button': (o) => (
    <IconButton variant={o.variant as never} size={o.size as never} aria-label="Star">
      <span />
    </IconButton>
  ),
  input: (o) => <Input size={o.size as never} />,
  kbd: () => <Kbd>K</Kbd>,
  label: () => <Label>Email</Label>,
  link: () => <Link href="#">Docs</Link>,
  meter: (o) => <Meter tone={o.tone as never} size={o.size as never} value={50} />,
  'number-input': (o) => <NumberInput size={o.size as never} />,
  pill: (o) => (
    <Pill variant={o.variant as never} tone={o.tone as never} size={o.size as never}>
      Tag
    </Pill>
  ),
  'progress-bar': (o) => <ProgressBar tone={o.tone as never} size={o.size as never} value={50} />,
  'progress-ring': (o) => <ProgressRing tone={o.tone as never} value={50} />,
  radio: () => <Radio />,
  'radio-card': () => <RadioCard title="Option" description="A choice" />,
  'search-field': (o) => <SearchField size={o.size as never} />,
  'segmented-bar': (o) => (
    <SegmentedBar size={o.size as never} data={[{ value: 1, tone: o.tone as never }]} />
  ),
  skeleton: (o) => <Skeleton variant={o.variant as never} />,
  slider: () => <Slider value={50} />,
  spinner: (o) => <Spinner tone={o.tone as never} size={o.size as never} />,
  steps: (o) => <Steps tone={o.tone as never} size={o.size as never} count={3} active={1} />,
  'empty-state': () => <EmptyState title="Nothing here" description="No items yet." />,
  'status-dot': (o) => <StatusDot tone={o.tone as never} size={o.size as never} />,
  surface: () => <Surface>Body</Surface>,
  switch: (o) => <Switch size={o.size as never} />,
  text: (o) => (
    <Text tone={o.tone as never} size={o.size as never}>
      Body
    </Text>
  ),
  textarea: (o) => <Textarea size={o.size as never} />,
  toggle: (o) => <Toggle size={o.size as never}>Bold</Toggle>,
  toolbar: () => <Toolbar end={<span>Actions</span>}>Title</Toolbar>,
  // molecules, organisms, and the sidebar structure: required props baked in
  field: () => (
    <Field label="Email">
      <input aria-label="Email" />
    </Field>
  ),
  select: (o) => <Select size={o.size as never} options={[{ value: 'a', label: 'A' }]} />,
  'segmented-control': (o) => (
    <SegmentedControl size={o.size as never} value="a" options={[{ value: 'a', label: 'A' }]} />
  ),
  tabs: () => <Tabs tabs={[{ value: 'a', label: 'A', content: 'Panel' }]} />,
  tooltip: () => (
    <Tooltip content="Tip">
      <button type="button">Go</button>
    </Tooltip>
  ),
  toast: (o) => <Toast tone={o.tone as never} message="Saved" />,
  modal: (o) => (
    <Modal open={false} onClose={() => {}} size={o.size as never}>
      Body
    </Modal>
  ),
  popover: () => <Popover trigger={<button type="button">Open</button>}>Content</Popover>,
  menu: () => (
    <Menu trigger={<button type="button">Open</button>}>
      <MenuItem>Item</MenuItem>
    </Menu>
  ),
  'app-shell': () => <AppShell sidebar={<div>Nav</div>}>Body</AppShell>,
  sidebar: () => (
    <Sidebar>
      <SidebarSection title="Main">
        <SidebarItem>Home</SidebarItem>
      </SidebarSection>
    </Sidebar>
  ),
  'stat-tile': () => <StatTile value="12,480" label="Total users" />,
  'device-frame': () => (
    <DeviceFrame aria-label="Preview">
      <div>Screen</div>
    </DeviceFrame>
  ),
  'filter-chip': () => <FilterChip count={3}>Open</FilterChip>,
  image: () => <Image src="/cover.jpg" alt="Cover" aspectRatio="2 / 3" />,
  rating: (o) => <Rating size={o.size as never} value={3} aria-label="Rating" />,
  'scroll-area': () => <ScrollArea maxHeight={100}>Scrollable content</ScrollArea>,
  carousel: () => (
    <Carousel aria-label="Featured">
      <Card>A</Card>
    </Carousel>
  ),
  heatmap: () => <Heatmap aria-label="Activity" data={[[0, 3, 6, 9]]} legend />,
  spotlight: () => (
    <Spotlight open={false} targetRef={{ current: null } as never} onClose={() => {}} title="Tip" description="Body" />
  ),
  'floating-panel': () => (
    <FloatingPanel open={false} title="Panel" onClose={() => {}}>
      Body
    </FloatingPanel>
  ),
  'tabbed-panel': () => (
    <TabbedPanel
      aria-label="Report"
      tabs={[
        { id: 'a', label: 'One', content: 'First' },
        { id: 'b', label: 'Two', count: 3, content: 'Second' },
      ]}
    />
  ),
  'tabbed-modal': () => (
    <TabbedModal
      open={false}
      onClose={() => {}}
      title="Settings"
      sections={[{ id: 'general', label: 'General', content: 'Body' }]}
    />
  ),
  'tab-strip': () => (
    <TabStrip
      aria-label="Files"
      tabs={[
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Bravo' },
      ]}
      onClose={() => {}}
    />
  ),
  'resizable-split-pane': () => (
    <ResizableSplitPane aria-label="Resize">
      <div>Start</div>
      <div>End</div>
    </ResizableSplitPane>
  ),
};

describe('React renders every spec variant, tone, and size', () => {
  it('has a renderer for every catalogued spec', () => {
    expect(specs.filter((s) => !RENDER[s.id]).map((s) => s.id)).toEqual([]);
  });

  for (const spec of specs) {
    const renderer = RENDER[spec.id];
    if (!renderer) continue;
    it(`${spec.name} renders every declared combination`, () => {
      for (const combo of combos(spec))
        expect(() => render(renderer(combo))).not.toThrow();
    });
  }
});

describe('defaults agree', () => {
  it('Button: bare render equals the spec defaults', () => {
    const bare = render(<Button>Go</Button>).container.innerHTML;
    const explicit = render(
      <Button variant={buttonSpec.defaults!.variant as never} size={buttonSpec.defaults!.size as never}>
        Go
      </Button>,
    ).container.innerHTML;
    expect(bare).toBe(explicit);
  });

  it('Pill: bare render equals the spec defaults', () => {
    const bare = render(<Pill>Tag</Pill>).container.innerHTML;
    const explicit = render(
      <Pill
        variant={pillSpec.defaults!.variant as never}
        tone={pillSpec.defaults!.tone as never}
        size={pillSpec.defaults!.size as never}
      >
        Tag
      </Pill>,
    ).container.innerHTML;
    expect(bare).toBe(explicit);
  });

  it('Card: bare render equals the spec defaults', () => {
    const bare = render(<Card>Body</Card>).container.innerHTML;
    const explicit = render(
      <Card variant={cardSpec.defaults!.variant as never} elevation={cardSpec.defaults!.elevation as never}>
        Body
      </Card>,
    ).container.innerHTML;
    expect(bare).toBe(explicit);
  });
});

describe('enum props beyond variant/tone/size', () => {
  it('Card covers every elevation', () => {
    for (const variant of cardVariants)
      for (const elevation of cardElevations)
        expect(() =>
          render(
            <Card variant={variant} elevation={elevation}>
              Body
            </Card>,
          ),
        ).not.toThrow();
  });

  it('Divider covers every orientation from its spec', () => {
    const orientations = dividerSpec.props.find((p) => p.name === 'orientation')?.values ?? [];
    expect(orientations.length).toBeGreaterThan(0);
    for (const orientation of orientations)
      expect(() => render(<Divider orientation={orientation as never} />)).not.toThrow();
  });
});
