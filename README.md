# NASA Space Explorer 🚀

My space photo gallery built with NASA's Astronomy Picture of the Day (APOD) API, using vanilla HTML, CSS and JavaScript.

**Live site:** https://zljones1.github.io/nasa-space-explorer/

## Features
- Pick a start date and the app gets **9 days in a row** of APOD pictures from NASA's API
- Gallery cards show each image, title and date
- Click a card to open a modal with the full-size image, title, date and explanation
- Video entries show a thumbnail and play embedded in the modal (or open with a link)
- Loading message while the data loads
- A random "Did You Know?" space fact on every page load
- Smooth hover zoom on gallery images
- NASA colors (blue #0B3D91, red #FC3D21) and fonts (Inter and Public Sans)

## How it works
`dateRange.js` sets up the date pickers (June 16, 1995 to today, end date = start + 8 days). `script.js` calls `https://api.nasa.gov/planetary/apod` with `start_date`, `end_date` and `thumbs=true`, then builds the gallery from the JSON it gets back.

## API key
The key is in `const API_KEY` at the top of `js/script.js`. It's set to `DEMO_KEY`, which NASA rate-limits, so get your own free key at https://api.nasa.gov and paste it in.

## NASA feed fallback
In late 2026, NASA's APOD feed started returning placeholder entries (all titled "NASA Science" with the NASA logo) after APOD moved to science.nasa.gov. If the app detects that, or if the request fails or is rate-limited, it loads the course's backup APOD data instead and shows a small notice. Old apod.nasa.gov image links in the backup load from the Internet Archive.
