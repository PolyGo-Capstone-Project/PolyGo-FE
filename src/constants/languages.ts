export const MOCK_LANGUAGES = [
  { id: "en", name: "English", flag: "🇬🇧" },
  { id: "es", name: "Spanish", flag: "🇪🇸" },
  { id: "fr", name: "French", flag: "🇫🇷" },
  { id: "de", name: "German", flag: "🇩🇪" },
  { id: "it", name: "Italian", flag: "🇮🇹" },
  { id: "pt", name: "Portuguese", flag: "🇵🇹" },
  { id: "ru", name: "Russian", flag: "🇷🇺" },
  { id: "zh", name: "Chinese", flag: "🇨🇳" },
  { id: "ja", name: "Japanese", flag: "🇯🇵" },
  { id: "ko", name: "Korean", flag: "🇰🇷" },
  { id: "ar", name: "Arabic", flag: "🇸🇦" },
  { id: "hi", name: "Hindi", flag: "🇮🇳" },
  { id: "vi", name: "Vietnamese", flag: "🇻🇳" },
  { id: "th", name: "Thai", flag: "🇹🇭" },
  { id: "tr", name: "Turkish", flag: "🇹🇷" },
];

export const PROFICIENCY_LEVELS = [
  { id: "beginner", label: "Beginner", description: "Just starting out" },
  {
    id: "elementary",
    label: "Elementary",
    description: "Basic understanding",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Can have conversations",
  },
  { id: "advanced", label: "Advanced", description: "Fluent speaker" },
  { id: "native", label: "Native", description: "Native speaker" },
];

export const INTERESTS = [
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "food", label: "Food & Cooking", icon: "🍳" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "movies", label: "Movies & TV", icon: "🎬" },
  { id: "books", label: "Books & Reading", icon: "📚" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "art", label: "Art & Design", icon: "🎨" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "gaming", label: "Gaming", icon: "🎮" },
  { id: "fashion", label: "Fashion", icon: "👗" },
];

export const AVAILABILITY_TIMES = [
  { id: "morning", label: "Morning", time: "6:00 - 12:00", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", time: "12:00 - 18:00", icon: "☀️" },
  { id: "evening", label: "Evening", time: "18:00 - 22:00", icon: "🌆" },
  { id: "night", label: "Night", time: "22:00 - 6:00", icon: "🌙" },
];

export const WEEKLY_HOURS = [
  { value: 1, label: "1-2 hours per week" },
  { value: 3, label: "3-5 hours per week" },
  { value: 6, label: "6-10 hours per week" },
  { value: 11, label: "10+ hours per week" },
];

export const COMMON_TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh (UTC+7)", offset: "+07:00" },
  { value: "Asia/Bangkok", label: "Bangkok (UTC+7)", offset: "+07:00" },
  { value: "Asia/Singapore", label: "Singapore (UTC+8)", offset: "+08:00" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)", offset: "+09:00" },
  { value: "Asia/Seoul", label: "Seoul (UTC+9)", offset: "+09:00" },
  { value: "Asia/Shanghai", label: "Shanghai (UTC+8)", offset: "+08:00" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (UTC+8)", offset: "+08:00" },
  { value: "Asia/Taipei", label: "Taipei (UTC+8)", offset: "+08:00" },
  {
    value: "Asia/Kuala_Lumpur",
    label: "Kuala Lumpur (UTC+8)",
    offset: "+08:00",
  },
  { value: "Asia/Jakarta", label: "Jakarta (UTC+7)", offset: "+07:00" },
  { value: "Asia/Manila", label: "Manila (UTC+8)", offset: "+08:00" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)", offset: "+10:00" },
  {
    value: "Pacific/Auckland",
    label: "Auckland (UTC+12/+13)",
    offset: "+12:00",
  },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)", offset: "+04:00" },
  { value: "Europe/London", label: "London (UTC+0/+1)", offset: "+00:00" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)", offset: "+01:00" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/+2)", offset: "+01:00" },
  { value: "Europe/Moscow", label: "Moscow (UTC+3)", offset: "+03:00" },
  { value: "America/New_York", label: "New York (UTC-5/-4)", offset: "-05:00" },
  { value: "America/Chicago", label: "Chicago (UTC-6/-5)", offset: "-06:00" },
  { value: "America/Denver", label: "Denver (UTC-7/-6)", offset: "-07:00" },
  {
    value: "America/Los_Angeles",
    label: "Los Angeles (UTC-8/-7)",
    offset: "-08:00",
  },
  { value: "America/Toronto", label: "Toronto (UTC-5/-4)", offset: "-05:00" },
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)", offset: "-03:00" },
];
