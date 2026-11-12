const TAG_EXIF_IFD = 0x8769;
const TAG_ISO = 0x8827;
const TAG_ISO_ALT = 0x8833;
const TAG_EXPOSURE = 0x829a;

function parseTiff(view, start) {
  if (start + 8 > view.byteLength) return null;
  const byteOrder = view.getUint16(start, false);
  const little = byteOrder === 0x4949;
  if (!little && byteOrder !== 0x4d4d) return null;
  if (view.getUint16(start + 2, little) !== 42) return null;

  const firstIfd = start + view.getUint32(start + 4, little);
  const out = {};
  let exifIfd = null;

  const readEntry = (ifdOffset, handler) => {
    if (ifdOffset + 2 > view.byteLength) return;
    const count = view.getUint16(ifdOffset, little);
    for (let i = 0; i < count; i += 1) {
      const entry = ifdOffset + 2 + i * 12;
      if (entry + 12 > view.byteLength) return;
      handler(
        view.getUint16(entry, little),
        view.getUint16(entry + 2, little),
        view.getUint32(entry + 4, little),
        entry + 8
      );
    }
  };

  const readInteger = (type, count, valueOffset) => {
    const size = type === 3 ? 2 : 4;
    if (type !== 3 && type !== 4) return null;
    const at = count * size <= 4 ? valueOffset : start + view.getUint32(valueOffset, little);
    if (at + size > view.byteLength) return null;
    return type === 3 ? view.getUint16(at, little) : view.getUint32(at, little);
  };

  const readRational = (type, count, valueOffset) => {
    if (type !== 5 || count < 1) return null;
    const at = start + view.getUint32(valueOffset, little);
    if (at + 8 > view.byteLength) return null;
    const numerator = view.getUint32(at, little);
    const denominator = view.getUint32(at + 4, little);
    if (!denominator) return null;
    return numerator / denominator;
  };

  readEntry(firstIfd, (tag, type, count, valueOffset) => {
    if (tag === TAG_EXIF_IFD) exifIfd = start + view.getUint32(valueOffset, little);
  });

  if (exifIfd) {
    readEntry(exifIfd, (tag, type, count, valueOffset) => {
      if (tag === TAG_EXPOSURE) out.exposure = readRational(type, count, valueOffset);
      else if (tag === TAG_ISO || tag === TAG_ISO_ALT)
        out.iso = readInteger(type, count, valueOffset);
    });
  }

  return out;
}

function parseJpegExif(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = view.getUint8(offset + 1);
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xda) break;
    const size = view.getUint16(offset + 2, false);
    if (size < 2) break;
    if (marker === 0xe1 && offset + 10 <= view.byteLength) {
      const isExif =
        view.getUint32(offset + 4, false) === 0x45786966 && view.getUint16(offset + 8, false) === 0;
      if (isExif) {
        const parsed = parseTiff(view, offset + 10);
        if (parsed) return parsed;
      }
    }
    offset += 2 + size;
  }
  return null;
}

export function formatExposure(seconds) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return null;
  if (seconds >= 1) {
    const value = Math.round(seconds * 10) / 10;
    return `${value}s`;
  }
  return `1/${Math.max(1, Math.round(1 / seconds))}s`;
}

export async function readExif(file) {
  try {
    const buffer = await file.slice(0, 1024 * 1024).arrayBuffer();
    const parsed = parseJpegExif(buffer);
    if (!parsed) return null;
    const exposure = formatExposure(parsed.exposure);
    const iso = parsed.iso || null;
    if (!exposure && !iso) return null;
    return { exposure, iso };
  } catch {
    return null;
  }
}