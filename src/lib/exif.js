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
// Riferimenti consultati: produttori OPPO, vivo, Xiaomi e Samsung; catalogo
// KHwang9883/MobileModels (codici e varianti, verifica novembre 2026).
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
  // Ulteriori modelli e varianti documentate (aggiornamento novembre 2026).
  "CPH2307": "OPPO Find X5",
  "PKB110": "OPPO Find X8",
  "PKC110": "OPPO Find X8 Pro",
  "PKC130": "OPPO Find X8 Pro",
  "PKT110": "OPPO Find X8s",
  "PLB110": "OPPO Find X8s+",
  "PKJ110": "OPPO Find X8 Ultra",
  "PKU110": "OPPO Find X8 Ultra",
  "PLJ110": "OPPO Find X9",
  "PLG110": "OPPO Find X9 Pro",
  "PLG120": "OPPO Find X9 Pro",
  "CPH2873": "OPPO Find X9s",
  "PME110": "OPPO Find X9s Pro",
  "CPH2841": "OPPO Find X9 Ultra",
  "PMA110": "OPPO Find X9 Ultra",
  "PMA120": "OPPO Find X9 Ultra",
  "CPH2671": "OPPO Find N5",
  "CPH2765": "OPPO Find N6",
  "CPH2825": "OPPO Reno15 5G",
  "CPH2813": "OPPO Reno15 Pro 5G",
  "CPH2865": "OPPO Reno16 5G",
  "CPH2863": "OPPO Reno16 Pro 5G",


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
  // Ulteriori modelli e varianti documentate (aggiornamento novembre 2026).
  "2410DPN6CC": "Xiaomi 15 Pro",
  "25042PN24C": "Xiaomi 15S Pro",
  "25069PTEBG": "Xiaomi 15T",
  "2506BPN68G": "Xiaomi 15T Pro",
  "2506BPN68R": "Xiaomi 15T Pro",
  "25113PN0EC": "Xiaomi 17",
  "25113PN0EG": "Xiaomi 17",
  "25113PN0EI": "Xiaomi 17",
  "25098PN5AC": "Xiaomi 17 Pro",
  "2509FPN0BC": "Xiaomi 17 Pro Max",
  "2512BPNDAC": "Xiaomi 17 Ultra",
  "2512BPNDAG": "Xiaomi 17 Ultra",
  "2512BPNDAI": "Xiaomi 17 Ultra",
  "25128PNA1C": "Xiaomi 17 Ultra by Leica",
  "25128PNA1G": "Leica Leitzphone powered by Xiaomi",
  "2602DPT53G": "Xiaomi 17T",
  "2602DPT53I": "Xiaomi 17T",
  "2602EPTC0G": "Xiaomi 17T Pro",
  "2602EPTC0R": "Xiaomi 17T Pro",


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
  // Ulteriori modelli e varianti documentate (aggiornamento novembre 2026).
  "2510DPC44G": "POCO F8 Pro",
  "25102PCBEG": "POCO F8 Ultra",
  "2511FPC34G": "POCO X8 Pro",
  "2511FPC34I": "POCO X8 Pro",
  "2602BPC18G": "POCO X8 Pro Max",
  "2602BPC18I": "POCO X8 Pro Max",
  "2607DPC18G": "POCO X8",
  "2607DPC18I": "POCO X8",
  "25118PC98G": "POCO M8 5G",
  "25118PC98I": "POCO M8 5G",
  "2510EPC8BG": "POCO M8 Pro 5G",
  "2409FPCC4G": "POCO M7 Pro 5G",


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
  // Ulteriori modelli e varianti documentate (aggiornamento novembre 2026).
  "25062RN2DA": "Redmi 15",
  "25062RN2DY": "Redmi 15",
  "25062RN2DE": "Redmi 15",
  "25062RN2DL": "Redmi 15",
  "25057RN09G": "Redmi 15 5G",
  "25057RN09E": "Redmi 15 5G",
  "25057RN09I": "Redmi 15 5G",
  "25057RN09R": "Redmi 15 5G",
  "25078RA3EA": "Redmi 15C",
  "25078RA3EY": "Redmi 15C",
  "25078RA3EE": "Redmi 15C",
  "25078RA3EL": "Redmi 15C",
  "2508CRN2BG": "Redmi 15C 5G",
  "2508CRN2BE": "Redmi 15C 5G",
  "2508CRN2BI": "Redmi 15C 5G",
  "2510DRA23G": "Redmi Note 15",
  "2510DRA23E": "Redmi Note 15",
  "2510DRA23L": "Redmi Note 15",
  "25098RA98G": "Redmi Note 15 5G",
  "25098RA98E": "Redmi Note 15 5G",
  "25098RA98I": "Redmi Note 15 5G",
  "25100RA69G": "Redmi Note 15 Pro",
  "25080RABDG": "Redmi Note 15 Pro 5G",
  "25080RABDI": "Redmi Note 15 Pro 5G",
  "25080RABDR": "Redmi Note 15 Pro 5G",
  "2510ERA8BG": "Redmi Note 15 Pro+ 5G",
  "2510ERA8BI": "Redmi Note 15 Pro+ 5G",
  "26062RN92G": "Redmi 17 5G",
  "26062RN92I": "Redmi 17 5G",
  "2606FRN72Y": "Redmi 17",
  "2606FRN72L": "Redmi 17",
  "26012RN62A": "Redmi Note 17",
  "26012RN62Y": "Redmi Note 17",
  "26081RA18G": "Redmi Note 17 5G",
  "2607DRA18G": "Redmi Note 17 Pro 5G",


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
  // Ulteriori modelli e varianti documentate (aggiornamento novembre 2026).
  "V2561": "vivo X200T",
  "V2537": "vivo X300 FE",
  "V2542": "vivo X300 FE",
  "V2562": "vivo X300 Ultra",
  "V2559": "vivo X Fold6",
  "V2619": "vivo X500",
  "V2621": "vivo X500 Pro",
  "V2622": "vivo X500 Pro",
  "V2610": "vivo X500 Pro Max",


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
  // Ulteriori modelli e varianti documentate (aggiornamento novembre 2026).
  "SM-G980F": "Samsung Galaxy S20",
  "SM-G981B": "Samsung Galaxy S20 5G",
  "SM-G981U": "Samsung Galaxy S20 5G",
  "SM-G981U1": "Samsung Galaxy S20 5G",
  "SM-G981W": "Samsung Galaxy S20 5G",
  "SM-G981N": "Samsung Galaxy S20 5G",
  "SM-G985F": "Samsung Galaxy S20+",
  "SM-G986B": "Samsung Galaxy S20+ 5G",
  "SM-G986U": "Samsung Galaxy S20+ 5G",
  "SM-G986U1": "Samsung Galaxy S20+ 5G",
  "SM-G986W": "Samsung Galaxy S20+ 5G",
  "SM-G988B": "Samsung Galaxy S20 Ultra 5G",
  "SM-G988U": "Samsung Galaxy S20 Ultra 5G",
  "SM-G988U1": "Samsung Galaxy S20 Ultra 5G",
  "SM-G780F": "Samsung Galaxy S20 FE",
  "SM-G780G": "Samsung Galaxy S20 FE",
  "SM-G781B": "Samsung Galaxy S20 FE 5G",
  "SM-G781U": "Samsung Galaxy S20 FE 5G",
  "SM-G781U1": "Samsung Galaxy S20 FE 5G",
  "SC-51A": "Samsung Galaxy S20 5G",
  "SC-52A": "Samsung Galaxy S20+ 5G",
  "SM-G991B": "Samsung Galaxy S21 5G",
  "SM-G991U": "Samsung Galaxy S21 5G",
  "SM-G991U1": "Samsung Galaxy S21 5G",
  "SM-G996B": "Samsung Galaxy S21+ 5G",
  "SM-G996U": "Samsung Galaxy S21+ 5G",
  "SM-G996U1": "Samsung Galaxy S21+ 5G",
  "SM-G998B": "Samsung Galaxy S21 Ultra 5G",
  "SM-G998U": "Samsung Galaxy S21 Ultra 5G",
  "SM-G998U1": "Samsung Galaxy S21 Ultra 5G",
  "SM-G990B": "Samsung Galaxy S21 FE 5G",
  "SM-G990U": "Samsung Galaxy S21 FE 5G",
  "SM-G990U1": "Samsung Galaxy S21 FE 5G",
  "SM-S901B": "Samsung Galaxy S22",
  "SM-S901U": "Samsung Galaxy S22",
  "SM-S901U1": "Samsung Galaxy S22",
  "SM-S906B": "Samsung Galaxy S22+",
  "SM-S906U": "Samsung Galaxy S22+",
  "SM-S906U1": "Samsung Galaxy S22+",
  "SM-S908B": "Samsung Galaxy S22 Ultra",
  "SM-S908E": "Samsung Galaxy S22 Ultra",
  "SM-S908U": "Samsung Galaxy S22 Ultra",
  "SM-S908U1": "Samsung Galaxy S22 Ultra",
  "SC-52C": "Samsung Galaxy S22 Ultra",
  "SM-S911U": "Samsung Galaxy S23",
  "SM-S911U1": "Samsung Galaxy S23",
  "SM-S916U": "Samsung Galaxy S23+",
  "SM-S916U1": "Samsung Galaxy S23+",
  "SM-S918U": "Samsung Galaxy S23 Ultra",
  "SM-S918U1": "Samsung Galaxy S23 Ultra",
  "SM-S711U": "Samsung Galaxy S23 FE",
  "SC-51D": "Samsung Galaxy S23",
  "SC-52D": "Samsung Galaxy S23 Ultra",
  "SM-S921U": "Samsung Galaxy S24",
  "SM-S921U1": "Samsung Galaxy S24",
  "SM-S926U": "Samsung Galaxy S24+",
  "SM-S926U1": "Samsung Galaxy S24+",
  "SM-S928U": "Samsung Galaxy S24 Ultra",
  "SM-S928U1": "Samsung Galaxy S24 Ultra",
  "SM-S721U": "Samsung Galaxy S24 FE",
  "SM-S721U1": "Samsung Galaxy S24 FE",
  "SM-S931U": "Samsung Galaxy S25",
  "SM-S931U1": "Samsung Galaxy S25",
  "SM-S936U": "Samsung Galaxy S25+",
  "SM-S936U1": "Samsung Galaxy S25+",
  "SM-S938U": "Samsung Galaxy S25 Ultra",
  "SM-S938U1": "Samsung Galaxy S25 Ultra",
  "SM-S937B": "Samsung Galaxy S25 Edge",
  "SM-S937U": "Samsung Galaxy S25 Edge",
  "SM-S731B": "Samsung Galaxy S25 FE",
  "SM-S731U": "Samsung Galaxy S25 FE",
  "SC-51F": "Samsung Galaxy S25",
  "SC-52F": "Samsung Galaxy S25 Ultra",
  "SM-S942B": "Samsung Galaxy S26",
  "SM-S942U": "Samsung Galaxy S26",
  "SM-S942U1": "Samsung Galaxy S26",
  "SM-S942N": "Samsung Galaxy S26",
  "SM-S947B": "Samsung Galaxy S26+",
  "SM-S947U": "Samsung Galaxy S26+",
  "SM-S947U1": "Samsung Galaxy S26+",
  "SM-S948B": "Samsung Galaxy S26 Ultra",
  "SM-S948U": "Samsung Galaxy S26 Ultra",
  "SM-S948U1": "Samsung Galaxy S26 Ultra",
  "SM-S741B": "Samsung Galaxy S26 FE",
  "SC-51G": "Samsung Galaxy S26",
  "SC-52G": "Samsung Galaxy S26+",
  "SC-53G": "Samsung Galaxy S26 Ultra",
  "SM-A145F": "Samsung Galaxy A14",
  "SM-A146B": "Samsung Galaxy A14 5G",
  "SM-A155F": "Samsung Galaxy A15",
  "SM-A156B": "Samsung Galaxy A15 5G",
  "SM-A165F": "Samsung Galaxy A16",
  "SM-A166B": "Samsung Galaxy A16 5G",
  "SM-A175F": "Samsung Galaxy A17",
  "SM-A176B": "Samsung Galaxy A17 5G",
  "SM-A245F": "Samsung Galaxy A24",
  "SM-A256B": "Samsung Galaxy A25 5G",
  "SM-A266B": "Samsung Galaxy A26 5G",
  "SM-A336B": "Samsung Galaxy A33 5G",
  "SM-A346B": "Samsung Galaxy A34 5G",
  "SM-A356B": "Samsung Galaxy A35 5G",
  "SM-A366B": "Samsung Galaxy A36 5G",
  "SM-A376B": "Samsung Galaxy A37 5G",
  "SM-A546B": "Samsung Galaxy A54 5G",
  "SM-A556B": "Samsung Galaxy A55 5G",
  "SM-A566B": "Samsung Galaxy A56 5G",
  "SM-A576B": "Samsung Galaxy A57 5G",


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
  // Ulteriori modelli e varianti documentate (aggiornamento novembre 2026).
  "RMX5210": "realme GT 8 Pro",
  "RMX5106": "realme 15 5G",
  "RMX5101": "realme 15 Pro 5G",
  "RMX5111": "realme 15T 5G",
  "RMX5000": "realme 15 Lite 5G",
  "RMX5171": "realme 16 5G",
  "RMX5120": "realme 16 Pro 5G",
  "RMX5131": "realme 16 Pro+ 5G",
  "RMX5056": "realme 14 Pro 5G",
  "RMX5057": "realme 14 Pro 5G",
  "RMX5054": "realme 14 Pro+ 5G",
  "RMX5070": "realme 14 5G",
  "RMX3943": "realme 14x 5G",
  "RMX5074": "realme 14T 5G",
  "RMX2075": "realme X50 Pro 5G",
  "RMX3301": "realme GT 2 Pro 5G",
  "RMX3709": "realme GT 3 240W",


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