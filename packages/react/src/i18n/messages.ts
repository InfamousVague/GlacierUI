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
  announcements: { en: 'Announcements', es: 'Anuncios', fr: 'Annonces', de: 'Ankündigungen', ja: 'お知らせ', pt: 'Anúncios', zh: '公告', ar: 'الإعلانات' },
  announcementsUpdates: { en: 'Updates', es: 'Novedades', fr: 'Nouveautés', de: 'Neuigkeiten', ja: '更新情報', pt: 'Novidades', zh: '更新', ar: 'التحديثات' },
  announcementsPrevious: { en: 'Previous announcement', es: 'Anuncio anterior', fr: 'Annonce précédente', de: 'Vorherige Ankündigung', ja: '前のお知らせ', pt: 'Anúncio anterior', zh: '上一条公告', ar: 'الإعلان السابق' },
  announcementsNext: { en: 'Next announcement', es: 'Anuncio siguiente', fr: 'Annonce suivante', de: 'Nächste Ankündigung', ja: '次のお知らせ', pt: 'Próximo anúncio', zh: '下一条公告', ar: 'الإعلان التالي' },
  announcementsPause: { en: 'Pause announcements', es: 'Pausar los anuncios', fr: 'Mettre les annonces en pause', de: 'Ankündigungen anhalten', ja: 'お知らせを一時停止', pt: 'Pausar anúncios', zh: '暂停公告', ar: 'إيقاف الإعلانات مؤقتًا' },
  announcementsResume: { en: 'Resume announcements', es: 'Reanudar los anuncios', fr: 'Reprendre les annonces', de: 'Ankündigungen fortsetzen', ja: 'お知らせを再開', pt: 'Retomar anúncios', zh: '继续播放公告', ar: 'استئناف الإعلانات' },
  announcementsPosition: { en: '{current} of {total}', es: '{current} de {total}', fr: '{current} sur {total}', de: '{current} von {total}', ja: '{total} 件中 {current} 件目', pt: '{current} de {total}', zh: '第 {current} 条，共 {total} 条', ar: '{current} من {total}' },
  calendarPrevious: { en: 'Previous period', es: 'Periodo anterior', fr: 'Période précédente', de: 'Vorheriger Zeitraum', ja: '前の期間', pt: 'Período anterior', zh: '上一时段', ar: 'الفترة السابقة' },
  calendarNext: { en: 'Next period', es: 'Periodo siguiente', fr: 'Période suivante', de: 'Nächster Zeitraum', ja: '次の期間', pt: 'Período seguinte', zh: '下一时段', ar: 'الفترة التالية' },
  calendarToday: { en: 'Today', es: 'Hoy', fr: 'Aujourd’hui', de: 'Heute', ja: '今日', pt: 'Hoje', zh: '今天', ar: 'اليوم' },
  calendarViewLabel: { en: 'Calendar view', es: 'Vista del calendario', fr: 'Vue du calendrier', de: 'Kalenderansicht', ja: 'カレンダー表示', pt: 'Vista do calendário', zh: '日历视图', ar: 'عرض التقويم' },
  calendarMonth: { en: 'Month', es: 'Mes', fr: 'Mois', de: 'Monat', ja: '月', pt: 'Mês', zh: '月', ar: 'شهر' },
  calendarWeek: { en: 'Week', es: 'Semana', fr: 'Semaine', de: 'Woche', ja: '週', pt: 'Semana', zh: '周', ar: 'أسبوع' },
  calendarAgenda: { en: 'Agenda', es: 'Agenda', fr: 'Agenda', de: 'Agenda', ja: '予定リスト', pt: 'Agenda', zh: '日程', ar: 'جدول الأعمال' },
  calendarMore: { en: '+{n} more', es: '+{n} más', fr: '+{n} de plus', de: '+{n} weitere', ja: '他 {n} 件', pt: '+{n} mais', zh: '还有 {n} 项', ar: '+{n} أخرى' },
  calendarEmpty: { en: 'Nothing scheduled', es: 'Nada programado', fr: 'Rien de prévu', de: 'Nichts geplant', ja: '予定はありません', pt: 'Nada agendado', zh: '暂无安排', ar: 'لا يوجد شيء مجدول' },
  calendarAddEvent: { en: 'Add event', es: 'Añadir evento', fr: 'Ajouter un événement', de: 'Termin hinzufügen', ja: '予定を追加', pt: 'Adicionar evento', zh: '添加事件', ar: 'إضافة حدث' },
  calendarEditEvent: { en: 'Edit event', es: 'Editar evento', fr: 'Modifier l’événement', de: 'Termin bearbeiten', ja: '予定を編集', pt: 'Editar evento', zh: '编辑事件', ar: 'تعديل الحدث' },
  calendarSaveEvent: { en: 'Save', es: 'Guardar', fr: 'Enregistrer', de: 'Speichern', ja: '保存', pt: 'Guardar', zh: '保存', ar: 'حفظ' },
  calendarDeleteEvent: { en: 'Delete event', es: 'Eliminar evento', fr: 'Supprimer l’événement', de: 'Termin löschen', ja: '予定を削除', pt: 'Eliminar evento', zh: '删除事件', ar: 'حذف الحدث' },
  calendarEventTitle: { en: 'Title', es: 'Título', fr: 'Titre', de: 'Titel', ja: 'タイトル', pt: 'Título', zh: '标题', ar: 'العنوان' },
  calendarEventDate: { en: 'Date', es: 'Fecha', fr: 'Date', de: 'Datum', ja: '日付', pt: 'Data', zh: '日期', ar: 'التاريخ' },
  calendarStartTime: { en: 'Starts', es: 'Empieza', fr: 'Début', de: 'Beginn', ja: '開始', pt: 'Início', zh: '开始', ar: 'يبدأ' },
  calendarEndTime: { en: 'Ends', es: 'Termina', fr: 'Fin', de: 'Ende', ja: '終了', pt: 'Fim', zh: '结束', ar: 'ينتهي' },
  calendarAllDay: { en: 'All day', es: 'Todo el día', fr: 'Toute la journée', de: 'Ganztägig', ja: '終日', pt: 'Todo o dia', zh: '全天', ar: 'طوال اليوم' },
  calendarEventTone: { en: 'Colour', es: 'Color', fr: 'Couleur', de: 'Farbe', ja: '色', pt: 'Cor', zh: '颜色', ar: 'اللون' },
  calendarFieldRequired: { en: 'Required', es: 'Obligatorio', fr: 'Obligatoire', de: 'Erforderlich', ja: '必須', pt: 'Obrigatório', zh: '必填', ar: 'مطلوب' },
  calendarFieldInvalid: { en: 'Not a valid value', es: 'Valor no válido', fr: 'Valeur non valide', de: 'Kein gültiger Wert', ja: '有効な値ではありません', pt: 'Valor inválido', zh: '不是有效值', ar: 'قيمة غير صالحة' },
  calendarEndBeforeStart: { en: 'Ends before it starts', es: 'Termina antes de empezar', fr: 'Se termine avant de commencer', de: 'Endet vor dem Beginn', ja: '開始より前に終了しています', pt: 'Termina antes de começar', zh: '结束早于开始', ar: 'ينتهي قبل أن يبدأ' },
  calendarToneInfoNote: { en: 'Info and accent resolve to the same colour in this theme.', es: 'Info y acento se resuelven al mismo color en este tema.', fr: 'Info et accent donnent la même couleur dans ce thème.', de: 'Info und Akzent ergeben in diesem Theme dieselbe Farbe.', ja: 'このテーマでは info と accent は同じ色になります。', pt: 'Info e acento resolvem para a mesma cor neste tema.', zh: '在此主题下，info 与 accent 解析为相同颜色。', ar: 'يؤول info وaccent إلى اللون نفسه في هذه السمة.' },
  calendarTone_accent: { en: 'Accent', es: 'Acento', fr: 'Accent', de: 'Akzent', ja: 'アクセント', pt: 'Acento', zh: '强调色', ar: 'لون التمييز' },
  calendarTone_success: { en: 'Success', es: 'Éxito', fr: 'Succès', de: 'Erfolg', ja: '成功', pt: 'Sucesso', zh: '成功', ar: 'نجاح' },
  calendarTone_warning: { en: 'Warning', es: 'Advertencia', fr: 'Avertissement', de: 'Warnung', ja: '警告', pt: 'Aviso', zh: '警告', ar: 'تحذير' },
  calendarTone_danger: { en: 'Danger', es: 'Peligro', fr: 'Danger', de: 'Gefahr', ja: '危険', pt: 'Perigo', zh: '危险', ar: 'خطر' },
  calendarTone_info: { en: 'Info', es: 'Información', fr: 'Info', de: 'Info', ja: '情報', pt: 'Informação', zh: '信息', ar: 'معلومات' },
  calendarTone_neutral: { en: 'Neutral', es: 'Neutro', fr: 'Neutre', de: 'Neutral', ja: 'ニュートラル', pt: 'Neutro', zh: '中性', ar: 'محايد' },
  cardFan: { en: 'Card fan', es: 'Abanico de cartas', fr: 'Éventail de cartes', de: 'Kartenfächer', ja: 'カードの扇', pt: 'Leque de cartas', zh: '卡牌扇形', ar: 'مروحة البطاقات' },
  sortableHandle: { en: 'Reorder {item}', es: 'Reordenar {item}', fr: 'Réorganiser {item}', de: '{item} verschieben', ja: '{item} を並べ替え', pt: 'Reordenar {item}', zh: '重新排序 {item}', ar: 'إعادة ترتيب {item}' },
  sortableLifted: { en: '{item} lifted, position {position}. Use the arrow keys to move it.', es: '{item} levantado, posición {position}. Usa las flechas para moverlo.', fr: '{item} soulevé, position {position}. Utilisez les flèches pour le déplacer.', de: '{item} angehoben, Position {position}. Mit den Pfeiltasten bewegen.', ja: '{item} を持ち上げました（{position} 番目）。矢印キーで移動します。', pt: '{item} levantado, posição {position}. Use as setas para o mover.', zh: '已提起 {item}，第 {position} 位。用方向键移动。', ar: 'تم رفع {item}، الموضع {position}. استخدم الأسهم لتحريكه.' },
  sortableMoved: { en: '{item} moved to position {position} of {total}.', es: '{item} movido a la posición {position} de {total}.', fr: '{item} déplacé en position {position} sur {total}.', de: '{item} auf Position {position} von {total} verschoben.', ja: '{item} を {total} 件中 {position} 番目に移動しました。', pt: '{item} movido para a posição {position} de {total}.', zh: '{item} 已移动到第 {position} 位，共 {total} 项。', ar: 'تم نقل {item} إلى الموضع {position} من {total}.' },
  sortableDropped: { en: '{item} dropped at position {position}.', es: '{item} soltado en la posición {position}.', fr: '{item} déposé en position {position}.', de: '{item} an Position {position} abgelegt.', ja: '{item} を {position} 番目に置きました。', pt: '{item} largado na posição {position}.', zh: '{item} 已放置在第 {position} 位。', ar: 'تم إفلات {item} في الموضع {position}.' },
  sortableCancelled: { en: '{item} returned to its original position.', es: '{item} ha vuelto a su posición original.', fr: '{item} est revenu à sa position d’origine.', de: '{item} ist an seine ursprüngliche Position zurückgekehrt.', ja: '{item} を元の位置に戻しました。', pt: '{item} voltou à sua posição original.', zh: '{item} 已回到原位。', ar: 'عاد {item} إلى موضعه الأصلي.' },
  editorToolbar: { en: 'Formatting', es: 'Formato', fr: 'Mise en forme', de: 'Formatierung', ja: '書式', pt: 'Formatação', zh: '格式', ar: 'التنسيق' },
  editorBold: { en: 'Bold', es: 'Negrita', fr: 'Gras', de: 'Fett', ja: '太字', pt: 'Negrito', zh: '加粗', ar: 'عريض' },
  editorItalic: { en: 'Italic', es: 'Cursiva', fr: 'Italique', de: 'Kursiv', ja: '斜体', pt: 'Itálico', zh: '斜体', ar: 'مائل' },
  editorCode: { en: 'Inline code', es: 'Código en línea', fr: 'Code en ligne', de: 'Inline-Code', ja: 'インラインコード', pt: 'Código em linha', zh: '行内代码', ar: 'شيفرة ضمن السطر' },
  editorStrike: { en: 'Strikethrough', es: 'Tachado', fr: 'Barré', de: 'Durchgestrichen', ja: '取り消し線', pt: 'Rasurado', zh: '删除线', ar: 'يتوسطه خط' },
  editorHeading: { en: 'Heading', es: 'Encabezado', fr: 'Titre', de: 'Überschrift', ja: '見出し', pt: 'Cabeçalho', zh: '标题', ar: 'عنوان' },
  editorQuote: { en: 'Quote', es: 'Cita', fr: 'Citation', de: 'Zitat', ja: '引用', pt: 'Citação', zh: '引用', ar: 'اقتباس' },
  editorBullet: { en: 'Bulleted list', es: 'Lista con viñetas', fr: 'Liste à puces', de: 'Aufzählung', ja: '箇条書き', pt: 'Lista com marcas', zh: '项目符号列表', ar: 'قائمة نقطية' },
  editorNumber: { en: 'Numbered list', es: 'Lista numerada', fr: 'Liste numérotée', de: 'Nummerierte Liste', ja: '番号付きリスト', pt: 'Lista numerada', zh: '编号列表', ar: 'قائمة مرقّمة' },
  colorPicker: { en: 'Colour picker', es: 'Selector de color', fr: 'Sélecteur de couleur', de: 'Farbwähler', ja: 'カラーピッカー', pt: 'Seletor de cor', zh: '颜色选择器', ar: 'منتقي الألوان' },
  colorLightness: { en: 'Lightness', es: 'Luminosidad', fr: 'Luminosité', de: 'Helligkeit', ja: '明度', pt: 'Luminosidade', zh: '明度', ar: 'الإضاءة' },
  colorChroma: { en: 'Chroma', es: 'Croma', fr: 'Chroma', de: 'Chroma', ja: '彩度', pt: 'Croma', zh: '彩度', ar: 'التشبّع' },
  colorHue: { en: 'Hue', es: 'Tono', fr: 'Teinte', de: 'Farbton', ja: '色相', pt: 'Matiz', zh: '色相', ar: 'درجة اللون' },
  colorAlpha: { en: 'Opacity', es: 'Opacidad', fr: 'Opacité', de: 'Deckkraft', ja: '不透明度', pt: 'Opacidade', zh: '不透明度', ar: 'العتامة' },
  colorHex: { en: 'Hex value', es: 'Valor hexadecimal', fr: 'Valeur hexadécimale', de: 'Hex-Wert', ja: '16 進値', pt: 'Valor hexadecimal', zh: '十六进制值', ar: 'القيمة السداسية' },
  colorPresets: { en: 'Presets', es: 'Predefinidos', fr: 'Préréglages', de: 'Voreinstellungen', ja: 'プリセット', pt: 'Predefinições', zh: '预设', ar: 'الإعدادات المسبقة' },
  colorOutOfGamut: { en: 'Outside sRGB', es: 'Fuera de sRGB', fr: 'Hors sRGB', de: 'Außerhalb sRGB', ja: 'sRGB 外', pt: 'Fora do sRGB', zh: '超出 sRGB', ar: 'خارج sRGB' },
  commandPaletteLabel: { en: 'Command palette', es: 'Paleta de comandos', fr: 'Palette de commandes', de: 'Befehlspalette', ja: 'コマンドパレット', pt: 'Paleta de comandos', zh: '命令面板', ar: 'لوحة الأوامر' },
  commandPalettePlaceholder: { en: 'Type a command or search…', es: 'Escribe un comando o busca…', fr: 'Tapez une commande ou recherchez…', de: 'Befehl eingeben oder suchen…', ja: 'コマンドを入力または検索…', pt: 'Digite um comando ou pesquise…', zh: '输入命令或搜索…', ar: 'اكتب أمرًا أو ابحث…' },
  commandPaletteEmpty: { en: 'No matching commands', es: 'No hay comandos coincidentes', fr: 'Aucune commande correspondante', de: 'Keine passenden Befehle', ja: '一致するコマンドはありません', pt: 'Nenhum comando correspondente', zh: '没有匹配的命令', ar: 'لا توجد أوامر مطابقة' },
  commandPaletteHint: { en: '↑↓ to navigate · ↵ to run · esc to close', es: '↑↓ para navegar · ↵ para ejecutar · esc para cerrar', fr: '↑↓ pour naviguer · ↵ pour exécuter · échap pour fermer', de: '↑↓ navigieren · ↵ ausführen · esc schließen', ja: '↑↓ 移動 · ↵ 実行 · esc 閉じる', pt: '↑↓ para navegar · ↵ para executar · esc para fechar', zh: '↑↓ 导航 · ↵ 运行 · esc 关闭', ar: '↑↓ للتنقل · ↵ للتنفيذ · esc للإغلاق' },
  clearSearch: { en: 'Clear search', es: 'Borrar búsqueda', fr: 'Effacer la recherche', de: 'Suche löschen', ja: '検索をクリア', pt: 'Limpar pesquisa', zh: '清空搜索', ar: 'مسح البحث' },
  oneTimeCode: { en: 'One-time code', es: 'Código de un solo uso', fr: 'Code à usage unique', de: 'Einmalcode', ja: 'ワンタイムコード', pt: 'Código de uso único', zh: '一次性验证码', ar: 'رمز لمرة واحدة' },
  decrease: { en: 'Decrease', es: 'Disminuir', fr: 'Diminuer', de: 'Verringern', ja: '減らす', pt: 'Diminuir', zh: '减少', ar: 'تقليل' },
  increase: { en: 'Increase', es: 'Aumentar', fr: 'Augmenter', de: 'Erhöhen', ja: '増やす', pt: 'Aumentar', zh: '增加', ar: 'زيادة' },
  openNavigation: { en: 'Open navigation', es: 'Abrir navegación', fr: 'Ouvrir la navigation', de: 'Navigation öffnen', ja: 'ナビゲーションを開く', pt: 'Abrir navegação', zh: '打开导航', ar: 'فتح الملاحة' },
  closeNavigation: { en: 'Close navigation', es: 'Cerrar navegación', fr: 'Fermer la navigation', de: 'Navigation schließen', ja: 'ナビゲーションを閉じる', pt: 'Fechar navegação', zh: '关闭导航', ar: 'إغلاق الملاحة' },
  resizeSidebar: { en: 'Resize sidebar', es: 'Redimensionar la barra lateral', fr: 'Redimensionner la barre latérale', de: 'Seitenleiste anpassen', ja: 'サイドバーのサイズを変更', pt: 'Redimensionar barra lateral', zh: '调整侧边栏大小', ar: 'تغيير حجم الشريط الجانبي' },
  loading: { en: 'Loading', es: 'Cargando', fr: 'Chargement', de: 'Wird geladen', ja: '読み込み中', pt: 'Carregando', zh: '加载中', ar: 'جاري التحميل' },
  noOptions: { en: 'No options', es: 'Sin opciones', fr: 'Aucune option', de: 'Keine Optionen', ja: '選択肢がありません', pt: 'Nenhuma opção', zh: '无选项', ar: 'لا توجد خيارات' },
  copy: { en: 'Copy', es: 'Copiar', fr: 'Copier', de: 'Kopieren', ja: 'コピー', pt: 'Copiar', zh: '复制', ar: 'نسخ' },
  copied: { en: 'Copied', es: 'Copiado', fr: 'Copié', de: 'Kopiert', ja: 'コピーしました', pt: 'Copiado', zh: '已复制', ar: 'تم النسخ' },
  back: { en: 'Back', es: 'Atrás', fr: 'Retour', de: 'Zurück', ja: '戻る', pt: 'Voltar', zh: '返回', ar: 'رجوع' },
  done: { en: 'Done', es: 'Listo', fr: 'Terminé', de: 'Fertig', ja: '完了', pt: 'Concluído', zh: '完成', ar: 'تم' },
  less: { en: 'Less', es: 'Menos', fr: 'Moins', de: 'Weniger', ja: '少なく', pt: 'Menos', zh: '少于', ar: 'أقل' },
  more: { en: 'More', es: 'Más', fr: 'Plus', de: 'Mehr', ja: 'もっと', pt: 'Mais', zh: '更多', ar: 'أكثر' },
  densityExtraCompact: { en: 'Extra Compact', es: 'Extracompacta', fr: 'Très compacte', de: 'Extra kompakt', ja: '超コンパクト', pt: 'Extra compacta', zh: '超紧凑', ar: 'مضغوط للغاية' },
  densityCompact: { en: 'Compact', es: 'Compacta', fr: 'Compacte', de: 'Kompakt', ja: 'コンパクト', pt: 'Compacta', zh: '紧凑', ar: 'مضغوط' },
  densityDefault: { en: 'Default', es: 'Predeterminado', fr: 'Par défaut', de: 'Standard', ja: 'デフォルト', pt: 'Padrão', zh: '默认', ar: 'افتراضي' },
  densityComfortable: { en: 'Comfortable', es: 'Cómoda', fr: 'Confortable', de: 'Komfortabel', ja: 'ゆったり', pt: 'Confortável', zh: '宽松', ar: 'مريح' },
  densityMoreSpace: { en: 'More Space', es: 'Más espacio', fr: 'Plus d’espace', de: 'Mehr Platz', ja: '間隔を広く', pt: 'Mais espaço', zh: '更多间距', ar: 'مساحة أكبر' },
  /** Parameterized: t(kitMessages.stepOf, { step, total }). */
  stepOf: { en: 'Step {step} of {total}', es: 'Paso {step} de {total}', fr: 'Étape {step} sur {total}', de: 'Schritt {step} von {total}', ja: 'ステップ {step}/{total}', pt: 'Etapa {step} de {total}', zh: '第 {step} 步，共 {total} 步', ar: 'الخطوة {step} من {total}' },

  // --- the composer -------------------------------------------------------
  // The bar's own words. The submit hint in particular is not decoration: Enter
  // sends something that cannot be recalled, and the reader least likely to
  // have discovered that by accident is the one who never sees the visible hint.
  messageBarLabel: { en: 'Message', es: 'Mensaje', fr: 'Message', de: 'Nachricht', ja: 'メッセージ', pt: 'Mensagem', zh: '消息', ar: 'رسالة' },
  messageBarPlaceholder: { en: 'Write a message', es: 'Escribe un mensaje', fr: 'Écrivez un message', de: 'Nachricht schreiben', ja: 'メッセージを入力', pt: 'Escreva uma mensagem', zh: '写条消息', ar: 'اكتب رسالة' },
  messageBarSend: { en: 'Send', es: 'Enviar', fr: 'Envoyer', de: 'Senden', ja: '送信', pt: 'Enviar', zh: '发送', ar: 'إرسال' },
  messageBarAttach: { en: 'Add attachment', es: 'Añadir adjunto', fr: 'Ajouter une pièce jointe', de: 'Anhang hinzufügen', ja: '添付を追加', pt: 'Adicionar anexo', zh: '添加附件', ar: 'إضافة مرفق' },
  messageBarAttachments: { en: 'Attachments', es: 'Adjuntos', fr: 'Pièces jointes', de: 'Anhänge', ja: '添付ファイル', pt: 'Anexos', zh: '附件', ar: 'المرفقات' },
  /** Parameterized: t(kitMessages.messageBarRemoveAttachment, { name }). */
  messageBarRemoveAttachment: { en: 'Remove {name}', es: 'Quitar {name}', fr: 'Retirer {name}', de: '{name} entfernen', ja: '{name} を削除', pt: 'Remover {name}', zh: '移除 {name}', ar: 'إزالة {name}' },
  messageBarHintEnter: { en: 'Press Enter to send, Shift plus Enter for a new line', es: 'Pulsa Intro para enviar, Mayús más Intro para una línea nueva', fr: 'Appuyez sur Entrée pour envoyer, Maj plus Entrée pour une nouvelle ligne', de: 'Enter zum Senden, Umschalt plus Enter für eine neue Zeile', ja: 'Enter で送信、Shift と Enter で改行', pt: 'Prima Enter para enviar, Shift mais Enter para uma nova linha', zh: '按 Enter 发送，Shift 加 Enter 换行', ar: 'اضغط Enter للإرسال، وShift مع Enter لسطر جديد' },
  /** Parameterized: t(kitMessages.messageBarHintModifier, { modifier }). */
  messageBarHintModifier: { en: 'Press {modifier} plus Enter to send, Enter for a new line', es: 'Pulsa {modifier} más Intro para enviar, Intro para una línea nueva', fr: 'Appuyez sur {modifier} plus Entrée pour envoyer, Entrée pour une nouvelle ligne', de: '{modifier} plus Enter zum Senden, Enter für eine neue Zeile', ja: '{modifier} と Enter で送信、Enter で改行', pt: 'Prima {modifier} mais Enter para enviar, Enter para uma nova linha', zh: '按 {modifier} 加 Enter 发送，Enter 换行', ar: 'اضغط {modifier} مع Enter للإرسال، وEnter لسطر جديد' },
  /** Parameterized: t(kitMessages.messageBarReplyingTo, { name }). */
  messageBarReplyingTo: { en: 'Replying to {name}', es: 'Respondiendo a {name}', fr: 'En réponse à {name}', de: 'Antwort an {name}', ja: '{name} に返信中', pt: 'A responder a {name}', zh: '正在回复 {name}', ar: 'رد على {name}' },
  messageBarReplying: { en: 'Replying to a message', es: 'Respondiendo a un mensaje', fr: 'En réponse à un message', de: 'Antwort auf eine Nachricht', ja: 'メッセージに返信中', pt: 'A responder a uma mensagem', zh: '正在回复一条消息', ar: 'رد على رسالة' },
  messageBarCancelReply: { en: 'Cancel reply', es: 'Cancelar la respuesta', fr: 'Annuler la réponse', de: 'Antwort verwerfen', ja: '返信をやめる', pt: 'Cancelar a resposta', zh: '取消回复', ar: 'إلغاء الرد' },
  messageBarEditing: { en: 'Editing a message', es: 'Editando un mensaje', fr: 'Modification d’un message', de: 'Nachricht wird bearbeitet', ja: 'メッセージを編集中', pt: 'A editar uma mensagem', zh: '正在编辑一条消息', ar: 'تعديل رسالة' },
  messageBarCancelEdit: { en: 'Cancel editing', es: 'Cancelar la edición', fr: 'Annuler la modification', de: 'Bearbeiten abbrechen', ja: '編集をやめる', pt: 'Cancelar a edição', zh: '取消编辑', ar: 'إلغاء التعديل' },
  /** Parameterized: t(kitMessages.messageBarCount, { count, max }). */
  messageBarCount: { en: '{count} of {max}', es: '{count} de {max}', fr: '{count} sur {max}', de: '{count} von {max}', ja: '{max} 中 {count}', pt: '{count} de {max}', zh: '{count}/{max}', ar: '{count} من {max}' },
  /** Parameterized: t(kitMessages.messageBarRemaining, { remaining }). */
  messageBarRemaining: { en: '{remaining} characters left', es: 'Quedan {remaining} caracteres', fr: 'Il reste {remaining} caractères', de: 'Noch {remaining} Zeichen', ja: '残り {remaining} 文字', pt: 'Faltam {remaining} caracteres', zh: '还剩 {remaining} 个字符', ar: 'بقي {remaining} حرفًا' },
  /** Parameterized: t(kitMessages.messageBarOver, { over }). */
  messageBarOver: { en: '{over} characters over the limit', es: '{over} caracteres por encima del límite', fr: '{over} caractères au-delà de la limite', de: '{over} Zeichen über dem Limit', ja: '制限を {over} 文字超えています', pt: '{over} caracteres acima do limite', zh: '超出限制 {over} 个字符', ar: '{over} حرفًا فوق الحد' },
  // The visible hint's key caps. In the catalog rather than typed into the JSX
  // because a keyboard sold in one market does not always print what one sold in
  // another does, and a hint naming a key the reader cannot find is worse than
  // no hint at all.
  messageBarKeyEnter: { en: 'Enter', es: 'Intro', fr: 'Entrée', de: 'Enter', ja: 'Enter', pt: 'Enter', zh: 'Enter', ar: 'Enter' },
  messageBarKeyShift: { en: 'Shift', es: 'Mayús', fr: 'Maj', de: 'Umschalt', ja: 'Shift', pt: 'Shift', zh: 'Shift', ar: 'Shift' },
  messageBarTypingOne: { en: '{first} is typing', es: '{first} está escribiendo', fr: '{first} est en train d’écrire', de: '{first} schreibt', ja: '{first} が入力中', pt: '{first} está a escrever', zh: '{first} 正在输入', ar: '{first} يكتب الآن' },
  messageBarTypingTwo: { en: '{first} and {last} are typing', es: '{first} y {last} están escribiendo', fr: '{first} et {last} sont en train d’écrire', de: '{first} und {last} schreiben', ja: '{first} と {last} が入力中', pt: '{first} e {last} estão a escrever', zh: '{first} 和 {last} 正在输入', ar: '{first} و{last} يكتبان الآن' },
  messageBarTypingSeveral: { en: '{names} are typing', es: '{names} están escribiendo', fr: '{names} sont en train d’écrire', de: '{names} schreiben', ja: '{names} が入力中', pt: '{names} estão a escrever', zh: '{names} 正在输入', ar: '{names} يكتبون الآن' },
  messageBarTypingMany: { en: '{first} and {count} others are typing', es: '{first} y {count} más están escribiendo', fr: '{first} et {count} autres sont en train d’écrire', de: '{first} und {count} weitere schreiben', ja: '{first} ほか {count} 人が入力中', pt: '{first} e mais {count} estão a escrever', zh: '{first} 和另外 {count} 人正在输入', ar: '{first} و{count} آخرون يكتبون الآن' },

  // --- read history -------------------------------------------------------
  // A tick says a message was opened; these say when, or by whom. The group
  // shapes exist because "read" on a five-person thread is ambiguous, and one
  // rung on the delivery ladder has no way to be less so.
  /** Parameterized: t(kitMessages.messageReadAt, { time }). */
  messageReadAt: { en: 'Read {time}', es: 'Leído a las {time}', fr: 'Lu à {time}', de: 'Gelesen um {time}', ja: '{time} に既読', pt: 'Lido às {time}', zh: '{time} 已读', ar: 'قُرئت في {time}' },
  messageReadByOne: { en: 'Read by {first}', es: 'Leído por {first}', fr: 'Lu par {first}', de: 'Gelesen von {first}', ja: '{first} が既読', pt: 'Lido por {first}', zh: '{first} 已读', ar: 'قرأها {first}' },
  messageReadByTwo: { en: 'Read by {first} and {last}', es: 'Leído por {first} y {last}', fr: 'Lu par {first} et {last}', de: 'Gelesen von {first} und {last}', ja: '{first} と {last} が既読', pt: 'Lido por {first} e {last}', zh: '{first} 和 {last} 已读', ar: 'قرأها {first} و{last}' },
  messageReadBySeveral: { en: 'Read by {names}', es: 'Leído por {names}', fr: 'Lu par {names}', de: 'Gelesen von {names}', ja: '{names} が既読', pt: 'Lido por {names}', zh: '{names} 已读', ar: 'قرأها {names}' },
  messageReadByMany: { en: 'Read by {first} and {count} others', es: 'Leído por {first} y {count} más', fr: 'Lu par {first} et {count} autres', de: 'Gelesen von {first} und {count} weiteren', ja: '{first} ほか {count} 人が既読', pt: 'Lido por {first} e mais {count}', zh: '{first} 和另外 {count} 人已读', ar: 'قرأها {first} و{count} آخرون' },

  // --- transcript separators ----------------------------------------------
  conversationUnread: { en: 'Unread messages', es: 'Mensajes sin leer', fr: 'Messages non lus', de: 'Ungelesene Nachrichten', ja: '未読メッセージ', pt: 'Mensagens não lidas', zh: '未读消息', ar: 'رسائل غير مقروءة' },
  /** Parameterized: t(kitMessages.conversationUnreadCount, { count }). */
  conversationUnreadCount: { en: '{count} unread messages', es: '{count} mensajes sin leer', fr: '{count} messages non lus', de: '{count} ungelesene Nachrichten', ja: '未読 {count} 件', pt: '{count} mensagens não lidas', zh: '{count} 条未读消息', ar: '{count} رسائل غير مقروءة' },
});

export type KitMessageKey = keyof typeof kitMessages;
