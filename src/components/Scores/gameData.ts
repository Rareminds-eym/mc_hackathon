import { Module, UserProfile } from './types/GameData';

export const userProfile: UserProfile = {
  name: "Alex Chen",
  avatar: "👨‍🎓",
  totalScore: 3847,
  rank: "Champion",
  level: 42,
  completedModules: 8,
  totalModules: 12
};

export const modules: Module[] = [
  {
    id: 1,
    name: "Mathematics",
    icon: "Calculator",
    color: "from-blue-500 to-blue-600",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    category: "STEM",
    levels: [
      { id: 1, score: 95, stars: 3, completed: true, timeSpent: "12m" },
      { id: 2, score: 87, stars: 3, completed: true, timeSpent: "15m" },
      { id: 3, score: 92, stars: 3, completed: true, timeSpent: "18m" },
      { id: 4, score: 78, stars: 2, completed: true, timeSpent: "22m" }
    ],
    completedLevels: 4,
    totalScore: 352
  },
  {
    id: 2,
    name: "Science",
    icon: "Atom",
    color: "from-green-500 to-green-600",
    gradient: "bg-gradient-to-br from-green-500 to-green-600",
    category: "STEM",
    levels: [
      { id: 1, score: 88, stars: 3, completed: true, timeSpent: "14m" },
      { id: 2, score: 91, stars: 3, completed: true, timeSpent: "16m" },
      { id: 3, score: 85, stars: 2, completed: true, timeSpent: "20m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 3,
    totalScore: 264
  },
  {
    id: 3,
    name: "History",
    icon: "Castle",
    color: "from-amber-500 to-orange-500",
    gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    category: "Humanities",
    levels: [
      { id: 1, score: 93, stars: 3, completed: true, timeSpent: "11m" },
      { id: 2, score: 89, stars: 3, completed: true, timeSpent: "13m" },
      { id: 3, score: 82, stars: 2, completed: true, timeSpent: "17m" },
      { id: 4, score: 76, stars: 2, completed: true, timeSpent: "19m" }
    ],
    completedLevels: 4,
    totalScore: 340
  },
  {
    id: 4,
    name: "Literature",
    icon: "BookOpen",
    color: "from-purple-500 to-purple-600",
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    category: "Language Arts",
    levels: [
      { id: 1, score: 94, stars: 3, completed: true, timeSpent: "16m" },
      { id: 2, score: 87, stars: 3, completed: true, timeSpent: "21m" },
      { id: 3, score: 79, stars: 2, completed: true, timeSpent: "25m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 3,
    totalScore: 260
  },
  {
    id: 5,
    name: "Geography",
    icon: "Globe",
    color: "from-teal-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-500",
    category: "Social Studies",
    levels: [
      { id: 1, score: 91, stars: 3, completed: true, timeSpent: "13m" },
      { id: 2, score: 88, stars: 3, completed: true, timeSpent: "15m" },
      { id: 3, score: 84, stars: 2, completed: true, timeSpent: "18m" },
      { id: 4, score: 77, stars: 2, completed: true, timeSpent: "23m" }
    ],
    completedLevels: 4,
    totalScore: 340
  },
  {
    id: 6,
    name: "Art & Design",
    icon: "Palette",
    color: "from-pink-500 to-rose-500",
    gradient: "bg-gradient-to-br from-pink-500 to-rose-500",
    category: "Creative Arts",
    levels: [
      { id: 1, score: 96, stars: 3, completed: true, timeSpent: "20m" },
      { id: 2, score: 92, stars: 3, completed: true, timeSpent: "24m" },
      { id: 3, score: 0, stars: 0, completed: false, timeSpent: "0m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 2,
    totalScore: 188
  },
  {
    id: 7,
    name: "Music Theory",
    icon: "Music",
    color: "from-indigo-500 to-purple-500",
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-500",
    category: "Creative Arts",
    levels: [
      { id: 1, score: 89, stars: 3, completed: true, timeSpent: "18m" },
      { id: 2, score: 85, stars: 2, completed: true, timeSpent: "22m" },
      { id: 3, score: 81, stars: 2, completed: true, timeSpent: "26m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 3,
    totalScore: 255
  },
  {
    id: 8,
    name: "Physical Education",
    icon: "Zap",
    color: "from-red-500 to-pink-500",
    gradient: "bg-gradient-to-br from-red-500 to-pink-500",
    category: "Health & Fitness",
    levels: [
      { id: 1, score: 87, stars: 3, completed: true, timeSpent: "30m" },
      { id: 2, score: 90, stars: 3, completed: true, timeSpent: "28m" },
      { id: 3, score: 85, stars: 2, completed: true, timeSpent: "32m" },
      { id: 4, score: 82, stars: 2, completed: true, timeSpent: "35m" }
    ],
    completedLevels: 4,
    totalScore: 344
  },
  {
    id: 9,
    name: "Computer Science",
    icon: "Code",
    color: "from-slate-600 to-slate-700",
    gradient: "bg-gradient-to-br from-slate-600 to-slate-700",
    category: "Technology",
    levels: [
      { id: 1, score: 98, stars: 3, completed: true, timeSpent: "25m" },
      { id: 2, score: 94, stars: 3, completed: true, timeSpent: "30m" },
      { id: 3, score: 0, stars: 0, completed: false, timeSpent: "0m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 2,
    totalScore: 192
  },
  {
    id: 10,
    name: "Psychology",
    icon: "Brain",
    color: "from-violet-500 to-purple-600",
    gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
    category: "Social Sciences",
    levels: [
      { id: 1, score: 86, stars: 2, completed: true, timeSpent: "19m" },
      { id: 2, score: 90, stars: 3, completed: true, timeSpent: "23m" },
      { id: 3, score: 88, stars: 3, completed: true, timeSpent: "27m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 3,
    totalScore: 264
  },
  {
    id: 11,
    name: "Economics",
    icon: "TrendingUp",
    color: "from-emerald-500 to-teal-600",
    gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    category: "Social Sciences",
    levels: [
      { id: 1, score: 83, stars: 2, completed: true, timeSpent: "21m" },
      { id: 2, score: 0, stars: 0, completed: false, timeSpent: "0m" },
      { id: 3, score: 0, stars: 0, completed: false, timeSpent: "0m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 1,
    totalScore: 83
  },
  {
    id: 12,
    name: "Philosophy",
    icon: "Lightbulb",
    color: "from-yellow-500 to-amber-500",
    gradient: "bg-gradient-to-br from-yellow-500 to-amber-500",
    category: "Humanities",
    levels: [
      { id: 1, score: 0, stars: 0, completed: false, timeSpent: "0m" },
      { id: 2, score: 0, stars: 0, completed: false, timeSpent: "0m" },
      { id: 3, score: 0, stars: 0, completed: false, timeSpent: "0m" },
      { id: 4, score: 0, stars: 0, completed: false, timeSpent: "0m" }
    ],
    completedLevels: 0,
    totalScore: 0
  }
];