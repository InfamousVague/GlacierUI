import { defineMessages } from './locale.ts';

/**
 * The kit's own user-facing strings, the ones baked into components (mostly
 * aria-labels on close, dismiss, and stepper controls). Routing them through a
 * catalog means every consuming app inherits real translations instead of
 * hardcoded English, and adding a locale forces translating all of them.
 *
 * These are the exact strings the audit found hardcoded across the kit.
 */
export const kitMessages = defineMessages({
  dismiss: { en: 'Dismiss', es: 'Descartar', fr: 'Ignorer', de: 'Verwerfen', ja: '閉じる', pt: 'Descartar', zh: '关闭', ar: 'إغلاق' },
  close: { en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', ja: '閉じる', pt: 'Fechar', zh: '关闭', ar: 'إغلاق' },
  cancel: { en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen', ja: 'キャンセル', pt: 'Cancelar', zh: '取消', ar: 'إلغاء' },
  closeTour: { en: 'Close tour', es: 'Cerrar el recorrido', fr: 'Fermer la visite', de: 'Tour schließen', ja: 'ツアーを閉じる', pt: 'Fechar tour', zh: '关闭导览', ar: 'إغلاق الجولة' },
  previous: { en: 'Previous', es: 'Anterior', fr: 'Précédent', de: 'Zurück', ja: '前へ', pt: 'Anterior', zh: '上一个', ar: 'السابق' },
  next: { en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', ja: '次へ', pt: 'Próximo', zh: '下一个', ar: 'التالي' },
  clearSearch: { en: 'Clear search', es: 'Borrar búsqueda', fr: 'Effacer la recherche', de: 'Suche löschen', ja: '検索をクリア', pt: 'Limpar pesquisa', zh: '清空搜索', ar: 'مسح البحث' },
  oneTimeCode: { en: 'One-time code', es: 'Código de un solo uso', fr: 'Code à usage unique', de: 'Einmalcode', ja: 'ワンタイムコード', pt: 'Código de uso único', zh: '一次性验证码', ar: 'رمز لمرة واحدة' },
  decrease: { en: 'Decrease', es: 'Disminuir', fr: 'Diminuer', de: 'Verringern', ja: '減らす', pt: 'Diminuir', zh: '减少', ar: 'تقليل' },
  increase: { en: 'Increase', es: 'Aumentar', fr: 'Augmenter', de: 'Erhöhen', ja: '増やす', pt: 'Aumentar', zh: '增加', ar: 'زيادة' },
  openNavigation: { en: 'Open navigation', es: 'Abrir navegación', fr: 'Ouvrir la navigation', de: 'Navigation öffnen', ja: 'ナビゲーションを開く', pt: 'Abrir navegação', zh: '打开导航', ar: 'فتح الملاحة' },
  resizeSidebar: { en: 'Resize sidebar', es: 'Redimensionar la barra lateral', fr: 'Redimensionner la barre latérale', de: 'Seitenleiste anpassen', ja: 'サイドバーのサイズを変更', pt: 'Redimensionar barra lateral', zh: '调整侧边栏大小', ar: 'تغيير حجم الشريط الجانبي' },
  loading: { en: 'Loading', es: 'Cargando', fr: 'Chargement', de: 'Wird geladen', ja: '読み込み中', pt: 'Carregando', zh: '加载中', ar: 'جاري التحميل' },
  noOptions: { en: 'No options', es: 'Sin opciones', fr: 'Aucune option', de: 'Keine Optionen', ja: '選択肢がありません', pt: 'Nenhuma opção', zh: '无选项', ar: 'لا توجد خيارات' },
  copy: { en: 'Copy', es: 'Copiar', fr: 'Copier', de: 'Kopieren', ja: 'コピー', pt: 'Copiar', zh: '复制', ar: 'نسخ' },
  copied: { en: 'Copied', es: 'Copiado', fr: 'Copié', de: 'Kopiert', ja: 'コピーしました', pt: 'Copiado', zh: '已复制', ar: 'تم النسخ' },
  back: { en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück', ja: '戻る', pt: 'Voltar', zh: '返回', ar: 'رجوع' },
  done: { en: 'Done', es: 'Listo', fr: 'Terminé', de: 'Fertig', ja: '完了', pt: 'Concluído', zh: '完成', ar: 'تم' },
  less: { en: 'Less', es: 'Menos', fr: 'Moins', de: 'Weniger', ja: '少なく', pt: 'Menos', zh: '少于', ar: 'أقل' },
  more: { en: 'More', es: 'Más', fr: 'Plus', de: 'Mehr', ja: 'もっと', pt: 'Mais', zh: '更多', ar: 'أكثر' },
  /** Parameterized: t(kitMessages.stepOf, { step, total }). */
  stepOf: { en: 'Step {step} of {total}', es: 'Paso {step} de {total}', fr: 'Étape {step} sur {total}', de: 'Schritt {step} von {total}', ja: 'ステップ {step}/{total}', pt: 'Etapa {step} de {total}', zh: '第 {step} 步，共 {total} 步', ar: 'الخطوة {step} من {total}' },
});

export type KitMessageKey = keyof typeof kitMessages;
