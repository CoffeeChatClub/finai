# 금융 데이터 분석 프로젝트

이 프로젝트는 기업의 금융 데이터를 분석하기 위한 클라이언트 측 React 애플리케이션과 서버 측 Node.js 애플리케이션으로 구성되어 있습니다.

## 프로젝트 구조

이 프로젝트는 두 가지 주요 부분으로 나뉩니다:

1. 클라이언트 (React + TypeScript + Vite)
2. 서버 (Node.js + Express)

## 클라이언트

클라이언트는 TypeScript와 Vite로 구축된 React 애플리케이션입니다.

### 설정

1. `client` 디렉토리로 이동합니다.
2. 종속성을 설치합니다:
   ```
   npm install
   ```
3. `.env.example`을 기반으로 `.env` 파일을 만듭니다:
   ```
   VITE_SERVER_ADDRESS=http://localhost:3000
   ```

### 클라이언트 실행

개발 서버를 시작하려면:

npm run dev


### 프로덕션 빌드

프로덕션용 클라이언트를 빌드하려면:

npm run build


## 서버

서버는 Express를 사용하는 Node.js 애플리케이션입니다.

### 설정

1. `server` 디렉토리로 이동합니다.
2. 종속성을 설치합니다:
   ```
   npm install
   ```
3. `.env` 파일을 만들고 OpenAI API 키를 추가합니다:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### 서버 실행

서버를 시작하려면:

npm start


## 기능

- 기업 코드 조회
- 금융 데이터 검색
- 데이터 분석을 위한 채팅 인터페이스
- 지능형 응답을 위한 OpenAI API 통합

## API 엔드포인트

서버는 다음과 같은 주요 엔드포인트를 제공합니다:

- `POST /api/chat`: 채팅 인터페이스에 메시지 전송

## 데이터베이스

서버는 SQLite를 사용하여 기업 데이터를 저장합니다. 데이터베이스 파일(`corpcode.db`)은 존재하지 않을 경우 자동으로 생성됩니다.

## 도구

서버에는 데이터 검색을 위한 여러 도구가 포함되어 있습니다:

- `action_get_corp_code`: 기업 이름으로 기업 코드 가져오기
- `action_get_single_company_key_financials`: 단일 기업의 주요 재무 정보 가져오기

이 도구들은 금융 데이터 API와 상호 작용하여 기업에 대한 특정 정보를 검색하는 데 사용됩니다.

## 기여

코드 오브 컨덕트 및 풀 리퀘스트 제출 절차에 대한 자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하십시오.

## 라이선스

이 프로젝트는 ISC 라이선스에 따라 라이선스가 부여됩니다. 자세한 내용은 [LICENSE.md](LICENSE.md) 파일을 참조하십시오.
