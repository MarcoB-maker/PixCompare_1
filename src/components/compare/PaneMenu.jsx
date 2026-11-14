import { Check, MoreVertical } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ToggleRow({ label, active, onToggle }) {
  return (
    <DropdownMenuItem
      onSelect={(event) => {
        event.preventDefault();
        onToggle(!active);
      }}
      className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2.5 text-[13px] focus:bg-white/10 focus:text-white"
    >
      <span>{label}</span>
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border ${
          active ? "border-primary bg-primary text-primary-foreground" : "border-white/20 text-transparent"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </DropdownMenuItem>
  );
}

export default function PaneMenu({
  showExif,
  onShowExifChange,
  showGcam,
  onShowGcamChange,
  showZoom,
  onShowZoomChange,
  allowGuides = false,
  guidesVisible = false,
  onGuidesChange,
}) {
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("compareSettings")}
          className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 active:scale-95"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 border-white/10 bg-[#111113] p-1 text-white">
        <ToggleRow label={t("showExif")} active={showExif} onToggle={onShowExifChange} />
        <ToggleRow label={t("showAdvanced")} active={showGcam} onToggle={onShowGcamChange} />
        <ToggleRow label={t("showZoom")} active={showZoom} onToggle={onShowZoomChange} />
        {allowGuides && (
          <>
            <div className="my-1 border-t border-white/15" />
            <ToggleRow label={t("guides")} active={guidesVisible} onToggle={onGuidesChange} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}