/**
 * @glacier/native — the React Native binding of the Glacier kit.
 *
 * Components render View/Text/Pressable/Image, painted and sized from
 * @glacier/spec + @glacier/tokens through the shared @glacier/commons resolvers,
 * so an Expo app matches the DOM kit pixel-for-pixel and cannot drift. On web
 * the docs alias `react-native` to `react-native-web`, so these same components
 * render in the browser for the Web/Native comparison toggle.
 */

// The spec-derived style seam, re-exported so app code can build its own
// spec-driven native components the same way the kit does.
export { paintStyle, sizeFor, dimensionsFor, tv, type NativeStyle } from './resolve.ts';
export { t } from './tokens.ts';

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button.tsx';
export { Icon, type IconProps } from './Icon.tsx';
export { Text, type TextProps, type TextSize, type TextToneName, type TextWeight, type TextAlign } from './Text.tsx';
export { Heading, type HeadingProps, type HeadingLevel, type HeadingAlign } from './Heading.tsx';
export { Pill, type PillProps, type PillVariant, type PillTone, type PillSize } from './Pill.tsx';
export { CounterBadge, type CounterBadgeProps, type CounterBadgeTone, type CounterBadgeSize } from './CounterBadge.tsx';
export { StatusDot, type StatusDotProps, type StatusDotTone, type StatusDotSize } from './StatusDot.tsx';
export { Avatar, type AvatarProps, type AvatarSize, type AvatarShape } from './Avatar.tsx';
export { Divider, type DividerProps, type DividerOrientation } from './Divider.tsx';
export { Switch, type SwitchProps, type SwitchSize } from './Switch.tsx';
export { Checkbox, type CheckboxProps } from './Checkbox.tsx';
export { Skeleton, type SkeletonProps, type SkeletonVariant } from './Skeleton.tsx';
export { ProgressRing, type ProgressRingProps, type ProgressRingTone } from './ProgressRing.tsx';

// Second wave: the remaining atom bindings, generated from spec + web source.
export { Banner, type BannerProps, type BannerTone } from './Banner.tsx';
export { Callout, type CalloutProps, type CalloutTone } from './Callout.tsx';
export { Card, type CardProps, type CardVariant, type Elevation } from './Card.tsx';
export { DeviceFrame, type DeviceFrameProps, type DeviceFrameSize } from './DeviceFrame.tsx';
export { EmptyState, type EmptyStateProps } from './EmptyState.tsx';
export { FilterChip, type FilterChipProps, type FilterChipSize } from './FilterChip.tsx';
export { IconButton, type IconButtonProps, type IconButtonVariant, type IconButtonSize } from './IconButton.tsx';
export { Image, type ImageProps, type ImageFit, type ImageRadius } from './Image.tsx';
export { Kbd, type KbdProps } from './Kbd.tsx';
export { Label, type LabelProps } from './Label.tsx';
export { Link, type LinkProps } from './Link.tsx';
export { Meter, type MeterProps, type MeterTone, type MeterSize } from './Meter.tsx';
export { ProgressBar, type ProgressBarProps, type ProgressBarSize, type ProgressBarTone } from './ProgressBar.tsx';
export { Radio, type RadioProps } from './Radio.tsx';
export { SegmentedBar, type SegmentedBarProps, type SegmentedBarSegment, type SegmentedBarTone, type SegmentedBarSize } from './SegmentedBar.tsx';
export { Spinner, type SpinnerProps, type SpinnerSize, type SpinnerTone } from './Spinner.tsx';
export { StatTile, type StatTileProps } from './StatTile.tsx';
export { Steps, type StepsProps, type StepsTone, type StepsSize, type StepsVariant } from './Steps.tsx';
export { Surface, type SurfaceProps, type SurfaceLevel } from './Surface.tsx';
export { Toggle, type ToggleProps, type ToggleSize } from './Toggle.tsx';
export { Input, type InputProps, type InputSize } from './Input.tsx';
export { Textarea, type TextareaProps, type TextareaSize } from './Textarea.tsx';
export { SearchField, type SearchFieldProps, type SearchFieldSize } from './SearchField.tsx';
export { NumberInput, type NumberInputProps, type NumberInputSize } from './NumberInput.tsx';
export { OtpField, type OtpFieldProps, type OtpFieldType, type OtpFieldSize } from './OtpField.tsx';
export { Slider, type SliderProps, type SliderOrientation } from './Slider.tsx';
export { Rating, type RatingProps, type RatingSize } from './Rating.tsx';
export { RadioCard, type RadioCardProps } from './RadioCard.tsx';
export { Sparkline, type SparklineProps, type SparklineShape, type SparklineTone, type SparklineSize } from './Sparkline.tsx';
export { CodeBlock, type CodeBlockProps } from './CodeBlock.tsx';

// Tier A: layout primitives. Shared layout helper types (SpaceStep, Responsive,
// Align, ...) are re-exported once from Box to avoid duplicate re-exports.
export {
  Box,
  type BoxProps,
  type BoxStyleProps,
  type Responsive,
  type SpaceStep,
  type Background,
  type RadiusToken,
  type BorderToken,
  type ElevationToken,
  type ContainerSize,
  type WidthToken,
  type HeightToken,
  type Align,
} from './Box.tsx';
export { Center, type CenterProps } from './Center.tsx';
export { Container, type ContainerProps } from './Container.tsx';
export { Grid, type GridProps } from './Grid.tsx';
export { Row, type RowProps, type Justify } from './Row.tsx';
export { Spacer, type SpacerProps } from './Spacer.tsx';
export { Stack, type StackProps, type FlowProps } from './Stack.tsx';

// Tier A: composition molecules / organisms / structures.
export { Field, type FieldProps } from './Field.tsx';
export { Fieldset, type FieldsetProps } from './Fieldset.tsx';
export { FormSection, type FormSectionProps } from './FormSection.tsx';
export { Breadcrumbs, type BreadcrumbsProps, type BreadcrumbItem } from './Breadcrumbs.tsx';
export { Pagination, type PaginationProps } from './Pagination.tsx';
export { Accordion, type AccordionProps, type AccordionItem } from './Accordion.tsx';
export { Tabs, type TabsProps, type TabItem, type TabsSpring } from './Tabs.tsx';
export { TabStrip, type TabStripProps, type TabStripItem, type TabStripSpring } from './TabStrip.tsx';
export { TabbedPanel, type TabbedPanelProps, type TabbedPanelTab } from './TabbedPanel.tsx';
export { PageHeader, type PageHeaderProps, type PageHeaderAction } from './PageHeader.tsx';
export { Toolbar, type ToolbarProps } from './Toolbar.tsx';
export { TitleBar, type TitleBarProps } from './TitleBar.tsx';
export { Timeline, type TimelineProps, type TimelineItem, type TimelineTone } from './Timeline.tsx';
export { Wizard, type WizardProps, type WizardStep } from './Wizard.tsx';

// Tier B: scroll containers.
export { ScrollArea, type ScrollAreaProps, type ScrollAreaOrientation } from './ScrollArea.tsx';
export { List, ListItem, type ListProps, type ListItemProps, type ListSize } from './List.tsx';
export { Carousel, type CarouselProps } from './Carousel.tsx';
export { Table, type TableProps, type TableColumn } from './Table.tsx';
export { TreeView, type TreeViewProps, type TreeItem } from './TreeView.tsx';

// Tier C: overlays (centered + anchored).
export { Modal, type ModalProps, type ModalSize } from './Modal.tsx';
export { AlertDialog, type AlertDialogProps, type AlertDialogTone } from './AlertDialog.tsx';
export { Drawer, type DrawerProps, type DrawerSide, type DrawerSize } from './Drawer.tsx';
export { TabbedModal, type TabbedModalProps, type TabbedModalSection } from './TabbedModal.tsx';
export { Tooltip, type TooltipProps, type TooltipPlacement } from './Tooltip.tsx';
export { Popover, type PopoverProps, type Placement } from './Popover.tsx';
export { FloatingPanel, type FloatingPanelProps, type Point } from './FloatingPanel.tsx';
export { Select, type SelectProps, type SelectOption, type SelectSize } from './Select.tsx';
export { Combobox, type ComboboxProps, type ComboboxOption, type ComboboxSize } from './Combobox.tsx';
export { MultiSelect, type MultiSelectProps, type MultiSelectOption, type MultiSelectSize } from './MultiSelect.tsx';
export { Spotlight, type SpotlightProps, type SpotlightPlacement } from './Spotlight.tsx';

// Data + chart components.
export { Heatmap, type HeatmapProps, type HeatmapData, type HeatmapPoint } from './Heatmap.tsx';
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption, type SegmentedControlSize, type SegmentedControlSpring } from './SegmentedControl.tsx';
export { Toast, ToastProvider, useToast, type ToastProps, type ToastOptions, type ToastContextValue, type ToastTone } from './Toast.tsx';
export { DataGrid, type DataGridProps, type DataGridColumn, type DataGridRow, type DataGridRowId, type DataGridSort, type SortDirection } from './DataGrid.tsx';
export { TimeSeriesChart, type TimeSeriesChartProps, type TimeSeriesChartSeries, type ChartSeriesTone, type TimeSeriesChartShape } from './TimeSeriesChart.tsx';
export { TimelineScrubber, type TimelineScrubberProps, type TimelineScrubberMarker, type TimelineScrubberMarkerTone, type TimelineScrubberSize } from './TimelineScrubber.tsx';
export { ResizableSplitPane, type ResizableSplitPaneProps, type SplitOrientation } from './ResizableSplitPane.tsx';
export { FileUpload, type FileUploadProps, type FileUploadRejection, type FileUploadRejectionReason } from './FileUpload.tsx';

// Structures + app chrome.
export { Section, type SectionProps, type SectionGap, type SectionDensity, type SectionHeadingLevel } from './Section.tsx';
export { CardGroup, type CardGroupProps, type CardGroupMode, type CardGroupGap, type CardGroupDensity } from './CardGroup.tsx';
export { Sidebar, SidebarSection, SidebarItem, type SidebarProps, type SidebarSectionProps, type SidebarItemProps, type SidebarSpring } from './Sidebar.tsx';
export { NavBar, NavBarItem, type NavBarProps, type NavBarItemProps, type NavBarOrientation, type NavBarSpring } from './NavBar.tsx';
export { AppShell, type AppShellProps } from './AppShell.tsx';
export { Menu, MenuItem, MenuSeparator, MenuLabel, ContextMenu, MenuSub, type MenuProps, type MenuItemProps, type ContextMenuProps, type MenuSubProps } from './Menu.tsx';

// Date picking: Calendar (a date-fns month grid, no react-day-picker) + DatePicker.
export { Calendar, type CalendarProps, type CalendarMode, type CalendarRange } from './Calendar.tsx';
export { DatePicker, type DatePickerProps, type ControlSize } from './DatePicker.tsx';
