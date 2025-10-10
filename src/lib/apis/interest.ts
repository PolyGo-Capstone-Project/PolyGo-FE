import { createGetAll, createGetOne } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateInterestBodyType,
  GetInterestByIdQueryType,
  GetInterestByIdResType,
  GetInterestsQueryType,
  GetInterestsResType,
  MessageResType,
  UpdateInterestBodyType,
} from "@/models";

const prefix = "/interests";

export type GetInterestsParams = GetInterestsQueryType;
export type GetInterestParams = GetInterestByIdQueryType;

const interestApiRequest = {
  getAll: createGetAll<GetInterestsResType, GetInterestsParams>(prefix),
  getOne: createGetOne<GetInterestByIdResType, GetInterestParams>(prefix),
  create: (body: CreateInterestBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  update: (id: string, body: UpdateInterestBodyType) =>
    http.put<MessageResType>(`${prefix}/${id}`, body),
  delete: (id: string) => http.delete<MessageResType>(`${prefix}/${id}`),
};

export default interestApiRequest;
