import {
  Avatar,
  Heading,
  Row,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import { conversationRuns, type ChatMessage } from '@glacier/logic';
import type { ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * TODO(i18n): these belong in apps/docs/src/i18n.ts alongside the other page
 * catalogs; they are authored here so the page compiles standalone, and every
 * key is listed in the handoff ready to be pasted in verbatim.
 */
const cv = defineMessages({
  cvName: { en: 'Conversation View', es: 'Vista de conversación', fr: 'Vue de conversation', de: 'Unterhaltungsansicht', ja: '会話ビュー', pt: 'Vista de conversa', zh: '会话视图', ar: 'عرض المحادثة' },
  cvLede: {
    en: 'A scrolling thread built from a flat message log and the reader’s id. It exists to keep two axes apart that are constantly conflated: who produced a message, and whether the server has it.',
    es: 'Un hilo con desplazamiento construido a partir de un registro plano de mensajes y el id del lector. Existe para mantener separados dos ejes que se confunden constantemente: quién produjo un mensaje y si el servidor lo tiene.',
    fr: 'Un fil défilant construit à partir d’un journal de messages à plat et de l’identifiant du lecteur. Il existe pour tenir séparés deux axes constamment confondus : qui a produit un message, et si le serveur l’a.',
    de: 'Ein scrollender Verlauf, gebaut aus einem flachen Nachrichtenlog und der Id des Lesers. Er existiert, um zwei ständig vermengte Achsen auseinanderzuhalten: wer eine Nachricht erzeugt hat und ob der Server sie hat.',
    ja: 'フラットなメッセージログと読者のIDから組み立てられる、スクロールするスレッド。混同されがちな2つの軸 ― 誰がそのメッセージを生んだか、そしてサーバーがそれを持っているか ― を切り分けるために存在します。',
    pt: 'Um fio com deslocamento construído a partir de um registo plano de mensagens e do id do leitor. Existe para manter separados dois eixos constantemente confundidos: quem produziu uma mensagem e se o servidor a tem.',
    zh: '由扁平的消息日志和读者 id 构建的可滚动会话。它的存在是为了把两个总被混为一谈的轴分开：是谁产生了这条消息，以及服务器是否已经收到它。',
    ar: 'خيط قابل للتمرير يُبنى من سجلّ رسائل مسطّح ومعرّف القارئ. يوجد ليفصل محورين يُخلط بينهما دائمًا: من أنتج الرسالة، وهل استلمها الخادم.',
  },
  cvAnatomy: {
    en: 'A focusable scroll region, a bottom-anchored column of runs inside it, and one `MessageGroup` per run carrying its resolved authorship and acknowledgement as data attributes - so a run can be found by either axis, which is how the component is tested and how an app hangs its own affordances off it.',
    es: 'Una región de desplazamiento enfocable, dentro de ella una columna de series anclada abajo, y un `MessageGroup` por serie que lleva su autoría y su acuse resueltos como atributos de datos, de modo que una serie puede localizarse por cualquiera de los dos ejes: así se prueba el componente y así cuelga una app sus propias funciones.',
    fr: 'Une région de défilement focalisable, à l’intérieur une colonne de salves ancrée en bas, et un `MessageGroup` par salve portant sa paternité et son accusé résolus en attributs de données - une salve est ainsi trouvable par l’un ou l’autre axe, ce qui est la façon dont le composant est testé et dont une appli y accroche ses propres affordances.',
    de: 'Ein fokussierbarer Scrollbereich, darin eine unten verankerte Spalte von Folgen und je Folge eine `MessageGroup`, die ihre aufgelöste Urheberschaft und Bestätigung als Datenattribute trägt - so ist eine Folge über beide Achsen auffindbar, was zugleich die Testweise der Komponente und der Aufhängepunkt für eigene Bedienelemente ist.',
    ja: 'フォーカス可能なスクロール領域、その中に下端で揃えた連続の列、そして連続ごとに1つの `MessageGroup`。各 `MessageGroup` は解決済みの作者と承認をデータ属性として持つので、どちらの軸からでも連続を見つけられます。これがこのコンポーネントのテスト方法であり、アプリが独自の操作を掛ける場所でもあります。',
    pt: 'Uma região de deslocamento focável, dentro dela uma coluna de sequências ancorada ao fundo, e um `MessageGroup` por sequência que leva a sua autoria e o seu reconhecimento resolvidos como atributos de dados - assim uma sequência é encontrável por qualquer dos eixos, que é como o componente é testado e como uma app pendura nele as suas próprias funcionalidades.',
    zh: '一个可聚焦的滚动区域，其中是一列底部对齐的消息串，每串对应一个 `MessageGroup`，并把已解析的作者身份与确认状态作为 data 属性携带——因此可以按任一轴找到某一串，这既是该组件的测试方式，也是应用挂载自身能力的地方。',
    ar: 'منطقة تمرير قابلة للتركيز، بداخلها عمود من السلاسل مثبّت إلى الأسفل، و`MessageGroup` واحد لكل سلسلة يحمل نسبتها وإقرارها المحلولين كسمات بيانات - فتُوجد السلسلة عبر أي من المحورين، وهي طريقة اختبار المكوّن وموضع تعليق التطبيق لإمكاناته.',
  },
  cvExAxesTitle: { en: 'Two axes, and they are independent', es: 'Dos ejes, y son independientes', fr: 'Deux axes, et ils sont indépendants', de: 'Zwei Achsen, und sie sind unabhängig', ja: '2つの軸は互いに独立している', pt: 'Dois eixos, e são independentes', zh: '两个轴，而且彼此独立', ar: 'محوران، وهما مستقلّان' },
  cvExAxesDesc: {
    en: 'Authorship is local or remote: which client produced the message. It decides the edge and the fill, and is derived from `viewerId`, because "mine" is not a property of a message - the same row is mine in one window and theirs in another. Acknowledgement is optimistic or confirmed: whether the server has it. That is delivery, not authorship, and it exists on the local side only.',
    es: 'La autoría es local o remota: qué cliente produjo el mensaje. Decide el borde y el relleno, y se deriva de `viewerId`, porque «mío» no es una propiedad del mensaje: la misma fila es mía en una ventana y suya en otra. El acuse es optimista o confirmado: si el servidor lo tiene. Eso es entrega, no autoría, y solo existe del lado local.',
    fr: 'La paternité est locale ou distante : quel client a produit le message. Elle décide du bord et du fond et se dérive de `viewerId`, car « à moi » n’est pas une propriété du message - la même ligne est à moi dans une fenêtre et à eux dans une autre. L’accusé est optimiste ou confirmé : le serveur l’a-t-il. C’est de la remise, pas de la paternité, et cela n’existe que du côté local.',
    de: 'Urheberschaft ist lokal oder entfernt: welcher Client die Nachricht erzeugt hat. Sie entscheidet über Kante und Füllung und wird aus `viewerId` abgeleitet, denn „meine“ ist keine Eigenschaft einer Nachricht - dieselbe Zeile ist in einem Fenster meine und in einem anderen ihre. Bestätigung ist optimistisch oder bestätigt: ob der Server sie hat. Das ist Zustellung, nicht Urheberschaft, und existiert nur auf der lokalen Seite.',
    ja: '作者はローカルかリモートか、つまりどのクライアントがそのメッセージを生んだかです。端と塗りを決め、`viewerId` から導かれます。「自分のもの」はメッセージの属性ではなく、同じ行がある画面では自分のもの、別の画面では相手のものだからです。承認は楽観的か確定済みか、つまりサーバーが持っているかどうか。これは配信の話であって作者の話ではなく、ローカル側にしか存在しません。',
    pt: 'A autoria é local ou remota: que cliente produziu a mensagem. Decide o bordo e o preenchimento, e deriva de `viewerId`, porque «minha» não é uma propriedade da mensagem - a mesma linha é minha numa janela e deles noutra. O reconhecimento é otimista ou confirmado: se o servidor a tem. Isso é entrega, não autoria, e só existe do lado local.',
    zh: '作者身份分本地与远端：是哪一个客户端产生了这条消息。它决定边与填充，并从 `viewerId` 推导，因为「我的」不是消息自身的属性——同一行在一个窗口里是我的，在另一个窗口里就是对方的。确认状态分乐观与已确认：服务器是否已经收到。那是送达的事，不是作者的事，而且只存在于本地一侧。',
    ar: 'النسبة محلّية أو بعيدة: أي عميل أنتج الرسالة. تحدّد الحافة والتعبئة، وتُشتقّ من `viewerId`، لأن «لي» ليست خاصية للرسالة - فالصف نفسه لي في نافذة ولهم في أخرى. والإقرار متفائل أو مؤكَّد: هل استلمها الخادم. ذلك تسليم لا نسبة، ولا يوجد إلا في الجانب المحلّي.',
  },
  cvExNoTickTitle: { en: 'A remote run never shows a tick - never, not "by default"', es: 'Una serie remota nunca muestra una marca: nunca, no «por defecto»', fr: 'Une salve distante ne montre jamais de coche - jamais, pas « par défaut »', de: 'Eine entfernte Folge zeigt nie einen Haken - nie, nicht „standardmäßig“', ja: 'リモートの連続にチェックは決して出ない ― 「既定では」ではなく、決して', pt: 'Uma sequência remota nunca mostra um visto - nunca, não «por omissão»', zh: '远端消息串绝不显示对钩——是绝不，而非「默认不」', ar: 'السلسلة البعيدة لا تُظهر علامة أبدًا - أبدًا، لا «افتراضيًا»' },
  cvExNoTickDesc: {
    en: 'Both messages below carry `status: "read"` in the log. The remote one still shows nothing: `conversationRuns` strips a status off a remote message rather than declining to draw one, because a transport that stamps every row it syncs is an ordinary thing and the resulting tick would be a lie the reader has no way to detect. The mirror of that rule fills a status in on the local message, which carries none - a local message reporting nothing is indistinguishable from one that never sent.',
    es: 'Ambos mensajes de abajo llevan `status: "read"` en el registro. El remoto sigue sin mostrar nada: `conversationRuns` le quita el estado a un mensaje remoto en lugar de limitarse a no dibujarlo, porque un transporte que sella cada fila que sincroniza es algo corriente y la marca resultante sería una mentira que el lector no puede detectar. El reflejo de esa regla rellena el estado del mensaje local, que no lleva ninguno: un mensaje local que no informa de nada es indistinguible de uno que nunca se envió.',
    fr: 'Les deux messages ci-dessous portent `status: "read"` dans le journal. Le distant n’affiche pourtant rien : `conversationRuns` retire l’état d’un message distant au lieu de simplement s’abstenir de le dessiner, car un transport qui estampille chaque ligne qu’il synchronise est chose courante et la coche obtenue serait un mensonge indétectable pour le lecteur. Le miroir de cette règle remplit l’état du message local, qui n’en porte aucun - un message local qui ne rapporte rien est indiscernable d’un message jamais parti.',
    de: 'Beide Nachrichten unten tragen im Log `status: "read"`. Die entfernte zeigt dennoch nichts: `conversationRuns` entfernt den Status einer entfernten Nachricht, statt ihn nur nicht zu zeichnen, denn ein Transport, der jede synchronisierte Zeile stempelt, ist etwas Alltägliches, und der entstehende Haken wäre eine für den Leser nicht erkennbare Lüge. Der Spiegel dieser Regel setzt einen Status bei der lokalen Nachricht ein, die keinen trägt - eine lokale Nachricht, die nichts meldet, ist von einer nie gesendeten nicht zu unterscheiden.',
    ja: '下の2件はどちらもログ上で `status: "read"` を持っています。それでもリモート側には何も表示されません。`conversationRuns` はリモートのメッセージから状態を取り除きます。描くのを控えるだけにしないのは、同期した行すべてに印を押す転送層がごく普通にあり、その結果のチェックは読者には見破れない嘘になるからです。この規則の裏返しとして、状態を持たないローカルのメッセージには状態が補われます。何も報告しないローカルのメッセージは、まったく送られなかったものと区別できないからです。',
    pt: 'Ambas as mensagens abaixo levam `status: "read"` no registo. A remota continua a não mostrar nada: `conversationRuns` retira o estado a uma mensagem remota em vez de apenas se abster de o desenhar, porque um transporte que carimba cada linha que sincroniza é coisa corrente e o visto resultante seria uma mentira que o leitor não tem como detetar. O espelho dessa regra preenche o estado na mensagem local, que não traz nenhum - uma mensagem local que nada reporta é indistinguível de uma que nunca saiu.',
    zh: '下面两条消息在日志中都带着 `status: "read"`。远端那条依然什么都不显示：`conversationRuns` 会把远端消息的状态剥掉，而不只是不去绘制它，因为给同步的每一行都盖章的传输层再普通不过，而由此得到的对钩会是读者无从察觉的谎言。这条规则的镜像会给不带状态的本地消息补上一个状态——什么都不报告的本地消息，与从未发出的消息无法区分。',
    ar: 'كلتا الرسالتين أدناه تحملان `status: "read"` في السجلّ. ومع ذلك لا تُظهر البعيدة شيئًا: يجرّد `conversationRuns` الرسالة البعيدة من حالتها بدل الاكتفاء بعدم رسمها، لأن ناقلًا يختم كل صف يزامنه أمر شائع، والعلامة الناتجة كذبة لا يملك القارئ سبيلًا لكشفها. ومرآة هذه القاعدة تملأ حالةً للرسالة المحلّية التي لا تحمل أيًّا - فالرسالة المحلّية التي لا تُبلّغ بشيء لا تُميَّز عن رسالة لم تُرسَل قط.',
  },
  cvExFlightTitle: { en: 'In flight, not broken', es: 'En vuelo, no rota', fr: 'En vol, pas cassé', de: 'Unterwegs, nicht kaputt', ja: '送信中であって、壊れてはいない', pt: 'Em voo, não avariada', zh: '在途中，不是坏了', ar: 'في الطريق، لا معطوبة' },
  cvExFlightDesc: {
    en: 'An unacknowledged send keeps its colour and steps back by a single alpha; the delivery atom’s clock glyph carries the rest. No spinners - every message is optimistic for a moment, and a transcript that spun for each of them would be a loading screen with words in it. A failed send does the opposite and stays at full strength with the danger border, because it is the one row asking to be acted on.',
    es: 'Un envío sin acuse conserva su color y retrocede un único paso de alfa; el glifo de reloj del átomo de entrega hace el resto. Sin indicadores giratorios: todo mensaje es optimista durante un instante, y una transcripción que girase por cada uno sería una pantalla de carga con palabras. Un envío fallido hace lo contrario y se queda a plena intensidad con el borde de peligro, porque es la única fila que pide actuar.',
    fr: 'Un envoi non accusé garde sa couleur et recule d’un seul cran d’alpha ; le glyphe d’horloge de l’atome de remise fait le reste. Pas d’indicateurs d’attente - chaque message est optimiste un instant, et une transcription qui tournerait pour chacun serait un écran de chargement avec des mots dedans. Un envoi échoué fait l’inverse et reste à pleine intensité avec la bordure de danger, car c’est la seule ligne qui demande une action.',
    de: 'Ein unbestätigter Versand behält seine Farbe und tritt um genau eine Alpha-Stufe zurück; das Uhrensymbol des Zustell-Atoms trägt den Rest. Keine Ladekreise - jede Nachricht ist einen Moment optimistisch, und ein Verlauf, der für jede drehte, wäre ein Ladebildschirm mit Wörtern darin. Ein fehlgeschlagener Versand tut das Gegenteil und bleibt in voller Stärke mit dem Gefahrenrahmen, denn er ist die eine Zeile, die eine Handlung verlangt.',
    ja: '未承認の送信は色を保ったまま、アルファを1段だけ落とします。残りは配信アトムの時計グリフが担います。スピナーはありません。どのメッセージも一瞬は楽観的であり、そのたびに回る履歴は言葉の入ったローディング画面になってしまいます。失敗した送信は逆で、強さを落とさず危険色のボーダーを帯びます。対処を求める唯一の行だからです。',
    pt: 'Um envio não reconhecido mantém a sua cor e recua um único passo de alfa; o glifo de relógio do átomo de entrega faz o resto. Sem indicadores de carga - toda a mensagem é otimista por um instante, e uma transcrição que girasse por cada uma seria um ecrã de carregamento com palavras. Um envio falhado faz o contrário e fica em força total com o contorno de perigo, porque é a única linha que pede ação.',
    zh: '未获确认的发送保持原色，只后退一档透明度；其余由送达原子的时钟字形承担。没有转圈——每条消息都会短暂处于乐观状态，为每条都转圈的会话记录就成了塞满文字的加载页。失败的发送则相反，保持满强度并带上危险色边框，因为它是唯一要求被处理的一行。',
    ar: 'الإرسال غير المُقَرّ يحتفظ بلونه ويتراجع درجة شفافية واحدة، ويحمل بقيةَ المعنى رمزُ الساعة في ذرّة التسليم. بلا مؤشّرات تحميل - كل رسالة متفائلة للحظة، وسجلّ يدور لكل واحدة يصير شاشة تحميل مكتوبة. أما الإرسال الفاشل فيفعل العكس: يبقى بكامل قوته مع حدّ الخطر، لأنه الصف الوحيد الذي يطلب تصرّفًا.',
  },
  cvExEmptyTitle: { en: 'Empty, and loading', es: 'Vacía, y cargando', fr: 'Vide, et en chargement', de: 'Leer, und ladend', ja: '空の状態と読み込み中', pt: 'Vazia, e a carregar', zh: '空状态与加载中', ar: 'فارغة، وقيد التحميل' },
  cvExEmptyDesc: {
    en: 'An empty conversation is a centred, muted stop rather than a blank pane the reader will read as a failure to load. The placeholder is the opposite: a real conversation shape - runs alternating down both edges, some one bubble and some three - travelling the identical grouping and side path the loaded thread will, so it cannot settle into a different layout than the one it was holding. It carries no delivery state at all, because a bone captioned "Read" is a lie with a tick beside it.',
    es: 'Una conversación vacía es una parada centrada y apagada, no un panel en blanco que el lector leerá como un fallo de carga. El marcador de posición es lo contrario: una forma de conversación real - series alternando por ambos bordes, unas de una burbuja y otras de tres - que recorre exactamente el mismo camino de agrupación y lado que recorrerá el hilo cargado, para que no pueda asentarse en una disposición distinta de la que sostenía. No lleva ningún estado de entrega, porque un hueso rotulado «Leído» es una mentira con una marca al lado.',
    fr: 'Une conversation vide est un arrêt centré et discret, pas un panneau blanc que le lecteur prendra pour un échec de chargement. L’espace réservé fait l’inverse : une vraie forme de conversation - des salves alternant le long des deux bords, certaines d’une bulle et d’autres de trois - parcourant exactement le même chemin de regroupement et de côté que le fil chargé, pour ne pas s’installer dans une autre disposition que celle qu’elle tenait. Il ne porte aucun état de remise, car un os légendé « Lu » est un mensonge avec une coche à côté.',
    de: 'Eine leere Unterhaltung ist ein zentrierter, gedämpfter Halt und keine leere Fläche, die der Leser als Ladefehler liest. Der Platzhalter ist das Gegenteil: eine echte Unterhaltungsform - Folgen abwechselnd an beiden Kanten, manche eine Blase, manche drei - die genau den Gruppierungs- und Seitenpfad des geladenen Verlaufs durchläuft, damit sie sich in kein anderes Layout setzen kann als das, das sie hielt. Sie trägt gar keinen Zustellzustand, denn ein mit „Gelesen“ beschrifteter Knochen ist eine Lüge mit einem Haken daneben.',
    ja: '空の会話は、読み込み失敗と読まれかねない白い面ではなく、中央に置かれた控えめな終点です。プレースホルダーはその逆で、本物の会話の形 ― 両端に交互に並ぶ連続、1件のものも3件のものも ― を取り、読み込まれたスレッドとまったく同じグルーピングと左右の経路をたどります。だから、保っていたのとは違うレイアウトに落ち着くことはありません。配信状態はいっさい持ちません。「既読」と書かれた骨は、チェック付きの嘘だからです。',
    pt: 'Uma conversa vazia é uma paragem centrada e discreta, não um painel em branco que o leitor lerá como falha de carregamento. O marcador de posição é o oposto: uma forma de conversa a sério - sequências a alternar pelos dois bordos, umas de um balão e outras de três - a percorrer exatamente o mesmo caminho de agrupamento e de lado que o fio carregado, para não assentar numa disposição diferente da que sustinha. Não leva estado de entrega nenhum, porque um osso legendado «Lido» é uma mentira com um visto ao lado.',
    zh: '空会话是一个居中、克制的收束，而不是会被读者当作加载失败的空白面板。占位则相反：它是真实的会话形状——消息串在两侧交替出现，有的一个气泡、有的三个——走的是与加载后完全相同的分组与左右路径，因此不会落进与它原本撑着的不同的布局。它完全不带送达状态，因为标着「已读」的骨架是一个带对钩的谎言。',
    ar: 'المحادثة الفارغة وقفة متمركزة هادئة، لا لوحًا أبيض يقرؤه القارئ فشلَ تحميل. والعنصر النائب عكس ذلك: شكل محادثة حقيقي - سلاسل تتناوب على الحافتين، بعضها فقاعة وبعضها ثلاث - يسلك مسار التجميع والجهة نفسه الذي سيسلكه الخيط المحمَّل، فلا يستقرّ في تخطيط غير الذي كان يحمله. ولا يحمل أي حالة تسليم، لأن عظمة مكتوبًا عليها «قُرئت» كذبة بجوارها علامة.',
  },
  cvExRowTitle: { en: 'The same thread in row layout', es: 'El mismo hilo en disposición row', fr: 'Le même fil en disposition ligne', de: 'Derselbe Verlauf im Row-Layout', ja: '同じスレッドを行レイアウトで', pt: 'O mesmo fio na disposição linha', zh: '同一会话的行布局', ar: 'الخيط نفسه بتخطيط الصف' },
  cvExRowDesc: {
    en: 'Nothing about the two axes changes. Row layout drops the fill and the alignment and moves authorship into the header, but the delivery rule is untouched: the local runs still report, and the remote ones still say nothing at all.',
    es: 'Nada cambia en los dos ejes. La disposición row elimina el relleno y la alineación y traslada la autoría a la cabecera, pero la regla de entrega queda intacta: las series locales siguen informando y las remotas siguen sin decir nada.',
    fr: 'Rien ne change aux deux axes. La disposition ligne supprime le fond et l’alignement et déplace la paternité dans l’en-tête, mais la règle de remise reste intacte : les salves locales rapportent toujours, et les distantes ne disent toujours rien.',
    de: 'An den beiden Achsen ändert sich nichts. Das Row-Layout streicht Füllung und Ausrichtung und verlegt die Urheberschaft in die Kopfzeile, doch die Zustellregel bleibt unangetastet: die lokalen Folgen melden weiterhin, die entfernten sagen weiterhin gar nichts.',
    ja: '2つの軸については何も変わりません。行レイアウトは塗りと配置をやめ、作者をヘッダーに移しますが、配信の規則は手つかずです。ローカルの連続はやはり報告し、リモートの連続はやはり何も言いません。',
    pt: 'Nada muda nos dois eixos. A disposição linha larga o preenchimento e o alinhamento e passa a autoria para o cabeçalho, mas a regra de entrega fica intacta: as sequências locais continuam a reportar, e as remotas continuam a não dizer nada.',
    zh: '两个轴的规则毫无变化。行布局去掉填充与对齐，把作者身份移入标题，但送达规则原封不动：本地消息串照样报告，远端消息串照样什么都不说。',
    ar: 'لا يتغيّر شيء في المحورين. يتخلّى تخطيط الصف عن التعبئة والمحاذاة وينقل النسبة إلى الترويسة، لكن قاعدة التسليم تبقى كما هي: السلاسل المحلّية تُبلّغ، والبعيدة لا تقول شيئًا البتة.',
  },
  cvViewer: { en: 'You', es: 'Tú', fr: 'Vous', de: 'Du', ja: 'あなた', pt: 'Tu', zh: '你', ar: 'أنت' },
  cvPeer: { en: 'Grace Hopper', es: 'Grace Hopper', fr: 'Grace Hopper', de: 'Grace Hopper', ja: 'グレース・ホッパー', pt: 'Grace Hopper', zh: '格蕾丝·霍珀', ar: 'غريس هوبر' },
  cvMsg1: { en: 'The build is green again', es: 'La compilación vuelve a estar en verde', fr: 'Le build est de nouveau au vert', de: 'Der Build ist wieder grün', ja: 'ビルドがまた通りました', pt: 'A compilação está verde outra vez', zh: '构建又变绿了', ar: 'عاد البناء أخضر' },
  cvMsg2: { en: 'It was the cache all along', es: 'Era la caché desde el principio', fr: 'C’était le cache depuis le début', de: 'Es war die ganze Zeit der Cache', ja: '結局ずっとキャッシュのせいでした', pt: 'Era a cache desde o início', zh: '一直都是缓存的问题', ar: 'كانت الذاكرة المؤقتة طوال الوقت' },
  cvMsg3: { en: 'Good - I will tag the release', es: 'Bien, etiquetaré la versión', fr: 'Bien - je vais taguer la version', de: 'Gut - ich tagge das Release', ja: 'よかった。リリースにタグを付けます', pt: 'Ótimo - vou marcar a versão', zh: '很好——我来给版本打标签', ar: 'جيد - سأضع وسم الإصدار' },
  cvMsg4: { en: 'Anything I should hold back?', es: '¿Hay algo que deba dejar fuera?', fr: 'Quelque chose que je devrais retenir ?', de: 'Soll ich irgendetwas zurückhalten?', ja: '外しておくべきものはありますか？', pt: 'Há algo que deva deixar de fora?', zh: '有什么我该先压着不发的吗？', ar: 'أهناك ما ينبغي أن أؤجّله؟' },
  cvMsg5: { en: 'Not from me', es: 'Por mi parte, no', fr: 'Rien de mon côté', de: 'Von mir aus nicht', ja: '私からは特にありません', pt: 'Da minha parte, não', zh: '我这边没有', ar: 'لا شيء من جهتي' },
  cvMsg6: { en: 'This one has not left the device yet', es: 'Este todavía no ha salido del dispositivo', fr: 'Celui-ci n’a pas encore quitté l’appareil', de: 'Diese hat das Gerät noch nicht verlassen', ja: 'これはまだ端末から出ていません', pt: 'Esta ainda não saiu do dispositivo', zh: '这条还没离开设备', ar: 'هذه لم تغادر الجهاز بعد' },
  cvMsg7: { en: 'And this one did not go out at all', es: 'Y este no llegó a salir', fr: 'Et celui-ci n’est pas parti du tout', de: 'Und diese ging gar nicht raus', ja: 'そしてこれはまったく送れませんでした', pt: 'E esta não chegou a sair', zh: '而这条根本没发出去', ar: 'وهذه لم تخرج إطلاقًا' },
  cvLabelRemote: { en: 'remote - status stripped', es: 'remoto: estado eliminado', fr: 'distant - état retiré', de: 'entfernt - Status entfernt', ja: 'リモート ― 状態は除去', pt: 'remoto - estado removido', zh: '远端——状态已剥除', ar: 'بعيدة - جُرّدت من الحالة' },
  cvLabelLocal: { en: 'local - status filled in', es: 'local: estado rellenado', fr: 'local - état rempli', de: 'lokal - Status ergänzt', ja: 'ローカル ― 状態を補完', pt: 'local - estado preenchido', zh: '本地——状态已补入', ar: 'محلّية - مُلئت الحالة' },
  cvEmptyLabel: { en: 'empty', es: 'vacía', fr: 'vide', de: 'leer', ja: '空', pt: 'vazia', zh: '空', ar: 'فارغة' },
  cvSkeletonLabel: { en: 'skeleton', es: 'esqueleto', fr: 'squelette', de: 'Platzhalter', ja: 'スケルトン', pt: 'esqueleto', zh: '骨架', ar: 'هيكل' },
  cvPropMessages: { en: 'The transcript as a flat, chronological log. Grouped into runs by `groupMessages`; the order given is the order rendered.', es: 'La transcripción como un registro plano y cronológico. Se agrupa en series con `groupMessages`; el orden dado es el orden renderizado.', fr: 'La transcription sous forme de journal plat et chronologique. Regroupée en salves par `groupMessages` ; l’ordre fourni est l’ordre rendu.', de: 'Der Verlauf als flaches, chronologisches Log. Von `groupMessages` in Folgen gruppiert; die gegebene Reihenfolge ist die gerenderte.', ja: '履歴をフラットで時系列のログとして。`groupMessages` が連続にまとめます。渡した順がそのまま描画順です。', pt: 'A transcrição como um registo plano e cronológico. Agrupada em sequências por `groupMessages`; a ordem dada é a ordem renderizada.', zh: '会话记录，形式为扁平的时间顺序日志。由 `groupMessages` 分组成串；给出的顺序即渲染顺序。', ar: 'السجلّ كقائمة مسطّحة زمنية. يجمّعها `groupMessages` في سلاسل؛ والترتيب المُعطى هو ترتيب العرض.' },
  cvPropViewerId: { en: 'The reading user. Authorship is derived from this against each run’s `authorId`, so no caller ever pre-tags a message as own or other.', es: 'El usuario que lee. La autoría se deriva de esto frente al `authorId` de cada serie, así que ningún llamante etiqueta de antemano un mensaje como propio o ajeno.', fr: 'L’utilisateur qui lit. La paternité en est dérivée face à l’`authorId` de chaque salve : aucun appelant ne pré-étiquette donc un message comme sien ou autre.', de: 'Der lesende Nutzer. Die Urheberschaft wird daraus gegen die `authorId` jeder Folge abgeleitet, sodass kein Aufrufer je eine Nachricht als eigen oder fremd vormarkiert.', ja: '読んでいるユーザー。各連続の `authorId` と突き合わせて作者を導くので、呼び出し側がメッセージに自分のもの／相手のものと事前に印を付けることはありません。', pt: 'O utilizador que lê. A autoria deriva daqui face ao `authorId` de cada sequência, por isso nenhum chamador pré-marca uma mensagem como própria ou alheia.', zh: '正在阅读的用户。作者身份由它与每串消息的 `authorId` 比对推导，因此调用方从不预先把消息标记为自己的或别人的。', ar: 'المستخدم القارئ. تُشتقّ النسبة منه مقابل `authorId` كل سلسلة، فلا يسِم أي مستدعٍ رسالةً مسبقًا بأنها له أو لغيره.' },
  cvPropLayout: { en: 'Forwarded to every run. Bubble encodes authorship in edge and fill; row encodes it in a header.', es: 'Se reenvía a cada serie. Bubble codifica la autoría en el borde y el relleno; row la codifica en una cabecera.', fr: 'Transmis à chaque salve. Bulle encode la paternité dans le bord et le fond ; ligne l’encode dans un en-tête.', de: 'An jede Folge weitergereicht. Bubble kodiert die Urheberschaft in Kante und Füllung; row in einer Kopfzeile.', ja: 'すべての連続に転送されます。bubble は端と塗りで、row はヘッダーで作者を表します。', pt: 'Reencaminhado a cada sequência. Bubble codifica a autoria no bordo e no preenchimento; row codifica-a num cabeçalho.', zh: '转发给每一串消息。bubble 用边与填充编码作者身份；row 用标题编码。', ar: 'يُمرَّر إلى كل سلسلة. يرمّز bubble النسبة بالحافة والتعبئة، ويرمّزها row في ترويسة.' },
  cvPropGroupWindow: { en: 'Pause after which a new run begins. Defaults to the shared five-minute window.', es: 'Pausa tras la cual comienza una nueva serie. Por defecto, la ventana compartida de cinco minutos.', fr: 'Pause au bout de laquelle une nouvelle salve commence. Par défaut, la fenêtre partagée de cinq minutes.', de: 'Pause, nach der eine neue Folge beginnt. Standard ist das gemeinsame Fünf-Minuten-Fenster.', ja: '新しい連続が始まるまでの間隔。既定は共有の5分の窓です。', pt: 'Pausa após a qual começa uma nova sequência. Por omissão, a janela partilhada de cinco minutos.', zh: '超过此停顿即开始新的一串。默认使用共享的五分钟时间窗。', ar: 'المهلة التي تبدأ بعدها سلسلة جديدة. الافتراضي نافذة الخمس دقائق المشتركة.' },
  cvPropAvatarFor: { en: 'Returns the avatar for one author id; drawn once at the head of each run.', es: 'Devuelve el avatar de un id de autor; se dibuja una vez al inicio de cada serie.', fr: 'Renvoie l’avatar d’un identifiant d’auteur ; dessiné une fois en tête de chaque salve.', de: 'Gibt den Avatar zu einer Autoren-Id zurück; einmal am Kopf jeder Folge gezeichnet.', ja: '作者IDに対するアバターを返します。各連続の先頭に1度だけ描かれます。', pt: 'Devolve o avatar de um id de autor; desenhado uma vez no topo de cada sequência.', zh: '返回某个作者 id 对应的头像；在每串消息开头绘制一次。', ar: 'يعيد الصورة الرمزية لمعرّف مؤلّف؛ تُرسم مرة واحدة في رأس كل سلسلة.' },
  cvPropAuthorNameFor: { en: 'Returns the display name for one author id; drawn once at the head of each run.', es: 'Devuelve el nombre visible de un id de autor; se dibuja una vez al inicio de cada serie.', fr: 'Renvoie le nom affiché d’un identifiant d’auteur ; dessiné une fois en tête de chaque salve.', de: 'Gibt den Anzeigenamen zu einer Autoren-Id zurück; einmal am Kopf jeder Folge gezeichnet.', ja: '作者IDに対する表示名を返します。各連続の先頭に1度だけ描かれます。', pt: 'Devolve o nome visível de um id de autor; desenhado uma vez no topo de cada sequência.', zh: '返回某个作者 id 的显示名；在每串消息开头绘制一次。', ar: 'يعيد الاسم الظاهر لمعرّف مؤلّف؛ يُرسم مرة واحدة في رأس كل سلسلة.' },
  cvPropEmpty: { en: 'Replaces the default empty state shown when the log holds no messages.', es: 'Sustituye el estado vacío por defecto que se muestra cuando el registro no tiene mensajes.', fr: 'Remplace l’état vide par défaut affiché quand le journal ne contient aucun message.', de: 'Ersetzt den voreingestellten Leerzustand, der erscheint, wenn das Log keine Nachrichten hält.', ja: 'ログにメッセージがないときに出る既定の空状態を置き換えます。', pt: 'Substitui o estado vazio predefinido mostrado quando o registo não tem mensagens.', zh: '替换日志中没有消息时显示的默认空状态。', ar: 'يستبدل الحالة الفارغة الافتراضية التي تظهر حين لا يحوي السجلّ رسائل.' },
  cvPropLabel: { en: 'Accessible name for the scroll region, e.g. the other participant’s name.', es: 'Nombre accesible de la región de desplazamiento, p. ej. el nombre del otro participante.', fr: 'Nom accessible de la région de défilement, p. ex. le nom de l’autre participant.', de: 'Zugänglicher Name des Scrollbereichs, z. B. der Name des anderen Teilnehmers.', ja: 'スクロール領域のアクセシブルな名前。たとえば相手の名前。', pt: 'Nome acessível da região de deslocamento, p. ex. o nome do outro participante.', zh: '滚动区域的无障碍名称，例如对方的名字。', ar: 'الاسم الميسَّر لمنطقة التمرير، مثل اسم الطرف الآخر.' },
  cvPropStick: { en: 'Follows the live end of the thread while the reader is already at it. Never scrolls a reader who has scrolled up.', es: 'Sigue el extremo vivo del hilo mientras el lector ya está en él. Nunca desplaza a un lector que ha subido.', fr: 'Suit l’extrémité vive du fil tant que le lecteur y est déjà. Ne fait jamais défiler un lecteur remonté plus haut.', de: 'Folgt dem lebenden Ende des Verlaufs, solange der Leser bereits dort ist. Scrollt nie einen Leser, der nach oben gescrollt hat.', ja: '読者がすでに末尾にいる間だけ、スレッドの末尾を追います。上にスクロールした読者を動かすことはありません。', pt: 'Segue o extremo vivo do fio enquanto o leitor já lá está. Nunca desloca um leitor que subiu.', zh: '当读者已经在会话最新处时跟随其末端。绝不滚动已经往上翻的读者。', ar: 'يتبع الطرف الحيّ للخيط ما دام القارئ عنده أصلًا. ولا يحرّك أبدًا قارئًا صعد للأعلى.' },
  cvPropOnAtBottomChange: { en: 'Called when the reader arrives at or leaves the live end, so a caller can show its own jump-to-latest affordance.', es: 'Se llama cuando el lector llega al extremo vivo o lo abandona, para que el llamante pueda mostrar su propio botón de ir al final.', fr: 'Appelé quand le lecteur atteint ou quitte l’extrémité vive, pour que l’appelant puisse afficher son propre bouton « aller au plus récent ».', de: 'Wird aufgerufen, wenn der Leser das lebende Ende erreicht oder verlässt, damit der Aufrufer sein eigenes „Zum Neuesten“ anbieten kann.', ja: '読者が末尾に到達したとき、または離れたときに呼ばれます。呼び出し側が独自の「最新へ」を出せるようにするためです。', pt: 'Chamado quando o leitor chega ou sai do extremo vivo, para que o chamador possa mostrar o seu próprio botão de ir para o mais recente.', zh: '当读者到达或离开会话最新处时调用，便于调用方展示自己的「跳到最新」入口。', ar: 'يُستدعى حين يصل القارئ إلى الطرف الحيّ أو يغادره، ليتيح للمستدعي عرض زرّه الخاص للانتقال إلى الأحدث.' },
  cvPropSkeleton: { en: 'Renders the placeholder thread at the geometry the loaded one will settle into.', es: 'Muestra el hilo de marcador de posición con la geometría en la que se asentará el cargado.', fr: 'Rend le fil d’espace réservé à la géométrie où le fil chargé s’installera.', de: 'Rendert den Platzhalter-Verlauf in der Geometrie, in die der geladene sich setzen wird.', ja: '読み込み後に落ち着く寸法で、プレースホルダーのスレッドを描画します。', pt: 'Mostra o fio de marcador de posição na geometria em que o carregado vai assentar.', zh: '按加载完成后将稳定到的几何尺寸渲染占位会话。', ar: 'يعرض خيط العنصر النائب بالأبعاد التي سيستقرّ عندها الخيط المحمَّل.' },
  cvA11y1: { en: '`role="log"` with `aria-live="polite"`: a thread is an append-only record, and polite is what stops an arriving message from cutting off whatever the reader was already being told.', es: '`role="log"` con `aria-live="polite"`: un hilo es un registro de solo anexión, y polite es lo que impide que un mensaje entrante corte lo que ya se le estaba diciendo al lector.', fr: '`role="log"` avec `aria-live="polite"` : un fil est un enregistrement à ajout seul, et polite est ce qui empêche un message entrant d’interrompre ce que le lecteur était en train d’entendre.', de: '`role="log"` mit `aria-live="polite"`: ein Verlauf ist ein Nur-Anhängen-Protokoll, und polite verhindert, dass eine ankommende Nachricht abschneidet, was dem Leser gerade gesagt wurde.', ja: '`aria-live="polite"` を伴う `role="log"`。スレッドは追記のみの記録であり、polite は届いたメッセージが読者がすでに聞いていた内容を遮るのを防ぎます。', pt: '`role="log"` com `aria-live="polite"`: um fio é um registo só de anexação, e polite é o que impede uma mensagem que chega de cortar o que já estava a ser dito ao leitor.', zh: '带 `aria-live="polite"` 的 `role="log"`：会话是只追加的记录，而 polite 正是防止新到达的消息打断读者正在被告知的内容。', ar: '‏`role="log"` مع `aria-live="polite"`: الخيط سجلّ يُضاف إليه فقط، وpolite هو ما يمنع رسالة واصلة من قطع ما كان يُقال للقارئ.' },
  cvA11y2: { en: 'The scroll region is focusable and named, because a scrollable region that cannot be focused cannot be read by keyboard alone. The ring is inset, since the scroller’s edge is usually flush with a pane.', es: 'La región de desplazamiento es enfocable y tiene nombre, porque una región desplazable que no puede enfocarse no se puede leer solo con teclado. El anillo va hacia dentro, ya que el borde del desplazador suele quedar a ras del panel.', fr: 'La région de défilement est focalisable et nommée, car une région défilante impossible à focaliser ne peut pas être lue au clavier seul. L’anneau est en retrait, l’arête du défileur étant généralement au ras d’un panneau.', de: 'Der Scrollbereich ist fokussierbar und benannt, denn ein scrollbarer Bereich, der nicht fokussiert werden kann, ist per Tastatur allein nicht lesbar. Der Ring liegt innen, da die Kante des Scrollers meist bündig mit einer Fläche abschließt.', ja: 'スクロール領域はフォーカス可能で名前を持ちます。フォーカスできないスクロール領域は、キーボードだけでは読めないからです。リングは内側に描かれます。スクローラーの縁はたいていペインと面一だからです。', pt: 'A região de deslocamento é focável e nomeada, porque uma região deslocável que não pode ser focada não se lê só com teclado. O anel é interior, já que o bordo do deslocador costuma ficar rente ao painel.', zh: '滚动区域可聚焦且有名称，因为无法聚焦的可滚动区域仅靠键盘是读不到的。焦点环画在内侧，因为滚动容器的边缘通常与面板齐平。', ar: 'منطقة التمرير قابلة للتركيز ومسمّاة، لأن منطقة قابلة للتمرير لا يمكن تركيزها لا تُقرأ بلوحة المفاتيح وحدها. والحلقة داخلية، إذ تكون حافة الممرِّر عادةً بمحاذاة اللوح.' },
  cvA11y3: { en: 'The delivery state travels with a translated word, never the glyph alone - and only ever on the local side, so a screen reader is never told a delivery fact about a message the viewer did not send.', es: 'El estado de entrega viaja con una palabra traducida, nunca con el glifo solo, y siempre únicamente del lado local, así que a un lector de pantalla nunca se le cuenta un hecho de entrega sobre un mensaje que el lector no envió.', fr: 'L’état de remise voyage avec un mot traduit, jamais le glyphe seul - et uniquement du côté local, de sorte qu’un lecteur d’écran ne se voit jamais annoncer un fait de remise sur un message que le lecteur n’a pas envoyé.', de: 'Der Zustellzustand reist mit einem übersetzten Wort, nie mit dem Zeichen allein - und stets nur auf der lokalen Seite, sodass einem Screenreader nie eine Zustelltatsache über eine Nachricht mitgeteilt wird, die der Leser nicht gesendet hat.', ja: '配信状態は必ず訳語を伴い、グリフだけで済ませることはありません。しかも常にローカル側だけなので、読者が送っていないメッセージについての配信の事実がスクリーンリーダーに伝わることはありません。', pt: 'O estado de entrega viaja com uma palavra traduzida, nunca o glifo sozinho - e sempre só do lado local, por isso um leitor de ecrã nunca ouve um facto de entrega sobre uma mensagem que o leitor não enviou.', zh: '送达状态始终附带一个已翻译的词，绝不只有字形——而且只出现在本地一侧，因此屏幕阅读器永远不会被告知读者未发送过的消息的送达情况。', ar: 'تسافر حالة التسليم مع كلمة مترجَمة، لا مع الرمز وحده - وفي الجانب المحلّي فقط، فلا يُخبَر قارئ الشاشة أبدًا بحقيقة تسليم عن رسالة لم يرسلها القارئ.' },
  cvA11y4: { en: 'The placeholder is hidden from assistive tech entirely, and loses its tab stop with it - announced content that is not content yet is worse than silence, and a focusable node inside an `aria-hidden` one is a dead end.', es: 'El marcador de posición se oculta por completo a la tecnología asistiva, y con ello pierde su parada de tabulación: contenido anunciado que aún no es contenido es peor que el silencio, y un nodo enfocable dentro de uno con `aria-hidden` es un callejón sin salida.', fr: 'L’espace réservé est entièrement masqué aux technologies d’assistance et perd du même coup son arrêt de tabulation - un contenu annoncé qui n’est pas encore du contenu est pire que le silence, et un nœud focalisable à l’intérieur d’un nœud `aria-hidden` est une impasse.', de: 'Der Platzhalter wird assistiver Technik vollständig verborgen und verliert damit auch seinen Tabstopp - angesagter Inhalt, der noch kein Inhalt ist, ist schlimmer als Stille, und ein fokussierbarer Knoten in einem `aria-hidden`-Knoten ist eine Sackgasse.', ja: 'プレースホルダーは支援技術から完全に隠され、それに伴いタブ停止も失います。まだ内容でないものを読み上げるのは沈黙より悪く、`aria-hidden` の内側にあるフォーカス可能なノードは行き止まりだからです。', pt: 'O marcador de posição é totalmente ocultado à tecnologia de apoio e perde com isso a sua paragem de tabulação - conteúdo anunciado que ainda não é conteúdo é pior do que o silêncio, e um nó focável dentro de um `aria-hidden` é um beco sem saída.', zh: '占位会完全对辅助技术隐藏，并因此失去 Tab 停靠点——播报尚未成为内容的东西比沉默更糟，而 `aria-hidden` 内部的可聚焦节点是一条死路。', ar: 'يُخفى العنصر النائب كليًّا عن التقنيات المساعِدة، ويفقد معه محطّة التنقّل - فالإعلان عن محتوى ليس محتوًى بعد أسوأ من الصمت، وعقدة قابلة للتركيز داخل أخرى `aria-hidden` طريق مسدود.' },
  cvUse1: { en: 'Pass `viewerId` and let the component decide authorship. Pre-tagging each message as own or other is how a transcript ends up with two sources of truth for who is talking.', es: 'Pasa `viewerId` y deja que el componente decida la autoría. Etiquetar de antemano cada mensaje como propio o ajeno es como una transcripción acaba con dos fuentes de verdad sobre quién habla.', fr: 'Passez `viewerId` et laissez le composant décider de la paternité. Pré-étiqueter chaque message comme sien ou autre, c’est ainsi qu’une transcription se retrouve avec deux sources de vérité sur qui parle.', de: 'Übergeben Sie `viewerId` und lassen Sie die Komponente die Urheberschaft bestimmen. Jede Nachricht vorab als eigen oder fremd zu markieren führt dazu, dass ein Verlauf zwei Wahrheitsquellen dafür hat, wer spricht.', ja: '`viewerId` を渡し、作者の判定はコンポーネントに任せてください。メッセージごとに自分のもの／相手のものと事前に印を付けると、誰が話しているかについて履歴が2つの真実の源を持つことになります。', pt: 'Passe `viewerId` e deixe o componente decidir a autoria. Pré-marcar cada mensagem como própria ou alheia é como uma transcrição acaba com duas fontes de verdade sobre quem fala.', zh: '传入 `viewerId`，把作者身份的判定交给组件。给每条消息预先标注是自己的还是别人的，正是会话记录出现两个「谁在说话」真相来源的原因。', ar: 'مرّر `viewerId` ودع المكوّن يقرّر النسبة. وسمُ كل رسالة مسبقًا بأنها لي أو لغيري هو ما ينتهي بسجلّ له مصدرا حقيقة عمّن يتكلّم.' },
  cvUse2: { en: 'Do not synthesise a delivery status for a message you received. The component would strip it anyway, and the habit is what puts a tick on the wrong side in the next component that forgets to.', es: 'No inventes un estado de entrega para un mensaje que recibiste. El componente lo quitaría de todos modos, y esa costumbre es la que pone una marca en el lado equivocado en el siguiente componente que se olvide de hacerlo.', fr: 'Ne synthétisez pas d’état de remise pour un message reçu. Le composant le retirerait de toute façon, et c’est cette habitude qui met une coche du mauvais côté dans le prochain composant qui oubliera de le faire.', de: 'Erfinden Sie keinen Zustellzustand für eine empfangene Nachricht. Die Komponente entfernte ihn ohnehin, und genau diese Gewohnheit setzt im nächsten Komponenten, der es vergisst, einen Haken auf die falsche Seite.', ja: '受信したメッセージに配信状態をでっち上げないでください。どのみちコンポーネントが取り除きますし、その習慣こそが、剥ぎ取るのを忘れた次のコンポーネントで誤った側にチェックを付けさせます。', pt: 'Não invente um estado de entrega para uma mensagem recebida. O componente retirá-lo-ia de qualquer forma, e é esse hábito que põe um visto do lado errado no próximo componente que se esqueça de o fazer.', zh: '不要为收到的消息编造送达状态。组件反正会剥掉它，而这个习惯正是让下一个忘记剥除的组件把对钩打在错误一侧的原因。', ar: 'لا تصطنع حالة تسليم لرسالة استقبلتها. سيجرّدها المكوّن على أي حال، وهذه العادة هي ما يضع علامة في الجهة الخطأ في المكوّن التالي الذي ينسى التجريد.' },
  cvUse3: { en: 'Leave `stick` on and do not add your own scroll-to-bottom. The one case where scrolling the reader is correct is the case the component already handles; every other case is the viewport being taken from them mid-sentence.', es: 'Deja `stick` activado y no añadas tu propio desplazamiento al final. El único caso en que desplazar al lector es correcto es el que el componente ya cubre; cualquier otro es quitarle la vista a mitad de frase.', fr: 'Laissez `stick` activé et n’ajoutez pas votre propre défilement vers le bas. Le seul cas où faire défiler le lecteur est correct est celui que le composant traite déjà ; tout autre cas revient à lui arracher la vue en pleine phrase.', de: 'Lassen Sie `stick` an und fügen Sie kein eigenes Scrollen ans Ende hinzu. Der einzige Fall, in dem das Scrollen des Lesers richtig ist, ist der, den die Komponente bereits abdeckt; jeder andere nimmt ihm mitten im Satz den Blick weg.', ja: '`stick` は有効のままにし、独自の最下部スクロールを足さないでください。読者をスクロールしてよい唯一の場合はコンポーネントがすでに扱っており、それ以外はすべて、文の途中で視界を奪う行為です。', pt: 'Deixe `stick` ligado e não acrescente o seu próprio deslocamento para o fundo. O único caso em que deslocar o leitor está certo é o que o componente já trata; qualquer outro é tirar-lhe a vista a meio de uma frase.', zh: '保持 `stick` 开启，不要自己再加滚到底部的逻辑。唯一该滚动读者的场景组件已经处理；其余任何情况都是在读者读到一半时把视口抢走。', ar: 'اترك `stick` مفعّلًا ولا تُضِف تمريرًا خاصًا بك إلى الأسفل. الحالة الوحيدة التي يصحّ فيها تحريك القارئ هي التي يعالجها المكوّن أصلًا؛ وكل ما عداها انتزاع للمشهد من بين يديه في منتصف جملة.' },
  cvUse4: { en: 'Give the scroller a height. It owns its overflow but not its box, and a thread with no height is a thread that grows the page instead of scrolling inside it.', es: 'Dale una altura al desplazador. Es dueño de su desbordamiento pero no de su caja, y un hilo sin altura es un hilo que hace crecer la página en lugar de desplazarse dentro de ella.', fr: 'Donnez une hauteur au défileur. Il possède son débordement mais pas sa boîte, et un fil sans hauteur est un fil qui allonge la page au lieu de défiler à l’intérieur.', de: 'Geben Sie dem Scroller eine Höhe. Er besitzt seinen Überlauf, aber nicht seine Box, und ein Verlauf ohne Höhe ist ein Verlauf, der die Seite wachsen lässt, statt in sich zu scrollen.', ja: 'スクローラーには高さを与えてください。オーバーフローは自分で持ちますが、ボックスは持ちません。高さのないスレッドは、内側でスクロールする代わりにページを伸ばしてしまいます。', pt: 'Dê uma altura ao deslocador. Ele possui o seu transbordo mas não a sua caixa, e um fio sem altura é um fio que faz crescer a página em vez de deslocar por dentro.', zh: '给滚动容器一个高度。它拥有自己的溢出行为，却不拥有自己的盒子；没有高度的会话会把页面撑长，而不是在内部滚动。', ar: 'امنح الممرِّر ارتفاعًا. فهو يملك فائضه لا صندوقه، وخيط بلا ارتفاع خيط يُطيل الصفحة بدل أن يمرّر داخل نفسه.' },
});

/** A fixed instant, so every timestamp on this page renders the same each load. */
const NOW = Date.UTC(2024, 4, 16, 14, 32);
const MINUTE = 60_000;

const VIEWER = 'me';
const PEER = 'grace';

/**
 * A sized box for the scroller. `minmax(0, 1fr)` rather than a plain height, so
 * the stretched grid item can actually shrink - and it works for both bindings,
 * since neither the DOM kit's scroll div nor the native ScrollView takes a
 * `style` from a shared demo.
 */
function Pane({ children, height = '17rem' }: { children: ReactNode; height?: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'minmax(0, 1fr)',
        height,
        width: '100%',
        minWidth: 0,
        borderRadius: 'var(--glacier-radius-lg)',
        border: 'var(--glacier-hairline) solid var(--glacier-border-subtle)',
        background: 'var(--glacier-surface)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <Text size={Size.Small} tone={TextTone.Subtle} mono>
      {children}
    </Text>
  );
}

export function ConversationViewPage() {
  const t = useT();
  const names: Record<string, string> = { [VIEWER]: t(cv.cvViewer), [PEER]: t(cv.cvPeer) };

  // A thread with both authors, spaced so the runs break where the author
  // changes rather than where the five-minute window happens to lapse.
  const messages: ChatMessage[] = [
    { id: '1', authorId: PEER, at: NOW - 9 * MINUTE, text: t(cv.cvMsg1) },
    { id: '2', authorId: PEER, at: NOW - 8 * MINUTE, text: t(cv.cvMsg2) },
    { id: '3', authorId: VIEWER, at: NOW - 6 * MINUTE, text: t(cv.cvMsg3), status: 'read' },
    { id: '4', authorId: VIEWER, at: NOW - 6 * MINUTE + 5_000, text: t(cv.cvMsg4), status: 'read' },
    { id: '5', authorId: PEER, at: NOW - 3 * MINUTE, text: t(cv.cvMsg5) },
  ];

  // Both messages carry `status: 'read'` in the log; the remote one has it
  // stripped, the local one keeps it. The demo asserts the invariant by showing
  // the data going in beside the runs coming out.
  const tickProof: ChatMessage[] = [
    { id: 'r', authorId: PEER, at: NOW - MINUTE, text: t(cv.cvMsg1), status: 'read' },
    { id: 'l', authorId: VIEWER, at: NOW, text: t(cv.cvMsg3) },
  ];
  const resolved = conversationRuns(tickProof, VIEWER);

  // Two local runs the server has not settled: one still in flight, one that
  // never went out. They want opposite treatment, which is the whole reason
  // `failed` is its own point on the acknowledgement axis.
  // The peer line between them is load-bearing, not filler. Consecutive
  // messages from one author inside the group window are one run, and a run
  // reports its *least advanced* member - so with these two adjacent, the
  // in-flight message would be swallowed and the pair would render as a single
  // failed run. Breaking the author changes it into the two runs this example
  // is about.
  const inFlight: ChatMessage[] = [
    { id: 'a', authorId: PEER, at: NOW - 4 * MINUTE, text: t(cv.cvMsg5) },
    { id: 'b', authorId: VIEWER, at: NOW - 3 * MINUTE, text: t(cv.cvMsg6), status: 'sending' },
    { id: 'c', authorId: PEER, at: NOW - 2 * MINUTE, text: t(cv.cvMsg1) },
    { id: 'd', authorId: VIEWER, at: NOW, text: t(cv.cvMsg7), status: 'failed' },
  ];

  return (
    <>
      <Heading level={1}>{t(cv.cvName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(cv.cvLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(cv.cvAnatomy))}</Text>
      <ComponentBlueprint specId="conversation-view" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(cv.cvExAxesTitle)}
        description={prose(t(cv.cvExAxesDesc))}
        component="ConversationView"
        platformLayout="stacked"
        render={(K) => (
          <Pane>
            <K.ConversationView
              messages={messages}
              viewerId={VIEWER}
              now={NOW}
              label={t(cv.cvPeer)}
              avatarFor={(id) => (id === PEER ? <Avatar name={names[id]} size="sm" /> : null)}
            />
          </Pane>
        )}
        code={`import { ConversationView } from '@glacier/react';

// A flat log plus the reader's id. Nothing is pre-tagged as own or other:
// the same array renders correctly in two windows signed in as two people.
<ConversationView
  messages={messages}
  viewerId="me"
  label="Grace Hopper"
  avatarFor={(id) => <Avatar name={nameOf(id)} size="sm" />}
/>`}
      />

      <Example
        title={t(cv.cvExNoTickTitle)}
        description={prose(t(cv.cvExNoTickDesc))}
        component="ConversationView"
        platformLayout="stacked"
        render={(K) => (
          <Stack gap={4}>
            <Pane height="13rem">
              <K.ConversationView messages={tickProof} viewerId={VIEWER} now={NOW} label={t(cv.cvPeer)} />
            </Pane>
            {/* The resolved runs, side by side with what went in - the tick rule
                is data, not paint, so it can be read off rather than squinted at. */}
            <Stack gap={2}>
              {resolved.map((run) => (
                <Row key={run.key} gap={3} wrap align="center">
                  <Caption>
                    {run.authorship} · in: {tickProof.find((msg) => msg.authorId === run.group.authorId)?.status ?? '-'}
                  </Caption>
                  <Text size={Size.Small} tone={TextTone.Subtle}>
                    →
                  </Text>
                  <Caption>
                    status: {run.status ?? '-'} · ack: {run.ack ?? '-'}
                  </Caption>
                  <Text size={Size.Small} tone={TextTone.Subtle}>
                    {run.authorship === 'remote' ? t(cv.cvLabelRemote) : t(cv.cvLabelLocal)}
                  </Text>
                </Row>
              ))}
            </Stack>
          </Stack>
        )}
        code={`const log = [
  { id: 'r', authorId: 'grace', at, text: '…', status: 'read' }, // remote
  { id: 'l', authorId: 'me',    at, text: '…' },                 // local, no status
];

conversationRuns(log, 'me');
// remote -> status: undefined   (stripped, not merely undrawn)
// local  -> status: 'sent'      (filled in: CONVERSATION_ASSUMED_STATUS)`}
      />

      <Example
        title={t(cv.cvExFlightTitle)}
        description={prose(t(cv.cvExFlightDesc))}
        component="ConversationView"
        platformLayout="stacked"
        render={(K) => (
          <Pane height="15rem">
            <K.ConversationView messages={inFlight} viewerId={VIEWER} now={NOW} label={t(cv.cvPeer)} />
          </Pane>
        )}
        code={`// 'sending' -> ack 'optimistic' -> the run steps back by provisionalOpacity
// 'failed'  -> ack 'failed'      -> full strength, danger border, no fading

<ConversationView
  messages={[
    { id: 'b', authorId: 'me', at, text: '…', status: 'sending' },
    { id: 'c', authorId: 'me', at, text: '…', status: 'failed' },
  ]}
  viewerId="me"
/>`}
      />

      <Example
        title={t(cv.cvExEmptyTitle)}
        description={prose(t(cv.cvExEmptyDesc))}
        component="ConversationView"
        platformLayout="stacked"
        render={(K) => (
          <Row gap={6} wrap align="start">
            <Stack gap={2} style={{ flex: '1 1 15rem', minWidth: 0 }}>
              <Caption>{t(cv.cvEmptyLabel)}</Caption>
              <Pane height="15rem">
                <K.ConversationView messages={[]} viewerId={VIEWER} now={NOW} label={t(cv.cvPeer)} />
              </Pane>
            </Stack>
            <Stack gap={2} style={{ flex: '1 1 15rem', minWidth: 0 }}>
              <Caption>{t(cv.cvSkeletonLabel)}</Caption>
              <Pane height="15rem">
                <K.ConversationView messages={[]} viewerId={VIEWER} now={NOW} skeleton />
              </Pane>
            </Stack>
          </Row>
        )}
        code={`<ConversationView messages={[]} viewerId="me" />
<ConversationView messages={[]} viewerId="me" skeleton />`}
      />

      <Example
        title={t(cv.cvExRowTitle)}
        description={prose(t(cv.cvExRowDesc))}
        component="ConversationView"
        platformLayout="stacked"
        render={(K) => (
          <Pane height="18rem">
            <K.ConversationView
              messages={messages}
              viewerId={VIEWER}
              layout="row"
              now={NOW}
              label={t(cv.cvPeer)}
              avatarFor={(id) => <Avatar name={names[id]} size="md" />}
              authorNameFor={(id) => names[id]}
            />
          </Pane>
        )}
        code={`<ConversationView
  messages={messages}
  viewerId="me"
  layout="row"
  avatarFor={(id) => <Avatar name={nameOf(id)} size="md" />}
  authorNameFor={(id) => nameOf(id)}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'messages', type: 'M[]', description: t(cv.cvPropMessages) },
          { name: 'viewerId', type: 'string', description: t(cv.cvPropViewerId) },
          { name: 'layout', type: "'bubble' | 'row'", default: "'bubble'", description: t(cv.cvPropLayout) },
          { name: 'groupWindowMs', type: 'number', default: '300000', description: t(cv.cvPropGroupWindow) },
          { name: 'avatarFor', type: '(authorId: string) => ReactNode', description: t(cv.cvPropAvatarFor) },
          { name: 'authorNameFor', type: '(authorId: string) => ReactNode', description: t(cv.cvPropAuthorNameFor) },
          { name: 'empty', type: 'ReactNode', description: t(cv.cvPropEmpty) },
          { name: 'label', type: 'string', description: t(cv.cvPropLabel) },
          { name: 'stick', type: 'boolean', default: 'true', description: t(cv.cvPropStick) },
          { name: 'onAtBottomChange', type: '(atBottom: boolean) => void', description: t(cv.cvPropOnAtBottomChange) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(cv.cvPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(cv.cvA11y1))}</li>
        <li>{prose(t(cv.cvA11y2))}</li>
        <li>{prose(t(cv.cvA11y3))}</li>
        <li>{prose(t(cv.cvA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(cv.cvUse1))}</li>
        <li>{prose(t(cv.cvUse2))}</li>
        <li>{prose(t(cv.cvUse3))}</li>
        <li>{prose(t(cv.cvUse4))}</li>
      </ul>
    </>
  );
}

export { cv as conversationViewPageMessages };
