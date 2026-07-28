import {
  Heading,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import {
  groupMessages,
  insertSeparators,
  type ChatMessage,
  type ChatSequenceItem,
  type MessageGroup as ChatGroup,
  type DeliveryStatus,
  type MessageLayout,
} from '@glacier/logic';
import type { ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * Page strings, defined locally so the page compiles standalone. They belong in
 * `apps/docs/src/i18n.ts` alongside every other page's catalog; see the handoff
 * note for the block to move.
 */
const mt = defineMessages({
  mtName: { en: 'Message & Transcript', es: 'Mensaje y transcripción', fr: 'Message et transcription', de: 'Nachricht & Verlauf', ja: 'メッセージとトランスクリプト', pt: 'Mensagem e transcrição', zh: '消息与会话记录', ar: 'الرسالة والسجل' },
  mtLede: { en: 'The seven pieces a chat log is made of: a message, a run of messages from one author, the timestamp line under them, the scrolling transcript that holds them, and the three separators woven through it.', es: 'Las siete piezas de un registro de chat: un mensaje, una serie de mensajes de un mismo autor, la línea de hora bajo ellos, la transcripción desplazable que los contiene y los tres separadores entretejidos en ella.', fr: 'Les sept pièces d’un journal de conversation : un message, une série de messages d’un même auteur, la ligne d’horodatage en dessous, la transcription défilante qui les contient, et les trois séparateurs qui la traversent.', de: 'Die sieben Bausteine eines Chatverlaufs: eine Nachricht, eine Folge von Nachrichten desselben Autors, die Zeitzeile darunter, der scrollende Verlauf, der sie hält, und die drei Trenner, die ihn durchziehen.', ja: 'チャットログを構成する7つの部品。1件のメッセージ、同一送信者の連続したメッセージ、その下のタイムスタンプ行、それらを収めるスクロール可能なトランスクリプト、そしてその中に織り込まれた3種類のセパレーターです。', pt: 'As sete peças de que é feito um registo de conversa: uma mensagem, uma sequência de mensagens do mesmo autor, a linha de hora por baixo, a transcrição rolável que as contém e os três separadores que a atravessam.', zh: '构成聊天记录的七个部件：一条消息、同一作者的一串连续消息、其下的时间戳行、承载它们的可滚动会话记录，以及贯穿其中的三种分隔符。', ar: 'الأجزاء السبعة التي يتكوّن منها سجل المحادثة: رسالة واحدة، وسلسلة رسائل من مؤلف واحد، وسطر الوقت أسفلها، والسجل القابل للتمرير الذي يحويها، والفواصل الثلاثة المتخللة له.' },
  mtAnatomy: { en: 'A bubble is the only piece with real geometry: its four corners are decided by `bubbleCorners` in `@glacier/logic` from its place in the run, never by the component.', es: 'La burbuja es la única pieza con geometría real: sus cuatro esquinas las decide `bubbleCorners` en `@glacier/logic` según su lugar en la serie, nunca el componente.', fr: 'La bulle est la seule pièce dotée d’une vraie géométrie : ses quatre coins sont décidés par `bubbleCorners` dans `@glacier/logic` d’après sa place dans la série, jamais par le composant.', de: 'Die Blase ist das einzige Teil mit echter Geometrie: Ihre vier Ecken bestimmt `bubbleCorners` in `@glacier/logic` aus ihrer Position in der Folge, nie die Komponente.', ja: '実際のジオメトリを持つのはバブルだけです。4つの角はコンポーネントではなく、`@glacier/logic` の `bubbleCorners` が連続内の位置から決定します。', pt: 'A bolha é a única peça com geometria real: os seus quatro cantos são decididos por `bubbleCorners` em `@glacier/logic` a partir do seu lugar na sequência, nunca pelo componente.', zh: '气泡是唯一具有真实几何形状的部件：它的四个圆角由 `@glacier/logic` 中的 `bubbleCorners` 根据它在连续消息中的位置决定，而不是由组件决定。', ar: 'الفقاعة هي الجزء الوحيد ذو هندسة حقيقية: زواياها الأربع تحدّدها `bubbleCorners` في `@glacier/logic` من موضعها في السلسلة، لا المكوّن.' },

  // --- the demo conversation -------------------------------------------------
  mtAna: { en: 'Ana Ruiz', es: 'Ana Ruiz', fr: 'Ana Ruiz', de: 'Ana Ruiz', ja: 'アナ・ルイス', pt: 'Ana Ruiz', zh: '安娜·鲁伊斯', ar: 'آنا رويز' },
  mtYou: { en: 'You', es: 'Tú', fr: 'Vous', de: 'Du', ja: 'あなた', pt: 'Tu', zh: '你', ar: 'أنت' },
  mtMsg1: { en: 'Did the transcript spec land? I want to start the native binding tomorrow.', es: '¿Ya entró la especificación de la transcripción? Quiero empezar el binding nativo mañana.', fr: 'La spec de la transcription est-elle passée ? Je veux commencer le binding natif demain.', de: 'Ist die Verlaufs-Spezifikation gelandet? Ich will morgen mit der nativen Bindung anfangen.', ja: 'トランスクリプトの仕様はマージされた？明日ネイティブバインディングを始めたいんだ。', pt: 'A especificação da transcrição já entrou? Quero começar o binding nativo amanhã.', zh: '会话记录的规范合并了吗？我明天想开始做原生绑定。', ar: 'هل اعتُمدت مواصفة السجل؟ أريد بدء الربط الأصلي غدًا.' },
  mtMsg2: { en: 'Merged an hour ago. Grouping and separators both live in commons now.', es: 'Fusionada hace una hora. La agrupación y los separadores ya viven en commons.', fr: 'Fusionnée il y a une heure. Le regroupement et les séparateurs vivent tous les deux dans commons.', de: 'Vor einer Stunde gemergt. Gruppierung und Trenner liegen jetzt beide in commons.', ja: '1時間前にマージした。グルーピングもセパレーターも commons にある。', pt: 'Integrada há uma hora. O agrupamento e os separadores já vivem em commons.', zh: '一小时前合并了。分组和分隔符现在都在 commons 里。', ar: 'دُمجت قبل ساعة. التجميع والفواصل صارا الآن في commons.' },
  mtMsg3: { en: 'Reading it now.', es: 'La estoy leyendo.', fr: 'Je la lis là.', de: 'Lese sie gerade.', ja: '今読んでる。', pt: 'Estou a lê-la agora.', zh: '我正在看。', ar: 'أقرؤها الآن.' },
  mtMsg4: { en: 'One thing though — the unread line jumped on me while I was scrolled up.', es: 'Aunque una cosa: la línea de no leídos se me movió mientras estaba desplazada hacia arriba.', fr: 'Un truc quand même : la ligne des non-lus a sauté pendant que j’étais remontée dans le fil.', de: 'Eine Sache aber: Die Ungelesen-Linie ist gesprungen, während ich nach oben gescrollt war.', ja: 'ただ一点、上にスクロールしている間に未読ラインが動いてしまった。', pt: 'Mas há uma coisa: a linha de não lidas saltou enquanto eu estava com o scroll para cima.', zh: '不过有个问题——我往上滚动时，未读分隔线自己跳了。', ar: 'لكن هناك أمر: خط غير المقروء قفز بينما كنت أتصفّح للأعلى.' },
  mtMsg5: { en: 'Only after a page of history loaded, so I think it is the anchor.', es: 'Solo después de cargar una página de historial, así que creo que es el ancla.', fr: 'Seulement après le chargement d’une page d’historique, donc je pense que c’est l’ancre.', de: 'Erst nachdem eine Seite Verlauf geladen wurde, also tippe ich auf den Anker.', ja: '履歴を1ページ読み込んだ後だけだったから、アンカーだと思う。', pt: 'Só depois de carregar uma página de histórico, por isso acho que é a âncora.', zh: '只有在加载了一页历史消息之后才出现，所以我觉得是锚点的问题。', ar: 'فقط بعد تحميل صفحة من السجل، لذا أظنّه المرساة.' },
  mtMsg6: { en: 'That is the watermark path — it recomputes on every render. Pinning the id fixes it.', es: 'Esa es la vía de la marca de agua: se recalcula en cada render. Fijar el id lo arregla.', fr: 'C’est le chemin du filigrane : il se recalcule à chaque rendu. Épingler l’id corrige ça.', de: 'Das ist der Wasserzeichen-Pfad — er rechnet bei jedem Render neu. Die id anzupinnen behebt es.', ja: 'それはウォーターマーク経路で、レンダーごとに再計算される。id を固定すれば直る。', pt: 'Esse é o caminho da marca de água: recalcula a cada render. Fixar o id resolve.', zh: '那是水位线的路径——每次渲染都会重算。把 id 钉住就好了。', ar: 'ذلك مسار العلامة المائية — يُعاد حسابه في كل عرض. تثبيت المعرّف يحلّها.' },
  mtMsg7: { en: 'Pushing a fix now.', es: 'Subiendo una corrección ahora.', fr: 'J’envoie un correctif tout de suite.', de: 'Schiebe gleich einen Fix hoch.', ja: '今から修正を push する。', pt: 'A enviar uma correção agora.', zh: '我现在就推一个修复。', ar: 'أرفع إصلاحًا الآن.' },

  // --- examples --------------------------------------------------------------
  mtExListTitle: { en: 'A real transcript', es: 'Una transcripción real', fr: 'Une vraie transcription', de: 'Ein echter Verlauf', ja: '実際のトランスクリプト', pt: 'Uma transcrição real', zh: '真实的会话记录', ar: 'سجلّ حقيقي' },
  mtExListDesc: { en: 'A flat log through `groupMessages` and then `insertSeparators`, rendered by `MessageList`. Nothing below is hand-placed: the day row, the unread rule, the three-message run, and the single trailing stamp are all what the pipeline produced. Scroll up and the jump control appears.', es: 'Un registro plano pasado por `groupMessages` y luego `insertSeparators`, renderizado por `MessageList`. Nada de lo de abajo está colocado a mano: la fila del día, la regla de no leídos, la serie de tres mensajes y la única marca de hora final son lo que produjo la tubería. Desplázate hacia arriba y aparece el control de salto.', fr: 'Un journal plat passé par `groupMessages` puis `insertSeparators`, rendu par `MessageList`. Rien ci-dessous n’est placé à la main : la ligne de date, la règle des non-lus, la série de trois messages et l’unique horodatage final sont ce que la chaîne a produit. Remontez et le bouton de saut apparaît.', de: 'Ein flaches Log durch `groupMessages` und dann `insertSeparators`, gerendert von `MessageList`. Nichts unten ist von Hand gesetzt: die Datumszeile, die Ungelesen-Regel, die Dreierfolge und der einzelne abschließende Zeitstempel sind das Ergebnis der Kette. Nach oben scrollen lässt die Sprungtaste erscheinen.', ja: 'フラットなログを `groupMessages` に通し、続いて `insertSeparators` に通して `MessageList` で描画したものです。以下は手作業では配置していません。日付行、未読ライン、3件の連続、末尾の1つのタイムスタンプはすべてパイプラインの出力です。上にスクロールするとジャンプボタンが現れます。', pt: 'Um registo plano através de `groupMessages` e depois `insertSeparators`, desenhado pelo `MessageList`. Nada abaixo está colocado à mão: a linha do dia, a régua de não lidas, a sequência de três mensagens e a única marca de hora final são o que a cadeia produziu. Desloca para cima e o controlo de salto aparece.', zh: '一段扁平日志先经过 `groupMessages`，再经过 `insertSeparators`，最后由 `MessageList` 渲染。下面没有任何东西是手工摆放的：日期行、未读分隔线、三条连续消息以及末尾唯一的时间戳，全都是这条流水线的产物。向上滚动，跳转按钮就会出现。', ar: 'سجل مسطّح يمرّ عبر `groupMessages` ثم `insertSeparators`، ويعرضه `MessageList`. لا شيء أدناه موضوع يدويًا: صف اليوم، وخط غير المقروء، وسلسلة الرسائل الثلاث، وطابع الوقت الأخير الوحيد كلها ناتج المسار. مرّر للأعلى ليظهر زر القفز.' },
  mtExLayoutTitle: { en: 'bubble vs row — the open question', es: 'bubble frente a row: la pregunta abierta', fr: 'bubble contre row — la question ouverte', de: 'bubble gegen row — die offene Frage', ja: 'bubble と row — 未決の論点', pt: 'bubble versus row — a questão em aberto', zh: 'bubble 与 row——尚未拍板的问题', ar: 'bubble مقابل row — السؤال المفتوح' },
  mtExLayoutDesc: { en: 'The same sequence, the same day, the same unread anchor — only `layout` differs. `bubble` is iMessage: authorship is carried by the edge a message hugs and by its fill. `row` is Slack: one column, no fill, an avatar gutter, and a name-and-time header doing the work alignment cannot. They are two products, not two skins, and the kit ships both because a transcript that guesses wrong is unreadable.', es: 'La misma secuencia, el mismo día, la misma ancla de no leídos: solo cambia `layout`. `bubble` es iMessage: la autoría la lleva el borde al que se pega el mensaje y su relleno. `row` es Slack: una columna, sin relleno, un canalón de avatar y una cabecera de nombre y hora que hace el trabajo que la alineación no puede. Son dos productos, no dos pieles, y el kit trae ambos porque una transcripción que se equivoca es ilegible.', fr: 'La même séquence, le même jour, la même ancre de non-lus — seul `layout` change. `bubble`, c’est iMessage : l’auteur est porté par le bord auquel le message se colle et par son fond. `row`, c’est Slack : une colonne, aucun fond, une gouttière d’avatar et un en-tête nom-et-heure qui fait le travail que l’alignement ne peut pas faire. Ce sont deux produits, pas deux habillages, et le kit livre les deux parce qu’une transcription qui se trompe est illisible.', de: 'Dieselbe Sequenz, derselbe Tag, derselbe Ungelesen-Anker — nur `layout` unterscheidet sich. `bubble` ist iMessage: Die Urheberschaft trägt die Kante, an der eine Nachricht klebt, und ihre Füllung. `row` ist Slack: eine Spalte, keine Füllung, eine Avatar-Rinne und eine Name-und-Zeit-Kopfzeile, die leistet, was Ausrichtung nicht kann. Das sind zwei Produkte, keine zwei Skins, und das Kit liefert beide, weil ein Verlauf, der falsch rät, unlesbar ist.', ja: '同じシーケンス、同じ日、同じ未読アンカーで、違うのは `layout` だけです。`bubble` は iMessage 型で、送信者はメッセージが寄る辺と塗りが担います。`row` は Slack 型で、1カラム、塗りなし、アバターの余白列、そして整列では担えない役割を果たす名前と時刻のヘッダーがあります。これは2つのスキンではなく2つのプロダクトであり、読み違えたトランスクリプトは読めなくなるため、キットは両方を提供します。', pt: 'A mesma sequência, o mesmo dia, a mesma âncora de não lidas — só o `layout` difere. `bubble` é o iMessage: a autoria é levada pela margem a que a mensagem se cola e pelo seu preenchimento. `row` é o Slack: uma coluna, sem preenchimento, uma goteira de avatar e um cabeçalho de nome e hora a fazer o que o alinhamento não consegue. São dois produtos, não duas peles, e o kit traz ambos porque uma transcrição que adivinha mal é ilegível.', zh: '同一段序列、同一天、同一个未读锚点——只有 `layout` 不同。`bubble` 是 iMessage 那一派：作者身份由消息贴靠的一侧和填充色来承载。`row` 是 Slack 那一派：单栏、无填充、有头像沟槽，并由姓名与时间的头部承担对齐无法承担的职责。它们是两种产品，而不是两层皮肤；套件两者都提供，因为猜错了的会话记录是没法读的。', ar: 'الترتيب نفسه، واليوم نفسه، ومرساة غير المقروء نفسها — الفارق الوحيد هو `layout`. النمط `bubble` هو iMessage: هوية المؤلف تحملها الحافة التي تلتصق بها الرسالة ولون تعبئتها. والنمط `row` هو Slack: عمود واحد، بلا تعبئة، وعمود جانبي للصورة، وترويسة بالاسم والوقت تؤدي ما لا تستطيع المحاذاة أداءه. إنهما منتجان لا قشرتان، والمجموعة تقدّم كليهما لأن سجلًّا يخطئ الاختيار يصبح غير قابل للقراءة.' },
  mtExRunTitle: { en: 'A run reads as one shape', es: 'Una serie se lee como una sola forma', fr: 'Une série se lit comme une seule forme', de: 'Eine Folge liest sich als eine Form', ja: '連続は1つの形として読める', pt: 'Uma sequência lê-se como uma só forma', zh: '一串消息读起来是一个形状', ar: 'السلسلة تُقرأ ككتلة واحدة' },
  mtExRunDesc: { en: 'Four consecutive messages inside the grouping window. `bubblePosition` classifies each one `first` / `middle` / `last`, `bubbleCorners` tightens only the corners that face a neighbour, and `bubbleHasTail` gives the tail to the last one alone. The free edge stays fully round the whole way down — that asymmetry is what makes the stack recognisable as one utterance from one side of the conversation.', es: 'Cuatro mensajes consecutivos dentro de la ventana de agrupación. `bubblePosition` clasifica cada uno como `first` / `middle` / `last`, `bubbleCorners` aprieta solo las esquinas que miran a un vecino, y `bubbleHasTail` da la cola únicamente al último. El borde libre se mantiene redondo hasta abajo: esa asimetría es lo que hace reconocible la pila como una sola intervención desde un lado de la conversación.', fr: 'Quatre messages consécutifs dans la fenêtre de regroupement. `bubblePosition` classe chacun en `first` / `middle` / `last`, `bubbleCorners` ne resserre que les coins tournés vers un voisin, et `bubbleHasTail` ne donne la queue qu’au dernier. Le bord libre reste parfaitement arrondi de haut en bas : c’est cette asymétrie qui fait lire la pile comme une seule prise de parole depuis un côté de la conversation.', de: 'Vier aufeinanderfolgende Nachrichten innerhalb des Gruppierungsfensters. `bubblePosition` stuft jede als `first` / `middle` / `last` ein, `bubbleCorners` zieht nur die Ecken an, die einem Nachbarn zugewandt sind, und `bubbleHasTail` gibt allein der letzten den Zipfel. Die freie Kante bleibt durchgehend rund — diese Asymmetrie lässt den Stapel als eine Äußerung von einer Seite des Gesprächs lesen.', ja: 'グルーピング窓の内側にある連続した4件です。`bubblePosition` が各件を `first` / `middle` / `last` に分類し、`bubbleCorners` は隣接する側の角だけを詰め、`bubbleHasTail` は最後の1件にのみしっぽを与えます。空いている側の角は最後まで丸いままで、この非対称性こそがスタックを会話の一方からの1つの発話として認識させます。', pt: 'Quatro mensagens consecutivas dentro da janela de agrupamento. O `bubblePosition` classifica cada uma como `first` / `middle` / `last`, o `bubbleCorners` aperta apenas os cantos virados para um vizinho, e o `bubbleHasTail` dá a cauda só à última. A margem livre mantém-se redonda até ao fim: é essa assimetria que faz a pilha ler-se como uma única intervenção de um dos lados da conversa.', zh: '分组时间窗内的四条连续消息。`bubblePosition` 把每条分类为 `first` / `middle` / `last`，`bubbleCorners` 只收紧朝向邻居的那些角，`bubbleHasTail` 只给最后一条加尾巴。自由的那一侧始终保持全圆角——正是这种不对称，让这一摞读起来像是来自对话某一方的一次发言。', ar: 'أربع رسائل متتالية داخل نافذة التجميع. تصنّف `bubblePosition` كلًّا منها إلى `first` / `middle` / `last`، وتشدّ `bubbleCorners` الزوايا المواجهة لجار فقط، وتمنح `bubbleHasTail` الذيل للأخيرة وحدها. تبقى الحافة الحرّة دائرية تمامًا حتى النهاية، وهذا التباين هو ما يجعل الكومة تُقرأ كقول واحد من أحد طرفي المحادثة.' },
  mtExMetaTitle: { en: 'Delivery states and the clock', es: 'Estados de entrega y el reloj', fr: 'États de remise et l’horloge', de: 'Zustellstatus und die Uhr', ja: '配信状態と時刻', pt: 'Estados de entrega e o relógio', zh: '送达状态与时钟', ar: 'حالات التسليم والساعة' },
  mtExMetaDesc: { en: 'The status is never a glyph alone: the mark is decorative and the word rides beside it for anything not looking at the screen. A run reports the *least* advanced status of its members, not the last one’s — so a stack holding one failed send says failed even when everything after it went through.', es: 'El estado nunca es solo un glifo: la marca es decorativa y la palabra la acompaña para todo lo que no mira la pantalla. Una serie informa del estado *menos* avanzado de sus miembros, no del último: así, una pila con un envío fallido dice fallido aunque todo lo posterior haya salido.', fr: 'L’état n’est jamais un simple glyphe : la marque est décorative et le mot l’accompagne pour tout ce qui ne regarde pas l’écran. Une série rapporte l’état le *moins* avancé de ses membres, pas celui du dernier — une pile contenant un envoi échoué dit donc « échec » même si tout ce qui suit est passé.', de: 'Der Status ist nie nur ein Zeichen: Die Marke ist Dekoration, das Wort steht daneben für alles, was nicht auf den Bildschirm schaut. Eine Folge meldet den *am wenigsten* fortgeschrittenen Status ihrer Mitglieder, nicht den des letzten — ein Stapel mit einem fehlgeschlagenen Versand sagt also „fehlgeschlagen“, auch wenn alles danach durchging.', ja: '状態は決してグリフだけではありません。マークは装飾で、画面を見ていない相手のために言葉が隣に並びます。連続はメンバーのうち最も進んでいない状態を報告し、最後の1件の状態は使いません。そのため、失敗した送信を1件でも含むスタックは、その後がすべて成功していても失敗と表示します。', pt: 'O estado nunca é só um glifo: a marca é decorativa e a palavra acompanha-a para tudo o que não está a olhar para o ecrã. Uma sequência reporta o estado *menos* avançado dos seus membros, não o do último — por isso uma pilha com um envio falhado diz falhado mesmo que tudo depois dele tenha passado.', zh: '状态从来不只是一个图标：标记是装饰性的，旁边始终有文字，供看不到屏幕的读者使用。一串消息报告的是其成员中**最不**靠前的状态，而不是最后一条的状态——所以只要栈里有一条发送失败，即便其后的都成功了，也会显示为失败。', ar: 'الحالة ليست رمزًا وحده أبدًا: العلامة زخرفية والكلمة ترافقها لمن لا ينظر إلى الشاشة. تُبلغ السلسلة عن الحالة الأقل تقدّمًا بين أعضائها لا حالة الأخيرة — لذا فكومة تضمّ إرسالًا فاشلًا تقول «فشل» حتى لو نجح كل ما بعده.' },
  mtExSepTitle: { en: 'The three separators', es: 'Los tres separadores', fr: 'Les trois séparateurs', de: 'Die drei Trenner', ja: '3種類のセパレーター', pt: 'Os três separadores', zh: '三种分隔符', ar: 'الفواصل الثلاثة' },
  mtExSepDesc: { en: 'A day row as a rule and as the chip it becomes when it pins to the top edge; the unread rule with its tally, at each alignment; and the jump control, shown here forced visible. All three are `role="separator"` or a button with the count folded into its name — never a heading, because a year of dates would bury the headings worth jumping to.', es: 'Una fila de día como regla y como el chip en que se convierte al fijarse al borde superior; la regla de no leídos con su recuento, en cada alineación; y el control de salto, aquí forzado a visible. Los tres son `role="separator"` o un botón con el recuento plegado en su nombre, nunca un encabezado: un año de fechas enterraría los encabezados a los que sí vale la pena saltar.', fr: 'Une ligne de date en règle et en pastille — ce qu’elle devient quand elle s’épingle en haut ; la règle des non-lus avec son compteur, à chaque alignement ; et le bouton de saut, ici forcé visible. Les trois sont `role="separator"` ou un bouton dont le nom intègre le compteur — jamais un titre, car une année de dates enterrerait les titres qui méritent qu’on y saute.', de: 'Eine Datumszeile als Linie und als Chip, zu dem sie wird, wenn sie an der Oberkante klebt; die Ungelesen-Linie mit ihrem Zähler, in jeder Ausrichtung; und die Sprungtaste, hier erzwungen sichtbar. Alle drei sind `role="separator"` oder ein Button, dessen Name den Zähler enthält — nie eine Überschrift, denn ein Jahr voller Daten würde die Überschriften begraben, zu denen zu springen sich lohnt.', ja: '罫線としての日付行と、上端に固定されたときに変わるチップ形。件数を伴う未読ラインを各配置で。そして、ここでは強制表示したジャンプボタン。3つとも `role="separator"` か、件数を名前に畳み込んだボタンであり、見出しにはしません。1年分の日付が並べば、本当に飛びたい見出しが埋もれてしまうからです。', pt: 'Uma linha de dia como régua e como a pastilha em que se torna ao fixar-se no topo; a régua de não lidas com a sua contagem, em cada alinhamento; e o controlo de salto, aqui forçado a visível. Os três são `role="separator"` ou um botão com a contagem dobrada no nome — nunca um cabeçalho, porque um ano de datas enterraria os cabeçalhos a que vale a pena saltar.', zh: '日期行的横线形态，以及它吸附到顶边时变成的胶囊形态；带计数的未读分隔线，逐一展示三种对齐；还有跳转按钮，这里强制显示。三者都是 `role="separator"`，或是把计数折进无障碍名称的按钮——绝不是标题，因为一整年的日期会把真正值得跳转的标题淹没。', ar: 'صف اليوم بهيئة خط، وبهيئة الشارة التي يتحوّل إليها حين يثبت عند الحافة العليا؛ وخط غير المقروء مع عدّاده بكل محاذاة؛ وزر القفز، معروضًا هنا قسرًا. الثلاثة إمّا `role="separator"` أو زر أُدمج العدّاد في اسمه — لا عنوان أبدًا، لأن سنةً من التواريخ ستدفن العناوين الجديرة بالقفز إليها.' },
  mtExContinuedTitle: { en: 'A divider that lands mid-run', es: 'Un divisor que cae a mitad de una serie', fr: 'Un séparateur qui tombe au milieu d’une série', de: 'Ein Trenner mitten in einer Folge', ja: '連続の途中に落ちる区切り', pt: 'Um divisor que cai a meio de uma sequência', zh: '落在一串消息中间的分隔线', ar: 'فاصل يقع في منتصف سلسلة' },
  mtExContinuedDesc: { en: 'The same conversation with the unread anchor pinned to Ana’s second message instead of her first. `insertSeparators` splits her run and marks the trailing half `continued`; `MessageGroup` then drops the repeated avatar and name while keeping the gutter reserved, so the line reads as a cut through one sentence rather than as a change of speaker.', es: 'La misma conversación con el ancla de no leídos fijada al segundo mensaje de Ana en lugar del primero. `insertSeparators` parte su serie y marca la mitad final como `continued`; `MessageGroup` entonces suprime el avatar y el nombre repetidos manteniendo el canalón reservado, de modo que la línea se lee como un corte en una frase y no como un cambio de interlocutor.', fr: 'La même conversation, avec l’ancre de non-lus épinglée au deuxième message d’Ana plutôt qu’au premier. `insertSeparators` scinde sa série et marque la moitié finale `continued` ; `MessageGroup` supprime alors l’avatar et le nom répétés tout en gardant la gouttière réservée, si bien que la ligne se lit comme une coupure dans une phrase et non comme un changement de locuteur.', de: 'Dasselbe Gespräch, der Ungelesen-Anker aber an Anas zweiter statt erster Nachricht. `insertSeparators` teilt ihre Folge und markiert die hintere Hälfte als `continued`; `MessageGroup` lässt daraufhin den wiederholten Avatar und Namen weg und hält die Rinne dennoch frei, sodass die Linie als Schnitt durch einen Satz statt als Sprecherwechsel gelesen wird.', ja: '同じ会話で、未読アンカーをアナの1件目ではなく2件目に固定したものです。`insertSeparators` が連続を分割し、後半に `continued` を付けます。すると `MessageGroup` は繰り返しのアバターと名前を省きつつ余白列は確保するので、この線は話者の交代ではなく1つの発言に入った切れ目として読めます。', pt: 'A mesma conversa com a âncora de não lidas fixada na segunda mensagem da Ana em vez da primeira. O `insertSeparators` parte a sequência dela e marca a metade final como `continued`; o `MessageGroup` deixa então cair o avatar e o nome repetidos mantendo a goteira reservada, de modo que a linha se lê como um corte numa frase e não como uma troca de interlocutor.', zh: '同一段对话，但未读锚点钉在安娜的第二条消息而不是第一条。`insertSeparators` 会切开她那串消息，并把后半段标记为 `continued`；`MessageGroup` 于是省去重复的头像和姓名，同时保留沟槽，于是这条线读起来像是一句话被切开，而不是换了说话人。', ar: 'المحادثة نفسها مع تثبيت مرساة غير المقروء على رسالة آنا الثانية بدل الأولى. تقسم `insertSeparators` سلسلتها وتضع على نصفها الأخير علامة `continued`؛ عندئذ يُسقط `MessageGroup` الصورة والاسم المكررين مع إبقاء العمود الجانبي محجوزًا، فيُقرأ الخط كقطعٍ داخل جملة واحدة لا كتبدّل متحدّث.' },

  // --- props sub-headings ----------------------------------------------------
  mtPropsBubble: { en: 'MessageBubble', es: 'MessageBubble', fr: 'MessageBubble', de: 'MessageBubble', ja: 'MessageBubble', pt: 'MessageBubble', zh: 'MessageBubble', ar: 'MessageBubble' },
  mtPropsGroup: { en: 'MessageGroup', es: 'MessageGroup', fr: 'MessageGroup', de: 'MessageGroup', ja: 'MessageGroup', pt: 'MessageGroup', zh: 'MessageGroup', ar: 'MessageGroup' },
  mtPropsMeta: { en: 'MessageMeta', es: 'MessageMeta', fr: 'MessageMeta', de: 'MessageMeta', ja: 'MessageMeta', pt: 'MessageMeta', zh: 'MessageMeta', ar: 'MessageMeta' },
  mtPropsList: { en: 'MessageList', es: 'MessageList', fr: 'MessageList', de: 'MessageList', ja: 'MessageList', pt: 'MessageList', zh: 'MessageList', ar: 'MessageList' },
  mtPropsSeparators: { en: 'DateSeparator, UnreadDivider, ScrollToLatest', es: 'DateSeparator, UnreadDivider, ScrollToLatest', fr: 'DateSeparator, UnreadDivider, ScrollToLatest', de: 'DateSeparator, UnreadDivider, ScrollToLatest', ja: 'DateSeparator、UnreadDivider、ScrollToLatest', pt: 'DateSeparator, UnreadDivider, ScrollToLatest', zh: 'DateSeparator、UnreadDivider、ScrollToLatest', ar: 'DateSeparator وUnreadDivider وScrollToLatest' },

  // --- shared prop descriptions ---------------------------------------------
  mtPropNow: { en: 'The instant timestamps are read against. Injected rather than defaulted, so a transcript, a test, and a screenshot all render the same.', es: 'El instante contra el que se leen las marcas de tiempo. Se inyecta en lugar de asumirse, para que una transcripción, una prueba y una captura rendericen igual.', fr: 'L’instant de référence des horodatages. Injecté plutôt que défini par défaut, pour qu’une transcription, un test et une capture rendent la même chose.', de: 'Der Zeitpunkt, gegen den Zeitstempel gelesen werden. Injiziert statt vorbelegt, damit Verlauf, Test und Screenshot identisch rendern.', ja: 'タイムスタンプを解釈する基準時刻。既定値ではなく注入するため、トランスクリプト・テスト・スクリーンショットが同じ結果になります。', pt: 'O instante contra o qual as marcas de tempo são lidas. Injetado em vez de assumido, para que uma transcrição, um teste e uma captura desenhem o mesmo.', zh: '时间戳所参照的那一刻。由外部注入而非默认取当前时间，因此会话记录、测试与截图渲染结果一致。', ar: 'اللحظة التي تُقرأ الطوابع الزمنية بالنسبة إليها. تُحقن بدل أن تُفترض، فيخرج السجل والاختبار ولقطة الشاشة متطابقين.' },
  mtPropLocale: { en: 'BCP-47 tag for the date and time formatter; falls back to the active locale.', es: 'Etiqueta BCP-47 para el formateador de fecha y hora; recurre a la configuración regional activa.', fr: 'Étiquette BCP-47 pour le formateur de date et d’heure ; retombe sur la locale active.', de: 'BCP-47-Tag für den Datums- und Zeitformatierer; fällt auf die aktive Locale zurück.', ja: '日付と時刻のフォーマッター用 BCP-47 タグ。省略時は現在のロケール。', pt: 'Etiqueta BCP-47 para o formatador de data e hora; recorre à localização ativa.', zh: '日期与时间格式化器使用的 BCP-47 标签；缺省时回退到当前语言环境。', ar: 'وسم BCP-47 لمنسّق التاريخ والوقت؛ يعود إلى اللغة النشطة عند غيابه.' },
  mtPropLabels: { en: 'Translated strings, merged over the shared English defaults so an app can override one word without restating the set.', es: 'Cadenas traducidas, fusionadas sobre los valores en inglés compartidos, para que una app pueda sobrescribir una palabra sin repetir el conjunto.', fr: 'Chaînes traduites, fusionnées par-dessus les valeurs anglaises partagées, pour qu’une app remplace un mot sans redéclarer l’ensemble.', de: 'Übersetzte Zeichenketten, über die gemeinsamen englischen Vorgaben gelegt, damit eine App ein Wort ersetzen kann, ohne den Satz zu wiederholen.', ja: '共有の英語デフォルトに重ねてマージされる翻訳文字列。1語だけを上書きでき、セット全体を書き直す必要はありません。', pt: 'Cadeias traduzidas, fundidas sobre os valores ingleses partilhados, para que uma app substitua uma palavra sem repetir o conjunto.', zh: '翻译后的字符串，会合并覆盖共享的英文默认值，因此应用可以只改一个词而不必重写整套。', ar: 'نصوص مترجمة تُدمج فوق القيم الإنجليزية المشتركة، فيستطيع التطبيق تجاوز كلمة واحدة دون إعادة ذكر المجموعة.' },
  mtPropSkeleton: { en: 'Renders a placeholder at the component’s exact footprint, so nothing shifts when the real content lands.', es: 'Renderiza un marcador de posición con la huella exacta del componente, para que nada se desplace cuando llegue el contenido real.', fr: 'Rend un substitut à l’empreinte exacte du composant, pour que rien ne bouge à l’arrivée du contenu réel.', de: 'Rendert einen Platzhalter mit dem exakten Platzbedarf der Komponente, sodass beim Eintreffen des echten Inhalts nichts springt.', ja: 'コンポーネントの実寸そのままのプレースホルダーを描画するため、実データ到着時にレイアウトがずれません。', pt: 'Desenha um substituto com a pegada exata do componente, para que nada salte quando o conteúdo real chegar.', zh: '按组件的真实占位尺寸渲染占位符，真实内容到达时不会发生位移。', ar: 'يعرض نائبًا بالمساحة الفعلية نفسها للمكوّن، فلا يقفز شيء عند وصول المحتوى الحقيقي.' },

  // --- MessageBubble props ---------------------------------------------------
  mtBubbleLayout: { en: 'Bubble draws a tinted, edge-aligned capsule; row draws full-width prose with an avatar gutter and a header line.', es: 'bubble dibuja una cápsula teñida alineada al borde; row dibuja prosa a todo el ancho con canalón de avatar y línea de cabecera.', fr: 'bubble dessine une capsule teintée alignée sur un bord ; row dessine du texte pleine largeur avec gouttière d’avatar et ligne d’en-tête.', de: 'bubble zeichnet eine getönte, kantenbündige Kapsel; row zeichnet Fließtext über die volle Breite mit Avatar-Rinne und Kopfzeile.', ja: 'bubble は端に寄せた色付きカプセルを描き、row はアバター列とヘッダー行を伴う全幅の本文を描きます。', pt: 'bubble desenha uma cápsula tingida alinhada à margem; row desenha texto a toda a largura com goteira de avatar e linha de cabeçalho.', zh: 'bubble 绘制贴边的着色胶囊；row 绘制带头像沟槽和头部行的全宽正文。', ar: 'يرسم bubble كبسولة ملوّنة ملتصقة بالحافة، بينما يرسم row نصًّا بعرض كامل مع عمود صورة وسطر ترويسة.' },
  mtBubbleOwn: { en: 'The viewer sent it. In bubble layout that moves it to the trailing edge and repaints it in the accent; in row layout it changes nothing, because a row transcript is one column.', es: 'Lo envió quien mira. En layout bubble eso lo mueve al borde final y lo repinta con el acento; en row no cambia nada, porque una transcripción row es una sola columna.', fr: 'C’est le lecteur qui l’a envoyé. En layout bubble, cela le déplace vers le bord final et le repeint dans l’accent ; en row, cela ne change rien, une transcription row étant une seule colonne.', de: 'Der Betrachter hat sie gesendet. Im bubble-Layout wandert sie damit an die abschließende Kante und wird in der Akzentfarbe gezeichnet; im row-Layout ändert es nichts, da ein row-Verlauf einspaltig ist.', ja: '閲覧者が送信したもの。bubble レイアウトでは末尾側の端に移動しアクセント色で描かれます。row レイアウトは単一カラムのため何も変わりません。', pt: 'Foi o leitor que a enviou. No layout bubble isso move-a para a margem final e repinta-a no acento; no row não muda nada, porque uma transcrição row é uma só coluna.', zh: '这条消息由当前用户发出。在 bubble 布局下它会移到末尾侧并改用强调色；在 row 布局下没有任何变化，因为 row 会话记录只有一栏。', ar: 'أرسلها المستخدم نفسه. في تخطيط bubble تنتقل إلى الحافة الخلفية وتُلوَّن بلون التمييز؛ وفي تخطيط row لا يتغير شيء لأن السجل عمود واحد.' },
  mtBubblePosition: { en: 'Where it sits in its author’s run. Drives the corner radii, so a stack reads as one sliced shape rather than separate lozenges.', es: 'Dónde se sitúa dentro de la serie de su autor. Determina los radios de esquina, de modo que una pila se lee como una forma cortada y no como pastillas sueltas.', fr: 'Sa place dans la série de son auteur. Détermine les rayons des coins, pour qu’une pile se lise comme une forme tranchée et non comme des pastilles séparées.', de: 'Ihre Stelle in der Folge ihres Autors. Bestimmt die Eckenradien, damit ein Stapel als eine geschnittene Form statt als getrennte Pastillen liest.', ja: '送信者の連続内での位置。角丸半径を決めるため、スタックが個別の錠剤ではなく1つを切り分けた形として読めます。', pt: 'Onde fica na sequência do seu autor. Determina os raios dos cantos, para que uma pilha se leia como uma forma cortada e não como pastilhas soltas.', zh: '它在作者那串消息中的位置。决定四角圆角，从而让一摞消息读作被切开的一个形状，而不是彼此独立的小方块。', ar: 'موضعها في سلسلة مؤلفها. تحدّد أنصاف أقطار الزوايا، فتُقرأ الكومة كشكل واحد مقطوع لا كأقراص منفصلة.' },
  mtBubbleTail: { en: 'Draws the tail. Meaningful only on the message that ends a run; MessageGroup decides it for you via `bubbleHasTail`.', es: 'Dibuja la cola. Solo tiene sentido en el mensaje que cierra una serie; MessageGroup lo decide por ti con `bubbleHasTail`.', fr: 'Dessine la queue. Pertinent uniquement sur le message qui clôt une série ; MessageGroup le décide pour vous via `bubbleHasTail`.', de: 'Zeichnet den Zipfel. Nur auf der Nachricht sinnvoll, die eine Folge beendet; MessageGroup entscheidet das über `bubbleHasTail`.', ja: 'しっぽを描きます。意味があるのは連続を締めくくるメッセージだけで、MessageGroup が `bubbleHasTail` で判断します。', pt: 'Desenha a cauda. Só faz sentido na mensagem que fecha uma sequência; o MessageGroup decide por ti via `bubbleHasTail`.', zh: '绘制尾巴。只有在结束一串消息的那条上才有意义；MessageGroup 会通过 `bubbleHasTail` 替你判断。', ar: 'يرسم الذيل. لا معنى له إلا على الرسالة التي تُنهي السلسلة؛ ويقرّره عنك MessageGroup عبر `bubbleHasTail`.' },
  mtBubbleSide: { en: 'Overrides the edge authorship would choose. Logical (`start` / `end`), never physical, so a right-to-left transcript mirrors as a whole.', es: 'Sobrescribe el borde que elegiría la autoría. Lógico (`start` / `end`), nunca físico, para que una transcripción de derecha a izquierda se refleje entera.', fr: 'Remplace le bord que choisirait l’auteur. Logique (`start` / `end`), jamais physique, pour qu’une transcription de droite à gauche se reflète en bloc.', de: 'Überschreibt die Kante, die die Urheberschaft wählen würde. Logisch (`start` / `end`), nie physisch, damit ein Rechts-nach-links-Verlauf als Ganzes spiegelt.', ja: '送信者から決まる端を上書きします。物理ではなく論理 (`start` / `end`) なので、右書きのトランスクリプトは全体として反転します。', pt: 'Substitui a margem que a autoria escolheria. Lógica (`start` / `end`), nunca física, para que uma transcrição da direita para a esquerda espelhe por inteiro.', zh: '覆盖由作者身份决定的贴靠侧。使用逻辑值（`start` / `end`）而非物理左右，因此从右至左的会话记录会整体镜像。', ar: 'يتجاوز الحافة التي تختارها هوية المؤلف. منطقي (`start` / `end`) لا مادي، فينعكس السجل من اليمين إلى اليسار ككل.' },
  mtBubbleAvatar: { en: 'Rendered in the leading gutter.', es: 'Se renderiza en el canalón inicial.', fr: 'Rendu dans la gouttière de tête.', de: 'Wird in der führenden Rinne gerendert.', ja: '先頭側の余白列に描画されます。', pt: 'Desenhado na goteira inicial.', zh: '渲染在前导沟槽中。', ar: 'يُعرض في العمود الجانبي الأمامي.' },
  mtBubbleGutter: { en: 'Reserves the gutter without filling it, so a message whose avatar was suppressed still lines up with the one above it. Defaults on in row layout.', es: 'Reserva el canalón sin rellenarlo, para que un mensaje cuyo avatar se suprimió siga alineado con el de arriba. Activado por defecto en layout row.', fr: 'Réserve la gouttière sans la remplir, pour qu’un message dont l’avatar est supprimé reste aligné avec celui du dessus. Actif par défaut en layout row.', de: 'Reserviert die Rinne, ohne sie zu füllen, sodass eine Nachricht ohne Avatar dennoch mit der darüber fluchtet. Im row-Layout standardmäßig an.', ja: 'アバターを描かずに余白列だけ確保するので、アバターを省いたメッセージも上の行と揃います。row レイアウトでは既定で有効。', pt: 'Reserva a goteira sem a preencher, para que uma mensagem cujo avatar foi suprimido continue alinhada com a de cima. Ativo por omissão no layout row.', zh: '只保留沟槽而不填充，使被省略头像的消息仍与上一条对齐。在 row 布局下默认开启。', ar: 'يحجز العمود الجانبي دون ملئه، فتبقى الرسالة التي أُخفيت صورتها محاذية لما فوقها. مفعّل افتراضيًا في تخطيط row.' },
  mtBubbleHeader: { en: 'The name and time line above the body, in row layout.', es: 'La línea de nombre y hora encima del cuerpo, en layout row.', fr: 'La ligne nom et heure au-dessus du corps, en layout row.', de: 'Die Namens- und Zeitzeile über dem Text, im row-Layout.', ja: 'row レイアウトで本文の上に置く名前と時刻の行。', pt: 'A linha de nome e hora acima do corpo, no layout row.', zh: 'row 布局下正文上方的姓名与时间行。', ar: 'سطر الاسم والوقت فوق المتن، في تخطيط row.' },
  mtBubbleAt: { en: 'When it was sent, epoch milliseconds. Renders a meta line when given.', es: 'Cuándo se envió, en milisegundos epoch. Renderiza una línea meta cuando se aporta.', fr: 'Date d’envoi, en millisecondes epoch. Rend une ligne méta lorsqu’elle est fournie.', de: 'Sendezeitpunkt in Epoch-Millisekunden. Erzeugt eine Meta-Zeile, wenn angegeben.', ja: '送信時刻（エポックミリ秒）。指定するとメタ行を描画します。', pt: 'Quando foi enviada, em milissegundos epoch. Desenha uma linha meta quando fornecida.', zh: '发送时间，Unix 毫秒。给定时会渲染一行元信息。', ar: 'وقت الإرسال بالمللي ثانية منذ الحقبة. يعرض سطر بيانات وصفية عند تمريره.' },
  mtBubbleStatus: { en: 'How far along the send is. Omitted for anything received, which has no outbound state.', es: 'Cuánto ha avanzado el envío. Se omite en lo recibido, que no tiene estado de salida.', fr: 'L’avancement de l’envoi. Omis pour tout message reçu, qui n’a pas d’état sortant.', de: 'Wie weit der Versand ist. Entfällt bei Empfangenem, das keinen Ausgangszustand hat.', ja: '送信の進み具合。受信メッセージには送信状態がないため省略します。', pt: 'Até onde chegou o envio. Omitido no que é recebido, que não tem estado de saída.', zh: '发送进行到哪一步。接收到的消息没有外发状态，因此省略。', ar: 'مدى تقدّم الإرسال. يُحذف مع كل ما هو وارد، إذ لا حالة صادرة له.' },
  mtBubbleEdited: { en: 'Marks a message its author changed after sending.', es: 'Marca un mensaje que su autor cambió tras enviarlo.', fr: 'Marque un message que son auteur a modifié après envoi.', de: 'Kennzeichnet eine Nachricht, die ihr Autor nach dem Senden geändert hat.', ja: '送信後に作成者が編集したメッセージであることを示します。', pt: 'Marca uma mensagem que o autor alterou depois de enviar.', zh: '标记作者在发送后修改过的消息。', ar: 'يشير إلى رسالة عدّلها مؤلفها بعد الإرسال.' },
  mtBubbleMeta: { en: 'Replaces the default timestamp and status line entirely.', es: 'Reemplaza por completo la línea de hora y estado por defecto.', fr: 'Remplace entièrement la ligne d’horodatage et d’état par défaut.', de: 'Ersetzt die voreingestellte Zeit- und Statuszeile vollständig.', ja: '既定のタイムスタンプと状態の行を丸ごと置き換えます。', pt: 'Substitui por completo a linha de hora e estado por omissão.', zh: '完全替换默认的时间戳与状态行。', ar: 'يستبدل بالكامل سطر الوقت والحالة الافتراضي.' },
  mtBubbleSlots: { en: 'Slots the chat suite fills: a quoted preview above the body, media above the text, and the reaction bar underneath.', es: 'Ranuras que rellena la suite de chat: una vista citada sobre el cuerpo, medios sobre el texto y la barra de reacciones debajo.', fr: 'Emplacements que la suite de chat remplit : un aperçu cité au-dessus du corps, les médias au-dessus du texte, et la barre de réactions en dessous.', de: 'Slots, die die Chat-Suite füllt: eine zitierte Vorschau über dem Text, Medien über dem Text und die Reaktionsleiste darunter.', ja: 'チャットスイートが埋めるスロット。本文の上に引用プレビュー、テキストの上にメディア、下にリアクションバー。', pt: 'Encaixes que a suite de conversa preenche: uma pré-visualização citada acima do corpo, media acima do texto e a barra de reações por baixo.', zh: '聊天套件填充的插槽：正文上方的引用预览、文本上方的媒体，以及下方的表情反应条。', ar: 'فتحات تملؤها مجموعة المحادثة: معاينة اقتباس فوق المتن، ووسائط فوق النص، وشريط التفاعلات أسفله.' },

  // --- MessageGroup props ----------------------------------------------------
  mtGroupGroup: { en: 'The run, exactly as `groupMessages` built it. The component never re-groups.', es: 'La serie, tal como la construyó `groupMessages`. El componente nunca reagrupa.', fr: 'La série, exactement telle que `groupMessages` l’a construite. Le composant ne regroupe jamais.', de: 'Die Folge, genau wie `groupMessages` sie gebaut hat. Die Komponente gruppiert nie neu.', ja: '`groupMessages` が構築したままの連続。コンポーネントは再グルーピングしません。', pt: 'A sequência, exatamente como o `groupMessages` a construiu. O componente nunca reagrupa.', zh: '由 `groupMessages` 构建好的那一串消息。组件绝不会重新分组。', ar: 'السلسلة كما بناها `groupMessages` تمامًا. لا يعيد المكوّن التجميع أبدًا.' },
  mtGroupOwn: { en: 'The viewer wrote this run. Derived by comparing the run’s authorId against `viewerId` when omitted.', es: 'Quien mira escribió esta serie. Se deriva comparando el authorId de la serie con `viewerId` si se omite.', fr: 'Le lecteur est l’auteur de cette série. Déduit en comparant l’authorId de la série à `viewerId` si omis.', de: 'Der Betrachter hat diese Folge geschrieben. Wird sonst aus dem Vergleich der authorId mit `viewerId` abgeleitet.', ja: 'この連続を書いたのが閲覧者かどうか。省略時は連続の authorId と `viewerId` の比較で導出します。', pt: 'O leitor escreveu esta sequência. Derivado comparando o authorId da sequência com o `viewerId` quando omitido.', zh: '这串消息由当前用户撰写。省略时通过把该串的 authorId 与 `viewerId` 比较得出。', ar: 'كتب المستخدم هذه السلسلة. يُشتقّ عند الإغفال بمقارنة authorId للسلسلة بـ`viewerId`.' },
  mtGroupHead: { en: 'Drawn once at the head of the run and never on a continued one, so a split run does not turn one speaker into two.', es: 'Se dibuja una sola vez al inicio de la serie y nunca en una continuada, para que una serie partida no convierta a un hablante en dos.', fr: 'Dessiné une seule fois en tête de série et jamais sur une série continuée, pour qu’une série scindée ne fasse pas deux locuteurs d’un seul.', de: 'Wird einmal am Kopf der Folge gezeichnet und nie bei einer fortgesetzten, damit eine geteilte Folge nicht aus einem Sprecher zwei macht.', ja: '連続の先頭で一度だけ描かれ、continued の連続には描かれません。分割された連続が話者を2人に見せないためです。', pt: 'Desenhado uma vez à cabeça da sequência e nunca numa continuada, para que uma sequência partida não transforme um interlocutor em dois.', zh: '只在一串消息的开头绘制一次，continued 的那半段不再绘制，以免被切开的一串看起来像两个说话人。', ar: 'يُرسم مرة واحدة في رأس السلسلة ولا يُرسم على سلسلة متابِعة، كي لا تحوّل السلسلة المقسّمة متحدثًا واحدًا إلى اثنين.' },
  mtGroupAuthorLabel: { en: 'The author’s name as a plain string. A continued run hides its visible header but must still be announced, or a screen reader hears an unlabelled group from nobody.', es: 'El nombre del autor como cadena simple. Una serie continuada oculta su cabecera visible pero debe seguir anunciándose, o un lector de pantalla oye un grupo sin etiqueta de nadie.', fr: 'Le nom de l’auteur en chaîne simple. Une série continuée masque son en-tête visible mais doit rester annoncée, sinon un lecteur d’écran entend un groupe sans nom venu de personne.', de: 'Der Autorenname als einfache Zeichenkette. Eine fortgesetzte Folge verbirgt ihre sichtbare Kopfzeile, muss aber weiterhin angesagt werden, sonst hört ein Screenreader eine unbenannte Gruppe von niemandem.', ja: '作成者名のプレーン文字列。continued の連続は見出しを隠しますが読み上げは必要で、なければスクリーンリーダーは名前のないグループを読み上げます。', pt: 'O nome do autor como cadeia simples. Uma sequência continuada esconde o cabeçalho visível mas tem de continuar a ser anunciada, ou um leitor de ecrã ouve um grupo sem etiqueta de ninguém.', zh: '作者姓名的纯字符串形式。continued 的一段会隐藏可见头部，但仍必须被朗读，否则读屏软件会读到一个没有署名的消息组。', ar: 'اسم المؤلف كنص عادي. السلسلة المتابِعة تخفي ترويستها المرئية لكن يجب أن تظل معلَنة، وإلا سمع قارئ الشاشة مجموعة بلا اسم من لا أحد.' },
  mtGroupTails: { en: 'Draws a tail on the message that ends the run. Ignored in row layout, and never applied to a standalone system notice.', es: 'Dibuja una cola en el mensaje que cierra la serie. Se ignora en layout row y nunca se aplica a un aviso de sistema independiente.', fr: 'Dessine une queue sur le message qui clôt la série. Ignoré en layout row, et jamais appliqué à un avis système isolé.', de: 'Zeichnet einen Zipfel an der Nachricht, die die Folge beendet. Im row-Layout ignoriert und nie auf eine eigenständige Systemmeldung angewandt.', ja: '連続を締めくくるメッセージにしっぽを描きます。row レイアウトでは無視され、単独のシステム通知には適用されません。', pt: 'Desenha uma cauda na mensagem que fecha a sequência. Ignorado no layout row e nunca aplicado a um aviso de sistema isolado.', zh: '在结束该串的消息上绘制尾巴。row 布局下忽略，且绝不用于独立的系统通知。', ar: 'يرسم ذيلًا على الرسالة التي تُنهي السلسلة. يُتجاهل في تخطيط row ولا يُطبَّق أبدًا على إشعار نظام مستقل.' },
  mtGroupRenderBody: { en: 'Replaces the default text rendering for one message; the slot renderers return the quoted preview, attachments, and reaction bar. Each is handed the message plus the geometry facts a decoration needs.', es: 'Reemplaza el renderizado de texto por defecto de un mensaje; los renderizadores de ranura devuelven la vista citada, los adjuntos y la barra de reacciones. A cada uno se le entrega el mensaje y los datos de geometría que una decoración necesita.', fr: 'Remplace le rendu de texte par défaut d’un message ; les rendus d’emplacement retournent l’aperçu cité, les pièces jointes et la barre de réactions. Chacun reçoit le message et les faits géométriques dont une décoration a besoin.', de: 'Ersetzt die voreingestellte Textdarstellung einer Nachricht; die Slot-Renderer liefern zitierte Vorschau, Anhänge und Reaktionsleiste. Jeder erhält die Nachricht plus die Geometriefakten, die eine Dekoration braucht.', ja: '1件のメッセージの既定テキスト描画を置き換えます。スロット用のレンダラーは引用プレビュー、添付、リアクションバーを返します。各レンダラーにはメッセージと、装飾が必要とするジオメトリ情報が渡されます。', pt: 'Substitui a renderização de texto por omissão de uma mensagem; os renderizadores de encaixe devolvem a pré-visualização citada, os anexos e a barra de reações. Cada um recebe a mensagem mais os factos de geometria de que uma decoração precisa.', zh: '替换单条消息的默认文本渲染；各插槽渲染器分别返回引用预览、附件和表情反应条。每个渲染器都会拿到消息本身以及装饰所需的几何信息。', ar: 'يستبدل عرض النص الافتراضي لرسالة واحدة؛ ومصيّرات الفتحات تُعيد معاينة الاقتباس والمرفقات وشريط التفاعلات. يتلقّى كل منها الرسالة إضافةً إلى معطيات الهندسة التي تحتاجها الزخرفة.' },

  // --- MessageMeta props -----------------------------------------------------
  mtMetaTimestampStyle: { en: 'How much of the moment to spell out: always the clock, always a date, or the full ladder from clock to “Yesterday” to weekday to date.', es: 'Cuánto detallar el momento: siempre el reloj, siempre una fecha, o la escala completa de reloj a «Ayer», día de la semana y fecha.', fr: 'Le niveau de détail du moment : toujours l’horloge, toujours une date, ou l’échelle complète horloge → « Hier » → jour de la semaine → date.', de: 'Wie ausführlich der Moment geschrieben wird: immer Uhrzeit, immer Datum, oder die volle Leiter von Uhrzeit über „Gestern“ und Wochentag zum Datum.', ja: '時点をどこまで綴るか。常に時刻、常に日付、あるいは時刻→「昨日」→曜日→日付という全段階。', pt: 'Quanto do momento explicitar: sempre o relógio, sempre uma data, ou a escada completa de relógio a «Ontem», dia da semana e data.', zh: '把这一时刻讲到多细：始终显示时钟、始终显示日期，或者从时钟到“昨天”再到星期、再到日期的完整阶梯。', ar: 'مقدار ما يُكتب من اللحظة: الساعة دائمًا، أو التاريخ دائمًا، أو السلّم الكامل من الساعة إلى «أمس» إلى اسم اليوم إلى التاريخ.' },
  mtMetaStatuses: { en: 'A run’s delivery states, collapsed with `leastDelivery` to the least advanced of them — so a stack holding a failed send reports failed, not the “read” its last message might claim.', es: 'Los estados de entrega de una serie, colapsados con `leastDelivery` al menos avanzado: así una pila con un envío fallido informa de fallo y no del «leído» que podría reclamar su último mensaje.', fr: 'Les états de remise d’une série, réduits par `leastDelivery` au moins avancé — une pile contenant un envoi échoué signale donc l’échec, pas le « lu » que son dernier message pourrait revendiquer.', de: 'Die Zustellzustände einer Folge, mit `leastDelivery` auf den am wenigsten fortgeschrittenen reduziert — ein Stapel mit fehlgeschlagenem Versand meldet also Fehlschlag statt des „gelesen“, das seine letzte Nachricht behaupten könnte.', ja: '連続の配信状態を `leastDelivery` で最も進んでいないものへ集約します。失敗した送信を含むスタックは、末尾が「既読」でも失敗と報告します。', pt: 'Os estados de entrega de uma sequência, reduzidos com `leastDelivery` ao menos avançado — assim uma pilha com um envio falhado reporta falha, e não o «lido» que a última mensagem poderia alegar.', zh: '一串消息的送达状态，用 `leastDelivery` 归并为其中最不靠前的一个——因此含有发送失败的一摞会报告失败，而不是最后一条可能声称的“已读”。', ar: 'حالات تسليم السلسلة، تُختصر بـ`leastDelivery` إلى الأقل تقدّمًا — فتُبلّغ كومة تضمّ إرسالًا فاشلًا عن الفشل لا عن «مقروء» التي قد تدّعيها آخر رسالة.' },
  mtMetaOwn: { en: 'Sits inside an accent-filled bubble, so the line takes the contrast colour. Failure is the one status that keeps its own colour and clashes deliberately.', es: 'Está dentro de una burbuja con relleno de acento, así que la línea toma el color de contraste. El fallo es el único estado que conserva su color y contrasta a propósito.', fr: 'Se trouve dans une bulle remplie de l’accent, la ligne prend donc la couleur de contraste. L’échec est le seul état qui garde sa couleur et détonne volontairement.', de: 'Sitzt in einer akzentgefüllten Blase, daher nimmt die Zeile die Kontrastfarbe an. Fehlschlag ist der einzige Status, der seine eigene Farbe behält und bewusst absticht.', ja: 'アクセント塗りのバブル内に置かれるため、この行はコントラスト色になります。失敗だけは独自の色を保ち、意図的に対比させます。', pt: 'Fica dentro de uma bolha preenchida com o acento, por isso a linha assume a cor de contraste. A falha é o único estado que mantém a sua cor e destoa de propósito.', zh: '位于强调色填充的气泡内，因此该行采用对比色。失败是唯一保留自身颜色、有意形成冲突的状态。', ar: 'يقع داخل فقاعة مملوءة بلون التمييز، فيأخذ السطر لون التباين. الفشل وحده يحتفظ بلونه ويتنافر عمدًا.' },
  mtMetaAnnounceTime: { en: 'Whether the timestamp reaches the accessibility tree. False where an enclosing group already announced the same moment, so it is not read twice.', es: 'Si la marca de tiempo llega al árbol de accesibilidad. False cuando un grupo contenedor ya anunció el mismo momento, para no leerlo dos veces.', fr: 'Si l’horodatage atteint l’arbre d’accessibilité. Faux lorsqu’un groupe englobant a déjà annoncé le même instant, pour ne pas le lire deux fois.', de: 'Ob der Zeitstempel den Accessibility-Baum erreicht. Falsch, wenn eine umschließende Gruppe denselben Moment bereits angesagt hat, damit er nicht doppelt gelesen wird.', ja: 'タイムスタンプをアクセシビリティツリーに載せるか。外側のグループが同じ時点を既に読み上げている場合は false にして二重読みを防ぎます。', pt: 'Se a marca de tempo chega à árvore de acessibilidade. Falso quando um grupo envolvente já anunciou o mesmo momento, para não ser lido duas vezes.', zh: '时间戳是否进入无障碍树。当外层消息组已经播报过同一时刻时设为 false，避免重复朗读。', ar: 'هل يصل الطابع الزمني إلى شجرة الوصول. يكون false عندما تكون مجموعة حاوية قد أعلنت اللحظة نفسها، فلا يُقرأ مرتين.' },
  mtMetaFormat: { en: 'Spells the timestamp; defaults to the platform’s `Intl`. A binding with its own catalog reads `kind` and formats the words itself.', es: 'Deletrea la marca de tiempo; por defecto usa el `Intl` de la plataforma. Un binding con su propio catálogo lee `kind` y formatea las palabras él mismo.', fr: 'Écrit l’horodatage ; par défaut l’`Intl` de la plateforme. Un binding disposant de son propre catalogue lit `kind` et formate les mots lui-même.', de: 'Schreibt den Zeitstempel aus; standardmäßig das `Intl` der Plattform. Eine Bindung mit eigenem Katalog liest `kind` und formatiert die Wörter selbst.', ja: 'タイムスタンプを文字にします。既定はプラットフォームの `Intl`。独自カタログを持つバインディングは `kind` を読んで自前で整形します。', pt: 'Escreve a marca de tempo; por omissão usa o `Intl` da plataforma. Um binding com o seu próprio catálogo lê o `kind` e formata as palavras.', zh: '把时间戳写成文字；默认使用平台的 `Intl`。拥有自有词表的绑定可读取 `kind` 自行组织措辞。', ar: 'يكتب الطابع الزمني؛ الافتراضي هو `Intl` المنصّة. أما ربطٌ لديه فهرسه الخاص فيقرأ `kind` وينسّق الكلمات بنفسه.' },

  // --- MessageList props -----------------------------------------------------
  mtListItems: { en: 'The rendered sequence, from `groupMessages` + `insertSeparators`. The list consumes it and never rebuilds it — in particular it never re-derives the unread anchor, which is pinned by the caller precisely so the divider holds still.', es: 'La secuencia renderizada, de `groupMessages` + `insertSeparators`. La lista la consume y nunca la reconstruye; en concreto nunca vuelve a derivar el ancla de no leídos, que fija quien llama justamente para que el divisor no se mueva.', fr: 'La séquence rendue, issue de `groupMessages` + `insertSeparators`. La liste la consomme et ne la reconstruit jamais — en particulier elle ne redérive jamais l’ancre des non-lus, épinglée par l’appelant précisément pour que le séparateur ne bouge pas.', de: 'Die gerenderte Sequenz aus `groupMessages` + `insertSeparators`. Die Liste konsumiert sie und baut sie nie neu — insbesondere leitet sie nie den Ungelesen-Anker neu ab, den der Aufrufer genau deshalb anpinnt, damit der Trenner stillsteht.', ja: '`groupMessages` と `insertSeparators` が生成した描画用シーケンス。リストは消費するだけで再構築せず、とりわけ未読アンカーを再導出しません。区切りを動かさないために呼び出し側が固定しているからです。', pt: 'A sequência desenhada, vinda de `groupMessages` + `insertSeparators`. A lista consome-a e nunca a reconstrói — em particular nunca re-deriva a âncora de não lidas, fixada por quem chama precisamente para o divisor não se mexer.', zh: '由 `groupMessages` + `insertSeparators` 得到的渲染序列。列表只消费它，绝不重建——尤其绝不重新推导未读锚点，调用方钉住它正是为了让分隔线纹丝不动。', ar: 'التسلسل المعروض الآتي من `groupMessages` + `insertSeparators`. تستهلكه القائمة ولا تعيد بناءه أبدًا — وبخاصة لا تعيد اشتقاق مرساة غير المقروء، التي يثبّتها المستدعي تحديدًا كي يبقى الفاصل ثابتًا.' },
  mtListRenderGroup: { en: 'Renders one author run. The list holds no opinion about what a message looks like, which is why the same transcript renders bubbles, a compact log, or a moderation queue.', es: 'Renderiza una serie de un autor. La lista no opina sobre el aspecto de un mensaje, y por eso la misma transcripción renderiza burbujas, un registro compacto o una cola de moderación.', fr: 'Rend une série d’un auteur. La liste n’a aucun avis sur l’apparence d’un message, d’où le fait que la même transcription rende des bulles, un journal compact ou une file de modération.', de: 'Rendert eine Autorenfolge. Die Liste hat keine Meinung dazu, wie eine Nachricht aussieht — deshalb rendert derselbe Verlauf Blasen, ein kompaktes Log oder eine Moderationswarteschlange.', ja: '1人分の連続を描画します。リストはメッセージの見た目に関与しないため、同じトランスクリプトでバブルにも、コンパクトなログにも、モデレーションキューにもなります。', pt: 'Desenha uma sequência de um autor. A lista não tem opinião sobre o aspeto de uma mensagem, e por isso a mesma transcrição desenha bolhas, um registo compacto ou uma fila de moderação.', zh: '渲染一位作者的一串消息。列表对消息长什么样不持立场，因此同一份会话记录可以渲染成气泡、紧凑日志或审核队列。', ar: 'يعرض سلسلة مؤلف واحد. لا رأي للقائمة في شكل الرسالة، ولهذا يعرض السجل نفسه فقاعات أو سجلًّا مضغوطًا أو طابور إشراف.' },
  mtListRenderRows: { en: 'Override the day row, the unread rule, or every row at once. `renderItem` is the escape hatch — and, not coincidentally, the exact signature a windowing list calls.', es: 'Sobrescribe la fila de día, la regla de no leídos o todas las filas a la vez. `renderItem` es la vía de escape y, no por casualidad, la firma exacta que llama una lista virtualizada.', fr: 'Remplace la ligne de date, la règle des non-lus, ou toutes les lignes d’un coup. `renderItem` est la porte de sortie — et, ce n’est pas un hasard, la signature exacte qu’appelle une liste virtualisée.', de: 'Überschreibt die Datumszeile, die Ungelesen-Linie oder gleich jede Zeile. `renderItem` ist die Notluke — und, kein Zufall, exakt die Signatur, die eine Windowing-Liste aufruft.', ja: '日付行、未読ライン、あるいは全行をまとめて差し替えます。`renderItem` は脱出口であり、偶然ではなく仮想リストが呼ぶのと同じシグネチャです。', pt: 'Substitui a linha do dia, a régua de não lidas, ou todas as linhas de uma vez. O `renderItem` é a saída de emergência — e, não por acaso, a assinatura exata que uma lista virtualizada chama.', zh: '覆盖日期行、未读分隔线，或一次性覆盖所有行。`renderItem` 是逃生口——并且并非巧合，它正是虚拟列表调用的那种签名。', ar: 'يتجاوز صف اليوم أو خط غير المقروء أو كل الصفوف دفعة واحدة. و`renderItem` هو مخرج الطوارئ — وليس صدفةً أنه التوقيع نفسه الذي تستدعيه قائمة نافذية.' },
  mtListHeaderFooter: { en: 'Content above the first row and below the last, inside the scroll content. A typing indicator belongs in the footer rather than floating over the transcript.', es: 'Contenido encima de la primera fila y debajo de la última, dentro del contenido desplazable. Un indicador de escritura va en el pie, no flotando sobre la transcripción.', fr: 'Contenu au-dessus de la première ligne et sous la dernière, à l’intérieur du contenu défilant. Un indicateur de saisie va dans le pied, plutôt qu’en flottant au-dessus de la transcription.', de: 'Inhalt über der ersten und unter der letzten Zeile, innerhalb des Scroll-Inhalts. Ein Tippindikator gehört in den Fuß, nicht schwebend über den Verlauf.', ja: 'スクロール内容の内側で、最初の行の上と最後の行の下に置く内容。入力中インジケーターは浮かせるのではなくフッターに置きます。', pt: 'Conteúdo acima da primeira linha e abaixo da última, dentro do conteúdo rolável. Um indicador de escrita pertence ao rodapé, não a flutuar sobre a transcrição.', zh: '位于滚动内容内部、第一行之上与最后一行之下的内容。正在输入指示器应放在 footer，而不是浮在会话记录之上。', ar: 'محتوى فوق الصف الأول وتحت الأخير، داخل محتوى التمرير. مؤشّر الكتابة مكانه التذييل لا التحليق فوق السجل.' },
  mtListStickyDays: { en: 'Pins the current day separator to the top edge while its day scrolls past. The pinned row switches to the chip variant, so a pin that silently fails still reads correctly.', es: 'Fija el separador del día actual al borde superior mientras su día pasa. La fila fijada cambia a la variante chip, de modo que un anclaje que falle en silencio siga leyéndose bien.', fr: 'Épingle le séparateur du jour courant au bord haut pendant que son jour défile. La ligne épinglée passe en variante pastille, si bien qu’un épinglage qui échoue en silence reste lisible.', de: 'Heftet den Trenner des aktuellen Tages an die Oberkante, während sein Tag vorbeiscrollt. Die geheftete Zeile wechselt zur Chip-Variante, sodass ein stumm fehlschlagendes Heften noch korrekt liest.', ja: 'その日のスクロール中、現在の日付セパレーターを上端に固定します。固定行は chip バリアントに切り替わるので、固定が黙って失敗しても表示は破綻しません。', pt: 'Fixa o separador do dia atual à margem superior enquanto o seu dia passa. A linha fixada muda para a variante pastilha, para que uma fixação que falhe em silêncio continue legível.', zh: '在当天的消息滚过期间，把当天的日期分隔行吸附到顶边。被吸附的行会切换成 chip 变体，因此即使吸附悄悄失效，读起来也依然正常。', ar: 'يثبّت فاصل اليوم الحالي عند الحافة العليا أثناء مرور يومه. يتحوّل الصف المثبّت إلى نمط الشارة، فيبقى مقروءًا حتى لو أخفق التثبيت بصمت.' },
  mtListOnScrollState: { en: 'Called whenever any part of the reported scroll state changes: at-bottom, distance from the end, unread below, and whether the jump control should show.', es: 'Se llama cuando cambia cualquier parte del estado de desplazamiento informado: si está abajo, la distancia al final, los no leídos debajo y si debe mostrarse el control de salto.', fr: 'Appelé dès qu’une partie de l’état de défilement rapporté change : en bas ou non, distance à la fin, non-lus en dessous, et affichage ou non du bouton de saut.', de: 'Wird aufgerufen, sobald sich ein Teil des gemeldeten Scroll-Zustands ändert: am Ende, Abstand zum Ende, Ungelesene darunter und ob die Sprungtaste erscheinen soll.', ja: '報告されるスクロール状態のいずれかが変わるたびに呼ばれます。最下部かどうか、末尾までの距離、下にある未読数、ジャンプボタンを出すかどうか。', pt: 'Chamado sempre que muda alguma parte do estado de deslocamento reportado: no fundo ou não, distância ao fim, não lidas abaixo, e se o controlo de salto deve aparecer.', zh: '只要上报的滚动状态有任何变化就会调用：是否在底部、距末尾的距离、下方未读数，以及是否应显示跳转按钮。', ar: 'يُستدعى كلما تغيّر أي جزء من حالة التمرير المُبلَّغ عنها: هل نحن في الأسفل، والمسافة إلى النهاية، وغير المقروء أدناه، وهل يجب إظهار زر القفز.' },
  mtListOnReachTop: { en: 'Called once each time the reader scrolls within `reachTopOffset` of the start — latched, so dragging around near the top does not fire a page request per frame. `loadingOlder` suppresses further calls while a page is in flight.', es: 'Se llama una vez cada vez que quien lee entra dentro de `reachTopOffset` del inicio; con enclavamiento, para que arrastrar cerca del inicio no dispare una petición por fotograma. `loadingOlder` suprime más llamadas mientras hay una página en vuelo.', fr: 'Appelé une fois chaque fois que le lecteur passe à moins de `reachTopOffset` du début — verrouillé, pour qu’un glissement près du haut ne déclenche pas une requête par image. `loadingOlder` supprime les appels suivants tant qu’une page est en vol.', de: 'Wird einmal aufgerufen, sobald der Leser innerhalb von `reachTopOffset` zum Anfang gelangt — verriegelt, damit Ziehen nahe dem Anfang nicht pro Frame eine Seite anfordert. `loadingOlder` unterdrückt weitere Aufrufe, solange eine Seite unterwegs ist.', ja: '読者が先頭から `reachTopOffset` 以内に入るたびに一度呼ばれます。ラッチされるため、上端付近でドラッグしてもフレームごとに要求は飛びません。`loadingOlder` は読み込み中の追加呼び出しを抑えます。', pt: 'Chamado uma vez sempre que o leitor entra dentro de `reachTopOffset` do início — com tranca, para que arrastar perto do topo não dispare um pedido por fotograma. O `loadingOlder` suprime chamadas enquanto há uma página a caminho.', zh: '每当读者滚动到距开头 `reachTopOffset` 以内时调用一次——带锁存，因此在顶部附近拖动不会每帧都发一次分页请求。`loadingOlder` 会在请求进行中抑制后续调用。', ar: 'يُستدعى مرة كلما اقترب القارئ إلى مسافة `reachTopOffset` من البداية — بمزلاج، فلا يُطلق السحب قرب الأعلى طلب صفحة في كل إطار. ويكبح `loadingOlder` الاستدعاءات اللاحقة ما دامت صفحة قيد الطلب.' },
  mtListUnreadCount: { en: 'Overrides the unread tally the divider would supply — for a surface that knows a truer number than the transcript in front of it.', es: 'Sobrescribe el recuento de no leídos que aportaría el divisor, para una superficie que conoce un número más veraz que la transcripción que tiene delante.', fr: 'Remplace le compteur de non-lus que fournirait le séparateur — pour une surface qui connaît un chiffre plus juste que la transcription qu’elle affiche.', de: 'Überschreibt die Ungelesen-Zahl, die der Trenner liefern würde — für eine Oberfläche, die eine wahrere Zahl kennt als der Verlauf vor ihr.', ja: '区切りが提供する未読数を上書きします。目の前のトランスクリプトより正確な数を知っている画面向けです。', pt: 'Substitui a contagem de não lidas que o divisor forneceria — para uma superfície que conhece um número mais verdadeiro do que a transcrição à sua frente.', zh: '覆盖由分隔线给出的未读计数——适用于比眼前这份会话记录更清楚真实数字的界面。', ar: 'يتجاوز عدّاد غير المقروء الذي يوفّره الفاصل — لواجهة تعرف رقمًا أدقّ من السجل الماثل أمامها.' },
  mtListAnnounce: { en: 'How arrivals reach assistive technology: a coalesced polite count (the default), the log itself made live for a quiet one-to-one thread, or silence.', es: 'Cómo llegan las llegadas a la tecnología de asistencia: un recuento cortés agrupado (por defecto), el propio registro en vivo para un hilo tranquilo uno a uno, o silencio.', fr: 'Comment les arrivées atteignent les technologies d’assistance : un décompte poli regroupé (par défaut), le journal lui-même rendu live pour un fil calme en tête-à-tête, ou le silence.', de: 'Wie Neuzugänge assistive Technik erreichen: eine gebündelte höfliche Zählung (Standard), das Log selbst live für einen ruhigen Einzelthread, oder Stille.', ja: '新着支援技術への伝え方。まとめた polite な件数（既定）、静かな1対1スレッド向けにログ自体をライブ化、または無音。', pt: 'Como as chegadas alcançam a tecnologia de apoio: uma contagem educada agrupada (por omissão), o próprio registo tornado live para uma conversa calma a dois, ou silêncio.', zh: '新消息如何传达给辅助技术：合并后的礼貌计数（默认）、把日志本身设为 live（适合安静的一对一会话），或完全静默。', ar: 'كيف تصل الرسائل الواردة إلى التقنيات المساعدة: عدّ مهذّب مُجمَّع (الافتراضي)، أو جعل السجل نفسه حيًّا لمحادثة ثنائية هادئة، أو الصمت.' },
  mtListInitialItemKey: { en: 'Row to open on instead of the bottom — normally the unread divider’s key, so a returning reader lands where they stopped.', es: 'Fila en la que abrir en lugar del final: normalmente la clave del divisor de no leídos, para que quien vuelve aterrice donde lo dejó.', fr: 'Ligne d’ouverture au lieu du bas — normalement la clé du séparateur de non-lus, pour qu’un lecteur de retour atterrisse là où il s’était arrêté.', de: 'Zeile, auf der geöffnet wird statt am Ende — normalerweise der Schlüssel des Ungelesen-Trenners, damit ein zurückkehrender Leser dort landet, wo er aufgehört hat.', ja: '末尾ではなく、この行を開始位置にします。通常は未読区切りのキーで、戻ってきた読者が中断地点に着地します。', pt: 'Linha em que abrir em vez do fundo — normalmente a chave do divisor de não lidas, para que um leitor que regressa caia onde parou.', zh: '打开时定位到的行，而不是底部——通常是未读分隔线的 key，让回来的读者落在上次停下的地方。', ar: 'الصف الذي يُفتح عنده بدل الأسفل — عادةً مفتاح فاصل غير المقروء، فيهبط القارئ العائد حيث توقّف.' },
  mtListEstimate: { en: 'Reserved. Nothing reads it today: it is the one input a windowing list needs that cannot be derived from the props above, so declaring it now makes the virtualisation swap additive rather than breaking.', es: 'Reservado. Hoy nadie lo lee: es la única entrada que una lista virtualizada necesita y no se puede derivar de las props anteriores, así que declararla ahora hace que el cambio a virtualización sea aditivo y no rompedor.', fr: 'Réservé. Rien ne le lit aujourd’hui : c’est la seule entrée dont une liste virtualisée a besoin et qui ne se déduit pas des props ci-dessus, donc la déclarer maintenant rend le passage à la virtualisation additif plutôt que cassant.', de: 'Reserviert. Heute liest es niemand: Es ist die eine Eingabe, die eine Windowing-Liste braucht und die sich nicht aus den obigen Props ableiten lässt — sie jetzt zu deklarieren macht den Virtualisierungswechsel additiv statt brechend.', ja: '予約。現在は誰も参照しません。仮想リストが必要とする入力のうち、上のプロップから導出できない唯一のものなので、今宣言しておくことで仮想化への移行が破壊的でなく追加的になります。', pt: 'Reservado. Hoje nada o lê: é a única entrada de que uma lista virtualizada precisa e que não se deriva das props acima, por isso declará-la agora torna a passagem à virtualização aditiva em vez de disruptiva.', zh: '预留。目前无人读取：它是虚拟列表所需、又无法从上面这些 prop 推导出来的唯一输入，因此现在就声明可以让将来切换虚拟化成为增量改动而非破坏性变更。', ar: 'محجوز. لا يقرؤه شيء اليوم: هو المُدخل الوحيد الذي تحتاجه قائمة نافذية ولا يمكن اشتقاقه من الخصائص أعلاه، فإعلانه الآن يجعل التحوّل إلى الافتراضية إضافيًا لا كاسرًا.' },
  mtListMaxHeight: { en: 'Caps the viewport height. Omit inside a flex column, where the transcript fills what is left.', es: 'Limita la altura del viewport. Omítelo dentro de una columna flex, donde la transcripción rellena lo que quede.', fr: 'Plafonne la hauteur du viewport. À omettre dans une colonne flex, où la transcription remplit ce qui reste.', de: 'Begrenzt die Viewport-Höhe. In einer Flex-Spalte weglassen, dort füllt der Verlauf den Rest.', ja: 'ビューポートの高さの上限。flex カラム内では省略し、トランスクリプトが残りを埋めます。', pt: 'Limita a altura da viewport. Omite dentro de uma coluna flex, onde a transcrição preenche o que sobra.', zh: '限制视口高度。在 flex 列中请省略，让会话记录填满剩余空间。', ar: 'يحدّ ارتفاع منطقة العرض. أغفله داخل عمود flex حيث يملأ السجل ما تبقّى.' },
  mtListRef: { en: 'Hands back the imperative handle — `scrollToBottom`, `scrollToItem`, `getMetrics` — rather than the root element, because what a caller wants after sending a message is “put me at the bottom”, not a div.', es: 'Devuelve el handle imperativo —`scrollToBottom`, `scrollToItem`, `getMetrics`— en lugar del elemento raíz, porque lo que quiere quien llama tras enviar un mensaje es «ponme abajo», no un div.', fr: 'Renvoie la poignée impérative — `scrollToBottom`, `scrollToItem`, `getMetrics` — plutôt que l’élément racine, car ce que veut un appelant après l’envoi d’un message, c’est « mets-moi en bas », pas un div.', de: 'Gibt den imperativen Handle zurück — `scrollToBottom`, `scrollToItem`, `getMetrics` — statt des Wurzelelements, denn was ein Aufrufer nach dem Senden will, ist „setz mich nach unten“, kein div.', ja: 'ルート要素ではなく命令的ハンドル（`scrollToBottom`、`scrollToItem`、`getMetrics`）を返します。送信後に呼び出し側が欲しいのは div ではなく「最下部へ」だからです。', pt: 'Devolve a pega imperativa — `scrollToBottom`, `scrollToItem`, `getMetrics` — em vez do elemento raiz, porque o que quem chama quer depois de enviar uma mensagem é «põe-me no fundo», não um div.', zh: '交回命令式句柄——`scrollToBottom`、`scrollToItem`、`getMetrics`——而不是根元素，因为调用方发完消息后想要的是“把我带到底部”，不是一个 div。', ar: 'يعيد المقبض الأمري — `scrollToBottom` و`scrollToItem` و`getMetrics` — بدل عنصر الجذر، لأن ما يريده المستدعي بعد إرسال رسالة هو «انقلني إلى الأسفل»، لا عنصر div.' },

  // --- separator props -------------------------------------------------------
  mtDayLabel: { en: 'The spelled day. Supply this, or supply `at` and let the row spell it — `today` and `yesterday` come from the catalog, everything below them from `Intl`.', es: 'El día ya escrito. Aporta esto, o aporta `at` y deja que la fila lo escriba: `today` y `yesterday` vienen del catálogo, lo demás de `Intl`.', fr: 'Le jour déjà écrit. Fournissez ceci, ou fournissez `at` et laissez la ligne l’écrire — `today` et `yesterday` viennent du catalogue, tout le reste d’`Intl`.', de: 'Der ausgeschriebene Tag. Entweder das hier angeben oder `at` und die Zeile schreiben lassen — `today` und `yesterday` kommen aus dem Katalog, alles darunter aus `Intl`.', ja: '文字にした日付。これを渡すか、`at` を渡して行に綴らせます。`today` と `yesterday` はカタログ由来、それ以下は `Intl` 由来です。', pt: 'O dia já escrito. Fornece isto, ou fornece `at` e deixa a linha escrevê-lo — `today` e `yesterday` vêm do catálogo, tudo abaixo deles do `Intl`.', zh: '已写好的日期文字。要么传这个，要么传 `at` 让该行自己拼写——`today` 与 `yesterday` 取自词表，其余取自 `Intl`。', ar: 'اليوم مكتوبًا. مرّر هذا، أو مرّر `at` ودع الصف يكتبه — `today` و`yesterday` من الفهرس، وما دونهما من `Intl`.' },
  mtDayVariant: { en: 'Rule sits the label on a hairline; chip floats it as a pill. MessageList switches a pinned row to chip on its own.', es: 'rule apoya la etiqueta en una línea fina; chip la flota como píldora. MessageList cambia por su cuenta una fila fijada a chip.', fr: 'rule pose l’étiquette sur un filet ; chip la fait flotter en pastille. MessageList bascule seul une ligne épinglée en chip.', de: 'rule setzt das Label auf eine Haarlinie; chip lässt es als Pille schweben. MessageList schaltet eine geheftete Zeile selbst auf chip.', ja: 'rule はラベルをヘアラインの上に置き、chip はピルとして浮かせます。MessageList は固定行を自動的に chip へ切り替えます。', pt: 'rule assenta a etiqueta numa linha fina; chip fá-la flutuar como pastilha. O MessageList muda sozinho uma linha fixada para chip.', zh: 'rule 让标签落在细线上；chip 把它浮成胶囊。MessageList 会自行把被吸附的行切换为 chip。', ar: 'يضع rule التسمية على خط رفيع، ويجعلها chip شارة عائمة. ويحوّل MessageList صفًّا مثبّتًا إلى chip من تلقاء نفسه.' },
  mtDaySticky: { en: 'Pins the row to the scroll viewport’s top edge while its day passes. MessageList sets it for you; it is exposed because a caller rendering their own day rows needs the same switch.', es: 'Fija la fila al borde superior del viewport mientras pasa su día. MessageList lo pone por ti; se expone porque quien renderice sus propias filas de día necesita el mismo interruptor.', fr: 'Épingle la ligne au bord haut du viewport pendant que son jour défile. MessageList le règle pour vous ; il est exposé car un appelant qui rend ses propres lignes de date a besoin du même interrupteur.', de: 'Heftet die Zeile an die Oberkante des Viewports, während ihr Tag vorbeizieht. MessageList setzt das für Sie; es ist offengelegt, weil ein Aufrufer mit eigenen Datumszeilen denselben Schalter braucht.', ja: 'その日が流れる間、行をスクロールビューポートの上端に固定します。MessageList が設定しますが、独自の日付行を描く呼び出し側にも同じスイッチが必要なため公開しています。', pt: 'Fixa a linha à margem superior da viewport enquanto o seu dia passa. O MessageList define-o por ti; está exposto porque quem desenha as suas próprias linhas de dia precisa do mesmo interruptor.', zh: '在其所属日期滚过期间，把该行吸附到滚动视口顶边。MessageList 会替你设置；之所以对外暴露，是因为自行渲染日期行的调用方需要同一个开关。', ar: 'يثبّت الصف عند الحافة العليا لمنطقة التمرير أثناء مرور يومه. يضبطه MessageList عنك، وهو معروض لأن من يعرض صفوف أيامه بنفسه يحتاج المفتاح ذاته.' },
  mtUnreadLabel: { en: 'The phrase on the rule. Defaults to the shared “New messages” string.', es: 'La frase sobre la regla. Por defecto, la cadena compartida «Mensajes nuevos».', fr: 'La phrase posée sur la règle. Par défaut, la chaîne partagée « Nouveaux messages ».', de: 'Der Satz auf der Linie. Standardmäßig die gemeinsame Zeichenkette „Neue Nachrichten“.', ja: '罫線上の文言。既定は共有文字列「新着メッセージ」。', pt: 'A frase sobre a régua. Por omissão, a cadeia partilhada «Novas mensagens».', zh: '分隔线上的文字。默认使用共享的“新消息”字符串。', ar: 'العبارة على الخط. الافتراضي هو النص المشترك «رسائل جديدة».' },
  mtUnreadCount: { en: 'How many messages are unread from here down. Shown as a chip when greater than zero, and folded into the accessible name rather than left beside it.', es: 'Cuántos mensajes hay sin leer de aquí hacia abajo. Se muestra como chip si es mayor que cero, y se pliega en el nombre accesible en vez de quedar al lado.', fr: 'Combien de messages sont non lus à partir d’ici. Affiché en pastille au-delà de zéro, et intégré au nom accessible plutôt que laissé à côté.', de: 'Wie viele Nachrichten von hier abwärts ungelesen sind. Über null als Chip gezeigt und in den zugänglichen Namen eingefaltet statt danebengestellt.', ja: 'ここから下の未読件数。0 より大きいときチップとして表示し、隣に置くのではなくアクセシブル名に畳み込みます。', pt: 'Quantas mensagens estão por ler daqui para baixo. Mostrado como pastilha quando maior que zero, e dobrado no nome acessível em vez de ficar ao lado.', zh: '从这里往下有多少条未读。大于零时显示为胶囊，并折进无障碍名称而不是摆在旁边。', ar: 'كم رسالة غير مقروءة من هنا نزولًا. تُعرض كشارة عندما تتجاوز الصفر، وتُدمج في الاسم الوصفي بدل تركها بجانبه.' },
  mtUnreadAlign: { en: 'Centre reads as a boundary; start reads as a heading for what follows.', es: 'center se lee como frontera; start se lee como encabezado de lo que sigue.', fr: 'center se lit comme une frontière ; start se lit comme un titre de ce qui suit.', de: 'center liest sich als Grenze; start liest sich als Überschrift für das Folgende.', ja: 'center は境界として、start は続く内容の見出しとして読めます。', pt: 'center lê-se como fronteira; start lê-se como cabeçalho do que se segue.', zh: 'center 读作一条边界；start 读作后续内容的小标题。', ar: 'يُقرأ center كحدّ فاصل، ويُقرأ start كعنوان لما يليه.' },
  mtLatestVisible: { en: 'Whether it is on screen. Decided by `shouldShowScrollToLatest` in commons, never here: when a jump control appears is a product decision a phone and a browser must agree on.', es: 'Si está en pantalla. Lo decide `shouldShowScrollToLatest` en commons, nunca aquí: cuándo aparece un control de salto es una decisión de producto en la que un móvil y un navegador deben coincidir.', fr: 'S’il est à l’écran. Décidé par `shouldShowScrollToLatest` dans commons, jamais ici : le moment où un bouton de saut apparaît est une décision produit sur laquelle un téléphone et un navigateur doivent s’accorder.', de: 'Ob er auf dem Bildschirm ist. Entschieden von `shouldShowScrollToLatest` in commons, nie hier: Wann eine Sprungtaste erscheint, ist eine Produktentscheidung, über die Telefon und Browser einig sein müssen.', ja: '画面上に出すかどうか。ここではなく commons の `shouldShowScrollToLatest` が決めます。ジャンプボタンをいつ出すかはプロダクトの判断で、スマホとブラウザが一致していなければなりません。', pt: 'Se está no ecrã. Decidido por `shouldShowScrollToLatest` em commons, nunca aqui: quando um controlo de salto aparece é uma decisão de produto em que um telemóvel e um navegador têm de concordar.', zh: '它是否显示在屏幕上。由 commons 中的 `shouldShowScrollToLatest` 决定，绝不在这里决定：跳转按钮何时出现是产品决策，手机和浏览器必须一致。', ar: 'هل هو ظاهر على الشاشة. يقرّره `shouldShowScrollToLatest` في commons لا هنا: توقيت ظهور زر القفز قرار منتج يجب أن يتفق عليه الهاتف والمتصفح.' },
  mtLatestCount: { en: 'Unread messages waiting below; zero renders the button bare. `max` caps the badge, past which it reads “99+”.', es: 'Mensajes sin leer esperando abajo; cero renderiza el botón desnudo. `max` limita la insignia, más allá de la cual pone «99+».', fr: 'Messages non lus en attente en dessous ; zéro rend le bouton nu. `max` plafonne le badge, au-delà duquel il affiche « 99+ ».', de: 'Ungelesene Nachrichten, die unten warten; null rendert den Button ohne Abzeichen. `max` deckelt das Badge, darüber steht „99+“.', ja: '下で待っている未読件数。0 ならバッジなしで描画します。`max` はバッジの上限で、超えると「99+」と表示します。', pt: 'Mensagens por ler à espera abaixo; zero desenha o botão sem selo. O `max` limita o selo, acima do qual lê «99+».', zh: '下方等待的未读消息数；为零时按钮不带徽章。`max` 为徽章上限，超过后显示“99+”。', ar: 'الرسائل غير المقروءة المنتظرة أدناه؛ الصفر يعرض الزر مجرّدًا. و`max` يحدّ الشارة فتصير «99+» فوقه.' },

  // --- accessibility ---------------------------------------------------------
  mtA11y1: { en: 'The transcript is a `role="log"` region with `aria-live="off"` by default. `role="log"` is implicitly polite, and a live log on a busy channel interrupts itself on every arrival, so the reader hears an endless run of first syllables.', es: 'La transcripción es una región `role="log"` con `aria-live="off"` por defecto. `role="log"` es implícitamente cortés, y un registro en vivo en un canal activo se interrumpe a sí mismo en cada llegada, así que se oye una cadena infinita de primeras sílabas.', fr: 'La transcription est une région `role="log"` avec `aria-live="off"` par défaut. `role="log"` est implicitement poli, et un journal live sur un canal actif s’interrompt à chaque arrivée : on n’entend qu’une suite infinie de premières syllabes.', de: 'Der Verlauf ist eine `role="log"`-Region mit standardmäßig `aria-live="off"`. `role="log"` ist implizit höflich, und ein Live-Log auf einem belebten Kanal unterbricht sich bei jeder Ankunft, sodass man eine endlose Folge erster Silben hört.', ja: 'トランスクリプトは既定で `aria-live="off"` の `role="log"` 領域です。`role="log"` は暗黙に polite であり、賑やかなチャンネルでライブにすると到着のたびに自分自身を中断し、最初の音節の連続しか聞こえません。', pt: 'A transcrição é uma região `role="log"` com `aria-live="off"` por omissão. O `role="log"` é implicitamente educado, e um registo live num canal movimentado interrompe-se a cada chegada, pelo que se ouve uma sequência infinita de primeiras sílabas.', zh: '会话记录是一个 `role="log"` 区域，默认 `aria-live="off"`。`role="log"` 隐含 polite，而在繁忙频道里把日志设为 live，会在每条新消息到来时打断自己，听到的只是一串无尽的首音节。', ar: 'السجل منطقة `role="log"` مع `aria-live="off"` افتراضيًا. الدور `role="log"` مهذّب ضمنًا، وسجلٌّ حيّ في قناة مزدحمة يقاطع نفسه عند كل وصول، فلا يسمع القارئ إلا سلسلة لا تنتهي من المقاطع الأولى.' },
  mtA11y2: { en: 'Arrivals are counted from the previously-known last message, never from a length difference, and coalesced into one polite “{count} new messages” at most every two seconds. Paging older history lengthens the list without anything having arrived, and announcing that is worse than announcing nothing.', es: 'Las llegadas se cuentan desde el último mensaje conocido, nunca por diferencia de longitud, y se agrupan en un único «{count} mensajes nuevos» cortés como mucho cada dos segundos. Paginar historial alarga la lista sin que haya llegado nada, y anunciar eso es peor que no anunciar nada.', fr: 'Les arrivées sont comptées depuis le dernier message connu, jamais par différence de longueur, et regroupées en un seul « {count} nouveaux messages » poli, au plus toutes les deux secondes. Charger l’historique allonge la liste sans que rien ne soit arrivé, et l’annoncer est pire que de ne rien annoncer.', de: 'Neuzugänge werden ab der zuvor bekannten letzten Nachricht gezählt, nie über eine Längendifferenz, und höchstens alle zwei Sekunden zu einem höflichen „{count} neue Nachrichten“ gebündelt. Ältere Historie zu laden verlängert die Liste, ohne dass etwas angekommen wäre — das anzusagen ist schlimmer als Schweigen.', ja: '新着は長さの差ではなく、直前に把握していた最後のメッセージを起点に数え、最短2秒間隔でまとめて polite に「{count} 件の新着メッセージ」と伝えます。古い履歴の読み込みは何も到着せずにリストを伸ばすだけで、それを告げるのは黙っているより悪いのです。', pt: 'As chegadas são contadas a partir da última mensagem conhecida, nunca por diferença de comprimento, e agrupadas num único «{count} novas mensagens» educado, no máximo a cada dois segundos. Carregar histórico alonga a lista sem nada ter chegado, e anunciar isso é pior do que não anunciar nada.', zh: '新消息从此前已知的最后一条开始计数，绝不用长度差，并合并成一条礼貌的“{count} 条新消息”，最快每两秒一次。加载更早的历史只会让列表变长而并没有新消息到达，播报这个比什么都不播报更糟。', ar: 'تُحصى الرسائل الواردة انطلاقًا من آخر رسالة معروفة سابقًا، لا من فرق الطول، وتُجمَّع في إعلان مهذّب واحد «{count} رسائل جديدة» كل ثانيتين على الأكثر. تحميل سجل أقدم يطيل القائمة دون وصول شيء، والإعلان عن ذلك أسوأ من الصمت.' },
  mtA11y3: { en: '`aria-setsize` and `aria-posinset` are computed against the FULL sequence, never against whatever subset happens to be mounted. A windowing list that let rows 300–320 number themselves 1–21 would tell a screen reader the conversation has twenty-one messages in it.', es: '`aria-setsize` y `aria-posinset` se calculan contra la secuencia COMPLETA, nunca contra el subconjunto montado. Una lista virtualizada que dejara que las filas 300–320 se numeraran 1–21 le diría a un lector de pantalla que la conversación tiene veintiún mensajes.', fr: '`aria-setsize` et `aria-posinset` sont calculés sur la séquence COMPLÈTE, jamais sur le sous-ensemble monté. Une liste virtualisée laissant les lignes 300–320 se numéroter 1–21 dirait à un lecteur d’écran que la conversation compte vingt-et-un messages.', de: '`aria-setsize` und `aria-posinset` werden gegen die VOLLSTÄNDIGE Sequenz berechnet, nie gegen die gerade montierte Teilmenge. Eine Windowing-Liste, in der sich die Zeilen 300–320 als 1–21 nummerieren, erzählte einem Screenreader von einundzwanzig Nachrichten.', ja: '`aria-setsize` と `aria-posinset` は、マウント中の部分集合ではなく必ず全シーケンスに対して算出します。300〜320 行目が自身を 1〜21 と番号付けする仮想リストは、会話に21件しかないとスクリーンリーダーに伝えてしまいます。', pt: 'O `aria-setsize` e o `aria-posinset` são calculados sobre a sequência COMPLETA, nunca sobre o subconjunto montado. Uma lista virtualizada que deixasse as linhas 300–320 numerarem-se 1–21 diria a um leitor de ecrã que a conversa tem vinte e uma mensagens.', zh: '`aria-setsize` 与 `aria-posinset` 是针对完整序列计算的，绝不针对恰好挂载的那一小段。若虚拟列表让第 300–320 行把自己编号为 1–21，读屏软件会以为这段对话只有二十一条消息。', ar: 'يُحسب `aria-setsize` و`aria-posinset` مقابل التسلسل الكامل، لا مقابل الجزء المُركَّب صدفةً. قائمة نافذية تدع الصفوف 300–320 ترقّم نفسها 1–21 ستخبر قارئ الشاشة أن المحادثة تضمّ إحدى وعشرين رسالة.' },
  mtA11y4: { en: 'Separators are `role="separator"` with the day or the phrase on `aria-label`, not headings. A long transcript holds hundreds of them, and filling the heading list with three months of dates buries the headings actually worth jumping to.', es: 'Los separadores son `role="separator"` con el día o la frase en `aria-label`, no encabezados. Una transcripción larga tiene cientos, y llenar la lista de encabezados con tres meses de fechas entierra los encabezados a los que sí vale la pena saltar.', fr: 'Les séparateurs sont des `role="separator"` avec le jour ou la phrase dans `aria-label`, pas des titres. Une longue transcription en contient des centaines, et remplir la liste des titres de trois mois de dates enterre les titres qui méritent qu’on y saute.', de: 'Trenner sind `role="separator"` mit dem Tag oder dem Satz auf `aria-label`, keine Überschriften. Ein langer Verlauf enthält Hunderte davon, und drei Monate Daten in der Überschriftenliste begraben die Überschriften, zu denen zu springen sich lohnt.', ja: 'セパレーターは見出しではなく、日付や文言を `aria-label` に載せた `role="separator"` です。長いトランスクリプトには何百も並ぶため、3か月分の日付で見出し一覧を埋めると、本当に飛びたい見出しが埋もれます。', pt: 'Os separadores são `role="separator"` com o dia ou a frase no `aria-label`, não cabeçalhos. Uma transcrição longa tem centenas deles, e encher a lista de cabeçalhos com três meses de datas enterra os cabeçalhos a que vale a pena saltar.', zh: '分隔符是 `role="separator"`，日期或短语放在 `aria-label` 上，而不是标题。长会话记录里有成百上千个，用三个月的日期塞满标题列表，会把真正值得跳转的标题淹没。', ar: 'الفواصل هي `role="separator"` مع اليوم أو العبارة في `aria-label`، لا عناوين. السجل الطويل يضمّ مئات منها، وملء قائمة العناوين بثلاثة أشهر من التواريخ يدفن العناوين الجديرة بالقفز إليها.' },
  mtA11y5: { en: 'The jump control renders nothing at all while hidden rather than fading to zero opacity: an invisible control that keeps its place in the tab order is a trap for anyone not using a mouse.', es: 'El control de salto no renderiza nada mientras está oculto, en vez de desvanecerse a opacidad cero: un control invisible que conserva su lugar en el orden de tabulación es una trampa para quien no usa ratón.', fr: 'Le bouton de saut ne rend rien du tout tant qu’il est masqué, plutôt que de passer à une opacité nulle : un contrôle invisible qui garde sa place dans l’ordre de tabulation est un piège pour qui n’utilise pas de souris.', de: 'Die Sprungtaste rendert im verborgenen Zustand gar nichts, statt auf Deckkraft null zu blenden: Ein unsichtbares Bedienelement, das seinen Platz in der Tabreihenfolge behält, ist eine Falle für alle ohne Maus.', ja: 'ジャンプボタンは非表示時に不透明度0にするのではなく、まったく描画しません。タブ順に残る見えないコントロールは、マウスを使わない人にとって罠だからです。', pt: 'O controlo de salto não desenha nada enquanto está escondido, em vez de desvanecer para opacidade zero: um controlo invisível que mantém o seu lugar na ordem de tabulação é uma armadilha para quem não usa rato.', zh: '跳转按钮在隐藏时完全不渲染，而不是淡出到不透明度为零：一个仍占据 Tab 顺序的隐形控件，对不用鼠标的人来说是个陷阱。', ar: 'زر القفز لا يعرض شيئًا إطلاقًا حين يكون مخفيًا بدل التلاشي إلى شفافية صفرية: عنصر تحكّم غير مرئي يحتفظ بموقعه في ترتيب التنقّل فخٌّ لمن لا يستخدم الفأرة.' },

  // --- usage -----------------------------------------------------------------
  mtUse1: { en: 'Run the pipeline once per transcript: `groupMessages(messages)` then `insertSeparators(groups, { unreadAnchorId, viewerId })`, memoised. Never rebuild it inside a render pass that also scrolls.', es: 'Ejecuta la tubería una vez por transcripción: `groupMessages(messages)` y luego `insertSeparators(groups, { unreadAnchorId, viewerId })`, memoizado. Nunca la reconstruyas dentro de un render que además desplaza.', fr: 'Exécutez la chaîne une fois par transcription : `groupMessages(messages)` puis `insertSeparators(groups, { unreadAnchorId, viewerId })`, mémoïsé. Ne la reconstruisez jamais dans une passe de rendu qui fait aussi défiler.', de: 'Führen Sie die Kette einmal pro Verlauf aus: `groupMessages(messages)`, dann `insertSeparators(groups, { unreadAnchorId, viewerId })`, memoisiert. Bauen Sie sie nie in einem Renderdurchlauf neu, der auch scrollt.', ja: 'パイプラインはトランスクリプトごとに1回だけ実行します。`groupMessages(messages)` の後に `insertSeparators(groups, { unreadAnchorId, viewerId })` をメモ化して。スクロールも行うレンダー内で作り直してはいけません。', pt: 'Corre a cadeia uma vez por transcrição: `groupMessages(messages)` e depois `insertSeparators(groups, { unreadAnchorId, viewerId })`, memoizado. Nunca a reconstruas dentro de um render que também faz scroll.', zh: '每份会话记录只跑一次流水线：先 `groupMessages(messages)`，再 `insertSeparators(groups, { unreadAnchorId, viewerId })`，并做 memo。绝不要在同时还会滚动的渲染过程中重建它。', ar: 'شغّل المسار مرة واحدة لكل سجل: `groupMessages(messages)` ثم `insertSeparators(groups, { unreadAnchorId, viewerId })` مع التذكير (memo). ولا تُعِد بناءه داخل تمريرة عرض تُمرّر أيضًا.' },
  mtUse2: { en: 'Capture the unread anchor id once, when the conversation opens, and hold it. Recomputing it from a read watermark on every render is exactly what makes dividers walk down the screen under the reader’s eyes.', es: 'Captura el id del ancla de no leídos una sola vez, al abrir la conversación, y consérvalo. Recalcularlo desde una marca de lectura en cada render es justo lo que hace que los divisores bajen por la pantalla ante los ojos de quien lee.', fr: 'Capturez l’id de l’ancre des non-lus une seule fois, à l’ouverture de la conversation, et gardez-le. Le recalculer depuis un filigrane de lecture à chaque rendu est précisément ce qui fait descendre les séparateurs sous les yeux du lecteur.', de: 'Erfassen Sie die Ungelesen-Anker-Id einmal beim Öffnen des Gesprächs und halten Sie sie fest. Sie bei jedem Render aus einem Lese-Wasserzeichen neu zu berechnen, lässt Trenner genau deshalb vor den Augen des Lesers nach unten wandern.', ja: '未読アンカーの id は会話を開いたときに一度だけ取得し、保持します。既読ウォーターマークからレンダーごとに再計算することこそが、読者の目の前で区切り線を下へ歩かせる原因です。', pt: 'Captura o id da âncora de não lidas uma só vez, ao abrir a conversa, e guarda-o. Recalculá-lo a partir de uma marca de leitura a cada render é exatamente o que faz os divisores descerem o ecrã à frente de quem lê.', zh: '在会话打开时把未读锚点 id 抓取一次并保存住。每次渲染都从已读水位线重新计算，正是让分隔线在读者眼皮底下一路往下走的原因。', ar: 'التقط معرّف مرساة غير المقروء مرة واحدة عند فتح المحادثة واحتفظ به. إعادة حسابه من علامة قراءة مائية في كل عرض هو بالضبط ما يجعل الفواصل تمشي نزولًا أمام عيني القارئ.' },
  mtUse3: { en: 'Give `now` a value you control. Every timestamp and day label is read against it, so a transcript, a test, and a screenshot all render the same instead of drifting with the wall clock.', es: 'Dale a `now` un valor que controles. Cada marca de tiempo y etiqueta de día se lee contra él, así que una transcripción, una prueba y una captura rendericen igual en vez de derivar con el reloj de pared.', fr: 'Donnez à `now` une valeur que vous contrôlez. Chaque horodatage et étiquette de jour s’y réfère, si bien qu’une transcription, un test et une capture rendent la même chose au lieu de dériver avec l’horloge.', de: 'Geben Sie `now` einen Wert, den Sie kontrollieren. Jeder Zeitstempel und jedes Tageslabel wird dagegen gelesen, sodass Verlauf, Test und Screenshot identisch rendern statt mit der Wanduhr zu driften.', ja: '`now` には自分が制御できる値を渡してください。すべてのタイムスタンプと日付ラベルはこれを基準に解釈されるため、実時計に流されず、トランスクリプト・テスト・スクリーンショットが同じ結果になります。', pt: 'Dá ao `now` um valor que controlas. Cada marca de tempo e etiqueta de dia é lida contra ele, para que transcrição, teste e captura desenhem o mesmo em vez de derivarem com o relógio.', zh: '给 `now` 一个你能控制的值。每个时间戳和日期标签都以它为参照，这样会话记录、测试与截图才会渲染一致，而不会随挂钟漂移。', ar: 'امنح `now` قيمة تتحكّم بها. كل طابع زمني وكل تسمية يوم تُقرأ بالنسبة إليها، فيخرج السجل والاختبار واللقطة متطابقين بدل أن ينحرفوا مع ساعة الحائط.' },
  mtUse4: { en: 'Put the transcript in a flex column with `min-height: 0` and leave `maxHeight` off. `MessageList` already sets that on its own root; the height cap here exists only so the docs pane has a viewport to scroll.', es: 'Coloca la transcripción en una columna flex con `min-height: 0` y deja `maxHeight` sin poner. `MessageList` ya lo establece en su propia raíz; el tope de altura aquí solo existe para que el panel de la documentación tenga un viewport que desplazar.', fr: 'Placez la transcription dans une colonne flex avec `min-height: 0` et laissez `maxHeight` de côté. `MessageList` le définit déjà sur sa propre racine ; le plafond de hauteur ici n’existe que pour donner un viewport à faire défiler au panneau de doc.', de: 'Setzen Sie den Verlauf in eine Flex-Spalte mit `min-height: 0` und lassen Sie `maxHeight` weg. `MessageList` setzt das bereits an seiner eigenen Wurzel; die Höhenbegrenzung hier existiert nur, damit der Doku-Bereich einen Viewport zum Scrollen hat.', ja: 'トランスクリプトは `min-height: 0` を持つ flex カラムに置き、`maxHeight` は指定しないでください。`MessageList` は自身のルートで既に設定しています。ここでの高さ上限は、ドキュメントのペインにスクロールできるビューポートを与えるためだけのものです。', pt: 'Coloca a transcrição numa coluna flex com `min-height: 0` e deixa o `maxHeight` de fora. O `MessageList` já o define na sua própria raiz; o limite de altura aqui existe apenas para o painel da documentação ter uma viewport para rolar.', zh: '把会话记录放进带 `min-height: 0` 的 flex 列中，并且不要设 `maxHeight`。`MessageList` 已经在自己的根元素上设好了；这里的高度上限只是为了让文档面板有一个可滚动的视口。', ar: 'ضع السجل في عمود flex مع `min-height: 0` واترك `maxHeight` دون تعيين. فـ`MessageList` يضبط ذلك أصلًا على جذره؛ وحدّ الارتفاع هنا موجود فقط ليمنح لوحة التوثيق منطقة عرض قابلة للتمرير.' },
  mtUse5: { en: 'Pick one layout per product and stay with it. `bubble` and `row` are not two densities of one transcript — they hand authorship to different signals, and mixing them inside one app leaves the reader with no reliable cue for who is talking.', es: 'Elige un layout por producto y quédate con él. `bubble` y `row` no son dos densidades de una misma transcripción: entregan la autoría a señales distintas, y mezclarlos dentro de una app deja a quien lee sin una pista fiable de quién habla.', fr: 'Choisissez un layout par produit et tenez-vous-y. `bubble` et `row` ne sont pas deux densités d’une même transcription : ils confient l’auteur à des signaux différents, et les mélanger dans une app prive le lecteur de tout indice fiable sur qui parle.', de: 'Wählen Sie ein Layout pro Produkt und bleiben Sie dabei. `bubble` und `row` sind nicht zwei Dichten eines Verlaufs — sie übergeben die Urheberschaft an verschiedene Signale, und sie in einer App zu mischen lässt den Leser ohne verlässlichen Hinweis darauf, wer spricht.', ja: 'プロダクトごとにレイアウトを1つ選び、貫いてください。`bubble` と `row` は同じトランスクリプトの2段階の密度ではなく、送信者の手がかりを別々の信号に委ねています。1つのアプリで混在させると、誰が話しているかの確かな手がかりが読者から失われます。', pt: 'Escolhe um layout por produto e mantém-te nele. `bubble` e `row` não são duas densidades da mesma transcrição — entregam a autoria a sinais diferentes, e misturá-los dentro de uma app deixa quem lê sem pista fiável de quem está a falar.', zh: '每个产品只选一种布局并坚持下去。`bubble` 和 `row` 不是同一份会话记录的两种密度——它们把作者身份交给了不同的信号，在同一个应用里混用会让读者失去判断谁在说话的可靠线索。', ar: 'اختر تخطيطًا واحدًا لكل منتج والتزم به. ليس `bubble` و`row` كثافتين لسجل واحد — بل يسلّمان هوية المؤلف إلى إشارتين مختلفتين، وخلطهما داخل تطبيق واحد يترك القارئ بلا دليل موثوق على من يتحدّث.' },
});

// --- the demo conversation ---------------------------------------------------

const VIEWER = 'you';
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/**
 * A stable clock for the demo, read once at module load. Deterministic within a
 * session, and anchored to real wall-clock days so the day separators genuinely
 * say "Yesterday" and "Today" rather than a hardcoded date that ages.
 */
const NOW = Date.now();

/** A fixed time of day, `days` back from now. */
function at(days: number, hour: number, minute: number): number {
  const d = new Date(NOW - days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

interface DemoMessage extends ChatMessage {
  /** Which catalog entry supplies the body; resolved at render so it translates. */
  body: keyof typeof mt;
}

/**
 * A believable short thread: two people, a day boundary, and one run of three
 * consecutive messages from one author. Nothing here is grouped or separated —
 * that is `groupMessages` and `insertSeparators`, called below.
 */
const CONVERSATION: DemoMessage[] = [
  { id: 'm1', authorId: 'ana', at: at(1, 17, 12), body: 'mtMsg1' },
  { id: 'm2', authorId: VIEWER, at: at(1, 17, 15), body: 'mtMsg2', status: 'read' },
  { id: 'm3', authorId: 'ana', at: at(0, 9, 36), body: 'mtMsg3' },
  { id: 'm4', authorId: 'ana', at: at(0, 9, 37), body: 'mtMsg4' },
  { id: 'm5', authorId: 'ana', at: at(0, 9, 38), body: 'mtMsg5' },
  { id: 'm6', authorId: VIEWER, at: at(0, 9, 41), body: 'mtMsg6', status: 'read', editedAt: at(0, 9, 42) },
  { id: 'm7', authorId: VIEWER, at: at(0, 9, 42), body: 'mtMsg7', status: 'sending' },
];

/** A four-message run from one author, for the corner-geometry example. */
const RUN: DemoMessage[] = [
  { id: 'r1', authorId: 'ana', at: at(0, 9, 36), body: 'mtMsg3' },
  { id: 'r2', authorId: 'ana', at: at(0, 9, 37), body: 'mtMsg4' },
  { id: 'r3', authorId: 'ana', at: at(0, 9, 38), body: 'mtMsg5' },
  { id: 'r4', authorId: 'ana', at: at(0, 9, 39), body: 'mtMsg1' },
];

/** The real pipeline, run once per anchor the page wants to demonstrate. */
function sequence(anchorId: string): ChatSequenceItem<DemoMessage>[] {
  return insertSeparators(groupMessages(CONVERSATION), {
    unreadAnchorId: anchorId,
    viewerId: VIEWER,
  });
}

const SEQUENCE = sequence('m3');
const SEQUENCE_MID_RUN = sequence('m4');

// --- demo components ---------------------------------------------------------
// Each is a real component rather than inline JSX inside the render callback,
// because a callback cannot hold hooks and every one of these needs `useT`.

/** Renders one run through the kit under test. */
function Run({
  K,
  group,
  layout,
}: {
  K: PlatformKit;
  group: ChatGroup<DemoMessage>;
  layout: MessageLayout;
}) {
  const t = useT();
  const own = group.authorId === VIEWER;
  const name = own ? t(mt.mtYou) : t(mt.mtAna);
  return (
    <K.MessageGroup
      group={group}
      layout={layout}
      viewerId={VIEWER}
      now={NOW}
      avatar={<K.Avatar name={name} size={layout === 'row' ? 'md' : 'sm'} />}
      // A bubble transcript already says who is talking with the edge and the
      // fill, so only the other person's runs are named; a row transcript names
      // every run, because alignment says nothing there.
      authorName={layout === 'row' || !own ? name : undefined}
      authorLabel={name}
      renderBody={({ message }) => t(mt[message.body])}
    />
  );
}

/** A whole transcript: the pipeline output, rendered by MessageList. */
function Transcript({
  K,
  layout = 'bubble',
  items = SEQUENCE,
  height = '20rem',
}: {
  K: PlatformKit;
  layout?: MessageLayout;
  items?: ChatSequenceItem<DemoMessage>[];
  height?: string;
}) {
  return (
    // MessageList is `flex: 1; min-height: 0` on purpose — it fills a column
    // rather than sizing itself — so the docs pane has to give it one.
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, height }}>
      <K.MessageList
        items={items}
        now={NOW}
        renderGroup={(group) => <Run K={K} group={group} layout={layout} />}
      />
    </div>
  );
}

/** The prop each column is demonstrating, as code rather than prose. */
const LAYOUT_CODE: Record<MessageLayout, string> = {
  bubble: 'layout="bubble"',
  row: 'layout="row"',
};

/** The two layouts, side by side, from the same sequence. */
function LayoutComparison({ K }: { K: PlatformKit }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 'var(--glacier-space-6)',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        width: '100%',
        minWidth: 0,
      }}
    >
      {(['bubble', 'row'] as const).map((layout) => (
        <Stack key={layout} gap={2} width="full">
          <Text as="span" size={Size.Small} tone={TextTone.Muted}>
            <code>{LAYOUT_CODE[layout]}</code>
          </Text>
          <Transcript K={K} layout={layout} height="22rem" />
        </Stack>
      ))}
    </div>
  );
}

/** One four-message run, on each side of the transcript. */
function RunGeometry({ K }: { K: PlatformKit }) {
  const t = useT();
  const [group] = groupMessages(RUN);
  if (!group) return null;
  return (
    <Stack gap={6} width="full">
      <K.MessageGroup
        group={group}
        layout="bubble"
        own={false}
        now={NOW}
        avatar={<K.Avatar name={t(mt.mtAna)} size="sm" />}
        authorName={t(mt.mtAna)}
        renderBody={({ message, position }) => `${t(mt[message.body])} — ${position}`}
      />
      <K.MessageGroup
        group={group}
        layout="bubble"
        own
        now={NOW}
        authorLabel={t(mt.mtYou)}
        renderBody={({ message, position }) => `${t(mt[message.body])} — ${position}`}
      />
    </Stack>
  );
}

const STATUSES: DeliveryStatus[] = ['sending', 'sent', 'delivered', 'read', 'failed'];

/** Every delivery state, plus the run-level collapse. */
function DeliveryStates({ K }: { K: PlatformKit }) {
  const t = useT();
  return (
    <Stack gap={4} width="full">
      {STATUSES.map((status) => (
        <K.MessageBubble key={status} own position="only" tail at={at(0, 9, 41)} now={NOW} status={status}>
          {status}
        </K.MessageBubble>
      ))}
      <K.MessageBubble own position="only" tail at={at(0, 9, 42)} now={NOW} status="read" edited>
        {t(mt.mtMsg6)}
      </K.MessageBubble>
      {/* The run-level line: five members, one of which failed, reported as the
          least advanced rather than as the last one's state. */}
      <K.MessageMeta at={at(0, 9, 42)} now={NOW} statuses={STATUSES} />
    </Stack>
  );
}

/** The three separators on their own, out of a transcript. */
function Separators({ K }: { K: PlatformKit }) {
  return (
    <Stack gap={5} width="full">
      <K.DateSeparator at={at(0, 9, 0)} now={NOW} variant="rule" />
      <K.DateSeparator at={at(1, 9, 0)} now={NOW} variant="chip" />
      <K.DateSeparator at={at(96, 9, 0)} now={NOW} variant="rule" />
      <K.UnreadDivider count={5} align="center" />
      <K.UnreadDivider count={5} align="start" />
      <K.UnreadDivider align="end" />
      <div style={{ position: 'relative', height: '3rem' }}>
        <K.ScrollToLatest visible count={12} />
      </div>
    </Stack>
  );
}

// --- the page ----------------------------------------------------------------

function PropsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Heading level={3}>{title}</Heading>
      {children}
    </>
  );
}

export function MessageTranscriptPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(mt.mtName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(mt.mtLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(mt.mtAnatomy))}</Text>
      <ComponentBlueprint specId="message-bubble" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(mt.mtExListTitle)}
        description={prose(t(mt.mtExListDesc))}
        component="MessageList"
        platformLayout="stacked"
        render={(K) => <Transcript K={K} />}
        code={`import { groupMessages, insertSeparators } from '@glacier/logic';
import { MessageList, MessageGroup, Avatar } from '@glacier/react';

// One flat, chronological log in, one rendered sequence out.
const items = useMemo(
  () =>
    insertSeparators(groupMessages(messages), {
      // Pinned once when the conversation opened, so the divider holds still.
      unreadAnchorId,
      viewerId,
    }),
  [messages, unreadAnchorId, viewerId],
);

<MessageList
  items={items}
  now={now}
  renderGroup={(group) => (
    <MessageGroup
      group={group}
      viewerId={viewerId}
      now={now}
      avatar={<Avatar name={nameOf(group.authorId)} size="sm" />}
      authorName={group.authorId === viewerId ? undefined : nameOf(group.authorId)}
    />
  )}
/>`}
      />

      <Example
        title={t(mt.mtExLayoutTitle)}
        description={prose(t(mt.mtExLayoutDesc))}
        component="MessageList"
        platformLayout="stacked"
        render={(K) => <LayoutComparison K={K} />}
        code={`{/* iMessage: the edge and the fill carry authorship. */}
<MessageList items={items} renderGroup={(g) => <MessageGroup group={g} layout="bubble" … />} />

{/* Slack: one column, an avatar gutter, and a name-and-time header. */}
<MessageList items={items} renderGroup={(g) => <MessageGroup group={g} layout="row" … />} />`}
      />

      <Example
        title={t(mt.mtExRunTitle)}
        description={prose(t(mt.mtExRunDesc))}
        component="MessageGroup"
        platformLayout="stacked"
        render={(K) => <RunGeometry K={K} />}
        code={`// MessageGroup asks commons for each bubble's slot and geometry:
//
//   bubblePosition(0, 4) -> 'first'   corners: outer top round, outer bottom tight
//   bubblePosition(1, 4) -> 'middle'  corners: both outer corners tight
//   bubblePosition(2, 4) -> 'middle'
//   bubblePosition(3, 4) -> 'last'    corners: outer top tight, outer bottom square
//                                     (squared because it carries the tail)
//
// The inner edge — the one facing the empty half of the column — stays fully
// round the whole way down. That asymmetry is the silhouette.

<MessageGroup group={group} layout="bubble" own={false} />
<MessageGroup group={group} layout="bubble" own />`}
      />

      <Example
        title={t(mt.mtExMetaTitle)}
        description={prose(t(mt.mtExMetaDesc))}
        component="MessageBubble"
        platformLayout="stacked"
        render={(K) => <DeliveryStates K={K} />}
        code={`<MessageBubble own tail at={sentAt} now={now} status="sending" >…</MessageBubble>
<MessageBubble own tail at={sentAt} now={now} status="read" edited>…</MessageBubble>

{/* A run's line: leastDelivery collapses the members to the least advanced,
    so one failed send is what the stack reports. */}
<MessageMeta at={endedAt} now={now} statuses={['sending', 'sent', 'delivered', 'read', 'failed']} />
// -> "failed"`}
      />

      <Example
        title={t(mt.mtExSepTitle)}
        description={prose(t(mt.mtExSepDesc))}
        component="DateSeparator"
        platformLayout="stacked"
        render={(K) => <Separators K={K} />}
        code={`<DateSeparator at={today}     now={now} variant="rule" />
<DateSeparator at={yesterday} now={now} variant="chip" />
<DateSeparator at={lastYear}  now={now} variant="rule" />

<UnreadDivider count={5} align="center" />
<UnreadDivider count={5} align="start" />
<UnreadDivider align="end" />

{/* MessageList renders this for you and decides 'visible' from
    shouldShowScrollToLatest; forced on here so it can be looked at. */}
<ScrollToLatest visible count={12} onClick={scrollToBottom} />`}
      />

      <Example
        title={t(mt.mtExContinuedTitle)}
        description={prose(t(mt.mtExContinuedDesc))}
        component="MessageList"
        platformLayout="stacked"
        render={(K) => <Transcript K={K} items={SEQUENCE_MID_RUN} />}
        code={`// The anchor is Ana's SECOND message, so it lands mid-run.
const items = insertSeparators(groupMessages(messages), {
  unreadAnchorId: 'm4',
  viewerId,
});

// insertSeparators splits the run and flags the trailing half:
//   { kind: 'group',  group: { messages: [m3],     continued: false } }
//   { kind: 'unread', count: 4 }
//   { kind: 'group',  group: { messages: [m4, m5], continued: true  } }
//
// MessageGroup drops the repeated avatar and name on the continued half while
// keeping the gutter reserved, so the two halves stay on the same line.`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <PropsSection title={t(mt.mtPropsBubble)}>
        <PropsTable
          props={[
            { name: 'layout', type: "'bubble' | 'row'", default: "'bubble'", description: t(mt.mtBubbleLayout) },
            { name: 'own', type: 'boolean', default: 'false', description: t(mt.mtBubbleOwn) },
            { name: 'position', type: "'only' | 'first' | 'middle' | 'last'", default: "'only'", description: t(mt.mtBubblePosition) },
            { name: 'tail', type: 'boolean', default: 'false', description: t(mt.mtBubbleTail) },
            { name: 'side', type: "'start' | 'end'", description: t(mt.mtBubbleSide) },
            { name: 'avatar', type: 'ReactNode', description: t(mt.mtBubbleAvatar) },
            { name: 'gutter', type: 'boolean', description: t(mt.mtBubbleGutter) },
            { name: 'header', type: 'ReactNode', description: t(mt.mtBubbleHeader) },
            { name: 'at', type: 'Millis', description: t(mt.mtBubbleAt) },
            { name: 'now', type: 'Millis', description: t(mt.mtPropNow) },
            { name: 'locale', type: 'string', description: t(mt.mtPropLocale) },
            { name: 'status', type: 'DeliveryStatus', description: t(mt.mtBubbleStatus) },
            { name: 'edited', type: 'boolean', default: 'false', description: t(mt.mtBubbleEdited) },
            { name: 'meta', type: 'ReactNode', description: t(mt.mtBubbleMeta) },
            { name: 'replyTo / attachments / reactions', type: 'ReactNode', description: t(mt.mtBubbleSlots) },
            { name: 'labels', type: 'Partial<MessageLabels>', description: t(mt.mtPropLabels) },
            { name: 'skeleton', type: 'boolean', default: 'false', description: t(mt.mtPropSkeleton) },
          ]}
        />
      </PropsSection>

      <PropsSection title={t(mt.mtPropsGroup)}>
        <PropsTable
          props={[
            { name: 'group', type: 'MessageGroup<M>', description: t(mt.mtGroupGroup) },
            { name: 'layout', type: "'bubble' | 'row'", default: "'bubble'", description: t(mt.mtBubbleLayout) },
            { name: 'own', type: 'boolean', description: t(mt.mtGroupOwn) },
            { name: 'viewerId', type: 'string', description: t(mt.mtGroupOwn) },
            { name: 'avatar / authorName', type: 'ReactNode', description: t(mt.mtGroupHead) },
            { name: 'authorLabel', type: 'string', description: t(mt.mtGroupAuthorLabel) },
            { name: 'tails', type: 'boolean', default: 'true', description: t(mt.mtGroupTails) },
            { name: 'now', type: 'Millis', description: t(mt.mtPropNow) },
            { name: 'locale', type: 'string', description: t(mt.mtPropLocale) },
            { name: 'renderBody', type: '(ctx: MessageSlotContext<M>) => ReactNode', description: t(mt.mtGroupRenderBody) },
            { name: 'renderReactions / renderAttachments / renderReplyTo', type: '(ctx: MessageSlotContext<M>) => ReactNode', description: t(mt.mtGroupRenderBody) },
            { name: 'labels', type: 'Partial<MessageLabels>', description: t(mt.mtPropLabels) },
            { name: 'skeleton', type: 'boolean', default: 'false', description: t(mt.mtPropSkeleton) },
          ]}
        />
      </PropsSection>

      <PropsSection title={t(mt.mtPropsMeta)}>
        <PropsTable
          props={[
            { name: 'at', type: 'Millis', description: t(mt.mtBubbleAt) },
            { name: 'now', type: 'Millis', default: 'Date.now()', description: t(mt.mtPropNow) },
            { name: 'locale', type: 'string', description: t(mt.mtPropLocale) },
            { name: 'timestampStyle', type: "'auto' | 'time' | 'date'", default: "'time'", description: t(mt.mtMetaTimestampStyle) },
            { name: 'status', type: 'DeliveryStatus', description: t(mt.mtBubbleStatus) },
            { name: 'statuses', type: '(DeliveryStatus | undefined)[]', description: t(mt.mtMetaStatuses) },
            { name: 'edited', type: 'boolean', default: 'false', description: t(mt.mtBubbleEdited) },
            { name: 'own', type: 'boolean', default: 'false', description: t(mt.mtMetaOwn) },
            { name: 'announceTime', type: 'boolean', default: 'true', description: t(mt.mtMetaAnnounceTime) },
            { name: 'formatTimestamp', type: '(stamp: MessageTimestamp, locale?: string) => string', description: t(mt.mtMetaFormat) },
            { name: 'labels', type: 'Partial<MessageLabels>', description: t(mt.mtPropLabels) },
            { name: 'skeleton', type: 'boolean', default: 'false', description: t(mt.mtPropSkeleton) },
          ]}
        />
      </PropsSection>

      <PropsSection title={t(mt.mtPropsList)}>
        <PropsTable
          props={[
            { name: 'items', type: 'ChatSequenceItem<M>[]', description: t(mt.mtListItems) },
            { name: 'renderGroup', type: '(group, ctx: TranscriptRowContext) => ReactNode', description: t(mt.mtListRenderGroup) },
            { name: 'renderDay / renderUnread / renderItem', type: '(item, ctx: TranscriptRowContext) => ReactNode', description: t(mt.mtListRenderRows) },
            { name: 'header / footer', type: 'ReactNode', description: t(mt.mtListHeaderFooter) },
            { name: 'now', type: 'number', description: t(mt.mtPropNow) },
            { name: 'locale', type: 'string', description: t(mt.mtPropLocale) },
            { name: 'labels', type: 'Partial<TranscriptLabels>', description: t(mt.mtPropLabels) },
            { name: 'stickyDays', type: 'boolean', default: 'true', description: t(mt.mtListStickyDays) },
            { name: 'onScrollStateChange', type: '(state: TranscriptScrollState) => void', description: t(mt.mtListOnScrollState) },
            { name: 'onReachTop', type: '() => void', description: t(mt.mtListOnReachTop) },
            { name: 'reachTopOffset', type: 'number', default: '240', description: t(mt.mtListOnReachTop) },
            { name: 'loadingOlder', type: 'boolean', default: 'false', description: t(mt.mtListOnReachTop) },
            { name: 'unreadCount', type: 'number', description: t(mt.mtListUnreadCount) },
            { name: 'scrollToLatest', type: 'boolean', default: 'true', description: t(mt.mtLatestVisible) },
            { name: 'announce', type: "'count' | 'messages' | 'off'", default: "'count'", description: t(mt.mtListAnnounce) },
            { name: 'initialItemKey', type: 'string', description: t(mt.mtListInitialItemKey) },
            { name: 'estimateRowHeight', type: '(item, index) => number', description: t(mt.mtListEstimate) },
            { name: 'maxHeight', type: 'number | string', description: t(mt.mtListMaxHeight) },
            { name: 'ref', type: 'Ref<MessageListHandle>', description: t(mt.mtListRef) },
          ]}
        />
      </PropsSection>

      <PropsSection title={t(mt.mtPropsSeparators)}>
        <PropsTable
          props={[
            { name: 'DateSeparator label', type: 'ReactNode', description: t(mt.mtDayLabel) },
            { name: 'DateSeparator at', type: 'number', description: t(mt.mtBubbleAt) },
            { name: 'DateSeparator variant', type: "'rule' | 'chip'", default: "'rule'", description: t(mt.mtDayVariant) },
            { name: 'DateSeparator sticky', type: 'boolean', default: 'false', description: t(mt.mtDaySticky) },
            { name: 'UnreadDivider label', type: 'ReactNode', description: t(mt.mtUnreadLabel) },
            { name: 'UnreadDivider count', type: 'number', default: '0', description: t(mt.mtUnreadCount) },
            { name: 'UnreadDivider align', type: "'start' | 'center' | 'end'", default: "'center'", description: t(mt.mtUnreadAlign) },
            { name: 'ScrollToLatest visible', type: 'boolean', default: 'false', description: t(mt.mtLatestVisible) },
            { name: 'ScrollToLatest count / max', type: 'number', default: '0 / 99', description: t(mt.mtLatestCount) },
            { name: 'labels', type: 'Partial<TranscriptLabels>', description: t(mt.mtPropLabels) },
          ]}
        />
      </PropsSection>

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(mt.mtA11y1))}</li>
        <li>{prose(t(mt.mtA11y2))}</li>
        <li>{prose(t(mt.mtA11y3))}</li>
        <li>{prose(t(mt.mtA11y4))}</li>
        <li>{prose(t(mt.mtA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(mt.mtUse1))}</li>
        <li>{prose(t(mt.mtUse2))}</li>
        <li>{prose(t(mt.mtUse3))}</li>
        <li>{prose(t(mt.mtUse4))}</li>
        <li>{prose(t(mt.mtUse5))}</li>
      </ul>
    </>
  );
}
