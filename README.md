# PRODIGY_WD_05: Dynamic Weather Dashboard

An atmospheric, asynchronous weather dashboard that lets users check real-time global weather stats. The application provides instant details including feels-like metrics, wind velocity, humidity rates, and atmospheric pressure. Developed as part of my Web Development Internship at Prodigy InfoTech.

## 🚀 Features
- **Dual Location Search:** Fetches real-time weather information by city text queries or by requesting user authorization parameters via native hardware Geolocation browser APIs.
- **Asynchronous Data Layer:** Manages remote API connections cleanly using modern `async/await` and robust exception-handling protocols.
- **Glassmorphic UI Design:** Features modern frosted glass panels overlying an atmospheric color gradient backdrop.
- **Dynamic Asset Injection:** Maps code tokens from payload data to render live corresponding weather condition imagery from OpenWeatherMap servers.

## 🛠️ Technologies Used
- **HTML5:** Clean control search panels and metric grid boxes.
- **CSS3:** Frosted glass panels (`backdrop-filter`), grid structures, and background linear gradients.
- **JavaScript (ES6+):** Fetch API structures, coordinate localization utilities, dynamic text rendering modules, and event monitoring.

## ⚙️ Configuration Setup
Before running the application, make sure to add your OpenWeatherMap API credentials:
1. Create a free account at [openweathermap.org](https://openweathermap.org/) and navigate to your API keys page.
2. Open the local `script.js` file.
3. Replace the placeholder value at the top of the script with your 32-character key token:
```javascript
