import { FileText, Upload, X } from '@glacier/icons';
import { useRef, useState, type ChangeEvent, type ComponentProps, type DragEvent } from 'react';
import { IconButton } from '../../atoms/inputs/Button/IconButton.tsx';
import { Skeleton } from '../../atoms/feedback/Skeleton/Skeleton.tsx';
import { cx } from '../../internal/cx.ts';
import { useField } from '../../internal/FieldContext.ts';
import { useControlled } from '../../internal/useControlled.ts';
import { defineMessages, type Locale } from '../../i18n/locale.ts';
import { useLocale, useT } from '../../i18n/LocaleProvider.tsx';
import styles from './FileUpload.module.css';

/** Why one file was refused: it failed the accept filter, the size cap, or the count cap. */
export type FileUploadRejectionReason = 'type' | 'size' | 'count';

export interface FileUploadRejection {
  file: File;
  reason: FileUploadRejectionReason;
}

const messages = defineMessages({
  label: {
    en: 'Choose files or drag and drop',
    es: 'Elige archivos o arrástralos aquí',
    fr: 'Choisissez des fichiers ou glissez-déposez',
    de: 'Dateien auswählen oder hierher ziehen',
    ja: 'ファイルを選択するかドラッグ＆ドロップ',
    pt: 'Escolha arquivos ou arraste e solte',
    zh: '选择文件或拖放到此处',
    ar: 'اختر ملفات أو اسحبها وأفلتها هنا',
  },
  hint: {
    en: 'Files stay on your device until the form is sent',
    es: 'Los archivos permanecen en tu dispositivo hasta enviar el formulario',
    fr: "Les fichiers restent sur votre appareil jusqu'à l'envoi du formulaire",
    de: 'Dateien bleiben auf dem Gerät, bis das Formular gesendet wird',
    ja: 'ファイルはフォームを送信するまでデバイスに残ります',
    pt: 'Os arquivos ficam no seu dispositivo até o envio do formulário',
    zh: '文件会保留在您的设备上，直到提交表单',
    ar: 'تبقى الملفات على جهازك حتى إرسال النموذج',
  },
  removeFile: {
    en: 'Remove {name}',
    es: 'Quitar {name}',
    fr: 'Retirer {name}',
    de: '{name} entfernen',
    ja: '{name} を削除',
    pt: 'Remover {name}',
    zh: '移除 {name}',
    ar: 'إزالة {name}',
  },
  countSummary: {
    en: '{count} of {max} files',
    es: '{count} de {max} archivos',
    fr: '{count} fichiers sur {max}',
    de: '{count} von {max} Dateien',
    ja: '{count}/{max} 件のファイル',
    pt: '{count} de {max} arquivos',
    zh: '已选 {count}/{max} 个文件',
    ar: '{count} من {max} ملفات',
  },
  fileList: {
    en: 'Selected files',
    es: 'Archivos seleccionados',
    fr: 'Fichiers sélectionnés',
    de: 'Ausgewählte Dateien',
    ja: '選択されたファイル',
    pt: 'Arquivos selecionados',
    zh: '已选择的文件',
    ar: 'الملفات المحددة',
  },
});

export interface FileUploadProps extends Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /** Native accept string (`.pdf,image/*`); also enforced in JS on drop. */
  accept?: string;
  /** Per-file size cap in bytes; larger files are rejected with reason `size`. */
  maxSize?: number;
  /** Total file cap; files past it are rejected with reason `count`. */
  maxFiles?: number;
  /** Allows picking and keeping more than one file. A single-file zone replaces its selection. */
  multiple?: boolean;
  disabled?: boolean;
  /** Submitted with forms through the real file input when set. */
  name?: string;
  /** Controlled selected files. */
  value?: File[];
  /** Uncontrolled initial files. */
  defaultValue?: File[];
  /** Called with the next file list after files are added or removed. */
  onFilesChange?: (files: File[]) => void;
  /** Called with every refused file and why; rejected files never enter the list. */
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** Primary line override; defaults to the localized kit string. */
  label?: string;
  /** Supporting line override; defaults to the localized kit string. */
  hint?: string;
  /** Renders a placeholder with the dropzone geometry. */
  skeleton?: boolean;
  /** Uses the frosted glass material for the dropzone surface. */
  glass?: boolean;
  /** Id for the native file input; falls back to the surrounding Field id. */
  id?: string;
  'aria-label'?: string;
}

/** Does the file pass the accept filter? Mirrors native accept semantics for drops. */
function acceptsFile(file: File, accept: string | undefined): boolean {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter((rule) => rule.length > 0)
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule);
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/** Formats a byte count as a short locale-aware size, e.g. `1.2 MB`. */
function formatFileSize(bytes: number, locale: Locale): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < SIZE_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return new Intl.NumberFormat(locale, {
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

/**
 * A dropzone that chooses, validates, lists, and removes files - and nothing
 * more: it has no transport policy and never uploads anything. A visually
 * hidden native file input inside the zone carries keyboard access, the
 * screen-reader name, and form participation via `name`; drag-and-drop is a
 * progressive enhancement over it. Files failing `accept`, `maxSize`, or
 * `maxFiles` go to `onReject` and never enter the list.
 */
export function FileUpload({
  accept,
  maxSize,
  maxFiles,
  multiple = false,
  disabled = false,
  name,
  value,
  defaultValue,
  onFilesChange,
  onReject,
  label,
  hint,
  skeleton = false,
  glass = false,
  id,
  className,
  'aria-label': ariaLabel,
  ...rest
}: FileUploadProps) {
  const t = useT();
  const locale = useLocale();
  const field = useField();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [files, setFiles] = useControlled(value, defaultValue ?? []);
  const [dragging, setDragging] = useState(false);
  const invalid = field?.invalid ?? false;

  /** Best-effort mirror of the list into the real input so forms submit it. */
  function syncInput(next: File[]) {
    const input = inputRef.current;
    if (!input) return;
    try {
      const transfer = new DataTransfer();
      for (const file of next) transfer.items.add(file);
      input.files = transfer.files;
    } catch {
      // No DataTransfer constructor (older engines, jsdom): drop the stale value.
      input.value = '';
    }
  }

  function updateFiles(next: File[]) {
    setFiles(next);
    onFilesChange?.(next);
    syncInput(next);
  }

  /** The validation contract: type first, then size, then count; one reason per file. */
  function addFiles(incoming: File[]) {
    const rejections: FileUploadRejection[] = [];
    const accepted: File[] = [];
    const capacity = !multiple
      ? 1
      : maxFiles === undefined
        ? Number.POSITIVE_INFINITY
        : Math.max(maxFiles - files.length, 0);
    for (const file of incoming) {
      if (!acceptsFile(file, accept)) rejections.push({ file, reason: 'type' });
      else if (maxSize !== undefined && file.size > maxSize) rejections.push({ file, reason: 'size' });
      else if (accepted.length >= capacity) rejections.push({ file, reason: 'count' });
      else accepted.push(file);
    }
    if (accepted.length > 0) updateFiles(multiple ? [...files, ...accepted] : accepted);
    else syncInput(files);
    if (rejections.length > 0) onReject?.(rejections);
  }

  function removeAt(index: number) {
    updateFiles(files.filter((_, i) => i !== index));
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.currentTarget.files ?? []);
    if (chosen.length > 0) addFiles(chosen);
  }

  function draggingFiles(event: DragEvent): boolean {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }

  function onDragEnter(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    if (disabled) return;
    dragDepth.current += 1;
    if (draggingFiles(event)) setDragging(true);
  }

  function onDragOver(event: DragEvent<HTMLElement>) {
    // Required to make the zone a valid drop target.
    event.preventDefault();
  }

  function onDragLeave() {
    dragDepth.current = Math.max(dragDepth.current - 1, 0);
    if (dragDepth.current === 0) setDragging(false);
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    if (dropped.length > 0) addFiles(dropped);
  }

  if (skeleton) {
    return (
      <Skeleton
        width="100%"
        height="calc(var(--glacier-space-10) * 3)"
        radius="var(--glacier-radius-lg)"
        className={className}
      />
    );
  }

  return (
    <div {...rest} className={cx(styles.root, className)}>
      <label
        className={cx(
          styles.zone,
          glass && styles.glass,
          invalid && styles.invalid,
          disabled && styles.disabled,
        )}
        data-dragging={dragging || undefined}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className={styles.input}
          id={id ?? field?.id}
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-describedby={field?.describedBy}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          onChange={onInputChange}
        />
        <span className={styles.icon} aria-hidden="true">
          <Upload size={20} />
        </span>
        <span className={styles.zoneLabel}>{label ?? t(messages.label)}</span>
        <span className={styles.hint}>{hint ?? t(messages.hint)}</span>
        {maxFiles !== undefined && (
          <span className={styles.count}>
            {t(messages.countSummary, { count: files.length, max: maxFiles })}
          </span>
        )}
      </label>
      {files.length > 0 && (
        <ul className={styles.fileList} aria-label={t(messages.fileList)}>
          {files.map((file, index) => {
            const [head, tail] = splitName(file.name);
            return (
              <li key={`${file.name}-${index}`} className={styles.fileRow}>
                <span className={styles.fileIcon} aria-hidden="true">
                  <FileText size={16} />
                </span>
                <span className={styles.fileName} title={file.name}>
                  <span className={styles.fileNameHead}>{head}</span>
                  {tail.length > 0 && <span className={styles.fileNameTail}>{tail}</span>}
                </span>
                <span className={styles.fileSize}>{formatFileSize(file.size, locale)}</span>
                <IconButton
                  size="sm"
                  disabled={disabled}
                  aria-label={t(messages.removeFile, { name: file.name })}
                  onClick={() => removeAt(index)}
                >
                  <X size={14} />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
