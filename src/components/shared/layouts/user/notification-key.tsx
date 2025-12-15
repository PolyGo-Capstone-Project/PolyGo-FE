// notification.keys.ts
export const notificationKeys = {
  all: (lang: string) => ["notifications", lang] as const,
  list: (lang: string, params: { pageNumber: number; pageSize: number }) =>
    [...notificationKeys.all(lang), "list", params] as const,
};
