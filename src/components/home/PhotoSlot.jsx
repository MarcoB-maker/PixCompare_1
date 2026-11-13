import { Check, ImagePlus } from "lucide-react";

export default function PhotoSlot({ label, position, asset, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[20px] border text-left transition ${
        asset ? "border-white/10 bg-card" : "border-dashed border-white/15 bg-white/[0.02]"
      }`}
    >
      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-black/50">
        {asset ? (
          <img
            src={asset.thumb.src}
            alt={asset.name}
            draggable={false}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-[13px]">Seleziona foto</span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
          {label} · {position}
        </span>
        {asset && (
          <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 px-3.5 py-2.5">
        <p className={`truncate text-[13px] ${asset ? "text-foreground" : "text-muted-foreground"}`}>
          {asset ? asset.name : `Nessuna foto ${position}`}
        </p>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          {asset ? "Cambia" : "Scegli"}
        </span>
      </div>
    </button>
  );
}