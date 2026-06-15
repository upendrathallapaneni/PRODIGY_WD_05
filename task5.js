(function() {
    var cityInput = document.getElementById('cityInput');
    var searchBtn = document.getElementById('searchBtn');
    var geoBtn = document.getElementById('geoBtn');
    var errorMsg = document.getElementById('errorMsg');
    var weatherInfo = document.getElementById('weatherInfo');
    var cityName = document.getElementById('cityName');
    var dateTime = document.getElementById('dateTime');
    var weatherIcon = document.getElementById('weatherIcon');
    var temperature = document.getElementById('temperature');
    var description = document.getElementById('description');
    var feelsLike = document.getElementById('feelsLike');
    var humidity = document.getElementById('humidity');
    var windSpeed = document.getElementById('windSpeed');
    var pressure = document.getElementById('pressure');

    var weatherDescriptions = [
        { codes: [0], label: 'Clear sky' },
        { codes: [1, 2], label: 'Mostly clear' },
        { codes: [3], label: 'Overcast' },
        { codes: [45, 48], label: 'Foggy' },
        { codes: [51, 53, 55], label: 'Light drizzle' },
        { codes: [56, 57], label: 'Freezing drizzle' },
        { codes: [61, 63, 65], label: 'Rainy' },
        { codes: [66, 67], label: 'Freezing rain' },
        { codes: [71, 73, 75], label: 'Snowy' },
        { codes: [77], label: 'Snow grains' },
        { codes: [80, 81, 82], label: 'Showers' },
        { codes: [85, 86], label: 'Snow showers' },
        { codes: [95], label: 'Thunderstorm' },
        { codes: [96, 99], label: 'Severe storm' }
    ];

    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
        weatherInfo.style.display = 'none';
    }

    function clearError() {
        errorMsg.style.display = 'none';
    }

    function formatDateTime(timezone) {
        var options = {
            weekday: 'long',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone
        };
        return new Intl.DateTimeFormat('en-US', options).format(new Date());
    }

    function makeWeatherIcon(code) {
        var iconName = '03d';
        if (code === 0) iconName = '01d';
        if (code === 1 || code === 2) iconName = '02d';
        if (code === 3) iconName = '03d';
        if (code === 45 || code === 48) iconName = '50d';
        if (code >= 51 && code <= 67) iconName = '10d';
        if (code >= 71 && code <= 86) iconName = '13d';
        if (code === 95 || code === 96 || code === 99) iconName = '11d';

        return 'https://openweathermap.org/img/wn/' + iconName + '@2x.png';
    }

    function getWeatherMeta(code) {
        var i;
        for (i = 0; i < weatherDescriptions.length; i += 1) {
            if (weatherDescriptions[i].codes.indexOf(code) !== -1) {
                return weatherDescriptions[i];
            }
        }
        return { label: 'Unknown conditions' };
    }

    function updateUI(place, data) {
        var meta = getWeatherMeta(data.weathercode);
        clearError();

        cityName.textContent = place;
        dateTime.textContent = formatDateTime(data.timezone);
        weatherIcon.src = makeWeatherIcon(data.weathercode);
        weatherIcon.alt = meta.label;
        temperature.textContent = Math.round(data.temperature);
        description.textContent = meta.label;
        feelsLike.textContent = Math.round(data.apparent_temperature) + '°C';
        humidity.textContent = data.humidity + '%';
        windSpeed.textContent = data.windspeed + ' m/s';
        pressure.textContent = data.pressure + ' hPa';
        weatherInfo.style.display = 'block';
    }

    async function fetchJson(url) {
        var response = await fetch(url);
        if (!response.ok) {
            throw new Error('Request failed');
        }
        return await response.json();
    }

    async function fetchWeather(lat, lon, place) {
        var weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current_weather=true&hourly=relativehumidity_2m,apparent_temperature,pressure_msl&timezone=auto';
        var data = await fetchJson(weatherUrl);
        var current = data.current_weather;
        var hourly = data.hourly || {};

        var humidityValue = 0;
        if (hourly.relativehumidity_2m && hourly.relativehumidity_2m.length) {
            humidityValue = hourly.relativehumidity_2m[0];
        }

        var feelsLikeValue = current.temperature;
        if (hourly.apparent_temperature && hourly.apparent_temperature.length) {
            feelsLikeValue = hourly.apparent_temperature[0];
        }

        var pressureValue = 1013;
        if (hourly.pressure_msl && hourly.pressure_msl.length) {
            pressureValue = hourly.pressure_msl[0];
        }

        updateUI(place, {
            timezone: data.timezone || 'auto',
            temperature: current.temperature,
            weathercode: current.weathercode,
            apparent_temperature: feelsLikeValue,
            humidity: humidityValue,
            windspeed: current.windspeed,
            pressure: Math.round(pressureValue)
        });
    }

    async function geocodeCity(query) {
        var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(query) + '&count=1&language=en&format=json';
        var data = await fetchJson(url);
        if (!data.results || !data.results.length) {
            throw new Error('City not found');
        }
        return data.results[0];
    }

    async function searchCity() {
        var query = cityInput.value.trim();
        if (!query) {
            showError('Enter a city name first.');
            return;
        }

        try {
            weatherInfo.style.display = 'none';
            clearError();
            var place = await geocodeCity(query);
            var label = place.name;
            if (place.admin1) {
                label += ', ' + place.admin1;
            }
            if (place.country) {
                label += ', ' + place.country;
            }
            await fetchWeather(place.latitude, place.longitude, label);
        } catch (error) {
            showError(error && error.message === 'City not found' ? 'City not found. Please try again.' : 'Could not load weather right now.');
        }
    }

    async function useCurrentLocation() {
        if (!navigator.geolocation) {
            showError('Geolocation is not supported in this browser.');
            return;
        }

        weatherInfo.style.display = 'none';
        clearError();

        navigator.geolocation.getCurrentPosition(async function(position) {
            try {
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                var reverseUrl = 'https://geocoding-api.open-meteo.com/v1/reverse?latitude=' + latitude + '&longitude=' + longitude + '&count=1&language=en&format=json';
                var reverseData = await fetchJson(reverseUrl);
                var placeLabel = 'Current location';
                if (reverseData.results && reverseData.results[0]) {
                    placeLabel = reverseData.results[0].name;
                    if (reverseData.results[0].admin1) {
                        placeLabel += ', ' + reverseData.results[0].admin1;
                    }
                    if (reverseData.results[0].country) {
                        placeLabel += ', ' + reverseData.results[0].country;
                    }
                }

                await fetchWeather(latitude, longitude, placeLabel);
            } catch (error) {
                showError('Could not load your location weather.');
            }
        }, function() {
            showError('Location access was denied. Use search instead.');
        }, { enableHighAccuracy: true, timeout: 10000 });
    }

    searchBtn.addEventListener('click', searchCity);
    geoBtn.addEventListener('click', useCurrentLocation);
    cityInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searchCity();
        }
    });

    weatherInfo.style.display = 'block';
    fetchWeather(51.5072, -0.1276, 'London, GB').catch(function() {
        showError('Could not load the default weather view.');
    });
})();