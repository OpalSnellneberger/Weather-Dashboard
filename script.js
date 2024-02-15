const apiKey = 'd134758cd83dd42144e9be9c3e464427';
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentWeatherSection = document.getElementById('current-weather');
const forecastSection = document.getElementById('forecast');
const searchHistorySection = document.getElementById('search-history');


document.addEventListener('DOMContentLoaded', function() {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (searchHistory.length > 0) {
        const lastSearchedCity = searchHistory[searchHistory.length - 1];
        cityInput.value = lastSearchedCity;
        searchForm.dispatchEvent(new Event('submit'));
    }

    displaySearchHistory(searchHistory);
});

searchForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const city = cityInput.value.trim();

    if (city === '') {
        alert('Please enter a city name');
        return;
    }

    try {
        const weatherData = await getWeatherData(city);
        displayWeatherData(weatherData);
        saveToLocalStorage(city);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please try again later.');
    }
});

async function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
}

function displayWeatherData(weatherData) {
    // Display current weather data
    const currentWeather = weatherData.list[0];
    const cityName = weatherData.city.name;
    const date = new Date(currentWeather.dt * 1000).toLocaleDateString();
    const iconUrl = `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`;
    const temperature = Math.round(currentWeather.main.temp - 273.15); // Convert temperature from Kelvin to Celsius
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;

    const currentWeatherHTML = `
        <h2>${cityName} (${date})</h2>
        <img src="${iconUrl}" alt="Weather Icon">
        <p>Temperature: ${temperature}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;
    currentWeatherSection.innerHTML = currentWeatherHTML;

    // Display 5-day forecast data
    const forecastHTML = weatherData.list.slice(1, 6).map(forecast => {
        const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
        const forecastIconUrl = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
        const forecastTemperature = Math.round(forecast.main.temp - 273.15); // Convert temperature from Kelvin to Celsius
        const forecastHumidity = forecast.main.humidity;
        const forecastWindSpeed = forecast.wind.speed;

        return `
            <div>
                <h3>${forecastDate}</h3>
                <img src="${forecastIconUrl}" alt="Weather Icon">
                <p>Temperature: ${forecastTemperature}°C</p>
                <p>Humidity: ${forecastHumidity}%</p>
                <p>Wind Speed: ${forecastWindSpeed} m/s</p>
            </div>
        `;
    }).join('');
    forecastSection.innerHTML = forecastHTML;
}

function saveToLocalStorage(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        displaySearchHistory(searchHistory);
    }
}

function displaySearchHistory(searchHistory) {
    searchHistorySection.innerHTML = '';
    searchHistory.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.addEventListener('click', function() {
            cityInput.value = city;
            searchForm.dispatchEvent(new Event('submit'));
        });
        searchHistorySection.appendChild(button);
    });

    // Add clear history button
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear History';
    clearButton.addEventListener('click', function() {
        localStorage.removeItem('searchHistory');
        searchHistorySection.innerHTML = '';
    });
    searchHistorySection.appendChild(clearButton);
}