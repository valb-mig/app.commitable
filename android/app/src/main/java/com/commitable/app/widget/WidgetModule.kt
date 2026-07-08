package com.commitable.app.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.widget.RemoteViews
import com.commitable.app.R
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetModule"

    @ReactMethod
    fun updateWidget() {
        try {
            val context = reactApplicationContext
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, CommitGridWidget::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            if (appWidgetIds.isEmpty()) return

            val prefs = context.getSharedPreferences("habits", Context.MODE_PRIVATE)
            val commitsJson = prefs.getString("habit_commits", "{}") ?: "{}"
            val colorMid = prefs.getString("habit_color", "#39d353") ?: "#39d353"
            val habitName = prefs.getString("habit_name", "Habit") ?: "Habit"

            val gridBitmap = CommitGridWidget.buildBitmap(commitsJson, colorMid)

            for (id in appWidgetIds) {
                val views = RemoteViews(context.packageName, R.layout.widget_commit_grid)
                views.setTextViewText(R.id.widget_title, habitName)
                views.setImageViewBitmap(R.id.grid_image, gridBitmap)
                appWidgetManager.updateAppWidget(id, views)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
