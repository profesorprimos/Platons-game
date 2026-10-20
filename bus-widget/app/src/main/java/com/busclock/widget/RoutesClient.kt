package com.busclock.widget

import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.time.Instant
import java.time.OffsetDateTime

/**
 * Asks the Google Maps Routes API for bus journeys from the stop to the
 * destination, and returns the departure of the first bus in each one. These
 * are the same departure times the Google Maps app shows, including live
 * times where the transit agency provides them.
 */
object RoutesClient {
    private const val URL_COMPUTE_ROUTES = "https://routes.googleapis.com/directions/v2:computeRoutes"
    private val LAT_LNG = Regex("""^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$""")

    @Throws(IOException::class)
    fun fetchDepartures(prefs: Prefs, nowMillis: Long = System.currentTimeMillis()): List<Departure> {
        val found = request(prefs, Instant.ofEpochMilli(nowMillis)).toMutableList()
        // One more query just after the first bus, so we also know the one after it.
        val first = found.filter { it.epochMillis > nowMillis }.minByOrNull { it.epochMillis }
        if (first != null && found.count { it.epochMillis > nowMillis } < 2) {
            found += request(prefs, Instant.ofEpochMilli(first.epochMillis + 60_000))
        }
        return found
            .filter { it.epochMillis > nowMillis - 30_000 }
            .distinctBy { it.epochMillis / 60_000 to it.line }
            .sortedBy { it.epochMillis }
            .take(5)
    }

    private fun request(prefs: Prefs, departAt: Instant): List<Departure> {
        val body = JSONObject()
            .put("origin", waypoint(prefs.stop))
            .put("destination", waypoint(prefs.destination))
            .put("travelMode", "TRANSIT")
            .put("computeAlternativeRoutes", true)
            .put("departureTime", departAt.toString())
            .put("transitPreferences", JSONObject().put("allowedTravelModes", JSONArray().put("BUS")))

        val conn = URL(URL_COMPUTE_ROUTES).openConnection() as HttpURLConnection
        try {
            conn.requestMethod = "POST"
            conn.connectTimeout = 10_000
            conn.readTimeout = 10_000
            conn.doOutput = true
            conn.setRequestProperty("Content-Type", "application/json")
            conn.setRequestProperty("X-Goog-Api-Key", prefs.apiKey)
            conn.setRequestProperty("X-Goog-FieldMask", "routes.legs.steps.transitDetails")
            conn.outputStream.use { it.write(body.toString().toByteArray()) }

            val code = conn.responseCode
            val text = (if (code in 200..299) conn.inputStream else conn.errorStream)
                ?.bufferedReader()?.use { it.readText() }.orEmpty()
            if (code !in 200..299) {
                val message = runCatching {
                    JSONObject(text).getJSONObject("error").getString("message")
                }.getOrDefault("HTTP $code")
                throw IOException(message)
            }
            return parse(JSONObject(text), lineFilters(prefs.lineFilter))
        } finally {
            conn.disconnect()
        }
    }

    private fun parse(json: JSONObject, lines: Set<String>): List<Departure> {
        val routes = json.optJSONArray("routes") ?: return emptyList()
        val result = mutableListOf<Departure>()
        for (r in 0 until routes.length()) {
            val firstBus = firstTransitStep(routes.getJSONObject(r)) ?: continue
            val line = firstBus.optJSONObject("transitLine")
            val lineName = line?.optString("nameShort").orEmpty().ifBlank { line?.optString("name").orEmpty() }
            if (lines.isNotEmpty() && lineName.lowercase() !in lines) continue
            val stopDetails = firstBus.optJSONObject("stopDetails") ?: continue
            val time = stopDetails.optString("departureTime")
            if (time.isBlank()) continue
            result += Departure(
                epochMillis = OffsetDateTime.parse(time).toInstant().toEpochMilli(),
                line = lineName,
                headsign = firstBus.optString("headsign"),
                stopName = stopDetails.optJSONObject("departureStop")?.optString("name").orEmpty(),
            )
        }
        return result
    }

    private fun firstTransitStep(route: JSONObject): JSONObject? {
        val legs = route.optJSONArray("legs") ?: return null
        for (l in 0 until legs.length()) {
            val steps = legs.getJSONObject(l).optJSONArray("steps") ?: continue
            for (s in 0 until steps.length()) {
                steps.getJSONObject(s).optJSONObject("transitDetails")?.let { return it }
            }
        }
        return null
    }

    private fun waypoint(text: String): JSONObject {
        val m = LAT_LNG.matchEntire(text)
            ?: return JSONObject().put("address", text)
        val latLng = JSONObject()
            .put("latitude", m.groupValues[1].toDouble())
            .put("longitude", m.groupValues[2].toDouble())
        return JSONObject().put("location", JSONObject().put("latLng", latLng))
    }

    private fun lineFilters(text: String): Set<String> =
        text.split(',').map { it.trim().lowercase() }.filter { it.isNotEmpty() }.toSet()
}
