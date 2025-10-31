import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CancelEventBodyType,
  CreateEventBodyType,
  GetEventByIdQueryType,
  GetEventByIdResType,
  GetEventDetailResType,
  GetEventsQueryType,
  HostedEventResType,
  MessageResType,
  ParticipatedEventResType,
  PastEventResType,
  RecommendedEventResType,
  RegisterEventBodyType,
  SearchEventsQueryType,
  UpcomingEventResType,
  UpdateEventBodyType,
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
  //Get event detail for host and admin
  getDetailEvent: createGetOne<GetEventDetailResType, GetEventByIdQueryType>(
    `${prefix}/details`
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
  //Update event - host
  updateEvent: (id: string, body: UpdateEventBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  //Update status - admin apporve/cancel
  updateEventStatus: (body: UpdateEventStatusBodyType) =>
    http.put<MessageResType>(`${prefix}/admin/status`, body),
  //Update status for host - start/end event
  updateEventStatusByHost: (body: UpdateEventStatusBodyType) =>
    http.put<MessageResType>(`${prefix}/admin/status`, body),
};

export default eventApiRequest;
