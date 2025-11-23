import { createGetAll } from "@/lib/apis/factory";
import http from "@/lib/http";
import {
  CreateReportBodyType,
  GetReportByIdType,
  GetReportListType,
  GetUserReportListType,
  MessageResType,
  PaginationQueryType,
  ProcessReportBodyType,
  ReportQueryType,
} from "@/models";

const prefix = "/reports";

const reportApiRequest = {
  // POST - create report
  createReport: (body: CreateReportBodyType) =>
    http.post<MessageResType>(`${prefix}`, body),
  // Get my reports
  getUserReports: createGetAll<GetUserReportListType, PaginationQueryType>(
    `${prefix}/me`
  ),
  // Admin - get all reports
  getAllReports: createGetAll<GetReportListType, ReportQueryType>(
    `${prefix}/all`
  ),
  // Get report by ID
  getReportById: (reportId: string) =>
    http.get<GetReportByIdType>(`${prefix}/${reportId}`),
  // Admin - process report
  processReport: (reportId: string, body: ProcessReportBodyType) =>
    http.put<MessageResType>(`${prefix}/${reportId}`, body),
};

export default reportApiRequest;
