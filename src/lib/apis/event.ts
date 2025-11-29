import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CancelEventBodyType,
  CreateEventBodyType,
  CreateEventRatingBodyType,
  EventMyRatingResType,
  EventRatingsQueryType,
  EventRatingsResType,
  EventSummaryResType,
  EventTranscriptionsQueryType,
  EventTranscriptionsResType,
  GetEventByIdQueryType,
  GetEventByIdResType,
  GetEventStatResType,
  GetEventsQueryType,
  HostedEventResType,
  KickParticipantBodyType,
  MessageResType,
  ParticipatedEventResType,
  PastEventResType,
  RecommendedEventResType,
  RegisterEventBodyType,
  SearchEventsQueryType,
  UnregisterEventBodyType,
  UpcomingEventResType,
  UpdateEventBodyType,
  UpdateEventRatingBodyType,
  UpdateEventStatusBodyType,
} from "@/models";

const prefix = "/events";

const eventApiRequest = {
  //List event phù hợp với user
  getRecommendedEvents: createGetAll<
    RecommendedEventResType,
    GetEventsQueryType
  >(`${prefix}/matching`),
  //List event sắp diễn ra - all user
  getUpcomingEvents: createGetAll<UpcomingEventResType, SearchEventsQueryType>(
    `${prefix}/upcoming`
  ),
  //List event trong quá khứ - admin
  getPastEvents: createGetAll<PastEventResType, SearchEventsQueryType>(
    `${prefix}/past`
  ),
  //List event đã tham gia - user
  getParticipatedEvents: createGetAll<
    ParticipatedEventResType,
    SearchEventsQueryType
  >(`${prefix}/joined`),
  //List event đã tạo - host
  getHostedEvents: createGetAll<HostedEventResType, SearchEventsQueryType>(
    `${prefix}/hosted`
  ),
  //Get event by ID
  getEventById: createGetOne<GetEventByIdResType, GetEventByIdQueryType>(
    `${prefix}`
  ),
  //Get event stat for host and admin
  getStatEvent: createGetOne<GetEventStatResType, GetEventByIdQueryType>(
    `${prefix}/stats`
  ),
  //Create event - host
  createEvent: (body: CreateEventBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  //Cancel event - host
  cancelEvent: (body: CancelEventBodyType) =>
    http.post<MessageResType>(`${prefix}/cancel`, body),
  //Register event - user
  registerEvent: (body: RegisterEventBodyType) =>
    http.post<MessageResType>(`${prefix}/register`, body),
  //Unregister event - user
  unregisterEvent: (body: UnregisterEventBodyType) =>
    http.post<MessageResType>(`${prefix}/unregister`, body),
  //Kick participant before live event - host
  kickParticipant: (body: KickParticipantBodyType) =>
    http.post<MessageResType>(`${prefix}/kick`, body),
  //Update event - host
  updateEvent: (id: string, body: UpdateEventBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  //Update status - admin apporve/cancel
  updateEventStatus: (body: UpdateEventStatusBodyType) =>
    http.put<MessageResType>(`${prefix}/admin/status`, body),
  //Update status for host - start/end event
  updateEventStatusByHost: (body: UpdateEventStatusBodyType) =>
    http.put<MessageResType>(`${prefix}/admin/status`, body),

  // NEW method trong eventApiRequest
  getMyEventRating: (id: string) =>
    http.get<EventMyRatingResType>(`${prefix}/ratings/${id}/my`),

  // NEW: list all ratings of an event (GET /events/ratings/:id?lang=&pageNumber=&pageSize=)
  getEventRatings: (id: string, query?: EventRatingsQueryType) =>
    createGetAll<EventRatingsResType, EventRatingsQueryType>(
      `${prefix}/ratings/${id}`
    )(query),

  updateEventRating: (body: UpdateEventRatingBodyType) =>
    http.put<MessageResType>(`${prefix}/rating`, body),

  // NEW: tạo rating (POST /events/rating)
  createEventRating: (body: CreateEventRatingBodyType) =>
    http.post<MessageResType>(`${prefix}/rating`, body),

  // POST payout host for an event
  payout: (eventId: string) =>
    http.post<MessageResType>(`${prefix}/${eventId}/host-payout`, null),

  // ============== AI SUMMARY APIs ==============
  // GET event summary (Host or Attended participants)
  getEventSummary: (eventId: string) =>
    http.get<EventSummaryResType>(`${prefix}/${eventId}/summary`),

  // POST generate event summary (Host only)
  generateEventSummary: (eventId: string) =>
    http.post<EventSummaryResType>(
      `${prefix}/${eventId}/summary/generate`,
      null
    ),

  // GET event transcriptions (Host or Attended participants)
  getEventTranscriptions: (
    eventId: string,
    query?: EventTranscriptionsQueryType
  ) => {
    const params = new URLSearchParams();
    if (query?.pageNumber)
      params.append("pageNumber", query.pageNumber.toString());
    if (query?.pageSize) params.append("pageSize", query.pageSize.toString());
    const queryString = params.toString();
    return http.get<EventTranscriptionsResType>(
      `${prefix}/${eventId}/transcriptions${queryString ? `?${queryString}` : ""}`
    );
  },
};

export default eventApiRequest;
