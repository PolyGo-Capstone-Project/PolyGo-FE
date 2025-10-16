// src/lib/apis/subscription.ts
import { createGetAll } from "@/lib/apis/factory";
import {
  GetPlansQueryType,
  GetPlansResType,
} from "@/models/subscriptionPlan.model";

const prefix = "/subscriptions/plans";

export type GetPlansParams = GetPlansQueryType;

const subscriptionApiRequest = {
  getAll: createGetAll<GetPlansResType, GetPlansParams>(prefix),
  // (optional) getOne: createGetOne<GetPlanByIdResType, GetPlanByIdQueryType>(prefix)
  // add other endpoints if needed (create/update/delete) using http.post/put/delete
};

export default subscriptionApiRequest;
