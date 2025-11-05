"use client";

import {
  IconAlertTriangle,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCoin,
  IconLoader2,
  IconMapPin,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { RegistrationSuccessDialog } from "@/components/modules/event/registration-success-dialog";
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

  // NEW: state form rating
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [commentValue, setCommentValue] = useState<string>("");

  const { data, isLoading, error } = useGetEventById(eventId, { lang: locale });
  const { data: balanceData } = useTransactionBalanceQuery();
  const { data: userData } = useAuthMe();
  const registerMutation = useRegisterEventMutation();

  const updateRatingMutation = useUpdateEventRatingMutation({
    onSuccess: () => setIsEditingRating(false),
    onError: (err) => handleErrorApi({ error: err, tError }),
  });

  // Khởi tạo mutation mới
  const createRatingMutation = useCreateEventRatingMutation({
    onSuccess: () => setIsEditingRating(false),
    onError: (err) => handleErrorApi({ error: err, tError }),
  });

  const event = data?.payload?.data;
  const balance = balanceData?.payload?.data?.balance ?? 0;
  const currentUser = userData?.payload?.data;

  const isValidBannerUrl = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const isValidAvatarUrl = (url: string | null) => {
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

  // NEW: fetch đánh giá của chính người dùng cho sự kiện (chỉ khi Completed & đã từng tham dự/host)
  const { data: myRatingResp, isLoading: isLoadingMyRating } =
    useGetMyEventRating(eventId, {
      enabled: Boolean(eventEnd && isRegistered && !isHost),
    });

  // Chuẩn hoá dữ liệu trả về (theo http wrapper hiện tại .payload?.data)
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

  // NEW: danh sách đánh giá của tất cả người dùng cho sự kiện
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

  // CẬP NHẬT hàm submit: nếu đã có rating -> PUT, chưa có -> POST
  const handleSubmitRating = async () => {
    try {
      if (myRating?.hasRating) {
        await updateRatingMutation.mutateAsync({
          eventId: eventId,
          rating: ratingValue,
          comment: commentValue?.trim() || null,
        });
      } else {
        await createRatingMutation.mutateAsync({
          eventId: eventId,
          rating: ratingValue,
          comment: commentValue?.trim() || null,
          // giftId và giftQuantity là optional – nếu chưa dùng có thể bỏ qua:
          // giftId: null,
          // giftQuantity: null,
        });
      }
    } catch {}
  };

  const ratingItems =
    eventRatingsResp?.payload?.data
      ?.items /* nếu wrapper là .data thì đổi lại */ ?? [];

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

            {/* Title and Host */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">{event.title}</h1>

              <div className="flex items-center gap-4 py-3">
                <Avatar className="h-14 w-14 border-2 border-primary/10 shadow-sm">
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
                <div>
                  <p className="text-sm text-muted-foreground">{t("host")}</p>
                  <p className="text-lg font-semibold">{event.host.name}</p>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  {t("aboutEvent")}
                </h2>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("eventDetails")}</CardTitle>
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
                {canJoin && !showJoinButton && !isHost && (
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

                {/* Your Rating */}
                {eventEnd && isRegistered && !isHost && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>{t("ratings.yourRatingTitle")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoadingMyRating ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : isEditingRating ? (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label>{t("ratings.yourStars")}</Label>
                            <StarPicker
                              value={ratingValue}
                              onChange={setRatingValue}
                              disabled={updateRatingMutation.isPending}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="rating-comment">
                              {t("ratings.commentLabel")}
                            </Label>
                            <Textarea
                              id="rating-comment"
                              placeholder={t("ratings.commentPlaceholder")}
                              value={commentValue}
                              onChange={(e) => setCommentValue(e.target.value)}
                              disabled={updateRatingMutation.isPending}
                              rows={4}
                            />
                            <p className="text-xs text-muted-foreground"></p>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              onClick={handleSubmitRating}
                              disabled={
                                updateRatingMutation.isPending ||
                                ratingValue < 1
                              }
                            >
                              {updateRatingMutation.isPending ? (
                                <>
                                  <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
                                  {t("processing")}
                                </>
                              ) : (
                                t("ratings.saveButton")
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setRatingValue(Number(myRating?.rating ?? 0));
                                setCommentValue(myRating?.comment ?? "");
                                setIsEditingRating(false);
                              }}
                              disabled={updateRatingMutation.isPending}
                            >
                              {t("cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : myRating?.hasRating ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {renderStars(myRating.rating)}
                            <span className="text-xs text-muted-foreground">
                              {myRating.createdAt
                                ? format(new Date(myRating.createdAt), "PPP")
                                : ""}
                            </span>
                          </div>
                          {myRating.comment ? (
                            <p className="text-sm text-foreground">
                              {myRating.comment}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              {t("noComment")}
                            </p>
                          )}
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsEditingRating(true)}
                            >
                              {t("ratings.editRatingButton")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {t("ratings.noRatingYet")}
                          </p>
                          <Button onClick={() => setIsEditingRating(true)}>
                            {t("ratings.rateButton")}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All ratings list */}
        {eventEnd && (
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle>{t("ratings.allRatingsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingEventRatings ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : ratingItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("ratings.noRatingsFound")}
                </p>
              ) : (
                <div className="space-y-4">
                  {ratingItems.map((r: any) => (
                    <div key={r.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        {renderStars(r.rating)}
                        <span className="text-xs text-muted-foreground">
                          {r.createdAt
                            ? format(new Date(r.createdAt), "PPP")
                            : ""}
                        </span>
                      </div>
                      {r.comment ? (
                        <p className="text-sm text-foreground">{r.comment}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          {t("noCommentAll")}
                        </p>
                      )}
                      <Separator />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Success Dialog */}
      <RegistrationSuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        eventTitle={event.title}
        eventId={event.id}
      />
    </>
  );
}
