import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  ChefHat,
  ClipboardCopy,
  Clock,
  CookingPot,
  FileDown,
  FileText,
  GraduationCap,
  Heart,
  HelpCircle,
  Home,
  Image,
  LayoutList,
  Library,
  Link2,
  ListChecks,
  Menu,
  Megaphone,
  Mic,
  Newspaper,
  PlayCircle,
  Search,
  Send,
  Share2,
  ShoppingBag,
  Sparkles,
  Sprout,
  Ticket,
  Timer,
  User,
  Users,
  X,
  Utensils,
  UtensilsCrossed,
  Archive,
  CakeSlice,
  Carrot,
  CirclePlay,
  Cylinder,
  Flame,
  Gem,
  Images,
  Layers,
  LayoutGrid,
  Leaf,
  Microwave,
  Pizza,
  Slice,
  Soup,
  Square,
  Hand,
  History,
  Hourglass,
  Rows3,
  Scale,
  Zap,
  Briefcase,
  CircleCheck,
  ClipboardList,
  Gift,
  LayoutTemplate,
  Mail,
  UserSearch,
  BookMarked,
  Boxes,
  Calendar,
  Film,
  FileStack,
  Lightbulb,
  PartyPopper,
  Percent,
  Presentation,
  Sparkle,
  UserPlus,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ContentItem, ContentType } from "../types";
import { T, getCategory, typeLabels, hauptKategorien } from "../data/content";
import { useFavorites } from "../hooks/useFavorites";
import logoLight from "../assets/logo-light.png";
import logoDark from "../assets/logo-dark.png";
import photoHero from "../assets/photos/hero.jpg";
import photoFood from "../assets/photos/food.jpg";
import photoProducts from "../assets/photos/products.jpg";
import photoCoffee from "../assets/photos/coffee.jpg";
import photoCommunity from "../assets/photos/community.jpg";
import photoTeam from "../assets/photos/team.jpg";

/* ---------- Icons ---------- */

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Users,
  Utensils,
  UtensilsCrossed,
  CookingPot,
  Newspaper,
  CalendarDays,
  GraduationCap,
  Sprout,
  Share2,
  Megaphone,
  Ticket,
  Image,
  ListChecks,
  Library,
  Sparkles,
  Timer,
  ChefHat,
  Send,
  Heart,
  ShoppingBag,
  Clock,
  LayoutList,
  HelpCircle,
  Mic,
  Bot,
  Archive,
  CakeSlice,
  Carrot,
  CirclePlay,
  Cylinder,
  Flame,
  Gem,
  Images,
  Layers,
  LayoutGrid,
  Leaf,
  Microwave,
  Pizza,
  Slice,
  Soup,
  Square,
  Hand,
  History,
  Hourglass,
  Rows3,
  Scale,
  Zap,
  Briefcase,
  CircleCheck,
  ClipboardList,
  Gift,
  LayoutTemplate,
  Mail,
  UserSearch,
  BookMarked,
  Boxes,
  Calendar,
  Film,
  FileStack,
  Lightbulb,
  PartyPopper,
  Percent,
  Presentation,
  Sparkle,
  UserPlus,
  Video,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}

const typeIconMap: Record<ContentType, LucideIcon> = {
  artikel: FileText,
  pdf: FileDown,
  link: Link2,
  rezept: CookingPot,
  vorlage: ClipboardCopy,
  video: PlayCircle,
  termin: CalendarDays,
  schulung: GraduationCap,
};

export function TypeBadge({ type }: { type: ContentType }) {
  const Icon = typeIconMap[type];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-greige-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-taupe-700">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {typeLabels[type]}
    </span>
  );
}

/* ---------- Logo ---------- */

export function Logo({
  light = false,
  className = "h-14 w-14",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link
      to="/"
      className="flex items-center justify-center"
      aria-label="Nina and Friends - Start"
    >
      <img
        src={light ? logoLight : logoDark}
        alt="Nina and Friends"
        className={className + " object-contain"}
        draggable={false}
      />
    </Link>
  );
}

/* ---------- Header ---------- */

export function AppHeader() {
  const [menuOffen, setMenuOffen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="relative">
      <LeafBranch className="pointer-events-none absolute left-1 top-6 h-16 w-24 text-greige-300/70 md:left-4" />
      <div className="mx-auto flex max-w-5xl items-start justify-between px-4 pt-3">
        <button
          type="button"
          onClick={() => setMenuOffen(true)}
          aria-label={"Men\u00FC \u00F6ffnen"}
          className="mt-3 flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition hover:bg-white/70 active:scale-95"
        >
          <Menu className="h-6 w-6" strokeWidth={1.6} />
        </button>
        <Logo className="h-[92px] w-[92px]" />
        <button
          type="button"
          onClick={() => navigate("/benachrichtigungen")}
          aria-label="Benachrichtigungen"
          className="relative mt-3 flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition hover:bg-white/70 active:scale-95"
        >
          <Bell className="h-6 w-6" strokeWidth={1.6} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-taupe-500" />
        </button>
      </div>
      <MenuDrawer offen={menuOffen} schliessen={() => setMenuOffen(false)} />
    </header>
  );
}

function MenuDrawer({
  offen,
  schliessen,
}: {
  offen: boolean;
  schliessen: () => void;
}) {
  if (!offen) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={"Men\u00FC schlie\u00DFen"}
        onClick={schliessen}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-xs flex-col bg-cream shadow-[8px_0_28px_rgba(60,52,40,0.18)]">
        <div className="flex items-center justify-between px-5 pb-3 pt-[calc(env(safe-area-inset-top)+16px)]">
          <span className="text-[15px] font-semibold text-ink">{"Men\u00FC"}</span>
          <button
            type="button"
            onClick={schliessen}
            aria-label={"Men\u00FC schlie\u00DFen"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-greige-100 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-8">
          <div className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={schliessen}
                className={({ isActive }) =>
                  "flex items-center gap-3 rounded-xl2 px-4 py-3 text-[14.5px] font-medium transition " +
                  (isActive
                    ? "bg-taupe-500 text-offwhite"
                    : "text-ink-soft hover:bg-greige-100")
                }
              >
                <Icon className="h-5 w-5" />
                {label}
              </NavLink>
            ))}
          </div>

          <div className="mb-1 mt-5 px-4 text-[11.5px] font-semibold uppercase tracking-wide text-ink-mute">
            {"Bereiche"}
          </div>
          <div className="space-y-1">
            {hauptKategorien.map((k) => (
              <Link
                key={k.slug}
                to={"/bereich/" + k.slug}
                onClick={schliessen}
                className="flex items-center gap-3 rounded-xl2 px-4 py-3 text-[14.5px] text-ink-soft transition hover:bg-greige-100"
              >
                <CategoryIcon name={k.icon} className="h-5 w-5 text-taupe-600" />
                {k.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Bottom / Side Navigation ---------- */

const navItems = [
  { to: "/", label: T.start, icon: Home, end: true },
  { to: "/suche", label: T.searchTitle, icon: Search },
  { to: "/favoriten", label: T.favorites, icon: Heart },
  { to: "/bereich/team-termine", label: T.termine, icon: CalendarDays },
  { to: "/profil", label: T.profil, icon: User },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-taupe-500 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(60,52,40,0.12)] md:hidden"
    >
      <div className="mx-auto flex max-w-5xl items-stretch justify-between px-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "flex min-w-[64px] flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition " +
              (isActive
                ? "text-offwhite"
                : "text-greige-300 hover:text-offwhite")
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={
                    "flex h-8 w-12 items-center justify-center rounded-full transition " +
                    (isActive ? "bg-taupe-600" : "")
                  }
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function SideNav() {
  return (
    <nav
      aria-label="Hauptnavigation"
      className="hidden w-56 shrink-0 md:block"
    >
      <div className="sticky top-24 flex flex-col gap-1 rounded-xl bg-cream p-3 shadow-soft">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-medium transition " +
              (isActive
                ? "bg-taupe-500 text-offwhite shadow-soft"
                : "text-ink-soft hover:bg-greige-100")
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/* ---------- Section header ---------- */

export function SectionHeader({
  title,
  linkTo,
}: {
  title: string;
  linkTo?: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
      {linkTo ? (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-[13px] font-medium text-taupe-600 transition hover:text-taupe-700"
        >
          {T.showAll}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

/* ---------- Search field ---------- */

export function SearchField({
  value,
  onChange,
  autoFocus = false,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  onSubmit?: () => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-taupe-500" strokeWidth={1.8} />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) onSubmit();
        }}
        placeholder={T.searchPlaceholder}
        aria-label={T.searchTitle}
        className="h-[54px] w-full rounded-full border border-white bg-white pl-[52px] pr-4 text-[15px] text-ink shadow-lift outline-none transition placeholder:text-ink-mute focus:border-taupe-300 focus:ring-2 focus:ring-taupe-400/25"
      />
    </div>
  );
}

/* ---------- Category tile ---------- */

export function CategoryTile({
  slug,
  title,
  icon,
}: {
  slug: string;
  title: string;
  icon: string;
}) {
  return (
    <Link
      to={"/bereich/" + slug}
      className="group flex min-h-[100px] flex-col items-center justify-center gap-2.5 rounded-lg border border-greige-200 bg-white px-3 py-4 text-center transition hover:border-taupe-300 hover:bg-offwhite active:bg-greige-100"
    >
      <CategoryIcon name={icon} className="h-7 w-7 shrink-0 text-taupe-600" />
      <span
        lang="de"
        className="w-full hyphens-auto break-words text-[12.5px] font-medium leading-snug text-ink"
      >
        {title}
      </span>
    </Link>
  );
}

/* ---------- Quick tile (weisse Kachel mit Outline-Icon) ---------- */

export function QuickTile({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      to={to}
      className="group flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-lg border border-greige-200 bg-white px-1.5 py-3 text-center transition hover:border-taupe-300 hover:bg-offwhite active:bg-greige-100"
    >
      <CategoryIcon name={icon} className="h-7 w-7 shrink-0 text-taupe-600" />
      <span
        lang="de"
        className="w-full hyphens-auto break-words text-[11.5px] font-medium leading-tight text-ink-soft"
      >
        {label}
      </span>
    </Link>
  );
}

/* ---------- Content card ---------- */

export function ContentCard({ item }: { item: ContentItem }) {
  const cat = getCategory(item.categorySlug);
  return (
    <Link
      to={"/inhalt/" + item.id}
      className="group flex items-start gap-4 rounded-xl border border-greige-200 bg-white p-4 shadow-soft transition hover:border-taupe-300 active:bg-offwhite"
    >
      <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-greige-100 text-taupe-600">
        <CategoryIcon
          name={cat ? cat.icon : "BookOpen"}
          className="h-5 w-5"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-1 block">
          <TypeBadge type={item.type} />
        </span>
        <span className="block truncate text-[15px] font-semibold text-ink">
          {item.title}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-mute">
          {item.description}
        </span>
      </span>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-greige-400 transition group-hover:translate-x-0.5 group-hover:text-taupe-500" />
    </Link>
  );
}

/* ---------- Training card (Kommende Teamschulungen) ---------- */

export function TrainingCard({ item }: { item: ContentItem }) {
  return (
    <Link
      to={"/inhalt/" + item.id}
      className="group relative flex w-[230px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-greige-200 bg-white shadow-soft transition hover:border-taupe-300 sm:w-auto sm:flex-1"
    >
      <div className="flex flex-col gap-2 p-4 pb-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-greige-100 text-taupe-600">
          <CategoryIcon name={item.accentIcon ?? "GraduationCap"} className="h-5 w-5" />
        </span>
        <div className="mt-1">
          <h3 className="text-[15.5px] font-semibold leading-tight text-ink">
            {item.title}
          </h3>
          <p className="text-[13px] leading-snug text-ink-mute">
            {item.subtitle ?? item.description}
          </p>
        </div>
        <div className="mt-1 space-y-1">
          <span className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
            <CalendarDays className="h-4 w-4 text-taupe-500" strokeWidth={1.8} />
            {item.dateLabel ?? item.date}
          </span>
          <span className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
            <Clock className="h-4 w-4 text-taupe-500" strokeWidth={1.8} />
            {item.time ?? "\u2013"}
          </span>
        </div>
      </div>
      <div className="relative mt-auto h-[74px]">
        <PhotoPlaceholder
          theme={(item.photo as never) ?? "food"}
          rounded="rounded-none"
          className="h-full w-full"
        />
        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/90 text-taupe-600 shadow-soft">
          <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
        </span>
      </div>
    </Link>
  );
}

/* ---------- Info banner ---------- */

export function InfoBanner({
  title,
  text,
  cta,
  to,
}: {
  title: string;
  text: string;
  cta: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex min-h-[150px] items-center overflow-hidden rounded-xl border border-greige-200 shadow-soft transition hover:border-taupe-300"
    >
      <img
        src={photoTeam}
        alt="Unser Team"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "72% 32%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(249,245,239,0.97) 0%, rgba(249,245,239,0.95) 42%, rgba(249,245,239,0.72) 60%, rgba(249,245,239,0.25) 80%, rgba(249,245,239,0) 100%)",
        }}
      />
      <div className="relative max-w-[62%] p-5 sm:max-w-[58%]">
        <h3 className="serif text-[22px] font-semibold leading-tight text-ink">
          {title}
        </h3>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{text}</p>
        <span className="mt-3 inline-flex rounded-lg bg-taupe-500 px-4 py-2 text-[12.5px] font-medium text-offwhite shadow-soft transition group-hover:bg-taupe-600">
          {cta}
        </span>
      </div>
    </Link>
  );
}

/* ---------- Favorite / Share buttons ---------- */

export function FavoriteButton({
  id,
  variant = "icon",
}: {
  id: string;
  variant?: "icon" | "full";
}) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(id);

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(id);
        }}
        aria-pressed={active}
        aria-label={active ? "Favorit entfernen" : T.fav}
        className={
          "flex h-11 w-11 items-center justify-center rounded-full border transition active:scale-95 " +
          (active
            ? "border-taupe-500 bg-taupe-500 text-offwhite"
            : "border-greige-200 bg-cream text-taupe-600 hover:bg-greige-100")
        }
      >
        <Heart className={"h-5 w-5 " + (active ? "fill-current" : "")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={active}
      className={
        "flex h-12 w-full items-center justify-center gap-2 rounded-full border text-[14px] font-medium transition active:scale-[0.98] " +
        (active
          ? "border-taupe-500 bg-taupe-500 text-offwhite"
          : "border-greige-200 bg-cream text-ink hover:bg-greige-100")
      }
    >
      <Heart className={"h-4.5 w-4.5 h-[18px] w-[18px] " + (active ? "fill-current" : "")} />
      {active ? T.favSaved : T.fav}
    </button>
  );
}

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [done, setDone] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      // Abbruch durch Nutzerin - kein Fehler
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-greige-200 bg-cream text-[14px] font-medium text-ink transition hover:bg-greige-100 active:scale-[0.98]"
    >
      {done ? <Check className="h-[18px] w-[18px]" /> : <Share2 className="h-[18px] w-[18px]" />}
      {done ? T.linkCopied : "Im Team teilen"}
    </button>
  );
}

/* ---------- An Kundinnen weiterleiten ---------- */
// Teilt bewusst NICHT die App-Seite, sondern die Datei bzw. den Link.
// So landet die Kundin beim Rezept/Video und nicht in der internen Team-App.

export function CustomerShareButton({
  title,
  url,
  text,
  label,
  variant = "solid",
}: {
  title: string;
  url: string;
  text?: string;
  label?: string;
  variant?: "solid" | "outline";
}) {
  const [done, setDone] = useState(false);
  const nachricht = text ? text + "\n\n" + url : url;

  const teilen = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: text || title, url });
        return;
      }
      await navigator.clipboard.writeText(nachricht);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      // Abbruch durch Nutzerin - kein Fehler
    }
  };

  const stil =
    variant === "outline"
      ? "border border-taupe-400 bg-white text-ink hover:bg-greige-100"
      : "bg-taupe-500 text-offwhite shadow-soft hover:bg-taupe-600";

  return (
    <button
      type="button"
      onClick={teilen}
      className={
        "flex h-12 w-full items-center justify-center gap-2 rounded-lg text-[14px] font-medium transition active:scale-[0.98] " +
        stil
      }
    >
      {done ? <Check className="h-[18px] w-[18px]" /> : <Send className="h-[18px] w-[18px]" />}
      {done
        ? "Kopiert \u2013 einf\u00FCgen und senden"
        : label || "An Kundin weiterleiten"}
    </button>
  );
}

// Erzeugt die Adresse der oeffentlichen Kunden-Seite aus dem Show-Namen.
export function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/\u00E4/g, "ae")
    .replace(/\u00F6/g, "oe")
    .replace(/\u00FC/g, "ue")
    .replace(/\u00DF/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      // Zwischenablage nicht verfuegbar
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-taupe-500 text-[14px] font-medium text-offwhite shadow-soft transition hover:bg-taupe-600 active:scale-[0.98]"
    >
      {done ? <Check className="h-[18px] w-[18px]" /> : <ClipboardCopy className="h-[18px] w-[18px]" />}
      {done ? T.copied : T.copyText}
    </button>
  );
}

/* ---------- Back button ---------- */

export function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
      className="mb-4 flex h-11 items-center gap-2 rounded-full pr-3 text-[14px] font-medium text-ink-soft transition hover:text-ink active:scale-95"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-greige-200 bg-cream shadow-soft">
        <ArrowLeft className="h-5 w-5" />
      </span>
      {T.back}
    </button>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({
  icon: Icon = Search,
  title,
  text,
}: {
  icon?: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-greige-300 bg-cream/60 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-greige-100 text-taupe-500">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      <p className="max-w-xs text-[13.5px] leading-relaxed text-ink-mute">
        {text}
      </p>
    </div>
  );
}

/* ---------- Skeleton ---------- */

export function CardSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-4 rounded-xl border border-greige-100 bg-cream p-4">
      <div className="h-11 w-11 rounded-2xl bg-greige-100" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 w-24 rounded-full bg-greige-100" />
        <div className="h-4 w-3/4 rounded-full bg-greige-100" />
        <div className="h-3 w-1/2 rounded-full bg-greige-100" />
      </div>
    </div>
  );
}

/* ---------- Dekoratives organisches Detail ---------- */

export function OrnamentBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 56 C 24 40, 36 30, 56 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M30 34 c 6 -1 9 -5 10 -10 c -6 1 -9 5 -10 10 Z" fill="currentColor" />
      <path d="M20 44 c 6 -1 9 -5 10 -10 c -6 1 -9 5 -10 10 Z" fill="currentColor" opacity="0.7" />
      <path d="M42 22 c 5 -1 8 -4 9 -9 c -5 1 -8 4 -9 9 Z" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/* ---------- Zweig mit Blaettern (dekoratives Detail) ---------- */

export function LeafBranch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 74 C 40 66, 78 46, 116 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      {[
        { x: 24, y: 62, r: 18, rot: -28 },
        { x: 44, y: 52, r: 20, rot: -20 },
        { x: 66, y: 40, r: 22, rot: -14 },
        { x: 88, y: 26, r: 20, rot: -8 },
        { x: 104, y: 15, r: 16, rot: -2 },
      ].map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}>
          <path
            d={`M0 0 C ${l.r * 0.5} ${-l.r * 0.6}, ${l.r} ${-l.r * 0.5}, ${l.r} 0 C ${l.r} ${l.r * 0.5}, ${l.r * 0.5} ${l.r * 0.6}, 0 0 Z`}
            fill="currentColor"
            opacity={0.55 - i * 0.05}
          />
          <path
            d={`M0 0 C ${-l.r * 0.5} ${-l.r * 0.6}, ${-l.r} ${-l.r * 0.5}, ${-l.r} 0 C ${-l.r} ${l.r * 0.5}, ${-l.r * 0.5} ${l.r * 0.6}, 0 0 Z`}
            fill="currentColor"
            opacity={0.4 - i * 0.04}
          />
        </g>
      ))}
    </svg>
  );
}

/* ---------- Foto ---------- */
// Echte Fotos, per Theme-Schluessel zugeordnet. Spaeter einfach die
// Dateien in src/assets/photos/ austauschen (gleiche Namen beibehalten).

const photoMap: Record<string, { src: string; pos: string }> = {
  team: { src: photoTeam, pos: "50% 38%" },
  hero: { src: photoHero, pos: "40% 42%" },
  food: { src: photoFood, pos: "50% 58%" },
  products: { src: photoProducts, pos: "62% 52%" },
  coffee: { src: photoCoffee, pos: "52% 58%" },
  banner: { src: photoCommunity, pos: "78% 40%" },
};

export function PhotoPlaceholder({
  theme = "hero",
  className = "",
  rounded = "rounded-xl",
}: {
  theme?: keyof typeof photoMap;
  className?: string;
  rounded?: string;
}) {
  const p = photoMap[theme] ?? photoMap.hero;
  return (
    <div className={"overflow-hidden bg-greige-100 " + rounded + " " + className}>
      <img
        src={p.src}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="h-full w-full object-cover"
        style={{ objectPosition: p.pos }}
      />
    </div>
  );
}
