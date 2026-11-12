// Prepares the texture used by a compare pane at full resolution.
// UHDR path (default): decodes the full dynamic range when the browser supports
// it and paints the result into a wide-gamut canvas.
// SDR path: plain <img> from the in-memory File, gain map ignored.
// When UHDR decoding fails the SDR texture is used instead.

function sdrTexture(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "sync";
    img.draggable = false;
    img.onload = () =>
      resolve({
        element: img,
        width: img.naturalWidth || 1,
        height: img.naturalHeight || 1,
        release: () => URL.revokeObjectURL(url),
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Immagine non decodificabile"));
    };
    img.src = url;
  });
}

async function drawToCanvas(source, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx =
    canvas.getContext("2d", { colorSpace: "display-p3" }) || canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponibile");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0);
  return canvas;
}

async function hdrTexture(file) {
  alert(
  "Formato: " + file.type +
  "\nDimensione: " + file.size + " byte"
);
  if (typeof window !== "undefined" && "ImageDecoder" in window) {
    const decoder = new ImageDecoder({
      data: file.stream(),
      type: file.type || "image/jpeg",
      desiredDynamicRange: "full",
    });
    await decoder.tracks.ready;
    const { image } = await decoder.decode();
    const canvas = await drawToCanvas(image, image.displayWidth, image.displayHeight);
    if (image.close) image.close();
    if (decoder.close) decoder.close();
    return {
      element: canvas,
      width: canvas.width,
      height: canvas.height,
      release: () => {},
    };
  }

  const bitmap = await createImageBitmap(file);
  const canvas = await drawToCanvas(bitmap, bitmap.width, bitmap.height);
  if (bitmap.close) bitmap.close();
  return {
    element: canvas,
    width: canvas.width,
    height: canvas.height,
    release: () => {},
  };
}

export async function decodeTexture(file, { hdr = false } = {}) {
  if (hdr) {
    try {
      return await hdrTexture(file);
    } catch (error) {
  console.error("Errore UHDR:", error);
  alert("Errore UHDR: " + (error?.message || String(error)));
}
  }
  return sdrTexture(file);
}