import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function DefaultCatchBoundary({ error }) {
  const { t } = useTranslation();
  const router = useRouter();
  const isRoot = useMatch({ strict: false, select: (state) => state.id === rootRouteId });

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24">
      <ErrorComponent error={error} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.invalidate()}>
          {t("retry")}
        </Button>
        <Button asChild>{isRoot ? <Link to="/">{t("home")}</Link> : <Link to="/" onClick={(e) => { e.preventDefault(); window.history.back(); }}>{t("goBack")}</Link>}</Button>
      </div>
    </div>
  );
}
