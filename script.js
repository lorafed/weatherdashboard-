const apiKey = '5b5f711423aee617224bd62a4eaea854'; // Replace with your OpenWeatherMap API key

document.addEventListener('DOMContentLoaded', () => {
    displaySearchHistory(); // Display search history on page load
    document.getElementById('cityInput').addEventListener('input', updateCitySuggestions);
});

// Display weather information for a specified city
function getWeather() {
    const city = document.getElementById('cityInput').value;
    fetchWeatherData(city);
}


// Fetch weather data from OpenWeatherMap API
function fetchWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    displayLoading(true);

    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Weather data not found. Please try again.');
        }
        return response.json();
    })
    .then(data => {
        displayWeather(data);
        fetchAQIData(city);
        saveSearch(city); // Save search after successful fetch
    })
    .catch(error => {
        displayError(error.message);
    })
    .finally(() => {
        displayLoading(false);
    });
}

function displayWeather(data) {
    const { main, name, weather, sys, wind } = data;
    const country = sys.country;
    const tempCelsius = main.temp;
    const feelsLikeCelsius = main.feels_like;
    const iconCode = weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}.png`;
    const sunriseTime = new Date(sys.sunrise * 1000).toLocaleTimeString();
    const sunsetTime = new Date(sys.sunset * 1000).toLocaleTimeString();
    const windSpeed = wind.speed;
    const windDirection = wind.deg;
    //const aqiPlaceholder = `<p id="aqiDisplay">Air Quality Index (AQI): Loading...</p>`;


    const display = `
        <h2>Weather in ${name}, ${country}</h2>
        <img src="${iconUrl}" alt="${weather[0].description}" class="weather-icon">
        <p id="tempDisplay">Temperature: ${tempCelsius}°C (Feels like: ${feelsLikeCelsius}°C)</p>
        <p>Weather: ${weather[0].main}</p>
        <p>Humidity: ${main.humidity}%</p>
        <div class="sun-info">Sunrise: ${sunriseTime} | Sunset: ${sunsetTime}</div>
        <div class="wind-info">Wind: ${windSpeed} m/s, direction ${windDirection}°</div>
        <button onclick="toggleTemperatureUnit(${tempCelsius}, ${feelsLikeCelsius})">Toggle °C/°F</button>
        `;
    const weatherDataDiv = document.getElementById('weatherData');   
    weatherDataDiv.innerHTML = display;
    weatherDataDiv.style.display = 'block'; // Make the weather data visible after search

}

// Display a loading message
function displayLoading(isLoading) {
    if (isLoading) {
        document.getElementById('weatherData').style.display = 'none'; // Optionally hide when loading new data
        document.getElementById('weatherData').innerHTML = '<p>Loading...</p>';
    }
}

// Display an error message
function displayError(message) {
    // Select the weather data div
    const weatherDataDiv = document.getElementById('weatherData');
    
    // Set the inner HTML of the div to display the error message
    weatherDataDiv.innerHTML = `<p class="error">${message}</p>`;
    
    // Make sure the div is visible
    weatherDataDiv.style.display = 'block';
}
function fetchAQIData(city) {
    const aqiApiKey = '20dfaa37863eaed46ebaec9ead5f33bfbb444132';
    const aqiUrl = `https://api.waqi.info/feed/${city}/?token=${aqiApiKey}`;

    fetch(aqiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                displayAQI(data.data.aqi); // Assuming 'data.data.aqi' contains the AQI value
            } else {
                throw new Error('Failed to fetch AQI data.');
            }
        })
        .catch(error => console.error('AQI Fetch Error:', error));
}

function displayAQI(aqi) {
    const aqiDisplay = `
        <p>Air Quality Index (AQI): ${aqi}</p>
    `;
    // Append to or update your weatherData div or create a specific div for AQI
    document.getElementById('weatherData').innerHTML += aqiDisplay;
}

// Toggle between Celsius and Fahrenheit
function toggleTemperatureUnit(celsius, feelsLikeCelsius) {
    const tempDisplay = document.getElementById('tempDisplay');
    if (tempDisplay.innerText.includes("°C")) {
        const fahrenheit = (celsius * 9/5 + 32).toFixed(2);
        const feelsLikeFahrenheit = (feelsLikeCelsius * 9/5 + 32).toFixed(2);
        tempDisplay.innerText = `Temperature: ${fahrenheit}°F (Feels like: ${feelsLikeFahrenheit}°F)`;
    } else {
        tempDisplay.innerText = `Temperature: ${celsius}°C (Feels like: ${feelsLikeCelsius}°C)`;
    }
}


// Optional: Add geolocation support to fetch weather for the user's current location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            fetchWeatherData(url);
        }, () => {
            displayError("Geolocation is not supported by your browser or permission was denied.");
        });
    } else {
        displayError("Geolocation is not supported by your browser.");
    }
}

function saveSearch(city) {
    let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searches.includes(city)) {
        searches.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searches));
        displaySearchHistory();
    }
}

function displaySearchHistory() {
    let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];
    let dropdown = document.getElementById('searchDropdown');
    dropdown.innerHTML = ''; // Clear current dropdown content

    searches.forEach(city => {
        let option = document.createElement('option');
        option.value = city;
        dropdown.appendChild(option);
    });
}

window.onload = () => {
    displaySearchHistory();
};

document.getElementById('cityInput').addEventListener('input', function(e) {
    const inputVal = e.target.value.toLowerCase();
    let searches = JSON.parse(localStorage.getItem('searchHistory')) || [];

    // Filter searches to find matches that start with the input value
    let matches = searches.filter(city => city.toLowerCase().startsWith(inputVal));

    // Limit the results to the top 5 matches
    matches = matches.slice(0, 5);

    updateSearchDropdown(matches);
});

function updateSearchDropdown(matches) {
    const dropdown = document.getElementById('searchDropdown');
    dropdown.innerHTML = ''; // Clear current suggestions

    matches.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        dropdown.appendChild(option);
    });
}


function updateCitySuggestions() {
    const inputVal = document.getElementById('cityInput').value;
    if (inputVal.length > 2) { // Trigger suggestions after 2 characters
        // Replace with the correct GeoDB endpoint and include your parameters
        // For example, assuming you're using a "cities" endpoint that requires a name prefix
        const suggestionUrl = `http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&namePrefix=${inputVal}`;

        fetch(suggestionUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch city suggestions.');
                }
                return response.json();
            })
            .then(data => {
                // Assuming the API returns cities in an array inside the 'data' object
                const suggestions = data.data; // Adjust depending on the actual API response structure
                const dataList = document.getElementById('searchDropdown');
                dataList.innerHTML = ''; // Clear existing options
                
                suggestions.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.city; // Adjust based on your API's response structure, e.g., city.name
                    dataList.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }
}


