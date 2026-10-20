# Bus Clock: a home screen widget for your bus

A small Android widget that counts down to the next bus from your stop, using
the departure times Google Maps gives. It only checks for buses during the
commute times you choose. The rest of the time it just says when your next
commute starts.

```
┌──────────────────────────────┐
│ Main St & 5th Ave         ⚙  │
│ 42 → City Centre             │
│ leaves in  06:41             │
│ Leaves 08:12 · then 08:24    │
│ Updated 08:05                │
└──────────────────────────────┘
```

## What it does

- **Countdown to the next bus.** It counts down every second, and it keeps
  going without using the network.
- **Commute window.** Pick a start time, an end time and the days, for example
  07:30–09:00 on weekdays. During the window it asks Google Maps again every
  3 minutes, and again just after a bus leaves, so the next one shows.
  Outside the window it doesn't use the network at all.
- **Tap the widget** to check right now, even outside your commute times.
  Tap ⚙ to change the settings.
- **Only some lines (optional).** For example `42, 42A`.

## How it gets the times

The app calls the Google Maps Platform
[Routes API](https://developers.google.com/maps/documentation/routes) for a
bus (transit) journey from your stop to your destination. The departure time
of the first bus is the same one Google Maps shows. If your transit agency
sends live times to Google, they are included. Otherwise you get the timetable
time, just like in the Maps app.

Your destination is needed so that Maps only gives buses going your way.

## Setup

1. **Get a Google Maps API key**
   1. Go to <https://console.cloud.google.com/> and create a project. You need
      to add billing.
   2. Turn on the **Routes API**: APIs & Services → Library → "Routes API".
   3. APIs & Services → Credentials → **Create credentials → API key**.
      Under *API restrictions*, choose to restrict the key to the Routes API only.

   With the default settings (every 3 minutes, a 90 minute window,
   5 days a week) the app makes about 1,000–3,000 requests a month.
   That should be inside Google's free monthly allowance for Routes,
   but check the current
   [pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
   and set a budget alert.

2. **Install the app**
   - Open this repository's **Actions** tab → *Build Bus Clock widget* →
     the newest run → download **bus-clock-apk**. Unzip it and open
     `app-debug.apk` on your phone (you may need to allow installs from
     your browser or file manager).
   - Or build it yourself: open `bus-widget/` in Android Studio, or run
     `./gradlew assembleDebug`.

3. **Set it up.** Open **Bus Clock** and fill in:
   - your API key,
   - your bus stop: its name as Maps shows it, or its coordinates `lat,lng`.
     Coordinates are the most reliable. Long-press the stop in Google Maps
     to copy them.
   - where you are going,
   - your commute times and days.

   Press **Test now**. You should see a list of the next buses. Then press **Save**.

4. **Add the widget.** Long-press your home screen → Widgets → **Bus Clock**.

## Notes

- Android may hold back background updates by a few minutes when the phone
  is asleep. The countdown is still right, because it counts to a fixed time.
- The key is only kept on your phone, in the app's private storage.
- Built with Kotlin. It needs no libraries and runs on Android 8.0 or newer.
