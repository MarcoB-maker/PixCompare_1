export default function HdrToggle({ hdr, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!hdr)}
      aria-pressed={hdr}
      aria-label={hdr ? "UHDR attivo, passa a SDR" : "SDR attivo, passa a UHDR"}
      className={`h-9 rounded-full px-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition active:scale-95 ${
        hdr ? "bg-primary/15 text-primary" : "text-white/45 hover:bg-white/10"
      }`}
    >
      UHDR
    </button>
  );
}