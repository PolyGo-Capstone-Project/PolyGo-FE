import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateAccountBankBodyType,
  CreateInquiryTransactionBodyType,
  GetAdminTransactionsResType,
  GetTransactionAdminQueryType,
  GetUserTransactionsResType,
  GetUserWalletResType,
  MessageResType,
  UpdateInquiryTransactionBodyType,
  WithdrawalApproveBodyType,
  WithdrawalCancelBodyType,
  WithdrawalConfirmBodyType,
  WithdrawalRequestBodyType,
} from "@/models";

const prefix = "/transactions";

const transactionApiRequest = {
  // GET user transactions
  getUserTransactions: createGetAll<
    GetUserTransactionsResType,
    GetTransactionAdminQueryType
  >(`${prefix}`),
  // GET admin transactions
  getAdminTransactions: createGetAll<
    GetAdminTransactionsResType,
    GetTransactionAdminQueryType
  >(`/admin${prefix}`),
  // GET wallet
  getUserWallet: () => http.get<GetUserWalletResType>(`/wallet`),
  // POST create account bank
  createAccountBank: (body: CreateAccountBankBodyType) =>
    http.post<MessageResType>(`/wallet/accounts`, body),
  // DELETE delete account bank
  deleteAccountBank: (bankAccountId: string) =>
    http.delete<MessageResType>(`/wallet/accounts/${bankAccountId}`),
  // POST withdrawal request
  withdrawalRequest: (body: WithdrawalRequestBodyType) =>
    http.post<MessageResType>(`${prefix}/withdrawal-request`, body),
  // POST withdrawal confirm
  withdrawalConfirm: (body: WithdrawalConfirmBodyType) =>
    http.post<MessageResType>(`${prefix}/withdrawal-confirm`, body),
  // PUT withdrawal cancel
  withdrawalCancel: (id: string, body: WithdrawalCancelBodyType) =>
    http.put<MessageResType>(`${prefix}/withdrawal-cancel/${id}`, body),
  // PUT withdrawal approve
  withdrawalApprove: (id: string, body: WithdrawalApproveBodyType) =>
    http.put<MessageResType>(`${prefix}/withdrawal-approve/${id}`, body),
  // POST inquiry transaction
  inquiryTransaction: (id: string, body: CreateInquiryTransactionBodyType) =>
    http.post<MessageResType>(`/inquiry${prefix}/${id}`, body),
  // PUT inquiry transaction
  updateInquiryTransaction: (
    id: string,
    body: UpdateInquiryTransactionBodyType
  ) => http.put<MessageResType>(`/inquiry${prefix}/${id}`, body),
};

export default transactionApiRequest;
