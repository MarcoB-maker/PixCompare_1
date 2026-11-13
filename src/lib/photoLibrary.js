import { useSyncExternalStore } from "react";

const EMPTY = { assets: [], selection: { a: null, b: null } };

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

export function selectPhoto(slot, asset) {
  commit({ ...state, selection: { ...state.selection, [slot]: asset } });
}

// Scambia le foto selezionate senza toccare i file originali.
// Anche la schermata iniziale si aggiorna immediatamente.
export function swapSelectedPhotos() {
  const { a, b } = state.selection;
  if (!a || !b) return;
  commit({ ...state, selection: { a: b, b: a } });
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