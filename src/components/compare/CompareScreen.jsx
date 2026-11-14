import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, ArrowLeft } from "lucide-react";
import ComparePane from "./ComparePane";
import PaneMenu from "./PaneMenu";
import HdrToggle from "./HdrToggle";
import AlignmentGuides from "./AlignmentGuides";
import { readExif } from "@/lib/exif";
import { useTranslation } from "@/lib/i18n";
import { PHOTO_SLOTS, selectPhoto, swapSelectedPhotos, usePhotoLibrary } from "@/lib/photoLibrary";
import { IDENTITY, compose, extractDelta } from "@/lib/transform";

const LETTERS = ["A", "B", "C", "D"];
const DEFAULT_GUIDES = [
  { x: 0.33, y: 0.35 },
  { x: 0.67, y: 0.67 },
];

export default function CompareScreen({ photos, onBack }) {
  const { t } = useTranslation();
  const { assets } = usePhotoLibrary();
  // Identificativi stabili: nascondere un pannello in SOLO non smonta la foto.
  const initialPhotos = useRef(photos).current;
  const count = initialPhotos.length;
  const canUseSolo = count === 2;
  // Median Android usa una WebView che non visualizza l'Ultra HDR come Chrome.
  // Riconosciamo la stringa aggiunta da Median (anche il vecchio GoNative)
  // e lasciamo sempre attiva la decodifica SDR nell'APK.
  const isMedianAndroid = typeof navigator !== "undefined" &&
    /\b(?:MedianAndroid|GoNativeAndroid)\b/i.test(navigator.userAgent);
  const canUseHdr = count === 2 && !isMedianAndroid;
  const [order, setOrder] = useState(() => initialPhotos.map(({ slot }) => slot));
  const [solo, setSolo] = useState(false);
  const [soloSlot, setSoloSlot] = useState(() => initialPhotos[0]?.slot);
  const [assetsBySlot, setAssetsBySlot] = useState(() =>
    Object.fromEntries(initialPhotos.map(({ slot, asset }) => [slot, asset]))
  );
  const [navigation, setNavigation] = useState({});
  const navigationSerial = useRef(0);
  const [navigationSlot, setNavigationSlot] = useState(null);
  const [navigationActivity, setNavigationActivity] = useState(0);
  const [exif, setExif] = useState({});
  const exifCache = useRef(new Map());
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

  // Legge i metadati della fotografia realmente visualizzata in ogni slot.
  // Se cambia la foto con le frecce, EXIF e ADVANCED cambiano assieme a lei.
  useEffect(() => {
    let alive = true;
    for (const { slot } of initialPhotos) {
      const asset = assetsBySlot[slot];
      if (!asset) continue;
      if (exifCache.current.has(asset.id)) {
        const cached = exifCache.current.get(asset.id);
        setExif((current) => ({ ...current, [slot]: cached }));
        continue;
      }
      readExif(asset.file).then((metadata) => {
        exifCache.current.set(asset.id, metadata);
        if (alive) setExif((current) => ({ ...current, [slot]: metadata }));
      }).catch(() => {
        exifCache.current.set(asset.id, null);
        if (alive) setExif((current) => ({ ...current, [slot]: null }));
      });
    }
    return () => { alive = false; };
  }, [assetsBySlot, initialPhotos]);

  // Le frecce compaiono toccando A/B/C/D e scompaiono dopo 5 secondi.
  useEffect(() => {
    if (!navigationSlot) return undefined;
    const timer = setTimeout(() => setNavigationSlot(null), 5000);
    return () => clearTimeout(timer);
  }, [navigationSlot, navigationActivity]);

  const toggleNavigation = (slot) => {
    if (assets.length < 2 || (solo && guideMode === "edit")) return;
    setNavigationSlot((current) => current === slot ? null : slot);
    setNavigationActivity((value) => value + 1);
  };

  // Cambia SOLO la foto selezionata. La nuova eredita l'inquadratura corrente
  // tramite scala e coordinate del centro normalizzate, senza toccare le altre.
  const navigatePhoto = (slot, direction) => {
    if (assets.length < 2 || (solo && guideMode === "edit")) return;
    const currentAsset = assetsBySlot[slot];
    const currentIndex = assets.findIndex((asset) => asset.id === currentAsset?.id);
    if (currentIndex < 0) return;
    const next = assets[(currentIndex + direction + assets.length) % assets.length];
    if (!next || next.id === currentAsset.id) return;

    const focus = paneRefs.current[slot]?.current?.captureFocus();
    const token = ++navigationSerial.current;
    setNavigation((current) => ({ ...current, [slot]: { token, assetId: next.id, focus } }));
    setAssetsBySlot((current) => ({ ...current, [slot]: next }));
    setExif((current) => ({ ...current, [slot]: undefined }));
    // La selezione persistente usa la posizione visibile (non l'identificativo
    // interno del pannello): così continua a essere corretta dopo INVERTI.
    const visibleIndex = order.indexOf(slot);
    if (visibleIndex >= 0) selectPhoto(PHOTO_SLOTS[visibleIndex], next);
    setNavigationSlot(slot);
    setNavigationActivity((value) => value + 1);
  };

  const handleTextureReady = (slot, view) => {
    views.current[slot] = view;
    if (syncedRef.current) baselines.current = { ...views.current };
  };

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

  // Doppio tap: ripristina il 100% e centra le immagini. Con SYNC acceso
  // coinvolge tutti i riquadri, anche quello nascosto dalla modalita' SOLO.
  // Aggiorna anche le basi della sincronizzazione per evitare salti al gesto successivo.
  const resetZoom = (slot) => {
    const slots = syncedRef.current ? initialPhotos.map(({ slot: id }) => id) : [slot];
    for (const id of slots) {
      const api = paneRefs.current[id]?.current;
      const centered = api ? api.clamp({ ...IDENTITY }) : { ...IDENTITY };
      views.current[id] = centered;
      api?.apply(centered);
    }
    if (syncedRef.current) baselines.current = { ...views.current };
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
    setNavigationSlot(null);
    setSoloSlot((current) => order.find((slot) => slot !== current) || order[0]);
  };

  const toggleSolo = () => {
    if (!canUseSolo) return;
    setNavigationSlot(null);
    if (!solo) {
      setSoloSlot(order[0]);
      // SOLO usa sempre SDR: il cambio rapido A/B non attiva la decodifica UHDR.
      // Uscendo da SOLO, UHDR rimane disattivato finché non lo si riattiva.
      setHdr(false);
    }
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
    setNavigationSlot(null);
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
          {canUseHdr && !solo && <HdrToggle hdr={hdr} onToggle={setHdr} />}
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
                onSingleTap={canUseSolo && solo && !hiddenInSolo && guideMode !== "edit" ? switchSoloPhoto : undefined}
                onDoubleTap={() => resetZoom(slot)}
                showExif={showExif}
                showGcam={showGcam}
                showZoom={showZoom}
                compactInfo={count > 2}
                hdr={canUseHdr && !solo && hdr}
                navigation={navigation[slot]}
                assetId={asset.id}
                onTextureReady={(view) => handleTextureReady(slot, view)}
                onBadgeClick={assets.length > 1 && !(solo && guideMode === "edit") ? () => toggleNavigation(slot) : undefined}
                navigationOpen={navigationSlot === slot && !(solo && guideMode === "edit")}
                navigationIndex={assets.findIndex((item) => item.id === asset?.id) + 1}
                navigationCount={assets.length}
                onPreviousPhoto={() => navigatePhoto(slot, -1)}
                onNextPhoto={() => navigatePhoto(slot, 1)}
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
