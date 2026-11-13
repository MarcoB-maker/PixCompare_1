function hdrTexture(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.decoding = "async";
    img.draggable = false;

    img.onload = () => {
      resolve({
        element: img,
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
        release: () => URL.revokeObjectURL(url),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Immagine non decodificabile"));
    };

    img.src = url;
  });
}

async function sdrTexture(file) {
  const bitmap = await createImageBitmap(file);

  try {
    const canvas = document.createElement("canvas");

    // Mantiene la risoluzione originale della fotografia.
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    // Canvas SDR standard, senza spazio colore HDR.
    const ctx = canvas.getContext("2d", {
      colorSpace: "srgb",
      alpha: false,
    });

    if (!ctx) {
      throw new Error("Canvas SDR non disponibile");
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bitmap, 0, 0);

    return {
      element: canvas,
      width: canvas.width,
      height: canvas.height,
      release: () => {
        canvas.width = 0;
        canvas.height = 0;
      },
    };
  } finally {
    bitmap.close();
  }
}

export async function decodeTexture(file, { hdr = false } = {}) {
  if (hdr) {
    return hdrTexture(file);
  }

  return sdrTexture(file);
}