import { IconBan, IconShieldCheck, IconShieldHalf } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";

type MeritBadgeProps = {
  merit: number;
  showValue?: boolean;
  className?: string;
};

export function MeritBadge({
  merit,
  showValue = true,
  className,
}: MeritBadgeProps) {
  const t = useTranslations("merit");

  const getMeritConfig = (merit: number) => {
    if (merit >= 71 && merit <= 100) {
      // Rất tin cậy - Xanh lá đậm
      return {
        label: t("reliable.label"),
        icon: IconShieldCheck,
        gradient: "from-green-500 to-emerald-600",
        description: t("reliable.description", { merit }),
      };
    }
    if (merit >= 41 && merit <= 70) {
      // Ổn định - Vàng/Cam
      return {
        label: t("stable.label"),
        icon: IconShieldHalf,
        gradient: "from-yellow-500 to-orange-500",
        description: t("stable.description", { merit }),
      };
    }
    // 0-40: Cấm - Đỏ
    return {
      label: t("banned.label"),
      icon: IconBan,
      gradient: "from-red-500 to-rose-600",
      description: t("banned.description", { merit }),
    };
  };

  const config = getMeritConfig(merit);
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full bg-gradient-to-r px-2 py-1",
            config.gradient,
            className
          )}
        >
          <Icon className="h-3.5 w-3.5 text-white" />
          {showValue && (
            <span className="text-xs font-semibold text-white">{merit}</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
