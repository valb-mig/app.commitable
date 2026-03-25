import { NativeModules, Platform } from "react-native";

export function updateWidget(name: string, streak: number) {
  if (Platform.OS === "android") {
    NativeModules.HabitWidget.updateWidget(name, streak);
  }

  if (Platform.OS === "ios") {
    NativeModules.HabitWidget.updateWidget(name, streak);
  }
}