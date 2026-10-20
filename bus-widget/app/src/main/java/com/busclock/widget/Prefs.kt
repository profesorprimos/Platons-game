package com.busclock.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.time.DayOfWeek

data class Departure(
    val epochMillis: Long,
    val line: String,
    val headsign: String,
    val stopName: String,
)

/** All settings and the cached departures, kept in SharedPreferences. */
class Prefs(context: Context) {
    private val sp = context.getSharedPreferences("bus_widget", Context.MODE_PRIVATE)

    var apiKey: String
        get() = sp.getString("api_key", "")!!
        set(v) = sp.edit().putString("api_key", v.trim()).apply()

    /** The bus stop, as an address/place name or "lat,lng". */
    var stop: String
        get() = sp.getString("stop", "")!!
        set(v) = sp.edit().putString("stop", v.trim()).apply()

    /** Where the commute goes, so Maps picks buses heading the right way. */
    var destination: String
        get() = sp.getString("destination", "")!!
        set(v) = sp.edit().putString("destination", v.trim()).apply()

    /** Optional comma-separated bus lines to keep, e.g. "42, 42A". Empty keeps all. */
    var lineFilter: String
        get() = sp.getString("line_filter", "")!!
        set(v) = sp.edit().putString("line_filter", v.trim()).apply()

    /** Commute window, in minutes after midnight. */
    var startMinutes: Int
        get() = sp.getInt("start_minutes", 7 * 60 + 30)
        set(v) = sp.edit().putInt("start_minutes", v).apply()

    var endMinutes: Int
        get() = sp.getInt("end_minutes", 9 * 60)
        set(v) = sp.edit().putInt("end_minutes", v).apply()

    var days: Set<DayOfWeek>
        get() = sp.getStringSet("days", null)?.map { DayOfWeek.valueOf(it) }?.toSet()
            ?: setOf(
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY,
            )
        set(v) = sp.edit().putStringSet("days", v.map { it.name }.toSet()).apply()

    var lastUpdated: Long
        get() = sp.getLong("last_updated", 0)
        set(v) = sp.edit().putLong("last_updated", v).apply()

    var lastError: String?
        get() = sp.getString("last_error", null)
        set(v) = sp.edit().putString("last_error", v).apply()

    var departures: List<Departure>
        get() {
            val arr = JSONArray(sp.getString("departures", "[]"))
            return (0 until arr.length()).map {
                val o = arr.getJSONObject(it)
                Departure(o.getLong("t"), o.getString("line"), o.getString("headsign"), o.getString("stop"))
            }
        }
        set(v) {
            val arr = JSONArray()
            v.forEach {
                arr.put(
                    JSONObject().put("t", it.epochMillis).put("line", it.line)
                        .put("headsign", it.headsign).put("stop", it.stopName)
                )
            }
            sp.edit().putString("departures", arr.toString()).apply()
        }

    val isConfigured: Boolean
        get() = apiKey.isNotBlank() && stop.isNotBlank() && destination.isNotBlank()
}
