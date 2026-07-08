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

    companion object {
        private const val NUM_WEEKS = 52
        private const val SQ_SIZE = 10f
        private const val SQ_GAP = 2f
        private const val SQ_RADIUS = 3f
        private const val BG_COLOR = "#1c2128"
        private const val EMPTY_COLOR = "#2d333b"
        private const val DEFAULT_COLOR = "#39d353"

        fun buildBitmap(jsonStr: String, colorHex: String): Bitmap {
            val commits = try { JSONObject(jsonStr) } catch (e: Exception) { JSONObject() }
            val committedColor = try { Color.parseColor(colorHex) } catch (e: Exception) { Color.parseColor(DEFAULT_COLOR) }
            val emptyColor = Color.parseColor(EMPTY_COLOR)

            val width = (NUM_WEEKS * (SQ_SIZE + SQ_GAP)).toInt()
            val height = (7 * (SQ_SIZE + SQ_GAP)).toInt()

            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(bitmap)
            canvas.drawColor(Color.parseColor(BG_COLOR))

            val paint = Paint(Paint.ANTI_ALIAS_FLAG)
            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)

            val calendar = Calendar.getInstance()
            calendar.add(Calendar.WEEK_OF_YEAR, -(NUM_WEEKS - 1))
            calendar.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY)

            for (w in 0 until NUM_WEEKS) {
                for (d in 0 until 7) {
                    val dateKey = sdf.format(calendar.time)
                    val dayObj = commits.optJSONObject(dateKey)
                    val isCommitted = dayObj?.optBoolean("committed") ?: false

                    val left = w * (SQ_SIZE + SQ_GAP)
                    val top = d * (SQ_SIZE + SQ_GAP)
                    val rect = RectF(left, top, left + SQ_SIZE, top + SQ_SIZE)

                    paint.color = if (isCommitted) committedColor else emptyColor
                    canvas.drawRoundRect(rect, SQ_RADIUS, SQ_RADIUS, paint)

                    calendar.add(Calendar.DAY_OF_YEAR, 1)
                }
            }
            return bitmap
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == "REFRESH_WIDGET") {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, CommitGridWidget::class.java)
            onUpdate(context, appWidgetManager, appWidgetManager.getAppWidgetIds(componentName))
        }
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val prefs = context.getSharedPreferences("habits", Context.MODE_PRIVATE)
        val commitsJson = prefs.getString("habit_commits", "{}") ?: "{}"
        val colorMid = prefs.getString("habit_color", DEFAULT_COLOR) ?: DEFAULT_COLOR
        val habitName = prefs.getString("habit_name", "Habit") ?: "Habit"

        val gridBitmap = buildBitmap(commitsJson, colorMid)

        for (id in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_commit_grid)
            views.setTextViewText(R.id.widget_title, habitName)
            views.setImageViewBitmap(R.id.grid_image, gridBitmap)
            setupRefreshButton(context, views)
            appWidgetManager.updateAppWidget(id, views)
        }
    }

    private fun setupRefreshButton(context: Context, views: RemoteViews) {
        val intent = Intent(context, CommitGridWidget::class.java).apply {
            action = "REFRESH_WIDGET"
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.refresh_button, pendingIntent)
    }
}
