"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ChangePasswordTab } from "./edit-tabs/change-password-tab";
import { LanguagesInterestsTab } from "./edit-tabs/languages-interests-tab";
import { PersonalInfoTab } from "./edit-tabs/personal-info-tab";

type EditProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type TabId = "personal" | "languages" | "password";

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const t = useTranslations("profile.editDialog");
  const [activeTab, setActiveTab] = useState<TabId>("personal");

  const tabs = [
    { id: "personal" as TabId, label: t("tabs.personalInfo") },
    { id: "languages" as TabId, label: t("tabs.languagesAndInterests") },
    { id: "password" as TabId, label: t("tabs.changePassword") },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs Navigation */}
        <div className="flex gap-1 border-b">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              className="rounded-b-none"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {activeTab === "personal" && <PersonalInfoTab />}
          {activeTab === "languages" && <LanguagesInterestsTab />}
          {activeTab === "password" && <ChangePasswordTab />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
