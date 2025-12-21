import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { IconEye, IconTrash } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

const statusBadge = (isDeleted: boolean) =>
  isDeleted ? "destructive" : "default";

export function PostsTable({
  items,
  page,
  pageSize,
  locale,
  onViewDetail,
  onDelete,
  emptyText,
}: {
  items: any[];
  page: number;
  pageSize: number;
  locale: string;
  onViewDetail: (post: any) => void;
  onDelete: (post: any) => void;
  emptyText: string;
}) {
  const t = useTranslations("admin.posts");

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">{emptyText}</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="min-w-[260px]">
              {t("columns.content")}
            </TableHead>
            <TableHead className="min-w-[160px]">
              {t("columns.creator")}
            </TableHead>
            <TableHead className="min-w-[120px]">
              {t("columns.createdAt")}
            </TableHead>
            <TableHead className="min-w-[100px]">
              {t("columns.status")}
            </TableHead>
            <TableHead className="min-w-[120px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p, idx) => (
            <TableRow key={p.id}>
              <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
              <TableCell className="max-w-[420px] line-clamp-2">
                {p.content}
              </TableCell>
              <TableCell>{p.creator?.name ?? "-"}</TableCell>
              <TableCell>
                {new Date(p.createdAt).toLocaleDateString(locale)}
              </TableCell>
              <TableCell>
                <Badge variant={statusBadge(p.isDeleted)}>
                  {p.isDeleted ? t("status.deleted") : t("status.active")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetail(p)}
                >
                  <IconEye className="size-4" />
                </Button>
                {!p.isDeleted && (
                  <Button variant="ghost" size="sm" onClick={() => onDelete(p)}>
                    <IconTrash className="size-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
