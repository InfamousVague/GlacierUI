import {
  Button,
  Callout,
  Heading,
  Input,
  Kbd,
  Row,
  SegmentedControl,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
  type ComposeContext,
} from '@glacier/react';
import {
  advanceAttachment,
  type ComposeAttachment,
  type MentionCandidate,
} from '@glacier/logic';
import { useEffect, useRef, useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * The compose suite's page strings.
 *
 * Held locally rather than in the docs catalog because the page was written
 * while `apps/docs/src/i18n.ts` was owned by the integration pass; every key is
 * listed in the handoff and can be lifted into `m` verbatim. All eight locales
 * are mandatory either way — `Message` is `Record<Locale, string>`.
 */
const pm = defineMessages({
  cbName: {
    en: 'Compose Bar',
    es: 'Barra de redacción',
    fr: 'Barre de rédaction',
    de: 'Nachrichtenleiste',
    ja: 'コンポーズバー',
    pt: 'Barra de redação',
    zh: '消息编辑栏',
    ar: 'شريط الكتابة',
  },
  cbLede: {
    en: 'The message composer, and the eight parts it is assembled from: the auto-growing input, the four-state send control, the attachment tray and its chips, the reply/edit/forward banner, the mention popup, the character counter, and the voice recorder.',
    es: 'El redactor de mensajes y las ocho piezas con las que se arma: el campo que crece solo, el control de envío de cuatro estados, la bandeja de adjuntos y sus fichas, el banner de respuesta/edición/reenvío, el popup de menciones, el contador de caracteres y el grabador de voz.',
    fr: "La zone de rédaction et les huit pièces qui la composent : le champ qui grandit tout seul, le contrôle d'envoi à quatre états, le bac à pièces jointes et ses puces, la bannière réponse/modification/transfert, la liste de mentions, le compteur de caractères et l'enregistreur vocal.",
    de: 'Der Nachrichten-Editor und die acht Teile, aus denen er besteht: das mitwachsende Eingabefeld, das Sendesteuerelement mit vier Zuständen, die Anhangsleiste und ihre Chips, das Antwort-/Bearbeiten-/Weiterleiten-Banner, das Erwähnungs-Popup, der Zeichenzähler und der Sprachrekorder.',
    ja: 'メッセージ作成欄と、それを構成する 8 つの部品 — 自動で伸びる入力欄、4 状態の送信コントロール、添付トレイとそのチップ、返信/編集/転送のバナー、メンション候補、文字数カウンター、音声レコーダー。',
    pt: 'O editor de mensagens e as oito peças que o compõem: o campo que cresce sozinho, o controlo de envio com quatro estados, o tabuleiro de anexos e as suas fichas, o banner de resposta/edição/encaminhamento, o popup de menções, o contador de caracteres e o gravador de voz.',
    zh: '消息编辑器，以及组成它的八个部件：自动增高的输入框、四种状态的发送控件、附件托盘及其条目、回复/编辑/转发横幅、提及弹出列表、字符计数器和语音录制器。',
    ar: 'محرّر الرسائل والأجزاء الثمانية التي يتكوّن منها: حقل الإدخال المتنامي تلقائيًا، وزر الإرسال بأربع حالات، ودرج المرفقات وبطاقاته، وشريط الرد/التحرير/إعادة التوجيه، وقائمة الإشارات، وعدّاد الأحرف، ومسجّل الصوت.',
  },
  cbAnatomy: {
    en: 'One form region. The context banner and the attachment tray stack above the input row; the attach control leads, and the counter, the recorder and the send control trail. Every part is exported on its own and works outside the bar.',
    es: 'Una región de formulario. El banner de contexto y la bandeja de adjuntos se apilan sobre la fila del campo; el control de adjuntar va delante, y el contador, el grabador y el control de envío van detrás. Cada pieza se exporta por separado y funciona fuera de la barra.',
    fr: "Une région de formulaire. La bannière de contexte et le bac à pièces jointes s'empilent au-dessus de la ligne du champ ; le contrôle de pièce jointe est en tête, le compteur, l'enregistreur et le contrôle d'envoi ferment la marche. Chaque pièce est exportée seule et fonctionne hors de la barre.",
    de: 'Eine Formularregion. Kontext-Banner und Anhangsleiste stapeln sich über der Eingabezeile; das Anhängen führt, Zähler, Rekorder und Senden schließen ab. Jedes Teil wird einzeln exportiert und funktioniert auch ohne die Leiste.',
    ja: '1 つのフォーム領域。コンテキストバナーと添付トレイが入力行の上に積まれ、添付コントロールが先頭、カウンター・レコーダー・送信コントロールが末尾に並びます。各部品は単体でもエクスポートされ、バーの外でも動きます。',
    pt: 'Uma região de formulário. O banner de contexto e o tabuleiro de anexos empilham-se acima da linha do campo; o controlo de anexar vai à frente e o contador, o gravador e o controlo de envio vão atrás. Cada peça é exportada isoladamente e funciona fora da barra.',
    zh: '一个表单区域。上下文横幅与附件托盘堆叠在输入行之上；附件控件在前，计数器、录音器和发送控件在后。每个部件都单独导出，脱离编辑栏也能使用。',
    ar: 'منطقة نموذج واحدة. يعلو شريطُ السياق ودرجُ المرفقات صفَّ الإدخال؛ زر الإرفاق في المقدمة، والعدّاد والمسجّل وزر الإرسال في المؤخرة. كل جزء يُصدَّر بمفرده ويعمل خارج الشريط.',
  },

  cbPartBar: {
    en: '`ComposeBar` — the form region that lays the parts out and owns the send rule.',
    es: '`ComposeBar` — la región de formulario que coloca las piezas y posee la regla de envío.',
    fr: "`ComposeBar` — la région de formulaire qui dispose les pièces et détient la règle d'envoi.",
    de: '`ComposeBar` — die Formularregion, die die Teile anordnet und die Senderegel besitzt.',
    ja: '`ComposeBar` — 部品を配置し、送信ルールを持つフォーム領域。',
    pt: '`ComposeBar` — a região de formulário que dispõe as peças e detém a regra de envio.',
    zh: '`ComposeBar` — 负责排布各部件并掌管发送规则的表单区域。',
    ar: '`ComposeBar` — منطقة النموذج التي ترتّب الأجزاء وتملك قاعدة الإرسال.',
  },
  cbPartInput: {
    en: '`MessageInput` — the auto-growing field. Enter is a policy here, not a constant.',
    es: '`MessageInput` — el campo que crece solo. Aquí Enter es una política, no una constante.',
    fr: "`MessageInput` — le champ qui grandit tout seul. Ici, Entrée est une politique, pas une constante.",
    de: '`MessageInput` — das mitwachsende Feld. Enter ist hier eine Richtlinie, keine Konstante.',
    ja: '`MessageInput` — 自動で伸びる入力欄。ここでの Enter は定数ではなくポリシー。',
    pt: '`MessageInput` — o campo que cresce sozinho. Aqui o Enter é uma política, não uma constante.',
    zh: '`MessageInput` — 自动增高的输入框。这里的 Enter 是一条策略，而不是常量。',
    ar: '`MessageInput` — الحقل المتنامي تلقائيًا. مفتاح Enter هنا سياسة لا ثابت.',
  },
  cbPartSend: {
    en: '`SendButton` — one control in four states; refused, never hidden.',
    es: '`SendButton` — un control en cuatro estados; se rechaza, nunca se oculta.',
    fr: "`SendButton` — un contrôle en quatre états ; refusé, jamais masqué.",
    de: '`SendButton` — ein Steuerelement in vier Zuständen; verweigert, nie versteckt.',
    ja: '`SendButton` — 4 状態を持つ 1 つのコントロール。拒否はしても隠さない。',
    pt: '`SendButton` — um controlo em quatro estados; recusado, nunca escondido.',
    zh: '`SendButton` — 一个控件、四种状态；只拒绝，绝不隐藏。',
    ar: '`SendButton` — زر واحد بأربع حالات؛ يُرفَض ولا يُخفى أبدًا.',
  },
  cbPartTray: {
    en: '`AttachmentTray` — the pending files. Absent, not empty, when there are none.',
    es: '`AttachmentTray` — los archivos pendientes. Ausente, no vacío, cuando no hay ninguno.',
    fr: "`AttachmentTray` — les fichiers en attente. Absent, et non vide, quand il n'y en a aucun.",
    de: '`AttachmentTray` — die anstehenden Dateien. Abwesend, nicht leer, wenn es keine gibt.',
    ja: '`AttachmentTray` — 保留中のファイル。ゼロ件のときは空ではなく「無い」。',
    pt: '`AttachmentTray` — os ficheiros pendentes. Ausente, não vazio, quando não há nenhum.',
    zh: '`AttachmentTray` — 待发送的文件。没有文件时是"不存在"，而不是"空的"。',
    ar: '`AttachmentTray` — الملفات المعلّقة. عند عدم وجود أي ملف يغيب الدرج ولا يظهر فارغًا.',
  },
  cbPartChip: {
    en: '`AttachmentChip` — one file: glyph, name, size, progress, and a single dismiss.',
    es: '`AttachmentChip` — un archivo: glifo, nombre, tamaño, progreso y un único descarte.',
    fr: "`AttachmentChip` — un fichier : glyphe, nom, taille, progression et un seul rejet.",
    de: '`AttachmentChip` — eine Datei: Glyphe, Name, Größe, Fortschritt und ein einziges Verwerfen.',
    ja: '`AttachmentChip` — 1 ファイル分。字形・名前・サイズ・進捗と、取り消し 1 つ。',
    pt: '`AttachmentChip` — um ficheiro: glifo, nome, tamanho, progresso e um único descarte.',
    zh: '`AttachmentChip` — 单个文件：图标、名称、大小、进度，以及唯一的移除按钮。',
    ar: '`AttachmentChip` — ملف واحد: رمز واسم وحجم وتقدّم وزر إزالة واحد.',
  },
  cbPartBanner: {
    en: '`ComposeContextBanner` — one strip, three modes: replying, editing, forwarding.',
    es: '`ComposeContextBanner` — una franja, tres modos: responder, editar, reenviar.',
    fr: '`ComposeContextBanner` — une bande, trois modes : réponse, modification, transfert.',
    de: '`ComposeContextBanner` — ein Streifen, drei Modi: Antworten, Bearbeiten, Weiterleiten.',
    ja: '`ComposeContextBanner` — 1 本の帯に 3 つのモード（返信・編集・転送）。',
    pt: '`ComposeContextBanner` — uma faixa, três modos: responder, editar, encaminhar.',
    zh: '`ComposeContextBanner` — 一条横幅、三种模式：回复、编辑、转发。',
    ar: '`ComposeContextBanner` — شريط واحد بثلاثة أوضاع: الرد والتحرير وإعادة التوجيه.',
  },
  cbPartMention: {
    en: '`MentionAutocomplete` — the `@`, `#` and `/` popup, matched by the command palette’s matcher.',
    es: '`MentionAutocomplete` — el popup de `@`, `#` y `/`, filtrado por el mismo comparador de la paleta de comandos.',
    fr: "`MentionAutocomplete` — la liste `@`, `#` et `/`, filtrée par le comparateur de la palette de commandes.",
    de: '`MentionAutocomplete` — das `@`-, `#`- und `/`-Popup, gefiltert vom Matcher der Befehlspalette.',
    ja: '`MentionAutocomplete` — `@`・`#`・`/` の候補リスト。コマンドパレットと同じマッチャーで絞り込む。',
    pt: '`MentionAutocomplete` — o popup de `@`, `#` e `/`, filtrado pelo comparador da paleta de comandos.',
    zh: '`MentionAutocomplete` — `@`、`#` 与 `/` 的弹出列表，由命令面板的同一套匹配器筛选。',
    ar: '`MentionAutocomplete` — قائمة `@` و`#` و`/`، تُرشَّح بمطابِق لوحة الأوامر نفسه.',
  },
  cbPartCounter: {
    en: '`CharacterCounter` — the countdown that appears near the limit and goes negative past it.',
    es: '`CharacterCounter` — la cuenta atrás que aparece cerca del límite y se vuelve negativa al pasarlo.',
    fr: "`CharacterCounter` — le compte à rebours qui apparaît près de la limite et passe en négatif au-delà.",
    de: '`CharacterCounter` — der Countdown, der nahe am Limit erscheint und darüber negativ wird.',
    ja: '`CharacterCounter` — 上限が近づくと現れ、超えるとマイナスになるカウントダウン。',
    pt: '`CharacterCounter` — a contagem decrescente que aparece perto do limite e fica negativa depois dele.',
    zh: '`CharacterCounter` — 接近上限时出现、超出后转为负数的倒数计数。',
    ar: '`CharacterCounter` — العدّ التنازلي الذي يظهر قرب الحد ويصبح سالبًا بعد تجاوزه.',
  },
  cbPartVoice: {
    en: '`VoiceRecorder` — hold to record. The kit never opens the microphone itself.',
    es: '`VoiceRecorder` — mantén pulsado para grabar. El kit nunca abre el micrófono por su cuenta.',
    fr: "`VoiceRecorder` — maintenez pour enregistrer. Le kit n'ouvre jamais le microphone lui-même.",
    de: '`VoiceRecorder` — zum Aufnehmen gedrückt halten. Das Kit öffnet das Mikrofon nie selbst.',
    ja: '`VoiceRecorder` — 長押しで録音。キット自身がマイクを開くことはない。',
    pt: '`VoiceRecorder` — mantenha pressionado para gravar. O kit nunca abre o microfone por si.',
    zh: '`VoiceRecorder` — 按住录音。组件库自身从不打开麦克风。',
    ar: '`VoiceRecorder` — اضغط مطولاً للتسجيل. لا تفتح المكتبة الميكروفون بنفسها أبدًا.',
  },

  cbExBarTitle: {
    en: 'A working composer',
    es: 'Un redactor que funciona',
    fr: 'Une zone de rédaction qui marche',
    de: 'Ein funktionierender Editor',
    ja: '実際に動く作成欄',
    pt: 'Um editor a funcionar',
    zh: '可以真正使用的编辑栏',
    ar: 'محرّر يعمل فعليًا',
  },
  cbExBarDesc: {
    en: 'Type something and send it. Choose whether the next send lands or fails: the control moves empty → ready → sending → failed, and the failed control is the retry, in the place the finger already is.',
    es: 'Escribe algo y envíalo. Elige si el próximo envío llega o falla: el control pasa de vacío → listo → enviando → fallido, y el control fallido es el reintento, justo donde ya está el dedo.',
    fr: "Écrivez quelque chose et envoyez-le. Choisissez si le prochain envoi aboutit ou échoue : le contrôle passe de vide → prêt → envoi → échec, et le contrôle en échec est la nouvelle tentative, là où le doigt se trouve déjà.",
    de: 'Schreiben Sie etwas und senden Sie es. Wählen Sie, ob der nächste Versand ankommt oder fehlschlägt: Das Steuerelement geht von leer → bereit → sendet → fehlgeschlagen, und das fehlgeschlagene Steuerelement ist der Wiederholversuch, genau dort, wo der Finger schon liegt.',
    ja: '何か入力して送ってみてください。次の送信が成功するか失敗するかを選べます。コントロールは 空 → 準備完了 → 送信中 → 失敗 と動き、失敗したコントロールがそのまま再試行になります（指のある位置のまま）。',
    pt: 'Escreva algo e envie. Escolha se o próximo envio chega ou falha: o controlo passa de vazio → pronto → a enviar → falhado, e o controlo falhado é a nova tentativa, no sítio onde o dedo já está.',
    zh: '输入内容并发送。可以选择下一次发送是成功还是失败：控件依次经过空 → 就绪 → 发送中 → 失败，而失败状态的控件就是重试按钮，位置不变。',
    ar: 'اكتب شيئًا وأرسله. اختر إن كان الإرسال التالي سينجح أم يفشل: ينتقل الزر من فارغ ← جاهز ← يُرسِل ← فشل، والزر الفاشل هو نفسه زر إعادة المحاولة في المكان الذي يوجد فيه الإصبع أصلًا.',
  },
  cbExSendTitle: {
    en: 'The four send states',
    es: 'Los cuatro estados de envío',
    fr: "Les quatre états d'envoi",
    de: 'Die vier Sendezustände',
    ja: '送信の 4 状態',
    pt: 'Os quatro estados de envio',
    zh: '发送控件的四种状态',
    ar: 'حالات الإرسال الأربع',
  },
  cbExSendDesc: {
    en: 'Empty is refused but still focusable, and its name carries the fix — nothing typed, an upload still running, or over the limit. The states never swap controls, so focus survives every move.',
    es: 'Vacío se rechaza pero sigue siendo enfocable, y su nombre lleva la solución: nada escrito, una subida en curso o por encima del límite. Los estados nunca cambian de control, así que el foco sobrevive a cada transición.',
    fr: "Vide est refusé mais reste focalisable, et son nom porte le correctif : rien de saisi, un envoi encore en cours, ou au-delà de la limite. Les états ne changent jamais de contrôle, donc le focus survit à chaque transition.",
    de: 'Leer wird verweigert, bleibt aber fokussierbar, und sein Name trägt die Lösung: nichts geschrieben, ein Upload läuft noch, oder über dem Limit. Die Zustände tauschen nie das Steuerelement, sodass der Fokus jede Bewegung überlebt.',
    ja: '「空」は拒否されますがフォーカスは可能で、名前に対処法が含まれます — 未入力・アップロード中・上限超過。状態が変わってもコントロールは入れ替わらないため、フォーカスは失われません。',
    pt: 'Vazio é recusado mas continua focável, e o seu nome carrega a solução: nada escrito, um envio ainda a decorrer ou acima do limite. Os estados nunca trocam de controlo, por isso o foco sobrevive a cada transição.',
    zh: '"空"状态会被拒绝，但仍可获得焦点，其可访问名称说明了该怎么办——没有输入、上传未完成，或超出字数上限。各状态之间不会替换控件，因此焦点在每次切换中都得以保留。',
    ar: 'الحالة الفارغة مرفوضة لكنها تبقى قابلة للتركيز، ويحمل اسمها الحلّ: لا شيء مكتوب، أو رفع ما زال جاريًا، أو تجاوز للحد. لا تُستبدل الأزرار بين الحالات، فيبقى التركيز سليمًا في كل انتقال.',
  },
  cbExEnterTitle: {
    en: 'The Enter policy',
    es: 'La política de Enter',
    fr: 'La politique de la touche Entrée',
    de: 'Die Enter-Richtlinie',
    ja: 'Enter キーのポリシー',
    pt: 'A política do Enter',
    zh: 'Enter 键策略',
    ar: 'سياسة مفتاح Enter',
  },
  cbExEnterDesc: {
    en: '`auto` resolves against the pointer: Enter sends on a mouse, and writes a newline on a touch screen, where the send button is the only route that cannot be mistyped. Both fields below pin the device fact with `touch`, so a desktop reviewer can try the touch behaviour without a phone.',
    es: '`auto` se resuelve contra el puntero: Enter envía con ratón y escribe un salto de línea en una pantalla táctil, donde el botón de enviar es la única vía que no se pulsa por error. Ambos campos de abajo fijan el dato del dispositivo con `touch`, para probar el comportamiento táctil sin un teléfono.',
    fr: "`auto` se résout selon le pointeur : Entrée envoie à la souris et insère un saut de ligne sur un écran tactile, où le bouton d'envoi est la seule voie impossible à déclencher par erreur. Les deux champs ci-dessous figent le fait matériel avec `touch`, pour essayer le comportement tactile sans téléphone.",
    de: '`auto` löst sich am Zeiger auf: Mit Maus sendet Enter, auf einem Touchscreen schreibt es einen Zeilenumbruch — dort ist der Senden-Knopf der einzige Weg, den man nicht vertippen kann. Beide Felder unten fixieren die Gerätetatsache mit `touch`, damit sich das Touch-Verhalten auch ohne Telefon ausprobieren lässt.',
    ja: '`auto` はポインタで解決されます。マウスなら Enter が送信、タッチ画面なら改行 — タッチでは送信ボタンだけが誤爆しない経路だからです。下の 2 つの欄は `touch` で端末の事実を固定しているので、デスクトップでもタッチ時の挙動を試せます。',
    pt: '`auto` resolve-se pelo ponteiro: com rato o Enter envia, num ecrã tátil escreve uma nova linha — aí o botão de envio é a única via que não se toca por engano. Ambos os campos abaixo fixam o facto do dispositivo com `touch`, para experimentar o comportamento tátil sem telemóvel.',
    zh: '`auto` 会根据指针类型解析：使用鼠标时 Enter 发送，在触摸屏上 Enter 换行——那里发送按钮是唯一不会误触的通道。下面两个输入框用 `touch` 固定了设备事实，因此在桌面端也能体验触摸下的行为。',
    ar: 'تُحسم `auto` وفق المؤشّر: مع الفأرة يُرسِل Enter، وعلى الشاشة اللمسية يكتب سطرًا جديدًا، لأن زر الإرسال هناك هو الطريق الوحيد الذي لا يُضغط بالخطأ. يثبّت الحقلان أدناه حقيقة الجهاز عبر `touch`، فيمكن تجربة سلوك اللمس من سطح المكتب.',
  },
  cbExContextTitle: {
    en: 'Replying, editing, forwarding',
    es: 'Responder, editar, reenviar',
    fr: 'Réponse, modification, transfert',
    de: 'Antworten, Bearbeiten, Weiterleiten',
    ja: '返信・編集・転送',
    pt: 'Responder, editar, encaminhar',
    zh: '回复、编辑、转发',
    ar: 'الرد والتحرير وإعادة التوجيه',
  },
  cbExContextDesc: {
    en: 'One strip, three modes — same height, same anatomy. Only the glyph, the tint and the words change, and the dismiss names what it is about to throw away, because in edit mode that is the rewrite and not just the context.',
    es: 'Una franja, tres modos: misma altura, misma anatomía. Solo cambian el glifo, el tinte y las palabras, y el descarte nombra lo que va a tirar, porque en modo edición eso es la reescritura y no solo el contexto.',
    fr: "Une bande, trois modes — même hauteur, même anatomie. Seuls le glyphe, la teinte et les mots changent, et le rejet nomme ce qu'il va jeter, car en mode modification il s'agit de la réécriture, pas seulement du contexte.",
    de: 'Ein Streifen, drei Modi — gleiche Höhe, gleiche Anatomie. Nur Glyphe, Tönung und Worte ändern sich, und das Verwerfen benennt, was verloren geht: im Bearbeiten-Modus ist das die Überarbeitung, nicht bloß der Kontext.',
    ja: '1 本の帯に 3 モード — 高さも構造も同じ。変わるのは字形・色味・言葉だけで、破棄ボタンは何を捨てるのかを名指しします。編集モードで失われるのは文脈ではなく書き直しそのものだからです。',
    pt: 'Uma faixa, três modos — mesma altura, mesma anatomia. Mudam apenas o glifo, o tom e as palavras, e o descarte nomeia o que vai deitar fora, porque no modo de edição isso é a reescrita e não só o contexto.',
    zh: '一条横幅、三种模式——高度相同、结构相同。变化的只有图标、色调和文案；关闭按钮会说明它将丢弃什么，因为在编辑模式下丢掉的是改写内容，而不只是上下文。',
    ar: 'شريط واحد بثلاثة أوضاع — الارتفاع نفسه والبنية نفسها. لا يتغيّر سوى الرمز واللون والكلمات، وزر الإغلاق يسمّي ما سيُفقد، ففي وضع التحرير المفقود هو إعادة الصياغة لا السياق وحده.',
  },
  cbExAttachTitle: {
    en: 'Attachments mid-upload',
    es: 'Adjuntos a medio subir',
    fr: "Pièces jointes en cours d'envoi",
    de: 'Anhänge mitten im Upload',
    ja: 'アップロード途中の添付',
    pt: 'Anexos a meio do envio',
    zh: '上传中的附件',
    ar: 'مرفقات في منتصف الرفع',
  },
  cbExAttachDesc: {
    en: 'Progress is displayed here, never driven from here. This demo advances each file through `advanceAttachment` exactly as an app would; the second file fails on purpose, so the retry is reachable. Cancel and remove are the same control, because to the user they are the same thought.',
    es: 'El progreso se muestra aquí, nunca se dirige desde aquí. La demo avanza cada archivo con `advanceAttachment` igual que lo haría una app; el segundo archivo falla a propósito para que el reintento sea alcanzable. Cancelar y quitar son el mismo control, porque para el usuario son la misma idea.',
    fr: "La progression est affichée ici, jamais pilotée d'ici. La démo fait avancer chaque fichier via `advanceAttachment` comme le ferait une application ; le deuxième échoue exprès, pour rendre la nouvelle tentative accessible. Annuler et retirer sont le même contrôle, car pour l'utilisateur c'est la même pensée.",
    de: 'Der Fortschritt wird hier angezeigt, nie von hier gesteuert. Die Demo bewegt jede Datei mit `advanceAttachment` genau so, wie es eine App täte; die zweite Datei scheitert absichtlich, damit der Wiederholversuch erreichbar ist. Abbrechen und Entfernen sind dasselbe Steuerelement, weil sie für den Nutzer derselbe Gedanke sind.',
    ja: '進捗は「表示」するだけで、ここから「駆動」はしません。このデモはアプリと同じく `advanceAttachment` で各ファイルを進めます。2 番目はわざと失敗させ、再試行に到達できるようにしています。キャンセルと削除は同じコントロールです — ユーザーにとっては同じ考えだからです。',
    pt: 'O progresso é mostrado aqui, nunca conduzido daqui. A demo avança cada ficheiro com `advanceAttachment` tal como uma aplicação faria; o segundo falha de propósito, para a nova tentativa ficar acessível. Cancelar e remover são o mesmo controlo, porque para o utilizador são a mesma ideia.',
    zh: '进度只在这里显示，绝不由这里驱动。此示例用 `advanceAttachment` 推进每个文件，与真实应用完全一致；第二个文件故意失败，好让重试可被触达。取消与移除是同一个控件，因为对用户来说它们是同一个念头。',
    ar: 'التقدّم يُعرَض هنا ولا يُدار من هنا. يحرّك هذا العرض كل ملف عبر `advanceAttachment` تمامًا كما يفعل التطبيق؛ ويفشل الملف الثاني عمدًا حتى تكون إعادة المحاولة قابلة للوصول. الإلغاء والإزالة زر واحد، لأنهما لدى المستخدم فكرة واحدة.',
  },
  cbExMentionTitle: {
    en: 'Mentions and slash commands',
    es: 'Menciones y comandos con barra',
    fr: 'Mentions et commandes slash',
    de: 'Erwähnungen und Slash-Befehle',
    ja: 'メンションとスラッシュコマンド',
    pt: 'Menções e comandos com barra',
    zh: '提及与斜杠命令',
    ar: 'الإشارات وأوامر الشرطة المائلة',
  },
  cbExMentionDesc: {
    en: 'Type `@` or `#` anywhere after a space, or `/` at the very start — a slash command is the whole message, and `and/or` is not a command. Arrow keys move, Enter or Tab completes, and Escape closes without touching a character of what you typed.',
    es: 'Escribe `@` o `#` en cualquier punto tras un espacio, o `/` justo al principio: un comando con barra es el mensaje entero, y `and/or` no es un comando. Las flechas mueven, Enter o Tab completan y Escape cierra sin tocar ni un carácter de lo escrito.',
    fr: "Tapez `@` ou `#` n'importe où après une espace, ou `/` tout au début — une commande slash est le message entier, et `and/or` n'est pas une commande. Les flèches déplacent, Entrée ou Tab complètent, et Échap ferme sans toucher un seul caractère saisi.",
    de: 'Tippen Sie `@` oder `#` überall nach einem Leerzeichen, oder `/` ganz am Anfang — ein Slash-Befehl ist die ganze Nachricht, und `and/or` ist kein Befehl. Pfeiltasten bewegen, Enter oder Tab vervollständigen, und Escape schließt, ohne ein Zeichen des Getippten anzurühren.',
    ja: '空白の後ならどこでも `@` や `#`、`/` は先頭でのみ — スラッシュコマンドはメッセージ全体であり、`and/or` はコマンドではありません。矢印キーで移動、Enter か Tab で確定、Escape は入力した文字に一切触れずに閉じます。',
    pt: 'Escreva `@` ou `#` em qualquer sítio depois de um espaço, ou `/` mesmo no início — um comando com barra é a mensagem inteira, e `and/or` não é um comando. As setas movem, Enter ou Tab completam, e Escape fecha sem tocar num só carácter do que escreveu.',
    zh: '在空格之后的任意位置输入 `@` 或 `#`，或在最开头输入 `/`——斜杠命令就是整条消息，而 `and/or` 不是命令。方向键移动，Enter 或 Tab 补全，Escape 关闭且不改动你已输入的任何字符。',
    ar: 'اكتب `@` أو `#` في أي موضع بعد مسافة، أو `/` في البداية تمامًا — فأمر الشرطة المائلة هو الرسالة كلها، و`and/or` ليست أمرًا. تتحرّك الأسهم، ويُكمِل Enter أو Tab، ويُغلق Escape دون المساس بأي حرف مما كتبته.',
  },
  cbExPopupTitle: {
    en: 'The popup on its own',
    es: 'El popup por su cuenta',
    fr: 'La liste toute seule',
    de: 'Das Popup für sich',
    ja: '候補リスト単体',
    pt: 'O popup por si só',
    zh: '单独使用的弹出列表',
    ar: 'القائمة بمفردها',
  },
  cbExPopupDesc: {
    en: 'The command palette’s matcher, reused rather than reimplemented: the handle is folded into the searched text, so `bcantrill` finds a row labelled Bryan Cantrill, and prefix hits are lifted above mid-word ones, so `an` offers Ana before Bryan.',
    es: 'El comparador de la paleta de comandos, reutilizado en vez de reimplementado: el alias se pliega en el texto buscado, así `bcantrill` encuentra la fila Bryan Cantrill, y las coincidencias de prefijo se elevan sobre las de mitad de palabra, así `an` ofrece Ana antes que Bryan.',
    fr: "Le comparateur de la palette de commandes, réutilisé plutôt que réécrit : l'identifiant est replié dans le texte cherché, donc `bcantrill` trouve la ligne Bryan Cantrill, et les correspondances en préfixe passent devant celles en milieu de mot, donc `an` propose Ana avant Bryan.",
    de: 'Der Matcher der Befehlspalette, wiederverwendet statt nachgebaut: Das Handle wird in den durchsuchten Text gefaltet, also findet `bcantrill` die Zeile Bryan Cantrill, und Präfixtreffer stehen über Treffern mitten im Wort, also bietet `an` Ana vor Bryan.',
    ja: 'コマンドパレットのマッチャーを作り直さず再利用しています。ハンドルは検索対象テキストに畳み込まれるので `bcantrill` で Bryan Cantrill の行が見つかり、前方一致は語中一致より上に持ち上げられるので `an` では Bryan より先に Ana が出ます。',
    pt: 'O comparador da paleta de comandos, reutilizado em vez de reimplementado: o identificador é dobrado no texto pesquisado, por isso `bcantrill` encontra a linha Bryan Cantrill, e os acertos de prefixo sobem acima dos de meio de palavra, por isso `an` oferece Ana antes de Bryan.',
    zh: '直接复用命令面板的匹配器，而不是另写一套：句柄会被折叠进被搜索的文本，因此 `bcantrill` 能找到标签为 Bryan Cantrill 的行；前缀命中会被提到词中命中之上，因此 `an` 会先给出 Ana 再给出 Bryan。',
    ar: 'مطابِق لوحة الأوامر نفسه، أُعيد استخدامه لا كتابته من جديد: يُطوى المعرّف داخل النص المبحوث فيه، فيجد `bcantrill` صفَّ Bryan Cantrill، وتُرفع مطابقات البداية فوق مطابقات وسط الكلمة، فيقدّم `an` اسم Ana قبل Bryan.',
  },
  cbExCounterTitle: {
    en: 'Near the limit, and past it',
    es: 'Cerca del límite, y pasado',
    fr: 'Près de la limite, et au-delà',
    de: 'Nahe am Limit — und darüber',
    ja: '上限の手前と、その先',
    pt: 'Perto do limite, e além dele',
    zh: '接近上限，以及超出之后',
    ar: 'قرب الحد، وبعد تجاوزه',
  },
  cbExCounterDesc: {
    en: 'It counts DOWN, appears at 80% of the limit, warns in the last tenth, and goes negative past it. Those last two behaviours are why it is not a `Meter`: a meter that renders −3, or that unmounts, is no longer a meter.',
    es: 'Cuenta HACIA ATRÁS, aparece al 80% del límite, avisa en la última décima y se vuelve negativo al pasarlo. Esos dos últimos comportamientos son la razón de que no sea un `Meter`: un medidor que muestra −3, o que se desmonta, ya no es un medidor.',
    fr: "Il décompte, apparaît à 80 % de la limite, alerte dans le dernier dixième et passe en négatif au-delà. Ces deux derniers comportements expliquent pourquoi ce n'est pas un `Meter` : une jauge qui affiche −3, ou qui disparaît, n'est plus une jauge.",
    de: 'Er zählt ABWÄRTS, erscheint bei 80 % des Limits, warnt im letzten Zehntel und wird darüber negativ. Diese beiden letzten Verhalten sind der Grund, warum es kein `Meter` ist: Eine Anzeige, die −3 zeigt oder verschwindet, ist keine Anzeige mehr.',
    ja: 'カウントは「減っていき」、上限の 80% で現れ、残り 1 割で警告し、超えるとマイナスになります。この最後の 2 つが `Meter` ではない理由です — −3 を表示したり、消えたりするメーターはもうメーターではありません。',
    pt: 'Conta para BAIXO, aparece aos 80% do limite, avisa no último décimo e fica negativo depois dele. Estes dois últimos comportamentos são a razão de não ser um `Meter`: um medidor que mostra −3, ou que desaparece, já não é um medidor.',
    zh: '它是倒着数的：在上限的 80% 处出现，在最后十分之一处告警，超出后转为负数。最后这两点正是它不是 `Meter` 的原因——会显示 −3、或者会卸载的仪表，就不再是仪表了。',
    ar: 'يعدّ تنازليًا، ويظهر عند 80% من الحد، وينبّه في العُشر الأخير، ويصبح سالبًا بعد تجاوزه. هذان السلوكان الأخيران هما سبب عدم كونه `Meter`: فمقياس يعرض −3 أو يختفي لم يعد مقياسًا.',
  },
  cbExVoiceTitle: {
    en: 'Voice recorder',
    es: 'Grabador de voz',
    fr: 'Enregistreur vocal',
    de: 'Sprachrekorder',
    ja: '音声レコーダー',
    pt: 'Gravador de voz',
    zh: '语音录制器',
    ar: 'مسجّل الصوت',
  },
  cbExVoiceDesc: {
    en: 'The resting state, and a real take with no microphone behind it. Hold the mic and slide toward the inline start to throw the take away; release anywhere else to keep it.',
    es: 'El estado en reposo y una toma real sin micrófono detrás. Mantén pulsado el micro y desliza hacia el inicio de línea para descartar la toma; suelta en cualquier otro sitio para conservarla.',
    fr: "L'état au repos, et une vraie prise sans micro derrière. Maintenez le micro et glissez vers le début de ligne pour jeter la prise ; relâchez ailleurs pour la garder.",
    de: 'Der Ruhezustand — und eine echte Aufnahme ohne Mikrofon dahinter. Halten Sie das Mikro und schieben Sie Richtung Zeilenanfang, um die Aufnahme zu verwerfen; loslassen an jeder anderen Stelle behält sie.',
    ja: '待機状態と、マイクの無い実際のテイク。マイクを長押しして行頭方向へスライドするとテイクを破棄、それ以外の場所で離すと保持します。',
    pt: 'O estado em repouso e uma gravação real sem microfone por trás. Mantenha o micro pressionado e deslize para o início da linha para deitar fora a gravação; solte noutro sítio para a manter.',
    zh: '静止状态，以及一次没有麦克风支撑的真实录制。按住麦克风并向行首方向滑动可丢弃这段录制；在其他位置松开则保留。',
    ar: 'حالة السكون، وتسجيلة حقيقية بلا ميكروفون خلفها. اضغط مطولاً على الميكروفون واسحب نحو بداية السطر لتتخلّص من التسجيلة؛ وأفلت في أي مكان آخر لتحتفظ بها.',
  },
  cbExDensityTitle: {
    en: 'Density',
    es: 'Densidad',
    fr: 'Densité',
    de: 'Dichte',
    ja: '密度',
    pt: 'Densidade',
    zh: '密度',
    ar: 'الكثافة',
  },
  cbExDensityDesc: {
    en: 'The same three words the player card uses, resolved once in `composeMetrics` — so a compact composer above a compact player is compact by the same amount, not by a similar one.',
    es: 'Las mismas tres palabras que usa la tarjeta de reproducción, resueltas una vez en `composeMetrics`: así un redactor compacto sobre un reproductor compacto es compacto en la misma medida, no en una parecida.',
    fr: "Les trois mêmes mots que la carte lecteur, résolus une seule fois dans `composeMetrics` — ainsi une zone de rédaction compacte au-dessus d'un lecteur compact l'est de la même quantité, pas d'une quantité voisine.",
    de: 'Dieselben drei Wörter wie bei der Player-Karte, einmal in `composeMetrics` aufgelöst — so ist ein kompakter Editor über einem kompakten Player um denselben Betrag kompakt, nicht um einen ähnlichen.',
    ja: 'プレイヤーカードと同じ 3 語を `composeMetrics` で一度だけ解決します。compact な作成欄と compact なプレイヤーは「似た程度」ではなく「同じ程度」に詰まります。',
    pt: 'As mesmas três palavras que o cartão de reprodução usa, resolvidas uma vez em `composeMetrics` — assim um editor compacto sobre um leitor compacto é compacto na mesma medida, não numa parecida.',
    zh: '与播放器卡片使用的是同样三个词，在 `composeMetrics` 中统一解析——因此紧凑的编辑栏叠在紧凑的播放器之上时，两者的紧凑程度完全一致，而不只是相近。',
    ar: 'الكلمات الثلاث نفسها التي تستخدمها بطاقة المشغّل، تُحسم مرة واحدة في `composeMetrics` — فيكون المحرّر المضغوط فوق مشغّل مضغوط مضغوطًا بالقدر نفسه لا بقدر مشابه.',
  },
  cbExSkeletonDesc: {
    en: 'The bar’s own geometry, with every part replaced by a placeholder. The banner and the tray still decide whether they exist at all; a skeleton does not invent an attachment that was never there.',
    es: 'La geometría de la propia barra, con cada pieza sustituida por un marcador. El banner y la bandeja siguen decidiendo si existen; un esqueleto no inventa un adjunto que nunca estuvo.',
    fr: "La géométrie de la barre elle-même, chaque pièce remplacée par un substitut. La bannière et le bac décident toujours de leur existence ; un squelette n'invente pas une pièce jointe qui n'a jamais été là.",
    de: 'Die Geometrie der Leiste selbst, jedes Teil durch einen Platzhalter ersetzt. Banner und Leiste entscheiden weiterhin, ob sie überhaupt existieren; ein Skelett erfindet keinen Anhang, den es nie gab.',
    ja: 'バーそのもののジオメトリを保ったまま、各部品をプレースホルダーに置き換えます。バナーとトレイは「存在するかどうか」を依然として自分で決めます — スケルトンが無い添付を捏造することはありません。',
    pt: 'A geometria da própria barra, com cada peça substituída por um marcador. O banner e o tabuleiro continuam a decidir se existem; um esqueleto não inventa um anexo que nunca esteve lá.',
    zh: '保留编辑栏自身的几何结构，把每个部件换成占位块。横幅与托盘依然自行决定是否存在；骨架不会凭空造出一个本来没有的附件。',
    ar: 'هندسة الشريط نفسها، مع استبدال كل جزء بعنصر نائب. يبقى الشريط والدرج هما من يقرّر وجودهما أصلًا؛ فالهيكل العظمي لا يخترع مرفقًا لم يكن موجودًا.',
  },

  cbOutcomeLabel: {
    en: 'Next send',
    es: 'Próximo envío',
    fr: 'Prochain envoi',
    de: 'Nächster Versand',
    ja: '次の送信',
    pt: 'Próximo envio',
    zh: '下一次发送',
    ar: 'الإرسال التالي',
  },
  cbOutcomeDeliver: {
    en: 'lands',
    es: 'llega',
    fr: 'aboutit',
    de: 'kommt an',
    ja: '成功',
    pt: 'chega',
    zh: '成功',
    ar: 'ينجح',
  },
  cbOutcomeFail: {
    en: 'fails',
    es: 'falla',
    fr: 'échoue',
    de: 'schlägt fehl',
    ja: '失敗',
    pt: 'falha',
    zh: '失败',
    ar: 'يفشل',
  },
  cbAddFile: {
    en: 'Add a file',
    es: 'Añadir un archivo',
    fr: 'Ajouter un fichier',
    de: 'Datei hinzufügen',
    ja: 'ファイルを追加',
    pt: 'Adicionar um ficheiro',
    zh: '添加文件',
    ar: 'إضافة ملف',
  },
  cbAddContext: {
    en: 'Reply to a message',
    es: 'Responder a un mensaje',
    fr: 'Répondre à un message',
    de: 'Auf eine Nachricht antworten',
    ja: 'メッセージに返信',
    pt: 'Responder a uma mensagem',
    zh: '回复一条消息',
    ar: 'الرد على رسالة',
  },
  cbSentLog: {
    en: 'Sent: {text}',
    es: 'Enviado: {text}',
    fr: 'Envoyé : {text}',
    de: 'Gesendet: {text}',
    ja: '送信済み: {text}',
    pt: 'Enviado: {text}',
    zh: '已发送：{text}',
    ar: 'أُرسِل: {text}',
  },
  cbVoiceLog: {
    en: 'Voice take kept: {seconds}s',
    es: 'Toma de voz guardada: {seconds}s',
    fr: 'Prise vocale conservée : {seconds}s',
    de: 'Sprachaufnahme behalten: {seconds}s',
    ja: '音声テイクを保持: {seconds}秒',
    pt: 'Gravação de voz guardada: {seconds}s',
    zh: '已保留语音片段：{seconds} 秒',
    ar: 'تم الاحتفاظ بالتسجيلة: {seconds}ث',
  },
  cbStateNothing: {
    en: 'empty · nothing typed',
    es: 'vacío · nada escrito',
    fr: 'vide · rien de saisi',
    de: 'leer · nichts geschrieben',
    ja: '空 · 未入力',
    pt: 'vazio · nada escrito',
    zh: '空 · 未输入内容',
    ar: 'فارغ · لا شيء مكتوب',
  },
  cbStateUploading: {
    en: 'empty · an upload is still running',
    es: 'vacío · hay una subida en curso',
    fr: 'vide · un envoi est encore en cours',
    de: 'leer · ein Upload läuft noch',
    ja: '空 · アップロード進行中',
    pt: 'vazio · há um envio a decorrer',
    zh: '空 · 仍有上传进行中',
    ar: 'فارغ · ما زال هناك رفع جارٍ',
  },
  cbStateOverLimit: {
    en: 'empty · over the character limit',
    es: 'vacío · por encima del límite de caracteres',
    fr: 'vide · au-delà de la limite de caractères',
    de: 'leer · über dem Zeichenlimit',
    ja: '空 · 文字数上限を超過',
    pt: 'vazio · acima do limite de caracteres',
    zh: '空 · 超出字符上限',
    ar: 'فارغ · تجاوز حد الأحرف',
  },
  cbStateReady: {
    en: 'ready',
    es: 'listo',
    fr: 'prêt',
    de: 'bereit',
    ja: '準備完了',
    pt: 'pronto',
    zh: '就绪',
    ar: 'جاهز',
  },
  cbStateSending: {
    en: 'sending',
    es: 'enviando',
    fr: 'envoi en cours',
    de: 'sendet',
    ja: '送信中',
    pt: 'a enviar',
    zh: '发送中',
    ar: 'يُرسِل',
  },
  cbStateFailed: {
    en: 'failed · press to retry',
    es: 'fallido · pulsa para reintentar',
    fr: 'échec · appuyez pour réessayer',
    de: 'fehlgeschlagen · zum Wiederholen drücken',
    ja: '失敗 · 押して再試行',
    pt: 'falhado · prima para tentar de novo',
    zh: '失败 · 按下重试',
    ar: 'فشل · اضغط لإعادة المحاولة',
  },
  cbEnterFine: {
    en: 'Fine pointer — Enter sends',
    es: 'Puntero fino — Enter envía',
    fr: 'Pointeur fin — Entrée envoie',
    de: 'Feiner Zeiger — Enter sendet',
    ja: '精密ポインタ — Enter で送信',
    pt: 'Ponteiro fino — Enter envia',
    zh: '精确指针 — Enter 发送',
    ar: 'مؤشّر دقيق — Enter يُرسِل',
  },
  cbEnterCoarse: {
    en: 'Coarse pointer — Enter writes a newline',
    es: 'Puntero grueso — Enter escribe un salto de línea',
    fr: 'Pointeur grossier — Entrée insère un saut de ligne',
    de: 'Grober Zeiger — Enter schreibt einen Zeilenumbruch',
    ja: '粗いポインタ — Enter で改行',
    pt: 'Ponteiro grosso — Enter escreve uma nova linha',
    zh: '粗略指针 — Enter 换行',
    ar: 'مؤشّر خشن — Enter يكتب سطرًا جديدًا',
  },
  cbEnterSent: {
    en: 'Sent {count}×',
    es: 'Enviado {count}×',
    fr: 'Envoyé {count}×',
    de: '{count}× gesendet',
    ja: '{count} 回送信',
    pt: 'Enviado {count}×',
    zh: '已发送 {count} 次',
    ar: 'أُرسِل {count}×',
  },
  cbEnterAlways: {
    en: 'Shift+Enter is always a newline and Cmd/Ctrl+Enter always sends, under either policy — a user who learned one on a laptop should not find it dead on a phone. An open IME composition owns the key outright, so a Japanese candidate is never sent half-written.',
    es: 'Shift+Enter siempre es un salto de línea y Cmd/Ctrl+Enter siempre envía, con cualquier política: quien lo aprendió en un portátil no debe encontrarlo muerto en el móvil. Una composición IME abierta se queda con la tecla, así que un candidato japonés nunca se envía a medias.',
    fr: "Maj+Entrée est toujours un saut de ligne et Cmd/Ctrl+Entrée envoie toujours, quelle que soit la politique — qui l'a appris sur un portable ne doit pas le trouver mort sur un téléphone. Une composition IME ouverte s'approprie la touche, donc un candidat japonais n'est jamais envoyé à moitié écrit.",
    de: 'Umschalt+Enter ist immer ein Zeilenumbruch und Cmd/Strg+Enter sendet immer, unter jeder Richtlinie — wer es am Laptop gelernt hat, soll es am Telefon nicht tot vorfinden. Eine offene IME-Komposition beansprucht die Taste ganz, sodass ein japanischer Kandidat nie halbfertig gesendet wird.',
    ja: 'どちらのポリシーでも Shift+Enter は常に改行、Cmd/Ctrl+Enter は常に送信です — ノート PC で覚えた操作がスマホで死んでいてはいけません。IME の変換中はキーを完全に IME が握るので、日本語の候補が書きかけで送信されることはありません。',
    pt: 'Shift+Enter é sempre uma nova linha e Cmd/Ctrl+Enter envia sempre, com qualquer política — quem aprendeu num portátil não deve encontrá-lo morto no telemóvel. Uma composição IME aberta fica com a tecla, por isso um candidato japonês nunca é enviado a meio.',
    zh: '无论采用哪种策略，Shift+Enter 始终换行，Cmd/Ctrl+Enter 始终发送——在笔记本上学会的操作，不该到手机上就失效。输入法处于组字状态时会完全接管该键，因此日文候选词永远不会被半途发送。',
    ar: 'تحت أي سياسة، يظل Shift+Enter سطرًا جديدًا ويظل Cmd/Ctrl+Enter إرسالًا — فمن تعلّمها على الحاسوب لا ينبغي أن يجدها معطّلة على الهاتف. وحين يكون محرّر الإدخال (IME) في وضع التركيب يستحوذ على المفتاح كليًا، فلا يُرسَل مرشّح ياباني نصف مكتوب.',
  },
  cbContextReset: {
    en: 'Bring all three back',
    es: 'Traer los tres de vuelta',
    fr: 'Rétablir les trois',
    de: 'Alle drei zurückholen',
    ja: '3 つとも戻す',
    pt: 'Trazer os três de volta',
    zh: '把三条都恢复',
    ar: 'استعادة الثلاثة',
  },
  cbReplyPreview: {
    en: 'the deploy went out at four, everything is green',
    es: 'el despliegue salió a las cuatro, todo está en verde',
    fr: 'le déploiement est parti à quatre heures, tout est au vert',
    de: 'das Deployment ging um vier raus, alles grün',
    ja: 'デプロイは 4 時に出ました、すべて正常です',
    pt: 'o deploy saiu às quatro, está tudo verde',
    zh: '部署在四点发布了，一切正常',
    ar: 'خرج النشر عند الرابعة، وكل شيء أخضر',
  },
  cbEditPreview: {
    en: 'shipping the fix now, sorry for the noise',
    es: 'lanzando el arreglo ahora, perdón por el ruido',
    fr: "je livre le correctif maintenant, désolé pour le bruit",
    de: 'schicke den Fix jetzt raus, sorry für den Lärm',
    ja: '修正を今から出します、お騒がせしました',
    pt: 'a lançar a correção agora, desculpem o ruído',
    zh: '现在就发布修复，抱歉刷屏了',
    ar: 'أطلق الإصلاح الآن، آسف على الإزعاج',
  },
  cbForwardPreview: {
    en: 'the incident write-up and its two follow-ups',
    es: 'el informe del incidente y sus dos seguimientos',
    fr: "le compte rendu de l'incident et ses deux suivis",
    de: 'der Incident-Bericht und seine zwei Nachträge',
    ja: 'インシデントの報告と、その 2 件のフォローアップ',
    pt: 'o relatório do incidente e os seus dois seguimentos',
    zh: '故障复盘记录及其两条后续',
    ar: 'تقرير الحادثة ومتابعتاه',
  },
  cbUploadError: {
    en: 'Upload failed',
    es: 'Error al subir',
    fr: "Échec de l'envoi",
    de: 'Upload fehlgeschlagen',
    ja: 'アップロードに失敗',
    pt: 'Falha no envio',
    zh: '上传失败',
    ar: 'فشل الرفع',
  },
  cbTrayReset: {
    en: 'Start the uploads over',
    es: 'Empezar las subidas de nuevo',
    fr: 'Recommencer les envois',
    de: 'Uploads neu starten',
    ja: 'アップロードをやり直す',
    pt: 'Recomeçar os envios',
    zh: '重新开始上传',
    ar: 'إعادة بدء الرفع',
  },
  cbGroupPeople: {
    en: 'People',
    es: 'Personas',
    fr: 'Personnes',
    de: 'Personen',
    ja: 'ユーザー',
    pt: 'Pessoas',
    zh: '成员',
    ar: 'أشخاص',
  },
  cbGroupChannels: {
    en: 'Channels',
    es: 'Canales',
    fr: 'Canaux',
    de: 'Kanäle',
    ja: 'チャンネル',
    pt: 'Canais',
    zh: '频道',
    ar: 'قنوات',
  },
  cbGroupCommands: {
    en: 'Commands',
    es: 'Comandos',
    fr: 'Commandes',
    de: 'Befehle',
    ja: 'コマンド',
    pt: 'Comandos',
    zh: '命令',
    ar: 'أوامر',
  },
  cbQueryLabel: {
    en: 'Text after the trigger',
    es: 'Texto tras el disparador',
    fr: 'Texte après le déclencheur',
    de: 'Text nach dem Auslöser',
    ja: 'トリガー文字の後のテキスト',
    pt: 'Texto após o disparador',
    zh: '触发符之后的文本',
    ar: 'النص بعد حرف التشغيل',
  },
  cbChosenLog: {
    en: 'Completed: {label}',
    es: 'Completado: {label}',
    fr: 'Complété : {label}',
    de: 'Vervollständigt: {label}',
    ja: '確定: {label}',
    pt: 'Completado: {label}',
    zh: '已补全：{label}',
    ar: 'اكتمل: {label}',
  },
  cbCounterHidden: {
    en: 'far — nothing rendered',
    es: 'lejos — no se renderiza nada',
    fr: 'loin — rien de rendu',
    de: 'weit — nichts gerendert',
    ja: '遠い — 何も描画しない',
    pt: 'longe — nada renderizado',
    zh: '尚远 — 不渲染任何内容',
    ar: 'بعيد — لا يُعرض شيء',
  },
  cbCounterNear: {
    en: 'near — 80% of the limit',
    es: 'cerca — 80% del límite',
    fr: 'proche — 80 % de la limite',
    de: 'nah — 80 % des Limits',
    ja: '接近 — 上限の 80%',
    pt: 'perto — 80% do limite',
    zh: '接近 — 上限的 80%',
    ar: 'قريب — 80% من الحد',
  },
  cbCounterClose: {
    en: 'close — the last tenth',
    es: 'muy cerca — la última décima',
    fr: 'très proche — le dernier dixième',
    de: 'sehr nah — das letzte Zehntel',
    ja: '間近 — 残り 1 割',
    pt: 'muito perto — o último décimo',
    zh: '临近 — 最后十分之一',
    ar: 'وشيك — العُشر الأخير',
  },
  cbCounterOver: {
    en: 'over — negative, and send is refused',
    es: 'pasado — negativo, y el envío se rechaza',
    fr: 'dépassé — négatif, et l’envoi est refusé',
    de: 'darüber — negativ, und Senden wird verweigert',
    ja: '超過 — マイナスになり、送信は拒否される',
    pt: 'ultrapassado — negativo, e o envio é recusado',
    zh: '超出 — 变为负数，发送被拒绝',
    ar: 'متجاوز — سالب، والإرسال مرفوض',
  },
  cbCounterLiveHint: {
    en: 'A live composer with a 32-character limit. Keep typing past it: the number goes negative and send stays refused, with the limit named in the control’s label.',
    es: 'Un redactor en vivo con un límite de 32 caracteres. Sigue escribiendo más allá: el número se vuelve negativo y el envío sigue rechazado, con el límite nombrado en la etiqueta del control.',
    fr: "Une zone de rédaction en direct avec une limite de 32 caractères. Continuez à taper au-delà : le nombre passe en négatif et l'envoi reste refusé, la limite étant nommée dans le nom du contrôle.",
    de: 'Ein lebender Editor mit einem Limit von 32 Zeichen. Tippen Sie darüber hinaus: Die Zahl wird negativ und Senden bleibt verweigert, wobei das Limit im Namen des Steuerelements genannt wird.',
    ja: '上限 32 文字の作成欄です。そのまま超えて入力してみてください — 数字はマイナスになり、送信は拒否されたまま、その理由がコントロールの名前に現れます。',
    pt: 'Um editor ao vivo com um limite de 32 caracteres. Continue a escrever para além dele: o número fica negativo e o envio continua recusado, com o limite nomeado no rótulo do controlo.',
    zh: '一个上限为 32 个字符的实时编辑栏。继续往下输入：数字会变成负数，发送仍被拒绝，并在控件的可访问名称中说明原因。',
    ar: 'محرّر حيّ بحدّ 32 حرفًا. تابع الكتابة بعد الحد: يصبح الرقم سالبًا ويبقى الإرسال مرفوضًا، مع ذكر الحد في اسم الزر.',
  },
  cbVoiceNote: {
    en: 'The kit never opens a microphone. It takes a `meter` function that reads loudness, and the app owns the permission prompt and the audio graph — an AudioContext built outside a user gesture is muted for good on WebKit. These docs pass no meter, so the trace below stays flat: it is a real recording with nothing to draw, not a faked waveform.',
    es: 'El kit nunca abre un micrófono. Recibe una función `meter` que lee el volumen, y la app posee el permiso y el grafo de audio: un AudioContext creado fuera de un gesto del usuario queda mudo para siempre en WebKit. Esta documentación no pasa ningún meter, así que la traza de abajo queda plana: es una grabación real sin nada que dibujar, no una onda falsa.',
    fr: "Le kit n'ouvre jamais de microphone. Il reçoit une fonction `meter` qui lit le niveau sonore, et l'application détient la demande de permission et le graphe audio — un AudioContext créé hors d'un geste utilisateur reste muet à jamais sur WebKit. Cette documentation ne fournit aucun meter : le tracé ci-dessous reste plat. C'est un vrai enregistrement sans rien à dessiner, pas une fausse onde.",
    de: 'Das Kit öffnet nie ein Mikrofon. Es bekommt eine `meter`-Funktion, die die Lautstärke liest, und die App besitzt die Berechtigungsabfrage und den Audiograph — ein außerhalb einer Nutzergeste erzeugter AudioContext bleibt auf WebKit für immer stumm. Diese Doku übergibt keinen Meter, deshalb bleibt die Spur unten flach: eine echte Aufnahme ohne etwas zu zeichnen, keine gefälschte Wellenform.',
    ja: 'キットがマイクを開くことはありません。音量を読む `meter` 関数を受け取るだけで、権限プロンプトとオーディオグラフはアプリのものです — ユーザー操作の外で作られた AudioContext は WebKit では永久に無音になります。このドキュメントは meter を渡していないため、下のトレースは平坦なままです。偽の波形ではなく、描くものが無い本物の録音です。',
    pt: 'O kit nunca abre um microfone. Recebe uma função `meter` que lê o volume, e a aplicação detém o pedido de permissão e o grafo de áudio — um AudioContext criado fora de um gesto do utilizador fica mudo para sempre no WebKit. Esta documentação não passa nenhum meter, por isso o traço abaixo fica plano: é uma gravação real sem nada para desenhar, não uma onda falsa.',
    zh: '组件库从不打开麦克风。它只接收一个读取响度的 `meter` 函数，权限弹窗和音频图由应用自己持有——在用户手势之外创建的 AudioContext 在 WebKit 上会被永久静音。本文档没有传入 meter，因此下面的波形保持平直：这是一次没有内容可画的真实录制，而不是伪造的波形。',
    ar: 'لا تفتح المكتبة ميكروفونًا أبدًا. تتلقّى دالة `meter` تقرأ مستوى الصوت، بينما يملك التطبيق طلبَ الإذن ورسمَ الصوت — فأي AudioContext يُنشأ خارج إيماءة المستخدم يبقى صامتًا للأبد على WebKit. لا تمرّر هذه الصفحة أي meter، لذا يبقى الأثر أدناه مسطّحًا: إنه تسجيل حقيقي لا شيء فيه ليُرسم، لا موجة مزيّفة.',
  },
  cbVoiceKeyboard: {
    en: 'Nobody is asked to hold a key down. Activating the mic from the keyboard starts a LOCKED recording — press to start, press to stop and keep, Escape to discard. The hold gesture is an accelerator, never the only route.',
    es: 'A nadie se le pide mantener una tecla pulsada. Activar el micro desde el teclado inicia una grabación BLOQUEADA: pulsa para empezar, pulsa para parar y conservar, Escape para descartar. El gesto de mantener es un acelerador, nunca la única vía.',
    fr: "On ne demande à personne de maintenir une touche. Activer le micro au clavier lance un enregistrement VERROUILLÉ : appuyez pour démarrer, appuyez pour arrêter et conserver, Échap pour jeter. Le maintien est un accélérateur, jamais la seule voie.",
    de: 'Niemand muss eine Taste gedrückt halten. Das Aktivieren des Mikros über die Tastatur startet eine GESPERRTE Aufnahme — drücken zum Starten, drücken zum Stoppen und Behalten, Escape zum Verwerfen. Die Haltegeste ist ein Beschleuniger, nie der einzige Weg.',
    ja: '誰にもキーの押しっぱなしは要求しません。キーボードからマイクを起動するとロック録音が始まります — 押して開始、押して停止＆保持、Escape で破棄。長押しはあくまで近道であり、唯一の経路ではありません。',
    pt: 'Ninguém tem de manter uma tecla pressionada. Ativar o micro pelo teclado inicia uma gravação BLOQUEADA — prima para começar, prima para parar e guardar, Escape para descartar. O gesto de manter é um atalho, nunca a única via.',
    zh: '不会要求任何人一直按住某个键。用键盘激活麦克风会启动"锁定"录音——按一次开始，再按一次停止并保留，Escape 丢弃。长按手势只是加速方式，绝不是唯一途径。',
    ar: 'لا يُطلب من أحد إبقاء المفتاح مضغوطًا. تفعيل الميكروفون من لوحة المفاتيح يبدأ تسجيلًا مقفلًا — اضغط للبدء، واضغط للإيقاف والاحتفاظ، وEscape للتجاهل. الضغط المطوّل تسريع لا الطريق الوحيد.',
  },
  cbVoiceResting: {
    en: 'Resting (armed)',
    es: 'En reposo (armado)',
    fr: 'Au repos (armé)',
    de: 'Ruhend (bereit)',
    ja: '待機（armed）',
    pt: 'Em repouso (armado)',
    zh: '静止（已就绪）',
    ar: 'في السكون (مهيّأ)',
  },
  cbVoiceLive: {
    en: 'Press the mic for a real, silent take',
    es: 'Pulsa el micro para una toma real y silenciosa',
    fr: 'Appuyez sur le micro pour une prise réelle et silencieuse',
    de: 'Mikro drücken für eine echte, stille Aufnahme',
    ja: 'マイクを押すと、無音の実テイクが始まります',
    pt: 'Prima o micro para uma gravação real e silenciosa',
    zh: '按下麦克风开始一次真实的静音录制',
    ar: 'اضغط الميكروفون لتسجيلة حقيقية صامتة',
  },
});

/** ComposeBar prop descriptions, kept apart so the table reads as one block. */
const pp = defineMessages({
  cbPropValue: {
    en: 'Controlled message text.',
    es: 'Texto del mensaje controlado.',
    fr: 'Texte du message contrôlé.',
    de: 'Kontrollierter Nachrichtentext.',
    ja: '制御された本文テキスト。',
    pt: 'Texto da mensagem controlado.',
    zh: '受控的消息文本。',
    ar: 'نص الرسالة المتحكَّم به.',
  },
  cbPropOnValueChange: {
    en: 'Called with the next text on every edit.',
    es: 'Se llama con el siguiente texto en cada edición.',
    fr: 'Appelé avec le texte suivant à chaque modification.',
    de: 'Wird bei jeder Änderung mit dem nächsten Text aufgerufen.',
    ja: '編集のたびに次のテキストで呼ばれる。',
    pt: 'Chamado com o texto seguinte em cada edição.',
    zh: '每次编辑时以新文本调用。',
    ar: 'يُستدعى بالنص التالي عند كل تعديل.',
  },
  cbPropOnSend: {
    en: 'Called with the trimmed text and the attachments when send is allowed. The bar never clears itself: clear the value once the send has landed.',
    es: 'Se llama con el texto recortado y los adjuntos cuando el envío está permitido. La barra nunca se limpia sola: limpia el valor cuando el envío haya llegado.',
    fr: "Appelé avec le texte élagué et les pièces jointes quand l'envoi est autorisé. La barre ne se vide jamais elle-même : videz la valeur une fois l'envoi abouti.",
    de: 'Wird mit dem getrimmten Text und den Anhängen aufgerufen, wenn Senden erlaubt ist. Die Leiste leert sich nie selbst: Leeren Sie den Wert, sobald der Versand angekommen ist.',
    ja: '送信が許可されたとき、trim 済みテキストと添付を伴って呼ばれる。バーが自分で値を消すことはない — 送信が届いてから消すこと。',
    pt: 'Chamado com o texto aparado e os anexos quando o envio é permitido. A barra nunca se limpa: limpe o valor quando o envio chegar.',
    zh: '当允许发送时，以去除首尾空白的文本和附件调用。编辑栏从不自行清空：发送成功后再清空取值。',
    ar: 'يُستدعى بالنص بعد إزالة الفراغات ومعه المرفقات عندما يُسمح بالإرسال. لا يمسح الشريط نفسه أبدًا: امسح القيمة بعد وصول الإرسال.',
  },
  cbPropAttachments: {
    en: 'Pending attachments, rendered in the tray. Their upload is the app’s.',
    es: 'Adjuntos pendientes, dibujados en la bandeja. Su subida es de la app.',
    fr: "Pièces jointes en attente, rendues dans le bac. Leur envoi appartient à l'application.",
    de: 'Anstehende Anhänge, in der Leiste gerendert. Ihr Upload gehört der App.',
    ja: '保留中の添付。トレイに描画される。アップロード自体はアプリの担当。',
    pt: 'Anexos pendentes, desenhados no tabuleiro. O envio deles é da aplicação.',
    zh: '待处理的附件，渲染在托盘中。上传由应用负责。',
    ar: 'المرفقات المعلّقة، تُعرض في الدرج. رفعها مسؤولية التطبيق.',
  },
  cbPropOnFiles: {
    en: 'Called with files added by the attach control, a drop, or a paste. Omit it and the attach control is not rendered.',
    es: 'Se llama con los archivos añadidos por el control de adjuntar, un arrastre o un pegado. Omítelo y el control de adjuntar no se dibuja.',
    fr: "Appelé avec les fichiers ajoutés par le contrôle de pièce jointe, un dépôt ou un collage. Omettez-le et le contrôle n'est pas rendu.",
    de: 'Wird mit Dateien aufgerufen, die per Anhang-Steuerelement, Drop oder Einfügen hinzukommen. Ohne ihn wird das Steuerelement nicht gerendert.',
    ja: '添付コントロール・ドロップ・貼り付けで追加されたファイルで呼ばれる。省略すると添付コントロールは描画されない。',
    pt: 'Chamado com os ficheiros adicionados pelo controlo de anexar, por arrastamento ou por colagem. Omita-o e o controlo não é desenhado.',
    zh: '当通过附件控件、拖放或粘贴添加文件时调用。省略它则不渲染附件控件。',
    ar: 'يُستدعى بالملفات المضافة عبر زر الإرفاق أو الإفلات أو اللصق. بحذفه لا يُعرض زر الإرفاق.',
  },
  cbPropOnAttachmentCancel: {
    en: 'Called with an id when a chip is dismissed. The owner drops it from the list.',
    es: 'Se llama con un id cuando se descarta una ficha. El propietario la quita de la lista.',
    fr: "Appelé avec un id quand une puce est rejetée. Le propriétaire la retire de la liste.",
    de: 'Wird mit einer id aufgerufen, wenn ein Chip verworfen wird. Der Besitzer entfernt ihn aus der Liste.',
    ja: 'チップが取り消されたとき id を伴って呼ばれる。リストから外すのは所有者の役目。',
    pt: 'Chamado com um id quando uma ficha é descartada. O dono remove-a da lista.',
    zh: '当某个条目被移除时以其 id 调用。由持有方将它从列表中删除。',
    ar: 'يُستدعى بمعرّف البطاقة عند إزالتها. المالك هو من يحذفها من القائمة.',
  },
  cbPropOnAttachmentRetry: {
    en: 'Called with an id when a failed chip is retried.',
    es: 'Se llama con un id cuando se reintenta una ficha fallida.',
    fr: 'Appelé avec un id quand une puce en échec est relancée.',
    de: 'Wird mit einer id aufgerufen, wenn ein fehlgeschlagener Chip wiederholt wird.',
    ja: '失敗したチップが再試行されたとき id を伴って呼ばれる。',
    pt: 'Chamado com um id quando uma ficha falhada é repetida.',
    zh: '当重试某个失败条目时以其 id 调用。',
    ar: 'يُستدعى بمعرّف البطاقة عند إعادة محاولة رفعها.',
  },
  cbPropContext: {
    en: 'The reply / edit / forward context. Renders the banner when set — and only when `onContextDismiss` is set too, since a context you cannot leave is a trap.',
    es: 'El contexto de responder / editar / reenviar. Dibuja el banner cuando está definido, y solo si `onContextDismiss` también lo está: un contexto del que no se puede salir es una trampa.',
    fr: "Le contexte réponse / modification / transfert. Rend la bannière lorsqu'il est défini — et seulement si `onContextDismiss` l'est aussi, car un contexte dont on ne peut sortir est un piège.",
    de: 'Der Antwort-/Bearbeiten-/Weiterleiten-Kontext. Rendert das Banner, wenn gesetzt — und nur, wenn auch `onContextDismiss` gesetzt ist, denn ein Kontext ohne Ausgang ist eine Falle.',
    ja: '返信／編集／転送のコンテキスト。設定するとバナーが描画される（`onContextDismiss` も設定されている場合のみ — 抜けられない文脈は罠だから）。',
    pt: 'O contexto de responder / editar / encaminhar. Desenha o banner quando definido — e só se `onContextDismiss` também estiver, porque um contexto do qual não se sai é uma armadilha.',
    zh: '回复／编辑／转发上下文。设置后渲染横幅——且必须同时设置 `onContextDismiss`，因为无法退出的上下文是个陷阱。',
    ar: 'سياق الرد/التحرير/إعادة التوجيه. يعرض الشريط عند ضبطه — وفقط إذا ضُبط `onContextDismiss` أيضًا، فالسياق الذي لا يمكن مغادرته فخّ.',
  },
  cbPropLimit: {
    en: 'Character cap. Shows the counter near it and refuses send past it.',
    es: 'Tope de caracteres. Muestra el contador al acercarse y rechaza el envío al pasarlo.',
    fr: "Plafond de caractères. Affiche le compteur à l'approche et refuse l'envoi au-delà.",
    de: 'Zeichenobergrenze. Zeigt den Zähler in der Nähe und verweigert Senden darüber.',
    ja: '文字数の上限。近づくとカウンターを表示し、超えると送信を拒否する。',
    pt: 'Limite de caracteres. Mostra o contador ao aproximar-se e recusa o envio depois dele.',
    zh: '字符上限。接近时显示计数器，超出后拒绝发送。',
    ar: 'حدّ الأحرف. يُظهر العدّاد قربه ويرفض الإرسال بعده.',
  },
  cbPropSending: {
    en: 'A send is in flight: the control spins and a second send is refused, but the field stays editable.',
    es: 'Hay un envío en curso: el control gira y se rechaza un segundo envío, pero el campo sigue editable.',
    fr: "Un envoi est en cours : le contrôle tourne et un second envoi est refusé, mais le champ reste modifiable.",
    de: 'Ein Versand läuft: Das Steuerelement dreht sich und ein zweiter Versand wird verweigert, das Feld bleibt aber editierbar.',
    ja: '送信中。コントロールは回転し 2 回目の送信は拒否されるが、入力欄は編集可能なまま。',
    pt: 'Um envio está em curso: o controlo gira e um segundo envio é recusado, mas o campo continua editável.',
    zh: '正在发送：控件转圈并拒绝第二次发送，但输入框仍可编辑。',
    ar: 'هناك إرسال جارٍ: يدور الزر ويُرفض إرسال ثانٍ، لكن الحقل يبقى قابلًا للتحرير.',
  },
  cbPropFailed: {
    en: 'The last send failed: the control turns danger and becomes the retry.',
    es: 'El último envío falló: el control se vuelve de peligro y pasa a ser el reintento.',
    fr: "Le dernier envoi a échoué : le contrôle passe en danger et devient la nouvelle tentative.",
    de: 'Der letzte Versand schlug fehl: Das Steuerelement wird zur Gefahr-Variante und zum Wiederholversuch.',
    ja: '直前の送信が失敗。コントロールは danger になり、そのまま再試行になる。',
    pt: 'O último envio falhou: o controlo fica em perigo e passa a ser a nova tentativa.',
    zh: '上一次发送失败：控件转为危险样式，并变成重试按钮。',
    ar: 'فشل الإرسال الأخير: يتحوّل الزر إلى نمط الخطر ويصبح زر إعادة المحاولة.',
  },
  cbPropMentions: {
    en: 'Candidates for the `@` and `#` popup.',
    es: 'Candidatos para el popup de `@` y `#`.',
    fr: 'Candidats pour la liste `@` et `#`.',
    de: 'Kandidaten für das `@`- und `#`-Popup.',
    ja: '`@` と `#` の候補。',
    pt: 'Candidatos para o popup de `@` e `#`.',
    zh: '`@` 与 `#` 弹出列表的候选项。',
    ar: 'مرشّحو قائمة `@` و`#`.',
  },
  cbPropCommands: {
    en: 'Candidates for the `/` popup, matched by the same matcher.',
    es: 'Candidatos para el popup de `/`, filtrados por el mismo comparador.',
    fr: 'Candidats pour la liste `/`, filtrés par le même comparateur.',
    de: 'Kandidaten für das `/`-Popup, mit demselben Matcher gefiltert.',
    ja: '`/` の候補。同じマッチャーで絞り込まれる。',
    pt: 'Candidatos para o popup de `/`, filtrados pelo mesmo comparador.',
    zh: '`/` 弹出列表的候选项，使用同一套匹配器。',
    ar: 'مرشّحو قائمة `/`، تُرشَّح بالمطابِق نفسه.',
  },
  cbPropOnVoice: {
    en: 'Called with the recorded seconds when a take is kept. Omit it and the recorder is not rendered.',
    es: 'Se llama con los segundos grabados cuando se conserva una toma. Omítelo y el grabador no se dibuja.',
    fr: "Appelé avec les secondes enregistrées quand une prise est conservée. Omettez-le et l'enregistreur n'est pas rendu.",
    de: 'Wird mit den aufgenommenen Sekunden aufgerufen, wenn eine Aufnahme behalten wird. Ohne ihn wird der Rekorder nicht gerendert.',
    ja: 'テイクを保持したとき録音秒数を伴って呼ばれる。省略するとレコーダーは描画されない。',
    pt: 'Chamado com os segundos gravados quando uma gravação é guardada. Omita-o e o gravador não é desenhado.',
    zh: '保留某段录音时以录制秒数调用。省略它则不渲染录音器。',
    ar: 'يُستدعى بعدد الثواني المسجّلة عند الاحتفاظ بالتسجيلة. بحذفه لا يُعرض المسجّل.',
  },
  cbPropEnterPolicy: {
    en: 'What a bare Enter does; `auto` resolves against the pointer.',
    es: 'Qué hace un Enter solo; `auto` se resuelve contra el puntero.',
    fr: 'Ce que fait une touche Entrée seule ; `auto` se résout selon le pointeur.',
    de: 'Was ein bloßes Enter tut; `auto` löst sich am Zeiger auf.',
    ja: '単独の Enter の動作。`auto` はポインタで解決される。',
    pt: 'O que faz um Enter isolado; `auto` resolve-se pelo ponteiro.',
    zh: '单独按 Enter 的行为；`auto` 会根据指针类型解析。',
    ar: 'ما يفعله Enter بمفرده؛ و`auto` يُحسم وفق المؤشّر.',
  },
  cbPropDensity: {
    en: 'How tightly the bar is packed; resolved once in `composeMetrics`.',
    es: 'Cómo de apretada va la barra; se resuelve una vez en `composeMetrics`.',
    fr: 'Le serrage de la barre ; résolu une seule fois dans `composeMetrics`.',
    de: 'Wie dicht die Leiste gepackt ist; einmal in `composeMetrics` aufgelöst.',
    ja: 'バーの詰め具合。`composeMetrics` で一度だけ解決される。',
    pt: 'Quão compacta é a barra; resolvido uma vez em `composeMetrics`.',
    zh: '编辑栏的紧凑程度；在 `composeMetrics` 中统一解析。',
    ar: 'مدى ضغط الشريط؛ يُحسم مرة واحدة في `composeMetrics`.',
  },
  cbPropMaxRows: {
    en: 'Rows the input may grow to before it stops growing and scrolls.',
    es: 'Filas hasta las que puede crecer el campo antes de dejar de crecer y desplazarse.',
    fr: 'Lignes jusqu’auxquelles le champ peut grandir avant de défiler.',
    de: 'Zeilen, bis zu denen das Feld wachsen darf, bevor es scrollt.',
    ja: '入力欄が伸びられる行数の上限。超えるとスクロールに切り替わる。',
    pt: 'Linhas até às quais o campo pode crescer antes de passar a deslocar-se.',
    zh: '输入框可增长到的最大行数，超过后改为滚动。',
    ar: 'عدد الأسطر التي يمكن للحقل أن ينمو إليها قبل أن يتوقّف ويبدأ التمرير.',
  },
  cbPropTouch: {
    en: 'Pins the coarse-pointer probe. Docs and tests need a fixed platform; apps almost never should.',
    es: 'Fija la detección de puntero grueso. La documentación y las pruebas necesitan una plataforma fija; las apps casi nunca.',
    fr: "Fige la détection de pointeur grossier. Docs et tests ont besoin d'une plateforme fixe ; les applications presque jamais.",
    de: 'Fixiert die Grobzeiger-Erkennung. Doku und Tests brauchen eine feste Plattform; Apps fast nie.',
    ja: '粗いポインタの判定を固定する。ドキュメントとテストには必要だが、アプリではほぼ不要。',
    pt: 'Fixa a deteção de ponteiro grosso. A documentação e os testes precisam de uma plataforma fixa; as aplicações quase nunca.',
    zh: '固定"粗略指针"探测结果。文档和测试需要固定平台；应用几乎不应该使用。',
    ar: 'يثبّت اختبار المؤشّر الخشن. التوثيق والاختبارات تحتاج منصّة ثابتة؛ التطبيقات لا تحتاجها غالبًا.',
  },
  cbPropGlass: {
    en: 'Renders the frosted glass material, for a bar floating over a conversation.',
    es: 'Dibuja el material de cristal esmerilado, para una barra flotando sobre una conversación.',
    fr: "Rend le matériau verre dépoli, pour une barre flottant au-dessus d'une conversation.",
    de: 'Rendert das Milchglas-Material, für eine über einem Gespräch schwebende Leiste.',
    ja: 'すりガラスのマテリアルで描画する。会話の上に浮かぶバー向け。',
    pt: 'Desenha o material de vidro fosco, para uma barra a flutuar sobre uma conversa.',
    zh: '渲染磨砂玻璃材质，用于浮在会话之上的编辑栏。',
    ar: 'يعرض خامة الزجاج المصنفر، لشريط يطفو فوق محادثة.',
  },
});

/** Prop descriptions for the eight parts, table by table. */
const sp = defineMessages({
  miOnSend: {
    en: 'Called with the current text when the key policy says send.',
    es: 'Se llama con el texto actual cuando la política de teclas dice enviar.',
    fr: "Appelé avec le texte courant quand la politique de touches dit d'envoyer.",
    de: 'Wird mit dem aktuellen Text aufgerufen, wenn die Tastenrichtlinie „senden“ sagt.',
    ja: 'キーポリシーが「送信」と判断したとき、現在のテキストで呼ばれる。',
    pt: 'Chamado com o texto atual quando a política de teclas diz para enviar.',
    zh: '当按键策略判定为发送时，以当前文本调用。',
    ar: 'يُستدعى بالنص الحالي عندما تقرّر سياسة المفاتيح الإرسال.',
  },
  miMinRows: {
    en: 'Rows before anything is typed.',
    es: 'Filas antes de escribir nada.',
    fr: 'Lignes avant toute saisie.',
    de: 'Zeilen, bevor etwas getippt wird.',
    ja: '何も入力していないときの行数。',
    pt: 'Linhas antes de se escrever alguma coisa.',
    zh: '尚未输入时的行数。',
    ar: 'عدد الأسطر قبل كتابة أي شيء.',
  },
  miPasteFiles: {
    en: 'Called with the files on the clipboard when a paste carries any — a screenshot is an attachment, not text.',
    es: 'Se llama con los archivos del portapapeles cuando un pegado los lleva: una captura es un adjunto, no texto.',
    fr: "Appelé avec les fichiers du presse-papiers lorsqu'un collage en contient — une capture est une pièce jointe, pas du texte.",
    de: 'Wird mit den Dateien aus der Zwischenablage aufgerufen, wenn ein Einfügen welche trägt — ein Screenshot ist ein Anhang, kein Text.',
    ja: '貼り付けにファイルが含まれるとき、その内容で呼ばれる — スクリーンショットはテキストではなく添付。',
    pt: 'Chamado com os ficheiros da área de transferência quando uma colagem os traz — uma captura é um anexo, não texto.',
    zh: '当粘贴内容包含文件时以这些文件调用——截图是附件，不是文本。',
    ar: 'يُستدعى بملفات الحافظة عندما يحمل اللصقُ ملفات — فلقطة الشاشة مرفق لا نص.',
  },
  miCaret: {
    en: 'Called with the caret offset after every edit or selection move; an @-token watcher needs it.',
    es: 'Se llama con la posición del cursor tras cada edición o movimiento de selección; un vigilante de tokens `@` la necesita.',
    fr: "Appelé avec la position du curseur après chaque modification ou déplacement de sélection ; un observateur de jeton `@` en a besoin.",
    de: 'Wird nach jeder Änderung oder Auswahlbewegung mit der Cursorposition aufgerufen; ein `@`-Token-Beobachter braucht sie.',
    ja: '編集や選択移動のたびにキャレット位置で呼ばれる。`@` トークンの監視に必要。',
    pt: 'Chamado com a posição do cursor após cada edição ou movimento de seleção; um observador de token `@` precisa dela.',
    zh: '每次编辑或选区移动后以插入符偏移量调用；监听 `@` 词元时需要它。',
    ar: 'يُستدعى بموضع مؤشّر الكتابة بعد كل تعديل أو نقل تحديد؛ يحتاجه مراقب رمز `@`.',
  },
  miBare: {
    en: 'Drops the field’s own border and fill, for a bar that draws them instead.',
    es: 'Quita el borde y el relleno propios del campo, para una barra que los dibuja ella.',
    fr: "Retire la bordure et le fond du champ, pour une barre qui les dessine à sa place.",
    de: 'Entfernt Rahmen und Füllung des Feldes, für eine Leiste, die beides selbst zeichnet.',
    ja: '入力欄自身の枠と塗りを外す。バー側がそれらを描く場合に使う。',
    pt: 'Remove a borda e o preenchimento do próprio campo, para uma barra que os desenha.',
    zh: '去掉输入框自带的边框和填充，交由外层编辑栏绘制。',
    ar: 'يزيل حدّ الحقل وتعبئته، لشريط يرسمهما بدلًا منه.',
  },

  sbState: {
    en: 'What the control currently is. Derive it with `composeSendState`.',
    es: 'Lo que el control es ahora mismo. Derívalo con `composeSendState`.',
    fr: "Ce qu'est le contrôle en ce moment. Dérivez-le avec `composeSendState`.",
    de: 'Was das Steuerelement gerade ist. Leiten Sie es mit `composeSendState` ab.',
    ja: 'いま何であるか。`composeSendState` から導出する。',
    pt: 'O que o controlo é neste momento. Derive-o com `composeSendState`.',
    zh: '控件当前的状态。用 `composeSendState` 推导。',
    ar: 'ما هو الزر حاليًا. اشتقّه بـ `composeSendState`.',
  },
  sbBlockReason: {
    en: 'Why send is refused. It changes the accessible name, never the paint.',
    es: 'Por qué se rechaza el envío. Cambia el nombre accesible, nunca la pintura.',
    fr: "Pourquoi l'envoi est refusé. Change le nom accessible, jamais la peinture.",
    de: 'Warum Senden verweigert wird. Ändert den zugänglichen Namen, nie die Optik.',
    ja: '送信が拒否される理由。アクセシブルネームだけを変え、見た目は変えない。',
    pt: 'Porque é que o envio é recusado. Muda o nome acessível, nunca a pintura.',
    zh: '拒绝发送的原因。它改变可访问名称，绝不改变外观。',
    ar: 'سبب رفض الإرسال. يغيّر الاسم الوصول فقط لا المظهر.',
  },
  sbOnRetry: {
    en: 'Called on activation while failed; falls back to `onSend`.',
    es: 'Se llama al activar en estado fallido; recurre a `onSend`.',
    fr: "Appelé lors de l'activation en état d'échec ; retombe sur `onSend`.",
    de: 'Wird bei Aktivierung im Fehlerzustand aufgerufen; fällt auf `onSend` zurück.',
    ja: 'failed 状態での起動時に呼ばれる。無ければ `onSend` にフォールバック。',
    pt: 'Chamado ao ativar no estado falhado; recorre a `onSend`.',
    zh: '在失败状态下被激活时调用；未提供时回退到 `onSend`。',
    ar: 'يُستدعى عند التفعيل في حالة الفشل؛ ويعود إلى `onSend` عند غيابه.',
  },
  sbLabels: {
    en: 'Overrides the per-state accessible names.',
    es: 'Sustituye los nombres accesibles de cada estado.',
    fr: 'Remplace les noms accessibles de chaque état.',
    de: 'Überschreibt die zugänglichen Namen je Zustand.',
    ja: '状態ごとのアクセシブルネームを上書きする。',
    pt: 'Substitui os nomes acessíveis de cada estado.',
    zh: '覆盖各状态的可访问名称。',
    ar: 'يتجاوز الأسماء الوصولية لكل حالة.',
  },

  atAttachments: {
    en: 'Pending attachments, in the order they were added. Renders nothing when empty.',
    es: 'Adjuntos pendientes, en el orden en que se añadieron. No dibuja nada si está vacío.',
    fr: "Pièces jointes en attente, dans leur ordre d'ajout. Ne rend rien si vide.",
    de: 'Anstehende Anhänge in der Reihenfolge des Hinzufügens. Rendert nichts, wenn leer.',
    ja: '追加順の保留中添付。空のときは何も描画しない。',
    pt: 'Anexos pendentes, pela ordem em que foram adicionados. Não desenha nada se vazio.',
    zh: '按添加顺序排列的待处理附件。为空时什么也不渲染。',
    ar: 'المرفقات المعلّقة بترتيب إضافتها. لا يعرض شيئًا عندما تكون فارغة.',
  },
  atOnCancel: {
    en: 'Called with an id when a chip’s dismiss is pressed — the same control whether the upload is running or done.',
    es: 'Se llama con un id al pulsar el descarte de una ficha: el mismo control tanto si la subida sigue como si acabó.',
    fr: "Appelé avec un id quand le rejet d'une puce est pressé — le même contrôle que l'envoi soit en cours ou terminé.",
    de: 'Wird mit einer id aufgerufen, wenn das Verwerfen eines Chips gedrückt wird — dasselbe Steuerelement, ob der Upload läuft oder fertig ist.',
    ja: 'チップの取り消しが押されたとき id を伴って呼ばれる。アップロード中でも完了後でも同じコントロール。',
    pt: 'Chamado com um id quando o descarte de uma ficha é premido — o mesmo controlo, esteja o envio a decorrer ou terminado.',
    zh: '按下条目的移除按钮时以其 id 调用——无论上传进行中还是已完成，都是同一个控件。',
    ar: 'يُستدعى بمعرّف عند الضغط على إزالة البطاقة — الزر نفسه سواء كان الرفع جاريًا أو منتهيًا.',
  },
  atAriaLabel: {
    en: 'Accessible name for the list; defaults to the localized “Attachments”.',
    es: 'Nombre accesible de la lista; por defecto, «Adjuntos» localizado.',
    fr: 'Nom accessible de la liste ; par défaut « Pièces jointes » localisé.',
    de: 'Zugänglicher Name der Liste; Standard ist das lokalisierte „Anhänge“.',
    ja: 'リストのアクセシブルネーム。既定はローカライズされた「添付ファイル」。',
    pt: 'Nome acessível da lista; por omissão, «Anexos» localizado.',
    zh: '列表的可访问名称；默认为本地化的"附件"。',
    ar: 'الاسم الوصولي للقائمة؛ الافتراضي هو «المرفقات» المترجمة.',
  },

  acName: {
    en: 'The file name. Split so the middle elides and the extension survives.',
    es: 'El nombre del archivo. Se parte para que el centro se elida y la extensión sobreviva.',
    fr: "Le nom du fichier. Découpé pour que le milieu s'élide et que l'extension survive.",
    de: 'Der Dateiname. Geteilt, damit die Mitte elidiert und die Endung überlebt.',
    ja: 'ファイル名。中央を省略しても拡張子が残るように分割される。',
    pt: 'O nome do ficheiro. Dividido para que o meio seja elidido e a extensão sobreviva.',
    zh: '文件名。会被拆分，使中间省略而扩展名保留。',
    ar: 'اسم الملف. يُقسَّم بحيث يُختصر الوسط ويبقى الامتداد.',
  },
  acStatus: {
    en: 'Where the file is: `pending`, `uploading`, `complete`, `failed`, `canceled`. Move it with `advanceAttachment`.',
    es: 'Dónde está el archivo: `pending`, `uploading`, `complete`, `failed`, `canceled`. Muévelo con `advanceAttachment`.',
    fr: 'Où en est le fichier : `pending`, `uploading`, `complete`, `failed`, `canceled`. Faites-le avancer avec `advanceAttachment`.',
    de: 'Wo die Datei steht: `pending`, `uploading`, `complete`, `failed`, `canceled`. Bewegen Sie sie mit `advanceAttachment`.',
    ja: 'ファイルの状態: `pending`・`uploading`・`complete`・`failed`・`canceled`。遷移は `advanceAttachment` で。',
    pt: 'Onde está o ficheiro: `pending`, `uploading`, `complete`, `failed`, `canceled`. Mova-o com `advanceAttachment`.',
    zh: '文件所处状态：`pending`、`uploading`、`complete`、`failed`、`canceled`。用 `advanceAttachment` 推进。',
    ar: 'حالة الملف: `pending` أو `uploading` أو `complete` أو `failed` أو `canceled`. حرّكها بـ `advanceAttachment`.',
  },
  acProgress: {
    en: 'Upload fraction 0..1; only meaningful while uploading. Undefined draws an indeterminate bar.',
    es: 'Fracción de subida 0..1; solo tiene sentido mientras sube. Sin definir dibuja una barra indeterminada.',
    fr: "Fraction d'envoi 0..1 ; utile seulement pendant l'envoi. Non défini dessine une barre indéterminée.",
    de: 'Upload-Anteil 0..1; nur während des Uploads sinnvoll. Undefiniert zeichnet einen unbestimmten Balken.',
    ja: 'アップロードの割合 0..1。アップロード中のみ意味を持つ。未定義なら不確定バーになる。',
    pt: 'Fração de envio 0..1; só faz sentido durante o envio. Indefinido desenha uma barra indeterminada.',
    zh: '上传进度 0..1；仅在上传时有意义。未定义时绘制不确定进度条。',
    ar: 'نسبة الرفع 0..1؛ ذات معنى أثناء الرفع فقط. عند تركها غير معرّفة يُرسم شريط غير محدّد.',
  },
  acError: {
    en: 'Why it failed; shown in place of the size.',
    es: 'Por qué falló; se muestra en lugar del tamaño.',
    fr: "Pourquoi il a échoué ; affiché à la place de la taille.",
    de: 'Warum sie fehlschlug; wird anstelle der Größe gezeigt.',
    ja: '失敗の理由。サイズの代わりに表示される。',
    pt: 'Porque falhou; mostrado no lugar do tamanho.',
    zh: '失败原因；显示在文件大小的位置。',
    ar: 'سبب الفشل؛ يُعرض مكان الحجم.',
  },
  acMimeType: {
    en: 'The MIME type, used only to pick the glyph.',
    es: 'El tipo MIME, usado solo para elegir el glifo.',
    fr: 'Le type MIME, utilisé seulement pour choisir le glyphe.',
    de: 'Der MIME-Typ, nur zur Wahl der Glyphe verwendet.',
    ja: 'MIME タイプ。字形の選択にのみ使う。',
    pt: 'O tipo MIME, usado apenas para escolher o glifo.',
    zh: 'MIME 类型，仅用于选择图标。',
    ar: 'نوع MIME، يُستخدم لاختيار الرمز فقط.',
  },

  ccbMode: {
    en: 'Which context this is: `reply`, `edit`, or `forward`.',
    es: 'Qué contexto es: `reply`, `edit` o `forward`.',
    fr: 'De quel contexte il s’agit : `reply`, `edit` ou `forward`.',
    de: 'Welcher Kontext: `reply`, `edit` oder `forward`.',
    ja: 'どの文脈か: `reply`・`edit`・`forward`。',
    pt: 'Qual o contexto: `reply`, `edit` ou `forward`.',
    zh: '属于哪种上下文：`reply`、`edit` 或 `forward`。',
    ar: 'أي سياق هذا: `reply` أو `edit` أو `forward`.',
  },
  ccbAuthor: {
    en: 'Who the referenced message is from; dropped into the hole the translated sentence left for it, so word order survives translation.',
    es: 'De quién es el mensaje referenciado; se inserta en el hueco que dejó la frase traducida, para que el orden de palabras sobreviva.',
    fr: "De qui provient le message référencé ; inséré dans le trou laissé par la phrase traduite, pour que l'ordre des mots survive.",
    de: 'Von wem die referenzierte Nachricht stammt; wird in die Lücke des übersetzten Satzes gesetzt, damit die Wortstellung erhalten bleibt.',
    ja: '参照メッセージの差出人。翻訳文が空けた穴に差し込まれるので、語順が保たれる。',
    pt: 'De quem é a mensagem referenciada; colocado no buraco que a frase traduzida deixou, para a ordem das palavras sobreviver.',
    zh: '被引用消息的作者；会填入译文预留的位置，因此语序在翻译后依然正确。',
    ar: 'صاحب الرسالة المشار إليها؛ يوضع في الفجوة التي تركتها الجملة المترجمة، فيبقى ترتيب الكلمات سليمًا.',
  },
  ccbPreview: {
    en: 'The referenced text, clamped to one line.',
    es: 'El texto referenciado, recortado a una línea.',
    fr: 'Le texte référencé, limité à une ligne.',
    de: 'Der referenzierte Text, auf eine Zeile begrenzt.',
    ja: '参照テキスト。1 行に切り詰められる。',
    pt: 'O texto referenciado, limitado a uma linha.',
    zh: '被引用的文本，截断为一行。',
    ar: 'النص المشار إليه، مقصورًا على سطر واحد.',
  },
  ccbCount: {
    en: 'How many messages are being forwarded; only the forward mode reads it.',
    es: 'Cuántos mensajes se reenvían; solo el modo reenviar lo lee.',
    fr: 'Combien de messages sont transférés ; seul le mode transfert le lit.',
    de: 'Wie viele Nachrichten weitergeleitet werden; nur der Weiterleiten-Modus liest es.',
    ja: '転送するメッセージ数。forward モードのみが読む。',
    pt: 'Quantas mensagens estão a ser encaminhadas; só o modo de encaminhamento o lê.',
    zh: '正在转发的消息条数；只有转发模式会读取它。',
    ar: 'عدد الرسائل المعاد توجيهها؛ لا يقرأه سوى وضع إعادة التوجيه.',
  },
  ccbOnDismiss: {
    en: 'Required. A context you cannot leave is a trap, and the label names what leaving costs.',
    es: 'Obligatorio. Un contexto del que no se puede salir es una trampa, y la etiqueta nombra lo que cuesta salir.',
    fr: "Obligatoire. Un contexte dont on ne peut sortir est un piège, et le libellé nomme ce que coûte la sortie.",
    de: 'Erforderlich. Ein Kontext ohne Ausgang ist eine Falle, und das Label benennt, was das Verlassen kostet.',
    ja: '必須。抜けられない文脈は罠であり、ラベルは抜けることの代償を名指す。',
    pt: 'Obrigatório. Um contexto do qual não se sai é uma armadilha, e o rótulo nomeia o que custa sair.',
    zh: '必填。无法退出的上下文是陷阱，标签会说明退出会失去什么。',
    ar: 'مطلوب. السياق الذي لا يمكن مغادرته فخّ، والتسمية تسمّي ثمن المغادرة.',
  },

  maOpen: {
    en: 'Whether the popup is showing; driven by a token being found at the caret.',
    es: 'Si el popup se muestra; lo dirige encontrar un token en el cursor.',
    fr: "Si la liste est affichée ; piloté par la découverte d'un jeton au curseur.",
    de: 'Ob das Popup gezeigt wird; getrieben davon, dass am Cursor ein Token gefunden wurde.',
    ja: '候補リストを表示するか。キャレット位置でトークンが見つかったかで決まる。',
    pt: 'Se o popup está visível; conduzido por se encontrar um token no cursor.',
    zh: '弹出列表是否显示；由插入符处是否找到词元决定。',
    ar: 'هل القائمة ظاهرة؛ يقودها العثور على رمز عند مؤشّر الكتابة.',
  },
  maQuery: {
    en: 'The text after the trigger character.',
    es: 'El texto tras el carácter disparador.',
    fr: 'Le texte après le caractère déclencheur.',
    de: 'Der Text nach dem Auslösezeichen.',
    ja: 'トリガー文字の後ろのテキスト。',
    pt: 'O texto depois do carácter disparador.',
    zh: '触发字符之后的文本。',
    ar: 'النص الذي يلي حرف التشغيل.',
  },
  maTrigger: {
    en: 'Which token opened it: `@`, `#`, or `/`. It picks the list’s accessible name.',
    es: 'Qué token lo abrió: `@`, `#` o `/`. Elige el nombre accesible de la lista.',
    fr: "Quel jeton l'a ouverte : `@`, `#` ou `/`. Il choisit le nom accessible de la liste.",
    de: 'Welches Token es geöffnet hat: `@`, `#` oder `/`. Es wählt den zugänglichen Namen der Liste.',
    ja: '開いたトークン: `@`・`#`・`/`。リストのアクセシブルネームを決める。',
    pt: 'Que token o abriu: `@`, `#` ou `/`. Escolhe o nome acessível da lista.',
    zh: '触发它的词元：`@`、`#` 或 `/`。它决定列表的可访问名称。',
    ar: 'الرمز الذي فتحها: `@` أو `#` أو `/`. وهو يحدّد الاسم الوصولي للقائمة.',
  },
  maCandidates: {
    en: 'Everyone (or everything) completable, in the caller’s priority order.',
    es: 'Todo lo completable, en el orden de prioridad de quien llama.',
    fr: "Tout ce qui est complétable, dans l'ordre de priorité de l'appelant.",
    de: 'Alles Vervollständigbare, in der Prioritätsreihenfolge des Aufrufers.',
    ja: '補完可能なものすべて。呼び出し側の優先順で。',
    pt: 'Tudo o que é completável, na ordem de prioridade de quem chama.',
    zh: '所有可补全的候选项，按调用方的优先顺序排列。',
    ar: 'كل ما يمكن إكماله، بترتيب أولوية المستدعي.',
  },
  maCursor: {
    en: 'Index of the highlighted row in the flat match order. Re-seat it on every keystroke: an index kept across a narrowing list points at a different person.',
    es: 'Índice de la fila resaltada en el orden plano de coincidencias. Reasiéntalo en cada pulsación: un índice conservado mientras la lista se estrecha apunta a otra persona.',
    fr: "Index de la ligne mise en avant dans l'ordre plat des correspondances. Réasseyez-le à chaque frappe : un index conservé pendant que la liste se réduit désigne quelqu'un d'autre.",
    de: 'Index der hervorgehobenen Zeile in der flachen Trefferreihenfolge. Setzen Sie ihn bei jedem Anschlag neu: Ein über eine schrumpfende Liste behaltener Index zeigt auf jemand anderen.',
    ja: 'フラットなマッチ順における強調行のインデックス。打鍵ごとに座り直させること — 絞り込みをまたいで保持したインデックスは別人を指す。',
    pt: 'Índice da linha destacada na ordem plana das correspondências. Reassente-o a cada tecla: um índice mantido enquanto a lista se estreita aponta para outra pessoa.',
    zh: '高亮行在扁平匹配序列中的索引。每次按键都要重新落位：跨越列表收窄仍沿用的索引会指向另一个人。',
    ar: 'فهرس الصف المميّز ضمن ترتيب المطابقات المسطّح. أعِد ضبطه مع كل ضغطة: فالفهرس المحتفظ به عبر قائمة تضيق يشير إلى شخص آخر.',
  },
  maOnChoose: {
    en: 'Called with the chosen candidate’s id. Rewrite the token with `applyMention`.',
    es: 'Se llama con el id del candidato elegido. Reescribe el token con `applyMention`.',
    fr: "Appelé avec l'id du candidat choisi. Réécrivez le jeton avec `applyMention`.",
    de: 'Wird mit der id des gewählten Kandidaten aufgerufen. Schreiben Sie das Token mit `applyMention` um.',
    ja: '選ばれた候補の id を伴って呼ばれる。トークンの書き換えは `applyMention` で。',
    pt: 'Chamado com o id do candidato escolhido. Reescreva o token com `applyMention`.',
    zh: '以所选候选项的 id 调用。用 `applyMention` 重写词元。',
    ar: 'يُستدعى بمعرّف المرشّح المختار. أعِد كتابة الرمز بـ `applyMention`.',
  },
  maListId: {
    en: 'Id for the listbox, so the input can point `aria-controls` at it.',
    es: 'Id del listbox, para que el campo pueda apuntarle con `aria-controls`.',
    fr: "Id de la listbox, pour que le champ puisse y pointer avec `aria-controls`.",
    de: 'Id der Listbox, damit das Feld mit `aria-controls` darauf zeigen kann.',
    ja: 'リストボックスの id。入力欄が `aria-controls` で指せるようにする。',
    pt: 'Id da listbox, para o campo lhe poder apontar com `aria-controls`.',
    zh: '列表框的 id，以便输入框用 `aria-controls` 指向它。',
    ar: 'معرّف صندوق القائمة، ليشير إليه الحقل عبر `aria-controls`.',
  },

  chLength: {
    en: 'Characters used. Count them with `countCharacters`, not `String.length` — one emoji is one character.',
    es: 'Caracteres usados. Cuéntalos con `countCharacters`, no con `String.length`: un emoji es un carácter.',
    fr: "Caractères utilisés. Comptez-les avec `countCharacters`, pas `String.length` — un emoji vaut un caractère.",
    de: 'Verwendete Zeichen. Zählen Sie mit `countCharacters`, nicht `String.length` — ein Emoji ist ein Zeichen.',
    ja: '使用文字数。`String.length` ではなく `countCharacters` で数える — 絵文字 1 つは 1 文字。',
    pt: 'Caracteres usados. Conte-os com `countCharacters`, não com `String.length` — um emoji é um carácter.',
    zh: '已用字符数。请用 `countCharacters` 计数，而不是 `String.length`——一个 emoji 算一个字符。',
    ar: 'الأحرف المستخدمة. عُدّها بـ `countCharacters` لا بـ `String.length` — فالإيموجي حرف واحد.',
  },
  chLimit: {
    en: 'The cap. Zero or less turns the counter off entirely.',
    es: 'El tope. Cero o menos apaga el contador por completo.',
    fr: 'Le plafond. Zéro ou moins éteint complètement le compteur.',
    de: 'Die Obergrenze. Null oder weniger schaltet den Zähler ganz ab.',
    ja: '上限。0 以下ならカウンターは完全に無効。',
    pt: 'O limite. Zero ou menos desliga o contador por completo.',
    zh: '上限值。小于等于 0 会完全关闭计数器。',
    ar: 'الحدّ الأقصى. الصفر أو أقل يوقف العدّاد تمامًا.',
  },
  chThreshold: {
    en: 'Fraction of the limit at which the counter appears.',
    es: 'Fracción del límite a la que aparece el contador.',
    fr: 'Fraction de la limite à laquelle le compteur apparaît.',
    de: 'Anteil des Limits, ab dem der Zähler erscheint.',
    ja: 'カウンターが現れる、上限に対する割合。',
    pt: 'Fração do limite a partir da qual o contador aparece.',
    zh: '计数器出现时相对上限的比例。',
    ar: 'نسبة من الحد يظهر عندها العدّاد.',
  },
  chShowAlways: {
    en: 'Keeps it visible from the first character, for a hard external cap.',
    es: 'Lo mantiene visible desde el primer carácter, para un tope externo duro.',
    fr: 'Le garde visible dès le premier caractère, pour un plafond externe strict.',
    de: 'Hält ihn ab dem ersten Zeichen sichtbar, für eine harte externe Grenze.',
    ja: '最初の 1 文字から常に表示する。外部の厳格な上限がある場合に。',
    pt: 'Mantém-no visível desde o primeiro carácter, para um limite externo rígido.',
    zh: '从第一个字符起始终可见，适用于外部的硬性上限。',
    ar: 'يُبقيه ظاهرًا من أول حرف، لحدّ خارجي صارم.',
  },

  vrState: {
    en: 'Controlled state. Left off, the component owns it — and should, since the clock starts when the hold does.',
    es: 'Estado controlado. Si se omite, el componente lo posee, y así debe ser: el reloj arranca cuando arranca la pulsación.',
    fr: "État contrôlé. Omis, le composant le possède — et c'est préférable, car l'horloge démarre avec le maintien.",
    de: 'Kontrollierter Zustand. Weggelassen besitzt ihn die Komponente — und das sollte sie, denn die Uhr startet mit dem Halten.',
    ja: '制御された状態。省略するとコンポーネントが持つ（保持開始と同時に時計が動くので、そのほうがよい）。',
    pt: 'Estado controlado. Se omitido, o componente é o dono — e deve sê-lo, já que o relógio arranca com o toque.',
    zh: '受控状态。省略时由组件自己持有——也应当如此，因为计时是随按住动作开始的。',
    ar: 'الحالة المتحكَّم بها. عند حذفها يملكها المكوّن — وهو الأفضل، لأن الساعة تبدأ مع بدء الضغط.',
  },
  vrMeter: {
    en: 'Reads the current input loudness as 0..1. The component never opens a microphone: the host owns that prompt and its audio graph.',
    es: 'Lee el volumen de entrada actual como 0..1. El componente nunca abre un micrófono: el anfitrión posee ese permiso y su grafo de audio.',
    fr: "Lit le niveau sonore courant en 0..1. Le composant n'ouvre jamais de microphone : l'hôte détient la demande et son graphe audio.",
    de: 'Liest die aktuelle Eingangslautstärke als 0..1. Die Komponente öffnet nie ein Mikrofon: Der Host besitzt die Abfrage und den Audiograph.',
    ja: '現在の入力音量を 0..1 で読む。コンポーネントはマイクを開かない — 許可プロンプトと音声グラフはホストのもの。',
    pt: 'Lê o volume de entrada atual como 0..1. O componente nunca abre um microfone: o anfitrião detém esse pedido e o seu grafo de áudio.',
    zh: '以 0..1 读取当前输入响度。组件从不打开麦克风：权限弹窗和音频图由宿主持有。',
    ar: 'يقرأ مستوى الصوت الحالي بين 0 و1. لا يفتح المكوّن ميكروفونًا: المضيف يملك الإذن ورسم الصوت.',
  },
  vrOnSend: {
    en: 'Called with the elapsed seconds when a take is kept.',
    es: 'Se llama con los segundos transcurridos cuando se conserva una toma.',
    fr: "Appelé avec les secondes écoulées quand une prise est conservée.",
    de: 'Wird mit den verstrichenen Sekunden aufgerufen, wenn eine Aufnahme behalten wird.',
    ja: 'テイクを保持したとき、経過秒数を伴って呼ばれる。',
    pt: 'Chamado com os segundos decorridos quando uma gravação é guardada.',
    zh: '保留某段录音时以已录制的秒数调用。',
    ar: 'يُستدعى بعدد الثواني المنقضية عند الاحتفاظ بالتسجيلة.',
  },
  vrOnCancel: {
    en: 'Called when a take is thrown away.',
    es: 'Se llama cuando se descarta una toma.',
    fr: "Appelé quand une prise est jetée.",
    de: 'Wird aufgerufen, wenn eine Aufnahme verworfen wird.',
    ja: 'テイクを破棄したときに呼ばれる。',
    pt: 'Chamado quando uma gravação é deitada fora.',
    zh: '当某段录音被丢弃时调用。',
    ar: 'يُستدعى عند التخلّص من التسجيلة.',
  },
  vrMaxDuration: {
    en: 'Seconds after which the recording stops itself and offers the take.',
    es: 'Segundos tras los cuales la grabación se detiene sola y ofrece la toma.',
    fr: "Secondes après lesquelles l'enregistrement s'arrête seul et propose la prise.",
    de: 'Sekunden, nach denen die Aufnahme sich selbst stoppt und die Aufnahme anbietet.',
    ja: 'この秒数を超えると録音は自ら停止し、テイクを差し出す。',
    pt: 'Segundos após os quais a gravação se detém sozinha e oferece a gravação.',
    zh: '超过该秒数后录音会自行停止并交出该段录音。',
    ar: 'الثواني التي يتوقّف بعدها التسجيل تلقائيًا ويقدّم التسجيلة.',
  },
  vrCancelThreshold: {
    en: 'Travel toward the INLINE START, in CSS pixels, that cancels the take — not leftward, so an Arabic user does not slide toward send to cancel.',
    es: 'Recorrido hacia el INICIO DE LÍNEA, en píxeles CSS, que cancela la toma; no hacia la izquierda, para que una usuaria árabe no deslice hacia enviar para cancelar.',
    fr: "Course vers le DÉBUT DE LIGNE, en pixels CSS, qui annule la prise — pas vers la gauche, pour qu'un utilisateur arabe ne glisse pas vers envoyer pour annuler.",
    de: 'Weg zum ZEILENANFANG in CSS-Pixeln, der die Aufnahme abbricht — nicht nach links, damit ein arabischer Nutzer zum Abbrechen nicht Richtung Senden schiebt.',
    ja: 'テイクを取り消す、行頭方向への移動距離（CSS ピクセル）。左方向ではない — アラビア語話者が取り消すために送信ボタン側へ滑らせずに済むように。',
    pt: 'Percurso até ao INÍCIO DA LINHA, em píxeis CSS, que cancela a gravação — não para a esquerda, para um utilizador árabe não deslizar em direção a enviar para cancelar.',
    zh: '取消录音所需的向"行首"方向滑动距离（CSS 像素）——不是向左，这样阿拉伯语用户不必朝发送按钮方向滑动来取消。',
    ar: 'المسافة نحو بداية السطر، بوحدات بكسل CSS، التي تلغي التسجيلة — وليست نحو اليسار، حتى لا يضطر مستخدم عربي للسحب باتجاه زر الإرسال كي يلغي.',
  },
  vrLockable: {
    en: 'Lets a hold become a hands-free recording.',
    es: 'Permite que una pulsación sostenida se convierta en una grabación con manos libres.',
    fr: 'Permet à un maintien de devenir un enregistrement mains libres.',
    de: 'Lässt ein Halten zu einer freihändigen Aufnahme werden.',
    ja: '長押しをハンズフリー録音に切り替えられるようにする。',
    pt: 'Permite que um toque prolongado se torne uma gravação sem mãos.',
    zh: '允许长按转为免手持的持续录音。',
    ar: 'يتيح تحويل الضغط المطوّل إلى تسجيل بلا يدين.',
  },
});

/** Accessibility and usage lines. */
const pn = defineMessages({
  cbA11y1: {
    en: 'The bar is a `form` region with an accessible name, so a reader can jump to the composer and knows what the controls belong to.',
    es: 'La barra es una región `form` con nombre accesible, así un lector puede saltar al redactor y sabe a qué pertenecen los controles.',
    fr: "La barre est une région `form` avec un nom accessible, ainsi un lecteur peut sauter à la zone de rédaction et sait à quoi appartiennent les contrôles.",
    de: 'Die Leiste ist eine `form`-Region mit zugänglichem Namen, sodass ein Reader zum Editor springen kann und weiß, wozu die Steuerelemente gehören.',
    ja: 'バーはアクセシブルネームを持つ `form` 領域。読み上げユーザーは作成欄へ直接跳べ、各コントロールが何に属すかも分かる。',
    pt: 'A barra é uma região `form` com nome acessível, para um leitor poder saltar para o editor e saber a que pertencem os controlos.',
    zh: '编辑栏是一个带可访问名称的 `form` 区域，读屏用户可以直接跳到编辑器，并知道这些控件属于什么。',
    ar: 'الشريط منطقة `form` باسم وصولي، فيستطيع القارئ القفز إلى المحرّر ويعرف إلى ماذا تنتمي الأزرار.',
  },
  cbA11y2: {
    en: 'Send is refused with `aria-disabled`, never removed: it stays in the tab order and its name carries the fix — nothing typed, an upload still running, over the limit, or a send already in flight. A `disabled` button leaves the tab order, and a control you cannot reach cannot tell you why it will not act.',
    es: 'El envío se rechaza con `aria-disabled`, nunca se retira: sigue en el orden de tabulación y su nombre lleva la solución (nada escrito, subida en curso, pasado del límite o envío ya en vuelo). Un botón `disabled` sale del orden de tabulación, y un control que no puedes alcanzar no puede decirte por qué no actúa.',
    fr: "L'envoi est refusé via `aria-disabled`, jamais retiré : il reste dans l'ordre de tabulation et son nom porte le correctif — rien de saisi, un envoi en cours, au-delà de la limite, ou un envoi déjà en vol. Un bouton `disabled` quitte l'ordre de tabulation, et un contrôle inatteignable ne peut pas dire pourquoi il n'agit pas.",
    de: 'Senden wird per `aria-disabled` verweigert, nie entfernt: Es bleibt in der Tab-Reihenfolge und sein Name trägt die Lösung — nichts geschrieben, ein Upload läuft, über dem Limit, oder ein Versand ist schon unterwegs. Ein `disabled`-Knopf verlässt die Tab-Reihenfolge, und ein unerreichbares Steuerelement kann nicht sagen, warum es nicht handelt.',
    ja: '送信は `aria-disabled` で拒否され、決して取り除かれない。タブ順に残り、名前が対処法を伝える（未入力・アップロード中・上限超過・送信中）。`disabled` 属性はタブ順から外れてしまい、届かないコントロールは理由を伝えられない。',
    pt: 'O envio é recusado com `aria-disabled`, nunca removido: continua na ordem de tabulação e o seu nome carrega a solução — nada escrito, um envio a decorrer, acima do limite, ou um envio já em curso. Um botão `disabled` sai da ordem de tabulação, e um controlo inalcançável não pode dizer porque não age.',
    zh: '发送用 `aria-disabled` 拒绝，而不是移除：它留在 Tab 顺序中，其名称说明了该怎么办——没有输入、上传未完成、超出上限，或已有一次发送在途。`disabled` 按钮会离开 Tab 顺序，而一个够不到的控件无法告诉你它为什么不动作。',
    ar: 'يُرفض الإرسال عبر `aria-disabled` ولا يُزال أبدًا: يبقى في ترتيب التنقل ويحمل اسمه الحلّ — لا شيء مكتوب، أو رفع جارٍ، أو تجاوز للحد، أو إرسال قيد التنفيذ. الزر `disabled` يخرج من ترتيب التنقل، والزر الذي لا يمكن بلوغه لا يستطيع إخبارك لماذا لا يعمل.',
  },
  cbA11y3: {
    en: 'The mention popup is a listbox the INPUT owns, through `aria-controls` and `aria-activedescendant`. Focus never moves into it, because moving focus into a popup on a phone dismisses the software keyboard in the middle of typing a name.',
    es: 'El popup de menciones es un listbox que posee el CAMPO, mediante `aria-controls` y `aria-activedescendant`. El foco nunca entra en él, porque mover el foco a un popup en un móvil cierra el teclado en pleno nombre.',
    fr: "La liste de mentions est une listbox que le CHAMP possède, via `aria-controls` et `aria-activedescendant`. Le focus n'y entre jamais : déplacer le focus vers une liste sur un téléphone referme le clavier logiciel en plein milieu d'un nom.",
    de: 'Das Erwähnungs-Popup ist eine Listbox, die das FELD besitzt — über `aria-controls` und `aria-activedescendant`. Der Fokus wandert nie hinein, denn Fokus in ein Popup schließt auf dem Telefon mitten im Namen die Bildschirmtastatur.',
    ja: 'メンション候補は入力欄が `aria-controls` と `aria-activedescendant` で所有する listbox。フォーカスは決して移らない — スマホでポップアップへフォーカスを移すと、名前を打っている最中にソフトキーボードが閉じてしまうから。',
    pt: 'O popup de menções é uma listbox que o CAMPO possui, através de `aria-controls` e `aria-activedescendant`. O foco nunca lá entra, porque mover o foco para um popup num telemóvel fecha o teclado a meio de um nome.',
    zh: '提及弹出列表是由输入框通过 `aria-controls` 和 `aria-activedescendant` 拥有的 listbox。焦点从不移入其中，因为在手机上把焦点移进弹层会在输入名字的中途收起软键盘。',
    ar: 'قائمة الإشارات هي listbox يملكها الحقل عبر `aria-controls` و`aria-activedescendant`. لا ينتقل التركيز إليها أبدًا، لأن نقل التركيز إلى قائمة على الهاتف يُغلق لوحة المفاتيح في منتصف كتابة الاسم.',
  },
  cbA11y4: {
    en: 'Upload progress is announced politely and in quarters, not per frame — the bar is the visual channel and a per-frame update would drown a reader. The counter and the context banner are `status` regions for the same reason.',
    es: 'El progreso de subida se anuncia con cortesía y por cuartos, no por fotograma: la barra es el canal visual y una actualización por fotograma ahogaría a un lector. El contador y el banner de contexto son regiones `status` por la misma razón.',
    fr: "La progression est annoncée poliment et par quarts, pas image par image — la barre est le canal visuel et une mise à jour par image noierait un lecteur. Le compteur et la bannière de contexte sont des régions `status` pour la même raison.",
    de: 'Der Upload-Fortschritt wird höflich und in Vierteln angesagt, nicht pro Frame — der Balken ist der visuelle Kanal, und eine Aktualisierung pro Frame würde einen Reader ertränken. Zähler und Kontext-Banner sind aus demselben Grund `status`-Regionen.',
    ja: 'アップロード進捗は polite に、しかも 4 分の 1 刻みで通知される。バーが視覚チャンネルであり、毎フレーム更新は読み上げを溺れさせるから。カウンターとコンテキストバナーが `status` 領域なのも同じ理由。',
    pt: 'O progresso do envio é anunciado com cortesia e em quartos, não por fotograma — a barra é o canal visual e uma atualização por fotograma afogaria um leitor. O contador e o banner de contexto são regiões `status` pela mesma razão.',
    zh: '上传进度以 polite 方式、按四分之一步进播报，而不是逐帧——进度条是视觉通道，逐帧更新会淹没读屏用户。计数器和上下文横幅也因同样原因是 `status` 区域。',
    ar: 'يُعلَن تقدّم الرفع بأدب وبأرباع لا بكل إطار — فالشريط هو القناة البصرية، والتحديث بكل إطار يُغرق القارئ. والعدّاد وشريط السياق منطقتا `status` للسبب نفسه.',
  },
  cbA11y5: {
    en: 'The recorder never requires a hold: activating the mic from the keyboard starts a locked recording — press to stop and keep, Escape to discard. The waveform is `aria-hidden` and disabled, so it is not a second tab stop inside a decorative subtree.',
    es: 'El grabador nunca exige mantener pulsado: activar el micro desde el teclado inicia una grabación bloqueada; pulsa para parar y conservar, Escape para descartar. La onda es `aria-hidden` y está deshabilitada, así no es un segundo punto de tabulación en un subárbol decorativo.',
    fr: "L'enregistreur n'exige jamais un maintien : activer le micro au clavier lance un enregistrement verrouillé — appuyez pour arrêter et conserver, Échap pour jeter. La forme d'onde est `aria-hidden` et désactivée, donc pas un second arrêt de tabulation dans un sous-arbre décoratif.",
    de: 'Der Rekorder verlangt nie ein Halten: Das Aktivieren des Mikros über die Tastatur startet eine gesperrte Aufnahme — drücken zum Stoppen und Behalten, Escape zum Verwerfen. Die Wellenform ist `aria-hidden` und deaktiviert, also kein zweiter Tabstopp in einem dekorativen Teilbaum.',
    ja: 'レコーダーは長押しを強制しない。キーボードからマイクを起動するとロック録音が始まり、押して停止＆保持、Escape で破棄。波形は `aria-hidden` かつ無効化されているので、装飾的な部分木の中に 2 つ目のタブストップを作らない。',
    pt: 'O gravador nunca exige manter premido: ativar o micro pelo teclado inicia uma gravação bloqueada — prima para parar e guardar, Escape para descartar. A onda é `aria-hidden` e está desativada, por isso não é uma segunda paragem de tabulação numa subárvore decorativa.',
    zh: '录音器从不要求长按：用键盘激活麦克风会开始锁定录音——按下停止并保留，Escape 丢弃。波形是 `aria-hidden` 且被禁用的，因此不会在装饰性子树中形成第二个 Tab 停靠点。',
    ar: 'لا يفرض المسجّل الضغط المطوّل: تفعيل الميكروفون من لوحة المفاتيح يبدأ تسجيلًا مقفلًا — اضغط للإيقاف والاحتفاظ، وEscape للتجاهل. والموجة `aria-hidden` ومعطّلة، فلا تصير محطة تنقّل ثانية داخل شجرة زخرفية.',
  },
  cbUse1: {
    en: 'Clear the value when the send LANDS, not when it starts. The bar deliberately never clears itself, because a failed send is exactly the moment the text matters most.',
    es: 'Limpia el valor cuando el envío LLEGA, no cuando empieza. La barra nunca se limpia sola a propósito: un envío fallido es justo el momento en que el texto más importa.',
    fr: "Videz la valeur quand l'envoi ABOUTIT, pas quand il démarre. La barre ne se vide jamais elle-même, à dessein : un envoi échoué est précisément le moment où le texte compte le plus.",
    de: 'Leeren Sie den Wert, wenn der Versand ANKOMMT, nicht wenn er beginnt. Die Leiste leert sich absichtlich nie selbst, denn ein fehlgeschlagener Versand ist genau der Moment, in dem der Text am meisten zählt.',
    ja: '値を消すのは送信が「届いた」ときで、始まったときではない。バーが自分で消さないのは意図的 — 送信が失敗した瞬間こそ、その文章が最も大切だから。',
    pt: 'Limpe o valor quando o envio CHEGA, não quando começa. A barra nunca se limpa de propósito: um envio falhado é precisamente o momento em que o texto mais importa.',
    zh: '在发送"到达"时清空取值，而不是在发送开始时。编辑栏刻意不自行清空，因为发送失败的那一刻，正是文本最重要的时候。',
    ar: 'امسح القيمة عندما «يصل» الإرسال لا عندما يبدأ. لا يمسح الشريط نفسه عمدًا، لأن لحظة فشل الإرسال هي بالضبط أهم لحظة للنص.',
  },
  cbUse2: {
    en: 'Uploading is yours. Move each attachment with `advanceAttachment` and hand the result back down; the tray displays progress and never drives it, the same line `FileUpload` draws.',
    es: 'La subida es tuya. Mueve cada adjunto con `advanceAttachment` y devuelve el resultado hacia abajo; la bandeja muestra el progreso y nunca lo dirige, la misma línea que traza `FileUpload`.',
    fr: "L'envoi vous appartient. Faites avancer chaque pièce jointe avec `advanceAttachment` et renvoyez le résultat vers le bas ; le bac affiche la progression sans jamais la piloter, la même ligne que trace `FileUpload`.",
    de: 'Das Hochladen gehört Ihnen. Bewegen Sie jeden Anhang mit `advanceAttachment` und reichen Sie das Ergebnis wieder hinunter; die Leiste zeigt den Fortschritt und treibt ihn nie — dieselbe Linie, die `FileUpload` zieht.',
    ja: 'アップロードは呼び出し側の仕事。各添付を `advanceAttachment` で進め、その結果を下へ渡す。トレイは進捗を表示するだけで駆動しない — `FileUpload` が引くのと同じ線。',
    pt: 'O envio é seu. Mova cada anexo com `advanceAttachment` e devolva o resultado para baixo; o tabuleiro mostra o progresso e nunca o conduz, a mesma linha que o `FileUpload` traça.',
    zh: '上传由你负责。用 `advanceAttachment` 推进每个附件，再把结果传回下层；托盘只显示进度、从不驱动进度，这与 `FileUpload` 划的是同一条界线。',
    ar: 'الرفع مسؤوليتك. حرّك كل مرفق بـ `advanceAttachment` وأعِد النتيجة إلى الأسفل؛ الدرج يعرض التقدّم ولا يقوده، وهو الخط نفسه الذي يرسمه `FileUpload`.',
  },
  cbUse3: {
    en: 'Leave `enterPolicy` on `auto` unless the product has a reason. Pinning `send` puts a send under a thumb on a phone; pinning `newline` costs a desktop user the fastest route they have.',
    es: 'Deja `enterPolicy` en `auto` salvo que el producto tenga un motivo. Fijar `send` pone un envío bajo el pulgar en el móvil; fijar `newline` le quita a quien usa escritorio su ruta más rápida.',
    fr: "Laissez `enterPolicy` sur `auto` sauf raison produit. Figer `send` place un envoi sous le pouce au téléphone ; figer `newline` prive l'utilisateur de bureau de sa voie la plus rapide.",
    de: 'Lassen Sie `enterPolicy` auf `auto`, sofern das Produkt keinen Grund hat. `send` zu fixieren legt einen Versand unter den Daumen am Telefon; `newline` zu fixieren kostet Desktop-Nutzer ihren schnellsten Weg.',
    ja: '製品固有の理由が無い限り `enterPolicy` は `auto` のままに。`send` に固定するとスマホで親指の下に送信が来るし、`newline` に固定するとデスクトップの最速経路を奪う。',
    pt: 'Deixe `enterPolicy` em `auto` a não ser que o produto tenha uma razão. Fixar `send` põe um envio debaixo do polegar no telemóvel; fixar `newline` custa ao utilizador de secretária o caminho mais rápido que tem.',
    zh: '除非产品另有理由，否则把 `enterPolicy` 留在 `auto`。固定为 `send` 会让手机上的拇指下方多出一个发送；固定为 `newline` 则夺走桌面用户最快的路径。',
    ar: 'اترك `enterPolicy` على `auto` ما لم يكن للمنتج سبب. تثبيتها على `send` يضع الإرسال تحت الإبهام على الهاتف؛ وتثبيتها على `newline` يسلب مستخدم سطح المكتب أسرع طريق لديه.',
  },
  cbUse4: {
    en: 'Pass `limit` only where a real cap exists. An always-visible counter is a number nobody reads, and it turns a chat box into a form.',
    es: 'Pasa `limit` solo donde haya un tope real. Un contador siempre visible es un número que nadie lee, y convierte un cuadro de chat en un formulario.',
    fr: "Ne passez `limit` que là où un vrai plafond existe. Un compteur toujours visible est un nombre que personne ne lit, et il transforme une zone de discussion en formulaire.",
    de: 'Übergeben Sie `limit` nur, wo es eine echte Grenze gibt. Ein immer sichtbarer Zähler ist eine Zahl, die niemand liest, und macht aus einem Chatfeld ein Formular.',
    ja: '本当に上限があるときだけ `limit` を渡す。常時表示のカウンターは誰も読まない数字であり、チャット欄をフォームに変えてしまう。',
    pt: 'Passe `limit` apenas onde exista um limite real. Um contador sempre visível é um número que ninguém lê, e transforma uma caixa de conversa num formulário.',
    zh: '只在确实存在上限时传入 `limit`。始终可见的计数器是没人会读的数字，还会把聊天框变成表单。',
    ar: 'مرّر `limit` فقط حيث يوجد حدّ حقيقي. فالعدّاد الظاهر دائمًا رقم لا يقرأه أحد، ويحوّل صندوق المحادثة إلى نموذج.',
  },
});

// ---- demo data -------------------------------------------------------------

/**
 * Names and handles are left as literals: they are sample data rather than UI
 * copy, and translating a person's name would be wrong in every locale. The
 * group headings around them are translated, because those ARE UI copy.
 */
function useMentionCandidates(): MentionCandidate[] {
  const t = useT();
  const people = t(pm.cbGroupPeople);
  const channels = t(pm.cbGroupChannels);
  return [
    { id: 'ada', label: 'Ada Lovelace', handle: '@ada', group: people },
    { id: 'ana', label: 'Ana Ruiz', handle: '@ana', group: people },
    { id: 'bryan', label: 'Bryan Cantrill', handle: '@bcantrill', group: people },
    { id: 'grace', label: 'Grace Hopper', handle: '@grace', group: people },
    { id: 'kenji', label: 'Kenji Tanaka', handle: '@kenji', group: people, disabled: true },
    { id: 'ops', label: 'ops', handle: '#ops', group: channels },
    { id: 'incidents', label: 'incidents', handle: '#incidents', group: channels },
    { id: 'design', label: 'design-system', handle: '#design-system', group: channels },
  ];
}

function useCommandCandidates(): MentionCandidate[] {
  const t = useT();
  const commands = t(pm.cbGroupCommands);
  return [
    { id: 'giphy', label: 'giphy', handle: '/giphy', group: commands, keywords: 'gif image' },
    { id: 'remind', label: 'remind', handle: '/remind', group: commands, keywords: 'later timer' },
    { id: 'shrug', label: 'shrug', handle: '/shrug', group: commands },
    { id: 'status', label: 'status', handle: '/status', group: commands, keywords: 'away presence' },
  ];
}

/** A pending file, plus the fraction at which this demo makes it fail. */
interface DemoAttachment extends ComposeAttachment {
  mimeType?: string;
  failAt?: number;
}

const SAMPLES: { name: string; size: number; mimeType: string; failAt?: number }[] = [
  { name: 'quarterly-roadmap-final.pdf', size: 2_400_000, mimeType: 'application/pdf' },
  { name: 'screenshot-of-the-regression.png', size: 812_000, mimeType: 'image/png', failAt: 0.55 },
  { name: 'standup-recording.m4a', size: 1_100_000, mimeType: 'audio/mp4' },
];

const seedAttachments = (count: number): DemoAttachment[] =>
  SAMPLES.slice(0, count).map((sample, index) => ({
    id: `sample-${index}`,
    name: sample.name,
    size: sample.size,
    status: 'pending' as const,
    mimeType: sample.mimeType,
    failAt: sample.failAt,
  }));

/**
 * A stand-in for the transport an app would own: it ticks each file through
 * `advanceAttachment` — the real state machine, not a mock of one — so the tray
 * demos show the transitions a real upload produces, including the illegal ones
 * being refused (a `progress` after a `cancel` never lands, because the chip is
 * already gone from the list).
 */
function useUploadSim(initial: number) {
  const t = useT();
  const error = t(pm.cbUploadError);
  const [items, setItems] = useState<DemoAttachment[]>(() => seedAttachments(initial));
  const nextId = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setItems((current) => {
        let changed = false;
        const next = current.map((item) => {
          const carry = (moved: ComposeAttachment, failAt?: number): DemoAttachment =>
            moved === item ? item : { ...moved, mimeType: item.mimeType, failAt };
          if (item.status === 'pending') {
            changed = true;
            return carry(advanceAttachment(item, 'start'), item.failAt);
          }
          if (item.status !== 'uploading') return item;
          const progress = (item.progress ?? 0) + 0.09;
          changed = true;
          if (item.failAt !== undefined && progress >= item.failAt) {
            return carry(advanceAttachment(item, 'fail', { error }), undefined);
          }
          return progress >= 1
            ? carry(advanceAttachment(item, 'succeed'), item.failAt)
            : carry(advanceAttachment(item, 'progress', { progress }), item.failAt);
        });
        return changed ? next : current;
      });
    }, 320);
    return () => clearInterval(id);
  }, [error]);

  const addSample = () => {
    const sample = SAMPLES[nextId.current % SAMPLES.length] as (typeof SAMPLES)[number];
    nextId.current += 1;
    setItems((current) => [
      ...current,
      {
        id: `added-${nextId.current}`,
        name: sample.name,
        size: sample.size,
        status: 'pending',
        mimeType: sample.mimeType,
      },
    ]);
  };

  const addFiles = (files: File[]) => {
    setItems((current) => [
      ...current,
      ...files.map((file, index) => {
        nextId.current += 1;
        return {
          id: `file-${nextId.current}-${index}`,
          name: file.name,
          size: file.size,
          status: 'pending' as const,
          mimeType: file.type,
        };
      }),
    ]);
  };

  // The owner drops canceled attachments from its list, so a cancel removes the
  // chip rather than leaving a terminal one behind.
  const cancel = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const retry = (id: string) =>
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...advanceAttachment(item, 'retry'), mimeType: item.mimeType } : item,
      ),
    );
  const reset = (count: number) => setItems(seedAttachments(count));

  // `failAt` is this demo's bookkeeping, not the attachment's, and the chip
  // spreads whatever it is handed onto its <li> — so it is stripped here rather
  // than shipped to the DOM as an unknown attribute.
  const visible = items.map(({ failAt: _failAt, ...attachment }) => attachment);

  return { items: visible, addSample, addFiles, cancel, retry, reset };
}

// ---- demos -----------------------------------------------------------------

/**
 * The whole bar, wired the way an app wires it: the value is the page's, the
 * send is asynchronous, and the outcome is a switch so the failed state is
 * reachable on purpose rather than by breaking something.
 */
function ComposeDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const mentions = useMentionCandidates();
  const commands = useCommandCandidates();
  const uploads = useUploadSim(0);

  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [outcome, setOutcome] = useState('deliver');
  const [log, setLog] = useState<string | null>(null);
  const [context, setContext] = useState<ComposeContext | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const send = (text: string) => {
    setSending(true);
    setFailed(false);
    timer.current = setTimeout(() => {
      setSending(false);
      if (outcome === 'fail') {
        // The value is deliberately NOT cleared: a failed send is the moment
        // the text matters most.
        setFailed(true);
        return;
      }
      setValue('');
      setContext(undefined);
      uploads.reset(0);
      setLog(t(pm.cbSentLog, { text }));
    }, 1100);
  };

  return (
    <Stack gap={4} style={{ width: '100%' }}>
      <Row gap={4} wrap align="center">
        <Text size={Size.Small} tone={TextTone.Muted}>
          {t(pm.cbOutcomeLabel)}
        </Text>
        <SegmentedControl
          size={Size.Small}
          aria-label={t(pm.cbOutcomeLabel)}
          value={outcome}
          onValueChange={setOutcome}
          options={[
            { value: 'deliver', label: t(pm.cbOutcomeDeliver) },
            { value: 'fail', label: t(pm.cbOutcomeFail) },
          ]}
        />
        <Button size={Size.Small} variant="ghost" onClick={uploads.addSample}>
          {t(pm.cbAddFile)}
        </Button>
        <Button
          size={Size.Small}
          variant="ghost"
          onClick={() =>
            setContext({ mode: 'reply', author: 'Ada Lovelace', preview: t(pm.cbReplyPreview) })
          }
        >
          {t(pm.cbAddContext)}
        </Button>
      </Row>

      <K.ComposeBar
        value={value}
        onValueChange={setValue}
        onSend={send}
        attachments={uploads.items}
        onFiles={uploads.addFiles}
        onAttachmentCancel={uploads.cancel}
        onAttachmentRetry={uploads.retry}
        context={context}
        onContextDismiss={() => setContext(undefined)}
        mentions={mentions}
        commands={commands}
        onVoice={(seconds) => setLog(t(pm.cbVoiceLog, { seconds: Math.round(seconds) }))}
        sending={sending}
        failed={failed}
        limit={280}
      />

      {log && (
        <Text size={Size.Small} tone={TextTone.Muted}>
          {log}
        </Text>
      )}
    </Stack>
  );
}

/** One labelled send control per state, with the refusals told apart by name. */
function SendStatesDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  // Static on purpose: these are the six things the control can look and sound
  // like. The working composer above is where the transitions actually run.
  const states: { key: string; node: ReturnType<typeof K.SendButton>; label: string }[] = [
    { key: 'nothing', node: <K.SendButton state="empty" blockReason="empty" />, label: t(pm.cbStateNothing) },
    { key: 'uploading', node: <K.SendButton state="empty" blockReason="uploading" />, label: t(pm.cbStateUploading) },
    { key: 'over', node: <K.SendButton state="empty" blockReason="over-limit" />, label: t(pm.cbStateOverLimit) },
    { key: 'ready', node: <K.SendButton state="ready" />, label: t(pm.cbStateReady) },
    { key: 'sending', node: <K.SendButton state="sending" />, label: t(pm.cbStateSending) },
    { key: 'failed', node: <K.SendButton state="failed" />, label: t(pm.cbStateFailed) },
  ];
  return (
    <Row gap={6} wrap align="start" style={{ width: '100%' }}>
      {states.map((state) => (
        <Stack key={state.key} gap={2} align="center" style={{ flex: '0 0 auto', maxWidth: '11rem' }}>
          {state.node}
          <Text size={Size.Small} tone={TextTone.Muted} style={{ textAlign: 'center' }}>
            {state.label}
          </Text>
        </Stack>
      ))}
    </Row>
  );
}

/** One field per resolved policy, each pinned so a desktop can feel both. */
function EnterPolicyDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  return (
    <Stack gap={6} style={{ width: '100%' }}>
      <EnterPane K={K} touch={false} caption={t(pm.cbEnterFine)} />
      <EnterPane K={K} touch caption={t(pm.cbEnterCoarse)} />
      <Callout tone="note">{prose(t(pm.cbEnterAlways))}</Callout>
    </Stack>
  );
}

function EnterPane({ K, touch, caption }: { K: PlatformKit; touch: boolean; caption: string }) {
  const t = useT();
  const [value, setValue] = useState('');
  const [sends, setSends] = useState(0);
  return (
    <Stack gap={2} style={{ width: '100%' }}>
      <Row gap={3} wrap align="center">
        <Text size={Size.Small} tone={TextTone.Muted}>
          {caption}
        </Text>
        <Kbd>{'Enter'}</Kbd>
        <Text size={Size.Small} tone={TextTone.Muted}>
          {t(pm.cbEnterSent, { count: sends })}
        </Text>
      </Row>
      <K.MessageInput
        value={value}
        onValueChange={setValue}
        onSend={() => {
          setSends((n) => n + 1);
          setValue('');
        }}
        touch={touch}
        minRows={2}
        maxRows={5}
        aria-label={caption}
      />
    </Stack>
  );
}

/** All three banner modes at once, each dismissible and restorable. */
function ContextBannerDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [shown, setShown] = useState<string[]>(['reply', 'edit', 'forward']);
  const drop = (mode: string) => setShown((current) => current.filter((m2) => m2 !== mode));
  return (
    <Stack gap={4} style={{ width: '100%' }}>
      {shown.includes('reply') && (
        <K.ComposeContextBanner
          mode="reply"
          author="Ada Lovelace"
          preview={t(pm.cbReplyPreview)}
          onDismiss={() => drop('reply')}
        />
      )}
      {shown.includes('edit') && (
        <K.ComposeContextBanner mode="edit" preview={t(pm.cbEditPreview)} onDismiss={() => drop('edit')} />
      )}
      {shown.includes('forward') && (
        <K.ComposeContextBanner
          mode="forward"
          count={3}
          preview={t(pm.cbForwardPreview)}
          onDismiss={() => drop('forward')}
        />
      )}
      {shown.length < 3 && (
        <Row>
          <Button size={Size.Small} variant="ghost" onClick={() => setShown(['reply', 'edit', 'forward'])}>
            {t(pm.cbContextReset)}
          </Button>
        </Row>
      )}
    </Stack>
  );
}

/** The tray with live uploads, one of which fails so the retry is reachable. */
function TrayDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const uploads = useUploadSim(3);
  return (
    <Stack gap={4} style={{ width: '100%' }}>
      <K.AttachmentTray
        attachments={uploads.items}
        onCancel={uploads.cancel}
        onRetry={uploads.retry}
      />
      <Row gap={3} wrap>
        <Button size={Size.Small} variant="ghost" onClick={() => uploads.reset(3)}>
          {t(pm.cbTrayReset)}
        </Button>
        <Button size={Size.Small} variant="ghost" onClick={uploads.addSample}>
          {t(pm.cbAddFile)}
        </Button>
      </Row>
    </Stack>
  );
}

/** The popup on its own, driven by a plain field standing in for the caret. */
function MentionPopupDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const candidates = useMentionCandidates();
  const [query, setQuery] = useState('a');
  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <Stack gap={3} style={{ width: '100%' }}>
      {/* The popup anchors above its field, so the demo reserves the room it
          floats into rather than letting it paint over the prose above. */}
      <div style={{ position: 'relative', minHeight: '17rem', display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <K.MentionAutocomplete
            open
            query={query}
            trigger="@"
            candidates={candidates}
            cursor={cursor}
            onCursorChange={setCursor}
            onChoose={(id) => {
              const match = candidates.find((candidate) => candidate.id === id);
              setChosen(match ? match.label : id);
            }}
          />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setCursor(0);
            }}
            aria-label={t(pm.cbQueryLabel)}
            placeholder={t(pm.cbQueryLabel)}
          />
        </div>
      </div>
      {chosen && (
        <Text size={Size.Small} tone={TextTone.Muted}>
          {t(pm.cbChosenLog, { label: chosen })}
        </Text>
      )}
    </Stack>
  );
}

/** The four levels side by side, then a live bar that can be pushed negative. */
function CounterDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [value, setValue] = useState('');
  const rows: { key: string; length: number; label: string }[] = [
    { key: 'far', length: 120, label: t(pm.cbCounterHidden) },
    { key: 'near', length: 230, label: t(pm.cbCounterNear) },
    { key: 'close', length: 262, label: t(pm.cbCounterClose) },
    { key: 'over', length: 291, label: t(pm.cbCounterOver) },
  ];
  return (
    <Stack gap={5} style={{ width: '100%' }}>
      <Row gap={6} wrap align="start">
        {rows.map((row) => (
          <Stack key={row.key} gap={2} align="center" style={{ flex: '0 0 auto', maxWidth: '11rem' }}>
            <K.CharacterCounter length={row.length} limit={280} />
            <Text size={Size.Small} tone={TextTone.Muted} style={{ textAlign: 'center' }}>
              {row.label}
            </Text>
          </Stack>
        ))}
      </Row>
      <Text size={Size.Small} tone={TextTone.Muted}>
        {t(pm.cbCounterLiveHint)}
      </Text>
      <K.ComposeBar value={value} onValueChange={setValue} limit={32} />
    </Stack>
  );
}

/** The recorder at rest, and a real take with no microphone behind it. */
function VoiceDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [log, setLog] = useState<string | null>(null);
  return (
    <Stack gap={4} style={{ width: '100%' }}>
      <Callout tone="note">{prose(t(pm.cbVoiceNote))}</Callout>
      <Row gap={6} wrap align="center">
        <Stack gap={2} align="center">
          <K.VoiceRecorder
            meter={null}
            onSend={(seconds) => setLog(t(pm.cbVoiceLog, { seconds: Math.round(seconds) }))}
            onCancel={() => setLog(null)}
          />
          <Text size={Size.Small} tone={TextTone.Muted}>
            {t(pm.cbVoiceResting)}
          </Text>
        </Stack>
        <Text size={Size.Small} tone={TextTone.Muted}>
          {t(pm.cbVoiceLive)}
        </Text>
      </Row>
      <Callout tone="note">{prose(t(pm.cbVoiceKeyboard))}</Callout>
      {log && (
        <Text size={Size.Small} tone={TextTone.Muted}>
          {log}
        </Text>
      )}
    </Stack>
  );
}

/** The three densities stacked, so the packing difference is legible. */
function DensityDemo({ K }: { K: PlatformKit }) {
  return (
    <Stack gap={5} style={{ width: '100%' }}>
      {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
        <Stack key={density} gap={2} style={{ width: '100%' }}>
          <Text size={Size.Small} tone={TextTone.Muted}>
            <code>{density}</code>
          </Text>
          <K.ComposeBar density={density} defaultValue="" onSend={() => undefined} />
        </Stack>
      ))}
    </Stack>
  );
}

// ---- the page --------------------------------------------------------------

export function ComposeBarPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(pm.cbName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(pm.cbLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(pm.cbAnatomy)}</Text>
      <ComponentBlueprint specId="compose-bar" />
      <ul>
        <li>{prose(t(pm.cbPartBar))}</li>
        <li>{prose(t(pm.cbPartInput))}</li>
        <li>{prose(t(pm.cbPartSend))}</li>
        <li>{prose(t(pm.cbPartTray))}</li>
        <li>{prose(t(pm.cbPartChip))}</li>
        <li>{prose(t(pm.cbPartBanner))}</li>
        <li>{prose(t(pm.cbPartMention))}</li>
        <li>{prose(t(pm.cbPartCounter))}</li>
        <li>{prose(t(pm.cbPartVoice))}</li>
      </ul>

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(pm.cbExBarTitle)}
        description={prose(t(pm.cbExBarDesc))}
        component="ComposeBar"
        platformLayout="stacked"
        render={(K) => <ComposeDemo K={K} />}
        code={`import { ComposeBar } from '@glacier/react';

const [value, setValue] = useState('');
const [sending, setSending] = useState(false);
const [failed, setFailed] = useState(false);

<ComposeBar
  value={value}
  onValueChange={setValue}
  // The bar never clears itself. Clear on the response, not on the press:
  // a failed send is exactly when the text matters most.
  onSend={async (text, attachments) => {
    setSending(true);
    setFailed(false);
    try {
      await api.send(text, attachments);
      setValue('');
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }}
  attachments={attachments}
  onFiles={upload}
  mentions={people}
  commands={slashCommands}
  onVoice={(seconds) => sendVoiceNote(seconds)}
  sending={sending}
  failed={failed}
  limit={280}
/>`}
      />

      <Example
        title={t(pm.cbExSendTitle)}
        description={prose(t(pm.cbExSendDesc))}
        component="SendButton"
        platformLayout="stacked"
        render={(K) => <SendStatesDemo K={K} />}
        code={`import { SendButton } from '@glacier/react';
import { canSendCompose, composeSendState } from '@glacier/logic';

const input = { text, attachments, sending, failed, limit };

// One call decides the paint, another decides the words. The reason is not a
// boolean: four refusals that look identical must not sound identical.
<SendButton
  state={composeSendState(input)}
  blockReason={canSendCompose(input).reason}
  onSend={send}
  onRetry={retry}
/>`}
      />

      <Example
        title={t(pm.cbExEnterTitle)}
        description={prose(t(pm.cbExEnterDesc))}
        component="MessageInput"
        platformLayout="stacked"
        render={(K) => <EnterPolicyDemo K={K} />}
        code={`import { MessageInput } from '@glacier/react';

// 'auto' is the default and resolves against (pointer: coarse):
// Enter sends on a keyboard, and writes a newline on a touch device where
// the send button is the only route that cannot be mistyped.
<MessageInput value={value} onValueChange={setValue} onSend={send} />

// The device fact can be pinned. Docs and tests need a fixed platform;
// apps almost never should.
<MessageInput touch={false} … />  // Enter sends
<MessageInput touch … />          // Enter writes a newline

// Under either policy:
//   Shift+Enter     → newline, always
//   Cmd/Ctrl+Enter  → send, always
//   Enter mid-IME   → belongs to the composition, never to the composer`}
      />

      <Example
        title={t(pm.cbExContextTitle)}
        description={prose(t(pm.cbExContextDesc))}
        component="ComposeContextBanner"
        platformLayout="stacked"
        render={(K) => <ContextBannerDemo K={K} />}
        code={`import { ComposeContextBanner } from '@glacier/react';

<ComposeContextBanner mode="reply" author="Ada Lovelace" preview={quoted} onDismiss={clear} />
<ComposeContextBanner mode="edit" preview={original} onDismiss={cancelEdit} />
<ComposeContextBanner mode="forward" count={3} preview={first} onDismiss={cancelForward} />

// Or hand the same three to the bar, which renders the strip for you and
// wires Escape to the dismiss:
<ComposeBar context={{ mode: 'reply', author, preview }} onContextDismiss={clear} … />`}
      />

      <Example
        title={t(pm.cbExAttachTitle)}
        description={prose(t(pm.cbExAttachDesc))}
        component="AttachmentTray"
        platformLayout="stacked"
        render={(K) => <TrayDemo K={K} />}
        code={`import { AttachmentTray } from '@glacier/react';
import { advanceAttachment } from '@glacier/logic';

// The kit does not transport. The owner moves each attachment and hands the
// result back down; illegal moves return the SAME object, so a 'progress'
// arriving after a 'cancel' is refused instead of resurrecting the chip.
const onProgress = (id, fraction) =>
  setAttachments((current) =>
    current.map((a) => (a.id === id ? advanceAttachment(a, 'progress', { progress: fraction }) : a)),
  );

<AttachmentTray
  attachments={attachments}
  onCancel={(id) => setAttachments((c) => c.filter((a) => a.id !== id))}
  onRetry={(id) => setAttachments((c) => c.map((a) => (a.id === id ? advanceAttachment(a, 'retry') : a)))}
/>`}
      />

      <Example
        title={t(pm.cbExMentionTitle)}
        description={prose(t(pm.cbExMentionDesc))}
        component="ComposeBar"
        platformLayout="stacked"
        render={(K) => <ComposeDemo K={K} />}
        code={`const people = [
  { id: 'ada', label: 'Ada Lovelace', handle: '@ada', group: 'People' },
  // Found by the handle as well as the label: the handle is folded into the
  // searched keywords before matching.
  { id: 'bryan', label: 'Bryan Cantrill', handle: '@bcantrill', group: 'People' },
  { id: 'ops', label: 'ops', handle: '#ops', group: 'Channels' },
];

<ComposeBar mentions={people} commands={slashCommands} … />`}
      />

      <Example
        title={t(pm.cbExPopupTitle)}
        description={prose(t(pm.cbExPopupDesc))}
        component="MentionAutocomplete"
        platformLayout="stacked"
        render={(K) => <MentionPopupDemo K={K} />}
        code={`import { MentionAutocomplete } from '@glacier/react';
import { applyMention, mentionMatches, mentionQuery } from '@glacier/logic';

const token = mentionQuery(value, caret);            // the token at the caret, or null
const matches = mentionMatches(candidates, token?.query ?? '');

<MentionAutocomplete
  open={token !== null}
  query={token?.query ?? ''}
  trigger={token?.trigger ?? '@'}
  candidates={candidates}
  cursor={cursor}
  onCursorChange={setCursor}
  onChoose={(id) => {
    const next = applyMention(value, token, mentionInsertion(byId(id)));
    setValue(next.text);   // next.caret is where the caret has to land
  }}
/>`}
      />

      <Example
        title={t(pm.cbExCounterTitle)}
        description={prose(t(pm.cbExCounterDesc))}
        component="CharacterCounter"
        platformLayout="stacked"
        render={(K) => <CounterDemo K={K} />}
        code={`import { CharacterCounter } from '@glacier/react';
import { countCharacters } from '@glacier/logic';

// countCharacters, not String.length: one emoji is one character, and a
// counter that charges two for 😀 is a counter people stop trusting.
<CharacterCounter length={countCharacters(value)} limit={280} />

// Or let the bar place it, which also blocks send while over the limit:
<ComposeBar limit={280} … />`}
      />

      <Example
        title={t(pm.cbExVoiceTitle)}
        description={prose(t(pm.cbExVoiceDesc))}
        component="VoiceRecorder"
        platformLayout="stacked"
        render={(K) => <VoiceDemo K={K} />}
        code={`import { VoiceRecorder } from '@glacier/react';

// The host owns the microphone. Build the AudioContext inside a user gesture
// (WebKit mutes one built outside a gesture for good) and hand down a reader.
const meter = useMemo(() => () => analyser.getLoudness(), [analyser]);

<VoiceRecorder
  meter={meter}
  onStart={openMicrophone}
  onSend={(seconds) => uploadTake(seconds)}
  onCancel={discardTake}
  maxDuration={300}
/>

// Or let the bar place it beside send. Omit onVoice and it is not rendered.
<ComposeBar onVoice={uploadTake} voiceMeter={meter} … />`}
      />

      <Example
        title={t(pm.cbExDensityTitle)}
        description={prose(t(pm.cbExDensityDesc))}
        component="ComposeBar"
        platformLayout="stacked"
        render={(K) => <DensityDemo K={K} />}
        code={`<ComposeBar density="compact" … />
<ComposeBar density="comfortable" … />   // the default
<ComposeBar density="spacious" … />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={prose(t(pm.cbExSkeletonDesc))}
        component="ComposeBar"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={5} style={{ width: '100%' }}>
            <K.ComposeBar skeleton onFiles={() => undefined} />
            <K.ComposeBar glass onFiles={() => undefined} />
          </Stack>
        )}
        code={`<ComposeBar skeleton />
<ComposeBar glass />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>
        <code>ComposeBar</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: t(pp.cbPropValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(pp.cbPropOnValueChange) },
          {
            name: 'onSend',
            type: '(text: string, attachments: readonly ComposeAttachment[]) => void',
            description: t(pp.cbPropOnSend),
          },
          { name: 'attachments', type: 'readonly ComposeAttachment[]', default: '[]', description: t(pp.cbPropAttachments) },
          { name: 'onFiles', type: '(files: File[]) => void', description: t(pp.cbPropOnFiles) },
          { name: 'onAttachmentCancel', type: '(id: string) => void', description: t(pp.cbPropOnAttachmentCancel) },
          { name: 'onAttachmentRetry', type: '(id: string) => void', description: t(pp.cbPropOnAttachmentRetry) },
          { name: 'context', type: 'ComposeContext', description: t(pp.cbPropContext) },
          { name: 'limit', type: 'number', description: t(pp.cbPropLimit) },
          { name: 'sending', type: 'boolean', default: 'false', description: t(pp.cbPropSending) },
          { name: 'failed', type: 'boolean', default: 'false', description: t(pp.cbPropFailed) },
          { name: 'mentions', type: 'readonly MentionCandidate[]', description: t(pp.cbPropMentions) },
          { name: 'commands', type: 'readonly MentionCandidate[]', description: t(pp.cbPropCommands) },
          { name: 'onVoice', type: '(seconds: number) => void', description: t(pp.cbPropOnVoice) },
          { name: 'enterPolicy', type: "'send' | 'newline' | 'auto'", default: "'auto'", description: t(pp.cbPropEnterPolicy) },
          { name: 'density', type: "'compact' | 'comfortable' | 'spacious'", default: "'comfortable'", description: t(pp.cbPropDensity) },
          { name: 'maxRows', type: 'number', default: '6', description: t(pp.cbPropMaxRows) },
          { name: 'touch', type: 'boolean', description: t(pp.cbPropTouch) },
          { name: 'glass', type: 'boolean', default: 'false', description: t(pp.cbPropGlass) },
        ]}
      />

      <Heading level={3}>
        <code>MessageInput</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: t(pp.cbPropValue) },
          { name: 'onValueChange', type: '(value: string) => void', description: t(pp.cbPropOnValueChange) },
          { name: 'onSend', type: '(value: string) => void', description: t(sp.miOnSend) },
          { name: 'enterPolicy', type: "'send' | 'newline' | 'auto'", default: "'auto'", description: t(pp.cbPropEnterPolicy) },
          { name: 'minRows', type: 'number', default: '1', description: t(sp.miMinRows) },
          { name: 'maxRows', type: 'number', default: '6', description: t(pp.cbPropMaxRows) },
          { name: 'onPasteFiles', type: '(files: File[]) => void', description: t(sp.miPasteFiles) },
          { name: 'onCaretChange', type: '(caret: number) => void', description: t(sp.miCaret) },
          { name: 'touch', type: 'boolean', description: t(pp.cbPropTouch) },
          { name: 'bare', type: 'boolean', default: 'false', description: t(sp.miBare) },
        ]}
      />

      <Heading level={3}>
        <code>SendButton</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'state', type: "'empty' | 'ready' | 'sending' | 'failed'", default: "'empty'", description: t(sp.sbState) },
          { name: 'blockReason', type: 'ComposeBlockReason', description: t(sp.sbBlockReason) },
          { name: 'onSend', type: '() => void', description: t(sp.miOnSend) },
          { name: 'onRetry', type: '() => void', description: t(sp.sbOnRetry) },
          { name: 'labels', type: 'Partial<SendButtonLabels>', description: t(sp.sbLabels) },
        ]}
      />

      <Heading level={3}>
        <code>AttachmentTray</code> / <code>AttachmentChip</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'attachments', type: 'readonly ComposeAttachment[]', description: t(sp.atAttachments) },
          { name: 'onCancel', type: '(id: string) => void', description: t(sp.atOnCancel) },
          { name: 'onRetry', type: '(id: string) => void', description: t(pp.cbPropOnAttachmentRetry) },
          { name: 'aria-label', type: 'string', description: t(sp.atAriaLabel) },
          { name: 'name', type: 'string', description: t(sp.acName) },
          { name: 'status', type: 'ComposeAttachmentStatus', default: "'pending'", description: t(sp.acStatus) },
          { name: 'progress', type: 'number', description: t(sp.acProgress) },
          { name: 'error', type: 'string', description: t(sp.acError) },
          { name: 'mimeType', type: 'string', description: t(sp.acMimeType) },
        ]}
      />

      <Heading level={3}>
        <code>ComposeContextBanner</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'mode', type: "'reply' | 'edit' | 'forward'", description: t(sp.ccbMode) },
          { name: 'author', type: 'ReactNode', description: t(sp.ccbAuthor) },
          { name: 'preview', type: 'ReactNode', description: t(sp.ccbPreview) },
          { name: 'count', type: 'number', description: t(sp.ccbCount) },
          { name: 'onDismiss', type: '() => void', description: t(sp.ccbOnDismiss) },
        ]}
      />

      <Heading level={3}>
        <code>MentionAutocomplete</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'open', type: 'boolean', description: t(sp.maOpen) },
          { name: 'query', type: 'string', default: "''", description: t(sp.maQuery) },
          { name: 'trigger', type: "'@' | '#' | '/'", default: "'@'", description: t(sp.maTrigger) },
          { name: 'candidates', type: 'readonly MentionCandidate[]', description: t(sp.maCandidates) },
          { name: 'cursor', type: 'number', description: t(sp.maCursor) },
          { name: 'onChoose', type: '(id: string) => void', description: t(sp.maOnChoose) },
          { name: 'listId', type: 'string', description: t(sp.maListId) },
        ]}
      />

      <Heading level={3}>
        <code>CharacterCounter</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'length', type: 'number', description: t(sp.chLength) },
          { name: 'limit', type: 'number', description: t(sp.chLimit) },
          { name: 'threshold', type: 'number', default: '0.8', description: t(sp.chThreshold) },
          { name: 'showAlways', type: 'boolean', default: 'false', description: t(sp.chShowAlways) },
        ]}
      />

      <Heading level={3}>
        <code>VoiceRecorder</code>
      </Heading>
      <PropsTable
        props={[
          { name: 'state', type: 'VoiceRecorderState', default: "'armed'", description: t(sp.vrState) },
          { name: 'meter', type: '(() => number) | null', default: 'null', description: t(sp.vrMeter) },
          { name: 'onSend', type: '(seconds: number) => void', description: t(sp.vrOnSend) },
          { name: 'onCancel', type: '() => void', description: t(sp.vrOnCancel) },
          { name: 'maxDuration', type: 'number', default: '300', description: t(sp.vrMaxDuration) },
          { name: 'cancelThreshold', type: 'number', default: '96', description: t(sp.vrCancelThreshold) },
          { name: 'lockable', type: 'boolean', default: 'true', description: t(sp.vrLockable) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(pn.cbA11y1))}</li>
        <li>{prose(t(pn.cbA11y2))}</li>
        <li>{prose(t(pn.cbA11y3))}</li>
        <li>{prose(t(pn.cbA11y4))}</li>
        <li>{prose(t(pn.cbA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(pn.cbUse1))}</li>
        <li>{prose(t(pn.cbUse2))}</li>
        <li>{prose(t(pn.cbUse3))}</li>
        <li>{prose(t(pn.cbUse4))}</li>
      </ul>
    </>
  );
}
