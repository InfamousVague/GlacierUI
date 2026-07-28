import { useState, type ReactNode } from 'react';
import { Heading, Row, Size, Stack, Text, TextTone, defineMessages, useT } from '@glacier/react';
import type { ChatAttachment } from '@glacier/logic';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { type PlatformKit } from '../../platforms.tsx';
import { m } from '../../i18n.ts';

/**
 * ImageAttachment / ImageGrid / VideoAttachment / FileAttachment / VoiceNote /
 * LinkPreviewCard.
 *
 * The page's own strings live here rather than in the shared catalog because
 * `apps/docs/src/i18n.ts` is integrated centrally; every key below is listed in
 * the handoff for folding in. All eight locales are mandatory.
 */
const pm = defineMessages({
  atName: { en: 'Attachments', es: 'Adjuntos', fr: 'Pièces jointes', de: 'Anhänge', ja: '添付', pt: 'Anexos', zh: '附件', ar: 'المرفقات' },
  atLede: {
    en: 'What a message carries besides text: photos, albums, video, documents, voice, and the unfurled preview of a link. Every one of them reserves its box before the first byte lands, so a transcript never jumps under the reader.',
    es: 'Lo que lleva un mensaje además de texto: fotos, álbumes, vídeo, documentos, voz y la vista previa desplegada de un enlace. Todos reservan su caja antes de que llegue el primer byte, así el historial nunca salta bajo el lector.',
    fr: 'Ce qu’un message transporte en plus du texte : photos, albums, vidéo, documents, voix et l’aperçu déplié d’un lien. Chacun réserve sa boîte avant l’arrivée du premier octet, pour que la transcription ne saute jamais sous le lecteur.',
    de: 'Was eine Nachricht außer Text trägt: Fotos, Alben, Video, Dokumente, Sprache und die entfaltete Vorschau eines Links. Jedes reserviert seine Box, bevor das erste Byte eintrifft, damit der Verlauf nie unter dem Leser springt.',
    ja: 'テキスト以外にメッセージが運ぶもの — 写真、アルバム、動画、書類、音声、そしてリンクの展開プレビュー。いずれも最初の 1 バイトが届く前に自分の箱を確保するので、読み手の下でトランスクリプトが飛び跳ねることはありません。',
    pt: 'O que uma mensagem transporta além de texto: fotos, álbuns, vídeo, documentos, voz e a pré-visualização desdobrada de uma ligação. Todos reservam a sua caixa antes de chegar o primeiro byte, para que o histórico nunca salte sob o leitor.',
    zh: '消息除文字之外承载的内容：照片、相册、视频、文档、语音，以及链接的展开预览。每一种都会在第一个字节到达之前先占好自己的位置，因此消息流永远不会在读者眼下跳动。',
    ar: 'ما تحمله الرسالة إلى جانب النص: الصور والألبومات والفيديو والمستندات والصوت ومعاينة الرابط المنشورة. كلٌّ منها يحجز صندوقه قبل وصول أول بايت، فلا يقفز السجل تحت عين القارئ أبدًا.',
  },

  atAnatomyImage: {
    en: 'The frame’s aspect ratio is computed from the attachment’s intrinsic size and applied to an empty box, so the space the picture will occupy is already occupied before the first byte arrives. The ratio is clamped: a 9:16 screenshot at its true ratio is half a screen of one message, so very tall or very wide pictures crop to a readable frame and mark themselves `data-clamped`.',
    es: 'La relación de aspecto del marco se calcula desde el tamaño intrínseco del adjunto y se aplica a una caja vacía, así el espacio que ocupará la imagen ya está ocupado antes de que llegue el primer byte. La relación se acota: una captura 9:16 a su relación real es media pantalla para un solo mensaje, así que las imágenes muy altas o muy anchas se recortan a un marco legible y se marcan `data-clamped`.',
    fr: 'Le ratio du cadre est calculé depuis la taille intrinsèque de la pièce jointe et appliqué à une boîte vide : l’espace qu’occupera l’image est déjà occupé avant l’arrivée du premier octet. Le ratio est borné : une capture 9:16 à son vrai ratio occupe un demi-écran pour un seul message, donc les images très hautes ou très larges sont recadrées dans un cadre lisible et se marquent `data-clamped`.',
    de: 'Das Seitenverhältnis des Rahmens wird aus der intrinsischen Größe des Anhangs berechnet und auf eine leere Box angewendet, sodass der Platz des Bildes bereits belegt ist, bevor das erste Byte eintrifft. Das Verhältnis wird begrenzt: Ein 9:16-Screenshot im wahren Verhältnis ist ein halber Bildschirm für eine Nachricht, also werden sehr hohe oder sehr breite Bilder auf einen lesbaren Rahmen beschnitten und markieren sich als `data-clamped`.',
    ja: 'フレームの縦横比は添付の実寸から計算され、空の箱に適用されます。だから画像が占める場所は、最初の 1 バイトが届く前にすでに確保されています。比率はクランプされます。9:16 のスクリーンショットを実比率で出すと 1 通で画面の半分を食うため、極端に縦長・横長の画像は読める枠に切り取られ、`data-clamped` を自ら付けます。',
    pt: 'O rácio da moldura é calculado a partir do tamanho intrínseco do anexo e aplicado a uma caixa vazia, pelo que o espaço que a imagem ocupará já está ocupado antes de chegar o primeiro byte. O rácio é limitado: uma captura 9:16 no rácio real é meio ecrã para uma só mensagem, portanto imagens muito altas ou muito largas são recortadas para uma moldura legível e marcam-se com `data-clamped`.',
    zh: '画框的宽高比由附件的固有尺寸算出并施加到一个空盒子上，因此图片将要占据的空间在第一个字节到达之前就已被占好。比例会被夹取：9:16 的截图按真实比例会让一条消息吃掉半个屏幕，所以极高或极宽的图片会裁到可读的画框，并自标 `data-clamped`。',
    ar: 'تُحسب نسبة أبعاد الإطار من المقاس الأصلي للمرفق وتُطبَّق على صندوق فارغ، فيكون المكان الذي ستشغله الصورة محجوزًا قبل وصول أول بايت. النسبة مقيّدة: لقطة 9:16 بنسبتها الحقيقية تلتهم نصف الشاشة لرسالة واحدة، لذا تُقصّ الصور شديدة الطول أو العرض إلى إطار مقروء وتضع على نفسها `data-clamped`.',
  },
  atAnatomyGrid: {
    en: 'The mosaic lives in `imageGridLayout` in @glacier/logic — which tile is where, how many rows, the whole grid’s ratio, and which tile carries the "+N". It is expressed as rows of flex weights rather than a CSS grid because React Native has no grid, and a mosaic that only agrees to within a few points is a mosaic that will drift.',
    es: 'El mosaico vive en `imageGridLayout` de @glacier/logic: qué tesela va dónde, cuántas filas, la relación de la cuadrícula completa y qué tesela lleva el «+N». Se expresa como filas de pesos flex y no como una CSS grid porque React Native no tiene grid, y un mosaico que solo coincide con unos puntos de margen es un mosaico que acabará desviándose.',
    fr: 'La mosaïque vit dans `imageGridLayout` de @glacier/logic — quelle tuile où, combien de rangées, le ratio de la grille entière, et quelle tuile porte le « +N ». Elle s’exprime en rangées de poids flex plutôt qu’en grille CSS car React Native n’a pas de grille, et une mosaïque qui ne concorde qu’à quelques points près finira par diverger.',
    de: 'Das Mosaik lebt in `imageGridLayout` in @glacier/logic — welche Kachel wohin, wie viele Zeilen, das Verhältnis des ganzen Rasters und welche Kachel das „+N“ trägt. Es wird als Zeilen mit Flex-Gewichten ausgedrückt statt als CSS-Grid, weil React Native kein Grid hat, und ein Mosaik, das nur auf ein paar Punkte genau übereinstimmt, driftet irgendwann auseinander.',
    ja: 'モザイクは @glacier/logic の `imageGridLayout` にあります — どのタイルがどこか、何行か、グリッド全体の比率か、どのタイルが「+N」を負うか。CSS グリッドではなく flex 重みの行として表現されます。React Native にグリッドはなく、数ポイントの誤差でしか一致しないモザイクはいずれずれていくからです。',
    pt: 'O mosaico vive em `imageGridLayout` no @glacier/logic — que mosaico vai onde, quantas linhas, o rácio da grelha inteira e qual mosaico leva o «+N». É expresso como linhas de pesos flex e não como uma grelha CSS porque o React Native não tem grelha, e um mosaico que só concorda a poucos pontos acaba por divergir.',
    zh: '这套马赛克规则住在 @glacier/logic 的 `imageGridLayout` 里——哪块瓦片在哪、几行、整个网格的比例、哪块瓦片挂「+N」。它以 flex 权重的行来表达而非 CSS grid，因为 React Native 没有 grid，而只能对齐到几个点误差的马赛克迟早会走样。',
    ar: 'تعيش الفسيفساء في `imageGridLayout` داخل @glacier/logic — أي بلاطة أين، وكم صفًا، ونسبة الشبكة كاملة، وأي بلاطة تحمل «+N». تُعبَّر عنها كصفوف من أوزان flex لا كشبكة CSS، لأن React Native بلا شبكة، والفسيفساء التي تتوافق ضمن بضع نقاط فقط ستنحرف حتمًا.',
  },
  atAnatomyVideo: {
    en: 'The poster frame, how long it runs, and one way to start it. Playback is deliberately out of scope — a design system that ships a `<video>` element ships an opinion about buffering, codecs, and picture-in-picture that no two apps share — so this hands `onPlay` back and stops. The whole frame is the button, not a play triangle floating over a clickable poster: that is two targets for one intent, and the small one is always the one under the thumb.',
    es: 'El fotograma de portada, cuánto dura y una forma de iniciarlo. La reproducción queda fuera de alcance a propósito —un sistema de diseño que entrega un elemento `<video>` entrega una opinión sobre buffering, códecs y picture-in-picture que no comparten dos apps—, así que devuelve `onPlay` y se detiene. Todo el marco es el botón, no un triángulo flotando sobre una portada clicable: eso son dos dianas para una intención, y la pequeña siempre queda bajo el pulgar.',
    fr: 'L’image d’affiche, la durée, et une seule façon de lancer. La lecture est délibérément hors périmètre — un design system qui livre un élément `<video>` livre un avis sur le buffering, les codecs et le picture-in-picture qu’aucune paire d’apps ne partage — donc il rend `onPlay` et s’arrête. Tout le cadre est le bouton, pas un triangle flottant sur une affiche cliquable : cela fait deux cibles pour une intention, et la petite est toujours celle sous le pouce.',
    de: 'Das Posterbild, die Laufzeit und ein Weg, es zu starten. Wiedergabe liegt bewusst außerhalb — ein Designsystem, das ein `<video>`-Element ausliefert, liefert eine Meinung zu Buffering, Codecs und Bild-in-Bild mit, die keine zwei Apps teilen — also gibt es `onPlay` zurück und hört auf. Der ganze Rahmen ist der Button, kein Abspieldreieck über einem klickbaren Poster: das sind zwei Ziele für eine Absicht, und das kleine liegt immer unter dem Daumen.',
    ja: 'ポスターフレーム、再生時間、そして開始する手段が 1 つ。再生自体は意図的に対象外です。`<video>` 要素を配る デザインシステムは、バッファリング・コーデック・ピクチャインピクチャについての意見まで配ることになり、それを共有できるアプリは 2 つとありません。だから `onPlay` を返して終わります。フレーム全体がボタンであり、クリック可能なポスターの上に浮かぶ再生三角ではありません。それは 1 つの意図に 2 つの的であり、親指の下に来るのはいつも小さい方です。',
    pt: 'A imagem de capa, a duração e uma forma de iniciar. A reprodução está deliberadamente fora do âmbito — um design system que entrega um elemento `<video>` entrega uma opinião sobre buffering, codecs e picture-in-picture que nenhumas duas apps partilham — por isso devolve `onPlay` e para. Toda a moldura é o botão, e não um triângulo a flutuar sobre uma capa clicável: isso são dois alvos para uma intenção, e o pequeno é sempre o que fica sob o polegar.',
    zh: '封面帧、片长，以及一个开始播放的入口。播放本身刻意不在范围内——一个交付 `<video>` 元素的设计系统，等于连缓冲、编解码和画中画的主张一起交付，而没有两个应用会共享这些主张——所以它把 `onPlay` 交回去就收手。整个画框就是按钮，而不是漂在可点击封面上的播放三角：那是一个意图配两个靶心，而落在拇指下的永远是小的那个。',
    ar: 'إطار الملصق، ومدة التشغيل، وطريقة واحدة للبدء. التشغيل خارج النطاق عمدًا — فنظام تصميم يشحن عنصر `<video>` يشحن معه رأيًا في التخزين المؤقت والترميز وصورة داخل صورة لا يتشاركه تطبيقان — لذا يعيد `onPlay` ويتوقف. الإطار كله هو الزر، لا مثلث تشغيل يطفو فوق ملصق قابل للنقر: فذلك هدفان لنية واحدة، والصغير منهما هو الذي يقع تحت الإبهام دائمًا.',
  },
  atAnatomyFile: {
    en: 'The name truncates in the *middle*, because the end is the half that identifies the file — `Q3-final-revised-v7.pdf` and `Q3-final-revised-v7.numbers` are the same twenty characters followed by the only difference that matters. It works by letting one run ellipsise while the other is pinned, so it re-truncates at any width with nothing measured. The card is the same height at rest and mid-transfer, so a finishing download does not resize the bubble under the reader.',
    es: 'El nombre se recorta *por el medio*, porque el final es la mitad que identifica el archivo: `Q3-final-revised-v7.pdf` y `Q3-final-revised-v7.numbers` son los mismos veinte caracteres seguidos de la única diferencia que importa. Funciona dejando que un tramo ponga puntos suspensivos mientras el otro queda fijado, así se recorta de nuevo a cualquier ancho sin medir nada. La tarjeta tiene la misma altura en reposo y en transferencia, así una descarga que termina no redimensiona la burbuja bajo el lector.',
    fr: 'Le nom est tronqué *au milieu*, car la fin est la moitié qui identifie le fichier — `Q3-final-revised-v7.pdf` et `Q3-final-revised-v7.numbers` sont les mêmes vingt caractères suivis de la seule différence qui compte. Cela marche en laissant un segment s’ellipser tandis que l’autre est épinglé : il se re-tronque à n’importe quelle largeur sans rien mesurer. La carte a la même hauteur au repos et en cours de transfert, donc un téléchargement qui se termine ne redimensionne pas la bulle sous le lecteur.',
    de: 'Der Name wird in der *Mitte* gekürzt, denn das Ende ist die Hälfte, die die Datei identifiziert — `Q3-final-revised-v7.pdf` und `Q3-final-revised-v7.numbers` sind dieselben zwanzig Zeichen, gefolgt vom einzigen Unterschied, der zählt. Es funktioniert, indem ein Lauf Ellipsen setzt, während der andere angepinnt bleibt: neu gekürzt bei jeder Breite, ohne irgendetwas zu messen. Die Karte ist in Ruhe und während der Übertragung gleich hoch, sodass ein fertig werdender Download die Blase unter dem Leser nicht umformt.',
    ja: '名前は「中央」で切り詰めます。ファイルを識別するのは末尾側だからです — `Q3-final-revised-v7.pdf` と `Q3-final-revised-v7.numbers` は同じ 20 文字のあとに、唯一意味のある差が続きます。片方を省略記号にし、もう片方を固定することで実現しており、何も計測せずどんな幅でも切り詰め直します。カードの高さは静止時と転送中で同じなので、完了したダウンロードが読み手の下で吹き出しをリサイズすることはありません。',
    pt: 'O nome é truncado *ao meio*, porque o fim é a metade que identifica o ficheiro — `Q3-final-revised-v7.pdf` e `Q3-final-revised-v7.numbers` são os mesmos vinte caracteres seguidos da única diferença que importa. Funciona deixando um troço reticenciar enquanto o outro fica fixado, pelo que se volta a truncar em qualquer largura sem medir nada. O cartão tem a mesma altura em repouso e a meio da transferência, portanto um descarregamento que termina não redimensiona o balão sob o leitor.',
    zh: '文件名在「中间」截断，因为识别一个文件靠的是尾部——`Q3-final-revised-v7.pdf` 与 `Q3-final-revised-v7.numbers` 是同样的二十个字符，后面跟着唯一重要的差别。做法是让一段省略而另一段钉住，因此在任何宽度下都会重新截断，且不需要测量任何东西。卡片在静止与传输中高度一致，所以一次完成的下载不会在读者眼下改变气泡尺寸。',
    ar: 'يُبتر الاسم في *المنتصف*، لأن النهاية هي النصف الذي يُعرّف الملف — فـ `Q3-final-revised-v7.pdf` و`Q3-final-revised-v7.numbers` هما العشرون حرفًا نفسها يتبعها الفارق الوحيد المهم. يتحقق ذلك بترك مقطع يُختصر بنقاط بينما يُثبَّت الآخر، فيُعاد البتر عند أي عرض دون قياس شيء. ارتفاع البطاقة واحد في السكون وأثناء النقل، فلا يُغيّر تنزيلٌ ينتهي حجم الفقاعة تحت عين القارئ.',
  },
  atAnatomyVoice: {
    en: '**A thin assembly over `SeekBar`, not a second audio player.** The scrubbing, the keyboard model, the waveform geometry, and the value announcement all already exist in `SeekBar`, and the clock already exists as `formatDuration`. `PlayerCard` is the same three parts arranged as a card with artwork and a transport; this is the bubble-sized sibling, which is why it keeps the same prop names and hands the same props straight through.',
    es: '**Un ensamblaje fino sobre `SeekBar`, no un segundo reproductor de audio.** El arrastre, el modelo de teclado, la geometría de la onda y el anuncio del valor ya existen en `SeekBar`, y el reloj ya existe como `formatDuration`. `PlayerCard` son las mismas tres partes dispuestas como tarjeta con carátula y transporte; esta es la hermana del tamaño de una burbuja, por eso conserva los mismos nombres de props y los pasa tal cual.',
    fr: '**Un assemblage mince au-dessus de `SeekBar`, pas un second lecteur audio.** Le scrubbing, le modèle clavier, la géométrie de la forme d’onde et l’annonce de la valeur existent déjà dans `SeekBar`, et l’horloge existe déjà en `formatDuration`. `PlayerCard`, ce sont les mêmes trois parties disposées en carte avec pochette et transport ; ceci en est la sœur à taille de bulle, d’où les mêmes noms de props transmis tels quels.',
    de: '**Eine dünne Montage über `SeekBar`, kein zweiter Audioplayer.** Scrubbing, Tastaturmodell, Wellenform-Geometrie und Wertansage existieren bereits in `SeekBar`, und die Uhr existiert bereits als `formatDuration`. `PlayerCard` sind dieselben drei Teile als Karte mit Artwork und Transport; dies ist das blasengroße Geschwister, daher dieselben Prop-Namen, direkt durchgereicht.',
    ja: '**`SeekBar` の上に載る薄い組み立てであり、2 つ目のオーディオプレーヤーではありません。** スクラブ、キーボードモデル、波形の幾何、値の読み上げはすべて `SeekBar` にすでにあり、時計も `formatDuration` としてすでにあります。`PlayerCard` は同じ 3 つの部品をアートワークとトランスポート付きのカードに並べたもの。こちらは吹き出しサイズの兄弟なので、prop 名も同じでそのまま渡します。',
    pt: '**Uma montagem fina sobre o `SeekBar`, não um segundo leitor de áudio.** O arrasto, o modelo de teclado, a geometria da onda e o anúncio do valor já existem no `SeekBar`, e o relógio já existe como `formatDuration`. O `PlayerCard` são as mesmas três partes dispostas como cartão com capa e transporte; este é o irmão do tamanho de um balão, daí manter os mesmos nomes de props e passá-los diretamente.',
    zh: '**它是 `SeekBar` 之上一层薄薄的组装，不是第二个音频播放器。** 拖动、键盘模型、波形几何和数值播报都已存在于 `SeekBar`，时钟也已经是 `formatDuration`。`PlayerCard` 是同样三个零件排成带封面和走带控件的卡片；这个是气泡尺寸的同胞，所以沿用同样的 prop 名并原样透传。',
    ar: '**تجميعة رقيقة فوق `SeekBar`، لا مشغّل صوت ثانٍ.** السحب ونموذج لوحة المفاتيح وهندسة الموجة والإعلان عن القيمة كلها موجودة أصلًا في `SeekBar`، والساعة موجودة أصلًا كـ `formatDuration`. و`PlayerCard` هو الأجزاء الثلاثة نفسها مرتبة كبطاقة بغلاف وأدوات نقل؛ وهذا شقيقه بحجم الفقاعة، ولذلك يحتفظ بأسماء الـ props نفسها ويمررها كما هي.',
  },
  atAnatomyLink: {
    en: 'The no-image case decides the design. Reserving the media box anyway leaves a grey slab where the picture was meant to be — a hole that reads as a broken card rather than as a card without a picture — so the layout switches instead: a leading link glyph beside the text, no box at all. It is one link, not a stack of them: the title, the image, and the domain go to the same place, and three tab stops to one destination is three times the work.',
    es: 'El caso sin imagen decide el diseño. Reservar igualmente la caja de medios deja una losa gris donde debía ir la imagen —un agujero que se lee como tarjeta rota, no como tarjeta sin foto—, así que el layout cambia: un glifo de enlace delante del texto y ninguna caja. Es un enlace, no una pila: el título, la imagen y el dominio van al mismo sitio, y tres paradas de tabulación para un destino es triple trabajo.',
    fr: 'Le cas sans image décide du design. Réserver quand même la boîte média laisse une dalle grise là où la photo aurait dû être — un trou qui se lit comme une carte cassée plutôt que comme une carte sans photo — donc la disposition change : un glyphe de lien devant le texte, pas de boîte du tout. C’est un lien, pas une pile : le titre, l’image et le domaine vont au même endroit, et trois arrêts de tabulation pour une destination, c’est trois fois le travail.',
    de: 'Der Fall ohne Bild entscheidet das Design. Die Medienbox trotzdem zu reservieren, hinterlässt eine graue Platte, wo das Bild hätte sein sollen — ein Loch, das wie eine kaputte Karte wirkt statt wie eine Karte ohne Bild — also wechselt stattdessen das Layout: ein führendes Link-Zeichen neben dem Text, gar keine Box. Es ist ein Link, kein Stapel: Titel, Bild und Domain führen an denselben Ort, und drei Tab-Stopps zu einem Ziel sind dreimal die Arbeit.',
    ja: '画像がない場合こそ設計を決めます。それでもメディア枠を確保すると、写真があるはずの場所に灰色の板が残ります — 「写真のないカード」ではなく「壊れたカード」に見える穴です。そこでレイアウト自体を切り替えます。テキストの前にリンク字形を置き、枠は一切なし。これは 1 本のリンクであってリンクの積み重ねではありません。タイトルも画像もドメインも同じ場所へ行くのに、1 つの行き先に 3 つのタブ停止は 3 倍の手間です。',
    pt: 'O caso sem imagem decide o desenho. Reservar a caixa de media mesmo assim deixa uma laje cinzenta onde a imagem devia estar — um buraco que se lê como um cartão partido e não como um cartão sem imagem — por isso o layout muda: um glifo de ligação à frente do texto, caixa nenhuma. É uma ligação, não uma pilha: o título, a imagem e o domínio vão ao mesmo sítio, e três paragens de tabulação para um destino é o triplo do trabalho.',
    zh: '没有图片的情形决定了整体设计。仍然预留媒体框会在本该是图片的位置留下一块灰板——那个洞看起来像卡片坏了，而不像一张没有配图的卡片——所以干脆切换布局：文字前放一个链接字形，完全不留框。它是一条链接而不是一叠链接：标题、图片和域名都通向同一个地方，为一个目的地设三个 Tab 停靠点是三倍的工作量。',
    ar: 'حالة انعدام الصورة هي التي تحسم التصميم. حجز صندوق الوسائط رغم ذلك يترك لوحًا رماديًا حيث كان يُفترض أن تكون الصورة — ثقب يُقرأ كبطاقة معطوبة لا كبطاقة بلا صورة — لذا يتبدّل التخطيط بدلًا من ذلك: رمز رابط في المقدمة إلى جانب النص، وبلا صندوق إطلاقًا. إنه رابط واحد لا كومة روابط: العنوان والصورة والنطاق تذهب جميعها إلى المكان نفسه، وثلاث محطات تنقل لوجهة واحدة تعني ثلاثة أضعاف العمل.',
  },

  atExImageTitle: { en: 'One photo', es: 'Una foto', fr: 'Une photo', de: 'Ein Foto', ja: '写真 1 枚', pt: 'Uma foto', zh: '一张照片', ar: 'صورة واحدة' },
  atExImageDesc: {
    en: 'A landscape photo at its own ratio; a 9:16 portrait clamped to a readable frame (`data-clamped`, for an app that wants to offer "see the whole thing"); and one still loading, already at its final size. Pass `onOpen` and the whole frame becomes a single button.',
    es: 'Una foto apaisada en su propia relación; un retrato 9:16 acotado a un marco legible (`data-clamped`, para una app que quiera ofrecer «ver completa»); y una todavía cargando, ya a su tamaño final. Pasa `onOpen` y todo el marco se convierte en un único botón.',
    fr: 'Une photo paysage à son propre ratio ; un portrait 9:16 borné à un cadre lisible (`data-clamped`, pour une app qui veut proposer « voir en entier ») ; et une encore en cours de chargement, déjà à sa taille finale. Passez `onOpen` et tout le cadre devient un seul bouton.',
    de: 'Ein Querformat im eigenen Verhältnis; ein 9:16-Hochformat, auf einen lesbaren Rahmen begrenzt (`data-clamped`, für eine App, die „ganz anzeigen“ anbieten will); und eines, das noch lädt, bereits in Endgröße. Mit `onOpen` wird der ganze Rahmen zu einem einzigen Button.',
    ja: '自分の比率のままの横長写真、読める枠にクランプされた 9:16 の縦長（`data-clamped`。「全体を見る」を出したいアプリのために）、そして読み込み中でありながらすでに最終サイズのもの。`onOpen` を渡すと、フレーム全体が 1 つのボタンになります。',
    pt: 'Uma foto horizontal no seu próprio rácio; um retrato 9:16 limitado a uma moldura legível (`data-clamped`, para uma app que queira oferecer «ver na íntegra»); e uma ainda a carregar, já no tamanho final. Passe `onOpen` e toda a moldura passa a ser um único botão.',
    zh: '一张按自身比例显示的横向照片；一张被夹到可读画框的 9:16 竖图（带 `data-clamped`，供应用提供「查看完整图」）；以及一张仍在加载、但已占好最终尺寸的图。传入 `onOpen`，整个画框就变成一个按钮。',
    ar: 'صورة أفقية بنسبتها الخاصة؛ وصورة رأسية 9:16 مقيّدة إلى إطار مقروء (`data-clamped`، لتطبيق يريد إتاحة «عرض الصورة كاملة»)؛ وأخرى ما زالت تُحمَّل وهي بالفعل بمقاسها النهائي. مرّر `onOpen` فيصير الإطار كله زرًا واحدًا.',
  },

  atExGridTitle: { en: 'Albums: one, two, three, four, and more', es: 'Álbumes: uno, dos, tres, cuatro y más', fr: 'Albums : un, deux, trois, quatre et plus', de: 'Alben: eins, zwei, drei, vier und mehr', ja: 'アルバム: 1、2、3、4、それ以上', pt: 'Álbuns: um, dois, três, quatro e mais', zh: '相册：一张、两张、三张、四张，以及更多', ar: 'الألبومات: واحدة واثنتان وثلاث وأربع وأكثر' },
  atExGridDesc: {
    en: 'The shape is fixed by the count, so the same album is the same mosaic everywhere: a lone image keeps its own clamped ratio; two sit side by side; an odd count leads with a full-width banner so the pairs below stay square; four is a 2×2. Past four, the 2×2’s last tile carries the "+N" — the tile furthest from the reader’s entry point, so covering it hides the least. The nested big-left/two-stacked-right variant is deliberately not offered: it squeezes a portrait photo into a narrow column where it is mostly crop.',
    es: 'La forma la fija el recuento, así el mismo álbum es el mismo mosaico en todas partes: una imagen sola conserva su relación acotada; dos van lado a lado; un recuento impar empieza con un banner a todo lo ancho para que los pares de abajo queden cuadrados; cuatro es un 2×2. Pasado cuatro, la última tesela del 2×2 lleva el «+N»: la más lejana del punto de entrada del lector, así tapa lo menos posible. La variante anidada de grande-izquierda con dos apiladas a la derecha no se ofrece a propósito: aplasta un retrato en una columna estrecha donde casi todo es recorte.',
    fr: 'La forme est fixée par le nombre, donc le même album donne la même mosaïque partout : une image seule garde son ratio borné ; deux se placent côte à côte ; un nombre impair commence par une bannière pleine largeur pour que les paires du dessous restent carrées ; quatre donnent un 2×2. Au-delà de quatre, la dernière tuile du 2×2 porte le « +N » — la tuile la plus éloignée du point d’entrée du lecteur, donc celle dont la couverture cache le moins. La variante imbriquée grande-à-gauche / deux-empilées-à-droite n’est délibérément pas proposée : elle écrase un portrait dans une colonne étroite où il n’est presque que recadrage.',
    de: 'Die Form ergibt sich aus der Anzahl, sodass dasselbe Album überall dasselbe Mosaik ist: ein einzelnes Bild behält sein begrenztes Verhältnis; zwei stehen nebeneinander; eine ungerade Anzahl beginnt mit einem Banner über die volle Breite, damit die Paare darunter quadratisch bleiben; vier ergeben ein 2×2. Über vier hinaus trägt die letzte Kachel des 2×2 das „+N“ — die Kachel am weitesten vom Einstiegspunkt des Lesers, also die, deren Abdeckung am wenigsten verbirgt. Die verschachtelte Variante groß-links/zwei-gestapelt-rechts wird bewusst nicht angeboten: sie presst ein Hochformat in eine schmale Spalte, in der es fast nur Beschnitt ist.',
    ja: '形は枚数で決まるので、同じアルバムはどこでも同じモザイクになります。1 枚ならクランプされた自身の比率のまま、2 枚は横並び、奇数なら全幅バナーで始めて下のペアを正方形に保ち、4 枚は 2×2。4 枚を超えると 2×2 の最後のタイルが「+N」を負います — 読み手の入口から最も遠いタイルなので、覆っても隠れるものが最も少ないからです。左に大きく右に 2 枚積む入れ子の変種は意図的に提供しません。縦長写真を狭い列に押し込み、ほとんど切り取りになってしまうからです。',
    pt: 'A forma é fixada pela contagem, pelo que o mesmo álbum é o mesmo mosaico em todo o lado: uma imagem sozinha mantém o seu rácio limitado; duas ficam lado a lado; uma contagem ímpar começa com um banner à largura toda para que os pares abaixo fiquem quadrados; quatro formam um 2×2. Acima de quatro, o último mosaico do 2×2 leva o «+N» — o mais distante do ponto de entrada do leitor, portanto o que menos esconde ao ser coberto. A variante aninhada grande-à-esquerda/duas-empilhadas-à-direita não é oferecida de propósito: esmaga um retrato numa coluna estreita onde é quase só recorte.',
    zh: '形状由数量决定，因此同一个相册在任何地方都是同一套马赛克：单张保持自己被夹取的比例；两张并排；奇数张先来一条通栏横幅，好让下面的成对瓦片保持方形；四张是 2×2。超过四张时，2×2 的最后一块瓦片承载「+N」——它离读者的视线入口最远，被盖住时损失最小。刻意不提供「左大右两叠」的嵌套变体：它会把竖图挤进窄列，剩下的几乎全是裁切。',
    ar: 'يحدد العددُ الشكلَ، فيكون الألبوم نفسه هو الفسيفساء نفسها في كل مكان: صورة وحيدة تحتفظ بنسبتها المقيّدة؛ واثنتان جنبًا إلى جنب؛ وعدد فردي يبدأ ببانر بعرض كامل كي تبقى الأزواج تحته مربعة؛ وأربع تصير 2×2. وبعد الأربع، تحمل آخر بلاطة في الـ 2×2 علامة «+N» — وهي الأبعد عن نقطة دخول القارئ، فتغطيتها تُخفي أقل ما يمكن. أما المتغير المتداخل «كبيرة يسارًا واثنتان مكدستان يمينًا» فلا يُقدَّم عمدًا: إذ يعصر الصورة الرأسية في عمود ضيق تصير فيه قصًّا في معظمها.',
  },
  atExGridOne: { en: '1 image', es: '1 imagen', fr: '1 image', de: '1 Bild', ja: '1 枚', pt: '1 imagem', zh: '1 张', ar: 'صورة واحدة' },
  atExGridCount: { en: '{count} images', es: '{count} imágenes', fr: '{count} images', de: '{count} Bilder', ja: '{count} 枚', pt: '{count} imagens', zh: '{count} 张', ar: '{count} صور' },

  atExVideoTitle: { en: 'Video at rest', es: 'Vídeo en reposo', fr: 'Vidéo au repos', de: 'Video im Ruhezustand', ja: '静止状態の動画', pt: 'Vídeo em repouso', zh: '静止状态的视频', ar: 'الفيديو في وضع السكون' },
  atExVideoDesc: {
    en: 'With a poster and a duration badge, and without a poster — where a muted slate says "video" at the same geometry the frame already reserved, rather than leaving a hole. The running time rides along in the button’s accessible name, because it is the other thing a listener decides on.',
    es: 'Con portada e insignia de duración, y sin portada, donde una pizarra apagada dice «vídeo» con la misma geometría que el marco ya reservó, en lugar de dejar un hueco. La duración viaja en el nombre accesible del botón, porque es lo otro sobre lo que decide quien escucha.',
    fr: 'Avec affiche et badge de durée, et sans affiche — où une ardoise sourde dit « vidéo » à la géométrie déjà réservée par le cadre, plutôt que de laisser un trou. La durée voyage dans le nom accessible du bouton, car c’est l’autre élément sur lequel un auditeur décide.',
    de: 'Mit Poster und Dauer-Badge, und ohne Poster — wo eine gedämpfte Tafel „Video“ sagt, in der Geometrie, die der Rahmen bereits reserviert hat, statt ein Loch zu lassen. Die Laufzeit reist im zugänglichen Namen des Buttons mit, denn sie ist das Zweite, worüber ein Hörer entscheidet.',
    ja: 'ポスターと再生時間バッジ付きのもの、そしてポスターなしのもの — 後者では、穴を残す代わりに、フレームがすでに確保したのと同じ寸法で落ち着いた面が「動画」と告げます。再生時間はボタンのアクセシブル名に同乗します。聞き手が判断するもう一つの手掛かりだからです。',
    pt: 'Com capa e emblema de duração, e sem capa — onde uma lousa apagada diz «vídeo» na mesma geometria que a moldura já reservou, em vez de deixar um buraco. A duração viaja no nome acessível do botão, porque é a outra coisa sobre a qual quem ouve decide.',
    zh: '一个带封面和时长徽标，一个没有封面——后者用一块沉静的板在画框已预留的同一几何里写着「视频」，而不是留下一个洞。时长会一起进入按钮的无障碍名称，因为那是听者据以决定的另一件事。',
    ar: 'مع ملصق وشارة مدة، وبدون ملصق — حيث تقول لوحة هادئة «فيديو» بالأبعاد نفسها التي حجزها الإطار سلفًا، بدل ترك ثقب. وتركب المدة في الاسم الميسّر للزر، لأنها الأمر الآخر الذي يقرر المستمع بناءً عليه.',
  },

  atExFileTitle: { en: 'Documents, and the middle truncation', es: 'Documentos y el recorte central', fr: 'Documents et la troncature centrale', de: 'Dokumente und die Kürzung in der Mitte', ja: '書類と中央での切り詰め', pt: 'Documentos e o truncamento ao meio', zh: '文档与中间截断', ar: 'المستندات والبتر في المنتصف' },
  atExFileDesc: {
    en: 'A deliberately long file name in a narrow bubble, so the middle truncation is visible: the extension and the version suffix stay pinned while the head ellipsises. Below it, the same card mid-upload — the progress bar takes the size line’s row rather than a row of its own, so the card does not change height when the transfer finishes. With `href` the action is a real anchor, not a button, because right-click Save As and long-press Share are affordances the OS gives to links for free.',
    es: 'Un nombre de archivo deliberadamente largo en una burbuja estrecha, para que se vea el recorte central: la extensión y el sufijo de versión quedan fijados mientras la cabeza pone puntos suspensivos. Debajo, la misma tarjeta a media subida: la barra de progreso ocupa la fila de la línea de tamaño y no una propia, así la tarjeta no cambia de altura al terminar la transferencia. Con `href` la acción es un ancla real, no un botón, porque «Guardar como» con clic derecho y «Compartir» con pulsación larga son cosas que el sistema regala a los enlaces.',
    fr: 'Un nom de fichier volontairement long dans une bulle étroite, pour rendre la troncature centrale visible : l’extension et le suffixe de version restent épinglés pendant que la tête s’ellipse. Dessous, la même carte en cours d’envoi — la barre de progression occupe la ligne de la taille plutôt qu’une ligne à elle, donc la carte ne change pas de hauteur à la fin du transfert. Avec `href`, l’action est une vraie ancre, pas un bouton, car « Enregistrer sous » au clic droit et « Partager » à l’appui long sont offerts gratuitement aux liens par l’OS.',
    de: 'Ein absichtlich langer Dateiname in einer schmalen Blase, damit die Kürzung in der Mitte sichtbar wird: Endung und Versionssuffix bleiben angepinnt, während der Kopf Ellipsen setzt. Darunter dieselbe Karte mitten im Upload — der Fortschrittsbalken nimmt die Zeile der Größenangabe statt einer eigenen, also ändert die Karte am Ende der Übertragung ihre Höhe nicht. Mit `href` ist die Aktion ein echter Anker, kein Button, denn „Speichern unter“ per Rechtsklick und „Teilen“ per Langdruck schenkt das Betriebssystem nur Links.',
    ja: '狭い吹き出しの中に意図的に長いファイル名を置き、中央での切り詰めを見せています。拡張子とバージョン接尾辞は固定され、先頭が省略記号になります。その下は同じカードのアップロード中 — 進捗バーはサイズ行の位置を借りて自前の行を持たないので、転送完了時にカードの高さは変わりません。`href` を渡すとアクションは本物のアンカーになります。右クリックの「別名で保存」や長押しの「共有」は、OS がリンクにだけ無料で与える機能だからです。',
    pt: 'Um nome de ficheiro deliberadamente longo num balão estreito, para que o truncamento ao meio seja visível: a extensão e o sufixo de versão ficam fixados enquanto a cabeça reticencia. Por baixo, o mesmo cartão a meio do envio — a barra de progresso ocupa a linha do tamanho em vez de uma linha própria, pelo que o cartão não muda de altura quando a transferência termina. Com `href` a ação é uma âncora real, não um botão, porque «Guardar como» com o botão direito e «Partilhar» com pressão longa são coisas que o SO oferece de graça às ligações.',
    zh: '在窄气泡里放一个刻意很长的文件名，好让中间截断可见：扩展名与版本后缀被钉住，头部则省略。下面是同一张卡片正在上传——进度条借用尺寸行的位置而不另占一行，因此传输完成时卡片高度不变。传入 `href` 后该操作是一个真正的锚点而非按钮，因为右键「另存为」和长按「分享」是操作系统只免费给链接的能力。',
    ar: 'اسم ملف طويل عمدًا داخل فقاعة ضيقة، ليظهر البتر في المنتصف: يبقى الامتداد ولاحقة الإصدار مثبتين بينما يُختصر الرأس بنقاط. وتحته البطاقة نفسها أثناء الرفع — يأخذ شريط التقدم سطر الحجم بدل سطر خاص به، فلا يتغير ارتفاع البطاقة عند انتهاء النقل. ومع `href` يصبح الإجراء مرساة حقيقية لا زرًا، لأن «حفظ باسم» بالنقر الأيمن و«مشاركة» بالضغط المطوّل هدايا يمنحها النظام للروابط وحدها.',
  },
  atExFileLabelIdle: { en: 'At rest', es: 'En reposo', fr: 'Au repos', de: 'Im Ruhezustand', ja: '静止時', pt: 'Em repouso', zh: '静止时', ar: 'في السكون' },
  atExFileLabelUploading: { en: 'Uploading, 64%', es: 'Subiendo, 64 %', fr: 'Envoi, 64 %', de: 'Wird hochgeladen, 64 %', ja: 'アップロード中 64%', pt: 'A enviar, 64 %', zh: '上传中，64%', ar: 'جارٍ الرفع، 64٪' },
  atExFileLabelIndeterminate: { en: 'Running, total unknown', es: 'En curso, total desconocido', fr: 'En cours, total inconnu', de: 'Läuft, Gesamtgröße unbekannt', ja: '実行中、総量不明', pt: 'Em curso, total desconhecido', zh: '进行中，总量未知', ar: 'قيد التشغيل، الإجمالي مجهول' },
  atExFileLabelSkeleton: { en: 'Skeleton', es: 'Esqueleto', fr: 'Squelette', de: 'Skelett', ja: 'スケルトン', pt: 'Esqueleto', zh: '骨架', ar: 'هيكل' },

  atExVoiceTitle: { en: 'Voice notes', es: 'Notas de voz', fr: 'Notes vocales', de: 'Sprachnachrichten', ja: 'ボイスメモ', pt: 'Notas de voz', zh: '语音留言', ar: 'الرسائل الصوتية' },
  atExVoiceDesc: {
    en: 'Play/pause, the waveform, and the clock. At rest the readout is the length of the recording — the thing a listener decides on; once it is running it is the position, which is the thing they are tracking. Both are the same width in tabular figures, so the row does not shuffle at the moment playback starts. Two densities, not the player’s three: a bubble is either tight or it is not.',
    es: 'Reproducir/pausar, la onda y el reloj. En reposo la lectura es la duración de la grabación —lo que decide quien escucha—; una vez en marcha es la posición, que es lo que sigue. Ambas tienen el mismo ancho en cifras tabulares, así la fila no se reordena al empezar la reproducción. Dos densidades, no las tres del reproductor: una burbuja o va apretada o no.',
    fr: 'Lecture/pause, la forme d’onde et l’horloge. Au repos, l’affichage est la durée de l’enregistrement — ce sur quoi un auditeur décide ; une fois lancé, c’est la position, ce qu’il suit. Les deux ont la même largeur en chiffres tabulaires, donc la ligne ne se réorganise pas au démarrage. Deux densités, pas les trois du lecteur : une bulle est serrée ou elle ne l’est pas.',
    de: 'Wiedergabe/Pause, die Wellenform und die Uhr. In Ruhe zeigt die Anzeige die Länge der Aufnahme — das, worüber ein Hörer entscheidet; sobald sie läuft, die Position, die er verfolgt. Beide sind in Tabellenziffern gleich breit, also verschiebt sich die Zeile beim Start nicht. Zwei Dichten, nicht die drei des Players: Eine Blase ist eng oder sie ist es nicht.',
    ja: '再生/一時停止、波形、そして時計。静止時の表示は録音の長さ — 聞き手が判断する材料です。再生が始まると位置になり、それが追いかけている値です。どちらも等幅数字で同じ幅なので、再生開始の瞬間に行がずれることはありません。密度はプレーヤーの 3 段階ではなく 2 段階。吹き出しは詰まっているか、いないかのどちらかだからです。',
    pt: 'Reproduzir/pausar, a onda e o relógio. Em repouso a leitura é a duração da gravação — aquilo sobre o qual quem ouve decide; assim que corre, é a posição, que é o que está a seguir. Ambas têm a mesma largura em algarismos tabulares, pelo que a linha não se desloca no momento em que a reprodução começa. Duas densidades, não as três do leitor: um balão ou é apertado ou não é.',
    zh: '播放/暂停、波形和时钟。静止时读数是录音时长——听者据以决定的信息；一旦开始播放就变成播放位置，也就是他们正在跟踪的值。两者用等宽数字，宽度相同，因此开始播放的一瞬行不会抖动。密度只有两档而非播放器的三档：气泡要么紧凑，要么不紧凑。',
    ar: 'تشغيل/إيقاف، والموجة، والساعة. في السكون تعرض القراءة طول التسجيل — وهو ما يقرر المستمع بناءً عليه؛ وحالما يعمل تصبح الموضع، وهو ما يتابعه. كلاهما بالعرض نفسه بأرقام جدولية، فلا يهتز الصف لحظة بدء التشغيل. كثافتان لا ثلاث كما في المشغّل: الفقاعة إما ضيقة أو لا.',
  },
  atExVoiceComfortable: { en: 'Comfortable', es: 'Cómoda', fr: 'Confortable', de: 'Komfortabel', ja: '標準', pt: 'Confortável', zh: '宽松', ar: 'مريح' },
  atExVoiceCompact: { en: 'Compact', es: 'Compacta', fr: 'Compacte', de: 'Kompakt', ja: 'コンパクト', pt: 'Compacta', zh: '紧凑', ar: 'مضغوط' },

  atExLinkTitle: { en: 'Link previews, with and without a picture', es: 'Vistas previas de enlaces, con y sin imagen', fr: 'Aperçus de liens, avec et sans image', de: 'Link-Vorschauen, mit und ohne Bild', ja: 'リンクプレビュー、画像あり・なし', pt: 'Pré-visualizações de ligações, com e sem imagem', zh: '链接预览：有图与无图', ar: 'معاينات الروابط، بصورة وبدونها' },
  atExLinkDesc: {
    en: 'With an og:image the card is a media layout; without one it switches to a compact row with a leading glyph rather than reserving a grey slab where a picture is not coming. Publisher-supplied text can say anything, so the domain line is never optional: it is the reader’s only check on a title that lies.',
    es: 'Con og:image la tarjeta es un layout de medios; sin ella cambia a una fila compacta con un glifo delante en vez de reservar una losa gris para una imagen que no va a llegar. El texto que aporta quien publica puede decir cualquier cosa, así que la línea del dominio nunca es opcional: es la única comprobación que tiene quien lee frente a un título que miente.',
    fr: 'Avec une og:image, la carte adopte la disposition média ; sans, elle bascule en rangée compacte avec un glyphe en tête plutôt que de réserver une dalle grise pour une image qui ne viendra pas. Le texte fourni par l’éditeur peut dire n’importe quoi : la ligne du domaine n’est donc jamais optionnelle, c’est le seul contrôle du lecteur sur un titre qui ment.',
    de: 'Mit einem og:image ist die Karte ein Medien-Layout; ohne wechselt sie zu einer kompakten Zeile mit führendem Zeichen, statt eine graue Platte für ein Bild zu reservieren, das nicht kommt. Vom Herausgeber gelieferter Text kann alles behaupten, also ist die Domain-Zeile nie optional: Sie ist die einzige Kontrolle des Lesers über einen Titel, der lügt.',
    ja: 'og:image があればカードはメディアレイアウトに、なければコンパクトな行に切り替わり、来ない画像のために灰色の板を確保する代わりに先頭へ字形を置きます。発行元が寄こすテキストは何とでも言えるので、ドメイン行は決して省略されません。嘘をつく見出しに対して読み手が持つ唯一の照合手段だからです。',
    pt: 'Com uma og:image o cartão é um layout de media; sem ela muda para uma linha compacta com um glifo à frente em vez de reservar uma laje cinzenta para uma imagem que não vem. O texto fornecido por quem publica pode dizer qualquer coisa, por isso a linha do domínio nunca é opcional: é a única verificação do leitor sobre um título que mente.',
    zh: '有 og:image 时卡片采用媒体布局；没有时切换成带前置字形的紧凑行，而不是为一张不会到来的图片预留灰板。发布方给的文案可以说任何话，因此域名行从不可省：那是读者面对说谎标题时唯一的核对手段。',
    ar: 'مع og:image تكون البطاقة بتخطيط وسائط؛ وبدونها تتحول إلى صف مضغوط برمز في المقدمة بدل حجز لوح رمادي لصورة لن تأتي. النص الذي يقدمه الناشر قد يقول أي شيء، لذا فسطر النطاق ليس اختياريًا أبدًا: إنه تحقق القارئ الوحيد من عنوان يكذب.',
  },
  atLinkCardTitle: {
    en: 'Rows of flex weights, not a CSS grid',
    es: 'Filas de pesos flex, no una CSS grid',
    fr: 'Des rangées de poids flex, pas une grille CSS',
    de: 'Zeilen mit Flex-Gewichten, kein CSS-Grid',
    ja: 'CSS グリッドではなく flex 重みの行',
    pt: 'Linhas de pesos flex, não uma grelha CSS',
    zh: 'flex 权重的行，而不是 CSS grid',
    ar: 'صفوف من أوزان flex لا شبكة CSS',
  },
  atLinkCardDesc: {
    en: 'Why the same album has to be the same mosaic on both platforms, and what happens to the one that only agrees to within a few points.',
    es: 'Por qué el mismo álbum debe ser el mismo mosaico en ambas plataformas, y qué le pasa al que solo coincide con unos pocos puntos de margen.',
    fr: 'Pourquoi le même album doit être la même mosaïque sur les deux plateformes, et ce qu’il advient de celle qui ne concorde qu’à quelques points près.',
    de: 'Warum dasselbe Album auf beiden Plattformen dasselbe Mosaik sein muss, und was mit dem passiert, das nur auf ein paar Punkte genau übereinstimmt.',
    ja: 'なぜ同じアルバムは両プラットフォームで同じモザイクでなければならないのか、そして数ポイントの誤差でしか一致しないものはどうなるのか。',
    pt: 'Porque é que o mesmo álbum tem de ser o mesmo mosaico em ambas as plataformas, e o que acontece ao que só concorda a poucos pontos.',
    zh: '为什么同一个相册在两个平台上必须是同一套马赛克，以及只能对齐到几个点误差的那种会有什么下场。',
    ar: 'لماذا يجب أن يكون الألبوم نفسه هو الفسيفساء نفسها على المنصتين، وما مصير تلك التي لا تتوافق إلا ضمن بضع نقاط.',
  },

  atImageAttachment: { en: 'The attachment being rendered; its width and height reserve the box before the bytes land.', es: 'El adjunto que se renderiza; su ancho y alto reservan la caja antes de que lleguen los bytes.', fr: 'La pièce jointe rendue ; sa largeur et sa hauteur réservent la boîte avant l’arrivée des octets.', de: 'Der gerenderte Anhang; seine Breite und Höhe reservieren die Box, bevor die Bytes eintreffen.', ja: '描画される添付。その幅と高さがバイト到着前に箱を確保します。', pt: 'O anexo a renderizar; a sua largura e altura reservam a caixa antes de os bytes chegarem.', zh: '要渲染的附件；其宽高会在字节到达前先占好盒子。', ar: 'المرفق المعروض؛ عرضه وارتفاعه يحجزان الصندوق قبل وصول البايتات.' },
  atImagePlaceholder: { en: 'A blurhash, thumbhash, or dominant-colour stand-in painted under the image while it decodes. Any node — the kit does not decode hashes, because every app already has the decoder its backend emits for.', es: 'Un blurhash, thumbhash o color dominante pintado bajo la imagen mientras decodifica. Cualquier nodo: el kit no decodifica hashes, porque cada app ya tiene el decodificador que su backend emite.', fr: 'Un blurhash, thumbhash ou couleur dominante peint sous l’image pendant son décodage. N’importe quel nœud — le kit ne décode pas les hachages, car chaque app a déjà le décodeur que son backend produit.', de: 'Ein Blurhash, Thumbhash oder eine dominante Farbe, unter dem Bild gezeichnet, während es dekodiert. Ein beliebiger Knoten — das Kit dekodiert keine Hashes, denn jede App hat bereits den Decoder, für den ihr Backend erzeugt.', ja: 'デコード中に画像の下に描く blurhash・thumbhash・代表色などの代替。任意のノードです。キットはハッシュをデコードしません。各アプリは自分のバックエンドが出す形式のデコーダをすでに持っているからです。', pt: 'Um blurhash, thumbhash ou cor dominante pintado sob a imagem enquanto descodifica. Qualquer nó — o kit não descodifica hashes, porque cada app já tem o descodificador que o seu backend produz.', zh: '解码期间画在图片下方的 blurhash、thumbhash 或主色占位。可以是任意节点——套件不解码 hash，因为每个应用都已经有与自家后端匹配的解码器。', ar: 'بديل من نوع blurhash أو thumbhash أو لون سائد يُرسم تحت الصورة أثناء فك ترميزها. أي عقدة — فالمجموعة لا تفك ترميز التجزئات، لأن كل تطبيق يملك أصلًا فاكّ الترميز الذي تُصدر له خلفيته.' },
  atImageFill: { en: 'Fills the parent box instead of reserving its own. How a grid tile places it.', es: 'Rellena la caja del padre en vez de reservar la suya. Así lo coloca una tesela de la cuadrícula.', fr: 'Remplit la boîte parente au lieu de réserver la sienne. C’est ainsi qu’une tuile la place.', de: 'Füllt die Elternbox, statt eine eigene zu reservieren. So platziert eine Rasterkachel es.', ja: '自前の箱を確保せず親の箱を埋めます。グリッドのタイルはこの方法で配置します。', pt: 'Preenche a caixa do pai em vez de reservar a sua. É assim que um mosaico da grelha a coloca.', zh: '填满父级盒子而不自留一个。网格瓦片就是这样放置它的。', ar: 'يملأ صندوق الأب بدل حجز صندوق خاص به. هكذا تضعه بلاطة الشبكة.' },
  atImageOnOpen: { en: 'Opens the photo full size. Given, the whole frame becomes one button and the image drops its own alt so the name is not announced twice.', es: 'Abre la foto a tamaño completo. Si se da, todo el marco se vuelve un botón y la imagen suelta su propio alt para que el nombre no se anuncie dos veces.', fr: 'Ouvre la photo en taille réelle. Fourni, tout le cadre devient un bouton et l’image abandonne son alt pour que le nom ne soit pas annoncé deux fois.', de: 'Öffnet das Foto in voller Größe. Wenn gesetzt, wird der ganze Rahmen zu einem Button und das Bild gibt sein eigenes alt ab, damit der Name nicht zweimal angesagt wird.', ja: '写真を原寸で開きます。渡すとフレーム全体が 1 つのボタンになり、名前が二度読まれないよう画像は自分の alt を手放します。', pt: 'Abre a foto em tamanho real. Se fornecido, toda a moldura passa a ser um botão e a imagem larga o seu próprio alt para o nome não ser anunciado duas vezes.', zh: '以原始尺寸打开照片。传入后整个画框变成一个按钮，图片会放弃自己的 alt，以免名称被读两遍。', ar: 'يفتح الصورة بالحجم الكامل. عند تمريره يصير الإطار كله زرًا وتتخلى الصورة عن alt الخاص بها كي لا يُعلَن الاسم مرتين.' },
  atImageMaxWidth: { en: 'Caps the frame width, e.g. a bubble’s content width.', es: 'Limita el ancho del marco, p. ej. el ancho de contenido de una burbuja.', fr: 'Plafonne la largeur du cadre, p. ex. la largeur de contenu d’une bulle.', de: 'Begrenzt die Rahmenbreite, z. B. auf die Inhaltsbreite einer Blase.', ja: 'フレーム幅の上限。たとえば吹き出しのコンテンツ幅。', pt: 'Limita a largura da moldura, p. ex. a largura de conteúdo de um balão.', zh: '限制画框宽度，例如气泡的内容宽度。', ar: 'يحدّ عرض الإطار، مثل عرض محتوى الفقاعة.' },
  atImageLoading: { en: 'The bytes are still on their way; the box is already at its final size.', es: 'Los bytes todavía vienen en camino; la caja ya está en su tamaño final.', fr: 'Les octets sont encore en route ; la boîte est déjà à sa taille finale.', de: 'Die Bytes sind noch unterwegs; die Box hat bereits ihre Endgröße.', ja: 'バイトはまだ到着途中ですが、箱はすでに最終サイズです。', pt: 'Os bytes ainda vêm a caminho; a caixa já está no tamanho final.', zh: '字节还在路上，但盒子已经是最终尺寸。', ar: 'البايتات ما زالت في الطريق؛ والصندوق بمقاسه النهائي بالفعل.' },

  atImageAlt: { en: 'What the sender said the picture is.', es: 'Lo que quien envía dijo que es la imagen.', fr: 'Ce que l’expéditeur a dit que représente l’image.', de: 'Was der Absender sagt, dass das Bild zeigt.', ja: '送信者が説明した画像の内容。', pt: 'O que quem envia disse que a imagem é.', zh: '发送者对这张图片的描述。', ar: 'ما قاله المُرسل عن محتوى الصورة.' },
  atImageRadius: { en: 'Corner radius of the frame. A grid tile passes `none`, because the album rounds its outer edge once.', es: 'Radio de esquina del marco. Una tesela pasa `none`, porque el álbum redondea su borde exterior una sola vez.', fr: 'Rayon des coins du cadre. Une tuile passe `none`, car l’album arrondit son bord extérieur une seule fois.', de: 'Eckenradius des Rahmens. Eine Rasterkachel übergibt `none`, denn das Album rundet seine Außenkante einmal.', ja: 'フレームの角丸。グリッドのタイルは `none` を渡します。アルバムが外周を一度だけ丸めるからです。', pt: 'Raio dos cantos da moldura. Um mosaico passa `none`, porque o álbum arredonda o bordo exterior uma só vez.', zh: '画框的圆角半径。网格瓦片传 `none`，因为相册只在外缘圆角一次。', ar: 'نصف قطر زوايا الإطار. تمرّر بلاطة الشبكة `none`، لأن الألبوم يدوّر حافته الخارجية مرة واحدة.' },
  atLinkTitleProp: { en: 'The unfurled title. When it is a plain string it also becomes the first half of the card’s accessible name.', es: 'El título desplegado. Si es una cadena simple, también es la primera mitad del nombre accesible de la tarjeta.', fr: 'Le titre déplié. Quand c’est une chaîne simple, il devient aussi la première moitié du nom accessible de la carte.', de: 'Der entfaltete Titel. Ist er ein einfacher String, wird er auch zur ersten Hälfte des zugänglichen Namens der Karte.', ja: '展開されたタイトル。単純な文字列の場合は、カードのアクセシブル名の前半にもなります。', pt: 'O título desdobrado. Quando é uma cadeia simples, torna-se também a primeira metade do nome acessível do cartão.', zh: '展开得到的标题。若为纯字符串，它同时成为卡片无障碍名称的前半部分。', ar: 'العنوان المستخرج. عندما يكون نصًا بسيطًا يصير أيضًا النصف الأول من الاسم الميسّر للبطاقة.' },
  atLinkDescriptionProp: { en: 'The unfurled summary, under the title. The domain line is always rendered beneath it, whatever the publisher supplied.', es: 'El resumen desplegado, bajo el título. La línea del dominio siempre se renderiza debajo, diga lo que diga quien publica.', fr: 'Le résumé déplié, sous le titre. La ligne du domaine est toujours rendue en dessous, quoi qu’ait fourni l’éditeur.', de: 'Die entfaltete Zusammenfassung unter dem Titel. Die Domain-Zeile wird immer darunter gerendert, was der Herausgeber auch liefert.', ja: 'タイトルの下に置く展開された要約。発行元が何を寄こそうと、ドメイン行はその下に必ず描画されます。', pt: 'O resumo desdobrado, sob o título. A linha do domínio é sempre renderizada por baixo, seja qual for o que quem publica forneceu.', zh: '标题下方展开得到的摘要。无论发布方提供什么，域名行始终渲染在其下。', ar: 'الملخص المستخرج أسفل العنوان. ويُعرض سطر النطاق تحته دائمًا مهما قدّم الناشر.' },
  atGridImages: { en: 'The album, in send order.', es: 'El álbum, en orden de envío.', fr: 'L’album, dans l’ordre d’envoi.', de: 'Das Album, in Sendereihenfolge.', ja: 'アルバム。送信順。', pt: 'O álbum, por ordem de envio.', zh: '相册，按发送顺序。', ar: 'الألبوم، بترتيب الإرسال.' },
  atGridAlts: { en: 'Per-image alt text, positionally matched to `images`.', es: 'Texto alternativo por imagen, emparejado por posición con `images`.', fr: 'Texte alternatif par image, apparié par position à `images`.', de: 'Alt-Text je Bild, positionsgleich zu `images`.', ja: '画像ごとの alt テキスト。`images` と位置で対応します。', pt: 'Texto alternativo por imagem, correspondido por posição a `images`.', zh: '逐图的 alt 文本，按位置与 `images` 对应。', ar: 'نص بديل لكل صورة، مطابق موضعيًا لـ `images`.' },
  atGridMax: { en: 'How many tiles before the rest collapse into the count. Defaults to four.', es: 'Cuántas teselas antes de que el resto se colapse en el recuento. Por defecto, cuatro.', fr: 'Combien de tuiles avant que le reste ne se réduise au compteur. Quatre par défaut.', de: 'Wie viele Kacheln, bevor der Rest zur Zählung zusammenklappt. Standard vier.', ja: '残りが件数に畳まれるまでのタイル数。既定は 4。', pt: 'Quantos mosaicos antes de o resto colapsar na contagem. Por omissão, quatro.', zh: '在其余项折叠成计数之前显示多少块瓦片。默认四块。', ar: 'كم بلاطة قبل أن ينهار الباقي إلى العدد. الافتراضي أربع.' },
  atGridOnOpen: { en: 'Called with the attachment and its index when a tile is activated.', es: 'Se llama con el adjunto y su índice al activar una tesela.', fr: 'Appelé avec la pièce jointe et son index quand une tuile est activée.', de: 'Wird mit dem Anhang und seinem Index aufgerufen, wenn eine Kachel aktiviert wird.', ja: 'タイルが押されたとき、添付とそのインデックスを伴って呼ばれます。', pt: 'Chamado com o anexo e o seu índice quando um mosaico é ativado.', zh: '瓦片被激活时调用，带上附件及其索引。', ar: 'يُستدعى مع المرفق وفهرسه عند تفعيل بلاطة.' },

  atVideoPoster: { en: 'Poster frame URL. Without one, a muted slate stands in at the same geometry.', es: 'URL del fotograma de portada. Sin ella, una pizarra apagada ocupa la misma geometría.', fr: 'URL de l’image d’affiche. Sans elle, une ardoise sourde occupe la même géométrie.', de: 'URL des Posterbilds. Ohne eines steht eine gedämpfte Tafel in derselben Geometrie ein.', ja: 'ポスターフレームの URL。ない場合は落ち着いた面が同じ寸法で代役を務めます。', pt: 'URL da imagem de capa. Sem ela, uma lousa apagada ocupa a mesma geometria.', zh: '封面帧 URL。没有时由一块沉静的板在相同几何里顶替。', ar: 'رابط إطار الملصق. بدونه تحل لوحة هادئة محله بالأبعاد نفسها.' },
  atVideoOnPlay: { en: 'Called when the play affordance is activated. Playback itself is the app’s.', es: 'Se llama al activar la reproducción. La reproducción en sí es de la app.', fr: 'Appelé quand l’affordance de lecture est activée. La lecture elle-même appartient à l’app.', de: 'Wird aufgerufen, wenn die Abspiel-Affordanz aktiviert wird. Die Wiedergabe selbst gehört der App.', ja: '再生の操作が押されたときに呼ばれます。再生そのものはアプリの仕事です。', pt: 'Chamado quando a affordance de reprodução é ativada. A reprodução em si é da app.', zh: '播放入口被激活时调用。播放本身归应用负责。', ar: 'يُستدعى عند تفعيل عنصر التشغيل. أما التشغيل نفسه فمن مسؤولية التطبيق.' },
  atVideoBadge: { en: 'Which bottom corner the duration badge sits in.', es: 'En qué esquina inferior se sitúa la insignia de duración.', fr: 'Dans quel coin inférieur se place le badge de durée.', de: 'In welcher unteren Ecke das Dauer-Badge sitzt.', ja: '再生時間バッジを置く下側の角。', pt: 'Em que canto inferior fica o emblema de duração.', zh: '时长徽标位于哪个下角。', ar: 'في أي زاوية سفلية تجلس شارة المدة.' },
  atVideoFormatTime: { en: 'Formats the badge. Defaults to m:ss, or h:mm:ss past an hour.', es: 'Formatea la insignia. Por defecto m:ss, o h:mm:ss pasada una hora.', fr: 'Formate le badge. Par défaut m:ss, ou h:mm:ss au-delà d’une heure.', de: 'Formatiert das Badge. Standard m:ss, ab einer Stunde h:mm:ss.', ja: 'バッジの書式。既定は m:ss、1 時間を超えると h:mm:ss。', pt: 'Formata o emblema. Por omissão m:ss, ou h:mm:ss acima de uma hora.', zh: '格式化徽标。默认 m:ss，超过一小时用 h:mm:ss。', ar: 'ينسّق الشارة. الافتراضي m:ss، أو h:mm:ss بعد الساعة.' },

  atFileAttachment: { en: 'The attachment: its file name, mime type, and byte size. The glyph family is decided from the mime type, falling back to the extension.', es: 'El adjunto: nombre de archivo, tipo mime y tamaño en bytes. La familia de glifo se decide por el tipo mime, con la extensión como respaldo.', fr: 'La pièce jointe : nom de fichier, type mime et taille en octets. La famille de glyphe est décidée par le type mime, avec repli sur l’extension.', de: 'Der Anhang: Dateiname, MIME-Typ und Bytegröße. Die Zeichenfamilie entscheidet der MIME-Typ, ersatzweise die Endung.', ja: '添付そのもの: ファイル名、MIME タイプ、バイトサイズ。字形のファミリーは MIME タイプから決まり、なければ拡張子で判断します。', pt: 'O anexo: nome do ficheiro, tipo mime e tamanho em bytes. A família do glifo é decidida pelo tipo mime, recorrendo à extensão.', zh: '附件本身：文件名、MIME 类型和字节大小。字形族由 MIME 类型决定，回退到扩展名。', ar: 'المرفق: اسم الملف ونوع mime وحجمه بالبايت. تُحدَّد عائلة الرمز من نوع mime، مع الرجوع إلى الامتداد.' },
  atFileProgress: { en: 'Transfer progress as a fraction from 0 to 1. Set, the card is in progress and the bar takes the size line’s row.', es: 'Progreso de transferencia como fracción de 0 a 1. Si se pone, la tarjeta está en curso y la barra ocupa la fila de la línea de tamaño.', fr: 'Progression du transfert, fraction de 0 à 1. Renseigné, la carte est en cours et la barre occupe la ligne de la taille.', de: 'Übertragungsfortschritt als Bruch von 0 bis 1. Gesetzt, läuft die Karte und der Balken nimmt die Zeile der Größenangabe.', ja: '転送の進捗を 0〜1 の割合で。指定するとカードは進行中になり、バーがサイズ行の位置を取ります。', pt: 'Progresso da transferência como fração de 0 a 1. Definido, o cartão está em curso e a barra ocupa a linha do tamanho.', zh: '传输进度，取值 0 到 1 的分数。设置后卡片进入进行中状态，进度条占据尺寸行的位置。', ar: 'تقدم النقل ككسر من 0 إلى 1. عند ضبطه تكون البطاقة قيد التنفيذ ويأخذ الشريط سطر الحجم.' },
  atFileIndeterminate: { en: 'A transfer is running but its total is unknown.', es: 'Hay una transferencia en curso pero se desconoce su total.', fr: 'Un transfert est en cours mais son total est inconnu.', de: 'Eine Übertragung läuft, ihre Gesamtgröße ist aber unbekannt.', ja: '転送は動いているが総量が不明。', pt: 'Uma transferência está a decorrer mas o seu total é desconhecido.', zh: '传输正在进行，但总量未知。', ar: 'هناك نقل جارٍ لكن إجماليه مجهول.' },
  atFileHref: { en: 'Renders the action as a real download link rather than a button, so right-click Save As and long-press Share keep working.', es: 'Renderiza la acción como un enlace de descarga real y no un botón, para que «Guardar como» y «Compartir» sigan funcionando.', fr: 'Rend l’action comme un vrai lien de téléchargement plutôt qu’un bouton, pour que « Enregistrer sous » et « Partager » continuent de fonctionner.', de: 'Rendert die Aktion als echten Download-Link statt als Button, damit „Speichern unter“ und „Teilen“ weiter funktionieren.', ja: 'アクションをボタンではなく本物のダウンロードリンクとして描画し、「別名で保存」や「共有」が使えるようにします。', pt: 'Renderiza a ação como uma verdadeira ligação de descarregamento em vez de um botão, para que «Guardar como» e «Partilhar» continuem a funcionar.', zh: '把该操作渲染为真正的下载链接而非按钮，使「另存为」和「分享」继续可用。', ar: 'يعرض الإجراء كرابط تنزيل حقيقي لا كزر، كي يظل «حفظ باسم» و«مشاركة» يعملان.' },
  atFileOnCancel: { en: 'Called when a running transfer is cancelled. While transferring, cancel replaces download.', es: 'Se llama al cancelar una transferencia en curso. Mientras se transfiere, cancelar sustituye a descargar.', fr: 'Appelé quand un transfert en cours est annulé. Pendant le transfert, annuler remplace télécharger.', de: 'Wird aufgerufen, wenn eine laufende Übertragung abgebrochen wird. Während der Übertragung ersetzt Abbrechen das Herunterladen.', ja: '進行中の転送がキャンセルされたときに呼ばれます。転送中はキャンセルがダウンロードに置き換わります。', pt: 'Chamado quando uma transferência em curso é cancelada. Durante a transferência, cancelar substitui descarregar.', zh: '取消进行中的传输时调用。传输期间，取消会取代下载。', ar: 'يُستدعى عند إلغاء نقل جارٍ. وأثناء النقل يحل الإلغاء محل التنزيل.' },
  atFileSkeleton: { en: 'Renders a placeholder with the card’s exact geometry.', es: 'Renderiza un marcador con la geometría exacta de la tarjeta.', fr: 'Rend un substitut avec la géométrie exacte de la carte.', de: 'Rendert einen Platzhalter mit der exakten Geometrie der Karte.', ja: 'カードとまったく同じ寸法のプレースホルダーを描画します。', pt: 'Renderiza um marcador com a geometria exata do cartão.', zh: '渲染与卡片几何完全一致的占位。', ar: 'يعرض عنصرًا نائبًا بأبعاد البطاقة نفسها بالضبط.' },

  atVoiceDuration: { en: 'Recording length in seconds.', es: 'Duración de la grabación en segundos.', fr: 'Durée de l’enregistrement en secondes.', de: 'Aufnahmelänge in Sekunden.', ja: '録音の長さ（秒）。', pt: 'Duração da gravação em segundos.', zh: '录音时长（秒）。', ar: 'طول التسجيل بالثواني.' },
  atVoiceLevels: { en: 'The recorded waveform; without it the bar draws an even swell. Forwarded straight to `SeekBar`.', es: 'La onda grabada; sin ella la barra dibuja una ondulación uniforme. Se pasa tal cual a `SeekBar`.', fr: 'La forme d’onde enregistrée ; sans elle, la barre dessine une houle régulière. Transmise telle quelle à `SeekBar`.', de: 'Die aufgezeichnete Wellenform; ohne sie zeichnet die Leiste eine gleichmäßige Welle. Direkt an `SeekBar` durchgereicht.', ja: '録音された波形。なければバーは均一なうねりを描きます。そのまま `SeekBar` に渡されます。', pt: 'A onda gravada; sem ela a barra desenha uma ondulação uniforme. Passada diretamente ao `SeekBar`.', zh: '录制的波形；没有时进度条画出均匀起伏。原样透传给 `SeekBar`。', ar: 'الموجة المسجلة؛ وبدونها يرسم الشريط تموجًا منتظمًا. تُمرَّر مباشرة إلى `SeekBar`.' },
  atVoiceValue: { en: 'Controlled playhead position in seconds; `onValueChange` fires while scrubbing and `onSeekEnd` when the drag lands.', es: 'Posición del cabezal controlada en segundos; `onValueChange` se dispara al arrastrar y `onSeekEnd` al soltar.', fr: 'Position contrôlée de la tête de lecture en secondes ; `onValueChange` se déclenche pendant le scrubbing et `onSeekEnd` à la fin du glissement.', de: 'Kontrollierte Abspielposition in Sekunden; `onValueChange` feuert beim Scrubben, `onSeekEnd` beim Loslassen.', ja: '再生ヘッド位置（秒）の制御値。スクラブ中は `onValueChange`、ドラッグ終了時に `onSeekEnd` が発火します。', pt: 'Posição controlada do cursor em segundos; `onValueChange` dispara ao arrastar e `onSeekEnd` quando o arrasto termina.', zh: '受控播放头位置（秒）；拖动过程中触发 `onValueChange`，拖动结束时触发 `onSeekEnd`。', ar: 'موضع رأس التشغيل المتحكَّم فيه بالثواني؛ يُطلق `onValueChange` أثناء السحب و`onSeekEnd` عند انتهائه.' },
  atVoicePlaying: { en: 'Controlled play state. One button whose label changes, not two that swap, so focus survives the toggle.', es: 'Estado de reproducción controlado. Un botón cuya etiqueta cambia, no dos que se intercambian, así el foco sobrevive al alternar.', fr: 'État de lecture contrôlé. Un seul bouton dont le libellé change, pas deux qui s’échangent, pour que le focus survive au basculement.', de: 'Kontrollierter Abspielzustand. Ein Button, dessen Beschriftung wechselt, nicht zwei, die getauscht werden, damit der Fokus das Umschalten überlebt.', ja: '再生状態の制御値。入れ替わる 2 つのボタンではなく、ラベルが変わる 1 つのボタンなので、切り替えてもフォーカスが残ります。', pt: 'Estado de reprodução controlado. Um botão cuja etiqueta muda, não dois que se trocam, para que o foco sobreviva à alternância.', zh: '受控播放状态。是一个会换标签的按钮，而不是两个互相替换的按钮，因此切换后焦点不丢。', ar: 'حالة التشغيل المتحكَّم فيها. زر واحد يتغير تصنيفه، لا زران يتبادلان، كي ينجو التركيز من التبديل.' },
  atVoiceDensity: { en: 'Two steps, not the player’s three: a bubble is either tight or it is not.', es: 'Dos pasos, no los tres del reproductor: una burbuja o va apretada o no.', fr: 'Deux crans, pas les trois du lecteur : une bulle est serrée ou elle ne l’est pas.', de: 'Zwei Stufen, nicht die drei des Players: Eine Blase ist eng oder sie ist es nicht.', ja: 'プレーヤーの 3 段階ではなく 2 段階。吹き出しは詰まっているか、いないかです。', pt: 'Dois níveis, não os três do leitor: um balão ou é apertado ou não é.', zh: '只有两档，而非播放器的三档：气泡要么紧凑，要么不紧凑。', ar: 'درجتان لا ثلاث كما في المشغّل: الفقاعة إما ضيقة أو لا.' },
  atVoiceShape: { en: 'Forwarded to the seek bar, alongside `tone` and `rail`.', es: 'Se pasa a la barra de búsqueda, junto con `tone` y `rail`.', fr: 'Transmis à la barre de lecture, avec `tone` et `rail`.', de: 'An die Seek-Leiste durchgereicht, zusammen mit `tone` und `rail`.', ja: '`tone` や `rail` とともにシークバーへ渡されます。', pt: 'Passado à barra de procura, juntamente com `tone` e `rail`.', zh: '与 `tone`、`rail` 一起透传给进度条。', ar: 'يُمرَّر إلى شريط التقديم مع `tone` و`rail`.' },

  atLinkUrl: { en: 'Where the card goes, and what the domain line is derived from.', es: 'Adónde va la tarjeta y de dónde se deriva la línea del dominio.', fr: 'Où va la carte, et d’où est dérivée la ligne du domaine.', de: 'Wohin die Karte führt und woraus die Domain-Zeile abgeleitet wird.', ja: 'カードの行き先であり、ドメイン行の導出元。', pt: 'Para onde vai o cartão, e de onde deriva a linha do domínio.', zh: '卡片的目的地，也是域名行的来源。', ar: 'وجهة البطاقة، ومصدر اشتقاق سطر النطاق.' },
  atLinkImage: { en: 'og:image URL. Omitted, the card drops to the compact layout rather than reserving an empty media box.', es: 'URL de og:image. Si se omite, la tarjeta pasa al layout compacto en vez de reservar una caja de medios vacía.', fr: 'URL de l’og:image. Omise, la carte bascule en disposition compacte au lieu de réserver une boîte média vide.', de: 'og:image-URL. Weggelassen, fällt die Karte auf das kompakte Layout zurück, statt eine leere Medienbox zu reservieren.', ja: 'og:image の URL。省略するとカードは空のメディア枠を確保せず、コンパクトレイアウトに落ちます。', pt: 'URL da og:image. Omitida, o cartão passa ao layout compacto em vez de reservar uma caixa de media vazia.', zh: 'og:image 的 URL。省略时卡片会退到紧凑布局，而不是预留一个空媒体框。', ar: 'رابط og:image. عند إغفاله تنتقل البطاقة إلى التخطيط المضغوط بدل حجز صندوق وسائط فارغ.' },
  atLinkLayout: { en: 'Overrides the layout the presence of an image would pick.', es: 'Sobrescribe el layout que elegiría la presencia de una imagen.', fr: 'Remplace la disposition que la présence d’une image choisirait.', de: 'Überschreibt das Layout, das die Anwesenheit eines Bildes wählen würde.', ja: '画像の有無から選ばれるレイアウトを上書きします。', pt: 'Substitui o layout que a presença de uma imagem escolheria.', zh: '覆盖由是否存在图片所决定的布局。', ar: 'يتجاوز التخطيط الذي كان وجود صورة سيختاره.' },
  atLinkSkeleton: { en: 'Renders a placeholder while the unfurl is being fetched.', es: 'Renderiza un marcador mientras se obtiene el desplegado.', fr: 'Rend un substitut pendant la récupération de l’aperçu.', de: 'Rendert einen Platzhalter, während die Vorschau geholt wird.', ja: '展開情報を取得している間、プレースホルダーを描画します。', pt: 'Renderiza um marcador enquanto o desdobramento é obtido.', zh: '在抓取展开信息期间渲染占位。', ar: 'يعرض عنصرًا نائبًا أثناء جلب المعاينة.' },

  atA11y1: {
    en: 'An album is one labelled `group` — "4 photos" — so a screen reader announces the set before walking into it, rather than reading four unrelated images in a row.',
    es: 'Un álbum es un `group` etiquetado —«4 fotos»—, así un lector de pantalla anuncia el conjunto antes de entrar en él en vez de leer cuatro imágenes sueltas seguidas.',
    fr: 'Un album est un `group` étiqueté — « 4 photos » — pour qu’un lecteur d’écran annonce l’ensemble avant d’y entrer, plutôt que de lire quatre images sans lien à la suite.',
    de: 'Ein Album ist eine beschriftete `group` — „4 Fotos“ —, damit ein Screenreader den Satz ankündigt, bevor er hineingeht, statt vier zusammenhanglose Bilder hintereinander zu lesen.',
    ja: 'アルバムはラベル付きの `group` 一つ（「写真 4 枚」）です。スクリーンリーダーは中に入る前にまとまりを告げるので、無関係な画像 4 枚を続けて読むことになりません。',
    pt: 'Um álbum é um `group` rotulado — «4 fotos» — para que um leitor de ecrã anuncie o conjunto antes de entrar nele, em vez de ler quatro imagens sem relação seguidas.',
    zh: '相册是一个带标签的 `group`——「4 张照片」——因此屏幕阅读器会先宣布这一组再进入，而不是连读四张互不相干的图片。',
    ar: 'الألبوم هو `group` معنون واحد — «4 صور» — كي يعلن قارئ الشاشة عن المجموعة قبل الدخول إليها، بدل قراءة أربع صور غير مترابطة تباعًا.',
  },
  atA11y2: {
    en: 'The overflow tile announces the count it hides ("2 more photos"), not the one photo peeking out from under it. The visible "+2" badge is `aria-hidden`, because hearing it after the name is the same fact twice.',
    es: 'La tesela de desbordamiento anuncia el recuento que oculta («2 fotos más»), no la foto que asoma debajo. La insignia visible «+2» es `aria-hidden`, porque oírla tras el nombre es el mismo dato dos veces.',
    fr: 'La tuile de débordement annonce le nombre qu’elle cache (« 2 photos de plus »), pas la photo qui dépasse dessous. Le badge visible « +2 » est `aria-hidden`, car l’entendre après le nom, c’est deux fois le même fait.',
    de: 'Die Überlauf-Kachel kündigt die Anzahl an, die sie verbirgt („2 weitere Fotos“), nicht das eine Foto, das darunter hervorlugt. Das sichtbare „+2“-Badge ist `aria-hidden`, denn es nach dem Namen zu hören, ist derselbe Fakt zweimal.',
    ja: 'オーバーフローのタイルは、下からのぞく 1 枚ではなく、自分が隠している枚数（「他 2 枚」）を告げます。見える「+2」バッジは `aria-hidden` です。名前のあとにそれを聞くのは同じ事実の二度読みだからです。',
    pt: 'O mosaico de transbordo anuncia a contagem que esconde («mais 2 fotos»), não a foto que espreita por baixo. O emblema visível «+2» é `aria-hidden`, porque ouvi-lo depois do nome é o mesmo facto duas vezes.',
    zh: '溢出瓦片播报的是它藏起来的数量（「另外 2 张照片」），而不是从下面露出的那一张。可见的「+2」徽标是 `aria-hidden`，因为在名称之后再听一遍是同一事实的重复。',
    ar: 'تعلن بلاطة الفائض عن العدد الذي تخفيه («صورتان إضافيتان») لا عن الصورة المطلة من تحتها. أما شارة «+2» المرئية فهي `aria-hidden`، لأن سماعها بعد الاسم تكرار للحقيقة نفسها.',
  },
  atA11y3: {
    en: 'A video button is named by what will happen and to what — "Play beach-sunset.mp4, 1:24" — so a transcript of five videos is not five buttons called "Play". The visible duration badge is decorative, because it is already folded into that name.',
    es: 'Un botón de vídeo se nombra por lo que va a pasar y a qué —«Reproducir beach-sunset.mp4, 1:24»—, así un historial de cinco vídeos no son cinco botones llamados «Reproducir». La insignia de duración visible es decorativa, porque ya va incluida en ese nombre.',
    fr: 'Un bouton vidéo est nommé par ce qui va se passer et sur quoi — « Lire beach-sunset.mp4, 1:24 » — pour qu’une transcription de cinq vidéos ne soit pas cinq boutons nommés « Lire ». Le badge de durée visible est décoratif, puisqu’il est déjà intégré à ce nom.',
    de: 'Ein Video-Button wird danach benannt, was passieren wird und womit — „beach-sunset.mp4 abspielen, 1:24“ —, damit ein Verlauf mit fünf Videos nicht fünf Buttons namens „Abspielen“ ist. Das sichtbare Dauer-Badge ist dekorativ, denn es steckt bereits in diesem Namen.',
    ja: '動画ボタンは「何がどれに起こるか」で命名されます（「beach-sunset.mp4 を再生、1:24」）。だから動画 5 本のトランスクリプトが「再生」という名のボタン 5 つになりません。見える再生時間バッジは装飾です。すでにその名前に折り込まれているからです。',
    pt: 'Um botão de vídeo é nomeado pelo que vai acontecer e a quê — «Reproduzir beach-sunset.mp4, 1:24» — para que um histórico de cinco vídeos não sejam cinco botões chamados «Reproduzir». O emblema de duração visível é decorativo, porque já está integrado nesse nome.',
    zh: '视频按钮以「将发生什么、对什么发生」命名——「播放 beach-sunset.mp4，1:24」——因此五个视频的消息流不会变成五个都叫「播放」的按钮。可见的时长徽标是装饰性的，因为它已经折进了这个名称。',
    ar: 'يُسمّى زر الفيديو بما سيحدث ولأي شيء — «تشغيل beach-sunset.mp4، 1:24» — كي لا يكون سجل بخمسة مقاطع خمسةَ أزرار اسمها «تشغيل». وشارة المدة المرئية زخرفية، لأنها مدمجة أصلًا في ذلك الاسم.',
  },
  atA11y4: {
    en: 'The full file name lives on the element even when the eye only gets the truncated version, so a screen reader and a tooltip both get the whole thing. The glyph is `aria-hidden`: it repeats what the extension already says.',
    es: 'El nombre completo vive en el elemento aunque el ojo solo reciba la versión recortada, así el lector de pantalla y el tooltip obtienen todo. El glifo es `aria-hidden`: repite lo que ya dice la extensión.',
    fr: 'Le nom complet vit sur l’élément même quand l’œil n’en reçoit que la version tronquée : le lecteur d’écran comme l’infobulle obtiennent le tout. Le glyphe est `aria-hidden` : il répète ce que l’extension dit déjà.',
    de: 'Der vollständige Dateiname lebt am Element, auch wenn das Auge nur die gekürzte Fassung bekommt, sodass Screenreader und Tooltip das Ganze erhalten. Das Zeichen ist `aria-hidden`: Es wiederholt, was die Endung bereits sagt.',
    ja: '目に見えるのは切り詰めた版でも、完全なファイル名は要素上に残ります。だからスクリーンリーダーもツールチップも全体を得られます。字形は `aria-hidden`。拡張子がすでに言っていることの繰り返しだからです。',
    pt: 'O nome completo vive no elemento mesmo quando o olho só recebe a versão truncada, para que o leitor de ecrã e a dica de ferramenta obtenham tudo. O glifo é `aria-hidden`: repete o que a extensão já diz.',
    zh: '即使肉眼只看到截断版本，完整文件名仍留在元素上，因此屏幕阅读器和 tooltip 都能拿到全名。字形是 `aria-hidden`：它重复的是扩展名已经说过的话。',
    ar: 'يبقى اسم الملف الكامل على العنصر حتى حين لا ترى العين سوى النسخة المبتورة، فيحصل قارئ الشاشة والتلميحة على الاسم كاملًا. والرمز `aria-hidden`: فهو يكرر ما يقوله الامتداد أصلًا.',
  },
  atA11y5: {
    en: 'A voice note is one labelled `group`, so its play button and its scrubber are announced as one thing. The clock is decorative — the seek bar already speaks the position through `aria-valuetext`, and announcing both reads the clock twice. A link preview is one link, not three: the title, the image, and the domain all go to the same place.',
    es: 'Una nota de voz es un `group` etiquetado, así su botón de reproducción y su barra se anuncian como una sola cosa. El reloj es decorativo: la barra ya dice la posición mediante `aria-valuetext`, y anunciar ambos lee el reloj dos veces. Una vista previa de enlace es un enlace, no tres: título, imagen y dominio van al mismo sitio.',
    fr: 'Une note vocale est un `group` étiqueté : son bouton de lecture et son curseur sont annoncés comme une seule chose. L’horloge est décorative — la barre annonce déjà la position via `aria-valuetext`, et annoncer les deux lit l’horloge deux fois. Un aperçu de lien est un lien, pas trois : titre, image et domaine vont au même endroit.',
    de: 'Eine Sprachnachricht ist eine beschriftete `group`, damit Abspielknopf und Scrubber als eine Sache angesagt werden. Die Uhr ist dekorativ — die Seek-Leiste spricht die Position bereits über `aria-valuetext`, und beides anzusagen liest die Uhr zweimal. Eine Link-Vorschau ist ein Link, nicht drei: Titel, Bild und Domain führen an denselben Ort.',
    ja: 'ボイスメモはラベル付きの `group` 一つなので、再生ボタンとスクラバーは 1 つのものとして読み上げられます。時計は装飾です — シークバーが `aria-valuetext` で位置をすでに話しており、両方読むと時計を二度読むことになります。リンクプレビューは 3 本ではなく 1 本のリンクです。タイトルも画像もドメインも同じ場所へ行きます。',
    pt: 'Uma nota de voz é um `group` rotulado, para que o botão de reprodução e o cursor sejam anunciados como uma só coisa. O relógio é decorativo — a barra já fala a posição através de `aria-valuetext`, e anunciar ambos lê o relógio duas vezes. Uma pré-visualização de ligação é uma ligação, não três: título, imagem e domínio vão ao mesmo sítio.',
    zh: '语音留言是一个带标签的 `group`，因此播放按钮和拖动条会作为一个整体被播报。时钟是装饰性的——进度条已经通过 `aria-valuetext` 说出位置，两者都播等于把时钟读两遍。链接预览是一条链接而不是三条：标题、图片和域名都通向同一处。',
    ar: 'الرسالة الصوتية هي `group` معنون واحد، فيُعلَن زر التشغيل وشريط السحب كشيء واحد. والساعة زخرفية — إذ ينطق شريط التقديم الموضع أصلًا عبر `aria-valuetext`، وإعلان الاثنين يقرأ الساعة مرتين. ومعاينة الرابط رابط واحد لا ثلاثة: العنوان والصورة والنطاق تذهب جميعها إلى المكان نفسه.',
  },

  atUse1: {
    en: 'Always send `width` and `height` on an image or video attachment. Without them the frame falls back to a 4:3 guess, and a guess that turns out wrong is exactly the layout jump the component exists to prevent.',
    es: 'Envía siempre `width` y `height` en un adjunto de imagen o vídeo. Sin ellos el marco recurre a una suposición 4:3, y una suposición equivocada es justo el salto de layout que el componente existe para evitar.',
    fr: 'Envoyez toujours `width` et `height` sur une pièce jointe image ou vidéo. Sans eux, le cadre retombe sur une estimation 4:3, et une estimation fausse, c’est exactement le saut de mise en page que le composant existe pour éviter.',
    de: 'Sende bei Bild- oder Videoanhängen immer `width` und `height`. Ohne sie fällt der Rahmen auf eine 4:3-Schätzung zurück, und eine falsche Schätzung ist genau der Layout-Sprung, den die Komponente verhindern soll.',
    ja: '画像・動画の添付には必ず `width` と `height` を送ってください。なければフレームは 4:3 の推測に落ちますが、外れた推測こそ、このコンポーネントが防ぐために存在するレイアウトの飛び跳ねです。',
    pt: 'Envie sempre `width` e `height` num anexo de imagem ou vídeo. Sem eles a moldura recorre a um palpite 4:3, e um palpite errado é exatamente o salto de layout que o componente existe para evitar.',
    zh: '图片或视频附件务必带上 `width` 和 `height`。没有它们时画框会退回 4:3 的猜测，而猜错正是这个组件存在的意义所要防止的布局跳动。',
    ar: 'أرسل دائمًا `width` و`height` مع مرفق الصورة أو الفيديو. بدونهما يعود الإطار إلى تخمين 4:3، والتخمين الخاطئ هو تحديدًا قفزة التخطيط التي وُجد المكوّن لمنعها.',
  },
  atUse2: {
    en: 'Give `ImageGrid` the whole album and let it decide the mosaic. Slicing the array yourself and calling it "four images" loses the "+N", which is the only thing telling the reader there is more.',
    es: 'Dale a `ImageGrid` el álbum entero y deja que decida el mosaico. Cortar tú el array y llamarlo «cuatro imágenes» pierde el «+N», que es lo único que le dice al lector que hay más.',
    fr: 'Donnez tout l’album à `ImageGrid` et laissez-le décider de la mosaïque. Découper le tableau vous-même et l’appeler « quatre images » perd le « +N », seule chose qui dit au lecteur qu’il y en a d’autres.',
    de: 'Gib `ImageGrid` das ganze Album und lass es das Mosaik entscheiden. Das Array selbst zu schneiden und „vier Bilder“ zu nennen, verliert das „+N“ — das Einzige, was dem Leser sagt, dass es mehr gibt.',
    ja: '`ImageGrid` にはアルバム全体を渡し、モザイクの決定は任せてください。自分で配列を切って「4 枚」として渡すと「+N」が失われます。もっとあると読み手に伝える唯一の手掛かりです。',
    pt: 'Dê ao `ImageGrid` o álbum inteiro e deixe-o decidir o mosaico. Cortar o array por si e chamar-lhe «quatro imagens» perde o «+N», que é a única coisa que diz ao leitor que há mais.',
    zh: '把整个相册交给 `ImageGrid`，让它决定马赛克。自己切数组再称之为「四张图」会丢掉「+N」，而那是唯一告诉读者还有更多的东西。',
    ar: 'امنح `ImageGrid` الألبوم كاملًا ودعه يقرر الفسيفساء. تقطيع المصفوفة بنفسك وتسميتها «أربع صور» يُفقد «+N»، وهي الشيء الوحيد الذي يخبر القارئ بوجود المزيد.',
  },
  atUse3: {
    en: 'Keep `onPlay` and `onOpen` as handoffs. The kit deliberately does not own playback or a lightbox — both are opinions about buffering, gestures, and full-screen behaviour that no two apps share.',
    es: 'Mantén `onPlay` y `onOpen` como entregas. El kit no posee a propósito la reproducción ni un lightbox: ambos son opiniones sobre buffering, gestos y pantalla completa que no comparten dos apps.',
    fr: 'Gardez `onPlay` et `onOpen` comme des passages de relais. Le kit ne possède délibérément ni la lecture ni une visionneuse : ce sont des avis sur le buffering, les gestes et le plein écran qu’aucune paire d’apps ne partage.',
    de: 'Behandle `onPlay` und `onOpen` als Übergaben. Das Kit besitzt bewusst weder Wiedergabe noch Lightbox — beides sind Meinungen zu Buffering, Gesten und Vollbildverhalten, die keine zwei Apps teilen.',
    ja: '`onPlay` と `onOpen` は引き渡しのままにしてください。キットは意図的に再生もライトボックスも持ちません。どちらもバッファリング、ジェスチャ、全画面挙動についての意見であり、2 つとして同じアプリはありません。',
    pt: 'Mantenha `onPlay` e `onOpen` como entregas. O kit não detém de propósito a reprodução nem uma lightbox — ambas são opiniões sobre buffering, gestos e ecrã inteiro que nenhumas duas apps partilham.',
    zh: '把 `onPlay` 和 `onOpen` 当作交接点。套件刻意不拥有播放器和灯箱——它们都是关于缓冲、手势和全屏行为的主张，而没有两个应用会一致。',
    ar: 'أبقِ `onPlay` و`onOpen` تسليمًا للتطبيق. المجموعة لا تمتلك التشغيل ولا العارض الكامل عمدًا — فكلاهما رأي في التخزين المؤقت والإيماءات وسلوك ملء الشاشة لا يتشاركه تطبيقان.',
  },
  atUse4: {
    en: 'Use `href` on `FileAttachment` whenever a real URL exists. A button cannot be right-clicked into Save As, and losing that is losing a whole path to the file for no gain.',
    es: 'Usa `href` en `FileAttachment` siempre que exista una URL real. A un botón no se le puede hacer clic derecho para «Guardar como», y perder eso es perder toda una vía al archivo sin ganar nada.',
    fr: 'Utilisez `href` sur `FileAttachment` dès qu’une vraie URL existe. On ne peut pas faire un clic droit « Enregistrer sous » sur un bouton, et perdre cela, c’est perdre toute une voie vers le fichier sans rien gagner.',
    de: 'Nutze `href` bei `FileAttachment`, sobald eine echte URL existiert. Ein Button lässt sich nicht per Rechtsklick in „Speichern unter“ verwandeln, und das zu verlieren heißt, einen ganzen Weg zur Datei ohne Gegenwert zu verlieren.',
    ja: '本物の URL があるなら `FileAttachment` には `href` を使ってください。ボタンは右クリックの「別名で保存」にはなりません。それを失うのは、何の見返りもなくファイルへの経路を丸ごと失うことです。',
    pt: 'Use `href` no `FileAttachment` sempre que exista um URL real. Um botão não pode ser clicado com o botão direito para «Guardar como», e perder isso é perder um caminho inteiro para o ficheiro sem qualquer ganho.',
    zh: '只要存在真实 URL，就在 `FileAttachment` 上使用 `href`。按钮无法右键「另存为」，失去它等于毫无收益地失去了通往文件的一整条路径。',
    ar: 'استخدم `href` في `FileAttachment` كلما وُجد رابط حقيقي. الزر لا يقبل النقر الأيمن لـ«حفظ باسم»، وفقدان ذلك يعني فقدان مسار كامل إلى الملف بلا مقابل.',
  },
  atUse5: {
    en: 'Do not reserve a media box for a link with no picture. The compact layout exists precisely so a missing og:image reads as a card without a picture, not as a broken card.',
    es: 'No reserves una caja de medios para un enlace sin imagen. El layout compacto existe justo para que una og:image ausente se lea como tarjeta sin foto y no como tarjeta rota.',
    fr: 'Ne réservez pas de boîte média pour un lien sans image. La disposition compacte existe précisément pour qu’une og:image absente se lise comme une carte sans photo, pas comme une carte cassée.',
    de: 'Reserviere keine Medienbox für einen Link ohne Bild. Das kompakte Layout existiert genau dafür, dass ein fehlendes og:image als Karte ohne Bild gelesen wird und nicht als kaputte Karte.',
    ja: '画像のないリンクのためにメディア枠を確保しないでください。コンパクトレイアウトは、og:image がないことを「壊れたカード」ではなく「写真のないカード」として読ませるために存在します。',
    pt: 'Não reserve uma caixa de media para uma ligação sem imagem. O layout compacto existe precisamente para que uma og:image em falta se leia como um cartão sem imagem e não como um cartão partido.',
    zh: '不要为没有图片的链接预留媒体框。紧凑布局的存在，正是为了让缺失的 og:image 读起来像一张没有配图的卡片，而不是一张坏掉的卡片。',
    ar: 'لا تحجز صندوق وسائط لرابط بلا صورة. التخطيط المضغوط موجود تحديدًا كي تُقرأ og:image الغائبة كبطاقة بلا صورة، لا كبطاقة معطوبة.',
  },
});

/**
 * Component names, as identifiers rather than JSX literals: they are proper
 * nouns that must never be translated, and the docs lint rule that guards
 * against hardcoded copy cannot tell the two apart.
 */
const N = {
  ImageAttachment: 'ImageAttachment',
  ImageGrid: 'ImageGrid',
  VideoAttachment: 'VideoAttachment',
  FileAttachment: 'FileAttachment',
  VoiceNote: 'VoiceNote',
  LinkPreviewCard: 'LinkPreviewCard',
} as const;

/**
 * A deterministic placeholder photo, inline as an SVG data URI.
 *
 * The docs must work with no network — a hotlinked host would leave every album
 * demo an empty frame the moment the machine is offline, which is exactly the
 * failure these components are built to make impossible. The numeral makes the
 * mosaic's tile order readable at a glance.
 */
function photo(w: number, h: number, hue: number, n: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${hue} 58% 64%)"/>` +
    `<stop offset="1" stop-color="hsl(${(hue + 45) % 360} 52% 34%)"/>` +
    `</linearGradient></defs>` +
    `<rect width="${w}" height="${h}" fill="url(#s)"/>` +
    `<circle cx="${w * 0.74}" cy="${h * 0.26}" r="${Math.min(w, h) * 0.13}" fill="hsl(${(hue + 90) % 360} 92% 86%)" opacity="0.85"/>` +
    `<path d="M0 ${h} L${w * 0.33} ${h * 0.44} L${w * 0.63} ${h} Z" fill="hsl(${(hue + 20) % 360} 44% 24%)" opacity="0.72"/>` +
    `<path d="M${w * 0.44} ${h} L${w * 0.76} ${h * 0.56} L${w} ${h} Z" fill="hsl(${(hue + 10) % 360} 48% 18%)" opacity="0.8"/>` +
    `<text x="${w * 0.06}" y="${h * 0.2}" font-family="sans-serif" font-size="${Math.min(w, h) * 0.18}" fill="#fff" opacity="0.9">${n}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const HUES = [206, 152, 28, 320, 262, 94, 12];

/** Square-ish album images; the mosaic crops them, so intrinsic size is uniform. */
const ALBUM: ChatAttachment[] = HUES.map((hue, i) => ({
  id: `album-${i + 1}`,
  url: photo(800, 800, hue, i + 1),
  mimeType: 'image/png',
  fileName: `photo-${i + 1}.png`,
  width: 800,
  height: 800,
}));

const LANDSCAPE: ChatAttachment = {
  id: 'landscape',
  url: photo(1600, 1000, 206, 1),
  mimeType: 'image/png',
  fileName: 'harbour-morning.png',
  width: 1600,
  height: 1000,
};

// 9:16 — well past ATTACHMENT_ASPECT_MIN, so the frame clamps and marks itself.
const PORTRAIT: ChatAttachment = {
  id: 'portrait',
  url: photo(900, 1600, 320, 2),
  mimeType: 'image/png',
  fileName: 'receipt-screenshot.png',
  width: 900,
  height: 1600,
};

const VIDEO: ChatAttachment = {
  id: 'video',
  mimeType: 'video/mp4',
  fileName: 'beach-sunset.mp4',
  width: 1280,
  height: 720,
  durationMs: 84_000,
};

const VIDEO_NO_POSTER: ChatAttachment = { ...VIDEO, id: 'video-2', fileName: 'standup-recording.mp4', durationMs: 3_930_000 };

const LONG_FILE: ChatAttachment = {
  id: 'file-long',
  mimeType: 'application/vnd.apple.numbers',
  fileName: 'Q3-2026-board-review-attachment-final-revised-APPROVED-v7.numbers',
  byteSize: 4_812_004,
};

const UPLOADING_FILE: ChatAttachment = {
  id: 'file-upload',
  mimeType: 'application/pdf',
  fileName: 'onboarding-handbook-2026-edition.pdf',
  byteSize: 18_400_000,
};

const ZIP_FILE: ChatAttachment = {
  id: 'file-zip',
  mimeType: 'application/zip',
  fileName: 'design-tokens-export.zip',
  byteSize: 962_144,
};

// A recognisable envelope, so the waveform is obviously data and not decoration.
const LEVELS = Array.from({ length: 48 }, (_, i) =>
  0.25 + 0.7 * Math.abs(Math.sin(i / 4.5)) * (0.5 + 0.5 * Math.sin(i / 15)),
);

/** A bubble-width column, since every attachment card is `width: 100%`. */
function Bubble({ children, width = '20rem' }: { children: ReactNode; width?: string }) {
  return <div style={{ width: '100%', maxWidth: width, minWidth: 0 }}>{children}</div>;
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <Text size={Size.Small} tone={TextTone.Muted}>
      {children}
    </Text>
  );
}

function ImageDemo({ K }: { K: PlatformKit }) {
  return (
    <Row gap={4} wrap align="start">
      <div style={{ width: '14rem' }}>
        <K.ImageAttachment attachment={LANDSCAPE} alt="Harbour at first light" onOpen={() => undefined} />
      </div>
      <div style={{ width: '10rem' }}>
        <K.ImageAttachment attachment={PORTRAIT} alt="A very tall receipt" />
      </div>
      <div style={{ width: '10rem' }}>
        <K.ImageAttachment attachment={{ ...LANDSCAPE, id: 'loading', url: undefined }} loading />
      </div>
    </Row>
  );
}

function GridDemo({ K, count }: { K: PlatformKit; count: number }) {
  const t = useT();
  return (
    <Stack gap={2}>
      <Caption>{count === 1 ? t(pm.atExGridOne) : t(pm.atExGridCount, { count })}</Caption>
      <Bubble width="16rem">
        <K.ImageGrid images={ALBUM.slice(0, count)} onOpen={() => undefined} />
      </Bubble>
    </Stack>
  );
}

function GridsDemo({ K }: { K: PlatformKit }) {
  return (
    <Row gap={5} wrap align="start">
      {[1, 2, 3, 4, 7].map((count) => (
        <GridDemo key={count} K={K} count={count} />
      ))}
    </Row>
  );
}

function VideoDemo({ K }: { K: PlatformKit }) {
  return (
    <Row gap={4} wrap align="start">
      <div style={{ width: '16rem' }}>
        <K.VideoAttachment attachment={VIDEO} poster={photo(1280, 720, 28, 1)} onPlay={() => undefined} />
      </div>
      <div style={{ width: '16rem' }}>
        <K.VideoAttachment attachment={VIDEO_NO_POSTER} badge="start" onPlay={() => undefined} />
      </div>
    </Row>
  );
}

function FileDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  const [progress, setProgress] = useState(0.64);
  return (
    <Bubble width="18rem">
      <Stack gap={4}>
        <Stack gap={2}>
          <Caption>{t(pm.atExFileLabelIdle)}</Caption>
          {/* A real href, so right-click Save As survives. */}
          <K.FileAttachment attachment={LONG_FILE} href="#" />
        </Stack>
        <Stack gap={2}>
          <Caption>{t(pm.atExFileLabelUploading)}</Caption>
          <K.FileAttachment
            attachment={UPLOADING_FILE}
            progress={progress}
            onCancel={() => setProgress(0)}
          />
        </Stack>
        <Stack gap={2}>
          <Caption>{t(pm.atExFileLabelIndeterminate)}</Caption>
          <K.FileAttachment attachment={ZIP_FILE} indeterminate onCancel={() => undefined} />
        </Stack>
        <Stack gap={2}>
          <Caption>{t(pm.atExFileLabelSkeleton)}</Caption>
          <K.FileAttachment attachment={ZIP_FILE} skeleton />
        </Stack>
      </Stack>
    </Bubble>
  );
}

function VoiceDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  return (
    <Bubble width="18rem">
      <Stack gap={4}>
        <Stack gap={2}>
          <Caption>{t(pm.atExVoiceComfortable)}</Caption>
          <K.VoiceNote duration={37} levels={LEVELS} />
        </Stack>
        <Stack gap={2}>
          <Caption>{t(pm.atExVoiceCompact)}</Caption>
          <K.VoiceNote duration={9} levels={LEVELS.slice(0, 20)} density="compact" defaultValue={3} />
        </Stack>
      </Stack>
    </Bubble>
  );
}

function LinkDemo({ K }: { K: PlatformKit }) {
  const t = useT();
  return (
    <Row gap={4} wrap align="start">
      <Bubble width="18rem">
        <K.LinkPreviewCard
          url="https://glacier.example/notes/image-grid-layout"
          title={t(pm.atLinkCardTitle)}
          description={t(pm.atLinkCardDesc)}
          image={photo(1200, 630, 262, 1)}
        />
      </Bubble>
      <Bubble width="18rem">
        <K.LinkPreviewCard
          url="https://glacier.example/notes/image-grid-layout"
          title={t(pm.atLinkCardTitle)}
          description={t(pm.atLinkCardDesc)}
        />
      </Bubble>
      <Bubble width="18rem">
        <K.LinkPreviewCard url="https://glacier.example/notes/pending" skeleton />
      </Bubble>
    </Row>
  );
}

export function AttachmentsPage() {
  const t = useT();

  return (
    <>
      <Heading level={1}>{t(pm.atName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(pm.atLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>

      <Heading level={3}>{N.ImageAttachment}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.atAnatomyImage))}</Text>
      <ComponentBlueprint specId="image-attachment" />

      <Heading level={3}>{N.ImageGrid}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.atAnatomyGrid))}</Text>
      <ComponentBlueprint specId="image-grid" />

      <Heading level={3}>{N.VideoAttachment}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.atAnatomyVideo))}</Text>
      <ComponentBlueprint specId="video-attachment" />

      <Heading level={3}>{N.FileAttachment}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.atAnatomyFile))}</Text>
      <ComponentBlueprint specId="file-attachment" />

      <Heading level={3}>{N.VoiceNote}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.atAnatomyVoice))}</Text>
      <ComponentBlueprint specId="voice-note" />

      <Heading level={3}>{N.LinkPreviewCard}</Heading>
      <Text tone={TextTone.Muted}>{prose(t(pm.atAnatomyLink))}</Text>
      <ComponentBlueprint specId="link-preview-card" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(pm.atExImageTitle)}
        description={prose(t(pm.atExImageDesc))}
        component="ImageAttachment"
        platformLayout="stacked"
        render={(K) => <ImageDemo K={K} />}
        code={`import { ImageAttachment } from '@glacier/react';

// width/height reserve the box before a byte arrives.
<ImageAttachment
  attachment={{ id: '1', url, width: 1600, height: 1000 }}
  alt="Harbour at first light"
  onOpen={() => lightbox.open('1')}
/>

// 9:16 clamps to a readable frame and marks itself data-clamped.
<ImageAttachment attachment={{ id: '2', url, width: 900, height: 1600 }} />

// Already at final size, bytes still in flight.
<ImageAttachment attachment={pending} loading />`}
      />

      <Example
        title={t(pm.atExGridTitle)}
        description={prose(t(pm.atExGridDesc))}
        component="ImageGrid"
        platformLayout="stacked"
        render={(K) => <GridsDemo K={K} />}
        code={`import { ImageGrid } from '@glacier/react';

// Hand it the WHOLE album; the mosaic and the "+N" are its decision.
<ImageGrid images={album} onOpen={(a, i) => lightbox.open(i)} />

// 1  → the image's own clamped ratio, no mosaic
// 2  → side by side
// 3  → full-width banner over a pair
// 4  → 2x2
// 7  → 2x2 whose last tile carries "+3"

// Tighten the album on a dense surface:
<ImageGrid images={album} max={2} />`}
      />

      <Example
        title={t(pm.atExVideoTitle)}
        description={prose(t(pm.atExVideoDesc))}
        component="VideoAttachment"
        render={(K) => <VideoDemo K={K} />}
        code={`import { VideoAttachment } from '@glacier/react';

<VideoAttachment
  attachment={{ id: 'v1', fileName: 'beach-sunset.mp4', width: 1280, height: 720, durationMs: 84_000 }}
  poster={posterUrl}
  onPlay={() => player.open('v1')}
/>

// No poster: a muted slate at the geometry the frame already reserved.
<VideoAttachment attachment={clip} badge="start" onPlay={play} />`}
      />

      <Example
        title={t(pm.atExFileTitle)}
        description={prose(t(pm.atExFileDesc))}
        component="FileAttachment"
        render={(K) => <FileDemo K={K} />}
        code={`import { FileAttachment } from '@glacier/react';

// Middle truncation: the extension and version suffix stay pinned.
<FileAttachment
  attachment={{ id: 'f1', fileName: 'Q3-2026-board-review-final-revised-APPROVED-v7.numbers', byteSize: 4_812_004 }}
  href={downloadUrl}
/>

// Mid-transfer: the bar takes the size line's row, so the height never changes.
<FileAttachment attachment={doc} progress={0.64} onCancel={abort} />
<FileAttachment attachment={doc} indeterminate onCancel={abort} />
<FileAttachment attachment={doc} skeleton />`}
      />

      <Example
        title={t(pm.atExVoiceTitle)}
        description={prose(t(pm.atExVoiceDesc))}
        component="VoiceNote"
        render={(K) => <VoiceDemo K={K} />}
        code={`import { VoiceNote } from '@glacier/react';

// A thin assembly over SeekBar: shape/tone/rail/levels/formatTime all pass
// straight through, and the scrubbing and keyboard model are SeekBar's.
<VoiceNote
  duration={37}
  levels={waveform}
  playing={isPlaying}
  onPlayingChange={setPlaying}
  value={position}
  onValueChange={setPosition}
  onSeekEnd={(s) => audio.seek(s)}
/>

<VoiceNote duration={9} levels={waveform} density="compact" />`}
      />

      <Example
        title={t(pm.atExLinkTitle)}
        description={prose(t(pm.atExLinkDesc))}
        component="LinkPreviewCard"
        platformLayout="stacked"
        render={(K) => <LinkDemo K={K} />}
        code={`import { LinkPreviewCard } from '@glacier/react';

// With an og:image → the media layout.
<LinkPreviewCard url={url} title={title} description={summary} image={ogImage} />

// Without one → a compact row with a leading glyph. NOT a reserved grey slab.
<LinkPreviewCard url={url} title={title} description={summary} />

// While the unfurl is still being fetched:
<LinkPreviewCard url={url} skeleton />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>

      <Heading level={3}>{N.ImageAttachment}</Heading>
      <PropsTable
        props={[
          { name: 'attachment', type: 'ChatAttachment', description: t(pm.atImageAttachment) },
          { name: 'alt', type: 'string', description: t(pm.atImageAlt) },
          { name: 'placeholder', type: 'ReactNode', description: t(pm.atImagePlaceholder) },
          { name: 'loading', type: 'boolean', default: 'false', description: t(pm.atImageLoading) },
          { name: 'fill', type: 'boolean', default: 'false', description: t(pm.atImageFill) },
          { name: 'radius', type: 'ImageAttachmentRadius', default: "'lg'", description: t(pm.atImageRadius) },
          { name: 'maxWidth', type: 'string | number', description: t(pm.atImageMaxWidth) },
          { name: 'onOpen', type: '() => void', description: t(pm.atImageOnOpen) },
        ]}
      />

      <Heading level={3}>{N.ImageGrid}</Heading>
      <PropsTable
        props={[
          { name: 'images', type: 'ChatAttachment[]', description: t(pm.atGridImages) },
          { name: 'alts', type: '(string | undefined)[]', description: t(pm.atGridAlts) },
          { name: 'max', type: 'number', default: '4', description: t(pm.atGridMax) },
          { name: 'onOpen', type: '(attachment: ChatAttachment, index: number) => void', description: t(pm.atGridOnOpen) },
        ]}
      />

      <Heading level={3}>{N.VideoAttachment}</Heading>
      <PropsTable
        props={[
          { name: 'attachment', type: 'ChatAttachment', description: t(pm.atImageAttachment) },
          { name: 'poster', type: 'string', description: t(pm.atVideoPoster) },
          { name: 'onPlay', type: '() => void', description: t(pm.atVideoOnPlay) },
          { name: 'badge', type: "'start' | 'end'", default: "'end'", description: t(pm.atVideoBadge) },
          { name: 'loading', type: 'boolean', default: 'false', description: t(pm.atImageLoading) },
          { name: 'formatTime', type: '(seconds: number) => string', description: t(pm.atVideoFormatTime) },
        ]}
      />

      <Heading level={3}>{N.FileAttachment}</Heading>
      <PropsTable
        props={[
          { name: 'attachment', type: 'ChatAttachment', description: t(pm.atFileAttachment) },
          { name: 'progress', type: 'number', description: t(pm.atFileProgress) },
          { name: 'indeterminate', type: 'boolean', default: 'false', description: t(pm.atFileIndeterminate) },
          { name: 'href', type: 'string', description: t(pm.atFileHref) },
          { name: 'onCancel', type: '() => void', description: t(pm.atFileOnCancel) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(pm.atFileSkeleton) },
        ]}
      />

      <Heading level={3}>{N.VoiceNote}</Heading>
      <PropsTable
        props={[
          { name: 'duration', type: 'number', description: t(pm.atVoiceDuration) },
          { name: 'levels', type: 'number[]', description: t(pm.atVoiceLevels) },
          { name: 'value', type: 'number', description: t(pm.atVoiceValue) },
          { name: 'playing', type: 'boolean', description: t(pm.atVoicePlaying) },
          { name: 'density', type: "'compact' | 'comfortable'", default: "'comfortable'", description: t(pm.atVoiceDensity) },
          { name: 'shape', type: "SeekBarProps['shape']", default: "'waveform'", description: t(pm.atVoiceShape) },
        ]}
      />

      <Heading level={3}>{N.LinkPreviewCard}</Heading>
      <PropsTable
        props={[
          { name: 'url', type: 'string', description: t(pm.atLinkUrl) },
          { name: 'title', type: 'ReactNode', description: t(pm.atLinkTitleProp) },
          { name: 'description', type: 'ReactNode', description: t(pm.atLinkDescriptionProp) },
          { name: 'image', type: 'string', description: t(pm.atLinkImage) },
          { name: 'layout', type: "'media' | 'compact'", description: t(pm.atLinkLayout) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(pm.atLinkSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(pm.atA11y1))}</li>
        <li>{prose(t(pm.atA11y2))}</li>
        <li>{prose(t(pm.atA11y3))}</li>
        <li>{prose(t(pm.atA11y4))}</li>
        <li>{prose(t(pm.atA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(pm.atUse1))}</li>
        <li>{prose(t(pm.atUse2))}</li>
        <li>{prose(t(pm.atUse3))}</li>
        <li>{prose(t(pm.atUse4))}</li>
        <li>{prose(t(pm.atUse5))}</li>
      </ul>
    </>
  );
}
