import { useLocale, type Locale } from '@glacier/react';

/**
 * A deliberately small translation layer for the app's own strings.
 *
 * The kit already localizes its components and flips direction through
 * LocaleProvider (see App.tsx). This module adds the app-level strings on top,
 * reading the same active locale via useLocale() so there is a single source of
 * truth. To add a language, extend AppLocale, LANGUAGES, and every entry below;
 * to add a string, add one key. English is the fallback for any gap.
 */
export const APP_LOCALES = ['en', 'es', 'fr', 'ar'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

/** The languages the starter ships, in their own names, for the picker. */
export const LANGUAGES: { code: AppLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

type Entry = Record<AppLocale, string>;

export const messages = {
  // nav rail (labels double as tooltips in the vertical rail)
  navDashboard: { en: 'Dashboard', es: 'Panel', fr: 'Tableau de bord', ar: 'لوحة القيادة' },
  navLibrary: { en: 'Library', es: 'Biblioteca', fr: 'Bibliothèque', ar: 'المكتبة' },
  navAbout: { en: 'About', es: 'Acerca de', fr: 'À propos', ar: 'حول' },
  navSettings: { en: 'Settings', es: 'Ajustes', fr: 'Réglages', ar: 'الإعدادات' },
  navPrimary: { en: 'Primary', es: 'Principal', fr: 'Principal', ar: 'التنقل الرئيسي' },

  // top bar
  searchPlaceholder: { en: 'Search', es: 'Buscar', fr: 'Rechercher', ar: 'بحث' },
  notifications: { en: 'Notifications', es: 'Notificaciones', fr: 'Notifications', ar: 'الإشعارات' },
  toggleSidebar: { en: 'Toggle sidebar', es: 'Alternar barra lateral', fr: 'Basculer la barre latérale', ar: 'تبديل الشريط الجانبي' },
  caughtUp: {
    en: "You're all caught up.",
    es: 'Estás al día.',
    fr: 'Vous êtes à jour.',
    ar: 'أنت مطّلع على كل الجديد.',
  },

  // contextual sidebar, per route
  sbDashViews: { en: 'Views', es: 'Vistas', fr: 'Vues', ar: 'العروض' },
  sbDashOverview: { en: 'Overview', es: 'Resumen', fr: 'Aperçu', ar: 'نظرة عامة' },
  sbDashReports: { en: 'Reports', es: 'Informes', fr: 'Rapports', ar: 'التقارير' },
  sbDashActivity: { en: 'Activity', es: 'Actividad', fr: 'Activité', ar: 'النشاط' },
  sbLibBrowse: { en: 'Browse', es: 'Explorar', fr: 'Parcourir', ar: 'تصفح' },
  sbLibAll: { en: 'All items', es: 'Todos los elementos', fr: 'Tous les éléments', ar: 'كل العناصر' },
  sbLibCollections: { en: 'Collections', es: 'Colecciones', fr: 'Collections', ar: 'المجموعات' },
  sbLibTags: { en: 'Tags', es: 'Etiquetas', fr: 'Étiquettes', ar: 'الوسوم' },
  sbAboutSections: { en: 'Sections', es: 'Secciones', fr: 'Sections', ar: 'الأقسام' },
  sbAboutOverview: { en: 'Overview', es: 'Resumen', fr: 'Aperçu', ar: 'نظرة عامة' },
  sbAboutReleaseNotes: { en: 'Release notes', es: 'Notas de versión', fr: 'Notes de version', ar: 'ملاحظات الإصدار' },

  // settings modal
  setTitle: { en: 'Settings', es: 'Ajustes', fr: 'Réglages', ar: 'الإعدادات' },
  setAppearance: { en: 'Appearance', es: 'Apariencia', fr: 'Apparence', ar: 'المظهر' },
  setAppearanceHint: {
    en: 'Theme, accent, and density, stamped as data attributes the token layer reads.',
    es: 'Tema, acento y densidad, aplicados como atributos que lee la capa de tokens.',
    fr: 'Thème, accent et densité, posés en attributs que lit la couche de tokens.',
    ar: 'السمة واللون المميز والكثافة، تُطبَّق كسمات تقرؤها طبقة الرموز.',
  },
  setTheme: { en: 'Theme', es: 'Tema', fr: 'Thème', ar: 'السمة' },
  setSystem: { en: 'System', es: 'Sistema', fr: 'Système', ar: 'النظام' },
  setLight: { en: 'Light', es: 'Claro', fr: 'Clair', ar: 'فاتح' },
  setDark: { en: 'Dark', es: 'Oscuro', fr: 'Sombre', ar: 'داكن' },
  setDensity: { en: 'Density', es: 'Densidad', fr: 'Densité', ar: 'الكثافة' },
  setComfortable: { en: 'Comfortable', es: 'Cómoda', fr: 'Confortable', ar: 'مريحة' },
  setCompact: { en: 'Compact', es: 'Compacta', fr: 'Compacte', ar: 'مضغوطة' },
  setAccent: { en: 'Accent', es: 'Acento', fr: 'Accent', ar: 'اللون المميز' },
  setLanguage: { en: 'Language', es: 'Idioma', fr: 'Langue', ar: 'اللغة' },
  setLayout: { en: 'Layout', es: 'Disposición', fr: 'Disposition', ar: 'التخطيط' },
  setLayoutHint: {
    en: 'How the shell frames itself.',
    es: 'Cómo se enmarca la interfaz.',
    fr: 'Comment la coque se cadre.',
    ar: 'كيف يؤطّر الهيكل نفسه.',
  },
  setSidebar: { en: 'Sidebar', es: 'Barra lateral', fr: 'Barre latérale', ar: 'الشريط الجانبي' },
  setFloating: { en: 'Floating', es: 'Flotante', fr: 'Flottante', ar: 'عائم' },
  setFullHeight: { en: 'Full height', es: 'Altura completa', fr: 'Pleine hauteur', ar: 'ارتفاع كامل' },
  setHaptics: { en: 'Haptics', es: 'Vibración', fr: 'Retour haptique', ar: 'اهتزاز اللمس' },
  setHapticsHint: {
    en: 'Subtle taps on presses and toggles, where the platform supports it.',
    es: 'Toques sutiles al pulsar y alternar, donde la plataforma lo permita.',
    fr: 'Vibrations légères aux appuis et bascules, si la plateforme le permet.',
    ar: 'نقرات خفيفة عند الضغط والتبديل، حيثما تدعمها المنصّة.',
  },
  setTypeface: { en: 'Typeface', es: 'Tipografía', fr: 'Police', ar: 'الخط' },
  setMonospace: { en: 'Monospace', es: 'Monoespaciada', fr: 'Chasse fixe', ar: 'أحادي المسافة' },
  setShape: { en: 'Shape & feel', es: 'Forma y estilo', fr: 'Forme et rendu', ar: 'الشكل والإحساس' },
  setShapeHint: {
    en: 'Corner rounding and glass frost scale every radius and blur token at once.',
    es: 'El redondeo y el esmerilado escalan a la vez cada token de radio y desenfoque.',
    fr: 'L’arrondi et le givrage ajustent d’un coup chaque jeton de rayon et de flou.',
    ar: 'تدوير الزوايا وضبابية الزجاج يوسّعان كل رموز نصف القطر والتمويه دفعة واحدة.',
  },
  setRounding: { en: 'Corner rounding', es: 'Redondeo', fr: 'Arrondi', ar: 'تدوير الزوايا' },
  setFrost: { en: 'Glass frost', es: 'Esmerilado', fr: 'Givrage du verre', ar: 'ضبابية الزجاج' },
  setVisualFeedback: { en: 'Visual feedback', es: 'Respuesta visual', fr: 'Retour visuel', ar: 'ردّ فعل بصري' },
  setVisualFeedbackHint: {
    en: 'An on-screen effect on press, in lockstep with haptics; works with the mouse too.',
    es: 'Un efecto en pantalla al pulsar, sincronizado con la vibración; también con el ratón.',
    fr: 'Un effet à l’écran à l’appui, synchronisé avec le retour haptique ; fonctionne aussi à la souris.',
    ar: 'تأثير على الشاشة عند الضغط، متزامن مع الاهتزاز؛ ويعمل مع الفأرة أيضًا.',
  },
  setEffect: { en: 'Effect', es: 'Efecto', fr: 'Effet', ar: 'التأثير' },
  setIntensity: { en: 'Intensity', es: 'Intensidad', fr: 'Intensité', ar: 'الشدّة' },

  // pages
  dashTitle: { en: 'Good morning', es: 'Buenos días', fr: 'Bonjour', ar: 'صباح الخير' },
  dashLede: {
    en: 'A quick read on how things are trending. Swap these tiles and the feed for your own data; the layout and every component come from Glacier.',
    es: 'Un vistazo rápido a las tendencias. Cambia estas fichas y el feed por tus datos; el diseño y cada componente vienen de Glacier.',
    fr: 'Un aperçu rapide des tendances. Remplacez ces tuiles et le flux par vos données ; la mise en page et chaque composant viennent de Glacier.',
    ar: 'نظرة سريعة على الاتجاهات. استبدل هذه البطاقات والموجز ببياناتك؛ التخطيط وكل مكوّن من Glacier.',
  },
  libTitle: { en: 'Library', es: 'Biblioteca', fr: 'Bibliothèque', ar: 'المكتبة' },
  libLede: {
    en: 'A sortable, selectable data grid over mock records. Add a new project, or select rows to act on them.',
    es: 'Una tabla de datos ordenable y seleccionable sobre registros de ejemplo. Añade un proyecto o selecciona filas para actuar.',
    fr: 'Une grille de données triable et sélectionnable sur des enregistrements fictifs. Ajoutez un projet ou sélectionnez des lignes.',
    ar: 'شبكة بيانات قابلة للفرز والتحديد فوق سجلات وهمية. أضِف مشروعًا أو حدّد صفوفًا للتعامل معها.',
  },
  aboutTitle: { en: 'About', es: 'Acerca de', fr: 'À propos', ar: 'حول' },
  aboutLede: {
    en: 'This skeleton is built entirely from Glacier UI and talks to a Rust backend through Tauri.',
    es: 'Este esqueleto está hecho por completo con Glacier UI y habla con un backend en Rust mediante Tauri.',
    fr: 'Ce squelette est entièrement bâti avec Glacier UI et dialogue avec un backend Rust via Tauri.',
    ar: 'بُني هذا الهيكل بالكامل من Glacier UI ويتواصل مع خادم Rust عبر Tauri.',
  },
  recentActivity: { en: 'Recent activity', es: 'Actividad reciente', fr: 'Activité récente', ar: 'النشاط الأخير' },
  shortcuts: { en: 'Shortcuts', es: 'Accesos directos', fr: 'Raccourcis', ar: 'اختصارات' },
} satisfies Record<string, Entry>;

export type MessageKey = keyof typeof messages;

/** Translate a key against the active locale, falling back to English. */
export function useT(): (key: MessageKey) => string {
  const locale = useLocale();
  const active: AppLocale = (APP_LOCALES as readonly string[]).includes(locale)
    ? (locale as AppLocale)
    : 'en';
  return (key) => messages[key][active] ?? messages[key].en;
}

/** The app locales are a subset of the kit's, so a plain widen is safe. */
export function toKitLocale(locale: AppLocale): Locale {
  return locale;
}
