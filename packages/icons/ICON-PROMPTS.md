# GlacierUI Icon Pack - generation prompts

**212 icons.** Original house line-icon style, **black on white**, meant to trace cleanly to SVG and drop into `@glacier/icons` (size via `1em`/`width`, colour via `currentColor`).

## How to generate

- One icon per image, **1024×1024**, pure black on pure white.
- The **style block** below is identical for every icon - only the *subject* changes. Prepend it (or set it as your tool's system/style field) and append the per-icon subject.
- Ask for **thick, uniform strokes** for cleaner tracing; then threshold to pure B/W before vectorising.
- `icon-prompts.json` has the full prompt per icon for scripted batch runs.

## Style block (fixed)

> A single **‹subject›**, drawn as one minimalist line icon. Pure solid black (#000000) lines on a pure white (#ffffff) background - no other colours, no fills, no shading, no gradients, no shadows, no background shapes, no text or letters. Uniform medium stroke weight with softly rounded caps and rounded corners, geometric and friendly. Centred on a 24×24 grid with even padding, minimal detail, clearly legible at 16px. Flat vector line art, crisp high-contrast edges, exactly one icon.

## Subjects


### misc

- **alarm-clock** - round clock face with two hands, two small bells angled on top, and two short splayed legs at the bottom
- **alert-triangle** - upward triangle with rounded corners containing a centered vertical exclamation stroke and a dot below it
- **align-justify** - four full-width evenly spaced horizontal lines stacked and reaching both edges
- **app-window** - rounded rectangle window frame with a top title bar and two small dots at its upper left

### arrow

- **arrow-down-to-line** - downward arrow with a triangular head resting just above a short horizontal baseline
- **arrow-down-up** - two parallel vertical arrows side by side, the left one pointing down and the right one pointing up
- **arrow-left** - horizontal shaft with a single triangular arrowhead pointing to the left
- **arrow-left-right** - one horizontal shaft with a triangular arrowhead at each end pointing left and right
- **arrow-right** - horizontal shaft with a single triangular arrowhead pointing to the right
- **arrow-up-down** - one vertical shaft with a triangular arrowhead at each end pointing up and down

### misc

- **atom** - small central dot with three overlapping elliptical orbit rings crossing around it
- **award** - round medallion disc with a star notch and two ribbon tails trailing down from its base
- **badge-check** - scalloped starburst badge outline with a check mark centered inside it
- **bar-chart-2** - three vertical bars of increasing height rising from a shared baseline
- **binary** - two small rounded rectangles arranged as digit outlines, one above the other, suggesting ones and zeros
- **bird** - simplified perched bird in profile with a rounded body, pointed beak, small eye dot, and swept tail
- **blocks** - one small square nested at the corner of a larger L-shaped block, forming stacked building blocks

### book

- **book** - upright closed book with a rounded spine on the left and a vertical page line near the fore-edge
- **book-check** - upright closed book with a small check mark centered on the cover
- **book-headphones** - upright closed book with a headphone band arcing over the top and ear cups on each side
- **book-open** - open book viewed from above with two facing pages fanning up from a central spine
- **book-open-check** - open book with two facing pages and a small check mark centered above the spine
- **book-open-text** - open book with two facing pages, each page carrying two short horizontal text lines

### misc

- **box** - closed cube drawn in isometric view with a Y-seam on the top face showing the lid folds
- **boxes** - three isometric cubes clustered together, two on the bottom and one nested above between them
- **braces** - a pair of curly brace symbols facing each other with a small gap between them
- **brain** - rounded brain silhouette split down the middle with a few curved fold lines on each side
- **briefcase** - rectangular briefcase body with a rounded top handle and a horizontal seam line across the middle
- **bug** - rounded oval beetle body with a small head, a center dividing line, and three short legs curving out from each side
- **calculator** - upright rounded rectangle device with a thin display bar at the top and a grid of small square buttons below
- **camera** - rounded rectangular camera body with a small bump on top and one centered round lens circle
- **check** - single check mark, a short stroke rising into a longer stroke, with rounded ends
- **check-circle** - thin circle enclosing a centered check mark with rounded ends

### chevron

- **chevron-down** - downward-pointing angle bracket, a single wide V
- **chevron-left** - leftward-pointing angle bracket, a single wide sideways V opening to the right
- **chevron-right** - rightward-pointing angle bracket, a single wide sideways V opening to the left
- **chevron-up** - upward-pointing angle bracket, a single wide inverted V

### circle

- **circle** - single thin perfectly round circle outline, empty inside
- **circle-check** - thin circle enclosing a centered check mark with rounded ends
- **circle-dashed** - round ring made of several evenly spaced short curved dashes forming a dashed circle
- **circle-help** - thin circle enclosing a centered question mark with a rounded curve and a dot below
- **circle-slash** - thin circle crossed by a single diagonal slash line running from lower-left to upper-right
- **circle-user-round** - thin circle enclosing a small centered head-and-shoulders bust, a round head above rounded shoulders
- **circle-x** - thin circle enclosing a centered X made of two crossing strokes with rounded ends

### misc

- **clipboard-paste** - clipboard with a small clip tab at the top and a page emerging from its lower edge
- **clock** - round clock face with two straight hands meeting at the center, pointing up and to the right

### cloud

- **cloud-download** - rounded cloud outline with a downward arrow, a vertical shaft and triangular head, beneath it
- **cloud-upload** - rounded cloud outline with an upward arrow, a vertical shaft and triangular head, beneath it

### code

- **code** - pair of angle brackets, a left-pointing bracket on the left and a right-pointing bracket on the right, spaced apart
- **code-2** - pair of angle brackets with a single forward slash between them, forming the </> markup mark

### misc

- **cog** - round gear with several evenly spaced squared teeth around the rim and a small hollow circle at the center
- **coins** - two overlapping round coins, one slightly behind and above the other, each a thin circle with a small inner arc
- **columns-2** - rounded rectangle divided into two equal vertical columns by one central line
- **combine** - two small rounded squares whose corners overlap in the center, one upper-left and one lower-right
- **command** - looped command key symbol, a square outline with a small open loop curling out from each of its four corners
- **compass** - round compass with a thin outer ring and a slim diamond-shaped needle pointing to the upper right, a small center dot
- **copy** - two identical rounded rectangles overlapping, one behind the other and offset to the upper right, suggesting duplicated pages
- **corner-down-left** - an angled path that starts at the top going down then turns left, ending in a leftward triangular arrowhead
- **cpu** - rounded square chip with a smaller inner square, and short pin lines protruding evenly from all four sides
- **crown** - simple crown with three peaks each topped by a small round dot, resting on a straight base band
- **database** - vertical stack of three shallow ellipse cylinders, the top a full oval and curved lines marking each layer below

### download

- **download** - downward-pointing arrow with a triangular head, above a short horizontal tray line forming an open shallow bracket
- **download-cloud** - rounded cloud outline with a short downward arrow and triangular head descending below its base

### misc

- **dumbbell** - horizontal bar with two round-plated weights at each end, a small grip mark at the center of the bar
- **equal** - two short parallel horizontal lines stacked evenly with a gap between them
- **external-link** - open-cornered square with a small arrow pointing to the upper right, its head breaking outside the top-right corner
- **eye** - almond-shaped eye outline with a small round pupil circle centered inside
- **factory** - building with a sawtooth stepped roofline, two tall chimneys on the left, and a couple of small square windows
- **feather** - single slim quill feather angled diagonally, with a central shaft and short parallel barb lines along one side

### file

- **file-box** - upright document with a folded top-right corner and a small 3D cube outline centered on the page
- **file-braces** - upright document with a folded top-right corner and a pair of curly braces { } centered on the page
- **file-code** - upright document with a folded top-right corner and a pair of angle brackets </> centered on the page
- **file-code-2** - upright document with a folded top-right corner and a pair of facing angle brackets < > with a slash between them centered on the page
- **file-cog** - upright document with a folded top-right corner and a small cog wheel with radiating teeth centered on the page
- **file-edit** - upright document with a folded top-right corner and a small angled pencil centered on the page
- **file-image** - upright document with a folded top-right corner and a small picture mark, a round sun above a diagonal mountain line, centered on the page
- **file-json** - upright document with a folded top-right corner and a pair of curly braces { } enclosing a small dot centered on the page
- **file-key** - upright document with a folded top-right corner and a small key, a round bow with a short toothed shaft, centered on the page
- **file-lock** - upright document with a folded top-right corner and a small closed padlock, a rounded shackle above a rectangular body, centered on the page
- **file-plus** - upright document with a folded top-right corner and a small plus sign centered on the page
- **file-terminal** - upright document with a folded top-right corner and a command prompt mark, a small chevron '>' beside a short underscore line, centered on the page
- **file-text** - upright document with a folded top-right corner and four short horizontal text lines centered on the page

### misc

- **filter** - funnel shape, wide open at the top and tapering to a short narrow stem at the bottom
- **flame** - single teardrop flame with a rounded body curling to a soft point at the top
- **flask-conical** - conical laboratory flask with a narrow straight neck, a wide triangular base, and a small liquid level line inside

### folder

- **folder** - closed folder with a raised tab on the top-left edge
- **folder-open** - folder with its front flap opened outward, the inner pocket angled forward from the back panel
- **folder-plus** - closed folder with a raised tab and a small plus sign centered on its face
- **folder-tree** - closed folder at the upper left with a short branching connector line leading down to two smaller stacked items

### misc

- **frown** - round face circle with two dot eyes and a downturned frowning mouth arc
- **fuel** - upright fuel pump with a rounded rectangular body, a display line, and a hose nozzle curving off one side
- **function-square** - rounded square outline enclosing a lowercase italic function symbol resembling a tall looped f
- **gauge** - semicircular speedometer dial with tick marks and a needle pointing to the upper right
- **gem** - faceted diamond gemstone with a flat top table and angled facet lines converging to a point at the bottom

### git

- **git-branch** - two vertical track lines joined by a curving branch, with small round nodes at the line ends
- **git-commit** - one horizontal line running left to right with a single small circle node centered on it

### globe

- **globe** - circle with one vertical meridian curve and two horizontal latitude lines forming a wireframe world
- **globe-2** - circle crossed by curved meridian and latitude lines, tilted so the grid wraps to one side like a rotated world

### misc

- **graduation-cap** - flat square mortarboard cap seen at an angle with a small tassel dangling from one corner

### grid

- **grid-2x2** - square divided into two rows and two columns forming four equal cells
- **grid-3x3** - square divided into three rows and three columns forming nine equal cells

### misc

- **hammer** - claw hammer with a rectangular head at the top and a straight handle angling down to one side
- **hand** - open raised palm with four fingers together and a thumb extended to the side
- **hash** - number sign with two vertical strokes crossed by two horizontal strokes
- **heart** - symmetric heart outline with two rounded lobes at the top meeting at a point at the bottom
- **help-circle** - thin circle enclosing a question mark with a dot beneath it
- **hourglass** - hourglass with a narrow pinched waist, a horizontal bar across the top and bottom, and sand suggested in the two bulbs
- **image** - rounded square frame containing a small circle in the upper corner and a triangular mountain line across the lower half
- **infinity** - sideways figure-eight formed by two interlocking loops that cross in the middle, a continuous unbroken line
- **info** - thin circle enclosing a lowercase information mark, a single dot above a short vertical stroke centered inside
- **key** - key with a round ring head and a short toothed shaft ending in two small teeth at the lower-right
- **keyboard** - wide rounded rectangle keyboard outline with a grid of small square keys and one long spacebar key along the bottom row
- **languages** - letter-shaped translation glyph, a capital A beside a stylized non-Latin character with a small arrow curving between them
- **layers** - stack of three offset diamond-shaped plates layered one above another, seen at a slight angle

### layout

- **layout-grid** - square divided into four equal cells, a two-by-two grid of rounded rectangles
- **layout-panel-left** - rectangle split into a narrow left column and a wider right area divided into two stacked cells
- **layout-panel-top** - rectangle split into a full-width top bar and a lower area divided into two side-by-side cells

### misc

- **leaf** - single leaf with a pointed tip and a central vein curving from stem to tip

### library

- **library** - row of three upright books standing side by side, one tilted at a slight angle, on a short shelf line
- **library-big** - tall bookcase outline with two shelves holding several upright books and one tilted book

### misc

- **lightbulb** - rounded light bulb with a small filament loop inside and two short base lines at the bottom

### link

- **link** - two interlocking rounded chain links crossing diagonally at the center
- **link-2** - two rounded chain-link half-loops joined by a short straight horizontal bar between them

### list

- **list** - three evenly spaced horizontal lines each preceded by a small dot bullet at the left
- **list-checks** - two horizontal lines each preceded by a small checkmark on the left
- **list-ordered** - three horizontal lines each preceded by a small numeral on the left, stacked as an ordered list
- **list-tree** - top horizontal line with two indented lines below it connected by short right-angle branch connectors

### misc

- **loader** - ring of short radiating spokes arranged around a center point, evenly spaced like a spinner
- **lock** - closed padlock with a rounded rectangular body and a fixed semicircular shackle on top
- **log-in** - rounded door-frame bracket with a rightward arrow pointing in through the opening
- **log-out** - rounded door-frame bracket with a rightward arrow pointing out away from the opening
- **medal** - round medal disc with a small star centered inside and two ribbon strips extending up from its top
- **megaphone** - cone-shaped megaphone bullhorn pointing to the upper-right with a small handle and short sound lines at its mouth
- **memory-stick** - upright RAM memory module, a wide rectangle with a small notch on the bottom edge and several short pin lines along the base
- **monitor** - rounded rectangular computer monitor screen on a short central stand with a small base foot
- **moon** - crescent moon shaped as a single curved sliver, the inner and outer arcs meeting at two rounded points
- **mouse-pointer-2** - solid triangular cursor arrow tilted slightly, one sharp tip at the upper-left and a small notched tail
- **mouse-pointer-click** - triangular cursor arrow with three short radiating click-spark lines fanning out from its upper-right corner
- **network** - three small rounded nodes, one on top and two below, joined by short straight connector lines into a linked cluster

### package

- **package** - closed cardboard box drawn in isometric view with a seam line across the top and a short strip of tape down the front
- **package-plus** - isometric cardboard box with a top seam and a small plus sign at its upper right

### misc

- **palette** - rounded artist's palette with a thumb hole and four small dots of paint arranged along its upper edge

### panel

- **panel-left-close** - rounded rectangle frame with a vertical divider near the left edge and a left-pointing angle bracket in the wider right area
- **panel-left-open** - rounded rectangle frame with a vertical divider near the left edge and a right-pointing angle bracket in the wider right area

### misc

- **parentheses** - one opening round bracket on the left and one closing round bracket on the right, curving toward each other
- **pause** - two identical short vertical rounded bars standing side by side with a small gap between them
- **pen** - fountain pen drawn as a slim diagonal body tapering to a nib at the lower-left, with a small split point

### pencil

- **pencil** - pencil drawn diagonally with a pointed writing tip at the lower-left and a flat squared end at the upper-right
- **pencil-line** - diagonal pencil with a pointed tip at the lower-left, above a short horizontal underline running beneath it

### misc

- **play** - single rightward-pointing triangle with softly rounded corners, its flat side on the left

### plug

- **plug** - electrical plug body with two straight prongs at the top and a short cord curving down from the bottom
- **plug-zap** - electrical plug with two top prongs and a small lightning bolt centered on its body

### misc

- **plus** - one horizontal and one vertical bar of equal length crossing at the center to form a symmetric plus sign
- **puzzle** - single square jigsaw-puzzle piece with one rounded knob tab on one side and a matching notch on the adjacent side
- **qr-code** - square outline containing three small corner squares and a scatter of tiny square modules, like a scan code
- **quote** - two pairs of rounded closing quotation marks, each a comma-like curl, sitting side by side near the top
- **radio** - central round dot emitting two curved concentric signal arcs on each side, like a broadcasting transmitter
- **refresh-cw** - two curved arrows forming a near-complete clockwise circle, each with a small triangular arrowhead at its open end
- **repeat** - rounded rectangular loop made of two arrows chasing each other, one arrowhead pointing right along the top run
- **rocket** - upright rocket with a rounded nose, two side fins at the base, a round porthole, and a small flame beneath
- **rotate-ccw** - single curved arrow sweeping counter-clockwise around most of a circle, its triangular arrowhead pointing up-left at the open gap
- **route** - winding path between a small circle node at the lower-left and a square node at the upper-right, joined by a bending dashed-free line with a turn
- **rows-3** - stack of three identical horizontal rectangular bars, one above another with equal gaps
- **search** - magnifying glass with a round lens and a short handle angled to the lower-right
- **send** - paper plane pointing to the upper-right, a simple triangular dart with a center crease line
- **server** - two stacked identical rounded rectangular racks, each with a small dot indicator on its left side

### settings

- **settings** - toothed cog wheel with a round hollow hub at its center
- **settings-2** - two horizontal slider rails, each with a round adjuster knob at a different position

### misc

- **shield** - rounded heraldic shield with a flat top and a pointed lower tip, plain and empty
- **shuffle** - two arrows crossing over each other between two pairs of endpoints, each ending in a triangular arrowhead on the right
- **sigma** - summation sigma symbol, an angular E-like zigzag with an open right side, top and bottom bars meeting a pointed middle
- **signature** - flowing looped handwritten scribble line resting on a short horizontal baseline
- **sliders** - three vertical slider rails, each with a small round knob at a different height
- **smartphone** - upright rounded-rectangle phone with a thin screen outline and a small dot below it
- **snowflake** - six-armed snowflake, three crossing lines through a center with small forked branches on each arm
- **sparkles** - one large four-point sparkle with two smaller sparkles beside it
- **square-terminal** - rounded square outline containing a small '>' prompt chevron and a short horizontal command line beside it
- **star** - single five-pointed star with evenly spaced points, hollow outline
- **sun** - small central circle surrounded by eight short straight rays pointing outward
- **swords** - two crossed swords forming an X, each with a blade, crossguard, and short handle
- **target** - three concentric circles with a small dot at the exact center, a bullseye
- **terminal** - small '>' prompt chevron followed by a short horizontal command line, no surrounding box
- **test-tube** - tilted narrow test tube with a rounded bottom, a small liquid line inside, and a lip at the open top
- **text-cursor-input** - an I-beam text cursor with top and bottom serifs standing beside a short blinking vertical line
- **timer** - round stopwatch with a small top button and a straight hand pointing to the upper area from the center
- **toggle-left** - horizontal pill-shaped switch track with a round knob resting at the left end
- **train-track** - two long parallel rails crossed by several evenly spaced short perpendicular sleeper ties, in perspective

### trash

- **trash** - rubbish bin with a flat lid, a small top handle, and a plain body
- **trash-2** - rubbish bin with a lifted lid, a small top handle, and two short vertical lines on the body

### misc

- **tree-pine** - tall coniferous pine tree drawn as two or three stacked triangular tiers with a short straight trunk at the base
- **triangle** - single upward-pointing equilateral triangle outline with softly rounded corners
- **triangle-alert** - upward-pointing triangle with rounded corners enclosing a vertical exclamation stroke above a dot
- **trophy** - winner's cup with a rounded bowl, two side handles, a short stem, and a wide flat base
- **type** - a capital letter T formed by a horizontal top bar over a centered vertical stem, sitting on a short baseline
- **upload** - an upward arrow rising out of an open horizontal tray, with a short shaft and triangular arrowhead pointing up

### user

- **user** - rounded head-and-shoulders bust, a circle above a wide curved shoulder line
- **user-check** - rounded head-and-shoulders bust with a small check mark at the upper right
- **user-minus** - rounded head-and-shoulders bust with a small horizontal minus sign at the upper right
- **user-plus** - rounded head-and-shoulders bust with a small plus sign at the upper right
- **user-round-cog** - circular head above a curved shoulder arc with a small toothed cog gear at the upper right

### misc

- **users** - two overlapping rounded head-and-shoulders busts, one slightly behind and offset from the other

### vibrate

- **vibrate** - upright rounded phone handset with short motion lines radiating from each side
- **vibrate-off** - upright rounded phone handset with short motion lines at the sides crossed by one diagonal slash

### volume

- **volume-2** - small loudspeaker cone facing right with two nested curved sound-wave arcs beside it
- **volume-x** - small loudspeaker cone facing right with a small X mark beside it

### misc

- **vote** - an open hand dropping a folded ballot slip bearing a check mark into a slotted box
- **wand** - a slender diagonal magic wand with a four-point sparkle at its tip
- **watch** - round wristwatch face with two clock hands and a short strap band above and below it
- **workflow** - two small rounded rectangles connected by an elbowed line, showing a branching node-to-node process flow
- **wrench** - a spanner with an open C-shaped jaw at one end and a straight angled handle
- **x** - two straight strokes crossing at the center to form an X, with rounded ends
- **zap** - a single jagged lightning bolt drawn as one zig-zag streak
