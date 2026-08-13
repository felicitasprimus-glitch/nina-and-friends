import { useEffect, useState } from "react";
import { BellRing, BellOff, Check, Smartphone } from "lucide-react";
import {
  erinnerungenAktivieren,
  istIOS,
  istInstalliert,
  pushMoeglich,
  pushStatus,
  type PushStatus,
} from "../lib/push";

// Karte im Profil: schaltet die automatischen Meeting-Erinnerungen ein.
export default function PushReminders() {
  const [status, setStatus] = useState<PushStatus>("default");
  const [laedt, setLaedt] = useState(false);
  const [iosHinweis, setIosHinweis] = useState(false);

  useEffect(() => {
    setStatus(pushStatus());
    // iPhone ohne Installation: Push geht erst nach Home-Bildschirm.
    if (istIOS() && !istInstalliert()) setIosHinweis(true);
  }, []);

  async function aktivieren() {
    if (istIOS() && !istInstalliert()) {
      setIosHinweis(true);
      return;
    }
    setLaedt(true);
    try {
      setStatus(await erinnerungenAktivieren());
    } finally {
      setLaedt(false);
    }
  }

  const aktiv = status === "granted";
  const gesperrt = status === "denied";
  const nichtMoeglich = !pushMoeglich();

  return (
    <div className="rounded-xl2 border border-greige-100 bg-cream p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-greige-100 text-taupe-600">
          {aktiv ? <Check className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink">
            {"Meeting-Erinnerungen"}
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink-mute">
            {aktiv
              ? "Aktiv \u2013 du bekommst automatisch einen Hinweis: einen Tag vorher und eine Stunde vor Beginn."
              : "Aktiviere Push-Nachrichten und verpasse kein Monatsmeeting mehr."}
          </p>

          {iosHinweis ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-greige-200 bg-cream/70 p-3 text-[12.5px] leading-relaxed text-ink-mute">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-taupe-600" />
              <span>
                {"Auf dem iPhone zuerst die App zum Home-Bildschirm hinzuf\u00FCgen: unten auf Teilen tippen \u2192 \u201EZum Home-Bildschirm\u201C. Danach die App vom Home-Bildschirm \u00F6ffnen und hier aktivieren."}
              </span>
            </div>
          ) : null}

          {nichtMoeglich ? (
            <p className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-mute">
              <BellOff className="h-4 w-4" />
              {"Dein Browser unterst\u00FCtzt keine Push-Nachrichten."}
            </p>
          ) : gesperrt ? (
            <p className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-mute">
              <BellOff className="h-4 w-4" />
              {"Benachrichtigungen sind blockiert. Bitte in den Einstellungen deines Browsers erlauben."}
            </p>
          ) : !aktiv ? (
            <button
              onClick={aktivieren}
              disabled={laedt}
              className="mt-3 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-taupe-500 px-5 text-[14px] font-medium text-offwhite shadow-soft transition hover:bg-taupe-600 disabled:opacity-60"
            >
              <BellRing className="h-4 w-4" />
              {laedt ? "Einen Moment \u2026" : "Erinnerungen aktivieren"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
