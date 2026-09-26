// ================================
// OpenWeatherMap API Configuration
// ================================

const API_KEY = "2263378bad8e7f491e61d794efd97688";


// ================================
// Get HTML Elements
// ================================

const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const weatherResult = document.getElementById("weatherResult");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const feelsLike = document.getElementById("feelsLike");
const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");


// ================================
// Weather Icon Function
// ================================

function getWeatherIcon(weather) {

    const weatherType = weather.toLowerCase();

    if (weatherType.includes("clear")) {
        return "☀️";
    }

    if (weatherType.includes("cloud")) {
        return "☁️";
    }

    if (weatherType.includes("rain")) {
        return "🌧️";
    }

    if (weatherType.includes("drizzle")) {
        return "🌦️";
    }

    if (weatherType.includes("thunderstorm")) {
        return "⛈️";
    }

    if (weatherType.includes("snow")) {
        return "❄️";
    }

    if (weatherType.includes("mist") ||
        weatherType.includes("fog") ||
        weatherType.includes("haze")) {

        return "🌫️";
    }

    return "🌤️";
}


// ================================
// Get Weather Function
// ================================

async function getWeather() {

    // Get city name
    const city = cityInput.value.trim();


    // Check empty input
    if (city === "") {

        showError("Please enter a city name.");

        return;
    }


    // Check API key
    if (API_KEY === "YOUR_API_KEY") {

        showError("Please add your OpenWeatherMap API key in script.js.");

        return;
    }


    // Show loading
    loading.style.display = "block";

    error.style.display = "none";

    weatherResult.style.display = "none";

    searchBtn.disabled = true;


    try {

        // API URL
        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;


        // Fetch API
        const response = await fetch(url);


        // Check response
        if (!response.ok) {

            if (response.status === 404) {

                throw new Error("City not found. Please check the city name.");

            }

            if (response.status === 401) {

                throw new Error("Invalid API key. Please check your API key.");

            }

            throw new Error("Unable to get weather data.");

        }


        // Convert response to JSON
        const data = await response.json();


        // Display weather data
        displayWeather(data);


    } catch (err) {

        showError(err.message);

    } finally {

        // Hide loading
        loading.style.display = "none";

        searchBtn.disabled = false;

    }
}


// ================================
// Display Weather
// ================================

function displayWeather(data) {

    // City
    cityName.textContent =
        `${data.name}, ${data.sys.country}`;


    // Temperature
    temperature.textContent =
        Math.round(data.main.temp);


    // Humidity
    humidity.textContent =
        `${data.main.humidity}%`;


    // Feels Like
    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°C`;


    // Weather Condition
    condition.textContent =
        data.weather[0].description;


    // Weather Icon
    weatherIcon.textContent =
        getWeatherIcon(data.weather[0].main);


    // Show result
    weatherResult.style.display = "block";
}


// ================================
// Error Function
// ================================

function showError(message) {

    error.textContent = message;

    error.style.display = "block";

    weatherResult.style.display = "none";
}


// ================================
// Button Click Event
// ================================

searchBtn.addEventListener("click", getWeather);


// ================================
// Enter Key Event
// ================================

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        getWeather();

    }

});