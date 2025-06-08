# 날씨 웹 앱

모바일 친화적인 날씨 정보 웹 애플리케이션입니다. (모든 코드는 AI가 만들었음.)

## 기능

- 현재 날씨 정보 표시
- 시간별 날씨 예보
- 일별 날씨 예보
- 미세먼지 정보
- 다크 모드 지원
- 반응형 디자인

## 기술 스택

- HTML5
- CSS3
- JavaScript (Vanilla)
- OpenWeatherMap API

## 시작하기

1. 저장소 클론
```bash
git clone [repository-url]
cd weather-app
```

2. OpenWeatherMap API 키 발급
- [OpenWeatherMap](https://openweathermap.org/)에서 계정 생성
- API 키 발급
- `js/app.js` 파일의 `API_KEY` 변수에 발급받은 키 입력

3. 로컬 서버 실행
- VS Code의 Live Server 확장 프로그램 사용
- 또는 Python의 내장 서버 사용:
```bash
python -m http.server
```

## 프로젝트 구조

```
weather-app/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
└── README.md
```

## 개발 가이드

### 코드 스타일
- HTML: 시맨틱 마크업 사용
- CSS: BEM 방법론 적용
- JavaScript: ES6+ 문법 사용

### 브라우저 지원
- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

MIT License 