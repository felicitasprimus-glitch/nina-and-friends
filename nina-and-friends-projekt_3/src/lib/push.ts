// Client-Helfer fuer Web-Push.
// Der oeffentliche VAPID-Schluessel darf im Browser stehen.

const VAPID_PUBLIC_KEY =
  "BHF7sHfbKvAHSmd1kJ1wzZeeBkujcIsDnRIe_tTsOpuoc3MTP6iRpl6RL8Gwy7jMLaiwWrOg7P-65v4IOHAk0O0";

export type PushStatus = "unsupported" | "default" | "granted" | "denied";

// Laeuft die App als installierte PWA (Home-Bildschirm)?
export function istInstalliert(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return standalone || iosStandalone;
}

export function istIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function pushMoeglich(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function pushStatus(): PushStatus {
  if (!pushMoeglich()) return "unsupported";
  return Notification.permission as PushStatus;
}

function schluesselUmwandeln(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const roh = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const daten = atob(roh);
  const out = new Uint8Array(daten.length);
  for (let i = 0; i < daten.length; i += 1) out[i] = daten.charCodeAt(i);
  return out;
}

// Erlaubnis holen, Abo anlegen und an den Server schicken.
// Gibt den neuen Status zurueck.
export async function erinnerungenAktivieren(): Promise<PushStatus> {
  if (!pushMoeglich()) return "unsupported";

  const erlaubnis = await Notification.requestPermission();
  if (erlaubnis !== "granted") return erlaubnis as PushStatus;

  const reg = await navigator.serviceWorker.ready;

  let abo = await reg.pushManager.getSubscription();
  if (!abo) {
    abo = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: schluesselUmwandeln(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: abo }),
  });

  return "granted";
}
