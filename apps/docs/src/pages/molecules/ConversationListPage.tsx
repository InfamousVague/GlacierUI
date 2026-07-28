import {
  Avatar,
  AvatarGroup,
  Heading,
  List,
  Row,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
  type ConversationItem,
} from '@glacier/react';
import {
  conversationMarkers,
  conversationStateLabels,
  defaultConversationLabels,
} from '@glacier/logic';
import { useState } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * The chat sidebar: one row, the listbox around it, and the placeholder that
 * stands in while it loads.
 *
 * Page strings are defined locally so the file compiles standalone; the handoff
 * lists every key for the integrator to fold into apps/docs/src/i18n.ts.
 */
const p = defineMessages({
  cvlName: {
    en: 'Conversation list', es: 'Lista de conversaciones', fr: 'Liste de conversations',
    de: 'Konversationsliste', ja: '会話リスト', pt: 'Lista de conversas',
    zh: '会话列表', ar: 'قائمة المحادثات',
  },
  cvlLede: {
    en: 'A chat sidebar: a single-select listbox of conversations, each row carrying an avatar, a name, a snippet, a timestamp, an unread count and four state markers without turning into noise. Selection, keyboard navigation and the Pinned / All grouping live in the list, so a row stays a row.',
    es: 'Una barra lateral de chat: un listbox de selección única de conversaciones, con filas que llevan avatar, nombre, fragmento, marca de tiempo, contador de no leídos y cuatro marcadores de estado sin convertirse en ruido. La selección, la navegación por teclado y la agrupación Fijadas / Todas viven en la lista, para que una fila siga siendo una fila.',
    fr: 'Une barre latérale de discussion : une listbox à sélection unique de conversations, chaque rangée portant un avatar, un nom, un extrait, un horodatage, un compteur de non-lus et quatre marqueurs d’état sans devenir du bruit. La sélection, la navigation clavier et le regroupement Épinglées / Toutes vivent dans la liste, pour qu’une rangée reste une rangée.',
    de: 'Eine Chat-Seitenleiste: eine Einzelauswahl-Listbox von Gesprächen, jede Zeile mit Avatar, Name, Ausschnitt, Zeitstempel, Ungelesen-Zähler und vier Zustandsmarken, ohne zu Lärm zu werden. Auswahl, Tastaturnavigation und die Gruppierung Angeheftet / Alle liegen in der Liste, damit eine Zeile eine Zeile bleibt.',
    ja: 'チャットのサイドバー。会話の単一選択リストボックスで、各行はアバター、名前、抜粋、時刻、未読数、4 つの状態マーカーを、うるさくならずに担います。選択、キーボード操作、ピン留め／すべての分割はリスト側にあり、行は行のままです。',
    pt: 'Uma barra lateral de conversas: uma listbox de seleção única, cada linha com avatar, nome, excerto, carimbo temporal, contagem de não lidos e quatro marcadores de estado sem virar ruído. A seleção, a navegação por teclado e o agrupamento Fixadas / Todas vivem na lista, para uma linha continuar a ser uma linha.',
    zh: '聊天侧边栏：一个单选会话列表框，每行承载头像、名称、摘录、时间戳、未读计数和四个状态标记，却不至于变成噪音。选择、键盘导航以及“置顶／全部”的分组都归列表所有，这样一行仍然只是一行。',
    ar: 'شريط جانبي للمحادثات: قائمة اختيار مفرد، يحمل كل صف صورة واسمًا ومقتطفًا ووقتًا وعدّاد غير مقروء وأربع علامات حالة دون أن يصير ضجيجًا. الاختيار والتنقل بلوحة المفاتيح وتجميع المثبّتة/الكل كلها في القائمة، ليبقى الصف صفًّا.',
  },
  cvlAnatomy: {
    en: 'A row spends its space as three independent slots: the prefix at the head of the snippet line, the quiet glyphs beside the timestamp, and the badge on the snippet’s trailing edge. The snippet cap, the count cap, the timestamp ladder and the marker precedence all come from `@glacier/logic`, so a row that truncates at 120 characters on the web cannot truncate at 80 on the phone.',
    es: 'Una fila gasta su espacio en tres huecos independientes: el prefijo al inicio de la línea de fragmento, los glifos discretos junto a la marca de tiempo, y la insignia al final de esa línea. El tope del fragmento, el del contador, la escala de marcas de tiempo y la precedencia de marcadores vienen de `@glacier/logic`: una fila que corta a 120 caracteres en la web no puede cortar a 80 en el móvil.',
    fr: 'Une rangée dépense son espace en trois emplacements indépendants : le préfixe en tête de la ligne d’extrait, les glyphes discrets près de l’horodatage, et le badge au bord final de cette ligne. Le plafond d’extrait, celui du compteur, l’échelle d’horodatage et la précédence des marqueurs viennent tous de `@glacier/logic` : une rangée qui tronque à 120 caractères sur le web ne peut pas tronquer à 80 sur le téléphone.',
    de: 'Eine Zeile verteilt ihren Platz auf drei unabhängige Slots: das Präfix am Kopf der Ausschnittzeile, die stillen Zeichen neben dem Zeitstempel und das Badge am Endrand dieser Zeile. Ausschnittgrenze, Zählgrenze, Zeitstempelleiter und Markenpräzedenz kommen alle aus `@glacier/logic` — eine Zeile, die im Web bei 120 Zeichen kürzt, kann auf dem Telefon nicht bei 80 kürzen.',
    ja: '行は空間を 3 つの独立したスロットに使います。抜粋行の先頭の接頭、時刻の横の控えめな字形、抜粋行の末尾のバッジ。抜粋の上限、件数の上限、時刻の段階、マーカーの優先順位はすべて `@glacier/logic` にあるので、Web で 120 文字で切る行がスマートフォンで 80 文字になることはありません。',
    pt: 'Uma linha gasta o seu espaço em três slots independentes: o prefixo no início da linha de excerto, os glifos discretos junto do carimbo temporal, e o selo na margem final dessa linha. O limite do excerto, o da contagem, a escada de carimbos e a precedência dos marcadores vêm todos de `@glacier/logic`: uma linha que trunca aos 120 caracteres na web não pode truncar aos 80 no telemóvel.',
    zh: '一行把空间分给三个互不相干的插槽：摘录行开头的前缀、时间戳旁的安静字形，以及摘录行尾边的徽章。摘录上限、计数上限、时间戳阶梯和标记优先级全都来自 `@glacier/logic`，所以在网页上按 120 字截断的行，不可能在手机上按 80 字截断。',
    ar: 'يوزّع الصف مساحته على ثلاث خانات مستقلة: بادئة في أول سطر المقتطف، ورموز هادئة بجانب الوقت، وشارة على الحافة الأخيرة لذلك السطر. حدّ المقتطف وحدّ العدد وسلّم الوقت وأولوية العلامات كلها من `@glacier/logic`، فصفٌّ يقتطع عند 120 حرفًا على الويب لا يمكنه الاقتطاع عند 80 على الهاتف.',
  },

  // ---- examples ------------------------------------------------------------
  cvlExSidebarTitle: {
    en: 'A sidebar', es: 'Una barra lateral', fr: 'Une barre latérale',
    de: 'Eine Seitenleiste', ja: 'サイドバー', pt: 'Uma barra lateral',
    zh: '一个侧边栏', ar: 'شريط جانبي',
  },
  cvlExSidebarDesc: {
    en: 'One pinned, one muted, one with an unsent draft, one whose last outgoing message failed, and several with unread counts. The list never re-sorts — the order a chat app wants is most recent activity, and only the app knows that — it only splits Pinned from All. Arrow keys move a roving tabindex, so the focused row is the genuinely focused element and the browser scrolls it into view for free.',
    es: 'Una fijada, una silenciada, una con borrador sin enviar, una cuyo último mensaje saliente falló y varias con no leídos. La lista nunca reordena —el orden que quiere una app de chat es por actividad reciente, y eso solo lo sabe la app—, solo separa Fijadas de Todas. Las flechas mueven un tabindex itinerante, así que la fila enfocada es el elemento realmente enfocado y el navegador la desplaza a la vista gratis.',
    fr: 'Une épinglée, une en sourdine, une avec un brouillon non envoyé, une dont le dernier message sortant a échoué, et plusieurs avec des non-lus. La liste ne retrie jamais — l’ordre qu’une app de discussion veut est l’activité récente, et seule l’app le sait — elle sépare seulement Épinglées et Toutes. Les flèches déplacent un tabindex itinérant : la rangée focalisée est l’élément réellement focalisé et le navigateur la fait défiler gratuitement.',
    de: 'Eine angeheftet, eine stummgeschaltet, eine mit ungesendetem Entwurf, eine mit fehlgeschlagener letzter Nachricht und mehrere mit Ungelesenem. Die Liste sortiert nie um — die Reihenfolge, die eine Chat-App will, ist die jüngste Aktivität, und nur die App kennt sie — sie trennt nur Angeheftet von Alle. Pfeiltasten bewegen einen wandernden Tabindex, also ist die fokussierte Zeile das echte Fokuselement und der Browser scrollt sie gratis ins Bild.',
    ja: 'ピン留めが 1 件、ミュートが 1 件、未送信の下書きが 1 件、直近の送信が失敗したものが 1 件、そして未読のあるものが複数。リストは並べ替えません。チャットアプリが望む順序は最近の活動順で、それを知るのはアプリだけです。行うのはピン留めとその他の分割だけ。矢印キーはローミング tabindex を動かすので、フォーカス行は本当にフォーカスされた要素であり、ブラウザーが自動で表示範囲に入れてくれます。',
    pt: 'Uma fixada, uma silenciada, uma com rascunho por enviar, uma cuja última mensagem de saída falhou, e várias com não lidos. A lista nunca reordena — a ordem que uma app de conversas quer é a atividade recente, e só a app a conhece — apenas separa Fixadas de Todas. As setas movem um tabindex itinerante, pelo que a linha focada é o elemento realmente focado e o browser desloca-a para a vista de graça.',
    zh: '一条置顶、一条静音、一条有未发送草稿、一条最后一次外发消息失败，还有几条带未读计数。列表从不重新排序——聊天应用想要的顺序是最近活动，而只有应用知道——它只把置顶与全部分开。方向键移动漫游 tabindex，因此获得焦点的行就是真正的焦点元素，浏览器会免费把它滚入视野。',
    ar: 'واحدة مثبّتة، وواحدة مكتومة، وواحدة بمسودة غير مرسلة، وواحدة فشل آخر إرسال فيها، وعدة محادثات بغير مقروء. القائمة لا تعيد الترتيب أبدًا — الترتيب الذي يريده تطبيق المحادثة هو النشاط الأحدث، ولا يعرفه إلا التطبيق — بل تفصل المثبّتة عن الكل فقط. تحرّك الأسهم tabindex متجوّلًا، فالصف المركَّز هو العنصر المركَّز فعلًا ويمرّره المتصفح إلى العرض مجانًا.',
  },
  cvlExEverythingTitle: {
    en: 'Every marker at once', es: 'Todos los marcadores a la vez', fr: 'Tous les marqueurs à la fois',
    de: 'Alle Marken auf einmal', ja: 'すべてのマーカーを同時に', pt: 'Todos os marcadores ao mesmo tempo',
    zh: '所有标记同时出现', ar: 'كل العلامات دفعة واحدة',
  },
  cvlExEverythingDesc: {
    en: 'Pinned AND muted AND drafting AND failed AND 120 unread, on one row. Because the three slots are independent rather than a precedence ladder, all three fill at once: the pin and the bell sit beside the timestamp, the badge sits on the snippet’s trailing edge, and the prefix takes the head of the snippet line. The one place precedence bites is inside that prefix — it holds exactly one of `failed` or `draft`, because both replace what the snippet MEANS, and `failed` wins since an undelivered message is a broken promise and a draft is only an unfinished one. Nothing is lost to a screen reader: the hidden phrase list below still spells out all five.',
    es: 'Fijada Y silenciada Y con borrador Y fallida Y 120 sin leer, en una fila. Como los tres huecos son independientes y no una escalera de precedencia, se llenan a la vez: el pin y la campana junto a la marca de tiempo, la insignia al final de la línea de fragmento y el prefijo al inicio de esa línea. La precedencia solo muerde dentro del prefijo: contiene exactamente uno de `failed` o `draft`, porque ambos sustituyen lo que SIGNIFICA el fragmento, y gana `failed`, ya que un mensaje sin entregar es una promesa rota y un borrador solo una sin terminar. Nada se pierde para un lector de pantalla: la lista de frases oculta de abajo sigue deletreando los cinco.',
    fr: 'Épinglée ET en sourdine ET avec brouillon ET échouée ET 120 non lus, sur une rangée. Comme les trois emplacements sont indépendants et non une échelle de précédence, ils se remplissent tous : l’épingle et la cloche près de l’horodatage, le badge au bord final de la ligne d’extrait, le préfixe en tête de cette ligne. La précédence ne mord qu’à l’intérieur du préfixe : il tient exactement un de `failed` ou `draft`, car les deux remplacent ce que l’extrait SIGNIFIE, et `failed` l’emporte, un message non remis étant une promesse rompue là où un brouillon n’est qu’inachevé. Rien n’est perdu pour un lecteur d’écran : la liste de phrases masquée ci-dessous énonce toujours les cinq.',
    de: 'Angeheftet UND stumm UND mit Entwurf UND fehlgeschlagen UND 120 ungelesen, in einer Zeile. Weil die drei Slots unabhängig sind statt eine Präzedenzleiter, füllen sie sich alle: Nadel und Glocke neben dem Zeitstempel, das Badge am Endrand der Ausschnittzeile, das Präfix an deren Kopf. Präzedenz beißt nur im Präfix — es hält genau eines von `failed` oder `draft`, denn beide ersetzen, was der Ausschnitt BEDEUTET, und `failed` gewinnt, weil eine nicht zugestellte Nachricht ein gebrochenes Versprechen ist und ein Entwurf nur ein unfertiges. Für einen Screenreader geht nichts verloren: die verborgene Phrasenliste unten nennt weiterhin alle fünf.',
    ja: 'ピン留め、かつミュート、かつ下書きあり、かつ送信失敗、かつ未読 120 件を 1 行で。3 つのスロットは優先順位の階段ではなく独立しているので、すべて同時に埋まります。ピンとベルは時刻の横、バッジは抜粋行の末尾、接頭はその行の先頭です。優先順位が効くのは接頭の中だけで、`failed` か `draft` のどちらか一方だけを持ちます。どちらも抜粋の「意味」を置き換えるからで、届かなかったメッセージは破られた約束、下書きは未完の約束にすぎないので `failed` が勝ちます。読み上げでは何も失われません。下の隠し文リストは 5 つすべてを述べます。',
    pt: 'Fixada E silenciada E com rascunho E falhada E 120 não lidas, numa linha. Como os três slots são independentes e não uma escada de precedência, todos se enchem: o pino e a campainha junto do carimbo, o selo na margem final da linha de excerto, e o prefixo no início dessa linha. A precedência só morde dentro do prefixo — contém exatamente um de `failed` ou `draft`, porque ambos substituem o que o excerto SIGNIFICA, e `failed` ganha, já que uma mensagem não entregue é uma promessa quebrada e um rascunho é apenas uma por acabar. Nada se perde para um leitor de ecrã: a lista de frases escondida abaixo continua a soletrar as cinco.',
    zh: '同一行上同时置顶、静音、有草稿、发送失败并且 120 条未读。由于三个插槽彼此独立而不是一条优先级阶梯，它们会同时被填满：图钉和铃铛在时间戳旁，徽章在摘录行尾边，前缀在该行开头。优先级只在前缀内部起作用——它只容纳 `failed` 或 `draft` 之一，因为两者都改变了摘录的“含义”，而 `failed` 胜出，因为未送达的消息是被打破的承诺，草稿只是尚未完成的承诺。对屏幕阅读器而言什么都没丢：下面隐藏的短语列表仍会完整念出五个。',
    ar: 'مثبّتة ومكتومة وفيها مسودة وفشل إرسالها و120 غير مقروءة، في صف واحد. لأن الخانات الثلاث مستقلة لا سلّم أولويات، تمتلئ كلها معًا: الدبوس والجرس بجانب الوقت، والشارة على الحافة الأخيرة لسطر المقتطف، والبادئة في أوله. الأولوية تعضّ داخل البادئة وحدها — تحمل واحدًا فقط من `failed` أو `draft`، لأن كليهما يستبدل «معنى» المقتطف، ويفوز `failed` لأن رسالة لم تُسلَّم وعدٌ مكسور والمسودة وعد لم يكتمل. ولا يضيع شيء لقارئ الشاشة: قائمة العبارات المخفية أدناه ما زالت تذكر الخمس جميعًا.',
  },
  cvlExEverythingMarkers: {
    en: 'conversationMarkers →', es: 'conversationMarkers →', fr: 'conversationMarkers →',
    de: 'conversationMarkers →', ja: 'conversationMarkers →', pt: 'conversationMarkers →',
    zh: 'conversationMarkers →', ar: 'conversationMarkers →',
  },
  cvlExEverythingPhrases: {
    en: 'The hidden phrase list a screen reader gets:', es: 'La lista de frases oculta que recibe un lector de pantalla:', fr: 'La liste de phrases masquée que reçoit un lecteur d’écran :',
    de: 'Die verborgene Phrasenliste, die ein Screenreader bekommt:', ja: '読み上げが受け取る隠し文リスト:', pt: 'A lista de frases escondida que um leitor de ecrã recebe:',
    zh: '屏幕阅读器拿到的隐藏短语列表：', ar: 'قائمة العبارات المخفية التي يتلقّاها قارئ الشاشة:',
  },
  cvlExMutedTitle: {
    en: 'Muting demotes the badge, it does not hide it', es: 'Silenciar degrada la insignia, no la oculta', fr: 'Le mode silencieux rétrograde le badge, il ne le cache pas',
    de: 'Stummschalten stuft das Badge herab, es versteckt es nicht', ja: 'ミュートはバッジを下げるだけで隠さない', pt: 'Silenciar rebaixa o selo, não o esconde',
    zh: '静音是把徽章降级，而不是隐藏它', ar: 'الكتم يخفض الشارة ولا يخفيها',
  },
  cvlExMutedDesc: {
    en: 'The same conversation, the same twelve unread messages, muted and not. The badge drops from danger to neutral and keeps its number: muting quiets a conversation, it does not lie about having messages in it. This is the only interaction between the three slots.',
    es: 'La misma conversación, los mismos doce mensajes sin leer, silenciada y no. La insignia baja de peligro a neutral y conserva su número: silenciar acalla una conversación, no miente sobre tener mensajes. Esta es la única interacción entre los tres huecos.',
    fr: 'La même conversation, les mêmes douze messages non lus, en sourdine et pas. Le badge passe de danger à neutre et garde son nombre : la sourdine calme une conversation, elle ne ment pas sur les messages qu’elle contient. C’est la seule interaction entre les trois emplacements.',
    de: 'Dasselbe Gespräch, dieselben zwölf ungelesenen Nachrichten, stumm und nicht. Das Badge fällt von Gefahr auf neutral und behält seine Zahl: Stummschalten beruhigt ein Gespräch, es lügt nicht über die Nachrichten darin. Das ist die einzige Wechselwirkung zwischen den drei Slots.',
    ja: '同じ会話、同じ未読 12 件を、ミュートあり・なしで。バッジは danger から neutral に下がり、数はそのままです。ミュートは会話を静かにするだけで、メッセージの有無について嘘はつきません。3 つのスロット間の相互作用はこれだけです。',
    pt: 'A mesma conversa, as mesmas doze mensagens não lidas, silenciada e não. O selo cai de perigo para neutro e mantém o número: silenciar acalma uma conversa, não mente sobre ter mensagens nela. Esta é a única interação entre os três slots.',
    zh: '同一个会话、同样十二条未读，一个静音一个不静音。徽章从危险色降为中性色并保留数字：静音只是让会话安静，并不谎称里面没有消息。这是三个插槽之间唯一的相互作用。',
    ar: 'المحادثة نفسها، والاثنتا عشرة رسالة غير المقروءة نفسها، مكتومة وغير مكتومة. تهبط الشارة من الخطر إلى المحايد وتحتفظ برقمها: الكتم يُهدّئ المحادثة ولا يكذب بشأن وجود رسائل فيها. هذا هو التفاعل الوحيد بين الخانات الثلاث.',
  },
  cvlExSkeletonTitle: {
    en: 'The placeholder beside the thing it stands in for', es: 'El marcador junto a lo que sustituye', fr: 'L’espace réservé à côté de ce qu’il remplace',
    de: 'Der Platzhalter neben dem, wofür er steht', ja: 'プレースホルダーと本物を並べて', pt: 'O marcador ao lado daquilo que substitui',
    zh: '占位符与它所替代之物并排', ar: 'العنصر النائب بجانب ما ينوب عنه',
  },
  cvlExSkeletonDesc: {
    en: '`ConversationSkeleton` renders the real `ConversationListItem` in its skeleton state rather than a lookalike, so the placeholder cannot drift from the row it stands in for: same grid, same avatar diameter, same two line boxes, same trailing column. Each part is its own placeholder — disc, name, timestamp, snippet, badge — so the list reads as an outline waiting to be filled rather than a stack of grey slabs, and nothing shifts when the conversations arrive.',
    es: '`ConversationSkeleton` renderiza el `ConversationListItem` real en su estado de esqueleto, no un parecido, así el marcador no puede desviarse de la fila a la que sustituye: misma rejilla, mismo diámetro de avatar, mismas dos cajas de línea, misma columna final. Cada parte es su propio marcador —disco, nombre, hora, fragmento, insignia— de modo que la lista se lee como un boceto por rellenar y no como una pila de losas grises, y nada se mueve cuando llegan las conversaciones.',
    fr: '`ConversationSkeleton` rend le vrai `ConversationListItem` dans son état squelette plutôt qu’un sosie : l’espace réservé ne peut donc pas dériver de la rangée qu’il remplace — même grille, même diamètre d’avatar, mêmes deux boîtes de ligne, même colonne finale. Chaque partie est son propre espace réservé — disque, nom, horodatage, extrait, badge — si bien que la liste se lit comme une esquisse à remplir plutôt qu’un empilement de dalles grises, et rien ne bouge quand les conversations arrivent.',
    de: '`ConversationSkeleton` rendert das echte `ConversationListItem` in seinem Skelettzustand statt eines Doppelgängers, damit der Platzhalter nicht von der Zeile abdriften kann, für die er steht: gleiches Raster, gleicher Avatardurchmesser, gleiche zwei Zeilenboxen, gleiche Endspalte. Jedes Teil ist ein eigener Platzhalter — Scheibe, Name, Zeit, Ausschnitt, Badge — sodass die Liste als zu füllende Skizze liest statt als Stapel grauer Platten, und nichts springt, wenn die Gespräche eintreffen.',
    ja: '`ConversationSkeleton` は似せた別物ではなく、本物の `ConversationListItem` をスケルトン状態で描画します。だからプレースホルダーが本来の行からずれることはありません。同じグリッド、同じアバター直径、同じ 2 行のボックス、同じ末尾カラム。円、名前、時刻、抜粋、バッジがそれぞれ独立したプレースホルダーなので、灰色の板の山ではなく、埋められるのを待つ下書きに見えます。会話が届いても何もずれません。',
    pt: '`ConversationSkeleton` renderiza o verdadeiro `ConversationListItem` no seu estado de esqueleto em vez de um sósia, pelo que o marcador não pode divergir da linha que substitui: mesma grelha, mesmo diâmetro de avatar, mesmas duas caixas de linha, mesma coluna final. Cada parte é o seu próprio marcador — disco, nome, hora, excerto, selo — para a lista se ler como um esboço por preencher e não como uma pilha de lajes cinzentas, e nada salta quando as conversas chegam.',
    zh: '`ConversationSkeleton` 渲染的是真正的 `ConversationListItem` 的骨架状态，而不是一个仿制品，因此占位符不可能与它所替代的行产生偏差：同样的栅格、同样的头像直径、同样的两个行盒、同样的尾列。每个部件都是各自的占位符——圆盘、名称、时间、摘录、徽章——所以整份列表读起来像一张待填的轮廓，而不是一摞灰色板砖，会话到达时也不会发生位移。',
    ar: '`ConversationSkeleton` يعرض `ConversationListItem` الحقيقي في حالته الهيكلية لا نسخة شبيهة، فلا يمكن للعنصر النائب أن ينحرف عن الصف الذي ينوب عنه: الشبكة ذاتها، وقُطر الصورة ذاته، وصندوقا السطر ذاتهما، والعمود الأخير ذاته. كل جزء عنصر نائب مستقل — قرص واسم ووقت ومقتطف وشارة — فتُقرأ القائمة كمخطط ينتظر الملء لا ككومة ألواح رمادية، ولا يتحرك شيء عند وصول المحادثات.',
  },
  cvlExDensityTitle: {
    en: 'Two densities, and nothing in between', es: 'Dos densidades, y nada en medio', fr: 'Deux densités, et rien entre les deux',
    de: 'Zwei Dichten, und nichts dazwischen', ja: '2 つの密度、その中間はなし', pt: 'Duas densidades, e nada pelo meio',
    zh: '两种密度，中间没有别的', ar: 'كثافتان، ولا شيء بينهما',
  },
  cvlExDensityDesc: {
    en: 'A sidebar row is either “fit more threads on screen” or “let me read the last message”, and a third step in between is a preference nobody has. The measurements come from the spec through the shared resolvers and reach CSS as custom properties, so the stylesheet keeps deciding how they are spent while the scale stays shared.',
    es: 'Una fila de barra lateral es «caben más hilos» o «déjame leer el último mensaje»; un tercer paso intermedio es una preferencia que nadie tiene. Las medidas vienen de la especificación a través de los resolutores compartidos y llegan a CSS como propiedades personalizadas, así la hoja de estilos sigue decidiendo cómo se gastan mientras la escala se mantiene compartida.',
    fr: 'Une rangée de barre latérale, c’est soit « tenir plus de fils à l’écran », soit « laisse-moi lire le dernier message » ; un troisième palier intermédiaire est une préférence que personne n’a. Les mesures viennent de la spécification via les résolveurs partagés et atteignent CSS en propriétés personnalisées : la feuille de style continue de décider comment elles sont dépensées, l’échelle restant partagée.',
    de: 'Eine Seitenleistenzeile ist entweder „mehr Threads auf den Schirm“ oder „lass mich die letzte Nachricht lesen“; eine dritte Stufe dazwischen ist eine Vorliebe, die niemand hat. Die Maße kommen über die geteilten Resolver aus der Spezifikation und erreichen CSS als Custom Properties, sodass das Stylesheet weiter entscheidet, wie sie ausgegeben werden, während die Skala geteilt bleibt.',
    ja: 'サイドバーの行は「もっと多くのスレッドを画面に」か「最後のメッセージを読ませて」のどちらかで、その中間の 3 段目は誰も欲しがらない設定です。寸法は共有リゾルバー経由で spec から来て、カスタムプロパティとして CSS に届きます。スケールは共有のまま、使い方はスタイルシートが決め続けます。',
    pt: 'Uma linha de barra lateral é ou «caber mais tópicos no ecrã» ou «deixa-me ler a última mensagem», e um terceiro passo pelo meio é uma preferência que ninguém tem. As medidas vêm da especificação pelos resolvedores partilhados e chegam ao CSS como propriedades personalizadas, por isso a folha de estilos continua a decidir como são gastas enquanto a escala se mantém partilhada.',
    zh: '侧边栏的一行要么是“屏幕里多塞几个会话”，要么是“让我读到最后一条消息”，中间再加一档是没人需要的偏好。度量经共享解析器从规格取得，并以自定义属性的形式抵达 CSS，因此样式表继续决定怎么花，而尺度保持共享。',
    ar: 'صف الشريط الجانبي إما «ضع محادثات أكثر على الشاشة» أو «دعني أقرأ آخر رسالة»، ودرجة ثالثة بينهما تفضيل لا يريده أحد. تأتي القياسات من المواصفة عبر المُحلّلات المشتركة وتصل إلى CSS كخصائص مخصّصة، فتبقى ورقة الأنماط هي من يقرّر كيف تُنفق بينما يظل المقياس مشتركًا.',
  },
  cvlExScrollTitle: {
    en: 'Scrolled, ungrouped, and empty', es: 'Con desplazamiento, sin agrupar y vacía', fr: 'Défilante, non groupée, et vide',
    de: 'Gescrollt, ungruppiert und leer', ja: 'スクロール、グループなし、空', pt: 'Com deslocamento, sem agrupamento e vazia',
    zh: '可滚动、不分组，以及空态', ar: 'قابلة للتمرير، بلا تجميع، وفارغة',
  },
  cvlExScrollDesc: {
    en: '`maxHeight` caps the list and wraps it in a ScrollArea, which becomes the scroll host — the same viewport a windowing strategy would measure. `grouped={false}` collapses the two sections into one, and `empty` stands in when there is nothing to list.',
    es: '`maxHeight` limita la lista y la envuelve en un ScrollArea, que pasa a ser el anfitrión del desplazamiento: el mismo viewport que mediría una estrategia de ventanas. `grouped={false}` fusiona las dos secciones en una, y `empty` sustituye cuando no hay nada que listar.',
    fr: '`maxHeight` plafonne la liste et l’enveloppe dans un ScrollArea, qui devient l’hôte du défilement — le viewport même qu’une stratégie de fenêtrage mesurerait. `grouped={false}` fond les deux sections en une, et `empty` prend le relais quand il n’y a rien à lister.',
    de: '`maxHeight` deckelt die Liste und hüllt sie in eine ScrollArea, die zum Scroll-Host wird — genau das Viewport, das eine Windowing-Strategie messen würde. `grouped={false}` legt die zwei Sektionen zu einer zusammen, und `empty` springt ein, wenn es nichts zu listen gibt.',
    ja: '`maxHeight` はリストの高さを抑え、ScrollArea で包みます。その ScrollArea がスクロールのホストであり、ウィンドウイング戦略が計測するのと同じビューポートです。`grouped={false}` は 2 つのセクションをひとつにまとめ、`empty` は並べるものがないときに代わりに出ます。',
    pt: '`maxHeight` limita a lista e envolve-a numa ScrollArea, que passa a ser o anfitrião do deslocamento — o mesmo viewport que uma estratégia de janelamento mediria. `grouped={false}` funde as duas secções numa, e `empty` entra quando não há nada para listar.',
    zh: '`maxHeight` 给列表封顶并把它包进 ScrollArea，后者成为滚动宿主——也正是窗口化策略会去测量的那个视口。`grouped={false}` 把两个分区合成一个，`empty` 在没有内容可列时顶上。',
    ar: '`maxHeight` يحدّ القائمة ويلفّها في ScrollArea تصير مضيف التمرير — وهو نفس منفذ العرض الذي ستقيسه استراتيجية النوافذ. و`grouped={false}` يدمج القسمين في واحد، و`empty` ينوب حين لا يوجد ما يُعرض.',
  },
  cvlEmpty: {
    en: 'No conversations yet', es: 'Aún no hay conversaciones', fr: 'Pas encore de conversations',
    de: 'Noch keine Gespräche', ja: 'まだ会話はありません', pt: 'Ainda não há conversas',
    zh: '还没有会话', ar: 'لا محادثات بعد',
  },

  // ---- demo copy -----------------------------------------------------------
  cvlSnip1: {
    en: 'The rollback path is the part I am least sure about — can you take another look before Friday?',
    es: 'La ruta de reversión es lo que menos me convence: ¿puedes revisarla antes del viernes?',
    fr: 'Le chemin de retour arrière est ce dont je suis le moins sûr — peux-tu le revoir avant vendredi ?',
    de: 'Beim Rollback-Pfad bin ich am unsichersten — kannst du vor Freitag nochmal schauen?',
    ja: 'ロールバックの経路がいちばん自信がありません。金曜までに見てもらえますか。',
    pt: 'O caminho de reversão é a parte de que estou menos seguro — podes rever antes de sexta?',
    zh: '我最没把握的是回滚路径——你能在周五之前再看一遍吗？',
    ar: 'مسار التراجع هو الجزء الأقل ثقةً لديّ — هل يمكنك مراجعته قبل الجمعة؟',
  },
  cvlSnip2: {
    en: 'Pushed the fix, staging is green', es: 'Subí el arreglo, staging está en verde', fr: 'Correctif poussé, la préproduction est au vert',
    de: 'Fix ist gepusht, Staging ist grün', ja: '修正をプッシュしました。ステージングはグリーンです', pt: 'Correção enviada, o staging está verde',
    zh: '修复已推送，预发布环境是绿的', ar: 'دفعتُ الإصلاح، وبيئة التجهيز خضراء',
  },
  cvlSnip3: {
    en: 'Notes from the design review are in the doc', es: 'Las notas de la revisión de diseño están en el documento', fr: 'Les notes de la revue de design sont dans le document',
    de: 'Die Notizen des Design-Reviews stehen im Dokument', ja: 'デザインレビューのメモはドキュメントにあります', pt: 'As notas da revisão de design estão no documento',
    zh: '设计评审的笔记在文档里', ar: 'ملاحظات مراجعة التصميم في المستند',
  },
  cvlSnip4: {
    en: 'See you at the standup', es: 'Nos vemos en la reunión diaria', fr: 'À tout à l’heure au point quotidien',
    de: 'Bis gleich beim Standup', ja: 'スタンドアップで会いましょう', pt: 'Até já na reunião diária',
    zh: '站会见', ar: 'أراك في الاجتماع اليومي',
  },
  cvlSnip5: {
    en: 'Anyone around to review the release checklist?', es: '¿Alguien puede revisar la lista de publicación?', fr: 'Quelqu’un peut relire la checklist de release ?',
    de: 'Ist jemand da, um die Release-Checkliste zu prüfen?', ja: 'リリースのチェックリストを見てくれる人はいますか。', pt: 'Alguém disponível para rever a checklist de lançamento?',
    zh: '有人能审一下发布检查清单吗？', ar: 'هل من أحد يراجع قائمة الإطلاق؟',
  },
  cvlSnip6: {
    en: 'I will send the invoice tomorrow morning', es: 'Enviaré la factura mañana por la mañana', fr: 'J’enverrai la facture demain matin',
    de: 'Ich schicke die Rechnung morgen früh', ja: '請求書は明日の朝に送ります', pt: 'Envio a fatura amanhã de manhã',
    zh: '我明天早上发发票', ar: 'سأرسل الفاتورة صباح الغد',
  },
  cvlSnipEverything: {
    en: 'Everything at once, so the row has to prove it can hold all of it', es: 'Todo a la vez, para que la fila demuestre que puede con todo', fr: 'Tout à la fois, pour que la rangée prouve qu’elle tient le coup',
    de: 'Alles auf einmal, damit die Zeile beweist, dass sie es trägt', ja: 'すべて同時に。行がすべてを担えることを示すために', pt: 'Tudo ao mesmo tempo, para a linha provar que aguenta',
    zh: '所有情况一次上齐，让这行证明它扛得住', ar: 'كل شيء دفعة واحدة، ليُثبت الصف أنه يحتمله',
  },

  // ---- accessibility -------------------------------------------------------
  cvlA11y1: {
    en: 'The list is a `listbox` and each row an `option`, which is why a row is deliberately not built on ListItem: ListItem becomes a `<button>` or `<a>` the moment it is actionable, and an option must be the focusable element itself with no interactive descendants.',
    es: 'La lista es un `listbox` y cada fila una `option`; por eso una fila no se construye sobre ListItem: ListItem se convierte en `<button>` o `<a>` en cuanto es accionable, y una option debe ser el elemento enfocable en sí, sin descendientes interactivos.',
    fr: 'La liste est une `listbox` et chaque rangée une `option`, d’où le fait qu’une rangée ne soit délibérément pas construite sur ListItem : ListItem devient un `<button>` ou un `<a>` dès qu’il est actionnable, et une option doit être l’élément focalisable lui-même, sans descendants interactifs.',
    de: 'Die Liste ist eine `listbox` und jede Zeile eine `option` — deshalb baut eine Zeile bewusst nicht auf ListItem auf: ListItem wird zu `<button>` oder `<a>`, sobald es handelbar ist, und eine Option muss selbst das fokussierbare Element sein, ohne interaktive Nachfahren.',
    ja: 'リストは `listbox`、各行は `option` です。だから行は意図的に ListItem の上に作られていません。ListItem は操作可能になった途端 `<button>` か `<a>` になりますが、option 自身がフォーカス可能な要素であり、内部に対話要素を持てないからです。',
    pt: 'A lista é uma `listbox` e cada linha uma `option`, e é por isso que uma linha não é construída sobre ListItem: o ListItem torna-se `<button>` ou `<a>` assim que é acionável, e uma option tem de ser o próprio elemento focável, sem descendentes interativos.',
    zh: '列表是 `listbox`，每行是 `option`，这正是行刻意不基于 ListItem 构建的原因：ListItem 一旦可操作就会变成 `<button>` 或 `<a>`，而 option 必须自身就是可聚焦元素，且不能有交互式后代。',
    ar: 'القائمة `listbox` وكل صف `option`، ولهذا لا يُبنى الصف عمدًا على ListItem: يتحوّل ListItem إلى `<button>` أو `<a>` بمجرد أن يصير قابلًا للتفعيل، بينما يجب أن تكون الـoption نفسها العنصر القابل للتركيز بلا أحفاد تفاعليين.',
  },
  cvlA11y2: {
    en: 'Weight, glyphs and a badge are all invisible to a screen reader, and an abbreviated “Tue” is useless without its neighbours to read it against. Both are spelled out in a hidden phrase list per row, in the marker precedence order, alongside the unabbreviated timestamp.',
    es: 'El peso, los glifos y una insignia son invisibles para un lector de pantalla, y un «mar» abreviado es inútil sin vecinos con los que compararlo. Ambos se deletrean en una lista de frases oculta por fila, en el orden de precedencia de marcadores, junto a la marca de tiempo sin abreviar.',
    fr: 'La graisse, les glyphes et un badge sont invisibles pour un lecteur d’écran, et un « mar. » abrégé est inutile sans voisins pour le situer. Les deux sont énoncés dans une liste de phrases masquée par rangée, dans l’ordre de précédence des marqueurs, avec l’horodatage non abrégé.',
    de: 'Schriftstärke, Zeichen und ein Badge sind für einen Screenreader unsichtbar, und ein abgekürztes „Di“ ist ohne Nachbarn nutzlos. Beides wird pro Zeile in einer verborgenen Phrasenliste ausgeschrieben, in der Präzedenzreihenfolge der Marken, samt unabgekürztem Zeitstempel.',
    ja: '太さ、字形、バッジは読み上げには見えず、略された「火」は隣と比べられなければ役に立ちません。どちらも行ごとの隠し文リストに、マーカーの優先順で、略さない日時とともに書き出されます。',
    pt: 'Peso, glifos e um selo são invisíveis para um leitor de ecrã, e um «ter» abreviado é inútil sem vizinhos com que o comparar. Ambos são soletrados numa lista de frases escondida por linha, na ordem de precedência dos marcadores, junto do carimbo temporal por extenso.',
    zh: '字重、字形和徽章对屏幕阅读器都是不可见的，而缩写的“周二”在没有相邻行可对照时毫无用处。两者都会在每行一份隐藏短语列表中写全，按标记优先级顺序排列，并附上未缩写的时间戳。',
    ar: 'الثقل والرموز والشارة كلها غير مرئية لقارئ الشاشة، و«الثلاثاء» المختصر بلا جيران يقارن بهم عديم الفائدة. يُكتب الاثنان صراحةً في قائمة عبارات مخفية لكل صف، بترتيب أولوية العلامات، مع الوقت غير المختصر.',
  },
  cvlA11y3: {
    en: '`aria-posinset` and `aria-setsize` are counted against the FULL flattened order across sections, so a pinned row is “1 of 20” and not “1 of 3” — and a future window of 20 rows out of 5,000 will still announce “142 of 5000”.',
    es: '`aria-posinset` y `aria-setsize` se cuentan sobre el orden aplanado COMPLETO entre secciones: una fila fijada es «1 de 20» y no «1 de 3», y una futura ventana de 20 filas de 5000 seguirá anunciando «142 de 5000».',
    fr: '`aria-posinset` et `aria-setsize` sont comptés sur l’ordre aplati COMPLET, toutes sections confondues : une rangée épinglée est « 1 sur 20 » et non « 1 sur 3 » — et une future fenêtre de 20 rangées sur 5 000 annoncera toujours « 142 sur 5000 ».',
    de: '`aria-posinset` und `aria-setsize` zählen gegen die VOLLE abgeflachte Reihenfolge über die Sektionen hinweg: eine angeheftete Zeile ist „1 von 20“, nicht „1 von 3“ — und ein künftiges Fenster von 20 aus 5.000 Zeilen sagt weiterhin „142 von 5000“.',
    ja: '`aria-posinset` と `aria-setsize` はセクションをまたいだ「全体」の平坦な順序に対して数えられます。ピン留めの行は「1/3」ではなく「1/20」で、将来 5,000 行のうち 20 行だけを描画しても「142/5000」と読み上げられます。',
    pt: '`aria-posinset` e `aria-setsize` são contados contra a ordem achatada COMPLETA entre secções, pelo que uma linha fixada é «1 de 20» e não «1 de 3» — e uma futura janela de 20 linhas em 5000 continuará a anunciar «142 de 5000».',
    zh: '`aria-posinset` 与 `aria-setsize` 是按跨分区的完整扁平顺序计数的，所以置顶行是“第 1 项，共 20 项”而不是“共 3 项”——将来在 5000 行中只渲染 20 行时，依然会播报“第 142 项，共 5000 项”。',
    ar: 'يُحسب `aria-posinset` و`aria-setsize` مقابل الترتيب المسطّح الكامل عبر الأقسام، فالصف المثبّت هو «1 من 20» لا «1 من 3» — ونافذة مستقبلية من 20 صفًا بين 5000 ستظل تعلن «142 من 5000».',
  },
  cvlA11y4: {
    en: 'The unread badge is `aria-hidden` inside the row. CounterBadge is a live region of its own, and inside an option it would announce the count a second time — the phrase list already carries it.',
    es: 'La insignia de no leídos es `aria-hidden` dentro de la fila. CounterBadge es una región viva propia y, dentro de una option, anunciaría el recuento por segunda vez: la lista de frases ya lo lleva.',
    fr: 'Le badge de non-lus est `aria-hidden` dans la rangée. CounterBadge est une région live à part entière et, à l’intérieur d’une option, annoncerait le compte une seconde fois — la liste de phrases le porte déjà.',
    de: 'Das Ungelesen-Badge ist in der Zeile `aria-hidden`. CounterBadge ist eine eigene Live-Region und würde in einer Option die Zahl ein zweites Mal ansagen — die Phrasenliste trägt sie bereits.',
    ja: '未読バッジは行の中で `aria-hidden` です。CounterBadge は自前のライブリージョンで、option の中では件数を二度読み上げてしまいます。文リストがすでに伝えています。',
    pt: 'O selo de não lidos é `aria-hidden` dentro da linha. O CounterBadge é uma região viva por si só e, dentro de uma option, anunciaria a contagem uma segunda vez — a lista de frases já a carrega.',
    zh: '未读徽章在行内是 `aria-hidden`。CounterBadge 自身就是一个实时区域，放在 option 内会把计数再播报一次——短语列表已经带上了它。',
    ar: 'شارة غير المقروء `aria-hidden` داخل الصف. فـCounterBadge منطقة حيّة بذاتها، وداخل option ستعلن العدد مرة ثانية — وقائمة العبارات تحمله أصلًا.',
  },

  // ---- usage ---------------------------------------------------------------
  cvlUse1: {
    en: 'Sort the array yourself. The list preserves the order you give it inside each section, because the order a chat app wants — most recent activity — is a thing only the app knows.',
    es: 'Ordena tú el array. La lista conserva el orden que le des dentro de cada sección, porque el orden que quiere una app de chat —actividad más reciente— solo lo sabe la app.',
    fr: 'Triez le tableau vous-même. La liste préserve l’ordre que vous donnez à l’intérieur de chaque section, car l’ordre qu’une app de discussion veut — l’activité la plus récente — n’est connu que d’elle.',
    de: 'Sortiere das Array selbst. Die Liste bewahrt die übergebene Reihenfolge innerhalb jeder Sektion, denn die Reihenfolge, die eine Chat-App will — jüngste Aktivität — kennt nur die App.',
    ja: '配列は自分で並べ替えてください。リストは各セクション内で渡された順序を保ちます。チャットアプリが望む「最近の活動順」を知っているのはアプリだけだからです。',
    pt: 'Ordene o array você mesmo. A lista preserva a ordem que lhe der dentro de cada secção, porque a ordem que uma app de conversas quer — atividade mais recente — só a app a conhece.',
    zh: '请自行排序数组。列表会在每个分区内保持你给定的顺序，因为聊天应用想要的顺序——最近活动——只有应用自己知道。',
    ar: 'رتّب المصفوفة بنفسك. تحافظ القائمة على الترتيب الذي تعطيه داخل كل قسم، لأن الترتيب الذي يريده تطبيق المحادثة — النشاط الأحدث — لا يعرفه إلا التطبيق.',
  },
  cvlUse2: {
    en: 'Leave `selectionFollowsFocus` off unless opening a thread is free. Opening one costs a fetch and a scroll position, so it should take a deliberate Enter rather than happening while you look for something.',
    es: 'Deja `selectionFollowsFocus` desactivado salvo que abrir un hilo sea gratis. Abrirlo cuesta una petición y una posición de desplazamiento, así que debería requerir un Enter deliberado y no pasar mientras buscas algo.',
    fr: 'Laissez `selectionFollowsFocus` désactivé sauf si ouvrir un fil est gratuit. L’ouvrir coûte une requête et une position de défilement : cela doit demander un Entrée délibéré plutôt que d’arriver pendant qu’on cherche.',
    de: 'Lass `selectionFollowsFocus` aus, außer das Öffnen eines Threads ist kostenlos. Es kostet einen Fetch und eine Scrollposition, sollte also ein bewusstes Enter verlangen statt beim Suchen zu passieren.',
    ja: 'スレッドを開くコストがゼロでない限り `selectionFollowsFocus` はオフのままに。開くたびに取得とスクロール位置を消費するので、探している最中に起きるのではなく、意図的な Enter を要求すべきです。',
    pt: 'Deixe `selectionFollowsFocus` desligado a menos que abrir um tópico seja gratuito. Abrir um custa um pedido e uma posição de deslocamento, por isso deve exigir um Enter deliberado em vez de acontecer enquanto se procura.',
    zh: '除非打开会话没有代价，否则请保持 `selectionFollowsFocus` 关闭。打开一个会话要付出一次拉取和一处滚动位置，因此它应当由一次明确的 Enter 触发，而不是在你找东西时顺带发生。',
    ar: 'اترك `selectionFollowsFocus` مطفأً إلا إذا كان فتح المحادثة مجانيًا. فتحها يكلّف طلبًا وموضع تمرير، فينبغي أن يتطلّب Enter متعمّدًا بدل أن يحدث وأنت تبحث.',
  },
  cvlUse3: {
    en: 'Mark the region around `ConversationSkeleton` `aria-busy` rather than labelling every placeholder. The bones are decorative and hidden, so the wait is announced once instead of once per row.',
    es: 'Marca la región alrededor de `ConversationSkeleton` como `aria-busy` en vez de etiquetar cada marcador. Los huesos son decorativos y están ocultos, así la espera se anuncia una vez y no una por fila.',
    fr: 'Marquez la région autour de `ConversationSkeleton` en `aria-busy` plutôt que d’étiqueter chaque espace réservé. Les os sont décoratifs et masqués : l’attente est annoncée une fois et non une fois par rangée.',
    de: 'Markiere den Bereich um `ConversationSkeleton` als `aria-busy`, statt jeden Platzhalter zu beschriften. Die Knochen sind dekorativ und verborgen, sodass das Warten einmal angesagt wird statt einmal pro Zeile.',
    ja: 'すべてのプレースホルダーにラベルを付けるのではなく、`ConversationSkeleton` を囲む領域に `aria-busy` を付けてください。骨は装飾で隠されているので、待機は行ごとではなく一度だけ伝わります。',
    pt: 'Marque a região à volta do `ConversationSkeleton` como `aria-busy` em vez de rotular cada marcador. Os ossos são decorativos e escondidos, por isso a espera é anunciada uma vez e não uma por linha.',
    zh: '给包住 `ConversationSkeleton` 的区域加 `aria-busy`，而不是给每个占位符加标签。骨架是装饰性且被隐藏的，这样等待只播报一次，而不是每行一次。',
    ar: 'ضع `aria-busy` على المنطقة المحيطة بـ`ConversationSkeleton` بدل تسمية كل عنصر نائب. العظام زخرفية ومخفية، فيُعلن الانتظار مرة واحدة لا مرة لكل صف.',
  },
  cvlUse4: {
    en: 'Turning windowing on later is a change of inputs, not of API: rows already come from `items`, every row height is derived from the density step, the tree already emits the two struts, and `conversationWindow()` already does the arithmetic. Feed it the ScrollArea viewport’s `scrollTop` and `clientHeight` and nothing else has to move.',
    es: 'Activar el ventanado más adelante es un cambio de entradas, no de API: las filas ya salen de `items`, la altura de cada fila deriva del paso de densidad, el árbol ya emite los dos puntales y `conversationWindow()` ya hace la aritmética. Dale el `scrollTop` y el `clientHeight` del viewport del ScrollArea y no hay que mover nada más.',
    fr: 'Activer le fenêtrage plus tard est un changement d’entrées, pas d’API : les rangées viennent déjà de `items`, chaque hauteur découle du palier de densité, l’arbre émet déjà les deux entretoises, et `conversationWindow()` fait déjà le calcul. Donnez-lui le `scrollTop` et le `clientHeight` du viewport de la ScrollArea et rien d’autre ne bouge.',
    de: 'Windowing später einzuschalten ist eine Änderung der Eingaben, nicht der API: Zeilen kommen bereits aus `items`, jede Zeilenhöhe folgt der Dichtestufe, der Baum gibt bereits die zwei Streben aus, und `conversationWindow()` rechnet bereits. Gib ihm `scrollTop` und `clientHeight` des ScrollArea-Viewports, und sonst muss nichts umziehen.',
    ja: '後からウィンドウイングを有効にするのは API ではなく入力の変更です。行はすでに `items` から来て、行の高さは密度段階から導かれ、ツリーはすでに 2 本のストラットを出し、`conversationWindow()` はすでに計算を持っています。ScrollArea のビューポートの `scrollTop` と `clientHeight` を渡すだけで、ほかは何も動かす必要がありません。',
    pt: 'Ligar o janelamento mais tarde é uma mudança de entradas, não de API: as linhas já vêm de `items`, cada altura deriva do passo de densidade, a árvore já emite os dois espaçadores, e `conversationWindow()` já faz a aritmética. Dê-lhe o `scrollTop` e o `clientHeight` do viewport da ScrollArea e mais nada tem de mexer.',
    zh: '以后开启窗口化只是换输入，而不是换 API：行本来就来自 `items`，每行高度由密度档位推导，树里本来就发出了两根撑条，`conversationWindow()` 也已经算好了。把 ScrollArea 视口的 `scrollTop` 和 `clientHeight` 喂给它，其他什么都不用动。',
    ar: 'تشغيل النوافذ لاحقًا تغييرٌ في المدخلات لا في الواجهة: الصفوف تأتي أصلًا من `items`، وارتفاع كل صف مشتق من درجة الكثافة، والشجرة تُصدر الدعامتين أصلًا، و`conversationWindow()` يقوم بالحساب أصلًا. أعطه `scrollTop` و`clientHeight` لمنفذ عرض ScrollArea ولن يحتاج شيء آخر للتغيير.',
  },

  // ---- props ---------------------------------------------------------------
  cvlPropItem: { en: 'The conversation this row shows, plus the avatar node the row cannot build for itself.', es: 'La conversación que muestra la fila, más el nodo de avatar que la fila no puede construir.', fr: 'La conversation affichée par la rangée, plus le nœud d’avatar qu’elle ne peut pas construire.', de: 'Das Gespräch, das die Zeile zeigt, samt dem Avatar-Knoten, den sie nicht selbst bauen kann.', ja: 'この行が示す会話と、行が自分では組み立てられないアバターノード。', pt: 'A conversa que a linha mostra, mais o nó de avatar que a linha não consegue construir.', zh: '该行展示的会话，以及行自身无法构建的头像节点。', ar: 'المحادثة التي يعرضها الصف، مع عقدة الصورة التي لا يستطيع بناءها بنفسه.' },
  cvlPropDensity: { en: 'How tightly the row is packed.', es: 'Cuán compacta va la fila.', fr: 'La densité de la rangée.', de: 'Wie dicht die Zeile gepackt ist.', ja: '行の詰め具合。', pt: 'Quão compacta a linha é.', zh: '该行的紧凑程度。', ar: 'مدى تراصّ الصف.' },
  cvlPropSelected: { en: 'This is the open conversation.', es: 'Esta es la conversación abierta.', fr: 'C’est la conversation ouverte.', de: 'Dies ist das geöffnete Gespräch.', ja: 'これが開いている会話です。', pt: 'Esta é a conversa aberta.', zh: '这是当前打开的会话。', ar: 'هذه هي المحادثة المفتوحة.' },
  cvlPropOnSelect: { en: 'Called with the conversation id when the row is activated.', es: 'Se llama con el id de la conversación al activar la fila.', fr: 'Appelé avec l’id de la conversation quand la rangée est activée.', de: 'Wird mit der Gesprächs-ID aufgerufen, wenn die Zeile aktiviert wird.', ja: '行が実行されたとき、会話の id とともに呼ばれます。', pt: 'Chamado com o id da conversa quando a linha é ativada.', zh: '行被激活时以会话 id 调用。', ar: 'يُستدعى بمعرّف المحادثة عند تفعيل الصف.' },
  cvlPropPosInSet: { en: '1-based position in the FULL flattened list, so a windowed list still counts right.', es: 'Posición (desde 1) en la lista aplanada COMPLETA, para que una lista con ventanas siga contando bien.', fr: 'Position (base 1) dans la liste aplatie COMPLÈTE, pour qu’une liste fenêtrée compte juste.', de: '1-basierte Position in der VOLLEN abgeflachten Liste, damit eine gefensterte Liste richtig zählt.', ja: '「全体」の平坦なリストにおける 1 起点の位置。ウィンドウ化しても数が合います。', pt: 'Posição (base 1) na lista achatada COMPLETA, para uma lista janelada continuar a contar bem.', zh: '在完整扁平列表中的位置（从 1 开始），使窗口化列表仍能正确计数。', ar: 'الموضع (يبدأ من 1) في القائمة المسطّحة الكاملة، لتظل القائمة المنوفذة تعدّ بشكل صحيح.' },
  cvlPropSetSize: { en: 'Length of the FULL flattened list, for the same reason.', es: 'Longitud de la lista aplanada COMPLETA, por lo mismo.', fr: 'Longueur de la liste aplatie COMPLÈTE, pour la même raison.', de: 'Länge der VOLLEN abgeflachten Liste, aus demselben Grund.', ja: '同じ理由で、「全体」の平坦なリストの長さ。', pt: 'Comprimento da lista achatada COMPLETA, pela mesma razão.', zh: '完整扁平列表的长度，理由同上。', ar: 'طول القائمة المسطّحة الكاملة، للسبب نفسه.' },
  cvlPropNow: { en: 'Instant the timestamps are read against; injectable so a list renders deterministically.', es: 'Instante contra el que se leen las marcas de tiempo; inyectable para que la lista renderice de forma determinista.', fr: 'Instant de référence des horodatages ; injectable pour un rendu déterministe.', de: 'Bezugsmoment der Zeitstempel; injizierbar für deterministisches Rendern.', ja: 'タイムスタンプを読む基準の時刻。決定的に描画できるよう注入できます。', pt: 'Instante contra o qual os carimbos são lidos; injetável para um render determinista.', zh: '时间戳的比较基准时刻；可注入以获得确定性渲染。', ar: 'اللحظة التي تُقرأ الأوقات مقابلها؛ قابلة للحقن ليكون العرض حتميًا.' },
  cvlPropLocale: { en: 'BCP-47 tag for the timestamp formatter.', es: 'Etiqueta BCP-47 para el formateador de marcas de tiempo.', fr: 'Balise BCP-47 pour le formateur d’horodatage.', de: 'BCP-47-Tag für den Zeitstempel-Formatierer.', ja: 'タイムスタンプ整形用の BCP-47 タグ。', pt: 'Etiqueta BCP-47 para o formatador de carimbos.', zh: '时间戳格式化器使用的 BCP-47 标签。', ar: 'وسم BCP-47 لمنسّق الوقت.' },
  cvlPropLabels: { en: 'Translated strings; merged over the shared English defaults.', es: 'Cadenas traducidas; se fusionan sobre los valores en inglés compartidos.', fr: 'Chaînes traduites ; fusionnées par-dessus les valeurs anglaises partagées.', de: 'Übersetzte Zeichenketten; über die geteilten englischen Vorgaben gelegt.', ja: '翻訳文字列。共有の英語既定値の上にマージされます。', pt: 'Cadeias traduzidas; fundidas sobre os valores ingleses partilhados.', zh: '译文字符串；合并在共享的英文默认值之上。', ar: 'نصوص مترجمة؛ تُدمج فوق القيم الإنجليزية المشتركة.' },
  cvlPropSkeletonRow: { en: 'Loads every part as its own placeholder, keeping the row’s exact geometry.', es: 'Carga cada parte como su propio marcador, conservando la geometría exacta de la fila.', fr: 'Charge chaque partie en espace réservé propre, en gardant la géométrie exacte de la rangée.', de: 'Lädt jeden Teil als eigenen Platzhalter und behält die exakte Zeilengeometrie.', ja: '各部分を独立したプレースホルダーにし、行の寸法をそのまま保ちます。', pt: 'Carrega cada parte como o seu próprio marcador, mantendo a geometria exata da linha.', zh: '把每个部件作为各自的占位符加载，保持该行确切的几何。', ar: 'يحمّل كل جزء كعنصر نائب مستقل مع الحفاظ على هندسة الصف تمامًا.' },

  cvlPropItems: { en: 'The conversations, in the order they should read within their section. Data, not children.', es: 'Las conversaciones, en el orden en que deben leerse dentro de su sección. Datos, no hijos.', fr: 'Les conversations, dans l’ordre de lecture au sein de leur section. Des données, pas des enfants.', de: 'Die Gespräche in ihrer Lesereihenfolge innerhalb der Sektion. Daten, keine Children.', ja: 'セクション内で読まれるべき順の会話。children ではなくデータです。', pt: 'As conversas, pela ordem em que devem ser lidas dentro da secção. Dados, não filhos.', zh: '会话，按各自分区内应读出的顺序。是数据，不是 children。', ar: 'المحادثات بالترتيب الذي تُقرأ به داخل قسمها. بيانات لا أبناء.' },
  cvlPropValue: { en: 'Controlled id of the open conversation.', es: 'Id controlado de la conversación abierta.', fr: 'Id contrôlé de la conversation ouverte.', de: 'Kontrollierte ID des geöffneten Gesprächs.', ja: '開いている会話の制御された id。', pt: 'Id controlado da conversa aberta.', zh: '当前打开会话的受控 id。', ar: 'معرّف المحادثة المفتوحة (مُتحكَّم به).' },
  cvlPropDefaultValue: { en: 'Initially open conversation when uncontrolled.', es: 'Conversación abierta al inicio cuando no está controlada.', fr: 'Conversation ouverte au départ en mode non contrôlé.', de: 'Anfangs geöffnetes Gespräch im unkontrollierten Modus.', ja: '非制御時に最初から開いている会話。', pt: 'Conversa aberta inicialmente quando não controlada.', zh: '非受控时初始打开的会话。', ar: 'المحادثة المفتوحة ابتداءً في الوضع غير المتحكَّم.' },
  cvlPropOnValueChange: { en: 'Called with the id when a different conversation is opened.', es: 'Se llama con el id al abrir otra conversación.', fr: 'Appelé avec l’id quand une autre conversation est ouverte.', de: 'Wird mit der ID aufgerufen, wenn ein anderes Gespräch geöffnet wird.', ja: '別の会話が開かれたとき、その id とともに呼ばれます。', pt: 'Chamado com o id quando outra conversa é aberta.', zh: '打开另一个会话时以其 id 调用。', ar: 'يُستدعى بالمعرّف عند فتح محادثة أخرى.' },
  cvlPropGrouped: { en: 'Splits pinned conversations into their own section.', es: 'Separa las conversaciones fijadas en su propia sección.', fr: 'Sépare les conversations épinglées dans leur propre section.', de: 'Trennt angeheftete Gespräche in eine eigene Sektion.', ja: 'ピン留めした会話を独立したセクションに分けます。', pt: 'Separa as conversas fixadas na sua própria secção.', zh: '把置顶会话拆到独立分区。', ar: 'يفصل المحادثات المثبّتة في قسم خاص بها.' },
  cvlPropFollowsFocus: { en: 'Opens each conversation as the arrows move through it. Off by default.', es: 'Abre cada conversación al recorrerla con las flechas. Desactivado por defecto.', fr: 'Ouvre chaque conversation au passage des flèches. Désactivé par défaut.', de: 'Öffnet jedes Gespräch, während die Pfeile darüber wandern. Standardmäßig aus.', ja: '矢印で移動するたびに会話を開きます。既定はオフ。', pt: 'Abre cada conversa à medida que as setas passam por ela. Desligado por omissão.', zh: '方向键经过时即打开该会话。默认关闭。', ar: 'يفتح كل محادثة أثناء مرور الأسهم عليها. مطفأ افتراضيًا.' },
  cvlPropMaxHeight: { en: 'Caps the list and wraps it in a ScrollArea. That viewport is the scroll host.', es: 'Limita la lista y la envuelve en un ScrollArea. Ese viewport es el anfitrión del desplazamiento.', fr: 'Plafonne la liste et l’enveloppe dans une ScrollArea. Ce viewport est l’hôte du défilement.', de: 'Deckelt die Liste und hüllt sie in eine ScrollArea. Dieses Viewport ist der Scroll-Host.', ja: 'リストの高さを抑え、ScrollArea で包みます。そのビューポートがスクロールのホストです。', pt: 'Limita a lista e envolve-a numa ScrollArea. Esse viewport é o anfitrião do deslocamento.', zh: '给列表封顶并包进 ScrollArea。该视口即滚动宿主。', ar: 'يحدّ القائمة ويلفّها في ScrollArea. ذلك المنفذ هو مضيف التمرير.' },
  cvlPropEmpty: { en: 'Rendered in place of the sections when there is nothing to list.', es: 'Se renderiza en lugar de las secciones cuando no hay nada que listar.', fr: 'Rendu à la place des sections quand il n’y a rien à lister.', de: 'Wird statt der Sektionen gerendert, wenn es nichts zu listen gibt.', ja: '並べるものがないとき、セクションの代わりに描画されます。', pt: 'Renderizado em vez das secções quando não há nada para listar.', zh: '没有内容可列时，取代分区渲染。', ar: 'يُعرض بدل الأقسام حين لا يوجد ما يُعرض.' },

  cvlPropSkCount: { en: 'How many placeholder rows to draw. Enough to fill a viewport, not to predict the list.', es: 'Cuántas filas de marcador dibujar. Las justas para llenar un viewport, no para predecir la lista.', fr: 'Combien de rangées d’espace réservé dessiner. De quoi remplir un viewport, pas prédire la liste.', de: 'Wie viele Platzhalterzeilen gezeichnet werden. Genug für ein Viewport, nicht um die Liste vorherzusagen.', ja: '描くプレースホルダー行の数。ビューポートを埋める分だけで、リストを予測する数ではありません。', pt: 'Quantas linhas de marcador desenhar. O suficiente para encher um viewport, não para prever a lista.', zh: '绘制多少行占位符。够填满一个视口即可，而不是去预测列表长度。', ar: 'كم صفًا نائبًا يُرسم. ما يكفي لملء منفذ العرض لا للتنبؤ بالقائمة.' },
  cvlPropSkDensity: { en: 'Matches the density the real list will use, so the rows are the right height.', es: 'Coincide con la densidad que usará la lista real, para que las filas tengan la altura correcta.', fr: 'Correspond à la densité qu’aura la vraie liste, pour que les rangées aient la bonne hauteur.', de: 'Entspricht der Dichte der echten Liste, damit die Zeilen die richtige Höhe haben.', ja: '実際のリストが使う密度に合わせ、行の高さを正しくします。', pt: 'Corresponde à densidade que a lista real vai usar, para as linhas terem a altura certa.', zh: '与真实列表将使用的密度一致，使行高正确。', ar: 'يطابق كثافة القائمة الحقيقية ليكون ارتفاع الصفوف صحيحًا.' },
});

/**
 * A fixed instant so every timestamp in this page is stable: a row from an hour
 * ago reads as a time, three days ago as a weekday, three weeks ago as a date.
 */
const NOW = new Date(Date.UTC(2026, 4, 12, 15, 30));
const MINUTES = (n: number) => new Date(NOW.getTime() - n * 60_000);
const DAYS = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

/** The row that carries every marker at once. */
function everythingItem(t: ReturnType<typeof useT>): ConversationItem {
  return {
    id: 'everything',
    name: 'Release 4.2',
    snippet: t(p.cvlSnipEverything),
    sender: 'Bo Chen',
    timestamp: MINUTES(4),
    unreadCount: 120,
    pinned: true,
    muted: true,
    draft: true,
    failed: true,
    avatar: <AvatarGroup avatars={[{ name: 'Bo Chen' }, { name: 'Ana Ruiz' }]} size="sm" />,
  };
}

/** The realistic sidebar, with its own selection state. */
function SidebarDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [open, setOpen] = useState('ana');

  const items: ConversationItem[] = [
    {
      id: 'release',
      name: 'Release 4.2',
      snippet: t(p.cvlSnip5),
      sender: 'Priya Raman',
      timestamp: MINUTES(9),
      unreadCount: 7,
      pinned: true,
      avatar: <AvatarGroup avatars={[{ name: 'Priya Raman' }, { name: 'Bo Chen' }, { name: 'Ana Ruiz' }]} size="sm" />,
    },
    {
      id: 'ana',
      name: 'Ana Ruiz',
      snippet: t(p.cvlSnip1),
      timestamp: MINUTES(41),
      avatar: <Avatar name="Ana Ruiz" size="md" />,
    },
    {
      id: 'bo',
      name: 'Bo Chen',
      snippet: t(p.cvlSnip2),
      timestamp: MINUTES(126),
      unreadCount: 3,
      avatar: <Avatar name="Bo Chen" size="md" />,
    },
    {
      id: 'design',
      name: 'Design weekly',
      snippet: t(p.cvlSnip3),
      sender: 'Lena Fischer',
      timestamp: DAYS(2),
      unreadCount: 148,
      muted: true,
      avatar: <AvatarGroup avatars={[{ name: 'Lena Fischer' }, { name: 'Mira Kovač' }]} size="sm" />,
    },
    {
      id: 'tomas',
      name: 'Tomás Vidal',
      snippet: t(p.cvlSnip4),
      timestamp: DAYS(3),
      draft: true,
      avatar: <Avatar name="Tomás Vidal" size="md" />,
    },
    {
      id: 'billing',
      name: 'Billing',
      snippet: t(p.cvlSnip6),
      timestamp: DAYS(21),
      failed: true,
      avatar: <Avatar name="Billing" size="md" />,
    },
  ];

  return (
    <div style={{ width: '100%', minWidth: 0, maxWidth: '26rem' }}>
      <K.ConversationList items={items} value={open} onValueChange={setOpen} now={NOW} />
    </div>
  );
}

export function ConversationListPage() {
  const t = useT();
  const everything = everythingItem(t);

  return (
    <>
      <Heading level={1}>{t(p.cvlName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(p.cvlLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(p.cvlAnatomy))}</Text>
      <Heading level={3}>ConversationListItem</Heading>
      <ComponentBlueprint specId="conversation-list-item" />
      <Heading level={3}>ConversationList</Heading>
      <ComponentBlueprint specId="conversation-list" />
      <Heading level={3}>ConversationSkeleton</Heading>
      <ComponentBlueprint specId="conversation-skeleton" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(p.cvlExSidebarTitle)}
        description={prose(t(p.cvlExSidebarDesc))}
        component="ConversationList"
        platformLayout="stacked"
        render={(K) => <SidebarDemo K={K} />}
        code={`import { ConversationList, Avatar, AvatarGroup } from '@glacier/react';

const items = [
  { id: 'release', name: 'Release 4.2', snippet: '…', sender: 'Priya Raman',
    timestamp: t1, unreadCount: 7, pinned: true, avatar: <AvatarGroup avatars={members} size="sm" /> },
  { id: 'ana',     name: 'Ana Ruiz',    snippet: '…', timestamp: t2, avatar: <Avatar name="Ana Ruiz" /> },
  { id: 'bo',      name: 'Bo Chen',     snippet: '…', timestamp: t3, unreadCount: 3, avatar: … },
  { id: 'design',  name: 'Design weekly', snippet: '…', timestamp: t4, unreadCount: 148, muted: true, avatar: … },
  { id: 'tomas',   name: 'Tomás Vidal', snippet: '…', timestamp: t5, draft: true, avatar: … },
  { id: 'billing', name: 'Billing',     snippet: '…', timestamp: t6, failed: true, avatar: … },
];

<ConversationList items={items} value={open} onValueChange={setOpen} />`}
      />

      <Example
        title={t(p.cvlExEverythingTitle)}
        description={prose(t(p.cvlExEverythingDesc))}
        component="ConversationListItem"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={4} style={{ width: '100%', minWidth: 0, maxWidth: '26rem' }}>
            <List>
              <K.ConversationListItem item={everything} now={NOW} posInSet={1} setSize={1} />
            </List>
            <Row gap={2} wrap align="center">
              <Text as="span" size={Size.Small} tone={TextTone.Subtle}>
                {t(p.cvlExEverythingMarkers)}
              </Text>
              <Text as="span" size={Size.Small} tone={TextTone.Muted}>
                <code>{conversationMarkers(everything).join(', ')}</code>
              </Text>
            </Row>
            <Stack gap={1}>
              <Text as="span" size={Size.Small} tone={TextTone.Subtle}>
                {t(p.cvlExEverythingPhrases)}
              </Text>
              <Text as="span" size={Size.Small} tone={TextTone.Muted}>
                <code>{conversationStateLabels(everything, defaultConversationLabels).join('. ')}</code>
              </Text>
            </Stack>
          </Stack>
        )}
        code={`import { ConversationListItem } from '@glacier/react';
import { conversationMarkers, conversationStateLabels } from '@glacier/logic';

const item = {
  id: 'everything', name: 'Release 4.2', sender: 'Bo Chen', snippet: '…',
  timestamp: at, unreadCount: 120,
  pinned: true, muted: true, draft: true, failed: true,
};

<ConversationListItem item={item} posInSet={1} setSize={1} />

conversationMarkers(item);
// ['failed', 'draft', 'unread', 'muted', 'pinned'] — the precedence order

// All five reach a screen reader even though the prefix slot only paints one:
conversationStateLabels(item, labels);
// ['Not delivered', 'Draft', '99+ unread', 'Muted', 'Pinned']`}
      />

      <Example
        title={t(p.cvlExMutedTitle)}
        description={prose(t(p.cvlExMutedDesc))}
        component="ConversationListItem"
        platformLayout="stacked"
        render={(K) => (
          <div style={{ width: '100%', minWidth: 0, maxWidth: '26rem' }}>
            <List>
              <K.ConversationListItem
                item={{
                  id: 'loud',
                  name: 'Design weekly',
                  snippet: t(p.cvlSnip3),
                  sender: 'Lena Fischer',
                  timestamp: MINUTES(18),
                  unreadCount: 12,
                  avatar: <Avatar name="Design weekly" size="md" />,
                }}
                now={NOW}
              />
              <K.ConversationListItem
                item={{
                  id: 'quiet',
                  name: 'Design weekly',
                  snippet: t(p.cvlSnip3),
                  sender: 'Lena Fischer',
                  timestamp: MINUTES(18),
                  unreadCount: 12,
                  muted: true,
                  avatar: <Avatar name="Design weekly" size="md" />,
                }}
                now={NOW}
              />
            </List>
          </div>
        )}
        code={`// Identical rows but for one flag.
<ConversationListItem item={{ ...row, unreadCount: 12 }} />              // danger badge
<ConversationListItem item={{ ...row, unreadCount: 12, muted: true }} /> // neutral badge, same 12

// conversationBadge() decides it once, for both bindings:
//   tone: c.muted ? 'neutral' : 'danger'`}
      />

      <Example
        title={t(p.cvlExSkeletonTitle)}
        description={prose(t(p.cvlExSkeletonDesc))}
        component="ConversationSkeleton"
        platformLayout="stacked"
        render={(K) => (
          <Row gap={6} wrap align="start" style={{ width: '100%', minWidth: 0 }}>
            <div style={{ flex: '1 1 18rem', minWidth: 0 }} aria-busy="true">
              <K.ConversationSkeleton count={4} />
            </div>
            <div style={{ flex: '1 1 18rem', minWidth: 0 }}>
              <List>
                {['Ana Ruiz', 'Bo Chen', 'Priya Raman', 'Tomás Vidal'].map((name, index) => (
                  <K.ConversationListItem
                    key={name}
                    item={{
                      id: name,
                      name,
                      snippet: t(p.cvlSnip2),
                      timestamp: MINUTES(12 * (index + 1)),
                      unreadCount: index === 1 ? 4 : undefined,
                      avatar: <Avatar name={name} size="md" />,
                    }}
                    now={NOW}
                  />
                ))}
              </List>
            </div>
          </Row>
        )}
        code={`import { ConversationSkeleton, ConversationList } from '@glacier/react';

<div aria-busy={loading}>
  {loading
    ? <ConversationSkeleton count={6} />
    : <ConversationList items={items} />}
</div>

// Match the density, or the bones are the wrong height.
<ConversationSkeleton count={6} density="compact" />`}
      />

      <Example
        title={t(p.cvlExDensityTitle)}
        description={prose(t(p.cvlExDensityDesc))}
        component="ConversationList"
        platformLayout="stacked"
        render={(K) => (
          <Row gap={6} wrap align="start" style={{ width: '100%', minWidth: 0 }}>
            {(['compact', 'comfortable'] as const).map((density) => (
              <Stack key={density} gap={2} style={{ flex: '1 1 18rem', minWidth: 0 }}>
                <Text as="span" size={Size.Small} tone={TextTone.Muted}>
                  <code>{density}</code>
                </Text>
                <K.ConversationList
                  density={density}
                  grouped={false}
                  now={NOW}
                  items={[
                    {
                      id: `${density}-a`,
                      name: 'Ana Ruiz',
                      snippet: t(p.cvlSnip1),
                      timestamp: MINUTES(41),
                      unreadCount: 2,
                      avatar: <Avatar name="Ana Ruiz" size={density === 'compact' ? 'sm' : 'md'} />,
                    },
                    {
                      id: `${density}-b`,
                      name: 'Bo Chen',
                      snippet: t(p.cvlSnip2),
                      timestamp: DAYS(1),
                      avatar: <Avatar name="Bo Chen" size={density === 'compact' ? 'sm' : 'md'} />,
                    },
                  ]}
                />
              </Stack>
            ))}
          </Row>
        )}
        code={`<ConversationList items={items} density="compact" />
<ConversationList items={items} density="comfortable" />

// The row reads its own measurements from the spec:
conversationMetrics('compact');
// { height: 'control-height-lg', avatar: 'sm', badge: 'sm', … }`}
      />

      <Example
        title={t(p.cvlExScrollTitle)}
        description={prose(t(p.cvlExScrollDesc))}
        component="ConversationList"
        platformLayout="stacked"
        render={(K) => (
          <Row gap={6} wrap align="start" style={{ width: '100%', minWidth: 0 }}>
            <div style={{ flex: '1 1 18rem', minWidth: 0 }}>
              <K.ConversationList
                maxHeight={200}
                grouped={false}
                now={NOW}
                items={Array.from({ length: 12 }, (_, index) => ({
                  id: `scroll-${index}`,
                  name: `Thread ${index + 1}`,
                  snippet: t(p.cvlSnip4),
                  timestamp: MINUTES(6 * (index + 1)),
                  unreadCount: index % 4 === 0 ? index + 1 : undefined,
                  avatar: <Avatar name={`T ${index + 1}`} size="md" />,
                }))}
              />
            </div>
            <div style={{ flex: '1 1 14rem', minWidth: 0 }}>
              <K.ConversationList items={[]} empty={<Text tone={TextTone.Muted}>{t(p.cvlEmpty)}</Text>} />
            </div>
          </Row>
        )}
        code={`<ConversationList items={items} maxHeight={200} grouped={false} />

<ConversationList items={[]} empty={<Text tone={TextTone.Muted}>No conversations yet</Text>} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>ConversationListItem</Heading>
      <PropsTable
        props={[
          { name: 'item', type: 'ConversationItem', description: t(p.cvlPropItem) },
          { name: 'density', type: "'compact' | 'comfortable'", default: "'comfortable'", description: t(p.cvlPropDensity) },
          { name: 'selected', type: 'boolean', default: 'false', description: t(p.cvlPropSelected) },
          { name: 'onSelect', type: '(id: string) => void', description: t(p.cvlPropOnSelect) },
          { name: 'posInSet', type: 'number', description: t(p.cvlPropPosInSet) },
          { name: 'setSize', type: 'number', description: t(p.cvlPropSetSize) },
          { name: 'now', type: 'Date | number', description: t(p.cvlPropNow) },
          { name: 'locale', type: 'string', description: t(p.cvlPropLocale) },
          { name: 'labels', type: 'Partial<ConversationLabels>', description: t(p.cvlPropLabels) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.cvlPropSkeletonRow) },
        ]}
      />

      <Heading level={3}>ConversationList</Heading>
      <PropsTable
        props={[
          { name: 'items', type: 'readonly ConversationItem[]', description: t(p.cvlPropItems) },
          { name: 'value', type: 'string', description: t(p.cvlPropValue) },
          { name: 'defaultValue', type: 'string', description: t(p.cvlPropDefaultValue) },
          { name: 'onValueChange', type: '(id: string) => void', description: t(p.cvlPropOnValueChange) },
          { name: 'grouped', type: 'boolean', default: 'true', description: t(p.cvlPropGrouped) },
          { name: 'density', type: "'compact' | 'comfortable'", default: "'comfortable'", description: t(p.cvlPropDensity) },
          { name: 'selectionFollowsFocus', type: 'boolean', default: 'false', description: t(p.cvlPropFollowsFocus) },
          { name: 'maxHeight', type: 'number | string', description: t(p.cvlPropMaxHeight) },
          { name: 'empty', type: 'ReactNode', description: t(p.cvlPropEmpty) },
          { name: 'now', type: 'Date | number', description: t(p.cvlPropNow) },
          { name: 'locale', type: 'string', description: t(p.cvlPropLocale) },
          { name: 'labels', type: 'Partial<ConversationLabels>', description: t(p.cvlPropLabels) },
        ]}
      />

      <Heading level={3}>ConversationSkeleton</Heading>
      <PropsTable
        props={[
          { name: 'count', type: 'number', default: '6', description: t(p.cvlPropSkCount) },
          { name: 'density', type: "'compact' | 'comfortable'", default: "'comfortable'", description: t(p.cvlPropSkDensity) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(p.cvlA11y1))}</li>
        <li>{prose(t(p.cvlA11y2))}</li>
        <li>{prose(t(p.cvlA11y3))}</li>
        <li>{prose(t(p.cvlA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(p.cvlUse1))}</li>
        <li>{prose(t(p.cvlUse2))}</li>
        <li>{prose(t(p.cvlUse3))}</li>
        <li>{prose(t(p.cvlUse4))}</li>
      </ul>
    </>
  );
}
