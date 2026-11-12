import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { decodeTexture } from "@/lib/texture";
import { IDENTITY } from "@/lib/transform";

const MIN_ZOOM = 1;
const MAX_ZOOM = 40;

function zoomLabel(view) {
  return `${Math.round(view.scale * 100)}%`;
}

export default function ComparePane({ badge, name, file, exif, onChange, showExif, hdr, apiRef }) {
  const containerRef = useRef(null);
  const hostRef = useRef(null);
  const textureRef = useRef(null);
  const zoomRef = useRef(null);
  const dimsRef = useRef(null);
  const naturalRef = useRef(null);
  const boxRef = useRef({ w: 0, h: 0 });
  const viewRef = useRef(IDENTITY);
  const pointers = useRef(new Map());
  const gestureRef = useRef(null);
  const [ready, setReady] = useState(false);

  const clampView = useCallback((next) => {
    const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next.scale));
    const nat = naturalRef.current;
    const box = boxRef.current;
    if (!nat || !box.w || !box.h) return { ...next, scale };
    const fit = Math.min(box.w / nat.w, box.h / nat.h);
    const total = fit * scale;
    const maxX = Math.max(0, (nat.w * total - box.w) / 2);
    const maxY = Math.max(0, (nat.h * total - box.h) / 2);
    return {
      scale,
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, []);

  // Writes the transform straight onto the texture: no bitmap resizing, GPU only.
  const applyView = useCallback((view) => {
    viewRef.current = view;
    const el = textureRef.current;
    const nat = naturalRef.current;
    const box = boxRef.current;
    if (!el || !nat || !box.w || !box.h) return;
    const fit = Math.min(box.w / nat.w, box.h / nat.h);
    const total = fit * view.scale;
    el.style.transform = `translate3d(${view.x}px, ${view.y}px, 0) scale(${total})`;
    if (zoomRef.current) zoomRef.current.textContent = zoomLabel(view);
  }, []);

  // Full-resolution texture, swapped at runtime when UHDR changes.
  useEffect(() => {
    let cancelled = false;
    let release = () => {};

    decodeTexture(file, { hdr })
      .then((texture) => {
        if (cancelled) {
          if (texture.release) texture.release();
          return;
        }
        const host = hostRef.current;
        if (!host) return;
        release = texture.release || release;

        const el = texture.element;
        el.className = "pixelated block max-w-none select-none";
        el.style.width = `${texture.width}px`;
        el.style.height = `${texture.height}px`;
        el.style.transformOrigin = "center center";
        el.style.willChange = "transform";

        host.style.width = `${texture.width}px`;
        host.style.height = `${texture.height}px`;
        host.style.marginLeft = `${-texture.width / 2}px`;
        host.style.marginTop = `${-texture.height / 2}px`;
        host.replaceChildren(el);

        naturalRef.current = { w: texture.width, h: texture.height };
        textureRef.current = el;
        if (dimsRef.current) dimsRef.current.textContent = `${texture.width}×${texture.height}`;
        setReady(true);
        applyView(viewRef.current);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      release();
    };
  }, [file, hdr, applyView]);

  // Keep the box size and the transform in sync with layout changes (rotation, split resize).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const measure = () => {
      boxRef.current = { w: el.clientWidth, h: el.clientHeight };
      applyView(viewRef.current);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [applyView]);

  // Exposed to the parent so it can push a transform onto this pane without a re-render.
  useEffect(() => {
    if (!apiRef) return undefined;
    apiRef.current = {
      apply: applyView,
      clamp: clampView,
      get: () => viewRef.current,
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, applyView, clampView]);

  const push = useCallback(
    (next) => {
      const clamped = clampView(next);
      applyView(clamped);
      onChange(clamped);
    },
    [applyView, clampView, onChange]
  );

  const beginGesture = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const points = [...pointers.current.values()];
    const rect = el.getBoundingClientRect();
    const base = viewRef.current;
    if (points.length === 1) {
      gestureRef.current = {
        type: "pan",
        startX: points[0].x,
        startY: points[0].y,
        base,
      };
    } else if (points.length >= 2) {
      const [p1, p2] = points;
      gestureRef.current = {
        type: "pinch",
        distance: Math.max(1, Math.hypot(p1.x - p2.x, p1.y - p2.y)),
        anchorX: (p1.x + p2.x) / 2 - (rect.left + rect.width / 2),
        anchorY: (p1.y + p2.y) / 2 - (rect.top + rect.height / 2),
        base,
      };
    } else {
      gestureRef.current = null;
    }
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* pointer sintetico */
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    beginGesture();
  };

  const handlePointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const current = gestureRef.current;
    if (!current) return;
    const points = [...pointers.current.values()];

    if (current.type === "pan" && points.length === 1) {
      push({
        scale: current.base.scale,
        x: current.base.x + (points[0].x - current.startX),
        y: current.base.y + (points[0].y - current.startY),
      });
      return;
    }

    if (current.type === "pinch" && points.length >= 2) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const [p1, p2] = points;
      const distance = Math.max(1, Math.hypot(p1.x - p2.x, p1.y - p2.y));
      const scale = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, current.base.scale * (distance / current.distance))
      );
      const ratio = scale / current.base.scale;
      const anchorX = (p1.x + p2.x) / 2 - (rect.left + rect.width / 2);
      const anchorY = (p1.y + p2.y) / 2 - (rect.top + rect.height / 2);
      push({
        scale,
        x: anchorX - ratio * (current.anchorX - current.base.x),
        y: anchorY - ratio * (current.anchorY - current.base.y),
      });
    }
  };

  const handlePointerUp = (event) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) gestureRef.current = null;
    else beginGesture();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const onWheel = (event) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const base = viewRef.current;
      const pointX = event.clientX - (rect.left + rect.width / 2);
      const pointY = event.clientY - (rect.top + rect.height / 2);
      const factor = Math.exp(-event.deltaY * 0.0025);
      const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, base.scale * factor));
      const ratio = scale / base.scale;
      push({
        scale,
        x: pointX - ratio * (pointX - base.x),
        y: pointY - ratio * (pointY - base.y),
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [push]);

  const bindZoom = (node) => {
    zoomRef.current = node;
    if (node) node.textContent = zoomLabel(viewRef.current);
  };

  const bindDims = (node) => {
    dimsRef.current = node;
    if (!node) return;
    const nat = naturalRef.current;
    node.textContent = nat ? `${nat.w}×${nat.h}` : "—";
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="relative h-full w-full touch-none select-none overflow-hidden"
        style={{ contain: "paint" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={hostRef}
          className="absolute left-1/2 top-1/2"
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center text-white/40">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
      </div>

      <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-black/55 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.1em] text-white/70 backdrop-blur-sm">
        {badge}
      </span>

      {showExif && (
        <div className="pointer-events-none absolute bottom-2.5 right-2.5 max-w-[82%] rounded-lg bg-black/55 px-2.5 py-2 font-mono text-[10px] leading-[1.35] text-white/85 backdrop-blur-sm">
          <p className="truncate text-white">{name}</p>
          <p className="mt-1">
            {exif === undefined ? "…" : exif?.exposure || "n/d"}
            <span className="text-white/35"> · </span>
            ISO {exif === undefined ? "…" : exif?.iso || "n/d"}
          </p>
          <p>
            <span ref={bindDims}>—</span> px
          </p>
          <p className="text-primary">
            Zoom: <span ref={bindZoom}>100%</span>
          </p>
        </div>
      )}
    </div>
  );
}