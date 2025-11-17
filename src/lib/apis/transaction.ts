import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateAccountBankBodyType,
  CreateInquiryTransactionBodyType,
  GetAdminTransactionsResType,
  GetTransactionQueryType,
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
    GetTransactionQueryType
  >(`${prefix}`),
  // GET admin transactions
  getAdminTransactions: createGetAll<
    GetAdminTransactionsResType,
    GetTransactionQueryType
  >(`/admin/${prefix}`),
  // GET wallet
  getUserWallet: () => http.get<GetUserWalletResType>(`${prefix}/wallet`),
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
  withdrawalCancel: (body: WithdrawalCancelBodyType) =>
    http.put<MessageResType>(`${prefix}/withdrawal-cancel`, body),
  // PUT withdrawal approve
  withdrawalApprove: (body: WithdrawalApproveBodyType) =>
    http.put<MessageResType>(`${prefix}/withdrawal-approve`, body),
  // POST inquiry transaction
  inquiryTransaction: (id: string, body: CreateInquiryTransactionBodyType) =>
    http.post<MessageResType>(`/inquiry/${prefix}/${id}`, body),
  // PUT inquiry transaction
  updateInquiryTransaction: (
    id: string,
    body: UpdateInquiryTransactionBodyType
  ) => http.put<MessageResType>(`/inquiry/${prefix}/${id}`, body),
};

export default transactionApiRequest;
