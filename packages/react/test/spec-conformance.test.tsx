import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  Drawer,
  AlertDialog,
  Popover,
  Menu,
  MenuItem,
  StatTile,
  DeviceFrame,
  FilterChip,
  Image,
  Rating,
  OtpField,
  ScrollArea,
  Carousel,
  Combobox,
  MultiSelect,
  Calendar,
  DatePicker,
  FileUpload,
  Fieldset,
  FormSection,
  List,
  ListItem,
  Heatmap,
  Spotlight,
  FloatingPanel,
  TabbedPanel,
  TabbedModal,
  TabStrip,
  TreeView,
  MenuSub,
  TitleBar,
  NavBar,
  NavBarItem,
  ResizableSplitPane,
  AppShell,
  Sidebar,
  SidebarSection,
  SidebarItem,
  Breadcrumbs,
  Pagination,
  Accordion,
  Table,
  DataGrid,
  PageHeader,
  Section,
  CardGroup,
  Timeline,
  Wizard,
  Sparkline,
  TimelineScrubber,
  TimeSeriesChart,
} from '../src/index.ts';
import { Star } from '@glacier/icons';
import { cloneElement, type ReactElement } from 'react';

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
  icon: () => <Star size={16} />,
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
  steps: (o) => <Steps variant={o.variant as never} tone={o.tone as never} size={o.size as never} numbered count={3} active={1} />,
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
  'title-bar': () => <TitleBar title="Documents" start={<span>Back</span>} end={<span>Share</span>} />,
  'nav-bar': (o) => (
    <NavBar orientation={o.variant as never} aria-label="Primary">
      <NavBarItem icon={<span />} label="Library" active />
      <NavBarItem icon={<span />} label="Discover" badge={3} />
    </NavBar>
  ),
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
  drawer: (o) => <Drawer open={false} onClose={() => {}} side={o.variant as never} size={o.size as never} title="Drawer">Body</Drawer>,
  'alert-dialog': (o) => <AlertDialog open={false} onClose={() => {}} tone={o.tone as never} title="Continue?" actionLabel="Continue" onAction={() => {}} />,
  popover: () => <Popover trigger={<button type="button">Open</button>}>Content</Popover>,
  menu: () => (
    <Menu trigger={<button type="button">Open</button>}>
      <MenuItem>Item</MenuItem>
      <MenuSub label="More">
        <MenuItem>Nested</MenuItem>
      </MenuSub>
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
  sparkline: (o) => (
    <Sparkline shape={o.variant as never} tone={o.tone as never} size={o.size as never} data={[2, 5, 3, 8, 6]} aria-label="Trend" />
  ),
  'timeline-scrubber': (o) => (
    <TimelineScrubber size={o.size as never} start={0} end={60_000} value={30_000} aria-label="Recorded activity" />
  ),
  'time-series-chart': (o) => (
    <TimeSeriesChart
      aria-label="CPU usage"
      times={[0, 1000, 2000]}
      series={[
        { id: 'user', label: 'User', values: [10, 20, 15], tone: o.tone as never },
        { id: 'system', label: 'System', values: [5, 8, 6] },
      ]}
    />
  ),
  'device-frame': () => (
    <DeviceFrame aria-label="Preview">
      <div>Screen</div>
    </DeviceFrame>
  ),
  'filter-chip': () => <FilterChip count={3}>Open</FilterChip>,
  image: () => <Image src="/cover.jpg" alt="Cover" aspectRatio="2 / 3" />,
  'otp-field': (o) => <OtpField size={o.size as never} />,
  rating: (o) => <Rating size={o.size as never} value={3} aria-label="Rating" />,
  'scroll-area': () => <ScrollArea maxHeight={100}>Scrollable content</ScrollArea>,
  carousel: () => (
    <Carousel aria-label="Featured">
      <Card>A</Card>
    </Carousel>
  ),
  combobox: (o) => <Combobox size={o.size as never} aria-label="Fruit" options={[{ value: 'apple', label: 'Apple' }]} />,
  'multi-select': (o) => <MultiSelect size={o.size as never} aria-label="Fruit" options={[{ value: 'apple', label: 'Apple' }]} />,
  calendar: () => <Calendar aria-label="Pick a day" defaultValue={new Date(2026, 5, 15)} />,
  'date-picker': (o) => <DatePicker size={o.size as never} aria-label="Due date" />,
  'file-upload': () => <FileUpload aria-label="Attachments" />,
  fieldset: () => (
    <Fieldset legend="Shipping">
      <input aria-label="City" />
    </Fieldset>
  ),
  'form-section': () => (
    <FormSection title="Profile">
      <input aria-label="Name" />
    </FormSection>
  ),
  list: (o) => <List size={o.size as never}><ListItem title="Item" /></List>,
  'list-item': () => <ListItem title="Item" />,
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
  'tree-view': () => (
    <TreeView
      aria-label="Files"
      items={[
        { id: 'src', label: 'src', children: [{ id: 'main', label: 'main.tsx' }] },
        { id: 'readme', label: 'README.md' },
      ]}
      defaultExpandedIds={['src']}
    />
  ),
  'resizable-split-pane': () => (
    <ResizableSplitPane aria-label="Resize">
      <div>Start</div>
      <div>End</div>
    </ResizableSplitPane>
  ),
  breadcrumbs: () => <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Docs', current: true }]} />,
  pagination: () => <Pagination page={2} total={20} pageSize={5} onPageChange={() => {}} />,
  accordion: () => (
    <Accordion
      items={[
        { id: 'one', title: 'One', content: <div>First</div> },
        { id: 'two', title: 'Two', content: <div>Second</div> },
      ]}
    />
  ),
  table: () => (
    <Table
      columns={[
        { key: 'name', header: 'Name' },
        { key: 'status', header: 'Status' },
      ]}
      data={[{ name: 'Ada', status: 'Active' }]}
    />
  ),
  'data-grid': () => (
    <DataGrid
      aria-label="People"
      selectable
      columns={[
        { key: 'name', header: 'Name', sortable: true },
        { key: 'status', header: 'Status' },
      ]}
      data={[
        { id: 1, name: 'Ada', status: 'Active' },
        { id: 2, name: 'Linus', status: 'Away' },
      ]}
    />
  ),
  'page-header': () => <PageHeader title="Overview" />,
  section: () => <Section title="Overview">Body</Section>,
  'card-group': () => (
    <CardGroup>
      <div>Card</div>
    </CardGroup>
  ),
  timeline: (o) => (
    <Timeline
      aria-label="Activity"
      items={[
        { id: 1, title: 'Deployed', tone: o.tone as never, timestamp: '2h ago' },
        { id: 2, title: 'Build passed' },
      ]}
    />
  ),
  wizard: () => (
    <Wizard
      aria-label="Setup"
      steps={[
        { id: 'one', label: 'One', content: <div /> },
        { id: 'two', label: 'Two', content: <div /> },
      ]}
    />
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

// These are portaled or open-gated: in their default/closed state they render
// nothing (or only a portal shell), so they carry no synchronous root to
// receive data-testid. They are intentionally targeted by role (dialog,
// listbox, menu, tooltip) instead and stay excluded from the passthrough sweep.
const NO_SYNC_ROOT = new Set([
  'modal',
  'drawer',
  'alert-dialog',
  'spotlight',
  'floating-panel',
  'tabbed-modal',
  'tooltip',
  'popover',
  'menu',
  'toast',
]);

// The passthrough contract: every component extends ComponentProps<element> and
// spreads {...rest}, so a consumer's data-testid (and any data-*, id, aria-*)
// reaches the DOM as a stable test hook - no bespoke testID prop required. This
// locks that in kit-wide and fails loudly if a component ever drops {...rest}.
describe('every component forwards data-testid to the DOM', () => {
  for (const spec of specs) {
    const renderer = RENDER[spec.id];
    if (!renderer || NO_SYNC_ROOT.has(spec.id)) continue;
    it(`${spec.name} forwards data-testid`, () => {
      const combo = combos(spec)[0] ?? {};
      render(cloneElement(renderer(combo), { 'data-testid': 'probe' } as never));
      expect(screen.getByTestId('probe')).toBeInTheDocument();
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
