import reportApiRequest from "@/lib/apis/report";
import {
  CreateReportBodyType,
  GetReportByIdType,
  GetReportListType,
  GetUserReportListType,
  PaginationQueryType,
  ProcessReportBodyType,
  ReportQueryType,
} from "@/models";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

// Query keys
export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (params?: ReportQueryType) => [...reportKeys.lists(), params] as const,
  userReports: (params?: PaginationQueryType) =>
    [...reportKeys.all, "user", params] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
};

// GET - Admin get all reports
export const useGetAllReports = (
  params?: ReportQueryType,
  options?: Omit<UseQueryOptions<GetReportListType>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: async () => {
      const response = await reportApiRequest.getAllReports(params);
      return response.payload;
    },
    ...options,
  });
};

// GET - User get their reports
export const useGetUserReports = (
  params?: PaginationQueryType,
  options?: Omit<UseQueryOptions<GetUserReportListType>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: reportKeys.userReports(params),
    queryFn: async () => {
      const response = await reportApiRequest.getUserReports(params);
      return response.payload;
    },
    ...options,
  });
};

// GET - Get report by ID
export const useGetReportById = (
  reportId: string,
  options?: Omit<UseQueryOptions<GetReportByIdType>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: async () => {
      const response = await reportApiRequest.getReportById(reportId);
      return response.payload;
    },
    enabled: !!reportId,
    ...options,
  });
};

// POST - Create report
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateReportBodyType) =>
      reportApiRequest.createReport(body),
    onSuccess: () => {
      // Invalidate user reports list
      queryClient.invalidateQueries({
        queryKey: reportKeys.userReports(),
      });
    },
  });
};

// PUT - Admin process report
export const useProcessReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      body,
    }: {
      reportId: string;
      body: ProcessReportBodyType;
    }) => reportApiRequest.processReport(reportId, body),
    onSuccess: (_, variables) => {
      // Invalidate all reports list
      queryClient.invalidateQueries({
        queryKey: reportKeys.lists(),
      });
      // Invalidate specific report detail
      queryClient.invalidateQueries({
        queryKey: reportKeys.detail(variables.reportId),
      });
    },
  });
};
