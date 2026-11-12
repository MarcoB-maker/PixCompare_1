export default function BrandMark() {
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
      <span className="flex flex-col gap-[3px]">
        <span className="block h-[7px] w-[15px] rounded-[2px] bg-primary" />
        <span className="block h-[7px] w-[15px] rounded-[2px] bg-white/40" />
      </span>
    </span>
  );
}