import http from "@/lib/http";
import { LoginBodyType, LoginResType } from "@/models";

const authApiRequest = {
  //login
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  login: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),
  //send otp
  sendOTP: () => http.post("/api/auth/send-otp", {}, { baseUrl: "" }),
};

export default authApiRequest;
