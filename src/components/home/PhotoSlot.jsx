import { Check, ImagePlus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function PhotoSlot({ label, position, asset, onSelect, compact = false }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-[18px] border text-left transition ${
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
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImagePlus className={compact ? "h-5 w-5" : "h-6 w-6"} strokeWidth={1.5} />
            <span className={compact ? "text-[11px]" : "text-[13px]"}>{t("choosePhoto")}</span>
          </div>
        )}
        <span className={`absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 font-mono uppercase text-white/85 backdrop-blur-sm ${compact ? "text-[9px] tracking-wide" : "text-[10px] tracking-[0.12em]"}`}>
          {label} · {position}
        </span>
        {asset && (
          <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </div>
      <div className={`flex shrink-0 items-center justify-between gap-2 ${compact ? "px-2 py-1.5" : "px-3.5 py-2.5"}`}>
        <p className={`min-w-0 truncate ${compact ? "text-[11px]" : "text-[13px]"} ${asset ? "text-foreground" : "text-muted-foreground"}`}>
          {asset ? asset.name : t("noPhoto")}
        </p>
        {!compact && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
            {asset ? t("change") : t("choose")}
          </span>
        )}
      </div>
    </button>
  );
}
