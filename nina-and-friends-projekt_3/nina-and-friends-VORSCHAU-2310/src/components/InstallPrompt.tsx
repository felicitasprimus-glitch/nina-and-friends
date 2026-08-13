import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

const DISMISS_KEY = "naf-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS feuert kein beforeinstallprompt -> eigener Hinweis
    if (isIos()) {
      const t = window.setTimeout(() => setShow(true), 1500);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setShow(false);
    setShowIosHint(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // kein Speicher - Hinweis erscheint dann in dieser Sitzung erneut
    }
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setShow(false);
      return;
    }
    // iOS: Anleitung einblenden
    setShowIosHint(true);
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-x-3 bottom-[86px] z-50 mx-auto max-w-md md:bottom-6">
        <div className="flex items-center gap-3 rounded-xl border border-greige-200 bg-cream p-3 pr-2 shadow-lift">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-greige-100 text-taupe-600">
            <Download className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold leading-tight text-ink">
              App auf den Startbildschirm
            </p>
            <p className="text-[12.5px] leading-snug text-ink-mute">
              Nina and Friends wie eine App \u00F6ffnen \u2013 mit Logo.
            </p>
          </div>
          <button
            type="button"
            onClick={install}
            className="h-10 shrink-0 rounded-full bg-taupe-500 px-4 text-[13px] font-medium text-offwhite transition hover:bg-taupe-600 active:scale-95"
          >
            {deferred ? "Installieren" : "Anleitung"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Hinweis schlie\u00DFen"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-mute transition hover:bg-greige-100"
          >
            <X className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          </button>
        </div>
      </div>

      {showIosHint ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/30 p-4 backdrop-blur-sm"
          onClick={() => setShowIosHint(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-cream p-6 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-[18px] font-semibold text-ink">
                App installieren
              </h2>
              <button
                type="button"
                onClick={() => setShowIosHint(false)}
                aria-label="Schlie\u00DFen"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mute transition hover:bg-greige-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ol className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-taupe-500 text-[14px] font-semibold text-offwhite">
                  1
                </span>
                <span className="flex items-center gap-2 text-[14.5px] text-ink-soft">
                  Unten auf das Teilen-Symbol tippen
                  <Share className="h-5 w-5 text-taupe-600" />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-taupe-500 text-[14px] font-semibold text-offwhite">
                  2
                </span>
                <span className="flex items-center gap-2 text-[14.5px] text-ink-soft">
                  {"\u201EZum Home-Bildschirm\u201C"} w\u00E4hlen
                  <SquarePlus className="h-5 w-5 text-taupe-600" />
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-taupe-500 text-[14px] font-semibold text-offwhite">
                  3
                </span>
                <span className="text-[14.5px] text-ink-soft">
                  Mit {"\u201EHinzuf\u00FCgen\u201C"} best\u00E4tigen \u2013 fertig!
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={dismiss}
              className="mt-6 h-11 w-full rounded-full bg-taupe-500 text-[14px] font-medium text-offwhite transition hover:bg-taupe-600"
            >
              Verstanden
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
