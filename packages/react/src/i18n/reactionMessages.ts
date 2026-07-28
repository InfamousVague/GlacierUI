import { defineMessages } from './locale.ts';

/**
 * The reaction and message-action strings.
 *
 * A separate catalog only until integration: every key here belongs in
 * `kitMessages`, and the handoff carries the exact lines to fold in. It is
 * defined with the same `defineMessages` mandate, so a missing locale is a
 * compile error here exactly as it would be there.
 *
 * The `{emoji}` and `{count}` placeholders are interpolated by the kit's
 * `format`, which is also what `formatReactionLabel` in commons speaks — so the
 * DOM binding can hand a translated template straight to the shared formatter.
 */
export const reactionMessages = defineMessages({
  reactionOne: { en: '{emoji}, 1 reaction', es: '{emoji}, 1 reacción', fr: '{emoji}, 1 réaction', de: '{emoji}, 1 Reaktion', ja: '{emoji}、リアクション 1 件', pt: '{emoji}, 1 reação', zh: '{emoji}，1 个回应', ar: '{emoji}، تفاعل واحد' },
  reactionOther: { en: '{emoji}, {count} reactions', es: '{emoji}, {count} reacciones', fr: '{emoji}, {count} réactions', de: '{emoji}, {count} Reaktionen', ja: '{emoji}、リアクション {count} 件', pt: '{emoji}, {count} reações', zh: '{emoji}，{count} 个回应', ar: '{emoji}، {count} تفاعلات' },
  reactionOneByViewer: { en: '{emoji}, 1 reaction, you reacted', es: '{emoji}, 1 reacción, has reaccionado', fr: '{emoji}, 1 réaction, vous avez réagi', de: '{emoji}, 1 Reaktion, du hast reagiert', ja: '{emoji}、リアクション 1 件、あなたもリアクションしました', pt: '{emoji}, 1 reação, você reagiu', zh: '{emoji}，1 个回应，你已回应', ar: '{emoji}، تفاعل واحد، لقد تفاعلت' },
  reactionOtherByViewer: { en: '{emoji}, {count} reactions, you reacted', es: '{emoji}, {count} reacciones, has reaccionado', fr: '{emoji}, {count} réactions, vous avez réagi', de: '{emoji}, {count} Reaktionen, du hast reagiert', ja: '{emoji}、リアクション {count} 件、あなたもリアクションしました', pt: '{emoji}, {count} reações, você reagiu', zh: '{emoji}，{count} 个回应，你已回应', ar: '{emoji}، {count} تفاعلات، لقد تفاعلت' },
  reactionsLabel: { en: 'Reactions', es: 'Reacciones', fr: 'Réactions', de: 'Reaktionen', ja: 'リアクション', pt: 'Reações', zh: '回应', ar: 'التفاعلات' },
  reactionsOverflow: { en: 'Show {count} more reactions', es: 'Mostrar {count} reacciones más', fr: 'Afficher {count} réactions de plus', de: '{count} weitere Reaktionen anzeigen', ja: '他 {count} 件のリアクションを表示', pt: 'Mostrar mais {count} reações', zh: '显示另外 {count} 个回应', ar: 'عرض {count} تفاعلات أخرى' },
  reactionsOverflowShort: { en: '+{count}', es: '+{count}', fr: '+{count}', de: '+{count}', ja: '+{count}', pt: '+{count}', zh: '+{count}', ar: '+{count}' },
  reactionAdd: { en: 'Add a reaction', es: 'Añadir una reacción', fr: 'Ajouter une réaction', de: 'Reaktion hinzufügen', ja: 'リアクションを追加', pt: 'Adicionar uma reação', zh: '添加回应', ar: 'إضافة تفاعل' },
  reactionPicker: { en: 'Choose a reaction', es: 'Elegir una reacción', fr: 'Choisir une réaction', de: 'Reaktion auswählen', ja: 'リアクションを選択', pt: 'Escolher uma reação', zh: '选择回应', ar: 'اختيار تفاعل' },
  reactionPickerSearch: { en: 'Search emoji', es: 'Buscar emoji', fr: 'Rechercher un emoji', de: 'Emoji suchen', ja: '絵文字を検索', pt: 'Pesquisar emoji', zh: '搜索表情', ar: 'البحث عن رمز تعبيري' },
  reactionPickerFrequent: { en: 'Frequently used', es: 'Usados con frecuencia', fr: 'Fréquemment utilisés', de: 'Häufig verwendet', ja: 'よく使う', pt: 'Usados com frequência', zh: '常用', ar: 'الأكثر استخدامًا' },
  reactionPickerAll: { en: 'All emoji', es: 'Todos los emojis', fr: 'Tous les emojis', de: 'Alle Emojis', ja: 'すべての絵文字', pt: 'Todos os emojis', zh: '全部表情', ar: 'كل الرموز التعبيرية' },
  reactionPickerEmpty: { en: 'No emoji found', es: 'No se encontraron emojis', fr: 'Aucun emoji trouvé', de: 'Keine Emojis gefunden', ja: '絵文字が見つかりません', pt: 'Nenhum emoji encontrado', zh: '未找到表情', ar: 'لم يتم العثور على رموز تعبيرية' },
  messageActions: { en: 'Message actions', es: 'Acciones del mensaje', fr: 'Actions du message', de: 'Nachrichtenaktionen', ja: 'メッセージの操作', pt: 'Ações da mensagem', zh: '消息操作', ar: 'إجراءات الرسالة' },
  messageActionsMore: { en: 'More actions', es: 'Más acciones', fr: 'Plus d’actions', de: 'Weitere Aktionen', ja: 'その他の操作', pt: 'Mais ações', zh: '更多操作', ar: 'المزيد من الإجراءات' },
});
