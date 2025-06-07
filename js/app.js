// API 키와 기본 URL
const API_KEY = '37080bbb0148b363ce508336bc5ac3dc'; // OpenWeatherMap API 키를 여기에 입력하세요
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 날씨 상태에 따른 아이콘 매핑
const WEATHER_ICONS = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
    'Mist': '🌫️'
};

// 날씨 데이터 가져오기
async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
        );
        return await response.json();
    } catch (error) {
        console.error('날씨 데이터를 가져오는데 실패했습니다:', error);
        throw error;
    }
}

// 시간별 예보 데이터 가져오기
async function getHourlyForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
        );
        return await response.json();
    } catch (error) {
        console.error('시간별 예보 데이터를 가져오는데 실패했습니다:', error);
        throw error;
    }
}

// 현재 위치 가져오기
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation이 지원되지 않습니다.'));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

// 날씨 데이터 표시하기
function displayWeatherData(data) {
    const location = document.querySelector('.location');
    const temperature = document.querySelector('.temperature');
    const weatherDesc = document.querySelector('.weather-desc');
    const weatherDetails = document.querySelector('.weather-details');

    location.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°`;
    weatherDesc.textContent = data.weather[0].description;
    weatherDetails.innerHTML = `
        <span>습도: ${data.main.humidity}%</span>
        <span>풍속: ${data.wind.speed}m/s</span>
    `;
}

// 시간별 예보 표시하기
function displayHourlyForecast(data) {
    const hourlyList = document.querySelector('.hourly-list');
    hourlyList.innerHTML = '';

    // 3시간 간격의 예보 중 8개만 표시
    const forecasts = data.list.slice(0, 8);
    
    forecasts.forEach(forecast => {
        const time = new Date(forecast.dt * 1000);
        const hour = time.getHours();
        const temp = Math.round(forecast.main.temp);
        const weather = forecast.weather[0].main;
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div>${hour}시</div>
            <div>${WEATHER_ICONS[weather] || '❓'}</div>
            <div>${temp}°</div>
        `;
        
        hourlyList.appendChild(forecastItem);
    });
}

// 앱 초기화
async function initApp() {
    try {
        const position = await getCurrentLocation();
        const { latitude, longitude } = position.coords;
        
        const weatherData = await getWeatherData(latitude, longitude);
        const forecastData = await getHourlyForecast(latitude, longitude);
        
        displayWeatherData(weatherData);
        displayHourlyForecast(forecastData);
    } catch (error) {
        console.error('앱 초기화 중 오류가 발생했습니다:', error);
        // 에러 처리 UI 표시
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initApp); 