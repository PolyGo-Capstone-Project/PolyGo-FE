import { createGetAll } from "@/lib/apis/factory";
import { DashboardOverviewQueryType, DashboardOverviewResType } from "@/models";

const prefix = "/dashboard/overview";

export type GetDashboardOverviewParams = DashboardOverviewQueryType;

const dashboardApiRequest = {
  getOverview: createGetAll<
    DashboardOverviewResType,
    GetDashboardOverviewParams
  >(prefix),
};

export default dashboardApiRequest;
