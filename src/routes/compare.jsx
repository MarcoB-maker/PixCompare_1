import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSnapshot, PHOTO_SLOTS } from "@/lib/photoLibrary";
import CompareScreen from "@/components/compare/CompareScreen";

export const Route = createFileRoute("/compare")({
  ssr: false,
  head: () => ({ meta: [{ title: "Compare — PixCompare by MarcoB" }] }),
  component: CompareRoute,
});

function CompareRoute() {
  const navigate = useNavigate();
  const { selection, compareCount } = getSnapshot();
  const slots = PHOTO_SLOTS.slice(0, compareCount);
  const ready = slots.every((slot) => Boolean(selection[slot]));

  useEffect(() => {
    if (!ready) navigate({ to: "/", replace: true });
  }, [ready, navigate]);

  if (!ready) return null;

  return (
    <CompareScreen
      photos={slots.map((slot) => ({ slot, asset: selection[slot] }))}
      onBack={() => navigate({ to: "/" })}
    />
  );
}
