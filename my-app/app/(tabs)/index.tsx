import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  Activity,
  ActivitiesState,
  useActivitiesStore,
} from "@/store/activities";
import { addActivity } from "@/services/database";
import { supabase } from "@/lib/supabase";

// Sample color scheme for categories
const categoryColors = {
  Work: "#FF6B6B",
  Exercise: "#4ECDC4",
  Sleep: "#45B7D1",
  Social: "#96CEB4",
  Entertainment: "#FFEEAD",
  Study: "#D4A5A5",
  Other: "#9FA8DA",
};

interface TimeSlot {
  startMinute: number;
  duration: number;
  category: string;
}

const MINUTES_IN_DAY = 24 * 60; // 1440 minutes

// Add this interface near the top of the file
interface SupabaseActivity {
  id: string;
  category: string;
  duration: number;
  details?: string;
  timestamp: number;
}

const HomeScreen = () => {
  const { activities, loadActivities, subscribeToUpdates } =
    useActivitiesStore();

  useEffect(() => {
    loadActivities();
    const unsubscribe = subscribeToUpdates();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function testAddActivity() {
      try {
        const testActivity = {
          category: "Test",
          duration: 30,
          details: "Test activity",
        };

        const result = await addActivity(testActivity);
        console.log("Successfully added test activity:", result);
      } catch (error) {
        console.error("Failed to add test activity:", error);
      }
    }

    // Uncomment this to test adding an activity
    // testAddActivity();
  }, []);

  // Add this to see raw data
  useEffect(() => {
    async function fetchAndLogData() {
      try {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .order("timestamp", { ascending: false });

        if (error) {
          console.error("Error fetching data:", error);
        } else {
          console.log("All activities:", data);
          // Format the timestamps to be more readable
          const formattedData = data.map((activity: SupabaseActivity) => ({
            ...activity,
            formattedTime: new Date(activity.timestamp).toLocaleString(),
          }));
          console.log("Formatted activities:", formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchAndLogData();
  }, []);

  // Convert timestamp to minutes since start of day
  const getMinuteOfDay = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.getHours() * 60 + date.getMinutes();
  };

  // Filter and prepare today's activities
  const todayActivities = activities
    .filter((activity: Activity) => {
      const activityDate = new Date(activity.timestamp);
      const today = new Date();
      return (
        activityDate.getDate() === today.getDate() &&
        activityDate.getMonth() === today.getMonth() &&
        activityDate.getFullYear() === today.getFullYear()
      );
    })
    .map(
      (activity): TimeSlot => ({
        startMinute: getMinuteOfDay(activity.timestamp),
        duration: activity.duration,
        category: activity.category,
      })
    )
    .sort((a, b) => a.startMinute - b.startMinute);

  // Create pie chart data including empty spaces
  const pieData: Array<{
    value: number;
    color: string;
    text?: string;
    category?: string;
  }> = [];

  let currentMinute = 0;

  todayActivities.forEach((activity) => {
    // Add empty space before activity if needed
    if (activity.startMinute > currentMinute) {
      pieData.push({
        value: activity.startMinute - currentMinute,
        color: "#f0f0f0", // Light gray for empty time
      });
    }

    // Add the activity
    pieData.push({
      value: activity.duration,
      color:
        categoryColors[activity.category as keyof typeof categoryColors] ||
        "#4A90E2",
      text: `${Math.floor(activity.duration / 60)}h ${activity.duration % 60}m`,
      category: activity.category,
    });

    currentMinute = activity.startMinute + activity.duration;
  });

  // Add remaining empty time if any
  if (currentMinute < MINUTES_IN_DAY) {
    pieData.push({
      value: MINUTES_IN_DAY - currentMinute,
      color: "#f0f0f0",
    });
  }

  // Calculate total tracked time
  const totalTrackedMinutes = todayActivities.reduce(
    (sum, activity) => sum + activity.duration,
    0
  );
  const totalTrackedHours = Math.floor(totalTrackedMinutes / 60);
  const remainingTrackedMinutes = totalTrackedMinutes % 60;

  // Group activities by category for legend
  const categoryTotals = todayActivities.reduce(
    (acc: { [key: string]: number }, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = 0;
      }
      acc[activity.category] += activity.duration;
      return acc;
    },
    {}
  );

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Today's Activities
      </ThemedText>

      <View style={styles.chartContainer}>
        <PieChart
          data={pieData}
          donut
          showText
          textColor="white"
          radius={140}
          innerRadius={90}
          textSize={12}
          centerLabelComponent={() => (
            <View style={styles.centerStats}>
              <ThemedText style={styles.centerLabel}>Tracked Time</ThemedText>
              <ThemedText style={styles.centerValue}>
                {`${totalTrackedHours}h ${remainingTrackedMinutes}m`}
              </ThemedText>
            </View>
          )}
        />
      </View>

      <View style={styles.legend}>
        {Object.entries(categoryTotals).map(([category, duration]) => (
          <View key={category} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                {
                  backgroundColor:
                    categoryColors[category as keyof typeof categoryColors] ||
                    "#4A90E2",
                },
              ]}
            />
            <ThemedText style={styles.legendText}>{category}</ThemedText>
            <ThemedText style={styles.legendDuration}>
              {`${Math.floor(duration / 60)}h ${duration % 60}m`}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    marginVertical: 16,
    color: "#333",
    fontSize: 24,
    fontWeight: "600",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  centerStats: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    color: "#666",
    fontSize: 14,
  },
  centerValue: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
  },
  legend: {
    marginTop: 20,
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    flex: 1,
    color: "#333",
  },
  legendDuration: {
    color: "#666",
    fontWeight: "500",
  },
});
