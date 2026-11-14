import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, ArrowLeft } from "lucide-react";
import ComparePane from "./ComparePane";
import PaneMenu from "./PaneMenu";
import HdrToggle from "./HdrToggle";
import AlignmentGuides from "./AlignmentGuides";
import { readExif } from "@/lib/exif";
import { useTranslation } from "@/lib/i18n";
import { swapSelectedPhotos } from "@/lib/photoLibrary";
import { IDENTITY, compose, extractDelta } from "@/lib/transform";

const LETTERS = ["A", "B", "C", "D"];
const DEFAULT_GUIDES = [
  { x: 0.33, y: 0.35 },
  { x: 0.67, y: 0.67 },
];

export default function CompareScreen({ photos, onBack }) {
  const { t } = useTranslation();
  // Identificativi stabili: nascondere un pannello in SOLO non smonta la foto.
  const initialPhotos = useRef(photos).current;
  const count = initialPhotos.length;
  const canUseSolo = count === 2;
  const canUseHdr = count === 2;
  const [order, setOrder] = useState(() => initialPhotos.map(({ slot }) => slot));
  const [solo, setSolo] = useState(false);
  const [soloSlot, setSoloSlot] = useState(() => initialPhotos[0]?.slot);
  const [exif, setExif] = useState({});
  const [synced, setSynced] = useState(true);
  const [showExif, setShowExif] = useState(false);
  const [showGcam, setShowGcam] = useState(false);
  const [showZoom, setShowZoom] = useState(true);
  const [hdr, setHdr] = useState(false);
  // Le guide restano fisse rispetto al display quando cambia la fotografia.
  // In NASCONDI conserviamo le coordinate: riattivandole tornano dove erano.
  const [guideMode, setGuideMode] = useState("hidden");
  const [guides, setGuides] = useState(DEFAULT_GUIDES);

  const changeGuide = (index, axis, position) => {
    setGuides((previous) => previous.map((guide, i) => {
      if (i !== index) return guide;
      return {
        x: axis === "y" ? guide.x : position.x,
        y: axis === "x" ? guide.y : position.y,
      };
    }));
  };

  const assetsBySlot = Object.fromEntries(initialPhotos.map(({ slot, asset }) => [slot, asset]));
  const views = useRef({});
  const baselines = useRef({});
  const paneRefs = useRef({});
  const syncedRef = useRef(true);

  // La vista appartiene alla fotografia, non alla posizione A/B.
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

  // Zoom e pan sincronizzati anche quando una fotografia è temporaneamente
  // nascosta in SOLO. Ogni pannello applica i propri limiti ai bordi.
  const handleChange = (slot, next) => {
    views.current[slot] = next;
    if (!syncedRef.current) return;

    const delta = extractDelta(baselines.current[slot], next);
    for (const { slot: other } of initialPhotos) {
      if (other === slot) continue;
      const target = compose(baselines.current[other], delta);
      const api = paneRefs.current[other].current;
      const clamped = api ? api.clamp(target) : target;
      views.current[other] = clamped;
      api?.apply(clamped);
    }
  };

  const toggleSync = (value) => {
    syncedRef.current = value;
    setSynced(value);
    if (value) {
      // Da questo momento le due viste seguono la medesima variazione.
      baselines.current = { ...views.current };
    }
  };

  const switchSoloPhoto = () => {
    if (!solo || !canUseSolo) return;
    setSoloSlot((current) => order.find((slot) => slot !== current) || order[0]);
  };

  const toggleSolo = () => {
    if (!canUseSolo) return;
    if (!solo) setSoloSlot(order[0]);
    setSolo((value) => !value);
  };

  const invertPhotos = () => {
    // In REGOLA non si può cambiare foto: si trascinano soltanto le guide.
    if (!canUseSolo || (solo && guideMode === "edit")) return;
    if (solo) {
      // In SOLO cambia solo la foto mostrata, senza modificare la selezione.
      switchSoloPhoto();
      return;
    }
    // In modalità divisa mantiene lo scambio tradizionale anche nella home.
    swapSelectedPhotos(order[0], order[1]);
    setOrder((current) => [current[1], current[0]]);
  };

  // Passando da due mezzi pannelli a uno intero, entrambi ricevono le nuove
  // dimensioni. Aggiorna limiti e basi di SYNC prima del gesto successivo.
  useEffect(() => {
    if (!canUseSolo) return undefined;
    const frame = requestAnimationFrame(() => {
      for (const { slot } of initialPhotos) {
        const api = paneRefs.current[slot]?.current;
        if (!api) continue;
        api.refresh();
        views.current[slot] = api.get();
      }
      if (syncedRef.current) baselines.current = { ...views.current };
    });
    return () => cancelAnimationFrame(frame);
  }, [solo, canUseSolo, initialPhotos]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-black text-foreground">
      <header className="flex h-12 shrink-0 items-center justify-between gap-1 px-1.5">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("backToSelection")}
          className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-0.5">
          {canUseSolo && (
            <button
              type="button"
              onClick={toggleSolo}
              aria-pressed={solo}
              aria-label={solo ? t("soloOff") : t("soloOn")}
              title={solo ? t("showBoth") : t("showOne")}
              className={`h-9 rounded-full px-2 font-mono text-[10px] uppercase tracking-[0.1em] transition active:scale-95 ${
                solo ? "bg-primary/15 text-primary" : "text-white/75 hover:bg-white/10"
              }`}
            >
              SOLO
            </button>
          )}
          {canUseSolo && (
            <button
              type="button"
              onClick={invertPhotos}
              disabled={solo && guideMode === "edit"}
              aria-label={solo ? t("showOther") : t("swapAB")}
              title={solo ? t("switchAB") : t("swapAB")}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-full px-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-white/75 transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {t("swap")}
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleSync(!synced)}
            aria-pressed={synced}
            aria-label={synced ? t("syncActive") : t("syncInactive")}
            title={t("syncTitle")}
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
            allowGuides={canUseSolo && solo}
            guidesVisible={guideMode !== "hidden"}
            onGuidesChange={(visible) => setGuideMode(visible ? "edit" : "hidden")}
          />
        </div>
      </header>

      <div
        className="relative grid min-h-0 flex-1 gap-px bg-white/30"
        style={{
          gridTemplateColumns: count === 4 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
          gridTemplateRows: `repeat(${count === 3 ? 3 : canUseSolo && solo ? 1 : 2}, minmax(0, 1fr))`,
        }}
      >
        {order.map((slot, index) => {
          const asset = assetsBySlot[slot];
          const hiddenInSolo = canUseSolo && solo && slot !== soloSlot;
          return (
            <div
              key={slot}
              className={
                canUseSolo && solo
                  ? "absolute inset-0 min-h-0 min-w-0 overflow-hidden bg-black"
                  : "relative min-h-0 min-w-0 overflow-hidden bg-black"
              }
              style={canUseSolo && solo ? {
                visibility: hiddenInSolo ? "hidden" : "visible",
                pointerEvents: hiddenInSolo ? "none" : "auto",
                zIndex: hiddenInSolo ? 0 : 1,
              } : undefined}
              aria-hidden={hiddenInSolo}
            >
              <ComparePane
                badge={LETTERS[index]}
                name={asset.name}
                file={asset.file}
                exif={exif[slot]}
                apiRef={paneRefs.current[slot]}
                onChange={(next) => handleChange(slot, next)}
                onSingleTap={canUseSolo && solo && !hiddenInSolo ? switchSoloPhoto : undefined}
                showExif={showExif}
                showGcam={showGcam}
                showZoom={showZoom}
                compactInfo={count > 2}
                hdr={canUseHdr && hdr}
              />
            </div>
          );
        })}
        {canUseSolo && solo && guideMode !== "hidden" && (
          <AlignmentGuides
            guides={guides}
            mode={guideMode}
            onGuideChange={changeGuide}
            onModeChange={setGuideMode}
          />
        )}
      </div>
    </div>
  );
}
