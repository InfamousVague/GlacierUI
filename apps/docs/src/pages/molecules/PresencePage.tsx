import {
  Avatar,
  Heading,
  List,
  Row,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import { presenceShape, presenceStatuses, type PresenceStatus } from '@glacier/logic';
import { type ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * The people half of the chat suite: reachability as a shape, faces overlapped
 * into one object, and a person as a row.
 *
 * Page strings are defined locally so the file compiles standalone; the handoff
 * lists every key for the integrator to fold into apps/docs/src/i18n.ts.
 */
const p = defineMessages({
  prsName: {
    en: 'Presence & people', es: 'Presencia y personas', fr: 'Présence et personnes',
    de: 'Präsenz & Personen', ja: '在席と人', pt: 'Presença e pessoas',
    zh: '在线状态与人员', ar: 'الحضور والأشخاص',
  },
  prsLede: {
    en: 'Who is reachable, who is in the room, and who has read this far. A closed five-state vocabulary where every state carries a different shape, the arithmetic that turns a roster into a stack of faces and a count, and the list row that puts a person in a list.',
    es: 'Quién está localizable, quién está en la sala y quién ha leído hasta aquí. Un vocabulario cerrado de cinco estados en el que cada uno lleva una forma distinta, la aritmética que convierte una lista de personas en una pila de caras y un recuento, y la fila que pone a una persona en una lista.',
    fr: 'Qui est joignable, qui est dans la pièce, et qui a lu jusqu’ici. Un vocabulaire fermé de cinq états où chacun porte une forme différente, l’arithmétique qui transforme une liste de personnes en pile de visages et en compteur, et la ligne qui met une personne dans une liste.',
    de: 'Wer erreichbar ist, wer im Raum ist und wer bis hierher gelesen hat. Ein geschlossenes Vokabular aus fünf Zuständen, von denen jeder eine andere Form trägt, die Arithmetik, die aus einer Namensliste einen Stapel Gesichter und eine Zahl macht, und die Zeile, die eine Person in eine Liste setzt.',
    ja: '誰が連絡可能で、誰が部屋にいて、誰がここまで読んだか。5 つの状態それぞれが異なる形をもつ閉じた語彙、名簿を顔の重なりと人数に変える計算、そして人をリストに載せる行。',
    pt: 'Quem está contactável, quem está na sala e quem leu até aqui. Um vocabulário fechado de cinco estados em que cada um leva uma forma diferente, a aritmética que transforma uma lista de pessoas numa pilha de rostos e numa contagem, e a linha que põe uma pessoa numa lista.',
    zh: '谁可联系、谁在房间里、谁已读到这里。一套封闭的五状态词汇，每个状态都带有不同形状；把名单变成一叠头像加计数的算术；以及把人放进列表的那一行。',
    ar: 'من يمكن الوصول إليه، ومن في الغرفة، ومن قرأ إلى هنا. مفردات مغلقة من خمس حالات لكلٍّ منها شكل مختلف، والحساب الذي يحوّل قائمة الأشخاص إلى كومة وجوه وعدد، والصف الذي يضع شخصًا في قائمة.',
  },
  prsAnatomy: {
    en: 'The status-to-shape table, the mark proportions, the overlap fraction and the stack cap all live in `@glacier/logic`, so a crescent is the same crescent on both platforms and a fifth person becomes “+1” at the same moment in both.',
    es: 'La tabla de estado a forma, las proporciones de la marca, la fracción de solape y el tope de la pila viven en `@glacier/logic`: un creciente es el mismo creciente en ambas plataformas y la quinta persona se convierte en «+1» en el mismo momento en las dos.',
    fr: 'La table état-vers-forme, les proportions de la marque, la fraction de recouvrement et le plafond de la pile vivent dans `@glacier/logic` : un croissant est le même croissant sur les deux plateformes et la cinquième personne devient « +1 » au même moment des deux côtés.',
    de: 'Die Zustand-zu-Form-Tabelle, die Markenproportionen, der Überlappungsbruch und die Stapelgrenze liegen in `@glacier/logic` — ein Halbmond ist auf beiden Plattformen derselbe Halbmond, und die fünfte Person wird auf beiden im selben Moment zu „+1“.',
    ja: '状態と形の対応表、マークの比率、重なりの割合、スタックの上限はすべて `@glacier/logic` にあります。三日月は両プラットフォームで同じ三日月で、5 人目が「+1」になる瞬間も同じです。',
    pt: 'A tabela estado-para-forma, as proporções da marca, a fração de sobreposição e o limite da pilha vivem em `@glacier/logic`, pelo que um crescente é o mesmo crescente nas duas plataformas e a quinta pessoa torna-se «+1» no mesmo momento em ambas.',
    zh: '状态到形状的对照表、标记比例、重叠比率与堆叠上限都放在 `@glacier/logic` 中，因此弯月在两个平台上是同一个弯月，第五个人也在同一时刻变成“+1”。',
    ar: 'جدول الحالة-إلى-الشكل ونسب العلامة وكسر التداخل وحدّ الكومة كلها في `@glacier/logic`، فالهلال هو الهلال ذاته على المنصتين، ويصبح الشخص الخامس «+1» في اللحظة نفسها في كلتيهما.',
  },

  // ---- PresenceDot ---------------------------------------------------------
  prsExShapesTitle: {
    en: 'Five statuses, five shapes', es: 'Cinco estados, cinco formas', fr: 'Cinq états, cinq formes',
    de: 'Fünf Zustände, fünf Formen', ja: '5 つの状態、5 つの形', pt: 'Cinco estados, cinco formas',
    zh: '五种状态，五种形状', ar: 'خمس حالات، خمسة أشكال',
  },
  prsExShapesDesc: {
    en: 'A solid disc, a disc with a bite out of it, a disc crossed by a bar, a hollow ring, a ring around a core. This is the whole reason PresenceDot exists rather than being a StatusDot tone: roughly one in twelve men cannot separate the green and amber the scale leans on, and a dot is far too small for a hue to survive a bad display.',
    es: 'Un disco sólido, un disco mordido, un disco cruzado por una barra, un anillo hueco, un anillo con núcleo. Esta es toda la razón de que PresenceDot exista en vez de ser un tono de StatusDot: alrededor de uno de cada doce hombres no separa el verde y el ámbar en que se apoya la escala, y un punto es demasiado pequeño para que un tono sobreviva a una pantalla mala.',
    fr: 'Un disque plein, un disque mordu, un disque barré, un anneau creux, un anneau à noyau. C’est toute la raison d’être de PresenceDot plutôt qu’un ton de StatusDot : environ un homme sur douze ne sépare pas le vert et l’ambre sur lesquels l’échelle s’appuie, et un point est bien trop petit pour qu’une teinte survive à un mauvais écran.',
    de: 'Eine volle Scheibe, eine angebissene Scheibe, eine von einem Balken gekreuzte Scheibe, ein hohler Ring, ein Ring um einen Kern. Das ist der ganze Grund, warum PresenceDot existiert statt ein StatusDot-Ton zu sein: etwa jeder zwölfte Mann trennt Grün und Bernstein nicht, auf die sich die Skala stützt, und ein Punkt ist viel zu klein, als dass ein Farbton ein schlechtes Display überlebte.',
    ja: '塗りつぶした円、一部を欠いた円、バーで横切られた円、中空のリング、芯のあるリング。PresenceDot が StatusDot のトーンではなく独立している理由はこれです。男性のおよそ 12 人に 1 人は、このスケールが頼る緑と琥珀を区別できませんし、点は小さすぎて色相が粗い画面を生き延びません。',
    pt: 'Um disco sólido, um disco mordido, um disco cruzado por uma barra, um anel oco, um anel com núcleo. É toda a razão de o PresenceDot existir em vez de ser um tom de StatusDot: cerca de um em cada doze homens não separa o verde e o âmbar em que a escala se apoia, e um ponto é pequeno demais para uma cor sobreviver a um ecrã mau.',
    zh: '实心圆盘、缺一口的圆盘、被横杠穿过的圆盘、空心圆环、带核心的圆环。这正是 PresenceDot 独立存在而不是 StatusDot 某个色调的全部理由：大约每十二名男性中就有一人无法区分该色阶所倚赖的绿与琥珀，而一个点又太小，色相撑不过糟糕的屏幕。',
    ar: 'قرص مصمت، وقرص مقضوم، وقرص يقطعه شريط، وحلقة جوفاء، وحلقة حول نواة. هذا كل سبب وجود PresenceDot بدل أن يكون نبرة في StatusDot: نحو رجل من كل اثني عشر لا يفرّق بين الأخضر والكهرماني اللذين يعتمد عليهما المقياس، والنقطة أصغر من أن ينجو فيها اللون على شاشة رديئة.',
  },
  prsExEnlargedTitle: {
    en: 'The same marks, enlarged', es: 'Las mismas marcas, ampliadas', fr: 'Les mêmes marques, agrandies',
    de: 'Dieselben Marken, vergrößert', ja: '同じ印を拡大', pt: 'As mesmas marcas, ampliadas',
    zh: '同样的标记，放大后', ar: 'العلامات نفسها، مكبّرة',
  },
  prsExEnlargedDesc: {
    en: 'A dot ships at about ten pixels, which is the size the row above renders. This pane is the identical component scaled up so the geometry can be read: the crescent is a bite taken out of the corner, the busy bar is a true horizontal, the invisible core sits inside the ring rather than filling it. The proportions are fractions of the diameter, so they hold at both size steps.',
    es: 'Un punto mide unos diez píxeles, que es el tamaño real de la fila anterior. Este panel es el mismo componente ampliado para poder leer su geometría: el creciente es un mordisco en la esquina, la barra de ocupado es una horizontal real, el núcleo invisible queda dentro del anillo en vez de llenarlo. Las proporciones son fracciones del diámetro, así que se mantienen en ambos tamaños.',
    fr: 'Un point fait environ dix pixels, la taille réelle de la rangée ci-dessus. Ce panneau est le même composant agrandi pour que la géométrie se lise : le croissant est une bouchée prise au coin, la barre « occupé » est une vraie horizontale, le noyau invisible tient dans l’anneau au lieu de le remplir. Les proportions sont des fractions du diamètre, donc elles tiennent aux deux paliers.',
    de: 'Ein Punkt misst rund zehn Pixel — die Größe der Zeile darüber. Dieses Feld ist dieselbe Komponente vergrößert, damit die Geometrie lesbar wird: der Halbmond ist ein Biss aus der Ecke, der Beschäftigt-Balken eine echte Horizontale, der unsichtbare Kern sitzt im Ring, statt ihn zu füllen. Die Proportionen sind Bruchteile des Durchmessers und halten daher auf beiden Größenstufen.',
    ja: '点の実寸はおよそ 10 ピクセルで、上の行がその実サイズです。このペインは同じコンポーネントを拡大したもので、形が読み取れます。三日月は角から欠けた形、取り込み中のバーは真の水平、非表示の芯はリングを埋めずに内側に収まります。比率は直径に対する割合なので、どちらのサイズでも保たれます。',
    pt: 'Um ponto tem cerca de dez píxeis, que é o tamanho a que a linha acima é desenhada. Este painel é o mesmo componente ampliado para a geometria se ler: o crescente é uma dentada no canto, a barra de ocupado é uma horizontal verdadeira, o núcleo invisível fica dentro do anel em vez de o preencher. As proporções são frações do diâmetro, por isso mantêm-se nos dois passos de tamanho.',
    zh: '一个点的实际尺寸约十像素，也就是上一行的真实大小。本窗格是同一组件放大后的样子，好让几何看得清：弯月是从角上咬掉的一口，忙碌横杠是真正的水平线，隐身的核心位于圆环之内而不是把它填满。这些比例是直径的分数，因此在两个尺寸档位上都成立。',
    ar: 'حجم النقطة نحو عشرة بكسلات، وهو الحجم الذي يُرسم به الصف أعلاه. هذه اللوحة هي المكوّن نفسه مكبّرًا لتُقرأ الهندسة: الهلال قضمة من الزاوية، وشريط «مشغول» أفقي حقيقي، والنواة الخفية تجلس داخل الحلقة لا تملؤها. النسب كسور من القُطر، فتثبت عند درجتَي الحجم.',
  },
  prsExPinnedTitle: {
    en: 'Pinned to an avatar', es: 'Anclado a un avatar', fr: 'Épinglé sur un avatar',
    de: 'An einen Avatar geheftet', ja: 'アバターに留める', pt: 'Fixado a um avatar',
    zh: '钉在头像上', ar: 'مثبّتة على صورة رمزية',
  },
  prsExPinnedDesc: {
    en: '`ring` draws a surface-coloured halo behind the dot — a pad behind it rather than an outline on it, so the edge stays clean over a photograph. `presenceDotSize` picks the step that reads correctly against each avatar size: small avatars cannot host the larger dot without the mark swallowing the face.',
    es: '`ring` dibuja un halo del color de la superficie tras el punto: un relleno detrás, no un contorno encima, así el borde queda limpio sobre una foto. `presenceDotSize` elige el paso que se lee bien con cada tamaño de avatar: los avatares pequeños no pueden llevar el punto grande sin que la marca se coma la cara.',
    fr: '`ring` dessine un halo de la couleur de la surface derrière le point — un rembourrage derrière plutôt qu’un contour dessus, pour que le bord reste net sur une photo. `presenceDotSize` choisit le palier qui se lit bien avec chaque taille d’avatar : les petits avatars ne peuvent pas porter le grand point sans que la marque avale le visage.',
    de: '`ring` zeichnet einen flächenfarbenen Halo hinter den Punkt — eine Polsterung dahinter statt einer Kontur darauf, damit die Kante über einem Foto sauber bleibt. `presenceDotSize` wählt die Stufe, die zu jeder Avatargröße passt: kleine Avatare können den größeren Punkt nicht tragen, ohne dass die Marke das Gesicht verschluckt.',
    ja: '`ring` は点の背後に面の色のハローを描きます。上に載せる輪郭線ではなく背後の余白なので、写真の上でも縁が濁りません。`presenceDotSize` は各アバターサイズに合う段階を選びます。小さなアバターに大きい点を載せると、印が顔を飲み込んでしまいます。',
    pt: '`ring` desenha um halo da cor da superfície atrás do ponto — um preenchimento por trás em vez de um contorno por cima, para a margem ficar limpa sobre uma fotografia. `presenceDotSize` escolhe o passo que se lê bem com cada tamanho de avatar: avatares pequenos não podem alojar o ponto maior sem a marca engolir o rosto.',
    zh: '`ring` 在点的后面画一圈与表面同色的光晕——是背后的衬垫而不是叠在上面的描边，因此压在照片上时边缘依旧干净。`presenceDotSize` 会为每种头像尺寸选出合适的档位：小头像若配大点，标记会把脸吞掉。',
    ar: '`ring` يرسم هالة بلون السطح خلف النقطة — حشوة خلفها لا حدًّا فوقها، فتبقى الحافة نظيفة فوق صورة. و`presenceDotSize` يختار الدرجة التي تُقرأ صحيحة مع كل حجم صورة رمزية: الصور الصغيرة لا تحتمل النقطة الأكبر دون أن تبتلع العلامةُ الوجهَ.',
  },

  // ---- AvatarGroup ---------------------------------------------------------
  prsExStackTitle: {
    en: 'Below the cap, at the cap, and over it', es: 'Por debajo del tope, en el tope y por encima', fr: 'Sous le plafond, au plafond, et au-delà',
    de: 'Unter der Grenze, an der Grenze und darüber', ja: '上限未満、ちょうど上限、超過', pt: 'Abaixo do limite, no limite e acima dele',
    zh: '低于上限、恰好到上限、以及超出', ar: 'دون الحدّ، عند الحدّ، وفوقه',
  },
  prsExStackDesc: {
    en: 'The count chip is EXTRA rather than the last slot, so a roster of exactly `max` shows every face and no chip, and a fifth person turns into “+1” beside them. All three cases fall out of one `splitStack` in `@glacier/logic`, so neither binding has to rediscover the boundary.',
    es: 'La ficha de recuento es EXTRA, no el último hueco: una lista de exactamente `max` muestra todas las caras sin ficha, y una quinta persona se convierte en «+1» a su lado. Los tres casos salen de un único `splitStack` en `@glacier/logic`, así ninguna vinculación tiene que redescubrir el límite.',
    fr: 'La pastille de comptage est EN PLUS, pas le dernier emplacement : une liste d’exactement `max` montre tous les visages et aucune pastille, et une cinquième personne devient « +1 » à côté. Les trois cas découlent d’un seul `splitStack` dans `@glacier/logic`, si bien qu’aucune liaison ne redécouvre la frontière.',
    de: 'Der Zähl-Chip ist ZUSÄTZLICH, nicht der letzte Platz: eine Liste von genau `max` zeigt jedes Gesicht und keinen Chip, und eine fünfte Person wird daneben zu „+1“. Alle drei Fälle folgen aus einem `splitStack` in `@glacier/logic`, sodass keine Bindung die Grenze neu entdecken muss.',
    ja: '人数チップは最後の枠ではなく「追加」です。ちょうど `max` 人なら顔だけが並びチップは出ず、5 人目が隣の「+1」になります。3 つの場合はすべて `@glacier/logic` のひとつの `splitStack` から出るので、どちらのバインディングも境界を見つけ直す必要がありません。',
    pt: 'A ficha de contagem é EXTRA, não o último lugar: uma lista de exatamente `max` mostra todos os rostos e nenhuma ficha, e uma quinta pessoa torna-se «+1» ao lado. Os três casos saem de um único `splitStack` em `@glacier/logic`, pelo que nenhuma ligação tem de redescobrir a fronteira.',
    zh: '计数芯片是额外的，而不是占用最后一个位置：正好 `max` 人时会显示全部头像且没有芯片，第五个人则在旁边变成“+1”。这三种情况都出自 `@glacier/logic` 里同一个 `splitStack`，两个绑定都不必重新发现这条边界。',
    ar: 'رقاقة العدد إضافية لا الخانة الأخيرة: قائمة من `max` تمامًا تُظهر كل الوجوه بلا رقاقة، والشخص الخامس يصير «+1» بجوارها. الحالات الثلاث تخرج من `splitStack` واحد في `@glacier/logic`، فلا يحتاج أي ربط لإعادة اكتشاف الحدّ.',
  },
  prsExStackTuningTitle: {
    en: 'Overlap, direction, and the receipt preset', es: 'Solape, dirección y el preajuste de acuse', fr: 'Recouvrement, direction, et le préréglage d’accusé',
    de: 'Überlappung, Richtung und das Empfangs-Preset', ja: '重なり、方向、既読プリセット', pt: 'Sobreposição, direção e a predefinição de recibo',
    zh: '重叠、方向与已读预设', ar: 'التداخل والاتجاه وإعداد الإيصال',
  },
  prsExStackTuningDesc: {
    en: 'The overlap is a fraction of a diameter rather than a length, which is what lets one number hold across all four avatar steps; `clampOverlap` stops at two thirds, past which the covered initials disappear. `ReadReceiptStack` is not a second stack — it is AvatarGroup with the read-receipt preset (smallest step, tighter overlap, lower cap) plus the sentence, since “Ada, Grace, 2 more” under a bubble is ambiguous in a way “Read by Ada, Grace, 2 more” is not.',
    es: 'El solape es una fracción del diámetro, no una longitud: por eso un solo número vale para los cuatro tamaños de avatar; `clampOverlap` se detiene en dos tercios, más allá desaparecen las iniciales tapadas. `ReadReceiptStack` no es una segunda pila: es AvatarGroup con el preajuste de acuse (paso más pequeño, solape más apretado, tope menor) más la frase, porque «Ada, Grace, 2 más» bajo una burbuja es ambiguo de un modo en que «Leído por Ada, Grace, 2 más» no lo es.',
    fr: 'Le recouvrement est une fraction de diamètre plutôt qu’une longueur, ce qui permet à un seul nombre de tenir sur les quatre paliers d’avatar ; `clampOverlap` s’arrête aux deux tiers, au-delà les initiales couvertes disparaissent. `ReadReceiptStack` n’est pas une seconde pile : c’est AvatarGroup avec le préréglage d’accusé (plus petit palier, recouvrement plus serré, plafond plus bas) plus la phrase, car « Ada, Grace, 2 de plus » sous une bulle est ambigu là où « Lu par Ada, Grace, 2 de plus » ne l’est pas.',
    de: 'Die Überlappung ist ein Bruchteil eines Durchmessers statt einer Länge — deshalb hält eine Zahl über alle vier Avatarstufen; `clampOverlap` stoppt bei zwei Dritteln, darüber verschwinden die verdeckten Initialen. `ReadReceiptStack` ist kein zweiter Stapel: es ist AvatarGroup mit dem Lesebestätigungs-Preset (kleinste Stufe, engere Überlappung, niedrigere Grenze) plus dem Satz, denn „Ada, Grace, 2 weitere“ unter einer Blase ist mehrdeutig, „Gelesen von Ada, Grace, 2 weitere“ nicht.',
    ja: '重なりは長さではなく直径に対する割合なので、ひとつの数値が 4 つのアバターサイズすべてで通用します。`clampOverlap` は 3 分の 2 で止まり、それを超えると隠れたイニシャルが消えます。`ReadReceiptStack` は 2 つ目のスタックではなく、既読用プリセット（最小サイズ、きつめの重なり、低い上限）を当てた AvatarGroup に文を足したものです。バブルの下の「Ada, Grace, 他 2 人」は曖昧ですが、「Ada, Grace, 他 2 人が既読」なら曖昧ではありません。',
    pt: 'A sobreposição é uma fração de diâmetro em vez de um comprimento, o que permite a um só número valer nos quatro passos de avatar; `clampOverlap` para nos dois terços, além dos quais as iniciais tapadas desaparecem. `ReadReceiptStack` não é uma segunda pilha — é AvatarGroup com a predefinição de recibo (passo mais pequeno, sobreposição mais apertada, limite mais baixo) mais a frase, porque «Ada, Grace, mais 2» sob um balão é ambíguo de um modo que «Lido por Ada, Grace, mais 2» não é.',
    zh: '重叠是直径的分数而不是长度，所以一个数值能贯穿四个头像档位；`clampOverlap` 停在三分之二，再往上被遮住的首字母就消失了。`ReadReceiptStack` 不是第二种堆叠——它就是套用了已读预设（最小档、更紧的重叠、更低的上限）的 AvatarGroup，外加那句话，因为气泡下的“Ada、Grace，还有 2 人”含糊，而“Ada、Grace，还有 2 人已读”不会。',
    ar: 'التداخل كسر من القُطر لا طول، وهذا ما يجعل رقمًا واحدًا يصلح لدرجات الصور الأربع؛ و`clampOverlap` يقف عند الثلثين، وبعدها تختفي الأحرف المغطاة. و`ReadReceiptStack` ليس كومة ثانية — إنه AvatarGroup بإعداد الإيصال (أصغر درجة، تداخل أضيق، حدّ أدنى) مع الجملة، لأن «Ada وGrace و2 آخرون» تحت فقاعة غامضة بخلاف «قرأها Ada وGrace و2 آخرون».',
  },

  // ---- MemberRow -----------------------------------------------------------
  prsExMembersTitle: {
    en: 'A roster', es: 'Una lista de miembros', fr: 'Une liste de membres',
    de: 'Eine Mitgliederliste', ja: 'メンバー一覧', pt: 'Uma lista de membros',
    zh: '成员名单', ar: 'قائمة أعضاء',
  },
  prsExMembersDesc: {
    en: 'A ListItem with a person in it, not a new row: the layout, the hover and selected paint, and the div/anchor/button switch are all the list item’s. What it adds is the avatar with presence pinned to its corner, the role pill, and the actions slot. There is no RoleBadge in the kit because a role badge is a Pill — the only thing that needed a shared home was which tone a role takes, so both bindings agree that “Owner” is accent.',
    es: 'Un ListItem con una persona dentro, no una fila nueva: la disposición, el pintado de hover y seleccionado, y el conmutador div/enlace/botón son del elemento de lista. Añade el avatar con la presencia anclada en la esquina, la píldora de rol y el hueco de acciones. No hay RoleBadge en el kit porque una insignia de rol es una Pill: lo único que necesitaba hogar compartido era qué tono toma un rol, para que ambas vinculaciones coincidan en que «Owner» es acento.',
    fr: 'Un ListItem avec une personne dedans, pas une nouvelle rangée : la mise en page, les états survol et sélectionné, et le commutateur div/lien/bouton appartiennent à l’élément de liste. Ce qu’il ajoute : l’avatar avec la présence épinglée au coin, la pastille de rôle, et l’emplacement d’actions. Il n’y a pas de RoleBadge dans le kit parce qu’un badge de rôle est une Pill — la seule chose qui devait avoir un foyer commun était le ton d’un rôle, pour que les deux liaisons s’accordent sur « Owner » en accent.',
    de: 'Ein ListItem mit einer Person darin, keine neue Zeile: Layout, Hover- und Auswahlfarbe sowie der div/Anchor/Button-Schalter gehören dem Listenelement. Hinzu kommen der Avatar mit der an seine Ecke gehefteten Präsenz, die Rollen-Pill und der Aktionsslot. Es gibt kein RoleBadge im Kit, weil ein Rollen-Badge eine Pill ist — das Einzige, was ein gemeinsames Zuhause brauchte, war der Ton einer Rolle, damit beide Bindungen sich einig sind, dass „Owner“ Akzent ist.',
    ja: '新しい行ではなく、人が入った ListItem です。レイアウト、ホバーと選択の塗り、div／アンカー／ボタンの切り替えはすべてリスト項目のもの。足すのは、角に在席を留めたアバター、役割のピル、アクション枠です。役割バッジは Pill なので kit に RoleBadge はありません。共有が必要だったのは役割がどのトーンになるかだけで、両バインディングが「Owner」はアクセントだと一致します。',
    pt: 'Um ListItem com uma pessoa dentro, não uma linha nova: a disposição, a pintura de hover e selecionado, e a troca div/âncora/botão são todas do item de lista. O que acrescenta é o avatar com a presença fixada ao canto, a pílula de papel e o slot de ações. Não há RoleBadge no kit porque um selo de papel é uma Pill — a única coisa que precisava de casa comum era que tom um papel toma, para ambas as ligações concordarem que «Owner» é acento.',
    zh: '这是装了一个人的 ListItem，而不是新的一行：布局、悬停与选中的着色、div／链接／按钮的切换全都属于列表项。它增加的是把在线状态钉在角上的头像、角色胶囊标签和操作插槽。套件里没有 RoleBadge，因为角色徽章就是 Pill——唯一需要共同归宿的是某个角色取哪个色调，好让两个绑定都认同“Owner”是强调色。',
    ar: 'إنه ListItem بداخله شخص، لا صف جديد: التخطيط وألوان التحويم والاختيار ومبدّل div/رابط/زر كلها للعنصر. ما يضيفه هو الصورة الرمزية مع الحضور مثبّتًا في زاويتها، وشارة الدور، وخانة الإجراءات. لا يوجد RoleBadge في العدّة لأن شارة الدور هي Pill — الشيء الوحيد الذي احتاج بيتًا مشتركًا هو نبرة الدور، ليتفق الربطان على أن «Owner» بلون التمييز.',
  },
  prsExMembersSecondary: {
    en: 'Staff engineer, Platform', es: 'Ingeniera principal, Plataforma', fr: 'Ingénieure principale, Plateforme',
    de: 'Staff Engineer, Plattform', ja: 'スタッフエンジニア（プラットフォーム）', pt: 'Engenheira principal, Plataforma',
    zh: '资深工程师，平台组', ar: 'مهندسة أولى، المنصّة',
  },
  prsExMembersSecondary2: {
    en: 'Design, on until 18:00', es: 'Diseño, hasta las 18:00', fr: 'Design, jusqu’à 18h00',
    de: 'Design, bis 18:00 Uhr', ja: 'デザイン、18:00 まで', pt: 'Design, até às 18:00',
    zh: '设计，工作到 18:00', ar: 'التصميم، حتى 18:00',
  },
  prsExMembersSecondary3: {
    en: 'Automated release notes', es: 'Notas de versión automáticas', fr: 'Notes de version automatiques',
    de: 'Automatische Release-Notizen', ja: '自動リリースノート', pt: 'Notas de versão automáticas',
    zh: '自动发布说明', ar: 'ملاحظات إصدار آلية',
  },

  // ---- accessibility -------------------------------------------------------
  prsA11y1: {
    en: 'A presence dot names itself by default. `role="img"` with the status as its label, not `role="status"` — a member list holds dozens of these, and a live region per dot would turn one person signing in into a roster announcement.',
    es: 'Un punto de presencia se nombra por defecto. `role="img"` con el estado como etiqueta, no `role="status"`: una lista de miembros tiene decenas, y una región viva por punto convertiría un inicio de sesión en un anuncio de toda la lista.',
    fr: 'Un point de présence se nomme par défaut. `role="img"` avec l’état pour libellé, pas `role="status"` — une liste de membres en contient des dizaines, et une région live par point transformerait une connexion en annonce de tout l’effectif.',
    de: 'Ein Präsenzpunkt benennt sich standardmäßig selbst. `role="img"` mit dem Status als Label, nicht `role="status"` — eine Mitgliederliste enthält Dutzende davon, und eine Live-Region je Punkt machte aus einer Anmeldung eine Ansage der ganzen Liste.',
    ja: '在席ドットは既定で自ら名乗ります。`role="status"` ではなく、状態をラベルにした `role="img"` です。メンバー一覧には何十個もあり、ドットごとにライブリージョンを置くと、1 人のサインインが名簿の読み上げになってしまいます。',
    pt: 'Um ponto de presença nomeia-se por omissão. `role="img"` com o estado como rótulo, não `role="status"` — uma lista de membros tem dezenas destes, e uma região viva por ponto tornaria uma entrada numa leitura de toda a lista.',
    zh: '在线状态点默认会说出自己。它是以状态为标签的 `role="img"`，而不是 `role="status"`——一份成员名单里有几十个，若每个点都是实时区域，一个人登录就会变成整份名单的播报。',
    ar: 'نقطة الحضور تسمّي نفسها افتراضيًا. `role="img"` واسمها الحالة، لا `role="status"` — قائمة الأعضاء تحوي عشرات منها، ومنطقة حيّة لكل نقطة ستحوّل تسجيل دخول واحد إلى إعلان القائمة كاملة.',
  },
  prsA11y2: {
    en: 'Inside a `MemberRow` the dot is deliberately decorative and the status name rides in the title as visually hidden text. A list item’s leading slot is hidden from assistive tech, so a labelled dot in there would be silently dropped and presence would end up colour-only.',
    es: 'Dentro de un `MemberRow` el punto es decorativo a propósito y el nombre del estado viaja en el título como texto oculto visualmente. El hueco inicial de un elemento de lista está oculto a la tecnología de asistencia, así que un punto etiquetado ahí se descartaría en silencio y la presencia quedaría solo en color.',
    fr: 'Dans un `MemberRow`, le point est délibérément décoratif et le nom du statut voyage dans le titre en texte masqué visuellement. L’emplacement de tête d’un élément de liste est caché aux technologies d’assistance : un point étiqueté y serait silencieusement ignoré et la présence deviendrait uniquement colorée.',
    de: 'In einer `MemberRow` ist der Punkt bewusst dekorativ, und der Statusname reist im Titel als visuell verborgener Text mit. Der führende Slot eines Listenelements ist vor assistiver Technik verborgen, ein beschrifteter Punkt dort fiele also lautlos weg und Präsenz wäre nur noch Farbe.',
    ja: '`MemberRow` の中ではドットを意図的に装飾扱いにし、状態名は視覚的に隠したテキストとしてタイトルに載せます。リスト項目の先頭スロットは支援技術から隠されるため、そこにラベル付きのドットを置いても黙って落ち、在席が色だけになってしまいます。',
    pt: 'Dentro de um `MemberRow` o ponto é deliberadamente decorativo e o nome do estado viaja no título como texto visualmente escondido. O slot inicial de um item de lista está escondido da tecnologia assistiva, pelo que um ponto rotulado ali seria silenciosamente descartado e a presença ficaria só na cor.',
    zh: '在 `MemberRow` 内部，这个点被刻意设为装饰性，状态名称以视觉隐藏文本的形式随标题一起出现。列表项的前导插槽对辅助技术是隐藏的，把带标签的点放在那里会被悄悄丢掉，在线状态就只剩颜色了。',
    ar: 'داخل `MemberRow` النقطة زخرفية عمدًا، واسم الحالة يركب في العنوان كنص مخفي بصريًا. الخانة الأمامية لعنصر القائمة مخفية عن التقنيات المساعدة، فنقطة معنونة هناك ستُسقط بصمت ويصير الحضور لونًا فقط.',
  },
  prsA11y3: {
    en: 'A stack is one `role="group"` naming everyone it drew, then the count it did not — comma-joined rather than “A, B and C”, because the conjunction differs per language and per list length. Each face inside is `aria-hidden`: four unlabelled images in a row is noise, not detail.',
    es: 'Una pila es un solo `role="group"` que nombra a todos los que dibujó y luego al recuento que no — unidos por comas en vez de «A, B y C», porque la conjunción cambia según el idioma y la longitud. Cada cara interior es `aria-hidden`: cuatro imágenes sin etiqueta seguidas son ruido, no detalle.',
    fr: 'Une pile est un seul `role="group"` nommant tous ceux qu’elle a dessinés, puis le compte restant — joint par des virgules plutôt que « A, B et C », car la conjonction varie selon la langue et la longueur. Chaque visage à l’intérieur est `aria-hidden` : quatre images sans libellé à la suite sont du bruit, pas du détail.',
    de: 'Ein Stapel ist eine `role="group"`, die alle Gezeichneten nennt und danach die Zahl der Übrigen — kommagetrennt statt „A, B und C“, denn die Konjunktion unterscheidet sich je Sprache und Listenlänge. Jedes Gesicht darin ist `aria-hidden`: vier unbeschriftete Bilder in Folge sind Rauschen, kein Detail.',
    ja: 'スタックは `role="group"` ひとつで、描いた全員の名前と描かなかった人数を名乗ります。「A、B と C」ではなくカンマ区切りなのは、接続詞が言語と要素数で変わるからです。中の顔はすべて `aria-hidden` です。ラベルのない画像が 4 つ並ぶのは詳細ではなく雑音です。',
    pt: 'Uma pilha é um único `role="group"` que nomeia todos os que desenhou e depois a contagem que não — unidos por vírgulas em vez de «A, B e C», porque a conjunção varia por idioma e por comprimento. Cada rosto dentro é `aria-hidden`: quatro imagens sem rótulo em fila são ruído, não detalhe.',
    zh: '一叠头像是一个 `role="group"`，先念出它画出的所有人，再念它没画的人数——用逗号连接而不是“A、B 和 C”，因为连接词随语言和列表长度而变。里面每张脸都是 `aria-hidden`：连着四张无标签图片是噪音，不是细节。',
    ar: 'الكومة هي `role="group"` واحدة تسمّي كل من رسمتهم ثم عدد من لم ترسمهم — موصولة بفواصل لا «A وB وC»، لأن أداة العطف تختلف بحسب اللغة وطول القائمة. وكل وجه بالداخل `aria-hidden`: أربع صور بلا أسماء في صف واحد ضجيج لا تفصيل.',
  },

  // ---- usage ---------------------------------------------------------------
  prsUse1: {
    en: 'Reach for `StatusDot` when you need the kit’s open tone scale to mean whatever your screen needs. Reach for `PresenceDot` only for people: it is a closed vocabulary, and inventing a sixth member is how two screens end up disagreeing about what amber means.',
    es: 'Usa `StatusDot` cuando necesites la escala abierta de tonos para significar lo que tu pantalla necesite. Usa `PresenceDot` solo para personas: es un vocabulario cerrado, e inventar un sexto miembro es como dos pantallas acaban discrepando sobre qué significa el ámbar.',
    fr: 'Prenez `StatusDot` quand vous avez besoin de l’échelle de tons ouverte pour signifier ce que votre écran veut. Prenez `PresenceDot` uniquement pour les personnes : c’est un vocabulaire fermé, et inventer un sixième membre est la façon dont deux écrans finissent par ne plus s’accorder sur le sens de l’ambre.',
    de: 'Greif zu `StatusDot`, wenn du die offene Tonskala des Kits brauchst, um zu bedeuten, was dein Screen braucht. Greif zu `PresenceDot` nur für Menschen: es ist ein geschlossenes Vokabular, und ein sechstes Mitglied zu erfinden ist der Weg, auf dem zwei Screens sich über Bernstein uneinig werden.',
    ja: '画面ごとに意味を決めたいときは kit の開いたトーンスケール、つまり `StatusDot` を使ってください。`PresenceDot` は人にだけ。閉じた語彙であり、6 つ目を発明することが、2 つの画面で琥珀の意味が食い違い始める原因です。',
    pt: 'Use `StatusDot` quando precisar da escala aberta de tons do kit para significar o que o seu ecrã precisa. Use `PresenceDot` apenas para pessoas: é um vocabulário fechado, e inventar um sexto membro é como dois ecrãs acabam a discordar sobre o que o âmbar significa.',
    zh: '当你需要套件的开放色调阶来表达屏幕自身含义时，选 `StatusDot`。`PresenceDot` 只用于人：它是封闭词汇，自行发明第六个成员，正是两个界面开始对琥珀色含义各执一词的方式。',
    ar: 'استخدم `StatusDot` حين تحتاج مقياس النبرات المفتوح ليعني ما تحتاجه شاشتك. واستخدم `PresenceDot` للأشخاص فقط: مفرداته مغلقة، واختراع عضو سادس هو الطريق ليختلف شاشتان على معنى الكهرماني.',
  },
  prsUse2: {
    en: 'Show `invisible` only to the person themselves. It means signed in but appearing offline to everyone else, which is why it is distinct from `offline` — leaking it to other members turns a privacy setting into a tell.',
    es: 'Muestra `invisible` solo a la propia persona. Significa conectado pero apareciendo desconectado para los demás, y por eso se distingue de `offline`: filtrarlo a otros miembros convierte un ajuste de privacidad en una pista.',
    fr: 'N’affichez `invisible` qu’à la personne elle-même. Cela signifie connecté mais apparaissant hors ligne pour tous les autres, d’où sa distinction d’avec `offline` — le laisser fuiter aux autres membres transforme un réglage de confidentialité en indice.',
    de: 'Zeige `invisible` nur der Person selbst. Es bedeutet angemeldet, aber für alle anderen offline erscheinend — deshalb ist es von `offline` verschieden; es an andere Mitglieder durchzulassen macht aus einer Datenschutzeinstellung einen Verräter.',
    ja: '`invisible` は本人にだけ表示してください。サインインしているが他の全員にはオフラインに見える状態で、だからこそ `offline` と区別されています。他のメンバーに漏らせば、プライバシー設定が手がかりに変わります。',
    pt: 'Mostre `invisible` apenas à própria pessoa. Significa com sessão iniciada mas a aparecer offline para todos os outros, e por isso é distinto de `offline` — deixá-lo escapar para outros membros transforma uma definição de privacidade num sinal.',
    zh: '只向本人显示 `invisible`。它表示已登录但对其他所有人显示为离线，这正是它区别于 `offline` 的原因——泄露给其他成员，会把一项隐私设置变成线索。',
    ar: 'أظهر `invisible` للشخص نفسه فقط. تعني أنه مسجّل الدخول لكنه يبدو غير متصل للجميع، ولهذا تختلف عن `offline` — وتسريبها لبقية الأعضاء يحوّل إعداد خصوصية إلى دلالة.',
  },
  prsUse3: {
    en: 'Omit `status` on a `MemberRow` when presence is unknown rather than passing `offline`. An absent dot means unknown; a hollow ring is a claim that the person is not signed in.',
    es: 'Omite `status` en un `MemberRow` cuando la presencia sea desconocida en vez de pasar `offline`. Un punto ausente significa desconocido; un anillo hueco afirma que la persona no está conectada.',
    fr: 'Omettez `status` sur un `MemberRow` quand la présence est inconnue plutôt que de passer `offline`. Un point absent signifie inconnu ; un anneau creux affirme que la personne n’est pas connectée.',
    de: 'Lass `status` an einer `MemberRow` weg, wenn die Präsenz unbekannt ist, statt `offline` zu übergeben. Ein fehlender Punkt heißt unbekannt; ein hohler Ring ist die Behauptung, die Person sei nicht angemeldet.',
    ja: '在席が不明なときは `offline` を渡さず、`MemberRow` の `status` を省いてください。ドットがないことは不明を意味し、中空のリングはその人がサインインしていないという主張です。',
    pt: 'Omita `status` num `MemberRow` quando a presença for desconhecida, em vez de passar `offline`. Um ponto ausente significa desconhecido; um anel oco afirma que a pessoa não tem sessão iniciada.',
    zh: '当在线状态未知时，请省略 `MemberRow` 的 `status`，而不是传 `offline`。没有点表示未知；空心圆环则是在断言此人未登录。',
    ar: 'احذف `status` من `MemberRow` حين يكون الحضور مجهولًا بدل تمرير `offline`. غياب النقطة يعني مجهول؛ أما الحلقة الجوفاء فادّعاء بأن الشخص غير مسجّل الدخول.',
  },
  prsUse4: {
    en: 'Let the stack be the tab stop, not the faces. A group is one object with one accessible name; making each avatar focusable puts four extra tab stops in a header nobody wanted to walk through.',
    es: 'Deja que la pila sea la parada de tabulación, no las caras. Un grupo es un objeto con un nombre accesible; hacer enfocable cada avatar añade cuatro paradas de más en una cabecera que nadie quería recorrer.',
    fr: 'Faites de la pile l’arrêt de tabulation, pas des visages. Un groupe est un objet avec un nom accessible ; rendre chaque avatar focalisable ajoute quatre arrêts de plus dans un en-tête que personne ne voulait parcourir.',
    de: 'Lass den Stapel den Tabstopp sein, nicht die Gesichter. Eine Gruppe ist ein Objekt mit einem barrierefreien Namen; jeden Avatar fokussierbar zu machen setzt vier zusätzliche Tabstopps in einen Header, den niemand durchlaufen wollte.',
    ja: 'タブ停止はスタック全体にし、個々の顔には置かないでください。グループはアクセシブルネームをひとつ持つ 1 個のオブジェクトです。アバターごとにフォーカスできるようにすると、誰も通り抜けたくないヘッダーにタブ停止が 4 つ増えます。',
    pt: 'Deixe a pilha ser a paragem de tabulação, não os rostos. Um grupo é um objeto com um nome acessível; tornar cada avatar focável acrescenta quatro paragens a mais num cabeçalho que ninguém queria percorrer.',
    zh: '让整叠头像成为 Tab 停靠点，而不是每张脸。一个群组是拥有单一可访问名称的一个对象；让每个头像都可聚焦，只会在没人想逐个走过的标题栏里多出四个停靠点。',
    ar: 'اجعل الكومة هي محطة التنقّل، لا الوجوه. المجموعة كائن واحد باسم وصولي واحد؛ وجعل كل صورة قابلة للتركيز يضيف أربع محطات في رأس لا أحد أراد المرور به.',
  },

  // ---- props ---------------------------------------------------------------
  prsPropDotStatus: { en: 'Which of the five reachability states the dot reports.', es: 'Cuál de los cinco estados de disponibilidad informa el punto.', fr: 'Lequel des cinq états de joignabilité le point rapporte.', de: 'Welchen der fünf Erreichbarkeitszustände der Punkt meldet.', ja: '5 つの到達可能性状態のどれを示すか。', pt: 'Qual dos cinco estados de contactabilidade o ponto reporta.', zh: '该点报告五种可达状态中的哪一个。', ar: 'أي حالات الوصول الخمس تُبلّغ عنها النقطة.' },
  prsPropDotSize: { en: 'Compact size step; the mark holds its proportions at both.', es: 'Paso de tamaño compacto; la marca mantiene sus proporciones en ambos.', fr: 'Palier de taille compact ; la marque garde ses proportions aux deux.', de: 'Kompakte Größenstufe; die Marke hält ihre Proportionen bei beiden.', ja: 'コンパクトなサイズ段階。印はどちらでも比率を保ちます。', pt: 'Passo de tamanho compacto; a marca mantém as proporções em ambos.', zh: '紧凑尺寸档位；标记在两档下都保持比例。', ar: 'درجة حجم مضغوطة؛ تحافظ العلامة على نسبها في كلتيهما.' },
  prsPropDotRing: { en: 'Draws a surface-coloured halo behind the dot, for pinning it to an avatar.', es: 'Dibuja un halo del color de la superficie tras el punto, para anclarlo a un avatar.', fr: 'Dessine un halo de la couleur de la surface derrière le point, pour l’épingler sur un avatar.', de: 'Zeichnet einen flächenfarbenen Halo hinter den Punkt, zum Anheften an einen Avatar.', ja: '点の背後に面の色のハローを描き、アバターに留められるようにします。', pt: 'Desenha um halo da cor da superfície atrás do ponto, para o fixar a um avatar.', zh: '在点后画一圈与表面同色的光晕，便于钉在头像上。', ar: 'يرسم هالة بلون السطح خلف النقطة لتثبيتها على صورة رمزية.' },
  prsPropLabelOverride: { en: 'Overrides the text alternative; defaults to the status’s own name.', es: 'Sustituye el texto alternativo; por defecto, el nombre del estado.', fr: 'Remplace l’alternative textuelle ; par défaut le nom de l’état.', de: 'Überschreibt die Textalternative; standardmäßig der Name des Zustands.', ja: '代替テキストを上書きします。既定は状態自身の名前です。', pt: 'Substitui a alternativa textual; por omissão, o nome do estado.', zh: '覆盖替代文本；默认为该状态自身的名称。', ar: 'يتجاوز البديل النصي؛ الافتراضي اسم الحالة.' },
  prsPropDecorative: { en: 'Hides the dot from assistive tech. Only when adjacent visible text already states the presence.', es: 'Oculta el punto a la tecnología de asistencia. Solo si el texto visible contiguo ya indica la presencia.', fr: 'Masque le point aux technologies d’assistance. Uniquement si le texte visible voisin indique déjà la présence.', de: 'Verbirgt den Punkt vor assistiver Technik. Nur wenn benachbarter sichtbarer Text die Präsenz bereits nennt.', ja: 'ドットを支援技術から隠します。隣の可視テキストがすでに在席を述べている場合のみ。', pt: 'Esconde o ponto da tecnologia assistiva. Só se o texto visível ao lado já indicar a presença.', zh: '对辅助技术隐藏该点。仅当相邻可见文本已说明在线状态时使用。', ar: 'يُخفي النقطة عن التقنيات المساعدة. فقط إذا كان النص المرئي المجاور يذكر الحضور.' },
  prsPropSkeleton: { en: 'Renders a placeholder with the component’s exact geometry.', es: 'Renderiza un marcador con la geometría exacta del componente.', fr: 'Rend un espace réservé à la géométrie exacte du composant.', de: 'Rendert einen Platzhalter mit der exakten Geometrie der Komponente.', ja: 'コンポーネントとまったく同じ寸法のプレースホルダーを描画します。', pt: 'Renderiza um marcador com a geometria exata do componente.', zh: '渲染与组件几何完全一致的占位符。', ar: 'يعرض عنصرًا نائبًا بهندسة المكوّن نفسها.' },
  prsPropLabelsMerge: { en: 'Overrides the English names; merged over the shared defaults.', es: 'Sustituye los nombres en inglés; se fusiona sobre los valores compartidos.', fr: 'Remplace les noms anglais ; fusionné par-dessus les valeurs partagées.', de: 'Überschreibt die englischen Namen; über die geteilten Vorgaben gelegt.', ja: '英語の名称を上書きします。共有の既定値の上にマージされます。', pt: 'Substitui os nomes em inglês; fundido sobre os valores partilhados.', zh: '覆盖英文名称；合并在共享默认值之上。', ar: 'يتجاوز الأسماء الإنجليزية؛ يُدمج فوق القيم الافتراضية المشتركة.' },

  prsPropGrpAvatars: { en: 'The roster, in the order it should read.', es: 'La lista de personas, en el orden en que debe leerse.', fr: 'La liste des personnes, dans l’ordre de lecture.', de: 'Die Namensliste in ihrer Lesereihenfolge.', ja: '読まれるべき順の名簿。', pt: 'A lista de pessoas, pela ordem em que deve ser lida.', zh: '名单，按应读出的顺序。', ar: 'القائمة بالترتيب الذي يجب أن تُقرأ به.' },
  prsPropGrpMax: { en: 'How many avatars are drawn. The count chip is extra rather than the last slot.', es: 'Cuántos avatares se dibujan. La ficha de recuento es extra, no el último hueco.', fr: 'Combien d’avatars sont dessinés. La pastille de comptage est en plus, pas le dernier emplacement.', de: 'Wie viele Avatare gezeichnet werden. Der Zähl-Chip ist zusätzlich, nicht der letzte Platz.', ja: '描画するアバター数。人数チップは最後の枠ではなく追加です。', pt: 'Quantos avatares são desenhados. A ficha de contagem é extra, não o último lugar.', zh: '绘制多少个头像。计数芯片是额外的，而非最后一个位置。', ar: 'كم صورة تُرسم. رقاقة العدد إضافية لا الخانة الأخيرة.' },
  prsPropGrpOverlap: { en: 'How much of a diameter each avatar covers of the one before it.', es: 'Cuánto diámetro cubre cada avatar del anterior.', fr: 'Quelle part de diamètre chaque avatar couvre du précédent.', de: 'Wie viel Durchmesser jeder Avatar vom vorherigen verdeckt.', ja: '各アバターが直前のものを直径のどれだけ覆うか。', pt: 'Quanto de um diâmetro cada avatar cobre do anterior.', zh: '每个头像遮住前一个的直径比例。', ar: 'كم من القُطر تغطّي كل صورة من التي قبلها.' },
  prsPropGrpDirection: { en: 'Which end of the stack paints on top.', es: 'Qué extremo de la pila se pinta encima.', fr: 'Quel bout de la pile se peint au-dessus.', de: 'Welches Ende des Stapels obenauf gemalt wird.', ja: 'スタックのどちらの端を上に描くか。', pt: 'Que extremo da pilha é pintado por cima.', zh: '堆叠的哪一端画在上面。', ar: 'أي طرف من الكومة يُرسم في الأعلى.' },
  prsPropGrpRing: { en: 'Draws a surface-coloured ring around each avatar so overlapping edges separate.', es: 'Dibuja un anillo del color de la superficie en cada avatar para separar bordes solapados.', fr: 'Dessine un anneau de la couleur de la surface autour de chaque avatar pour séparer les bords qui se recouvrent.', de: 'Zeichnet einen flächenfarbenen Ring um jeden Avatar, damit sich überlappende Kanten trennen.', ja: '各アバターの周りに面の色のリングを描き、重なる縁を分けます。', pt: 'Desenha um anel da cor da superfície à volta de cada avatar para separar margens sobrepostas.', zh: '在每个头像周围画一圈与表面同色的环，让重叠的边缘分开。', ar: 'يرسم حلقة بلون السطح حول كل صورة لفصل الحواف المتداخلة.' },
  prsPropGrpLabel: { en: 'Accessible name for the group; defaults to naming everyone it shows.', es: 'Nombre accesible del grupo; por defecto nombra a todos los que muestra.', fr: 'Nom accessible du groupe ; par défaut il nomme tous ceux qu’il affiche.', de: 'Barrierefreier Name der Gruppe; standardmäßig werden alle Gezeigten benannt.', ja: 'グループのアクセシブルネーム。既定では表示している全員を名乗ります。', pt: 'Nome acessível do grupo; por omissão nomeia todos os que mostra.', zh: '该组的可访问名称；默认列出它所展示的每个人。', ar: 'الاسم الوصولي للمجموعة؛ الافتراضي تسمية كل من تعرضهم.' },
  prsPropGrpShape: { en: 'Circle or rounded square, matching the Avatar it stacks.', es: 'Círculo o cuadrado redondeado, a juego con el Avatar que apila.', fr: 'Cercle ou carré arrondi, assorti à l’Avatar empilé.', de: 'Kreis oder abgerundetes Quadrat, passend zum gestapelten Avatar.', ja: '円か角丸の四角。積み重ねる Avatar に合わせます。', pt: 'Círculo ou quadrado arredondado, a condizer com o Avatar que empilha.', zh: '圆形或圆角方形，与它所堆叠的 Avatar 一致。', ar: 'دائرة أو مربع مستدير، مطابق للـAvatar المكدّس.' },

  prsPropRcpReaders: { en: 'Who has read up to this point, in the order they should read.', es: 'Quién ha leído hasta aquí, en el orden en que debe leerse.', fr: 'Qui a lu jusqu’ici, dans l’ordre de lecture.', de: 'Wer bis hierher gelesen hat, in Lesereihenfolge.', ja: 'ここまで読んだ人を、読まれるべき順に。', pt: 'Quem leu até aqui, pela ordem em que deve ser lido.', zh: '已读到此处的人，按应读出的顺序。', ar: 'من قرأ إلى هنا، بالترتيب المطلوب.' },
  prsPropRcpLabel: { en: 'Accessible name; defaults to “Read by” followed by the readers it shows.', es: 'Nombre accesible; por defecto «Leído por» seguido de los lectores que muestra.', fr: 'Nom accessible ; par défaut « Lu par » suivi des lecteurs affichés.', de: 'Barrierefreier Name; standardmäßig „Gelesen von“ und die gezeigten Leser.', ja: 'アクセシブルネーム。既定は「Read by」に続けて表示している読者。', pt: 'Nome acessível; por omissão «Lido por» seguido dos leitores mostrados.', zh: '可访问名称；默认是“Read by”加上所展示的读者。', ar: 'الاسم الوصولي؛ الافتراضي «قرأها» يليه القرّاء المعروضون.' },

  prsPropRowName: { en: 'The person’s name.', es: 'El nombre de la persona.', fr: 'Le nom de la personne.', de: 'Der Name der Person.', ja: 'その人の名前。', pt: 'O nome da pessoa.', zh: '此人的姓名。', ar: 'اسم الشخص.' },
  prsPropRowSecondary: { en: 'An optional supporting line under the name.', es: 'Una línea de apoyo opcional bajo el nombre.', fr: 'Une ligne de support optionnelle sous le nom.', de: 'Eine optionale Zusatzzeile unter dem Namen.', ja: '名前の下の補足行（任意）。', pt: 'Uma linha de apoio opcional sob o nome.', zh: '姓名下方可选的辅助行。', ar: 'سطر داعم اختياري تحت الاسم.' },
  prsPropRowSrc: { en: 'Avatar image URL; falls back to the initials of the name.', es: 'URL de la imagen del avatar; recurre a las iniciales del nombre.', fr: 'URL de l’image d’avatar ; repli sur les initiales du nom.', de: 'Bild-URL des Avatars; fällt auf die Initialen des Namens zurück.', ja: 'アバター画像の URL。無ければ名前のイニシャルになります。', pt: 'URL da imagem do avatar; recorre às iniciais do nome.', zh: '头像图片 URL；缺省时退回姓名首字母。', ar: 'رابط صورة الأفاتار؛ وإلا فالأحرف الأولى من الاسم.' },
  prsPropRowAvatarName: { en: 'Overrides the name used for the initials and the image alt, for when name is not a plain string.', es: 'Sustituye el nombre usado para las iniciales y el alt de la imagen, cuando name no es una cadena simple.', fr: 'Remplace le nom utilisé pour les initiales et l’alt de l’image, quand name n’est pas une chaîne simple.', de: 'Überschreibt den Namen für Initialen und Bild-Alt, wenn name keine einfache Zeichenkette ist.', ja: 'イニシャルと画像の alt に使う名前を上書きします。name が単純な文字列でない場合に。', pt: 'Substitui o nome usado nas iniciais e no alt da imagem, quando name não é uma cadeia simples.', zh: '当 name 不是纯字符串时，覆盖用于首字母与图片 alt 的名称。', ar: 'يتجاوز الاسم المستخدم للأحرف الأولى وبديل الصورة حين لا يكون name نصًا بسيطًا.' },
  prsPropRowStatus: { en: 'The person’s presence. Omit it and no dot is drawn — an absent dot means unknown, not offline.', es: 'La presencia de la persona. Si se omite no se dibuja punto: un punto ausente significa desconocido, no desconectado.', fr: 'La présence de la personne. Omis, aucun point n’est dessiné — un point absent signifie inconnu, pas hors ligne.', de: 'Die Präsenz der Person. Weggelassen wird kein Punkt gezeichnet — ein fehlender Punkt heißt unbekannt, nicht offline.', ja: 'その人の在席。省略するとドットは描かれません。ドットがないことはオフラインではなく不明を意味します。', pt: 'A presença da pessoa. Omitido, nenhum ponto é desenhado — um ponto ausente significa desconhecido, não offline.', zh: '此人的在线状态。省略则不画点——没有点表示未知，而不是离线。', ar: 'حضور الشخص. إن حُذف فلا تُرسم نقطة — وغيابها يعني مجهول لا غير متصل.' },
  prsPropRowRole: { en: 'The person’s role, rendered as a small soft Pill.', es: 'El rol de la persona, como una Pill suave pequeña.', fr: 'Le rôle de la personne, rendu en petite Pill douce.', de: 'Die Rolle der Person, als kleine weiche Pill gerendert.', ja: 'その人の役割。小さめのソフトな Pill として描画されます。', pt: 'O papel da pessoa, renderizado como uma Pill suave pequena.', zh: '此人的角色，渲染为小号柔和 Pill。', ar: 'دور الشخص، يُعرض كـPill صغيرة ناعمة.' },
  prsPropRowRoleTone: { en: 'Overrides the pill tone; a string role otherwise resolves its own.', es: 'Sustituye el tono de la píldora; un rol de texto resuelve el suyo por sí mismo.', fr: 'Remplace le ton de la pastille ; un rôle en chaîne résout sinon le sien.', de: 'Überschreibt den Pill-Ton; eine Rolle als Zeichenkette löst sonst ihren eigenen auf.', ja: 'ピルのトーンを上書きします。文字列の役割なら自分でトーンを決めます。', pt: 'Substitui o tom da pílula; um papel em texto resolve o seu próprio.', zh: '覆盖胶囊标签的色调；字符串角色否则会自行解析。', ar: 'يتجاوز نبرة الشارة؛ وإلا فالدور النصي يحدّد نبرته بنفسه.' },
  prsPropRowActions: { en: 'Trailing row controls, after the role pill.', es: 'Controles al final de la fila, tras la píldora de rol.', fr: 'Contrôles en fin de rangée, après la pastille de rôle.', de: 'Steuerelemente am Zeilenende, nach der Rollen-Pill.', ja: '役割ピルの後ろに置く行末のコントロール。', pt: 'Controlos no fim da linha, depois da pílula de papel.', zh: '行尾控件，位于角色标签之后。', ar: 'عناصر تحكم في نهاية الصف بعد شارة الدور.' },
});

/**
 * One presence cell: the dot above the literal status name that produced it, so
 * the shape and the word can be compared without a legend elsewhere.
 */
function DotCell({
  status,
  children,
}: {
  status: PresenceStatus;
  children: ReactNode;
}) {
  return (
    <Stack gap={2} align="center" style={{ minWidth: '5.5rem' }}>
      <span style={{ display: 'grid', placeItems: 'center', minHeight: '1.5rem' }}>{children}</span>
      <Text as="span" size={Size.Small} tone={TextTone.Muted}>
        <code>{status}</code>
      </Text>
      <Text as="span" size={Size.Small} tone={TextTone.Subtle}>
        <code>{presenceShape(status)}</code>
      </Text>
    </Stack>
  );
}

/** The demo roster, reused across the stack examples so the faces stay stable. */
const PEOPLE = [
  { name: 'Ana Ruiz' },
  { name: 'Bo Chen' },
  { name: 'Priya Raman' },
  { name: 'Tomás Vidal' },
  { name: 'Lena Fischer' },
  { name: 'Jonas Aden' },
  { name: 'Mira Kovač' },
];

export function PresencePage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(p.prsName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(p.prsLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(p.prsAnatomy))}</Text>
      <Heading level={3}>PresenceDot</Heading>
      <ComponentBlueprint specId="presence-dot" />
      <Heading level={3}>AvatarGroup</Heading>
      <ComponentBlueprint specId="avatar-group" />
      <Heading level={3}>ReadReceiptStack</Heading>
      <ComponentBlueprint specId="read-receipt-stack" />
      <Heading level={3}>MemberRow</Heading>
      <ComponentBlueprint specId="member-row" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(p.prsExShapesTitle)}
        description={prose(t(p.prsExShapesDesc))}
        component="PresenceDot"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={5} style={{ width: '100%', minWidth: 0 }}>
            <Row gap={4} wrap align="center">
              {presenceStatuses.map((status) => (
                <DotCell key={status} status={status}>
                  <K.PresenceDot status={status} />
                </DotCell>
              ))}
            </Row>
            {/* The small step, at the size a conversation row actually uses. */}
            <Row gap={4} wrap align="center">
              {presenceStatuses.map((status) => (
                <DotCell key={status} status={status}>
                  <K.PresenceDot status={status} size="sm" />
                </DotCell>
              ))}
            </Row>
          </Stack>
        )}
        code={`import { PresenceDot } from '@glacier/react';

<PresenceDot status="online" />    {/* solid disc */}
<PresenceDot status="away" />      {/* disc with a bite out of it */}
<PresenceDot status="busy" />      {/* disc crossed by a bar */}
<PresenceDot status="offline" />   {/* hollow ring */}
<PresenceDot status="invisible" /> {/* ring around a core */}

<PresenceDot status="away" size="sm" />`}
      />

      <Example
        title={t(p.prsExEnlargedTitle)}
        description={prose(t(p.prsExEnlargedDesc))}
        component="PresenceDot"
        platformLayout="stacked"
        render={(K) => (
          <Row gap={6} wrap align="start">
            {presenceStatuses.map((status) => (
              <DotCell key={status} status={status}>
                {/* Scaled, not resized: the very same component and the very
                    same two size steps, blown up so the marks can be compared. */}
                <span
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: '4rem',
                    height: '4rem',
                  }}
                >
                  <span style={{ transform: 'scale(4)', transformOrigin: 'center' }}>
                    <K.PresenceDot status={status} />
                  </span>
                </span>
              </DotCell>
            ))}
          </Row>
        )}
        code={`// Not a prop: the docs scale the real component up. The marks are
// fractions of the diameter (presenceMark in @glacier/logic), so the
// enlarged figure is the shipped geometry rather than a redrawing.
<span style={{ transform: 'scale(4)' }}>
  <PresenceDot status="away" />
</span>`}
      />

      <Example
        title={t(p.prsExPinnedTitle)}
        description={prose(t(p.prsExPinnedDesc))}
        component="PresenceDot"
        render={(K) => (
          <Row gap={5} wrap align="center">
            {(['sm', 'md', 'lg', 'xl'] as const).map((size, index) => (
              <span key={size} style={{ position: 'relative', display: 'inline-flex' }}>
                <Avatar name={PEOPLE[index]?.name} size={size} />
                <span style={{ position: 'absolute', insetInlineEnd: '-2px', bottom: '-2px' }}>
                  <K.PresenceDot
                    status={presenceStatuses[index] ?? 'online'}
                    size={size === 'sm' || size === 'md' ? 'sm' : 'md'}
                    ring
                  />
                </span>
              </span>
            ))}
            <K.PresenceDot skeleton />
          </Row>
        )}
        code={`import { PresenceDot, Avatar } from '@glacier/react';
import { presenceDotSize } from '@glacier/logic';

<span style={{ position: 'relative', display: 'inline-flex' }}>
  <Avatar name="Ana Ruiz" size="lg" />
  <span style={{ position: 'absolute', insetInlineEnd: -2, bottom: -2 }}>
    <PresenceDot status="online" size={presenceDotSize('lg')} ring />
  </span>
</span>`}
      />

      <Example
        title={t(p.prsExStackTitle)}
        description={prose(t(p.prsExStackDesc))}
        component="AvatarGroup"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={5} align="start">
            {/* Three of a cap of four: every face, no chip. */}
            <K.AvatarGroup avatars={PEOPLE.slice(0, 3)} />
            {/* Exactly the cap: still every face, still no chip. */}
            <K.AvatarGroup avatars={PEOPLE.slice(0, 4)} />
            {/* Seven against a cap of four: four faces and a +3. */}
            <K.AvatarGroup avatars={PEOPLE} />
            <K.AvatarGroup avatars={PEOPLE} skeleton />
          </Stack>
        )}
        code={`import { AvatarGroup } from '@glacier/react';

// Below the cap (max is 4): three faces, no chip.
<AvatarGroup avatars={people.slice(0, 3)} />

// Exactly at the cap: four faces, still no chip.
<AvatarGroup avatars={people.slice(0, 4)} />

// Over it: four faces and a "+3" beside them.
<AvatarGroup avatars={people} />

<AvatarGroup avatars={people} skeleton />`}
      />

      <Example
        title={t(p.prsExStackTuningTitle)}
        description={prose(t(p.prsExStackTuningDesc))}
        component="AvatarGroup"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={5} align="start">
            <K.AvatarGroup avatars={PEOPLE} max={6} size="sm" />
            <K.AvatarGroup avatars={PEOPLE} overlap={0.55} direction="last-on-top" />
            <K.AvatarGroup avatars={PEOPLE.slice(0, 4)} ring={false} shape="rounded" size="lg" />
            <K.ReadReceiptStack readers={PEOPLE.slice(0, 2)} />
            <K.ReadReceiptStack readers={PEOPLE} />
          </Stack>
        )}
        code={`import { AvatarGroup, ReadReceiptStack } from '@glacier/react';

<AvatarGroup avatars={people} max={6} size="sm" />
<AvatarGroup avatars={people} overlap={0.55} direction="last-on-top" />
<AvatarGroup avatars={people} ring={false} shape="rounded" size="lg" />

// The preset: smallest step, tighter overlap, cap of 3, and a
// "Read by …" sentence instead of a bare roster.
<ReadReceiptStack readers={readers} />`}
      />

      <Example
        title={t(p.prsExMembersTitle)}
        description={prose(t(p.prsExMembersDesc))}
        component="MemberRow"
        platformLayout="stacked"
        render={(K) => (
          <div style={{ width: '100%', minWidth: 0, maxWidth: '34rem' }}>
            <List divided>
              <K.MemberRow name="Ana Ruiz" secondary={t(p.prsExMembersSecondary)} status="online" role="Owner" />
              <K.MemberRow name="Bo Chen" secondary={t(p.prsExMembersSecondary2)} status="away" role="Admin" />
              <K.MemberRow name="Priya Raman" status="busy" role="Moderator" />
              <K.MemberRow name="Tomás Vidal" status="offline" role="Guest" />
              <K.MemberRow name="Lena Fischer" status="invisible" role="Member" />
              <K.MemberRow name="Release Bot" secondary={t(p.prsExMembersSecondary3)} role="Bot" />
              <K.MemberRow name="" skeleton />
            </List>
          </div>
        )}
        code={`import { List, MemberRow } from '@glacier/react';

<List divided>
  <MemberRow name="Ana Ruiz" secondary="Staff engineer, Platform" status="online" role="Owner" />
  <MemberRow name="Bo Chen" status="away" role="Admin" />
  <MemberRow name="Priya Raman" status="busy" role="Moderator" />
  <MemberRow name="Tomás Vidal" status="offline" role="Guest" />

  {/* No status at all: presence is unknown, so no dot is drawn. */}
  <MemberRow name="Release Bot" secondary="Automated release notes" role="Bot" />

  <MemberRow name="" skeleton />
</List>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>PresenceDot</Heading>
      <PropsTable
        props={[
          { name: 'status', type: "'online' | 'away' | 'busy' | 'offline' | 'invisible'", default: "'offline'", description: t(p.prsPropDotStatus) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(p.prsPropDotSize) },
          { name: 'ring', type: 'boolean', default: 'false', description: t(p.prsPropDotRing) },
          { name: 'label', type: 'string', description: t(p.prsPropLabelOverride) },
          { name: 'decorative', type: 'boolean', default: 'false', description: t(p.prsPropDecorative) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.prsPropSkeleton) },
          { name: 'labels', type: 'Partial<PresenceLabels>', description: t(p.prsPropLabelsMerge) },
        ]}
      />

      <Heading level={3}>AvatarGroup</Heading>
      <PropsTable
        props={[
          { name: 'avatars', type: 'readonly AvatarStackItem[]', description: t(p.prsPropGrpAvatars) },
          { name: 'max', type: 'number', default: '4', description: t(p.prsPropGrpMax) },
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: t(p.prsPropDotSize) },
          { name: 'shape', type: "'circle' | 'rounded'", default: "'circle'", description: t(p.prsPropGrpShape) },
          { name: 'overlap', type: 'number', default: '0.32', description: t(p.prsPropGrpOverlap) },
          { name: 'direction', type: "'first-on-top' | 'last-on-top'", default: "'first-on-top'", description: t(p.prsPropGrpDirection) },
          { name: 'ring', type: 'boolean', default: 'true', description: t(p.prsPropGrpRing) },
          { name: 'label', type: 'string', description: t(p.prsPropGrpLabel) },
          { name: 'labels', type: 'Partial<AvatarStackLabels>', description: t(p.prsPropLabelsMerge) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.prsPropSkeleton) },
        ]}
      />

      <Heading level={3}>ReadReceiptStack</Heading>
      <PropsTable
        props={[
          { name: 'readers', type: 'readonly AvatarStackItem[]', description: t(p.prsPropRcpReaders) },
          { name: 'max', type: 'number', default: '3', description: t(p.prsPropGrpMax) },
          { name: 'overlap', type: 'number', default: '0.46', description: t(p.prsPropGrpOverlap) },
          { name: 'label', type: 'string', description: t(p.prsPropRcpLabel) },
          { name: 'labels', type: 'Partial<ReadReceiptLabels>', description: t(p.prsPropLabelsMerge) },
        ]}
      />

      <Heading level={3}>MemberRow</Heading>
      <PropsTable
        props={[
          { name: 'name', type: 'ReactNode', description: t(p.prsPropRowName) },
          { name: 'secondary', type: 'ReactNode', description: t(p.prsPropRowSecondary) },
          { name: 'src', type: 'string', description: t(p.prsPropRowSrc) },
          { name: 'avatarName', type: 'string', description: t(p.prsPropRowAvatarName) },
          { name: 'avatarSize', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: t(p.prsPropDotSize) },
          { name: 'status', type: 'PresenceStatus', description: t(p.prsPropRowStatus) },
          { name: 'role', type: 'ReactNode', description: t(p.prsPropRowRole) },
          { name: 'roleTone', type: 'PillTone', description: t(p.prsPropRowRoleTone) },
          { name: 'actions', type: 'ReactNode', description: t(p.prsPropRowActions) },
          { name: 'labels', type: 'Partial<PresenceLabels>', description: t(p.prsPropLabelsMerge) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(p.prsPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(p.prsA11y1))}</li>
        <li>{prose(t(p.prsA11y2))}</li>
        <li>{prose(t(p.prsA11y3))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(p.prsUse1))}</li>
        <li>{prose(t(p.prsUse2))}</li>
        <li>{prose(t(p.prsUse3))}</li>
        <li>{prose(t(p.prsUse4))}</li>
      </ul>
    </>
  );
}
