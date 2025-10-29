"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export interface QuickActionItemType {
  id: number;
  icon: React.ReactNode;
  title: string;
  color: string;
}

export function QuickActionsGrid({
  actions,
  t,
  locale,
}: {
  actions: QuickActionItemType[];
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const router = useRouter();

  const handleActionClick = (title: string) => {
    let path = "";
    switch (title) {
      case "findPartner":
        path = `/${locale}/matching`;
        break;
      case "startChat":
        path = `/${locale}/chat`;
        break;
      case "joinEvent":
        path = `/${locale}/event`;
        break;
      case "upgradePlus":
        path = `/${locale}/pricing`;
        break;
      case "myWallet":
        path = `/${locale}/wallet`;
        break;
      case "games":
        path = `/${locale}/game`;
        break;
      default:
        return;
    }
    router.push(path);
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        {t("quickActions.title", { defaultValue: "Hành động nhanh" })}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((a) => (
          <Card
            key={a.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleActionClick(a.title)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-3 text-center">
              <div
                className={`${a.color} text-white w-12 h-12 rounded-lg flex items-center justify-center`}
              >
                {a.icon}
              </div>
              <span className="text-sm font-medium">
                {t(`quickActions.${a.title}`, { defaultValue: a.title })}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
