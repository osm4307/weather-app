// API 키와 기본 URL
const API_KEY = '0ed2a6686c14c1540420a652defd0d8b';
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

// 요일 이름 매핑
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 기본 위치 (서울)
const DEFAULT_LOCATION = {
    latitude: 37.5665,
    longitude: 126.9780
};

// 다크 모드 토글 함수를 전역 스코프로 이동
window.toggleDarkMode = function() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    console.log('다크 모드 토글:', isDarkMode ? '켜짐' : '꺼짐');
};

// 날씨 데이터 가져오기
async function getWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
        );
        if (!response.ok) {
            throw new Error(`날씨 데이터를 가져오는데 실패했습니다. (${response.status})`);
        }
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
        if (!response.ok) {
            throw new Error(`시간별 예보 데이터를 가져오는데 실패했습니다. (${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('시간별 예보 데이터를 가져오는데 실패했습니다:', error);
        throw error;
    }
}

// 미세먼지 데이터 가져오기
async function getAirQuality(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (!response.ok) {
            throw new Error(`미세먼지 데이터를 가져오는데 실패했습니다. (${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error('미세먼지 데이터를 가져오는데 실패했습니다:', error);
        throw error;
    }
}

// 일별 예보 가져오기
async function getDailyForecast(lat, lon) {
    try {
        const response = await fetch(`${BASE_URL}/forecast/daily?lat=${lat}&lon=${lon}&units=metric&cnt=5&appid=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`일별 예보 데이터를 가져오는데 실패했습니다: ${response.status}`);
        }
        const data = await response.json();
        console.log('일별 예보 API 응답:', data);
        return data;
    } catch (error) {
        console.error('일별 예보 데이터 가져오기 실패:', error);
        throw error;
    }
}

// 현재 위치 가져오기
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.log('Geolocation이 지원되지 않습니다. 기본 위치(서울)를 사용합니다.');
            resolve(DEFAULT_LOCATION);
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('위치 정보를 성공적으로 가져왔습니다:', position.coords);
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.log('위치 정보를 가져오는데 실패했습니다:', error);
                console.log('기본 위치(서울)를 사용합니다.');
                resolve(DEFAULT_LOCATION);
            },
            options
        );
    });
}

// 날씨 데이터 표시하기
function displayWeatherData(data) {
    const location = document.querySelector('.location');
    const temperature = document.querySelector('.temperature');
    const weatherDesc = document.querySelector('.weather-desc');
    const weatherDetails = document.querySelector('.weather-details');

    if (!data) {
        location.textContent = '날씨 정보를 불러올 수 없습니다';
        return;
    }

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
    if (!hourlyList) return;

    hourlyList.innerHTML = '';

    if (!data || !data.list) {
        hourlyList.innerHTML = '<div class="error">시간별 예보를 불러올 수 없습니다</div>';
        return;
    }

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
            <div class="time">${hour}시</div>
            <div class="icon">${WEATHER_ICONS[weather] || '❓'}</div>
            <div class="temp">${temp}°</div>
        `;
        
        hourlyList.appendChild(forecastItem);
    });

    // 스와이프 기능 초기화
    initSwipe();
}

// 일별 예보 표시하기
function displayDailyForecast(data) {
    const dailyList = document.querySelector('.daily-list');
    if (!dailyList) {
        console.error('일별 예보를 표시할 요소를 찾을 수 없습니다.');
        return;
    }

    dailyList.innerHTML = '';

    if (!data || !data.list) {
        console.error('일별 예보 데이터가 없습니다:', data);
        dailyList.innerHTML = '<div class="error">일별 예보를 불러올 수 없습니다</div>';
        return;
    }

    console.log('일별 예보 원본 데이터:', data);

    // 5일 예보 데이터 처리
    const dailyForecasts = data.list.filter(forecast => {
        const date = new Date(forecast.dt * 1000);
        console.log('날짜 확인:', date.toLocaleString(), '시간:', date.getHours());
        return date.getHours() === 13; // 13시 데이터 사용
    }).slice(0, 5);

    console.log('필터링된 일별 예보:', dailyForecasts);

    if (dailyForecasts.length === 0) {
        console.log('13시 데이터가 없어 첫 번째 데이터를 사용합니다.');
        // 13시 데이터가 없는 경우 첫 번째 데이터를 사용
        const firstForecast = data.list[0];
        const date = new Date(firstForecast.dt * 1000);
        const day = DAYS[date.getDay()];
        const weather = firstForecast.weather[0].main;
        const maxTemp = Math.round(firstForecast.main.temp);
        const minTemp = Math.round(firstForecast.main.temp - 3); // 현재 기온보다 3도 낮은 값을 최저 기온으로 설정

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <div class="day">${day}</div>
            <div class="icon">${WEATHER_ICONS[weather] || '❓'}</div>
            <div class="temp-range">
                <span class="max">${maxTemp}°</span>
                <span class="min">${minTemp}°</span>
            </div>
        `;
        dailyList.appendChild(dailyItem);
        return;
    }

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = DAYS[date.getDay()];
        const weather = forecast.weather[0].main;
        const maxTemp = Math.round(forecast.main.temp);
        const minTemp = Math.round(forecast.main.temp - 3); // 현재 기온보다 3도 낮은 값을 최저 기온으로 설정

        console.log('일별 예보 항목:', {
            day,
            weather,
            maxTemp,
            minTemp,
            date: date.toLocaleString()
        });

        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        dailyItem.innerHTML = `
            <div class="day">${day}</div>
            <div class="icon">${WEATHER_ICONS[weather] || '❓'}</div>
            <div class="temp-range">
                <span class="max">${maxTemp}°</span>
                <span class="min">${minTemp}°</span>
            </div>
        `;

        dailyList.appendChild(dailyItem);
    });
}

// 미세먼지 정보 표시하기
function displayAirQuality(data) {
    const airQualityDetails = document.querySelector('.air-quality-details');
    if (!airQualityDetails) return;

    if (!data || !data.list || !data.list[0]) {
        airQualityDetails.innerHTML = '<div class="error">미세먼지 정보를 불러올 수 없습니다</div>';
        return;
    }

    const pm25 = data.list[0].components.pm2_5;
    const pm10 = data.list[0].components.pm10;

    // 미세먼지 등급 계산
    const getPM25Grade = (value) => {
        if (value <= 15) return '좋음';
        if (value <= 35) return '보통';
        if (value <= 75) return '나쁨';
        return '매우 나쁨';
    };

    const getPM10Grade = (value) => {
        if (value <= 30) return '좋음';
        if (value <= 80) return '보통';
        if (value <= 150) return '나쁨';
        return '매우 나쁨';
    };

    airQualityDetails.innerHTML = `
        <div class="air-quality-item">
            <span class="label">PM2.5</span>
            <span class="value">${getPM25Grade(pm25)} (${Math.round(pm25)}㎍/㎥)</span>
        </div>
        <div class="air-quality-item">
            <span class="label">PM10</span>
            <span class="value">${getPM10Grade(pm10)} (${Math.round(pm10)}㎍/㎥)</span>
        </div>
    `;
}

// 스와이프 기능 초기화
function initSwipe() {
    const hourlyList = document.querySelector('.hourly-list');
    if (!hourlyList) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    hourlyList.addEventListener('mousedown', (e) => {
        isDown = true;
        hourlyList.style.cursor = 'grabbing';
        startX = e.pageX - hourlyList.offsetLeft;
        scrollLeft = hourlyList.scrollLeft;
    });

    hourlyList.addEventListener('mouseleave', () => {
        isDown = false;
        hourlyList.style.cursor = 'grab';
    });

    hourlyList.addEventListener('mouseup', () => {
        isDown = false;
        hourlyList.style.cursor = 'grab';
    });

    hourlyList.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - hourlyList.offsetLeft;
        const walk = (x - startX) * 2;
        hourlyList.scrollLeft = scrollLeft - walk;
    });

    // 터치 이벤트 지원
    hourlyList.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - hourlyList.offsetLeft;
        scrollLeft = hourlyList.scrollLeft;
    });

    hourlyList.addEventListener('touchend', () => {
        isDown = false;
    });

    hourlyList.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - hourlyList.offsetLeft;
        const walk = (x - startX) * 2;
        hourlyList.scrollLeft = scrollLeft - walk;
    });
}

// Service Worker 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker 등록 성공:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker 등록 실패:', error);
            });
    });
}

// 날씨 데이터 캐싱
async function cacheWeatherData(data) {
    try {
        const cache = await caches.open('weather-data');
        await cache.put('/offline-data.json', new Response(JSON.stringify(data)));
        console.log('날씨 데이터가 캐시되었습니다');
    } catch (error) {
        console.error('날씨 데이터 캐싱 실패:', error);
    }
}

// 앱 초기화
async function initApp() {
    try {
        // 다크 모드 설정 복원
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }

        const position = await getCurrentLocation();
        console.log('사용할 위치 정보:', position);

        const [weatherData, forecastData, airQualityData] = await Promise.all([
            getWeatherData(position.latitude, position.longitude),
            getHourlyForecast(position.latitude, position.longitude),
            getAirQuality(position.latitude, position.longitude)
        ]);

        // 날씨 데이터 캐싱
        await cacheWeatherData({
            weather: weatherData,
            forecast: forecastData,
            airQuality: airQualityData,
            timestamp: Date.now()
        });

        displayWeatherData(weatherData);
        displayHourlyForecast(forecastData);
        displayDailyForecast(forecastData);
        displayAirQuality(airQualityData);

    } catch (error) {
        console.error('앱 초기화 중 오류가 발생했습니다:', error);
        // 오프라인 데이터 확인
        try {
            const cache = await caches.open('weather-data');
            const response = await cache.match('/offline-data.json');
            if (response) {
                const offlineData = await response.json();
                // 캐시된 데이터가 1시간 이내인 경우에만 사용
                if (Date.now() - offlineData.timestamp < 3600000) {
                    displayWeatherData(offlineData.weather);
                    displayHourlyForecast(offlineData.forecast);
                    displayDailyForecast(offlineData.forecast);
                    displayAirQuality(offlineData.airQuality);
                    return;
                }
            }
        } catch (cacheError) {
            console.error('캐시된 데이터 로드 실패:', cacheError);
        }
        // 에러 메시지 표시
        document.querySelector('.location').textContent = '날씨 정보를 불러올 수 없습니다';
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', initApp); 