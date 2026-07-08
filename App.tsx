import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  View,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

import HomeScreen from "./src/screens/HomeScreen";
import CreateHabitScreen from "./src/screens/CreateHabitScreen";
import { useHabits } from "./src/hooks/useHabits";
import { setupNotificationCategory, COMMIT_ACTION_ID } from "./src/services/notifications";
import { today, toKey } from "./src/utils/date";
import { COLORS } from "./src/utils/theme";
import type { Habit, Screen } from "./src/types";

SplashScreen.preventAutoHideAsync();

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function App() {
  const [fontsLoaded] = useFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  const {
    habits,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    commitDay,
    uncommitDay,
    syncConnector,
    pinWidgetHabit,
    exportHabits,
    importHabits,
  } = useHabits();

  const [screen, setScreen] = useState<Screen>("home");
  const [editTarget, setEditTarget] = useState<Habit | null>(null);
  const [filterId, setFilterId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Lift habit selection so notifications can also drive it
  const selectHabit = useCallback((id: string | null) => {
    setFilterId(id);
    pinWidgetHabit(id);
  }, [pinWidgetHabit]);

  // Notification: deep link + commit action
  useEffect(() => {
    setupNotificationCategory();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const habitId = response.notification.request.content.data?.habitId as string | undefined;
      if (!habitId) return;

      if (response.actionIdentifier === COMMIT_ACTION_ID) {
        commitDay(habitId, toKey(today()), "");
      } else {
        selectHabit(habitId);
      }
    });

    return () => sub.remove();
  }, [commitDay, selectHabit]);

  const navigateTo = (s: Screen, habit?: Habit | null) => {
    setEditTarget(habit ?? null);
    setScreen(s);
    slideAnim.setValue(SCREEN_WIDTH);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const navigateBack = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setScreen("home");
      setEditTarget(null);
    });
  };

  const handleBackup = () => {
    Alert.alert("Backup", "What do you want to do?", [
      {
        text: "Export JSON",
        onPress: () => exportHabits().catch(() => Alert.alert("Error", "Could not export habits.")),
      },
      {
        text: "Import JSON",
        onPress: async () => {
          const result = await importHabits();
          if (result === "ok") Alert.alert("Done", "Habits imported successfully.");
          else if (result === "invalid") Alert.alert("Error", "Invalid file format.");
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !loading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={COLORS.textMuted} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={{ flex: 1 }}>
          <HomeScreen
            habits={habits}
            filterId={filterId}
            onSelectHabit={selectHabit}
            commitDay={commitDay}
            uncommitDay={uncommitDay}
            deleteHabit={deleteHabit}
            syncConnector={syncConnector}
            onBackup={handleBackup}
            onNavigateCreate={() => navigateTo("create", null)}
            onNavigateEdit={(habit) => navigateTo("edit", habit)}
          />
        </View>

        {(screen === "create" || screen === "edit") && (
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: COLORS.bg,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <CreateHabitScreen
              editHabit={editTarget}
              addHabit={addHabit}
              updateHabit={updateHabit}
              deleteHabit={deleteHabit}
              onBack={navigateBack}
            />
          </Animated.View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}
