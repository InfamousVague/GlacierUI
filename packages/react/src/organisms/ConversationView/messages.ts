import { defineMessages } from '../../i18n/locale.ts';

/**
 * The thread's own strings — the ones that are not user content.
 *
 * The region's name and the empty state are the only English a transcript would
 * otherwise contain, which makes them the only part of a translated chat app
 * that would still be in English. `defineMessages` holds them to every locale,
 * so a new language cannot ship with a half-translated conversation pane.
 *
 * Authored here rather than in the kit catalog only because that file is
 * integrated centrally; the entries are shaped to be moved into `kitMessages`
 * verbatim, and the handoff lists them.
 */
export const conversationMessages = defineMessages({
  conversationLabel: { en: 'Conversation', es: 'Conversación', fr: 'Conversation', de: 'Unterhaltung', ja: '会話', pt: 'Conversa', zh: '对话', ar: 'محادثة' },
  conversationEmptyTitle: { en: 'No messages yet', es: 'Aún no hay mensajes', fr: 'Aucun message', de: 'Noch keine Nachrichten', ja: 'メッセージはまだありません', pt: 'Ainda não há mensagens', zh: '还没有消息', ar: 'لا توجد رسائل بعد' },
  conversationEmptyBody: { en: 'Messages you send and receive will appear here.', es: 'Los mensajes que envíes y recibas aparecerán aquí.', fr: 'Les messages que vous envoyez et recevez apparaîtront ici.', de: 'Gesendete und empfangene Nachrichten erscheinen hier.', ja: '送受信したメッセージがここに表示されます。', pt: 'As mensagens que você enviar e receber aparecerão aqui.', zh: '你发送和收到的消息会显示在这里。', ar: 'ستظهر هنا الرسائل التي ترسلها وتستقبلها.' },
});
