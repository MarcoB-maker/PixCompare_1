import { useSyncExternalStore } from "react";
import {
  clearLocalPhotoArchive,
  readLocalPhotoArchive,
  writeLocalPhotoArchive,
  writeLocalPhotoSelection,
} from "@/lib/localPhotoStorage";

export const PHOTO_SLOTS = ["a", "b", "c", "d"];

const EMPTY = {
  assets: [],
  selection: { a: null, b: null, c: null, d: null },
  compareCount: 2,
  storage: { enabled: false, ready: false, busy: false, error: null, savedCount: 0 },
};

let state = EMPTY;
const listeners = new Set();
let seq = 0;
let initialized = null;
let queue = Promise.resolve();

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return state;
}

export function usePhotoLibrary() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

function commit(next) {
  state = next;
  listeners.forEach((listener) => listener());
}

function updateStorage(patch) {
  commit({ ...state, storage: { ...state.storage, ...patch } });
}

function enqueue(work) {
  const next = queue.catch(() => {}).then(work);
  queue = next.catch(() => {});
  return next;
}

function sessionFromCurrent() {
  return {
    compareCount: state.compareCount,
    selection: Object.fromEntries(
      PHOTO_SLOTS.map((slot) => [slot, state.selection[slot]?.id || null])
    ),
  };
}

function reportStorageError(error) {
  console.error("PixCompare local photo storage:", error);
  updateStorage({ error: error?.name === "QuotaExceededError" ? "quota" : "save", busy: false });
}

function saveSessionIfEnabled() {
  if (!state.storage.enabled || !state.storage.ready || state.storage.busy) return;
  void enqueue(async () => {
    if (!state.storage.enabled) return;
    await writeLocalPhotoSelection(sessionFromCurrent());
  }).catch(reportStorageError);
}

function saveLibraryIfEnabled() {
  if (!state.storage.enabled || !state.storage.ready || state.storage.busy) return;
  void enqueue(async () => {
    if (!state.storage.enabled) return;
    await writeLocalPhotoArchive(state.assets, sessionFromCurrent());
    updateStorage({ savedCount: state.assets.length, error: null });
  }).catch(reportStorageError);
}

// Changing photo count doesn't discard C/D: they remain selected.
export function setCompareCount(value) {
  const count = Number(value);
  if (![2, 3, 4].includes(count) || state.compareCount === count) return;
  commit({ ...state, compareCount: count });
  saveSessionIfEnabled();
}

export function selectPhoto(slot, asset) {
  if (!PHOTO_SLOTS.includes(slot)) return;
  commit({ ...state, selection: { ...state.selection, [slot]: asset } });
  saveSessionIfEnabled();
}

export function swapSelectedPhotos(first = "a", second = "b") {
  if (first === second || !PHOTO_SLOTS.includes(first) || !PHOTO_SLOTS.includes(second)) return;
  const selection = state.selection;
  if (!selection[first] || !selection[second]) return;
  commit({
    ...state,
    selection: { ...selection, [first]: selection[second], [second]: selection[first] },
  });
  saveSessionIfEnabled();
}

async function makeThumb(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const width = bitmap.width;
    const height = bitmap.height;
    const ratio = Math.min(1, 640 / Math.max(width, height));
    const w = Math.max(1, Math.round(width * ratio));
    const h = Math.max(1, Math.round(height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    if (bitmap.close) bitmap.close();
    return { src: canvas.toDataURL("image/jpeg", 0.82), width, height };
  } catch {
    return { src: URL.createObjectURL(file), width: 0, height: 0 };
  }
}

// Called on the home screen after mount. Never access IndexedDB during SSR.
export function initializePhotoStorage() {
  if (initialized) return initialized;
  initialized = (async () => {
    try {
      const { records, session } = await readLocalPhotoArchive();
      if (session?.enabled) {
        const restored = [];
        for (const record of records) {
          if (!record?.file) continue;
          const file = record.file.name
            ? record.file
            : new File([record.file], record.name || "photo.jpg", {
              type: record.file.type || "image/jpeg",
              lastModified: record.file.lastModified || Date.now(),
            });
          const thumb = record.thumb?.src?.startsWith("data:") ? record.thumb : await makeThumb(file);
          restored.push({
            id: record.id,
            key: record.key,
            name: record.name,
            folder: record.folder || "",
            file,
            thumb,
          });
          const n = Number(String(record.id).match(/^asset-(\d+)$/)?.[1]);
          if (Number.isFinite(n)) seq = Math.max(seq, n);
        }
        const merged = [...restored];
        for (const asset of state.assets) {
          if (!merged.some((item) => item.key === asset.key)) merged.push(asset);
        }
        const byId = new Map(merged.map((asset) => [asset.id, asset]));
        const selection = { ...state.selection };
        for (const slot of PHOTO_SLOTS) {
          if (!selection[slot]) selection[slot] = byId.get(session.selection?.[slot]) || null;
        }
        commit({
          ...state,
          assets: merged,
          selection,
          compareCount: [2, 3, 4].includes(session.compareCount) ? session.compareCount : state.compareCount,
          storage: { enabled: true, ready: true, busy: false, error: null, savedCount: restored.length },
        });
      } else {
        updateStorage({ ready: true });
      }
    } catch (error) {
      console.error("PixCompare local photo storage initialization:", error);
      updateStorage({ ready: true, error: "open" });
    }
  })();
  return initialized;
}

// OFF clears saved copies but leaves current photos available in RAM.
// ON saves the whole current library, originals included.
export async function setPhotoStorageEnabled(enabled) {
  if (!state.storage.ready || state.storage.busy || state.storage.enabled === enabled) return;
  const wasEnabled = state.storage.enabled;
  updateStorage({ busy: true, error: null });
  try {
    await enqueue(async () => {
      if (enabled) {
        await writeLocalPhotoArchive(state.assets, sessionFromCurrent());
      } else {
        await clearLocalPhotoArchive();
      }
    });
    updateStorage({
      enabled,
      busy: false,
      error: null,
      savedCount: enabled ? state.assets.length : 0,
    });
    // An import may have completed while the initial snapshot was being stored.
    if (enabled) saveLibraryIfEnabled();
  } catch (error) {
    updateStorage({ enabled: wasEnabled });
    reportStorageError(error);
  }
}

export async function retryPhotoStorage() {
  if (!state.storage.enabled || state.storage.busy) return;
  updateStorage({ busy: true, error: null });
  try {
    await enqueue(() => writeLocalPhotoArchive(state.assets, sessionFromCurrent()));
    updateStorage({ busy: false, error: null, savedCount: state.assets.length });
  } catch (error) {
    reportStorageError(error);
  }
}

export async function importFiles(fileList) {
  const incoming = Array.from(fileList || []).filter(
    (file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif|avif)$/i.test(file.name || "")
  );

  const added = [];
  for (const file of incoming) {
    const folder = (file.webkitRelativePath || "").split("/").slice(0, -1).join("/");
    const key = `${folder}/${file.name}/${file.size}`;
    if (state.assets.some((asset) => asset.key === key) || added.some((asset) => asset.key === key)) continue;
    seq += 1;
    const thumb = await makeThumb(file);
    added.push({ id: `asset-${seq}`, key, file, name: file.name, folder, thumb });
  }

  if (added.length > 0) {
    commit({ ...state, assets: [...state.assets, ...added] });
    saveLibraryIfEnabled();
  }
  return added;
}
