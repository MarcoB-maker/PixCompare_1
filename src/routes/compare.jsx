import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSnapshot } from "@/lib/photoLibrary";
import CompareScreen from "@/components/compare/CompareScreen";

export const Route = createFileRoute("/compare")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Confronto — PixCompare Mb" }],
  }),
  component: CompareRoute,
});

function CompareRoute() {
  const navigate = useNavigate();
  const { selection } = getSnapshot();
  const ready = Boolean(selection.a && selection.b);

  useEffect(() => {
    if (!ready) navigate({ to: "/", replace: true });
  }, [ready, navigate]);

  if (!ready) return null;

  return (
    <CompareScreen
      photoA={selection.a}
      photoB={selection.b}
      onBack={() => navigate({ to: "/" })}
    />
  );
}