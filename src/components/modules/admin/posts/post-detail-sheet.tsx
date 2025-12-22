import { MarkdownRenderer } from "@/components/shared";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import Image from "next/image";

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
  const sharedPost = post.sharedPost;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl px-5 pb-10 overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("description")}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <div className="font-semibold">{t("content")}</div>
            <MarkdownRenderer content={post.content} />
          </div>

          {post.imageUrls && post.imageUrls.length > 0 && (
            <div>
              <div className="font-semibold mb-2">{t("allImage")}</div>

              <div className="grid grid-cols-2 gap-3">
                {post.imageUrls.map((url: string, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-md border"
                  >
                    <Image
                      src={url}
                      alt={`post-image-${idx}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== BÀI ĐƯỢC SHARE ===== */}
          {sharedPost && (
            <>
              <Separator />

              <div className="rounded-md border bg-muted/30 p-4 space-y-4">
                <div className="text-sm font-semibold text-muted-foreground">
                  {t("sharedPost")}
                </div>

                {/* Content bài gốc */}
                <MarkdownRenderer content={sharedPost.content} />

                {/* Ảnh bài gốc */}
                {sharedPost.imageUrls?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {sharedPost.imageUrls.map((url: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative aspect-square overflow-hidden rounded-md border"
                      >
                        <Image
                          src={url}
                          alt={`shared-post-image-${idx}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta bài gốc */}
                <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">{t("creator")}:</span>{" "}
                    {sharedPost.creator?.name}
                  </div>
                  <div>
                    <span className="font-medium">{t("createdAt")}:</span>{" "}
                    {new Date(sharedPost.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* ===== COMMENTS ===== */}
          {post.comments?.length > 0 && (
            <>
              <Separator />

              <div className="space-y-3">
                <div className="font-semibold">
                  {t("comments")} ({post.comments.length})
                </div>

                <div className="space-y-3">
                  {post.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 rounded-md border p-3 text-sm"
                    >
                      {comment.user?.avatarUrl && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={comment.user.avatarUrl}
                            alt={comment.user.name}
                          />
                          <AvatarFallback>
                            {comment.user.name?.charAt(0)?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex-1">
                        <div className="font-medium">{comment.user?.name}</div>
                        <div className="text-muted-foreground">
                          {comment.content}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

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
