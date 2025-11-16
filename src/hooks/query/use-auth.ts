import { useMutation, useQuery } from "@tanstack/react-query";

import authApiRequest from "@/lib/apis/auth";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login,
  });
};

export const useSendOTPMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.sendOTP,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.register,
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.forgotPassword,
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.changePassword,
  });
};

export const useAuthMe = () => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: authApiRequest.me,
  });
};
