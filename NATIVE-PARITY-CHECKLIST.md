# Glacier Native Parity — Validation Checklist

Every component in the kit, by category. Open each component's doc page, flip the
**Web / Native** toggle to **Both**, and confirm the two panes match. Check it off
when validated.

- **Full parity** — every documented component now has a `@glacier/native` binding
  (all 96, Calendar + DatePicker included). `tsc` clean, docs build passing.
- Each page has at least one cross-platform example with a Web / Native toggle.
- `▲ overlay` — the native binding exists and the trigger renders; the interactive
  open state / precise floating-ui placement is a device-parity follow-up, so the
  side-by-side comparison shows the resting trigger.

---

## Atoms (43)

- [x] Avatar
- [x] Banner
- [x] Button
- [x] Callout
- [x] Card
- [ ] Checkbox
- [ ] CodeBlock
- [ ] CounterBadge
- [ ] DeviceFrame
- [ ] Divider
- [ ] EmptyState
- [ ] FilterChip
- [ ] Heading
- [ ] Icon
- [ ] IconButton
- [ ] Image
- [ ] Input
- [ ] Kbd
- [ ] Label
- [ ] Link
- [ ] Meter
- [ ] NumberInput
- [ ] OtpField
- [ ] Pill
- [ ] ProgressBar
- [ ] ProgressRing
- [ ] Radio
- [ ] RadioCard
- [ ] Rating
- [ ] SearchField
- [ ] SegmentedBar
- [ ] Skeleton
- [ ] Slider
- [ ] Sparkline
- [ ] Spinner
- [ ] StatTile
- [ ] StatusDot
- [ ] Steps
- [ ] Surface
- [ ] Switch
- [ ] Text
- [ ] Textarea
- [ ] Toggle

## Molecules (21)

- [ ] Accordion
- [ ] Breadcrumbs
- [ ] Calendar
- [ ] Carousel
- [ ] Combobox &nbsp;`▲ overlay`
- [ ] DatePicker &nbsp;`▲ overlay`
- [ ] Field
- [ ] Fieldset
- [ ] FileUpload
- [ ] FormSection
- [ ] Heatmap
- [ ] List
- [ ] MultiSelect &nbsp;`▲ overlay`
- [ ] Pagination
- [ ] ScrollArea
- [ ] SegmentedControl
- [ ] Select &nbsp;`▲ overlay`
- [ ] Spotlight &nbsp;`▲ overlay`
- [ ] Tabs
- [ ] Toast
- [ ] Tooltip &nbsp;`▲ overlay`

## Organisms (18)

- [ ] AlertDialog &nbsp;`▲ overlay`
- [ ] AppShell
- [ ] DataGrid
- [ ] Drawer &nbsp;`▲ overlay`
- [ ] FloatingPanel &nbsp;`▲ overlay`
- [ ] Menu &nbsp;`▲ overlay`
- [ ] Modal &nbsp;`▲ overlay`
- [ ] Popover &nbsp;`▲ overlay`
- [ ] ResizableSplitPane
- [ ] TabStrip
- [ ] TabbedModal &nbsp;`▲ overlay`
- [ ] TabbedPanel
- [ ] Table
- [ ] Timeline
- [ ] TimeSeriesChart
- [ ] TimelineScrubber
- [ ] TreeView
- [ ] Wizard

## Structures (7)

- [ ] CardGroup
- [ ] NavBar
- [ ] PageHeader
- [ ] Section
- [ ] Sidebar
- [ ] TitleBar
- [ ] Toolbar

## Layout primitives (7)

_No dedicated component pages — validate via any page that uses them, or the Layout foundations page._

- [ ] Box
- [ ] Center
- [ ] Container
- [ ] Grid
- [ ] Row
- [ ] Spacer
- [ ] Stack
