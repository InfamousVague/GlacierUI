import {
  Avatar,
  Heading,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import { groupMessages, type ChatMessage, type MessageGroup as ChatRun } from '@glacier/logic';
import type { ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * TODO(i18n): these belong in apps/docs/src/i18n.ts alongside the other page
 * catalogs; they are authored here so the page compiles standalone, and every
 * key is listed in the handoff ready to be pasted in verbatim.
 */
const mg = defineMessages({
  mgName: { en: 'Message Group', es: 'Grupo de mensajes', fr: 'Groupe de messages', de: 'Nachrichtengruppe', ja: 'メッセージグループ', pt: 'Grupo de mensagens', zh: '消息分组', ar: 'مجموعة الرسائل' },
  mgLede: {
    en: 'One author’s run of messages: the avatar and the name once at the head, the bubbles stacked with their corners cut to read as a single shape, and the time and delivery collapsed to one line at the foot.',
    es: 'La serie de mensajes de un autor: el avatar y el nombre una sola vez al inicio, las burbujas apiladas con las esquinas recortadas para leerse como una sola forma, y la hora y la entrega reducidas a una línea al pie.',
    fr: 'La salve de messages d’un auteur : l’avatar et le nom une seule fois en tête, les bulles empilées aux coins rognés pour se lire comme une seule forme, et l’heure et la remise réduites à une ligne en pied.',
    de: 'Die Nachrichtenfolge eines Autors: Avatar und Name einmal am Kopf, die Blasen gestapelt mit beschnittenen Ecken, damit sie sich als eine Form lesen, und Zeit und Zustellung zu einer Zeile am Fuß zusammengefasst.',
    ja: 'ひとりの作者による連続したメッセージ。先頭にアバターと名前を1回だけ、角を落とした吹き出しを積み重ねてひとつの形として読めるようにし、時刻と配信は末尾の1行にまとめます。',
    pt: 'A sequência de mensagens de um autor: o avatar e o nome uma só vez no topo, os balões empilhados com os cantos cortados para se lerem como uma só forma, e a hora e a entrega reduzidas a uma linha no fundo.',
    zh: '同一作者的一串消息：头像和姓名只在开头出现一次，气泡堆叠且切角以读作一个整体形状，时间与送达状态则收拢为底部的一行。',
    ar: 'سلسلة رسائل مؤلّف واحد: الصورة الرمزية والاسم مرة واحدة في الرأس، والفقاعات مكدَّسة بزوايا مقصوصة لتُقرأ شكلًا واحدًا، والوقت والتسليم مجموعان في سطر واحد عند القدم.',
  },
  mgAnatomy: {
    en: 'A gutter reserved for the whole run, a stack of bubbles, and one meta line. A run exists so a burst of typing reads as one utterance rather than four interruptions, and that only works if the repeated parts are said once.',
    es: 'Una canaleta reservada para toda la serie, una pila de burbujas y una línea meta. Una serie existe para que una ráfaga de escritura se lea como un solo enunciado y no como cuatro interrupciones, y eso solo funciona si las partes repetidas se dicen una vez.',
    fr: 'Une gouttière réservée pour toute la salve, une pile de bulles et une ligne méta. Une salve existe pour qu’une rafale de frappe se lise comme un seul énoncé plutôt que comme quatre interruptions, et cela ne marche que si les parties répétées ne sont dites qu’une fois.',
    de: 'Eine für die ganze Folge reservierte Spalte, ein Stapel Blasen und eine Meta-Zeile. Eine Folge gibt es, damit ein Tippstoß sich als eine Äußerung liest statt als vier Unterbrechungen — und das gelingt nur, wenn die wiederholten Teile einmal gesagt werden.',
    ja: '連続全体のために確保された余白列、吹き出しの積み重ね、そしてメタ行が1つ。連続が存在するのは、立て続けの入力が4回の割り込みではなくひとつの発話として読まれるためで、それは繰り返される部分を1度だけ言う場合にのみ成り立ちます。',
    pt: 'Uma goteira reservada para toda a sequência, uma pilha de balões e uma linha meta. Uma sequência existe para que uma rajada de escrita se leia como um só enunciado e não como quatro interrupções, e isso só resulta se as partes repetidas forem ditas uma vez.',
    zh: '为整串消息预留的栏位、一叠气泡，以及一行元信息。分组的存在是为了让连打的一阵输入读作一次发言而非四次打断，而这只有在重复部分只说一遍时才成立。',
    ar: 'عمود محجوز للسلسلة كلها، وكومة من الفقاعات، وسطر بيانات واحد. توجد السلسلة كي تُقرأ دفقة الكتابة كلامًا واحدًا لا أربع مقاطعات، ولا يتحقّق ذلك إلا إذا قيلت الأجزاء المتكرّرة مرة واحدة.',
  },
  mgExOnceTitle: { en: 'Said once: the avatar, the name, the time', es: 'Dicho una vez: el avatar, el nombre, la hora', fr: 'Dit une fois : l’avatar, le nom, l’heure', de: 'Einmal gesagt: Avatar, Name, Zeit', ja: '1度だけ言うもの：アバター、名前、時刻', pt: 'Dito uma vez: o avatar, o nome, a hora', zh: '只说一次：头像、姓名、时间', ar: 'يُقال مرة واحدة: الصورة والاسم والوقت' },
  mgExOnceDesc: {
    en: 'Four messages, one avatar, one name, one stamp. In bubble layout the run closes with a stamp at its foot; in row layout the time has already been printed in the header, so the foot only speaks again when there is a delivery state worth reporting.',
    es: 'Cuatro mensajes, un avatar, un nombre, una marca de hora. En la disposición bubble la serie se cierra con una marca al pie; en row la hora ya se imprimió en la cabecera, así que el pie solo vuelve a hablar cuando hay un estado de entrega que merezca informarse.',
    fr: 'Quatre messages, un avatar, un nom, un horodatage. En disposition bulle, la salve se ferme par un horodatage en pied ; en disposition ligne, l’heure est déjà imprimée dans l’en-tête, et le pied ne reparle que s’il y a un état de remise à rapporter.',
    de: 'Vier Nachrichten, ein Avatar, ein Name, ein Zeitstempel. Im Bubble-Layout schließt die Folge mit einem Stempel am Fuß; im Row-Layout steht die Zeit schon in der Kopfzeile, also meldet sich der Fuß nur wieder, wenn es einen Zustellzustand zu berichten gibt.',
    ja: 'メッセージ4件に対し、アバター1つ、名前1つ、時刻1つ。バブルレイアウトでは連続の末尾に時刻が付いて閉じます。行レイアウトでは時刻をすでにヘッダーに出しているため、末尾は報告に値する配信状態があるときだけ再び口を開きます。',
    pt: 'Quatro mensagens, um avatar, um nome, uma marca de hora. Na disposição balão a sequência fecha com uma marca no fundo; na disposição linha a hora já foi impressa no cabeçalho, por isso o fundo só volta a falar quando há um estado de entrega que valha reportar.',
    zh: '四条消息，一个头像、一个姓名、一个时间戳。气泡布局下这串消息以底部的时间戳收尾；行布局下时间已经打在标题里，因此底部只有在有值得报告的送达状态时才再次开口。',
    ar: 'أربع رسائل، وصورة واحدة، واسم واحد، وطابع وقت واحد. في تخطيط الفقاعة تُختم السلسلة بطابع عند قدمها؛ وفي تخطيط الصف يكون الوقت قد طُبع في الترويسة، فلا ينطق القدم إلا حين تكون هناك حالة تسليم تستحق الإبلاغ.',
  },
  mgExContinuedTitle: { en: 'The `continued` flag', es: 'La marca `continued`', fr: 'L’indicateur `continued`', de: 'Das Flag `continued`', ja: '`continued` フラグ', pt: 'A marca `continued`', zh: '`continued` 标志', ar: 'راية `continued`' },
  mgExContinuedDesc: {
    en: 'When something splits a run in half, the trailing half is marked continued: the same person is still talking, with a line drawn through their sentence. Repeating the avatar and name there would turn one speaker into two, so a continued run suppresses both while keeping the gutter reserved — its text stays on exactly the same line as the half above it.',
    es: 'Cuando algo parte una serie en dos, la mitad final se marca como continuada: es la misma persona hablando, con una línea trazada a través de su frase. Repetir allí el avatar y el nombre convertiría a un hablante en dos, así que una serie continuada suprime ambos y mantiene la canaleta reservada: su texto queda exactamente en la misma línea que la mitad de arriba.',
    fr: 'Quand quelque chose coupe une salve en deux, la moitié finale est marquée continued : c’est la même personne qui parle encore, avec un trait tiré au milieu de sa phrase. Y répéter l’avatar et le nom ferait de un locuteur deux, donc une salve continuée supprime les deux tout en gardant la gouttière réservée — son texte reste exactement sur la même ligne que la moitié du dessus.',
    de: 'Wenn etwas eine Folge halbiert, wird die hintere Hälfte als fortgesetzt markiert: dieselbe Person spricht weiter, mit einem Strich mitten durch ihren Satz. Avatar und Name dort zu wiederholen machte aus einem Sprecher zwei, also unterdrückt eine fortgesetzte Folge beides und hält die Spalte reserviert — ihr Text bleibt auf genau derselben Linie wie die Hälfte darüber.',
    ja: '何かが連続を2つに割ったとき、後半には continued の印が付きます。同じ人がまだ話しており、その文の途中に線が引かれた状態です。そこでアバターと名前を繰り返せば話者が2人になってしまうので、継続した連続は両方を抑え、余白列は確保したままにします。テキストは上の半分とまったく同じ位置に揃います。',
    pt: 'Quando algo parte uma sequência ao meio, a metade final é marcada como continuada: é a mesma pessoa a falar, com um traço no meio da frase. Repetir aí o avatar e o nome transformaria um orador em dois, por isso uma sequência continuada suprime ambos mantendo a goteira reservada — o seu texto fica exatamente na mesma linha que a metade de cima.',
    zh: '当某样东西把一串消息劈成两半时，后半段会被标记为 continued：还是同一个人在说话，只是句子中间被划了一道。在那里重复头像和姓名会把一个说话者变成两个，因此续接的分组会隐去两者，同时仍保留栏位——它的文字与上半段保持在完全相同的行上。',
    ar: 'حين يشطر شيء ما سلسلة إلى نصفين، يوسَم النصف التالي بأنه متواصل: الشخص نفسه ما زال يتكلّم وقد خُطّ خطّ في منتصف جملته. تكرار الصورة والاسم هناك يحوّل متحدثًا واحدًا إلى اثنين، لذا يكتم النصف المتواصل كليهما مع إبقاء العمود محجوزًا — ويبقى نصّه على السطر نفسه تمامًا كالنصف الذي فوقه.',
  },
  mgExStatusTitle: { en: 'The run reports its least advanced member', es: 'La serie informa de su miembro menos avanzado', fr: 'La salve rapporte son membre le moins avancé', de: 'Die Folge meldet ihr am wenigsten fortgeschrittenes Glied', ja: '連続は最も進んでいないものを報告する', pt: 'A sequência reporta o seu membro menos avançado', zh: '这串消息报告其中进度最慢的一条', ar: 'تُبلّغ السلسلة عن أقل أعضائها تقدّمًا' },
  mgExStatusDesc: {
    en: 'The single meta line at the foot covers everything above it, so it shows the least advanced status among the members, not the last one’s. A stack whose final message was read still holds a failed send two messages up, and reporting "read" would hide the one thing the user has to act on.',
    es: 'La única línea meta del pie cubre todo lo que hay encima, así que muestra el estado menos avanzado entre los miembros, no el del último. Una pila cuyo último mensaje fue leído todavía contiene un envío fallido dos mensajes más arriba, e informar «leído» ocultaría lo único sobre lo que el usuario debe actuar.',
    fr: 'L’unique ligne méta en pied couvre tout ce qui la précède : elle montre donc l’état le moins avancé parmi les membres, pas celui du dernier. Une pile dont le dernier message a été lu contient encore un envoi échoué deux messages plus haut, et rapporter « lu » masquerait la seule chose sur laquelle l’utilisateur doit agir.',
    de: 'Die einzige Meta-Zeile am Fuß deckt alles darüber ab und zeigt daher den am wenigsten fortgeschrittenen Zustand der Glieder, nicht den des letzten. Ein Stapel, dessen letzte Nachricht gelesen wurde, hält zwei Nachrichten weiter oben immer noch einen fehlgeschlagenen Versand, und „gelesen“ zu melden verbärge das Einzige, worauf der Nutzer reagieren muss.',
    ja: '末尾のただ1行のメタ行は、その上のすべてを代表します。だから表示するのは最後のものではなく、メンバー中で最も進んでいない状態です。最後のメッセージが既読でも、2つ上に失敗した送信が残っていることはあり、「既読」と報告すればユーザーが対処すべき唯一のことを隠してしまいます。',
    pt: 'A única linha meta no fundo cobre tudo o que está acima, por isso mostra o estado menos avançado entre os membros, não o do último. Uma pilha cuja mensagem final foi lida ainda contém um envio falhado duas mensagens acima, e reportar «lido» esconderia a única coisa sobre a qual o utilizador tem de agir.',
    zh: '底部这唯一一行元信息覆盖它上面的一切，因此显示的是成员中进度最慢的状态，而不是最后一条的状态。最后一条被读过的一叠消息，往上两条可能仍有一次失败发送，报告「已读」就会掩盖用户唯一需要处理的事。',
    ar: 'سطر البيانات الوحيد عند القدم يغطّي كل ما فوقه، لذا يعرض أقل الحالات تقدّمًا بين الأعضاء لا حالة الأخيرة. كومة قُرئت رسالتها الأخيرة قد تحوي إرسالًا فاشلًا قبلها برسالتين، والإبلاغ بـ«قُرئت» يخفي الشيء الوحيد الذي على المستخدم أن يتصرّف حياله.',
  },
  mgExSkeletonTitle: { en: 'Skeleton', es: 'Esqueleto', fr: 'Squelette', de: 'Platzhalter', ja: 'スケルトン', pt: 'Esqueleto', zh: '骨架', ar: 'هيكل التحميل' },
  mgExSkeletonDesc: {
    en: 'The run renders as placeholders at its real footprint: the same gutter, the same stack gap, the same meta line height, so a loading transcript settles into the layout it was already holding.',
    es: 'La serie se muestra como marcadores de posición con su huella real: la misma canaleta, el mismo hueco de pila, la misma altura de línea meta, para que una transcripción en carga se asiente en la disposición que ya sostenía.',
    fr: 'La salve se rend en espaces réservés à son empreinte réelle : même gouttière, même espacement de pile, même hauteur de ligne méta, pour qu’une transcription en chargement s’installe dans la disposition qu’elle tenait déjà.',
    de: 'Die Folge rendert als Platzhalter mit ihrem echten Fußabdruck: dieselbe Spalte, derselbe Stapelabstand, dieselbe Höhe der Meta-Zeile, damit sich ein ladender Verlauf in das Layout setzt, das er bereits hielt.',
    ja: '連続は実際の占有面積のままプレースホルダーとして描かれます。同じ余白列、同じ積み重ねの間隔、同じメタ行の高さ。だから読み込み中の履歴は、すでに保っていたレイアウトにそのまま収まります。',
    pt: 'A sequência é mostrada como marcadores de posição com a sua pegada real: a mesma goteira, o mesmo espaço de pilha, a mesma altura de linha meta, para que uma transcrição a carregar assente na disposição que já sustinha.',
    zh: '这串消息以真实占位尺寸渲染成占位元素：同样的栏位、同样的堆叠间距、同样的元信息行高，因此加载中的会话记录会稳稳落进它原本就撑着的布局。',
    ar: 'تُعرض السلسلة عناصر نائبة بمساحتها الحقيقية: العمود نفسه، وتباعد الكومة نفسه، وارتفاع سطر البيانات نفسه، كي يستقرّ السجلّ قيد التحميل في التخطيط الذي كان يحمله أصلًا.',
  },
  mgAuthor: { en: 'Ada Lovelace', es: 'Ada Lovelace', fr: 'Ada Lovelace', de: 'Ada Lovelace', ja: 'エイダ・ラブレス', pt: 'Ada Lovelace', zh: '阿达·洛芙莱斯', ar: 'أيدا لوفلايس' },
  mgMsg1: { en: 'Morning — I read the draft', es: 'Buenos días, he leído el borrador', fr: 'Bonjour — j’ai lu le brouillon', de: 'Morgen — ich habe den Entwurf gelesen', ja: 'おはようございます。草稿を読みました', pt: 'Bom dia — li o rascunho', zh: '早上好——我读了草稿', ar: 'صباح الخير — قرأت المسوّدة' },
  mgMsg2: { en: 'The second section is the strong one', es: 'La segunda sección es la buena', fr: 'La deuxième partie est la plus forte', de: 'Der zweite Abschnitt ist der starke', ja: '第2節が一番よくできています', pt: 'A segunda secção é a forte', zh: '第二节是最有力的一节', ar: 'القسم الثاني هو الأقوى' },
  mgMsg3: { en: 'I would cut the opening paragraph entirely', es: 'Yo quitaría el párrafo de apertura por completo', fr: 'Je supprimerais entièrement le paragraphe d’ouverture', de: 'Den ersten Absatz würde ich ganz streichen', ja: '冒頭の段落はまるごと削ると思います', pt: 'Eu cortaria o parágrafo de abertura por completo', zh: '开头那段我会整段删掉', ar: 'كنت لأحذف الفقرة الافتتاحية كلها' },
  mgMsg4: { en: 'Happy to talk it through this afternoon', es: 'Encantada de comentarlo esta tarde', fr: 'Ravie d’en discuter cet après-midi', de: 'Gern bespreche ich das heute Nachmittag', ja: '今日の午後にでも話しましょう', pt: 'Com todo o gosto falamos disso esta tarde', zh: '今天下午可以聊聊', ar: 'يسعدني أن نتحدّث في ذلك بعد الظهر' },
  mgReply1: { en: 'That matches what I thought', es: 'Eso coincide con lo que pensaba', fr: 'Cela correspond à ce que je pensais', de: 'Das deckt sich mit meinem Eindruck', ja: '私の考えとも一致します', pt: 'Isso bate certo com o que pensei', zh: '这和我的想法一致', ar: 'هذا يوافق ما ظننته' },
  mgReply2: { en: 'I will send the revision tonight', es: 'Mandaré la revisión esta noche', fr: 'J’enverrai la révision ce soir', de: 'Ich schicke die Überarbeitung heute Abend', ja: '今夜、修正版を送ります', pt: 'Envio a revisão esta noite', zh: '我今晚发修改稿', ar: 'سأرسل المراجعة الليلة' },
  mgHeadOfRun: { en: 'head of the run', es: 'inicio de la serie', fr: 'tête de salve', de: 'Kopf der Folge', ja: '連続の先頭', pt: 'topo da sequência', zh: '这串的开头', ar: 'رأس السلسلة' },
  mgContinuedRun: { en: 'continued', es: 'continuada', fr: 'continuée', de: 'fortgesetzt', ja: '継続', pt: 'continuada', zh: '续接', ar: 'متواصلة' },
  mgPropGroup: { en: 'The run, exactly as `groupMessages` in `@glacier/logic` built it. Nothing here re-derives a run.', es: 'La serie, exactamente como la construyó `groupMessages` en `@glacier/logic`. Aquí nada vuelve a derivar una serie.', fr: 'La salve, exactement telle que `groupMessages` dans `@glacier/logic` l’a construite. Rien ici ne redérive une salve.', de: 'Die Folge, genau wie `groupMessages` in `@glacier/logic` sie gebaut hat. Hier leitet nichts eine Folge neu ab.', ja: '`@glacier/logic` の `groupMessages` が作ったままの連続。ここで連続を導出し直すことはありません。', pt: 'A sequência, exatamente como `groupMessages` em `@glacier/logic` a construiu. Aqui nada volta a derivar uma sequência.', zh: '这串消息，原样来自 `@glacier/logic` 的 `groupMessages`。这里不会重新推导任何分组。', ar: 'السلسلة كما بناها `groupMessages` في `@glacier/logic` تمامًا. لا شيء هنا يعيد اشتقاق سلسلة.' },
  mgPropLayout: { en: 'Forwarded to every message in the run. Bubble encodes authorship in edge and fill; row encodes it in a header.', es: 'Se reenvía a cada mensaje de la serie. Bubble codifica la autoría en el borde y el relleno; row la codifica en una cabecera.', fr: 'Transmis à chaque message de la salve. Bulle encode la paternité dans le bord et le fond ; ligne l’encode dans un en-tête.', de: 'Wird an jede Nachricht der Folge weitergereicht. Bubble kodiert die Urheberschaft in Kante und Füllung; row kodiert sie in einer Kopfzeile.', ja: '連続内のすべてのメッセージに転送されます。bubble は端と塗りで、row はヘッダーで作者を表します。', pt: 'Reencaminhado a cada mensagem da sequência. Bubble codifica a autoria no bordo e no preenchimento; row codifica-a num cabeçalho.', zh: '转发给这串消息中的每一条。bubble 用边与填充编码作者身份；row 用标题编码。', ar: 'يُمرَّر إلى كل رسالة في السلسلة. يرمّز bubble النسبة بالحافة والتعبئة، ويرمّزها row في ترويسة.' },
  mgPropOwn: { en: 'The viewer wrote this run. Derived from `viewerId` when omitted.', es: 'El lector escribió esta serie. Se deriva de `viewerId` cuando se omite.', fr: 'Le lecteur a écrit cette salve. Dérivé de `viewerId` en cas d’omission.', de: 'Der Leser hat diese Folge geschrieben. Wird bei Weglassen aus `viewerId` abgeleitet.', ja: 'この連続を書いたのが読者であること。省略時は `viewerId` から導かれます。', pt: 'O leitor escreveu esta sequência. Derivado de `viewerId` quando omitido.', zh: '这串消息由读者所写。省略时从 `viewerId` 推导。', ar: 'القارئ هو من كتب هذه السلسلة. تُشتقّ من `viewerId` عند الإغفال.' },
  mgPropViewerId: { en: 'The reading user, compared against the run’s `authorId` to decide authorship.', es: 'El usuario que lee, comparado con el `authorId` de la serie para decidir la autoría.', fr: 'L’utilisateur qui lit, comparé à l’`authorId` de la salve pour décider de la paternité.', de: 'Der lesende Nutzer, gegen die `authorId` der Folge geprüft, um die Urheberschaft zu bestimmen.', ja: '読んでいるユーザー。連続の `authorId` と比較して作者を決めます。', pt: 'O utilizador que lê, comparado com o `authorId` da sequência para decidir a autoria.', zh: '正在阅读的用户，与这串消息的 `authorId` 比对以判定作者身份。', ar: 'المستخدم القارئ، يُقارَن بـ`authorId` السلسلة لتحديد النسبة.' },
  mgPropAvatar: { en: 'Drawn once at the head of the run, and never on a continued one.', es: 'Se dibuja una vez al inicio de la serie, y nunca en una continuada.', fr: 'Dessiné une fois en tête de salve, et jamais sur une salve continuée.', de: 'Einmal am Kopf der Folge gezeichnet, nie bei einer fortgesetzten.', ja: '連続の先頭に1度だけ描かれ、継続した連続には決して描かれません。', pt: 'Desenhado uma vez no topo da sequência, e nunca numa continuada.', zh: '只在这串消息的开头绘制一次，续接的分组绝不绘制。', ar: 'يُرسم مرة واحدة في رأس السلسلة، ولا يُرسم أبدًا على سلسلة متواصلة.' },
  mgPropAuthorName: { en: 'Drawn once at the head of the run, and never on a continued one.', es: 'Se dibuja una vez al inicio de la serie, y nunca en una continuada.', fr: 'Dessiné une fois en tête de salve, et jamais sur une salve continuée.', de: 'Einmal am Kopf der Folge gezeichnet, nie bei einer fortgesetzten.', ja: '連続の先頭に1度だけ描かれ、継続した連続には決して描かれません。', pt: 'Desenhado uma vez no topo da sequência, e nunca numa continuada.', zh: '只在这串消息的开头绘制一次，续接的分组绝不绘制。', ar: 'يُرسم مرة واحدة في رأس السلسلة، ولا يُرسم أبدًا على سلسلة متواصلة.' },
  mgPropAuthorLabel: { en: 'The author’s name as a plain string, so a continued run is still announced even though its visible header is suppressed.', es: 'El nombre del autor como cadena simple, para que una serie continuada se siga anunciando aunque su cabecera visible esté suprimida.', fr: 'Le nom de l’auteur en chaîne simple, pour qu’une salve continuée soit encore annoncée alors que son en-tête visible est supprimé.', de: 'Der Name des Autors als einfacher String, damit eine fortgesetzte Folge weiterhin angesagt wird, obwohl ihre sichtbare Kopfzeile unterdrückt ist.', ja: '作者名を素の文字列で。可視ヘッダーが抑えられていても、継続した連続がなお読み上げられるようにするためです。', pt: 'O nome do autor como cadeia simples, para que uma sequência continuada continue a ser anunciada mesmo com o cabeçalho visível suprimido.', zh: '作者姓名的纯字符串形式，使续接的分组即便隐去可见标题也仍会被播报。', ar: 'اسم المؤلّف كنصّ بسيط، كي تظلّ السلسلة المتواصلة مُعلَنة رغم كتم ترويستها المرئية.' },
  mgPropTails: { en: 'Draws a tail on the message that ends the run. Ignored in row layout, and on a standalone run.', es: 'Dibuja una cola en el mensaje que cierra la serie. Se ignora en la disposición row y en una serie independiente.', fr: 'Dessine une queue sur le message qui termine la salve. Ignoré en disposition ligne et sur une salve isolée.', de: 'Zeichnet einen Zipfel an der Nachricht, die die Folge beendet. Im Row-Layout und bei einer eigenständigen Folge ignoriert.', ja: '連続を終えるメッセージにしっぽを描きます。行レイアウトと単独の連続では無視されます。', pt: 'Desenha uma cauda na mensagem que fecha a sequência. Ignorado na disposição linha e numa sequência isolada.', zh: '在收尾那条消息上绘制尾巴。行布局与独立分组下忽略。', ar: 'يرسم ذيلًا على الرسالة التي تختم السلسلة. يُتجاهل في تخطيط الصف وعلى السلسلة المفردة.' },
  mgPropRenderBody: { en: 'Replaces the default text rendering for one message; receives the message and its slot context.', es: 'Sustituye el renderizado de texto por defecto de un mensaje; recibe el mensaje y su contexto de posición.', fr: 'Remplace le rendu de texte par défaut d’un message ; reçoit le message et son contexte d’emplacement.', de: 'Ersetzt das voreingestellte Textrendering einer Nachricht; erhält die Nachricht und ihren Slot-Kontext.', ja: '1件のメッセージの既定のテキスト描画を置き換えます。メッセージとそのスロット文脈を受け取ります。', pt: 'Substitui a renderização de texto predefinida de uma mensagem; recebe a mensagem e o seu contexto de posição.', zh: '替换某条消息的默认文本渲染；接收该消息及其槽位上下文。', ar: 'يستبدل عرض النص الافتراضي لرسالة واحدة؛ ويتلقّى الرسالة وسياق موضعها.' },
  mgPropNow: { en: 'The instant timestamps are read against; injected so a transcript renders deterministically.', es: 'El instante contra el que se leen las marcas de hora; se inyecta para que una transcripción se renderice de forma determinista.', fr: 'L’instant auquel les horodatages sont rapportés ; injecté pour qu’une transcription se rende de façon déterministe.', de: 'Der Augenblick, gegen den Zeitstempel gelesen werden; injiziert, damit ein Verlauf deterministisch rendert.', ja: 'タイムスタンプを読む基準の瞬間。履歴が決定的に描画されるよう注入します。', pt: 'O instante contra o qual as marcas de hora são lidas; injetado para que uma transcrição renderize de forma determinista.', zh: '解读时间戳所依据的时刻；以注入方式提供，使会话记录的渲染具有确定性。', ar: 'اللحظة التي تُقرأ الطوابع الزمنية بالنسبة إليها؛ تُحقن كي يُعرض السجلّ على نحو حتمي.' },
  mgPropSkeleton: { en: 'Renders the run as placeholders at its real footprint.', es: 'Muestra la serie como marcadores de posición con su huella real.', fr: 'Rend la salve en espaces réservés à son empreinte réelle.', de: 'Rendert die Folge als Platzhalter mit ihrem echten Fußabdruck.', ja: '連続を実際の占有面積のプレースホルダーとして描画します。', pt: 'Mostra a sequência como marcadores de posição com a sua pegada real.', zh: '把这串消息按真实占位尺寸渲染为占位元素。', ar: 'يعرض السلسلة عناصر نائبة بمساحتها الحقيقية.' },
  mgA11y1: { en: 'The run is a group labelled by its author, so a screen reader says who is talking once instead of before every message.', es: 'La serie es un grupo etiquetado por su autor, así que un lector de pantalla dice quién habla una vez en lugar de antes de cada mensaje.', fr: 'La salve est un groupe étiqueté par son auteur : un lecteur d’écran dit qui parle une fois au lieu d’avant chaque message.', de: 'Die Folge ist eine nach ihrem Autor benannte Gruppe, sodass ein Screenreader einmal sagt, wer spricht, statt vor jeder Nachricht.', ja: '連続は作者で名づけられたグループなので、スクリーンリーダーは誰が話しているかを1度だけ言い、メッセージごとには言いません。', pt: 'A sequência é um grupo etiquetado pelo seu autor, por isso um leitor de ecrã diz quem está a falar uma vez em vez de antes de cada mensagem.', zh: '这串消息是一个以作者命名的分组，因此屏幕阅读器只报一次说话人，而不是在每条消息前都报。', ar: 'السلسلة مجموعة موسومة باسم صاحبها، فيقول قارئ الشاشة من يتكلّم مرة واحدة بدل أن يقولها قبل كل رسالة.' },
  mgA11y2: { en: 'A continued run is still labelled by its author even though the visible name is suppressed, so the label does not disappear along with the avatar.', es: 'Una serie continuada sigue etiquetada por su autor aunque el nombre visible esté suprimido, así que la etiqueta no desaparece junto con el avatar.', fr: 'Une salve continuée reste étiquetée par son auteur même si le nom visible est supprimé : l’étiquette ne disparaît donc pas avec l’avatar.', de: 'Eine fortgesetzte Folge trägt weiterhin das Label ihres Autors, obwohl der sichtbare Name unterdrückt ist, sodass das Label nicht mit dem Avatar verschwindet.', ja: '継続した連続も、可視の名前が抑えられていても作者でラベル付けされたままなので、ラベルがアバターと一緒に消えることはありません。', pt: 'Uma sequência continuada continua etiquetada pelo seu autor mesmo com o nome visível suprimido, por isso a etiqueta não desaparece com o avatar.', zh: '续接的分组即使隐去可见姓名，仍以作者命名，因此标签不会随头像一起消失。', ar: 'تبقى السلسلة المتواصلة موسومة باسم صاحبها رغم كتم الاسم المرئي، فلا تختفي التسمية مع الصورة الرمزية.' },
  mgA11y3: { en: 'Without a name there is nothing to label the group with, and an unlabelled group is noise, so it stays a plain box rather than an anonymous `role="group"`.', es: 'Sin un nombre no hay con qué etiquetar el grupo, y un grupo sin etiqueta es ruido, así que se queda como una caja simple en vez de un `role="group"` anónimo.', fr: 'Sans nom, rien ne peut étiqueter le groupe, et un groupe non étiqueté n’est que du bruit : il reste donc une simple boîte plutôt qu’un `role="group"` anonyme.', de: 'Ohne Namen gibt es nichts, womit die Gruppe zu benennen wäre, und eine unbenannte Gruppe ist Lärm — sie bleibt daher eine schlichte Box statt einer anonymen `role="group"`.', ja: '名前がなければグループに付けるラベルがなく、ラベルのないグループはノイズです。そこで匿名の `role="group"` ではなく、ただのボックスのままにします。', pt: 'Sem um nome não há com que etiquetar o grupo, e um grupo sem etiqueta é ruído, por isso fica uma caixa simples em vez de um `role="group"` anónimo.', zh: '没有姓名就没有东西可以用来标注该分组，而无标签的分组只是噪音，因此它保持为普通容器，而不是匿名的 `role="group"`。', ar: 'من دون اسم لا شيء يوسم به المجموعة، والمجموعة غير الموسومة ضجيج، فتبقى صندوقًا عاديًا لا `role="group"` مجهولًا.' },
  mgA11y4: { en: 'The foot’s timestamp is announced once for the whole run, and the bubbles above it hide theirs rather than repeat the same moment four times.', es: 'La hora del pie se anuncia una vez para toda la serie, y las burbujas de encima ocultan la suya en lugar de repetir el mismo momento cuatro veces.', fr: 'L’horodatage du pied est annoncé une fois pour toute la salve, et les bulles au-dessus masquent le leur au lieu de répéter le même instant quatre fois.', de: 'Der Zeitstempel am Fuß wird einmal für die ganze Folge angesagt, und die Blasen darüber verbergen ihren, statt denselben Moment viermal zu wiederholen.', ja: '末尾のタイムスタンプは連続全体に対して1度だけ読み上げられ、その上の吹き出しは同じ時刻を4回繰り返す代わりに自分のものを隠します。', pt: 'A hora do fundo é anunciada uma vez para toda a sequência, e os balões acima ocultam a sua em vez de repetirem o mesmo momento quatro vezes.', zh: '底部的时间戳为整串消息播报一次，上方的气泡会隐去各自的时间，而不是把同一时刻重复四遍。', ar: 'يُعلَن طابع الوقت عند القدم مرة واحدة للسلسلة كلها، وتخفي الفقاعات فوقه طوابعها بدل تكرار اللحظة نفسها أربع مرات.' },
  mgUse1: { en: 'Build the run with `groupMessages` rather than slicing the log yourself. The window, the author break, and the `breaksGroup` escape hatch are all decided in one place, shared with native.', es: 'Construye la serie con `groupMessages` en lugar de cortar el registro por tu cuenta. La ventana, el corte por autor y la vía de escape `breaksGroup` se deciden en un solo sitio, compartido con nativo.', fr: 'Construisez la salve avec `groupMessages` plutôt qu’en découpant le journal vous-même. La fenêtre, la rupture d’auteur et l’échappatoire `breaksGroup` se décident en un seul endroit, partagé avec le natif.', de: 'Bauen Sie die Folge mit `groupMessages`, statt das Log selbst zu zerschneiden. Fenster, Autorenwechsel und der `breaksGroup`-Notausgang werden an einer Stelle entschieden, geteilt mit Native.', ja: 'ログを自分で切り分けず、`groupMessages` で連続を作ってください。時間窓、作者の切り替わり、`breaksGroup` という逃げ道は、ネイティブと共有された1か所で決まります。', pt: 'Construa a sequência com `groupMessages` em vez de cortar o registo por si. A janela, a quebra de autor e a saída de emergência `breaksGroup` decidem-se num só sítio, partilhado com o nativo.', zh: '用 `groupMessages` 构建这串消息，不要自己切分日志。时间窗、作者切换以及 `breaksGroup` 这个逃生口都在同一处决定，并与原生端共享。', ar: 'ابنِ السلسلة بـ`groupMessages` بدل تقطيع السجلّ بنفسك. النافذة الزمنية وتبدّل المؤلّف ومخرج `breaksGroup` تُقرَّر كلها في مكان واحد مشترك مع الأصلي.' },
  mgUse2: { en: 'Give `authorLabel` whenever `authorName` is a node rather than a string, or a continued run loses the only thing naming it.', es: 'Proporciona `authorLabel` siempre que `authorName` sea un nodo y no una cadena, o una serie continuada perderá lo único que la nombra.', fr: 'Fournissez `authorLabel` chaque fois qu’`authorName` est un nœud plutôt qu’une chaîne, sinon une salve continuée perd la seule chose qui la nomme.', de: 'Geben Sie `authorLabel` an, wann immer `authorName` ein Knoten statt eines Strings ist, sonst verliert eine fortgesetzte Folge das Einzige, was sie benennt.', ja: '`authorName` が文字列ではなくノードのときは、必ず `authorLabel` を渡してください。さもないと継続した連続は、それを名づける唯一のものを失います。', pt: 'Forneça `authorLabel` sempre que `authorName` for um nó e não uma cadeia, ou uma sequência continuada perde a única coisa que a nomeia.', zh: '每当 `authorName` 是节点而非字符串时都要给出 `authorLabel`，否则续接的分组会失去唯一为它命名的东西。', ar: 'مرّر `authorLabel` كلما كان `authorName` عقدة لا نصًّا، وإلا فقدت السلسلة المتواصلة الشيء الوحيد الذي يسمّيها.' },
  mgUse3: { en: 'Do not draw a timestamp on every bubble in a run. The single line at the foot is the whole point, and four stamps down one edge is the state a run was built to fix.', es: 'No dibujes una hora en cada burbuja de una serie. La única línea al pie es justamente el propósito, y cuatro marcas por un borde es el estado que la serie se creó para arreglar.', fr: 'Ne dessinez pas d’horodatage sur chaque bulle d’une salve. L’unique ligne en pied est tout l’intérêt, et quatre horodatages le long d’un bord sont précisément l’état que la salve a été conçue pour corriger.', de: 'Zeichnen Sie nicht auf jede Blase einer Folge einen Zeitstempel. Die eine Zeile am Fuß ist der ganze Sinn, und vier Stempel an einer Kante sind genau der Zustand, den eine Folge beheben soll.', ja: '連続の吹き出しすべてにタイムスタンプを描かないでください。末尾の1行こそが眼目であり、端に沿って並ぶ4つの時刻は、連続がまさに直すために作られた状態です。', pt: 'Não desenhe uma hora em cada balão de uma sequência. A única linha no fundo é precisamente o objetivo, e quatro marcas ao longo de um bordo são o estado que a sequência foi feita para corrigir.', zh: '不要给一串消息里的每个气泡都画时间戳。底部那一行才是重点，沿着一侧排下来的四个时间戳，正是分组被创造出来要修正的状态。', ar: 'لا ترسم طابع وقت على كل فقاعة في السلسلة. السطر الوحيد عند القدم هو المقصد كله، وأربعة طوابع على حافة واحدة هي الحالة التي وُجدت السلسلة لإصلاحها.' },
  mgUse4: { en: 'Keep the gutter reserved even when the avatar is suppressed. A continued run whose text shifted left would look like a different speaker, which is the exact confusion the flag exists to prevent.', es: 'Mantén la canaleta reservada aunque el avatar esté suprimido. Una serie continuada cuyo texto se desplazara a la izquierda parecería otro hablante, que es justo la confusión que la marca existe para evitar.', fr: 'Gardez la gouttière réservée même quand l’avatar est supprimé. Une salve continuée dont le texte se décalerait à gauche ressemblerait à un autre locuteur — exactement la confusion que l’indicateur existe pour éviter.', de: 'Halten Sie die Spalte reserviert, auch wenn der Avatar unterdrückt ist. Eine fortgesetzte Folge, deren Text nach links rutschte, sähe nach einem anderen Sprecher aus — genau die Verwechslung, die das Flag verhindern soll.', ja: 'アバターを抑えても余白列は確保したままにしてください。テキストが左にずれた継続の連続は別の話者に見えてしまい、それこそがこのフラグが防ぐために存在する混同です。', pt: 'Mantenha a goteira reservada mesmo quando o avatar é suprimido. Uma sequência continuada cujo texto se deslocasse para a esquerda pareceria outro orador, que é precisamente a confusão que a marca existe para evitar.', zh: '即便隐去头像也要保留栏位。若续接分组的文字向左移动，就会看起来像换了说话人，而这正是该标志存在所要避免的混淆。', ar: 'أبقِ العمود محجوزًا حتى عند كتم الصورة الرمزية. سلسلة متواصلة انزاح نصّها يسارًا ستبدو متحدثًا آخر، وهو تمامًا اللبس الذي وُجدت الراية لمنعه.' },
});

/** A fixed instant, so every timestamp on this page renders the same each load. */
const NOW = Date.UTC(2024, 4, 16, 14, 32);
const MINUTE = 60_000;

/** A run from one author, built by the shared grouper rather than by hand. */
function buildRun(bodies: string[], authorId = 'ada', statuses?: (ChatMessage['status'] | undefined)[]): ChatRun {
  const messages: ChatMessage[] = bodies.map((text, i) => ({
    id: `${authorId}-${String(i)}`,
    authorId,
    // Well inside the five-minute window, so `groupMessages` keeps them together.
    at: NOW - (bodies.length - i) * MINUTE,
    text,
    status: statuses?.[i],
  }));
  // The run is built by the shared grouper, never assembled by hand — the docs
  // exercise the same path an app does.
  return groupMessages(messages)[0] as ChatRun;
}

/** A transcript column with a real width, so the 72% cap has something to measure. */
function Column({ children, width = '21rem' }: { children: ReactNode; width?: string }) {
  return <div style={{ width, maxWidth: '100%', minWidth: 0 }}>{children}</div>;
}

function avatarFor(name: string) {
  return <Avatar name={name} size="sm" />;
}

export function MessageGroupPage() {
  const t = useT();
  const bodies = [t(mg.mgMsg1), t(mg.mgMsg2), t(mg.mgMsg3), t(mg.mgMsg4)];
  const run = buildRun(bodies);
  const ownRun = buildRun([t(mg.mgReply1), t(mg.mgReply2)], 'me', ['read', 'sent']);
  const mixedRun = buildRun([t(mg.mgReply1), t(mg.mgReply2)], 'me', ['read', 'failed']);
  const headRun = buildRun([t(mg.mgMsg1), t(mg.mgMsg2)]);
  // The trailing half of a split run: same author, header suppressed, gutter
  // still reserved so the text lands on the same line as the half above it.
  const continuedRun: ChatRun = { ...buildRun([t(mg.mgMsg3), t(mg.mgMsg4)]), continued: true };

  return (
    <>
      <Heading level={1}>{t(mg.mgName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(mg.mgLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(mg.mgAnatomy))}</Text>
      <ComponentBlueprint specId="message-group" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(mg.mgExOnceTitle)}
        description={prose(t(mg.mgExOnceDesc))}
        component="MessageGroup"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={6}>
            <Column>
              <K.MessageGroup
                group={run}
                avatar={avatarFor(t(mg.mgAuthor))}
                authorName={t(mg.mgAuthor)}
                now={NOW}
              />
            </Column>
            <Column width="24rem">
              <K.MessageGroup
                group={run}
                layout="row"
                avatar={avatarFor(t(mg.mgAuthor))}
                authorName={t(mg.mgAuthor)}
                now={NOW}
              />
            </Column>
          </Stack>
        )}
        code={`import { MessageGroup } from '@glacier/react';
import { groupMessages } from '@glacier/logic';

const [run] = groupMessages(messages);

<MessageGroup
  group={run}
  avatar={<Avatar name="Ada Lovelace" size="sm" />}
  authorName="Ada Lovelace"
  now={now}
/>`}
      />

      <Example
        title={t(mg.mgExContinuedTitle)}
        description={prose(t(mg.mgExContinuedDesc))}
        component="MessageGroup"
        platformLayout="stacked"
        render={(K) => (
          <Column>
            <Stack gap={2}>
              <Text size={Size.Small} tone={TextTone.Subtle} mono>
                {t(mg.mgHeadOfRun)}
              </Text>
              <K.MessageGroup
                group={headRun}
                avatar={avatarFor(t(mg.mgAuthor))}
                authorName={t(mg.mgAuthor)}
                now={NOW}
              />
              <Text size={Size.Small} tone={TextTone.Subtle} mono>
                {t(mg.mgContinuedRun)}
              </Text>
              {/* No avatar and no name reach the screen here, but the label
                  still does — an unlabelled group of messages from nobody is
                  what a screen reader would otherwise hear. */}
              <K.MessageGroup
                group={continuedRun}
                avatar={avatarFor(t(mg.mgAuthor))}
                authorName={t(mg.mgAuthor)}
                authorLabel={t(mg.mgAuthor)}
                now={NOW}
              />
            </Stack>
          </Column>
        )}
        code={`// The trailing half of a split run. The avatar and authorName are still
// passed; the run suppresses them itself, and keeps the gutter reserved so
// the text lands on the same line as the half above.
<MessageGroup
  group={{ ...run, continued: true }}
  avatar={avatar}
  authorName="Ada Lovelace"
  authorLabel="Ada Lovelace"
/>`}
      />

      <Example
        title={t(mg.mgExStatusTitle)}
        description={prose(t(mg.mgExStatusDesc))}
        component="MessageGroup"
        platformLayout="stacked"
        render={(K) => (
          <Column>
            <Stack gap={6}>
              <K.MessageGroup group={ownRun} own now={NOW} />
              <K.MessageGroup group={mixedRun} own now={NOW} />
            </Stack>
          </Column>
        )}
        code={`// ['read', 'sent']   -> the foot says Sent
// ['read', 'failed'] -> the foot says failed, because that is the one
//                       message in the stack asking to be acted on.
<MessageGroup group={run} own now={now} />`}
      />

      <Example
        title={t(mg.mgExSkeletonTitle)}
        description={prose(t(mg.mgExSkeletonDesc))}
        component="MessageGroup"
        platformLayout="stacked"
        render={(K) => (
          <Column>
            <Stack gap={6}>
              <K.MessageGroup group={run} skeleton avatar={<Avatar skeleton size="sm" />} now={NOW} />
              <K.MessageGroup group={ownRun} own skeleton now={NOW} />
            </Stack>
          </Column>
        )}
        code={`<MessageGroup group={run} skeleton now={now} />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'group', type: 'MessageGroup<M>', description: t(mg.mgPropGroup) },
          { name: 'layout', type: "'bubble' | 'row'", default: "'bubble'", description: t(mg.mgPropLayout) },
          { name: 'own', type: 'boolean', description: t(mg.mgPropOwn) },
          { name: 'viewerId', type: 'string', description: t(mg.mgPropViewerId) },
          { name: 'avatar', type: 'ReactNode', description: t(mg.mgPropAvatar) },
          { name: 'authorName', type: 'ReactNode', description: t(mg.mgPropAuthorName) },
          { name: 'authorLabel', type: 'string', description: t(mg.mgPropAuthorLabel) },
          { name: 'tails', type: 'boolean', default: 'true', description: t(mg.mgPropTails) },
          { name: 'now', type: 'Millis', description: t(mg.mgPropNow) },
          { name: 'renderBody', type: '(ctx: MessageSlotContext<M>) => ReactNode', description: t(mg.mgPropRenderBody) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(mg.mgPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(mg.mgA11y1))}</li>
        <li>{prose(t(mg.mgA11y2))}</li>
        <li>{prose(t(mg.mgA11y3))}</li>
        <li>{prose(t(mg.mgA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(mg.mgUse1))}</li>
        <li>{prose(t(mg.mgUse2))}</li>
        <li>{prose(t(mg.mgUse3))}</li>
        <li>{prose(t(mg.mgUse4))}</li>
      </ul>
    </>
  );
}

export { mg as messageGroupPageMessages };
