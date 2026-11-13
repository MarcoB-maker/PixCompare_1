const TAG_EXIF_IFD = 0x8769;
const TAG_IMAGE_DESCRIPTION = 0x010e;
const TAG_MODEL = 0x0110;
const TAG_SOFTWARE = 0x0131;
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

  // IFD0 contiene ImageDescription (usata da AGC), modello e software.
  const readAscii = (type, count, valueOffset) => {
    if (type !== 2 || count < 1 || count > 16384) return null;
    const at = count <= 4 ? valueOffset : start + view.getUint32(valueOffset, little);
    if (at < 0 || at + count > view.byteLength) return null;
    const bytes = new Uint8Array(view.buffer, view.byteOffset + at, count);
    return new TextDecoder("utf-8").decode(bytes).replace(/\0/g, "").trim() || null;
  };

  readEntry(firstIfd, (tag, type, count, valueOffset) => {
    if (tag === TAG_EXIF_IFD && type === 4) {
      exifIfd = start + view.getUint32(valueOffset, little);
    } else if (tag === TAG_IMAGE_DESCRIPTION) {
      out.imageDescription = readAscii(type, count, valueOffset);
    } else if (tag === TAG_MODEL) {
      out.model = readAscii(type, count, valueOffset);
    } else if (tag === TAG_SOFTWARE) {
      out.software = readAscii(type, count, valueOffset);
    }
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
    const description = parsed.imageDescription || "";
    const countMatch = description.match(/(?:^|[\r\n])\s*FrameCount\s*=\s*(\d+)/i);
    const versionMatch = description.match(/(?:^|[\r\n])\s*Version\s*=\s*([^\r\n\0]+)/i);
    const frameCount = countMatch ? Number(countMatch[1]) : null;
    const gcamVersion = versionMatch ? versionMatch[1].trim() : null;
    const software = parsed.software || null;
    const model = parsed.model || null;
    if (!exposure && !iso && frameCount == null && !gcamVersion && !software && !model) return null;
    return { exposure, iso, frameCount, gcamVersion, software, model };
  } catch {
    return null;
  }
}