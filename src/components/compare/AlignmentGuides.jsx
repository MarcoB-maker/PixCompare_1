import { useRef } from "react";
import { EyeOff, Move, Pin } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const CYAN = "#00DFFF";
const MIN_POSITION = 0.045;
const MAX_POSITION = 0.955;

function restrict(value) {
  return Math.max(MIN_POSITION, Math.min(MAX_POSITION, value));
}

const MODES = [
  { id: "edit", labelKey: "adjust", Icon: Move },
  { id: "fixed", labelKey: "lock", Icon: Pin },
  { id: "hidden", labelKey: "hide", Icon: EyeOff },
];

/**
 * Due croci di allineamento, ancorate allo schermo (non alle immagini).
 * Le coordinate x/y sono frazioni della larghezza/altezza del confronto.
 * Questa componente non modifica mai il file o la trasformazione delle foto.
 */
export default function AlignmentGuides({ guides, mode, onGuideChange, onModeChange }) {
  const { t } = useTranslation();
  const planeRef = useRef(null);
  const draggingRef = useRef(null);
  const editing = mode === "edit";

  function startDrag(event, index, axis) {
    if (!editing || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    draggingRef.current = { pointerId: event.pointerId, index, axis };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Alcuni eventi sintetici non supportano la cattura del puntatore.
    }
  }

  function drag(event) {
    const active = draggingRef.current;
    if (!editing || !active || active.pointerId !== event.pointerId) return;
    const rect = planeRef.current?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return;
    event.preventDefault();
    event.stopPropagation();
    onGuideChange(active.index, active.axis, {
      x: restrict((event.clientX - rect.left) / rect.width),
      y: restrict((event.clientY - rect.top) / rect.height),
    });
  }

  function finishDrag(event) {
    if (draggingRef.current?.pointerId !== event.pointerId) return;
    event.stopPropagation();
    draggingRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const dragHandlers = (index, axis) => ({
    onPointerDown: (event) => startDrag(event, index, axis),
    onPointerMove: drag,
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
  });

  return (
    <>
      {/* In REGOLA, il piano intercetta anche i tocchi lontani dalle linee.
          In FISSA, non intercetta nulla: pan, pinch e cambio foto funzionano. */}
      <div
        ref={planeRef}
        className="absolute inset-0 z-20 overflow-hidden"
        style={{ pointerEvents: editing ? "auto" : "none", touchAction: "none" }}
        onPointerDown={editing ? (event) => event.preventDefault() : undefined}
        aria-label={t("alignGuides")}
      >
        {guides.map(({ x, y }, index) => (
          <div key={index}>
            {/* Verticale: trascinando, cambia soltanto la coordinata X. */}
            <div
              className="absolute inset-y-0 flex w-7 -translate-x-1/2 items-center justify-center touch-none"
              style={{ left: `${x * 100}%`, cursor: editing ? "ew-resize" : "default", pointerEvents: editing ? "auto" : "none" }}
              role={editing ? "slider" : undefined}
              aria-label={editing ? t("verticalGuide", { number: index + 1 }) : undefined}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(x * 100)}
              {...(editing ? dragHandlers(index, "x") : {})}
            >
              <div
                className="h-full w-[1.5px]"
                style={{ backgroundColor: CYAN, boxShadow: "0 0 1.5px 1px #042632, 0 0 4px #00212b" }}
              />
            </div>

            {/* Orizzontale: trascinando, cambia soltanto la coordinata Y. */}
            <div
              className="absolute inset-x-0 flex h-7 -translate-y-1/2 items-center justify-center touch-none"
              style={{ top: `${y * 100}%`, cursor: editing ? "ns-resize" : "default", pointerEvents: editing ? "auto" : "none" }}
              role={editing ? "slider" : undefined}
              aria-label={editing ? t("horizontalGuide", { number: index + 1 }) : undefined}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(y * 100)}
              {...(editing ? dragHandlers(index, "y") : {})}
            >
              <div
                className="w-full h-[1.5px]"
                style={{ backgroundColor: CYAN, boxShadow: "0 0 1.5px 1px #042632, 0 0 4px #00212b" }}
              />
            </div>

            {/* Il punto numerato unisce le due linee e le muove assieme. */}
            <div
              className="absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center"
              style={{ left: `${x * 100}%`, top: `${y * 100}%`, cursor: editing ? "move" : "default", pointerEvents: editing ? "auto" : "none" }}
              role={editing ? "slider" : undefined}
              aria-label={editing ? t("crossingPoint", { number: index + 1 }) : undefined}
              {...(editing ? dragHandlers(index, "both") : {})}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold text-white"
                style={{ background: "#03404e", borderColor: CYAN, boxShadow: "0 0 0 1px #041c23, 0 0 6px #00303b" }}
              >
                {index + 1}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Barra indipendente dai gesti sul piano. Rimane anche in FISSA. */}
      <div className="pointer-events-auto absolute left-1/2 top-2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/15 bg-[#11151a]/90 p-1 shadow-xl backdrop-blur-sm">
        {MODES.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            aria-label={id === "edit" ? t("adjustGuides") : id === "fixed" ? t("lockGuides") : t("hideGuides")}
            title={id === "edit" ? t("moveGuidesOnly") : id === "fixed" ? t("fixedGuidesTitle") : t("hideGuidesTitle")}
            onClick={() => onModeChange(id)}
            className={`flex h-9 items-center justify-center gap-1.5 rounded-lg px-2.5 font-mono text-[10px] font-semibold tracking-wide transition active:scale-95 ${
              mode === id ? "bg-cyan-400/15 text-[#5DEEFF] ring-1 ring-inset ring-[#00DFFF]/65" : "text-white/75 hover:bg-white/10"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {t(labelKey)}
          </button>
        ))}
      </div>
    </>
  );
}
