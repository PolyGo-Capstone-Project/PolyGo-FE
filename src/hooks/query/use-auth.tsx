import { useMutation } from "@tanstack/react-query";

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
