import http from "@/lib/http";
import {
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
    const searchParams = new URLSearchParams({
      verificationType,
      mail,
    });

    return http.post(`/auth/otp?${searchParams.toString()}`, null);
  },
  //register
  register: (body: RegisterBodyType) =>
    http.post<MessageResType>("/auth/register", body),
};

export default authApiRequest;
