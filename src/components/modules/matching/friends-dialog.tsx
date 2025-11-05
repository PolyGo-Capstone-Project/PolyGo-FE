"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components";
import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetFriendRequests,
  useGetFriends,
  useGetSentFriendRequests,
  useRejectFriendRequestMutation,
  useRemoveFriendMutation,
} from "@/hooks";
import { showErrorToast, showSuccessToast } from "@/lib";
import type { UserMatchingItemType } from "@/models";
import {
  IconUserCheck,
  IconUsers,
  IconUserSearch,
  IconX,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FriendsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale: string;
};

export function FriendsDialog({
  open,
  onOpenChange,
  locale,
}: FriendsDialogProps) {
  const t = useTranslations("matching.friends");
  const tSuccess = useTranslations("Success");
  const tError = useTranslations("Error");
  const tCard = useTranslations("matching.card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("friends");

  // Fetch friends
  const { data: friendsData, refetch: refetchFriends } = useGetFriends(
    { pageNumber: 1, pageSize: 50, lang: locale },
    { enabled: open }
  );

  // Fetch received requests
  const { data: receivedRequestsData, refetch: refetchReceivedRequests } =
    useGetFriendRequests(
      { pageNumber: 1, pageSize: 50, lang: locale },
      { enabled: open }
    );

  // Fetch sent requests
  const { data: sentRequestsData, refetch: refetchSentRequests } =
    useGetSentFriendRequests(
      { pageNumber: 1, pageSize: 50, lang: locale },
      { enabled: open }
    );

  // Mutations
  const acceptMutation = useAcceptFriendRequestMutation({
    onSuccess: () => {
      showSuccessToast("friendRequestAccepted", tSuccess);
      refetchFriends();
      refetchReceivedRequests();
    },
    onError: () => {
      showErrorToast("failAccept", tError);
    },
  });

  const rejectMutation = useRejectFriendRequestMutation({
    onSuccess: () => {
      showSuccessToast("friendRequestRejected", tSuccess);
      refetchReceivedRequests();
    },
    onError: () => {
      showErrorToast("failReject", tError);
    },
  });

  const cancelMutation = useCancelFriendRequestMutation({
    onSuccess: () => {
      showSuccessToast("friendRequestCancelled", tSuccess);
      refetchSentRequests();
    },
    onError: () => {
      showErrorToast("failCancel", tError);
    },
  });

  const removeMutation = useRemoveFriendMutation({
    onSuccess: () => {
      showSuccessToast("friendRemoved", tSuccess);
      refetchFriends();
    },
    onError: () => {
      showErrorToast("failRemove", tError);
    },
  });

  const friends = (friendsData?.payload.data?.items ||
    []) as UserMatchingItemType[];
  const receivedRequests = (receivedRequestsData?.payload.data?.items ||
    []) as UserMatchingItemType[];
  const sentRequests = (sentRequestsData?.payload.data?.items ||
    []) as UserMatchingItemType[];

  const handleViewProfile = (userId: string) => {
    onOpenChange(false);
    router.push(`/${locale}/matching/${userId}`);
  };

  const handleAccept = (userId: string) => {
    acceptMutation.mutate({ senderId: userId });
  };

  const handleReject = (userId: string) => {
    rejectMutation.mutate({ senderId: userId });
  };

  const handleRemoveFriend = (userId: string) => {
    removeMutation.mutate(userId);
  };

  const handleCancelRequest = (userId: string) => {
    cancelMutation.mutate(userId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isValidAvatarUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const renderUserItem = (
    user: UserMatchingItemType,
    type: "friend" | "received" | "sent"
  ) => (
    <div
      key={user.id}
      className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-background">
          <AvatarImage
            src={isValidAvatarUrl(user.avatarUrl) ? user.avatarUrl! : undefined}
            alt={user.name}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <AvatarFallback className="text-sm font-semibold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <Badge variant="secondary" className="w-fit text-xs">
            {user.meritLevel}
          </Badge>
        </div>
      </div>

      <div className="flex gap-2">
        {type === "received" && (
          <>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleAccept(user.id)}
              disabled={acceptMutation.isPending}
            >
              <IconUserCheck className="mr-1 h-4 w-4" />
              {t("accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(user.id)}
              disabled={rejectMutation.isPending}
            >
              <IconX className="mr-1 h-4 w-4" />
              {t("reject")}
            </Button>
          </>
        )}
        {type === "sent" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCancelRequest(user.id)}
            disabled={cancelMutation.isPending}
          >
            {t("cancel")}
          </Button>
        )}
        {type === "friend" && (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewProfile(user.id)}
            >
              <IconUserSearch className=" h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRemoveFriend(user.id)}
              disabled={removeMutation.isPending}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("myFriends")}, {t("receivedRequests")}, {t("sentRequests")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="relative">
              {t("myFriends")}
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="received" className="relative">
              {t("receivedRequests")}
              {receivedRequests.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 min-w-5 px-1.5"
                >
                  {receivedRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="relative">
              {t("sentRequests")}
              {sentRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5">
                  {sentRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {friends.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <IconUsers className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{t("noFriends")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => renderUserItem(friend, "friend"))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="received" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {receivedRequests.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <IconUserCheck className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {t("noReceivedRequests")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {receivedRequests.map((request) =>
                    renderUserItem(request, "received")
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sent" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {sentRequests.length === 0 ? (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <IconUserCheck className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">{t("noSentRequests")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sentRequests.map((request) =>
                    renderUserItem(request, "sent")
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
