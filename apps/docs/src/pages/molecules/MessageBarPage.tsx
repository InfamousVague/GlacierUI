import {
  Heading,
  Size,
  Stack,
  Text,
  TextTone,
  defineMessages,
  useT,
} from '@glacier/react';
import { replyPreview, type ChatAttachment } from '@glacier/logic';
import { useState, type ReactNode } from 'react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

/**
 * TODO(i18n): these belong in apps/docs/src/i18n/ alongside the other page
 * catalogs; they are authored here so the page compiles standalone, exactly as
 * the rest of the chat suite's pages are, and every key is ready to be moved
 * across verbatim.
 */
const mbar = defineMessages({
  mbarName: { en: 'Message Bar', es: 'Barra de mensaje', fr: 'Barre de message', de: 'Nachrichtenleiste', ja: 'メッセージバー', pt: 'Barra de mensagem', zh: '消息栏', ar: 'شريط الرسالة' },
  mbarLede: {
    en: 'The composer at the foot of a thread: an auto-growing field, a send control that is live exactly when the draft can go out, and the staged files, quoted reply, edit mode, and character budget that surround it.',
    es: 'El redactor al pie de un hilo: un campo que crece solo, un control de envío que está activo exactamente cuando el borrador puede salir, y los archivos preparados, la respuesta citada, el modo de edición y el presupuesto de caracteres que lo rodean.',
    fr: 'Le rédacteur au pied du fil : un champ qui grandit tout seul, une commande d’envoi active exactement quand le brouillon peut partir, et les fichiers en attente, la réponse citée, le mode édition et le budget de caractères qui l’entourent.',
    de: 'Der Verfasser am Fuß des Verlaufs: ein mitwachsendes Feld, ein Sendeknopf, der genau dann aktiv ist, wenn der Entwurf raus kann, und drumherum die vorgemerkten Dateien, die zitierte Antwort, der Bearbeitungsmodus und das Zeichenbudget.',
    ja: 'スレッドの足元にある入力欄。自動で伸びるフィールド、下書きが送れるときだけ生きる送信ボタン、そしてそれを囲む添付、引用返信、編集モード、文字数の予算。',
    pt: 'O redator ao pé do fio: um campo que cresce sozinho, um controlo de envio ativo exatamente quando o rascunho pode sair, e os ficheiros preparados, a resposta citada, o modo de edição e o orçamento de caracteres à sua volta.',
    zh: '会话底部的输入栏：一个自动增高的输入框、一个恰好在草稿可以发出时才生效的发送控件，以及围绕它的暂存附件、引用回复、编辑模式与字符预算。',
    ar: 'مُنشئ الرسالة أسفل الخيط: حقل ينمو من تلقاء نفسه، وزرّ إرسال يصير حيًّا في اللحظة التي يمكن فيها للمسودّة أن تخرج، وحوله المرفقات المُجهّزة والرد المقتبس ووضع التعديل وميزانية الأحرف.',
  },
  mbarAnatomy: {
    en: 'One frame carrying the surface, the corner, and the focus ring - drawn on `:focus-within` rather than on the textarea, because the frame is what a user perceives as the control. Inside it: a banner strip for the mode, the staged tray, the field row with its leading and trailing slots, and the counter. The field grows through a hidden twin carrying the same text under the same typography, so nothing is measured on a keystroke.',
    es: 'Un marco que lleva la superficie, la esquina y el anillo de foco, dibujado con `:focus-within` y no sobre el textarea, porque el marco es lo que el usuario percibe como el control. Dentro: una franja para el modo, la bandeja de adjuntos, la fila del campo con sus huecos inicial y final, y el contador. El campo crece mediante un gemelo oculto que lleva el mismo texto con la misma tipografía, así que nada se mide en cada tecla.',
    fr: 'Un cadre portant la surface, l’angle et l’anneau de focus - dessiné sur `:focus-within` et non sur la zone de texte, car c’est le cadre que l’utilisateur perçoit comme la commande. À l’intérieur : un bandeau pour le mode, le plateau des pièces jointes, la rangée du champ avec ses emplacements avant et arrière, et le compteur. Le champ grandit via un jumeau caché portant le même texte sous la même typographie, donc rien n’est mesuré à chaque frappe.',
    de: 'Ein Rahmen trägt Fläche, Ecke und Fokusring - gezeichnet auf `:focus-within` statt auf dem Textfeld, denn der Rahmen ist das, was der Nutzer als Bedienelement wahrnimmt. Darin: ein Streifen für den Modus, das Anhang-Tablett, die Feldzeile mit ihren führenden und folgenden Plätzen und der Zähler. Das Feld wächst über einen verborgenen Zwilling mit demselben Text in derselben Typografie, es wird also bei keinem Tastendruck gemessen.',
    ja: '面と角、そしてフォーカスリングを持つひとつの枠。リングはテキストエリアではなく `:focus-within` で枠に描きます。利用者がコントロールだと感じているのは枠のほうだからです。中には、モードを告げる帯、添付のトレイ、前後のスロットを備えた入力行、そしてカウンター。フィールドは同じ書体で同じ文字を持つ隠れた双子によって伸びるので、打鍵のたびに計測することはありません。',
    pt: 'Uma moldura que leva a superfície, o canto e o anel de foco - desenhado em `:focus-within` e não no textarea, porque a moldura é o que o utilizador percebe como o controlo. Lá dentro: uma faixa para o modo, o tabuleiro de anexos, a linha do campo com os seus espaços inicial e final, e o contador. O campo cresce através de um gémeo escondido com o mesmo texto na mesma tipografia, por isso nada é medido a cada tecla.',
    zh: '一个承载表面、圆角与焦点环的外框——焦点环画在 `:focus-within` 上而不是文本域上，因为用户感知为「控件」的是外框。里面是：说明当前模式的横条、附件托盘、带前后插槽的输入行，以及计数器。输入框通过一个用相同排版承载相同文字的隐藏孪生体来增高，因此每次按键都不需要测量。',
    ar: 'إطار واحد يحمل السطح والزاوية وحلقة التركيز - تُرسم على `:focus-within` لا على حقل النص، لأن الإطار هو ما يعدّه المستخدم عنصر التحكّم. وداخله: شريط يعلن الوضع، وصينية المرفقات، وصف الحقل بفتحتيه الأمامية والخلفية، والعدّاد. ينمو الحقل عبر توأم مخفي يحمل النص نفسه بالخط نفسه، فلا يُقاس شيء عند كل ضغطة.',
  },
  mbarExBasicTitle: { en: 'Enter sends, and it cannot be taken back', es: 'Intro envía, y no se puede deshacer', fr: 'Entrée envoie, et c’est irréversible', de: 'Enter sendet, und das ist nicht rückgängig zu machen', ja: 'Enter は送信し、取り消せない', pt: 'Enter envia, e não se pode desfazer', zh: 'Enter 即发送，而且收不回来', ar: 'Enter يُرسل، ولا رجعة فيه' },
  mbarExBasicDesc: {
    en: 'The key policy is a pure function in @glacier/logic, so both bindings call one answer, and its first line is the input-method guard: while an IME is composing, every Enter belongs to the IME and a composer that read one as a send would fire a message on the way to the first kanji of the sentence. The policy is also on `aria-describedby` as a visually-hidden line whether or not the visible hint is shown, because the reader least likely to have discovered an irreversible invisible keypress is the one who never sees a tooltip.',
    es: 'La política de teclas es una función pura en @glacier/logic, así que ambas vinculaciones consultan una sola respuesta, y su primera línea es la guarda del método de entrada: mientras un IME compone, cada Intro pertenece al IME, y un redactor que lo leyera como envío dispararía un mensaje camino del primer kanji de la frase. La política también va en `aria-describedby` como una línea oculta, se muestre o no la pista visible, porque quien menos probablemente descubra por accidente una tecla irreversible e invisible es quien nunca ve un aviso.',
    fr: 'La politique de touche est une fonction pure dans @glacier/logic : les deux liaisons consultent une seule réponse, et sa première ligne est la garde de méthode de saisie. Tant qu’un IME compose, chaque Entrée appartient à l’IME, et un rédacteur qui la lirait comme un envoi enverrait un message en route vers le premier kanji de la phrase. La politique figure aussi dans `aria-describedby` en ligne masquée, que l’indice visible soit affiché ou non, car la personne la moins susceptible d’avoir découvert par hasard une touche irréversible et invisible est celle qui ne voit jamais d’info-bulle.',
    de: 'Die Tastenregel ist eine reine Funktion in @glacier/logic, beide Bindungen fragen also eine Antwort, und ihre erste Zeile ist die Eingabemethoden-Sperre: während ein IME komponiert, gehört jedes Enter dem IME, und ein Verfasser, der es als Senden läse, schickte eine Nachricht auf dem Weg zum ersten Kanji des Satzes. Die Regel steht zudem als visuell verborgene Zeile in `aria-describedby`, ob der sichtbare Hinweis gezeigt wird oder nicht, denn wer einen unumkehrbaren, unsichtbaren Tastendruck am wenigsten zufällig entdeckt, ist die Person, die nie einen Hinweis sieht.',
    ja: 'キーの規則は @glacier/logic の純粋関数で、両方のバインディングがひとつの答えを参照します。その最初の行が入力メソッドの防護です。IME が変換中のあいだ、Enter はすべて IME のものであり、それを送信と読む入力欄は、文の最初の漢字にたどり着く前にメッセージを飛ばしてしまいます。規則は視覚的なヒントの有無にかかわらず `aria-describedby` の非表示行にも置かれます。取り消せない見えないキー操作を偶然に見つける可能性がもっとも低いのは、ツールチップを一度も見ない人だからです。',
    pt: 'A política de teclas é uma função pura em @glacier/logic, por isso ambas as ligações consultam uma só resposta, e a sua primeira linha é a guarda do método de entrada: enquanto um IME compõe, cada Enter pertence ao IME, e um redator que o lesse como envio dispararia uma mensagem a caminho do primeiro kanji da frase. A política está também em `aria-describedby` como linha oculta, seja ou não mostrada a dica visível, porque quem menos provavelmente descobriu por acaso uma tecla irreversível e invisível é quem nunca vê uma dica.',
    zh: '按键策略是 @glacier/logic 里的一个纯函数，两个绑定查的是同一个答案，而它的第一行就是输入法守卫：当 IME 正在组字时，每一次 Enter 都属于输入法；把它读成发送的输入栏，会在句子的第一个汉字还没落定时就把消息发出去。无论是否显示可见提示，该策略都会以视觉隐藏的一行放进 `aria-describedby`——最不可能偶然发现这个不可撤销且看不见的按键的人，正是永远看不到提示的人。',
    ar: 'سياسة المفاتيح دالّة صافية في @glacier/logic، فتسأل الواجهتان إجابة واحدة، وسطرها الأول هو حارس طريقة الإدخال: ما دام الـIME يؤلّف، فكل Enter ملكٌ له، ومُنشئ رسالة يقرؤه إرسالًا سيُطلق الرسالة في الطريق إلى أول حرف من الجملة. والسياسة موجودة أيضًا في `aria-describedby` كسطر مخفي بصريًا سواء ظهر التلميح المرئي أم لا، لأن أقل الناس احتمالًا لاكتشاف ضغطة غير قابلة للتراجع وغير مرئية هو من لا يرى تلميحًا أبدًا.',
  },
  mbarExBudgetTitle: { en: 'A budget, not a truncation', es: 'Un presupuesto, no un recorte', fr: 'Un budget, pas une troncature', de: 'Ein Budget, keine Kürzung', ja: '切り捨てではなく、予算', pt: 'Um orçamento, não um corte', zh: '是预算，不是截断' , ar: 'ميزانية، لا بَتْر' },
  mbarExBudgetDesc: {
    en: 'There is no `maxlength` attribute anywhere in this component. The attribute blocks keystrokes, truncates a paste silently, and cuts an input method off mid-word; losing the end of what somebody pasted is a worse failure than a message that will not go yet. So the bar counts instead - through `Intl.Segmenter` by default, so a flag is one character and not four - refuses to send while over, and lets the text stand. The counter is absent until the last tenth of the budget, and only a threshold crossing is announced: a number that changed on every keystroke would be noise on screen and a firehose in a live region.',
    es: 'No hay ningún atributo `maxlength` en este componente. El atributo bloquea teclas, recorta un pegado en silencio y corta un método de entrada a media palabra; perder el final de lo que alguien pegó es un fallo peor que un mensaje que aún no puede salir. Así que la barra cuenta - con `Intl.Segmenter` por defecto, para que una bandera sea un carácter y no cuatro -, se niega a enviar mientras se pase y deja el texto donde está. El contador no aparece hasta el último décimo del presupuesto, y solo se anuncia el cruce de umbral: un número que cambiara con cada tecla sería ruido en pantalla y una manguera en una región viva.',
    fr: 'Il n’y a aucun attribut `maxlength` dans ce composant. L’attribut bloque les frappes, tronque un collage sans le dire et coupe une méthode de saisie en plein mot ; perdre la fin de ce que quelqu’un a collé est un échec pire qu’un message qui ne part pas encore. La barre compte donc - via `Intl.Segmenter` par défaut, pour qu’un drapeau soit un caractère et non quatre -, refuse d’envoyer tant qu’on dépasse, et laisse le texte en place. Le compteur est absent jusqu’au dernier dixième du budget, et seul un franchissement de seuil est annoncé : un nombre changeant à chaque frappe serait du bruit à l’écran et un déluge dans une région vive.',
    de: 'In dieser Komponente steht nirgends ein `maxlength`-Attribut. Das Attribut blockiert Tastendrücke, kürzt ein Einfügen stillschweigend und schneidet eine Eingabemethode mitten im Wort ab; das Ende des Eingefügten zu verlieren ist ein schlimmeres Versagen als eine Nachricht, die noch nicht rausgeht. Die Leiste zählt stattdessen - standardmäßig über `Intl.Segmenter`, damit eine Flagge ein Zeichen ist und nicht vier -, verweigert das Senden über dem Limit und lässt den Text stehen. Der Zähler fehlt bis zum letzten Zehntel des Budgets, und angesagt wird nur ein Schwellenwechsel: eine Zahl, die sich bei jedem Tastendruck ändert, wäre Lärm auf dem Bildschirm und ein Schlauch in einer Live-Region.',
    ja: 'このコンポーネントのどこにも `maxlength` 属性はありません。あの属性は打鍵を止め、貼り付けを黙って切り、入力メソッドを語の途中で断ちます。貼り付けた末尾が失われることは、まだ送れないメッセージより悪い失敗です。だから代わりに数えます。既定では `Intl.Segmenter` を使うので、旗は4文字ではなく1文字です。超過中は送信を拒み、文字はそのまま残します。カウンターは予算の最後の1割まで現れず、告げるのはしきい値をまたいだときだけ。打鍵ごとに変わる数字は画面では雑音、ライブリージョンでは放水になります。',
    pt: 'Não há qualquer atributo `maxlength` neste componente. O atributo bloqueia teclas, corta uma colagem em silêncio e interrompe um método de entrada a meio de uma palavra; perder o fim do que alguém colou é uma falha pior do que uma mensagem que ainda não sai. Por isso a barra conta - por omissão através de `Intl.Segmenter`, para que uma bandeira seja um caractere e não quatro -, recusa enviar enquanto estiver acima e deixa o texto ficar. O contador só aparece no último décimo do orçamento, e apenas a passagem de um limiar é anunciada: um número a mudar a cada tecla seria ruído no ecrã e uma mangueira numa região viva.',
    zh: '这个组件里没有任何 `maxlength` 属性。那个属性会挡住按键、悄悄截断粘贴，还会在输入法组字到一半时把它切断；丢掉别人粘贴内容的末尾，是比「这条消息暂时发不出去」更糟的失败。所以这里改为计数——默认走 `Intl.Segmenter`，因此一面旗帜算一个字符而不是四个——超出时拒绝发送，并让文字留在原处。计数器要到预算的最后十分之一才出现，而且只在跨越阈值时播报：每次按键都在变的数字，在屏幕上是噪音，在 live region 里是水管。',
    ar: 'لا يوجد أي سمة `maxlength` في هذا المكوّن. تلك السمة تمنع الضغطات، وتبتر اللصق بصمت، وتقطع طريقة الإدخال في منتصف الكلمة؛ وفقدان آخر ما لصقه أحدهم فشلٌ أسوأ من رسالة لا تخرج بعد. لذا يَعُدّ الشريط بدلًا من ذلك - عبر `Intl.Segmenter` افتراضيًا، فيصير العَلَم حرفًا واحدًا لا أربعة - ويرفض الإرسال ما دام فوق الحدّ، ويترك النص كما هو. لا يظهر العدّاد إلا في العُشر الأخير من الميزانية، ولا يُعلَن إلا عبور العتبة: رقم يتغيّر مع كل ضغطة ضجيجٌ على الشاشة وخرطومٌ في منطقة حيّة.',
  },
  mbarExModesTitle: { en: 'Replying, editing, and staged files', es: 'Responder, editar y adjuntos preparados', fr: 'Répondre, modifier, et fichiers en attente', de: 'Antworten, bearbeiten und vorgemerkte Dateien', ja: '返信、編集、そして添付の待機', pt: 'Responder, editar e ficheiros preparados', zh: '回复、编辑与暂存附件', ar: 'الرد والتعديل والمرفقات المُجهّزة' },
  mbarExModesDesc: {
    en: 'The reply target and the edit target travel with the send, in one `ComposerSubmission`, rather than being read out of app state after the callback fires - which is the race that answers the wrong message. The quoted strip is resolved by `replyPreview` rather than handed over as markup, so the excerpt, its cut, and the word for a media message all come from one place on both platforms. Escape gets its meaning from the handlers: with no `onCancelReply` or `onCancelEdit` wired it does nothing, and it never clears the draft, because the browser’s own undo does not reach a controlled value.',
    es: 'El objetivo de la respuesta y el de la edición viajan con el envío, en un único `ComposerSubmission`, en vez de leerse del estado de la app después de que dispare la retrollamada, que es la carrera que responde al mensaje equivocado. La franja citada la resuelve `replyPreview` en lugar de entregarse como marcado, así que el extracto, su corte y la palabra para un mensaje multimedia salen del mismo sitio en ambas plataformas. Escape recibe su sentido de los manejadores: sin `onCancelReply` ni `onCancelEdit` conectados no hace nada, y nunca borra el borrador, porque el deshacer del navegador no llega a un valor controlado.',
    fr: 'La cible de la réponse et celle de la modification voyagent avec l’envoi, dans un seul `ComposerSubmission`, au lieu d’être relues dans l’état de l’appli après le rappel - c’est cette course qui répond au mauvais message. Le bandeau cité est résolu par `replyPreview` plutôt que fourni en balisage : l’extrait, sa coupe et le mot désignant un média viennent d’un seul endroit sur les deux plateformes. Échap tient son sens des gestionnaires : sans `onCancelReply` ni `onCancelEdit` câblés, il ne fait rien, et il n’efface jamais le brouillon, car l’annulation du navigateur n’atteint pas une valeur contrôlée.',
    de: 'Das Antwort- und das Bearbeitungsziel reisen mit dem Senden, in einer `ComposerSubmission`, statt nach dem Rückruf aus dem App-Zustand gelesen zu werden - genau das ist das Rennen, das der falschen Nachricht antwortet. Der zitierte Streifen wird von `replyPreview` aufgelöst statt als Markup übergeben, sodass Auszug, Schnitt und das Wort für eine Mediennachricht auf beiden Plattformen aus einer Quelle stammen. Escape bekommt seine Bedeutung von den Handlern: ohne `onCancelReply` oder `onCancelEdit` tut es nichts, und es löscht nie den Entwurf, denn das Rückgängig des Browsers erreicht einen kontrollierten Wert nicht.',
    ja: '返信先と編集対象は、ひとつの `ComposerSubmission` として送信と一緒に運ばれます。コールバックのあとでアプリの状態から読み直すやり方は、まさに「別のメッセージに返信してしまう」競合です。引用の帯は markup を渡すのではなく `replyPreview` が解決するので、抜粋も切り方もメディアの呼び名も、両プラットフォームで一箇所から来ます。Escape の意味はハンドラが決めます。`onCancelReply` も `onCancelEdit` も配線されていなければ何もせず、下書きを消すことは決してありません。ブラウザ自身の取り消しは制御された値には届かないからです。',
    pt: 'O alvo da resposta e o da edição viajam com o envio, num único `ComposerSubmission`, em vez de serem lidos do estado da app depois de a retrochamada disparar - que é a corrida que responde à mensagem errada. A faixa citada é resolvida por `replyPreview` em vez de entregue como marcação, por isso o excerto, o seu corte e a palavra para uma mensagem de média vêm todos do mesmo sítio nas duas plataformas. O Escape recebe o seu sentido dos manipuladores: sem `onCancelReply` nem `onCancelEdit` ligados não faz nada, e nunca limpa o rascunho, porque o desfazer do navegador não alcança um valor controlado.',
    zh: '回复目标和编辑目标随发送一起走，装在同一个 `ComposerSubmission` 里，而不是在回调触发后再去读应用状态——那正是「回错消息」的竞态。引用条由 `replyPreview` 解析，而不是当作标记传进来，因此摘录、截断以及媒体消息的称呼，在两个平台上都来自同一处。Escape 的含义来自处理函数：没有接 `onCancelReply` 或 `onCancelEdit` 时它什么也不做，而且它从不清空草稿，因为浏览器自带的撤销够不到受控值。',
    ar: 'ينتقل هدف الرد وهدف التعديل مع الإرسال، داخل `ComposerSubmission` واحد، بدل قراءتهما من حالة التطبيق بعد انطلاق النداء - وهو السباق الذي يجعلك تردّ على الرسالة الخطأ. ويحلّ `replyPreview` الشريط المقتبس بدل تسليمه كوسْم، فيأتي المقتطف وقصّه وكلمة الوسائط من مكان واحد في المنصّتين. ويستمدّ Escape معناه من المعالِجات: بلا `onCancelReply` أو `onCancelEdit` لا يفعل شيئًا، ولا يمسح المسودّة أبدًا، لأن تراجع المتصفّح نفسه لا يصل إلى قيمة محكومة.',
  },
  mbarExSendTitle: { en: 'A replaced send stays as correct as the default one', es: 'Un envío sustituido sigue siendo tan correcto como el original', fr: 'Un envoi remplacé reste aussi correct que celui par défaut', de: 'Ein ersetzter Senden-Knopf bleibt so korrekt wie der voreingestellte', ja: '差し替えた送信ボタンも既定と同じだけ正しい', pt: 'Um envio substituído continua tão correto como o original', zh: '被替换的发送控件与默认的一样正确', ar: 'زرّ الإرسال المستبدل يبقى صحيحًا كالافتراضي' },
  mbarExSendDesc: {
    en: '`renderSend` receives the live state - the draft, the sendability, busy, disabled, the submit mode, the meter, and `send()` - so a split send-and-schedule, a mic that becomes a send, or a plain Post button all inherit the same single authority the Enter key consults. There is deliberately no `canSend` override prop: sendability is `composerCanSend` in commons, and an override that can lie about emptiness would let a draft of three spaces get two different answers from the button and the keyboard.',
    es: '`renderSend` recibe el estado vivo - el borrador, si se puede enviar, ocupado, deshabilitado, el modo de envío, el medidor y `send()` -, así que un envío partido con programación, un micrófono que se convierte en envío o un simple botón Publicar heredan la misma autoridad única que consulta la tecla Intro. No hay, a propósito, una prop `canSend` que sustituya nada: la posibilidad de enviar es `composerCanSend` en commons, y una sustitución capaz de mentir sobre el vacío dejaría que un borrador de tres espacios recibiera dos respuestas distintas del botón y del teclado.',
    fr: '`renderSend` reçoit l’état vivant - le brouillon, l’envoyabilité, occupé, désactivé, le mode d’envoi, le compteur et `send()` - de sorte qu’un envoi scindé avec programmation, un micro qui devient un envoi ou un simple bouton Publier héritent tous de la même autorité unique que consulte la touche Entrée. Il n’y a délibérément pas de prop `canSend` de contournement : l’envoyabilité, c’est `composerCanSend` dans commons, et un contournement capable de mentir sur le vide laisserait un brouillon de trois espaces obtenir deux réponses différentes du bouton et du clavier.',
    de: '`renderSend` bekommt den lebenden Zustand - Entwurf, Sendbarkeit, beschäftigt, deaktiviert, Sendemodus, Zähler und `send()` -, sodass ein geteiltes Senden-und-Planen, ein Mikrofon, das zum Senden wird, oder ein schlichter Posten-Knopf allesamt dieselbe eine Autorität erben, die auch die Enter-Taste befragt. Eine `canSend`-Überschreibung gibt es bewusst nicht: Sendbarkeit ist `composerCanSend` in commons, und eine Überschreibung, die über Leere lügen kann, ließe einen Entwurf aus drei Leerzeichen von Knopf und Tastatur zwei verschiedene Antworten bekommen.',
    ja: '`renderSend` は生きた状態 ― 下書き、送れるかどうか、送信中、無効、送信モード、メーター、そして `send()` ― を受け取ります。だから「送信と予約送信の分割ボタン」も、「押し込むと送信に変わるマイク」も、素朴な「投稿」ボタンも、Enter キーが参照するのと同じ唯一の権威を受け継ぎます。`canSend` を上書きする prop は意図的にありません。送れるかどうかは commons の `composerCanSend` であり、空かどうかについて嘘をつける上書きは、空白3文字の下書きにボタンとキーボードから別々の答えを出させてしまいます。',
    pt: '`renderSend` recebe o estado vivo - o rascunho, a possibilidade de enviar, ocupado, desativado, o modo de envio, o medidor e `send()` -, por isso um envio dividido com agendamento, um microfone que se torna envio, ou um simples botão Publicar herdam todos a mesma autoridade única que a tecla Enter consulta. Não existe, de propósito, uma prop `canSend` de substituição: a possibilidade de enviar é `composerCanSend` em commons, e uma substituição capaz de mentir sobre o vazio deixaria um rascunho de três espaços receber duas respostas diferentes do botão e do teclado.',
    zh: '`renderSend` 拿到的是活的状态——草稿、是否可发送、忙碌、禁用、提交模式、计数器，以及 `send()`——因此「发送/定时发送」的分体按钮、按住变成发送的麦克风，或者一个朴素的「发布」按钮，都继承了 Enter 键所查询的同一个唯一权威。这里刻意没有 `canSend` 覆盖属性：能否发送就是 commons 里的 `composerCanSend`，而一个可以在「是否为空」上撒谎的覆盖，会让三个空格的草稿从按钮和键盘得到两个不同的答案。',
    ar: 'يستقبل `renderSend` الحالة الحيّة - المسودّة، وإمكان الإرسال، والانشغال، والتعطيل، ووضع الإرسال، والعدّاد، و`send()` - فيرث زرُّ إرسال مشقوق مع الجدولة، أو ميكروفون يتحوّل إلى إرسال، أو زرّ «نشر» بسيط، السلطةَ الواحدة نفسها التي يسألها مفتاح Enter. ولا توجد عمدًا خاصية `canSend` تتجاوزها: إمكان الإرسال هو `composerCanSend` في commons، وتجاوزٌ يستطيع الكذب بشأن الفراغ سيمنح مسودّةً من ثلاث مسافات إجابتين مختلفتين من الزرّ ومن لوحة المفاتيح.',
  },
  mbarPlaceholder: { en: 'Write a message', es: 'Escribe un mensaje', fr: 'Écrivez un message', de: 'Nachricht schreiben', ja: 'メッセージを入力', pt: 'Escreva uma mensagem', zh: '写条消息', ar: 'اكتب رسالة' },
  mbarSent: { en: 'Sent: {text}', es: 'Enviado: {text}', fr: 'Envoyé : {text}', de: 'Gesendet: {text}', ja: '送信しました: {text}', pt: 'Enviado: {text}', zh: '已发送：{text}', ar: 'أُرسلت: {text}' },
  mbarQuoted: { en: 'The build is green again, it was the cache all along', es: 'La compilación vuelve a estar en verde, era la caché desde el principio', fr: 'Le build est de nouveau au vert, c’était le cache depuis le début', de: 'Der Build ist wieder grün, es war die ganze Zeit der Cache', ja: 'ビルドがまた通りました。結局ずっとキャッシュのせいでした', pt: 'A compilação está verde outra vez, era a cache desde o início', zh: '构建又变绿了，一直都是缓存的问题', ar: 'عاد البناء أخضر، كانت الذاكرة المؤقتة طوال الوقت' },
  mbarPeer: { en: 'Grace Hopper', es: 'Grace Hopper', fr: 'Grace Hopper', de: 'Grace Hopper', ja: 'グレース・ホッパー', pt: 'Grace Hopper', zh: '格蕾丝·霍珀', ar: 'غريس هوبر' },
  mbarPost: { en: 'Post', es: 'Publicar', fr: 'Publier', de: 'Posten', ja: '投稿', pt: 'Publicar', zh: '发布', ar: 'نشر' },
  mbarPropValue: { en: 'The draft, controlled. Pair with `onValueChange`, or pass `defaultValue` and let the bar own it.', es: 'El borrador, controlado. Combínalo con `onValueChange`, o pasa `defaultValue` y deja que la barra lo gestione.', fr: 'Le brouillon, contrôlé. À associer à `onValueChange`, ou passez `defaultValue` et laissez la barre le gérer.', de: 'Der Entwurf, kontrolliert. Mit `onValueChange` paaren, oder `defaultValue` übergeben und die Leiste ihn halten lassen.', ja: '制御された下書き。`onValueChange` と組み合わせるか、`defaultValue` を渡してバーに持たせます。', pt: 'O rascunho, controlado. Emparelhe com `onValueChange`, ou passe `defaultValue` e deixe a barra tratar dele.', zh: '受控的草稿。与 `onValueChange` 搭配，或传 `defaultValue` 让输入栏自己持有。', ar: 'المسودّة، محكومة. اقرنها بـ`onValueChange`، أو مرّر `defaultValue` ودع الشريط يملكها.' },
  mbarPropOnSend: { en: 'Called with a `ComposerSubmission`: the trimmed text, the staged attachments, and the `replyToId` and `editingId` that were in force.', es: 'Se llama con un `ComposerSubmission`: el texto recortado, los adjuntos preparados y el `replyToId` y el `editingId` vigentes.', fr: 'Appelé avec un `ComposerSubmission` : le texte élagué, les pièces jointes en attente, et les `replyToId` et `editingId` en vigueur.', de: 'Wird mit einer `ComposerSubmission` aufgerufen: der getrimmte Text, die vorgemerkten Anhänge und die geltenden `replyToId` und `editingId`.', ja: '`ComposerSubmission` を伴って呼ばれます。トリム済みの本文、待機中の添付、そしてそのとき有効だった `replyToId` と `editingId`。', pt: 'Chamado com um `ComposerSubmission`: o texto aparado, os anexos preparados e o `replyToId` e o `editingId` em vigor.', zh: '以一个 `ComposerSubmission` 调用：修剪后的文本、暂存的附件，以及当时生效的 `replyToId` 与 `editingId`。', ar: 'يُستدعى بـ`ComposerSubmission`: النص المشذّب، والمرفقات المُجهّزة، و`replyToId` و`editingId` الساريان.' },
  mbarPropSubmitMode: { en: 'Which chord sends. Fixed rather than derived from the pointer type, because a send that resolves from the environment cannot be tested and mis-resolves on a touchscreen laptop.', es: 'Qué combinación envía. Fijo y no derivado del tipo de puntero, porque un envío que se resuelve según el entorno no se puede probar y se resuelve mal en un portátil táctil.', fr: 'Quel accord envoie. Fixé plutôt que déduit du type de pointeur, car un envoi résolu depuis l’environnement ne peut être testé et se résout mal sur un portable tactile.', de: 'Welcher Griff sendet. Festgelegt statt aus dem Zeigertyp abgeleitet, denn ein Senden, das sich aus der Umgebung auflöst, ist nicht testbar und löst auf einem Touch-Laptop falsch auf.', ja: 'どの組み合わせで送るか。ポインタ種別から導かず固定します。環境から決まる送信はテストできず、タッチ対応ノートPCでは誤って解決されるからです。', pt: 'Que acorde envia. Fixo em vez de derivado do tipo de ponteiro, porque um envio que se resolve a partir do ambiente não pode ser testado e resolve-se mal num portátil táctil.', zh: '哪种组合键触发发送。固定而非由指针类型推导，因为由环境决定的发送无法测试，并且在触屏笔记本上会判断错误。', ar: 'أي تأليفة تُرسل. مثبّتة لا مشتقّة من نوع المؤشّر، لأن إرسالًا يُحلّ من البيئة لا يمكن اختباره ويُحلّ خطأً على حاسوب محمول بشاشة لمس.' },
  mbarPropMaxLength: { en: 'The character budget. Never applied as a `maxlength` attribute: the bar counts, refuses to send while over, and lets the text stand.', es: 'El presupuesto de caracteres. Nunca se aplica como atributo `maxlength`: la barra cuenta, se niega a enviar mientras se pase y deja el texto donde está.', fr: 'Le budget de caractères. Jamais posé en attribut `maxlength` : la barre compte, refuse d’envoyer tant qu’on dépasse, et laisse le texte en place.', de: 'Das Zeichenbudget. Nie als `maxlength`-Attribut gesetzt: die Leiste zählt, verweigert das Senden über dem Limit und lässt den Text stehen.', ja: '文字数の予算。`maxlength` 属性としては決して適用しません。バーは数え、超過中は送信を拒み、文字はそのまま残します。', pt: 'O orçamento de caracteres. Nunca aplicado como atributo `maxlength`: a barra conta, recusa enviar enquanto estiver acima, e deixa o texto ficar.', zh: '字符预算。绝不作为 `maxlength` 属性应用：输入栏负责计数、超出时拒绝发送，并让文字留在原处。', ar: 'ميزانية الأحرف. لا تُطبَّق أبدًا كسمة `maxlength`: يَعُدّ الشريط، ويرفض الإرسال فوق الحدّ، ويترك النص كما هو.' },
  mbarPropCountAs: { en: 'What counts as a character, so the counter agrees with whatever the server enforces. A flag is one grapheme, two code points, and four UTF-16 units.', es: 'Qué cuenta como carácter, para que el contador coincida con lo que imponga el servidor. Una bandera es un grafema, dos puntos de código y cuatro unidades UTF-16.', fr: 'Ce qui compte comme caractère, pour que le compteur s’accorde à ce que le serveur impose. Un drapeau vaut un graphème, deux points de code et quatre unités UTF-16.', de: 'Was als Zeichen zählt, damit der Zähler mit dem übereinstimmt, was der Server durchsetzt. Eine Flagge ist ein Graphem, zwei Codepunkte und vier UTF-16-Einheiten.', ja: '何を1文字と数えるか。サーバーが実際に課す規則とカウンターを一致させるためです。旗は書記素で1、コードポイントで2、UTF-16 単位で4です。', pt: 'O que conta como caractere, para o contador concordar com aquilo que o servidor impõe. Uma bandeira é um grafema, dois pontos de código e quatro unidades UTF-16.', zh: '什么算一个字符，以便计数器与服务器实际执行的规则一致。一面旗帜是一个字素、两个码位、四个 UTF-16 单元。', ar: 'ما الذي يُعدّ حرفًا، ليتفق العدّاد مع ما يفرضه الخادم فعلًا. العَلَم رسمٌ واحد، ونقطتا ترميز، وأربع وحدات UTF-16.' },
  mbarPropRows: { en: 'Rows the empty field shows, and rows it grows to before it scrolls. One row for a chat bar; three for a review box, whose height is an invitation to write more than a line.', es: 'Filas que muestra el campo vacío, y filas hasta las que crece antes de desplazarse. Una fila para una barra de chat; tres para una caja de reseña, cuya altura es una invitación a escribir más de una línea.', fr: 'Lignes affichées par le champ vide, et lignes jusqu’auxquelles il grandit avant de défiler. Une pour une barre de chat ; trois pour une zone d’avis, dont la hauteur invite à écrire plus d’une ligne.', de: 'Zeilen, die das leere Feld zeigt, und Zeilen, bis zu denen es wächst, bevor es scrollt. Eine für eine Chat-Leiste; drei für ein Rezensionsfeld, dessen Höhe zum Schreiben von mehr als einer Zeile einlädt.', ja: '空のときに見せる行数と、スクロールに移るまでに伸びる行数。チャットのバーなら1行、レビュー欄なら3行 ― その高さ自体が「1行より多く書いてよい」という誘いです。', pt: 'Linhas que o campo vazio mostra, e linhas até às quais cresce antes de deslocar. Uma para uma barra de conversa; três para uma caixa de crítica, cuja altura é um convite a escrever mais do que uma linha.', zh: '空态时显示的行数，以及开始滚动前可增长到的行数。聊天栏用一行；评价框用三行——它的高度本身就是「可以多写几行」的邀请。', ar: 'عدد الأسطر التي يعرضها الحقل فارغًا، وعدد الأسطر التي ينمو إليها قبل أن يمرّر. سطر واحد لشريط محادثة؛ وثلاثة لصندوق مراجعة، فارتفاعه نفسه دعوة لكتابة أكثر من سطر.' },
  mbarPropRenderSend: { en: 'Replaces the send control, receiving the live state, so a custom control keeps the same single sendability authority the key handler uses.', es: 'Sustituye el control de envío y recibe el estado vivo, de modo que un control propio conserva la misma autoridad única sobre el envío que usa el manejador de teclas.', fr: 'Remplace la commande d’envoi en recevant l’état vivant, de sorte qu’une commande personnalisée garde la même autorité unique d’envoyabilité que le gestionnaire de touches.', de: 'Ersetzt den Sende-Knopf und erhält den lebenden Zustand, sodass ein eigenes Bedienelement dieselbe eine Sendbarkeits-Autorität behält, die auch der Tastenhandler nutzt.', ja: '送信コントロールを置き換え、生きた状態を受け取ります。独自のコントロールでも、キー処理と同じ唯一の送信可否の権威を保ちます。', pt: 'Substitui o controlo de envio, recebendo o estado vivo, para que um controlo próprio mantenha a mesma autoridade única de envio que o manipulador de teclas usa.', zh: '替换发送控件，并接收活的状态，因此自定义控件保留与按键处理相同的唯一「可否发送」权威。', ar: 'يستبدل زرّ الإرسال ويستقبل الحالة الحيّة، فيحتفظ الزرّ المخصّص بسلطة إمكان الإرسال الواحدة نفسها التي يستخدمها معالِج المفاتيح.' },
  mbarPropTyping: { en: 'Who is typing, as display names. Resolved through `typingText` and `formatTyping`, never a pre-joined sentence.', es: 'Quién está escribiendo, como nombres visibles. Se resuelve con `typingText` y `formatTyping`, nunca una frase ya unida.', fr: 'Qui est en train d’écrire, sous forme de noms affichés. Résolu via `typingText` et `formatTyping`, jamais une phrase déjà assemblée.', de: 'Wer schreibt, als Anzeigenamen. Über `typingText` und `formatTyping` aufgelöst, nie ein vorgefertigter Satz.', ja: '入力中の人を表示名で。`typingText` と `formatTyping` を通して解決し、あらかじめ繋いだ文は受け取りません。', pt: 'Quem está a escrever, como nomes visíveis. Resolvido por `typingText` e `formatTyping`, nunca uma frase já unida.', zh: '正在输入的人，以显示名给出。经由 `typingText` 与 `formatTyping` 解析，绝不接收拼好的句子。', ar: 'من يكتب، بأسماء ظاهرة. يُحلّ عبر `typingText` و`formatTyping`، لا كجملة مُجمَّعة مسبقًا.' },
  mbarPropAsForm: { en: 'Hosts the bar in a `form`. Off by default: implicit submission applies to single-line inputs only, so Enter in a textarea is hand-handled either way, and a nested form is invalid the moment the bar lands inside a page form.', es: 'Aloja la barra en un `form`. Desactivado por defecto: el envío implícito solo se aplica a campos de una línea, así que Intro en un textarea se maneja a mano de todos modos, y un formulario anidado es inválido en cuanto la barra cae dentro de un formulario de página.', fr: 'Héberge la barre dans un `form`. Désactivé par défaut : la soumission implicite ne vaut que pour les champs d’une ligne, donc Entrée dans une zone de texte est traitée à la main de toute façon, et un formulaire imbriqué devient invalide dès que la barre atterrit dans un formulaire de page.', de: 'Bettet die Leiste in ein `form` ein. Standardmäßig aus: implizites Absenden gilt nur für einzeilige Felder, Enter im Textfeld wird also ohnehin von Hand behandelt, und ein verschachteltes Formular ist ungültig, sobald die Leiste in einem Seitenformular landet.', ja: 'バーを `form` の中に置きます。既定はオフです。暗黙の送信は1行入力にしか効かないので Enter はどちらにせよ手で扱いますし、ページ側のフォームの中に落ちた瞬間に入れ子のフォームは不正になります。', pt: 'Aloja a barra num `form`. Desligado por omissão: a submissão implícita só se aplica a campos de uma linha, por isso o Enter num textarea é tratado à mão de qualquer forma, e um formulário aninhado é inválido no momento em que a barra cai dentro de um formulário de página.', zh: '把输入栏放进 `form` 里。默认关闭：隐式提交只对单行输入有效，所以 textarea 里的 Enter 无论如何都要手动处理，而一旦输入栏落在页面表单内部，嵌套表单就是非法的。', ar: 'يضع الشريط داخل `form`. مطفأ افتراضيًا: الإرسال الضمني لا يسري إلا على الحقول أحادية السطر، فـEnter في حقل نص يُعالَج يدويًا في الحالتين، والنموذج المتداخل غير صالح لحظة وقوع الشريط داخل نموذج الصفحة.' },
  mbarA11y1: { en: 'The submit policy is on `aria-describedby` as a visually-hidden line, always, whether or not the visible hint is shown. Enter here is irreversible and invisible.', es: 'La política de envío va en `aria-describedby` como línea oculta, siempre, se muestre o no la pista visible. Intro aquí es irreversible e invisible.', fr: 'La politique d’envoi figure dans `aria-describedby` en ligne visuellement masquée, toujours, que l’indice visible soit affiché ou non. Entrée ici est irréversible et invisible.', de: 'Die Senderegel steht immer als visuell verborgene Zeile in `aria-describedby`, ob der sichtbare Hinweis erscheint oder nicht. Enter ist hier unumkehrbar und unsichtbar.', ja: '送信の規則は、可視ヒントの有無にかかわらず常に `aria-describedby` の視覚的非表示の行に置かれます。ここでの Enter は取り消せず、しかも見えません。', pt: 'A política de envio está em `aria-describedby` como linha oculta, sempre, seja ou não mostrada a dica visível. O Enter aqui é irreversível e invisível.', zh: '提交策略始终以视觉隐藏的一行放在 `aria-describedby` 上，无论是否显示可见提示。这里的 Enter 既不可撤销又看不见。', ar: 'سياسة الإرسال موجودة دائمًا في `aria-describedby` كسطر مخفي بصريًا، ظهر التلميح المرئي أم لا. فـEnter هنا غير قابل للتراجع وغير مرئي.' },
  mbarA11y2: { en: 'The bar hosts a `div`, not a `form`, by default - the landmark is not worth an invalid nested form the moment the bar is dropped inside a page form.', es: 'La barra aloja un `div` y no un `form` por defecto: el punto de referencia no vale un formulario anidado inválido en cuanto la barra cae dentro de un formulario de página.', fr: 'La barre héberge un `div`, pas un `form`, par défaut : le repère ne vaut pas un formulaire imbriqué invalide dès que la barre atterrit dans un formulaire de page.', de: 'Die Leiste bettet standardmäßig ein `div` ein, kein `form` - der Landmark ist kein ungültiges verschachteltes Formular wert, sobald die Leiste in einem Seitenformular landet.', ja: 'バーは既定で `form` ではなく `div` を置きます。ページのフォームの中に落ちた瞬間に不正な入れ子フォームになるなら、そのランドマークは割に合いません。', pt: 'A barra aloja um `div`, não um `form`, por omissão - o marco não vale um formulário aninhado inválido no momento em que a barra cai dentro de um formulário de página.', zh: '默认情况下输入栏承载的是 `div` 而不是 `form`——一旦它被放进页面表单里就会产生非法的嵌套表单，那个地标不值这个代价。', ar: 'يضع الشريط `div` لا `form` افتراضيًا - فالمَعْلَم لا يستحق نموذجًا متداخلًا غير صالح لحظة وقوع الشريط داخل نموذج الصفحة.' },
  mbarA11y3: { en: 'Only a counter threshold crossing is announced. The transcript is already a polite live region that announces an in-flight send and a failure; saying the same things here would double-speak them into one queue.', es: 'Solo se anuncia el cruce de umbral del contador. La transcripción ya es una región viva educada que anuncia un envío en curso y un fallo; repetir lo mismo aquí lo diría dos veces en la misma cola.', fr: 'Seul un franchissement de seuil du compteur est annoncé. La transcription est déjà une région vive polie qui annonce un envoi en cours et un échec ; redire la même chose ici la dédoublerait dans une même file.', de: 'Angesagt wird nur ein Schwellenwechsel des Zählers. Der Verlauf ist bereits eine höfliche Live-Region, die einen laufenden Versand und einen Fehlschlag meldet; dasselbe hier zu sagen würde es in einer Warteschlange doppelt sprechen.', ja: '告げるのはカウンターがしきい値をまたいだときだけです。履歴はすでに polite なライブリージョンで、送信中も失敗も告げています。ここで同じことを言えば、ひとつの待ち行列で二重に読み上げられます。', pt: 'Só é anunciada a passagem de um limiar do contador. A transcrição já é uma região viva educada que anuncia um envio em curso e uma falha; dizer o mesmo aqui duplicaria a fala numa só fila.', zh: '只播报计数器跨越阈值的时刻。会话记录本身已经是一个 polite 的 live region，会播报发送中与失败；在这里重复同样的事，只会让它们在同一个队列里被念两遍。', ar: 'لا يُعلَن إلا عبور العدّاد لعتبة. فالسجلّ أصلًا منطقة حيّة مهذّبة تُعلن الإرسال الجاري والإخفاق؛ وقول الشيء نفسه هنا يضاعف نطقه في طابور واحد.' },
  mbarA11y4: { en: 'Each staged file names itself on its remove control, rather than five buttons all called "Remove" - a list of identically-labelled controls is a list nobody can navigate by name.', es: 'Cada adjunto se nombra en su control de quitar, en vez de cinco botones todos llamados «Quitar»: una lista de controles con la misma etiqueta es una lista que nadie puede recorrer por nombre.', fr: 'Chaque fichier en attente se nomme sur sa commande de retrait, plutôt que cinq boutons tous appelés « Retirer » : une liste de commandes portant la même étiquette est une liste que personne ne peut parcourir par nom.', de: 'Jede vorgemerkte Datei nennt sich auf ihrem Entfernen-Knopf, statt fünf Knöpfen, die alle „Entfernen“ heißen - eine Liste gleich beschrifteter Bedienelemente ist eine Liste, die niemand nach Namen ansteuern kann.', ja: '待機中の添付は、それぞれの削除ボタンで自分の名を名乗ります。「削除」という5つのボタンではありません。同じラベルの並びは、名前で辿れない並びです。', pt: 'Cada ficheiro preparado dá o seu nome no respetivo controlo de remoção, em vez de cinco botões todos chamados «Remover» - uma lista de controlos com a mesma etiqueta é uma lista que ninguém consegue percorrer por nome.', zh: '每个暂存文件都在自己的移除控件上报出文件名，而不是五个都叫「移除」的按钮——标签完全相同的控件列表，是没人能按名字导航的列表。', ar: 'كل ملف مُجهّز يذكر اسمه على زرّ إزالته، بدل خمسة أزرار كلها «إزالة» - فقائمة عناصر تحمل التسمية نفسها قائمة لا يستطيع أحد التنقّل فيها بالاسم.' },
  mbarUse1: { en: 'Leave `submitMode` at `enter` unless the box is genuinely long-form. If you want the pointer answer, call `composerSubmitModeFor` yourself and pass the result, so the value stays something you chose rather than something the device decided.', es: 'Deja `submitMode` en `enter` salvo que la caja sea de verdad de formato largo. Si quieres la respuesta según el puntero, llama tú a `composerSubmitModeFor` y pasa el resultado, para que el valor siga siendo algo que elegiste y no algo que decidió el dispositivo.', fr: 'Laissez `submitMode` sur `enter` sauf si la zone est réellement de forme longue. Si vous voulez la réponse liée au pointeur, appelez vous-même `composerSubmitModeFor` et passez le résultat, pour que la valeur reste un choix et non une décision de l’appareil.', de: 'Lassen Sie `submitMode` auf `enter`, außer das Feld ist wirklich Langform. Wollen Sie die Zeiger-Antwort, rufen Sie `composerSubmitModeFor` selbst auf und übergeben das Ergebnis, damit der Wert etwas Gewähltes bleibt und nicht etwas, das das Gerät entschieden hat.', ja: '本当に長文用でない限り `submitMode` は `enter` のままに。ポインタ由来の答えが欲しければ、自分で `composerSubmitModeFor` を呼んで結果を渡してください。そうすれば値は「端末が決めたもの」ではなく「あなたが選んだもの」のままです。', pt: 'Deixe `submitMode` em `enter` a menos que a caixa seja mesmo de formato longo. Se quiser a resposta do ponteiro, chame você `composerSubmitModeFor` e passe o resultado, para que o valor continue a ser algo que escolheu e não algo que o aparelho decidiu.', zh: '除非这个输入框确实用于长文，否则把 `submitMode` 保持在 `enter`。如果想要基于指针的答案，自己调用 `composerSubmitModeFor` 并把结果传进来，这样这个值仍然是你选的，而不是设备替你决定的。', ar: 'اترك `submitMode` على `enter` ما لم يكن الصندوق طويل النَّفَس فعلًا. وإن أردت إجابة المؤشّر، فنادِ `composerSubmitModeFor` بنفسك ومرّر ناتجها، لتبقى القيمة شيئًا اخترته لا شيئًا قرّره الجهاز.' },
  mbarUse2: { en: 'If you wrap the field with an overlay - mentions, slash commands, emoji - handle Enter in `inputProps.onKeyDown` and call `preventDefault`. The bar skips its policy entirely on an already-handled key. The sharp edge is the reverse: an overlay that forgets to preventDefault sends the message instead of accepting the highlighted candidate.', es: 'Si envuelves el campo con una capa - menciones, comandos con barra, emoji -, gestiona Intro en `inputProps.onKeyDown` y llama a `preventDefault`. La barra se salta su política por completo ante una tecla ya gestionada. El filo está en lo contrario: una capa que olvide preventDefault envía el mensaje en vez de aceptar el candidato resaltado.', fr: 'Si vous coiffez le champ d’une surcouche - mentions, commandes slash, emoji -, traitez Entrée dans `inputProps.onKeyDown` et appelez `preventDefault`. La barre saute entièrement sa politique sur une touche déjà traitée. Le piège est l’inverse : une surcouche qui oublie preventDefault envoie le message au lieu d’accepter le candidat surligné.', de: 'Legen Sie eine Überlagerung über das Feld - Erwähnungen, Slash-Befehle, Emoji -, behandeln Sie Enter in `inputProps.onKeyDown` und rufen `preventDefault`. Die Leiste überspringt ihre Regel bei einer bereits behandelten Taste vollständig. Die scharfe Kante ist die Umkehrung: eine Überlagerung, die preventDefault vergisst, sendet die Nachricht, statt den hervorgehobenen Vorschlag zu übernehmen.', ja: 'メンション、スラッシュコマンド、絵文字などのオーバーレイをフィールドに重ねるなら、Enter を `inputProps.onKeyDown` で処理して `preventDefault` を呼んでください。すでに処理済みのキーに対して、バーは自分の規則を完全に飛ばします。危ないのは逆で、preventDefault を忘れたオーバーレイは、選択中の候補を確定する代わりにメッセージを送ってしまいます。', pt: 'Se cobrir o campo com uma camada - menções, comandos com barra, emoji -, trate o Enter em `inputProps.onKeyDown` e chame `preventDefault`. A barra salta a sua política por completo perante uma tecla já tratada. O gume é o inverso: uma camada que se esqueça do preventDefault envia a mensagem em vez de aceitar o candidato realçado.', zh: '如果你在输入框上叠加浮层——提及、斜杠命令、表情——请在 `inputProps.onKeyDown` 里处理 Enter 并调用 `preventDefault`。对于已被处理的按键，输入栏会完全跳过自己的策略。危险在反面：忘记调用 preventDefault 的浮层，会把消息发出去，而不是确认高亮的候选项。', ar: 'إن غطّيت الحقل بطبقة - إشارات، أوامر مائلة، رموز تعبيرية - فعالِج Enter في `inputProps.onKeyDown` ونادِ `preventDefault`. يتخطّى الشريط سياسته كليًا عند مفتاح عولج سلفًا. والحدّ الحادّ هو العكس: طبقةٌ تنسى preventDefault سترسل الرسالة بدل قبول المرشَّح المميَّز.' },
  mbarUse3: { en: 'Keep the attachments controlled, and stage new files through `stageAttachments` from @glacier/logic rather than your own concat - it de-duplicates by id, which is what stops a re-drop of the same image rendering two chips one removal cannot clear.', es: 'Mantén los adjuntos controlados y prepara los nuevos con `stageAttachments` de @glacier/logic en vez de con tu propio concat: elimina duplicados por id, que es lo que impide que volver a soltar la misma imagen pinte dos fichas que una sola eliminación no puede quitar.', fr: 'Gardez les pièces jointes contrôlées et ajoutez les nouvelles via `stageAttachments` de @glacier/logic plutôt qu’un concat maison : il dédoublonne par id, ce qui empêche qu’un nouveau dépôt de la même image affiche deux jetons qu’un seul retrait ne peut effacer.', de: 'Halten Sie die Anhänge kontrolliert und merken Sie neue Dateien über `stageAttachments` aus @glacier/logic vor statt über ein eigenes concat - es entdoppelt nach id, und genau das verhindert, dass ein erneutes Ablegen desselben Bildes zwei Chips zeigt, die eine Entfernung nicht beseitigt.', ja: '添付は制御下に置き、新しいファイルは自前の concat ではなく @glacier/logic の `stageAttachments` で積んでください。id で重複を除くので、同じ画像を落とし直しても、1回の削除では消えない2つのチップが並ぶことがありません。', pt: 'Mantenha os anexos controlados e prepare os novos com `stageAttachments` de @glacier/logic em vez do seu próprio concat - ele elimina duplicados por id, que é o que impede que largar a mesma imagem outra vez desenhe duas fichas que uma remoção não consegue limpar.', zh: '把附件保持为受控，并用 @glacier/logic 的 `stageAttachments` 来暂存新文件，而不是自己 concat——它按 id 去重，这正是防止同一张图被再次拖入后出现两个、一次移除清不掉的芯片。', ar: 'أبقِ المرفقات محكومة، وجهّز الملفات الجديدة عبر `stageAttachments` من @glacier/logic لا بدمجٍ من عندك - فهو يزيل التكرار بالمعرّف، وهو ما يمنع إعادة إفلات الصورة نفسها من رسم رقاقتين لا تمحوهما إزالة واحدة.' },
  mbarUse4: { en: 'Give the bar a `maxLength` only when the server actually enforces one, and set `countAs` to whatever rule that server uses. A counter that disagrees with the server refuses messages the server would have accepted, which is worse than no counter at all.', es: 'Da un `maxLength` a la barra solo si el servidor impone uno de verdad, y ajusta `countAs` a la regla que use ese servidor. Un contador que no coincide con el servidor rechaza mensajes que el servidor habría aceptado, lo que es peor que no tener contador.', fr: 'Ne donnez un `maxLength` à la barre que si le serveur en impose réellement un, et réglez `countAs` sur la règle de ce serveur. Un compteur en désaccord avec le serveur refuse des messages que le serveur aurait acceptés, ce qui est pire que pas de compteur du tout.', de: 'Geben Sie der Leiste nur dann ein `maxLength`, wenn der Server wirklich eines durchsetzt, und stellen Sie `countAs` auf dessen Regel. Ein Zähler, der dem Server widerspricht, weist Nachrichten ab, die der Server angenommen hätte - schlimmer als gar kein Zähler.', ja: 'サーバーが実際に上限を課しているときだけ `maxLength` を与え、`countAs` はそのサーバーの規則に合わせてください。サーバーと食い違うカウンターは、サーバーなら受け取ったはずのメッセージを拒みます。カウンターが無いより悪い状態です。', pt: 'Dê um `maxLength` à barra só quando o servidor impuser mesmo um, e defina `countAs` para a regra que esse servidor usa. Um contador que discorda do servidor recusa mensagens que o servidor teria aceitado, o que é pior do que não ter contador nenhum.', zh: '只有当服务器确实设了上限时才给输入栏 `maxLength`，并把 `countAs` 设成那台服务器使用的规则。与服务器不一致的计数器，会拒绝服务器本来会接受的消息，比完全没有计数器更糟。', ar: 'لا تمنح الشريط `maxLength` إلا حين يفرض الخادم حدًّا فعلًا، واضبط `countAs` على القاعدة التي يستخدمها ذلك الخادم. فعدّادٌ يخالف الخادم يرفض رسائل كان الخادم ليقبلها، وذلك أسوأ من غياب العدّاد أصلًا.' },
});

const PHOTO: ChatAttachment = { id: 'p1', fileName: 'screenshot.png', mimeType: 'image/png' };

function Frame({ children }: { children: ReactNode }) {
  return <div style={{ width: '100%', minWidth: 0 }}>{children}</div>;
}

export function MessageBarPage() {
  const t = useT();
  const [sent, setSent] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([PHOTO]);
  const [replying, setReplying] = useState(true);

  const quoted = replyPreview({ id: 'm4', text: t(mbar.mbarQuoted) }, { authorName: t(mbar.mbarPeer) });

  return (
    <>
      <Heading level={1}>{t(mbar.mbarName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(mbar.mbarLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(mbar.mbarAnatomy))}</Text>
      <ComponentBlueprint specId="message-bar" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(mbar.mbarExBasicTitle)}
        description={prose(t(mbar.mbarExBasicDesc))}
        component="MessageBar"
        platformLayout="stacked"
        render={(K) => (
          <Frame>
            <Stack gap={3}>
              <K.MessageBar
                placeholder={t(mbar.mbarPlaceholder)}
                keyboardHint
                typing={[t(mbar.mbarPeer)]}
                onSend={(submission) => setSent(submission.text)}
              />
              {sent !== null && (
                <Text size={Size.Small} tone={TextTone.Subtle} mono>
                  {t(mbar.mbarSent, { text: sent })}
                </Text>
              )}
            </Stack>
          </Frame>
        )}
        code={`import { MessageBar } from '@glacier/react';

// Enter sends, Shift plus Enter opens a line - and neither fires while an
// input method is composing. \`onSend\` hands back the whole submission.
<MessageBar
  keyboardHint
  typing={['Grace Hopper']}
  onSend={({ text, attachments, replyToId }) => post(text, attachments, replyToId)}
/>`}
      />

      <Example
        title={t(mbar.mbarExBudgetTitle)}
        description={prose(t(mbar.mbarExBudgetDesc))}
        component="MessageBar"
        platformLayout="stacked"
        render={(K) => (
          <Frame>
            <K.MessageBar
              placeholder={t(mbar.mbarPlaceholder)}
              maxLength={80}
              defaultValue={'x'.repeat(74)}
            />
          </Frame>
        )}
        code={`// No maxlength attribute anywhere: the bar counts, refuses to send while
// over, and lets the text stand. \`countAs\` decides what a character is.
<MessageBar maxLength={280} countAs="graphemes" />`}
      />

      <Example
        title={t(mbar.mbarExModesTitle)}
        description={prose(t(mbar.mbarExModesDesc))}
        component="MessageBar"
        platformLayout="stacked"
        render={(K) => (
          <Frame>
            <K.MessageBar
              placeholder={t(mbar.mbarPlaceholder)}
              replyTo={replying ? quoted : null}
              onCancelReply={() => setReplying(false)}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
            />
          </Frame>
        )}
        code={`import { replyPreview } from '@glacier/logic';

// The strip is resolved, not markup: one excerpt rule, one cut, one word for
// a media message, on both platforms.
<MessageBar
  replyTo={replyPreview(target, { authorName: nameOf(target.authorId) })}
  onCancelReply={() => setTarget(null)}
  attachments={staged}
  onAttachmentsChange={setStaged}
/>`}
      />

      <Example
        title={t(mbar.mbarExSendTitle)}
        description={prose(t(mbar.mbarExSendDesc))}
        component="MessageBar"
        platformLayout="stacked"
        render={(K) => (
          <Frame>
            <K.MessageBar
              placeholder={t(mbar.mbarPlaceholder)}
              defaultValue=""
              renderSend={(state) => (
                <button type="button" disabled={!state.canSend} onClick={state.send}>
                  {t(mbar.mbarPost)}
                </button>
              )}
            />
          </Frame>
        )}
        code={`<MessageBar
  renderSend={(state) => (
    <SplitButton
      disabled={!state.canSend}
      onClick={state.send}
      menu={<MenuItem onSelect={schedule}>Schedule…</MenuItem>}
    >
      Send
    </SplitButton>
  )}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value / defaultValue', type: 'string', description: t(mbar.mbarPropValue) },
          { name: 'onSend', type: '(submission: ComposerSubmission) => void', description: t(mbar.mbarPropOnSend) },
          { name: 'submitMode', type: "'enter' | 'modifier'", default: "'enter'", description: t(mbar.mbarPropSubmitMode) },
          { name: 'maxLength', type: 'number', description: t(mbar.mbarPropMaxLength) },
          { name: 'countAs', type: "'graphemes' | 'codePoints' | 'utf16'", default: "'graphemes'", description: t(mbar.mbarPropCountAs) },
          { name: 'minRows / maxRows', type: 'number', default: '1 / 6', description: t(mbar.mbarPropRows) },
          { name: 'renderSend', type: '(state: MessageBarState) => ReactNode', description: t(mbar.mbarPropRenderSend) },
          { name: 'typing', type: 'string[]', description: t(mbar.mbarPropTyping) },
          { name: 'asForm', type: 'boolean', default: 'false', description: t(mbar.mbarPropAsForm) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(mbar.mbarA11y1))}</li>
        <li>{prose(t(mbar.mbarA11y2))}</li>
        <li>{prose(t(mbar.mbarA11y3))}</li>
        <li>{prose(t(mbar.mbarA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(mbar.mbarUse1))}</li>
        <li>{prose(t(mbar.mbarUse2))}</li>
        <li>{prose(t(mbar.mbarUse3))}</li>
        <li>{prose(t(mbar.mbarUse4))}</li>
      </ul>
    </>
  );
}

export { mbar as messageBarPageMessages };
