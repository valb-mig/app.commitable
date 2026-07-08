<div align="center">

# 📝 Commitable

![React Native](https://img.shields.io/badge/React_Native-0.74.5-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-51.0.39-000020?style=flat-square&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-1.9.0-7F52FF?style=flat-square&logo=kotlin&logoColor=white)
![Android](https://img.shields.io/badge/Android-API_34-3DDC84?style=flat-square&logo=android&logoColor=white)

> Mobile habit tracker with a GitHub-style contribution grid, daily reminders, external connector support, and a native Android home screen widget.

</div>

---

## ✨ Features

- **Contribution grid** — visualize your habits year-round exactly like GitHub's activity graph
- **Custom colors** — 8 color options per habit, reflected in the grid and widget
- **Daily reminders** — local push notifications with configurable hour and minute per habit
- **External connectors** — sync commits from any HTTP endpoint that returns the JSON contract
- **Android widget** — native home screen widget showing a 52-week grid for the selected habit
- **Local persistence** — all data stored on-device via AsyncStorage
- **Streak & stats** — current streak, best streak, 30-day completion rate, and total commits

## 🚀 Tech Stack

| Technology | Role |
|-----------|------|
| React Native + Expo | Main framework |
| TypeScript | Static typing |
| AsyncStorage | Local data persistence |
| expo-notifications | Local push notifications |
| react-native-shared-preferences | React Native ↔ Android widget bridge |
| Kotlin | Native Android widget (AppWidgetProvider) |
| react-native-svg | SVG-based contribution grid rendering |

## 📦 Getting Started

```bash
# Clone
git clone https://github.com/valb-mig/app.commitable.git
cd app.commitable

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on Android (with device/emulator connected)
npx expo run:android
```

> **Note:** The Android widget requires a native build (`expo run:android`). It will not appear in Expo Go.

## 🔌 Connector API Contract

Habits can pull commits from an external HTTP endpoint. The URL must return the following JSON:

```json
{
  "days": {
    "2025-06-01": { "committed": true, "message": "optional note" },
    "2025-06-02": { "committed": false },
    "2025-06-03": { "committed": true }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `days` | `object` | Keys are ISO dates (`YYYY-MM-DD`), values are day objects |
| `days[date].committed` | `boolean` | Whether that day counts as committed |
| `days[date].message` | `string?` | Optional commit note |

Commits from the connector are **merged** with existing local commits — existing messages are preserved unless the connector provides a new one.

To trigger a sync, open the habit's detail view and tap **sync connector**.

## 🤖 Android Widget

The widget displays a 52-week contribution grid for the habit that was last viewed or committed.

**Setup:**
1. Build and install the app: `npx expo run:android`
2. Long-press your home screen → Widgets → Commitable
3. Tap the refresh button (↻) on the widget to force an update

The widget reads from SharedPreferences. It updates automatically every time the app writes a commit.

## 🔔 Notifications

During habit creation (step 4 — "lembrete diário"), you can enable a daily reminder:
- Toggle on/off
- Pick an hour (0–23) and minute (00, 15, 30, 45)
- Permissions are requested on first enable

Notifications are cancelled automatically when a habit is deleted.

## 🗂 Project Structure

```
src/
├── components/
│   ├── CommitGrid.tsx     # SVG contribution grid
│   ├── CommitList.tsx     # Recent commits log
│   ├── CommitModal.tsx    # Day edit bottom sheet
│   └── HabitCard.tsx      # Habit card with mini grid
├── hooks/
│   └── useHabits.ts       # Central state + AsyncStorage + widget sync
├── screens/
│   ├── HomeScreen.tsx     # Main view (all habits / filtered view)
│   └── CreateHabitScreen.tsx  # 4-step habit creation/edit
├── services/
│   ├── notifications.ts   # expo-notifications helpers
│   └── widget.ts          # Android widget bridge
├── utils/
│   ├── date.ts            # Date helpers and week generation
│   ├── stats.ts           # Streak and completion rate calculations
│   └── theme.ts           # Colors and font constants
└── types.ts               # Shared TypeScript types
```

## 🛣 Roadmap

See [PLAN.md](./PLAN.md) for the full roadmap including upcoming features and known issues tracked as [GitHub Issues](https://github.com/valb-mig/app.commitable/issues).

## 📄 License

[MIT](./LICENSE.md)
