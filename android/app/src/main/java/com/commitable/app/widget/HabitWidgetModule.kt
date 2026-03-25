package com.commitable.app.widget

import com.facebook.react.bridge.*

class HabitWidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "HabitWidget"

    @ReactMethod
    fun updateWidget(name: String, streak: Int) {
        val prefs = reactApplicationContext.getSharedPreferences("habits", 0)

        prefs.edit()
            .putString("habit_name", name)
            .putInt("habit_streak", streak)
            .apply()
    }
}
