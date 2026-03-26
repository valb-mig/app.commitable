package com.commitable.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.*
import android.widget.RemoteViews
import com.commitable.app.R
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class CommitGridWidget : AppWidgetProvider() {

    override fun onReceive(context: Context, intent: Intent) {
        android.util.Log.d("WidgetDebug", "onReceive called with action: ${intent.action}")
        super.onReceive(context, intent)
        when (intent.action) {
            "REFRESH_WIDGET" -> {
                android.util.Log.d("WidgetDebug", "REFRESH_WIDGET action received")
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val componentName = ComponentName(context, CommitGridWidget::class.java)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
                android.util.Log.d("WidgetDebug", "Found ${appWidgetIds.size} widgets to refresh")
                onUpdate(context, appWidgetManager, appWidgetIds)
            }
        }
    }

    override fun onEnabled(context: Context) {
        super.onEnabled(context)
        android.util.Log.d("WidgetDebug", "========== WIDGET ENABLED ==========")
        android.util.Log.d("WidgetDebug", "Widget was added to home screen")
    }

    override fun onDisabled(context: Context) {
        super.onDisabled(context)
        android.util.Log.d("WidgetDebug", "========== WIDGET DISABLED ==========")
        android.util.Log.d("WidgetDebug", "Widget was removed from home screen")
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        android.util.Log.d("WidgetDebug", "========== onUpdate CALLED ==========")
        android.util.Log.d("WidgetDebug", "Number of widgets to update: ${appWidgetIds.size}")
        
        for (id in appWidgetIds) {
            android.util.Log.d("WidgetDebug", "Updating widget ID: $id")
        }
        
        val prefs = context.getSharedPreferences("habits", Context.MODE_PRIVATE)
        val commitsJson = prefs.getString("habit_commits", "{}") ?: "{}"
        val colorMid = prefs.getString("habit_color", "#39d353") ?: "#39d353"
        val habitName = prefs.getString("habit_name", "Habit") ?: "Habit"

        android.util.Log.d("WidgetDebug", "Data loaded - Name: $habitName, Color: $colorMid")
        android.util.Log.d("WidgetDebug", "Commits JSON length: ${commitsJson.length}")
        android.util.Log.d("WidgetDebug", "Commits JSON preview: ${commitsJson.take(100)}")

        for (id in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_commit_grid)
            views.setTextViewText(R.id.widget_title, habitName)

            val gridBitmap = createCommitGridBitmap(commitsJson, colorMid)
            views.setImageViewBitmap(R.id.grid_image, gridBitmap)
            
            setupRefreshButton(context, views)

            appWidgetManager.updateAppWidget(id, views)
            android.util.Log.d("WidgetDebug", "Widget $id updated successfully")
        }
    }
    
    private fun setupRefreshButton(context: Context, views: RemoteViews) {
        val refreshIntent = Intent(context, CommitGridWidget::class.java).apply {
            action = "REFRESH_WIDGET"
        }
        val refreshPendingIntent = PendingIntent.getBroadcast(
            context, 
            0, 
            refreshIntent, 
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)
    }

    private fun createCommitGridBitmap(jsonStr: String, colorHex: String): Bitmap {
        android.util.Log.d("WidgetDebug", "Creating bitmap...")
        
        val commits = try { 
            JSONObject(jsonStr) 
        } catch (e: Exception) {
            android.util.Log.e("WidgetDebug", "Error parsing JSON: ${e.message}")
            JSONObject()
        }
        
        val numWeeks = 20 
        val sqSize = 30f
        val gap = 6f
        val radius = 6f
        
        val width = (numWeeks * (sqSize + gap)).toInt()
        val height = (7 * (sqSize + gap)).toInt()
        
        android.util.Log.d("WidgetDebug", "Bitmap dimensions: ${width}x${height}")
        
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        canvas.drawColor(Color.parseColor("#1c2128")) 

        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        val committedColor = try { 
            Color.parseColor(colorHex) 
        } catch (e: Exception) { 
            android.util.Log.e("WidgetDebug", "Error parsing color: ${e.message}")
            Color.parseColor("#39d353") 
        }
        val emptyColor = Color.parseColor("#2d333b")

        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.WEEK_OF_YEAR, -(numWeeks - 1))
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY)
        
        var commitCount = 0
        var totalDays = 0

        for (w in 0 until numWeeks) {
            for (d in 0 until 7) {
                val dateKey = sdf.format(calendar.time)
                totalDays++
                
                val dayObj = commits.optJSONObject(dateKey)
                val isCommitted = dayObj?.optBoolean("committed") ?: false
                
                if (isCommitted) commitCount++
                
                val left = w * (sqSize + gap)
                val top = d * (sqSize + gap)
                val rect = RectF(left, top, left + sqSize, top + sqSize)

                paint.color = if (isCommitted) committedColor else emptyColor
                canvas.drawRoundRect(rect, radius, radius, paint)
                
                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }
        }
        
        android.util.Log.d("WidgetDebug", "Total days drawn: $totalDays, Commits: $commitCount")
        
        return bitmap
    }
}