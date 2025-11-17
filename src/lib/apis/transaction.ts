import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  GetAdminTransactionsResType,
  GetTransactionQueryType,
  GetUserTransactionsResType,
  GetUserWalletResType,
} from "@/models";

const prefix = "/transactions";

const transactionApiRequest = {
  // GET wallet
  getUserWallet: () => http.get<GetUserWalletResType>(`${prefix}/wallet`),
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
};

export default transactionApiRequest;
