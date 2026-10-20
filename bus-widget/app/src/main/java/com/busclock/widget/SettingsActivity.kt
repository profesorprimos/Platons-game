package com.busclock.widget

import android.app.Activity
import android.app.TimePickerDialog
import android.os.Bundle
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import java.time.DayOfWeek
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale
import kotlin.concurrent.thread

class SettingsActivity : Activity() {

    private lateinit var prefs: Prefs
    private lateinit var apiKey: EditText
    private lateinit var stop: EditText
    private lateinit var destination: EditText
    private lateinit var lines: EditText
    private lateinit var startButton: Button
    private lateinit var endButton: Button
    private lateinit var result: TextView
    private val dayBoxes = mutableMapOf<DayOfWeek, CheckBox>()
    private var startMinutes = 0
    private var endMinutes = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        prefs = Prefs(this)

        apiKey = findViewById(R.id.api_key)
        stop = findViewById(R.id.stop)
        destination = findViewById(R.id.destination)
        lines = findViewById(R.id.lines)
        startButton = findViewById(R.id.start_time)
        endButton = findViewById(R.id.end_time)
        result = findViewById(R.id.test_result)

        apiKey.setText(prefs.apiKey)
        stop.setText(prefs.stop)
        destination.setText(prefs.destination)
        lines.setText(prefs.lineFilter)
        startMinutes = prefs.startMinutes
        endMinutes = prefs.endMinutes
        updateTimeButtons()

        val dayRow = findViewById<LinearLayout>(R.id.days)
        val selected = prefs.days
        for (day in DayOfWeek.values()) {
            val box = CheckBox(this).apply {
                text = day.getDisplayName(TextStyle.NARROW, Locale.getDefault())
                isChecked = day in selected
            }
            dayBoxes[day] = box
            dayRow.addView(box, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        }

        startButton.setOnClickListener { pickTime(startMinutes) { startMinutes = it } }
        endButton.setOnClickListener { pickTime(endMinutes) { endMinutes = it } }
        findViewById<Button>(R.id.save).setOnClickListener { if (save()) finish() }
        findViewById<Button>(R.id.test).setOnClickListener { if (save()) test() }
    }

    private fun pickTime(current: Int, set: (Int) -> Unit) {
        TimePickerDialog(this, { _, h, m ->
            set(h * 60 + m)
            updateTimeButtons()
        }, current / 60, current % 60, true).show()
    }

    private fun updateTimeButtons() {
        startButton.text = getString(R.string.from_time, CommuteWindow.format(startMinutes))
        endButton.text = getString(R.string.to_time, CommuteWindow.format(endMinutes))
    }

    private fun save(): Boolean {
        if (endMinutes <= startMinutes) {
            Toast.makeText(this, R.string.error_window, Toast.LENGTH_LONG).show()
            return false
        }
        prefs.apiKey = apiKey.text.toString()
        prefs.stop = stop.text.toString()
        prefs.destination = destination.text.toString()
        prefs.lineFilter = lines.text.toString()
        prefs.startMinutes = startMinutes
        prefs.endMinutes = endMinutes
        prefs.days = dayBoxes.filterValues { it.isChecked }.keys
        if (!prefs.isConfigured) {
            Toast.makeText(this, R.string.error_missing, Toast.LENGTH_LONG).show()
            return false
        }
        BusWidgetProvider.requestRefresh(this)
        return true
    }

    private fun test() {
        result.text = getString(R.string.testing)
        thread {
            val text = try {
                val deps = RoutesClient.fetchDepartures(prefs)
                if (deps.isEmpty()) {
                    getString(R.string.test_none)
                } else {
                    val clock = DateTimeFormatter.ofPattern("HH:mm")
                    deps.joinToString("\n") {
                        val time = Instant.ofEpochMilli(it.epochMillis).atZone(ZoneId.systemDefault()).format(clock)
                        "$time  ${it.line} → ${it.headsign}  (from ${it.stopName})"
                    }
                }
            } catch (e: Exception) {
                "Error: ${e.message}"
            }
            runOnUiThread { result.text = text }
        }
    }
}
