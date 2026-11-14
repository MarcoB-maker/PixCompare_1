import { useState } from "react";
import { Check, HardDriveDownload, Loader2, Trash2, X } from "lucide-react";
import {
  retryPhotoStorage,
  setPhotoStorageEnabled,
  usePhotoLibrary,
} from "@/lib/photoLibrary";
import { useTranslation } from "@/lib/i18n";

export default function LocalStorageSettings({ onClose }) {
  const { t } = useTranslation();
  const { storage } = usePhotoLibrary();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const disabled = !storage.ready || storage.busy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="local-storage-heading"
        className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#17191d] p-4 text-foreground shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <HardDriveDownload className="h-5 w-5 text-primary" />
            <h2 id="local-storage-heading" className="text-[15px] font-semibold">{t("localStorageTitle")}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t("close")} className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{t("localStorageDescription")}</p>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3">
          <div className="min-w-0">
            <p className="text-[13px] font-medium">{t("localStorageToggle")}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t("localStorageToggleHint")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={storage.enabled}
            aria-label={t("localStorageToggle")}
            disabled={disabled}
            onClick={() => { setConfirmDelete(false); void setPhotoStorageEnabled(!storage.enabled); }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-40 ${storage.enabled ? "bg-primary" : "bg-white/25"}`}
          >
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-[#111] shadow transition-transform ${storage.enabled ? "left-6" : "left-1"}`} />
          </button>
        </div>

        <div aria-live="polite" className="mt-3 min-h-[20px] text-[12px] text-muted-foreground">
          {!storage.ready || storage.busy ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("localStorageBusy")}</span>
          ) : storage.error ? (
            <span className="text-amber-300">{t(storage.error === "quota" ? "localStorageQuota" : "localStorageError")}</span>
          ) : storage.enabled ? (
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" />{t("localStorageSavedCount", { count: storage.savedCount })}</span>
          ) : t("localStorageOff")}
        </div>

        {storage.error && storage.enabled && !storage.busy && (
          <button type="button" onClick={() => void retryPhotoStorage()} className="mt-2 text-[12px] font-medium text-primary underline underline-offset-2">
            {t("localStorageRetry")}
          </button>
        )}

        {confirmDelete ? (
          <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 p-3">
            <p className="text-[12px] leading-relaxed">{t("localStorageConfirm")}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg border border-white/15 px-2 py-2 text-[12px]">{t("localStorageCancel")}</button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => { setConfirmDelete(false); void setPhotoStorageEnabled(false); }}
                className="flex-1 rounded-lg bg-red-500/85 px-2 py-2 text-[12px] font-semibold text-white disabled:opacity-40"
              >
                {t("localStorageConfirmDelete")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={disabled || !storage.enabled}
            onClick={() => setConfirmDelete(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-[12px] text-white/80 disabled:opacity-35"
          >
            <Trash2 className="h-4 w-4" />{t("localStorageClear")}
          </button>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{t("localStorageDisclaimer")}</p>
      </div>
    </div>
  );
}
