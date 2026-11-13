import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownUp, ArrowRight } from "lucide-react";
import { swapSelectedPhotos, usePhotoLibrary } from "@/lib/photoLibrary";
import BrandMark from "@/components/home/BrandMark";
import PhotoSlot from "@/components/home/PhotoSlot";
import PhotoPicker from "@/components/home/PhotoPicker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PixCompare Mb — confronto foto pixel-perfect" },
      {
        name: "description",
        content:
          "Confronta due foto con zoom e pan sincronizzati, fino a 20×, senza interpolazione: ogni pixel resta nitido.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { selection } = usePhotoLibrary();
  const navigate = useNavigate();
  const [pickSlot, setPickSlot] = useState(null);
  const ready = Boolean(selection.a && selection.b);

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
            <h1 className="font-heading text-[17px] font-semibold tracking-tight">PixCompare Mb</h1>
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              pixel-perfect
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          v1.0
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full min-h-0 max-w-xl flex-1 flex-col gap-2 px-4 py-2">
        <PhotoSlot
          label="Foto A"
          position="sopra"
          asset={selection.a}
          onSelect={() => setPickSlot("a")}
        />
        <PhotoSlot
          label="Foto B"
          position="sotto"
          asset={selection.b}
          onSelect={() => setPickSlot("b")}
        />
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-xl shrink-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex w-full gap-2">
          <button
            type="button"
            disabled={!ready}
            onClick={swapSelectedPhotos}
            aria-label="Inverti le fotografie A e B"
            title="Inverti le fotografie A e B"
            className="inline-flex h-12 min-w-0 flex-[2] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-2 text-[14px] font-semibold text-foreground transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowDownUp className="h-4 w-4 shrink-0" />
            Inverti
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => navigate({ to: "/compare" })}
            className="inline-flex h-12 min-w-0 flex-[3] items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-[15px] font-semibold text-primary-foreground transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/30"
          >
            Confronta
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </footer>

      {pickSlot && <PhotoPicker slot={pickSlot} onClose={() => setPickSlot(null)} />}
    </div>
  );
}