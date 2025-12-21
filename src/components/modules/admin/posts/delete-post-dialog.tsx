import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from "@/components/ui";
import { useAdminDeletePost } from "@/hooks/query/use-post";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function DeletePostDialog({
  post,
  open,
  onClose,
}: {
  post: any;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("admin.posts.delete");
  const [reason, setReason] = useState("");
  const deleteMutation = useAdminDeletePost();

  const submit = () => {
    if (!reason.trim()) return;
    deleteMutation.mutate(
      { postId: post.id, body: { reason } },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label>{t("reason")}</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("reasonPlaceholder")}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || deleteMutation.isPending}
            onClick={submit}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
