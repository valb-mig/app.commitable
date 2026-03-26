package com.commitable.app.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.graphics.*
import android.widget.RemoteViews
import com.commitable.app.R
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class WidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetModule"

    @ReactMethod
    fun updateWidget() {
        try {
            val context = reactApplicationContext
            android.util.Log.d("WidgetDebug", "updateWidget called from React Native")
            
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, CommitGridWidget::class.java)
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            
            if (appWidgetIds.isEmpty()) {
                android.util.Log.d("WidgetDebug", "No widgets found")
                return
            }
            
            val prefs = context.getSharedPreferences("habits", Context.MODE_PRIVATE)
            val commitsJson = prefs.getString("habit_commits", "{}") ?: "{}"
            val colorMid = prefs.getString("habit_color", "#39d353") ?: "#39d353"
            val habitName = prefs.getString("habit_name", "Habit") ?: "Habit"
            
            android.util.Log.d("WidgetDebug", "Updating ${appWidgetIds.size} widgets")
            android.util.Log.d("WidgetDebug", "Data - Name: $habitName, Color: $colorMid")
            
            for (id in appWidgetIds) {
                val views = RemoteViews(context.packageName, R.layout.widget_commit_grid)
                views.setTextViewText(R.id.widget_title, habitName)
                
                val gridBitmap = createCommitGridBitmap(commitsJson, colorMid)
                views.setImageViewBitmap(R.id.grid_image, gridBitmap)
                
                appWidgetManager.updateAppWidget(id, views)
            }
        } catch (e: Exception) {
            android.util.Log.e("WidgetDebug", "Error updating widget: ${e.message}")
            e.printStackTrace()
        }
    }
    
    private fun createCommitGridBitmap(jsonStr: String, colorHex: String): Bitmap {
        val commits = try { JSONObject(jsonStr) } catch (e: Exception) { JSONObject() }
        
        val numWeeks = 20 
        val sqSize = 30f
        val gap = 6f
        val radius = 6f
        
        val width = (numWeeks * (sqSize + gap)).toInt()
        val height = (7 * (sqSize + gap)).toInt()
        
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        
        canvas.drawColor(Color.parseColor("#1c2128"))
        
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        val committedColor = try { Color.parseColor(colorHex) } catch (e: Exception) { Color.parseColor("#39d353") }
        val emptyColor = Color.parseColor("#2d333b")
        
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.WEEK_OF_YEAR, -(numWeeks - 1))
        calendar.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY)
        
        for (w in 0 until numWeeks) {
            for (d in 0 until 7) {
                val dateKey = sdf.format(calendar.time)
                val dayObj = commits.optJSONObject(dateKey)
                val isCommitted = dayObj?.optBoolean("committed") ?: false
                
                val left = w * (sqSize + gap)
                val top = d * (sqSize + gap)
                val rect = RectF(left, top, left + sqSize, top + sqSize)
                
                paint.color = if (isCommitted) committedColor else emptyColor
                canvas.drawRoundRect(rect, radius, radius, paint)
                
                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }
        }
        return bitmap
    }
}