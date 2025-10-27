"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function QuickActionsGrid({
  actions,
  t,
  locale,
}: {
  actions: { id: number; icon: string; title: string; color: string }[];
  t: ReturnType<typeof useTranslations>;
  locale: string;
}) {
  const router = useRouter();

  // Hàm xử lý điều hướng
  const handleActionClick = (title: string) => {
    let path = "";

    // Ánh xạ các tiêu đề hành động nhanh đến các route thực tế
    switch (title) {
      case "findPartner":
        path = `/${locale}/matching`; // Giả định route tìm đối tác
        break;
      case "startChat":
        path = `/${locale}/chat`; // Giả định route chat
        break;
      case "joinEvent":
        path = `/${locale}/event`; // Giả định route sự kiện
        break;
      case "upgradePlus":
        path = `/${locale}/pricing`; // Giả định route nâng cấp
        break;
      case "myWallet":
        path = `/${locale}/wallet`; // Giả định route ví
        break;
      case "games":
        path = `/${locale}/game`; // Giả định route trò chơi
        break;
      default:
        return;
    }

    // Điều hướng đến route
    router.push(path);
  };

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 mb-4">
        {t("quickActions.title", { defaultValue: "Hành động nhanh" })}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {actions.map((a) => (
          <Card
            key={a.id}
            className="hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
            // Thêm hàm xử lý onClick vào Card
            onClick={() => handleActionClick(a.title)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <div
                  className={`${a.color} text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                >
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {t(`quickActions.${a.title}`, { defaultValue: a.title })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
