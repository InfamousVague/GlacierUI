/**
 * @glacier/logic — the renderer-agnostic layer.
 *
 * Everything here is pure React or plain TypeScript: no `document`, no DOM
 * elements, no `react-native` imports. It is the shared brain that both the DOM
 * kit (@glacier/react) and the React Native kit (@glacier/native) consume, so a
 * behavior is written and tested once and cannot drift between platforms. Paint
 * and geometry live in @glacier/spec; this holds the LOGIC.
 *
 * ---
 *
 * WHAT BELONGS HERE, since the answer surprises people.
 *
 * The unit of sharing is a PLATFORM, not a component. A module earns its place
 * by being imported by BOTH bindings — not by being used by many components. It
 * is normal, and correct, for a module here to serve exactly one component:
 * `seek-bar.ts` has one component and two implementations, and those two
 * implementations are the whole reason it exists. Left in either binding, the
 * other would have to transcribe it, and the day someone fixes a rounding error
 * in one, the two platforms quietly start disagreeing.
 *
 * So the test for a new module is one question: **do both bindings import it?**
 *
 * - Both  -> it belongs here.
 * - One   -> it belongs in that binding, next to its component.
 * - Neither -> delete it.
 *
 * WHY IT IS A SEPARATE PACKAGE, rather than living beside each component.
 *
 * Only because a shared file cannot sit inside either binding without making
 * one depend on the other. @glacier/native imports nothing from @glacier/react,
 * and should not start: that package carries ~154 CSS-module imports and
 * framer-motion, none of which belong in a Metro bundle. Physically co-locating
 * each module with its component is achievable — it needs a per-component
 * folder (logic + spec + web + native together) with the two kits reduced to
 * barrels — but that is a repo-layout change, not a constraint of this package.
 *
 * WHAT DOES NOT BELONG HERE.
 *
 * Anything that renders, anything that reads `window` or `document`, anything
 * imported from `react-native`, and any value that only one platform consults.
 * Paint and geometry are @glacier/spec's job; this package holds decisions.
 */

import { useCallback, useRef, useState } from 'react';

// Spec-derived style resolvers, the shared seam that keeps the DOM and native
// bindings reading one paint/geometry contract instead of hand-transcribing it.
export { paintFor, sizeFor, dimensionsFor, type TokenMap, type StyleGroup } from './spec.ts';

// Seek bar waveform geometry, shared so the DOM and native scrubbers paint one
// set of curves rather than each transcribing the wave math.
export {
  seekBarGeometry,
  seekBarStroke,
  seekBarHasThumb,
  seekBarPaint,
  seekBarRail,
  seekBarGradient,
  seekBarSkeleton,
  seekBarStopColor,
  SEEK_VIEW_WIDTH,
  SEEK_VIEW_HEIGHT,
  type SeekBarShape,
  type SeekBarGeometry,
  type SeekBarGeometryOptions,
  type SeekBarStroke,
  type SeekBarTone,
  type SeekBarPaint,
  type SeekBarFill,
  type SeekBarStop,
  type SeekBarRail,
  type SeekBarRailPaint,
  type SeekBarSkeleton,
} from './seek-bar.ts';

// Player transport logic: time formatting and the repeat cycle, shared so both
// bindings read a clock and step a mode the same way.
export {
  formatDuration,
  nextRepeat,
  playerMetrics,
  playerSkeletonWidths,
  type PlayerRepeat,
  type PlayerLayout,
  type PlayerDensity,
  type PlayerMetrics,
} from './player.ts';

// Calendar grid building, event bucketing, and paging. Dependency-free local
// date arithmetic, shared so both bindings lay out the same month.
export {
  startOfDay,
  startOfWeek,
  addDays,
  addMonths,
  dayKey,
  sameDay,
  weekdayOrder,
  buildMonthGrid,
  buildWeek,
  buildAgenda,
  bucketEvents,
  stepCalendar,
  splitOverflow,
  MONTH_ROWS,
  MONTH_CELL_LIMIT,
  type CalendarViewMode,
  type WeekStart,
  type CalendarTone,
  type CalendarEvent,
  type CalendarDay,
} from './calendar-view.ts';

// Colour conversion in OKLCH, the space the kit's own ramps are authored in.
export {
  oklchToRgb,
  rgbToOklch,
  rgbToHex,
  parseHex,
  oklchToHex,
  formatOklch,
  parseOklch,
  inSrgbGamut,
  readableOn,
  channelRamp,
  MAX_CHROMA,
  MAX_HUE,
  HUE_STEP,
  type Oklch,
  type Rgb,
  type ColorChannel,
} from './color.ts';

// Calendar event editing: the draft model the editor popover works on, and
// the local-time parsing that keeps a typed date on the day it was typed.
export {
  timeString,
  parseLocal,
  draftFromEvent,
  draftForDate,
  validateDraft,
  draftIsValid,
  eventFromDraft,
  upsertEvent,
  removeEvent,
  eventTimeSummary,
  type CalendarEventDraft,
  type DraftErrors,
} from './calendar-editor.ts';

// Rich text editing: selection-to-markdown transforms, shared so Bold means
// exactly the same thing on a DOM textarea and a native TextInput.
export {
  toggleMark,
  toggleBlock,
  activeMarks,
  activeBlock,
  tokenizeMarkdown,
  BLOCK_PREFIXES,
  insertLink,
  markForShortcut,
  MARK_DELIMITERS,
  type MarkdownMark,
  type MarkdownToken,
  type MarkdownTokenKind,
  type MarkdownBlock,
  type TextSelection,
  type EditResult,
  type MarkShortcutEvent,
} from './rich-text.ts';

// Virtual list windowing: which slice of a long list is worth rendering for a
// given scroll position, shared so both bindings render the same rows.
export {
  virtualWindow,
  scrollOffsetForIndex,
  windowIndices,
  type VirtualWindow,
  type VirtualWindowOptions,
} from './virtual-list.ts';

// Sortable list reordering: the array move, the pointer-to-slot mapping, and
// the shift each row makes mid-drag. Shared so a drop lands in the same slot on
// both platforms.
export {
  moveItem,
  nextSortableIndex,
  dropTarget,
  shiftFor,
  didReorder,
  type SortableLift,
} from './sortable.ts';

// Command palette matching and cursor movement, shared so a query narrows the
// same list and the arrow keys land in the same place on both platforms.
export {
  matchCommands,
  groupCommands,
  moveCommandCursor,
  firstCommandCursor,
  isCommandShortcut,
  highlightSegments,
  type CommandDescriptor,
  type CommandMatch,
  type CommandGroup,
  type CommandShortcutEvent,
  type CommandSegment,
} from './command-palette.ts';

export {
  messageAuthorship,
  conversationOwn,
  messageAck,
  isProvisional,
  conversationRuns,
  atBottom,
  conversationSkeletonMessages,
  conversationSkeletonRuns,
  CONVERSATION_ASSUMED_STATUS,
  CONVERSATION_STICK_SLOP,
  CONVERSATION_SKELETON_VIEWER,
  type MessageAuthorship,
  type MessageAck,
  type ConversationRun,
  type ConversationRunsOptions,
  type ConversationScroll,
  type ConversationSkeletonRun,
} from './conversation-view.ts';

// Chat rules: message grouping, bubble geometry, separators, reaction tallies,
// typing state, attachment routing, and delivery ordering. Shared so a DOM
// transcript and a native one break their runs, place their unread divider, and
// tally their reactions identically.
export {
  groupMessages,
  bubblePosition,
  messageTimestamp,
  formatMessageTimestamp,
  insertSeparators,
  aggregateReactions,
  typingText,
  formatTyping,
  attachmentKind,
  deliveryRank,
  leastDelivery,
  chatDayKey,
  daysBetween,
  deliveryStatuses,
  CHAT_GROUP_WINDOW_MS,
  type Millis,
  type DeliveryStatus,
  type Reaction,
  type ChatAttachment,
  type ChatMessage,
  type MessageGroup,
  type GroupMessagesOptions,
  type BubblePosition,
  type MessageTimestamp,
  type MessageTimestampKind,
  type MessageTimestampStyle,
  type MessageTimestampFormat,
  type ChatSequenceItem,
  type InsertSeparatorsOptions,
  type ReactionSummary,
  type TypingKey,
  type TypingState,
  type TypingTemplates,
  type AttachmentKind,
} from './chat.ts';

// Conversation-list rules: snippet truncation, the unread cap, row timestamps,
// marker precedence, section grouping, and the windowing arithmetic. Shared so a
// sidebar row says the same thing on both platforms.
// Presence vocabulary and avatar-stack maths: the status set, the shape each
// status carries (so meaning never rests on colour alone), and the overlap and
// overflow arithmetic behind a stack of faces.
// Call transport logic: the inverse-toggle sense that makes a muted mic read as
// alarming while a live speaker reads as engaged, the mic level window, and the
// elapsed clock.
// Transcript scroll policy: when a list is close enough to the end to count as
// at-bottom, and how far to correct after a commit so a prepend does not move
// the reader. Shared so the DOM and native lists anchor identically.
// Reaction display rules: the overflow cap, the frequently-used default set, the
// optimistic toggle transition, and the grid cursor the pill row, picker, and
// action cluster all move by.
// Attachment presentation: aspect clamps, the album mosaic expressed as rows of
// weights (the one tiling primitive both platforms render identically), file-name
// middle truncation, size formatting, and glyph routing.
// Compose rules: the send-enablement test, auto-grow row maths, the Enter-key
// policy, attachment state transitions, and mention matching layered over the
// command palette's matcher.
// Message bubble geometry: which corners a bubble flattens given its place in a
// run, the tail path both bindings draw from one set of numbers, and the
// per-layout metrics behind the bubble and row presentations.
export {
  BUBBLE_MAX_WIDTH,
  bubbleCorners,
  bubbleHasTail,
  defaultMessageLabels,
  messageMetrics,
  messageSide,
  messageTail,
  tailScaleX,
  type BubbleCorners,
  type MessageLabels,
  type MessageLayout,
  type MessageMetrics,
  type MessageSide,
} from './message.ts';

// Delivery, quoting, and connection state. The delivery table is the single one
// in the kit: no two states share a silhouette, so the mark survives greyscale
// and colour blindness rather than leaning on tone.
export {
  advanceDelivery,
  deliveryGlyph,
  deliveryLabel,
  deliveryLabels,
  deliveryTone,
  type DeliveryGlyph,
  type DeliveryLabels,
  type DeliveryTone,
} from './status.ts';

// Builds a SeekBar's levels from audio as it plays. Each binding feeds it from
// its own meter; the bookkeeping is written once here.
export {
  createLevelRecorder,
  useLiveLevels,
  rms,
  type LevelRecorder,
  type LevelRecorderOptions,
  type LoudnessMeter,
  type UseLiveLevelsOptions,
} from './level-recorder.ts';

/**
 * Controlled/uncontrolled state in one hook. Pass `value` to control it, or
 * `defaultValue` to let the hook own it. Returns the resolved value and a
 * setter that always calls `onChange` and only updates internal state while
 * uncontrolled, so a controlled parent stays the single source of truth. This
 * is the same contract every toggle, slider, and field in both kits needs.
 */
export function useControlled<T>(options: {
  value?: T;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<T>(defaultValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const resolved = isControlled ? (value as T) : internal;

  const set = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [isControlled],
  );

  return [resolved, set];
}

/**
 * The press-feedback scale for tappable controls, shared so a Button dips by
 * the same amount whether it is a DOM `whileTap` or a React Native pressed
 * transform. Kept as plain numbers, not a motion runtime, so each platform
 * animates it with its own engine (framer-motion on web, Reanimated native).
 */
export const press = {
  /** Full-size controls (buttons, cards): a gentle dip. */
  control: 0.97,
  /** Small controls (chips, icon buttons): a slightly firmer dip. */
  compact: 0.94,
} as const;

export type PressScale = keyof typeof press;
