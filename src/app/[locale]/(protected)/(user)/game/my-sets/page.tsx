"use client";

import CreatedTab from "@/components/modules/game/my-sets/created-tab";
import MySetsHeader from "@/components/modules/game/my-sets/my-set-header";
import PlayedTab from "@/components/modules/game/my-sets/played-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyPuzzleSetsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      <MySetsHeader />

      <Tabs defaultValue="created" className="space-y-5">
        <TabsList className="w-full grid grid-cols-2 md:w-auto md:inline-grid">
          <TabsTrigger value="created">Created by Me</TabsTrigger>
          <TabsTrigger value="played">Played by Me</TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-5">
          <CreatedTab />
        </TabsContent>

        <TabsContent value="played" className="space-y-5">
          <PlayedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
