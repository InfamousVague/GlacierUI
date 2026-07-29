import {
  Heading,
  Row,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import { BUBBLE_MAX_WIDTH, type BubblePosition } from '@glacier/logic';
import type { ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * TODO(i18n): these belong in apps/docs/src/i18n.ts alongside the other page
 * catalogs; they are authored here so the page compiles standalone, and every
 * key is listed in the handoff ready to be pasted in verbatim.
 */
const mb = defineMessages({
  mbName: { en: 'Message Bubble', es: 'Burbuja de mensaje', fr: 'Bulle de message', de: 'Nachrichtenblase', ja: 'メッセージバブル', pt: 'Balão de mensagem', zh: '消息气泡', ar: 'فقاعة الرسالة' },
  mbLede: {
    en: 'One message, in either of the two layouts chat apps actually use: an edge-aligned tinted capsule whose corners encode its place in a run, or a full-width row with an avatar gutter and a name and time header.',
    es: 'Un mensaje, en cualquiera de las dos disposiciones que las apps de chat usan de verdad: una cápsula teñida alineada a un borde cuyas esquinas codifican su lugar en la serie, o una fila a todo el ancho con canaleta de avatar y una cabecera de nombre y hora.',
    fr: 'Un message, dans l’une des deux dispositions que les applis de chat emploient réellement : une capsule teintée alignée sur un bord dont les coins encodent sa place dans la salve, ou une ligne pleine largeur avec gouttière d’avatar et en-tête nom et heure.',
    de: 'Eine Nachricht, in einem der beiden Layouts, die Chat-Apps tatsächlich verwenden: eine kantenbündige, getönte Kapsel, deren Ecken ihren Platz in der Folge kodieren, oder eine Zeile über die volle Breite mit Avatar-Spalte und Namens- und Zeit-Kopfzeile.',
    ja: '1件のメッセージを、チャットアプリが実際に使う2つのレイアウトのいずれかで。端に寄せた色付きのカプセル（角が連続内の位置を表す）か、アバター用の余白と名前・時刻のヘッダーを持つ全幅の行かです。',
    pt: 'Uma mensagem, em qualquer uma das duas disposições que as apps de chat usam mesmo: uma cápsula tingida alinhada a um bordo cujos cantos codificam o seu lugar na sequência, ou uma linha de largura total com goteira de avatar e um cabeçalho de nome e hora.',
    zh: '一条消息，采用聊天应用真正在用的两种布局之一：贴边的着色胶囊（其圆角编码它在一串消息中的位置），或带头像栏与姓名时间标题的全宽行。',
    ar: 'رسالة واحدة، بأحد التخطيطين اللذين تستخدمهما تطبيقات المحادثة فعلًا: كبسولة ملوّنة محاذية لحافة تُرمِّز زواياها موضعها في السلسلة، أو صف بعرض كامل بعمود للصورة الرمزية وترويسة بالاسم والوقت.',
  },
  mbAnatomy: {
    en: 'A leading gutter, then a column holding the header, the bubble, and the meta line. The four corner radii come from `bubbleCorners` in `@glacier/logic` rather than from this component, and the tail is an SVG path from the same module — React Native has no `::after`, and a tail invented twice is a tail that drifts.',
    es: 'Una canaleta inicial y luego una columna con la cabecera, la burbuja y la línea meta. Los cuatro radios de esquina vienen de `bubbleCorners` en `@glacier/logic` y no de este componente, y la cola es una ruta SVG del mismo módulo: React Native no tiene `::after`, y una cola inventada dos veces es una cola que se desvía.',
    fr: 'Une gouttière de tête, puis une colonne qui porte l’en-tête, la bulle et la ligne méta. Les quatre rayons de coin viennent de `bubbleCorners` dans `@glacier/logic` et non de ce composant, et la queue est un tracé SVG du même module — React Native n’a pas de `::after`, et une queue inventée deux fois est une queue qui dérive.',
    de: 'Eine führende Spalte, dann eine Säule mit Kopfzeile, Blase und Meta-Zeile. Die vier Eckradien stammen aus `bubbleCorners` in `@glacier/logic`, nicht aus dieser Komponente, und der Zipfel ist ein SVG-Pfad aus demselben Modul — React Native hat kein `::after`, und ein zweimal erfundener Zipfel ist ein Zipfel, der auseinanderdriftet.',
    ja: '先頭の余白列、続いてヘッダー・吹き出し・メタ行を収める列。4つの角丸はこのコンポーネントではなく `@glacier/logic` の `bubbleCorners` から来ており、しっぽも同じモジュールの SVG パスです。React Native に `::after` はなく、2度考案されたしっぽはずれていくしっぽだからです。',
    pt: 'Uma goteira inicial e depois uma coluna com o cabeçalho, o balão e a linha meta. Os quatro raios de canto vêm de `bubbleCorners` em `@glacier/logic` e não deste componente, e a cauda é um traçado SVG do mesmo módulo — o React Native não tem `::after`, e uma cauda inventada duas vezes é uma cauda que diverge.',
    zh: '先是一个前导栏，然后是承载标题、气泡与元信息行的一列。四个圆角半径来自 `@glacier/logic` 的 `bubbleCorners` 而非本组件，尾巴则是同一模块里的 SVG 路径——React Native 没有 `::after`，被发明两次的尾巴就是会走样的尾巴。',
    ar: 'عمود بادئ، ثم عمود يحمل الترويسة والفقاعة وسطر البيانات. تأتي أنصاف أقطار الزوايا الأربع من `bubbleCorners` في `@glacier/logic` لا من هذا المكوّن، والذيل مسار SVG من الوحدة نفسها — إذ لا يوجد `::after` في React Native، والذيل المُخترَع مرتين ذيل ينحرف.',
  },
  mbExLayoutsTitle: { en: 'Bubble and row are two products, not two skins', es: 'Burbuja y fila son dos productos, no dos pieles', fr: 'Bulle et ligne sont deux produits, pas deux habillages', de: 'Blase und Zeile sind zwei Produkte, nicht zwei Skins', ja: 'バブルと行は、皮を替えた同じものではなく別の製品', pt: 'Balão e linha são dois produtos, não duas peles', zh: '气泡与行是两种产品，不是两层皮肤', ar: 'الفقاعة والصف منتجان، لا قشرتان' },
  mbExLayoutsDesc: {
    en: '`bubble` is iMessage: a tinted capsule on the edge its author owns, sized to its content. `row` is Slack: full width, no fill, avatar in a leading gutter, name and time as a header. Alignment means nothing in a single-column transcript, so the header does the work colour and position do in a bubble.',
    es: '`bubble` es iMessage: una cápsula teñida en el borde que su autor posee, dimensionada según su contenido. `row` es Slack: todo el ancho, sin relleno, avatar en una canaleta inicial, nombre y hora como cabecera. La alineación no significa nada en una transcripción de una sola columna, así que la cabecera hace el trabajo que el color y la posición hacen en una burbuja.',
    fr: '`bubble`, c’est iMessage : une capsule teintée sur le bord que son auteur possède, dimensionnée d’après son contenu. `row`, c’est Slack : pleine largeur, aucun fond, avatar en gouttière de tête, nom et heure en en-tête. L’alignement ne signifie rien dans une transcription à une colonne : l’en-tête fait donc le travail que la couleur et la position font dans une bulle.',
    de: '`bubble` ist iMessage: eine getönte Kapsel an der Kante, die ihrem Autor gehört, bemessen an ihrem Inhalt. `row` ist Slack: volle Breite, keine Füllung, Avatar in einer führenden Spalte, Name und Zeit als Kopfzeile. Ausrichtung bedeutet in einem einspaltigen Verlauf nichts, also leistet die Kopfzeile, was in einer Blase Farbe und Position leisten.',
    ja: '`bubble` は iMessage です。作者が持つ側の端に寄った色付きカプセルで、内容に合わせた大きさになります。`row` は Slack です。全幅、塗りなし、先頭の余白にアバター、名前と時刻はヘッダー。単一カラムの履歴では配置に意味がないので、吹き出しでは色と位置が担う仕事をヘッダーが担います。',
    pt: '`bubble` é o iMessage: uma cápsula tingida no bordo que o seu autor possui, dimensionada pelo conteúdo. `row` é o Slack: largura total, sem preenchimento, avatar numa goteira inicial, nome e hora como cabeçalho. O alinhamento nada significa numa transcrição de uma só coluna, por isso o cabeçalho faz o trabalho que a cor e a posição fazem num balão.',
    zh: '`bubble` 是 iMessage：贴在作者所属那一侧的着色胶囊，按内容定宽。`row` 是 Slack：全宽、无填充、头像在前导栏、姓名与时间作为标题。在单列会话记录里对齐毫无含义，因此标题承担了气泡中由颜色与位置承担的工作。',
    ar: '‏`bubble` هو iMessage: كبسولة ملوّنة على الحافة التي يملكها كاتبها، بحجم محتواها. و`row` هو Slack: عرض كامل، بلا تعبئة، صورة رمزية في عمود بادئ، والاسم والوقت في ترويسة. المحاذاة لا تعني شيئًا في سجلّ من عمود واحد، لذا تؤدي الترويسة ما يؤديه اللون والموضع في الفقاعة.',
  },
  mbExRunTitle: { en: 'A run of four reads as one shape', es: 'Una serie de cuatro se lee como una sola forma', fr: 'Une salve de quatre se lit comme une seule forme', de: 'Eine Folge von vier liest sich als eine Form', ja: '4件の連続はひとつの形として読める', pt: 'Uma sequência de quatro lê-se como uma só forma', zh: '连续四条读作一个整体形状', ar: 'سلسلة من أربع تُقرأ شكلًا واحدًا' },
  mbExRunDesc: {
    en: 'The corners facing a neighbour tighten to `radius-xs`; the corners facing open space stay at `radius-xl`. That asymmetry is what makes the stacked edge behave like a single tall shape that has been sliced, while the free edge keeps the silhouette that says which side of the conversation it came from. Four fully rounded lozenges would say "four separate thoughts", which is a lie about the conversation.',
    es: 'Las esquinas que miran a una vecina se cierran a `radius-xs`; las que miran al espacio libre se quedan en `radius-xl`. Esa asimetría hace que el borde apilado se comporte como una única forma alta que ha sido rebanada, mientras el borde libre conserva la silueta que dice de qué lado de la conversación viene. Cuatro rombos totalmente redondeados dirían «cuatro pensamientos separados», lo cual es mentira sobre la conversación.',
    fr: 'Les coins tournés vers une voisine se resserrent à `radius-xs` ; ceux tournés vers le vide restent à `radius-xl`. Cette asymétrie fait que le bord empilé se comporte comme une seule forme haute qu’on aurait tranchée, tandis que le bord libre garde la silhouette qui dit de quel côté de la conversation elle vient. Quatre losanges entièrement arrondis diraient « quatre pensées distinctes », ce qui est un mensonge sur la conversation.',
    de: 'Die Ecken zur Nachbarin ziehen sich auf `radius-xs` zusammen; die Ecken zum freien Raum bleiben auf `radius-xl`. Diese Asymmetrie lässt die gestapelte Kante wie eine einzige hohe, aufgeschnittene Form wirken, während die freie Kante die Silhouette behält, die sagt, von welcher Seite der Unterhaltung sie kommt. Vier voll gerundete Rauten sagten „vier getrennte Gedanken“, und das wäre eine Lüge über die Unterhaltung.',
    ja: '隣に面した角は `radius-xs` に締まり、空いた側に面した角は `radius-xl` のままです。この非対称さによって、積み重なった側の縁は切り分けられた1つの縦長の形のようにふるまい、自由な側の縁は会話のどちら側から来たかを示すシルエットを保ちます。完全に丸い4つの菱形は「4つの別々の考え」と言ってしまい、それは会話についての嘘です。',
    pt: 'Os cantos virados para uma vizinha apertam para `radius-xs`; os virados para o espaço aberto ficam em `radius-xl`. Essa assimetria é o que faz o bordo empilhado comportar-se como uma única forma alta que foi fatiada, enquanto o bordo livre mantém a silhueta que diz de que lado da conversa veio. Quatro losangos totalmente arredondados diriam «quatro pensamentos separados», o que é mentira sobre a conversa.',
    zh: '朝向邻居的圆角收紧到 `radius-xs`；朝向空白处的圆角保持 `radius-xl`。正是这种不对称让堆叠的一侧表现得像一个被切开的整块高形状，而自由的一侧保留了说明它来自对话哪一方的轮廓。四个全圆角的菱形会说「四个各自独立的想法」，那是对这场对话的谎言。',
    ar: 'تضيق الزوايا المواجهة لجارتها إلى `radius-xs`، وتبقى المواجهة للفراغ عند `radius-xl`. هذا اللاتماثل هو ما يجعل الحافة المكدَّسة تتصرّف كشكل طويل واحد جرى تشريحه، بينما تحتفظ الحافة الحرّة بالهيئة التي تقول من أي جانب من المحادثة أتت. أربعة معيّنات مستديرة تمامًا ستقول «أربع أفكار منفصلة»، وذلك كذب عن المحادثة.',
  },
  mbExOwnTitle: { en: 'Own and other', es: 'Propio y ajeno', fr: 'Le sien et l’autre', de: 'Eigene und fremde', ja: '自分のものと相手のもの', pt: 'Próprio e alheio', zh: '自己的与对方的', ar: 'رسالتي ورسالته' },
  mbExOwnDesc: {
    en: 'Which edge is "mine" is expressed logically — the viewer’s messages take the trailing edge, not the right one — so an Arabic transcript mirrors as a whole and the viewer’s own words stay on the side their language puts them. Authorship carries colour as well as position, so it reads before a word is.',
    es: 'Qué borde es «el mío» se expresa lógicamente: los mensajes del lector toman el borde final, no el derecho, de modo que una transcripción en árabe se refleja entera y las palabras del propio lector quedan en el lado donde su idioma las pone. La autoría lleva color además de posición, así que se lee antes que cualquier palabra.',
    fr: 'Le bord qui est « le mien » s’exprime logiquement — les messages du lecteur prennent le bord de fin, pas le droit — pour qu’une transcription arabe se reflète en entier et que les mots du lecteur restent du côté où sa langue les place. La paternité porte la couleur autant que la position : elle se lit avant le moindre mot.',
    de: 'Welche Kante „meine“ ist, wird logisch ausgedrückt — die Nachrichten des Lesers nehmen die nachlaufende Kante, nicht die rechte — damit ein arabischer Verlauf als Ganzes spiegelt und die eigenen Worte des Lesers auf der Seite bleiben, auf die seine Sprache sie setzt. Urheberschaft trägt Farbe wie Position und wird gelesen, bevor ein Wort es wird.',
    ja: 'どちらの端が「自分」かは論理的に表されます。読者のメッセージは右端ではなく末尾側の端を取るので、アラビア語の履歴は全体として鏡像になり、読者自身の言葉はその言語が置く側に留まります。作者は位置だけでなく色も担うため、言葉より先に読み取れます。',
    pt: 'Qual bordo é «o meu» exprime-se logicamente — as mensagens do leitor tomam o bordo final, não o direito — para que uma transcrição em árabe espelhe por inteiro e as palavras do próprio leitor fiquem do lado onde a sua língua as põe. A autoria carrega cor além de posição, por isso lê-se antes de qualquer palavra.',
    zh: '哪一侧是「我的」是用逻辑方向表达的——读者的消息取*末端*一侧，而不是右侧——因此阿拉伯语的会话记录会整体镜像，读者自己的话仍停在其语言所安排的一侧。作者身份同时承载颜色与位置，因此在读到文字之前就已被读出。',
    ar: 'أي حافة هي «حافتي» يُعبَّر عنها منطقيًا — تأخذ رسائل القارئ الحافة الخاتمة لا اليمنى — كي ينعكس السجلّ العربي بأكمله وتبقى كلمات القارئ في الجهة التي تضعها فيها لغته. تحمل النسبة لونًا وموضعًا معًا، فتُقرأ قبل أي كلمة.',
  },
  mbExTailTitle: { en: 'The tail', es: 'La cola', fr: 'La queue', de: 'Der Zipfel', ja: 'しっぽ', pt: 'A cauda', zh: '尾巴', ar: 'الذيل' },
  mbExTailDesc: {
    en: 'One tail per run, on the message that ends it, because the tail marks where the utterance is anchored to its author. It squares the outer bottom corner to `radius-none` on its way out — a tail drawn against a rounded corner leaves a visible notch where the two curves meet.',
    es: 'Una cola por serie, en el mensaje que la cierra, porque la cola marca dónde el enunciado se ancla a su autor. De paso escuadra la esquina inferior exterior a `radius-none`: una cola dibujada contra una esquina redondeada deja una muesca visible donde se encuentran las dos curvas.',
    fr: 'Une queue par salve, sur le message qui la termine, car la queue marque là où l’énoncé s’ancre à son auteur. Au passage, elle équerre le coin inférieur extérieur à `radius-none` — une queue dessinée contre un coin arrondi laisse une encoche visible là où les deux courbes se rencontrent.',
    de: 'Ein Zipfel je Folge, an der Nachricht, die sie beendet, denn der Zipfel markiert, wo die Äußerung an ihrem Autor verankert ist. Dabei richtet er die äußere untere Ecke auf `radius-none` — ein Zipfel an einer runden Ecke hinterlässt eine sichtbare Kerbe, wo die beiden Kurven aufeinandertreffen.',
    ja: 'しっぽは連続ごとに1つで、その連続を終えるメッセージに付きます。しっぽは発話が作者につながる場所を示すからです。その際、外側下の角は `radius-none` に角ばります。丸い角に対して描いたしっぽは、2つの曲線が出会うところに目立つ切り欠きを残すためです。',
    pt: 'Uma cauda por sequência, na mensagem que a fecha, porque a cauda marca onde o enunciado se ancora ao seu autor. De caminho esquadria o canto inferior exterior para `radius-none` — uma cauda desenhada contra um canto arredondado deixa um entalhe visível onde as duas curvas se encontram.',
    zh: '每一串消息只有一条尾巴，长在收尾的那条上，因为尾巴标出这段话锚定到作者的位置。它顺带把外侧底角拉直为 `radius-none`——尾巴若贴着圆角绘制，两条曲线交汇处会留下明显的缺口。',
    ar: 'ذيل واحد لكل سلسلة، على الرسالة التي تختمها، لأن الذيل يعلّم موضع ارتباط الكلام بصاحبه. وهو في طريقه يُربّع الزاوية السفلية الخارجية إلى `radius-none` — فالذيل المرسوم بمواجهة زاوية مستديرة يترك فجوة ظاهرة حيث يلتقي المنحنيان.',
  },
  mbExWrapTitle: { en: 'A pasted URL does not set the transcript’s width', es: 'Una URL pegada no fija el ancho de la transcripción', fr: 'Une URL collée ne fixe pas la largeur de la transcription', de: 'Eine eingefügte URL bestimmt nicht die Breite des Verlaufs', ja: '貼り付けたURLが履歴の幅を決めることはない', pt: 'Um URL colado não define a largura da transcrição', zh: '粘贴的网址不会撑出会话记录的宽度', ar: 'رابط ملصوق لا يحدّد عرض السجلّ' },
  mbExWrapDesc: {
    en: 'A URL, a hash, or a line of minified code has no break opportunity, so without `overflow-wrap: anywhere` one message would set the width of every other. The bubble is also capped at {maxWidth} of the column: a bubble that could reach the far edge would stop distinguishing its author. Newlines stay the author’s, because collapsing them turns a stack trace into one paragraph.',
    es: 'Una URL, un hash o una línea de código minificado no ofrecen puntos de corte, así que sin `overflow-wrap: anywhere` un mensaje fijaría el ancho de todos los demás. La burbuja también se limita al {maxWidth} de la columna: una burbuja capaz de llegar al borde opuesto dejaría de distinguir a su autor. Los saltos de línea siguen siendo del autor, porque colapsarlos convierte una traza de pila en un solo párrafo.',
    fr: 'Une URL, un hachage ou une ligne de code minifié n’offrent aucun point de coupure : sans `overflow-wrap: anywhere`, un seul message fixerait la largeur de tous les autres. La bulle est aussi plafonnée à {maxWidth} de la colonne : une bulle capable d’atteindre le bord opposé cesserait de distinguer son auteur. Les retours à la ligne restent ceux de l’auteur, car les réduire transforme une trace de pile en un paragraphe.',
    de: 'Eine URL, ein Hash oder eine Zeile minifizierter Code bietet keine Trennstelle, also würde ohne `overflow-wrap: anywhere` eine Nachricht die Breite aller anderen bestimmen. Die Blase ist zudem auf {maxWidth} der Spalte gedeckelt: eine Blase, die die Gegenkante erreichen könnte, unterschiede ihren Autor nicht mehr. Zeilenumbrüche bleiben die des Autors, denn sie zu falten macht aus einem Stacktrace einen Absatz.',
    ja: 'URLやハッシュ、圧縮されたコード1行には改行機会がないため、`overflow-wrap: anywhere` がなければ1件のメッセージが他すべての幅を決めてしまいます。吹き出しは列の {maxWidth} にも制限されます。反対の端まで届く吹き出しは、もう作者を区別しなくなるからです。改行は作者のものとして保たれます。まとめてしまうと、スタックトレースが1つの段落になってしまいます。',
    pt: 'Um URL, um hash ou uma linha de código minificado não têm pontos de quebra, por isso sem `overflow-wrap: anywhere` uma mensagem definiria a largura de todas as outras. O balão está ainda limitado a {maxWidth} da coluna: um balão capaz de chegar ao bordo oposto deixaria de distinguir o seu autor. As mudanças de linha continuam a ser do autor, porque juntá-las transforma um rasto de pilha num parágrafo.',
    zh: '网址、哈希或一行压缩代码没有任何断行机会，所以若没有 `overflow-wrap: anywhere`，一条消息就会决定其余所有消息的宽度。气泡还被限制在列宽的 {maxWidth}：能够触到对侧边缘的气泡就不再区分作者了。换行仍属于作者，因为把它们合并会把一段堆栈跟踪压成一个段落。',
    ar: 'الرابط أو التجزئة أو سطر من شيفرة مضغوطة لا يتيح موضع قطع، فبدون `overflow-wrap: anywhere` تحدّد رسالة واحدة عرض كل ما عداها. كما تُحدّ الفقاعة عند {maxWidth} من العمود: فقاعة تبلغ الحافة المقابلة تكفّ عن تمييز صاحبها. وتبقى أسطر الكاتب كما كتبها، لأن دمجها يحوّل تتبّع المكدّس إلى فقرة واحدة.',
  },
  mbExSkeletonTitle: { en: 'Skeleton', es: 'Esqueleto', fr: 'Squelette', de: 'Platzhalter', ja: 'スケルトン', pt: 'Esqueleto', zh: '骨架', ar: 'هيكل التحميل' },
  mbExSkeletonDesc: {
    en: 'The placeholder keeps the bubble’s exact geometry — the same corners, the same padding, the same gutter — so a loading transcript does not reflow as it fills.',
    es: 'El marcador de posición conserva la geometría exacta de la burbuja —las mismas esquinas, el mismo relleno, la misma canaleta— para que una transcripción en carga no se reajuste al llenarse.',
    fr: 'L’espace réservé conserve la géométrie exacte de la bulle — mêmes coins, mêmes marges internes, même gouttière — pour qu’une transcription en cours de chargement ne se réagence pas en se remplissant.',
    de: 'Der Platzhalter behält die exakte Geometrie der Blase — dieselben Ecken, dasselbe Innenmaß, dieselbe Spalte — damit ein ladender Verlauf beim Füllen nicht umbricht.',
    ja: 'プレースホルダーは吹き出しの寸法をそのまま保ちます。同じ角丸、同じ内側の余白、同じ余白列。だから読み込み中の履歴は、埋まっていくときにレイアウトが動きません。',
    pt: 'O marcador de posição mantém a geometria exata do balão — os mesmos cantos, o mesmo enchimento, a mesma goteira — para que uma transcrição a carregar não se reorganize à medida que se enche.',
    zh: '占位保留气泡的精确几何——同样的圆角、同样的内边距、同样的栏位——因此加载中的会话记录在填充时不会重排。',
    ar: 'يحتفظ العنصر النائب بأبعاد الفقاعة تمامًا — الزوايا نفسها والحشو نفسه والعمود نفسه — كي لا يعيد السجلّ قيد التحميل ترتيب نفسه وهو يمتلئ.',
  },
  mbSample1: { en: 'Are you still on for tomorrow?', es: '¿Sigue en pie lo de mañana?', fr: 'On est toujours d’accord pour demain ?', de: 'Bleibt es bei morgen?', ja: '明日の件、まだ大丈夫ですか？', pt: 'Continua de pé para amanhã?', zh: '明天还算数吗？', ar: 'هل ما زال موعد الغد قائمًا؟' },
  mbSample2: { en: 'Yes — same place, same time.', es: 'Sí, mismo sitio, misma hora.', fr: 'Oui — même endroit, même heure.', de: 'Ja — gleicher Ort, gleiche Zeit.', ja: 'はい。同じ場所、同じ時間で。', pt: 'Sim — mesmo sítio, mesma hora.', zh: '在的——老地方，老时间。', ar: 'نعم — المكان نفسه والوقت نفسه.' },
  mbRun1: { en: 'One more thing', es: 'Una cosa más', fr: 'Encore une chose', de: 'Noch eine Sache', ja: 'もうひとつだけ', pt: 'Mais uma coisa', zh: '还有一件事', ar: 'أمر أخير' },
  mbRun2: { en: 'I found the notes from last week', es: 'Encontré las notas de la semana pasada', fr: 'J’ai retrouvé les notes de la semaine dernière', de: 'Ich habe die Notizen von letzter Woche gefunden', ja: '先週のメモが見つかりました', pt: 'Encontrei as notas da semana passada', zh: '我找到了上周的笔记', ar: 'وجدت ملاحظات الأسبوع الماضي' },
  mbRun3: { en: 'They were in the wrong folder', es: 'Estaban en la carpeta equivocada', fr: 'Elles étaient dans le mauvais dossier', de: 'Sie lagen im falschen Ordner', ja: '違うフォルダに入っていました', pt: 'Estavam na pasta errada', zh: '它们放错文件夹了', ar: 'كانت في المجلّد الخطأ' },
  mbRun4: { en: 'Sending them over now', es: 'Te las mando ahora', fr: 'Je te les envoie tout de suite', de: 'Ich schicke sie gleich rüber', ja: '今から送りますね', pt: 'Estou a enviá-las agora', zh: '现在就发给你', ar: 'أرسلها إليك الآن' },
  mbAuthor: { en: 'Ada Lovelace', es: 'Ada Lovelace', fr: 'Ada Lovelace', de: 'Ada Lovelace', ja: 'エイダ・ラブレス', pt: 'Ada Lovelace', zh: '阿达·洛芙莱斯', ar: 'أيدا لوفلايس' },
  mbPropLayout: { en: 'Bubble draws an edge-aligned tinted capsule; row draws full-width prose with a gutter and a header line.', es: 'Bubble dibuja una cápsula teñida alineada al borde; row dibuja prosa a todo el ancho con canaleta y línea de cabecera.', fr: 'Bubble dessine une capsule teintée alignée au bord ; row dessine de la prose pleine largeur avec gouttière et ligne d’en-tête.', de: 'Bubble zeichnet eine kantenbündige, getönte Kapsel; row zeichnet Fließtext über die volle Breite mit Spalte und Kopfzeile.', ja: 'bubble は端に寄った色付きカプセル、row は余白列とヘッダー行を伴う全幅の文章を描きます。', pt: 'Bubble desenha uma cápsula tingida alinhada ao bordo; row desenha prosa de largura total com goteira e linha de cabeçalho.', zh: 'bubble 画出贴边的着色胶囊；row 画出带栏位与标题行的全宽文本。', ar: 'يرسم bubble كبسولة ملوّنة محاذية للحافة، ويرسم row نصًا بعرض كامل مع عمود وسطر ترويسة.' },
  mbPropOwn: { en: 'The viewer sent it. In bubble layout this moves it to the trailing edge and repaints it in the accent; in row layout it changes nothing.', es: 'Lo envió el lector. En la disposición bubble lo mueve al borde final y lo repinta con el acento; en row no cambia nada.', fr: 'Le lecteur l’a envoyé. En disposition bubble, cela le déplace sur le bord de fin et le repeint en accent ; en row, cela ne change rien.', de: 'Der Leser hat sie gesendet. Im Bubble-Layout wandert sie an die nachlaufende Kante und wird im Akzent gezeichnet; im Row-Layout ändert es nichts.', ja: '読者が送ったもの。bubble レイアウトでは末尾側の端に移動しアクセント色で塗り直されます。row レイアウトでは何も変わりません。', pt: 'Foi o leitor que a enviou. Na disposição bubble move-a para o bordo final e repinta-a no acento; em row não muda nada.', zh: '由读者发出。在 bubble 布局中它会移到末端一侧并改用强调色重绘；在 row 布局中毫无变化。', ar: 'أرسلها القارئ. في تخطيط bubble تنتقل إلى الحافة الخاتمة وتُطلى بلون التمييز؛ وفي row لا يتغيّر شيء.' },
  mbPropPosition: { en: 'Where the message sits in its author’s run. Drives the corner radii, so a run reads as one sliced shape.', es: 'Dónde se sitúa el mensaje en la serie de su autor. Gobierna los radios de esquina, para que una serie se lea como una forma rebanada.', fr: 'Où le message se situe dans la salve de son auteur. Pilote les rayons de coin, pour qu’une salve se lise comme une seule forme tranchée.', de: 'Wo die Nachricht in der Folge ihres Autors sitzt. Steuert die Eckradien, damit sich eine Folge als eine aufgeschnittene Form liest.', ja: '作者の連続の中でのメッセージの位置。角丸を決め、連続が切り分けられたひとつの形として読めるようにします。', pt: 'Onde a mensagem fica na sequência do seu autor. Comanda os raios de canto, para que uma sequência se leia como uma forma fatiada.', zh: '该消息在其作者的一串消息中的位置。它决定圆角半径，让一串消息读作一个被切开的形状。', ar: 'موضع الرسالة داخل سلسلة صاحبها. يقود أنصاف أقطار الزوايا كي تُقرأ السلسلة شكلًا واحدًا مشرَّحًا.' },
  mbPropTail: { en: 'Draws the tail. Meaningful only on the message that ends a run; MessageGroup decides this for you.', es: 'Dibuja la cola. Solo tiene sentido en el mensaje que cierra una serie; MessageGroup lo decide por ti.', fr: 'Dessine la queue. N’a de sens que sur le message qui termine une salve ; MessageGroup le décide pour vous.', de: 'Zeichnet den Zipfel. Nur an der Nachricht sinnvoll, die eine Folge beendet; MessageGroup entscheidet das für Sie.', ja: 'しっぽを描きます。意味があるのは連続を終えるメッセージだけで、MessageGroup が判断してくれます。', pt: 'Desenha a cauda. Só faz sentido na mensagem que fecha uma sequência; o MessageGroup decide-o por si.', zh: '绘制尾巴。只有在收尾那条消息上才有意义；MessageGroup 会替你决定。', ar: 'يرسم الذيل. لا معنى له إلا على الرسالة التي تختم السلسلة، وMessageGroup يقرّر ذلك نيابةً عنك.' },
  mbPropSide: { en: 'Overrides the edge authorship would choose. Logical, so a right-to-left transcript mirrors as a whole.', es: 'Sustituye el borde que elegiría la autoría. Es lógico, así que una transcripción de derecha a izquierda se refleja entera.', fr: 'Remplace le bord que choisirait la paternité. Logique, pour qu’une transcription de droite à gauche se reflète en entier.', de: 'Überschreibt die Kante, die die Urheberschaft wählen würde. Logisch, damit ein Rechts-nach-links-Verlauf als Ganzes spiegelt.', ja: '作者から決まる端を上書きします。論理的な指定なので、右から左の履歴は全体として鏡像になります。', pt: 'Substitui o bordo que a autoria escolheria. É lógico, por isso uma transcrição da direita para a esquerda espelha por inteiro.', zh: '覆盖由作者身份决定的一侧。它是逻辑方向，因此从右到左的会话记录会整体镜像。', ar: 'يتجاوز الحافة التي تختارها النسبة. منطقي، فينعكس السجلّ من اليمين إلى اليسار بأكمله.' },
  mbPropAt: { en: 'When it was sent, epoch milliseconds. Renders a meta line when given.', es: 'Cuándo se envió, en milisegundos desde la época. Muestra una línea meta cuando se indica.', fr: 'Quand il a été envoyé, en millisecondes depuis l’époque. Rend une ligne méta lorsqu’il est fourni.', de: 'Wann sie gesendet wurde, in Millisekunden seit der Epoche. Rendert eine Meta-Zeile, wenn angegeben.', ja: '送信時刻（エポックミリ秒）。指定するとメタ行を描画します。', pt: 'Quando foi enviada, em milissegundos desde a época. Mostra uma linha meta quando é indicado.', zh: '发送时刻，Unix 毫秒时间戳。给出时会渲染一行元信息。', ar: 'وقت الإرسال بالمللي ثانية منذ بداية الحقبة. يعرض سطر بيانات عند تمريره.' },
  mbPropStatus: { en: 'How far along the send is. Omitted for anything received, which has no outbound state.', es: 'Cuánto ha avanzado el envío. Se omite para lo recibido, que no tiene estado de salida.', fr: 'Où en est l’envoi. Omis pour tout ce qui est reçu, qui n’a pas d’état sortant.', de: 'Wie weit der Versand ist. Bei Empfangenem weggelassen, das keinen ausgehenden Zustand hat.', ja: '送信がどこまで進んだか。受信したものには送信側の状態がないので省きます。', pt: 'Quão avançado está o envio. Omitido para o que é recebido, que não tem estado de saída.', zh: '发送进行到哪一步。收到的消息没有出站状态，因此省略。', ar: 'إلى أين وصل الإرسال. يُغفل لكل ما هو وارد، إذ لا حالة صادرة له.' },
  mbPropEdited: { en: 'Marks a message its author has since changed.', es: 'Marca un mensaje que su autor ha cambiado después.', fr: 'Marque un message que son auteur a modifié depuis.', de: 'Kennzeichnet eine Nachricht, die ihr Autor seither geändert hat.', ja: '作者があとから変更したメッセージであることを示します。', pt: 'Marca uma mensagem que o autor alterou depois.', zh: '标记作者事后修改过的消息。', ar: 'يعلّم رسالة عدّلها صاحبها لاحقًا.' },
  mbPropMeta: { en: 'Replaces the default timestamp and status line entirely.', es: 'Sustituye por completo la línea de hora y estado predeterminada.', fr: 'Remplace entièrement la ligne d’horodatage et d’état par défaut.', de: 'Ersetzt die voreingestellte Zeit- und Statuszeile vollständig.', ja: '既定のタイムスタンプと状態の行をまるごと置き換えます。', pt: 'Substitui por completo a linha predefinida de hora e estado.', zh: '完全替换默认的时间戳与状态行。', ar: 'يستبدل بالكامل سطر الوقت والحالة الافتراضي.' },
  mbPropAvatar: { en: 'Rendered in the leading gutter. The gutter is reserved whether or not one is given.', es: 'Se muestra en la canaleta inicial. La canaleta se reserva se dé uno o no.', fr: 'Rendu dans la gouttière de tête. La gouttière est réservée qu’on en fournisse un ou non.', de: 'Wird in der führenden Spalte gerendert. Die Spalte bleibt reserviert, ob eines übergeben wird oder nicht.', ja: '先頭の余白列に描画します。渡さなくても余白列は確保されます。', pt: 'Mostrado na goteira inicial. A goteira é reservada haja ou não um avatar.', zh: '渲染在前导栏中。无论是否提供，该栏都会预留。', ar: 'يُعرض في العمود البادئ. ويظلّ العمود محجوزًا سواء مُرِّر أم لا.' },
  mbPropSkeleton: { en: 'Renders a placeholder with the bubble’s exact geometry.', es: 'Muestra un marcador de posición con la geometría exacta de la burbuja.', fr: 'Rend un espace réservé à la géométrie exacte de la bulle.', de: 'Rendert einen Platzhalter mit der exakten Geometrie der Blase.', ja: '吹き出しとまったく同じ寸法のプレースホルダーを描画します。', pt: 'Mostra um marcador de posição com a geometria exata do balão.', zh: '渲染一个与气泡几何尺寸完全一致的占位。', ar: 'يعرض عنصرًا نائبًا بأبعاد الفقاعة الدقيقة.' },
  mbA11y1: { en: 'A message is prose, not a control. The body stays selectable and is never given a role that would stop a screen reader reading it as text.', es: 'Un mensaje es prosa, no un control. El cuerpo sigue siendo seleccionable y nunca recibe un rol que impida a un lector de pantalla leerlo como texto.', fr: 'Un message est de la prose, pas un contrôle. Le corps reste sélectionnable et ne reçoit jamais de rôle qui empêcherait un lecteur d’écran de le lire comme du texte.', de: 'Eine Nachricht ist Fließtext, kein Bedienelement. Der Körper bleibt markierbar und erhält nie eine Rolle, die ein Screenreader daran hindern würde, ihn als Text zu lesen.', ja: 'メッセージはコントロールではなく文章です。本文は選択可能なままで、スクリーンリーダーがテキストとして読むのを妨げるロールは与えません。', pt: 'Uma mensagem é prosa, não um controlo. O corpo permanece selecionável e nunca recebe um papel que impeça um leitor de ecrã de o ler como texto.', zh: '消息是文字，不是控件。正文保持可选中，也绝不会被赋予会阻止屏幕阅读器将其作为文本朗读的角色。', ar: 'الرسالة نصّ لا عنصر تحكّم. يبقى المتن قابلًا للتحديد ولا يُمنح أبدًا دورًا يمنع قارئ الشاشة من قراءته نصًا.' },
  mbA11y2: { en: 'Tab skips the bubble itself and lands on whatever is interactive inside it — a link, a reaction chip, an attachment.', es: 'Tab salta la burbuja en sí y aterriza en lo que sea interactivo dentro de ella: un enlace, una ficha de reacción, un adjunto.', fr: 'Tab saute la bulle elle-même et atterrit sur ce qui est interactif à l’intérieur — un lien, une pastille de réaction, une pièce jointe.', de: 'Tab überspringt die Blase selbst und landet auf allem, was darin interaktiv ist — einem Link, einem Reaktions-Chip, einem Anhang.', ja: 'Tab は吹き出し自体を飛ばし、その中の操作可能な要素（リンク、リアクションのチップ、添付）に着地します。', pt: 'O Tab salta o balão em si e aterra no que for interativo lá dentro — uma ligação, uma ficha de reação, um anexo.', zh: 'Tab 会跳过气泡本身，落在其内部可交互的元素上——链接、回应标签、附件。', ar: 'يتخطّى Tab الفقاعة نفسها ويحطّ على ما بداخلها من عناصر تفاعلية — رابط أو شارة تفاعل أو مرفق.' },
  mbA11y3: { en: 'The timestamp is decorative once an enclosing group has announced the same moment, so it is hidden from the accessibility tree rather than read twice. The delivery status is not, and carries a translated word beside its glyph.', es: 'La hora es decorativa una vez que un grupo contenedor ha anunciado el mismo momento, así que se oculta del árbol de accesibilidad en lugar de leerse dos veces. El estado de entrega no lo es, y lleva una palabra traducida junto a su glifo.', fr: 'L’horodatage devient décoratif dès qu’un groupe englobant a annoncé le même instant : il est donc masqué de l’arbre d’accessibilité plutôt que lu deux fois. L’état de remise, lui, ne l’est pas, et porte un mot traduit à côté de son glyphe.', de: 'Die Uhrzeit ist dekorativ, sobald eine umschließende Gruppe denselben Moment angesagt hat, und wird daher vor dem Accessibility-Baum verborgen statt zweimal gelesen. Der Zustellstatus ist es nicht und trägt ein übersetztes Wort neben seinem Zeichen.', ja: '囲むグループが同じ時刻をすでに知らせている場合、タイムスタンプは装飾的なので、2度読まれる代わりにアクセシビリティツリーから隠されます。配信状態はそうではなく、グリフの横に訳語を伴います。', pt: 'A hora é decorativa assim que um grupo envolvente anunciou o mesmo momento, por isso é ocultada da árvore de acessibilidade em vez de ser lida duas vezes. O estado de entrega não é, e leva uma palavra traduzida ao lado do seu glifo.', zh: '一旦外层分组已经播报过同一时刻，时间戳就是装饰性的，因此会从无障碍树中隐藏，而不是被读两遍。送达状态则不是，它在字形旁附带一个已翻译的词。', ar: 'يصير الوقت زخرفيًا متى أعلنت المجموعة الحاوية اللحظة نفسها، فيُخفى من شجرة الوصول بدل أن يُقرأ مرتين. أما حالة التسليم فليست كذلك، وتحمل كلمة مترجَمة بجوار رمزها.' },
  mbA11y4: { en: 'Authorship is spoken by the enclosing group, not repeated on every bubble. A bubble that named its author aloud would say the same name four times in a run of four.', es: 'La autoría la enuncia el grupo contenedor y no se repite en cada burbuja. Una burbuja que nombrara a su autor en voz alta diría el mismo nombre cuatro veces en una serie de cuatro.', fr: 'La paternité est énoncée par le groupe englobant, pas répétée sur chaque bulle. Une bulle qui nommerait son auteur à voix haute dirait le même nom quatre fois dans une salve de quatre.', de: 'Die Urheberschaft spricht die umschließende Gruppe aus, nicht jede Blase erneut. Eine Blase, die ihren Autor nennte, sagte in einer Folge von vier denselben Namen viermal.', ja: '作者を読み上げるのは囲むグループで、吹き出しごとに繰り返しません。作者名を自ら名乗る吹き出しは、4件の連続で同じ名前を4回言うことになります。', pt: 'A autoria é dita pelo grupo envolvente, não repetida em cada balão. Um balão que nomeasse o seu autor em voz alta diria o mesmo nome quatro vezes numa sequência de quatro.', zh: '作者身份由外层分组播报，不在每个气泡上重复。若气泡自己念出作者，四条一串就会把同一个名字念四遍。', ar: 'تنطق المجموعة الحاوية بالنسبة، ولا تُكرَّر على كل فقاعة. فقاعة تسمّي صاحبها بصوت عالٍ ستقول الاسم نفسه أربع مرات في سلسلة من أربع.' },
  mbUse1: { en: 'Let `MessageGroup` decide `position` and `tail`. Setting them by hand is how a run ends up with two tails, or with a middle bubble that kept its round corners.', es: 'Deja que `MessageGroup` decida `position` y `tail`. Fijarlos a mano es la forma de acabar con una serie de dos colas, o con una burbuja intermedia que conservó sus esquinas redondas.', fr: 'Laissez `MessageGroup` décider de `position` et `tail`. Les fixer à la main, c’est ainsi qu’une salve se retrouve avec deux queues, ou avec une bulle du milieu qui a gardé ses coins ronds.', de: 'Lassen Sie `MessageGroup` über `position` und `tail` entscheiden. Sie von Hand zu setzen führt zu einer Folge mit zwei Zipfeln oder zu einer mittleren Blase, die ihre runden Ecken behielt.', ja: '`position` と `tail` は `MessageGroup` に決めさせてください。手で設定すると、しっぽが2つある連続や、丸い角のままの中間の吹き出しが生まれます。', pt: 'Deixe o `MessageGroup` decidir `position` e `tail`. Defini-los à mão é como uma sequência acaba com duas caudas, ou com um balão do meio que manteve os cantos redondos.', zh: '把 `position` 和 `tail` 交给 `MessageGroup` 决定。手工设置正是一串消息长出两条尾巴、或中间气泡保留圆角的原因。', ar: 'دع `MessageGroup` يقرّر `position` و`tail`. ضبطهما يدويًا هو ما ينتهي بسلسلة لها ذيلان، أو بفقاعة وسطى احتفظت بزواياها المستديرة.' },
  mbUse2: { en: 'Never pass `status` on a received message. A tick reports what our server said about our outbox, and about someone else’s message there is nothing behind the claim.', es: 'Nunca pases `status` en un mensaje recibido. Una marca informa de lo que nuestro servidor dijo de nuestra bandeja de salida, y sobre el mensaje de otra persona no hay nada que respalde esa afirmación.', fr: 'Ne passez jamais `status` sur un message reçu. Une coche rapporte ce que notre serveur a dit de notre boîte d’envoi, et pour le message de quelqu’un d’autre rien ne soutient l’affirmation.', de: 'Übergeben Sie `status` nie bei einer empfangenen Nachricht. Ein Haken meldet, was unser Server über unseren Postausgang sagte, und bei der Nachricht eines anderen steht nichts hinter der Behauptung.', ja: '受信したメッセージに `status` を渡してはいけません。チェックは自分のサーバーが自分の送信箱について述べた報告であり、他人のメッセージについてはその主張の裏付けがありません。', pt: 'Nunca passe `status` numa mensagem recebida. Um visto reporta o que o nosso servidor disse sobre a nossa caixa de saída, e sobre a mensagem de outra pessoa não há nada que sustente a afirmação.', zh: '绝不要在收到的消息上传入 `status`。对钩报告的是我们的服务器对我们发件箱的说法，而对别人的消息，这个断言背后什么都没有。', ar: 'لا تمرّر `status` أبدًا على رسالة واردة. العلامة تُبلّغ بما قاله خادمنا عن صندوق صادرنا، ولا شيء يسند الادّعاء بشأن رسالة شخص آخر.' },
  mbUse3: { en: 'Pick one layout per surface and keep it. Bubble and row want different avatars, gaps, and paint, and switching between them mid-transcript reads as a rendering fault.', es: 'Elige una disposición por superficie y consérvala. Bubble y row quieren avatares, huecos y pintura distintos, y cambiar entre ellas a mitad de transcripción se lee como un fallo de renderizado.', fr: 'Choisissez une disposition par surface et tenez-vous-y. Bulle et ligne veulent des avatars, des espacements et des peintures différents, et passer de l’une à l’autre en plein milieu se lit comme un défaut de rendu.', de: 'Wählen Sie ein Layout je Fläche und bleiben Sie dabei. Blase und Zeile wollen andere Avatare, Abstände und Farben, und mitten im Verlauf zu wechseln liest sich als Rendering-Fehler.', ja: '画面ごとにレイアウトをひとつ選び、貫いてください。バブルと行はアバターも間隔も塗りも異なり、履歴の途中で切り替えると描画の不具合に見えます。', pt: 'Escolha uma disposição por superfície e mantenha-a. Balão e linha querem avatares, espaçamentos e pintura diferentes, e alternar a meio de uma transcrição lê-se como uma falha de renderização.', zh: '每个界面只选一种布局并坚持下去。气泡与行需要不同的头像、间距与配色，在会话记录中途切换会被读作渲染故障。', ar: 'اختر تخطيطًا واحدًا لكل سطح والتزم به. تريد الفقاعة والصف صورًا رمزية ومسافات وألوانًا مختلفة، والتبديل بينهما في منتصف السجلّ يُقرأ خللًا في العرض.' },
  mbUse4: { en: 'Reach for `MessageGroup` or `ConversationView` before reaching for this. A bare bubble is the right unit for a quoted preview or a design review; a transcript is a run of them and should be built as one.', es: 'Recurre a `MessageGroup` o `ConversationView` antes que a esto. Una burbuja suelta es la unidad correcta para una vista previa citada o una revisión de diseño; una transcripción es una serie de ellas y debería construirse como tal.', fr: 'Tournez-vous vers `MessageGroup` ou `ConversationView` avant celui-ci. Une bulle isolée est la bonne unité pour un aperçu cité ou une revue de design ; une transcription est une salve et doit être construite comme telle.', de: 'Greifen Sie eher zu `MessageGroup` oder `ConversationView` als hierzu. Eine einzelne Blase ist die richtige Einheit für eine zitierte Vorschau oder einen Design-Review; ein Verlauf ist eine Folge davon und sollte als solche gebaut werden.', ja: 'これより先に `MessageGroup` か `ConversationView` を検討してください。単独の吹き出しは引用プレビューやデザインレビューには適した単位ですが、履歴は吹き出しの連続であり、そのように組むべきです。', pt: 'Recorra a `MessageGroup` ou `ConversationView` antes de recorrer a este. Um balão isolado é a unidade certa para uma pré-visualização citada ou uma revisão de design; uma transcrição é uma sequência deles e deve ser construída como tal.', zh: '在用这个之前，先考虑 `MessageGroup` 或 `ConversationView`。单个气泡适合做引用预览或设计评审；会话记录是一串气泡，就应该按整串来构建。', ar: 'الجأ إلى `MessageGroup` أو `ConversationView` قبل هذا. الفقاعة المفردة وحدة مناسبة لمعاينة مقتبسة أو لمراجعة تصميم؛ أما السجلّ فسلسلة منها وينبغي بناؤه كذلك.' },
});

/** A fixed instant, so every timestamp on this page renders the same each load. */
const NOW = Date.UTC(2024, 4, 16, 14, 32);

/** The four slots a run of four occupies, in order. */
const RUN_POSITIONS: BubblePosition[] = ['first', 'middle', 'middle', 'last'];

/**
 * A transcript column with a real width, so `72%` and the corner geometry have
 * something to be a share of. Wrapped outside the kit component because the
 * native binding takes no `style`.
 */
function Column({ children, width = '20rem' }: { children: ReactNode; width?: string }) {
  return <div style={{ width, maxWidth: '100%', minWidth: 0 }}>{children}</div>;
}

/** The stack a run sits in: the tight in-run gap, nothing else. */
function Stacked({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gap: 'var(--glacier-space-1)', minWidth: 0 }}>{children}</div>;
}

export function MessageBubblePage() {
  const t = useT();
  const runText = [t(mb.mbRun1), t(mb.mbRun2), t(mb.mbRun3), t(mb.mbRun4)];

  return (
    <>
      <Heading level={1}>{t(mb.mbName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(mb.mbLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(mb.mbAnatomy))}</Text>
      <ComponentBlueprint specId="message-bubble" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(mb.mbExLayoutsTitle)}
        description={prose(t(mb.mbExLayoutsDesc))}
        component="MessageBubble"
        platformLayout="stacked"
        render={(K) => (
          <Row gap={8} wrap align="start">
            <Stack gap={2}>
              <Text size={Size.Small} tone={TextTone.Subtle} mono>
                layout=&quot;bubble&quot;
              </Text>
              <Column width="17rem">
                <Stacked>
                  <K.MessageBubble at={NOW} now={NOW}>
                    {t(mb.mbSample1)}
                  </K.MessageBubble>
                  <K.MessageBubble own status="read" at={NOW} now={NOW}>
                    {t(mb.mbSample2)}
                  </K.MessageBubble>
                </Stacked>
              </Column>
            </Stack>
            <Stack gap={2}>
              <Text size={Size.Small} tone={TextTone.Subtle} mono>
                layout=&quot;row&quot;
              </Text>
              <Column width="17rem">
                <Stacked>
                  <K.MessageBubble
                    layout="row"
                    header={
                      <Text as="span" size={Size.Small} weight="semibold">
                        {t(mb.mbAuthor)}
                      </Text>
                    }
                    at={NOW}
                    now={NOW}
                  >
                    {t(mb.mbSample1)}
                  </K.MessageBubble>
                  <K.MessageBubble layout="row">{t(mb.mbSample2)}</K.MessageBubble>
                </Stacked>
              </Column>
            </Stack>
          </Row>
        )}
        code={`import { MessageBubble } from '@glacier/react';

// iMessage
<MessageBubble>Are you still on for tomorrow?</MessageBubble>
<MessageBubble own status="read">Yes — same place, same time.</MessageBubble>

// Slack
<MessageBubble layout="row" header={<strong>Ada Lovelace</strong>}>
  Are you still on for tomorrow?
</MessageBubble>`}
      />

      <Example
        title={t(mb.mbExRunTitle)}
        description={prose(t(mb.mbExRunDesc))}
        component="MessageBubble"
        platformLayout="stacked"
        render={(K) => (
          <Column>
            <Stacked>
              {RUN_POSITIONS.map((position, i) => (
                <K.MessageBubble
                  key={position + String(i)}
                  own
                  position={position}
                  tail={position === 'last'}
                >
                  {runText[i]}
                </K.MessageBubble>
              ))}
            </Stacked>
          </Column>
        )}
        code={`// bubblePosition(index, length) names each slot; MessageGroup calls it
// for you. Spelled out here so the corner geometry is visible.
<MessageBubble own position="first">One more thing</MessageBubble>
<MessageBubble own position="middle">I found the notes from last week</MessageBubble>
<MessageBubble own position="middle">They were in the wrong folder</MessageBubble>
<MessageBubble own position="last" tail>Sending them over now</MessageBubble>`}
      />

      <Example
        title={t(mb.mbExOwnTitle)}
        description={prose(t(mb.mbExOwnDesc))}
        component="MessageBubble"
        platformLayout="stacked"
        render={(K) => (
          <Column>
            <Stack gap={3}>
              <K.MessageBubble at={NOW} now={NOW}>
                {t(mb.mbSample1)}
              </K.MessageBubble>
              <K.MessageBubble own status="delivered" at={NOW} now={NOW}>
                {t(mb.mbSample2)}
              </K.MessageBubble>
            </Stack>
          </Column>
        )}
        code={`// Received: the raised surface, on the leading edge.
<MessageBubble at={at}>Are you still on for tomorrow?</MessageBubble>

// Sent: the accent fill, on the trailing edge — trailing, not right,
// so an Arabic transcript mirrors as a whole.
<MessageBubble own status="delivered" at={at}>Yes — same place, same time.</MessageBubble>`}
      />

      <Example
        title={t(mb.mbExTailTitle)}
        description={prose(t(mb.mbExTailDesc))}
        component="MessageBubble"
        platformLayout="stacked"
        render={(K) => (
          <Row gap={8} wrap align="start">
            <Column width="14rem">
              <Stack gap={3}>
                <K.MessageBubble tail>{t(mb.mbSample1)}</K.MessageBubble>
                <K.MessageBubble own tail>
                  {t(mb.mbSample2)}
                </K.MessageBubble>
              </Stack>
            </Column>
            <Column width="14rem">
              <Stacked>
                <K.MessageBubble own position="first">
                  {t(mb.mbRun3)}
                </K.MessageBubble>
                <K.MessageBubble own position="last" tail>
                  {t(mb.mbRun4)}
                </K.MessageBubble>
              </Stacked>
            </Column>
          </Row>
        )}
        code={`// One tail per run, on the message that ends it. The path and its box
// come from messageTail in @glacier/logic, so the DOM <path> and
// react-native-svg's <Path> draw the same 8x12 flare.
<MessageBubble own position="first">They were in the wrong folder</MessageBubble>
<MessageBubble own position="last" tail>Sending them over now</MessageBubble>`}
      />

      <Example
        title={t(mb.mbExWrapTitle)}
        description={prose(t(mb.mbExWrapDesc, { maxWidth: BUBBLE_MAX_WIDTH }))}
        component="MessageBubble"
        platformLayout="stacked"
        render={(K) => (
          <Column>
            <Stack gap={3}>
              <K.MessageBubble>
                https://example.com/a/very/long/path/that/never/offers/a/break/opportunity?token=9f2b7c1e4a6d8f0b3c5e7a9d1f2b4c6e
              </K.MessageBubble>
              <K.MessageBubble own status="sent">
                {'Stack trace:\n  at parse (index.js:41:7)\n  at main (index.js:9:3)'}
              </K.MessageBubble>
            </Stack>
          </Column>
        )}
        code={`// overflow-wrap: anywhere, not break-word — only the former also stops
// the unbroken run from inflating the bubble's max-content width.
<MessageBubble>https://example.com/a/very/long/path/?token=9f2b7c1e…</MessageBubble>

// white-space: pre-wrap, because the newlines are the author's.
<MessageBubble own status="sent">{'Stack trace:\\n  at parse…'}</MessageBubble>`}
      />

      <Example
        title={t(mb.mbExSkeletonTitle)}
        description={prose(t(mb.mbExSkeletonDesc))}
        component="MessageBubble"
        platformLayout="stacked"
        render={(K) => (
          <Column>
            <Stacked>
              <K.MessageBubble skeleton position="first" />
              <K.MessageBubble skeleton position="last" tail />
              <K.MessageBubble skeleton own />
            </Stacked>
          </Column>
        )}
        code={`<MessageBubble skeleton position="first" />
<MessageBubble skeleton position="last" tail />
<MessageBubble skeleton own />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'layout', type: "'bubble' | 'row'", default: "'bubble'", description: t(mb.mbPropLayout) },
          { name: 'own', type: 'boolean', default: 'false', description: t(mb.mbPropOwn) },
          { name: 'position', type: "'only' | 'first' | 'middle' | 'last'", default: "'only'", description: t(mb.mbPropPosition) },
          { name: 'tail', type: 'boolean', default: 'false', description: t(mb.mbPropTail) },
          { name: 'side', type: "'start' | 'end'", description: t(mb.mbPropSide) },
          { name: 'avatar', type: 'ReactNode', description: t(mb.mbPropAvatar) },
          { name: 'at', type: 'Millis', description: t(mb.mbPropAt) },
          { name: 'status', type: "'sending' | 'sent' | 'delivered' | 'read' | 'failed'", description: t(mb.mbPropStatus) },
          { name: 'edited', type: 'boolean', default: 'false', description: t(mb.mbPropEdited) },
          { name: 'meta', type: 'ReactNode', description: t(mb.mbPropMeta) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(mb.mbPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(mb.mbA11y1))}</li>
        <li>{prose(t(mb.mbA11y2))}</li>
        <li>{prose(t(mb.mbA11y3))}</li>
        <li>{prose(t(mb.mbA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(mb.mbUse1))}</li>
        <li>{prose(t(mb.mbUse2))}</li>
        <li>{prose(t(mb.mbUse3))}</li>
        <li>{prose(t(mb.mbUse4))}</li>
      </ul>
    </>
  );
}

export { mb as messageBubblePageMessages };
