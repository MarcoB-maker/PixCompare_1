export const IDENTITY = { scale: 1, x: 0, y: 0 };

// transform = scale * p + translation (coordinates relative to the pane centre)
export function compose(base, delta) {
  return {
    scale: base.scale * delta.scale,
    x: delta.scale * base.x + delta.x,
    y: delta.scale * base.y + delta.y,
  };
}

// The transformation that takes `base` to `next`, so compose(base, delta) === next
export function extractDelta(base, next) {
  const scale = base.scale === 0 ? 1 : next.scale / base.scale;
  return {
    scale,
    x: next.x - scale * base.x,
    y: next.y - scale * base.y,
  };
}