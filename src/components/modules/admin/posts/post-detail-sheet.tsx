import {
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui";
import { useTranslations } from "next-intl";

export function PostDetailSheet({
  post,
  open,
  onOpenChange,
}: {
  post: any;
  open: boolean;
  onOpenChange: () => void;
}) {
  const t = useTranslations("admin.posts.detail");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl px-5">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <div className="font-semibold">{t("content")}</div>
            <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium">{t("creator")}</div>
              <div>{post.creator?.name}</div>
            </div>
            <div>
              <div className="font-medium">{t("createdAt")}</div>
              <div>{new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium">{t("comments")}</div>
              <div>{post.commentsCount}</div>
            </div>
            <div>
              <div className="font-medium">{t("reactions")}</div>
              <div>{post.reactionsCount}</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
