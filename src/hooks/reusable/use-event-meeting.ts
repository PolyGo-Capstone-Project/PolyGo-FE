"use client";

import { useAuthMe } from "@/hooks/query/use-auth";
import { useGetEventById } from "@/hooks/query/use-event";
import { useLocale } from "next-intl";
import { useMemo } from "react";

export function useEventMeeting(eventId: string) {
  const locale = useLocale();
  const { data: eventData, isLoading: isLoadingEvent } = useGetEventById(
    eventId,
    { lang: locale }
  );
  const { data: userData, isLoading: isLoadingUser } = useAuthMe();

  const event = eventData?.payload?.data;
  const currentUser = userData?.payload?.data;

  // Check if user is host
  const isHost = useMemo(() => {
    if (!event || !currentUser) return false;
    return currentUser.id === event.host.id;
  }, [event, currentUser]);

  // Check if user can join
  const canJoin = useMemo(() => {
    if (!event) return false;
    return event.isParticipant || isHost;
  }, [event, isHost]);

  // Check if show join button for host (1 hour before startAt)
  const canHostJoin = useMemo(() => {
    if (!event || !isHost) return false;

    const now = new Date();
    const startAt = new Date(event.startAt);
    const oneHourBefore = new Date(startAt.getTime() - 60 * 60 * 1000);

    return now >= oneHourBefore;
  }, [event, isHost]);

  // Check if show join button for attendee (event is Live)
  const canAttendeeJoin = useMemo(() => {
    if (!event || isHost) return false;
    return event.status === "Live" && event.isParticipant;
  }, [event, isHost]);

  // Show join button
  const showJoinButton = useMemo(() => {
    if (isHost) return canHostJoin;
    return canAttendeeJoin;
  }, [isHost, canHostJoin, canAttendeeJoin]);

  // Time until can join (for host)
  const timeUntilCanJoin = useMemo(() => {
    if (!event || !isHost) return null;

    const now = new Date();
    const startAt = new Date(event.startAt);
    const oneHourBefore = new Date(startAt.getTime() - 60 * 60 * 1000);

    if (now >= oneHourBefore) return null;

    const diff = oneHourBefore.getTime() - now.getTime();
    return diff;
  }, [event, isHost]);

  return {
    event,
    currentUser,
    isHost,
    canJoin,
    canHostJoin,
    canAttendeeJoin,
    showJoinButton,
    timeUntilCanJoin,
    isLoading: isLoadingEvent || isLoadingUser,
  };
}
