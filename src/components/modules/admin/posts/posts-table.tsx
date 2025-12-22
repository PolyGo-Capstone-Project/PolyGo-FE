import { MarkdownRenderer } from "@/components/shared";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
            <TableHead className="w-12">No.</TableHead>
            <TableHead className="min-w-[620px]">
              {t("columns.content")}
            </TableHead>
            <TableHead className="min-w-[160px]">
              {t("columns.creator")}
            </TableHead>
            <TableHead className="min-w-[120px]">
              {t("columns.createdAt")}
            </TableHead>
            {/* <TableHead className="min-w-[100px]">
              {t("columns.status")}
            </TableHead> */}
            <TableHead className="min-w-[120px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p, idx) => {
            const creator = p.creator;

            return (
              <TableRow key={p.id}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>

                {/* Content */}
                <TableCell className="max-w-[420px]">
                  <div className="line-clamp-2 text-sm text-muted-foreground prose prose-sm max-w-none h-20">
                    <MarkdownRenderer content={p.content} />
                  </div>
                </TableCell>

                {/* Creator (Avatar + Name) */}
                <TableCell>
                  {creator ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={creator.avatarUrl}
                          alt={creator.name}
                        />
                        <AvatarFallback>
                          {creator.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">
                          {creator.name}
                        </span>
                        {/* <span className="text-xs text-muted-foreground">
                          {creator.id?.slice(0, 6)}
                        </span> */}
                      </div>
                    </div>
                  ) : (
                    "-"
                  )}
                </TableCell>

                {/* Created At */}
                <TableCell>
                  {new Date(p.createdAt).toLocaleDateString(locale)}
                </TableCell>

                {/* Status */}
                {/* <TableCell>
                  <Badge variant={statusBadge(p.isDeleted)}>
                    {p.isDeleted ? t("status.deleted") : t("status.active")}
                  </Badge>
                </TableCell> */}

                {/* Actions */}
                <TableCell className="text-right whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(p)}
                  >
                    <IconEye className="size-4" />
                  </Button>

                  {!p.isDeleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(p)}
                    >
                      <IconTrash className="size-4 text-destructive" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
