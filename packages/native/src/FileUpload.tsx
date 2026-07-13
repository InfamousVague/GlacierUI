/**
 * FileUpload — the native binding of @glacier/react's FileUpload molecule.
 *
 * A dashed dropzone (icon + prompt + hint, with an optional count summary) over
 * a list of accepted files, each a glyph + middle-truncated name + locale-sized
 * byte count + a remove IconButton. Paint and geometry are read from the
 * file-upload spec through the shared resolvers, so the resting visual matches
 * the DOM kit and cannot drift from it.
 *
 * WEB-ONLY, accepted-but-inert here (documented): there is no DOM `input[type=file]`,
 * so the native chooser, drag-and-drop, and form participation do not exist. The
 * dropzone is a Pressable whose browse action is inert — a device document-picker
 * is the follow-up. Because nothing feeds files in, the validation props (`accept`,
 * `maxSize`, `maxFiles`, `multiple`, `onReject`) and the form props (`name`, `id`)
 * are accepted-but-inert; `maxFiles` still renders the count summary. The full
 * prop/export contract is preserved so callers write once. The remove path works:
 * removing a file reports the next list through `onFilesChange`. The web kit's
 * hover/focus/dragging/invalid state paints and the glass backdrop blur are motion
 * or material the device runtime does not run and are dropped to the resting tint.
 */

import { View, Text, Pressable, type ViewProps } from 'react-native';
import { FileText, Upload, X } from '@glacier/icons';
import { fileUploadSpec, fileUploadRejectionReasons } from '@glacier/spec';
import { useControlled } from '@glacier/commons';
import { t } from './tokens.ts';
import { dimensionsFor } from './resolve.ts';
import { Skeleton } from './Skeleton.tsx';
import { IconButton } from './IconButton.tsx';

// Derived from the spec so the reason union cannot drift from the web kit.
export type FileUploadRejectionReason = (typeof fileUploadRejectionReasons)[number];

export interface FileUploadRejection {
  file: File;
  reason: FileUploadRejectionReason;
}

export interface FileUploadProps extends Omit<ViewProps, 'children'> {
  /** Native accept string (`.pdf,image/*`). Accepted-but-inert natively (no picker). */
  accept?: string;
  /** Per-file size cap in bytes. Accepted-but-inert natively (no picker). */
  maxSize?: number;
  /** Total file cap; drives the count summary. Enforcement is inert natively (no picker). */
  maxFiles?: number;
  /** Allows keeping more than one file. Accepted-but-inert natively (no picker). */
  multiple?: boolean;
  disabled?: boolean;
  /** Form field name; accepted-but-inert natively (no DOM input to submit). */
  name?: string;
  /** Controlled selected files. */
  value?: File[];
  /** Uncontrolled initial files. */
  defaultValue?: File[];
  /** Called with the next file list after files are removed. */
  onFilesChange?: (files: File[]) => void;
  /** Called with every refused file and why. Accepted-but-inert natively (no picker). */
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** Primary line override; defaults to the kit string. */
  label?: string;
  /** Supporting line override; defaults to the kit string. */
  hint?: string;
  /** Renders a placeholder with the dropzone geometry. */
  skeleton?: boolean;
  /** Uses the frosted glass material for the dropzone surface (resting tint only). */
  glass?: boolean;
  /** Id for the native input; accepted-but-inert natively. */
  id?: string;
  'aria-label'?: string;
}

// Default lines: there is no LocaleProvider natively, so the English kit strings
// are the literals (callers override through the label / hint props).
const DEFAULT_LABEL = 'Choose files or drag and drop';
const DEFAULT_HINT = 'Files stay on your device until the form is sent';
const FILE_LIST_LABEL = 'Selected files';

// Size-independent metrics read once from the spec: the zone radius / gap /
// border / padding and the file-row radius / gap / padding.
const DIMS = dimensionsFor(fileUploadSpec);

/**
 * A resolved measurement value. `dimensionsFor` hands back token names alongside
 * any raw CSS lengths the spec declares inline; wrap the token names in the
 * custom property and let a raw length — anything starting with a digit or dot —
 * pass through so it never becomes `var(--glacier-space-2)`.
 */
function metric(value: string | undefined, fallback: string): string {
  const v = value ?? fallback;
  return /^[.\d]/.test(v) ? v : t(v);
}

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/** Formats a byte count as a short size, e.g. `1.2 MB` (fixed `en` — no locale natively). */
function formatFileSize(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < SIZE_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat('en', {
    style: 'unit',
    unit: SIZE_UNITS[unit],
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 || value >= 10 ? 0 : 1,
  }).format(value);
}

// The tail kept visible when a long name middle-truncates: enough for an extension.
const NAME_TAIL = 8;

function splitName(name: string): [string, string] {
  if (name.length <= NAME_TAIL * 2) return [name, ''];
  return [name.slice(0, name.length - NAME_TAIL), name.slice(-NAME_TAIL)];
}

export function FileUpload({
  accept: _accept,
  maxSize: _maxSize,
  maxFiles,
  multiple: _multiple = false,
  disabled = false,
  name: _name,
  value,
  defaultValue,
  onFilesChange,
  onReject: _onReject,
  label,
  hint,
  skeleton = false,
  glass = false,
  id: _id,
  'aria-label': ariaLabel,
  style,
  ...rest
}: FileUploadProps) {
  const [files, setFiles] = useControlled<File[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onFilesChange,
  });

  function removeAt(index: number) {
    setFiles(files.filter((_, i) => i !== index));
  }

  if (skeleton) {
    // Same geometry as the resting zone: the web renders a Skeleton at
    // calc(space-10 * 3) tall with the zone radius.
    return (
      <Skeleton width="100%" height={`calc(${t('space-10')} * 3)`} radius={t('radius-lg')} />
    );
  }

  // Resting paint from the CSS/spec: dashed base border and the solid surface,
  // swapped to the glass tint or the sunken/dimmed disabled surface. The
  // hover / focus / dragging / invalid states are web-only and drop to resting.
  const borderColor = glass ? t('glass-border') : t('border');
  const backgroundColor = disabled
    ? t('surface-sunken')
    : glass
      ? t('glass-regular')
      : t('surface');

  const zoneLabel = label ?? DEFAULT_LABEL;
  const zoneHint = hint ?? DEFAULT_HINT;

  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'column',
          rowGap: metric(DIMS.gap, 'space-2'),
        },
        style as never,
      ]}
    >
      {/* The dropzone. On web the whole label opens the native chooser; natively
          the browse action is inert (document-picker follow-up), so this is a
          Pressable whose onPress is a no-op. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ariaLabel ?? zoneLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => {
          // Document-picker follow-up: no native file source yet.
        }}
        style={{
          position: 'relative',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          rowGap: metric(DIMS.gap, 'space-2'),
          paddingVertical: metric(DIMS.paddingBlock, 'space-6'),
          paddingHorizontal: metric(DIMS.paddingInline, 'space-4'),
          borderWidth: metric(DIMS.border, 'hairline'),
          borderStyle: 'dashed',
          borderColor,
          borderRadius: metric(DIMS.radius, 'radius-lg'),
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Decorative upload glyph; color set here so a currentColor SVG inherits it. */}
        <View aria-hidden={true} style={{ color: t('text-subtle') }}>
          <Upload size={20} />
        </View>
        <Text
          style={{
            color: t('text'),
            fontSize: t('font-size-sm'),
            lineHeight: t('leading-sm') as unknown as number,
            fontFamily: t('font-sans'),
            textAlign: 'center',
          }}
        >
          {zoneLabel}
        </Text>
        <Text
          style={{
            color: t('text-muted'),
            fontSize: t('font-size-xs'),
            lineHeight: t('leading-sm') as unknown as number,
            fontFamily: t('font-sans'),
            textAlign: 'center',
          }}
        >
          {zoneHint}
        </Text>
        {maxFiles !== undefined && (
          <Text
            style={{
              color: t('text-subtle'),
              fontSize: t('font-size-xs'),
              lineHeight: t('leading-sm') as unknown as number,
              fontFamily: t('font-sans'),
              textAlign: 'center',
            }}
          >
            {`${files.length} of ${maxFiles} files`}
          </Text>
        )}
      </Pressable>

      {files.length > 0 && (
        <View
          accessibilityLabel={FILE_LIST_LABEL}
          style={{ flexDirection: 'column', rowGap: metric(DIMS.listGap, 'space-1') }}
        >
          {files.map((file, index) => {
            const [head, tail] = splitName(file.name);
            return (
              <View
                key={`${file.name}-${index}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  columnGap: metric(DIMS.rowGap, 'space-2'),
                  paddingVertical: metric(DIMS.rowPaddingBlock, 'space-1'),
                  paddingHorizontal: metric(DIMS.rowPaddingInline, 'space-2'),
                  borderWidth: metric(DIMS.border, 'hairline'),
                  borderStyle: 'solid',
                  borderColor: t('border-subtle'),
                  borderRadius: metric(DIMS.rowRadius, 'radius-md'),
                  backgroundColor: t('surface'),
                }}
              >
                {/* Decorative file glyph; color set here so a currentColor SVG inherits it. */}
                <View aria-hidden={true} style={{ flexShrink: 0, color: t('text-subtle') }}>
                  <FileText size={16} />
                </View>
                {/* Middle truncation: the head ellipsizes, the tail (extension) never shrinks. */}
                <View style={{ flexDirection: 'row', flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      flexShrink: 1,
                      color: t('text'),
                      fontSize: t('font-size-sm'),
                      lineHeight: t('leading-sm') as unknown as number,
                      fontFamily: t('font-sans'),
                    }}
                  >
                    {head}
                  </Text>
                  {tail.length > 0 && (
                    <Text
                      numberOfLines={1}
                      style={{
                        flexShrink: 0,
                        color: t('text'),
                        fontSize: t('font-size-sm'),
                        lineHeight: t('leading-sm') as unknown as number,
                        fontFamily: t('font-sans'),
                      }}
                    >
                      {tail}
                    </Text>
                  )}
                </View>
                <Text
                  style={{
                    flexShrink: 0,
                    color: t('text-muted'),
                    fontSize: t('font-size-xs'),
                    lineHeight: t('leading-sm') as unknown as number,
                    fontFamily: t('font-sans'),
                  }}
                >
                  {formatFileSize(file.size)}
                </Text>
                <IconButton
                  size="sm"
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                  onPress={() => removeAt(index)}
                >
                  <X size={14} />
                </IconButton>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
