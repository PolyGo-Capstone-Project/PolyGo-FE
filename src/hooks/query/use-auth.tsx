import { useMutation } from "@tanstack/react-query";

import authApiRequest from "@/lib/apis/auth";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequest.login,
  });
};
