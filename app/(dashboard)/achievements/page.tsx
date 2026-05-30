import { getProfile } from "@/app/actions/profile";
import { getUserAchievements } from "@/app/actions/gamification";
import AchievementsClient from "./achievements-client";

export const dynamic = 'force-dynamic';

export default async function AchievementsPage() {
  const profile = await getProfile();
  const userAchievements = await getUserAchievements();
  const unlockedKeys = userAchievements.map((ua: any) => ua.achievement_key);

  return (
    <AchievementsClient 
      profile={profile} 
      unlockedKeys={unlockedKeys} 
      userAchievements={userAchievements} 
    />
  );
}
