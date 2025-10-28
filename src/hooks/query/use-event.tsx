"use client";

import eventApiRequest from "@/lib/apis/event";
import {
  CancelEventBodyType,
  CreateEventBodyType,
  GetEventByIdQueryType,
  GetEventsQueryType,
  RegisterEventBodyType,
  SearchEventsQueryType,
  UpdateEventBodyType,
  UpdateEventStatusBodyType,
} from "@/models";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

type GetRecommendedEventsResponse = Awaited<
  ReturnType<typeof eventApiRequest.getRecommendedEvents>
>;
type GetUpcomingEventsResponse = Awaited<
  ReturnType<typeof eventApiRequest.getUpcomingEvents>
>;
type GetPastEventsResponse = Awaited<
  ReturnType<typeof eventApiRequest.getPastEvents>
>;
type GetParticipatedEventsResponse = Awaited<
  ReturnType<typeof eventApiRequest.getParticipatedEvents>
>;
type GetHostedEventsResponse = Awaited<
  ReturnType<typeof eventApiRequest.getHostedEvents>
>;
type GetEventByIdResponse = Awaited<
  ReturnType<typeof eventApiRequest.getEventById>
>;
type GetEventDetailResponse = Awaited<
  ReturnType<typeof eventApiRequest.getDetailEvent>
>;
type CreateEventResponse = Awaited<
  ReturnType<typeof eventApiRequest.createEvent>
>;
type CancelEventResponse = Awaited<
  ReturnType<typeof eventApiRequest.cancelEvent>
>;
type RegisterEventResponse = Awaited<
  ReturnType<typeof eventApiRequest.registerEvent>
>;
type UpdateEventResponse = Awaited<
  ReturnType<typeof eventApiRequest.updateEvent>
>;

type UpdateEventStatusResponse = Awaited<
  ReturnType<typeof eventApiRequest.updateEventStatus>
>;

// ============= QUERIES =============
export const useGetRecommendedEvents = (
  query: GetEventsQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetRecommendedEventsResponse>({
    queryKey: ["events", "recommended", query],
    queryFn: () => eventApiRequest.getRecommendedEvents(query),
    enabled: options?.enabled,
    staleTime: 0,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
};

export const useGetUpcomingEvents = (
  query: SearchEventsQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetUpcomingEventsResponse>({
    queryKey: ["events", "upcoming", query],
    queryFn: () => eventApiRequest.getUpcomingEvents(query),
    enabled: options?.enabled,
    staleTime: 0,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  });
};

export const useGetPastEvents = (
  query: SearchEventsQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetPastEventsResponse>({
    queryKey: ["events", "past", query],
    queryFn: () => eventApiRequest.getPastEvents(query),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
};

export const useGetParticipatedEvents = (
  query: SearchEventsQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetParticipatedEventsResponse>({
    queryKey: ["events", "participated", query],
    queryFn: () => eventApiRequest.getParticipatedEvents(query),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
};

export const useGetHostedEvents = (
  query: SearchEventsQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetHostedEventsResponse>({
    queryKey: ["events", "hosted", query],
    queryFn: () => eventApiRequest.getHostedEvents(query),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
};

export const useGetEventById = (
  id: string,
  query?: GetEventByIdQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetEventByIdResponse>({
    queryKey: ["events", "one", id ?? null, query ?? null],
    queryFn: () =>
      eventApiRequest.getEventById(id, query as GetEventByIdQueryType),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
};

export const useGetEventDetail = (
  id: string,
  query?: GetEventByIdQueryType,
  options?: { enabled?: boolean }
) => {
  return useQuery<GetEventDetailResponse>({
    queryKey: ["events", "detail", id ?? null, query ?? null],
    queryFn: () =>
      eventApiRequest.getDetailEvent(id, query as GetEventByIdQueryType),
    enabled: options?.enabled,
    placeholderData: keepPreviousData,
  });
};
// ============= MUTATIONS =============
export const useCreateEventMutation = (options?: {
  onSuccess?: (data: CreateEventResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: CreateEventBodyType) =>
      eventApiRequest.createEvent(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useCancelEventMutation = (options?: {
  onSuccess?: (data: CancelEventResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: CancelEventBodyType) =>
      eventApiRequest.cancelEvent(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useRegisterEventMutation = (options?: {
  onSuccess?: (data: RegisterEventResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: (body: RegisterEventBodyType) =>
      eventApiRequest.registerEvent(body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateEventMutation = (options?: {
  onSuccess?: (data: UpdateEventResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEventBodyType }) =>
      eventApiRequest.updateEvent(id, body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useUpdateEventStatusMutation = (options?: {
  onSuccess?: (data: UpdateEventStatusResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateEventStatusBodyType;
    }) => eventApiRequest.updateEventStatus(id, body),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
