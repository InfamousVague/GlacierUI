import { Heading, Row, Size, Stack, Text, TextTone, defineMessages, useT } from '@glacier/react';
// The status union itself lives in commons. The DOM kit re-exports it from the
// component module but not from its barrel, so the page reads it from the
// source of truth rather than through the binding.
import { leastDelivery, type DeliveryStatus as DeliveryStatusValue } from '@glacier/logic';
import type { ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * TODO(i18n): these belong in apps/docs/src/i18n.ts alongside the other page
 * catalogs; they are authored here so the page compiles standalone, and every
 * key is listed in the handoff ready to be pasted in verbatim.
 */
const dm = defineMessages({
  dsName: { en: 'Delivery Status', es: 'Estado de entrega', fr: 'État de remise', de: 'Zustellstatus', ja: '配信ステータス', pt: 'Estado de entrega', zh: '送达状态', ar: 'حالة التسليم' },
  dsLede: {
    en: 'How far a sent message got, as one small mark beside its timestamp. No two states share a silhouette, so the mark survives greyscale, a dim display, and a colour-blind reader.',
    es: 'Hasta dónde llegó un mensaje enviado, como una pequeña marca junto a su hora. No hay dos estados con la misma silueta, así que la marca sobrevive a la escala de grises, a una pantalla tenue y a un lector daltónico.',
    fr: 'Jusqu’où un message envoyé est arrivé, sous la forme d’une petite marque à côté de son horodatage. Deux états ne partagent jamais la même silhouette : la marque survit aux niveaux de gris, à un écran terne et à un lecteur daltonien.',
    de: 'Wie weit eine gesendete Nachricht gekommen ist, als kleines Zeichen neben ihrer Uhrzeit. Keine zwei Zustände teilen sich eine Silhouette, daher übersteht das Zeichen Graustufen, ein blasses Display und eine Farbsehschwäche.',
    ja: '送ったメッセージがどこまで届いたかを、時刻の横の小さな印で示します。同じシルエットを共有する状態はひとつもないため、グレースケールでも、暗いディスプレイでも、色覚特性のある読者にも意味が残ります。',
    pt: 'Até onde uma mensagem enviada chegou, como uma pequena marca ao lado da hora. Não há dois estados com a mesma silhueta, por isso a marca sobrevive à escala de cinzentos, a um ecrã fraco e a um leitor daltónico.',
    zh: '一条已发送消息走到了哪一步，用时间戳旁的一个小标记表示。没有两个状态共用同一个轮廓，因此该标记在灰度、暗淡屏幕和色觉障碍下依然可读。',
    ar: 'إلى أين وصلت الرسالة المُرسَلة، كعلامة صغيرة بجوار وقتها. لا تتشارك حالتان الشكل نفسه، لذا تبقى العلامة مفهومة في التدرّج الرمادي وعلى شاشة باهتة ولقارئ لا يميّز الألوان.',
  },
  dsAnatomy: {
    en: 'One glyph, sized to the text it sits beside rather than to a control. The status-to-shape table lives in `@glacier/logic`, so both kits draw the same silhouette for the same state; only the lookup from shape name to icon component is per-binding.',
    es: 'Un solo glifo, dimensionado según el texto junto al que se sitúa y no según un control. La tabla de estado a forma vive en `@glacier/logic`, así que ambos kits dibujan la misma silueta para el mismo estado; solo la búsqueda del nombre de forma al componente de icono es propia de cada enlace.',
    fr: 'Un seul glyphe, dimensionné d’après le texte qu’il accompagne et non d’après un contrôle. La table état-vers-forme vit dans `@glacier/logic`, donc les deux kits dessinent la même silhouette pour le même état ; seule la correspondance nom de forme vers composant d’icône est propre à chaque liaison.',
    de: 'Ein Zeichen, bemessen am Text daneben und nicht an einem Bedienelement. Die Tabelle von Zustand zu Form liegt in `@glacier/logic`, damit beide Kits für denselben Zustand dieselbe Silhouette zeichnen; nur die Zuordnung vom Formnamen zur Icon-Komponente ist bindungsspezifisch.',
    ja: 'グリフはひとつだけで、コントロールではなく隣り合うテキストに合わせた大きさです。状態から形への対応表は `@glacier/logic` にあるため、両キットは同じ状態に同じシルエットを描きます。形の名前からアイコンコンポーネントへの解決だけがバインディングごとの処理です。',
    pt: 'Um só glifo, dimensionado pelo texto ao lado e não por um controlo. A tabela de estado para forma vive em `@glacier/logic`, por isso ambos os kits desenham a mesma silhueta para o mesmo estado; só a resolução do nome da forma para o componente de ícone é própria de cada ligação.',
    zh: '只有一个字形，其尺寸取自旁边的文字而非某个控件。状态到形状的对照表位于 `@glacier/logic`，因此两套工具包对同一状态绘制同一轮廓；只有从形状名到图标组件的查找是各绑定各自的。',
    ar: 'رمز واحد، حجمه مأخوذ من النص المجاور لا من عنصر تحكّم. جدول تحويل الحالة إلى شكل موجود في `@glacier/logic`، لذا ترسم المجموعتان الشكل نفسه للحالة نفسها؛ وحدها ترجمة اسم الشكل إلى مكوّن أيقونة تخصّ كل ارتباط.',
  },
  dsExStatesTitle: { en: 'Five states, five silhouettes', es: 'Cinco estados, cinco siluetas', fr: 'Cinq états, cinq silhouettes', de: 'Fünf Zustände, fünf Silhouetten', ja: '5つの状態、5つのシルエット', pt: 'Cinco estados, cinco silhuetas', zh: '五种状态，五种轮廓', ar: 'خمس حالات، خمسة أشكال' },
  dsExStatesDesc: {
    en: 'The same row twice: as painted, then under `grayscale(1)`. Nothing is lost in the second row, because the state is carried by shape and colour is only layered on top — a clock, one tick, two ticks, a tick enclosed in a solid disc, a warning triangle.',
    es: 'La misma fila dos veces: tal como se pinta y luego bajo `grayscale(1)`. Nada se pierde en la segunda fila, porque el estado lo lleva la forma y el color solo se superpone: un reloj, una marca, dos marcas, una marca dentro de un disco macizo, un triángulo de advertencia.',
    fr: 'La même rangée deux fois : telle qu’elle est peinte, puis sous `grayscale(1)`. Rien n’est perdu dans la seconde, car l’état est porté par la forme et la couleur n’est qu’une couche par-dessus — une horloge, une coche, deux coches, une coche enfermée dans un disque plein, un triangle d’alerte.',
    de: 'Dieselbe Reihe zweimal: wie gezeichnet und dann unter `grayscale(1)`. In der zweiten geht nichts verloren, denn den Zustand trägt die Form und Farbe liegt nur darüber — eine Uhr, ein Haken, zwei Haken, ein Haken in einer vollen Scheibe, ein Warndreieck.',
    ja: '同じ行を2度：塗られたままと、`grayscale(1)` をかけたもの。2行目でも何も失われません。状態を担うのは形であり、色はその上に重ねてあるだけだからです ― 時計、チェック1つ、チェック2つ、塗りつぶした円に収めたチェック、警告の三角。',
    pt: 'A mesma linha duas vezes: tal como é pintada e depois sob `grayscale(1)`. Nada se perde na segunda, porque o estado é levado pela forma e a cor apenas se sobrepõe — um relógio, um visto, dois vistos, um visto dentro de um disco cheio, um triângulo de aviso.',
    zh: '同一行画两遍：先按原样着色，再加上 `grayscale(1)`。第二行不会丢失任何信息，因为承载状态的是形状，颜色只是叠加在上面——时钟、单钩、双钩、实心圆里的钩、警告三角。',
    ar: 'الصف نفسه مرتين: كما هو ملوّن، ثم تحت `grayscale(1)`. لا يُفقد شيء في الصف الثاني، لأن الشكل هو ما يحمل الحالة واللون مجرّد طبقة فوقه — ساعة، وعلامة واحدة، وعلامتان، وعلامة داخل قرص مصمت، ومثلث تحذير.',
  },
  dsAsPainted: { en: 'as painted', es: 'tal como se pinta', fr: 'tel quel', de: 'wie gezeichnet', ja: '元の色', pt: 'tal como é pintado', zh: '原色', ar: 'كما هو ملوّن' },
  dsGrayscale: { en: 'grayscale(1)', es: 'grayscale(1)', fr: 'grayscale(1)', de: 'grayscale(1)', ja: 'grayscale(1)', pt: 'grayscale(1)', zh: 'grayscale(1)', ar: 'grayscale(1)' },
  dsExRunTitle: { en: 'A run reports its least advanced member', es: 'Una serie informa de su miembro menos avanzado', fr: 'Une salve rapporte son membre le moins avancé', de: 'Eine Folge meldet ihr am wenigsten fortgeschrittenes Glied', ja: '連続した送信は最も進んでいないものを報告する', pt: 'Uma sequência reporta o seu membro menos avançado', zh: '一串消息报告其中进度最慢的那条', ar: 'تُبلّغ السلسلة عن أقل أعضائها تقدّمًا' },
  dsExRunDesc: {
    en: '`statuses` takes a whole run and resolves it with `leastDelivery`, so a stack holding one failed send says failed rather than claiming the read receipt of whichever message happened to be last. Each pair below is the input and what the mark resolves to.',
    es: '`statuses` toma una serie entera y la resuelve con `leastDelivery`, de modo que una pila que contiene un envío fallido dice fallido en vez de reclamar el acuse de lectura del mensaje que resultó ser el último. Cada par de abajo es la entrada y aquello a lo que se resuelve la marca.',
    fr: '`statuses` prend une salve entière et la résout avec `leastDelivery` : une pile contenant un envoi échoué dit échoué au lieu de revendiquer l’accusé de lecture du message qui se trouvait être le dernier. Chaque paire ci-dessous montre l’entrée et ce à quoi la marque se résout.',
    de: '`statuses` nimmt eine ganze Folge und löst sie mit `leastDelivery` auf, sodass ein Stapel mit einem fehlgeschlagenen Versand fehlgeschlagen meldet, statt die Lesebestätigung der zufällig letzten Nachricht zu beanspruchen. Jedes Paar unten zeigt die Eingabe und das Ergebnis.',
    ja: '`statuses` は連続した送信をまとめて受け取り、`leastDelivery` で解決します。したがって、失敗した送信をひとつ含む束は、たまたま最後だったメッセージの既読を主張せず、失敗と言います。下の各組は入力と、印が解決した先です。',
    pt: '`statuses` recebe uma sequência inteira e resolve-a com `leastDelivery`, pelo que uma pilha com um envio falhado diz falhado em vez de reclamar o recibo de leitura da mensagem que calhou ser a última. Cada par abaixo é a entrada e aquilo em que a marca se resolve.',
    zh: '`statuses` 接收整串消息并用 `leastDelivery` 归结，因此包含一次失败发送的一叠会显示失败，而不是拿碰巧排在最后那条的已读回执来邀功。下面每一对分别是输入和标记归结出的结果。',
    ar: 'يأخذ `statuses` سلسلة كاملة ويحلّها عبر `leastDelivery`، فتقول كومة تضمّ إرسالًا فاشلًا إنها فشلت بدل أن تدّعي إشعار القراءة الخاص بالرسالة التي صادف أن تكون الأخيرة. كل زوج أدناه هو المُدخل وما تؤول إليه العلامة.',
  },
  dsResolves: { en: 'resolves to', es: 'se resuelve a', fr: 'se résout en', de: 'ergibt', ja: '→ 解決先', pt: 'resolve para', zh: '归结为', ar: 'يؤول إلى' },
  dsExSizesDesc: {
    en: 'Two compact steps, each matched to the text the mark sits beside: `sm` beside the extra-small meta line, `md` beside small body text. The mark is never sized to a control, because it is not one.',
    es: 'Dos pasos compactos, cada uno ajustado al texto junto al que se sitúa la marca: `sm` junto a la línea meta extrapequeña, `md` junto al texto de cuerpo pequeño. La marca nunca se dimensiona como un control, porque no lo es.',
    fr: 'Deux pas compacts, chacun accordé au texte que la marque accompagne : `sm` à côté de la ligne méta très petite, `md` à côté du corps de texte petit. La marque n’est jamais dimensionnée comme un contrôle, car elle n’en est pas un.',
    de: 'Zwei kompakte Stufen, je auf den Text abgestimmt, neben dem das Zeichen steht: `sm` neben der sehr kleinen Meta-Zeile, `md` neben kleinem Fließtext. Das Zeichen wird nie wie ein Bedienelement bemessen, denn es ist keines.',
    ja: 'コンパクトな2段階で、それぞれ印が並ぶテキストに合わせてあります。`sm` は極小のメタ行の横、`md` は小サイズの本文の横。印はコントロールではないので、コントロールの寸法には決して合わせません。',
    pt: 'Dois passos compactos, cada um ajustado ao texto ao lado do qual a marca fica: `sm` junto à linha meta extrapequena, `md` junto ao texto de corpo pequeno. A marca nunca é dimensionada como um controlo, porque não o é.',
    zh: '两个紧凑档位，各自匹配标记旁边的文字：`sm` 配超小号的元信息行，`md` 配小号正文。标记从不按控件来定尺寸，因为它不是控件。',
    ar: 'درجتان مضغوطتان، كل منهما مطابقة للنص الذي تجاوره العلامة: `sm` بجوار سطر البيانات بالغ الصغر، و`md` بجوار نص المتن الصغير. لا يُقاس هذا الرمز أبدًا كعنصر تحكّم، لأنه ليس كذلك.',
  },
  dsExQuietTitle: { en: 'Decorative, and the placeholder', es: 'Decorativa, y el marcador de posición', fr: 'Décoratif, et l’espace réservé', de: 'Dekorativ, und der Platzhalter', ja: '装飾扱いと、プレースホルダー', pt: 'Decorativa, e o marcador de posição', zh: '装饰性用法与占位', ar: 'زخرفي، والعنصر النائب' },
  dsExQuietDesc: {
    en: '`decorative` drops the mark out of the accessibility tree, and is only correct where adjacent text already names the state — which is exactly what the meta line inside a bubble does. `skeleton` holds the glyph’s footprint while a transcript loads, without claiming a state it has not got.',
    es: '`decorative` saca la marca del árbol de accesibilidad, y solo es correcto donde el texto adyacente ya nombra el estado, que es justo lo que hace la línea meta dentro de una burbuja. `skeleton` mantiene la huella del glifo mientras carga una transcripción, sin reclamar un estado que no tiene.',
    fr: '`decorative` retire la marque de l’arbre d’accessibilité, et n’est correct que là où un texte voisin nomme déjà l’état — ce que fait précisément la ligne méta dans une bulle. `skeleton` conserve l’empreinte du glyphe pendant le chargement d’une transcription, sans revendiquer un état qu’il n’a pas.',
    de: '`decorative` nimmt das Zeichen aus dem Accessibility-Baum und ist nur dort richtig, wo benachbarter Text den Zustand bereits benennt — genau das tut die Meta-Zeile in einer Blase. `skeleton` hält den Platz des Zeichens, während ein Verlauf lädt, ohne einen Zustand zu behaupten, den es nicht hat.',
    ja: '`decorative` は印をアクセシビリティツリーから外します。正しいのは隣接するテキストがすでに状態を名指ししている場合だけで、吹き出し内のメタ行がまさにそれです。`skeleton` は履歴の読み込み中にグリフの占有面積を保ち、持っていない状態を主張しません。',
    pt: '`decorative` retira a marca da árvore de acessibilidade, e só está certo onde o texto adjacente já nomeia o estado — que é exatamente o que a linha meta dentro de um balão faz. `skeleton` mantém a pegada do glifo enquanto uma transcrição carrega, sem reclamar um estado que não tem.',
    zh: '`decorative` 把标记移出无障碍树，只有在相邻文字已经写出该状态时才正确——气泡内的元信息行正是如此。`skeleton` 在会话记录加载时占住字形的位置，同时不声称任何它并不具备的状态。',
    ar: 'يُخرج `decorative` العلامة من شجرة الوصول، ولا يصحّ إلا حيث يسمّي النص المجاور الحالة أصلًا — وهو تمامًا ما يفعله سطر البيانات داخل الفقاعة. ويحفظ `skeleton` مساحة الرمز أثناء تحميل السجلّ، دون أن يدّعي حالة لا يملكها.',
  },
  dsPropStatus: { en: 'How far the message got. Omit it, and pass nothing else, and the component draws nothing at all.', es: 'Hasta dónde llegó el mensaje. Omítelo, sin pasar nada más, y el componente no dibuja nada.', fr: 'Jusqu’où le message est arrivé. Omettez-le, sans rien passer d’autre, et le composant ne dessine rien.', de: 'Wie weit die Nachricht kam. Weggelassen und ohne Alternative zeichnet die Komponente gar nichts.', ja: 'メッセージがどこまで届いたか。省略し、他も渡さなければ、コンポーネントは何も描きません。', pt: 'Até onde a mensagem chegou. Omita-o, sem passar mais nada, e o componente não desenha nada.', zh: '消息走到了哪一步。省略它且不传其他内容，组件什么都不画。', ar: 'إلى أين وصلت الرسالة. إن أُغفل ولم يُمرَّر غيره، لا يرسم المكوّن شيئًا.' },
  dsPropStatuses: { en: 'A run’s states, collapsed with `leastDelivery` to the least advanced of them. Ignored when `status` is set.', es: 'Los estados de una serie, colapsados con `leastDelivery` al menos avanzado. Se ignora cuando se establece `status`.', fr: 'Les états d’une salve, réduits par `leastDelivery` au moins avancé d’entre eux. Ignoré si `status` est fourni.', de: 'Die Zustände einer Folge, mit `leastDelivery` auf den am wenigsten fortgeschrittenen reduziert. Wird ignoriert, wenn `status` gesetzt ist.', ja: '連続した送信の状態群。`leastDelivery` で最も進んでいないものにまとめます。`status` があるときは無視されます。', pt: 'Os estados de uma sequência, reduzidos com `leastDelivery` ao menos avançado. Ignorado quando `status` é definido.', zh: '一串消息的状态，用 `leastDelivery` 归结到其中进度最慢的一个。设置了 `status` 时忽略。', ar: 'حالات سلسلة، تُختزل عبر `leastDelivery` إلى أقلّها تقدّمًا. يُتجاهل عند ضبط `status`.' },
  dsPropSize: { en: 'Compact size step, matched to the timestamp it sits beside.', es: 'Paso de tamaño compacto, ajustado a la hora junto a la que se sitúa.', fr: 'Pas de taille compact, accordé à l’horodatage qu’il accompagne.', de: 'Kompakte Größenstufe, abgestimmt auf die Uhrzeit daneben.', ja: 'コンパクトなサイズ段階。隣り合うタイムスタンプに合わせます。', pt: 'Passo de tamanho compacto, ajustado à hora ao lado da qual fica.', zh: '紧凑尺寸档位，与旁边的时间戳匹配。', ar: 'درجة حجم مضغوطة، مطابقة للوقت المجاور لها.' },
  dsPropLabel: { en: 'Overrides the text alternative; defaults to the status’s own translated name.', es: 'Sustituye la alternativa textual; por defecto es el propio nombre traducido del estado.', fr: 'Remplace l’alternative textuelle ; par défaut, le nom traduit de l’état lui-même.', de: 'Überschreibt die Textalternative; standardmäßig der übersetzte Name des Zustands.', ja: 'テキスト代替を上書きします。既定はその状態自身の訳語です。', pt: 'Substitui a alternativa textual; por omissão, o próprio nome traduzido do estado.', zh: '覆盖文本替代；默认使用该状态自身的译名。', ar: 'يتجاوز البديل النصي؛ والافتراضي هو اسم الحالة المترجَم.' },
  dsPropDecorative: { en: 'Hides the glyph from assistive tech. Only for a row whose visible text already reports the state.', es: 'Oculta el glifo a la tecnología asistiva. Solo para una fila cuyo texto visible ya informa del estado.', fr: 'Masque le glyphe aux technologies d’assistance. Uniquement pour une ligne dont le texte visible rapporte déjà l’état.', de: 'Verbirgt das Zeichen vor assistiver Technik. Nur für eine Zeile, deren sichtbarer Text den Zustand bereits meldet.', ja: 'グリフを支援技術から隠します。可視テキストがすでに状態を報告している行だけに使います。', pt: 'Oculta o glifo à tecnologia de apoio. Só para uma linha cujo texto visível já reporta o estado.', zh: '对辅助技术隐藏该字形。仅用于可见文字已经报告该状态的那一行。', ar: 'يُخفي الرمز عن التقنيات المساعِدة. للصف الذي يذكر نصّه المرئي الحالة أصلًا فقط.' },
  dsPropSkeleton: { en: 'Renders a placeholder with the component’s exact geometry.', es: 'Muestra un marcador de posición con la geometría exacta del componente.', fr: 'Rend un espace réservé à la géométrie exacte du composant.', de: 'Rendert einen Platzhalter mit der exakten Geometrie der Komponente.', ja: 'コンポーネントとまったく同じ寸法のプレースホルダーを描画します。', pt: 'Mostra um marcador de posição com a geometria exata do componente.', zh: '渲染一个与组件几何尺寸完全一致的占位。', ar: 'يعرض عنصرًا نائبًا بالأبعاد الدقيقة نفسها للمكوّن.' },
  dsPropLabels: { en: 'Overrides the status words; merged over the kit’s own translations.', es: 'Sustituye las palabras de estado; se fusionan sobre las traducciones del propio kit.', fr: 'Remplace les mots d’état ; fusionnés par-dessus les traductions du kit.', de: 'Überschreibt die Zustandswörter; über die Übersetzungen des Kits gelegt.', ja: '状態の語を上書きします。キット自身の訳語の上にマージされます。', pt: 'Substitui as palavras de estado; fundidas sobre as traduções do próprio kit.', zh: '覆盖状态词；会合并到工具包自带的译文之上。', ar: 'يتجاوز كلمات الحالة؛ تُدمج فوق ترجمات المجموعة نفسها.' },
  dsA11y1: { en: 'Never colour-only. Each state draws a different silhouette, which is the part that survives greyscale, a bad display, and the readers who cannot separate the red from the blue.', es: 'Nunca solo color. Cada estado dibuja una silueta distinta, que es lo que sobrevive a la escala de grises, a una mala pantalla y a quienes no distinguen el rojo del azul.', fr: 'Jamais la couleur seule. Chaque état dessine une silhouette différente, et c’est cela qui survit aux niveaux de gris, à un mauvais écran et aux lecteurs qui ne séparent pas le rouge du bleu.', de: 'Niemals nur Farbe. Jeder Zustand zeichnet eine andere Silhouette, und genau die übersteht Graustufen, ein schlechtes Display und Leser, die Rot nicht von Blau trennen können.', ja: '色だけに頼りません。状態ごとに異なるシルエットを描き、それこそがグレースケールや粗いディスプレイ、赤と青を区別できない読者のもとでも残ります。', pt: 'Nunca só cor. Cada estado desenha uma silhueta diferente, e é isso que sobrevive à escala de cinzentos, a um ecrã mau e a quem não separa o vermelho do azul.', zh: '绝不只靠颜色。每个状态画出不同轮廓，而正是轮廓能在灰度、劣质屏幕以及无法区分红蓝的读者面前留存。', ar: 'لا يعتمد على اللون وحده أبدًا. كل حالة ترسم شكلًا مختلفًا، وهو ما يصمد في التدرّج الرمادي وعلى شاشة رديئة ولدى من لا يفرّق بين الأحمر والأزرق.' },
  dsA11y2: { en: '`role="img"` with a label naming the state, not `role="status"`: a transcript holds hundreds of these, and hundreds of live regions would re-read the conversation every time a receipt landed.', es: '`role="img"` con una etiqueta que nombra el estado, no `role="status"`: una transcripción contiene cientos de estas marcas, y cientos de regiones vivas releerían la conversación cada vez que llegara un acuse.', fr: '`role="img"` avec une étiquette nommant l’état, pas `role="status"` : une transcription en contient des centaines, et des centaines de régions live reliraient la conversation à chaque accusé reçu.', de: '`role="img"` mit einem Label, das den Zustand benennt, nicht `role="status"`: ein Verlauf enthält Hunderte davon, und Hunderte Live-Regionen würden bei jeder Bestätigung die ganze Unterhaltung erneut vorlesen.', ja: '`role="status"` ではなく、状態を名指しするラベル付きの `role="img"` です。履歴にはこれが数百個あり、数百のライブリージョンは受信通知のたびに会話全体を読み直してしまいます。', pt: '`role="img"` com uma etiqueta que nomeia o estado, não `role="status"`: uma transcrição contém centenas destas marcas, e centenas de regiões vivas releriam a conversa sempre que chegasse um recibo.', zh: '用带有状态名称标签的 `role="img"`，而不是 `role="status"`：一段会话记录里有成百上千个这样的标记，成百上千个实时区域会在每次收到回执时重读整段对话。', ar: '‏`role="img"` مع تسمية تذكر الحالة، لا `role="status"`: يحتوي السجلّ على مئات منها، ومئات المناطق الحيّة ستعيد قراءة المحادثة مع كل إشعار يصل.' },
  dsA11y3: { en: 'The glyph is the whole visible component, so its translated word is the entire status for anyone not looking at the screen — which is why the five words ship in every locale rather than as English constants.', es: 'El glifo es todo el componente visible, así que su palabra traducida es el estado completo para quien no mira la pantalla; por eso las cinco palabras se envían en todos los idiomas y no como constantes en inglés.', fr: 'Le glyphe est tout le composant visible : son mot traduit constitue donc l’état entier pour qui ne regarde pas l’écran — d’où les cinq mots livrés dans chaque langue plutôt qu’en constantes anglaises.', de: 'Das Zeichen ist die gesamte sichtbare Komponente, also ist sein übersetztes Wort der ganze Zustand für alle, die nicht auf den Bildschirm sehen — deshalb liegen die fünf Wörter in jeder Sprache vor und nicht als englische Konstanten.', ja: 'グリフが可視部分のすべてなので、その訳語が画面を見ていない人にとっての状態のすべてです。だから5つの語は英語の定数ではなく、全ロケール分が同梱されています。', pt: 'O glifo é todo o componente visível, por isso a sua palavra traduzida é o estado inteiro para quem não olha para o ecrã — daí as cinco palavras serem enviadas em todos os idiomas e não como constantes em inglês.', zh: '字形就是整个可见组件，因此它的译词对不看屏幕的人来说就是全部状态——这也是这五个词按每种语言随包提供、而非写成英文常量的原因。', ar: 'الرمز هو كامل المكوّن المرئي، لذا فكلمته المترجَمة هي الحالة بأكملها لمن لا ينظر إلى الشاشة — ولهذا تُشحن الكلمات الخمس بكل اللغات لا كثوابت إنجليزية.' },
  dsA11y4: { en: 'Retrying a failed send belongs to the bubble, not here. The mark reports, it never acts, so it never becomes a tap target the height of a lowercase letter.', es: 'Reintentar un envío fallido corresponde a la burbuja, no a esta marca. La marca informa, nunca actúa, así que nunca se convierte en un objetivo táctil de la altura de una letra minúscula.', fr: 'Réessayer un envoi échoué revient à la bulle, pas ici. La marque rapporte, elle n’agit jamais : elle ne devient donc jamais une cible tactile de la hauteur d’une minuscule.', de: 'Das Wiederholen eines fehlgeschlagenen Versands gehört zur Blase, nicht hierher. Das Zeichen meldet, es handelt nie, und wird so nie zum Tippziel von der Höhe eines Kleinbuchstabens.', ja: '失敗した送信の再試行は吹き出しの役割で、ここではありません。印は報告するだけで動作はしないので、小文字の高さのタップ領域になることはありません。', pt: 'Repetir um envio falhado pertence ao balão, não a esta marca. A marca reporta, nunca age, por isso nunca se torna um alvo de toque da altura de uma letra minúscula.', zh: '重试失败的发送属于气泡的职责，不在这里。标记只做报告、从不执行动作，因此绝不会变成一个只有小写字母高度的点按目标。', ar: 'إعادة محاولة الإرسال الفاشل من شأن الفقاعة لا من شأن هذه العلامة. العلامة تُبلّغ ولا تفعل، فلا تصير هدف لمس بارتفاع حرف صغير.' },
  dsUse1: { en: 'Show it on the viewer’s own messages only. A tick reports what our server said about our outbox; about a message someone else sent, there is nothing behind the claim.', es: 'Muéstrala solo en los mensajes del propio lector. Una marca informa de lo que nuestro servidor dijo de nuestra bandeja de salida; sobre un mensaje que envió otra persona no hay nada que respalde esa afirmación.', fr: 'Ne l’affichez que sur les messages du lecteur lui-même. Une coche rapporte ce que notre serveur a dit de notre boîte d’envoi ; pour un message envoyé par quelqu’un d’autre, rien ne soutient l’affirmation.', de: 'Zeigen Sie es nur bei den eigenen Nachrichten des Lesers. Ein Haken meldet, was unser Server über unseren Postausgang sagte; bei einer Nachricht von jemand anderem steht nichts hinter der Behauptung.', ja: '表示するのは読者自身のメッセージだけにしてください。チェックは自分のサーバーが自分の送信箱について述べた内容の報告であり、他人が送ったメッセージについてはその主張の裏付けがありません。', pt: 'Mostre-a apenas nas mensagens do próprio leitor. Um visto reporta o que o nosso servidor disse sobre a nossa caixa de saída; sobre uma mensagem enviada por outra pessoa não há nada que sustente a afirmação.', zh: '只在读者自己发出的消息上显示。对钩报告的是我们的服务器对我们发件箱的说法；对别人发来的消息，这个断言背后什么都没有。', ar: 'اعرضها على رسائل القارئ نفسه فقط. العلامة تُبلّغ بما قاله خادمنا عن صندوق صادرنا؛ أما رسالة أرسلها شخص آخر فلا شيء يسند هذا الادّعاء.' },
  dsUse2: { en: 'Pass a run through `statuses` rather than picking a member yourself. Both paths end at the same value, so a bubble and the stack holding it cannot report different things.', es: 'Pasa una serie por `statuses` en lugar de elegir un miembro por tu cuenta. Ambos caminos terminan en el mismo valor, así que una burbuja y la pila que la contiene no pueden informar de cosas distintas.', fr: 'Passez une salve via `statuses` plutôt que de choisir un membre vous-même. Les deux chemins aboutissent à la même valeur, donc une bulle et la pile qui la contient ne peuvent pas rapporter des choses différentes.', de: 'Reichen Sie eine Folge über `statuses` durch, statt selbst ein Glied auszuwählen. Beide Wege enden beim selben Wert, sodass eine Blase und der Stapel, der sie hält, nicht Unterschiedliches melden können.', ja: '自分でひとつを選ばず、連続した送信は `statuses` に渡してください。どちらの経路も同じ値に行き着くので、吹き出しとそれを含む束が異なる報告をすることはありません。', pt: 'Passe uma sequência por `statuses` em vez de escolher um membro por si. Ambos os caminhos terminam no mesmo valor, por isso um balão e a pilha que o contém não podem reportar coisas diferentes.', zh: '把整串消息交给 `statuses`，而不要自己挑一条。两条路径最终得到同一个值，因此气泡和包含它的一叠不可能报告出不同的结果。', ar: 'مرّر السلسلة عبر `statuses` بدل أن تنتقي عضوًا بنفسك. ينتهي المساران إلى القيمة نفسها، فلا يمكن أن تُبلّغ الفقاعة والكومة التي تحويها بأمرين مختلفين.' },
  dsUse3: { en: 'Do not add a spinner beside it while a send is in flight. `sending` already has its own silhouette, and every message is in flight for a moment — a transcript that spun for each would be a loading screen with words in it.', es: 'No añadas un indicador giratorio junto a ella mientras un envío está en curso. `sending` ya tiene su propia silueta, y todo mensaje está en curso durante un instante: una transcripción que girase por cada uno sería una pantalla de carga con palabras dentro.', fr: 'N’ajoutez pas d’indicateur d’attente à côté pendant qu’un envoi est en cours. `sending` a déjà sa silhouette, et chaque message est en vol un instant — une transcription qui tournerait pour chacun serait un écran de chargement avec des mots dedans.', de: 'Setzen Sie daneben keinen Ladekreis, während ein Versand läuft. `sending` hat bereits seine eigene Silhouette, und jede Nachricht ist einen Moment unterwegs — ein Verlauf, der für jede drehte, wäre ein Ladebildschirm mit Wörtern darin.', ja: '送信中にスピナーを添えないでください。`sending` にはすでに固有のシルエットがあり、どのメッセージも一瞬は送信中です。そのたびに回る履歴は、言葉の入ったローディング画面になってしまいます。', pt: 'Não acrescente um indicador de carga ao lado enquanto um envio decorre. `sending` já tem a sua própria silhueta, e toda a mensagem está em trânsito por um instante — uma transcrição que girasse por cada uma seria um ecrã de carregamento com palavras dentro.', zh: '发送进行中时不要在旁边加转圈指示器。`sending` 已经有自己的轮廓，而每条消息都会短暂处于发送中——为每条都转圈的会话记录，就成了塞满文字的加载页。', ar: 'لا تُضِف مؤشر تحميل بجوارها أثناء الإرسال. لحالة `sending` شكلها الخاص أصلًا، وكل رسالة تكون في الطريق للحظة — وسجلّ يدور لكل واحدة منها يصير شاشة تحميل مكتوبة.' },
  dsUse4: { en: 'Reach for `decorative` only where the surrounding row already spells the status out. Anywhere else it turns the mark into shape-and-colour with no words at all.', es: 'Recurre a `decorative` solo donde la fila circundante ya deletree el estado. En cualquier otro sitio convierte la marca en forma y color sin palabra alguna.', fr: 'N’utilisez `decorative` que là où la ligne environnante énonce déjà l’état. Ailleurs, cela réduit la marque à une forme et une couleur sans aucun mot.', de: 'Greifen Sie nur dort zu `decorative`, wo die umgebende Zeile den Zustand bereits ausschreibt. Sonst wird das Zeichen zu Form und Farbe ganz ohne Worte.', ja: '`decorative` を使うのは、周囲の行がすでに状態を明記している場合だけにしてください。それ以外では、印は言葉のない形と色になってしまいます。', pt: 'Recorra a `decorative` apenas onde a linha envolvente já escreve o estado por extenso. Noutro sítio qualquer, transforma a marca em forma e cor sem palavra nenhuma.', zh: '只有当周围那一行已经把状态写出来时，才使用 `decorative`。其他地方使用会把标记变成没有任何文字的形状加颜色。', ar: 'لا تلجأ إلى `decorative` إلا حيث يذكر الصف المحيط الحالة صراحةً. في غير ذلك يتحوّل الرمز إلى شكل ولون بلا أي كلمة.' },
});

/** The five states, in the order they advance. */
const STATES: DeliveryStatusValue[] = ['sending', 'sent', 'delivered', 'read', 'failed'];

/** Runs whose least advanced member is not the last one — the interesting case. */
const RUNS: DeliveryStatusValue[][] = [
  ['read', 'delivered', 'read'],
  ['read', 'read', 'failed'],
  ['sent', 'delivered', 'read'],
];

/** The status name printed under a glyph. A code identifier, so never translated. */
function Code({ children }: { children: ReactNode }) {
  return (
    <Text as="span" size={Size.Small} tone={TextTone.Subtle} mono>
      {children}
    </Text>
  );
}

/** The five states in a row, each named under its glyph. */
function StateRow({ K }: { K: PlatformKit }) {
  return (
    <Row gap={6} wrap align="center">
      {STATES.map((status) => (
        <Stack key={status} gap={1} align="center">
          <K.DeliveryStatus status={status} />
          <Code>{status}</Code>
        </Stack>
      ))}
    </Row>
  );
}

export function DeliveryStatusPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(dm.dsName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(dm.dsLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(dm.dsAnatomy))}</Text>
      <ComponentBlueprint specId="delivery-status" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(dm.dsExStatesTitle)}
        description={prose(t(dm.dsExStatesDesc))}
        component="DeliveryStatus"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={6}>
            <Stack gap={2}>
              <Text size={Size.Small} tone={TextTone.Subtle}>
                {t(dm.dsAsPainted)}
              </Text>
              <StateRow K={K} />
            </Stack>
            {/* The claim on this page is that the states are separable without
                colour. Asserting it in prose is cheap; drawing the same row
                through a greyscale filter makes it checkable by looking. */}
            <Stack gap={2}>
              <Text size={Size.Small} tone={TextTone.Subtle}>
                {t(dm.dsGrayscale)}
              </Text>
              <div style={{ filter: 'grayscale(1)' }}>
                <StateRow K={K} />
              </div>
            </Stack>
          </Stack>
        )}
        code={`import { DeliveryStatus } from '@glacier/react';

<DeliveryStatus status="sending" />   // a clock
<DeliveryStatus status="sent" />      // one tick
<DeliveryStatus status="delivered" /> // two ticks
<DeliveryStatus status="read" />      // a tick in a solid disc
<DeliveryStatus status="failed" />    // a warning triangle`}
      />

      <Example
        title={t(dm.dsExRunTitle)}
        description={prose(t(dm.dsExRunDesc))}
        component="DeliveryStatus"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={4}>
            {RUNS.map((run) => (
              <Row key={run.join()} gap={3} wrap align="center">
                <Code>[{run.join(', ')}]</Code>
                <Text size={Size.Small} tone={TextTone.Subtle}>
                  {t(dm.dsResolves)}
                </Text>
                <K.DeliveryStatus statuses={run} />
                <Code>{leastDelivery(run)}</Code>
              </Row>
            ))}
          </Stack>
        )}
        code={`// A stack holding one failed send says failed, not "read".
<DeliveryStatus statuses={['read', 'read', 'failed']} />

// Equivalent to resolving it yourself, which is the point —
// the bubble and the run holding it cannot disagree.
leastDelivery(['read', 'read', 'failed']); // 'failed'`}
      />

      <Example
        title={t(m.secSizes)}
        description={prose(t(dm.dsExSizesDesc))}
        component="DeliveryStatus"
        render={(K) => (
          <Stack gap={3}>
            {(['sm', 'md'] as const).map((size) => (
              <Row key={size} gap={4} align="center">
                <Code>{size}</Code>
                {STATES.map((status) => (
                  <K.DeliveryStatus key={status} status={status} size={size} />
                ))}
              </Row>
            ))}
          </Stack>
        )}
        code={`<DeliveryStatus status="read" size="sm" />  // beside the xs meta line
<DeliveryStatus status="read" size="md" />  // beside small body text`}
      />

      <Example
        title={t(dm.dsExQuietTitle)}
        description={prose(t(dm.dsExQuietDesc))}
        component="DeliveryStatus"
        render={(K) => (
          <Row gap={6} wrap align="center">
            <Row gap={2} align="center">
              <K.DeliveryStatus status="delivered" decorative />
              <Text size={Size.Small} tone={TextTone.Subtle}>
                {t(dm.dsExQuietTitle)}
              </Text>
            </Row>
            <K.DeliveryStatus skeleton />
          </Row>
        )}
        code={`// The row already says "Delivered", so the glyph must not say it twice.
<span>
  <DeliveryStatus status="delivered" decorative />
  <span>Delivered</span>
</span>

<DeliveryStatus skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'status', type: "'sending' | 'sent' | 'delivered' | 'read' | 'failed'", description: t(dm.dsPropStatus) },
          { name: 'statuses', type: '(DeliveryStatus | undefined)[]', description: t(dm.dsPropStatuses) },
          { name: 'size', type: "'sm' | 'md'", default: "'md'", description: t(dm.dsPropSize) },
          { name: 'label', type: 'string', description: t(dm.dsPropLabel) },
          { name: 'decorative', type: 'boolean', default: 'false', description: t(dm.dsPropDecorative) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(dm.dsPropSkeleton) },
          { name: 'labels', type: 'Partial<DeliveryLabels>', description: t(dm.dsPropLabels) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(dm.dsA11y1))}</li>
        <li>{prose(t(dm.dsA11y2))}</li>
        <li>{prose(t(dm.dsA11y3))}</li>
        <li>{prose(t(dm.dsA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(dm.dsUse1))}</li>
        <li>{prose(t(dm.dsUse2))}</li>
        <li>{prose(t(dm.dsUse3))}</li>
        <li>{prose(t(dm.dsUse4))}</li>
      </ul>
    </>
  );
}

export { dm as deliveryStatusPageMessages };
