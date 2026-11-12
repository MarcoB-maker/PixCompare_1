import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ComparePane from "./ComparePane";
import PaneMenu from "./PaneMenu";
import HdrToggle from "./HdrToggle";
import { readExif } from "@/lib/exif";
import { IDENTITY, compose, extractDelta } from "@/lib/transform";

export default function CompareScreen({ photoA, photoB, onBack }) {
  const [exif, setExif] = useState({});
  const [synced, setSynced] = useState(true);
  const [showExif, setShowExif] = useState(false);
  const [hdr, setHdr] = useState(true);

  const views = useRef({ a: IDENTITY, b: IDENTITY });
  const baselines = useRef({ a: IDENTITY, b: IDENTITY });
  const syncedRef = useRef(true);
  const paneA = useRef(null);
  const paneB = useRef(null);
  const panes = { a: paneA, b: paneB };

  useEffect(() => {
    let alive = true;
    Promise.all([readExif(photoA.file), readExif(photoB.file)]).then(([a, b]) => {
      if (alive) setExif({ a, b });
    });
    return () => {
      alive = false;
    };
  }, [photoA, photoB]);

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
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">
          <span className={synced ? "text-primary" : ""}>sync</span> · confronto
        </p>
        <div className="flex items-center gap-1">
          <HdrToggle hdr={hdr} onToggle={setHdr} />
          <PaneMenu
            synced={synced}
            onSyncedChange={toggleSync}
            showExif={showExif}
            onShowExifChange={setShowExif}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          <ComparePane
            badge="A"
            name={photoA.name}
            file={photoA.file}
            exif={exif.a}
            apiRef={paneA}
            onChange={(next) => handleChange("a", next)}
            showExif={showExif}
            hdr={hdr}
          />
        </div>
        <div className="h-px w-full shrink-0 bg-white/30" />
        <div className="min-h-0 flex-1">
          <ComparePane
            badge="B"
            name={photoB.name}
            file={photoB.file}
            exif={exif.b}
            apiRef={paneB}
            onChange={(next) => handleChange("b", next)}
            showExif={showExif}
            hdr={hdr}
          />
        </div>
      </div>
    </div>
  );
}