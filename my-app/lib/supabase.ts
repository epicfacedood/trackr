import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Use the values directly instead of process.env
const supabaseUrl = "https://renttaxuvekbuacitual.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbnR0YXh1dmVrYnVhY2l0dWFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwNDE1NjcsImV4cCI6MjA1NTYxNzU2N30.iVu3SoqwAUicpxHVuuU5fNaL4_ovLC8vBUCAurRIUBk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
