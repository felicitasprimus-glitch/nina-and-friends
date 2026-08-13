import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PushReminders from "../components/PushReminders";
import {
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
  Heart,
  ImageIcon,
  LogIn,
  Play,
  Settings,
  User,
} from "lucide-react";
import {
  BackButton,
  CardSkeleton,
  CategoryIcon,
  CategoryTile,
  ContentCard,
  CopyButton,
  CustomerShareButton,
  KundenTeilen,
  EmptyState,
  FavoriteButton,
  PhotoPlaceholder,
  SearchField,
  ShareButton,
  slugify,
  TypeBadge,
} from "../components/ui";
import {
  T,
  categories,
  getCategory,
} from "../data/content";
import { useKategorien } from "../hooks/useKategorien";
import {
  useContent,
  useContentById,
  useContentsByCategory,
  useSearch,
  useUpcomingByCategory,
} from "../hooks/useContent";
import { useDelayedReady } from "../hooks/useDelayedReady";
import { useFavorites } from "../hooks/useFavorites";
import { useSeitenImBereich } from "../hooks/useSeiten";
import { useDateienImBereich } from "../hooks/useDateien";

/* ---------- Kategorie-Unterseite ---------- */

// Haengt an eine Datei-Adresse den Hinweis zum Herunterladen an
function downloadLink(url: string, dateiname: string): string {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  if (url.includes("/storage/v1/object/public/")) {
    return url + sep + "download=" + encodeURIComponent(dateiname || "datei");
  }
  if (url.includes("/api/medien/")) {
    return url + sep + "download=1";
  }
  return url;
}

export function CategoryPage() {
  const { slug = "" } = useParams();
  const { finde, unter } = useKategorien();
  const category = finde(slug);
  const allItems = useContentsByCategory(slug);
  const upcoming = useUpcomingByCategory(slug);
  const { seiten } = useSeitenImBereich(slug);
  const { dateien } = useDateienImBereich(slug);
  const unterkategorien = unter(slug);
  const upcomingIds = new Set(upcoming.map((u) => u.id));
  const rest = allItems.filter((i) => !upcomingIds.has(i.id));
  const ready = useDelayedReady();

  if (!category) return <NotFoundPage />;

  return (
    <div>
      <BackButton />
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-greige-100 text-taupe-600 shadow-soft">
          <CategoryIcon name={category.icon} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-[22px] font-semibold leading-tight text-ink">
            {category.title}
          </h1>
          <p className="mt-1 text-[14px] leading-relaxed text-ink-mute">
            {category.description}
          </p>
        </div>
      </div>

      {!ready ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : allItems.length === 0 && seiten.length === 0 && dateien.length === 0 && unterkategorien.length === 0 ? (
        <EmptyState
          title="Hier entsteht gerade etwas"
          text="F\u00FCr diesen Bereich werden die Inhalte noch vorbereitet."
        />
      ) : (
        <div className="space-y-8">
          {unterkategorien.length > 0 ? (
            <section>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {unterkategorien.map((k) => (
                  <CategoryTile
                    key={k.slug}
                    slug={k.slug}
                    title={k.title}
                    icon={k.icon}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {seiten.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Seiten</h2>
              <div className="space-y-3">
                {seiten.map((s) => (
                  <Link
                    key={s.slug}
                    to={"/seite/" + s.slug}
                    className="group flex items-center gap-4 rounded-xl border border-greige-200 bg-white p-4 transition hover:border-taupe-300"
                  >
                    {s.vorschaubild ? (
                      <img
                        src={s.vorschaubild}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-greige-100 text-taupe-600">
                        <FileText className="h-5 w-5" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-ink">
                        {s.titel}
                      </span>
                      {s.untertitel ? (
                        <span className="block truncate text-[13px] text-ink-mute">
                          {s.untertitel}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {dateien.length > 0 ? (
            <section>
              <h2 className="mb-3 text-[15px] font-semibold text-ink">Dateien</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {dateien.map((d) => (
                  <div
                    key={d.id}
                    className="overflow-hidden rounded-xl border border-greige-200 bg-white"
                  >
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-greige-100">
                        {d.vorschauUrl ? (
                          <img
                            src={d.vorschauUrl}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                          />
                        ) : d.art === "youtube" ? (
                          <span className="flex h-full w-full items-center justify-center text-taupe-500">
                            <Play className="h-8 w-8" />
                          </span>
                        ) : d.art === "link" ? (
                          <span className="flex h-full w-full items-center justify-center text-taupe-500">
                            <ExternalLink className="h-8 w-8" />
                          </span>
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-taupe-500">
                            <FileText className="h-8 w-8" />
                          </span>
                        )}
                        {d.art === "youtube" || d.typ?.startsWith("video/") ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                              <Play className="h-5 w-5" />
                            </span>
                          </span>
                        ) : null}
                      </div>
                      <div className="px-3 pt-3">
                        <span className="block truncate text-[13.5px] font-semibold text-ink">
                          {d.titel}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11.5px] text-ink-mute">
                          {d.art === "youtube" || d.typ?.startsWith("video/") ? (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              Video ansehen
                            </>
                          ) : d.art === "link" ? (
                            <>
                              <ExternalLink className="h-3.5 w-3.5" />
                              {"\u00D6ffnen"}
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5" />
                              {(d.istBild ? "Bild" : "Datei") + " \u00F6ffnen"}
                            </>
                          )}
                        </span>
                      </div>
                    </a>
                    <div className="space-y-2 px-3 pb-3 pt-2">
                      {d.art === "datei" ? (
                        <a
                          href={downloadLink(
                            d.url.startsWith("http")
                              ? d.url
                              : window.location.origin + d.url,
                            d.dateiname
                          )}
                          download={d.dateiname || undefined}
                          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-greige-200 bg-white text-[12.5px] font-medium text-ink-soft transition hover:bg-greige-100"
                        >
                          <Download className="h-4 w-4" />
                          Herunterladen
                        </a>
                      ) : null}
                      <KundenTeilen
                        url={
                          d.url.startsWith("http")
                            ? d.url
                            : window.location.origin + d.url
                        }
                        title={d.titel}
                        text={d.titel}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {upcoming.length > 0 ? (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-taupe-500 text-offwhite">
                  <CalendarDays className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </span>
                <h2 className="text-[15px] font-semibold text-ink">
                  {T.upcoming}
                </h2>
              </div>
              <div className="space-y-3">
                {upcoming.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section>
              {upcoming.length > 0 ? (
                <h2 className="mb-3 text-[15px] font-semibold text-ink">
                  {T.moreContent}
                </h2>
              ) : null}
              <div className="space-y-3">
                {rest.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

/* ---------- Detailansicht ---------- */

export function DetailPage() {
  const { id = "" } = useParams();
  const item = useContentById(id);
  const ready = useDelayedReady(250);

  if (!item) return <NotFoundPage />;
  const category = getCategory(item.categorySlug);

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton />

      {!ready ? (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <article className="overflow-hidden rounded-xl border border-greige-100 bg-cream shadow-soft">
          {/* Titelbild */}
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-44 w-full object-cover sm:h-56"
            />
          ) : item.photo ? (
            <PhotoPlaceholder
              theme={item.photo as never}
              rounded="rounded-none"
              className="h-44 w-full sm:h-56"
            />
          ) : (
            <div className="flex h-44 items-center justify-center bg-greige-100 sm:h-56">
              <div className="flex flex-col items-center gap-2 text-taupe-400">
                <ImageIcon className="h-8 w-8" />
                <span className="text-[12px] font-medium uppercase tracking-wide">
                  Bild folgt
                </span>
              </div>
            </div>
          )}

          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <TypeBadge type={item.type} />
              {category ? (
                <Link
                  to={"/bereich/" + category.slug}
                  className="rounded-full bg-greige-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-taupe-700 transition hover:bg-greige-200"
                >
                  {category.title}
                </Link>
              ) : null}
            </div>

            <div>
              <h1 className="text-[24px] font-semibold leading-tight text-ink">
                {item.title}
              </h1>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">
                {item.description}
              </p>
            </div>

            <div className="whitespace-pre-line rounded-xl2 bg-offwhite p-4 text-[14.5px] leading-relaxed text-ink-soft">
              {item.body}
            </div>

            <p className="text-[12px] text-ink-mute">{T.demoNote}</p>

            {item.linkUrl ? (
              <a
                href={item.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-taupe-400 bg-white text-[14px] font-medium text-ink transition hover:bg-offwhite active:scale-[0.98]"
              >
                <ExternalLink className="h-[18px] w-[18px] text-taupe-600" />
                {item.type === "video" ? "Video ansehen" : "Link \u00F6ffnen"}
              </a>
            ) : null}

            {item.fileUrl && !item.imageUrl ? (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-taupe-400 bg-white text-[14px] font-medium text-ink transition hover:bg-offwhite active:scale-[0.98]"
              >
                <Download className="h-[18px] w-[18px] text-taupe-600" />
                {item.fileName || "Datei \u00F6ffnen"}
              </a>
            ) : null}

            {/* Weiterleitung an Kundinnen - nur bei freigegebenen Inhalten */}
            {item.forCustomers && (item.linkUrl || item.fileUrl || item.imageUrl) ? (
              <div className="space-y-2 rounded-lg border border-greige-200 bg-offwhite p-4">
                <p className="text-[13px] font-semibold text-ink">
                  Fuer deine Kundinnen
                </p>
                <p className="text-[12.5px] leading-snug text-ink-mute">
                  Sendet direkt die Datei bzw. den Link \u2013 nicht die interne
                  Team-App.
                </p>
                <CustomerShareButton
                  title={item.title}
                  url={(item.linkUrl || item.fileUrl || item.imageUrl) as string}
                  text={item.shareText || item.description}
                />
                {item.show ? (
                  <CustomerShareButton
                    title={item.show}
                    url={
                      window.location.origin + "/s/" + slugify(item.show)
                    }
                    text={"Schau mal: " + item.show}
                    label={"Ganze Seite \u201E" + item.show + "\u201C senden"}
                    variant="outline"
                  />
                ) : null}
              </div>
            ) : null}

            <div className="grid gap-2.5 sm:grid-cols-2">
              <CopyButton text={item.body} />
              <ShareButton title={item.title} text={item.description} />
              <div className="sm:col-span-2">
                <FavoriteButton id={item.id} variant="full" />
              </div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

/* ---------- Suche ---------- */

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const results = useSearch(query);

  const update = (v: string) => {
    setQuery(v);
    setParams(v.trim() ? { q: v } : {}, { replace: true });
  };

  return (
    <div>
      <h1 className="mb-4 text-[22px] font-semibold text-ink">
        {T.searchTitle}
      </h1>
      <SearchField value={query} onChange={update} autoFocus />

      <div className="mt-6">
        {query.trim() === "" ? (
          <EmptyState
            title={T.searchStartTitle}
            text={T.searchStartText}
          />
        ) : results.length === 0 ? (
          <EmptyState title={T.searchEmptyTitle} text={T.searchEmptyText} />
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-ink-mute">
              {results.length} {T.results}
            </p>
            {results.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Favoriten ---------- */

export function FavoritesPage() {
  const { favorites } = useFavorites();
  const { contents } = useContent();
  const items = contents.filter((c) => favorites.includes(c.id));

  return (
    <div>
      <h1 className="mb-4 text-[22px] font-semibold text-ink">{T.favorites}</h1>
      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={T.favoritesEmptyTitle}
          text={T.favoritesEmptyText}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Profil ---------- */

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-5 text-[22px] font-semibold text-ink">{T.profil}</h1>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-greige-100 bg-cream p-8 text-center shadow-soft">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-greige-100 text-taupe-500">
          <User className="h-9 w-9" />
        </span>
        <p className="text-[17px] font-semibold text-ink">Dein Profil</p>
        <p className="max-w-xs text-[13.5px] leading-relaxed text-ink-mute">
          {"In der Live-Version meldest du dich hier an und siehst deine pers\u00F6nlichen Inhalte, Favoriten und Einstellungen."}
        </p>
      </div>

      <div className="mt-4">
        <PushReminders />
      </div>

      <div className="mt-4 space-y-2.5">
        {[
          { icon: LogIn, label: "Anmeldung (folgt in der Live-Version)" },
          { icon: Heart, label: "Meine Favoriten", to: "/favoriten" },
          { icon: CalendarDays, label: "Meine Termine", to: "/bereich/team-termine" },
          { icon: Settings, label: "Einstellungen (folgt)" },
        ].map(({ icon: Icon, label, to }) =>
          to ? (
            <Link
              key={label}
              to={to}
              className="flex items-center gap-3 rounded-xl2 border border-greige-100 bg-cream px-4 py-3.5 text-[14px] font-medium text-ink shadow-soft transition hover:bg-greige-100"
            >
              <Icon className="h-5 w-5 text-taupe-600" />
              {label}
            </Link>
          ) : (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl2 border border-dashed border-greige-200 bg-cream/60 px-4 py-3.5 text-[14px] text-ink-mute"
            >
              <Icon className="h-5 w-5 text-greige-400" />
              {label}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ---------- 404 ---------- */

export function NotFoundPage() {
  return (
    <div>
      <BackButton />
      <EmptyState
        title="Seite nicht gefunden"
        text="Diesen Bereich gibt es noch nicht. Zur\u00FCck zur Startseite und weiterst\u00F6bern."
      />
      <div className="mt-4 text-center">
        <Link
          to="/"
          className="inline-flex h-12 items-center justify-center rounded-full bg-taupe-500 px-6 text-[14px] font-medium text-offwhite shadow-soft transition hover:bg-taupe-600"
        >
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}

/* Export der Kategorienliste fuer moegliche weitere Nutzung */
export { categories };

export function NotificationsPage() {
  const termine = useUpcomingByCategory("team-termine");
  return (
    <section className="mx-auto max-w-3xl px-4 pb-8 pt-2">
      <BackButton />
      <h1 className="mb-1 text-2xl font-semibold text-ink">Benachrichtigungen</h1>
      <p className="mb-5 text-[14px] text-ink-mute">
        {"Erinnerungen und deine n\u00E4chsten Termine."}
      </p>

      <PushReminders />

      <h2 className="mb-3 mt-6 text-[15px] font-semibold text-ink">
        {"N\u00E4chste Termine"}
      </h2>
      {termine.length === 0 ? (
        <p className="rounded-xl2 border border-greige-100 bg-cream p-4 text-[14px] text-ink-mute">
          Zurzeit stehen keine Termine an.
        </p>
      ) : (
        <div className="space-y-3">
          {termine.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
