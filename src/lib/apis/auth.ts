import http from "@/lib/http";
import { buildQueryString } from "@/lib/utils";
import {
  ForgotPasswordBodyType,
  GetUserProfileResType,
  LoginBodyType,
  LoginResType,
  MessageResType,
  RegisterBodyType,
  SendOTPBodyType,
} from "@/models";

const authApiRequest = {
  //login
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),
  //send otp
  sendOTP: ({ mail, verificationType }: SendOTPBodyType) => {
    const query = buildQueryString({ verificationType, mail });
    return http.post(`/auth/otp${query}`, null);
  },
  //register
  register: (body: RegisterBodyType) =>
    http.post<MessageResType>("/auth/register", body),
  //forgot password
  forgotPassword: (body: ForgotPasswordBodyType) =>
    http.post<MessageResType>("/auth/reset-password", body),
  //me
  me: () => http.get<GetUserProfileResType>("/auth/me"),
};

export default authApiRequest;
