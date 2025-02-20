import { supabase } from "@/lib/supabase";
import { Activity } from "@/store/activities";

export const addActivity = async (
  activity: Omit<Activity, "id" | "timestamp">
): Promise<Activity> => {
  const timestamp = Date.now();

  const { data, error } = await supabase
    .from("activities")
    .insert([
      {
        category: activity.category,
        duration: activity.duration,
        details: activity.details,
        timestamp,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
};

export const getActivities = async (): Promise<Activity[]> => {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data as Activity[];
};

export const getTodayActivities = async (): Promise<Activity[]> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .gte("timestamp", startOfDay.getTime())
    .lte("timestamp", endOfDay.getTime())
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return data as Activity[];
};

export const subscribeToActivities = (
  callback: (activities: Activity[]) => void
) => {
  const subscription = supabase
    .channel("activities")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "activities",
      },
      async () => {
        // Fetch updated data when changes occur
        const activities = await getActivities();
        callback(activities);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
