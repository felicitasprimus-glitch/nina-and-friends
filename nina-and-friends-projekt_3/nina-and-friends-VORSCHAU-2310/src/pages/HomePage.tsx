import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import {
  CategoryTile,
  InfoBanner,
  PhotoPlaceholder,
  QuickTile,
  SearchField,
  SectionHeader,
  TrainingCard,
} from "../components/ui";
import { T } from "../data/content";
import { useKategorien } from "../hooks/useKategorien";
import { useHomeTrainings } from "../hooks/useContent";

const quickTiles = [
  { to: "/bereich/rezepte", label: "Team\u00ADkochshow", icon: "ChefHat" },
  { to: "/bereich/team-termine", label: "Team-Termine", icon: "CalendarDays" },
  { to: "/bereich/rezepte", label: "Rezepte", icon: "BookOpen" },
  { to: "/bereich/kataloge", label: "Kataloge", icon: "ShoppingBag" },
  { to: "/bereich/aktuelles", label: "Aktuelles aus dem Monat", icon: "Sparkles" },
  { to: "/bereich/social-media", label: "Zum Verschicken", icon: "Send" },
  { to: "/favoriten", label: "Favoriten", icon: "Heart" },
  { to: "/bereich/teamaufbau", label: "Team", icon: "Users" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { haupt } = useKategorien();
  const homeTrainings = useHomeTrainings();

  const goSearch = () => {
    navigate("/suche" + (query.trim() ? "?q=" + encodeURIComponent(query) : ""));
  };

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="flex items-start gap-3">
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="serif text-[34px] font-semibold leading-[1.04] text-ink sm:text-[42px]">
            {T.heroTitle}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[15px] leading-snug text-ink-soft">
            {T.heroSub}
            <Heart className="h-4 w-4 shrink-0 text-taupe-400" strokeWidth={1.6} />
          </p>
        </div>
        <PhotoPlaceholder
          theme="team"
          className="h-32 w-28 shrink-0 sm:h-44 sm:w-52"
        />
      </section>

      {/* Suche */}
      <SearchField value={query} onChange={setQuery} onSubmit={goSearch} />

      {/* Kommende Teamschulungen */}
      <section>
        <SectionHeader title={T.upcomingTrainings} linkTo="/bereich/schulungen" />
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
          {homeTrainings.map((item) => (
            <TrainingCard key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
          {homeTrainings.map((_, i) => (
            <span
              key={i}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === 0 ? "w-5 bg-taupe-500" : "w-1.5 bg-greige-300")
              }
            />
          ))}
        </div>
      </section>

      {/* Schnellzugriff */}
      <section>
        <SectionHeader title={T.quick} />
        <div className="grid grid-cols-4 gap-3">
          {quickTiles.map((q) => (
            <QuickTile key={q.label} {...q} />
          ))}
        </div>
      </section>

      {/* Info-Banner */}
      <InfoBanner
        title={T.bannerTitle}
        text={T.bannerText}
        cta={T.bannerCta}
        to="/bereich/aktuelles"
      />

      {/* Alle Bereiche */}
      <section>
        <SectionHeader title={T.allAreas} linkTo="/bereich/aktuelles" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {haupt.map((c) => (
            <CategoryTile key={c.slug} slug={c.slug} title={c.title} icon={c.icon} />
          ))}
        </div>
      </section>
    </div>
  );
}
