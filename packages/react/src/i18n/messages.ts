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
  dismiss: { en: 'Dismiss', es: 'Descartar', fr: 'Ignorer', de: 'Verwerfen', ja: '閉じる' },
  close: { en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen', ja: '閉じる' },
  closeTour: { en: 'Close tour', es: 'Cerrar el recorrido', fr: 'Fermer la visite', de: 'Tour schließen', ja: 'ツアーを閉じる' },
  previous: { en: 'Previous', es: 'Anterior', fr: 'Précédent', de: 'Zurück', ja: '前へ' },
  next: { en: 'Next', es: 'Siguiente', fr: 'Suivant', de: 'Weiter', ja: '次へ' },
  clearSearch: { en: 'Clear search', es: 'Borrar búsqueda', fr: 'Effacer la recherche', de: 'Suche löschen', ja: '検索をクリア' },
  decrease: { en: 'Decrease', es: 'Disminuir', fr: 'Diminuer', de: 'Verringern', ja: '減らす' },
  increase: { en: 'Increase', es: 'Aumentar', fr: 'Augmenter', de: 'Erhöhen', ja: '増やす' },
  openNavigation: { en: 'Open navigation', es: 'Abrir navegación', fr: 'Ouvrir la navigation', de: 'Navigation öffnen', ja: 'ナビゲーションを開く' },
  loading: { en: 'Loading', es: 'Cargando', fr: 'Chargement', de: 'Wird geladen', ja: '読み込み中' },
  copy: { en: 'Copy', es: 'Copiar', fr: 'Copier', de: 'Kopieren', ja: 'コピー' },
  copied: { en: 'Copied', es: 'Copiado', fr: 'Copié', de: 'Kopiert', ja: 'コピーしました' },
  back: { en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück', ja: '戻る' },
  done: { en: 'Done', es: 'Listo', fr: 'Terminé', de: 'Fertig', ja: '完了' },
  less: { en: 'Less', es: 'Menos', fr: 'Moins', de: 'Weniger', ja: '少なく' },
  more: { en: 'More', es: 'Más', fr: 'Plus', de: 'Mehr', ja: 'もっと' },
  /** Parameterized: t(kitMessages.stepOf, { step, total }). */
  stepOf: { en: 'Step {step} of {total}', es: 'Paso {step} de {total}', fr: 'Étape {step} sur {total}', de: 'Schritt {step} von {total}', ja: 'ステップ {step}/{total}' },
});

export type KitMessageKey = keyof typeof kitMessages;
