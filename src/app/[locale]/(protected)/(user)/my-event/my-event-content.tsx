"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  EventsCreatedTab,
  EventsJoinedTab,
} from "@/components/modules/event/my-event";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

export default function MyEventContent() {
  const t = useTranslations("event.myEvent");
  const [activeTab, setActiveTab] = useState<string>("created");

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="created">{t("tabs.created")}</TabsTrigger>
              <TabsTrigger value="joined">{t("tabs.joined")}</TabsTrigger>
            </TabsList>
            <TabsContent value="created" className="space-y-4">
              <EventsCreatedTab />
            </TabsContent>
            <TabsContent value="joined" className="space-y-4">
              <EventsJoinedTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
