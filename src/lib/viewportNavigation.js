// Conserva il punto centrale dell'inquadratura quando cambia la fotografia.
// Le coordinate sono normalizzate rispetto all'immagine originale, non allo schermo.
function validDimensions(natural, box) {
  return natural?.w > 0 && natural?.h > 0 && box?.w > 0 && box?.h > 0;
}

function fitScale(natural, box) {
  return Math.min(box.w / natural.w, box.h / natural.h);
}

export function capturePhotoFocus(view, natural, box) {
  const scale = Number.isFinite(view?.scale) ? view.scale : 1;
  if (!validDimensions(natural, box)) return { scale, u: 0.5, v: 0.5 };
  const fit = fitScale(natural, box);
  const pixelWidth = natural.w * fit * scale;
  const pixelHeight = natural.h * fit * scale;
  if (pixelWidth <= 0 || pixelHeight <= 0) return { scale, u: 0.5, v: 0.5 };
  return {
    scale,
    u: Math.max(0, Math.min(1, 0.5 - (view.x || 0) / pixelWidth)),
    v: Math.max(0, Math.min(1, 0.5 - (view.y || 0) / pixelHeight)),
  };
}

export function restorePhotoFocus(focus, natural, box) {
  const scale = Number.isFinite(focus?.scale) ? focus.scale : 1;
  if (!validDimensions(natural, box)) return { scale, x: 0, y: 0 };
  const fit = fitScale(natural, box);
  const u = Number.isFinite(focus?.u) ? focus.u : 0.5;
  const v = Number.isFinite(focus?.v) ? focus.v : 0.5;
  return {
    scale,
    x: (0.5 - u) * natural.w * fit * scale,
    y: (0.5 - v) * natural.h * fit * scale,
  };
}
