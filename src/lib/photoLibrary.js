import { useSyncExternalStore } from "react";

export const PHOTO_SLOTS = ["a", "b", "c", "d"];

const EMPTY = {
  assets: [],
  selection: { a: null, b: null, c: null, d: null },
  compareCount: 2,
};

let state = EMPTY;
const listeners = new Set();
let seq = 0;

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

// Cambiare il numero di foto non cancella C/D: restano selezionate se si torna a 3/4.
export function setCompareCount(value) {
  const count = Number(value);
  if (![2, 3, 4].includes(count) || state.compareCount === count) return;
  commit({ ...state, compareCount: count });
}

export function selectPhoto(slot, asset) {
  if (!PHOTO_SLOTS.includes(slot)) return;
  commit({ ...state, selection: { ...state.selection, [slot]: asset } });
}

// Scambia due posizioni senza alterare i File, le anteprime o i metadati.
export function swapSelectedPhotos(first = "a", second = "b") {
  if (first === second || !PHOTO_SLOTS.includes(first) || !PHOTO_SLOTS.includes(second)) return;
  const selection = state.selection;
  if (!selection[first] || !selection[second]) return;
  commit({
    ...state,
    selection: { ...selection, [first]: selection[second], [second]: selection[first] },
  });
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

export async function importFiles(fileList) {
  const incoming = Array.from(fileList || []).filter(
    (file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif|avif)$/i.test(file.name || "")
  );

  const added = [];
  for (const file of incoming) {
    const folder = (file.webkitRelativePath || "").split("/").slice(0, -1).join("/");
    const key = `${folder}/${file.name}/${file.size}`;
    if (state.assets.some((asset) => asset.key === key)) continue;
    seq += 1;
    const thumb = await makeThumb(file);
    added.push({ id: `asset-${seq}`, key, file, name: file.name, folder, thumb });
  }

  if (added.length > 0) {
    commit({ ...state, assets: [...state.assets, ...added] });
  }
  return added;
}
