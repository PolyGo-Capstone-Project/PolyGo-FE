import http from "@/lib/http";
import { buildQueryString, QueryParams } from "@/lib/utils";
import { LangQueryType, PaginationLangQueryType } from "@/models";

export type ListQueryParams = PaginationLangQueryType;

export const createGetAll = <
  Response,
  Query extends QueryParams = ListQueryParams,
>(
  prefix: string
) => {
  return (params?: Query) =>
    http.get<Response>(`${prefix}${buildQueryString(params)}`);
};

export const createGetOne = <
  Response,
  Query extends QueryParams = LangQueryType,
>(
  prefix: string
) => {
  return (id: string, params?: Query) =>
    http.get<Response>(`${prefix}/${id}${buildQueryString(params)}`);
};
