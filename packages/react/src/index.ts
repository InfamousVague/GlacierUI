// shared enum vocabulary — Size.Large, Tone.Accent, TextTone.Muted, Variant.Soft, SkeletonVariant.Circle
export { Size, Tone, TextTone, Variant, SkeletonVariant } from '@glacier/spec';

// writing direction — live resolution for event handlers, a hook for render output
export { resolveDirection, useDirection, type Direction } from './internal/direction.ts';

// atoms
export { Button, type ButtonProps, type ButtonVariant, type ControlSize } from './atoms/inputs/Button/Button.tsx';
export { IconButton, type IconButtonProps } from './atoms/inputs/Button/IconButton.tsx';
export { Input, type InputProps } from './atoms/inputs/Input/Input.tsx';
export { Checkbox, type CheckboxProps } from './atoms/inputs/Selection/Checkbox.tsx';
export { Radio, type RadioProps } from './atoms/inputs/Selection/Radio.tsx';
export { Switch, type SwitchProps } from './atoms/inputs/Selection/Switch.tsx';
export { Card, type CardProps, type CardVariant, type Elevation } from './atoms/display/Surface/Card.tsx';
export { Surface, type SurfaceProps, type SurfaceLevel } from './atoms/display/Surface/Surface.tsx';
export { Text, type TextProps, type TextAlign } from './atoms/display/Typography/Text.tsx';
export { Heading, type HeadingProps } from './atoms/display/Typography/Heading.tsx';
export { Label, type LabelProps } from './atoms/display/Typography/Label.tsx';
export { Link, type LinkProps } from './atoms/display/Typography/Link.tsx';
export { Kbd, type KbdProps } from './atoms/display/Typography/Kbd.tsx';
export { Pill, type PillProps, type PillTone, type PillVariant } from './atoms/display/Pill/Pill.tsx';
export { Divider, type DividerProps } from './atoms/display/Divider/Divider.tsx';
export { ProgressBar, type ProgressBarProps } from './atoms/feedback/Progress/ProgressBar.tsx';
export { Spinner, type SpinnerProps } from './atoms/feedback/Progress/Spinner.tsx';
export { Slider, type SliderProps } from './atoms/inputs/Slider/Slider.tsx';
export { Skeleton, type SkeletonProps } from './atoms/feedback/Skeleton/Skeleton.tsx';
export { Toggle, type ToggleProps } from './atoms/inputs/Toggle/Toggle.tsx';
export { Meter, type MeterProps, type MeterTone } from './atoms/feedback/Meter/Meter.tsx';
export { Textarea, type TextareaProps } from './atoms/inputs/Textarea/Textarea.tsx';
export { SearchField, type SearchFieldProps } from './atoms/inputs/SearchField/SearchField.tsx';
export { NumberInput, type NumberInputProps } from './atoms/inputs/NumberInput/NumberInput.tsx';
export { ProgressRing, type ProgressRingProps } from './atoms/feedback/ProgressRing/ProgressRing.tsx';
export { Avatar, type AvatarProps } from './atoms/display/Avatar/Avatar.tsx';
export { StatusDot, type StatusDotProps } from './atoms/display/StatusDot/StatusDot.tsx';
export { CounterBadge, type CounterBadgeProps } from './atoms/display/CounterBadge/CounterBadge.tsx';
export { Callout, type CalloutProps, type CalloutTone } from './atoms/feedback/Callout/Callout.tsx';
export { CodeBlock, type CodeBlockProps } from './atoms/display/CodeBlock/CodeBlock.tsx';
export { SegmentedBar, type SegmentedBarProps } from './atoms/feedback/SegmentedBar/SegmentedBar.tsx';
export { Banner, type BannerProps, type BannerTone } from './atoms/feedback/Banner/Banner.tsx';
export { EmptyState, type EmptyStateProps } from './atoms/feedback/EmptyState/EmptyState.tsx';
export { Steps, type StepsProps, type StepsTone, type StepsSize } from './atoms/feedback/Steps/Steps.tsx';
export { RadioCard, type RadioCardProps } from './atoms/inputs/RadioCard/RadioCard.tsx';
export { StatTile, type StatTileProps } from './atoms/display/StatTile/StatTile.tsx';
export { DeviceFrame, type DeviceFrameProps, type DeviceFrameSize } from './atoms/display/DeviceFrame/DeviceFrame.tsx';
export { FilterChip, type FilterChipProps } from './atoms/inputs/FilterChip/FilterChip.tsx';
export { Image, type ImageProps, type ImageFit, type ImageRadius } from './atoms/display/Image/Image.tsx';
export { Rating, type RatingProps } from './atoms/inputs/Rating/Rating.tsx';
export { OtpField, type OtpFieldProps, type OtpFieldType } from './atoms/inputs/OtpField/OtpField.tsx';

// molecules
export { Field, type FieldProps } from './molecules/Field/Field.tsx';
export { useField } from './internal/FieldContext.ts';
export {
  SegmentedControl,
  type SegmentedControlProps,
  type SegmentedOption,
} from './molecules/Segmented/SegmentedControl.tsx';
export { ScrollArea, type ScrollAreaProps, type ScrollAreaOrientation } from './molecules/ScrollArea/ScrollArea.tsx';
export { Carousel, type CarouselProps } from './molecules/Carousel/Carousel.tsx';
export { Combobox, type ComboboxProps, type ComboboxOption } from './molecules/Combobox/Combobox.tsx';
export { MultiSelect, type MultiSelectProps, type MultiSelectOption } from './molecules/MultiSelect/MultiSelect.tsx';
export { List, ListItem, type ListProps, type ListItemProps, type ListSize } from './molecules/List/List.tsx';
export { Heatmap, type HeatmapProps, type HeatmapData, type HeatmapPoint } from './molecules/Heatmap/Heatmap.tsx';
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from './molecules/Breadcrumbs/Breadcrumbs.tsx';
export { Pagination, type PaginationProps } from './molecules/Pagination/Pagination.tsx';
export { Accordion, type AccordionProps, type AccordionItem } from './molecules/Accordion/Accordion.tsx';
export { Calendar, type CalendarProps, type CalendarMode, type CalendarRange } from './molecules/DatePicker/Calendar.tsx';
export { DatePicker, type DatePickerProps } from './molecules/DatePicker/DatePicker.tsx';
export { Fieldset, type FieldsetProps } from './molecules/Fieldset/Fieldset.tsx';
export { FormSection, type FormSectionProps } from './molecules/Fieldset/FormSection.tsx';
export {
  FileUpload,
  type FileUploadProps,
  type FileUploadRejection,
  type FileUploadRejectionReason,
} from './molecules/FileUpload/FileUpload.tsx';
export { Spotlight, type SpotlightProps } from './molecules/Spotlight/Spotlight.tsx';
export { Select, type SelectProps, type SelectOption } from './molecules/Select/Select.tsx';
export { Tabs, type TabsProps, type TabItem } from './molecules/Tabs/Tabs.tsx';
export { Tooltip, type TooltipProps } from './molecules/Tooltip/Tooltip.tsx';
export {
  Toast,
  ToastProvider,
  useToast,
  type ToastProps,
  type ToastOptions,
  type ToastContextValue,
  type ToastTone,
} from './molecules/Toast/Toast.tsx';

// layout
export { Box, type BoxProps } from './layout/Box.tsx';
export { Stack, type StackProps } from './layout/Stack.tsx';
export { Row, type RowProps } from './layout/Row.tsx';
export { Grid, type GridProps } from './layout/Grid.tsx';
export { Center, type CenterProps } from './layout/Center.tsx';
export { Spacer, type SpacerProps } from './layout/Spacer.tsx';
export { Container, type ContainerProps } from './layout/Container.tsx';
export type {
  Responsive,
  Align,
  Justify,
  Background,
  RadiusToken,
  BorderToken,
  ContainerSize,
} from './layout/types.ts';

// structures
export {
  Sidebar,
  SidebarSection,
  SidebarItem,
  type SidebarProps,
  type SidebarSectionProps,
  type SidebarItemProps,
} from './structures/Sidebar/Sidebar.tsx';
export { Toolbar, type ToolbarProps } from './structures/Toolbar/Toolbar.tsx';
export {
  NavBar,
  NavBarItem,
  type NavBarProps,
  type NavBarItemProps,
  type NavBarOrientation,
} from './structures/NavBar/NavBar.tsx';
export { TitleBar, type TitleBarProps } from './structures/TitleBar/TitleBar.tsx';

// organisms
export { Modal, type ModalProps } from './organisms/Modal/Modal.tsx';
export { Drawer, type DrawerProps, type DrawerSide, type DrawerSize } from './organisms/Drawer/Drawer.tsx';
export { AlertDialog, type AlertDialogProps, type AlertDialogTone } from './organisms/AlertDialog/AlertDialog.tsx';
export { AppShell, type AppShellProps } from './organisms/AppShell/AppShell.tsx';
export { Popover, type PopoverProps } from './organisms/Popover/Popover.tsx';
export {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  ContextMenu,
  MenuSub,
  type MenuProps,
  type MenuItemProps,
  type ContextMenuProps,
  type MenuSubProps,
} from './organisms/Menu/Menu.tsx';
export { TreeView, type TreeViewProps, type TreeItem } from './organisms/TreeView/TreeView.tsx';
export { FloatingPanel, type FloatingPanelProps } from './organisms/FloatingPanel/FloatingPanel.tsx';
export { TabbedPanel, type TabbedPanelProps, type TabbedPanelTab } from './organisms/TabbedPanel/TabbedPanel.tsx';
export { TabbedModal, type TabbedModalProps, type TabbedModalSection } from './organisms/TabbedModal/TabbedModal.tsx';
export { TabStrip, type TabStripProps, type TabStripItem } from './organisms/TabStrip/TabStrip.tsx';
export {
  ResizableSplitPane,
  type ResizableSplitPaneProps,
  type SplitOrientation,
} from './organisms/ResizableSplitPane/ResizableSplitPane.tsx';
export { Table, type TableProps, type TableColumn } from './organisms/Table/Table.tsx';
export {
  DataGrid,
  type DataGridProps,
  type DataGridColumn,
  type DataGridRow,
  type DataGridRowId,
  type DataGridSort,
  type SortDirection,
} from './organisms/DataGrid/DataGrid.tsx';
export type { Placement } from './internal/useAnchoredPosition.ts';

// i18n - the translation mandate: every user-facing string resolves through a
// message catalog that must cover every locale, so a missing translation is a
// compile error rather than a runtime surprise.
export {
  LocaleProvider,
  useLocale,
  useT,
  locales,
  DEFAULT_LOCALE,
  rtlLocales,
  direction,
  defineMessages,
  format,
  kitMessages,
  type Locale,
  type Message,
  type MessageCatalog,
  type Translate,
  type LocaleProviderProps,
  type KitMessageKey,
} from './i18n/index.ts';

// haptics - best-effort touch feedback, gated by a preference and overridable
// by a native shell. See haptics.ts for the platform reality.
export { HapticsProvider, useHaptics } from './haptics/HapticsProvider.tsx';
export { haptic, setHapticsEnabled, hapticsEnabled, type HapticKind, type HapticFn } from './haptics/haptics.ts';
