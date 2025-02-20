import { create } from "zustand";
import {
  getActivities,
  addActivity as dbAddActivity,
  subscribeToActivities,
} from "@/services/database";

export interface Activity {
  id: string;
  category: string;
  duration: number; // in minutes
  details?: string;
  timestamp: number;
}

export interface ActivitiesState {
  activities: Activity[];
  loadActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => Promise<void>;
  subscribeToUpdates: () => () => void;
}

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  activities: [],
  loadActivities: async () => {
    const activities = await getActivities();
    set({ activities });
  },
  addActivity: async (activity) => {
    const newActivity = await dbAddActivity(activity);
    set((state) => ({
      activities: [newActivity, ...state.activities],
    }));
  },
  subscribeToUpdates: () => {
    return subscribeToActivities((activities) => {
      set({ activities });
    });
  },
}));
