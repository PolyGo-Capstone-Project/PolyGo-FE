"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";

type Props = {
  title: string;
  description: string;
  languageLabel: string;
  category: string;
  onQuit: () => void;
};

export default function HeaderCard({
  title,
  description,
  languageLabel,
  category,
  onQuit,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{languageLabel}</Badge>
            <Badge variant="outline">{category}</Badge>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2 w-full sm:w-auto"
          onClick={onQuit}
        >
          <LogOut className="h-4 w-4" />
          {/* text i18n đặt tại page */}
        </Button>
      </CardHeader>
    </Card>
  );
}
