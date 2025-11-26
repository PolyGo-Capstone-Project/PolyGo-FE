import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  GetNotificationsQueryType,
  GetNotificationsResType,
  MessageResType,
} from "@/models";

const prefix = "/notifications";

export type GetNotificationsParams = GetNotificationsQueryType;

export const notificationApiRequest = {
  // GET /notifications?lang=en&pageNumber=1&pageSize=3
  getAll: createGetAll<GetNotificationsResType, GetNotificationsParams>(prefix),

  // PUT /notifications/{id}  => mark as read
  markAsRead: (id: string) => http.put<MessageResType>(`${prefix}/${id}`, {}),
};

export default notificationApiRequest;
