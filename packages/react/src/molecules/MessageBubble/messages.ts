import { defineMessages } from '../../i18n/locale.ts';

/**
 * The transcript's own strings.
 *
 * A delivery status is a glyph on screen, so these words are the entire status
 * for anyone not looking at it — leaving them in English would make the one part
 * of a message that is not user content the one part that is untranslated.
 *
 * Authored here rather than in the kit catalog only because that file is
 * integrated centrally; the entries are shaped to be moved into `kitMessages`
 * verbatim, and `defineMessages` already holds them to every locale.
 */
export const messageMessages = defineMessages({
  messageSending: { en: 'Sending', es: 'Enviando', fr: 'Envoi en cours', de: 'Wird gesendet', ja: '送信中', pt: 'Enviando', zh: '发送中', ar: 'جارٍ الإرسال' },
  messageSent: { en: 'Sent', es: 'Enviado', fr: 'Envoyé', de: 'Gesendet', ja: '送信済み', pt: 'Enviado', zh: '已发送', ar: 'تم الإرسال' },
  messageDelivered: { en: 'Delivered', es: 'Entregado', fr: 'Remis', de: 'Zugestellt', ja: '配信済み', pt: 'Entregue', zh: '已送达', ar: 'تم التسليم' },
  messageRead: { en: 'Read', es: 'Leído', fr: 'Lu', de: 'Gelesen', ja: '既読', pt: 'Lido', zh: '已读', ar: 'تمت القراءة' },
  messageFailed: { en: 'Not delivered', es: 'No entregado', fr: 'Non remis', de: 'Nicht zugestellt', ja: '未配信', pt: 'Não entregue', zh: '未送达', ar: 'لم يتم التسليم' },
  messageEdited: { en: 'Edited', es: 'Editado', fr: 'Modifié', de: 'Bearbeitet', ja: '編集済み', pt: 'Editado', zh: '已编辑', ar: 'تم التعديل' },
});
