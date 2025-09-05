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

// --- API and Data Handling ---
function getWeather(cityOrCoords) {
    let apiUrl = "";
    if (typeof cityOrCoords === 'string') {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityOrCoords}&appid=${apiKey}&units=metric`;
    } else {
        const { latitude, longitude } = cityOrCoords;
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                alert("Location not found. Please try another city.");
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(displayWeather)
        .catch(error => {
            console.error("Error fetching weather data:", error);
            aiAdviceElement.innerText = "Could not get weather advice. Please try again.";
        });
}

// --- UI Updates ---
function displayWeather(data) {
    cityElement.innerText = `Weather in ${data.name}`;
    tempElement.innerText = `${Math.round(data.main.temp)}°C`;
    descriptionElement.innerText = data.weather[0].description;
    humidityElement.innerText = `Humidity: ${data.main.humidity}%`;
    windElement.innerText = `Wind speed: ${data.wind.speed} km/h`;
    iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    aiAdviceElement.innerText = generateAIAdvice(data);
}

// --- AI Weather Assistant ---
function generateAIAdvice(data) {
    const temp = data.main.temp;
    const mainCondition = data.weather[0].main;
    const windSpeed = data.wind.speed;
    let advice = "";

    if (mainCondition === "Rain") advice = "It's raining! Best to take an umbrella and a waterproof jacket. ";
    else if (mainCondition === "Snow") advice = "It's snowing! Time to bundle up in a warm coat, hat, and gloves. ";
    else if (mainCondition === "Thunderstorm") advice = "There's a thunderstorm. It's safest to stay indoors if you can. ";
    else if (mainCondition === "Clear") advice = "It's a beautiful clear day! ";
    else if (mainCondition === "Clouds") advice = "It's cloudy, but that's no reason to stay inside. ";

    if (temp > 25) advice += "Properly hot. Shorts and a light t-shirt are the way to go.";
    else if (temp > 15) advice += "It's mild and pleasant. A long-sleeve shirt or a light sweater should be perfect.";
    else if (temp > 5) advice += "Quite chilly out there. A warm jacket is definitely needed.";
    else advice += "It's very cold. Be sure to wear a heavy coat, a scarf, and a hat.";

    if (windSpeed > 15) advice += " And it's a bit windy, so hold onto your hat!";
    return advice;
}

// --- Event Handlers ---
function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        aiAdviceElement.innerText = `Getting advice for ${city}...`;
        getWeather(city);
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