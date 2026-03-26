import React, { useCallback, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";

import HomeScreen from "./src/screens/HomeScreen";
import CreateHabitScreen from "./src/screens/CreateHabitScreen";
import { useHabits } from "./src/hooks/useHabits";
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

  const { habits, loading, addHabit, updateHabit, deleteHabit, commitDay, uncommitDay } =
    useHabits();

  const [screen, setScreen] = useState<Screen>("home");
  const [editTarget, setEditTarget] = useState<Habit | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && !loading) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
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
            commitDay={commitDay}
            uncommitDay={uncommitDay}
            onNavigateCreate={() => navigateTo("create", null)}
            onNavigateEdit={(habit) => navigateTo("edit", habit)}
            onNavigateBack={navigateBack}
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
