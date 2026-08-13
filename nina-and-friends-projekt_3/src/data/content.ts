import type { Category, ContentItem, ContentType } from "../types";

// Zentrale Demo-Daten. Spaeter einfach durch eine Datenbank ersetzen.

export const T = {
  heroTitle: "Willkommen im Team!",
  heroSub: "Gemeinsam lernen, wachsen und mehr erreichen.",
  searchPlaceholder: "Suche nach Inhalten, Rezepten, Dateien \u2026",
  upcomingTrainings: "Kommende Teamschulungen",
  quick: "Schnellzugriff",
  allAreas: "Alle Bereiche",
  showAll: "Alle anzeigen",
  bannerTitle: "Gemeinsam mehr erreichen!",
  bannerText: "Bleib auf dem Laufenden mit News, Tipps und Inspirationen.",
  bannerCta: "Mehr lesen",
  back: "Zur\u00FCck",
  copyText: "Text kopieren",
  copied: "Kopiert!",
  share: "Teilen",
  linkCopied: "Link kopiert!",
  fav: "Als Favorit speichern",
  favSaved: "Als Favorit gespeichert",
  favorites: "Favoriten",
  favoritesEmptyTitle: "Noch keine Favoriten",
  favoritesEmptyText:
    "Tippe bei einem Inhalt auf das Herz, um ihn hier zu speichern.",
  searchTitle: "Suche",
  searchEmptyTitle: "Nichts gefunden",
  searchEmptyText: "Probiere einen anderen Suchbegriff, zum Beispiel Rezept oder Kochshow.",
  searchStartTitle: "Wonach suchst du?",
  searchStartText: "Durchsuche alle Bereiche, Rezepte, Vorlagen und Dateien.",
  termine: "Termine",
  profil: "Profil",
  start: "Start",
  results: "Ergebnisse",
  openContent: "Inhalt \u00F6ffnen",
  demoNote: "Demo-Inhalt \u2013 Platzhalter f\u00FCr die sp\u00E4tere Live-Version.",
  upcoming: "Kommende Termine",
  moreContent: "Weitere Inhalte",
} as const;

export const typeLabels: Record<ContentType, string> = {
  artikel: "Artikel",
  pdf: "PDF",
  link: "Link",
  rezept: "Rezept",
  vorlage: "Textvorlage",
  video: "Video",
  termin: "Termin",
  schulung: "Schulung",
};

export const categories: Category[] = [
  { slug: "katalog-fs-26", title: "Katalog Fr\u00FChjahr/Sommer 26", icon: "BookOpen",
    description: "Der aktuelle Katalog mit allen Produkten und Preisen der Saison." },
  { slug: "zum-verschicken", title: "Zum Verschicken", icon: "Send",
    description: "Fertige Inhalte, die du direkt an Kundinnen weiterleiten kannst." },
  { slug: "willkommen", title: "Willkommen im Team", icon: "Heart",
    description: "Alles f\u00FCr deinen Start: erste Schritte, Ansprechpartner und Basics." },
  { slug: "produkte", title: "Pampered Chef Produkte", icon: "UtensilsCrossed",
    description: "Produktwissen, Anwendungstipps und Argumente f\u00FCr deine Beratung." },
  { slug: "kochshow", title: "Alles f\u00FCr deine Kochshow", icon: "ChefHat",
    description: "Materialien, Abl\u00E4ufe und Ideen f\u00FCr deine Kochshows." },
  { slug: "aktuelles", title: "Aktuelles aus dem Monat", icon: "Newspaper",
    description: "Monatsaktionen, Neuigkeiten und alles, was gerade wichtig ist." },
  { slug: "team-termine", title: "Team-Termine", icon: "CalendarDays",
    description: "Alle Termine, Calls und Treffen unseres Teams auf einen Blick." },
  { slug: "schulungen", title: "Schulungen", icon: "GraduationCap",
    description: "Trainings und Aufzeichnungen, mit denen du sicherer wirst." },
  { slug: "teamaufbau", title: "Teamaufbau", icon: "Sprout",
    description: "Unterst\u00FCtzung f\u00FCr dein Wachstum: Gespr\u00E4che, Unterlagen, Ideen." },
  { slug: "werbung", title: "Alles f\u00FCr deine Werbung", icon: "Megaphone",
    description: "Flyer, Anzeigen und Material f\u00FCr deine Kundengewinnung." },
  { slug: "team", title: "Team", icon: "Users",
    description: "Wer wir sind und wie wir zusammenarbeiten." },
  { slug: "shoppen", title: "Shoppen im Team", icon: "ShoppingBag",
    description: "Bestellungen und Angebote innerhalb des Teams." },
  { slug: "rezepte", title: "Rezepte", icon: "CookingPot",
    description: "Erprobte Rezepte f\u00FCr Kochshows, Social Media und deine Kunden." },
  { slug: "gutscheine", title: "Gutscheine", icon: "Ticket",
    description: "Aktuelle Gutscheinaktionen und fertige Vorlagen zum Verschicken." },
  { slug: "medien", title: "Bilder- und Videodatenbank", icon: "Image",
    description: "Freigegebene Fotos und Videos f\u00FCr deine Beitr\u00E4ge." },
  { slug: "der-loeffel", title: "Der L\u00F6ffel", icon: "Utensils",
    description: "Unsere Team-Zeitung mit Neuigkeiten und Geschichten." },
  { slug: "rubriken-loeffel", title: "Rubriken auf dem L\u00F6ffel", icon: "LayoutList",
    description: "Die einzelnen Rubriken der Team-Zeitung im \u00DCberblick." },
  { slug: "erklaerungen", title: "Erkl\u00E4rungen \u2013 wie mach ich das?", icon: "HelpCircle",
    description: "Schritt-f\u00FCr-Schritt-Anleitungen f\u00FCr Bestellungen, Tools und mehr." },
  { slug: "social-media", title: "Social-Media-Unterst\u00FCtzung", icon: "Share2",
    description: "Vorlagen, Bildideen und Captions f\u00FCr deine Kan\u00E4le." },
  { slug: "externe-speaker", title: "Schulungen externe Speaker", icon: "Mic",
    description: "Trainings und Impulse von G\u00E4sten au\u00DFerhalb des Teams." },
  { slug: "garzeiten", title: "Garzeiten-\u00DCbersicht", icon: "Timer",
    description: "Praktische Garzeiten f\u00FCr Stoneware und Zaubermeister." },
  { slug: "neue-produkte", title: "Neue Produkte", icon: "Sparkles",
    description: "Alle Neuheiten der Saison mit Bildern und Produktinfos." },
  { slug: "kataloge", title: "Kataloge", icon: "Library",
    description: "Alle Kataloge und Flyer als PDF zum Ansehen und Weitergeben." },
];


// Unterkategorien (Feld "parent" = Slug der Hauptkategorie)
export const unterKategorien: Category[] = [
  { slug: "pk-keramik-pfannen", parent: "produkte", icon: "CookingPot",
    title: "Keramik Antihaft Pfannen", description: "Alles zur Keramik-Antihaft-Serie." },
  { slug: "pk-stoneware", parent: "produkte", icon: "ChefHat",
    title: "Stoneware", description: "Ofenzauberer, Ofenhexe und die ganze Stoneware-Familie." },
  { slug: "pk-brilliance", parent: "produkte", icon: "Gem",
    title: "Brilliance Kollektion", description: "Die Brilliance Antihaft-Kollektion." },
  { slug: "pk-edelstahl", parent: "produkte", icon: "Layers",
    title: "Edelstahl Kollektion", description: "Toepfe und Pfannen aus Edelstahl." },
  { slug: "pk-edelstahl-alt", parent: "produkte", icon: "Archive",
    title: "Edelstahl Antihaft Pfannen (alt)", description: "Die aeltere Pfannen-Serie zum Nachschlagen." },
  { slug: "pk-gusseisen", parent: "produkte", icon: "Flame",
    title: "Gusseisen Kollektion", description: "Gusseiserne Toepfe und Pfannen." },
  { slug: "pk-backformen", parent: "produkte", icon: "CakeSlice",
    title: "Backformen", description: "Formen fuer Kuchen, Brot und mehr." },
  { slug: "pk-kuchengitter", parent: "produkte", icon: "LayoutGrid",
    title: "Kuchengitter", description: "Zum Auskuehlen und Servieren." },
  { slug: "pk-teigunterlage", parent: "produkte", icon: "Square",
    title: "Teigunterlage", description: "Die grosse Unterlage zum Ausrollen." },
  { slug: "pk-teigroller", parent: "produkte", icon: "Cylinder",
    title: "Teigroller", description: "Rollen fuer Teig aller Art." },
  { slug: "pk-pizzaschneider", parent: "produkte", icon: "Pizza",
    title: "Pizzaschneider", description: "Schneiden ohne Verrutschen." },
  { slug: "pk-schneiden", parent: "produkte", icon: "Slice",
    title: "Schneiden und Zerkleinern", description: "Messer, Hacker und Zerkleinerer." },
  { slug: "pk-glasschalen", parent: "produkte", icon: "Soup",
    title: "Glasschalen", description: "Schalen aus Glas zum Zubereiten und Servieren." },
  { slug: "pk-tableware", parent: "produkte", icon: "Utensils",
    title: "Tableware", description: "Alles fuer den gedeckten Tisch." },
  { slug: "pk-mikrowelle", parent: "produkte", icon: "Microwave",
    title: "Mikrowellen Abdeckung", description: "Praktische Helfer fuer die Mikrowelle." },
  { slug: "pk-paprika", parent: "produkte", icon: "Carrot",
    title: "Paprika Entferner", description: "Der kleine Helfer fuer Paprika und Co." },
  { slug: "pk-gewuerze", parent: "produkte", icon: "Leaf",
    title: "Gew\u00FCrze", description: "Gewuerzmischungen und ihre Anwendung." },
  { slug: "pk-erklaervideos", parent: "produkte", icon: "CirclePlay",
    title: "Erkl\u00E4rvideos", description: "Kurze Videos zu einzelnen Produkten." },
  { slug: "pk-produktfolien-2026", parent: "produkte", icon: "Images",
    title: "Produktfolien 2026", description: "Die neuen Produktfolien zum Verwenden." },
  { slug: "pk-neu-sept-2025", parent: "produkte", icon: "Sparkles",
    title: "Neue Produkte Sept. 2025", description: "Die Neuheiten vom September 2025." },
  { slug: "pk-neu-maerz-2025", parent: "produkte", icon: "Sparkles",
    title: "Neue Produkte M\u00E4rz 2025", description: "Die Neuheiten vom Maerz 2025." },
  { slug: "pk-aufbewahren", parent: "produkte", icon: "Scale",
    title: "Aufbewahren, Mixen, Abmessen", description: "Dosen, Messbecher, Schuesseln und Mixhelfer." },
  { slug: "pk-kochhelfer", parent: "produkte", icon: "Hourglass",
    title: "Koch- und Backhelfer", description: "Die kleinen Helfer, die alles leichter machen." },
  { slug: "pk-handschuhe", parent: "produkte", icon: "Hand",
    title: "Handschuhe & Co.", description: "Ofenhandschuhe, Untersetzer und Zubehoer." },
  { slug: "pk-elektro", parent: "produkte", icon: "Zap",
    title: "Elektronische Ger\u00E4te", description: "Air Fryer, Mixer und weitere Geraete." },
  { slug: "pk-modulare-bleche", parent: "produkte", icon: "Rows3",
    title: "Modulare Bleche", description: "Die modularen Bleche und ihr Zubehoer." },
  { slug: "pk-alte-dateien", parent: "produkte", icon: "History",
    title: "Alte Dateien / Produkte", description: "Archiv: aeltere Unterlagen und ausgelaufene Produkte." },

  // --- Katalog Fruehjahr/Sommer 26 ---
  { slug: "kfs-kataloge", parent: "katalog-fs-26", icon: "Library",
    title: "Kataloge", description: "Der Fr\u00FChjahr-/Sommerkatalog 2026 als PDF und Online-Version." },
  { slug: "kfs-preislisten", parent: "katalog-fs-26", icon: "ListChecks",
    title: "Preislisten", description: "Alle Preislisten zur Saison, auch die bebilderte Fassung." },
  { slug: "kfs-produktinfos", parent: "katalog-fs-26", icon: "Boxes",
    title: "Produktinfos & Schulung", description: "Produktfolien, Schulungsunterlagen und Details zu den Neuheiten." },
  { slug: "kfs-bilder-videos", parent: "katalog-fs-26", icon: "Images",
    title: "Bilder & Videos", description: "Fertige Bilder und Videos f\u00FCr deine Beitr\u00E4ge und Storys." },
  { slug: "kfs-programme", parent: "katalog-fs-26", icon: "Gift",
    title: "Programme & Aktionen", description: "Gastgeber-Bonusprogramm, Fast Track und die Startaktionen." },

  // --- Alles fuer deine Kochshow ---
  { slug: "ks-gastgebersuche", parent: "kochshow", icon: "UserSearch",
    title: "Gastgebersuche", description: "So findest du neue Gastgeberinnen fuer deine Shows." },
  { slug: "ks-gastgebervorteile", parent: "kochshow", icon: "Gift",
    title: "Gastgebervorteile", description: "Das Bonusprogramm und alle Vorteile im \u00DCberblick." },
  { slug: "ks-vorlagen", parent: "kochshow", icon: "LayoutTemplate",
    title: "Kochshowvorlagen", description: "Fertige Vorlagen fuer Ablauf und Kommunikation." },
  { slug: "ks-einladungen", parent: "kochshow", icon: "Mail",
    title: "Einladungen und Co.", description: "Einladungstexte und Materialien zum Verschicken." },
  { slug: "ks-mitnehmen", parent: "kochshow", icon: "Briefcase",
    title: "Zur Kochshow nehme ich mit", description: "Die Packliste fuer deine Kochshow." },
  { slug: "ks-nachbereitung", parent: "kochshow", icon: "CircleCheck",
    title: "Nach der Kochshow", description: "Nachfassen, bedanken und Bestellungen abschliessen." },
  { slug: "ks-feedback-planer", parent: "kochshow", icon: "ClipboardList",
    title: "Feedback & KS-Planer", description: "Rueckmeldungen einholen und Shows planen." },

  // --- Aktuelles aus dem Monat ---
  { slug: "ak-folien-juli", parent: "aktuelles", icon: "Presentation",
    title: "Folien Juli", description: "Die Folien zur Juli-Aktion." },
  { slug: "ak-angebotsfolien", parent: "aktuelles", icon: "Percent",
    title: "Angebotsfolien ab 12.06.", description: "Folien zu den laufenden Angeboten." },
  { slug: "ak-teamfolien", parent: "aktuelles", icon: "FileStack",
    title: "Teamfolien Angebote", description: "Angebotsfolien fuer das Team." },
  { slug: "ak-gewuerzvideos", parent: "aktuelles", icon: "Video",
    title: "Gew\u00FCrzvideos", description: "Kurze Videos rund um die Gewuerze." },
  { slug: "ak-bbq", parent: "aktuelles", icon: "Flame",
    title: "BBQ", description: "Alles rund um Grillen und BBQ im Backofen." },
  { slug: "ak-berater-werden", parent: "aktuelles", icon: "UserPlus",
    title: "Berater werden", description: "Infos fuer Interessentinnen am Beraterinnen-Start." },
  { slug: "ak-juni", parent: "aktuelles", icon: "Calendar",
    title: "Juni", description: "Archiv: die Aktionen aus dem Juni." },

  // --- Schulungen ---
  { slug: "su-weitere", parent: "schulungen", icon: "BookMarked",
    title: "Weitere Schulungen", description: "Zusaetzliche Trainings und Aufzeichnungen." },
  { slug: "su-produkte", parent: "schulungen", icon: "Boxes",
    title: "Schulungen Produkte", description: "Produkttrainings im \u00DCberblick." },

  // --- Team ---
  { slug: "tm-inspirationen", parent: "team", icon: "Sparkle",
    title: "Inspirationen Sommerkonferenz", description: "Eindruecke und Ideen von der Sommerkonferenz." },
  { slug: "tm-events", parent: "team", icon: "PartyPopper",
    title: "Team Events", description: "Unsere gemeinsamen Veranstaltungen." },

  // --- Alles fuer deine Werbung ---
  { slug: "we-logos", parent: "werbung", icon: "Lightbulb",
    title: "Logos f\u00FCr Berater", description: "Logos und Vorlagen fuer deine eigene Werbung." },

  // --- Neue Produkte Sept. 2025 (Unterkategorien) ---
  { slug: "ns-erklaervideo", parent: "pk-neu-sept-2025", icon: "CirclePlay",
    title: "Erkl\u00E4rvideo", description: "Das Erklaervideo zu den Neuheiten." },
  { slug: "ns-folien", parent: "pk-neu-sept-2025", icon: "Presentation",
    title: "Folien", description: "Folien zu den neuen Produkten." },
  { slug: "ns-produktvideos", parent: "pk-neu-sept-2025", icon: "Video",
    title: "Produktvideos", description: "Videos zu den einzelnen Produkten." },
  { slug: "ns-beispielbilder", parent: "pk-neu-sept-2025", icon: "Images",
    title: "Beispielbilder", description: "Bilder zum Verwenden in deinen Beitraegen." },
  { slug: "ns-pc-videos", parent: "pk-neu-sept-2025", icon: "Film",
    title: "Pampered Chef Original Videos", description: "Die offiziellen Videos von Pampered Chef." },
  { slug: "ns-pc-bilder", parent: "pk-neu-sept-2025", icon: "Image",
    title: "Bilder von Pampered Chef", description: "Offizielle Produktbilder." },
];

// Alle Kategorien zusammen (Haupt- und Unterkategorien)
export const alleKategorien: Category[] = [...categories, ...unterKategorien];

// Nur die Hauptkategorien (fuer das Kachelgitter auf der Startseite)
export const hauptKategorien = categories;

export const getUnterkategorien = (slug: string) =>
  alleKategorien.filter((k) => k.parent === slug);

const body = (title: string) =>
  "Dies ist ein Demo-Inhalt f\u00FCr \u201E" +
  title +
  "\u201C.\n\nIn der sp\u00E4teren Live-Version steht hier der vollst\u00E4ndige Inhalt: Texte, Bilder, Downloads oder Videos.\n\nSo kannst du dir jetzt schon anschauen, wie sich die Plattform anf\u00FChlt: Navigation, Suche, Favoriten, Kopieren und Teilen funktionieren bereits.";

const alleInhalte: ContentItem[] = [
  // Fuer dich heute
  {
    id: "monatsaktion-juli",
    categorySlug: "aktuelles",
    type: "artikel",
    title: "Monatsaktion Juli ist da!",
    description: "Alle Infos zur aktuellen Aktion \u2013 jetzt entdecken.",
    body:
      "Die Monatsaktion Juli ist gestartet!\n\nDiesen Monat gibt es besondere Vorteile f\u00FCr deine Kunden und attraktive Gastgeberinnen-Angebote.\n\nHier findest du sp\u00E4ter: die Aktionsgrafik zum Teilen, eine fertige Textvorlage und alle Bedingungen im \u00DCberblick.",
    date: "2026-07-01",
    featured: true,
  },
  {
    id: "teamkochshow-sommer",
    categorySlug: "schulungen",
    type: "schulung",
    title: "Teamkochshow",
    subtitle: "Sommerideen",
    dateLabel: "15.07.",
    time: "10:00 Uhr",
    accentIcon: "ChefHat",
    photo: "food",
    description: "15.07. \u00B7 10:00 Uhr \u2013 gemeinsam live dabei sein.",
    body:
      "Teamkochshow \u2013 Sommerideen\n\nDatum: 15.07.2026\nUhrzeit: 10:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nWir kochen gemeinsam frische Sommerideen und zeigen die Produkte in Aktion. Perfekt zum Reinschnuppern und Mitschreiben!",
    date: "2026-07-15",
    featured: true,
  },
  {
    id: "produkttraining-juli",
    categorySlug: "schulungen",
    type: "schulung",
    title: "Produkttraining",
    subtitle: "Neue Produkte im Juli",
    dateLabel: "22.07.",
    time: "14:00 Uhr",
    accentIcon: "GraduationCap",
    photo: "products",
    description: "22.07. \u00B7 14:00 Uhr \u2013 alle Neuheiten im \u00DCberblick.",
    body:
      "Produkttraining \u2013 Neue Produkte im Juli\n\nDatum: 22.07.2026\nUhrzeit: 14:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nWir schauen uns die Juli-Neuheiten gemeinsam an: Anwendung, Vorteile und die besten Argumente f\u00FCr deine Beratung.",
    date: "2026-07-22",
    featured: true,
  },
  {
    id: "neue-produkte-juli",
    categorySlug: "neue-produkte",
    type: "artikel",
    title: "Neue Produkte im Juli",
    description: "Alle Neuheiten auf einen Blick \u2013 jetzt ansehen.",
    body:
      "Neue Produkte im Juli\n\nDiese Neuheiten erwarten dich und deine Kunden in diesem Monat.\n\nHier findest du sp\u00E4ter Produktbilder, Preise und die wichtigsten Verkaufsargumente \u2013 fertig aufbereitet zum Weitergeben.",
    date: "2026-07-01",
    featured: true,
  },

  // Aktuelles
  {
    id: "aktuelles-newsletter",
    categorySlug: "aktuelles",
    type: "artikel",
    title: "Team-News im \u00DCberblick",
    description: "Was diesen Monat im Team passiert.",
    body: body("Team-News im \u00DCberblick"),
    date: "2026-07-05",
  },
  {
    id: "aktuelles-gastgeberin",
    categorySlug: "aktuelles",
    type: "vorlage",
    title: "Vorlage: Aktion an Kundinnen verschicken",
    description: "Fertiger Text f\u00FCr WhatsApp und Instagram.",
    body:
      "Hallo \u2764\ufe0f\n\nDie Juli-Aktion ist da \u2013 und sie lohnt sich richtig! Diesen Monat bekommst du bei deiner Bestellung ein besonderes Extra.\n\nMelde dich gern bei mir, ich zeige dir die Details. \uD83C\uDF1F\n\n(Demo-Vorlage \u2013 Text vor dem Versenden anpassen.)",
    date: "2026-07-02",
  },

  // Katalog FS 2026
  {
    id: "katalog-fs26-pdf",
    categorySlug: "katalog-fs-26",
    type: "pdf",
    title: "Katalog Fr\u00FChjahr/Sommer 2026 (PDF)",
    description: "Der komplette Katalog zum Bl\u00E4ttern und Teilen.",
    body: body("Katalog Fr\u00FChjahr/Sommer 2026"),
  },
  {
    id: "katalog-fs26-highlights",
    categorySlug: "katalog-fs-26",
    type: "artikel",
    title: "Highlights der Saison",
    description: "Die wichtigsten Produkte kurz vorgestellt.",
    body: body("Highlights der Saison"),
  },
  {
    id: "katalog-fs26-preise",
    categorySlug: "katalog-fs-26",
    type: "pdf",
    title: "Preisliste kompakt",
    description: "Alle Preise als \u00DCbersicht f\u00FCr unterwegs.",
    body: body("Preisliste kompakt"),
  },

  // Willkommen
  {
    id: "willkommen-erste-schritte",
    categorySlug: "willkommen",
    type: "artikel",
    title: "Deine ersten 7 Tage",
    description: "Schritt f\u00FCr Schritt gut ankommen.",
    body: body("Deine ersten 7 Tage"),
  },
  {
    id: "willkommen-checkliste",
    categorySlug: "willkommen",
    type: "pdf",
    title: "Starter-Checkliste (PDF)",
    description: "Zum Abhaken: alles Wichtige f\u00FCr den Anfang.",
    body: body("Starter-Checkliste"),
  },
  {
    id: "willkommen-video",
    categorySlug: "willkommen",
    type: "video",
    title: "Willkommensvideo von Nina",
    description: "Eine kurze pers\u00F6nliche Begr\u00FC\u00DFung.",
    body: body("Willkommensvideo von Nina"),
  },

  // Produkte
  {
    id: "produkte-ofenmeister",
    categorySlug: "produkte",
    type: "artikel",
    title: "Ofenmeister richtig vorstellen",
    description: "Die besten Argumente f\u00FCr den Bestseller.",
    body: body("Ofenmeister richtig vorstellen"),
  },
  {
    id: "produkte-stoneware-pflege",
    categorySlug: "produkte",
    type: "artikel",
    title: "Stoneware-Pflege einfach erkl\u00E4rt",
    description: "H\u00E4ufige Fragen und die passenden Antworten.",
    body: body("Stoneware-Pflege einfach erkl\u00E4rt"),
  },
  {
    id: "produkte-video-zm",
    categorySlug: "produkte",
    type: "video",
    title: "Zaubermeister in Aktion",
    description: "Kurzes Demo-Video f\u00FCr deine Kundinnen.",
    body: body("Zaubermeister in Aktion"),
  },

  // Rezepte
  {
    id: "rezept-focaccia",
    categorySlug: "rezepte",
    type: "rezept",
    title: "Focaccia aus dem Ofenmeister",
    description: "Einfach, beeindruckend, perfekt f\u00FCr Kochshows.",
    body:
      "Focaccia aus dem Ofenmeister (Demo)\n\nZutaten:\n\u2013 500 g Mehl\n\u2013 380 g Wasser\n\u2013 10 g Salz\n\u2013 Hefe oder Sauerteig nach Rezept\n\nZubereitung:\nTeig verr\u00FChren, ruhen lassen, in den gefetteten Ofenmeister geben, dellen, Toppings verteilen und backen.\n\nIn der Live-Version steht hier das vollst\u00E4ndige Rezept mit Bildern.",
  },
  {
    id: "rezept-sommersalat",
    categorySlug: "rezepte",
    type: "rezept",
    title: "Sommersalat f\u00FCr die Kochshow",
    description: "Frisch, schnell und ideal zum Mitmachen.",
    body: body("Sommersalat f\u00FCr die Kochshow"),
  },
  {
    id: "rezept-zm-brot",
    categorySlug: "rezepte",
    type: "rezept",
    title: "Rustikales Brot aus dem Zaubermeister",
    description: "Der Klassiker, der jede Show verkauft.",
    body: body("Rustikales Brot aus dem Zaubermeister"),
  },

  // Team-Termine
  {
    id: "termin-teamcall",
    categorySlug: "team-termine",
    type: "termin",
    title: "Team-Call: Monatsstart Juli",
    description: "01.08. \u00B7 20:00 Uhr \u00B7 Online",
    body: body("Team-Call: Monatsstart"),
    date: "2026-08-01",
  },
  {
    id: "termin-sommertreffen",
    categorySlug: "team-termine",
    type: "termin",
    title: "Team-Sommertreffen",
    description: "22.08. \u00B7 15:00 Uhr \u00B7 bei Nina im Garten",
    body: body("Team-Sommertreffen"),
    date: "2026-08-22",
  },

  // Schulungen - kommende Team-Schulungen (mit Datum) ...
  {
    id: "schulung-sommerprodukte",
    categorySlug: "schulungen",
    type: "schulung",
    title: "Live-Schulung: Sommerprodukte verkaufen",
    description: "28.07. \u00B7 19:30 Uhr \u00B7 Online",
    body:
      "Live-Schulung: Sommerprodukte verkaufen\n\nDatum: 28.07.2026\nUhrzeit: 19:30 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nWir schauen uns gemeinsam an, wie du die Sommerneuheiten \u00FCberzeugend vorstellst. Bring gern deine Fragen mit!",
    date: "2026-07-28",
  },
  {
    id: "schulung-teamkochshow-basics",
    categorySlug: "schulungen",
    type: "schulung",
    title: "Teamkochshow-Basics f\u00FCr Einsteigerinnen",
    description: "05.08. \u00B7 20:00 Uhr \u00B7 Online",
    body:
      "Teamkochshow-Basics f\u00FCr Einsteigerinnen\n\nDatum: 05.08.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nAufbau, Ablauf und die wichtigsten Tipps f\u00FCr deine erste Teamkochshow \u2013 entspannt und Schritt f\u00FCr Schritt erkl\u00E4rt.",
    date: "2026-08-05",
  },
  {
    id: "schulung-social-media-basics",
    categorySlug: "schulungen",
    type: "schulung",
    title: "Live-Schulung: Social Media Basics",
    description: "12.08. \u00B7 20:00 Uhr \u00B7 Online",
    body:
      "Live-Schulung: Social Media Basics\n\nDatum: 12.08.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nWir gehen die Grundlagen f\u00FCr Instagram und Co. durch: Was posten, wann posten und wie du sichtbar wirst.",
    date: "2026-08-12",
  },
  {
    id: "schulung-teamaufbau-live",
    categorySlug: "schulungen",
    type: "schulung",
    title: "Live-Schulung: Teamaufbau leicht gemacht",
    description: "21.08. \u00B7 20:00 Uhr \u00B7 Online",
    body:
      "Live-Schulung: Teamaufbau leicht gemacht\n\nDatum: 21.08.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nWie du entspannt \u00FCber die Chance sprichst und dein Team Schritt f\u00FCr Schritt aufbaust.",
    date: "2026-08-21",
  },
  // ... und Aufzeichnungen zum Nachschauen
  {
    id: "schulung-instagram",
    categorySlug: "schulungen",
    type: "video",
    title: "Instagram f\u00FCr Beraterinnen (Aufzeichnung)",
    description: "Aufzeichnung der letzten Online-Schulung.",
    body: body("Instagram f\u00FCr Beraterinnen"),
  },
  {
    id: "schulung-bestellsystem",
    categorySlug: "schulungen",
    type: "schulung",
    title: "Bestellsystem Schritt f\u00FCr Schritt",
    description: "So legst du Bestellungen sicher an.",
    body: body("Bestellsystem Schritt f\u00FCr Schritt"),
  },

  // Teamaufbau
  {
    id: "teamaufbau-gespraech",
    categorySlug: "teamaufbau",
    type: "artikel",
    title: "Das Chancen-Gespr\u00E4ch",
    description: "So sprichst du entspannt \u00FCber das Business.",
    body: body("Das Chancen-Gespr\u00E4ch"),
  },
  {
    id: "teamaufbau-flyer",
    categorySlug: "teamaufbau",
    type: "pdf",
    title: "Info-Flyer: Beraterin werden",
    description: "Zum Weitergeben an Interessentinnen.",
    body: body("Info-Flyer: Beraterin werden"),
  },

  // Social Media
  {
    id: "social-captions-juli",
    categorySlug: "social-media",
    type: "vorlage",
    title: "Caption-Paket Juli",
    description: "10 fertige Texte f\u00FCr deine Beitr\u00E4ge.",
    body:
      "Caption-Paket Juli (Demo)\n\n1) Sommer, Sonne, neue Rezepte \u2013 was kommt bei dir diese Woche auf den Tisch?\n\n2) Mein liebstes K\u00FCchenhelferlein im Juli: \u2026\n\n3) Wer war schon mal bei einer Kochshow dabei? Erz\u00E4hl mal!\n\nIn der Live-Version stehen hier alle 10 Captions mit passenden Bildideen.",
  },
  {
    id: "social-reel-ideen",
    categorySlug: "social-media",
    type: "artikel",
    title: "5 Reel-Ideen f\u00FCr diese Woche",
    description: "Schnell umgesetzt, ohne viel Aufwand.",
    body: body("5 Reel-Ideen f\u00FCr diese Woche"),
  },
  {
    id: "social-story-vorlagen",
    categorySlug: "social-media",
    type: "link",
    title: "Story-Vorlagen (Canva)",
    description: "Direkt anpassen und posten.",
    body: body("Story-Vorlagen (Canva)"),
  },

  // Werbung
  {
    id: "werbung-flyer-kochshow",
    categorySlug: "werbung",
    type: "pdf",
    title: "Flyer: Kochshow buchen",
    description: "Druckfertige Vorlage f\u00FCr deine Werbung.",
    body: body("Flyer: Kochshow buchen"),
  },
  {
    id: "werbung-anzeigen",
    categorySlug: "werbung",
    type: "artikel",
    title: "Kleinanzeigen, die funktionieren",
    description: "Beispiele und Formulierungen.",
    body: body("Kleinanzeigen, die funktionieren"),
  },

  // Gutscheine
  {
    id: "gutschein-juli",
    categorySlug: "gutscheine",
    type: "vorlage",
    title: "Gutschein-Vorlage Juli",
    description: "Zum Ausdrucken oder digital verschicken.",
    body: body("Gutschein-Vorlage Juli"),
  },
  {
    id: "gutschein-anleitung",
    categorySlug: "gutscheine",
    type: "artikel",
    title: "So setzt du Gutscheine richtig ein",
    description: "Ideen f\u00FCr Kundenbindung und Buchungen.",
    body: body("So setzt du Gutscheine richtig ein"),
  },

  // Medien
  {
    id: "medien-produktfotos",
    categorySlug: "medien",
    type: "link",
    title: "Produktfotos Juli",
    description: "Freigegebene Bilder f\u00FCr deine Posts.",
    body: body("Produktfotos Juli"),
  },
  {
    id: "medien-videos",
    categorySlug: "medien",
    type: "video",
    title: "Kurzvideos f\u00FCr Stories",
    description: "Fertige Clips zum Herunterladen.",
    body: body("Kurzvideos f\u00FCr Stories"),
  },

  // Anleitungen
  {
    id: "anleitung-bestellung",
    categorySlug: "erklaerungen",
    type: "artikel",
    title: "Bestellung anlegen \u2013 Schritt f\u00FCr Schritt",
    description: "Mit Screenshots durch den ganzen Prozess.",
    body: body("Bestellung anlegen"),
  },
  {
    id: "anleitung-versand",
    categorySlug: "erklaerungen",
    type: "pdf",
    title: "Versand und Reklamation (PDF)",
    description: "Was tun, wenn etwas schiefgeht?",
    body: body("Versand und Reklamation"),
  },

  // Kataloge
  {
    id: "kataloge-hauptkatalog",
    categorySlug: "kataloge",
    type: "pdf",
    title: "Hauptkatalog (PDF)",
    description: "Die aktuelle Ausgabe zum Teilen.",
    body: body("Hauptkatalog"),
  },
  {
    id: "kataloge-flyer",
    categorySlug: "kataloge",
    type: "pdf",
    title: "Aktionsflyer des Monats",
    description: "Kompakt f\u00FCr WhatsApp und Co.",
    body: body("Aktionsflyer des Monats"),
  },

  // Neue Produkte
  {
    id: "neu-produktliste",
    categorySlug: "neue-produkte",
    type: "artikel",
    title: "Alle Neuheiten im \u00DCberblick",
    description: "Namen, Preise und Besonderheiten.",
    body: body("Alle Neuheiten im \u00DCberblick"),
  },
  {
    id: "neu-video",
    categorySlug: "neue-produkte",
    type: "video",
    title: "Neuheiten-Video",
    description: "Die neuen Produkte in Aktion.",
    body: body("Neuheiten-Video"),
  },

  // Garzeiten
  {
    id: "garzeiten-stoneware",
    categorySlug: "garzeiten",
    type: "pdf",
    title: "Garzeiten Stoneware (PDF)",
    description: "Die wichtigsten Zeiten auf einen Blick.",
    body: body("Garzeiten Stoneware"),
  },
  {
    id: "garzeiten-zaubermeister",
    categorySlug: "garzeiten",
    type: "artikel",
    title: "Garzeiten Zaubermeister",
    description: "Brot, Braten und mehr \u2013 mit Temperaturen.",
    body: body("Garzeiten Zaubermeister"),
  },
  {
    id: "monatsmeetings-2026",
    categorySlug: "team-termine",
    type: "artikel",
    title: "Monatsmeetings 2026",
    description: "Alle Termine auf einen Blick \u2013 jeweils 20:00 Uhr.",
    body:
      "Monatsmeetings 2026\n\nBitte tragt euch die Termine ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!\n\nAlle Termine starten um 20:00 Uhr.\n\nAktiviere in der App die Erinnerungen (unter Profil), dann bekommst du automatisch einen Hinweis: einen Tag vorher um 18 Uhr und eine Stunde vor Beginn.",
    imageUrl: "/monatsmeetings-2026.jpg",
    featured: true,
  },
  {
    id: "monatsmeeting-2026-07",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting Juli",
    subtitle: "Team-Meeting",
    dateLabel: "29.07.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "coffee",
    description: "29.07. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting Juli\n\nDatum: 29.07.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-07-29",
  },
  {
    id: "monatsmeeting-2026-09",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting September",
    subtitle: "Team-Meeting",
    dateLabel: "28.09.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "team",
    description: "28.09. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting September\n\nDatum: 28.09.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-09-28",
  },
  {
    id: "monatsmeeting-2026-10",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting Oktober",
    subtitle: "Team-Meeting",
    dateLabel: "29.10.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "food",
    description: "29.10. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting Oktober\n\nDatum: 29.10.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-10-29",
  },
  {
    id: "monatsmeeting-2026-11",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting November",
    subtitle: "Team-Meeting",
    dateLabel: "26.11.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "community",
    description: "26.11. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting November\n\nDatum: 26.11.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-11-26",
  },
  {
    id: "monatsmeeting-2026-01",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting Januar",
    subtitle: "Team-Meeting",
    dateLabel: "28.01.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "products",
    description: "28.01. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting Januar\n\nDatum: 28.01.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-01-28",
  },
  {
    id: "monatsmeeting-2026-02",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting Februar",
    subtitle: "Team-Meeting",
    dateLabel: "26.02.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "coffee",
    description: "26.02. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting Februar\n\nDatum: 26.02.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-02-26",
  },
  {
    id: "monatsmeeting-2026-03",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting M\u00E4rz",
    subtitle: "Team-Meeting",
    dateLabel: "30.03.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "team",
    description: "30.03. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting M\u00E4rz\n\nDatum: 30.03.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-03-30",
  },
  {
    id: "monatsmeeting-2026-04",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting April",
    subtitle: "Team-Meeting",
    dateLabel: "29.04.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "food",
    description: "29.04. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting April\n\nDatum: 29.04.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-04-29",
  },
  {
    id: "monatsmeeting-2026-05",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting Mai",
    subtitle: "Team-Meeting",
    dateLabel: "28.05.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "community",
    description: "28.05. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting Mai\n\nDatum: 28.05.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-05-28",
  },
  {
    id: "monatsmeeting-2026-06",
    categorySlug: "team-termine",
    type: "termin",
    title: "Monatsmeeting Juni",
    subtitle: "Team-Meeting",
    dateLabel: "29.06.",
    time: "20:00 Uhr",
    accentIcon: "Users",
    photo: "products",
    description: "29.06. \u00B7 20:00 Uhr \u2013 unser monatliches Team-Meeting.",
    body:
      "Monatsmeeting Juni\n\nDatum: 29.06.2026\nUhrzeit: 20:00 Uhr\nOrt: Online \u2013 der Link folgt im Team-Chat.\n\nBitte tragt euch den Termin ein \u2013 die Meetings sind wichtig f\u00FCr euer Business!",
    date: "2026-06-29",
  },
];

// Nur echte Inhalte anzeigen: die Monatsmeetings (mit Erinnerungen verknuepft)
// bleiben, alle eingebauten Demo-/Beispielkarten werden ausgeblendet.
export const contents: ContentItem[] = alleInhalte.filter(
  (c) =>
    c.categorySlug === "team-termine" &&
    !(c.body || "").startsWith("Dies ist ein Demo-Inhalt")
);

export const featuredItems = contents.filter((c) => c.featured);

// Die drei Karten der Startseiten-Sektion "Kommende Teamschulungen".
export const homeTrainings = ["teamkochshow-sommer", "produkttraining-juli", "teammeeting-austausch"]
  .map((id) => contents.find((c) => c.id === id))
  .filter((c): c is ContentItem => Boolean(c));

export const getCategory = (slug: string) =>
  alleKategorien.find((c) => c.slug === slug);

export const getContentsByCategory = (slug: string) =>
  contents.filter((c) => c.categorySlug === slug);

export const getContentById = (id: string) =>
  contents.find((c) => c.id === id);

// Kommende, datierte Inhalte einer Kategorie (heute oder spaeter), fruehestes zuerst.
export const getUpcomingByCategory = (slug: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return contents
    .filter((c) => c.categorySlug === slug && !!c.date)
    .filter((c) => new Date(c.date as string) >= today)
    .sort((a, b) => (a.date as string).localeCompare(b.date as string));
};

export const searchContents = (query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return contents.filter((c) => {
    const cat = getCategory(c.categorySlug);
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.body.toLowerCase().includes(q) ||
      (cat ? cat.title.toLowerCase().includes(q) : false)
    );
  });
};

// Fest eingebaute Links (erscheinen im Bereich zusaetzlich zu den
// im Admin hochgeladenen Dateien). Werden nicht ueber /admin verwaltet.
export interface EingebauteDatei {
  id: string;
  art: string;
  bereich: string;
  titel: string;
  dateiname: string;
  typ: string;
  groesse: number;
  erstellt: number;
  url: string;
  vorschauUrl: string;
  istBild: boolean;
}

export const eingebauteDateien: EingebauteDatei[] = [
  {
    id: "fix-produktschulung-edelstahl",
    art: "link",
    bereich: "kfs-produktinfos",
    titel: "Produktschulung Edelstahl Kollektion",
    dateiname: "",
    typ: "link",
    groesse: 0,
    erstellt: 1755000000000,
    url: "https://stir.pamperedchef.at/produktschulung-edelstahl-kollektion/",
    vorschauUrl: "",
    istBild: false,
  },
  {
    id: "fix-katalog-issuu-fs-2026",
    art: "link",
    bereich: "kfs-kataloge",
    titel: "Katalog Fr\u00FChjahr/Sommer 2026 online bl\u00E4ttern",
    dateiname: "",
    typ: "link",
    groesse: 0,
    erstellt: 1755000000000,
    url: "https://issuu.com/pamperedchefeurope/docs/fr_hjahr_sommer_2026_katalog_-_deutschland_sterre",
    vorschauUrl: "",
    istBild: false,
  },
];
