// IndexedDB conserves original File bytes on this device. No network requests.
// The entire archive and the selection are committed atomically.
const DATABASE_NAME = "pixcompare-device-library";
const DATABASE_VERSION = 1;
const PHOTOS = "photos";
const META = "meta";
const SESSION = "session";

function openDatabase() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB non disponibile"));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTOS)) db.createObjectStore(PHOTOS, { keyPath: "id" });
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Apertura archivio non riuscita"));
    request.onblocked = () => reject(new Error("Archivio occupato da un'altra scheda"));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Lettura archivio non riuscita"));
  });
}

function transactionDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error || new Error("Operazione di archivio interrotta"));
    tx.onerror = () => reject(tx.error || new Error("Scrittura archivio non riuscita"));
  });
}

export async function readLocalPhotoArchive() {
  const db = await openDatabase();
  try {
    const tx = db.transaction([PHOTOS, META], "readonly");
    const done = transactionDone(tx);
    const photos = requestResult(tx.objectStore(PHOTOS).getAll());
    const session = requestResult(tx.objectStore(META).get(SESSION));
    const [records, preferences] = await Promise.all([photos, session]);
    await done;
    return { records, session: preferences || null };
  } finally {
    db.close();
  }
}

// Saving the current library as one IndexedDB transaction prevents a partial
// archive after quota or storage errors. Files are NOT JPEG-reencoded.
export async function writeLocalPhotoArchive(assets, session) {
  const db = await openDatabase();
  try {
    const tx = db.transaction([PHOTOS, META], "readwrite");
    const done = transactionDone(tx);
    const store = tx.objectStore(PHOTOS);
    store.clear();
    for (const asset of assets) {
      store.put({
        id: asset.id,
        key: asset.key,
        name: asset.name,
        folder: asset.folder,
        file: asset.file,
        thumb: asset.thumb?.src?.startsWith("data:") ? asset.thumb : null,
      });
    }
    tx.objectStore(META).put({ ...session, enabled: true }, SESSION);
    await done;
  } finally {
    db.close();
  }
}

export async function writeLocalPhotoSelection(session) {
  const db = await openDatabase();
  try {
    const tx = db.transaction(META, "readwrite");
    const done = transactionDone(tx);
    tx.objectStore(META).put({ ...session, enabled: true }, SESSION);
    await done;
  } finally {
    db.close();
  }
}

export async function clearLocalPhotoArchive() {
  const db = await openDatabase();
  try {
    const tx = db.transaction([PHOTOS, META], "readwrite");
    const done = transactionDone(tx);
    tx.objectStore(PHOTOS).clear();
    tx.objectStore(META).delete(SESSION);
    await done;
  } finally {
    db.close();
  }
}
