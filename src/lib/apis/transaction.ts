import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  GetMyBalanceResType,
  GetTransactionsQueryType,
  GetTransactionsResType,
} from "@/models";

const prefix = "/transaction/wallet";
export type GetTransactionsParams = GetTransactionsQueryType;

const transactionApiRequest = {
  //Admin
  getAll: createGetAll<GetTransactionsResType, GetTransactionsParams>(
    `${prefix}/transactions`
  ),
  getMyBalance: () => http.get<GetMyBalanceResType>(`${prefix}/balance`),
};

export default transactionApiRequest;
