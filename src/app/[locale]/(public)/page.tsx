import { useTranslations } from "next-intl";

import { Button } from "@/components";
import { ModeToggle } from "@/components/modules/mode-toggle";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <h1 className="text-5xl font-bold text-center">{t("title")}</h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          Online Language & Cultural Exchange Platform
        </p>
        <div className="flex gap-4">
          <Button size="lg">{t("clickMe")}</Button>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
