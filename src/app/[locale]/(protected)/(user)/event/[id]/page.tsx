"use client";

import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconLoader2,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import {
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
import { useGetEventById, useRegisterEventMutation } from "@/hooks";
import { handleErrorApi, showSuccessToast } from "@/lib/utils";

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

  const { data, isLoading, error } = useGetEventById(eventId, { lang: locale });
  const registerMutation = useRegisterEventMutation();

  const event = data?.payload?.data;

  const handleRegister = async () => {
    if (!event) return;

    // Show password input if event is private
    if (!event.isPublic && !showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        eventId: event.id,
        password: event.isPublic ? null : password,
      });
      showSuccessToast(t("success"), tSuccess);
      // Optionally refresh event data
    } catch (error: any) {
      handleErrorApi({ error, tError });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
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
          <div className="relative w-full h-96 rounded-lg overflow-hidden">
            <Image
              src={event.bannerUrl || "/placeholder-event.jpg"}
              alt={event.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              {event.fee === 0 ? (
                <Badge className="bg-green-500 text-white">
                  {t("fee")}: Free
                </Badge>
              ) : (
                <Badge className="bg-blue-500 text-white">
                  {t("fee")}: ${event.fee}
                </Badge>
              )}
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{event.title}</h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                  <Image
                    src={event.host.avatarUrl || "/default-avatar.png"}
                    alt={event.host.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("host")}</p>
                  <p className="font-medium">{event.host.name}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">{t("aboutEvent")}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-2">{t("categories")}</h3>
              <div className="flex flex-wrap gap-2">
                {event.categories.map((category, index) => (
                  <Badge key={index} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("eventDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <IconCalendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{t("startTime")}</p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.startAt), "PPPp")}
                    </p>
                  </div>
                </div>

                {((event as any).endAt ?? null) && (
                  <div className="flex items-start gap-3">
                    <IconCalendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{t("endTime")}</p>
                      <p className="text-muted-foreground">
                        {format(new Date((event as any).endAt), "PPPp")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <IconClock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{t("duration")}</p>
                    <p className="text-muted-foreground">
                      {event.expectedDurationInMinutes} {t("minutes")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconMapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{t("language")}</p>
                    <p className="text-muted-foreground">
                      {event.language.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconUsers className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{t("capacity")}</p>
                    <p className="text-muted-foreground">
                      {event.numberOfParticipants} / {event.capacity}
                    </p>
                    {!isFull && (
                      <p className="text-xs text-green-600 mt-1">
                        {spotsLeft} {t("available")}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-1">{t("registerBy")}</p>
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
                  <p className="font-medium mb-1">{t("planRequired")}</p>
                  <Badge variant="outline">{event.planType}</Badge>
                </div>
              </div>

              <Separator />

              {/* Registration */}
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

              <Button
                className="w-full gap-2"
                onClick={handleRegister}
                disabled={
                  isFull ||
                  isRegistered ||
                  registerMutation.isPending ||
                  (!event.isPublic && showPasswordInput && !password)
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
                  "Event Full"
                ) : (
                  t("register")
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
