/**
 * @glacier/spec - the language-agnostic contract for the Perfect kit.
 *
 * Import the specs to render docs or drive a framework binding, or read the
 * generated JSON (dist/spec.json) from any language. The React kit consumes the
 * shared vocabulary and per-component enums exported here so it cannot drift.
 */

export * from './schema.ts';
export * from './vocab.ts';
export * from './enums.ts';

// re-export every component module (each exports its `*Spec` plus any shared
// enum const arrays, e.g. buttonVariants, textTones, selectSizes)
export * from './components/app-shell.ts';
export * from './components/announcements.ts';
export * from './components/avatar.ts';
export * from './components/banner.ts';
export * from './components/button.ts';
export * from './components/callout.ts';
export * from './components/card.ts';
export * from './components/checkbox.ts';
export * from './components/code-block.ts';
export * from './components/counter-badge.ts';
export * from './components/divider.ts';
export * from './components/empty-state.ts';
export * from './components/field.ts';
export * from './components/heading.ts';
export * from './components/icon-button.ts';
export * from './components/input.ts';
export * from './components/kbd.ts';
export * from './components/label.ts';
export * from './components/link.ts';
export * from './components/meter.ts';
export * from './components/modal.ts';
export * from './components/number-input.ts';
export * from './components/menu.ts';
export * from './components/pill.ts';
export * from './components/calendar-view.ts';
export * from './components/sortable-list.ts';
export * from './components/virtual-list.ts';
export * from './components/rich-text-editor.ts';
export * from './components/color-picker.ts';
export * from './components/command-palette.ts';
export * from './components/player-card.ts';
export * from './components/popover.ts';
export * from './components/progress-bar.ts';
export * from './components/progress-ring.ts';
export * from './components/radio.ts';
export * from './components/radio-card.ts';
export * from './components/search-field.ts';
export * from './components/seek-bar.ts';
export * from './components/segmented-bar.ts';
export * from './components/segmented-control.ts';
export * from './components/select.ts';
export * from './components/sidebar.ts';
export * from './components/skeleton.ts';
export * from './components/slider.ts';
export * from './components/sparkline.ts';
export * from './components/spinner.ts';
export * from './components/status-dot.ts';
export * from './components/steps.ts';
export * from './components/surface.ts';
export * from './components/switch.ts';
export * from './components/tabs.ts';
export * from './components/text.ts';
export * from './components/textarea.ts';
export * from './components/toast.ts';
export * from './components/toggle.ts';
export * from './components/toolbar.ts';
export * from './components/tooltip.ts';
export * from './components/stat-tile.ts';
export * from './components/device-frame.ts';
export * from './components/filter-chip.ts';
export * from './components/scroll-area.ts';
export * from './components/carousel.ts';
export * from './components/combobox.ts';
export * from './components/multi-select.ts';
export * from './components/list.ts';
export * from './components/heatmap.ts';
export * from './components/breadcrumbs.ts';
export * from './components/pagination.ts';
export * from './components/accordion.ts';
export * from './components/table.ts';
export * from './components/drawer.ts';
export * from './components/alert-dialog.ts';
export * from './components/spotlight.ts';
export * from './components/floating-panel.ts';
export * from './components/tabbed-panel.ts';
export * from './components/tabbed-modal.ts';
export * from './components/tab-strip.ts';
export * from './components/tree-view.ts';
export * from './components/title-bar.ts';
export * from './components/nav-bar.ts';
export * from './components/resizable-split-pane.ts';
export * from './components/icon.ts';
export * from './components/image.ts';
export * from './components/rating.ts';
export * from './components/otp-field.ts';
export * from './components/calendar.ts';
export * from './components/date-picker.ts';
export * from './components/fieldset.ts';
export * from './components/form-section.ts';
export * from './components/file-upload.ts';
export * from './components/timeline.ts';
export * from './components/timeline-scrubber.ts';
export * from './components/time-series-chart.ts';
export * from './components/data-grid.ts';
export * from './components/wizard.ts';
export * from './components/card-group.ts';
export * from './components/section.ts';
export * from './components/page-header.ts';
// chat suite
export * from './components/attachment-tray.ts';
export * from './components/avatar-group.ts';
export * from './components/call-control-bar.ts';
export * from './components/call-control-button.ts';
export * from './components/call-timer.ts';
export * from './components/character-counter.ts';
export * from './components/chat-header.ts';
export * from './components/compose-bar.ts';
export * from './components/compose-context-banner.ts';
export * from './components/connection-banner.ts';
export * from './components/connection-quality.ts';
export * from './components/conversation-list.ts';
export * from './components/date-separator.ts';
export * from './components/delivery-status.ts';
export * from './components/file-attachment.ts';
export * from './components/image-attachment.ts';
export * from './components/image-grid.ts';
export * from './components/link-preview-card.ts';
export * from './components/member-row.ts';
export * from './components/mention-autocomplete.ts';
export * from './components/message-actions.ts';
export * from './components/message-bubble.ts';
export * from './components/message-input.ts';
export * from './components/message-list.ts';
export * from './components/mic-toggle.ts';
export * from './components/presence-dot.ts';
export * from './components/quoted-message.ts';
export * from './components/reaction-bar.ts';
export * from './components/reaction-picker.ts';
export * from './components/reaction-pill.ts';
export * from './components/recording-indicator.ts';
export * from './components/scroll-to-latest.ts';
export * from './components/send-button.ts';
export * from './components/system-message.ts';
export * from './components/thread-indicator.ts';
export * from './components/typing-indicator.ts';
export * from './components/unread-divider.ts';
export * from './components/video-attachment.ts';
export * from './components/voice-note.ts';
export * from './components/voice-recorder.ts';

import type { ComponentSpec } from './schema.ts';
import { appShellSpec } from './components/app-shell.ts';
import { announcementsSpec } from './components/announcements.ts';
import { avatarSpec } from './components/avatar.ts';
import { bannerSpec } from './components/banner.ts';
import { buttonSpec } from './components/button.ts';
import { calloutSpec } from './components/callout.ts';
import { cardSpec } from './components/card.ts';
import { checkboxSpec } from './components/checkbox.ts';
import { codeBlockSpec } from './components/code-block.ts';
import { counterBadgeSpec } from './components/counter-badge.ts';
import { dividerSpec } from './components/divider.ts';
import { emptyStateSpec } from './components/empty-state.ts';
import { fieldSpec } from './components/field.ts';
import { headingSpec } from './components/heading.ts';
import { iconButtonSpec } from './components/icon-button.ts';
import { inputSpec } from './components/input.ts';
import { kbdSpec } from './components/kbd.ts';
import { labelSpec } from './components/label.ts';
import { linkSpec } from './components/link.ts';
import { meterSpec } from './components/meter.ts';
import { modalSpec } from './components/modal.ts';
import { numberInputSpec } from './components/number-input.ts';
import { menuSpec } from './components/menu.ts';
import { pillSpec } from './components/pill.ts';
import { calendarViewSpec } from './components/calendar-view.ts';
import { sortableListSpec } from './components/sortable-list.ts';
import { virtualListSpec } from './components/virtual-list.ts';
import { richTextEditorSpec } from './components/rich-text-editor.ts';
import { colorPickerSpec } from './components/color-picker.ts';
import { commandPaletteSpec } from './components/command-palette.ts';
import { playerCardSpec } from './components/player-card.ts';
import { popoverSpec } from './components/popover.ts';
import { progressBarSpec } from './components/progress-bar.ts';
import { progressRingSpec } from './components/progress-ring.ts';
import { radioSpec } from './components/radio.ts';
import { radioCardSpec } from './components/radio-card.ts';
import { searchFieldSpec } from './components/search-field.ts';
import { segmentedBarSpec } from './components/segmented-bar.ts';
import { segmentedControlSpec } from './components/segmented-control.ts';
import { selectSpec } from './components/select.ts';
import { sidebarSpec } from './components/sidebar.ts';
import { seekBarSpec } from './components/seek-bar.ts';
import { skeletonSpec } from './components/skeleton.ts';
import { sliderSpec } from './components/slider.ts';
import { spinnerSpec } from './components/spinner.ts';
import { statusDotSpec } from './components/status-dot.ts';
import { stepsSpec } from './components/steps.ts';
import { surfaceSpec } from './components/surface.ts';
import { switchSpec } from './components/switch.ts';
import { tabsSpec } from './components/tabs.ts';
import { textSpec } from './components/text.ts';
import { textareaSpec } from './components/textarea.ts';
import { toastSpec } from './components/toast.ts';
import { toggleSpec } from './components/toggle.ts';
import { toolbarSpec } from './components/toolbar.ts';
import { tooltipSpec } from './components/tooltip.ts';
import { statTileSpec } from './components/stat-tile.ts';
import { deviceFrameSpec } from './components/device-frame.ts';
import { filterChipSpec } from './components/filter-chip.ts';
import { scrollAreaSpec } from './components/scroll-area.ts';
import { carouselSpec } from './components/carousel.ts';
import { comboboxSpec } from './components/combobox.ts';
import { multiSelectSpec } from './components/multi-select.ts';
import { listItemSpec, listSpec } from './components/list.ts';
import { heatmapSpec } from './components/heatmap.ts';
import { breadcrumbsSpec } from './components/breadcrumbs.ts';
import { paginationSpec } from './components/pagination.ts';
import { accordionSpec } from './components/accordion.ts';
import { tableSpec } from './components/table.ts';
import { drawerSpec } from './components/drawer.ts';
import { alertDialogSpec } from './components/alert-dialog.ts';
import { spotlightSpec } from './components/spotlight.ts';
import { floatingPanelSpec } from './components/floating-panel.ts';
import { tabbedPanelSpec } from './components/tabbed-panel.ts';
import { tabbedModalSpec } from './components/tabbed-modal.ts';
import { tabStripSpec } from './components/tab-strip.ts';
import { treeViewSpec } from './components/tree-view.ts';
import { titleBarSpec } from './components/title-bar.ts';
import { resizableSplitPaneSpec } from './components/resizable-split-pane.ts';
import { iconSpec } from './components/icon.ts';
import { imageSpec } from './components/image.ts';
import { ratingSpec } from './components/rating.ts';
import { otpFieldSpec } from './components/otp-field.ts';
import { navBarSpec } from './components/nav-bar.ts';
import { pageHeaderSpec } from './components/page-header.ts';
import { sectionSpec } from './components/section.ts';
import { cardGroupSpec } from './components/card-group.ts';
import { dataGridSpec } from './components/data-grid.ts';
import { timelineSpec } from './components/timeline.ts';
import { timelineScrubberSpec } from './components/timeline-scrubber.ts';
import { wizardSpec } from './components/wizard.ts';
import { calendarSpec } from './components/calendar.ts';
import { datePickerSpec } from './components/date-picker.ts';
import { fieldsetSpec } from './components/fieldset.ts';
import { formSectionSpec } from './components/form-section.ts';
import { fileUploadSpec } from './components/file-upload.ts';
import { sparklineSpec } from './components/sparkline.ts';
import { timeSeriesChartSpec } from './components/time-series-chart.ts';
// chat suite
import { attachmentChipSpec, attachmentTraySpec } from './components/attachment-tray.ts';
import { avatarGroupSpec, readReceiptStackSpec } from './components/avatar-group.ts';
import { callControlBarSpec } from './components/call-control-bar.ts';
import { callControlButtonSpec } from './components/call-control-button.ts';
import { callTimerSpec } from './components/call-timer.ts';
import { characterCounterSpec } from './components/character-counter.ts';
import { chatHeaderSpec } from './components/chat-header.ts';
import { composeBarSpec } from './components/compose-bar.ts';
import { composeContextBannerSpec } from './components/compose-context-banner.ts';
import { connectionBannerSpec } from './components/connection-banner.ts';
import { connectionQualitySpec } from './components/connection-quality.ts';
import {
  conversationListItemSpec,
  conversationListSpec,
  conversationSkeletonSpec,
} from './components/conversation-list.ts';
import { dateSeparatorSpec } from './components/date-separator.ts';
import { deliveryStatusSpec } from './components/delivery-status.ts';
import { fileAttachmentSpec } from './components/file-attachment.ts';
import { imageAttachmentSpec } from './components/image-attachment.ts';
import { imageGridSpec } from './components/image-grid.ts';
import { linkPreviewCardSpec } from './components/link-preview-card.ts';
import { memberRowSpec } from './components/member-row.ts';
import { mentionAutocompleteSpec } from './components/mention-autocomplete.ts';
import { messageActionsSpec } from './components/message-actions.ts';
import { messageBubbleSpec, messageGroupSpec, messageMetaSpec } from './components/message-bubble.ts';
import { messageInputSpec } from './components/message-input.ts';
import { messageListSpec } from './components/message-list.ts';
import { micToggleSpec } from './components/mic-toggle.ts';
import { presenceDotSpec } from './components/presence-dot.ts';
import { quotedMessageSpec } from './components/quoted-message.ts';
import { reactionBarSpec } from './components/reaction-bar.ts';
import { reactionPickerSpec } from './components/reaction-picker.ts';
import { reactionPillSpec } from './components/reaction-pill.ts';
import { recordingIndicatorSpec } from './components/recording-indicator.ts';
import { scrollToLatestSpec } from './components/scroll-to-latest.ts';
import { sendButtonSpec } from './components/send-button.ts';
import { systemMessageSpec } from './components/system-message.ts';
import { threadIndicatorSpec } from './components/thread-indicator.ts';
import { typingIndicatorSpec } from './components/typing-indicator.ts';
import { unreadDividerSpec } from './components/unread-divider.ts';
import { videoAttachmentSpec } from './components/video-attachment.ts';
import { voiceNoteSpec } from './components/voice-note.ts';
import { voiceRecorderSpec } from './components/voice-recorder.ts';

/** Bump when the schema shape changes in a breaking way. */
export const SPEC_VERSION = '0.1.0';

/** Every component spec, grouped by role for display. */
export const specs: ComponentSpec[] = [
  // text and content
  textSpec,
  headingSpec,
  labelSpec,
  linkSpec,
  kbdSpec,
  iconSpec,
  codeBlockSpec,
  // actions
  buttonSpec,
  iconButtonSpec,
  toggleSpec,
  // form controls
  inputSpec,
  textareaSpec,
  numberInputSpec,
  searchFieldSpec,
  checkboxSpec,
  radioSpec,
  radioCardSpec,
  switchSpec,
  sliderSpec,
  seekBarSpec,
  // status and feedback
  pillSpec,
  counterBadgeSpec,
  statusDotSpec,
  avatarSpec,
  calloutSpec,
  bannerSpec,
  announcementsSpec,
  meterSpec,
  progressBarSpec,
  progressRingSpec,
  spinnerSpec,
  stepsSpec,
  skeletonSpec,
  emptyStateSpec,
  // data viz
  segmentedBarSpec,
  sparklineSpec,
  // containers
  cardSpec,
  surfaceSpec,
  dividerSpec,
  // molecules
  fieldSpec,
  fieldsetSpec,
  formSectionSpec,
  fileUploadSpec,
  calendarSpec,
  datePickerSpec,
  selectSpec,
  segmentedControlSpec,
  tabsSpec,
  tooltipSpec,
  toastSpec,
  // organisms
  modalSpec,
  calendarViewSpec,
  sortableListSpec,
  virtualListSpec,
  richTextEditorSpec,
  colorPickerSpec,
  commandPaletteSpec,
  playerCardSpec,
  popoverSpec,
  menuSpec,
  appShellSpec,
  // new atoms
  statTileSpec,
  deviceFrameSpec,
  filterChipSpec,
  imageSpec,
  ratingSpec,
  otpFieldSpec,
  // new molecules
  scrollAreaSpec,
  carouselSpec,
  comboboxSpec,
  multiSelectSpec,
  listSpec,
  listItemSpec,
  heatmapSpec,
  breadcrumbsSpec,
  paginationSpec,
  accordionSpec,
  tableSpec,
  drawerSpec,
  alertDialogSpec,
  spotlightSpec,
  // new organisms
  floatingPanelSpec,
  tabbedPanelSpec,
  tabbedModalSpec,
  tabStripSpec,
  treeViewSpec,
  titleBarSpec,
  resizableSplitPaneSpec,
  // structures
  sidebarSpec,
  toolbarSpec,
  navBarSpec,
  pageHeaderSpec,
  sectionSpec,
  cardGroupSpec,
  // data workflows
  dataGridSpec,
  timelineSpec,
  timelineScrubberSpec,
  timeSeriesChartSpec,
  wizardSpec,
  // chat suite: atoms
  attachmentChipSpec,
  callControlButtonSpec,
  callTimerSpec,
  characterCounterSpec,
  connectionQualitySpec,
  deliveryStatusSpec,
  messageInputSpec,
  messageMetaSpec,
  presenceDotSpec,
  reactionPillSpec,
  sendButtonSpec,
  systemMessageSpec,
  typingIndicatorSpec,
  // chat suite: molecules
  attachmentTraySpec,
  avatarGroupSpec,
  readReceiptStackSpec,
  callControlBarSpec,
  composeContextBannerSpec,
  connectionBannerSpec,
  conversationListItemSpec,
  conversationSkeletonSpec,
  dateSeparatorSpec,
  fileAttachmentSpec,
  imageAttachmentSpec,
  imageGridSpec,
  linkPreviewCardSpec,
  memberRowSpec,
  mentionAutocompleteSpec,
  messageActionsSpec,
  messageBubbleSpec,
  messageGroupSpec,
  micToggleSpec,
  quotedMessageSpec,
  reactionBarSpec,
  reactionPickerSpec,
  recordingIndicatorSpec,
  scrollToLatestSpec,
  threadIndicatorSpec,
  unreadDividerSpec,
  videoAttachmentSpec,
  voiceNoteSpec,
  voiceRecorderSpec,
  // chat suite: organisms
  composeBarSpec,
  conversationListSpec,
  messageListSpec,
  // chat suite: structures
  chatHeaderSpec,
];

/** Specs keyed by id for O(1) lookup. */
export const specsById: Record<string, ComponentSpec> = Object.fromEntries(specs.map((s) => [s.id, s]));

export function getSpec(id: string): ComponentSpec | undefined {
  return specsById[id];
}
