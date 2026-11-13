import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, ArrowLeft } from "lucide-react";
import ComparePane from "./ComparePane";
import PaneMenu from "./PaneMenu";
import HdrToggle from "./HdrToggle";
import { readExif } from "@/lib/exif";
import { swapSelectedPhotos } from "@/lib/photoLibrary";
import { IDENTITY, compose, extractDelta } from "@/lib/transform";

const LETTERS = ["A", "B", "C", "D"];

export default function CompareScreen({ photos, onBack }) {
  // Le istanze delle fotografie hanno un identificativo stabile.
  // Scambiare A e B nel confronto a due non ricrea i canvas né ricarica i JPEG HDR.
  const initialPhotos = useRef(photos).current;
  const count = initialPhotos.length;
  const canUseHdr = count === 2;
  const [order, setOrder] = useState(() => initialPhotos.map(({ slot }) => slot));
  const [exif, setExif] = useState({});
  const [synced, setSynced] = useState(true);
  const [showExif, setShowExif] = useState(false);
  const [showGcam, setShowGcam] = useState(false);
  const [showZoom, setShowZoom] = useState(true);
  const [hdr, setHdr] = useState(false);

  const assetsBySlot = Object.fromEntries(initialPhotos.map(({ slot, asset }) => [slot, asset]));
  const views = useRef({});
  const baselines = useRef({});
  const paneRefs = useRef({});
  const syncedRef = useRef(true);

  // Ref per ogni foto, non per la posizione: EXIF, zoom e risorse grafiche
  // seguono la fotografia anche dopo lo scambio delle posizioni.
  for (const { slot } of initialPhotos) {
    if (!paneRefs.current[slot]) paneRefs.current[slot] = { current: null };
    if (!views.current[slot]) views.current[slot] = IDENTITY;
    if (!baselines.current[slot]) baselines.current[slot] = IDENTITY;
  }

  useEffect(() => {
    let alive = true;
    Promise.allSettled(initialPhotos.map(({ asset }) => readExif(asset.file))).then((results) => {
      if (!alive) return;
      const entries = initialPhotos.map(({ slot }, index) => [
        slot,
        results[index].status === "fulfilled" ? results[index].value : null,
      ]);
      setExif(Object.fromEntries(entries));
    });
    return () => { alive = false; };
  }, [initialPhotos]);

  // Applica la stessa variazione di zoom/pan a tutti gli altri riquadri,
  // mantenendo le rispettive posizioni di partenza.
  const handleChange = (slot, next) => {
    views.current = { ...views.current, [slot]: next };
    if (!syncedRef.current) return;

    const delta = extractDelta(baselines.current[slot], next);
    for (const { slot: other } of initialPhotos) {
      if (other === slot) continue;
      const target = compose(baselines.current[other], delta);
      const api = paneRefs.current[other].current;
      const clamped = api ? api.clamp(target) : target;
      views.current = { ...views.current, [other]: clamped };
      api?.apply(clamped);
    }
  };

  const toggleSync = (value) => {
    syncedRef.current = value;
    setSynced(value);
    if (value) {
      baselines.current = { ...views.current };
    }
  };

  const invertPhotos = () => {
    if (!canUseHdr) return;
    // Mantiene lo stesso ordine anche quando si torna alla schermata iniziale.
    swapSelectedPhotos(order[0], order[1]);
    setOrder((current) => [current[1], current[0]]);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between gap-1 px-1.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Torna alla selezione"
          className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1">
          {canUseHdr && (
            <button
              type="button"
              onClick={invertPhotos}
              aria-label="Inverti le fotografie A e B"
              title="Inverti le fotografie A e B"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-full px-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-white/75 transition hover:bg-white/10 active:scale-95"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              Inverti
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleSync(!synced)}
            aria-pressed={synced}
            aria-label={synced ? "SYNC attivo: disattiva la sincronizzazione" : "SYNC disattivato: attiva la sincronizzazione"}
            title="Sincronizza zoom e spostamento"
            className={`h-9 rounded-full px-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition active:scale-95 ${
              synced ? "bg-primary/15 text-primary" : "text-white/45 hover:bg-white/10"
            }`}
          >
            SYNC
          </button>
          {canUseHdr && <HdrToggle hdr={hdr} onToggle={setHdr} />}
          <PaneMenu
            showExif={showExif}
            onShowExifChange={setShowExif}
            showGcam={showGcam}
            onShowGcamChange={setShowGcam}
            showZoom={showZoom}
            onShowZoomChange={setShowZoom}
          />
        </div>
      </header>

      <div
        className="grid min-h-0 flex-1 gap-px bg-white/30"
        style={{
          gridTemplateColumns: count === 4 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
          gridTemplateRows: `repeat(${count === 3 ? 3 : 2}, minmax(0, 1fr))`,
        }}
      >
        {order.map((slot, index) => {
          const asset = assetsBySlot[slot];
          return (
            <div key={slot} className="min-h-0 min-w-0 overflow-hidden bg-black">
              <ComparePane
                badge={LETTERS[index]}
                name={asset.name}
                file={asset.file}
                exif={exif[slot]}
                apiRef={paneRefs.current[slot]}
                onChange={(next) => handleChange(slot, next)}
                showExif={showExif}
                showGcam={showGcam}
                showZoom={showZoom}
                hdr={canUseHdr && hdr}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
