import type { Metadata } from "next";
import PostDetailContent from "./post-detail-content";

export const metadata: Metadata = {
  title: "Post - PolyGo",
  description: "View post details",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailContent postId={id} />;
}
