# GlacierUI Validation List

This is the living human-acceptance checklist for GlacierUI. Keep each checkbox
unchecked until the behavior has been inspected manually in the docs app at
desktop and mobile widths, in both light and dark themes where it is relevant.

## Definition Of Done

- [ ] Every public component below has a generated specification entry in `@glacier/spec`.
- [ ] Every public component is exported from `@glacier/react` and has a focused behavior and axe test.
- [ ] Every public component has a docs route, examples, props reference, anatomy blueprint where useful, and visual-test coverage.
- [ ] Every public component uses Glacier semantic tokens and respects compact density, dark theme, and reduced motion where applicable.
- [ ] Keyboard, focus restoration, native form behavior, and mobile touch interaction have been manually exercised for interactive components.
- [ ] `npm run gen`, React and docs typechecks, focused tests, catalog conformance, and the relevant visual tests pass before a component is marked validated.

## Current Catalog: Human Validation Pending

These components are implemented and cataloged. Check each item only after its
live documentation example has been reviewed as a user would use it.

### Typography And Content

- [x] Text - Verify readable body copy at each size, tone, and theme.
- [x] Heading - Verify semantic levels and the display scale in real page layouts.
- [x] Label - Verify label-to-control wiring and required-state presentation.
- [x] Link - Verify accessible focus, visited behavior, and external-link usage.
- [x] Kbd - Verify key combinations remain legible in dense documentation and dark theme.
- [x] Code Block - Verify copy action, long-line handling, and optional line-number layout.

### Actions And Inputs

- [x] Button - Verify variants, tones, loading, disabled, icon, and press states.
- [x] Icon Button - Verify accessible naming, tooltip support, target size, and compact layouts.
- [x] Toggle - Verify pressed state, keyboard interaction, and controlled behavior.
- [x] Input - Verify Field wiring, invalid state, native form attributes, and all sizes.
- [x] Textarea - Verify autosizing, resize behavior, Field wiring, and long content.
- [x] Number Input - Verify min, max, step, keyboard entry, and disabled stepper controls.
- [x] Search Field - Verify search affordance, clear action, keyboard shortcut slot, and result filtering use.
- [x] Checkbox - Verify indeterminate, disabled, group, and keyboard states.
- [x] Radio - Verify group navigation, labels, disabled options, and form submission.
- [x] Radio Card - Verify selection, keyboard semantics, descriptions, and responsive card sizing.
- [x] Switch - Verify checked, disabled, keyboard, and accessible-label states.
- [x] Slider - Verify keyboard increments, pointer interaction, bounds, and value presentation.
- [x] Filter Chip - Verify compact padding, counter nesting, selected state, and wrapping in filter rows.
- [x] Select - Verify portal positioning, flip behavior, typeahead/keyboard selection, and Field integration.
- [x] Combobox - Verify filtering, option descriptions, disabled options, form value, keyboard selection, and dropdown sizing.
- [x] MultiSelect - Verify filtering, tag wrapping/removal, keyboard toggling, repeated form values, disabled options, and dropdown sizing.

### Feedback, Status, And Visualization

- [x] Pill - Verify tones, removable-tag behavior, icons, and long labels.
- [x] Counter Badge - Verify count changes, compact placement, and large-number formatting.
- [x] Status Dot - Verify semantic colors, labels, pulse motion, and reduced-motion behavior.
- [x] Avatar - Verify image loading, initials fallback, groups, and non-square source images.
- [x] Callout - Verify each tone, icon, actions, and compact content.
- [x] Banner - Verify announcement semantics, dismissal, actions, and narrow viewport wrapping.
- [x] Meter - Verify value ranges, labels, tone states, and non-progress usage.
- [x] Progress Bar - Verify determinate, indeterminate, labels, and reduced-motion behavior.
- [x] Progress Ring - Verify value labels, fractional values, size variants, and contrast.
- [x] Spinner - Verify size, accessible loading text, and use inside controls.
- [x] Steps - Verify completed/current/upcoming states and narrow-width behavior.
- [x] Skeleton - Verify text, rectangle, circle, and component-geometry loading states.
- [x] Empty State - Verify title, description, action, and domain-specific empty-view composition.
- [x] Segmented Bar - Verify proportions, labels, legend, and very small segments.
- [x] Heatmap - Verify cell labels, legends, keyboard/tooltip content, and dense data.
- [x] Rating - Verify read-only fractional display, editable radio behavior, and accessible values.

### Surfaces, Media, And Layout

- [x] Card - Verify elevation, hover, glass, selectable content, and responsive content density.
- [x] Surface - Verify semantic surface layers in light/dark themes and glass material.
- [x] Divider - Verify horizontal, vertical, and labeled variants in dense layouts.
- [x] Stat Tile - Verify values, delta treatments, icon placement, and narrow layouts.
- [x] Device Frame - Verify frame variants, screen aspect ratio, and embedded previews.
- [x] Image - Verify loading, fallback, crop behavior, alt text, and fixed aspect ratios.
- [x] App Shell - Verify responsive navigation, header, content sizing, and skip/focus paths.

### Structures

- [x] Sidebar - Verify active items, collapsible behavior, keyboard navigation, and branding card.
- [x] Toolbar - Verify overflow, icon actions, grouping, and touch target sizing.
- [x] Title Bar - Verify centered title truncation, start and end action slots, the macOS traffic-light gutter inset, glass background, and window dragging in a desktop shell.
- [x] Nav Bar - Verify horizontal and vertical orientation, the sliding active pill, keyboard navigation, and overflow in top navs and icon rails.

### Molecules

- [x] Field - Verify labels, hints, errors, required marker, alert announcements, and nested controls.
- [x] Segmented Control - Verify selection, keyboard navigation, thumb motion, and narrow labels.
- [x] Tabs - Verify tab/panel linkage, keyboard navigation, lazy content, and mobile overflow.
- [x] Tooltip - Verify hover, focus, touch fallback, placement, and reduced motion.
- [x] Toast - Verify announcement, timeout, replacement, action, and viewport positioning.
- [x] Scroll Area - Verify keyboard scrolling, edge fades, scrollbar handling, and nested content.
- [x] Carousel - Verify buttons, drag/scroll interaction, snap points, and overflow detection.
- [x] Breadcrumbs - Verify current-page semantics, long path truncation, and mobile wrapping.
- [x] Pagination - Verify page changes, ellipsis, disabled edges, and accessible current-page state.
- [x] Accordion - Verify disclosure semantics, keyboard behavior, multiple/single expansion, and motion.
- [x] Date Picker - Verify calendar keyboard navigation, range selection, locale-aware month and value formatting, disabled dates, Field wiring, and form submission value.
- [x] File Upload - Verify chooser and drag-and-drop entry, type/size/count rejections, file list removals, disabled state, and native form participation.
- [x] Fieldset and Form Section - Verify legend naming, description wiring, the native disabled cascade, actions placement, bordered variant, and stacked sections.

### Overlays And Data Displays

- [x] Modal - Verify focus trap, restoration, dismissal policy, scroll lock, and mobile viewport fit.
- [x] Drawer - Verify each edge, mobile sheet sizing, scrollable body, focus restoration, persistent mode, and safe footer actions.
- [x] AlertDialog - Verify cancel-first focus, danger treatment, explicit labels, loading state, default nondismissible behavior, and optional dismissal.
- [x] Popover - Verify anchored placement, arrow, outside dismissal, focus behavior, and clipping escape.
- [x] Menu - Verify menu item keyboard navigation, shortcuts, separators, subgroups, and viewport flip.
- [x] Floating Panel - Verify drag handle, close action, focus behavior, and constrained viewport positioning.
- [x] Tabbed Panel - Verify tab behavior, actions slot, body scrolling, and dense content.
- [x] Tabbed Modal - Verify focus trap, rail selection, narrow layouts, and scrolling content.
- [x] Tab Strip - Verify scrollable tabs, close actions, active indicator, and overflow scrollbar space.
- [x] Resizable Split Pane - Verify pointer and keyboard resize, min/max sizes, focus, and mobile fallback.
- [x] Table - Verify semantic headers, bottom caption, empty state, overflow, and rounded-card surface.
- [x] Spotlight - Verify target cutout, step sequencing, escape behavior, and focus restoration.

## Remaining Roadmap: Build, Specify, And Validate

Each public component in this section must add its own `@glacier/spec` contract,
catalog registration, generated JSON output, React export, conformance renderer,
focused test suite, docs page, localized page title, gallery item where applicable,
and visual-test route before it moves to the current-catalog section.

### Collection Controls

- [x] MultiSelect implementation - Shipped an editable multi-value listbox with removable tags, controlled `string[]` state, repeated hidden form values, `aria-multiselectable`, Field wiring, and the shared anchored portal behavior.
- [x] MultiSelect specification - Registered the structured `multi-select` contract for option records, selected-value form policy, tag anatomy, loading/empty states, keyboard behavior, Field integration, token metrics, and reduced motion.
- [x] List and List Item - Build semantic single-column content rows with leading/trailing slots, selection, action affordances, density, and keyboard-safe interactive composition.
- [x] List and List Item specification - Describe row anatomy, selection and disabled states, semantic list roles, sizes, token metrics, and action-slot rules.
- [x] Tree View - Build a hierarchical collection with expansion, roving focus, selection, nested levels, and accessible tree keyboard behavior using a mature accessibility foundation where justified.
- [x] Tree View specification - Describe node shape, tree/item/group anatomy, hierarchy and expansion states, keyboard contract, selection policy, indentation tokens, and motion.

### Dialog And Overlay Patterns

- [x] Drawer / Sheet implementation - Shipped a focus-managed side or bottom modal sheet with portal, shared scroll locking, responsive edge behavior, explicit dismissal policy, and reduced-motion transition.
- [x] Drawer / Sheet specification - Registered the structured `drawer` contract for anatomy, side/size variants, dismissal states, focus behavior, surface tokens, and motion.
- [x] Alert Dialog implementation - Shipped a deliberate confirmation dialog with cancel-first focus, destructive-action treatment, explicit labels, and nondismissible-by-default critical flows.
- [x] Alert Dialog specification - Registered the structured `alert-dialog` contract for title/description/actions, tones, focus and keyboard behavior, dismissal rules, and motion.

### Data Components

- [x] Data Grid - Separate `DataGrid` organism (not Table): column defs (align/width/render/sortValue), three-state client sorting (or `manualSort` to defer to the parent), multi-row selection with select-all and an indeterminate header, empty/loading/skeleton states, horizontal overflow plus sticky header with `maxHeight`, comfortable/compact density, and a `role="grid"` roving-tabindex keyboard model. Virtualized scale is served by a windowing strategy (page or window the data and feed the visible slice with `manualSort`) rather than bundling a grid engine, documented in the page Usage. Docs: Organisms > Data Grid.
- [x] Data Grid specification - `data-grid` spec: column and row object contracts, header/cell/selection/sort-indicator anatomy, sorting/selection/loading states, full keyboard grid bindings, comfortable/compact density, and token dimensions; passes validateSpec at 100% strictness, generated to JSON, and held by the conformance test.

### Form And Workflow Components

- [x] Date Picker and Calendar - Shipped Calendar (single and range modes) and DatePicker (anchored glass panel, Field wiring, ISO hidden input) on react-day-picker v10 + date-fns for grid math, keyboard navigation, ARIA, and kit-locale-aware formatting.
- [x] Date Picker and Calendar specification - Registered `calendar` and `date-picker` contracts covering date-value shape, trigger/panel/grid/day anatomy, locale and disabled-date rules, keyboard behavior, the single-date popover range policy, and token metrics.
- [x] File Upload / Dropzone - Shipped a native-input dropzone with drag-and-drop enhancement, type/size/count validation with an onReject contract, a removable file list with locale-aware sizes, Field wiring, and no transport policy.
- [x] File Upload / Dropzone specification - Registered the `file-upload` contract for the accepted-file rules, dropzone/input/file-list anatomy, dragging/invalid/disabled states, keyboard behavior, and token metrics.
- [x] Fieldset and Form Section - Shipped a native fieldset/legend group (native disabled cascades to nested controls) with description and actions slots plus a bordered variant, and a FormSection for page-level grouping with aria-labelledby, actions, and stacking dividers.
- [x] Fieldset and Form Section specification - Registered `fieldset` and `form-section` contracts for legend/description/content/actions anatomy, native fieldset semantics, spacing tokens, and responsive behavior.
- [x] Wizard - Shipped `Wizard`: composes the connected numbered Steps header with per-step validation gates (sync boolean/string or async with a loading Next and disabled footer), localized Previous/Next/Done actions, a role="group" panel focused on committed navigation with a visually hidden localized "Step X of Y", an always-reserved role="status" error line, onSave/onComplete/onStepChange with defaultActiveStep resume, directional reduced-motion-safe panel transition, and a presence-honest skeleton. Docs: Organisms > Wizard.
- [x] Wizard specification - Registered the `wizard` contract: the WizardStep array and gate semantics, action props with kitMessages defaults, progress/heading/panel/error/footer anatomy, error and validating states, keyboard/focus policy, layout token dimensions, and motion; validateSpec clean at full strictness.

### Product Composition Components

- [x] Page Header - Shipped `PageHeader`: breadcrumbs/title/description/meta/actions slots, a localized overflow Menu for `secondaryActions`, headingLevel 1 or 2, comfortable/compact density, presence-gated skeleton, and pure-CSS responsive wrap (actions drop below the title block on narrow widths). Docs: Structures > Page Header.
- [x] Page Header specification - Registered the `page-header` contract: slot anatomy including the overflow menu, heading semantics, density paddings, and layout tokens; validateSpec clean at full strictness.
- [x] Section - Shipped `Section`: semantic section with optional title (auto `aria-labelledby`), description, end-aligned actions, headingLevel 2 or 3, sm/md/lg gap rhythm, divider for stacking, compact density, and skeleton. Docs: Structures > Section.
- [x] Section specification - Registered the `section` contract: header-row/content anatomy, conditional region labelling, gap tokens per step with compact deltas, and divider paint; validateSpec clean at full strictness.
- [x] Card Group - Shipped `CardGroup`: grid mode on repeat(auto-fill, minmax(min(100%, minItemWidth), 1fr)) with a stable minimum card width, list mode single column, sm/md/lg token gaps, compact density, and a skeletonCount placeholder grid. Docs: Structures > Card Group.
- [x] Card Group specification - Registered the `card-group` contract: group/item anatomy, grid and list variants, the auto-fill responsive rule, and gap/density tokens; validateSpec clean at full strictness.
- [x] Timeline / Activity Feed - Shipped `Timeline`: semantic ol feed with per-event actor/title/timestamp/description/media/actions slots, tone-painted markers (all six tones) on a connector rail that ends at the last item, comfortable/compact density, and skeleton rows. Docs: Organisms > Timeline.
- [x] Timeline / Activity Feed specification - Registered the `timeline` contract: the TimelineItem data contract, marker/connector/content anatomy, ordered-list semantics, tone states with token paint, and density dimensions; validateSpec clean at full strictness.
- [x] Empty State scenario recipes - Added six docs recipes to the Empty State page (first use, no search results, failed to load, permission denied, offline, empty selection), each composing the existing atom with guidance on when to reach for it.

### Optional Domain Integrations

- [ ] Kanban board - Decide and implement only as an optional package using `dnd-kit`; validate drag keyboard support, collision behavior, and accessible status announcements.
- [ ] Kanban board specification - Publish a separate component contract only if the optional package ships publicly.
- [ ] Charts - Decide and implement only as an optional package using Visx or an equivalent; validate data/tooltip accessibility, color contrast, resizing, and no-data states.
- [ ] Charts specification - Publish a separate component contract only if the optional package ships publicly.
- [ ] Rich Text Editor - Decide and implement only as an optional package using Lexical or Tiptap; validate toolbar keyboard support, pasted content, form serialization, and read-only rendering.
- [ ] Rich Text Editor specification - Publish a separate component contract only if the optional package ships publicly.

## Cross-Cutting Acceptance Checks

- [ ] Specification coverage - Confirm every public React export has exactly one registered `ComponentSpec` and is emitted by `npm run gen`.
- [ ] Spec conformance - Confirm every cataloged spec has a working renderer in the React conformance matrix across declared variants, tones, and sizes.
- [ ] Internationalization - Confirm every component message has `en`, `es`, `fr`, `de`, and `ja`; every docs page has a localized navigation title.
- [ ] Form integration - Confirm applicable controls inherit Field id, description, invalid state, and native submission behavior.
- [ ] Overlay foundation - Confirm all portaled overlays share correct stacking, scroll tracking, viewport clamping, focus management, body scroll policy, and reduced motion.
- [ ] Responsive review - Confirm each docs route at desktop and mobile widths without overlap, clipped content, or layout shifts.
- [ ] Theme and density review - Confirm relevant components in light/dark themes and normal/compact density without hard-coded visual values.
- [ ] Accessibility review - Confirm focused tests pass, manual keyboard paths work, and axe has no violations apart from documented jsdom implementation noise.
- [ ] Visual regression review - Confirm the relevant Playwright screenshots are reviewed and intentionally updated when component visuals change.