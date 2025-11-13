"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCall } from "@/contexts/call-context";
import { ChatUser } from "@/types";
import { MoreVertical, Phone, Search, Trash2, User, Video } from "lucide-react";

interface ChatHeaderProps {
  user: ChatUser;
  isTyping: boolean;
  onSearchMessages: () => void;
  onDeleteConversation: () => void;
  locale: string;
  hideActions?: boolean;
}

export function ChatHeader({
  user,
  isTyping,
  onSearchMessages,
  onDeleteConversation,
  locale,
  hideActions = false,
}: ChatHeaderProps) {
  const t = useTranslations("chat");
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { startVoiceCall, startVideoCall } = useCall();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusText = () => {
    if (isTyping) {
      return t("typing");
    }

    if (user.isOnline) {
      return t("online");
    }

    if (user.lastSeen) {
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - user.lastSeen.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 60) {
        return `${diffInMinutes} ${locale === "vi" ? "phút trước" : "minutes ago"}`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} ${locale === "vi" ? "giờ trước" : "hours ago"}`;
      }

      return t("offline");
    }

    return t("offline");
  };

  const handleViewProfile = () => {
    router.push(`/${locale}/matching/${user.id}`);
  };

  const handleDeleteConfirm = () => {
    onDeleteConversation();
    setShowDeleteDialog(false);
  };

  const handleVoiceCall = () => {
    startVoiceCall(user.id, user.name);
  };

  const handleVideoCall = () => {
    startVideoCall(user.id, user.name);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Avatar with online status */}
          <div className="relative">
            <Avatar className="size-9 md:size-10">
              <AvatarImage
                src={user.avatar ?? user.avatarUrl ?? undefined}
                alt={user.name}
              />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 size-2.5 md:size-3 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>

          {/* User Info */}
          <div>
            <h3 className="text-sm font-semibold md:text-base">{user.name}</h3>
            <p
              className={`text-xs md:text-sm ${
                isTyping ? "text-primary italic" : "text-muted-foreground"
              }`}
            >
              {getStatusText()}
            </p>
          </div>
        </div>

        {/* Actions */}
        {!hideActions && (
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              size="icon-sm"
              variant="ghost"
              title={t("voiceCall")}
              className="md:size-9"
              onClick={handleVoiceCall}
            >
              <Phone className="size-4 md:size-5" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              title={t("videoCall")}
              className="md:size-9"
              onClick={handleVideoCall}
            >
              <Video className="size-4 md:size-5" />
            </Button>

            {/* More Options Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="ghost" className="md:size-9">
                  <MoreVertical className="size-4 md:size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleViewProfile}>
                  <User className="mr-2 size-4" />
                  {t("viewProfile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSearchMessages}>
                  <Search className="mr-2 size-4" />
                  {t("searchMessages")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  {t("deleteConversation")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConversationTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConversationDescription", { name: user.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
