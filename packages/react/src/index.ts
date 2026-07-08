// atoms
export { Button, type ButtonProps, type ButtonVariant, type ControlSize } from './atoms/Button/Button.tsx';
export { IconButton, type IconButtonProps } from './atoms/Button/IconButton.tsx';
export { Input, type InputProps } from './atoms/Input/Input.tsx';
export { Checkbox, type CheckboxProps } from './atoms/Selection/Checkbox.tsx';
export { Radio, type RadioProps } from './atoms/Selection/Radio.tsx';
export { Switch, type SwitchProps } from './atoms/Selection/Switch.tsx';
export { Card, type CardProps, type CardVariant, type Elevation } from './atoms/Surface/Card.tsx';
export { Surface, type SurfaceProps, type SurfaceLevel } from './atoms/Surface/Surface.tsx';
export { Text, type TextProps, type TextTone } from './atoms/Typography/Text.tsx';
export { Heading, type HeadingProps } from './atoms/Typography/Heading.tsx';
export { Label, type LabelProps } from './atoms/Typography/Label.tsx';
export { Link, type LinkProps } from './atoms/Typography/Link.tsx';
export { Kbd, type KbdProps } from './atoms/Typography/Kbd.tsx';
export { Pill, type PillProps, type PillTone, type PillVariant } from './atoms/Pill/Pill.tsx';
export { Divider, type DividerProps } from './atoms/Divider/Divider.tsx';
export { ProgressBar, type ProgressBarProps } from './atoms/Progress/ProgressBar.tsx';
export { Spinner, type SpinnerProps } from './atoms/Progress/Spinner.tsx';
export { Slider, type SliderProps } from './atoms/Slider/Slider.tsx';
export { Skeleton, type SkeletonProps } from './atoms/Skeleton/Skeleton.tsx';
export { Toggle, type ToggleProps } from './atoms/Toggle/Toggle.tsx';
export { Meter, type MeterProps, type MeterTone } from './atoms/Meter/Meter.tsx';
export { Textarea, type TextareaProps } from './atoms/Textarea/Textarea.tsx';
export { SearchField, type SearchFieldProps } from './atoms/SearchField/SearchField.tsx';
export { NumberInput, type NumberInputProps } from './atoms/NumberInput/NumberInput.tsx';
export { ProgressRing, type ProgressRingProps } from './atoms/ProgressRing/ProgressRing.tsx';
export { Avatar, type AvatarProps } from './atoms/Avatar/Avatar.tsx';
export { StatusDot, type StatusDotProps } from './atoms/StatusDot/StatusDot.tsx';
export { CounterBadge, type CounterBadgeProps } from './atoms/CounterBadge/CounterBadge.tsx';
export { Callout, type CalloutProps, type CalloutTone } from './atoms/Callout/Callout.tsx';
export { CodeBlock, type CodeBlockProps } from './atoms/CodeBlock/CodeBlock.tsx';
export { SegmentedBar, type SegmentedBarProps } from './atoms/SegmentedBar/SegmentedBar.tsx';
export { Banner, type BannerProps, type BannerTone } from './atoms/Banner/Banner.tsx';
export { EmptyState, type EmptyStateProps } from './atoms/EmptyState/EmptyState.tsx';
export { Steps, type StepsProps, type StepsTone, type StepsSize } from './atoms/Steps/Steps.tsx';
export { RadioCard, type RadioCardProps } from './atoms/RadioCard/RadioCard.tsx';
export { Badge, type BadgeProps, type BadgeTone, type BadgeVariant } from './atoms/Badge/Badge.tsx';
export { StatTile, type StatTileProps } from './atoms/StatTile/StatTile.tsx';
export { DeviceFrame, type DeviceFrameProps, type DeviceFrameSize } from './atoms/DeviceFrame/DeviceFrame.tsx';
export { FilterChip, type FilterChipProps } from './atoms/FilterChip/FilterChip.tsx';

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
export { Heatmap, type HeatmapProps, type HeatmapData, type HeatmapPoint } from './molecules/Heatmap/Heatmap.tsx';
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

// organisms
export { Modal, type ModalProps } from './organisms/Modal/Modal.tsx';
export { AppShell, type AppShellProps } from './organisms/AppShell/AppShell.tsx';
export { Popover, type PopoverProps } from './organisms/Popover/Popover.tsx';
export {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  type MenuProps,
  type MenuItemProps,
} from './organisms/Menu/Menu.tsx';
export { FloatingPanel, type FloatingPanelProps } from './organisms/FloatingPanel/FloatingPanel.tsx';
export { TabbedPanel, type TabbedPanelProps, type TabbedPanelTab } from './organisms/TabbedPanel/TabbedPanel.tsx';
export { TabbedModal, type TabbedModalProps, type TabbedModalSection } from './organisms/TabbedModal/TabbedModal.tsx';
export { TabStrip, type TabStripProps, type TabStripItem } from './organisms/TabStrip/TabStrip.tsx';
export {
  ResizableSplitPane,
  type ResizableSplitPaneProps,
  type SplitOrientation,
} from './organisms/ResizableSplitPane/ResizableSplitPane.tsx';
export type { Placement } from './internal/useAnchoredPosition.ts';

// i18n — the translation mandate: every user-facing string resolves through a
// message catalog that must cover every locale, so a missing translation is a
// compile error rather than a runtime surprise.
export {
  LocaleProvider,
  useLocale,
  useT,
  locales,
  DEFAULT_LOCALE,
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
