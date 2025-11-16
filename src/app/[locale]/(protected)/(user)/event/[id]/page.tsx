"use client";

import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCoin,
  IconEye,
  IconLoader2,
  IconMapPin,
  IconShare3,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  EventAllRatingsSection,
  EventYourRatingSection,
  RegistrationSuccessDialog,
  ShareEventDialog,
} from "@/components/modules/event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  Textarea,
} from "@/components/ui";
import { EventStatus } from "@/constants";
import {
  useCreateEventRatingMutation,
  useGetEventById,
  useGetEventRatings,
  useGetMyEventRating,
  useRegisterEventMutation,
  useTransactionBalanceQuery,
  useUpdateEventRatingMutation,
} from "@/hooks";
import { useAuthMe } from "@/hooks/query/use-auth";
import { formatCurrency, handleErrorApi } from "@/lib/utils";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("event.detail");
  const tError = useTranslations("Error");

  const eventId = params.id as string;

  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [commentValue, setCommentValue] = useState<string>("");
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { data, isLoading, error } = useGetEventById(eventId, { lang: locale });
  const { data: balanceData } = useTransactionBalanceQuery();
  const { data: userData } = useAuthMe();
  const registerMutation = useRegisterEventMutation();

  const updateRatingMutation = useUpdateEventRatingMutation({
    onSuccess: () => setIsEditingRating(false),
    onError: (err) => handleErrorApi({ error: err, tError }),
  });

  const createRatingMutation = useCreateEventRatingMutation({
    onSuccess: () => setIsEditingRating(false),
    onError: (err) => handleErrorApi({ error: err, tError }),
  });

  const event = data?.payload?.data;
  const balance = balanceData?.payload?.data?.balance ?? 0;
  const currentUser = userData?.payload?.data;

  const isValidBannerUrl = (url: string | null | undefined) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const isValidAvatarUrl = (url: string | null | undefined) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const initials = useMemo(() => {
    if (!event) return "";
    return event.host.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [event]);

  // Meeting room logic - must be before early returns
  const isHost = currentUser?.id === event?.host.id;
  const isRegistered = event?.isParticipant || false;
  const eventEnd = event?.status === EventStatus.Completed ? true : false;
  const canJoin = isRegistered || isHost;

  // Host can join 1 hour before startAt
  const canHostJoin = useMemo(() => {
    if (!isHost || !event) return false;
    const now = new Date();
    const startAt = new Date(event.startAt);
    const oneHourBefore = new Date(startAt.getTime() - 60 * 60 * 1000);
    return now >= oneHourBefore;
  }, [isHost, event]);

  // Attendee can join when event is Live
  const canAttendeeJoin = event
    ? isRegistered && event.status === EventStatus.Live
    : false;

  // Show join button (don't show if event has ended)
  const showJoinButton =
    ((isHost && canHostJoin) || canAttendeeJoin) && !eventEnd;

  const hasBanner = event ? isValidBannerUrl(event.bannerUrl) : false;

  // Generate event share URL
  const eventUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleRegisterClick = () => {
    if (!event) return;

    // Show password input if event is private and password not entered yet
    if (!event.isPublic && !showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    // If paid event, show confirmation dialog
    if (event.fee > 0) {
      setShowConfirmDialog(true);
      return;
    }

    // Free event - register directly
    handleRegister();
  };

  const handleRegister = async () => {
    if (!event) return;

    try {
      await registerMutation.mutateAsync({
        eventId: event.id,
        password: event.isPublic ? null : password,
      });

      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
    } catch (error: any) {
      handleErrorApi({ error, tError });
    }
  };

  const { data: myRatingResp, isLoading: isLoadingMyRating } =
    useGetMyEventRating(eventId, {
      enabled: Boolean(eventEnd && isRegistered && !isHost),
    });

  const myRating = myRatingResp?.payload?.data;

  useEffect(() => {
    if (myRating?.hasRating) {
      setRatingValue(Number(myRating.rating ?? 0));
      setCommentValue(myRating.comment ?? "");
    } else {
      setRatingValue(0);
      setCommentValue("");
    }
  }, [myRating?.hasRating, myRating?.rating, myRating?.comment]);

  const { data: eventRatingsResp, isLoading: isLoadingEventRatings } =
    useGetEventRatings(
      eventId,
      { lang: locale, pageNumber: 1, pageSize: 10 },
      { enabled: Boolean(eventEnd) }
    );

  const StarPicker = ({
    value,
    onChange,
    disabled,
  }: {
    value: number;
    onChange: (v: number) => void;
    disabled?: boolean;
  }) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, idx) => {
        const v = idx + 1;
        const active = v <= value;
        return (
          <button
            key={v}
            type="button"
            className={`text-2xl leading-none ${
              active ? "text-yellow-500" : "text-muted-foreground/40"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            onClick={() => !disabled && onChange(v)}
            disabled={disabled}
          >
            ★
          </button>
        );
      })}
    </div>
  );

  const handleSubmitRating = async () => {
    try {
      const basePayload = {
        eventId,
        rating: ratingValue,
        comment: commentValue?.trim() || null,
      };

      if (myRating?.hasRating) {
        await updateRatingMutation.mutateAsync(basePayload);
      } else {
        await createRatingMutation.mutateAsync(basePayload);
      }
      setIsRatingDialogOpen(false);
    } catch {}
  };

  const allRatingItems = eventRatingsResp?.payload?.data?.items ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 border rounded-lg">
          <p className="text-destructive">{t("errors.loadFailed")}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            {t("back")}
          </Button>
        </div>
      </div>
    );
  }

  const spotsLeft = event.capacity - event.numberOfParticipants;
  const isFull = spotsLeft <= 0;
  const hasInsufficientFunds = event.fee > 0 && balance < event.fee;

  // Handle join meeting
  const handleJoinMeeting = () => {
    router.push(`/${locale}/room/${eventId}/waiting`);
  };

  // NEW: render sao dạng Unicode, chỉ hiển thị 1..5
  const renderStars = (value?: number | null) => {
    const val = Math.max(0, Math.min(5, Number(value ?? 0)));
    return (
      <div className="flex items-center gap-1 text-base leading-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={i < val ? "text-yellow-500" : "text-muted-foreground/40"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => router.push(`/${locale}/event`)}
        >
          <IconArrowLeft className="h-4 w-4" />
          {t("back")}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner */}
            <div className="relative w-full h-96 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background">
              {hasBanner ? (
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <IconCalendar className="h-20 w-20 mx-auto text-muted-foreground/30" />
                    <p className="text-lg font-medium text-muted-foreground/50">
                      {event.title}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {event.fee === 0 ? (
                  <Badge className="bg-green-500/90 hover:bg-green-500 text-white border-0 shadow-lg backdrop-blur-sm text-sm">
                    {t("free")}
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/90 hover:bg-blue-500 text-white border-0 shadow-lg backdrop-blur-sm text-sm">
                    {formatCurrency(event.fee)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">{event.title}</h1>

              {/* Host Info Card */}
              <Card className="border-primary/20 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm">
                        <AvatarImage
                          src={
                            isValidAvatarUrl(event.host.avatarUrl)
                              ? event.host.avatarUrl!
                              : undefined
                          }
                          alt={event.host.name}
                        />
                        <AvatarFallback className="text-base font-semibold bg-primary/10">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {t("host")}
                        </p>
                        <p className="text-lg font-semibold">
                          {event.host.name}
                        </p>
                      </div>
                    </div>
                    {!isHost && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 flex-shrink-0"
                        onClick={() =>
                          router.push(`/${locale}/matching/${event.host.id}`)
                        }
                      >
                        <IconEye className="h-4 w-4" />
                        {t("hostInfo")}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">{t("aboutEvent")}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-3">{t("categories")}</h3>
              <div className="flex flex-wrap gap-2">
                {event.categories.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("eventDetails")}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <IconShare3 className="h-4 w-4" />
                    {/* {t("share.button")} */}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <IconCalendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("startTime")}</p>
                      <p className="text-muted-foreground">
                        {format(new Date(event.startAt), "PPPp")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconClock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("duration")}</p>
                      <p className="text-muted-foreground">
                        {event.expectedDurationInMinutes} {t("minutes")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconMapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("language")}</p>
                      <p className="text-muted-foreground">
                        {event.language.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <IconUsers className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("capacity")}</p>
                      <p className="text-muted-foreground">
                        {event.numberOfParticipants} / {event.capacity}
                      </p>
                      {!isFull && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {spotsLeft} {t("available")}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="font-semibold mb-1">{t("registerBy")}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.registerDeadline), "PPP")}
                    </p>
                    {event.allowLateRegister && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("lateRegistrationAllowed")}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-semibold mb-1">{t("planRequired")}</p>
                    <Badge variant="outline">{event.planType}</Badge>
                  </div>
                </div>

                <Separator />

                {/* Password Input for Private Events */}
                {!event.isPublic && showPasswordInput && !isRegistered && (
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("password.label")}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t("password.placeholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("password.required")}
                    </p>
                  </div>
                )}

                {/* Insufficient Funds Warning */}
                {hasInsufficientFunds && !isRegistered && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                    <IconAlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">
                        {t("insufficientFunds")}
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {t("yourBalance")}: {formatCurrency(balance)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Register Button - Hide if already registered */}
                {!isRegistered && (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleRegisterClick}
                    disabled={
                      isFull ||
                      registerMutation.isPending ||
                      (!event.isPublic && showPasswordInput && !password) ||
                      hasInsufficientFunds
                    }
                  >
                    {registerMutation.isPending ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        {t("registering")}
                      </>
                    ) : isFull ? (
                      t("eventFull")
                    ) : (
                      t("register")
                    )}
                  </Button>
                )}

                {/* Already Registered Badge. If event has ended, show event ended message instead */}
                {isRegistered && !eventEnd && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary/10 text-primary rounded-lg border border-primary/20">
                    <IconCheck className="h-5 w-5" />
                    <span className="font-semibold">{t("registered")}</span>
                  </div>
                )}

                {isRegistered && eventEnd && (
                  <div className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-muted rounded-lg border text-muted-foreground">
                    <IconCheck className="h-5 w-5" />
                    <span className="font-semibold">{t("eventEnded")}</span>
                  </div>
                )}

                {/* Join Meeting Button */}
                {canJoin && showJoinButton && (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    variant="default"
                    onClick={handleJoinMeeting}
                  >
                    <IconVideo className="h-5 w-5" />
                    {isHost ? t("joinHost") : t("join")}
                  </Button>
                )}

                {/* Waiting message for attendees */}
                {canJoin && !showJoinButton && !isHost && !eventEnd && (
                  <div className="w-full py-3 px-4 bg-muted rounded-lg border text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("waitingForHost")}
                    </p>
                  </div>
                )}

                {/* Time until host can join */}
                {isHost && !canHostJoin && (
                  <div className="w-full py-3 px-4 bg-muted rounded-lg border text-center">
                    <p className="text-sm text-muted-foreground">
                      {t("hostCanJoinMessage")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Your Rating */}
        {eventEnd && isRegistered && !isHost && (
          <EventYourRatingSection
            isLoadingMyRating={isLoadingMyRating}
            myRating={myRating}
            currentUser={currentUser}
            onOpenRatingDialog={() => setIsRatingDialogOpen(true)}
            renderStars={renderStars}
            isValidAvatarUrl={isValidAvatarUrl}
          />
        )}

        {/* All ratings list */}
        {eventEnd && (
          <EventAllRatingsSection
            isLoadingEventRatings={isLoadingEventRatings}
            allRatingItems={allRatingItems}
            renderStars={renderStars}
            isValidAvatarUrl={isValidAvatarUrl}
          />
        )}
      </div>

      {/* Confirmation Dialog for Paid Events */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconCoin className="h-5 w-5 text-primary" />
              {t("confirmRegistration")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="space-y-2">
                <p className="text-base font-medium text-foreground">
                  {event.title}
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("eventFee")}
                    </span>
                    <span className="text-lg font-semibold text-foreground">
                      {formatCurrency(event.fee)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("currentBalance")}
                    </span>
                    <span className="text-base font-medium text-foreground">
                      {formatCurrency(balance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t("afterRegistration")}
                    </span>
                    <span
                      className={`text-base font-semibold ${
                        balance - event.fee >= 0
                          ? "text-green-600"
                          : "text-destructive"
                      }`}
                    >
                      {formatCurrency(balance - event.fee)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm">{t("confirmRegistrationMessage")}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("processing")}
                </>
              ) : (
                t("confirmAndPay")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Dialog  */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {myRating?.hasRating
                ? t("ratings.editDialogTitle")
                : t("ratings.createDialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("ratings.dialogDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Stars */}
            <div className="space-y-1">
              <Label>{t("ratings.yourStars")}</Label>
              <StarPicker
                value={ratingValue}
                onChange={setRatingValue}
                disabled={
                  updateRatingMutation.isPending ||
                  createRatingMutation.isPending
                }
              />
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <Label htmlFor="rating-comment">
                {t("ratings.commentLabel")}
              </Label>
              <Textarea
                id="rating-comment"
                placeholder={t("ratings.commentPlaceholder")}
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                disabled={
                  updateRatingMutation.isPending ||
                  createRatingMutation.isPending
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRatingDialogOpen(false)}
              disabled={
                updateRatingMutation.isPending || createRatingMutation.isPending
              }
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={
                ratingValue < 1 ||
                updateRatingMutation.isPending ||
                createRatingMutation.isPending
              }
            >
              {updateRatingMutation.isPending || createRatingMutation.isPending
                ? t("processing")
                : t("ratings.saveButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <RegistrationSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        eventTitle={event.title}
        eventId={event.id}
      />

      {/* Share Dialog */}
      {event && (
        <ShareEventDialog
          open={showShareDialog}
          onOpenChange={setShowShareDialog}
          eventTitle={event.title}
          eventUrl={eventUrl}
        />
      )}
    </>
  );
}
