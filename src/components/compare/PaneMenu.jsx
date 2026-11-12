import { Check, MoreVertical } from "lucide-react";
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

export default function PaneMenu({ synced, onSyncedChange, showExif, onShowExifChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Impostazioni confronto"
          className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 active:scale-95"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 border-white/10 bg-[#111113] p-1 text-white">
        <ToggleRow label="Sincronizza zoom e pan" active={synced} onToggle={onSyncedChange} />
        <ToggleRow label="Mostra EXIF" active={showExif} onToggle={onShowExifChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}