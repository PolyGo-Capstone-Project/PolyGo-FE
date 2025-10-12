import http from "@/lib/http";
import {
  MessageResType,
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

  //FOR ADMIN - NOT IMPLEMENT YET
};
export default userApiRequest;
