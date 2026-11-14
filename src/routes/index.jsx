import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownUp, ArrowLeftRight, ArrowRight } from "lucide-react";
import {
  PHOTO_SLOTS,
  setCompareCount,
  swapSelectedPhotos,
  usePhotoLibrary,
} from "@/lib/photoLibrary";
import BrandMark from "@/components/home/BrandMark";
import { useTranslation } from "@/lib/i18n";
import PhotoSlot from "@/components/home/PhotoSlot";
import PhotoPicker from "@/components/home/PhotoPicker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PixCompare by MarcoB — Pixel-perfect photo comparison" },
      {
        name: "description",
        content: "Compare two to four photos with synchronized zoom and pan.",
      },
    ],
  }),
  component: HomePage,
});

const LETTER = { a: "A", b: "B", c: "C", d: "D" };

// Posizioni dei pulsanti sopra i divisori fra le anteprime.
// Con quattro foto: A-B, C-D (orizzontali); A-C, B-D (verticali).
const SWAPS = {
  2: [{ a: "a", b: "b", x: 50, y: 50, horizontal: false }],
  3: [
    { a: "a", b: "b", x: 50, y: 100 / 3, horizontal: false },
    { a: "b", b: "c", x: 50, y: 200 / 3, horizontal: false },
  ],
  4: [
    { a: "a", b: "b", x: 50, y: 25, horizontal: true },
    { a: "c", b: "d", x: 50, y: 75, horizontal: true },
    { a: "a", b: "c", x: 25, y: 50, horizontal: false },
    { a: "b", b: "d", x: 75, y: 50, horizontal: false },
  ],
};

function getPosition(count, slot, t) {
  if (count === 4) {
    return { a: t("topLeft"), b: t("topRight"), c: t("bottomLeft"), d: t("bottomRight") }[slot];
  }
  if (count === 3) return { a: t("top"), b: t("middle"), c: t("bottom") }[slot];
  return { a: t("top"), b: t("bottom") }[slot];
}

function HomePage() {
  const { t } = useTranslation();
  const { selection, compareCount } = usePhotoLibrary();
  const navigate = useNavigate();
  const [pickSlot, setPickSlot] = useState(null);
  const activeSlots = PHOTO_SLOTS.slice(0, compareCount);
  const ready = activeSlots.every((slot) => Boolean(selection[slot]));

  return (
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(120% 55% at 50% -10%, rgba(205,255,87,0.10), transparent 62%), radial-gradient(90% 40% at 100% 100%, rgba(120,140,255,0.06), transparent 60%)",
        }}
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <div className="leading-none">
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <h1 className="font-heading text-[17px] font-semibold tracking-tight">PixCompare</h1>
              <span className="text-[11px] font-medium italic text-primary">by MarcoB</span>
            </div>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              pixel-perfect
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          v1.1
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full min-h-0 max-w-xl flex-1 flex-col gap-2 px-4 py-2">
        <div className="flex h-9 shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1" role="group" aria-label={t("comparePhotosAria")}>
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              aria-pressed={compareCount === count}
              onClick={() => setCompareCount(count)}
              className={`h-full min-w-0 flex-1 rounded-lg font-mono text-[11px] font-semibold transition active:scale-[0.98] ${
                compareCount === count
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-white/10"
              }`}
            >
              {count} {t("photos")}
            </button>
          ))}
        </div>

        <div
          className="relative grid min-h-0 flex-1 gap-[3px]"
          style={{
            gridTemplateColumns: compareCount === 4 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
            gridTemplateRows: `repeat(${compareCount === 3 ? 3 : 2}, minmax(0, 1fr))`,
          }}
        >
          {activeSlots.map((slot) => (
            <PhotoSlot
              key={slot}
              label={`${t("photo")} ${LETTER[slot]}`}
              position={getPosition(compareCount, slot, t)}
              asset={selection[slot]}
              compact={compareCount === 4}
              onSelect={() => setPickSlot(slot)}
            />
          ))}

          {SWAPS[compareCount].map(({ a, b, x, y, horizontal }) => (
            <button
              key={`${a}-${b}`}
              type="button"
              disabled={!selection[a] || !selection[b]}
              onClick={() => swapSelectedPhotos(a, b)}
              title={t("swapPhotos", { a: LETTER[a], b: LETTER[b] })}
              aria-label={t("invertPhotos", { a: LETTER[a], b: LETTER[b] })}
              className="absolute z-10 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-[#151719]/90 text-primary shadow-lg transition active:scale-95 disabled:opacity-35"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            >
              {horizontal ? <ArrowLeftRight className="h-4 w-4" /> : <ArrowDownUp className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-xl shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() => navigate({ to: "/compare" })}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-[15px] font-semibold text-primary-foreground transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/30"
        >
          {t("compare")}
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </footer>

      {pickSlot && <PhotoPicker slot={pickSlot} onClose={() => setPickSlot(null)} />}
    </div>
  );
}
