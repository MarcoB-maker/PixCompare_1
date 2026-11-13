import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, ArrowLeft } from "lucide-react";
import ComparePane from "./ComparePane";
import PaneMenu from "./PaneMenu";
import HdrToggle from "./HdrToggle";
import { readExif } from "@/lib/exif";
import { swapSelectedPhotos } from "@/lib/photoLibrary";
import { IDENTITY, compose, extractDelta } from "@/lib/transform";

export default function CompareScreen({ photoA, photoB, onBack }) {
  // Le due istanze restano associate alle foto originali: "Inverti" sposta
  // i riquadri con CSS, evitando nuove decodifiche SDR/UHDR e mantenendo lo zoom.
  const initialPhotos = useRef({ photoA, photoB });
  const sourceA = initialPhotos.current.photoA;
  const sourceB = initialPhotos.current.photoB;
  const [reversed, setReversed] = useState(false);
  const [exif, setExif] = useState({});
  const [synced, setSynced] = useState(true);
  const [showExif, setShowExif] = useState(false);
  const [showGcam, setShowGcam] = useState(false);
  const [showZoom, setShowZoom] = useState(true);
  const [hdr, setHdr] = useState(false);

  const views = useRef({ a: IDENTITY, b: IDENTITY });
  const baselines = useRef({ a: IDENTITY, b: IDENTITY });
  const syncedRef = useRef(true);
  const paneA = useRef(null);
  const paneB = useRef(null);
  const panes = { a: paneA, b: paneB };

  useEffect(() => {
    let alive = true;
    Promise.all([readExif(sourceA.file), readExif(sourceB.file)]).then(([a, b]) => {
      if (alive) setExif({ a, b });
    });
    return () => {
      alive = false;
    };
  }, [sourceA, sourceB]);

  // A pane changed its own transform: while synced, the same delta is applied
  // on top of the other pane's own baseline, so both offsets are preserved.
  const handleChange = (key, next) => {
    views.current = { ...views.current, [key]: next };
    if (!syncedRef.current) return;

    const other = key === "a" ? "b" : "a";
    const delta = extractDelta(baselines.current[key], next);
    const target = compose(baselines.current[other], delta);
    const api = panes[other].current;
    const clamped = api ? api.clamp(target) : target;

    views.current = { ...views.current, [other]: clamped };
    if (api) api.apply(clamped);
  };

  // Re-activating sync freezes the live state of both photos as new baselines:
  // no reset, no copying of one position onto the other.
  const toggleSync = (value) => {
    syncedRef.current = value;
    setSynced(value);
    if (value) baselines.current = { a: views.current.a, b: views.current.b };
  };

  const invertPhotos = () => {
    // Aggiorna anche la selezione: tornando alla schermata iniziale
    // si vede lo stesso ordine scelto durante il confronto.
    swapSelectedPhotos();
    // Sposta le istanze esistenti, conservando texture, zoom e posizione.
    setReversed((value) => !value);
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
          <HdrToggle hdr={hdr} onToggle={setHdr} />
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

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1" style={{ order: reversed ? 2 : 0 }}>
          <ComparePane
            badge={reversed ? "B" : "A"}
            name={sourceA.name}
            file={sourceA.file}
            exif={exif.a}
            apiRef={paneA}
            onChange={(next) => handleChange("a", next)}
            showExif={showExif}
            showGcam={showGcam}
            showZoom={showZoom}
            hdr={hdr}
          />
        </div>
        <div className="h-px w-full shrink-0 bg-white/30" style={{ order: 1 }} />
        <div className="min-h-0 flex-1" style={{ order: reversed ? 0 : 2 }}>
          <ComparePane
            badge={reversed ? "A" : "B"}
            name={sourceB.name}
            file={sourceB.file}
            exif={exif.b}
            apiRef={paneB}
            onChange={(next) => handleChange("b", next)}
            showExif={showExif}
            showGcam={showGcam}
            showZoom={showZoom}
            hdr={hdr}
          />
        </div>
      </div>
    </div>
  );
}