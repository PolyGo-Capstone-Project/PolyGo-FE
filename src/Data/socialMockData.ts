export const MOCK_POSTS = [
  {
    id: "1",
    author: {
      name: "NguyenMinh",
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJdjXMNs33JT-tl_JKSqpVmwOLSikdjQiNNykHlj6OyIK4XqPGNb9XC9NJnhhRXZg6Dfc&usqp=CAU",
      initials: "NM",
    },
    timeAgo: "1h ago",
    content:
      "I just had an amazing French conversation practice session! The AI corrections really helped me improve my pronunciation.",
    image: null,
    reactions: {
      heart: 12,
      laugh: 5,
      angry: 0,
    },
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
        timeAgo: "30m ago",
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
    timeAgo: "3h ago",
    content:
      "Hosting a virtual French cooking class this weekend! Who wants to join? 🎉🍰",
    image:
      "https://www.hrcacademy.com/wp-content/uploads/2024/04/chef-preparing-food.jpg",
    reactions: {
      heart: 24,
      laugh: 8,
      angry: 0,
    },
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
    timeAgo: "5h ago",
    content:
      "Finally reached a 30-day streak in Spanish! 🔥 The gamification features really keep me motivated.",
    image: null,
    reactions: {
      heart: 45,
      laugh: 12,
      angry: 0,
    },
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
        timeAgo: "4h ago",
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
        timeAgo: "3h ago",
      },
    ],
  },
];
