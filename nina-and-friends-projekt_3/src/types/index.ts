export type ContentType =
  | "artikel"
  | "pdf"
  | "link"
  | "rezept"
  | "vorlage"
  | "video"
  | "termin"
  | "schulung";

export interface Category {
  slug: string;
  title: string;
  description: string;
  icon: string;
  // Slug der uebergeordneten Kategorie (leer = Hauptkategorie)
  parent?: string;
}

export interface ContentItem {
  id: string;
  categorySlug: string;
  type: ContentType;
  title: string;
  description: string;
  body: string;
  date?: string;
  featured?: boolean;
  // Zusatzfelder fuer die Schulungskarten auf der Startseite
  subtitle?: string;
  dateLabel?: string;
  time?: string;
  accentIcon?: string;
  photo?: string;
  // Aus Airtable: angehaengte Datei / Bild
  fileUrl?: string;
  fileName?: string;
  imageUrl?: string;
  // Externer Link (z. B. YouTube, Canva)
  linkUrl?: string;
  // Darf an Kundinnen weitergeleitet werden
  forCustomers?: boolean;
  // Fertiger Begleittext fuer die Weiterleitung
  shareText?: string;
  // Name der oeffentlichen Kunden-Seite (Show)
  show?: string;
}
