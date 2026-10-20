package com.busclock.widget

import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

/** The daily time window when the widget tracks the bus. */
object CommuteWindow {

    fun isActive(prefs: Prefs, nowMillis: Long, zone: ZoneId = ZoneId.systemDefault()): Boolean {
        val now = Instant.ofEpochMilli(nowMillis).atZone(zone)
        if (now.dayOfWeek !in prefs.days) return false
        val minutes = now.hour * 60 + now.minute
        return minutes >= prefs.startMinutes && minutes < prefs.endMinutes
    }

    /** The start of the next window after now, or null if no days are selected. */
    fun nextStart(prefs: Prefs, nowMillis: Long, zone: ZoneId = ZoneId.systemDefault()): ZonedDateTime? {
        val days = prefs.days
        if (days.isEmpty()) return null
        val now = Instant.ofEpochMilli(nowMillis).atZone(zone)
        for (offset in 0..7L) {
            val day = now.toLocalDate().plusDays(offset)
            if (day.dayOfWeek !in days) continue
            val start = day.atStartOfDay(zone).plusMinutes(prefs.startMinutes.toLong())
            if (start.isAfter(now)) return start
        }
        return null
    }

    fun format(minutes: Int): String = "%02d:%02d".format(minutes / 60, minutes % 60)
}
