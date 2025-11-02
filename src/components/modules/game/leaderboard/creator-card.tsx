"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

type Creator = {
  name: string;
  avatar?: string;
  joinedAt: string;
  rating: number;
};

const DEFAULT_CREATOR: Creator = {
  name: "AnnaFR",
  avatar: "https://i.pravatar.cc/150?img=32",
  joinedAt: "12/10/2025",
  rating: 4.9,
};

export default function CreatorCard({ creator }: { creator?: Creator }) {
  const t = useTranslations();
  const c = creator ?? DEFAULT_CREATOR;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">
          {t("lb.creator", { default: "Created By" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {c.avatar ? (
              <AvatarImage src={c.avatar} alt={c.name} />
            ) : (
              <AvatarFallback>{c.name.slice(0, 2)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-muted-foreground">
              {c.joinedAt} • <Star className="inline h-3 w-3 -mt-0.5" />{" "}
              {c.rating} {t("lb.rating", { default: "rating" })}
            </div>
          </div>
        </div>
        <Button className="w-full">
          {t("lb.messageCreator", { default: "Message Creator" })}
        </Button>
      </CardContent>
    </Card>
  );
}
