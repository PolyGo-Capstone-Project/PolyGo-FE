import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  GetUserByIdBodyType,
  GetUserByIdResType,
  GetUserByMatchingResType,
  GetUsersMatchingQueryType,
  GetUsersQueryType,
  GetUsersResType,
  MessageResType,
  SearchUserQueryType,
  SearchUserResType,
  SetRestrictionsBodyType,
  SetupProfileBodyType,
  UpdateMeBodyType,
  UpdateProfileBodyType,
} from "@/models";

const prefix = "/users";
const userApiRequest = {
  //For current user
  //Update information of current user
  updateMe: (body: UpdateMeBodyType) =>
    http.put<MessageResType>(`${prefix}/me`, body),
  //Setup profile when first time register
  setupProfile: (body: SetupProfileBodyType) =>
    http.put<MessageResType>(`${prefix}/profile-setup`, body),
  // Update profile
  updateProfile: (body: UpdateProfileBodyType) =>
    http.put<MessageResType>(`${prefix}/profile/me`, body),

  //FOR ADMIN
  getUsers: createGetAll<GetUsersResType, GetUsersQueryType>(`admin${prefix}`),
  getOne: createGetOne<GetUserByIdResType, GetUserByIdBodyType>(
    `admin${prefix}`
  ),
  setRestrictions: (body: SetRestrictionsBodyType, id: string) =>
    http.put<MessageResType>(`${prefix}/set-restriction/${id}`, body),

  //FOR USER not admin
  // matching
  getUsersMatching: createGetAll<
    GetUserByMatchingResType,
    GetUsersMatchingQueryType
  >(`${prefix}/matching`),
  getUserProfile: createGetOne<GetUserByIdResType, GetUserByIdBodyType>(
    `${prefix}`
  ),
  searchUsers: createGetAll<SearchUserResType, SearchUserQueryType>(
    `${prefix}`
  ),
};
export default userApiRequest;
