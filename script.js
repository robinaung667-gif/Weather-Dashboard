// ========================================
// WEATHERLY WEATHER DASHBOARD
// Open-Meteo API
// ========================================


// ========================================
// 1. HTML ELEMENTS
// ========================================

const searchForm = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchButton = document.querySelector("#search-button");

const statusMessage = document.querySelector("#status-message");
const searchLoadingPanel = document.querySelector("#search-loading-panel");
const loadingCityMessage = document.querySelector("#loading-city-message");

const currentWeather = document.querySelector("#current-weather");
const forecastSection = document.querySelector("#forecast-section");
const forecastCards = document.querySelector("#forecast-cards");

const unitToggle = document.querySelector("#unit-toggle");
const unitCelsius = document.querySelector("#unit-celsius");

const cityNameElement = document.querySelector("#city-name");
const cityCountryElement = document.querySelector("#city-country");
const currentDateElement = document.querySelector("#current-date");

const currentIconElement = document.querySelector("#current-icon");
const currentTemperatureElement = document.querySelector("#current-temperature");
const currentConditionElement = document.querySelector("#current-condition");

const currentHumidityElement = document.querySelector("#current-humidity");
const currentWindElement = document.querySelector("#current-wind");
const currentFeelsLikeElement = document.querySelector("#current-feels-like");

const stateExamples = document.querySelector("#state-examples");

const errorStateCard = document.querySelector("#error-state-card");
const errorDescription = document.querySelector("#error-description");
const tryAgainButton = document.querySelector("#try-again-button");

const locationButton = document.querySelector("#location-button");

const settingsLocationButton = document.querySelector(
    "#settings-location-button"
);

const settingsButton = document.querySelector("#settings-button");
const settingsDialog = document.querySelector("#settings-dialog");

const settingsCelsius = document.querySelector("#settings-celsius");
const settingsFahrenheit = document.querySelector("#settings-fahrenheit");

const mobileMenuButton = document.querySelector("#mobile-menu-button");


// ========================================
// 2. VARIABLES
// ========================================

let temperatureUnit = "celsius";

let latestWeather = null;
let latestLocation = null;

let activeRequest = 0;


// ========================================
// 3. WEATHER CODE DESCRIPTIONS
// ========================================

const weatherDescriptions = {
    0: {
        description: "Clear sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly clear",
        icon: "🌤️"
    },

    2: {
        description: "Partly cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫️"
    },

    48: {
        description: "Depositing rime fog",
        icon: "🌫️"
    },

    51: {
        description: "Light drizzle",
        icon: "🌦️"
    },

    53: {
        description: "Moderate drizzle",
        icon: "🌦️"
    },

    55: {
        description: "Dense drizzle",
        icon: "🌧️"
    },

    56: {
        description: "Light freezing drizzle",
        icon: "🌧️"
    },

    57: {
        description: "Dense freezing drizzle",
        icon: "🌧️"
    },

    61: {
        description: "Slight rain",
        icon: "🌧️"
    },

    63: {
        description: "Moderate rain",
        icon: "🌧️"
    },

    65: {
        description: "Heavy rain",
        icon: "🌧️"
    },

    66: {
        description: "Light freezing rain",
        icon: "🌧️"
    },

    67: {
        description: "Heavy freezing rain",
        icon: "🌧️"
    },

    71: {
        description: "Slight snowfall",
        icon: "🌨️"
    },

    73: {
        description: "Moderate snowfall",
        icon: "🌨️"
    },

    75: {
        description: "Heavy snowfall",
        icon: "❄️"
    },

    77: {
        description: "Snow grains",
        icon: "❄️"
    },

    80: {
        description: "Slight rain showers",
        icon: "🌦️"
    },

    81: {
        description: "Moderate rain showers",
        icon: "🌧️"
    },

    82: {
        description: "Violent rain showers",
        icon: "⛈️"
    },

    85: {
        description: "Slight snow showers",
        icon: "🌨️"
    },

    86: {
        description: "Heavy snow showers",
        icon: "❄️"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈️"
    },

    96: {
        description: "Thunderstorm with slight hail",
        icon: "⛈️"
    },

    99: {
        description: "Thunderstorm with heavy hail",
        icon: "⛈️"
    }
};


// ========================================
// 4. GET WEATHER DESCRIPTION
// ========================================

function getWeatherDescription(weatherCode) {
    return weatherDescriptions[weatherCode] || {
        description: "Unknown weather",
        icon: "🌡️"
    };
}


// ========================================
// 5. TEMPERATURE CONVERSION
// ========================================

function convertTemperature(celsius) {
    if (celsius === null || celsius === undefined) {
        return "--";
    }

    if (temperatureUnit === "fahrenheit") {
        return Math.round((celsius * 9 / 5) + 32);
    }

    return Math.round(celsius);
}


// ========================================
// 6. GET TEMPERATURE SYMBOL
// ========================================

function getTemperatureSymbol() {
    return temperatureUnit === "fahrenheit" ? "°F" : "°C";
}


// ========================================
// 7. DISPLAY STATUS MESSAGE
// ========================================

function setStatus(message) {
    if (statusMessage) {
        statusMessage.textContent = message;
    }
}


// ========================================
// 8. SHOW DASHBOARD STATE
// ========================================

function showDashboardState(state) {
    if (stateExamples) {
        stateExamples.hidden = state !== "empty";
    }

    if (currentWeather) {
        currentWeather.hidden = state !== "success";
    }

    if (forecastSection) {
        forecastSection.hidden = state !== "success";
    }

    if (errorStateCard) {
        errorStateCard.hidden = state !== "error";
    }
}


// ========================================
// 9. LOADING STATE
// ========================================

function setLoading(isLoading, city = "") {
    if (searchButton) {
        searchButton.disabled = isLoading;
    }

    if (cityInput) {
        cityInput.disabled = isLoading;
    }

    if (searchLoadingPanel) {
        searchLoadingPanel.hidden = !isLoading;
    }

    if (loadingCityMessage && city) {
        loadingCityMessage.textContent =
            `Searching weather for ${city}...`;
    }

    if (isLoading) {
        setStatus("Loading weather information...");
    } else {
        setStatus("");
    }
}


// ========================================
// 10. DISPLAY ERROR
// ========================================

function showError(message) {
    showDashboardState("error");

    if (errorDescription) {
        errorDescription.textContent = message;
    }

    setStatus(message);
}


// ========================================
// 11. FETCH JSON DATA
// ========================================

async function fetchJson(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Request failed. Status: ${response.status}`
        );
    }

    return await response.json();
}


// ========================================
// 12. FIND CITY
// ========================================

async function findCity(city) {
    const url = new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
    );

    url.search = new URLSearchParams({
        name: city,
        count: "1",
        language: "en",
        format: "json"
    });

    const data = await fetchJson(url);

    if (!data.results || data.results.length === 0) {
        throw new Error(
            "City not found. Please check the spelling and try again."
        );
    }

    return data.results[0];
}


// ========================================
// 13. GET WEATHER
// ========================================

async function getWeather(latitude, longitude) {
    const url = new URL(
        "https://api.open-meteo.com/v1/forecast"
    );

    url.search = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,

        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "weather_code",
            "wind_speed_10m"
        ].join(","),

        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min"
        ].join(","),

        timezone: "Asia/Yangon",

        forecast_days: "7"
    });

    return await fetchJson(url);
}


// ========================================
// 14. FORMAT DATE
// ========================================

function formatDate(dateString, options = {}) {
    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    const date = new Date(
        Date.UTC(year, month - 1, day, 12)
    );

    return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        weekday: options.weekday || "long",
        month: options.month || "short",
        day: options.day || "numeric"
    });
}


// ========================================
// 15. DISPLAY CURRENT WEATHER
// ========================================

function renderCurrentWeather(location, weather) {
    const current = weather.current;

    const weatherInfo = getWeatherDescription(
        current.weather_code
    );

    const temperature = convertTemperature(
        current.temperature_2m
    );

    const feelsLike = convertTemperature(
        current.apparent_temperature
    );

    const windSpeed = Math.round(
        current.wind_speed_10m
    );

    if (cityNameElement) {
        cityNameElement.textContent = location.name;
    }

    if (cityCountryElement) {
        const locationParts = [
            location.admin1,
            location.country
        ].filter(Boolean);

        cityCountryElement.textContent =
            locationParts.join(", ");
    }

    if (currentDateElement) {
        currentDateElement.textContent = formatDate(
            current.time.split("T")[0]
        );
    }

    if (currentIconElement) {
        currentIconElement.textContent = weatherInfo.icon;
    }

    if (currentTemperatureElement) {
        currentTemperatureElement.textContent =
            `${temperature}${getTemperatureSymbol()}`;
    }

    if (currentConditionElement) {
        currentConditionElement.textContent =
            weatherInfo.description;
    }

    if (currentHumidityElement) {
        currentHumidityElement.textContent =
            `${current.relative_humidity_2m}%`;
    }

    if (currentWindElement) {
        currentWindElement.textContent =
            `${windSpeed} km/h`;
    }

    if (currentFeelsLikeElement) {
        currentFeelsLikeElement.textContent =
            `${feelsLike}${getTemperatureSymbol()}`;
    }
}


// ========================================
// 16. DISPLAY 7-DAY FORECAST
// ========================================

function renderForecast(weather) {
    const daily = weather.daily;
    const today = weather.current.time.split("T")[0];

    if (!forecastCards) {
        return;
    }

    forecastCards.replaceChildren();

    daily.time.forEach((date, index) => {
        const weatherInfo = getWeatherDescription(
            daily.weather_code[index]
        );

        const high = convertTemperature(
            daily.temperature_2m_max[index]
        );

        const low = convertTemperature(
            daily.temperature_2m_min[index]
        );

        const card = document.createElement("article");
        card.className = "forecast-card";

        const dayElement = document.createElement("h3");
        dayElement.className = "forecast-day";

        dayElement.textContent = date === today
            ? "Today"
            : formatDate(date, {
                weekday: "short"
            });

        const dateElement = document.createElement("p");
        dateElement.className = "forecast-date";

        dateElement.textContent = formatDate(date, {
            weekday: "short",
            month: "short",
            day: "numeric"
        });

        const iconElement = document.createElement("div");
        iconElement.className = "forecast-icon";
        iconElement.textContent = weatherInfo.icon;

        const descriptionElement =
            document.createElement("p");

        descriptionElement.className =
            "forecast-description";

        descriptionElement.textContent =
            weatherInfo.description;

        const temperaturesElement =
            document.createElement("div");

        temperaturesElement.className =
            "forecast-temperatures";

        const highElement = document.createElement("span");
        highElement.className = "forecast-high";

        highElement.textContent =
            `↑ High: ${high}${getTemperatureSymbol()}`;

        const lowElement = document.createElement("span");
        lowElement.className = "forecast-low";

        lowElement.textContent =
            `↓ Low: ${low}${getTemperatureSymbol()}`;

        temperaturesElement.append(
            highElement,
            lowElement
        );

        card.append(
            dayElement,
            dateElement,
            iconElement,
            descriptionElement,
            temperaturesElement
        );

        forecastCards.appendChild(card);
    });
}


// ========================================
// 17. DISPLAY WEATHER
// ========================================

function renderWeather(location, weather) {
    latestLocation = location;
    latestWeather = weather;

    renderCurrentWeather(location, weather);
    renderForecast(weather);

    showDashboardState("success");

    setStatus(`Weather loaded for ${location.name}.`);
}


// ========================================
// 18. SEARCH WEATHER
// ========================================

async function searchWeather(city) {
    const trimmedCity = city.trim();

    if (!trimmedCity) {
        showError("Please enter a city name.");
        return;
    }

    const requestId = ++activeRequest;

    setLoading(true, trimmedCity);
    showDashboardState("loading");

    try {
        const location = await findCity(trimmedCity);

        if (requestId !== activeRequest) {
            return;
        }

        const weather = await getWeather(
            location.latitude,
            location.longitude
        );

        if (requestId !== activeRequest) {
            return;
        }

        renderWeather(location, weather);

        try {
            localStorage.setItem(
                "weatherly-last-city",
                trimmedCity
            );
        } catch (storageError) {
            console.warn(
                "Could not save the city:",
                storageError
            );
        }

    } catch (error) {
        if (requestId !== activeRequest) {
            return;
        }

        console.error("Weather search error:", error);

        showError(
            error.message ||
            "Something went wrong. Please try again."
        );

    } finally {
        if (requestId === activeRequest) {
            setLoading(false);
        }
    }
}


// ========================================
// 19. CHANGE TEMPERATURE UNIT
// ========================================

function setTemperatureUnit(unit) {
    if (
        unit !== "celsius" &&
        unit !== "fahrenheit"
    ) {
        return;
    }

    temperatureUnit = unit;

    document.querySelectorAll(
        '[data-temperature-unit="celsius"]'
    ).forEach((button) => {
        const active = unit === "celsius";

        button.classList.toggle("is-active", active);

        button.setAttribute(
            "aria-pressed",
            String(active)
        );
    });

    document.querySelectorAll(
        '[data-temperature-unit="fahrenheit"]'
    ).forEach((button) => {
        const active = unit === "fahrenheit";

        button.classList.toggle("is-active", active);

        button.setAttribute(
            "aria-pressed",
            String(active)
        );
    });

    if (latestWeather && latestLocation) {
        renderCurrentWeather(
            latestLocation,
            latestWeather
        );

        renderForecast(latestWeather);
    }

    try {
        localStorage.setItem(
            "weatherly-temperature-unit",
            temperatureUnit
        );
    } catch (error) {
        console.warn(
            "Could not save temperature preference:",
            error
        );
    }
}


// ========================================
// 20. SEARCH FORM EVENT
// ========================================

if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        searchWeather(cityInput.value);
    });
}


// ========================================
// 21. TEMPERATURE UNIT BUTTONS
// ========================================

document.querySelectorAll(
    '[data-temperature-unit="celsius"]'
).forEach((button) => {
    button.addEventListener("click", () => {
        setTemperatureUnit("celsius");
    });
});

document.querySelectorAll(
    '[data-temperature-unit="fahrenheit"]'
).forEach((button) => {
    button.addEventListener("click", () => {
        setTemperatureUnit("fahrenheit");
    });
});


// ========================================
// 22. USE MY LOCATION
// ========================================

async function useMyLocation() {
    if (!navigator.geolocation) {
        showError(
            "Location is not supported by your browser. Please search for a city instead."
        );
        return;
    }

    const requestId = ++activeRequest;

    setLoading(true, "your location");
    showDashboardState("loading");
    setStatus("Getting your location and weather...");

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: false,
                    timeout: 15000,
                    maximumAge: 300000
                }
            );
        });

        if (requestId !== activeRequest) {
            return;
        }

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Get weather directly from the GPS coordinates.
        const weather = await getWeather(
            latitude,
            longitude
        );

        if (requestId !== activeRequest) {
            return;
        }

        const location = {
            name: "Your Location",
            admin1: "",
            country: "",
            latitude: latitude,
            longitude: longitude
        };

        renderWeather(location, weather);

        if (cityInput) {
            cityInput.value = "";
        }

    } catch (error) {
        if (requestId !== activeRequest) {
            return;
        }

        console.error("Location weather error:", error);

        let message =
            "Could not load weather for your location. Please try searching for a city instead.";

        if (error && typeof error.code === "number") {
            if (error.code === 1) {
                message =
                    "Location permission was denied. Please allow location access in your browser settings.";
            } else if (error.code === 2) {
                message =
                    "Your location is unavailable. Please check your device's location services.";
            } else if (error.code === 3) {
                message =
                    "Getting your location took too long. Please try again.";
            }
        }

        showError(message);

    } finally {
        if (requestId === activeRequest) {
            setLoading(false);
        }
    }
}


// ========================================
// 23. LOCATION BUTTON
// ========================================

if (locationButton) {
    locationButton.addEventListener(
        "click",
        useMyLocation
    );
}


// ========================================
// 24. SETTINGS LOCATION BUTTON
// ========================================

if (settingsLocationButton) {
    settingsLocationButton.addEventListener(
        "click",
        () => {
            if (settingsDialog?.open) {
                settingsDialog.close();
            }

            useMyLocation();
        }
    );
}


// ========================================
// 25. SETTINGS BUTTON
// ========================================

if (settingsButton && settingsDialog) {
    settingsButton.addEventListener("click", () => {
        if (
            typeof settingsDialog.showModal === "function"
        ) {
            settingsDialog.showModal();
        } else {
            settingsDialog.hidden = false;
        }
    });
}


// ========================================
// 26. SETTINGS TEMPERATURE BUTTONS
// ========================================

if (settingsCelsius) {
    settingsCelsius.addEventListener("click", () => {
        setTemperatureUnit("celsius");
    });
}

if (settingsFahrenheit) {
    settingsFahrenheit.addEventListener("click", () => {
        setTemperatureUnit("fahrenheit");
    });
}


// ========================================
// 27. TRY AGAIN BUTTON
// ========================================

if (tryAgainButton) {
    tryAgainButton.addEventListener("click", () => {
        if (cityInput && cityInput.value.trim()) {
            searchWeather(cityInput.value);
        } else if (latestLocation) {
            searchWeather(latestLocation.name);
        } else {
            showDashboardState("empty");

            setStatus(
                "Enter a city to check its weather."
            );
        }
    });
}


// ========================================
// 28. MOBILE MENU BUTTON
// Open the existing Settings popup
// ========================================

if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!settingsDialog) {
            return;
        }

        if (
            typeof settingsDialog.showModal === "function"
        ) {
            if (!settingsDialog.open) {
                settingsDialog.showModal();
            } else {
                settingsDialog.close();
            }
        } else {
            settingsDialog.hidden = false;
        }
    });
}


// ========================================
// 29. INITIAL DASHBOARD STATE
// ========================================

showDashboardState("empty");
setLoading(false);


// ========================================
// 30. RESTORE TEMPERATURE PREFERENCE
// ========================================

try {
    const savedUnit = localStorage.getItem(
        "weatherly-temperature-unit"
    );

    if (
        savedUnit === "celsius" ||
        savedUnit === "fahrenheit"
    ) {
        temperatureUnit = savedUnit;
    }

} catch (error) {
    console.warn(
        "Could not restore temperature preference:",
        error
    );
}

setTemperatureUnit(temperatureUnit);


// ========================================
// 31. RESTORE LAST SEARCHED CITY
// ========================================

try {
    const lastCity = localStorage.getItem(
        "weatherly-last-city"
    );

    if (lastCity && cityInput) {
        cityInput.value = lastCity;
        searchWeather(lastCity);
    }

} catch (error) {
    console.warn(
        "Could not restore the last searched city:",
        error
    );
}


// ========================================
// 32. AUTOMATIC DAILY WEATHER UPDATE
// Myanmar timezone: Asia/Yangon
// ========================================

function getMyanmarDateKey() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Yangon",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

let lastMyanmarDate = getMyanmarDateKey();

function checkForNewMyanmarDay() {
    const currentMyanmarDate = getMyanmarDateKey();

    if (currentMyanmarDate !== lastMyanmarDate) {
        lastMyanmarDate = currentMyanmarDate;

        if (latestLocation) {
            searchWeather(latestLocation.name);
        }
    }
}

setInterval(checkForNewMyanmarDay, 30000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
        checkForNewMyanmarDay();
    }
});

window.addEventListener("focus", () => {
    checkForNewMyanmarDay();
});