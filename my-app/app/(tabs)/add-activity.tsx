import { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useActivitiesStore } from "@/store/activities";
import { Dropdown } from "react-native-element-dropdown";

const CATEGORIES = [
  { label: "Work", value: "Work" },
  { label: "Exercise", value: "Exercise" },
  { label: "Sleep", value: "Sleep" },
  { label: "Social", value: "Social" },
  { label: "Entertainment", value: "Entertainment" },
  { label: "Study", value: "Study" },
  { label: "Other", value: "Other" },
];

const AddActivityScreen = () => {
  const addActivity = useActivitiesStore((state) => state.addActivity);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [details, setDetails] = useState("");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [startTime, setStartTime] = useState(new Date());

  const handleSave = () => {
    if (!selectedCategory) return;

    const totalMinutes = hours * 60 + minutes;
    const timestamp = startTime.getTime();

    addActivity({
      category: selectedCategory,
      duration: totalMinutes,
      details: details.trim(),
      timestamp,
    });

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.form}>
        <ThemedText type="title" style={styles.title}>
          Add New Activity
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Details
        </ThemedText>

        <TextInput
          style={styles.detailsInput}
          multiline
          numberOfLines={4}
          placeholder="Add any additional details..."
          placeholderTextColor="#999"
          value={details}
          onChangeText={setDetails}
        />

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Category
        </ThemedText>

        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          data={CATEGORIES}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select a category"
          value={selectedCategory}
          onChange={(item) => setSelectedCategory(item.value)}
        />

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Start Time
        </ThemedText>

        <View style={styles.timePickerGroup}>
          <View style={styles.timePickerContainer}>
            <Picker
              selectedValue={startTime.getHours()}
              onValueChange={(value: number) => {
                const newTime = new Date(startTime);
                newTime.setHours(value);
                setStartTime(newTime);
              }}
              style={styles.timePicker}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <Picker.Item
                  key={i}
                  label={i.toString().padStart(2, "0")}
                  value={i}
                  color="#333"
                />
              ))}
            </Picker>
          </View>
          <ThemedText style={styles.timeColon}>:</ThemedText>
          <View style={styles.timePickerContainer}>
            <Picker
              selectedValue={startTime.getMinutes()}
              onValueChange={(value: number) => {
                const newTime = new Date(startTime);
                newTime.setMinutes(value);
                setStartTime(newTime);
              }}
              style={styles.timePicker}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <Picker.Item
                  key={i}
                  label={i.toString().padStart(2, "0")}
                  value={i}
                  color="#333"
                />
              ))}
            </Picker>
          </View>
        </View>

        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Duration
        </ThemedText>

        <View style={styles.durationPickers}>
          <View style={styles.durationPickerContainer}>
            <ThemedText style={styles.durationLabel}>Hours</ThemedText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={hours}
                onValueChange={(value: number) => setHours(value)}
                style={styles.durationPicker}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item key={i} label={`${i}`} value={i} color="#333" />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.durationPickerContainer}>
            <ThemedText style={styles.durationLabel}>Minutes</ThemedText>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={minutes}
                onValueChange={(value: number) => setMinutes(value)}
                style={styles.durationPicker}
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <Picker.Item key={i} label={`${i}`} value={i} color="#333" />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.saveButton,
            !selectedCategory && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!selectedCategory}
        >
          <ThemedText style={styles.saveButtonText}>Save Activity</ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  detailsInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
    color: "#333",
  },
  timePickerGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 4,
  },
  timePickerContainer: {
    width: 60,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  timePicker: {
    width: 60,
    height: 120,
    backgroundColor: "#fff",
  },
  timeColon: {
    fontSize: 24,
    color: "#333",
    marginHorizontal: 4,
  },
  durationPickers: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  durationPickerContainer: {
    alignItems: "center",
  },
  durationLabel: {
    color: "#666",
    marginBottom: 8,
  },
  pickerWrapper: {
    width: 80,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  durationPicker: {
    width: 80,
    height: 120,
    backgroundColor: "#fff",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  dropdownPlaceholder: {
    color: "#999",
    fontSize: 14,
  },
  dropdownSelectedText: {
    color: "#333",
    fontSize: 14,
  },
});

export default AddActivityScreen;
