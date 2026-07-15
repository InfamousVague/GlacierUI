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
## Missing
- [x] Announcements banner with scrolling updates
- [x] Custom scrollbars
- [ ] Default Themes
- [ ] UI background accents (Halftone dots illustrations, etc) for the top right top left or other corner in the background of the app for visual flair
- [x] Option for semi-transparent empty icon fill
- [x] Support for 4 different size modes, from more cozy to more space like macos has


## Atoms (43)

- [x] Avatar
- [x] Banner
- [x] Button
- [x] Callout
- [x] Card
- [x] Checkbox
- [x] CodeBlock
- [x] CounterBadge
- [x] DeviceFrame
- [x] Divider
- [x] EmptyState
- [x] FilterChip
- [x] Heading
- [x] Icon
- [x] IconButton
- [x] Image
- [x] Input
- [x] Kbd
- [x] Label
- [x] Link
- [x] Meter
- [x] NumberInput
- [x] OtpField
- [x] Pill
- [x] ProgressBar
- [x] ProgressRing
- [x] Radio
- [x] RadioCard
- [x] Rating
- [x] SearchField
- [x] SegmentedBar
- [x] Skeleton
- [x] Slider
- [x] Sparkline
- [x] Spinner
- [x] StatTile
- [x] StatusDot
- [x] Steps
- [x] Surface
- [x] Switch
- [x] Text
- [x] Textarea
- [x] Toggle

## Molecules (21)

- [x] Accordion
- [x] Breadcrumbs
- [x] Calendar
- [x] Carousel
- [x] Combobox &nbsp;`▲ overlay`
- [x] DatePicker &nbsp;`▲ overlay`
- [x] Field
- [x] Fieldset
- [x] FileUpload
- [x] FormSection
- [x] Heatmap
- [x] List
- [x] MultiSelect &nbsp;`▲ overlay`
- [x] Pagination
- [x] ScrollArea
- [x] SegmentedControl
- [x] Select &nbsp;`▲ overlay`
- [x] Spotlight &nbsp;`▲ overlay`
- [x] Tabs
- [x] Toast

## Organisms (18)

- [x] AlertDialog &nbsp;`▲ overlay`
- [x] AppShell
- [x] DataGrid
- [ ] Drawer &nbsp;`▲ overlay`
- [ ] FloatingPanel &nbsp;`▲ overlay`
- [x] Menu &nbsp;`▲ overlay`
- [ ] Modal &nbsp;`▲ overlay`
- [ ] Popover &nbsp;`▲ overlay`
- [x] ResizableSplitPane
- [x] TabStrip
- [x] TabbedModal &nbsp;`▲ overlay`
- [x] TabbedPanel
- [x] Table
- [x] Timeline
- [x] TimeSeriesChart
- [x] TimelineScrubber
- [ ] TreeView
  - [ ] Text clipped on react native
  - [ ] Blueprint is not representitive of tree view
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
