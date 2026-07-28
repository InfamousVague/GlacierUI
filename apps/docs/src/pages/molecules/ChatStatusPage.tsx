import {
  Avatar,
  Button,
  Heading,
  Row,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import { nextConnection, type ConnectionState, type DeliveryStatus } from '@glacier/logic';
import { MoreVertical, Phone, Video } from '@glacier/icons';
import { useState, type ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * The chrome a transcript wears: how far a message got, who is typing, what the
 * room narrates about itself, what is being replied to, where a thread hangs,
 * who the conversation is with, and whether the socket is still there.
 *
 * Page strings are defined locally so the file compiles standalone; the handoff
 * lists every key for the integrator to fold into apps/docs/src/i18n.ts.
 */
const p = defineMessages({
  chsName: {
    en: 'Chat status & chrome', es: 'Estado y cromo del chat', fr: 'État et habillage du chat',
    de: 'Chat-Status & Rahmen', ja: 'チャットのステータスとクローム', pt: 'Estado e moldura do chat',
    zh: '聊天状态与外框', ar: 'حالة المحادثة وإطارها',
  },
  chsLede: {
    en: 'The seven small components that report on a conversation rather than carry it: the delivery mark beside a timestamp, the typing row, the lines the transcript writes about itself, the reply-context block, the thread footer, the bar above it all, and the strip that appears when the network goes.',
    es: 'Los siete componentes pequeños que informan sobre una conversación en lugar de transportarla: la marca de entrega junto a la marca de tiempo, la fila de escritura, las líneas que la transcripción escribe sobre sí misma, el bloque de contexto de respuesta, el pie de hilo, la barra sobre todo ello y la franja que aparece cuando se cae la red.',
    fr: 'Les sept petits composants qui rendent compte d’une conversation plutôt que de la porter : la marque de remise à côté de l’horodatage, la ligne de saisie, les lignes que la transcription écrit sur elle-même, le bloc de contexte de réponse, le pied de fil, la barre au-dessus de tout cela, et le bandeau qui apparaît quand le réseau tombe.',
    de: 'Die sieben kleinen Komponenten, die über ein Gespräch berichten, statt es zu tragen: die Zustellmarke neben dem Zeitstempel, die Tippzeile, die Zeilen, die das Protokoll über sich selbst schreibt, der Antwortkontext-Block, die Thread-Fußzeile, die Leiste über allem und der Streifen, der erscheint, wenn das Netz weg ist.',
    ja: '会話を運ぶのではなく、会話について報告する 7 つの小さなコンポーネント。タイムスタンプの横の配信マーク、入力中の行、トランスクリプトが自身について書く行、返信コンテキストのブロック、スレッドのフッター、その上のバー、そしてネットワークが切れたときに現れる帯。',
    pt: 'Os sete pequenos componentes que relatam uma conversa em vez de a transportar: a marca de entrega junto do carimbo temporal, a linha de digitação, as linhas que a transcrição escreve sobre si mesma, o bloco de contexto de resposta, o rodapé do tópico, a barra acima de tudo e a faixa que aparece quando a rede cai.',
    zh: '这七个小组件报告一场对话，而不是承载它：时间戳旁的送达标记、正在输入行、记录为自身书写的行、回复上下文块、话题页脚、位于最上方的标题栏，以及网络断开时出现的横幅。',
    ar: 'المكوّنات الصغيرة السبعة التي تُبلّغ عن المحادثة بدل أن تحملها: علامة التسليم بجانب الوقت، وصف الكتابة، والأسطر التي تكتبها المحادثة عن نفسها، وكتلة سياق الرد، وتذييل المحادثة الفرعية، والشريط فوق كل ذلك، والشريط الذي يظهر عند انقطاع الشبكة.',
  },
  chsAnatomy: {
    en: 'Seven contracts, each measured from its own spec. Every shape table — which glyph a delivery state draws, which glyph a system line draws, which glyph a connection state draws — lives in `@glacier/logic`, so the two bindings cannot draw two different clocks.',
    es: 'Siete contratos, cada uno medido desde su propia especificación. Cada tabla de formas — qué glifo dibuja un estado de entrega, un mensaje del sistema o un estado de conexión — vive en `@glacier/logic`, de modo que las dos vinculaciones no pueden dibujar dos relojes distintos.',
    fr: 'Sept contrats, chacun mesuré depuis sa propre spécification. Chaque table de formes — quel glyphe dessine un état de remise, une ligne système, un état de connexion — vit dans `@glacier/logic`, si bien que les deux liaisons ne peuvent pas dessiner deux horloges différentes.',
    de: 'Sieben Kontrakte, jeder aus seiner eigenen Spezifikation vermessen. Jede Formtabelle — welches Zeichen ein Zustellstatus, eine Systemzeile, ein Verbindungszustand zeichnet — liegt in `@glacier/logic`, damit die zwei Bindungen nicht zwei verschiedene Uhren zeichnen.',
    ja: '7 つの契約は、それぞれ自身の spec から採寸されています。どの字形を描くかという表（配信状態、システム行、接続状態）はすべて `@glacier/logic` にあり、2 つのバインディングが別々の時計を描くことはできません。',
    pt: 'Sete contratos, cada um medido a partir da sua própria especificação. Cada tabela de formas — que glifo desenha um estado de entrega, uma linha de sistema, um estado de ligação — vive em `@glacier/logic`, pelo que as duas ligações não podem desenhar dois relógios diferentes.',
    zh: '七份契约，各自依据自身规格量取。每一张形状表——送达状态、系统行、连接状态各画哪个字形——都放在 `@glacier/logic` 中，因此两个绑定不可能画出两只不同的时钟。',
    ar: 'سبعة عقود، كلٌّ مقيس من مواصفته الخاصة. كل جدول أشكال — أي رمز ترسمه حالة التسليم أو سطر النظام أو حالة الاتصال — موجود في `@glacier/logic`، فلا يمكن للربطين رسم ساعتين مختلفتين.',
  },

  // ---- DeliveryStatus ------------------------------------------------------
  chsExDeliveryTitle: {
    en: 'Five states, five silhouettes', es: 'Cinco estados, cinco siluetas', fr: 'Cinq états, cinq silhouettes',
    de: 'Fünf Zustände, fünf Silhouetten', ja: '5 つの状態、5 つのシルエット', pt: 'Cinco estados, cinco silhuetas',
    zh: '五种状态，五种轮廓', ar: 'خمس حالات، خمسة أشكال',
  },
  chsExDeliveryDesc: {
    en: 'A clock, one tick, two ticks, a tick inside a solid disc, a warning triangle. No two share an outline, and `read` differs from `delivered` by fill as well as hue. Colour is layered on top for the two states worth spending it on — never underneath as the only signal.',
    es: 'Un reloj, una marca, dos marcas, una marca dentro de un disco sólido, un triángulo de aviso. No hay dos que compartan contorno, y `read` se distingue de `delivered` por el relleno además del tono. El color se superpone solo en los dos estados que lo merecen, nunca como única señal.',
    fr: 'Une horloge, une coche, deux coches, une coche dans un disque plein, un triangle d’avertissement. Aucun contour n’est partagé, et `read` diffère de `delivered` par le remplissage autant que par la teinte. La couleur se pose par-dessus pour les deux états qui la méritent — jamais dessous comme unique signal.',
    de: 'Eine Uhr, ein Haken, zwei Haken, ein Haken in einer vollen Scheibe, ein Warndreieck. Keine zwei teilen sich eine Kontur, und `read` unterscheidet sich von `delivered` durch die Füllung ebenso wie durch den Farbton. Farbe liegt obenauf für die zwei Zustände, die sie wert sind — nie darunter als einziges Signal.',
    ja: '時計、チェック 1 つ、チェック 2 つ、塗りつぶした円の中のチェック、警告の三角。輪郭が重なるものはひとつもなく、`read` は `delivered` と色相だけでなく塗りでも異なります。色は価値のある 2 つの状態にだけ重ねられ、唯一の信号として下敷きにはなりません。',
    pt: 'Um relógio, um visto, dois vistos, um visto dentro de um disco sólido, um triângulo de aviso. Nenhum par partilha contorno, e `read` difere de `delivered` no preenchimento além do tom. A cor assenta por cima nos dois estados que a merecem — nunca por baixo como único sinal.',
    zh: '时钟、一个勾、两个勾、实心圆盘中的勾、警告三角。没有两者共用轮廓，`read` 与 `delivered` 除色相外还在填充上不同。颜色只叠加在值得的两种状态之上，绝不作为唯一信号垫在下面。',
    ar: 'ساعة، وعلامة واحدة، وعلامتان، وعلامة داخل قرص مصمت، ومثلث تحذير. لا يتشارك اثنان في الحدّ الخارجي، و`read` يختلف عن `delivered` بالتعبئة كما باللون. اللون يُضاف فوق الحالتين الجديرتين به — لا تحته كإشارة وحيدة.',
  },
  chsExGreyTitle: {
    en: 'The same row, desaturated', es: 'La misma fila, desaturada', fr: 'La même rangée, désaturée',
    de: 'Dieselbe Zeile, entsättigt', ja: '同じ行を彩度ゼロで', pt: 'A mesma linha, dessaturada',
    zh: '同一行，去色后', ar: 'الصف نفسه بلا ألوان',
  },
  chsExGreyDesc: {
    en: 'The claim is checkable, not asserted: this pane is the row above with a greyscale filter over it. Every state is still tellable apart, which is what a monochrome display, a colour-blind reader, and a phone in sunlight all reduce the mark to.',
    es: 'La afirmación se comprueba, no se declara: este panel es la fila anterior con un filtro de escala de grises encima. Cada estado sigue distinguiéndose, que es a lo que reducen la marca una pantalla monocroma, una persona con daltonismo y un teléfono a pleno sol.',
    fr: 'L’affirmation se vérifie, elle ne se décrète pas : ce panneau est la rangée ci-dessus avec un filtre en niveaux de gris. Chaque état reste distinguable, ce à quoi un écran monochrome, un lecteur daltonien et un téléphone en plein soleil réduisent tous la marque.',
    de: 'Die Behauptung ist prüfbar, nicht behauptet: dieses Feld ist die Zeile darüber mit einem Graustufenfilter. Jeder Zustand bleibt unterscheidbar — und genau darauf reduzieren ein monochromes Display, ein farbenblinder Leser und ein Handy in der Sonne die Marke.',
    ja: '主張は宣言ではなく検証できます。このペインは上の行にグレースケールのフィルターをかけたものです。それでも各状態は見分けられます。モノクロ画面、色覚特性のある読み手、日なたのスマートフォンは、いずれもこの印をそこまで削ぎ落とします。',
    pt: 'A afirmação é verificável, não declarada: este painel é a linha acima com um filtro em tons de cinzento. Todos os estados continuam distinguíveis, que é ao que um ecrã monocromático, um leitor daltónico e um telemóvel ao sol reduzem a marca.',
    zh: '这个主张可以核对，而不是空口断言：本窗格就是上一行加了灰度滤镜。每种状态仍可区分——单色屏幕、色觉障碍读者以及阳光下的手机，都会把这个标记削减到这个程度。',
    ar: 'الادعاء قابل للفحص لا مجرد تأكيد: هذه اللوحة هي الصف أعلاه مع مرشّح تدرّج رمادي. تبقى كل حالة مميّزة، وهو ما تختزل إليه العلامةَ الشاشةُ أحاديةُ اللون والقارئُ المصاب بعمى الألوان والهاتفُ تحت الشمس.',
  },
  chsExRunTitle: {
    en: 'A run reports its least advanced message', es: 'Una serie informa de su mensaje menos avanzado', fr: 'Une série rapporte son message le moins avancé',
    de: 'Eine Folge meldet ihre am wenigsten fortgeschrittene Nachricht', ja: '連続した送信は最も進んでいないものを示す', pt: 'Uma sequência reporta a sua mensagem menos avançada',
    zh: '一串消息汇报其中最落后的一条', ar: 'المجموعة تُبلّغ عن أقل رسائلها تقدّمًا',
  },
  chsExRunDesc: {
    en: 'Pass `statuses` instead of `status` and a stack of messages collapses to the least advanced of them, so a run holding one failed send says failed rather than claiming the "read" of whichever message happened to be last.',
    es: 'Pasa `statuses` en lugar de `status` y una pila de mensajes se reduce al menos avanzado, de modo que una serie con un envío fallido dice fallido en vez de reclamar el «leído» del último mensaje que caiga.',
    fr: 'Passez `statuses` au lieu de `status` et une pile de messages se réduit au moins avancé : une série contenant un envoi échoué dit échoué plutôt que de revendiquer le « lu » du dernier message venu.',
    de: 'Übergib `statuses` statt `status`, und ein Stapel Nachrichten fällt auf die am wenigsten fortgeschrittene zusammen: Eine Folge mit einem fehlgeschlagenen Versand sagt fehlgeschlagen, statt das „Gelesen“ der zufällig letzten Nachricht zu behaupten.',
    ja: '`status` の代わりに `statuses` を渡すと、メッセージの束は最も進んでいない状態にまとめられます。送信失敗をひとつ含む連なりは「既読」ではなく失敗と表示されます。',
    pt: 'Passe `statuses` em vez de `status` e uma pilha de mensagens reduz-se à menos avançada, pelo que uma sequência com um envio falhado diz falhado em vez de reclamar o «lido» da mensagem que calhou ser a última.',
    zh: '传 `statuses` 而不是 `status`，一叠消息会收敛到其中最落后的状态：包含一条发送失败的连续消息会显示失败，而不是拿恰好最后一条的“已读”来充数。',
    ar: 'مرّر `statuses` بدل `status` فتنهار مجموعة الرسائل إلى أقلّها تقدّمًا: مجموعة تضم إرسالًا فاشلًا تقول فشل بدل ادّعاء «مقروء» لآخر رسالة صادفت أن تكون الأخيرة.',
  },

  // ---- TypingIndicator -----------------------------------------------------
  chsExTypingTitle: {
    en: 'One, two, and many typists', es: 'Uno, dos y muchos escribiendo', fr: 'Un, deux, et beaucoup de rédacteurs',
    de: 'Ein, zwei und viele Schreibende', ja: '入力者が 1 人、2 人、大勢', pt: 'Um, dois e muitos a digitar',
    zh: '一人、两人与多人正在输入', ar: 'كاتب واحد، اثنان، وكثيرون',
  },
  chsExTypingDesc: {
    en: 'The sentence comes from `typingText` in `@glacier/logic` and the words from the kit catalog, joined by `Intl.ListFormat` — so no English is built in and the list reads correctly in every locale. Past `max` names the row spends its last slot on a count. The dots are decoration: under reduced motion they stop dead, because the words were always the content.',
    es: 'La frase viene de `typingText` en `@glacier/logic` y las palabras del catálogo del kit, unidas por `Intl.ListFormat`: no hay inglés incrustado y la lista se lee bien en cada idioma. Pasado `max`, la fila gasta su último hueco en un recuento. Los puntos son decoración: con movimiento reducido se detienen, porque el contenido siempre fueron las palabras.',
    fr: 'La phrase vient de `typingText` dans `@glacier/logic` et les mots du catalogue du kit, joints par `Intl.ListFormat` — aucun anglais n’est intégré et la liste se lit correctement dans chaque langue. Au-delà de `max` noms, la rangée dépense son dernier emplacement en compteur. Les points sont décoratifs : en mouvement réduit ils s’arrêtent net, car le contenu a toujours été les mots.',
    de: 'Der Satz kommt aus `typingText` in `@glacier/logic`, die Wörter aus dem Kit-Katalog, verbunden per `Intl.ListFormat` — kein Englisch ist eingebaut und die Liste liest sich in jeder Sprache richtig. Jenseits von `max` Namen gibt die Zeile ihren letzten Platz für eine Zahl aus. Die Punkte sind Dekoration: bei reduzierter Bewegung stehen sie still, denn der Inhalt waren immer die Wörter.',
    ja: '文は `@glacier/logic` の `typingText`、語は kit のカタログから来て、`Intl.ListFormat` で連結されます。英語は埋め込まれておらず、どのロケールでも正しく読めます。`max` を超えると最後の枠を人数の表示に使います。ドットは装飾で、視差効果を減らす設定では完全に止まります。内容は常に文だからです。',
    pt: 'A frase vem de `typingText` em `@glacier/logic` e as palavras do catálogo do kit, unidas por `Intl.ListFormat` — não há inglês embutido e a lista lê-se bem em cada idioma. Passado `max` nomes, a linha gasta o último lugar numa contagem. Os pontos são decoração: com movimento reduzido param por completo, porque o conteúdo sempre foram as palavras.',
    zh: '句子来自 `@glacier/logic` 的 `typingText`，词句来自套件目录，由 `Intl.ListFormat` 连接——没有内嵌英文，任何语言下都读得通。超过 `max` 个名字后，该行把最后一个位置用于计数。圆点只是装饰：在减弱动效下它们完全静止，因为内容一直是那句话。',
    ar: 'الجملة تأتي من `typingText` في `@glacier/logic` والكلمات من فهرس العدّة، وتُوصل بـ`Intl.ListFormat` — فلا إنجليزية مضمّنة وتُقرأ القائمة صحيحة في كل لغة. بعد `max` اسمًا يُنفق الصف خانته الأخيرة على عدد. النقاط زينة: مع تقليل الحركة تتوقف تمامًا، لأن المحتوى كان دائمًا الكلمات.',
  },

  // ---- SystemMessage -------------------------------------------------------
  chsExSystemTitle: {
    en: 'The transcript narrating itself', es: 'La transcripción narrándose a sí misma', fr: 'La transcription se racontant elle-même',
    de: 'Das Protokoll erzählt sich selbst', ja: 'トランスクリプトが自らを語る', pt: 'A transcrição a narrar-se a si própria',
    zh: '记录为自身作旁白', ar: 'المحادثة تروي نفسها',
  },
  chsExSystemDesc: {
    en: 'Joins, leaves, topic changes, ended calls. It looks exactly like a labelled divider and is deliberately not one: `role="separator"` would make a screen reader announce "separator" and skip the sentence, which is backwards — the words are the content and the centring is the decoration.',
    es: 'Entradas, salidas, cambios de tema, llamadas terminadas. Parece un divisor etiquetado y a propósito no lo es: `role="separator"` haría que un lector de pantalla anunciara «separador» y saltara la frase, lo cual está al revés: las palabras son el contenido y el centrado es la decoración.',
    fr: 'Arrivées, départs, changements de sujet, appels terminés. Cela ressemble à un séparateur étiqueté et n’en est délibérément pas un : `role="separator"` ferait annoncer « séparateur » puis sauter la phrase, ce qui est à l’envers — les mots sont le contenu, le centrage la décoration.',
    de: 'Beitritte, Austritte, Themenwechsel, beendete Anrufe. Es sieht aus wie ein beschrifteter Trenner und ist bewusst keiner: `role="separator"` ließe einen Screenreader „Trenner“ ansagen und den Satz überspringen — verkehrt herum, denn die Wörter sind der Inhalt und die Zentrierung die Dekoration.',
    ja: '参加、退出、トピックの変更、終了した通話。ラベル付きの区切り線に見えますが、意図的にそうではありません。`role="separator"` にすると読み上げは「区切り」と言って文を飛ばします。逆です。内容は文であり、中央揃えのほうが装飾です。',
    pt: 'Entradas, saídas, mudanças de tópico, chamadas terminadas. Parece um divisor rotulado e deliberadamente não o é: `role="separator"` faria um leitor de ecrã anunciar «separador» e saltar a frase, o que é ao contrário — as palavras são o conteúdo e a centragem é a decoração.',
    zh: '加入、离开、主题变更、通话结束。它看起来就像带标签的分隔线，但刻意不是：`role="separator"` 会让屏幕阅读器念“分隔符”并跳过这句话，这就本末倒置了——文字才是内容，居中只是装饰。',
    ar: 'انضمام ومغادرة وتغيير موضوع ومكالمات منتهية. يبدو تمامًا كفاصل معنون وهو عمدًا ليس كذلك: `role="separator"` سيجعل قارئ الشاشة يعلن «فاصل» ويتخطى الجملة، وهذا معكوس — الكلمات هي المحتوى والتوسيط هو الزينة.',
  },

  // ---- QuotedMessage -------------------------------------------------------
  chsExQuotedTitle: {
    en: 'Reply context', es: 'Contexto de la respuesta', fr: 'Contexte de réponse',
    de: 'Antwortkontext', ja: '返信のコンテキスト', pt: 'Contexto da resposta',
    zh: '回复上下文', ar: 'سياق الرد',
  },
  chsExQuotedDesc: {
    en: 'The snippet is cut in the STRING at 100 characters, by the same truncation a conversation row uses, so what a screen reader reads matches what the eye sees. Pressability is all-or-nothing: with a handler it is a real button whose name says where it goes, without one it is an inert box with no focus stop.',
    es: 'El fragmento se recorta en la CADENA a 100 caracteres, con el mismo truncado que usa una fila de conversación, así lo que lee un lector de pantalla coincide con lo que ve el ojo. La pulsabilidad es todo o nada: con manejador es un botón real cuyo nombre dice a dónde lleva; sin él es una caja inerte sin parada de foco.',
    fr: 'L’extrait est coupé dans la CHAÎNE à 100 caractères, par la même troncature qu’une ligne de conversation, si bien que ce que lit un lecteur d’écran correspond à ce que voit l’œil. La pressabilité est tout ou rien : avec un gestionnaire c’est un vrai bouton dont le nom dit où il mène, sans lui c’est une boîte inerte sans arrêt de focus.',
    de: 'Der Ausschnitt wird im STRING bei 100 Zeichen geschnitten, mit derselben Kürzung wie eine Konversationszeile, damit gelesen wird, was zu sehen ist. Drückbarkeit ist alles oder nichts: mit Handler ein echter Button, dessen Name sagt, wohin er führt; ohne ihn eine träge Box ohne Fokusstopp.',
    ja: '抜粋は会話行と同じ切り詰めで、文字列そのものが 100 文字で切られます。読み上げられる内容と目に見える内容が一致します。押せるかどうかは全か無かで、ハンドラがあれば行き先を名前で告げる本物のボタン、なければフォーカス停止のない不活性な箱です。',
    pt: 'O excerto é cortado na STRING aos 100 caracteres, pelo mesmo truncamento que uma linha de conversa usa, pelo que o que um leitor de ecrã lê coincide com o que o olho vê. A pressionabilidade é tudo ou nada: com handler é um botão real cujo nome diz para onde vai, sem ele é uma caixa inerte sem paragem de foco.',
    zh: '摘录在字符串层面按 100 个字符截断，用的是会话行同一套截断规则，因此屏幕阅读器读到的与眼睛看到的一致。可按压性是全有或全无：有处理函数时它是真正的按钮，名称说明去向；没有时它是没有焦点停靠点的惰性方块。',
    ar: 'يُقصّ المقتطف في النص نفسه عند 100 حرف، بالاقتطاع ذاته الذي يستخدمه صف المحادثة، فيتطابق ما يقرؤه قارئ الشاشة مع ما تراه العين. القابلية للضغط كلٌّ أو لا شيء: مع معالج هو زر حقيقي يقول اسمه إلى أين يذهب، ودونه صندوق خامل بلا محطة تركيز.',
  },

  // ---- ThreadIndicator -----------------------------------------------------
  chsExThreadTitle: {
    en: 'Thread footer', es: 'Pie de hilo', fr: 'Pied de fil',
    de: 'Thread-Fußzeile', ja: 'スレッドのフッター', pt: 'Rodapé do tópico',
    zh: '话题页脚', ar: 'تذييل المحادثة الفرعية',
  },
  chsExThreadDesc: {
    en: 'One button, not a row of them: the faces are decorative — their names are already inside the thread — so the whole strip is a single target named by its count and time. The count is real text rather than a badge, and unread is carried by weight as well as colour so it survives greyscale.',
    es: 'Un botón, no una fila: las caras son decorativas —sus nombres ya están dentro del hilo—, así que toda la franja es un único objetivo nombrado por su recuento y su hora. El recuento es texto real, no una insignia, y lo no leído se marca con peso además de color, para sobrevivir a la escala de grises.',
    fr: 'Un bouton, pas une rangée : les visages sont décoratifs — leurs noms sont déjà dans le fil — donc toute la bande est une cible unique nommée par son compte et son heure. Le compte est du vrai texte plutôt qu’un badge, et le non-lu passe par la graisse autant que par la couleur, pour survivre aux niveaux de gris.',
    de: 'Ein Button, keine Reihe davon: die Gesichter sind dekorativ — ihre Namen stehen schon im Thread — also ist der ganze Streifen ein Ziel, benannt nach Anzahl und Zeit. Die Anzahl ist echter Text statt eines Badges, und Ungelesenes trägt Schriftstärke ebenso wie Farbe, damit es Graustufen übersteht.',
    ja: 'ボタンはひとつで、並びではありません。顔は装飾です（名前はスレッドの中にあります）。帯全体がひとつのターゲットで、件数と時刻がその名前になります。件数はバッジではなく本物のテキストで、未読は色だけでなく太さでも示すのでグレースケールでも残ります。',
    pt: 'Um botão, não uma fila deles: os rostos são decorativos — os seus nomes já estão dentro do tópico — pelo que toda a faixa é um alvo único nomeado pela contagem e pela hora. A contagem é texto real em vez de um selo, e o não lido é dado por peso além de cor, para sobreviver a tons de cinzento.',
    zh: '只有一个按钮，而不是一排：头像是装饰性的——他们的名字本来就在话题里面——所以整条是单一目标，名称由回复数与时间构成。回复数是真正的文本而非徽章，未读同时用字重和颜色表示，因此在灰度下依然成立。',
    ar: 'زر واحد لا صف من الأزرار: الوجوه زخرفية — أسماؤها موجودة أصلًا داخل المحادثة — فالشريط كله هدف واحد يسمّيه عدده ووقته. العدد نص حقيقي لا شارة، وغير المقروء يُحمل بالثقل كما باللون فيبقى في التدرّج الرمادي.',
  },

  // ---- ChatHeader ----------------------------------------------------------
  chsExHeaderTitle: {
    en: 'The bar above a conversation', es: 'La barra sobre una conversación', fr: 'La barre au-dessus d’une conversation',
    de: 'Die Leiste über einem Gespräch', ja: '会話の上のバー', pt: 'A barra acima de uma conversa',
    zh: '会话上方的标题栏', ar: 'الشريط أعلى المحادثة',
  },
  chsExHeaderDesc: {
    en: 'Avatar, title, a presence line under it, trailing actions. It is not a PageHeader preset: a conversation name is long and arbitrary so the title truncates on one line rather than growing the bar, and the call buttons stay on the trailing edge at every width, because a header that reflows pushes the transcript down mid-scroll.',
    es: 'Avatar, título, una línea de presencia debajo y acciones al final. No es un preajuste de PageHeader: el nombre de una conversación es largo y arbitrario, así que el título se recorta en una línea en vez de crecer la barra, y los botones de llamada se quedan en el borde final a cualquier anchura, porque una cabecera que se reajusta empuja la transcripción hacia abajo mientras se desplaza.',
    fr: 'Avatar, titre, une ligne de présence en dessous, actions en fin de ligne. Ce n’est pas un préréglage de PageHeader : un nom de conversation est long et arbitraire, donc le titre se tronque sur une ligne au lieu d’agrandir la barre, et les boutons d’appel restent au bord final à toute largeur, car un en-tête qui se réagence pousse la transcription vers le bas en plein défilement.',
    de: 'Avatar, Titel, eine Präsenzzeile darunter, Aktionen am Ende. Kein PageHeader-Preset: ein Gesprächsname ist lang und beliebig, also kürzt der Titel auf einer Zeile, statt die Leiste wachsen zu lassen, und die Anrufbuttons bleiben bei jeder Breite am Endrand, denn ein umbrechender Header schiebt das Protokoll mitten im Scrollen nach unten.',
    ja: 'アバター、タイトル、その下の在席行、末尾のアクション。PageHeader のプリセットではありません。会話名は長く任意なのでタイトルはバーを伸ばさず 1 行で省略し、通話ボタンはどの幅でも末尾に留まります。折り返すヘッダーはスクロール中にトランスクリプトを押し下げてしまうからです。',
    pt: 'Avatar, título, uma linha de presença por baixo, ações à direita. Não é uma predefinição de PageHeader: o nome de uma conversa é longo e arbitrário, por isso o título trunca numa linha em vez de aumentar a barra, e os botões de chamada ficam na margem final em qualquer largura, porque um cabeçalho que reflui empurra a transcrição para baixo a meio do deslocamento.',
    zh: '头像、标题、下方的在线状态行、尾部操作。它不是 PageHeader 的预设：会话名称既长又任意，所以标题在一行内截断而不是撑高整条栏；通话按钮在任何宽度下都留在尾边，因为会重排的标题栏会在滚动途中把记录往下推。',
    ar: 'صورة رمزية وعنوان وسطر حضور تحته وإجراءات في الطرف. ليس إعدادًا مسبقًا لـPageHeader: اسم المحادثة طويل وعشوائي فيُقتطع العنوان في سطر واحد بدل تكبير الشريط، وتبقى أزرار الاتصال على الحافة الأخيرة عند كل عرض، لأن رأسًا يعيد الترتيب يدفع المحادثة للأسفل أثناء التمرير.',
  },

  // ---- ConnectionBanner ----------------------------------------------------
  chsExConnTitle: {
    en: 'Offline, reconnecting, reconnected', es: 'Sin conexión, reconectando, reconectado', fr: 'Hors ligne, reconnexion, reconnecté',
    de: 'Offline, verbindet neu, wieder verbunden', ja: 'オフライン、再接続中、復帰', pt: 'Offline, a reconectar, reconectado',
    zh: '离线、重连中、已恢复', ar: 'غير متصل، يعيد الاتصال، عاد الاتصال',
  },
  chsExConnDesc: {
    en: 'A preset of Banner, not a second banner. What it adds is the three things Banner cannot know: which tone and glyph each state paints, that the recovery confirmation dismisses itself after a dwell, and that only offline is worth interrupting a screen reader for. `online` renders nothing at all.',
    es: 'Un preajuste de Banner, no un segundo banner. Añade las tres cosas que Banner no puede saber: qué tono y glifo pinta cada estado, que la confirmación de recuperación se descarta sola tras una espera, y que solo «sin conexión» merece interrumpir a un lector de pantalla. `online` no renderiza nada.',
    fr: 'Un préréglage de Banner, pas un second bandeau. Il ajoute les trois choses que Banner ne peut pas savoir : quels ton et glyphe chaque état peint, que la confirmation de reprise se retire seule après un délai, et que seul « hors ligne » mérite d’interrompre un lecteur d’écran. `online` ne rend rien du tout.',
    de: 'Ein Preset von Banner, kein zweites Banner. Es ergänzt die drei Dinge, die Banner nicht wissen kann: welchen Ton und welches Zeichen jeder Zustand malt, dass die Wiederherstellungsbestätigung sich nach einer Verweildauer selbst schließt, und dass nur Offline es wert ist, einen Screenreader zu unterbrechen. `online` rendert gar nichts.',
    ja: 'Banner のプリセットであって 2 つ目の Banner ではありません。Banner が知り得ない 3 点を足します。各状態が塗るトーンと字形、復帰の確認が一定時間で自ら消えること、そして読み上げを遮る価値があるのはオフラインだけであること。`online` は何も描画しません。',
    pt: 'Uma predefinição de Banner, não um segundo banner. Acrescenta as três coisas que o Banner não pode saber: que tom e glifo cada estado pinta, que a confirmação de recuperação se dispensa sozinha após uma pausa, e que só offline merece interromper um leitor de ecrã. `online` não renderiza nada.',
    zh: '它是 Banner 的预设，而不是第二个 Banner。它补上 Banner 无从知晓的三件事：每种状态画什么色调与字形、恢复确认会在停留一段时间后自行消失、以及只有离线值得打断屏幕阅读器。`online` 完全不渲染。',
    ar: 'إعداد مسبق لـBanner، لا شريط ثانٍ. يضيف الأمور الثلاثة التي لا يعرفها Banner: أي نبرة ورمز ترسمهما كل حالة، وأن تأكيد التعافي يزيل نفسه بعد مهلة، وأن غير المتصل وحده يستحق مقاطعة قارئ الشاشة. و`online` لا يعرض شيئًا.',
  },
  chsExConnMachineTitle: {
    en: 'The lifecycle, driven by the state machine', es: 'El ciclo de vida, guiado por la máquina de estados', fr: 'Le cycle de vie, piloté par la machine à états',
    de: 'Der Lebenszyklus, gesteuert vom Automaten', ja: 'ステートマシンが動かすライフサイクル', pt: 'O ciclo de vida, guiado pela máquina de estados',
    zh: '由状态机驱动的生命周期', ar: 'دورة الحياة تقودها آلة الحالات',
  },
  chsExConnMachineDesc: {
    en: 'Feed events through `nextConnection` from `@glacier/logic`. The rule worth spelling out is that `restored` from a healthy connection stays `online`: transports fire it on their very first successful open, and a "Back online" for a drop that never happened trains people to ignore the banner that matters. Press Restored first to see nothing happen.',
    es: 'Pasa los eventos por `nextConnection` de `@glacier/logic`. La regla que conviene explicitar es que `restored` desde una conexión sana sigue en `online`: los transportes lo emiten en su primera apertura correcta, y un «De nuevo en línea» por una caída que nunca ocurrió enseña a ignorar el banner que sí importa. Pulsa primero Restored para ver que no pasa nada.',
    fr: 'Faites passer les événements par `nextConnection` de `@glacier/logic`. La règle à énoncer : `restored` depuis une connexion saine reste `online` — les transports l’émettent dès leur première ouverture réussie, et un « De nouveau en ligne » pour une coupure qui n’a jamais eu lieu apprend à ignorer le bandeau qui compte. Appuyez d’abord sur Restored pour voir qu’il ne se passe rien.',
    de: 'Ereignisse laufen durch `nextConnection` aus `@glacier/logic`. Die Regel, die es auszuformulieren lohnt: `restored` bei gesunder Verbindung bleibt `online` — Transporte feuern es beim allerersten erfolgreichen Öffnen, und ein „Wieder online“ für einen Ausfall, den es nie gab, erzieht dazu, das wichtige Banner zu ignorieren. Drück zuerst Restored, und es passiert nichts.',
    ja: 'イベントは `@glacier/logic` の `nextConnection` を通します。明記すべき規則は、正常な接続からの `restored` は `online` のままだということ。トランスポートは最初の接続成功時にもこれを発火し、起きていない切断への「オンラインに戻りました」は、本当に大事な通知を無視する習慣を作ります。まず Restored を押すと何も起きません。',
    pt: 'Passe os eventos por `nextConnection` de `@glacier/logic`. A regra que vale explicitar é que `restored` a partir de uma ligação saudável continua `online`: os transportes disparam-no na primeira abertura bem-sucedida, e um «De volta online» para uma queda que nunca houve ensina a ignorar o banner que interessa. Carregue primeiro em Restored para ver que nada acontece.',
    zh: '事件经由 `@glacier/logic` 的 `nextConnection` 处理。值得明说的规则是：健康连接上的 `restored` 仍保持 `online`——传输层在第一次成功连接时就会触发它，而为从未发生的断线弹出“已恢复连接”，只会训练用户忽略真正重要的横幅。先按 Restored，什么都不会发生。',
    ar: 'مرّر الأحداث عبر `nextConnection` من `@glacier/logic`. القاعدة الجديرة بالتوضيح أن `restored` من اتصال سليم يبقى `online`: تُطلقه وسائل النقل عند أول فتح ناجح، و«عاد الاتصال» لانقطاع لم يحدث يدرّب الناس على تجاهل الشريط المهم. اضغط Restored أولًا ولن يحدث شيء.',
  },
  chsConnEventLost: { en: 'Lost', es: 'Caída', fr: 'Perdue', de: 'Verloren', ja: '切断', pt: 'Perdida', zh: '断开', ar: 'انقطع' },
  chsConnEventRetry: { en: 'Retry', es: 'Reintento', fr: 'Nouvel essai', de: 'Erneut', ja: '再試行', pt: 'Nova tentativa', zh: '重试', ar: 'إعادة' },
  chsConnEventRestored: { en: 'Restored', es: 'Restaurada', fr: 'Rétablie', de: 'Wiederhergestellt', ja: '復旧', pt: 'Restaurada', zh: '恢复', ar: 'استُعيد' },
  chsConnCurrent: {
    en: 'Current state: {state}', es: 'Estado actual: {state}', fr: 'État actuel : {state}',
    de: 'Aktueller Zustand: {state}', ja: '現在の状態: {state}', pt: 'Estado atual: {state}',
    zh: '当前状态：{state}', ar: 'الحالة الحالية: {state}',
  },

  // ---- demo copy -----------------------------------------------------------
  chsDemoSubtitle: {
    en: 'Online · last seen just now', es: 'En línea · visto ahora mismo', fr: 'En ligne · vu à l’instant',
    de: 'Online · zuletzt gerade eben', ja: 'オンライン・たった今', pt: 'Online · visto agora mesmo',
    zh: '在线 · 刚刚活跃', ar: 'متصل · شوهد للتو',
  },
  chsDemoJoined: {
    en: 'Bo Chen joined the conversation', es: 'Bo Chen se unió a la conversación', fr: 'Bo Chen a rejoint la conversation',
    de: 'Bo Chen ist dem Gespräch beigetreten', ja: 'Bo Chen が会話に参加しました', pt: 'Bo Chen entrou na conversa',
    zh: 'Bo Chen 加入了会话', ar: 'انضم Bo Chen إلى المحادثة',
  },
  chsDemoLeft: {
    en: 'Priya Raman left', es: 'Priya Raman salió', fr: 'Priya Raman est partie',
    de: 'Priya Raman hat das Gespräch verlassen', ja: 'Priya Raman が退出しました', pt: 'Priya Raman saiu',
    zh: 'Priya Raman 已离开', ar: 'غادر Priya Raman',
  },
  chsDemoTopic: {
    en: 'Topic changed to “Release 4.2”', es: 'Tema cambiado a «Versión 4.2»', fr: 'Sujet changé en « Version 4.2 »',
    de: 'Thema geändert zu „Release 4.2“', ja: 'トピックが「リリース 4.2」に変更されました', pt: 'Tópico alterado para «Versão 4.2»',
    zh: '主题已更改为“4.2 版发布”', ar: 'تغيّر الموضوع إلى «الإصدار 4.2»',
  },
  chsDemoCall: {
    en: 'Call ended · 12 min', es: 'Llamada finalizada · 12 min', fr: 'Appel terminé · 12 min',
    de: 'Anruf beendet · 12 Min', ja: '通話終了・12 分', pt: 'Chamada terminada · 12 min',
    zh: '通话结束 · 12 分钟', ar: 'انتهت المكالمة · 12 دقيقة',
  },
  chsDemoInfo: {
    en: 'Messages in this conversation are end-to-end encrypted', es: 'Los mensajes de esta conversación están cifrados de extremo a extremo', fr: 'Les messages de cette conversation sont chiffrés de bout en bout',
    de: 'Nachrichten in diesem Gespräch sind Ende-zu-Ende verschlüsselt', ja: 'この会話のメッセージはエンドツーエンドで暗号化されています', pt: 'As mensagens desta conversa são cifradas ponta a ponta',
    zh: '本会话中的消息经过端到端加密', ar: 'رسائل هذه المحادثة مشفّرة طرفًا لطرف',
  },
  chsDemoQuote: {
    en: 'Can you take another look at the migration script before we ship it on Friday? The rollback path is the part I am least sure about.',
    es: '¿Puedes revisar otra vez el script de migración antes de publicarlo el viernes? La ruta de reversión es la parte que menos me convence.',
    fr: 'Peux-tu revoir le script de migration avant la mise en production de vendredi ? C’est le chemin de retour arrière dont je suis le moins sûr.',
    de: 'Kannst du dir das Migrationsskript noch einmal ansehen, bevor wir es Freitag ausliefern? Beim Rollback-Pfad bin ich am unsichersten.',
    ja: '金曜に出す前に、マイグレーションのスクリプトをもう一度見てもらえますか。ロールバックの経路がいちばん自信がありません。',
    pt: 'Podes rever o script de migração antes de o lançarmos na sexta? O caminho de reversão é a parte de que estou menos seguro.',
    zh: '周五发布之前你能再看一遍迁移脚本吗？我最没把握的是回滚路径。',
    ar: 'هل يمكنك مراجعة سكربت الترحيل مرة أخرى قبل إطلاقه يوم الجمعة؟ مسار التراجع هو الجزء الأقل ثقةً لديّ.',
  },
  chsDemoQuotePhoto: {
    en: 'Photo', es: 'Foto', fr: 'Photo', de: 'Foto', ja: '写真', pt: 'Foto', zh: '照片', ar: 'صورة',
  },
  chsDemoQuoteInert: {
    en: 'Inert — no handler, so no focus stop', es: 'Inerte: sin manejador, sin parada de foco', fr: 'Inerte — pas de gestionnaire, donc pas d’arrêt de focus',
    de: 'Träge — kein Handler, also kein Fokusstopp', ja: '不活性 — ハンドラなし、フォーカス停止なし', pt: 'Inerte — sem handler, logo sem paragem de foco',
    zh: '惰性——没有处理函数，因此没有焦点停靠点', ar: 'خامل — بلا معالج، فلا محطة تركيز',
  },

  // ---- accessibility -------------------------------------------------------
  chsA11y1: {
    en: '`DeliveryStatus` and `ConnectionBanner` both name their state in words. The tick is `role="img"` with the status as its label, not a live region — a transcript holds hundreds of these, and hundreds of live regions would re-read the conversation every time a receipt landed.',
    es: '`DeliveryStatus` y `ConnectionBanner` nombran su estado con palabras. La marca es `role="img"` con el estado como etiqueta, no una región viva: una transcripción tiene cientos, y cientos de regiones vivas releerían la conversación con cada acuse.',
    fr: '`DeliveryStatus` et `ConnectionBanner` nomment tous deux leur état en mots. La coche est `role="img"` avec l’état pour libellé, pas une région live — une transcription en contient des centaines, et autant de régions live reliraient la conversation à chaque accusé.',
    de: '`DeliveryStatus` und `ConnectionBanner` benennen ihren Zustand in Worten. Der Haken ist `role="img"` mit dem Status als Label, keine Live-Region — ein Protokoll enthält Hunderte davon, und Hunderte Live-Regionen läsen das Gespräch bei jedem Empfangsbeleg neu vor.',
    ja: '`DeliveryStatus` と `ConnectionBanner` はどちらも状態を言葉で名乗ります。チェックはライブリージョンではなく、状態をラベルに持つ `role="img"` です。トランスクリプトには数百個あり、数百のライブリージョンは受信通知のたびに会話を読み直してしまいます。',
    pt: '`DeliveryStatus` e `ConnectionBanner` nomeiam ambos o seu estado por palavras. O visto é `role="img"` com o estado como rótulo, não uma região viva — uma transcrição tem centenas destes, e centenas de regiões vivas releriam a conversa a cada recibo.',
    zh: '`DeliveryStatus` 与 `ConnectionBanner` 都用文字说出自己的状态。勾号是以状态为标签的 `role="img"`，而不是实时区域——一份记录里有数百个，数百个实时区域会在每次回执到达时重念整段会话。',
    ar: '`DeliveryStatus` و`ConnectionBanner` يسمّيان حالتهما بالكلمات. العلامة هي `role="img"` واسمها الحالة، لا منطقة حيّة — تحوي المحادثة مئات منها، ومئات المناطق الحيّة ستعيد قراءة المحادثة مع كل إشعار.',
  },
  chsA11y2: {
    en: '`TypingIndicator` fires its live region on the rising edge only. The sentence captured when typing begins is held while anyone is still typing, so a second person joining changes the visible text without re-firing the region; stopping clears it, which announces nothing.',
    es: '`TypingIndicator` dispara su región viva solo en el flanco de subida. La frase capturada al empezar se mantiene mientras alguien siga escribiendo, así que una segunda persona cambia el texto visible sin volver a disparar la región; al parar se vacía, lo que no anuncia nada.',
    fr: '`TypingIndicator` déclenche sa région live uniquement sur le front montant. La phrase capturée au début est maintenue tant que quelqu’un écrit, donc l’arrivée d’une deuxième personne change le texte visible sans redéclencher la région ; l’arrêt la vide, ce qui n’annonce rien.',
    de: '`TypingIndicator` feuert seine Live-Region nur an der steigenden Flanke. Der beim Beginn erfasste Satz wird gehalten, solange jemand tippt — eine zweite Person ändert also den sichtbaren Text, ohne die Region erneut auszulösen; das Ende leert sie, was nichts ansagt.',
    ja: '`TypingIndicator` はライブリージョンを立ち上がりでのみ発火します。入力開始時に取った文は、誰かが入力している間は保持されるため、2 人目が加わっても表示は変わりながら再発火しません。停止時は空になり、これは何も読み上げません。',
    pt: '`TypingIndicator` dispara a sua região viva apenas no flanco ascendente. A frase capturada ao começar é mantida enquanto alguém escrever, pelo que uma segunda pessoa muda o texto visível sem redisparar a região; parar limpa-a, o que não anuncia nada.',
    zh: '`TypingIndicator` 只在上升沿触发实时区域。开始输入时捕获的句子会在还有人输入期间一直保持，所以第二个人加入只改变可见文本而不会再次触发；停止时清空，这不会有任何播报。',
    ar: '`TypingIndicator` يُطلق منطقته الحيّة عند الحافة الصاعدة فقط. تُحفظ الجملة الملتقطة عند بدء الكتابة ما دام أحد يكتب، فانضمام شخص ثانٍ يغيّر النص المرئي دون إعادة الإطلاق؛ والتوقف يفرغها، وهذا لا يعلن شيئًا.',
  },
  chsA11y3: {
    en: '`ChatHeader` renders its title as a real heading (h2 by default, since a chat pane usually sits inside a page that already owns the h1). With `onTitlePress` the button goes INSIDE the heading — `h2 > button` — because a heading is flow content and wrapping it would swallow the landmark a screen reader navigates by.',
    es: '`ChatHeader` renderiza su título como encabezado real (h2 por defecto, ya que un panel de chat suele vivir en una página que ya tiene el h1). Con `onTitlePress` el botón va DENTRO del encabezado —`h2 > button`— porque un encabezado es contenido de flujo y envolverlo se tragaría el punto de referencia que usa el lector de pantalla.',
    fr: '`ChatHeader` rend son titre comme un vrai en-tête (h2 par défaut, un volet de discussion vivant en général dans une page qui possède déjà le h1). Avec `onTitlePress`, le bouton va DANS l’en-tête — `h2 > button` — car un en-tête est du contenu de flux et l’envelopper avalerait le repère par lequel navigue un lecteur d’écran.',
    de: '`ChatHeader` rendert seinen Titel als echte Überschrift (h2 als Standard, da ein Chat-Bereich meist in einer Seite sitzt, die das h1 schon besitzt). Mit `onTitlePress` sitzt der Button INNERHALB der Überschrift — `h2 > button` — denn eine Überschrift ist Flussinhalt, und sie zu umhüllen verschluckte die Landmarke, nach der ein Screenreader navigiert.',
    ja: '`ChatHeader` はタイトルを本物の見出しとして描画します（既定は h2。チャットのペインは通常 h1 を持つページの中にあるため）。`onTitlePress` を渡すとボタンは見出しの中に入ります（`h2 > button`）。見出しはフローコンテンツで、外側を包むと読み上げが辿るランドマークを飲み込んでしまうからです。',
    pt: '`ChatHeader` renderiza o título como um cabeçalho real (h2 por omissão, já que um painel de conversa costuma estar numa página que já tem o h1). Com `onTitlePress` o botão vai DENTRO do cabeçalho — `h2 > button` — porque um cabeçalho é conteúdo de fluxo e envolvê-lo engoliria o ponto de referência por onde um leitor de ecrã navega.',
    zh: '`ChatHeader` 把标题渲染为真正的标题元素（默认 h2，因为聊天面板通常位于已经拥有 h1 的页面里）。使用 `onTitlePress` 时按钮放在标题内部——`h2 > button`——因为标题是流内容，包在外面会吞掉屏幕阅读器赖以导航的地标。',
    ar: '`ChatHeader` يعرض عنوانه كعنوان حقيقي (h2 افتراضيًا، لأن لوح المحادثة يقع عادة داخل صفحة تملك h1). مع `onTitlePress` يدخل الزر داخل العنوان — `h2 > button` — لأن العنوان محتوى تدفّق، ولفّه من الخارج سيبتلع المَعْلَم الذي يتنقّل به قارئ الشاشة.',
  },
  chsA11y4: {
    en: 'Only `offline` is assertive. Retrying and recovering are progress reports on a problem already announced, so they wait for a pause — cutting across someone’s reading to say "still trying" is worse than silence.',
    es: 'Solo `offline` es asertivo. Reintentar y recuperarse son informes de progreso de un problema ya anunciado, así que esperan una pausa: interrumpir la lectura para decir «sigo intentándolo» es peor que el silencio.',
    fr: 'Seul `offline` est assertif. Réessayer et récupérer sont des rapports d’avancement sur un problème déjà annoncé : ils attendent une pause — couper la lecture de quelqu’un pour dire « j’essaie encore » est pire que le silence.',
    de: 'Nur `offline` ist assertive. Erneut versuchen und Wiederherstellen sind Fortschrittsmeldungen zu einem bereits angekündigten Problem, also warten sie auf eine Pause — jemandem ins Lesen zu fahren, um „versuche noch“ zu sagen, ist schlimmer als Schweigen.',
    ja: 'assertive なのは `offline` だけです。再試行と復帰はすでに伝えた問題の経過報告なので、区切りを待ちます。読んでいる最中に割り込んで「まだ試しています」と言うのは沈黙より悪いことです。',
    pt: 'Só `offline` é assertivo. Tentar de novo e recuperar são relatos de progresso sobre um problema já anunciado, por isso esperam por uma pausa — cortar a leitura de alguém para dizer «ainda a tentar» é pior do que o silêncio.',
    zh: '只有 `offline` 是 assertive。重试与恢复只是对已宣告问题的进度汇报，因此等待停顿——打断别人阅读只为说“还在尝试”，比沉默更糟。',
    ar: '`offline` وحده حازم. إعادة المحاولة والتعافي تقارير تقدّم عن مشكلة أُعلنت أصلًا، فتنتظر توقّفًا — قطع قراءة أحدهم لقول «ما زلت أحاول» أسوأ من الصمت.',
  },

  // ---- usage ---------------------------------------------------------------
  chsUse1: {
    en: 'Fold incoming receipts through `advanceDelivery` rather than applying them blind. Acknowledgements race, and a `sent` ack landing after the `read` it logically precedes walks the ticks backwards in front of the sender — which reads as the message being un-read.',
    es: 'Aplica los acuses con `advanceDelivery` en lugar de a ciegas. Los acuses compiten, y un `sent` que llega tras el `read` al que precede lógicamente hace retroceder las marcas ante el remitente, lo que se lee como que el mensaje se ha «desleído».',
    fr: 'Passez les accusés par `advanceDelivery` plutôt que de les appliquer à l’aveugle. Les accusés se croisent, et un `sent` arrivant après le `read` qu’il précède logiquement fait reculer les coches sous les yeux de l’expéditeur — ce qui se lit comme un message « dé-lu ».',
    de: 'Führe eingehende Bestätigungen durch `advanceDelivery`, statt sie blind anzuwenden. Bestätigungen überholen einander, und ein `sent`, das nach dem logisch späteren `read` eintrifft, lässt die Haken vor den Augen des Senders zurücklaufen — was aussieht, als würde die Nachricht un-gelesen.',
    ja: '受信した通知は素通しせず `advanceDelivery` を通してください。通知は競合し、論理的には先行するはずの `sent` が `read` の後に届くと、送信者の目の前でチェックが巻き戻り、既読が取り消されたように見えます。',
    pt: 'Passe os recibos recebidos por `advanceDelivery` em vez de os aplicar às cegas. Os recibos competem, e um `sent` que chega depois do `read` que logicamente o precede faz os vistos andar para trás à frente do remetente — o que se lê como a mensagem a ser «des-lida».',
    zh: '把收到的回执交给 `advanceDelivery`，不要直接套用。回执会乱序到达，一个逻辑上更早的 `sent` 在 `read` 之后到达，会让勾号在发送者眼前倒退——看上去就像消息被“取消已读”。',
    ar: 'مرّر الإشعارات الواردة عبر `advanceDelivery` بدل تطبيقها مباشرة. تتسابق الإشعارات، ووصول `sent` بعد `read` الذي يسبقه منطقيًا يُرجع العلامات للخلف أمام المرسِل — فيبدو أن الرسالة صارت غير مقروءة.',
  },
  chsUse2: {
    en: 'Set `decorative` on a delivery mark only when the bubble around it already reports the state in its own accessible name. Otherwise the mark is unreadable to anyone not looking at it.',
    es: 'Marca `decorative` en una marca de entrega solo cuando la burbuja que la rodea ya informe del estado en su nombre accesible. Si no, la marca es ilegible para quien no la mire.',
    fr: 'Ne mettez `decorative` sur une marque de remise que si la bulle qui l’entoure rapporte déjà l’état dans son nom accessible. Sinon, la marque est illisible pour qui ne la regarde pas.',
    de: 'Setze `decorative` an einer Zustellmarke nur, wenn die umgebende Sprechblase den Zustand bereits in ihrem barrierefreien Namen meldet. Sonst ist die Marke für alle unlesbar, die nicht hinsehen.',
    ja: '配信マークに `decorative` を付けるのは、周囲のバブルがすでにアクセシブルネームでその状態を伝えている場合だけにしてください。そうでないと、見ていない人にはマークが読めません。',
    pt: 'Ponha `decorative` numa marca de entrega apenas quando o balão à volta já reporta o estado no seu nome acessível. Caso contrário, a marca é ilegível para quem não a esteja a ver.',
    zh: '只有当外层气泡的可访问名称已经报告了该状态时，才给送达标记加 `decorative`。否则对看不见它的人来说这个标记完全不可读。',
    ar: 'ضع `decorative` على علامة التسليم فقط حين تكون الفقاعة حولها تُبلّغ بالحالة في اسمها الوصولي. وإلا فالعلامة غير مقروءة لمن لا ينظر إليها.',
  },
  chsUse3: {
    en: 'Keep the typing row out of the transcript’s scroll content and pin it above the composer. It appears and disappears every few seconds; a row that reflows the message list on every keystroke is the loudest thing on the screen.',
    es: 'Mantén la fila de escritura fuera del contenido desplazable de la transcripción y fíjala sobre el compositor. Aparece y desaparece cada pocos segundos; una fila que reajusta la lista de mensajes en cada tecla es lo más ruidoso de la pantalla.',
    fr: 'Gardez la ligne de saisie hors du contenu défilant de la transcription et fixez-la au-dessus du compositeur. Elle apparaît et disparaît toutes les quelques secondes ; une ligne qui réagence la liste des messages à chaque frappe est la chose la plus bruyante de l’écran.',
    de: 'Halte die Tippzeile aus dem scrollenden Protokollinhalt heraus und hefte sie über den Editor. Sie kommt und geht alle paar Sekunden; eine Zeile, die bei jedem Tastenanschlag die Nachrichtenliste umbricht, ist das Lauteste auf dem Bildschirm.',
    ja: '入力中の行はトランスクリプトのスクロール内容から外し、コンポーザーの上に固定してください。数秒ごとに現れては消えます。キー入力のたびにメッセージ一覧を組み直す行は、画面でいちばんうるさい存在です。',
    pt: 'Mantenha a linha de digitação fora do conteúdo deslocável da transcrição e fixe-a acima do compositor. Aparece e desaparece a cada poucos segundos; uma linha que reflui a lista de mensagens a cada tecla é a coisa mais ruidosa do ecrã.',
    zh: '把正在输入行放在记录的滚动内容之外，固定在输入框上方。它每隔几秒就出现又消失；每次按键都让消息列表重排的一行，是屏幕上最吵的东西。',
    ar: 'أبقِ صف الكتابة خارج المحتوى القابل للتمرير وثبّته فوق صندوق الكتابة. يظهر ويختفي كل بضع ثوانٍ؛ وصفٌّ يعيد ترتيب قائمة الرسائل مع كل ضغطة مفتاح هو أعلى شيء على الشاشة.',
  },
  chsUse4: {
    en: 'Do not render a "Connected" strip. `ConnectionBanner` renders nothing at `online` on purpose: a status bar that lives at the top of every chat app is a status bar nobody reads.',
    es: 'No muestres una franja de «Conectado». `ConnectionBanner` no renderiza nada en `online` a propósito: una barra de estado permanente en toda app de chat es una barra que nadie lee.',
    fr: 'N’affichez pas de bandeau « Connecté ». `ConnectionBanner` ne rend rien à `online` exprès : une barre d’état présente en permanence est une barre que personne ne lit.',
    de: 'Rendere keinen „Verbunden“-Streifen. `ConnectionBanner` zeigt bei `online` absichtlich nichts: eine Statusleiste, die in jeder Chat-App oben klebt, ist eine Statusleiste, die niemand liest.',
    ja: '「接続済み」の帯を出さないでください。`ConnectionBanner` が `online` で何も描かないのは意図的です。どのチャットアプリでも上部に居座るステータスバーは、誰も読まないステータスバーです。',
    pt: 'Não mostre uma faixa «Ligado». O `ConnectionBanner` não renderiza nada em `online` de propósito: uma barra de estado que vive no topo de todas as apps de conversa é uma barra que ninguém lê.',
    zh: '不要渲染“已连接”的条。`ConnectionBanner` 在 `online` 下什么都不画是有意为之：常驻在每个聊天应用顶部的状态条，就是没人会看的状态条。',
    ar: 'لا تعرض شريط «متصل». `ConnectionBanner` لا يعرض شيئًا عند `online` عمدًا: شريط حالة يسكن أعلى كل تطبيق محادثة هو شريط لا يقرؤه أحد.',
  },

  // ---- props ---------------------------------------------------------------
  chsPropDelStatus: { en: 'How far the message got. Omit it, and pass statuses instead, and nothing is drawn.', es: 'Hasta dónde llegó el mensaje. Si se omite y se pasa statuses, no se dibuja nada.', fr: 'Jusqu’où le message est allé. Omis, avec statuses à la place, rien n’est dessiné.', de: 'Wie weit die Nachricht kam. Weggelassen und stattdessen statuses übergeben, wird nichts gezeichnet.', ja: 'メッセージがどこまで届いたか。省略して statuses を渡すと何も描かれません。', pt: 'Até onde a mensagem chegou. Omitido, com statuses no lugar, nada é desenhado.', zh: '消息送达到哪一步。省略并改传 statuses 时不绘制任何内容。', ar: 'إلى أين وصلت الرسالة. إن حُذف ومُرّر statuses بدلًا منه فلا يُرسم شيء.' },
  chsPropDelStatuses: { en: 'A run’s states, collapsed to the least advanced. Ignored when status is set.', es: 'Los estados de una serie, reducidos al menos avanzado. Se ignora si se define status.', fr: 'Les états d’une série, réduits au moins avancé. Ignoré si status est défini.', de: 'Die Zustände einer Folge, auf den geringsten reduziert. Ignoriert, wenn status gesetzt ist.', ja: '連続した送信の状態を最も進んでいないものへまとめます。status 指定時は無視されます。', pt: 'Os estados de uma sequência, reduzidos ao menos avançado. Ignorado se status estiver definido.', zh: '一串消息的状态，收敛为最落后的一个。设置了 status 时忽略。', ar: 'حالات مجموعة، تنهار إلى الأقل تقدّمًا. يُتجاهل عند ضبط status.' },
  chsPropDelSize: { en: 'Compact size step, matched to the timestamp it sits beside.', es: 'Paso de tamaño compacto, a juego con la marca de tiempo contigua.', fr: 'Palier de taille compact, accordé à l’horodatage voisin.', de: 'Kompakte Größenstufe, passend zum Zeitstempel daneben.', ja: 'コンパクトなサイズ段階。隣のタイムスタンプに合わせます。', pt: 'Passo de tamanho compacto, a condizer com o carimbo temporal ao lado.', zh: '紧凑尺寸档位，与相邻时间戳匹配。', ar: 'درجة حجم مضغوطة تطابق الوقت المجاور.' },
  chsPropLabelOverride: { en: 'Overrides the text alternative; defaults to the state’s own name.', es: 'Sustituye el texto alternativo; por defecto, el nombre del propio estado.', fr: 'Remplace l’alternative textuelle ; par défaut le nom de l’état.', de: 'Überschreibt die Textalternative; standardmäßig der Name des Zustands.', ja: '代替テキストを上書きします。既定は状態自身の名前です。', pt: 'Substitui a alternativa textual; por omissão, o nome do próprio estado.', zh: '覆盖替代文本；默认为该状态自身的名称。', ar: 'يتجاوز البديل النصي؛ الافتراضي اسم الحالة نفسها.' },
  chsPropDecorative: { en: 'Hides the glyph from assistive tech. Only for a row whose visible text already states it.', es: 'Oculta el glifo a la tecnología de asistencia. Solo si el texto visible ya lo indica.', fr: 'Masque le glyphe aux technologies d’assistance. Seulement si le texte visible l’indique déjà.', de: 'Verbirgt das Zeichen vor assistiver Technik. Nur wenn der sichtbare Text es bereits nennt.', ja: '字形を支援技術から隠します。可視テキストがすでに述べている場合のみ。', pt: 'Esconde o glifo da tecnologia assistiva. Só se o texto visível já o disser.', zh: '对辅助技术隐藏该字形。仅当可见文本已经说明时使用。', ar: 'يُخفي الرمز عن التقنيات المساعدة. فقط إذا كان النص المرئي يذكره أصلًا.' },
  chsPropSkeleton: { en: 'Renders a placeholder with the component’s exact geometry.', es: 'Renderiza un marcador con la geometría exacta del componente.', fr: 'Rend un espace réservé à la géométrie exacte du composant.', de: 'Rendert einen Platzhalter mit der exakten Geometrie der Komponente.', ja: 'コンポーネントとまったく同じ寸法のプレースホルダーを描画します。', pt: 'Renderiza um marcador com a geometria exata do componente.', zh: '渲染与组件几何完全一致的占位符。', ar: 'يعرض عنصرًا نائبًا بهندسة المكوّن نفسها.' },
  chsPropLabelsMerge: { en: 'Overrides the wording; merged over the kit’s translations.', es: 'Sustituye la redacción; se fusiona sobre las traducciones del kit.', fr: 'Remplace les libellés ; fusionné par-dessus les traductions du kit.', de: 'Überschreibt den Wortlaut; über die Übersetzungen des Kits gelegt.', ja: '文言を上書きします。kit の翻訳の上にマージされます。', pt: 'Substitui o texto; fundido sobre as traduções do kit.', zh: '覆盖措辞；合并在套件译文之上。', ar: 'يتجاوز الصياغة؛ يُدمج فوق ترجمات العدّة.' },

  chsPropTypNames: { en: 'Who is typing, in the order they should be listed. Blank names are dropped.', es: 'Quién escribe, en el orden en que deben listarse. Los nombres vacíos se descartan.', fr: 'Qui écrit, dans l’ordre d’affichage. Les noms vides sont écartés.', de: 'Wer tippt, in der Reihenfolge der Auflistung. Leere Namen entfallen.', ja: '入力中の人を並べる順に。空の名前は除かれます。', pt: 'Quem está a digitar, pela ordem de listagem. Nomes vazios são descartados.', zh: '谁在输入，按应列出的顺序。空名称会被丢弃。', ar: 'من يكتب، بالترتيب المطلوب. تُسقط الأسماء الفارغة.' },
  chsPropTypMax: { en: 'How many names the row has room for; on overflow one slot goes to “and N others”.', es: 'Cuántos nombres caben en la fila; al desbordar, un hueco pasa a «y N más».', fr: 'Combien de noms tiennent dans la rangée ; en cas de débordement, un emplacement va à « et N autres ».', de: 'Wie viele Namen in die Zeile passen; bei Überlauf geht ein Platz an „und N weitere“.', ja: '行に入る名前の数。あふれると 1 枠が「他 N 人」になります。', pt: 'Quantos nomes cabem na linha; em excesso, um lugar vai para «e mais N».', zh: '该行能容纳多少个名字；溢出时一个位置留给“和其他 N 人”。', ar: 'كم اسمًا يتّسع له الصف؛ عند الفيض تذهب خانة إلى «و N آخرون».' },
  chsPropTypLabel: { en: 'Overrides the sentence entirely, for a caller with its own formatter.', es: 'Sustituye la frase por completo, para quien tenga su propio formateador.', fr: 'Remplace entièrement la phrase, pour un appelant ayant son propre formateur.', de: 'Ersetzt den Satz vollständig, für Aufrufer mit eigenem Formatierer.', ja: '文全体を差し替えます。独自のフォーマッタを持つ呼び出し側向け。', pt: 'Substitui a frase por completo, para quem tenha o seu próprio formatador.', zh: '完全替换整句，供自带格式化器的调用方使用。', ar: 'يستبدل الجملة كليًا، لمن لديه منسّقه الخاص.' },
  chsPropTypAnnounce: { en: 'When the row speaks to assistive tech: on the rising edge, on every change, or never.', es: 'Cuándo habla la fila a la tecnología de asistencia: en el flanco de subida, en cada cambio o nunca.', fr: 'Quand la rangée parle aux technologies d’assistance : au front montant, à chaque changement, ou jamais.', de: 'Wann die Zeile assistiver Technik spricht: an der steigenden Flanke, bei jeder Änderung oder nie.', ja: '支援技術へ話しかけるタイミング。立ち上がり時、変化のたび、または一切なし。', pt: 'Quando a linha fala à tecnologia assistiva: no flanco ascendente, a cada mudança, ou nunca.', zh: '该行何时向辅助技术播报：上升沿、每次变化，或从不。', ar: 'متى يتحدث الصف للتقنيات المساعدة: عند الحافة الصاعدة، أو مع كل تغيّر، أو أبدًا.' },
  chsPropTypDotsOnly: { en: 'Drops the label and shows only the dots.', es: 'Quita la etiqueta y muestra solo los puntos.', fr: 'Retire le libellé et n’affiche que les points.', de: 'Lässt das Label weg und zeigt nur die Punkte.', ja: 'ラベルを外してドットだけを表示します。', pt: 'Remove o rótulo e mostra apenas os pontos.', zh: '去掉文字标签，只显示圆点。', ar: 'يُسقط النص ويعرض النقاط فقط.' },
  chsPropTypTemplates: { en: 'Overrides the four sentence templates; merged over the kit’s translations.', es: 'Sustituye las cuatro plantillas de frase; se fusiona sobre las traducciones del kit.', fr: 'Remplace les quatre modèles de phrase ; fusionné par-dessus les traductions du kit.', de: 'Überschreibt die vier Satzvorlagen; über die Übersetzungen des Kits gelegt.', ja: '4 つの文テンプレートを上書きします。kit の翻訳の上にマージされます。', pt: 'Substitui os quatro modelos de frase; fundido sobre as traduções do kit.', zh: '覆盖四种句式模板；合并在套件译文之上。', ar: 'يتجاوز قوالب الجُمل الأربعة؛ تُدمج فوق ترجمات العدّة.' },

  chsPropSysKind: { en: 'What the line reports; chooses the default glyph.', es: 'Qué informa la línea; elige el glifo por defecto.', fr: 'Ce que la ligne rapporte ; choisit le glyphe par défaut.', de: 'Was die Zeile meldet; wählt das Standardzeichen.', ja: 'その行が何を報告するか。既定の字形を選びます。', pt: 'O que a linha reporta; escolhe o glifo por omissão.', zh: '该行报告什么；据此选择默认字形。', ar: 'ما يُبلّغ عنه السطر؛ يختار الرمز الافتراضي.' },
  chsPropSysIcon: { en: 'Overrides the kind’s glyph. Pass null to drop it.', es: 'Sustituye el glifo del tipo. Pasa null para quitarlo.', fr: 'Remplace le glyphe du type. Passez null pour le supprimer.', de: 'Überschreibt das Zeichen der Art. null lässt es weg.', ja: '種別の字形を上書きします。null で消せます。', pt: 'Substitui o glifo do tipo. Passe null para o remover.', zh: '覆盖该类型的字形。传 null 可去掉。', ar: 'يتجاوز رمز النوع. مرّر null لإزالته.' },
  chsPropSysTimestamp: { en: 'When it happened, appended inline after the text.', es: 'Cuándo ocurrió, añadido en línea tras el texto.', fr: 'Quand cela s’est produit, ajouté en ligne après le texte.', de: 'Wann es geschah, inline hinter dem Text angehängt.', ja: '発生時刻。テキストの後ろにインラインで付きます。', pt: 'Quando aconteceu, acrescentado em linha após o texto.', zh: '发生时间，内联附加在文本之后。', ar: 'وقت الحدوث، يُلحق داخل السطر بعد النص.' },

  chsPropQuoAuthor: { en: 'Who is being quoted.', es: 'A quién se cita.', fr: 'Qui est cité.', de: 'Wer zitiert wird.', ja: '引用される相手。', pt: 'Quem está a ser citado.', zh: '被引用的人。', ar: 'من يُقتبس منه.' },
  chsPropQuoText: { en: 'What they said; truncated by the shared quoted-snippet rule.', es: 'Lo que dijeron; truncado por la regla compartida de fragmento citado.', fr: 'Ce qu’ils ont dit ; tronqué par la règle partagée d’extrait cité.', de: 'Was sie sagten; nach der gemeinsamen Zitatregel gekürzt.', ja: '発言内容。共有の引用スニペット規則で切り詰められます。', pt: 'O que disseram; truncado pela regra partilhada de excerto citado.', zh: '他们说了什么；按共享的引用摘录规则截断。', ar: 'ما قالوه؛ يُقتطع بقاعدة المقتطف المشتركة.' },
  chsPropQuoPlaceholder: { en: 'Stands in for a quote with no text — “Photo”, “Voice message”.', es: 'Sustituye una cita sin texto: «Foto», «Mensaje de voz».', fr: 'Remplace une citation sans texte — « Photo », « Message vocal ».', de: 'Steht für ein Zitat ohne Text — „Foto“, „Sprachnachricht“.', ja: 'テキストのない引用の代わり。「写真」「ボイスメッセージ」など。', pt: 'Substitui uma citação sem texto — «Foto», «Mensagem de voz».', zh: '用于没有文本的引用——“照片”“语音消息”。', ar: 'ينوب عن اقتباس بلا نص — «صورة»، «رسالة صوتية».' },
  chsPropQuoPreview: { en: 'A thumbnail of the quoted attachment, on the trailing edge.', es: 'Una miniatura del adjunto citado, en el borde final.', fr: 'Une vignette de la pièce jointe citée, sur le bord final.', de: 'Ein Vorschaubild des zitierten Anhangs, am Endrand.', ja: '引用した添付のサムネイル。末尾側に置かれます。', pt: 'Uma miniatura do anexo citado, na margem final.', zh: '被引用附件的缩略图，位于尾边。', ar: 'مصغّرة للمرفق المقتبس، على الحافة الأخيرة.' },
  chsPropQuoTone: { en: 'Which family the rule and author line paint. Neutral is for a quote inside an already-accented bubble.', es: 'Qué familia pintan la regla y la línea de autor. Neutral es para una cita dentro de una burbuja ya acentuada.', fr: 'Quelle famille peignent le filet et la ligne d’auteur. Neutral pour une citation dans une bulle déjà accentuée.', de: 'Welche Familie Linie und Autorenzeile malen. Neutral für ein Zitat in einer bereits akzentuierten Blase.', ja: '罫線と著者行が塗る色系統。すでにアクセントの付いたバブル内の引用には neutral を。', pt: 'Que família a régua e a linha de autor pintam. Neutral para uma citação dentro de um balão já acentuado.', zh: '竖线与作者行使用哪一色系。已带强调色的气泡内的引用用 neutral。', ar: 'أي عائلة يرسمها الخط وسطر المؤلف. neutral لاقتباس داخل فقاعة ملوّنة أصلًا.' },
  chsPropQuoOnPress: { en: 'Jumps to the original. Omit it and the block renders inert.', es: 'Salta al original. Si se omite, el bloque queda inerte.', fr: 'Saute à l’original. Omis, le bloc est inerte.', de: 'Springt zum Original. Weggelassen, bleibt der Block träge.', ja: '元のメッセージへ移動します。省略すると不活性になります。', pt: 'Salta para o original. Omitido, o bloco fica inerte.', zh: '跳转到原始消息。省略则该块为惰性。', ar: 'ينتقل إلى الأصل. إن حُذف صار الصندوق خاملًا.' },

  chsPropThrCount: { en: 'How many replies the thread holds.', es: 'Cuántas respuestas tiene el hilo.', fr: 'Combien de réponses contient le fil.', de: 'Wie viele Antworten der Thread hat.', ja: 'スレッドの返信件数。', pt: 'Quantas respostas o tópico tem.', zh: '该话题包含多少条回复。', ar: 'كم ردًّا تحوي المحادثة الفرعية.' },
  chsPropThrParticipants: { en: 'The faces, as a slot — compose an AvatarGroup. Decorative.', es: 'Las caras, como hueco: compón un AvatarGroup. Decorativo.', fr: 'Les visages, en emplacement — composez un AvatarGroup. Décoratif.', de: 'Die Gesichter als Slot — komponiere eine AvatarGroup. Dekorativ.', ja: '顔はスロット。AvatarGroup を差し込みます。装飾扱いです。', pt: 'Os rostos, como slot — componha um AvatarGroup. Decorativo.', zh: '头像作为插槽——组合一个 AvatarGroup。装饰性。', ar: 'الوجوه كخانة — ركّب AvatarGroup. زخرفية.' },
  chsPropThrLastActivity: { en: 'Epoch milliseconds of the last reply.', es: 'Milisegundos de época de la última respuesta.', fr: 'Millisecondes epoch de la dernière réponse.', de: 'Epoch-Millisekunden der letzten Antwort.', ja: '最後の返信のエポックミリ秒。', pt: 'Milissegundos epoch da última resposta.', zh: '最后一条回复的 epoch 毫秒。', ar: 'ميلي ثانية زمن آخر رد.' },
  chsPropThrNow: { en: 'The moment to measure against; injected so a test is not clock-dependent.', es: 'El instante de referencia; se inyecta para que la prueba no dependa del reloj.', fr: 'L’instant de référence ; injecté pour qu’un test ne dépende pas de l’horloge.', de: 'Der Bezugsmoment; injiziert, damit ein Test nicht von der Uhr abhängt.', ja: '基準となる時刻。テストが時計に依存しないよう注入します。', pt: 'O instante de referência; injetado para o teste não depender do relógio.', zh: '用于比较的时刻；注入以免测试依赖真实时钟。', ar: 'اللحظة المرجعية؛ تُحقن كي لا يعتمد الاختبار على الساعة.' },
  chsPropThrUnread: { en: 'The thread has replies this reader has not seen.', es: 'El hilo tiene respuestas que este lector no ha visto.', fr: 'Le fil contient des réponses que ce lecteur n’a pas vues.', de: 'Der Thread hat Antworten, die dieser Leser nicht gesehen hat.', ja: 'この読み手が未読の返信があります。', pt: 'O tópico tem respostas que este leitor não viu.', zh: '该话题有此读者尚未看过的回复。', ar: 'تحوي المحادثة ردودًا لم يرها هذا القارئ.' },

  chsPropHdrTitle: { en: 'Who or what the conversation is with. Rendered as the surface’s heading.', es: 'Con quién o con qué es la conversación. Se renderiza como encabezado de la superficie.', fr: 'Avec qui ou quoi se tient la conversation. Rendu comme titre de la surface.', de: 'Mit wem oder was das Gespräch geführt wird. Als Überschrift der Fläche gerendert.', ja: '会話の相手。この面の見出しとして描画されます。', pt: 'Com quem ou o quê é a conversa. Renderizado como cabeçalho da superfície.', zh: '会话的对象。渲染为该界面的标题。', ar: 'مع من أو ماذا تجري المحادثة. يُعرض كعنوان السطح.' },
  chsPropHdrSubtitle: { en: 'A second line: presence, member count, or a TypingIndicator.', es: 'Una segunda línea: presencia, número de miembros o un TypingIndicator.', fr: 'Une deuxième ligne : présence, nombre de membres, ou un TypingIndicator.', de: 'Eine zweite Zeile: Präsenz, Mitgliederzahl oder ein TypingIndicator.', ja: '2 行目。在席、メンバー数、または TypingIndicator。', pt: 'Uma segunda linha: presença, número de membros, ou um TypingIndicator.', zh: '第二行：在线状态、成员数量或 TypingIndicator。', ar: 'سطر ثانٍ: الحضور أو عدد الأعضاء أو TypingIndicator.' },
  chsPropHdrAvatar: { en: 'Leading avatar slot — an Avatar for a person, an AvatarGroup for a group.', es: 'Hueco de avatar inicial: un Avatar para una persona, un AvatarGroup para un grupo.', fr: 'Emplacement d’avatar en tête — un Avatar pour une personne, un AvatarGroup pour un groupe.', de: 'Führender Avatar-Slot — ein Avatar für eine Person, eine AvatarGroup für eine Gruppe.', ja: '先頭のアバター枠。個人なら Avatar、グループなら AvatarGroup。', pt: 'Slot de avatar inicial — um Avatar para uma pessoa, um AvatarGroup para um grupo.', zh: '前导头像插槽——个人用 Avatar，群组用 AvatarGroup。', ar: 'خانة الصورة الرمزية في المقدمة — Avatar لشخص، AvatarGroup لمجموعة.' },
  chsPropHdrActions: { en: 'Trailing actions, typically call buttons.', es: 'Acciones al final, normalmente botones de llamada.', fr: 'Actions en fin de ligne, typiquement des boutons d’appel.', de: 'Aktionen am Ende, typischerweise Anrufbuttons.', ja: '末尾のアクション。通常は通話ボタン。', pt: 'Ações à direita, tipicamente botões de chamada.', zh: '尾部操作，通常是通话按钮。', ar: 'إجراءات في الطرف، عادةً أزرار الاتصال.' },
  chsPropHdrOnBack: { en: 'Renders a leading back control; omit it and none is drawn.', es: 'Renderiza un control de retroceso inicial; si se omite, no se dibuja.', fr: 'Rend un contrôle retour en tête ; omis, aucun n’est dessiné.', de: 'Rendert eine führende Zurück-Steuerung; weggelassen wird keine gezeichnet.', ja: '先頭に戻るコントロールを描画します。省略すると描かれません。', pt: 'Renderiza um controlo de retorno inicial; omitido, nenhum é desenhado.', zh: '渲染前导的返回控件；省略则不绘制。', ar: 'يعرض زر رجوع في المقدمة؛ إن حُذف فلا يُرسم.' },
  chsPropHdrOnTitlePress: { en: 'Opens the conversation details, turning the title into one focusable target inside the heading.', es: 'Abre los detalles de la conversación, convirtiendo el título en un objetivo enfocable dentro del encabezado.', fr: 'Ouvre les détails de la conversation, faisant du titre une cible focalisable à l’intérieur de l’en-tête.', de: 'Öffnet die Gesprächsdetails und macht den Titel zu einem fokussierbaren Ziel innerhalb der Überschrift.', ja: '会話の詳細を開きます。タイトルが見出し内のフォーカス可能なターゲットになります。', pt: 'Abre os detalhes da conversa, tornando o título num alvo focável dentro do cabeçalho.', zh: '打开会话详情，把标题变成标题元素内一个可聚焦的目标。', ar: 'يفتح تفاصيل المحادثة، ويجعل العنوان هدفًا قابلًا للتركيز داخل العنوان.' },
  chsPropHdrHeadingLevel: { en: 'The heading element for the title.', es: 'El elemento de encabezado para el título.', fr: 'L’élément d’en-tête pour le titre.', de: 'Das Überschriftenelement für den Titel.', ja: 'タイトルに使う見出し要素。', pt: 'O elemento de cabeçalho para o título.', zh: '标题所使用的标题元素。', ar: 'عنصر العنوان المستخدَم للاسم.' },
  chsPropHdrDensity: { en: 'How tightly the bar is packed.', es: 'Cuán compacta va la barra.', fr: 'La densité de la barre.', de: 'Wie dicht die Leiste gepackt ist.', ja: 'バーの詰め具合。', pt: 'Quão compacta a barra é.', zh: '这条栏的紧凑程度。', ar: 'مدى تراصّ الشريط.' },
  chsPropHdrBorder: { en: 'The bottom hairline separating the bar from the transcript.', es: 'La línea fina inferior que separa la barra de la transcripción.', fr: 'Le filet inférieur séparant la barre de la transcription.', de: 'Die untere Haarlinie, die die Leiste vom Protokoll trennt.', ja: 'バーとトランスクリプトを分ける下部のヘアライン。', pt: 'A linha fina inferior que separa a barra da transcrição.', zh: '把这条栏与记录分开的底部细线。', ar: 'الخط الشعري السفلي الفاصل بين الشريط والمحادثة.' },

  chsPropConnState: { en: 'Which state to show. Online renders nothing at all.', es: 'Qué estado mostrar. Online no renderiza nada.', fr: 'Quel état afficher. Online ne rend rien du tout.', de: 'Welcher Zustand gezeigt wird. Online rendert gar nichts.', ja: '表示する状態。online は何も描画しません。', pt: 'Que estado mostrar. Online não renderiza nada.', zh: '显示哪个状态。online 完全不渲染。', ar: 'أي حالة تُعرض. online لا يعرض شيئًا.' },
  chsPropConnOnline: { en: 'Convenience for the common case: true renders nothing, false shows offline.', es: 'Atajo para el caso común: true no renderiza nada, false muestra sin conexión.', fr: 'Raccourci pour le cas courant : true ne rend rien, false affiche hors ligne.', de: 'Abkürzung für den Normalfall: true rendert nichts, false zeigt offline.', ja: 'よくある場合の簡便版。true は何も描かず、false はオフラインを表示します。', pt: 'Atalho para o caso comum: true não renderiza nada, false mostra offline.', zh: '常见场景的便捷写法：true 不渲染，false 显示离线。', ar: 'اختصار للحالة الشائعة: true لا يعرض شيئًا، وfalse يعرض غير متصل.' },
  chsPropConnOnRetry: { en: 'Offers a retry action while offline.', es: 'Ofrece una acción de reintento mientras no hay conexión.', fr: 'Propose une action de nouvel essai en mode hors ligne.', de: 'Bietet im Offline-Zustand eine Wiederholungsaktion.', ja: 'オフラインの間、再試行アクションを提供します。', pt: 'Oferece uma ação de nova tentativa enquanto offline.', zh: '离线期间提供重试操作。', ar: 'يوفّر إجراء إعادة محاولة أثناء انقطاع الاتصال.' },
  chsPropConnOnSettle: { en: 'Called once the recovery confirmation has been up long enough.', es: 'Se llama cuando la confirmación de recuperación ha estado el tiempo suficiente.', fr: 'Appelé une fois la confirmation de reprise restée assez longtemps.', de: 'Wird aufgerufen, sobald die Wiederherstellungsbestätigung lange genug stand.', ja: '復帰の確認が十分な時間表示されたら呼ばれます。', pt: 'Chamado quando a confirmação de recuperação esteve tempo suficiente.', zh: '当恢复确认显示足够久后调用。', ar: 'يُستدعى بعد بقاء تأكيد التعافي مدة كافية.' },
  chsPropConnDwell: { en: 'How long the recovery confirmation stays.', es: 'Cuánto permanece la confirmación de recuperación.', fr: 'Combien de temps la confirmation de reprise reste.', de: 'Wie lange die Wiederherstellungsbestätigung bleibt.', ja: '復帰の確認が表示される時間。', pt: 'Quanto tempo a confirmação de recuperação fica.', zh: '恢复确认停留多久。', ar: 'كم تبقى رسالة التعافي.' },
});

/** One demo cell: the component above the literal prop value that produced it. */
function Cell({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <Stack gap={2} align="center" style={{ minWidth: '5.25rem' }}>
      <span style={{ display: 'grid', placeItems: 'center', minHeight: '1.5rem' }}>{children}</span>
      <Text as="span" size={Size.Small} tone={TextTone.Muted}>
        <code>{caption}</code>
      </Text>
    </Stack>
  );
}

const DELIVERY_STATES: DeliveryStatus[] = ['sending', 'sent', 'delivered', 'read', 'failed'];

/** The five marks in one row, optionally with the colour taken away. */
function DeliveryRow({ K, grey = false }: { K: PlatformKit; grey?: boolean }) {
  return (
    <Row gap={5} wrap align="center" style={grey ? { filter: 'grayscale(1)' } : undefined}>
      {DELIVERY_STATES.map((status) => (
        <Cell key={status} caption={status}>
          <K.DeliveryStatus status={status} />
        </Cell>
      ))}
    </Row>
  );
}

/**
 * The connection lifecycle, driven by the real state machine. Its own component
 * because it holds state, and a render callback cannot hold hooks.
 */
function ConnectionMachineDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [state, setState] = useState<ConnectionState>('online');

  return (
    <Stack gap={4} style={{ width: '100%', minWidth: 0 }}>
      <Row gap={3} wrap align="center">
        <Button size={Size.Small} variant="soft" onClick={() => setState((s) => nextConnection(s, 'lost'))}>
          {t(p.chsConnEventLost)}
        </Button>
        <Button size={Size.Small} variant="soft" onClick={() => setState((s) => nextConnection(s, 'retry'))}>
          {t(p.chsConnEventRetry)}
        </Button>
        <Button size={Size.Small} variant="soft" onClick={() => setState((s) => nextConnection(s, 'restored'))}>
          {t(p.chsConnEventRestored)}
        </Button>
        <Text as="span" size={Size.Small} tone={TextTone.Muted}>
          {t(p.chsConnCurrent, { state })}
        </Text>
      </Row>
      {/* No onRetry: the retry affordance is exercised in the static example
          above, and a second one here would compete with the event buttons. */}
      <K.ConnectionBanner state={state} onSettle={() => setState((s) => nextConnection(s, 'settle'))} />
    </Stack>
  );
}

export function ChatStatusPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(p.chsName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(p.chsLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(p.chsAnatomy))}</Text>
      <Heading level={3}>DeliveryStatus</Heading>
      <ComponentBlueprint specId="delivery-status" />
      <Heading level={3}>TypingIndicator</Heading>
      <ComponentBlueprint specId="typing-indicator" />
      <Heading level={3}>SystemMessage</Heading>
      <ComponentBlueprint specId="system-message" />
      <Heading level={3}>QuotedMessage</Heading>
      <ComponentBlueprint specId="quoted-message" />
      <Heading level={3}>ThreadIndicator</Heading>
      <ComponentBlueprint specId="thread-indicator" />
      <Heading level={3}>ConnectionBanner</Heading>
      <ComponentBlueprint specId="connection-banner" />
      <Heading level={3}>ChatHeader</Heading>
      <ComponentBlueprint specId="chat-header" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(p.chsExDeliveryTitle)}
        description={prose(t(p.chsExDeliveryDesc))}
        component="DeliveryStatus"
        render={(K) => <DeliveryRow K={K} />}
        code={`import { DeliveryStatus } from '@glacier/react';

<DeliveryStatus status="sending" />   {/* clock */}
<DeliveryStatus status="sent" />      {/* one tick */}
<DeliveryStatus status="delivered" /> {/* two ticks */}
<DeliveryStatus status="read" />      {/* tick in a solid disc */}
<DeliveryStatus status="failed" />    {/* warning triangle */}`}
      />

      <Example
        title={t(p.chsExGreyTitle)}
        description={prose(t(p.chsExGreyDesc))}
        component="DeliveryStatus"
        render={(K) => <DeliveryRow K={K} grey />}
        code={`// Not a component prop — the docs wrap the same row in a filter, so the
// "no two states share a silhouette" claim can be checked rather than trusted.
<div style={{ filter: 'grayscale(1)' }}>
  {(['sending', 'sent', 'delivered', 'read', 'failed'] as const).map((status) => (
    <DeliveryStatus key={status} status={status} />
  ))}
</div>`}
      />

      <Example
        title={t(p.chsExRunTitle)}
        description={prose(t(p.chsExRunDesc))}
        component="DeliveryStatus"
        render={(K) => (
          <Row gap={5} wrap align="center">
            <Cell caption="read + read">
              <K.DeliveryStatus statuses={['read', 'read']} />
            </Cell>
            <Cell caption="read + failed">
              <K.DeliveryStatus statuses={['read', 'failed']} />
            </Cell>
            <Cell caption="delivered + sent">
              <K.DeliveryStatus statuses={['delivered', 'sent']} />
            </Cell>
            <Cell caption="sm">
              <K.DeliveryStatus status="read" size="sm" />
            </Cell>
            <Cell caption="skeleton">
              <K.DeliveryStatus skeleton />
            </Cell>
          </Row>
        )}
        code={`// The stack advertises the least advanced message in the run.
<DeliveryStatus statuses={['read', 'failed']} />   // failed
<DeliveryStatus statuses={['delivered', 'sent']} /> // sent

<DeliveryStatus status="read" size="sm" />
<DeliveryStatus skeleton />`}
      />

      <Example
        title={t(p.chsExTypingTitle)}
        description={prose(t(p.chsExTypingDesc))}
        component="TypingIndicator"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={4} align="start">
            <K.TypingIndicator names={['Ana Ruiz']} />
            <K.TypingIndicator names={['Ana Ruiz', 'Bo Chen']} />
            <K.TypingIndicator names={['Ana Ruiz', 'Bo Chen', 'Priya Raman', 'Tomás Vidal']} />
            <K.TypingIndicator names={['Ana Ruiz', 'Bo Chen', 'Priya Raman']} max={3} />
            <K.TypingIndicator names={['Ana Ruiz']} dotsOnly />
            <K.TypingIndicator skeleton />
          </Stack>
        )}
        code={`import { TypingIndicator } from '@glacier/react';

<TypingIndicator names={['Ana Ruiz']} />
<TypingIndicator names={['Ana Ruiz', 'Bo Chen']} />

// Past max (2 by default) the last slot becomes a count.
<TypingIndicator names={['Ana Ruiz', 'Bo Chen', 'Priya Raman', 'Tomás Vidal']} />

// Room for three names, so all three are listed.
<TypingIndicator names={['Ana Ruiz', 'Bo Chen', 'Priya Raman']} max={3} />

<TypingIndicator names={['Ana Ruiz']} dotsOnly />
<TypingIndicator skeleton />`}
      />

      <Example
        title={t(p.chsExSystemTitle)}
        description={prose(t(p.chsExSystemDesc))}
        component="SystemMessage"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={3} style={{ width: '100%', minWidth: 0 }}>
            <K.SystemMessage kind="join">{t(p.chsDemoJoined)}</K.SystemMessage>
            <K.SystemMessage kind="leave">{t(p.chsDemoLeft)}</K.SystemMessage>
            <K.SystemMessage kind="topic" timestamp="14:02">
              {t(p.chsDemoTopic)}
            </K.SystemMessage>
            <K.SystemMessage kind="call" timestamp="14:31">
              {t(p.chsDemoCall)}
            </K.SystemMessage>
            <K.SystemMessage kind="info">{t(p.chsDemoInfo)}</K.SystemMessage>
          </Stack>
        )}
        code={`import { SystemMessage } from '@glacier/react';

<SystemMessage kind="join">Bo Chen joined the conversation</SystemMessage>
<SystemMessage kind="leave">Priya Raman left</SystemMessage>
<SystemMessage kind="topic" timestamp="14:02">Topic changed to “Release 4.2”</SystemMessage>
<SystemMessage kind="call" timestamp="14:31">Call ended · 12 min</SystemMessage>
<SystemMessage kind="info">Messages in this conversation are end-to-end encrypted</SystemMessage>`}
      />

      <Example
        title={t(p.chsExQuotedTitle)}
        description={prose(t(p.chsExQuotedDesc))}
        component="QuotedMessage"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={4} style={{ width: '100%', minWidth: 0, maxWidth: '30rem' }}>
            <K.QuotedMessage author="Ana Ruiz" text={t(p.chsDemoQuote)} onPress={() => {}} />
            <K.QuotedMessage
              author="Bo Chen"
              placeholder={t(p.chsDemoQuotePhoto)}
              tone="neutral"
              onPress={() => {}}
            />
            <K.QuotedMessage author="Priya Raman" text={t(p.chsDemoQuoteInert)} />
            <K.QuotedMessage author="" skeleton />
          </Stack>
        )}
        code={`import { QuotedMessage } from '@glacier/react';

// Pressable: a real button whose accessible name says whose message and where it goes.
<QuotedMessage author="Ana Ruiz" text={body} onPress={() => jumpTo(id)} />

// No text: the placeholder stands in, and neutral keeps a second accent
// out of an already-accented bubble.
<QuotedMessage author="Bo Chen" placeholder="Photo" tone="neutral" onPress={jump} />

// No handler: inert, with no focus stop and no press dip.
<QuotedMessage author="Priya Raman" text={body} />

<QuotedMessage author="" skeleton />`}
      />

      <Example
        title={t(p.chsExThreadTitle)}
        description={prose(t(p.chsExThreadDesc))}
        component="ThreadIndicator"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={4} align="start">
            <K.ThreadIndicator
              count={1}
              lastActivityAt={THREAD_LAST_REPLY}
              now={THREAD_NOW}
              participants={<K.AvatarGroup avatars={[{ name: 'Ana Ruiz' }]} size="sm" />}
              onPress={() => {}}
            />
            <K.ThreadIndicator
              count={12}
              lastActivityAt={THREAD_LAST_REPLY}
              now={THREAD_NOW}
              unread
              participants={
                <K.AvatarGroup
                  avatars={[{ name: 'Ana Ruiz' }, { name: 'Bo Chen' }, { name: 'Priya Raman' }]}
                  size="sm"
                />
              }
              onPress={() => {}}
            />
            <K.ThreadIndicator count={3} />
            <K.ThreadIndicator count={0} skeleton />
          </Stack>
        )}
        code={`import { ThreadIndicator, AvatarGroup } from '@glacier/react';

<ThreadIndicator
  count={12}
  unread
  lastActivityAt={lastReplyAt}
  participants={<AvatarGroup avatars={people} size="sm" />}
  onPress={() => openThread(id)}
/>

// No handler and no timestamp: an inert footer that still reads its count.
<ThreadIndicator count={3} />`}
      />

      <Example
        title={t(p.chsExHeaderTitle)}
        description={prose(t(p.chsExHeaderDesc))}
        component="ChatHeader"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={5} style={{ width: '100%', minWidth: 0 }}>
            <K.ChatHeader
              title="Ana Ruiz"
              subtitle={t(p.chsDemoSubtitle)}
              avatar={<Avatar name="Ana Ruiz" size="md" />}
              actions={
                <>
                  <K.IconButton variant="ghost" aria-label="Voice call">
                    <Phone size={18} />
                  </K.IconButton>
                  <K.IconButton variant="ghost" aria-label="Video call">
                    <Video size={18} />
                  </K.IconButton>
                  <K.IconButton variant="ghost" aria-label="More">
                    <MoreVertical size={18} />
                  </K.IconButton>
                </>
              }
            />
            <K.ChatHeader
              density="compact"
              title="Release 4.2"
              subtitle={<K.TypingIndicator names={['Bo Chen']} size="sm" announce="never" />}
              avatar={
                <K.AvatarGroup
                  avatars={[{ name: 'Ana Ruiz' }, { name: 'Bo Chen' }, { name: 'Priya Raman' }]}
                  size="sm"
                />
              }
              onBack={() => {}}
              onTitlePress={() => {}}
            />
            <K.ChatHeader title="" skeleton />
          </Stack>
        )}
        code={`import { ChatHeader, Avatar, IconButton, TypingIndicator } from '@glacier/react';

<ChatHeader
  title="Ana Ruiz"
  subtitle="Online · last seen just now"
  avatar={<Avatar name="Ana Ruiz" size="md" />}
  actions={<>
    <IconButton variant="ghost" aria-label="Voice call"><Phone size={18} /></IconButton>
    <IconButton variant="ghost" aria-label="Video call"><Video size={18} /></IconButton>
  </>}
/>

// A group, packed tighter, with a back control and a pressable title.
<ChatHeader
  density="compact"
  title="Release 4.2"
  subtitle={<TypingIndicator names={['Bo Chen']} size="sm" announce="never" />}
  avatar={<AvatarGroup avatars={members} size="sm" />}
  onBack={() => history.back()}
  onTitlePress={() => openDetails()}
/>`}
      />

      <Example
        title={t(p.chsExConnTitle)}
        description={prose(t(p.chsExConnDesc))}
        component="ConnectionBanner"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={4} style={{ width: '100%', minWidth: 0 }}>
            {/* No onSettle, so the recovery confirmation stays put for reading. */}
            <K.ConnectionBanner state="offline" onRetry={() => {}} />
            <K.ConnectionBanner state="reconnecting" />
            <K.ConnectionBanner state="reconnected" />
            <K.ConnectionBanner state="online" />
          </Stack>
        )}
        code={`import { ConnectionBanner } from '@glacier/react';

<ConnectionBanner state="offline" onRetry={() => reconnect()} />
<ConnectionBanner state="reconnecting" />
<ConnectionBanner state="reconnected" onSettle={() => setState('online')} />

// Renders nothing at all.
<ConnectionBanner state="online" />`}
      />

      <Example
        title={t(p.chsExConnMachineTitle)}
        description={prose(t(p.chsExConnMachineDesc))}
        component="ConnectionBanner"
        platformLayout="stacked"
        render={(K) => <ConnectionMachineDemo K={K} />}
        code={`import { nextConnection, type ConnectionState } from '@glacier/logic';

const [state, setState] = useState<ConnectionState>('online');

socket.on('close', () => setState((s) => nextConnection(s, 'lost')));
socket.on('retry', () => setState((s) => nextConnection(s, 'retry')));
socket.on('open',  () => setState((s) => nextConnection(s, 'restored')));

<ConnectionBanner
  state={state}
  onRetry={() => socket.reconnect()}
  onSettle={() => setState((s) => nextConnection(s, 'settle'))}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>DeliveryStatus</Heading>
      <PropsTable
        props={[
          { name: 'status', type: "'sending' | 'sent' | 'delivered' | 'read' | 'failed'", description: t(p.chsPropDelStatus) },
          { name: 'statuses', type: '(DeliveryStatusValue | undefined)[]', description: t(p.chsPropDelStatuses) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(p.chsPropDelSize) },
          { name: 'label', type: 'string', description: t(p.chsPropLabelOverride) },
          { name: 'decorative', type: 'boolean', default: 'false', description: t(p.chsPropDecorative) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.chsPropSkeleton) },
          { name: 'labels', type: 'Partial<DeliveryLabels>', description: t(p.chsPropLabelsMerge) },
        ]}
      />

      <Heading level={3}>TypingIndicator</Heading>
      <PropsTable
        props={[
          { name: 'names', type: 'string[]', default: '[]', description: t(p.chsPropTypNames) },
          { name: 'max', type: 'number', default: '2', description: t(p.chsPropTypMax) },
          { name: 'label', type: 'ReactNode', description: t(p.chsPropTypLabel) },
          { name: 'announce', type: "'start' | 'always' | 'never'", default: "'start'", description: t(p.chsPropTypAnnounce) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(p.chsPropDelSize) },
          { name: 'dotsOnly', type: 'boolean', default: 'false', description: t(p.chsPropTypDotsOnly) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.chsPropSkeleton) },
          { name: 'templates', type: 'Partial<TypingTemplates>', description: t(p.chsPropTypTemplates) },
        ]}
      />

      <Heading level={3}>SystemMessage</Heading>
      <PropsTable
        props={[
          { name: 'kind', type: "'info' | 'join' | 'leave' | 'topic' | 'call'", default: "'info'", description: t(p.chsPropSysKind) },
          { name: 'icon', type: 'ReactNode', description: t(p.chsPropSysIcon) },
          { name: 'timestamp', type: 'ReactNode', description: t(p.chsPropSysTimestamp) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.chsPropSkeleton) },
        ]}
      />

      <Heading level={3}>QuotedMessage</Heading>
      <PropsTable
        props={[
          { name: 'author', type: 'ReactNode', description: t(p.chsPropQuoAuthor) },
          { name: 'text', type: 'string', description: t(p.chsPropQuoText) },
          { name: 'placeholder', type: 'ReactNode', description: t(p.chsPropQuoPlaceholder) },
          { name: 'preview', type: 'ReactNode', description: t(p.chsPropQuoPreview) },
          { name: 'tone', type: "'accent' | 'neutral'", default: "'accent'", description: t(p.chsPropQuoTone) },
          { name: 'onPress', type: '() => void', description: t(p.chsPropQuoOnPress) },
          { name: 'label', type: 'string', description: t(p.chsPropLabelOverride) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.chsPropSkeleton) },
        ]}
      />

      <Heading level={3}>ThreadIndicator</Heading>
      <PropsTable
        props={[
          { name: 'count', type: 'number', description: t(p.chsPropThrCount) },
          { name: 'participants', type: 'ReactNode', description: t(p.chsPropThrParticipants) },
          { name: 'lastActivityAt', type: 'Millis', description: t(p.chsPropThrLastActivity) },
          { name: 'now', type: 'Millis', default: 'Date.now()', description: t(p.chsPropThrNow) },
          { name: 'label', type: 'ReactNode', description: t(p.chsPropTypLabel) },
          { name: 'activity', type: 'ReactNode', description: t(p.chsPropSysTimestamp) },
          { name: 'onPress', type: '() => void', description: t(p.chsPropQuoOnPress) },
          { name: 'unread', type: 'boolean', default: 'false', description: t(p.chsPropThrUnread) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.chsPropSkeleton) },
        ]}
      />

      <Heading level={3}>ChatHeader</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: t(p.chsPropHdrTitle) },
          { name: 'subtitle', type: 'ReactNode', description: t(p.chsPropHdrSubtitle) },
          { name: 'avatar', type: 'ReactNode', description: t(p.chsPropHdrAvatar) },
          { name: 'actions', type: 'ReactNode', description: t(p.chsPropHdrActions) },
          { name: 'onBack', type: '() => void', description: t(p.chsPropHdrOnBack) },
          { name: 'backLabel', type: 'string', description: t(p.chsPropLabelOverride) },
          { name: 'onTitlePress', type: '() => void', description: t(p.chsPropHdrOnTitlePress) },
          { name: 'headingLevel', type: '1 | 2 | 3', default: '2', description: t(p.chsPropHdrHeadingLevel) },
          { name: 'density', type: "'compact' | 'comfortable'", default: "'comfortable'", description: t(p.chsPropHdrDensity) },
          { name: 'border', type: 'boolean', default: 'true', description: t(p.chsPropHdrBorder) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.chsPropSkeleton) },
        ]}
      />

      <Heading level={3}>ConnectionBanner</Heading>
      <PropsTable
        props={[
          { name: 'state', type: "'online' | 'offline' | 'reconnecting' | 'reconnected'", description: t(p.chsPropConnState) },
          { name: 'online', type: 'boolean', description: t(p.chsPropConnOnline) },
          { name: 'onRetry', type: '() => void', description: t(p.chsPropConnOnRetry) },
          { name: 'onSettle', type: '() => void', description: t(p.chsPropConnOnSettle) },
          { name: 'dwellMs', type: 'number', default: '3000', description: t(p.chsPropConnDwell) },
          { name: 'labels', type: 'Partial<ConnectionLabels>', description: t(p.chsPropLabelsMerge) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(p.chsA11y1))}</li>
        <li>{prose(t(p.chsA11y2))}</li>
        <li>{prose(t(p.chsA11y3))}</li>
        <li>{prose(t(p.chsA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(p.chsUse1))}</li>
        <li>{prose(t(p.chsUse2))}</li>
        <li>{prose(t(p.chsUse3))}</li>
        <li>{prose(t(p.chsUse4))}</li>
      </ul>
    </>
  );
}

/**
 * Fixed instants so the thread footer reads the same on every render and in a
 * screenshot diff: a reply forty minutes before "now".
 */
const THREAD_NOW = Date.UTC(2026, 4, 12, 15, 30);
const THREAD_LAST_REPLY = THREAD_NOW - 40 * 60 * 1000;
