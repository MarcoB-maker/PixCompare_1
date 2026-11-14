import { useMemo, useRef, useState } from "react";
import { Check, ChevronRight, FolderOpen, ImagePlus, Loader2, X } from "lucide-react";
import { importFiles, selectPhoto, usePhotoLibrary } from "@/lib/photoLibrary";
import { useTranslation } from "@/lib/i18n";


export default function PhotoPicker({ slot, onClose }) {
  const { t } = useTranslation();
  const { assets, selection } = usePhotoLibrary();
  const [path, setPath] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const dirRef = useRef(null);

  const { folders, files } = useMemo(() => {
    const prefix = path ? `${path}/` : "";
    const direct = new Map();
    const list = [];
    for (const asset of assets) {
      if (asset.folder === path) {
        list.push(asset);
        continue;
      }
      if (asset.folder && asset.folder.startsWith(prefix)) {
        const segment = asset.folder.slice(prefix.length).split("/")[0];
        if (segment) direct.set(segment, true);
      }
    }
    const next = [...direct.keys()].map((name) => {
      const full = prefix + name;
      const count = assets.filter(
        (asset) => asset.folder === full || asset.folder.startsWith(`${full}/`)
      ).length;
      return { name, full, count };
    });
    return { folders: next, files: list };
  }, [assets, path]);

  const segments = path ? path.split("/").filter(Boolean) : [];
  const selectedId = selection[slot]?.id;

  async function handleChange(event) {
    const list = event.target.files;
    if (!list || list.length === 0) return;
    setBusy(true);
    try {
      const added = await importFiles(list);
      if (added.length === 1) {
        selectPhoto(slot, added[0]);
        onClose();
      }
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#08080a] animate-in fade-in slide-in-from-bottom-6 duration-300">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={dirRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
        {...{ webkitdirectory: "", directory: "" }}
      />

      <header className="flex items-start justify-between gap-3 px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            {t("photo")} {slot.toUpperCase()}
          </p>
          <h2 className="mt-1 truncate font-heading text-lg font-semibold tracking-tight">
            {t("pickPhoto")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/70 transition active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex gap-2 px-4 pb-3">
        <button
          type="button"
          onClick={() => fileRef.current && fileRef.current.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[13px] font-medium transition active:scale-[0.99]"
        >
          <ImagePlus className="h-4 w-4 text-primary" /> {t("fromFiles")}
        </button>
        <button
          type="button"
          onClick={() => dirRef.current && dirRef.current.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-[13px] font-medium transition active:scale-[0.99]"
        >
          <FolderOpen className="h-4 w-4 text-primary" /> {t("fromFolder")}
        </button>
      </div>

      {(segments.length > 0 || assets.length > 0) && (
        <div className="scrollbar-none flex items-center gap-1 overflow-x-auto px-4 pb-3">
          <button
            type="button"
            onClick={() => setPath("")}
            className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
              segments.length === 0 ? "bg-white/10 text-foreground" : "text-muted-foreground"
            }`}
          >
            {t("device")}
          </button>
          {segments.map((segment, index) => {
            const target = segments.slice(0, index + 1).join("/");
            const isLast = index === segments.length - 1;
            return (
              <span key={target} className="flex shrink-0 items-center gap-1">
                <ChevronRight className="h-3 w-3 text-white/25" />
                <button
                  type="button"
                  onClick={() => setPath(target)}
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    isLast ? "bg-white/10 text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {segment}
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {folders.length === 0 && files.length === 0 ? (
          <div className="mt-14 flex flex-col items-center gap-3 px-6 text-center text-muted-foreground">
            <FolderOpen className="h-8 w-8" strokeWidth={1.3} />
            <p className="max-w-[17rem] text-[13px] leading-relaxed">
              {t("emptyLibrary")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {folders.map((folder) => (
              <button
                key={folder.full}
                type="button"
                onClick={() => setPath(folder.full)}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-center transition active:scale-[0.99]"
              >
                <FolderOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <span className="line-clamp-2 break-all text-[12px] font-medium leading-tight">
                  {folder.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {folder.count} {t("photos")}
                </span>
              </button>
            ))}
            {files.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => {
                  selectPhoto(slot, asset);
                  onClose();
                }}
                className="text-left"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-black/40">
                  <img
                    src={asset.thumb.src}
                    alt={asset.name}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                  {selectedId === asset.id && (
                    <>
                      <span className="absolute inset-0 rounded-xl ring-2 ring-inset ring-primary" />
                      <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 truncate px-0.5 text-[11px] text-muted-foreground">
                  {asset.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {busy && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/60">
          <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px]">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("importing")}
          </span>
        </div>
      )}
    </div>
  );
}