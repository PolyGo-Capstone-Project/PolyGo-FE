export const ReportEnum = {
  Event: "Event",
  Post: "Post",
  User: "User",
  System: "System",
} as const;

export type ReportTypeEnum = (typeof ReportEnum)[keyof typeof ReportEnum];

export const ReportStatusEnum = {
  Pending: "Pending",
  Processing: "Processing",
  Resolved: "Resolved",
  Rejected: "Rejected",
} as const;

export type ReportStatusTypeEnum =
  (typeof ReportStatusEnum)[keyof typeof ReportStatusEnum];
