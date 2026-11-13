const TAG_EXIF_IFD = 0x8769;
const TAG_IMAGE_DESCRIPTION = 0x010e;
const TAG_MODEL = 0x0110;
const TAG_SOFTWARE = 0x0131;
const TAG_ISO = 0x8827;
const TAG_ISO_ALT = 0x8833;
const TAG_EXPOSURE = 0x829a;

// Codici modello EXIF associati ai nomi commerciali.
// Conversione locale: nessuna richiesta di rete e nessun upload della foto.
// NOTA: sono elencate solo varianti documentate; codici sconosciuti restano visibili.
// Riferimenti consultati: siti OPPO, vivo, Samsung, realme; cataloghi
// KHwang9883/MobileModels, certificazioni GCF e WindTre per Xiaomi/POCO/Redmi.
const DEVICE_MODELS = Object.freeze({
  // OPPO
  "CPH2025": "OPPO Find X2 Pro",
  "CPH2173": "OPPO Find X3 Pro",
  "CPH2305": "OPPO Find X5 Pro",
  "PHY110": "OPPO Find X7 Ultra",
  "CPH2651": "OPPO Find X8",
  "CPH2659": "OPPO Find X8 Pro",
  "CPH2797": "OPPO Find X9",
  "CPH2791": "OPPO Find X9 Pro",
  "CPH2607": "OPPO Reno11 Pro 5G",
  "CPH2625": "OPPO Reno12 5G",
  "CPH2629": "OPPO Reno12 Pro 5G",
  "CPH2689": "OPPO Reno13 5G",
  "CPH2697": "OPPO Reno13 Pro 5G",
  "CPH2737": "OPPO Reno14 5G",
  "CPH2739": "OPPO Reno14 Pro 5G",
  "CPH2239": "OPPO A54",

  // Xiaomi
  "25010PN30G": "Xiaomi 15 Ultra",
  "24129PN74G": "Xiaomi 15",
  "24030PN60G": "Xiaomi 14 Ultra",
  "23127PN0CG": "Xiaomi 14",
  "2407FPN8EG": "Xiaomi 14T Pro",
  "2406APNFAG": "Xiaomi 14T",
  "2304FPN6DG": "Xiaomi 13 Ultra",
  "23078PND5G": "Xiaomi 13T Pro",
  "2306EPN60G": "Xiaomi 13T",
  "2211133G": "Xiaomi 13",
  "22081212UG": "Xiaomi 12T Pro",
  "M2102K1G": "Xiaomi Mi 11 Ultra",
  "M2007J3SG": "Xiaomi Mi 10T Pro",
  "M1903F11G": "Xiaomi Mi 9T Pro",

  // POCO
  "2412DPC0AG": "POCO X7 Pro",
  "2412DPC0AI": "POCO X7 Pro",
  "24095PCADG": "POCO X7",
  "24122RKC7G": "POCO F7 Ultra",
  "24117RK2CG": "POCO F7 Pro",
  "25053PC47G": "POCO F7",
  "23113RKC6G": "POCO F6 Pro",
  "24069PC21G": "POCO F6",
  "23049PCD8G": "POCO F5",
  "23013PC75G": "POCO F5 Pro",
  "2311DRK48G": "POCO X6 Pro 5G",
  "23122PCD1G": "POCO X6 5G",
  "22101320G": "POCO X5 Pro",
  "M2012K11AG": "POCO F3",
  "M2102J20SG": "POCO X3 Pro",
  "M2007J20CG": "POCO X3 NFC",

  // Redmi
  "24115RA8EG": "Redmi Note 14 Pro+ 5G",
  "24090RA29G": "Redmi Note 14 Pro 5G",
  "24094RAD4G": "Redmi Note 14 5G",
  "24117RN76G": "Redmi Note 14",
  "23090RA98G": "Redmi Note 13 Pro+ 5G",
  "2312DRA50G": "Redmi Note 13 Pro 5G",
  "2312DRAABG": "Redmi Note 13 5G",
  "22101316UG": "Redmi Note 12 Pro+ 5G",
  "22101316G": "Redmi Note 12 Pro 5G",
  "22111317G": "Redmi Note 12 5G",
  "2201116SG": "Redmi Note 11 Pro 5G",
  "M2101K6G": "Redmi Note 10 Pro",
  "M2003J6B2G": "Redmi Note 9 Pro",
  "M1906G7G": "Redmi Note 8 Pro",
  "M1901F7G": "Redmi Note 7",

  // vivo
  "V2514": "vivo X300 Pro",
  "V2515": "vivo X300",
  "V2413": "vivo X200 Pro",
  "V2415": "vivo X200",
  "V2309": "vivo X100 Pro",
  "V2219": "vivo X90 Pro",
  "V2145": "vivo X80 Pro",
  "V2046": "vivo X60 Pro",
  "V2330": "vivo X Fold3 Pro",
  "V2503": "vivo X200 FE",
  "V2505": "vivo X200 FE",
  "V2247": "vivo Y36",
  "V2310": "vivo Y17s",

  // Samsung
  "SC-51B": "Samsung Galaxy S21 5G",
  "SM-S911B": "Samsung Galaxy S23",
  "SM-S916B": "Samsung Galaxy S23+",
  "SM-S918B": "Samsung Galaxy S23 Ultra",
  "SM-S711B": "Samsung Galaxy S23 FE",
  "SM-S921B": "Samsung Galaxy S24",
  "SM-S926B": "Samsung Galaxy S24+",
  "SM-S928B": "Samsung Galaxy S24 Ultra",
  "SM-S721B": "Samsung Galaxy S24 FE",
  "SM-S931B": "Samsung Galaxy S25",
  "SM-S936B": "Samsung Galaxy S25+",
  "SM-S938B": "Samsung Galaxy S25 Ultra",

  // realme
  "RMX3851": "realme GT 6",
  "RMX3853": "realme GT 6T",
  "RMX5011": "realme GT 7 Pro",
  "RMX5061": "realme GT 7",
  "RMX5085": "realme GT 7T",
  "RMX3888": "realme GT5 Pro",
  "RMX3840": "realme 12 Pro+ 5G",
  "RMX3841": "realme 12 Pro+ 5G",
  "RMX3842": "realme 12 Pro 5G",
  "RMX3843": "realme 12 Pro 5G",
  "RMX3921": "realme 13 Pro+ 5G",
  "RMX3988": "realme 13 Pro 5G",
  "RMX5051": "realme 14 Pro+ 5G",
  "RMX5032": "realme P3 Pro 5G",
  "RMX3930": "realme C61",
  "RMX3890": "realme C67 4G",

});

function getDeviceModelName(code) {
  if (!code) return null;
  const normalized = String(code).trim().toUpperCase().replace(/\s+/g, "");
  // Alcuni telefoni Samsung riportano il suffisso dual-SIM /DS.
  const key = normalized.endsWith("/DS") ? normalized.slice(0, -3) : normalized;
  return DEVICE_MODELS[key] || null;
}

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
    return {
      exposure,
      iso,
      frameCount,
      gcamVersion,
      software,
      model,
      modelName: getDeviceModelName(model),
    };
  } catch {
    return null;
  }
}