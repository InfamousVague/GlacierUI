import {
  draftIsValid,
  eventFromDraft,
  validateDraft,
  type CalendarEvent,
  type CalendarEventDraft,
  type CalendarTone,
} from '@glacier/logic';
import { useState } from 'react';
import { Size, TextTone, Variant } from '@glacier/spec';
import { Modal } from '../Modal/Modal.tsx';
import { Field } from '../../molecules/Field/Field.tsx';
import { Input } from '../../atoms/inputs/Input/Input.tsx';
import { Select } from '../../molecules/Select/Select.tsx';
import { Switch } from '../../atoms/inputs/Selection/Switch.tsx';
import { Button } from '../../atoms/inputs/Button/Button.tsx';
import { Text } from '../../atoms/display/Typography/Text.tsx';
import { useT } from '../../i18n/LocaleProvider.tsx';
import { kitMessages } from '../../i18n/messages.ts';
import styles from './CalendarEventEditor.module.css';

/** The tones an event can carry, in the order the picker offers them. */
const TONES: CalendarTone[] = ['accent', 'success', 'warning', 'danger', 'info', 'neutral'];

export interface CalendarEventEditorProps {
  /** The draft being edited, or null when the editor is closed. */
  draft: CalendarEventDraft | null;
  onDraftChange: (draft: CalendarEventDraft) => void;
  onClose: () => void;
  /** Called with the finished event. The id is the editor's for a new one. */
  onSave: (event: CalendarEvent) => void;
  /** Called with the id when the user deletes. Absent hides the delete control. */
  onDelete?: (id: string) => void;
  /** Mints an id for a new event; the logic layer has no id strategy of its own. */
  newId: () => string;
}

/**
 * The add/edit form for a single event.
 *
 * A Modal rather than an anchored popover: the same editor serves both "edit
 * this chip" and "add on this empty day", and the second has no persistent
 * element to anchor to. One surface for both also means one thing to translate,
 * test, and mirror on native.
 *
 * Validation is per-field and shown only after a save attempt — marking a title
 * as required while the user is still walking toward the field is nagging, not
 * helping.
 */
export function CalendarEventEditor({
  draft,
  onDraftChange,
  onClose,
  onSave,
  onDelete,
  newId,
}: CalendarEventEditorProps) {
  const t = useT();
  const [attempted, setAttempted] = useState(false);

  if (!draft) return null;

  const errors = validateDraft(draft);
  const show = (field: keyof typeof errors) => (attempted ? errors[field] : undefined);
  const editing = draft.id !== undefined;

  const set = (patch: Partial<CalendarEventDraft>) => onDraftChange({ ...draft, ...patch });

  const save = () => {
    setAttempted(true);
    if (!draftIsValid(draft)) return;
    const event = eventFromDraft(draft, newId());
    if (event) {
      onSave(event);
      setAttempted(false);
      onClose();
    }
  };

  const close = () => {
    setAttempted(false);
    onClose();
  };

  const errorText = (code: string | undefined) =>
    code === 'required'
      ? t(kitMessages.calendarFieldRequired)
      : code === 'before-start'
        ? t(kitMessages.calendarEndBeforeStart)
        : code
          ? t(kitMessages.calendarFieldInvalid)
          : undefined;

  return (
    <Modal
      open
      onClose={close}
      // 22rem forces every field into its own line and the footer's three
      // buttons past the edge; 28rem is what lets the pairs above sit side by
      // side, which is what makes this read as a form rather than a column.
      size="md"
      title={editing ? t(kitMessages.calendarEditEvent) : t(kitMessages.calendarAddEvent)}
      footer={
        <>
          {/* Delete sits with the other actions rather than in the corner: it
              is one of the three things this form can do, and hiding it as an
              icon makes it a hunt on the one surface where a mistake costs. */}
          {editing && onDelete && (
            <Button
              variant={Variant.Danger}
              className={styles.deleteAction}
              onClick={() => {
                onDelete(draft.id!);
                close();
              }}
            >
              {t(kitMessages.calendarDeleteEvent)}
            </Button>
          )}
          <Button variant={Variant.Ghost} onClick={close}>
            {t(kitMessages.cancel)}
          </Button>
          <Button onClick={save}>{t(kitMessages.calendarSaveEvent)}</Button>
        </>
      }
    >
      <div className={styles.form}>
        <Field label={t(kitMessages.calendarEventTitle)} error={errorText(show('title'))}>
          <Input
            value={draft.title}
            autoFocus
            onChange={(event) => set({ title: event.target.value })}
            onKeyDown={(event) => {
              // Enter saves from the title field, which is where the caret is
              // for the whole of a quick "add lunch at 1" interaction.
              if (event.key === 'Enter') {
                event.preventDefault();
                save();
              }
            }}
          />
        </Field>

        {/* Date and colour pair off because both are single controls the user
            sets once and leaves; stacking every field would double the height
            of the sheet for no gain in clarity. */}
        <div className={styles.pair}>
          <Field label={t(kitMessages.calendarEventDate)} error={errorText(show('date'))}>
            <Input type="date" value={draft.date} onChange={(event) => set({ date: event.target.value })} />
          </Field>

          <Field label={t(kitMessages.calendarEventTone)}>
            <Select
              fullWidth
              value={draft.tone}
              onValueChange={(tone) => set({ tone: tone as CalendarTone })}
              options={TONES.map((tone) => ({
                value: tone,
                label: t(kitMessages[`calendarTone_${tone}` as 'calendarTone_accent']),
              }))}
            />
          </Field>
        </div>

        <div className={styles.allDay}>
          <Switch
            checked={draft.allDay}
            onCheckedChange={(allDay) => set({ allDay })}
            aria-label={t(kitMessages.calendarAllDay)}
          />
          <Text size={Size.Small}>{t(kitMessages.calendarAllDay)}</Text>
        </div>

        {/* The time fields are removed, not disabled, when the event is all-day:
            a greyed pair of clocks still reads as "times you could set". */}
        {!draft.allDay && (
          <div className={styles.pair}>
            <Field label={t(kitMessages.calendarStartTime)} error={errorText(show('start'))}>
              <Input type="time" value={draft.start} onChange={(event) => set({ start: event.target.value })} />
            </Field>
            <Field label={t(kitMessages.calendarEndTime)} error={errorText(show('end'))}>
              <Input type="time" value={draft.end} onChange={(event) => set({ end: event.target.value })} />
            </Field>
          </div>
        )}

        {/* Said once, quietly, rather than as a per-field warning: info and
            accent resolve to the same colour in this kit, so a user picking
            between them would otherwise think the control was broken. */}
        {draft.tone === 'info' && (
          <Text tone={TextTone.Subtle} size={Size.XSmall}>
            {t(kitMessages.calendarToneInfoNote)}
          </Text>
        )}
      </div>
    </Modal>
  );
}
