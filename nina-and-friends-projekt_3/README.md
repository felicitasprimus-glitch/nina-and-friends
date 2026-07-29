# Nina and Friends - Teamplattform (Prototyp)

Klickbarer Design- und Navigationsprototyp der internen Teamplattform.
Design-Variante: **C - Community-Look** (warmes Grau, Greige, Beige, Taupe).

Alle Inhalte sind lokale Demo-Daten. Es gibt bewusst noch **keine** Datenbank,
kein Login und kein Backend.

## Technik

- React 18 + Vite 5 + TypeScript
- Tailwind CSS 3
- React Router 6
- Lucide Icons
- Favoriten via Local Storage
- Teilen via Web Share API (Fallback: Link kopieren)

## Als App auf den Home-Bildschirm ("installieren")

Die Plattform ist eine **PWA** (Progressive Web App) und laesst sich auf dem
Handy wie eine App auf den Startbildschirm legen - mit dem Nina-and-Friends-Logo
als Icon. Voraussetzung ist, dass die Seite ueber **HTTPS** laeuft
(bei Netlify automatisch der Fall).

In der App erscheint unten ein dezenter Hinweis "App auf den Startbildschirm".

**Android (Chrome):**
1. Seite oeffnen
2. Auf "Installieren" tippen (im Hinweis oder im Browser-Menue "App installieren")
3. Fertig - das Icon liegt auf dem Startbildschirm

**iPhone (Safari):**
1. Seite in **Safari** oeffnen (nicht im In-App-Browser)
2. Unten auf das Teilen-Symbol tippen
3. "Zum Home-Bildschirm" waehlen
4. Mit "Hinzufuegen" bestaetigen

Danach oeffnet sich die App im Vollbild ohne Browser-Leiste.

### PWA-Dateien

- `public/manifest.webmanifest` - Name, Farben und Icons der App
- `public/sw.js` - Service Worker (Installierbarkeit + einfache Offline-Funktion)
- `public/icons/` - App-Icons (192/512, maskable, Apple Touch Icon)

Icons kannst du spaeter mit der Original-Logodatei neu erzeugen und einfach
im Ordner `public/icons/` ersetzen (gleiche Dateinamen beibehalten).

## Admin-Bereich: der Seiten-Baukasten

Unter **`/admin`** gibt es eine Eingabe-Maske, in der die Kunden-Seiten
zusammengeklickt werden - ohne Airtable zu oeffnen.

### Einrichten

Zusaetzlich zu den Airtable-Variablen bei Netlify hinterlegen:

```
ADMIN_PASSWORT    = das Passwort fuer den Admin-Bereich
ADMIN_GEHEIMNIS   = eine lange, zufaellige Zeichenfolge (z. B. 40 Zeichen)
```

**Wichtig:** Der `AIRTABLE_TOKEN` braucht jetzt auch **Schreibrecht**.
Beim Erstellen des Tokens in Airtable diese Berechtigungen setzen:
`data.records:read` **und** `data.records:write`.

`ADMIN_GEHEIMNIS` ist frei erfunden - einfach eine lange Zufallsfolge
eintragen. Sie wird nur zum Signieren der Anmeldung benutzt und muss
niemandem bekannt sein.

### So arbeitet das Team damit

1. `https://EURE-DOMAIN/admin` aufrufen
2. Mit dem Admin-Passwort anmelden (Anmeldung gilt 12 Stunden)
3. "Neue Seite anlegen" oder eine bestehende Seite oeffnen
4. Titel und Untertitel eintragen
5. Bausteine hinzufuegen: **Text, Ueberschrift, Bild, Video, Datei,
   Knopf, Trennlinie**
6. Reihenfolge mit den Pfeilen aendern, Bausteine loeschen
7. Bilder und PDFs direkt hochladen (hoechstens 5 MB pro Datei)
8. Bei Video einfach den YouTube- oder Vimeo-Link einfuegen
9. **Speichern** - fertig
10. "Seite ansehen" oder "Link kopieren" zum Verschicken

Die Aenderungen sind sofort auf der oeffentlichen Seite sichtbar.
Kein Deployment noetig.

### Zum Passwort

Aktuell gibt es **ein gemeinsames Passwort** fuer alle Admins. Das ist der
einfache erste Schritt und fuer eine kleine Runde voellig ausreichend.
Wer es aendert, muss es allen Admins neu mitteilen; bestehende Anmeldungen
laufen nach spaetestens 12 Stunden aus.

Wenn spaeter jede Person einen **eigenen Zugang** haben soll (mit Namen und
individuellen Rechten), ist das der Umstieg auf Supabase Auth - der
Baukasten selbst bleibt dabei unveraendert.

## Inhalte aus Airtable (Pflege durch das Team)

Die App holt ihre Inhalte aus Airtable. Solange Airtable noch nicht eingerichtet
ist, zeigt die App automatisch die Demo-Inhalte - es geht also nichts kaputt.

### 1. Base in Airtable anlegen

Neue Base anlegen, darin eine Tabelle mit dem Namen **Inhalte**.
Felder genau so anlegen (Schreibweise beachten):

| Feld | Feldtyp | Inhalt |
|---|---|---|
| Titel | Einzeiliger Text | Pflichtfeld. Ohne Titel wird der Eintrag ignoriert. |
| Bereich | Einfachauswahl | Der Bereich der App (Werte siehe unten) |
| Typ | Einfachauswahl | Artikel, PDF, Link, Rezept, Vorlage, Video, Termin, Schulung |
| Beschreibung | Langer Text | Kurztext, erscheint auf der Karte |
| Inhalt | Langer Text | Der eigentliche Text der Detailseite |
| Datum | Datum | Nur bei Terminen/Schulungen |
| Uhrzeit | Einzeiliger Text | z. B. "10:00 Uhr" |
| Untertitel | Einzeiliger Text | optional, z. B. "Sommerideen" |
| Sichtbarkeit | Einfachauswahl | Alle / Direktoren (fuer spaeter, mit Login) |
| Anhang | Anhang | PDF oder Bild |
| Link | URL | Externer Link, z. B. YouTube-Video oder Canva |
| FuerKunden | Kontrollkaestchen | Haken = darf an Kundinnen weitergeleitet werden |
| Kundentext | Langer Text | Begleittext fuer die Weiterleitung (optional) |
| Show | Einzeiliger Text | Optional: Name einer Kunden-Seite aus der Tabelle "Showseiten" |
| Aktiv | Kontrollkaestchen | Haken weg = Eintrag wird ausgeblendet |

**Werte fuer das Feld "Bereich"** (genau so eintragen):

```
katalog-fs-2026, willkommen, produkte, rezepte, aktuelles,
team-termine, schulungen, teamaufbau, social-media, werbung,
gutscheine, medien, anleitungen, kataloge, neue-produkte, garzeiten
```

### 2. Zugangsdaten holen

- **Token:** In Airtable unter "Builder Hub" > "Personal access tokens" ein
  Token erstellen. Berechtigung `data.records:read` genuegt, und die Base
  auswaehlen.
- **Base-ID:** steht in der Airtable-URL, beginnt mit `app...`

### 3. Bei Netlify hinterlegen

Netlify > Site configuration > Environment variables:

```
AIRTABLE_TOKEN     = dein Token
AIRTABLE_BASE_ID   = appXXXXXXXXXXXXXX
AIRTABLE_TABLE     = Inhalte     (optional)
```

Danach einmal neu deployen ("Trigger deploy"). Fertig - die App zieht ihre
Inhalte jetzt aus Airtable.

**Wichtig:** Der Token liegt ausschliesslich bei Netlify auf dem Server
(in `netlify/functions/inhalte.mjs`). Er ist im Browser nicht sichtbar und
gehoert niemals in den App-Code.

### Wie das Team pflegt

Nina und die Pfleger:innen arbeiten nur in Airtable: Zeile anlegen, Felder
ausfuellen, PDF/Bild anhaengen, fertig. Die App zeigt Aenderungen nach
spaetestens einer Minute an - kein neues Deployment noetig.

Zugriffsrechte werden in Airtable pro Person vergeben (Nina als Besitzerin,
die anderen als Bearbeiter:innen).

### Oeffentliche Kunden-Seiten ("Shows")

Wie bei Boards: eine durchgehende Seite zum Scrollen, auf der sich Text,
Bilder und Videos abwechseln. Verschickt wird nur ein Link.

Dafuer gibt es eine **zweite Airtable-Tabelle: "Showseiten"**.
Jede Zeile ist ein Baustein der Seite.

| Feld | Feldtyp | Inhalt |
|---|---|---|
| Seite | Einzeiliger Text | Name der Seite, z. B. "AirFryer Sommer Show" |
| Bereich | Einzeiliger Text | In welcher Kategorie die Seite erscheint (Slug, siehe Liste) |
| FuerKunden | Kontrollkaestchen | Haken = darf an Kundinnen weitergeleitet werden |
| Reihenfolge | Zahl | 1, 2, 3 ... bestimmt die Reihenfolge auf der Seite |
| Typ | Einfachauswahl | Text, Ueberschrift, Bild, Video, Datei, Knopf, Trenner |
| Text | Langer Text | Der Text. Leerzeile = neuer Absatz. Emojis sind erlaubt. |
| Medien | Anhang | Bild, Video-Datei oder PDF |
| Link | URL | YouTube- oder Vimeo-Link (wird eingebettet), oder Ziel fuer "Knopf" |
| Knopftext | Einzeiliger Text | Beschriftung des Knopfes, z. B. "Jetzt bestellen" |
| Seitentitel | Einzeiliger Text | nur in EINER Zeile ausfuellen: Ueberschrift der ganzen Seite |
| Seitentext | Langer Text | nur in EINER Zeile: kurzer Untertitel der Seite |
| Aktiv | Kontrollkaestchen | Haken weg = Baustein wird ausgeblendet |

**So legt Nina eine Seite an:**
1. Fuer jeden Abschnitt eine Zeile anlegen, alle mit demselben Wert bei **Seite**
2. **Reihenfolge** durchnummerieren (1, 2, 3 ...)
3. Bei einer Zeile **Seitentitel** und **Seitentext** ausfuellen
4. Fertig - die Seite ist erreichbar unter:
   `https://EURE-DOMAIN/s/airfryer-sommer-show`

Die Adresse entsteht automatisch aus dem Namen (klein, ohne Umlaute,
Leerzeichen werden zu Bindestrichen).

**Videos:** YouTube- und Vimeo-Links werden direkt in die Seite eingebettet und
sind dort abspielbar. Eigene Videodateien koennen auch hochgeladen werden -
wegen des Airtable-Speicherplatzes sind YouTube-Links aber die bessere Wahl.

**Wichtig:** Diese Seiten sind absichtlich oeffentlich - jede/r mit dem Link
kann sie oeffnen. Die interne Team-App bleibt davon getrennt; von der
Kunden-Seite fuehrt kein Weg dorthin.

Die Seiten werden komplett auf dem Server erzeugt (`netlify/functions/show.mjs`).
Dadurch zeigen WhatsApp, Facebook und Co. beim Verschicken eine richtige
Vorschau mit Bild und Titel. Als Vorschaubild dient das erste Bild der Seite.


### Seiten in Kategorien

Jede Seite kann einer der Kategorien der App zugeordnet werden. Im Baukasten
waehlt man die Kategorie einfach aus einer Liste - sie erscheint dann in der App
unter dem entsprechenden Bereich ganz oben unter der Ueberschrift "Seiten".

Ist der Haken **"Darf an Kundinnen weitergeleitet werden"** gesetzt, erscheint
in der App zusaetzlich ein Knopf zum Verschicken. Die Kundin bekommt dann die
oeffentliche Fassung unter `/s/...` zu sehen - nicht die interne App.

Alle verfuegbaren Kategorien (Slugs):

```
katalog-fs-26, zum-verschicken, willkommen, produkte, kochshow,
aktuelles, team-termine, schulungen, teamaufbau, werbung, team,
shoppen, rezepte, gutscheine, medien, der-loeffel, rubriken-loeffel,
erklaerungen, social-media, externe-speaker, garzeiten,
about-boards, neue-produkte, kataloge
```


### Unterkategorien

Kategorien koennen Unterkategorien haben. "Pampered Chef Produkte" enthaelt
zum Beispiel 27 Unterkategorien (Stoneware, Backformen, Gewuerze ...).
Beim Oeffnen der Kategorie erscheinen sie als Kachelgitter.

Im Baukasten stehen Unterkategorien in der Auswahlliste eingerueckt unter
ihrer Hauptkategorie und sind mit einem Gedankenstrich gekennzeichnet.

Neue Unterkategorien werden in `src/data/content.ts` in der Liste
`unterKategorien` ergaenzt (Feld `parent` = Slug der Hauptkategorie).

Slugs der Unterkategorien von "Pampered Chef Produkte":

```
pk-keramik-pfannen, pk-stoneware, pk-brilliance, pk-edelstahl,
pk-edelstahl-alt, pk-gusseisen, pk-backformen, pk-kuchengitter,
pk-teigunterlage, pk-teigroller, pk-pizzaschneider, pk-schneiden,
pk-glasschalen, pk-tableware, pk-mikrowelle, pk-paprika, pk-gewuerze,
pk-erklaervideos, pk-produktfolien-2026, pk-neu-sept-2025, pk-neu-maerz-2025,
pk-aufbewahren, pk-kochhelfer, pk-handschuhe, pk-elektro,
pk-modulare-bleche, pk-alte-dateien
```

Slugs der Unterkategorien von "Alles fuer deine Kochshow":

```
ks-gastgebersuche, ks-gastgebervorteile, ks-vorlagen, ks-einladungen,
ks-mitnehmen, ks-nachbereitung, ks-feedback-planer
```

Weitere Unterkategorien:

```
Aktuelles aus dem Monat:
  ak-folien-juli, ak-angebotsfolien, ak-teamfolien, ak-gewuerzvideos,
  ak-bbq, ak-berater-werden, ak-juni

Schulungen:      su-weitere, su-produkte
Team:            tm-inspirationen, tm-events
Werbung:         we-logos

Neue Produkte Sept. 2025 (dritte Ebene, unter pk-neu-sept-2025):
  ns-erklaervideo, ns-folien, ns-produktvideos, ns-beispielbilder,
  ns-pc-videos, ns-pc-bilder
```

**Mehrere Ebenen:** Unterkategorien koennen selbst wieder Unterkategorien
haben - "Neue Produkte Sept. 2025" ist ein Beispiel dafuer. Die App zeigt das
automatisch an, es ist keine Anpassung noetig.

### Weiterleiten an Kundinnen

Setzt Nina bei einem Eintrag den Haken **FuerKunden**, erscheint in der App der
Button "An Kundin weiterleiten". Wichtig: Damit wird **nicht** die App-Seite
geteilt, sondern direkt die Datei bzw. der Link (PDF, Bild, YouTube-Video).
Die Kundin bekommt also nur das Rezept oder das Video - und keinen Zugang zu
internen Inhalten wie Schulungen oder Teamaufbau.

Optional kann im Feld **Kundentext** ein fertiger Begleittext hinterlegt werden,
der beim Teilen gleich mitgeschickt wird.

Auf dem Handy oeffnet sich das gewohnte Teilen-Menue (WhatsApp, Mail, ...),
am Rechner werden Text und Link in die Zwischenablage kopiert.

**Hinweis zu Airtable-Anhaengen:** Die Datei-Links sind nicht oeffentlich
auffindbar, aber wer den Link hat, kann die Datei oeffnen. Fuer Rezepte und
Werbematerial ist das gewollt. Vertrauliches gehoert nicht in Eintraege mit
dem Haken "FuerKunden".

## Lokal starten

```bash
npm install
npm run dev
```

Danach im Browser: http://localhost:5173

## Produktions-Build

```bash
npm run build
```

Der fertige Build liegt im Ordner `dist/`.
Vorschau des Builds: `npm run preview`

## Deployment bei Netlify

**Variante A - Drag and Drop:**

1. `npm run build` ausfuehren
2. Auf https://app.netlify.com den Ordner `dist/` per Drag and Drop hochladen
3. Fertig - die SPA-Weiterleitung liegt bereits als `_redirects` im Build

**Variante B - GitHub-Anbindung:**

1. Repository zu GitHub hochladen
2. Bei Netlify "Import from Git" waehlen
3. Build command: `npm run build` - Publish directory: `dist`
   (steht beides schon in der `netlify.toml`, Netlify uebernimmt es automatisch)

Unterseiten wie `/bereich/rezepte` funktionieren dank SPA-Redirect
(`netlify.toml` + `public/_redirects`) auch bei direktem Aufruf.

## Projektstruktur

```
src/
  components/   wiederverwendbare UI-Bausteine (Header, Nav, Karten, Buttons)
  layouts/      App-Layout mit Header + Navigation
  pages/        Start, Suche, Favoriten, Profil, Bereich, Detail, 404
  data/         zentrale Demo-Daten (spaeter durch Datenbank ersetzbar)
  hooks/        Favoriten (Local Storage), Ladezustand
  types/        TypeScript-Typen
```

## Was der Prototyp bereits kann

- vollstaendige Navigation (Bottom-Nav mobil, Side-Nav ab Tablet)
- 16 Bereiche mit eigenen Unterseiten und Demo-Inhalten
- Detailansicht mit Text kopieren, Teilen, Favorit speichern
- Suche ueber alle Demo-Inhalte
- Favoriten bleiben im Browser gespeichert
- Lade- und Leerzustaende, sanfte Uebergaenge
- responsive von Smartphone bis Desktop

## Naechste Ausbaustufen (bewusst noch nicht enthalten)

- echte Anmeldung / Benutzerverwaltung
- Datenbank (z. B. Supabase) statt Demo-Daten
- Datei-Uploads und echte PDFs/Videos
- Push-Benachrichtigungen

## Logo

Das Logo im Header ist ein Platzhalter aus Text. Die originale Logodatei
kann spaeter in `src/components/ui.tsx` in der `Logo`-Komponente
eingesetzt werden (z. B. als SVG oder PNG in `src/assets/`).
