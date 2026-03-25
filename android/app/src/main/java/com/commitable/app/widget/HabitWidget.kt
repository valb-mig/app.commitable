package com.commitable.app.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.commitable.app.R

class HabitWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (id in appWidgetIds) {
            val prefs = context.getSharedPreferences("habits", Context.MODE_PRIVATE)

            val name = prefs.getString("habit_name", "Habit")
            val streak = prefs.getInt("habit_streak", 0)

            val views = RemoteViews(context.packageName, R.layout.widget_habit)

            views.setTextViewText(R.id.title, name)
            views.setTextViewText(R.id.streak, "Streak: $streak")

            appWidgetManager.updateAppWidget(id, views)
        }
    }
}
