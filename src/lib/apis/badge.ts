import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateBadgeBodyType,
  GetBadgeByIdQueryType,
  GetBadgeByIdResType,
  GetBadgesQueryType,
  GetBadgesResType,
  MessageResType,
  UpdateBadgeBodyType,
  UserBadgeResType,
} from "@/models";

const prefix = "/badges";
export type GetBadgesParams = GetBadgesQueryType;
export type GetBadgeParams = GetBadgeByIdQueryType;

const badgeApiRequest = {
  //Admin
  getAll: createGetAll<GetBadgesResType, GetBadgesParams>(prefix),
  getOne: createGetOne<GetBadgeByIdResType, GetBadgeParams>(prefix),
  create: (body: CreateBadgeBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  update: (id: string, body: UpdateBadgeBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<MessageResType>(`${prefix}/${id}`),
  //User
  getUserBadges: createGetAll<UserBadgeResType, GetBadgesParams>(
    `${prefix}/me`
  ),
};

export default badgeApiRequest;
