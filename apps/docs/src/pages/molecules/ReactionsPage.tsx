import { useState, type ReactNode } from 'react';
import {
  Button,
  Heading,
  Variant,
  Row,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import type { MessageActionItem } from '@glacier/react';
import type { Reaction, ReactionIntent } from '@glacier/logic';
import { Copy, MessageSquare, Pin, Reply, SmilePlus, Trash2 } from '@glacier/icons';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

/**
 * ReactionPill / ReactionBar / ReactionPicker / MessageActions.
 *
 * The page's own strings live here rather than in the shared catalog because
 * `apps/docs/src/i18n.ts` is integrated centrally; every key below is listed in
 * the handoff for folding in. All eight locales are mandatory, exactly as they
 * are in the shared catalog — `defineMessages` makes a missing one a compile
 * error, not a runtime blank.
 */
const pm = defineMessages({
  rxName: { en: 'Reactions', es: 'Reacciones', fr: 'Réactions', de: 'Reaktionen', ja: 'リアクション', pt: 'Reações', zh: '回应', ar: 'التفاعلات' },
  rxLede: {
    en: 'The emoji tally under a message, the chooser that adds to it, and the action cluster on the message row — four components sharing one set of rules from @glacier/logic.',
    es: 'El recuento de emojis bajo un mensaje, el selector que añade a él y el grupo de acciones de la fila del mensaje: cuatro componentes que comparten un único conjunto de reglas de @glacier/logic.',
    fr: 'Le décompte d’emojis sous un message, le sélecteur qui l’enrichit et le groupe d’actions de la ligne du message — quatre composants partageant un seul jeu de règles issu de @glacier/logic.',
    de: 'Die Emoji-Zählung unter einer Nachricht, der Auswähler, der sie ergänzt, und die Aktionsgruppe der Nachrichtenzeile — vier Komponenten, die einen Regelsatz aus @glacier/logic teilen.',
    ja: 'メッセージ下の絵文字集計、それを追加するピッカー、メッセージ行のアクション群 — @glacier/logic の同じルールを共有する 4 つのコンポーネント。',
    pt: 'A contagem de emojis sob uma mensagem, o seletor que adiciona a ela e o grupo de ações da linha da mensagem — quatro componentes que partilham um único conjunto de regras de @glacier/logic.',
    zh: '消息下方的表情统计、添加表情的选择器，以及消息行的操作组——四个组件共享来自 @glacier/logic 的同一套规则。',
    ar: 'حصيلة الرموز التعبيرية أسفل الرسالة، والمنتقي الذي يضيف إليها، ومجموعة الإجراءات في صف الرسالة — أربعة مكونات تتشارك مجموعة قواعد واحدة من @glacier/logic.',
  },

  rxAnatomyPill: {
    en: '`ReactionPill` **is a `FilterChip`**, not a second capsule: the same `button` with `aria-pressed`, the same accent-soft engaged fill, the same press dip and focus ring. Only the label and the tally differ, so the two chips cannot drift apart the first time either is restyled.',
    es: '`ReactionPill` **es un `FilterChip`**, no una segunda cápsula: el mismo `button` con `aria-pressed`, el mismo relleno suave de acento, la misma pulsación y anillo de foco. Solo cambian la etiqueta y el recuento, así que ambos chips no pueden separarse al reestilizar cualquiera de ellos.',
    fr: '`ReactionPill` **est un `FilterChip`**, pas une seconde capsule : le même `button` avec `aria-pressed`, le même remplissage d’accent doux, le même enfoncement et anneau de focus. Seuls le libellé et le décompte changent, donc les deux puces ne peuvent pas diverger dès qu’on restyle l’une d’elles.',
    de: '`ReactionPill` **ist ein `FilterChip`**, keine zweite Kapsel: derselbe `button` mit `aria-pressed`, dieselbe akzentweiche Füllung, dieselbe Druckmulde und derselbe Fokusring. Nur Beschriftung und Zählung unterscheiden sich, sodass beide Chips nicht auseinanderdriften, sobald einer davon umgestaltet wird.',
    ja: '`ReactionPill` は **`FilterChip` そのもの** であり、2 つ目のカプセルではありません。`aria-pressed` を持つ同じ `button`、同じアクセントソフトの選択塗り、同じ押下の沈み込みとフォーカスリング。異なるのはラベルと集計だけなので、どちらかを再スタイルしても両者がずれることはありません。',
    pt: '`ReactionPill` **é um `FilterChip`**, não uma segunda cápsula: o mesmo `button` com `aria-pressed`, o mesmo preenchimento suave de destaque, o mesmo afundamento ao premir e anel de foco. Apenas a etiqueta e a contagem diferem, pelo que os dois chips não podem divergir ao reestilizar qualquer um deles.',
    zh: '`ReactionPill` **就是 `FilterChip`**，不是第二种胶囊：同一个带 `aria-pressed` 的 `button`、同样的强调色柔和填充、同样的按压下沉与焦点环。只有标签和计数不同，所以任一方重新设置样式时两者都不会走样。',
    ar: '`ReactionPill` **هو `FilterChip`** وليس كبسولة ثانية: نفس الـ `button` مع `aria-pressed`، ونفس التعبئة اللينة بلون التمييز، ونفس انخفاض الضغط وحلقة التركيز. يختلف التصنيف والحصيلة فقط، لذا لا يمكن للشريحتين أن تتباعدا عند إعادة تنسيق إحداهما.',
  },
  rxAnatomyBar: {
    en: 'The bar wraps onto as many lines as it needs, caps at eight pills, and renders nothing at all — not an empty box — when there is nothing to show, because a zero-height row still eats the transcript’s row gap.',
    es: 'La barra fluye en tantas líneas como necesite, se limita a ocho pastillas y no renderiza nada —ni una caja vacía— cuando no hay nada que mostrar, porque una fila de altura cero sigue consumiendo el espacio entre filas del historial.',
    fr: 'La barre passe à autant de lignes qu’il faut, plafonne à huit pastilles et ne rend rien du tout — pas même une boîte vide — quand il n’y a rien à montrer, car une ligne de hauteur nulle consomme quand même l’écart de la transcription.',
    de: 'Die Leiste bricht auf so viele Zeilen um, wie sie braucht, begrenzt auf acht Pillen und rendert gar nichts — auch keine leere Box —, wenn es nichts zu zeigen gibt, denn eine Zeile ohne Höhe verbraucht trotzdem den Zeilenabstand des Verlaufs.',
    ja: 'バーは必要なだけ行を折り返し、ピルは 8 個で打ち切り、表示するものが何もなければ空の箱すら描画しません。高さゼロの行でもトランスクリプトの行間を消費してしまうからです。',
    pt: 'A barra flui por tantas linhas quantas precisar, limita-se a oito pastilhas e não renderiza nada — nem uma caixa vazia — quando não há nada a mostrar, porque uma linha de altura zero continua a consumir o espaçamento do histórico.',
    zh: '该栏会按需要换行，最多显示八枚药丸，若无内容则什么也不渲染——连空盒子都没有，因为零高度的行仍会占用消息流的行间距。',
    ar: 'يلتف الشريط على أكبر عدد يلزم من الأسطر، ويتوقف عند ثماني شرائح، ولا يعرض شيئًا على الإطلاق — ولا حتى صندوقًا فارغًا — عندما لا يوجد ما يُعرض، لأن صفًا بارتفاع صفر يستهلك مع ذلك فجوة صفوف السجل.',
  },
  rxAnatomyPicker: {
    en: 'A frequently-used row over a searchable grid. The emoji SET is a prop, never a bundled table: a usable one is localised, skin-toned, grouped, and versioned against whatever Unicode release the platform font actually shipped.',
    es: 'Una fila de uso frecuente sobre una cuadrícula con búsqueda. El CONJUNTO de emojis es una prop, nunca una tabla incluida: uno usable está localizado, con tonos de piel, agrupado y versionado según la versión Unicode que realmente trae la fuente de la plataforma.',
    fr: 'Une rangée d’usage fréquent au-dessus d’une grille cherchable. Le JEU d’emojis est une prop, jamais une table embarquée : un jeu utilisable est localisé, teinté, groupé et versionné selon la version Unicode réellement livrée par la police de la plateforme.',
    de: 'Eine Zeile häufig genutzter Emojis über einem durchsuchbaren Raster. Der Emoji-SATZ ist eine Prop, niemals eine mitgelieferte Tabelle: ein brauchbarer Satz ist lokalisiert, hauttoniert, gruppiert und gegen die Unicode-Version versioniert, die die Plattformschrift tatsächlich mitbringt.',
    ja: '検索可能なグリッドの上に「よく使う」行。絵文字の「セット」は同梱テーブルではなく prop です。実用的なセットはローカライズされ、肌色があり、グループ分けされ、プラットフォームのフォントが実際に載せた Unicode バージョンに合わせて管理されるからです。',
    pt: 'Uma linha de uso frequente sobre uma grelha pesquisável. O CONJUNTO de emojis é uma prop, nunca uma tabela incluída: um conjunto utilizável é localizado, com tons de pele, agrupado e versionado face à versão Unicode que a fonte da plataforma realmente traz.',
    zh: '可搜索网格之上是一行常用表情。表情「集合」是一个 prop，绝不是内置表：可用的集合需要本地化、肤色变体、分组，并与平台字体实际附带的 Unicode 版本对齐。',
    ar: 'صف «الأكثر استخدامًا» فوق شبكة قابلة للبحث. «مجموعة» الرموز التعبيرية هي prop وليست جدولًا مضمّنًا: المجموعة الصالحة للاستخدام مُعرّبة ومتدرجة لون البشرة ومجمّعة ومُصدَّرة وفق إصدار يونيكود الذي يشحنه خط المنصة فعليًا.',
  },
  rxAnatomyActions: {
    en: 'React, reply, thread, and whatever overflows into the menu. The cluster renders an inline-flex bar and takes no position of its own, so a message row can pin it to a bubble’s trailing corner, float it above the row, or stack it inline.',
    es: 'Reaccionar, responder, hilo y lo que desborde al menú. El grupo renderiza una barra inline-flex y no toma posición propia, así una fila de mensaje puede fijarlo a la esquina final de la burbuja, flotarlo sobre la fila o apilarlo en línea.',
    fr: 'Réagir, répondre, fil de discussion, et ce qui déborde dans le menu. Le groupe rend une barre inline-flex et ne prend aucune position propre : une ligne de message peut l’épingler au coin final d’une bulle, le faire flotter au-dessus, ou l’empiler en ligne.',
    de: 'Reagieren, Antworten, Thread und alles, was ins Menü überläuft. Die Gruppe rendert eine Inline-Flex-Leiste und nimmt keine eigene Position ein, sodass eine Nachrichtenzeile sie an die Endkante einer Blase heften, über der Zeile schweben lassen oder inline stapeln kann.',
    ja: 'リアクション、返信、スレッド、そしてメニューに溢れたもの。クラスタは inline-flex のバーを描画するだけで自前の配置を持たないため、メッセージ行は吹き出しの末尾角に固定しても、行の上に浮かせても、インラインに積んでも構いません。',
    pt: 'Reagir, responder, tópico e o que transbordar para o menu. O grupo renderiza uma barra inline-flex e não assume posição própria, para que uma linha de mensagem o possa fixar ao canto final do balão, flutuá-lo acima da linha ou empilhá-lo em linha.',
    zh: '回应、回复、话题，以及溢出到菜单里的其余项。该组只渲染一条 inline-flex 栏，不自带定位，所以消息行可以把它钉在气泡尾角、浮在行上方，或内联堆叠。',
    ar: 'التفاعل والرد والمحادثة الفرعية وما يفيض إلى القائمة. تعرض المجموعة شريطًا inline-flex ولا تتخذ موضعًا خاصًا بها، لذا يمكن لصف الرسالة تثبيتها في الزاوية النهائية للفقاعة أو تعويمها فوق الصف أو تكديسها ضمن السطر.',
  },

  rxExToggleTitle: { en: 'Toggle your own reaction', es: 'Alterna tu propia reacción', fr: 'Basculer votre propre réaction', de: 'Eigene Reaktion umschalten', ja: '自分のリアクションを切り替える', pt: 'Alternar a sua própria reação', zh: '切换你自己的回应', ar: 'تبديل تفاعلك الخاص' },
  rxExToggleDesc: {
    en: 'Press a pill to add or take back your own reaction. Yours carry the accent fill and report `aria-pressed="true"`; everyone else’s stay neutral — "three people agreed" and "three people agreed, including you" must never be the same chip.',
    es: 'Pulsa una pastilla para añadir o retirar tu reacción. Las tuyas llevan el relleno de acento e informan `aria-pressed="true"`; las demás quedan neutras: «tres personas están de acuerdo» y «tres personas están de acuerdo, incluida tú» nunca deben ser el mismo chip.',
    fr: 'Appuyez sur une pastille pour ajouter ou retirer votre réaction. Les vôtres portent le remplissage d’accent et signalent `aria-pressed="true"` ; celles des autres restent neutres — « trois personnes sont d’accord » et « trois personnes sont d’accord, dont vous » ne doivent jamais être la même puce.',
    de: 'Eine Pille drücken, um die eigene Reaktion hinzuzufügen oder zurückzunehmen. Die eigenen tragen die Akzentfüllung und melden `aria-pressed="true"`; die der anderen bleiben neutral — „drei stimmen zu“ und „drei stimmen zu, du eingeschlossen“ dürfen nie derselbe Chip sein.',
    ja: 'ピルを押すと自分のリアクションを追加・取り消しできます。自分のものはアクセント塗りで `aria-pressed="true"` を報告し、他人のものは中立のままです。「3 人が同意」と「あなたを含む 3 人が同意」が同じチップであってはなりません。',
    pt: 'Prima uma pastilha para adicionar ou retirar a sua reação. As suas levam o preenchimento de destaque e reportam `aria-pressed="true"`; as dos outros ficam neutras — «três pessoas concordaram» e «três pessoas concordaram, incluindo você» nunca podem ser o mesmo chip.',
    zh: '按下药丸即可添加或收回你自己的回应。属于你的会带上强调填充并报告 `aria-pressed="true"`，其他人的保持中性——「三个人赞同」和「包括你在内三个人赞同」绝不能是同一枚 chip。',
    ar: 'اضغط شريحة لإضافة تفاعلك أو سحبه. تحمل شرائحك تعبئة لون التمييز وتُبلغ `aria-pressed="true"`، بينما تبقى شرائح الآخرين محايدة — «ثلاثة وافقوا» و«ثلاثة وافقوا، بمن فيهم أنت» يجب ألا تكونا الشريحة نفسها أبدًا.',
  },
  rxExToggleYours: { en: 'Yours: {list}', es: 'Tuyas: {list}', fr: 'Les vôtres : {list}', de: 'Deine: {list}', ja: 'あなたの: {list}', pt: 'Suas: {list}', zh: '你的：{list}', ar: 'لك: {list}' },
  rxExToggleNone: { en: 'You have not reacted yet.', es: 'Todavía no has reaccionado.', fr: 'Vous n’avez pas encore réagi.', de: 'Du hast noch nicht reagiert.', ja: 'まだリアクションしていません。', pt: 'Ainda não reagiu.', zh: '你还没有回应。', ar: 'لم تتفاعل بعد.' },

  rxExOrderTitle: { en: 'First appearance, never count', es: 'Primera aparición, nunca el recuento', fr: 'Première apparition, jamais le décompte', de: 'Erstes Auftreten, nie die Anzahl', ja: '出現順であって、件数順ではない', pt: 'Primeira aparição, nunca a contagem', zh: '按首次出现排序，绝不按计数', ar: 'ترتيب أول ظهور، لا العدد' },
  rxExOrderDesc: {
    en: 'Add a brand-new emoji with a bigger tally than anything already there and it still lands at the end. Count order reshuffles the row the instant somebody else reacts, moving a chip out from under a finger already travelling toward it; first-appearance order only ever grows at the end, so every existing chip keeps its position for the life of the message.',
    es: 'Añade un emoji nuevo con más recuento que cualquiera de los presentes y aun así aparece al final. El orden por recuento reordena la fila en cuanto alguien más reacciona, moviendo un chip de debajo de un dedo que ya iba hacia él; el orden por primera aparición solo crece al final, así cada chip conserva su posición durante toda la vida del mensaje.',
    fr: 'Ajoutez un emoji tout neuf avec un décompte supérieur à tous les autres : il se place quand même à la fin. Le tri par décompte réordonne la rangée dès que quelqu’un réagit, déplaçant une puce sous un doigt déjà en route ; le tri par première apparition ne fait que croître à la fin, donc chaque puce garde sa place pendant toute la vie du message.',
    de: 'Ein brandneues Emoji mit höherer Zählung als alle vorhandenen landet trotzdem am Ende. Sortierung nach Anzahl mischt die Zeile neu, sobald jemand reagiert, und zieht einen Chip unter einem bereits anfliegenden Finger weg; Sortierung nach erstem Auftreten wächst nur am Ende, sodass jeder vorhandene Chip seine Position über die Lebensdauer der Nachricht behält.',
    ja: '既存のどれよりも件数の多い新しい絵文字を追加しても、末尾に置かれます。件数順は誰かがリアクションした瞬間に行を組み替え、すでに向かっている指の下からチップを動かしてしまいます。出現順は末尾にしか伸びないので、既存のチップはメッセージの一生を通じて位置を保ちます。',
    pt: 'Adicione um emoji totalmente novo com uma contagem maior do que qualquer um dos presentes e mesmo assim ele fica no fim. A ordem por contagem baralha a linha assim que alguém reage, tirando um chip debaixo de um dedo já a caminho; a ordem por primeira aparição só cresce no fim, portanto cada chip mantém a sua posição durante toda a vida da mensagem.',
    zh: '添加一个计数高于现有所有表情的全新表情，它仍然排在末尾。按计数排序会在别人回应的瞬间重排整行，把 chip 从已经伸过去的手指下挪走；按首次出现排序只会在末尾增长，因此每枚已有 chip 在消息的整个生命周期里都保持原位。',
    ar: 'أضف رمزًا تعبيريًا جديدًا كليًا بحصيلة أكبر من كل الموجود، وسيظل يحط في النهاية. الترتيب بالعدد يعيد خلط الصف لحظة تفاعل شخص آخر، فينقل الشريحة من تحت إصبع في طريقه إليها؛ أما ترتيب أول ظهور فلا ينمو إلا في النهاية، فتحتفظ كل شريحة قائمة بموضعها طوال عمر الرسالة.',
  },
  rxExOrderAdd: { en: 'Five people react with 🚀', es: 'Cinco personas reaccionan con 🚀', fr: 'Cinq personnes réagissent avec 🚀', de: 'Fünf Personen reagieren mit 🚀', ja: '5 人が 🚀 でリアクション', pt: 'Cinco pessoas reagem com 🚀', zh: '五个人用 🚀 回应', ar: 'خمسة أشخاص يتفاعلون بـ 🚀' },
  rxExOrderReset: { en: 'Reset', es: 'Restablecer', fr: 'Réinitialiser', de: 'Zurücksetzen', ja: 'リセット', pt: 'Repor', zh: '重置', ar: 'إعادة تعيين' },

  rxExCapTitle: { en: 'The cap wraps — it never scrolls or truncates', es: 'El límite envuelve: nunca desplaza ni recorta', fr: 'Le plafond fait passer à la ligne — jamais de défilement ni de troncature', de: 'Die Kappung bricht um — sie scrollt und kürzt nie', ja: '上限は折り返す — スクロールも切り詰めもしない', pt: 'O limite quebra a linha — nunca desliza nem trunca', zh: '上限靠换行处理——绝不滚动或截断', ar: 'الحد يلتف — لا يمرّر ولا يبتر أبدًا' },
  rxExCapDesc: {
    en: 'Twelve emoji at the default cap of eight. The tail folds into one `+N` chip that expands in place — the eight already there keep their exact positions. Narrow the pane and the row flows onto more lines rather than growing a scrollbar or hiding a pill behind an edge.',
    es: 'Doce emojis con el límite por defecto de ocho. La cola se pliega en un chip `+N` que se expande in situ: los ocho ya presentes conservan su posición exacta. Estrecha el panel y la fila fluye a más líneas en lugar de crear una barra de desplazamiento u ocultar una pastilla tras un borde.',
    fr: 'Douze emojis avec le plafond par défaut de huit. La queue se replie en une puce `+N` qui se déplie sur place — les huit déjà présents gardent exactement leur position. Rétrécissez le volet et la rangée passe à la ligne plutôt que d’ajouter une barre de défilement ou de cacher une pastille sous un bord.',
    de: 'Zwölf Emojis bei der Standardkappung von acht. Der Rest klappt in einen `+N`-Chip, der sich an Ort und Stelle ausklappt — die bereits vorhandenen acht behalten ihre exakte Position. Verschmälert man den Bereich, bricht die Zeile um, statt eine Bildlaufleiste zu bekommen oder eine Pille hinter einer Kante zu verstecken.',
    ja: '既定の上限 8 に対して 12 個の絵文字。末尾は 1 つの `+N` チップに畳まれ、その場で展開します — すでにある 8 個は正確に位置を保ちます。ペインを狭めると、行はスクロールバーを生やしたりピルを端に隠したりせず、さらに折り返します。',
    pt: 'Doze emojis com o limite predefinido de oito. A cauda dobra-se num chip `+N` que expande no lugar — os oito já presentes mantêm a posição exata. Estreite o painel e a linha flui para mais linhas em vez de criar uma barra de deslocamento ou esconder uma pastilha atrás de um bordo.',
    zh: '默认上限为八，共十二个表情。尾部折叠成一枚就地展开的 `+N` chip——已有的八枚保持精确位置。收窄面板时，该行会继续换行，而不是长出滚动条或把药丸藏到边缘之外。',
    ar: 'اثنا عشر رمزًا مع الحد الافتراضي ثمانية. يُطوى الذيل في شريحة `+N` واحدة تتوسع في مكانها — وتحتفظ الثماني الموجودة بمواضعها بدقة. ضيّق اللوحة فيلتف الصف على أسطر إضافية بدل إنشاء شريط تمرير أو إخفاء شريحة خلف حافة.',
  },

  rxExPillTitle: { en: 'The pill on its own', es: 'La pastilla por sí sola', fr: 'La pastille seule', de: 'Die Pille für sich', ja: 'ピル単体', pt: 'A pastilha isolada', zh: '单独的药丸', ar: 'الشريحة بمفردها' },
  rxExPillDesc: {
    en: '`pending` lowers emphasis while a toggle is in flight but never disables the chip — a reaction you cannot take back until the server answers is a reaction that feels stuck. `actors` becomes the native hover title. The name is built rather than inherited, so the button is announced as "👍, 3 reactions, you reacted", not as "👍 3".',
    es: '`pending` baja el énfasis mientras un cambio está en vuelo pero nunca deshabilita el chip: una reacción que no puedes retirar hasta que responda el servidor se siente atascada. `actors` se convierte en el título nativo al pasar el cursor. El nombre se construye, no se hereda, así el botón se anuncia como «👍, 3 reacciones, has reaccionado», no como «👍 3».',
    fr: '`pending` réduit l’emphase pendant qu’un basculement est en vol mais ne désactive jamais la puce — une réaction qu’on ne peut retirer avant la réponse du serveur donne une impression de blocage. `actors` devient l’infobulle native. Le nom est construit, pas hérité : le bouton est annoncé « 👍, 3 réactions, vous avez réagi », pas « 👍 3 ».',
    de: '`pending` senkt die Betonung, solange ein Umschalten unterwegs ist, deaktiviert den Chip aber nie — eine Reaktion, die man bis zur Serverantwort nicht zurücknehmen kann, fühlt sich festgefahren an. `actors` wird zum nativen Hover-Titel. Der Name wird gebaut, nicht geerbt: Der Button wird als „👍, 3 Reaktionen, du hast reagiert“ angesagt, nicht als „👍 3“.',
    ja: '`pending` は切り替えが飛んでいる間だけ強調を下げますが、チップを無効化はしません。サーバーが返事をするまで取り消せないリアクションは、詰まったように感じられるからです。`actors` はネイティブのホバータイトルになります。名前は継承ではなく組み立てられるため、ボタンは「👍 3」ではなく「👍、リアクション 3 件、あなたもリアクションしました」と読み上げられます。',
    pt: '`pending` baixa a ênfase enquanto uma alternância está em curso mas nunca desativa o chip — uma reação que não pode retirar até o servidor responder parece encravada. `actors` torna-se o título nativo ao passar o cursor. O nome é construído, não herdado: o botão é anunciado como «👍, 3 reações, você reagiu», não como «👍 3».',
    zh: '`pending` 只在切换在途时降低强调，但绝不禁用该 chip——一个在服务器回应前无法收回的回应会让人觉得卡住。`actors` 会成为原生悬停标题。名称是构造出来的而非继承的，因此按钮会被读作「👍，3 个回应，你已回应」，而不是「👍 3」。',
    ar: '`pending` يخفض التوكيد أثناء تنفيذ التبديل لكنه لا يعطّل الشريحة أبدًا — فالتفاعل الذي لا يمكن سحبه حتى يردّ الخادم يبدو عالقًا. تصبح `actors` عنوان التحويم الأصلي. يُبنى الاسم ولا يُورَّث، فيُعلَن الزر بوصفه «👍، 3 تفاعلات، لقد تفاعلت» لا «👍 3».',
  },

  rxExPickerTitle: { en: 'Choosing an emoji', es: 'Elegir un emoji', fr: 'Choisir un emoji', de: 'Ein Emoji wählen', ja: '絵文字を選ぶ', pt: 'Escolher um emoji', zh: '选择表情', ar: 'اختيار رمز تعبيري' },
  rxExPickerDesc: {
    en: 'The add chip opens the picker; the picker reports a glyph and the bar folds it into the tally. Typing narrows the grid and hides the frequently-used row, because a shortcut is noise the moment you have said what you want.',
    es: 'El chip de añadir abre el selector; el selector informa de un glifo y la barra lo integra en el recuento. Escribir estrecha la cuadrícula y oculta la fila de uso frecuente, porque un atajo es ruido en cuanto ya has dicho lo que quieres.',
    fr: 'La puce d’ajout ouvre le sélecteur ; le sélecteur renvoie un glyphe et la barre l’intègre au décompte. La saisie affine la grille et masque la rangée d’usage fréquent, car un raccourci devient du bruit dès qu’on a dit ce qu’on voulait.',
    de: 'Der Hinzufügen-Chip öffnet den Auswähler; der Auswähler meldet ein Zeichen, und die Leiste faltet es in die Zählung. Tippen verengt das Raster und blendet die Zeile häufig genutzter Emojis aus, denn eine Abkürzung ist Lärm, sobald man gesagt hat, was man will.',
    ja: '追加チップがピッカーを開き、ピッカーは字形を返し、バーがそれを集計に取り込みます。入力するとグリッドが絞り込まれ、「よく使う」行は消えます。欲しいものを口にした時点で、近道はただのノイズだからです。',
    pt: 'O chip de adicionar abre o seletor; o seletor devolve um glifo e a barra integra-o na contagem. Escrever estreita a grelha e esconde a linha de uso frequente, porque um atalho é ruído assim que já disse o que quer.',
    zh: '添加 chip 会打开选择器；选择器返回一个字形，栏把它并入统计。输入会收窄网格并隐藏常用行，因为一旦你说清了想要什么，捷径就成了噪音。',
    ar: 'تفتح شريحة الإضافة المنتقي، ويُبلّغ المنتقي عن رمز فيدمجه الشريط في الحصيلة. الكتابة تضيّق الشبكة وتُخفي صف «الأكثر استخدامًا»، لأن الاختصار يصبح ضجيجًا لحظة أن تقول ما تريد.',
  },

  rxExRevealTitle: { en: 'Three reveal paths, none a fallback for another', es: 'Tres vías de aparición, ninguna sustituta de otra', fr: 'Trois voies d’apparition, aucune n’étant le repli d’une autre', de: 'Drei Enthüllungspfade, keiner ein Ersatz für den anderen', ja: '3 つの出現経路、どれも互いの代替ではない', pt: 'Três vias de revelação, nenhuma substituta da outra', zh: '三条显现路径，彼此都不是替补', ar: 'ثلاثة مسارات للظهور، ولا واحد منها بديل عن الآخر' },
  rxExRevealDesc: {
    en: 'At rest the cluster is `opacity: 0` with `pointer-events: none` — never `display: none`, `visibility: hidden`, or the `hidden` attribute, all of which delete it from the tab order and the accessibility tree. **Pointer:** hover the row and it fades in. **Touch:** under `@media (hover: none)` it is simply always visible, because there is no hover to wait for and a long-press-only affordance is invisible until it is found by accident. **Keyboard:** `:focus-within` beats every rule above, so it appears at the exact moment it becomes operable. A desktop reviewer can only feel the first one; the other two are real all the same.',
    es: 'En reposo el grupo es `opacity: 0` con `pointer-events: none`, nunca `display: none`, `visibility: hidden` ni el atributo `hidden`, que lo borran del orden de tabulación y del árbol de accesibilidad. **Puntero:** al pasar por la fila aparece. **Táctil:** bajo `@media (hover: none)` está siempre visible, porque no hay hover que esperar y una acción solo por pulsación larga es invisible hasta que se descubre por accidente. **Teclado:** `:focus-within` gana a todas las reglas anteriores, así que aparece justo cuando se vuelve operable. Quien revise en escritorio solo puede sentir la primera; las otras dos son igual de reales.',
    fr: 'Au repos, le groupe est en `opacity: 0` avec `pointer-events: none` — jamais `display: none`, `visibility: hidden` ni l’attribut `hidden`, qui le suppriment de l’ordre de tabulation et de l’arbre d’accessibilité. **Pointeur :** survolez la ligne et il apparaît. **Tactile :** sous `@media (hover: none)` il reste toujours visible, car il n’y a pas de survol à attendre et une action accessible seulement par appui long est invisible tant qu’on ne la découvre pas par hasard. **Clavier :** `:focus-within` l’emporte sur toutes les règles ci-dessus, il apparaît donc à l’instant précis où il devient utilisable. Un relecteur sur ordinateur ne peut ressentir que la première ; les deux autres n’en sont pas moins réelles.',
    de: 'Im Ruhezustand ist die Gruppe `opacity: 0` mit `pointer-events: none` — nie `display: none`, `visibility: hidden` oder das `hidden`-Attribut, die sie alle aus der Tab-Reihenfolge und dem Accessibility-Baum löschen. **Zeiger:** Über die Zeile fahren, und sie blendet ein. **Touch:** Unter `@media (hover: none)` ist sie schlicht immer sichtbar, denn es gibt kein Hover zum Abwarten, und eine nur per Langdruck erreichbare Aktion bleibt unsichtbar, bis man sie zufällig findet. **Tastatur:** `:focus-within` schlägt jede Regel darüber, also erscheint sie genau dann, wenn sie bedienbar wird. Am Desktop lässt sich nur die erste erfühlen; die anderen beiden sind trotzdem echt.',
    ja: '静止時のクラスタは `opacity: 0` と `pointer-events: none` です。`display: none`、`visibility: hidden`、`hidden` 属性は決して使いません。いずれもタブ順序とアクセシビリティツリーから消してしまうからです。**ポインタ:** 行をホバーするとフェードインします。**タッチ:** `@media (hover: none)` では常に表示されます。待つべきホバーが存在せず、長押しでしか届かない機能は偶然見つかるまで存在しないのと同じだからです。**キーボード:** `:focus-within` が上のすべての規則に勝つため、操作可能になった瞬間に現れます。デスクトップのレビュアーが体感できるのは 1 つ目だけですが、残る 2 つも同じように実在します。',
    pt: 'Em repouso o grupo é `opacity: 0` com `pointer-events: none` — nunca `display: none`, `visibility: hidden` ou o atributo `hidden`, que o apagam da ordem de tabulação e da árvore de acessibilidade. **Ponteiro:** passe o cursor pela linha e ele aparece. **Toque:** sob `@media (hover: none)` fica sempre visível, porque não há hover pelo qual esperar e uma ação só por pressão longa é invisível até ser descoberta por acaso. **Teclado:** `:focus-within` vence todas as regras acima, portanto aparece exatamente quando se torna operável. Quem revê num computador só sente a primeira; as outras duas são igualmente reais.',
    zh: '静止时该组为 `opacity: 0` 加 `pointer-events: none`——绝不用 `display: none`、`visibility: hidden` 或 `hidden` 属性，这三者都会把它从 Tab 顺序和无障碍树里删掉。**指针：**悬停该行它就淡入。**触摸：**在 `@media (hover: none)` 下它始终可见，因为没有悬停可等，而只能长按触达的功能在被偶然发现前等于不存在。**键盘：**`:focus-within` 胜过上面所有规则，因此它恰好在可操作的那一刻出现。桌面端的评审只能体会第一条，另外两条同样真实。',
    ar: 'في وضع السكون تكون المجموعة `opacity: 0` مع `pointer-events: none` — وليست أبدًا `display: none` أو `visibility: hidden` أو السمة `hidden`، فكلها تحذفها من ترتيب التنقل ومن شجرة الوصول. **المؤشر:** مرّر فوق الصف فتظهر تدريجيًا. **اللمس:** ضمن `@media (hover: none)` تبقى ظاهرة دائمًا، إذ لا يوجد تحويم يُنتظر، وأي إجراء لا يُبلغ إلا بضغطة مطوّلة يظل خفيًا حتى يُكتشف مصادفة. **لوحة المفاتيح:** `:focus-within` يتغلب على كل القواعد أعلاه، فتظهر في اللحظة التي تصبح فيها قابلة للتشغيل. مراجع سطح المكتب لا يستشعر سوى الأول، لكن الاثنين الآخرين حقيقيان تمامًا.',
  },
  rxExRevealTab: { en: 'Tab from here', es: 'Tabula desde aquí', fr: 'Tabulez depuis ici', de: 'Von hier aus tabben', ja: 'ここから Tab', pt: 'Tabule a partir daqui', zh: '从这里按 Tab', ar: 'انتقل بـ Tab من هنا' },
  rxExRevealHint: {
    en: 'Focus the button, then press Tab: the cluster beside it appears because it holds focus, not because anything is hovered. That is the keyboard path, working with no pointer involved.',
    es: 'Enfoca el botón y pulsa Tab: el grupo contiguo aparece porque tiene el foco, no porque algo esté bajo el cursor. Esa es la vía de teclado, funcionando sin puntero alguno.',
    fr: 'Placez le focus sur le bouton, puis appuyez sur Tab : le groupe voisin apparaît parce qu’il détient le focus, pas parce que quelque chose est survolé. C’est la voie clavier, sans le moindre pointeur.',
    de: 'Den Button fokussieren, dann Tab drücken: Die Gruppe daneben erscheint, weil sie den Fokus hält, nicht weil etwas überfahren wird. Das ist der Tastaturpfad, ganz ohne Zeiger.',
    ja: 'ボタンにフォーカスして Tab を押すと、隣のクラスタが現れます。ホバーではなくフォーカスを保持しているからです。ポインタを一切使わないキーボード経路です。',
    pt: 'Foque o botão e prima Tab: o grupo ao lado aparece porque detém o foco, não porque algo está sob o cursor. É a via de teclado, sem qualquer ponteiro envolvido.',
    zh: '聚焦该按钮再按 Tab：旁边的操作组出现，是因为它持有焦点，而不是因为有东西被悬停。这就是键盘路径，全程不涉及指针。',
    ar: 'ركّز على الزر ثم اضغط Tab: تظهر المجموعة المجاورة لأنها تحتفظ بالتركيز، لا لأن شيئًا يُحوَّم فوقه. هذا هو مسار لوحة المفاتيح، ويعمل دون أي مؤشر.',
  },
  rxExRevealAlways: {
    en: '`reveal="always"` pins the cluster open — for a pinned message, a selected row, or any surface that has no hover of its own.',
    es: '`reveal="always"` deja el grupo fijo y abierto: para un mensaje fijado, una fila seleccionada o cualquier superficie sin hover propio.',
    fr: '`reveal="always"` maintient le groupe ouvert — pour un message épinglé, une ligne sélectionnée ou toute surface sans survol propre.',
    de: '`reveal="always"` hält die Gruppe offen — für eine angeheftete Nachricht, eine ausgewählte Zeile oder jede Fläche ohne eigenes Hover.',
    ja: '`reveal="always"` はクラスタを開いたまま固定します。ピン留めされたメッセージ、選択中の行、あるいはホバーを持たない面のために。',
    pt: '`reveal="always"` mantém o grupo aberto — para uma mensagem fixada, uma linha selecionada ou qualquer superfície sem hover próprio.',
    zh: '`reveal="always"` 会让该组常开——用于置顶消息、选中行，或任何自身没有悬停态的表面。',
    ar: '`reveal="always"` يُبقي المجموعة مفتوحة — لرسالة مثبّتة أو صف محدد أو أي سطح لا تحويم له.',
  },
  rxExRevealBubble: { en: 'Ship it Friday?', es: '¿Lo publicamos el viernes?', fr: 'On livre vendredi ?', de: 'Freitag ausliefern?', ja: '金曜にリリースする？', pt: 'Lançamos na sexta?', zh: '周五发布？', ar: 'هل نُطلقه الجمعة؟' },

  rxExMenuTitle: { en: 'The same actions as a menu', es: 'Las mismas acciones como menú', fr: 'Les mêmes actions en menu', de: 'Dieselben Aktionen als Menü', ja: '同じアクションをメニューとして', pt: 'As mesmas ações como menu', zh: '同一组操作作为菜单', ar: 'الإجراءات نفسها كقائمة' },
  rxExMenuDesc: {
    en: '`layout="menu"` renders the identical `actions` array as menu rows for a host’s context menu, so the long-press path and the hover path cannot drift into different action sets. Custom ids rank just before the overflow control, and the reserved ones sort themselves.',
    es: '`layout="menu"` renderiza el mismo array `actions` como filas de menú para el menú contextual del anfitrión, así la vía de pulsación larga y la de hover no pueden divergir en conjuntos distintos. Los ids personalizados se ordenan justo antes del control de desbordamiento, y los reservados se ordenan solos.',
    fr: '`layout="menu"` rend le même tableau `actions` sous forme de lignes de menu pour le menu contextuel de l’hôte : la voie appui long et la voie survol ne peuvent pas diverger. Les ids personnalisés se classent juste avant le contrôle de débordement, et les ids réservés se trient d’eux-mêmes.',
    de: '`layout="menu"` rendert dasselbe `actions`-Array als Menüzeilen für das Kontextmenü des Hosts, sodass Langdruck- und Hover-Pfad nicht in verschiedene Aktionsmengen auseinanderlaufen. Eigene Ids ordnen sich direkt vor dem Überlauf-Control ein, reservierte sortieren sich selbst.',
    ja: '`layout="menu"` は同一の `actions` 配列をホストのコンテキストメニュー向けのメニュー行として描画します。長押し経路とホバー経路が別々のアクション集合に分かれることはありません。独自 id はオーバーフロー操作の直前に、予約済み id は自動で並びます。',
    pt: '`layout="menu"` renderiza o mesmo array `actions` como linhas de menu para o menu de contexto do anfitrião, para que a via de pressão longa e a de hover não divirjam em conjuntos diferentes. Ids personalizados ficam mesmo antes do controlo de transbordo, e os reservados ordenam-se sozinhos.',
    zh: '`layout="menu"` 会把同一个 `actions` 数组渲染成宿主上下文菜单的菜单行，因此长按路径与悬停路径不会分裂成两套操作。自定义 id 排在溢出控件之前，保留 id 会自行排序。',
    ar: '`layout="menu"` يعرض المصفوفة `actions` نفسها كصفوف قائمة لقائمة سياق المضيف، فلا يمكن لمسار الضغط المطوّل ومسار التحويم أن يتباعدا إلى مجموعتَي إجراءات مختلفتين. تُرتَّب المعرفات المخصصة قبل عنصر الفائض مباشرة، بينما تُرتِّب المحجوزة نفسها.',
  },
  rxExMenuTrigger: { en: 'Long press', es: 'Pulsación larga', fr: 'Appui long', de: 'Langer Druck', ja: '長押し', pt: 'Pressão longa', zh: '长按', ar: 'ضغط مطوّل' },

  rxActReact: { en: 'React', es: 'Reaccionar', fr: 'Réagir', de: 'Reagieren', ja: 'リアクション', pt: 'Reagir', zh: '回应', ar: 'تفاعل' },
  rxActReply: { en: 'Reply', es: 'Responder', fr: 'Répondre', de: 'Antworten', ja: '返信', pt: 'Responder', zh: '回复', ar: 'رد' },
  rxActThread: { en: 'Reply in thread', es: 'Responder en el hilo', fr: 'Répondre dans le fil', de: 'Im Thread antworten', ja: 'スレッドで返信', pt: 'Responder no tópico', zh: '在话题中回复', ar: 'الرد في المحادثة' },
  rxActCopy: { en: 'Copy text', es: 'Copiar texto', fr: 'Copier le texte', de: 'Text kopieren', ja: 'テキストをコピー', pt: 'Copiar texto', zh: '复制文本', ar: 'نسخ النص' },
  rxActPin: { en: 'Pin', es: 'Fijar', fr: 'Épingler', de: 'Anheften', ja: 'ピン留め', pt: 'Fixar', zh: '置顶', ar: 'تثبيت' },
  rxActDelete: { en: 'Delete', es: 'Eliminar', fr: 'Supprimer', de: 'Löschen', ja: '削除', pt: 'Eliminar', zh: '删除', ar: 'حذف' },

  rxBarReactions: {
    en: 'The raw records, one per person per emoji. Tallied through the shared aggregate, so the bar cannot count differently from anything else in the suite.',
    es: 'Los registros en bruto, uno por persona y emoji. Se cuentan con el agregado compartido, así la barra no puede contar distinto que el resto del conjunto.',
    fr: 'Les enregistrements bruts, un par personne et par emoji. Comptés via l’agrégat partagé, la barre ne peut donc pas compter autrement que le reste de la suite.',
    de: 'Die Rohdatensätze, einer pro Person und Emoji. Über das gemeinsame Aggregat gezählt, damit die Leiste nicht anders zählt als der Rest der Suite.',
    ja: '生のレコード。1 人 1 絵文字につき 1 件。共有の集計関数を通すため、バーがスイート内の他と違う数え方をすることはありません。',
    pt: 'Os registos brutos, um por pessoa e por emoji. Contados pelo agregado partilhado, para que a barra não conte de forma diferente do resto do conjunto.',
    zh: '原始记录，每人每个表情一条。通过共享聚合函数统计，因此该栏不会与套件中的其他部分算法不一致。',
    ar: 'السجلات الخام، سجل لكل شخص لكل رمز. تُحصى عبر التجميع المشترك، فلا يمكن للشريط أن يعدّ بطريقة مختلفة عن بقية المجموعة.',
  },
  rxBarViewerId: { en: 'Who is looking, so their own reactions paint as engaged.', es: 'Quién mira, para que sus propias reacciones se pinten como activas.', fr: 'Qui regarde, pour que ses propres réactions apparaissent activées.', de: 'Wer zusieht, damit die eigenen Reaktionen als aktiv gezeichnet werden.', ja: '閲覧者。自分のリアクションが選択状態で描かれます。', pt: 'Quem está a ver, para que as suas próprias reações apareçam ativas.', zh: '当前查看者，使其自己的回应呈现为选中态。', ar: 'من ينظر، كي تُرسم تفاعلاته الخاصة بحالة مفعّلة.' },
  rxBarPending: {
    en: 'In-flight toggles, folded into the tally so the bar shows the outcome the user asked for immediately.',
    es: 'Cambios en vuelo, integrados en el recuento para que la barra muestre de inmediato el resultado pedido.',
    fr: 'Basculements en vol, intégrés au décompte pour que la barre montre immédiatement le résultat demandé.',
    de: 'Umschaltungen in Bewegung, in die Zählung eingefaltet, damit die Leiste sofort das gewünschte Ergebnis zeigt.',
    ja: '飛行中の切り替え。集計に折り込まれ、ユーザーが求めた結果をバーが即座に表示します。',
    pt: 'Alternâncias em curso, integradas na contagem para que a barra mostre imediatamente o resultado pedido.',
    zh: '在途的切换，被折入统计，使该栏立即显示用户所要的结果。',
    ar: 'التبديلات قيد التنفيذ، تُدمج في الحصيلة ليعرض الشريط فورًا النتيجة التي طلبها المستخدم.',
  },
  rxBarCap: { en: 'Pills shown before the tail folds into the `+N` chip. Defaults to the shared display cap of eight.', es: 'Pastillas mostradas antes de que la cola se pliegue en el chip `+N`. Por defecto, el límite compartido de ocho.', fr: 'Pastilles affichées avant que la queue ne se replie dans la puce `+N`. Par défaut, le plafond partagé de huit.', de: 'Pillen, die gezeigt werden, bevor der Rest in den `+N`-Chip klappt. Standard ist die gemeinsame Kappung von acht.', ja: '末尾が `+N` チップに畳まれる前に表示するピル数。既定は共有の表示上限 8。', pt: 'Pastilhas mostradas antes de a cauda dobrar no chip `+N`. Por omissão, o limite partilhado de oito.', zh: '尾部折叠为 `+N` chip 之前显示的药丸数量。默认为共享上限八。', ar: 'الشرائح المعروضة قبل أن يُطوى الذيل في شريحة `+N`. الافتراضي هو الحد المشترك ثمانية.' },
  rxBarAdd: { en: 'When the add-a-reaction chip is offered. `auto` withholds it until the message already carries a reaction.', es: 'Cuándo se ofrece el chip de añadir reacción. `auto` lo retiene hasta que el mensaje ya tenga una reacción.', fr: 'Quand la puce d’ajout est proposée. `auto` la retient tant que le message n’a pas déjà une réaction.', de: 'Wann der Hinzufügen-Chip angeboten wird. `auto` hält ihn zurück, bis die Nachricht bereits eine Reaktion trägt.', ja: 'リアクション追加チップを出す条件。`auto` はメッセージがすでにリアクションを持つまで出しません。', pt: 'Quando o chip de adicionar reação é oferecido. `auto` retém-no até a mensagem já ter uma reação.', zh: '何时提供「添加回应」chip。`auto` 会等到消息已有回应才显示。', ar: 'متى تُعرض شريحة إضافة التفاعل. تحجبها `auto` حتى تحمل الرسالة تفاعلًا بالفعل.' },
  rxBarOnToggle: { en: 'Called with the emoji and whether the press is asking to add or to remove.', es: 'Se llama con el emoji y si la pulsación pide añadir o quitar.', fr: 'Appelé avec l’emoji et l’intention de la pression : ajouter ou retirer.', de: 'Wird mit dem Emoji aufgerufen und damit, ob der Druck Hinzufügen oder Entfernen verlangt.', ja: '絵文字と、押下が追加か削除かの意図を伴って呼ばれます。', pt: 'Chamado com o emoji e se a pressão pede adicionar ou remover.', zh: '调用时带上表情，以及本次按下是要添加还是移除。', ar: 'يُستدعى مع الرمز التعبيري ومع كون الضغط يطلب الإضافة أو الإزالة.' },
  rxBarResolveActor: { en: 'Turns an actorId into a display name for the pill’s hover list.', es: 'Convierte un actorId en un nombre visible para la lista al pasar el cursor.', fr: 'Transforme un actorId en nom affichable pour la liste au survol.', de: 'Macht aus einer actorId einen Anzeigenamen für die Hover-Liste der Pille.', ja: 'actorId をピルのホバー一覧用の表示名に変換します。', pt: 'Converte um actorId num nome visível para a lista ao passar o cursor.', zh: '把 actorId 转成药丸悬停列表里的显示名。', ar: 'يحوّل actorId إلى اسم معروض لقائمة التحويم على الشريحة.' },

  rxPillEmoji: { en: 'The glyph, compared as-is; the caller owns any normalisation.', es: 'El glifo, comparado tal cual; quien llama se encarga de normalizar.', fr: 'Le glyphe, comparé tel quel ; l’appelant gère la normalisation.', de: 'Das Zeichen, unverändert verglichen; der Aufrufer verantwortet jede Normalisierung.', ja: '字形。そのまま比較され、正規化は呼び出し側の責任です。', pt: 'O glifo, comparado tal como está; quem chama trata da normalização.', zh: '字形，按原样比较；归一化由调用方负责。', ar: 'الرمز، يُقارَن كما هو؛ والمستدعي مسؤول عن أي تسوية.' },
  rxPillCount: { en: 'How many people reacted with it.', es: 'Cuántas personas reaccionaron con él.', fr: 'Combien de personnes ont réagi avec.', de: 'Wie viele Personen damit reagiert haben.', ja: 'それでリアクションした人数。', pt: 'Quantas pessoas reagiram com ele.', zh: '有多少人用它回应。', ar: 'كم شخصًا تفاعل به.' },
  rxPillReacted: { en: 'The viewer is one of them. Paints the engaged state and flips the intent to `remove`.', es: 'El espectador es uno de ellos. Pinta el estado activo y cambia la intención a `remove`.', fr: 'Le lecteur en fait partie. Peint l’état activé et bascule l’intention sur `remove`.', de: 'Der Betrachter ist einer davon. Zeichnet den aktiven Zustand und dreht die Absicht auf `remove`.', ja: '閲覧者もその一人。選択状態を描き、意図を `remove` に反転します。', pt: 'O leitor é um deles. Pinta o estado ativo e inverte a intenção para `remove`.', zh: '查看者也是其中之一。绘制选中态并把意图翻转为 `remove`。', ar: 'المشاهد واحد منهم. يرسم الحالة المفعّلة ويقلب النية إلى `remove`.' },
  rxPillPending: { en: 'An add or remove is in flight. Lowers emphasis; never disables.', es: 'Hay un añadir o quitar en vuelo. Baja el énfasis; nunca deshabilita.', fr: 'Un ajout ou un retrait est en vol. Réduit l’emphase ; ne désactive jamais.', de: 'Ein Hinzufügen oder Entfernen ist unterwegs. Senkt die Betonung; deaktiviert nie.', ja: '追加または削除が飛行中。強調を下げますが無効化はしません。', pt: 'Há uma adição ou remoção em curso. Baixa a ênfase; nunca desativa.', zh: '有一次添加或移除在途。降低强调，但绝不禁用。', ar: 'هناك إضافة أو إزالة قيد التنفيذ. يخفض التوكيد ولا يعطّل أبدًا.' },
  rxPillActors: { en: 'Who reacted, as display names. Shown as the native hover title.', es: 'Quiénes reaccionaron, como nombres visibles. Se muestra como título nativo al pasar el cursor.', fr: 'Qui a réagi, en noms affichables. Affiché comme infobulle native.', de: 'Wer reagiert hat, als Anzeigenamen. Wird als nativer Hover-Titel gezeigt.', ja: 'リアクションした人の表示名。ネイティブのホバータイトルとして表示されます。', pt: 'Quem reagiu, como nomes visíveis. Mostrado como título nativo ao passar o cursor.', zh: '回应者的显示名。作为原生悬停标题展示。', ar: 'من تفاعلوا، بأسمائهم المعروضة. تظهر كعنوان تحويم أصلي.' },
  rxPillLabels: { en: 'Overrides the four accessible-name templates, merged over the translated defaults.', es: 'Sobrescribe las cuatro plantillas de nombre accesible, fusionadas sobre las traducciones por defecto.', fr: 'Remplace les quatre modèles de nom accessible, fusionnés par-dessus les valeurs traduites.', de: 'Überschreibt die vier Vorlagen für den zugänglichen Namen, über die übersetzten Standardwerte gelegt.', ja: 'アクセシブル名の 4 つのテンプレートを上書きし、翻訳済み既定値にマージされます。', pt: 'Substitui os quatro modelos de nome acessível, fundidos sobre os predefinidos traduzidos.', zh: '覆盖四个无障碍名称模板，合并到已翻译的默认值之上。', ar: 'يتجاوز قوالب الاسم الميسّر الأربعة، مدموجة فوق الافتراضيات المترجمة.' },

  rxPickerEmojis: { en: 'The choosable set. A prop with a small default, never a bundled dataset — a design system must not own the emoji table.', es: 'El conjunto elegible. Una prop con un valor por defecto pequeño, nunca un dataset incluido: un sistema de diseño no debe poseer la tabla de emojis.', fr: 'Le jeu sélectionnable. Une prop avec un petit défaut, jamais un jeu de données embarqué — un design system ne doit pas posséder la table des emojis.', de: 'Der wählbare Satz. Eine Prop mit kleinem Standard, nie ein mitgeliefertes Dataset — ein Designsystem darf die Emoji-Tabelle nicht besitzen.', ja: '選択可能なセット。小さな既定値を持つ prop であり、同梱データセットではありません。デザインシステムが絵文字表を所有すべきではないからです。', pt: 'O conjunto selecionável. Uma prop com um pequeno valor por omissão, nunca um conjunto de dados incluído — um design system não deve possuir a tabela de emojis.', zh: '可选集合。一个带小型默认值的 prop，绝非内置数据集——设计系统不应拥有表情表。', ar: 'المجموعة القابلة للاختيار. prop بقيمة افتراضية صغيرة وليست مجموعة بيانات مضمّنة — لا ينبغي لنظام تصميم أن يمتلك جدول الرموز.' },
  rxPickerFrequent: { en: 'The frequently-used row, as glyphs. Pass the viewer’s own; defaults to the shared eight.', es: 'La fila de uso frecuente, como glifos. Pasa los del propio usuario; por defecto, los ocho compartidos.', fr: 'La rangée d’usage fréquent, en glyphes. Passez ceux du lecteur ; par défaut les huit partagés.', de: 'Die Zeile häufig genutzter Emojis, als Zeichen. Übergib die des Betrachters; Standard sind die gemeinsamen acht.', ja: '「よく使う」行の字形。閲覧者自身のものを渡します。既定は共有の 8 個。', pt: 'A linha de uso frequente, em glifos. Passe os do próprio leitor; por omissão, os oito partilhados.', zh: '常用行，以字形表示。传入查看者自己的；默认是共享的八个。', ar: 'صف «الأكثر استخدامًا» كرموز. مرّر رموز المستخدم نفسه؛ والافتراضي هو الثمانية المشتركة.' },
  rxPickerColumns: { en: 'Grid width, and the vertical arrow stride.', es: 'Ancho de la cuadrícula y salto vertical de las flechas.', fr: 'Largeur de la grille, et pas vertical des flèches.', de: 'Rasterbreite und vertikale Schrittweite der Pfeiltasten.', ja: 'グリッドの幅であり、上下矢印の移動幅。', pt: 'Largura da grelha e o passo vertical das setas.', zh: '网格宽度，同时也是上下方向键的步长。', ar: 'عرض الشبكة، وخطوة الأسهم الرأسية.' },
  rxPickerOnSelect: { en: 'Called with the chosen glyph.', es: 'Se llama con el glifo elegido.', fr: 'Appelé avec le glyphe choisi.', de: 'Wird mit dem gewählten Zeichen aufgerufen.', ja: '選ばれた字形とともに呼ばれます。', pt: 'Chamado com o glifo escolhido.', zh: '调用时带上所选字形。', ar: 'يُستدعى مع الرمز المختار.' },
  rxPickerReacted: { en: 'Glyphs the viewer already used here; their cells report `aria-pressed`.', es: 'Glifos que el usuario ya usó aquí; sus celdas informan `aria-pressed`.', fr: 'Glyphes déjà utilisés ici par le lecteur ; leurs cellules signalent `aria-pressed`.', de: 'Zeichen, die der Betrachter hier bereits genutzt hat; ihre Zellen melden `aria-pressed`.', ja: '閲覧者がここで既に使った字形。そのセルは `aria-pressed` を報告します。', pt: 'Glifos que o leitor já usou aqui; as suas células reportam `aria-pressed`.', zh: '查看者已在此处使用过的字形；其单元格会报告 `aria-pressed`。', ar: 'الرموز التي استخدمها المشاهد هنا بالفعل؛ تُبلغ خلاياها عن `aria-pressed`.' },
  rxPickerSkeleton: { en: 'Renders a placeholder with the panel’s exact geometry.', es: 'Renderiza un marcador con la geometría exacta del panel.', fr: 'Rend un substitut avec la géométrie exacte du panneau.', de: 'Rendert einen Platzhalter mit der exakten Geometrie des Panels.', ja: 'パネルとまったく同じ寸法のプレースホルダーを描画します。', pt: 'Renderiza um marcador com a geometria exata do painel.', zh: '渲染与面板几何完全一致的占位。', ar: 'يعرض عنصرًا نائبًا بأبعاد اللوحة نفسها بالضبط.' },

  rxMaActions: { en: 'What this message offers. Data, not children, so both layouts render the same set.', es: 'Lo que ofrece este mensaje. Datos, no hijos, así ambos layouts renderizan el mismo conjunto.', fr: 'Ce que ce message propose. Des données, pas des enfants, pour que les deux dispositions rendent le même ensemble.', de: 'Was diese Nachricht anbietet. Daten, keine Children, damit beide Layouts denselben Satz rendern.', ja: 'このメッセージが提供するもの。children ではなくデータなので、両レイアウトが同じ集合を描画します。', pt: 'O que esta mensagem oferece. Dados, não filhos, para que ambos os layouts rendam o mesmo conjunto.', zh: '这条消息提供的操作。是数据而非 children，因此两种布局渲染同一组。', ar: 'ما تقدمه هذه الرسالة. بيانات لا أبناء، كي يعرض التخطيطان المجموعة نفسها.' },
  rxMaLayout: { en: 'The floating toolbar, or the same actions as menu rows for a host `ContextMenu`.', es: 'La barra flotante, o las mismas acciones como filas de menú para un `ContextMenu` anfitrión.', fr: 'La barre flottante, ou les mêmes actions en lignes de menu pour un `ContextMenu` hôte.', de: 'Die schwebende Werkzeugleiste oder dieselben Aktionen als Menüzeilen für ein Host-`ContextMenu`.', ja: 'フローティングツールバー、またはホストの `ContextMenu` 用に同じアクションをメニュー行として。', pt: 'A barra flutuante, ou as mesmas ações como linhas de menu para um `ContextMenu` anfitrião.', zh: '浮动工具栏，或把同一批操作作为宿主 `ContextMenu` 的菜单行。', ar: 'شريط الأدوات العائم، أو الإجراءات نفسها كصفوف قائمة لـ `ContextMenu` مضيف.' },
  rxMaReveal: { en: 'Whether the cluster rests hidden. Ignored where the pointer is coarse.', es: 'Si el grupo permanece oculto en reposo. Se ignora donde el puntero es grueso.', fr: 'Si le groupe reste masqué au repos. Ignoré là où le pointeur est grossier.', de: 'Ob die Gruppe im Ruhezustand verborgen bleibt. Wird bei grobem Zeiger ignoriert.', ja: 'クラスタが静止時に隠れるかどうか。粗いポインタでは無視されます。', pt: 'Se o grupo permanece oculto em repouso. Ignorado onde o ponteiro é grosseiro.', zh: '该组在静止时是否隐藏。在粗指针环境下会被忽略。', ar: 'ما إذا كانت المجموعة تبقى مخفية في السكون. يُتجاهل حيث يكون المؤشر خشنًا.' },
  rxMaVisible: { en: 'Host-driven reveal, from its own row hover or long-press state. Wins over `reveal`.', es: 'Aparición dirigida por el anfitrión, desde su propio hover de fila o pulsación larga. Gana sobre `reveal`.', fr: 'Apparition pilotée par l’hôte, depuis son propre survol de ligne ou appui long. L’emporte sur `reveal`.', de: 'Vom Host gesteuerte Enthüllung, aus dessen eigenem Zeilen-Hover oder Langdruck. Schlägt `reveal`.', ja: 'ホスト側の行ホバーや長押し状態による表示制御。`reveal` より優先されます。', pt: 'Revelação conduzida pelo anfitrião, a partir do seu próprio hover de linha ou pressão longa. Vence `reveal`.', zh: '由宿主驱动的显现，来自它自己的行悬停或长按状态。优先级高于 `reveal`。', ar: 'ظهور يقوده المضيف من تحويم صفه أو ضغطه المطوّل. يتغلب على `reveal`.' },
  rxMaInlineCap: { en: 'How many actions stay inline before the rest fold into the overflow menu.', es: 'Cuántas acciones quedan en línea antes de que el resto se pliegue en el menú de desbordamiento.', fr: 'Combien d’actions restent en ligne avant que le reste ne se replie dans le menu de débordement.', de: 'Wie viele Aktionen inline bleiben, bevor der Rest ins Überlaufmenü klappt.', ja: '残りがオーバーフローメニューに畳まれるまでに、インラインで残すアクション数。', pt: 'Quantas ações ficam em linha antes de as restantes dobrarem no menu de transbordo.', zh: '在其余项折入溢出菜单之前，保持内联的操作数量。', ar: 'كم إجراءً يبقى ضمن السطر قبل أن ينطوي الباقي في قائمة الفائض.' },

  rxA11y1: {
    en: 'The bar is a `toolbar` named "Reactions" with a roving tabindex: one tab stop, not one per pill. A transcript of fifty messages with six reactions each would otherwise put three hundred stops between the reader and the composer.',
    es: 'La barra es un `toolbar` llamado «Reacciones» con tabindex móvil: una parada de tabulación, no una por pastilla. Un historial de cincuenta mensajes con seis reacciones cada uno pondría si no trescientas paradas entre el lector y el redactor.',
    fr: 'La barre est un `toolbar` nommé « Réactions » avec un tabindex mobile : un seul arrêt de tabulation, pas un par pastille. Une transcription de cinquante messages à six réactions chacun mettrait sinon trois cents arrêts entre le lecteur et le champ de saisie.',
    de: 'Die Leiste ist eine `toolbar` namens „Reaktionen“ mit wanderndem Tabindex: ein Tab-Stopp, nicht einer pro Pille. Ein Verlauf mit fünfzig Nachrichten zu je sechs Reaktionen läge sonst mit dreihundert Stopps zwischen Leser und Eingabefeld.',
    ja: 'バーはローミング tabindex を持つ「リアクション」という名の `toolbar` です。タブ停止はピルごとではなく 1 つだけ。さもなければ、各 6 件のリアクションを持つ 50 通のトランスクリプトが、読み手と入力欄の間に 300 の停止を置くことになります。',
    pt: 'A barra é um `toolbar` chamado «Reações» com tabindex móvel: uma paragem de tabulação, não uma por pastilha. Um histórico de cinquenta mensagens com seis reações cada colocaria, de outro modo, trezentas paragens entre o leitor e o campo de escrita.',
    zh: '该栏是一个名为「回应」的 `toolbar`，采用漫游 tabindex：整栏只有一个 Tab 停靠点，而不是每枚药丸一个。否则五十条各带六个回应的消息，会在阅读者与输入框之间塞进三百个停靠点。',
    ar: 'الشريط هو `toolbar` باسم «التفاعلات» مع tabindex متجول: محطة تنقل واحدة لا واحدة لكل شريحة. وإلا فإن سجلًا من خمسين رسالة بست تفاعلات لكل منها يضع ثلاثمائة محطة بين القارئ وحقل الكتابة.',
  },
  rxA11y2: {
    en: 'Arrow keys move between pills and wrap at the ends, inverted under RTL; `Home` and `End` jump to the ends. `Enter`, `Space`, and `Tab` fall through untouched, or the pill under the cursor would stop being pressable.',
    es: 'Las flechas mueven entre pastillas y envuelven en los extremos, invertidas en RTL; `Home` y `End` saltan a los extremos. `Enter`, `Space` y `Tab` pasan sin tocarse, o la pastilla bajo el cursor dejaría de poder pulsarse.',
    fr: 'Les flèches déplacent entre pastilles et bouclent aux extrémités, inversées en RTL ; `Home` et `End` sautent aux extrémités. `Enter`, `Space` et `Tab` passent intacts, sinon la pastille sous le curseur cesserait d’être activable.',
    de: 'Pfeiltasten bewegen zwischen Pillen und laufen an den Enden um, unter RTL invertiert; `Home` und `End` springen an die Enden. `Enter`, `Space` und `Tab` fallen unberührt durch, sonst wäre die Pille unter dem Cursor nicht mehr drückbar.',
    ja: '矢印キーはピル間を移動し端で回り込み、RTL では反転します。`Home` と `End` は両端へ。`Enter`、`Space`、`Tab` はそのまま通します。さもないとカーソル下のピルが押せなくなります。',
    pt: 'As setas movem-se entre pastilhas e dão a volta nos extremos, invertidas em RTL; `Home` e `End` saltam para os extremos. `Enter`, `Space` e `Tab` passam intactos, ou a pastilha sob o cursor deixaria de ser premível.',
    zh: '方向键在药丸之间移动并在两端回绕，RTL 下方向反转；`Home` 与 `End` 跳到两端。`Enter`、`Space`、`Tab` 原样放行，否则光标下的药丸就按不动了。',
    ar: 'تنقل الأسهم بين الشرائح وتلتف عند الطرفين، وتنعكس في RTL؛ و`Home` و`End` تقفزان إلى الطرفين. أما `Enter` و`Space` و`Tab` فتمر دون مساس، وإلا لتوقفت الشريحة تحت المؤشر عن كونها قابلة للضغط.',
  },
  rxA11y3: {
    en: 'A pill’s accessible name is built, not inherited: "👍, 3 reactions, you reacted" rather than a button called "👍 3". The glyph and the count are `aria-hidden`, so the tally is never read twice.',
    es: 'El nombre accesible de una pastilla se construye, no se hereda: «👍, 3 reacciones, has reaccionado» en vez de un botón llamado «👍 3». El glifo y el recuento son `aria-hidden`, así el recuento nunca se lee dos veces.',
    fr: 'Le nom accessible d’une pastille est construit, pas hérité : « 👍, 3 réactions, vous avez réagi » plutôt qu’un bouton nommé « 👍 3 ». Le glyphe et le décompte sont `aria-hidden`, donc le total n’est jamais lu deux fois.',
    de: 'Der zugängliche Name einer Pille wird gebaut, nicht geerbt: „👍, 3 Reaktionen, du hast reagiert“ statt eines Buttons namens „👍 3“. Zeichen und Zählung sind `aria-hidden`, damit die Summe nie zweimal gelesen wird.',
    ja: 'ピルのアクセシブル名は継承ではなく構築されます。「👍 3」という名のボタンではなく「👍、リアクション 3 件、あなたもリアクションしました」。字形と数値は `aria-hidden` なので、集計が二度読まれることはありません。',
    pt: 'O nome acessível de uma pastilha é construído, não herdado: «👍, 3 reações, você reagiu» em vez de um botão chamado «👍 3». O glifo e a contagem são `aria-hidden`, para que o total nunca seja lido duas vezes.',
    zh: '药丸的无障碍名称是构造的而非继承的：读作「👍，3 个回应，你已回应」，而不是一个叫「👍 3」的按钮。字形与计数都是 `aria-hidden`，因此统计不会被读两遍。',
    ar: 'يُبنى الاسم الميسّر للشريحة ولا يُورَّث: «👍، 3 تفاعلات، لقد تفاعلت» بدل زر اسمه «👍 3». الرمز والعدد كلاهما `aria-hidden`، فلا تُقرأ الحصيلة مرتين.',
  },
  rxA11y4: {
    en: 'Picker cells are named by the emoji’s NAME, never the glyph — screen readers announce unlabelled emoji inconsistently, and voice control cannot say a picture. Three tab stops in the panel: the search field, the frequent row, the grid.',
    es: 'Las celdas del selector se nombran por el NOMBRE del emoji, nunca por el glifo: los lectores de pantalla anuncian los emojis sin etiqueta de forma inconsistente y el control por voz no puede decir una imagen. Tres paradas de tabulación en el panel: el campo de búsqueda, la fila frecuente y la cuadrícula.',
    fr: 'Les cellules du sélecteur sont nommées par le NOM de l’emoji, jamais par le glyphe — les lecteurs d’écran annoncent les emojis non étiquetés de façon incohérente, et la commande vocale ne peut pas prononcer une image. Trois arrêts de tabulation dans le panneau : le champ de recherche, la rangée fréquente, la grille.',
    de: 'Auswähler-Zellen werden über den NAMEN des Emojis benannt, nie über das Zeichen — Screenreader kündigen unbeschriftete Emojis uneinheitlich an, und Sprachsteuerung kann kein Bild aussprechen. Drei Tab-Stopps im Panel: Suchfeld, Häufig-Zeile, Raster.',
    ja: 'ピッカーのセルは字形ではなく絵文字の「名前」で命名します。ラベルのない絵文字の読み上げはスクリーンリーダーごとに一貫せず、音声コントロールは絵を発話できないからです。パネル内のタブ停止は 3 つ: 検索欄、よく使う行、グリッド。',
    pt: 'As células do seletor são nomeadas pelo NOME do emoji, nunca pelo glifo — os leitores de ecrã anunciam emojis sem etiqueta de forma inconsistente, e o controlo por voz não consegue dizer uma imagem. Três paragens de tabulação no painel: o campo de pesquisa, a linha frequente, a grelha.',
    zh: '选择器单元格以表情的「名称」命名，绝不用字形——屏幕阅读器对未标注表情的播报并不一致，而语音控制无法念出一幅图。面板内共三个 Tab 停靠点：搜索框、常用行、网格。',
    ar: 'تُسمّى خلايا المنتقي باسم الرمز التعبيري لا بالرمز نفسه — فقارئات الشاشة تنطق الرموز غير المُسمّاة بصور متضاربة، والتحكم الصوتي لا يستطيع نطق صورة. ثلاث محطات تنقل داخل اللوحة: حقل البحث، وصف الأكثر استخدامًا، والشبكة.',
  },
  rxA11y5: {
    en: 'The action cluster rests at `opacity: 0` with `pointer-events: none`, never `display: none` or `hidden`: those remove it from the tab order and the accessibility tree, which is how a chat UI ends up with a reply button that does not exist for anyone without a mouse.',
    es: 'El grupo de acciones reposa en `opacity: 0` con `pointer-events: none`, nunca `display: none` ni `hidden`: eso lo quita del orden de tabulación y del árbol de accesibilidad, y así una interfaz de chat acaba con un botón de responder que no existe para quien no tiene ratón.',
    fr: 'Le groupe d’actions repose en `opacity: 0` avec `pointer-events: none`, jamais `display: none` ni `hidden` : ceux-ci le retirent de l’ordre de tabulation et de l’arbre d’accessibilité, et c’est ainsi qu’une interface de chat finit avec un bouton de réponse qui n’existe pas sans souris.',
    de: 'Die Aktionsgruppe ruht bei `opacity: 0` mit `pointer-events: none`, nie `display: none` oder `hidden`: Diese entfernen sie aus Tab-Reihenfolge und Accessibility-Baum — so endet eine Chat-Oberfläche mit einem Antworten-Button, den es ohne Maus nicht gibt.',
    ja: 'アクションクラスタは `opacity: 0` と `pointer-events: none` で待機します。`display: none` や `hidden` は使いません。これらはタブ順序とアクセシビリティツリーから消してしまい、マウスのない人には存在しない返信ボタン、というチャット UI がこうして生まれます。',
    pt: 'O grupo de ações repousa em `opacity: 0` com `pointer-events: none`, nunca `display: none` ou `hidden`: estes removem-no da ordem de tabulação e da árvore de acessibilidade, e é assim que uma interface de chat acaba com um botão de responder que não existe para quem não tem rato.',
    zh: '操作组静止时使用 `opacity: 0` 加 `pointer-events: none`，绝不用 `display: none` 或 `hidden`：那会把它从 Tab 顺序和无障碍树里移除——聊天界面里「没有鼠标就不存在的回复按钮」正是这么来的。',
    ar: 'تستقر مجموعة الإجراءات على `opacity: 0` مع `pointer-events: none`، لا على `display: none` أو `hidden` أبدًا: فهذه تزيلها من ترتيب التنقل ومن شجرة الوصول، وهكذا ينتهي واجهة محادثة بزر رد لا وجود له لمن لا يملك فأرة.',
  },

  rxUse1: {
    en: 'Keep the tally on the server and drive `reactions` + `viewerId` from it. There is deliberately no uncontrolled path: the state is not the component’s to own.',
    es: 'Mantén el recuento en el servidor y alimenta `reactions` + `viewerId` desde ahí. No hay vía no controlada a propósito: el estado no pertenece al componente.',
    fr: 'Gardez le décompte sur le serveur et alimentez `reactions` + `viewerId` depuis lui. Il n’y a délibérément aucune voie non contrôlée : cet état n’appartient pas au composant.',
    de: 'Die Zählung gehört auf den Server; `reactions` + `viewerId` werden von dort gespeist. Es gibt bewusst keinen unkontrollierten Pfad: Dieser Zustand gehört nicht der Komponente.',
    ja: '集計はサーバーに置き、`reactions` と `viewerId` をそこから供給します。非制御の経路は意図的にありません。この状態はコンポーネントの持ち物ではないからです。',
    pt: 'Mantenha a contagem no servidor e alimente `reactions` + `viewerId` a partir dela. Não há via não controlada de propósito: este estado não pertence ao componente.',
    zh: '把统计放在服务端，用它驱动 `reactions` 与 `viewerId`。刻意不提供非受控路径：这份状态不归组件所有。',
    ar: 'احتفظ بالحصيلة على الخادم وغذِّ منها `reactions` و`viewerId`. لا يوجد مسار غير مُتحكَّم فيه عن قصد: هذه الحالة ليست ملكًا للمكوّن.',
  },
  rxUse2: {
    en: 'Pass optimistic toggles through `pending` rather than mutating `reactions`: the bar folds them into the tally and lowers the pill’s emphasis until the acknowledgement lands.',
    es: 'Pasa los cambios optimistas por `pending` en lugar de mutar `reactions`: la barra los integra en el recuento y baja el énfasis de la pastilla hasta que llegue la confirmación.',
    fr: 'Passez les basculements optimistes par `pending` plutôt que de muter `reactions` : la barre les intègre au décompte et réduit l’emphase de la pastille jusqu’à l’accusé de réception.',
    de: 'Optimistische Umschaltungen über `pending` reichen statt `reactions` zu mutieren: Die Leiste faltet sie in die Zählung und senkt die Betonung der Pille bis zur Bestätigung.',
    ja: '楽観的な切り替えは `reactions` を書き換えず `pending` で渡します。バーはそれを集計に折り込み、確認が届くまでピルの強調を下げます。',
    pt: 'Passe as alternâncias otimistas por `pending` em vez de mutar `reactions`: a barra integra-as na contagem e baixa a ênfase da pastilha até chegar a confirmação.',
    zh: '把乐观更新通过 `pending` 传入，而不要直接改 `reactions`：该栏会把它折入统计，并在确认到达前降低药丸的强调。',
    ar: 'مرّر التبديلات التفاؤلية عبر `pending` بدل تعديل `reactions`: يدمجها الشريط في الحصيلة ويخفض توكيد الشريحة حتى وصول الإقرار.',
  },
  rxUse3: {
    en: 'Leave `add="auto"`. On a bare message the action cluster already owns the react affordance, and a second permanent plus under every row competes with it for the same job.',
    es: 'Deja `add="auto"`. En un mensaje sin reacciones el grupo de acciones ya ofrece reaccionar, y un segundo «más» permanente bajo cada fila compite por el mismo trabajo.',
    fr: 'Laissez `add="auto"`. Sur un message nu, le groupe d’actions porte déjà l’affordance de réaction, et un second plus permanent sous chaque ligne lui fait concurrence pour le même rôle.',
    de: 'Belasse `add="auto"`. Bei einer nackten Nachricht trägt die Aktionsgruppe die Reagieren-Affordanz bereits, und ein zweites dauerhaftes Plus unter jeder Zeile konkurriert damit um dieselbe Aufgabe.',
    ja: '`add="auto"` のままにしてください。リアクションのないメッセージでは、すでにアクションクラスタがリアクション手段を担っており、各行の下に常設の 2 つ目のプラスは同じ役割を奪い合います。',
    pt: 'Deixe `add="auto"`. Numa mensagem sem reações o grupo de ações já detém a affordance de reagir, e um segundo mais permanente sob cada linha compete pela mesma função.',
    zh: '保持 `add="auto"`。在没有回应的消息上，操作组已经承担了「回应」这个入口，每行底下再挂一个常驻加号只会与它争抢同一职责。',
    ar: 'اترك `add="auto"`. في رسالة خالية تمتلك مجموعة الإجراءات بالفعل مدخل التفاعل، وعلامة زائد دائمة ثانية أسفل كل صف تنافسها على الوظيفة نفسها.',
  },
  rxUse4: {
    en: 'Give the long-press path the same `actions` array as the cluster, through `layout="menu"`, so a touch user and a mouse user are never offered different things.',
    es: 'Da a la vía de pulsación larga el mismo array `actions` que al grupo, mediante `layout="menu"`, para que quien usa el táctil y quien usa el ratón nunca vean cosas distintas.',
    fr: 'Donnez à la voie appui long le même tableau `actions` qu’au groupe, via `layout="menu"`, pour qu’un utilisateur tactile et un utilisateur souris ne se voient jamais proposer des choses différentes.',
    de: 'Gib dem Langdruck-Pfad dasselbe `actions`-Array wie der Gruppe, über `layout="menu"`, damit Touch- und Maus-Nutzer nie Unterschiedliches angeboten bekommen.',
    ja: '長押し経路にも `layout="menu"` を通じてクラスタと同じ `actions` 配列を渡し、タッチ利用者とマウス利用者に別のものが提示されないようにします。',
    pt: 'Dê à via de pressão longa o mesmo array `actions` do grupo, através de `layout="menu"`, para que um utilizador de toque e um de rato nunca vejam coisas diferentes.',
    zh: '通过 `layout="menu"` 把与操作组完全相同的 `actions` 数组交给长按路径，这样触摸用户与鼠标用户永远不会看到不同的选项。',
    ar: 'امنح مسار الضغط المطوّل المصفوفة `actions` نفسها التي تستخدمها المجموعة، عبر `layout="menu"`، كي لا يُعرض على مستخدم اللمس ومستخدم الفأرة شيئان مختلفان.',
  },
  rxUse5: {
    en: 'Do not sort the bar by count, and do not hoist the viewer’s own reaction to the front. Both break the one invariant the row is built on: a chip never moves.',
    es: 'No ordenes la barra por recuento ni adelantes la reacción propia del usuario. Ambas cosas rompen la única invariante sobre la que se construye la fila: un chip nunca se mueve.',
    fr: 'Ne triez pas la barre par décompte et ne remontez pas la réaction du lecteur en tête. Les deux brisent l’unique invariant sur lequel la rangée repose : une puce ne bouge jamais.',
    de: 'Sortiere die Leiste nicht nach Anzahl und ziehe die eigene Reaktion des Betrachters nicht nach vorne. Beides bricht die eine Invariante, auf der die Zeile steht: Ein Chip bewegt sich nie.',
    ja: 'バーを件数で並べ替えないでください。閲覧者自身のリアクションを先頭に繰り上げるのも同様です。どちらもこの行が拠って立つ唯一の不変条件 — チップは決して動かない — を壊します。',
    pt: 'Não ordene a barra por contagem nem promova a reação do próprio leitor para a frente. Ambas quebram a única invariante em que a linha assenta: um chip nunca se move.',
    zh: '不要按计数排序，也不要把查看者自己的回应提到最前。这两件事都会打破整行赖以成立的唯一不变式：chip 永不移动。',
    ar: 'لا ترتّب الشريط بالعدد، ولا ترفع تفاعل المشاهد نفسه إلى المقدمة. كلاهما يكسر الثابت الوحيد الذي يقوم عليه الصف: الشريحة لا تتحرك أبدًا.',
  },
});

/**
 * Component names, as identifiers rather than JSX literals: they are proper
 * nouns that must never be translated, and the docs lint rule that guards
 * against hardcoded copy cannot tell the two apart.
 */
const N = {
  ReactionPill: 'ReactionPill',
  ReactionBar: 'ReactionBar',
  ReactionPicker: 'ReactionPicker',
  MessageActions: 'MessageActions',
} as const;

const VIEWER = 'you';

const CAST: Record<string, string> = {
  you: 'You',
  ada: 'Ada Lovelace',
  grace: 'Grace Hopper',
  alan: 'Alan Turing',
  linus: 'Linus Torvalds',
  edsger: 'Edsger Dijkstra',
};

const resolveActor = (id: string): string => CAST[id] ?? id;

const SEED: readonly Reaction[] = [
  { emoji: '👍', actorId: 'ada' },
  { emoji: '👍', actorId: 'grace' },
  { emoji: '👍', actorId: VIEWER },
  { emoji: '🎉', actorId: 'alan' },
  { emoji: '👀', actorId: 'linus' },
  { emoji: '👀', actorId: 'edsger' },
];

/** Adds or removes the viewer's own reaction, the way a host reducer would. */
function applyToggle(rs: readonly Reaction[], emoji: string, intent: ReactionIntent): Reaction[] {
  return intent === 'add'
    ? [...rs, { emoji, actorId: VIEWER }]
    : rs.filter((r) => !(r.emoji === emoji && r.actorId === VIEWER));
}

/**
 * Each demo owns state, so — as on the CommandPalette page — it lives in a
 * module-level component the render callback mounts once per pane; a callback
 * cannot hold hooks.
 */
function ToggleDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [reactions, setReactions] = useState<readonly Reaction[]>(SEED);
  const mine = [...new Set(reactions.filter((r) => r.actorId === VIEWER).map((r) => r.emoji))];

  return (
    <Stack gap={3}>
      <K.ReactionBar
        reactions={reactions}
        viewerId={VIEWER}
        resolveActor={resolveActor}
        onToggle={(emoji, intent) => setReactions((rs) => applyToggle(rs, emoji, intent))}
        onAdd={() => undefined}
      />
      <Text size={Size.Small} tone={TextTone.Muted}>
        {mine.length > 0 ? t(pm.rxExToggleYours, { list: mine.join(' ') }) : t(pm.rxExToggleNone)}
      </Text>
    </Stack>
  );
}

function OrderDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [reactions, setReactions] = useState<readonly Reaction[]>(SEED);
  const boosted = reactions.some((r) => r.emoji === '🚀');

  return (
    <Stack gap={3}>
      <K.ReactionBar
        reactions={reactions}
        viewerId={VIEWER}
        resolveActor={resolveActor}
        onToggle={(emoji, intent) => setReactions((rs) => applyToggle(rs, emoji, intent))}
      />
      <Row gap={3} wrap>
        <Button
          size={Size.Small}
          disabled={boosted}
          onClick={() =>
            setReactions((rs) => [
              ...rs,
              ...['ada', 'grace', 'alan', 'linus', 'edsger'].map((actorId) => ({ emoji: '🚀', actorId })),
            ])
          }
        >
          {t(pm.rxExOrderAdd)}
        </Button>
        <Button size={Size.Small} variant={Variant.Ghost} onClick={() => setReactions(SEED)}>
          {t(pm.rxExOrderReset)}
        </Button>
      </Row>
    </Stack>
  );
}

// Twelve distinct emoji, so the default cap of eight has a visible tail.
const MANY: readonly Reaction[] = [
  '👍', '🎉', '👀', '❤️', '😂', '🙏', '🔥', '😮', '🚀', '🤝', '💡', '🐛',
].flatMap((emoji, i) => [
  { emoji, actorId: `a${i}` },
  ...(i % 3 === 0 ? [{ emoji, actorId: `b${i}` }] : []),
  ...(i === 0 ? [{ emoji, actorId: VIEWER }] : []),
]);

function CapDemo({ K }: { K: PlatformKit }) {
  // Deliberately narrow, so the bar has to wrap before it ever reaches the cap:
  // wrapping and capping are two different behaviours and both are on show.
  return (
    <div style={{ maxWidth: '14rem' }}>
      <K.ReactionBar reactions={MANY} viewerId={VIEWER} resolveActor={resolveActor} />
    </div>
  );
}

function PickerDemo({ K }: { K: PlatformKit }) {
  const [reactions, setReactions] = useState<readonly Reaction[]>(SEED);
  const mine = reactions.filter((r) => r.actorId === VIEWER).map((r) => r.emoji);

  return (
    <Stack gap={4}>
      <K.ReactionBar
        reactions={reactions}
        viewerId={VIEWER}
        add="always"
        resolveActor={resolveActor}
        onAdd={() => undefined}
        onToggle={(emoji, intent) => setReactions((rs) => applyToggle(rs, emoji, intent))}
      />
      <div style={{ maxWidth: '20rem' }}>
        <K.ReactionPicker
          reacted={mine}
          onSelect={(emoji) =>
            setReactions((rs) =>
              applyToggle(rs, emoji, rs.some((r) => r.emoji === emoji && r.actorId === VIEWER) ? 'remove' : 'add'),
            )
          }
        />
      </div>
    </Stack>
  );
}

function useDemoActions(): MessageActionItem[] {
  const t = useT();
  return [
    { id: 'react', label: t(pm.rxActReact), icon: <SmilePlus size={16} /> },
    { id: 'reply', label: t(pm.rxActReply), icon: <Reply size={16} /> },
    { id: 'thread', label: t(pm.rxActThread), icon: <MessageSquare size={16} /> },
    { id: 'copy', label: t(pm.rxActCopy), icon: <Copy size={16} /> },
    { id: 'pin', label: t(pm.rxActPin), icon: <Pin size={16} /> },
    { id: 'delete', label: t(pm.rxActDelete), icon: <Trash2 size={16} />, danger: true },
  ];
}

/** A stand-in for the message row that would normally host the cluster. */
function Bubble({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--glacier-space-3) var(--glacier-space-4)',
        borderRadius: 'var(--glacier-radius-lg)',
        background: 'var(--glacier-surface-raised)',
        border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
      }}
    >
      {children}
    </span>
  );
}

function RevealDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const actions = useDemoActions();

  return (
    <Stack gap={5}>
      {/* Pointer: the row is the hover target, not the cluster — an invisible
          click-through bar cannot be hovered into existence by itself. */}
      <Row gap={3} align="center" wrap>
        <Bubble>{t(pm.rxExRevealBubble)}</Bubble>
        <K.MessageActions actions={actions} inlineCap={3} />
      </Row>

      {/* Keyboard: Tab out of the button and :focus-within lights the cluster. */}
      <Stack gap={2}>
        <Text size={Size.Small} tone={TextTone.Muted}>
          {prose(t(pm.rxExRevealHint))}
        </Text>
        <Row gap={3} align="center" wrap>
          <Button size={Size.Small} variant={Variant.Ghost}>
            {t(pm.rxExRevealTab)}
          </Button>
          <K.MessageActions actions={actions} inlineCap={3} />
        </Row>
      </Stack>

      {/* Always: no reveal at all. */}
      <Stack gap={2}>
        <Text size={Size.Small} tone={TextTone.Muted}>
          {prose(t(pm.rxExRevealAlways))}
        </Text>
        <K.MessageActions actions={actions} reveal="always" inlineCap={3} />
      </Stack>
    </Stack>
  );
}

function MenuDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const actions = useDemoActions();
  return (
    <K.Menu trigger={<Button size={Size.Small}>{t(pm.rxExMenuTrigger)}</Button>}>
      <K.MessageActions actions={actions} layout="menu" />
    </K.Menu>
  );
}

function PillsDemo({ K }: { K: PlatformKit }) {
  return (
    <Row gap={3} wrap>
      <K.ReactionPill emoji="👍" count={3} actors={['Ada Lovelace', 'Grace Hopper', 'You']} reactedByViewer />
      <K.ReactionPill emoji="🎉" count={1} actors={['Alan Turing']} />
      <K.ReactionPill emoji="👀" count={7} pending />
      <K.ReactionPill emoji="🐛" count={2} disabled />
      <K.ReactionPill emoji="🔥" count={12} size="sm" />
    </Row>
  );
}

export function ReactionsPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(pm.rxName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(pm.rxLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>

      <Heading level={3}>{N.ReactionPill}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.rxAnatomyPill))}</Text>
      <ComponentBlueprint specId="reaction-pill" />

      <Heading level={3}>{N.ReactionBar}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.rxAnatomyBar))}</Text>
      <ComponentBlueprint specId="reaction-bar" />

      <Heading level={3}>{N.ReactionPicker}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.rxAnatomyPicker))}</Text>
      <ComponentBlueprint specId="reaction-picker" />

      <Heading level={3}>{N.MessageActions}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.rxAnatomyActions))}</Text>
      <ComponentBlueprint specId="message-actions" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(pm.rxExToggleTitle)}
        description={prose(t(pm.rxExToggleDesc))}
        component="ReactionBar"
        platformLayout="stacked"
        render={(K) => <ToggleDemo K={K} />}
        code={`import { ReactionBar } from '@glacier/react';

const [reactions, setReactions] = useState(serverReactions);

<ReactionBar
  reactions={reactions}
  viewerId="you"
  resolveActor={(id) => cast[id] ?? id}
  onAdd={() => openPicker()}
  onToggle={(emoji, intent) =>
    setReactions((rs) =>
      intent === 'add'
        ? [...rs, { emoji, actorId: 'you' }]
        : rs.filter((r) => !(r.emoji === emoji && r.actorId === 'you')),
    )
  }
/>`}
      />

      <Example
        title={t(pm.rxExOrderTitle)}
        description={prose(t(pm.rxExOrderDesc))}
        component="ReactionBar"
        platformLayout="stacked"
        render={(K) => <OrderDemo K={K} />}
        code={`// aggregateReactions tallies by FIRST APPEARANCE, not by count. Five
// people reacting with 🚀 appends one pill at the end; it never jumps the
// queue, and nothing already on the row shifts to make room.
<ReactionBar reactions={reactions} viewerId="you" />`}
      />

      <Example
        title={t(pm.rxExCapTitle)}
        description={prose(t(pm.rxExCapDesc))}
        component="ReactionBar"
        render={(K) => <CapDemo K={K} />}
        code={`// REACTION_DISPLAY_CAP is 8. Twelve emoji show eight pills and a "+4"
// chip; pressing it expands in place. The row WRAPS — it never scrolls
// sideways and never drops a pill off the end.
<ReactionBar reactions={twelveEmoji} viewerId="you" cap={8} />

// Override the cap where the surface can afford more (or less):
<ReactionBar reactions={twelveEmoji} cap={4} />`}
      />

      <Example
        title={t(pm.rxExPillTitle)}
        description={prose(t(pm.rxExPillDesc))}
        component="ReactionPill"
        render={(K) => <PillsDemo K={K} />}
        code={`import { ReactionPill } from '@glacier/react';

// Fully controlled: reactedByViewer is the truth, onToggle reports intent.
<ReactionPill emoji="👍" count={3} reactedByViewer actors={['Ada', 'Grace', 'You']} />
<ReactionPill emoji="🎉" count={1} />
<ReactionPill emoji="👀" count={7} pending />
<ReactionPill emoji="🔥" count={12} size="sm" />`}
      />

      <Example
        title={t(pm.rxExPickerTitle)}
        description={prose(t(pm.rxExPickerDesc))}
        component="ReactionPicker"
        platformLayout="stacked"
        render={(K) => <PickerDemo K={K} />}
        code={`import { ReactionPicker } from '@glacier/react';

<ReactionPicker
  // The emoji set is yours: localised, skin-toned, versioned against the
  // platform font. The default is a small starter set, not a dataset.
  emojis={myEmojiTable}
  frequent={viewerFrequent}
  reacted={myReactions}
  onSelect={(emoji) => toggle(emoji)}
/>`}
      />

      <Example
        title={t(pm.rxExRevealTitle)}
        description={prose(t(pm.rxExRevealDesc))}
        component="MessageActions"
        platformLayout="stacked"
        render={(K) => <RevealDemo K={K} />}
        code={`import { MessageActions } from '@glacier/react';

const actions = [
  { id: 'react', label: 'React', icon: <SmilePlus size={16} /> },
  { id: 'reply', label: 'Reply', icon: <Reply size={16} /> },
  { id: 'thread', label: 'Reply in thread', icon: <MessageSquare size={16} /> },
  { id: 'copy', label: 'Copy text', icon: <Copy size={16} /> },
  { id: 'delete', label: 'Delete', icon: <Trash2 size={16} />, danger: true },
];

// Pointer + keyboard: hidden at rest, revealed by :focus-within.
<MessageActions actions={actions} inlineCap={3} />

// Touch: nothing to configure. @media (hover: none) pins it visible.

// A host that tracks its own row hover drives it explicitly:
<MessageActions actions={actions} visible={rowHovered} />

// No reveal at all:
<MessageActions actions={actions} reveal="always" />`}
      />

      <Example
        title={t(pm.rxExMenuTitle)}
        description={prose(t(pm.rxExMenuDesc))}
        component="MessageActions"
        render={(K) => <MenuDemo K={K} />}
        code={`// The SAME actions array, as menu rows, inside the host's context menu.
<ContextMenu content={<MessageActions actions={actions} layout="menu" />}>
  <MessageBubble>…</MessageBubble>
</ContextMenu>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{N.ReactionPill}</Heading>
      <PropsTable
        props={[
          { name: 'emoji', type: 'string', description: t(pm.rxPillEmoji) },
          { name: 'count', type: 'number', description: t(pm.rxPillCount) },
          { name: 'reactedByViewer', type: 'boolean', default: 'false', description: t(pm.rxPillReacted) },
          { name: 'pending', type: 'boolean', default: 'false', description: t(pm.rxPillPending) },
          { name: 'actors', type: 'readonly string[]', description: t(pm.rxPillActors) },
          { name: 'labels', type: 'ReactionPillLabels', description: t(pm.rxPillLabels) },
          { name: 'onToggle', type: '(emoji: string, intent: ReactionIntent) => void', description: t(pm.rxBarOnToggle) },
        ]}
      />

      <Heading level={3}>{N.ReactionBar}</Heading>
      <PropsTable
        props={[
          { name: 'reactions', type: 'readonly Reaction[]', description: t(pm.rxBarReactions) },
          { name: 'viewerId', type: 'string', description: t(pm.rxBarViewerId) },
          { name: 'pending', type: 'readonly PendingReaction[]', description: t(pm.rxBarPending) },
          { name: 'cap', type: 'number', default: '8', description: t(pm.rxBarCap) },
          { name: 'add', type: "'auto' | 'always' | 'never'", default: "'auto'", description: t(pm.rxBarAdd) },
          { name: 'onToggle', type: '(emoji: string, intent: ReactionIntent) => void', description: t(pm.rxBarOnToggle) },
          { name: 'resolveActor', type: '(actorId: string) => string', description: t(pm.rxBarResolveActor) },
        ]}
      />

      <Heading level={3}>{N.ReactionPicker}</Heading>
      <PropsTable
        props={[
          { name: 'emojis', type: 'readonly EmojiEntry[]', default: 'defaultEmojiSet', description: t(pm.rxPickerEmojis) },
          { name: 'frequent', type: 'readonly string[]', default: 'frequentReactions', description: t(pm.rxPickerFrequent) },
          { name: 'columns', type: 'number', default: '8', description: t(pm.rxPickerColumns) },
          { name: 'onSelect', type: '(emoji: string) => void', description: t(pm.rxPickerOnSelect) },
          { name: 'reacted', type: 'readonly string[]', description: t(pm.rxPickerReacted) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(pm.rxPickerSkeleton) },
        ]}
      />

      <Heading level={3}>{N.MessageActions}</Heading>
      <PropsTable
        props={[
          { name: 'actions', type: 'readonly MessageActionItem[]', description: t(pm.rxMaActions) },
          { name: 'layout', type: "'cluster' | 'menu'", default: "'cluster'", description: t(pm.rxMaLayout) },
          { name: 'reveal', type: "'hover' | 'always'", default: "'hover'", description: t(pm.rxMaReveal) },
          { name: 'visible', type: 'boolean', description: t(pm.rxMaVisible) },
          { name: 'inlineCap', type: 'number', default: '3', description: t(pm.rxMaInlineCap) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(pm.rxA11y1))}</li>
        <li>{prose(t(pm.rxA11y2))}</li>
        <li>{prose(t(pm.rxA11y3))}</li>
        <li>{prose(t(pm.rxA11y4))}</li>
        <li>{prose(t(pm.rxA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(pm.rxUse1))}</li>
        <li>{prose(t(pm.rxUse2))}</li>
        <li>{prose(t(pm.rxUse3))}</li>
        <li>{prose(t(pm.rxUse4))}</li>
        <li>{prose(t(pm.rxUse5))}</li>
      </ul>
    </>
  );
}
