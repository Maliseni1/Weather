// --- Configuration ---
const apiKey = "243f7f2fe49694e98fea9dd9b02ef979";
const defaultCity = "Lusaka";

// --- Element References ---
const cityElement = document.querySelector(".city");
const tempElement = document.querySelector(".temp");
const iconElement = document.querySelector(".icon");
const descriptionElement = document.querySelector(".description");
const humidityElement = document.querySelector(".humidity");
const windElement = document.querySelector(".wind");
const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search button");
const aiAdviceElement = document.querySelector(".ai-advice");
const locationButton = document.querySelector("#location-btn");
const locationModal = document.querySelector("#location-modal");
const modalAllowButton = document.querySelector("#modal-allow-btn");
const modalDenyButton = document.querySelector("#modal-deny-btn");
// --- NEW: Get reference to local time element ---
const localTimeElement = document.querySelector(".local-time");

// --- Geocoding Function ---
function geocodeLocation(searchText) {
    const geocodeApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=1&appid=${apiKey}`;
    fetch(geocodeApiUrl)
        .then(response => response.json())
        .then(data => {
            if (!data.length) {
                alert("Could not find that location. Please try being more specific.");
                return;
            }
            const { lat, lon } = data[0];
            getWeather({ latitude: lat, longitude: lon });
        })
        .catch(error => console.error("Error during geocoding:", error));
}

// --- Weather Fetching Function ---
function getWeather(cityOrCoords) {
    let apiUrl = "";
    if (typeof cityOrCoords === 'string') {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCoords}&appid=${apiKey}&units=metric`;
    } else {
        const { latitude, longitude } = cityOrCoords;
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    }
    fetch(apiUrl)
        .then(response => response.json())
        .then(displayWeather)
        .catch(error => console.error("Error fetching weather data:", error));
}

// --- UI Updates ---
function displayWeather(data) {
    // --- NEW: Calculate and display local time ---
    const reportTimestamp = data.dt;
    const timezoneOffset = data.timezone;
    const localTimestamp = (reportTimestamp + timezoneOffset) * 1000;
    const localDate = new Date(localTimestamp);
    
    // Use toUTCString and slice to avoid timezone issues of the user's browser
    const timeString = localDate.toUTCString().slice(17, 22); 
    const hours = parseInt(timeString.slice(0, 2), 10);
    const minutes = timeString.slice(3, 5);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // convert 0 to 12 for 12AM
    localTimeElement.innerText = `Local time: ${formattedHours}:${minutes} ${ampm}`;

    // --- Update rest of the weather data ---
    cityElement.innerText = `Weather in ${data.name}, ${data.sys.country}`;
    tempElement.innerText = `${Math.round(data.main.temp)}°C`;
    descriptionElement.innerText = data.weather[0].description;
    humidityElement.innerText = `Humidity: ${data.main.humidity}%`;
    windElement.innerText = `Wind speed: ${data.wind.speed} km/h`;
    iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    aiAdviceElement.innerText = generateAIAdvice(data);
}

// --- MODIFIED: The AI Brain is now time-aware ---
function generateAIAdvice(data) {
    const temp = data.main.temp;
    const mainCondition = data.weather[0].main;
    const windSpeed = data.wind.speed;
    
    // --- NEW: Day/Night Logic ---
    const isDayTime = data.dt > data.sys.sunrise && data.dt < data.sys.sunset;
    
    let advice = "";

    // MODIFIED: Advice now changes based on time of day
    if (mainCondition === "Rain") advice = "It's raining! Best to take an umbrella and a waterproof jacket. ";
    else if (mainCondition === "Snow") advice = "It's snowing! Time to bundle up in a warm coat, hat, and gloves. ";
    else if (mainCondition === "Thunderstorm") advice = "There's a thunderstorm. It's safest to stay indoors if you can. ";
    else if (mainCondition === "Clear") {
        advice = isDayTime ? "It's a beautiful clear day! " : "It's a clear night, perfect for stargazing. ";
    } else if (mainCondition === "Clouds") {
        advice = isDayTime ? "It's cloudy, but that's no reason to stay inside. " : "It's a cloudy night. ";
    }

    if (temp > 25) {
        advice += "Properly hot. Shorts and a light t-shirt are the way to go.";
    } else if (temp > 15) {
        advice += isDayTime 
            ? "It's mild and pleasant. A long-sleeve shirt or a light sweater should be perfect." 
            : "It's a cool evening. A light jacket would be a good idea.";
    } else if (temp > 5) {
        advice += "Quite chilly out there. A warm jacket is definitely needed.";
    } else {
        advice += "It's very cold. Be sure to wear a heavy coat, a scarf, and a hat.";
    }

    if (windSpeed > 15) advice += " And it's a bit windy!";
    return advice;
}

// --- Event Handlers ---
function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        aiAdviceElement.innerText = `Looking for ${city}...`;
        geocodeLocation(city);
        searchInput.value = "";
    }
}

function fetchUserLocation() {
    if (navigator.geolocation) {
        aiAdviceElement.innerText = "Getting your location...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeather({ latitude, longitude });
            },
            (error) => {
                console.error("Error getting location:", error);
                aiAdviceElement.innerText = "Location access denied. Search for a city manually.";
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// --- Event Listeners ---
searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") handleSearch();
});
locationButton.addEventListener("click", () => locationModal.classList.add('visible'));
modalAllowButton.addEventListener("click", () => {
    locationModal.classList.remove('visible');
    fetchUserLocation();
});
modalDenyButton.addEventListener("click", () => locationModal.classList.remove('visible'));

// --- Initial Load ---
getWeather(defaultCity);