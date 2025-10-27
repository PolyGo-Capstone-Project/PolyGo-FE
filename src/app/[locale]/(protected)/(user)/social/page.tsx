"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import CreatePostCard from "@/components/modules/social/create-post-card";
import FriendSidebar from "@/components/modules/social/friend-side-bar";
import PostCard from "@/components/modules/social/post-card";
import SuggestedGamesCard from "@/components/modules/social/suggested-games-card";

// ---------------------- Types (GIỮ TRONG PAGE) ----------------------
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

// ---------------------- Mock (GIỮ TRONG PAGE) ----------------------
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
];

const CURRENT_USER_AUTHOR: Author = {
  name: "You",
  avatar:
    "https://cdn.pixabay.com/photo/2022/03/11/06/14/indian-man-7061278_640.jpg",
  initials: "YO",
};

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
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* 3 columns */}
      <div className="flex-1 max-w-8xl mx-auto w-full px-4 py-4 overflow-hidden">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_4fr_1fr] xl:grid-cols-[1fr_2.5fr_1fr] gap-6 min-h-0">
          {/* Left */}
          <div className="min-h-0 overflow-y-auto">
            <SuggestedGamesCard t={t} games={mockSuggestedGames} />
          </div>

          {/* Middle */}
          <div className="min-h-0 overflow-y-auto">
            <div className="max-w-xl mx-auto w-full lg:max-w-full">
              <CreatePostCard
                t={t}
                currentUserAuthor={CURRENT_USER_AUTHOR}
                onPostCreated={handlePostCreated}
              />
              <div className="space-y-4 md:space-y-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    t={t}
                    currentUserAuthor={CURRENT_USER_AUTHOR}
                    onReact={handleReaction}
                    commentValue={commentInputs[post.id] || ""}
                    onCommentChange={handleCommentChange}
                    onCommentSubmit={handleCommentSubmit}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="min-h-0 overflow-y-auto">
            <FriendSidebar
              t={t}
              suggestedFriends={mockSuggestedFriends}
              onlineFriends={mockOnlineFriends}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
