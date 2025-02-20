import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Text } from "react-native";
import { supabase } from "@/lib/supabase";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    async function testConnection() {
      try {
        console.log("Testing Supabase connection...");
        console.log("URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
        // Don't log the full key for security
        console.log(
          "ANON KEY exists:",
          !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
        );

        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .limit(1);

        if (error) {
          console.error("Database connection error:", error.message);
          console.error("Error details:", error);
        } else {
          console.log("Successfully connected to Supabase!");
          console.log("Test query result:", data);
        }
      } catch (error) {
        console.error("Test connection failed:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
        }
      }
    }

    testConnection();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
