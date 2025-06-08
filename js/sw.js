const CACHE_NAME = 'weather-app-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/assets/icons/',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('캐시가 열렸습니다');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 캐시 업데이트
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('이전 캐시를 삭제합니다:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 네트워크 요청 처리
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 있으면 캐시된 응답 반환
                if (response) {
                    return response;
                }

                // 캐시에 없으면 네트워크 요청
                return fetch(event.request)
                    .then((response) => {
                        // API 요청이 아닌 경우에만 캐시에 저장
                        if (!event.request.url.includes('api.openweathermap.org')) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // 오프라인 상태에서 API 요청인 경우 캐시된 날씨 데이터 반환
                        if (event.request.url.includes('api.openweathermap.org')) {
                            return caches.match('/offline-data.json');
                        }
                        // 그 외의 경우 오프라인 페이지 반환
                        return caches.match('/offline.html');
                    });
            })
    );
}); 