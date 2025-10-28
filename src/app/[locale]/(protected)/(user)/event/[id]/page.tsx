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
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
} from "@/components/ui";
import {
  useGetEventById,
  useRegisterEventMutation,
  useTransactionBalanceQuery,
} from "@/hooks";
import { formatCurrency, handleErrorApi, showSuccessToast } from "@/lib/utils";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("event.detail");
  const tError = useTranslations("Error");
  const tSuccess = useTranslations("Success");

  const eventId = params.id as string;

  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { data, isLoading, error } = useGetEventById(eventId, { lang: locale });
  const { data: balanceData } = useTransactionBalanceQuery();
  const registerMutation = useRegisterEventMutation();

  const event = data?.payload?.data;
  const balance = balanceData?.payload?.data?.balance ?? 0;

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
      const result = await registerMutation.mutateAsync({
        eventId: event.id,
        password: event.isPublic ? null : password,
      });
      showSuccessToast(t("success"), tSuccess);
      setShowConfirmDialog(false);
      // Optionally refresh event data
    } catch (error: any) {
      handleErrorApi({ error, tError });
    }
  };

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
  const isRegistered = false; // TODO: Check if user is registered
  const hasInsufficientFunds = event.fee > 0 && balance < event.fee;

  return (
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

                {((event as any).endAt ?? null) && (
                  <div className="flex items-start gap-3">
                    <IconCalendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{t("endTime")}</p>
                      <p className="text-muted-foreground">
                        {format(new Date((event as any).endAt), "PPPp")}
                      </p>
                    </div>
                  </div>
                )}

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

              {/* Register Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleRegisterClick}
                disabled={
                  isFull ||
                  isRegistered ||
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
                ) : isRegistered ? (
                  <>
                    <IconCheck className="h-4 w-4" />
                    {t("registered")}
                  </>
                ) : isFull ? (
                  t("eventFull")
                ) : (
                  t("register")
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
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
    </div>
  );
}
