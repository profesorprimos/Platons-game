package com.busclock.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale
import kotlin.concurrent.thread

class BusWidgetProvider : AppWidgetProvider() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            ACTION_REFRESH -> refreshAsync(context, force = false)
            ACTION_TAP -> refreshAsync(context, force = true)
            Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED -> refreshAsync(context, force = false)
            else -> super.onReceive(context, intent)
        }
    }

    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        refreshAsync(context, force = false)
    }

    override fun onDisabled(context: Context) {
        alarmManager(context).cancel(refreshIntent(context))
    }

    private fun refreshAsync(context: Context, force: Boolean) {
        val pending = goAsync()
        thread {
            try {
                refresh(context.applicationContext, force)
            } finally {
                pending.finish()
            }
        }
    }

    companion object {
        const val ACTION_REFRESH = "com.busclock.widget.REFRESH"
        const val ACTION_TAP = "com.busclock.widget.TAP"

        /** How often to re-ask Google Maps during the commute window. */
        private const val REFRESH_INTERVAL_MS = 3 * 60_000L

        /** Don't re-fetch on automatic updates more often than this. */
        private const val MIN_FETCH_GAP_MS = 60_000L

        /** Show data fetched outside the window (by tapping) for this long. */
        private const val MANUAL_DATA_TTL_MS = 15 * 60_000L

        private val CLOCK = DateTimeFormatter.ofPattern("HH:mm")

        /** Ask any widgets to refresh, e.g. after the settings change. */
        fun requestRefresh(context: Context) {
            context.sendBroadcast(
                Intent(context, BusWidgetProvider::class.java).setAction(ACTION_TAP)
            )
        }

        /** Fetch if needed, redraw every widget and schedule the next update. Runs off the main thread. */
        fun refresh(context: Context, force: Boolean) {
            val prefs = Prefs(context)
            val now = System.currentTimeMillis()
            val active = prefs.isConfigured && CommuteWindow.isActive(prefs, now)

            if (prefs.isConfigured && (force || (active && now - prefs.lastUpdated > MIN_FETCH_GAP_MS))) {
                try {
                    prefs.departures = RoutesClient.fetchDepartures(prefs, now)
                    prefs.lastError = null
                } catch (e: Exception) {
                    prefs.lastError = e.message ?: e.javaClass.simpleName
                }
                prefs.lastUpdated = now
            }

            render(context, prefs, active, now)
            scheduleNext(context, prefs, active, now)
        }

        private fun render(context: Context, prefs: Prefs, active: Boolean, now: Long) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, BusWidgetProvider::class.java))
            if (ids.isEmpty()) return
            val views = buildViews(context, prefs, active, now)
            manager.updateAppWidget(ids, views)
        }

        private fun buildViews(context: Context, prefs: Prefs, active: Boolean, now: Long): RemoteViews {
            val views = RemoteViews(context.packageName, R.layout.widget_bus)
            val zone = ZoneId.systemDefault()

            views.setOnClickPendingIntent(R.id.widget_root, tapIntent(context))
            views.setOnClickPendingIntent(R.id.settings_button, settingsIntent(context))

            val upcoming = prefs.departures.filter { it.epochMillis > now }
            val fresh = active || now - prefs.lastUpdated < MANUAL_DATA_TTL_MS
            val next = upcoming.firstOrNull()?.takeIf { prefs.isConfigured && fresh }

            if (next == null) {
                views.setViewVisibility(R.id.countdown_group, View.GONE)
                views.setViewVisibility(R.id.idle_text, View.VISIBLE)
                views.setTextViewText(R.id.stop_name, prefs.stop.ifBlank { context.getString(R.string.app_name) })
                views.setTextViewText(R.id.line_text, "")
                views.setTextViewText(R.id.idle_text, idleMessage(context, prefs, active, now))
                views.setTextViewText(R.id.status_text, prefs.lastError?.let { "⚠ $it" } ?: "")
                return views
            }

            views.setViewVisibility(R.id.countdown_group, View.VISIBLE)
            views.setViewVisibility(R.id.idle_text, View.GONE)
            views.setTextViewText(R.id.stop_name, next.stopName.ifBlank { prefs.stop })
            views.setTextViewText(
                R.id.line_text,
                listOf(next.line, next.headsign).filter { it.isNotBlank() }.joinToString(" → ")
            )

            // The Chronometer ticks down on its own, so the countdown stays live between fetches.
            val base = SystemClock.elapsedRealtime() + (next.epochMillis - now)
            views.setChronometer(R.id.countdown, base, null, true)
            views.setChronometerCountDown(R.id.countdown, true)

            val leaves = Instant.ofEpochMilli(next.epochMillis).atZone(zone).format(CLOCK)
            val after = upcoming.getOrNull(1)?.let {
                " · then " + Instant.ofEpochMilli(it.epochMillis).atZone(zone).format(CLOCK)
            } ?: ""
            val updated = Instant.ofEpochMilli(prefs.lastUpdated).atZone(zone).format(CLOCK)
            val error = prefs.lastError?.let { " · ⚠ offline" } ?: ""
            views.setTextViewText(R.id.status_text, "Leaves $leaves$after\nUpdated $updated$error")
            return views
        }

        private fun idleMessage(context: Context, prefs: Prefs, active: Boolean, now: Long): String {
            if (!prefs.isConfigured) return context.getString(R.string.widget_setup)
            if (active) return context.getString(R.string.widget_no_buses)
            val start = CommuteWindow.nextStart(prefs, now)
                ?: return context.getString(R.string.widget_no_days)
            val today = Instant.ofEpochMilli(now).atZone(start.zone).toLocalDate()
            val day = when (start.toLocalDate()) {
                today -> "today"
                today.plusDays(1) -> "tomorrow"
                else -> start.dayOfWeek.getDisplayName(TextStyle.FULL, Locale.getDefault())
            }
            return "Next commute $day at ${start.format(CLOCK)}\nTap to check now"
        }

        private fun scheduleNext(context: Context, prefs: Prefs, active: Boolean, now: Long) {
            val am = alarmManager(context)
            val pi = refreshIntent(context)
            if (!prefs.isConfigured) {
                am.cancel(pi)
                return
            }
            val nextBus = prefs.departures.firstOrNull { it.epochMillis > now }?.epochMillis
            val at = if (active) {
                // Re-check regularly, and right after the bus leaves so the next one shows.
                minOf(now + REFRESH_INTERVAL_MS, (nextBus ?: Long.MAX_VALUE) + 5_000)
            } else {
                val start = CommuteWindow.nextStart(prefs, now)?.toInstant()?.toEpochMilli()
                // Outside the window, also clear manually fetched data once it goes stale.
                val staleAt = if (nextBus != null) minOf(nextBus + 5_000, prefs.lastUpdated + MANUAL_DATA_TTL_MS) else null
                listOfNotNull(start, staleAt?.takeIf { it > now }).minOrNull()
            }
            if (at == null) am.cancel(pi) else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }

        private fun alarmManager(context: Context) =
            context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        private fun refreshIntent(context: Context): PendingIntent = PendingIntent.getBroadcast(
            context, 0,
            Intent(context, BusWidgetProvider::class.java).setAction(ACTION_REFRESH),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        private fun tapIntent(context: Context): PendingIntent = PendingIntent.getBroadcast(
            context, 1,
            Intent(context, BusWidgetProvider::class.java).setAction(ACTION_TAP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        private fun settingsIntent(context: Context): PendingIntent = PendingIntent.getActivity(
            context, 2,
            Intent(context, SettingsActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }
}
