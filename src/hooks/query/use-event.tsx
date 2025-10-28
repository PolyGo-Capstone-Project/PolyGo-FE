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
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const defaultOnSuccess = () => {
    // Invalidate common event lists so UI refreshes after create
    queryClient.invalidateQueries({ queryKey: ["events", "recommended"] });
    queryClient.invalidateQueries({ queryKey: ["events", "upcoming"] });
    queryClient.invalidateQueries({ queryKey: ["events", "hosted"] });
    queryClient.invalidateQueries({ queryKey: ["events", "participated"] });
    queryClient.invalidateQueries({ queryKey: ["events", "past"] });
  };

  return useMutation({
    mutationFn: (body: CreateEventBodyType) =>
      eventApiRequest.createEvent(body),
    onSuccess: (data, variables, context) => {
      defaultOnSuccess();
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useCancelEventMutation = (options?: {
  onSuccess?: (data: CancelEventResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CancelEventBodyType) =>
      eventApiRequest.cancelEvent(body),
    onSuccess: (data, variables: CancelEventBodyType, context) => {
      // refresh lists
      queryClient.invalidateQueries({ queryKey: ["events"] });
      // try to invalidate specific event caches if id available in body
      const id = (variables as any)?.id || (variables as any)?.eventId;
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["events", "one", id] });
        queryClient.invalidateQueries({ queryKey: ["events", "detail", id] });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useRegisterEventMutation = (options?: {
  onSuccess?: (data: RegisterEventResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterEventBodyType) =>
      eventApiRequest.registerEvent(body),
    onSuccess: (data, variables: RegisterEventBodyType, context) => {
      // user registration affects participated lists and possibly event detail
      queryClient.invalidateQueries({ queryKey: ["events", "participated"] });
      queryClient.invalidateQueries({ queryKey: ["events", "one"] });
      // try to invalidate specific event if eventId exists in body
      const id = (variables as any)?.eventId || (variables as any)?.id;
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["events", "one", id] });
        queryClient.invalidateQueries({ queryKey: ["events", "detail", id] });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useUpdateEventMutation = (options?: {
  onSuccess?: (data: UpdateEventResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateEventBodyType }) =>
      eventApiRequest.updateEvent(id, body),
    onSuccess: (data, variables, context) => {
      // refresh lists and the specific event cache
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "one", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["events", "detail", variables.id],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

export const useUpdateEventStatusMutation = (options?: {
  onSuccess?: (data: UpdateEventStatusResponse) => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body }: { body: UpdateEventStatusBodyType }) =>
      eventApiRequest.updateEventStatus(body),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "one"],
      });
      queryClient.invalidateQueries({
        queryKey: ["events", "detail"],
      });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
