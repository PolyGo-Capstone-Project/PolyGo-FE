import { useMutation } from "@tanstack/react-query";

import { paymentApiRequest } from "@/lib/apis";
import { CancelPaymentBodyType, DepositPaymentBodyType } from "@/models";

// ===== DEPOSIT URL =====
type DepositUrlMutationResponse = Awaited<
  ReturnType<typeof paymentApiRequest.depositUrl>
>;

export const useDepositUrl = () => {
  return useMutation<DepositUrlMutationResponse, Error, DepositPaymentBodyType>(
    {
      mutationFn: (body: DepositPaymentBodyType) =>
        paymentApiRequest.depositUrl(body),
    }
  );
};

// ===== CANCEL PAYMENT =====
type CancelPaymentMutationResponse = Awaited<
  ReturnType<typeof paymentApiRequest.cancel>
>;

export const useCancelPayment = () => {
  return useMutation<
    CancelPaymentMutationResponse,
    Error,
    CancelPaymentBodyType
  >({
    mutationFn: (body: CancelPaymentBodyType) => paymentApiRequest.cancel(body),
  });
};
