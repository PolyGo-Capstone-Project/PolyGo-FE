import http from "@/lib/http";
import {
  CancelPaymentBodyType,
  DepositPaymentBodyType,
  DepositPaymentResType,
  MessageResType,
} from "@/models";

const prefix = "/payment";

const paymentApiRequest = {
  // POST deposit payment
  depositUrl: (body: DepositPaymentBodyType) =>
    http.post<DepositPaymentResType>(`${prefix}/deposit-url`, body),
  // POST cancel
  cancel: (body: CancelPaymentBodyType) =>
    http.post<MessageResType>(`${prefix}/cancel`, body),
};

export default paymentApiRequest;
