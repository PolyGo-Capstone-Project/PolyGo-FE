"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Camera, Circle, Gamepad, Smile, UserPlus, Users } from "lucide-react";

// ---------------------- Types ----------------------
type Author = { name: string; avatar: string; initials: string };
type Comment = { id: string; author: Author; content: string; timeAgo: string };
type ReactionType = "heart" | "laugh" | "angry";
type Post = {
  id: string;
  author: Author;
  timeAgo: string;
  content: string;
  image: string | null;
  reactions: { heart: number; laugh: number; angry: number };
  commentCount: number;
  comments: Comment[];
};
type CreatePostCardProps = {
  t: ReturnType<typeof useTranslations>;
  onPostCreated: (newPost: Post) => void;
};

// ---------------------- Mock side data ----------------------
const mockSuggestedGames = [
  {
    id: "g1-1",
    title: "Flashcard Vocabulary",
    subtitle: "Ôn tập 100 từ vựng French",
    iconColor: "text-indigo-500",
  },
  {
    id: "g2-1",
    title: "Matching Pairs",
    subtitle: "Nối từ tiếng Anh: Chủ đề Food",
    iconColor: "text-green-500",
  },
  {
    id: "g3-1",
    title: "Fill-in-the-Blanks",
    subtitle: "Hoàn thành câu tiếng Tây Ban Nha",
    iconColor: "text-red-500",
  },
  {
    id: "g4-1",
    title: "Listen & Type",
    subtitle: "Luyện nghe tiếng Nhật cơ bản",
    iconColor: "text-yellow-500",
  },
  {
    id: "g1-2",
    title: "Flashcard Vocabulary",
    subtitle: "Ôn tập 100 từ vựng French",
    iconColor: "text-indigo-500",
  },
  {
    id: "g2-2",
    title: "Matching Pairs",
    subtitle: "Nối từ tiếng Anh: Chủ đề Food",
    iconColor: "text-green-500",
  },
  {
    id: "g3-2",
    title: "Fill-in-the-Blanks",
    subtitle: "Hoàn thành câu tiếng Tây Ban Nha",
    iconColor: "text-red-500",
  },
  {
    id: "g4-2",
    title: "Listen & Type",
    subtitle: "Luyện nghe tiếng Nhật cơ bản",
    iconColor: "text-yellow-500",
  },
  {
    id: "g1-3",
    title: "Flashcard Vocabulary",
    subtitle: "Ôn tập 100 từ vựng French",
    iconColor: "text-indigo-500",
  },
  {
    id: "g2-3",
    title: "Matching Pairs",
    subtitle: "Nối từ tiếng Anh: Chủ đề Food",
    iconColor: "text-green-500",
  },
  {
    id: "g3-3",
    title: "Fill-in-the-Blanks",
    subtitle: "Hoàn thành câu tiếng Tây Ban Nha",
    iconColor: "text-red-500",
  },
  {
    id: "g4-3",
    title: "Listen & Type",
    subtitle: "Luyện nghe tiếng Nhật cơ bản",
    iconColor: "text-yellow-500",
  },
];

const mockSuggestedFriends: Author[] = [
  {
    name: "Jessica T.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=60",
    initials: "JT",
  },
  {
    name: "Marco P.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a816d507db4?w=800&auto=format&fit=crop&q=60",
    initials: "MP",
  },
];

const mockOnlineFriends: Author[] = [
  {
    name: "Carlos M.",
    avatar:
      "https://static.vecteezy.com/system/resources/previews/026/408/660/non_2x/hipster-man-lifestyle-fashion-portrait-background-caucasian-isolated-modern-standing-t-shirt-white-model-student-smile-photo.jpg",
    initials: "CM",
  },
  {
    name: "Amar R.",
    avatar:
      "https://img.freepik.com/free-photo/young-handsome-man-wearing-casual-tshirt-blue-background-happy-face-smiling-with-crossed-arms-looking-camera-positive-person_839833-12963.jpg?semt=ais_hybrid&w=740&q=80",
    initials: "AR",
  },
  {
    name: "Sophia L.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzDDYq0vs0ZhUUYf0JYVzT96VaoHtfNDxrew&s",
    initials: "SL",
  },
  {
    name: "Jane D.",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=640&auto=format&fit=crop&q=60",
    initials: "JD",
  },
  {
    name: "John S.",
    avatar:
      "https://images.unsplash.com/photo-1502767089025-6572583495b0?w=640&auto=format&fit=crop&q=60",
    initials: "JS",
  },
  {
    name: "Aiko K.",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=640&auto=format&fit=crop&q=60",
    initials: "AK",
  },
  {
    name: "Carlos M.",
    avatar:
      "https://static.vecteezy.com/system/resources/previews/026/408/660/non_2x/hipster-man-lifestyle-fashion-portrait-background-caucasian-isolated-modern-standing-t-shirt-white-model-student-smile-photo.jpg",
    initials: "CM",
  },
  {
    name: "Amar R.",
    avatar:
      "https://img.freepik.com/free-photo/young-handsome-man-wearing-casual-tshirt-blue-background-happy-face-smiling-with-crossed-arms-looking-camera-positive-person_839833-12963.jpg?semt=ais_hybrid&w=740&q=80",
    initials: "AR",
  },
  {
    name: "Sophia L.",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzDDYq0vs0ZhUUYf0JYVzT96VaoHtfNDxrew&s",
    initials: "SL",
  },
  {
    name: "Jane D.",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=640&auto=format&fit=crop&q=60",
    initials: "JD",
  },
  {
    name: "John S.",
    avatar:
      "https://images.unsplash.com/photo-1502767089025-6572583495b0?w=640&auto=format&fit=crop&q=60",
    initials: "JS",
  },
  {
    name: "Aiko K.",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=640&auto=format&fit=crop&q=60",
    initials: "AK",
  },
];

const CURRENT_USER_AUTHOR: Author = {
  name: "You",
  avatar:
    "https://cdn.pixabay.com/photo/2022/03/11/06/14/indian-man-7061278_640.jpg",
  initials: "YO",
};

// ---------------------- Mock API ----------------------
async function getSocialPosts(): Promise<Post[]> {
  await new Promise((r) => setTimeout(r, 500));
  return [
    {
      id: "1",
      author: {
        name: "NguyenMinh",
        avatar:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJdjXMNs33JT-tl_JKSqpVmwOLSikdjQiNNykHlj6OyIK4XqPGNb9XC9NJnhhRXZg6Dfc&usqp=CAU",
        initials: "NM",
      },
      timeAgo: "1",
      content:
        "I just had an amazing French conversation practice session! The AI corrections really helped me improve my pronunciation.",
      image: null,
      reactions: { heart: 12, laugh: 5, angry: 0 },
      commentCount: 1,
      comments: [
        {
          id: "c1",
          author: {
            name: "AmarR",
            avatar:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJdjXMNs33JT-tl_JKSqpVmwOLSikdjQiNNykHlj6OyIK4XqPGNb9XC9NJnhhRXZg6Dfc&usqp=CAU",
            initials: "AR",
          },
          content: "That's wonderful! Keep practicing!",
          timeAgo: "30",
        },
      ],
    },
    {
      id: "2",
      author: {
        name: "AmarR",
        avatar:
          "https://img.freepik.com/free-photo/young-handsome-man-wearing-casual-tshirt-blue-background-happy-face-smiling-with-crossed-arms-looking-camera-positive-person_839833-12963.jpg?semt=ais_hybrid&w=740&q=80",
        initials: "AR",
      },
      timeAgo: "3",
      content:
        "Hosting a virtual French cooking class this weekend! Who wants to join? 🎉🍰",
      image:
        "https://www.hrcacademy.com/wp-content/uploads/2024/04/chef-preparing-food.jpg",
      reactions: { heart: 24, laugh: 8, angry: 0 },
      commentCount: 0,
      comments: [],
    },
    {
      id: "3",
      author: {
        name: "SophiaL",
        avatar:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzDDYq0vs0ZhUUYf0JYVzT96VaoHtfNDxrew&s",
        initials: "SL",
      },
      timeAgo: "5",
      content:
        "Finally reached a 30-day streak in Spanish! 🔥 The gamification features really keep me motivated.",
      image: null,
      reactions: { heart: 45, laugh: 12, angry: 0 },
      commentCount: 3,
      comments: [
        {
          id: "c2",
          author: {
            name: "CarlosM",
            avatar:
              "https://static.vecteezy.com/system/resources/previews/026/408/660/non_2x/hipster-man-lifestyle-fashion-portrait-background-caucasian-isolated-modern-standing-t-shirt-white-model-student-smile-photo.jpg",
            initials: "CM",
          },
          content: "Felicidades! Keep it up! 🎊",
          timeAgo: "4",
        },
        {
          id: "c3",
          author: {
            name: "NguyenMinh",
            avatar:
              "https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0zMjgtMzY2LXRvbmctMDhfMS5qcGc.jpg",
            initials: "NM",
          },
          content: "Amazing achievement! 👏",
          timeAgo: "3",
        },
      ],
    },
  ];
}

// ---------------------- Left: Suggested Games ----------------------
function SuggestedGamesCard({ t }: { t: ReturnType<typeof useTranslations> }) {
  const scrollNeeded = mockSuggestedGames.length > 6;
  return (
    <div className="hidden lg:block h-full overflow-hidden">
      <Card className="h-full">
        <CardHeader className="pb-4 border-b sticky top-0 bg-background z-10">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Gamepad className="h-4 w-4" />
            {t("leftSidebar.games.title", {
              defaultValue: "Trò chơi rèn luyện",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`pt-4 space-y-2 ${scrollNeeded ? "overflow-y-auto" : "overflow-visible"}`}
          style={scrollNeeded ? { maxHeight: "calc(100% - 64px)" } : {}}
        >
          {mockSuggestedGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div
                className={`flex-shrink-0 flex items-center justify-center h-8 w-10 text-xs font-bold rounded-md border ${game.iconColor} bg-background/50`}
              >
                NEW
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">
                  {game.title}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {game.subtitle}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 text-xs py-1 h-auto"
              >
                {t("leftSidebar.games.play", { defaultValue: "Chơi" })}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------- Right: Friend Sidebar ----------------------
function FriendSidebar({ t }: { t: ReturnType<typeof useTranslations> }) {
  const onlineScrollNeeded = mockOnlineFriends.length > 5;

  return (
    <div className="hidden lg:flex flex-col h-full gap-6 overflow-hidden">
      {/* Suggested Friends */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-4 border-b sticky top-0 bg-background z-10">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            {t("rightSidebar.suggestions.title", {
              defaultValue: "Gợi ý kết bạn",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {mockSuggestedFriends.map((friend) => (
            <div
              key={friend.initials}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{friend.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{friend.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs py-1 h-auto bg-transparent"
              >
                {t("rightSidebar.suggestions.add", { defaultValue: "Thêm" })}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Online Friends (scroll if >5) */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-4 border-b flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t("rightSidebar.online.title", {
              defaultValue: "Bạn bè đang Online",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`pt-4 space-y-3 flex-1 ${onlineScrollNeeded ? "overflow-y-auto" : "overflow-visible"}`}
        >
          {mockOnlineFriends.map((friend, idx) => (
            <div
              key={`${friend.initials}-${idx}`}
              className="flex items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{friend.initials}</AvatarFallback>
                  </Avatar>
                  <Circle className="absolute bottom-0 right-0 h-2.5 w-2.5 fill-green-500 text-green-500 border-2 border-background rounded-full" />
                </div>
                <span className="text-sm font-medium">{friend.name}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------- CreatePost ----------------------
function CreatePostCard({ t, onPostCreated }: CreatePostCardProps) {
  const [postContent, setPostContent] = useState("");

  const handlePostSubmit = () => {
    const text = postContent.trim();
    if (!text) return;
    const newPost: Post = {
      id: `p${Date.now()}`,
      author: CURRENT_USER_AUTHOR,
      timeAgo: t("post.justNow"),
      content: text,
      image: null,
      reactions: { heart: 0, laugh: 0, angry: 0 },
      commentCount: 0,
      comments: [],
    };
    onPostCreated(newPost);
    setPostContent("");
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={CURRENT_USER_AUTHOR.avatar} />
            <AvatarFallback>{CURRENT_USER_AUTHOR.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Input
              placeholder={t("createPost.placeholder")}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePostSubmit();
                }
              }}
              className="mb-2 border-none bg-muted text-sm sm:mb-3 sm:text-base"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-0.5 sm:gap-2">
                <Button variant="ghost" size="sm">
                  <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("createPost.photoButton")}
                  </span>
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {t("createPost.emojiButton")}
                  </span>
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handlePostSubmit}
                disabled={!postContent.trim()}
              >
                {t("createPost.postButton")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------- Page ----------------------
export default function SocialPage() {
  const t = useTranslations("social");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    getSocialPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const handlePostCreated = (newPost: Post) => setPosts((p) => [newPost, ...p]);

  const handleReaction = (postId: string, reactionType: ReactionType) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              reactions: {
                ...p.reactions,
                [reactionType]: p.reactions[reactionType] + 1,
              },
            }
          : p
      )
    );
  };

  const handleCommentChange = (postId: string, value: string) =>
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `c${Date.now()}`,
                  author: CURRENT_USER_AUTHOR,
                  content: text,
                  timeAgo: t("post.justNow"),
                },
              ],
              commentCount: p.commentCount + 1,
            }
          : p
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading posts...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Sticky Page Header (fix: sticky, not 'fix') */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* 3 columns with independent scroll */}
      <div className="flex-1 max-w-8xl mx-auto w-full px-4 py-4 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_4fr_1fr] xl:grid-cols-[1fr_2.5fr_1fr] gap-6">
          {/* Left column (Games) */}
          <div className="h-4/5 overflow-y-auto">
            <SuggestedGamesCard t={t} />
          </div>

          {/* Middle column (Feed) */}
          <div className="h-full overflow-y-auto">
            <div className="max-w-xl mx-auto w-full lg:max-w-full">
              <CreatePostCard t={t} onPostCreated={handlePostCreated} />
              <div className="space-y-4 md:space-y-6">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-3 md:p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>
                              {post.author.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm md:text-base">
                              {post.author.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {post.timeAgo} {t("onlineTime")}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              ⋯
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              {t("post.report")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="mb-3 text-sm md:text-base">
                        {post.content}
                      </p>

                      {post.image && (
                        <div className="mb-3 relative w-full aspect-[4/3] overflow-hidden rounded-lg">
                          <Image
                            src={post.image}
                            alt="Post content"
                            fill
                            style={{ objectFit: "cover" }}
                            className="rounded-lg"
                          />
                        </div>
                      )}

                      <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          ❤️ {post.reactions.heart} {t("post.reactions")}
                        </span>
                        <span>
                          {post.commentCount}{" "}
                          {post.commentCount === 1
                            ? t("post.comment")
                            : t("post.comments")}
                        </span>
                      </div>

                      <Separator className="mb-3" />

                      <div className="mb-4 flex justify-between flex-wrap">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post.id, "heart")}
                          >
                            ❤️
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post.id, "laugh")}
                          >
                            😂
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReaction(post.id, "angry")}
                          >
                            😡
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            ↗️ {t("post.share")}
                          </Button>
                          <Button variant="ghost" size="sm">
                            🚩 {t("post.report")}
                          </Button>
                        </div>
                      </div>

                      {post.comments.length > 0 && (
                        <div className="mb-4 space-y-3">
                          {post.comments.map((c) => (
                            <div key={c.id} className="flex gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={c.author.avatar} />
                                <AvatarFallback>
                                  {c.author.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-muted rounded-lg p-2">
                                  <p className="text-xs font-semibold">
                                    {c.author.name}
                                  </p>
                                  <p className="text-xs break-words">
                                    {c.content}
                                  </p>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                                  <span>{c.timeAgo}</span>
                                  <button className="hover:underline">
                                    {t("post.reply")}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={CURRENT_USER_AUTHOR.avatar} />
                          <AvatarFallback>
                            {CURRENT_USER_AUTHOR.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 gap-2">
                          <Input
                            placeholder={t("post.commentPlaceholder")}
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(post.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleCommentSubmit(post.id);
                              }
                            }}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleCommentSubmit(post.id)}
                            disabled={!commentInputs[post.id]?.trim()}
                          >
                            ➤
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right column (Friends) */}
          <div className="h-6/7 overflow-y-auto">
            <FriendSidebar t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
