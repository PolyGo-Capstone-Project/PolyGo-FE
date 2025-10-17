"use client";

import type { TranslationValues } from "next-intl";
import Image from "next/image";

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from "@/components/ui";
import { UserMatchingItemType } from "@/models";

const EMPTY_ICON = "—";

type SafeTranslate = (
  key: string,
  fallback: string,
  values?: TranslationValues
) => string;

type UserDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserMatchingItemType | null;
  safeTranslate: SafeTranslate;
  lang: string;
};

export function UserDetailDialog({
  open,
  onOpenChange,
  user,
  safeTranslate,
  lang,
}: UserDetailDialogProps) {
  if (!user) return null;

  const formatDateTime = (value?: string | null) => {
    if (!value) return EMPTY_ICON;

    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return EMPTY_ICON;

      const timeZone =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined;

      return new Intl.DateTimeFormat(lang, {
        dateStyle: "long",
        timeStyle: "medium",
        timeZone,
      }).format(date);
    } catch {
      return new Date(value).toLocaleString(lang);
    }
  };

  const formatNumber = (value: number) => {
    try {
      return new Intl.NumberFormat(lang).format(value);
    } catch {
      return value.toLocaleString();
    }
  };

  const getMeritLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      TRUSTED: "default",
      NORMAL: "secondary",
      WARNED: "destructive",
      RESTRICTED: "destructive",
      BANNED: "destructive",
    };
    return colors[level] || "secondary";
  };

  const getGenderDisplay = (gender: string | null) => {
    if (!gender) return EMPTY_ICON;
    return safeTranslate(`gender.${gender.toLowerCase()}`, gender);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {safeTranslate("detailDialog.title", "User details")}
          </DialogTitle>
          <DialogDescription className="text-base">
            {user.name} • {user.mail}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="flex flex-col gap-6 py-4">
            {/* User Avatar & Basic Info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex justify-center md:justify-start w-full md:w-auto">
                <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-muted shadow-sm border-2">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-500 to-purple-600">
                      <span className="text-4xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {safeTranslate("detailDialog.role", "Role")}
                    </span>
                    <Badge variant="outline" className="w-fit text-base py-1">
                      {user.role}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {safeTranslate("detailDialog.meritLevel", "Merit Level")}
                    </span>
                    <Badge
                      variant={getMeritLevelColor(user.meritLevel) as any}
                      className="w-fit text-base py-1"
                    >
                      {user.meritLevel}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {safeTranslate("detailDialog.gender", "Gender")}
                    </span>
                    <span className="text-base font-medium">
                      {getGenderDisplay(user.gender)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {safeTranslate("detailDialog.isNew", "Account Status")}
                    </span>
                    <Badge
                      variant={user.isNew ? "secondary" : "outline"}
                      className="w-fit text-base py-1"
                    >
                      {user.isNew
                        ? safeTranslate("detailDialog.newUser", "New User")
                        : safeTranslate(
                            "detailDialog.established",
                            "Established"
                          )}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction */}
            {user.introduction && (
              <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <span className="text-sm font-semibold">
                  {safeTranslate("detailDialog.introduction", "Introduction")}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {user.introduction}
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {safeTranslate("detailDialog.experiencePoints", "XP")}
                </span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatNumber(user.experiencePoints)}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {safeTranslate("detailDialog.streakDays", "Streak")}
                </span>
                <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {formatNumber(user.streakDays)}
                  <span className="text-sm font-normal ml-1">
                    {safeTranslate("detailDialog.days", "days")}
                  </span>
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {safeTranslate("detailDialog.balance", "Balance")}
                </span>
                <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatNumber(user.balance)}
                  <span className="text-sm font-normal ml-1">VND</span>
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {safeTranslate("detailDialog.autoRenew", "Auto Renew")}
                </span>
                <Badge
                  variant={user.autoRenewSubscription ? "default" : "secondary"}
                  className="w-fit text-base py-1"
                >
                  {user.autoRenewSubscription
                    ? safeTranslate("detailDialog.enabled", "Enabled")
                    : safeTranslate("detailDialog.disabled", "Disabled")}
                </Badge>
              </div>
            </div>

            {/* Languages Section */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">
                {safeTranslate("detailDialog.languages", "Languages")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Speaking Languages */}
                <div className="flex flex-col gap-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {safeTranslate(
                        "detailDialog.speakingLanguages",
                        "Speaking Languages"
                      )}
                    </span>
                    <Badge variant="outline">
                      {user.speakingLanguages?.length || 0}
                    </Badge>
                  </div>
                  {user.speakingLanguages &&
                  user.speakingLanguages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.speakingLanguages.map((lang) => (
                        <div
                          key={lang.id}
                          className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-muted/30"
                        >
                          {lang.iconUrl && (
                            <Image
                              src={lang.iconUrl}
                              alt={lang.name}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                          )}
                          <span className="text-sm font-medium">
                            {lang.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {safeTranslate(
                        "detailDialog.noLanguages",
                        "No languages set"
                      )}
                    </span>
                  )}
                </div>

                {/* Learning Languages */}
                <div className="flex flex-col gap-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      {safeTranslate(
                        "detailDialog.learningLanguages",
                        "Learning Languages"
                      )}
                    </span>
                    <Badge variant="outline">
                      {user.learningLanguages?.length || 0}
                    </Badge>
                  </div>
                  {user.learningLanguages &&
                  user.learningLanguages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.learningLanguages.map((lang) => (
                        <div
                          key={lang.id}
                          className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-muted/30"
                        >
                          {lang.iconUrl && (
                            <Image
                              src={lang.iconUrl}
                              alt={lang.name}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                          )}
                          <span className="text-sm font-medium">
                            {lang.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {safeTranslate(
                        "detailDialog.noLanguages",
                        "No languages set"
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Interests Section */}
            <div className="flex flex-col gap-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {safeTranslate("detailDialog.interests", "Interests")}
                </span>
                <Badge variant="outline">{user.interests?.length || 0}</Badge>
              </div>
              {user.interests && user.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      {interest.iconUrl && (
                        <Image
                          src={interest.iconUrl}
                          alt={interest.name}
                          width={20}
                          height={20}
                          className="rounded"
                        />
                      )}
                      <span className="text-sm font-medium">
                        {interest.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {safeTranslate(
                    "detailDialog.noInterests",
                    "No interests set"
                  )}
                </span>
              )}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {safeTranslate("detailDialog.createdAt", "Created at")}
                </span>
                <span className="text-sm font-mono">
                  {formatDateTime(user.createdAt)}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {safeTranslate("detailDialog.lastLoginAt", "Last login")}
                </span>
                <span className="text-sm font-mono">
                  {formatDateTime(user.lastLoginAt)}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-4 border rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {safeTranslate("detailDialog.accountId", "Account ID")}
                </span>
                <code className="text-xs font-mono px-2 py-1 bg-muted rounded break-all">
                  {user.id}
                </code>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {safeTranslate("detailDialog.close", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
