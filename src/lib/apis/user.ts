import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  GetUserByIdBodyType,
  GetUserByIdResType,
  GetUsersQueryType,
  GetUsersResType,
  MessageResType,
  SetRestrictionsBodyType,
  SetupProfileBodyType,
  UpdateMeBodyType,
  UpdateProfileBodyType,
} from "@/models";

const prefix = "/users";
const userApiRequest = {
  //For User
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
  getUsers: createGetAll<GetUsersResType, GetUsersQueryType>(prefix),
  getOne: createGetOne<GetUserByIdResType, GetUserByIdBodyType>(prefix),
  setRestrictions: (body: SetRestrictionsBodyType, id: string) =>
    http.put<MessageResType>(`${prefix}/set-restriction/${id}`, body),
};
export default userApiRequest;
