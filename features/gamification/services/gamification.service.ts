import { Achievement, XPMilestone, UserStreak } from "../models/gamification";

export class GamificationService {
  /**
   * Awards XP to the user and checks for milestones.
   * @throws {Error} Not implemented
   */
  static async awardXP(userId: string, amount: number, source: string): Promise<{ newTotal: number, milestoneReached?: XPMilestone }> {
    throw new Error("Method not implemented.");
  }

  /**
   * Checks if any achievements were unlocked based on recent activity.
   * @throws {Error} Not implemented
   */
  static async checkAchievements(userId: string): Promise<Achievement[]> {
    throw new Error("Method not implemented.");
  }
  
  /**
   * Evaluates and updates the daily streak based on the current date.
   * @throws {Error} Not implemented
   */
  static async updateStreak(userId: string): Promise<UserStreak> {
    throw new Error("Method not implemented.");
  }
}
