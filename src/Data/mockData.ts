import type {  User, Badge } from "../types"

export const ALL_BADGES: Badge[] = [
  { id: "b1", level: "brons",   name: "Brons",   requiredMissions: 5,   icon: "🥉" },
  { id: "b2", level: "silver",  name: "Silver",  requiredMissions: 10,  icon: "🥈" },
  { id: "b3", level: "guld",    name: "Guld",    requiredMissions: 15,  icon: "🥇" },
  { id: "b4", level: "diamant", name: "Diamant", requiredMissions: 30,  icon: "💎" },
  { id: "b5", level: "stjärna", name: "Stjärna", requiredMissions: 50,  icon: "⭐" },
  { id: "b6", level: "legend",  name: "Legend",  requiredMissions: 100, icon: "🏆" },
]

export const CURRENT_USER: User = {
  id: "u_me",
  name: "Alex Lindström",
  initials: "AL",
  city: "Stockholm",
  completedMissions: 7,
  totalPoints: 340,
  rating: 4.8,
  currentLevel: "silver",
  hoursHelped: 12,
  badges: [
    { ...ALL_BADGES[0], earnedAt: "2025-03-20" },
    { ...ALL_BADGES[1], earnedAt: "2025-04-05" },
  ],
}

export const LEADERBOARD = [
  { rank: 1,  name: "Sara K.",   initials: "SK", color: "#1D9E75", pts: 1240, weekPts: 280, badge: "🏆", missions: 98 },
  { rank: 2,  name: "Marcus T.", initials: "MT", color: "#D85A30", pts: 1080, weekPts: 210, badge: "⭐", missions: 82 },
  { rank: 3,  name: "Fatima A.", initials: "FA", color: "#EF9F27", pts: 960,  weekPts: 195, badge: "⭐", missions: 74 },
  { rank: 4,  name: "Johan L.",  initials: "JL", color: "#178BDD", pts: 820,  weekPts: 160, badge: "💎", missions: 62 },
  { rank: 5,  name: "Aisha N.",  initials: "AN", color: "#D4537E", pts: 750,  weekPts: 145, badge: "💎", missions: 55 },
  { rank: 6,  name: "Erik S.",   initials: "ES", color: "#639922", pts: 680,  weekPts: 130, badge: "💎", missions: 48 },
  { rank: 7,  name: "Mia B.",    initials: "MB", color: "#7F77DD", pts: 590,  weekPts: 110, badge: "🥇", missions: 38 },
  { rank: 8,  name: "David R.",  initials: "DR", color: "#1D9E75", pts: 510,  weekPts: 95,  badge: "🥇", missions: 32 },
  { rank: 9,  name: "Lena H.",   initials: "LH", color: "#D85A30", pts: 430,  weekPts: 80,  badge: "🥇", missions: 26 },
  { rank: 10, name: "Alex L.",   initials: "AL", color: "#1D9E75", pts: 340,  weekPts: 60,  badge: "🥈", missions: 7, isMe: true },
]