# 결제 완료 페이지 UI Flow

**라우트**: `/subscribes/payment/[subscribeId]/success`
**부모 화면**: 결제 페이지 (`/subscribes/payment/[subscribeId]`)
**타입**: 풀스크린 페이지

## 개요

결제가 성공적으로 완료된 후 표시되는 완료 화면입니다.
사용자의 환경(APP/WEB, MOBILE/DESKTOP)에 따라 다른 UI와 CTA를 제공합니다.

**주요 기능**:
- 결제 완료 축하 메시지 표시
- GA4 Purchase Done 이벤트 전송
- 다음 액션 안내 (예습, 앱 이동, 홈 이동)
- QR 코드 제공 (데스크톱 웹)

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 =====
    Start[결제 완료 후 리디렉션] --> LoadData[⏳ 데이터 로딩]
    LoadData --> CheckAuth{인증<br/>확인}
    CheckAuth -->|유효| LoadSuccess[데이터 로드 완료]
    CheckAuth -->|무효| RedirectLogin[로그인 페이지 리디렉션]

    LoadSuccess --> CheckEnv{환경<br/>감지}

    %% ===== 환경 분기 =====
    CheckEnv -->|APP + MOBILE| AppMobile[📱 앱 내 웹뷰 모바일]
    CheckEnv -->|WEB + MOBILE| WebMobile[🌐 웹브라우저 모바일]
    CheckEnv -->|WEB + DESKTOP| WebDesktop[💻 웹브라우저 데스크톱]

    %% ===== APP + MOBILE =====
    AppMobile --> RenderAppMobile[✅ 앱 모바일 UI]
    RenderAppMobile --> ShowLottie1[🎉 파티 포도 애니메이션]
    ShowLottie1 --> ShowMsg1["구매 완료 메시지<br/>'예습하러 가볼까요?'"]
    ShowMsg1 --> ShowCTA1[CTA 버튼]

    ShowCTA1 --> AppAction{사용자 액션}
    AppAction -->|예습하러 가기| GoPreview[수업 탐색 페이지 이동]
    AppAction -->|홈으로| GoHomeApp[홈 페이지 이동]

    GoPreview --> CheckCurriculum1{스마트톡?}
    CheckCurriculum1 -->|Yes| AIHome1[/home/ai]
    CheckCurriculum1 -->|No| RegularHome1[/home]

    GoHomeApp --> CheckCurriculum2{스마트톡?}
    CheckCurriculum2 -->|Yes| AIHome2[/home/ai]
    CheckCurriculum2 -->|No| RegularHome2[/home]

    %% ===== WEB + MOBILE =====
    WebMobile --> RenderWebMobile[✅ 웹 모바일 UI]
    RenderWebMobile --> ShowLottie2[🎉 파티 포도 애니메이션]
    ShowLottie2 --> ShowMsg2["구매 완료 메시지<br/>'앱으로 이동해 볼까요?'"]
    ShowMsg2 --> ShowCTA2[CTA 버튼]

    ShowCTA2 --> WebAction{사용자 액션}
    WebAction -->|앱으로 이동| OpenApp[앱 딥링크 실행]
    WebAction -->|홈으로| GoHomeWeb[홈 페이지 이동]

    OpenApp --> CheckAppInstalled{앱 설치<br/>여부?}
    CheckAppInstalled -->|설치됨| OpenExistingApp[앱 실행 → 홈 화면]
    CheckAppInstalled -->|미설치| RedirectStore[앱 스토어 리디렉션]

    GoHomeWeb --> CheckCurriculum3{스마트톡?}
    CheckCurriculum3 -->|Yes| AIHome3[/home/ai]
    CheckCurriculum3 -->|No| RegularHome3[/home]

    %% ===== WEB + DESKTOP =====
    WebDesktop --> RenderWebDesktop[✅ 웹 데스크톱 UI]
    RenderWebDesktop --> ShowMsg3["구매 완료 메시지<br/>'앱으로 이동해 볼까요?'"]
    ShowMsg3 --> ShowQR[📱 QR 코드 표시]
    ShowQR --> ShowCTA3[CTA 버튼]

    ShowCTA3 --> DesktopAction{사용자 액션}
    DesktopAction -->|QR 스캔| ScanQR[스마트폰으로 QR 스캔]
    DesktopAction -->|홈으로| GoHomeDesktop[홈 페이지 이동]

    ScanQR --> OpenAppStore[앱 다운로드/실행]
    GoHomeDesktop --> CheckCurriculum4{스마트톡?}
    CheckCurriculum4 -->|Yes| AIHome4[/home/ai]
    CheckCurriculum4 -->|No| RegularHome4[/home]

    %% ===== GA4 이벤트 =====
    LoadSuccess --> SendGA4[GA4 Purchase Done 이벤트 전송]
    SendGA4 --> CheckEnv

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef app fill:#9B59B6,stroke:#333,color:#fff
    classDef web fill:#3498DB,stroke:#333,color:#fff
    classDef desktop fill:#E67E22,stroke:#333,color:#fff

    class LoadSuccess,RenderAppMobile,RenderWebMobile,RenderWebDesktop normal
    class ShowLottie1,ShowLottie2,ShowMsg1,ShowMsg2,ShowMsg3 success
    class AppMobile,AppAction,GoPreview,GoHomeApp app
    class WebMobile,WebAction,OpenApp,GoHomeWeb web
    class WebDesktop,DesktopAction,ShowQR,GoHomeDesktop desktop
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시 데이터 로드
- [x] 사용자 정보 조회
- [x] 수강권 정보 조회

**UI 구성**:
- 로딩 스피너 위치: 전체 화면 중앙
- 스켈레톤 UI 사용 여부: No
- 컴포넌트: Suspense fallback

**구현**:
```tsx
<Suspense>
  <SubscribePaymentSuccessView />
</Suspense>
```

**timeout 처리**:
- timeout 시간: React Suspense 기본값
- timeout 시 동작: 에러 발생 시 `/subscribes/tickets`로 fallback

---

### 2. ✅ 성공 상태 (정상 컨텐츠)

**표시 조건**:
- [x] 결제 완료 후 정상 리디렉션
- [x] URL searchParams에 필수 정보 존재:
  - `curriculumType`: 수업 타입
  - `amount`: 결제 금액
  - `transactionId`: 거래 ID

**환경별 UI 구성**:

---

#### 2.1 📱 APP + MOBILE (앱 내 웹뷰, 모바일)

**감지 조건**:
```tsx
from: 'APP' && device: 'MOBILE'
// navigator.maxTouchPoints > 1
```

**UI 구성**:

**헤더**
- 제목: "결제완료"
- 뒤로 가기 버튼: 없음 (TitleTopNavigation)

**메인 컨텐츠**
1. **축하 애니메이션**
   - Lottie: 파티 포도 아이콘
   - 크기: 140x140px
   - 루프 재생

2. **메시지**
   - 제목: "구매가 완료되었어요!"
   - 부제: "레슨 예약을 위해 예습하러 가볼까요?"

3. **CTA 버튼 (2개)**
   - **주 버튼**: "예습하러 가기"
     - 액션: `/subscribes` 페이지로 이동
     - 수업 목록에서 예습 가능
   - **보조 버튼** (Ghost): "홈으로 이동하기"
     - 액션: 홈 페이지로 이동
     - 스마트톡: `/home/ai`
     - 일반 수업: `/home`

---

#### 2.2 🌐 WEB + MOBILE (웹브라우저, 모바일)

**감지 조건**:
```tsx
from: 'WEB' && device: 'MOBILE'
```

**UI 구성**:

**헤더**
- 제목: "결제완료"

**메인 컨텐츠**
1. **축하 애니메이션**
   - Lottie: 파티 포도 아이콘

2. **메시지**
   - 제목: "구매가 완료되었어요!"
   - 부제: "레슨 준비를 위해 앱으로 이동해 볼까요?"

3. **CTA 버튼 (2개)**
   - **주 버튼**: "앱으로 이동하기"
     - 액션: 앱 딥링크 실행
     - URL: `podo.onelink.me/NtcY/?af_js_web=true&af_force_deeplink=true&af_dp=podo://new_home_v1.php`
     - 앱 미설치 시: 앱 스토어로 리디렉션
   - **보조 버튼** (Ghost): "홈으로 이동하기"
     - 액션: 웹 홈 페이지로 이동

---

#### 2.3 💻 WEB + DESKTOP (웹브라우저, 데스크톱)

**감지 조건**:
```tsx
from: 'WEB' && device: 'DESKTOP'
// navigator.maxTouchPoints <= 1
```

**UI 구성**:

**메인 컨텐츠** (중앙 정렬)
1. **메시지**
   - 제목: "구매가 완료되었어요!"
   - 부제: "레슨 준비를 위해 앱으로 이동해 볼까요?"
   - 안내: "스마트폰으로 카메라 앱을 켜서"
          "QR코드를 포커스 해보세요."

2. **QR 코드**
   - URL: `${env.NEXT_PUBLIC_API_URL}/open-in-app`
   - 크기: 140x140px
   - 테두리: 4px primary 색상
   - 패딩: 8px

3. **구분선**
   - Separator

4. **CTA 버튼 (1개)**
   - **버튼** (Ghost): "홈으로 이동하기"
     - 액션: 웹 홈 페이지로 이동

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 인증 에러
```
조건: 로그인 세션 만료
동작: 자동 리디렉션
목적지: /subscribes/tickets
```

#### 3.2 데이터 로드 실패
```
조건: subscribeId 또는 거래 정보 조회 실패
동작: 자동 리디렉션
목적지: /subscribes/tickets
```

#### 3.3 필수 파라미터 누락
```
조건: amount, transactionId, curriculumType 누락
동작: GA4 이벤트 미전송, UI는 정상 표시
```

---

### 4. 📭 Empty State

결제 완료 페이지는 Empty State가 없습니다.
데이터가 없으면 에러로 처리하여 리디렉션됩니다.

---

## GA4 이벤트

### Purchase Done 이벤트

**전송 조건**:
- [x] 화면 로드 완료
- [x] 필수 데이터 존재 (`amount`, `transactionId`, `subscribeTicket`, `userInfo`)
- [x] 한 번만 전송 (중복 방지: `useRef`)

**이벤트 페이로드**:
```typescript
{
  transactionId: string,        // 거래 ID
  value: number,                // 결제 금액
  currency: 'KRW',              // 통화
  items: [{
    itemId: string,             // 수강권 이름
    itemName: string,           // 수강권 이름
    itemCategory: 'Package',    // 카테고리 (고정)
    price: number,              // 가격
    quantity: 1                 // 수량 (고정)
  }],
  userId: string,               // 사용자 ID
  userName: string,             // 사용자 이름
  userPhone: string,            // 전화번호
  userEmail: string             // 이메일
}
```

**구현**:
```tsx
const hasSentPurchaseDoneRef = useRef(false)
useEffect(() => {
  if (hasSentPurchaseDoneRef.current) return
  if (!hasRequiredData) return

  sendGA4PurchaseDoneEvent(payload)
  hasSentPurchaseDoneRef.current = true
}, [/* dependencies */])
```

---

## Validation Rules

결제 완료 페이지는 입력 폼이 없으므로 validation 불필요.

---

## 모달 & 다이얼로그

이 화면에서 직접 표시되는 모달은 없음.

---

## Edge Cases

### 1. GA4 이벤트 중복 전송 방지

- **조건**: React Strict Mode 또는 컴포넌트 재렌더링
- **동작**: `useRef`로 전송 여부 추적, 한 번만 전송
- **UI**: 사용자에게 영향 없음

### 2. QR 코드 스캔 (데스크톱)

- **조건**: 데스크톱 웹에서 QR 코드 표시
- **동작**: 스마트폰 카메라로 스캔
- **결과**:
  - 앱 설치됨: 앱 실행 → 홈 화면
  - 앱 미설치: 앱 스토어로 리디렉션 → 다운로드 유도

### 3. 앱 딥링크 실패 (모바일 웹)

- **조건**: "앱으로 이동하기" 클릭 시 앱 미설치
- **동작**: OneLink가 자동으로 앱 스토어로 리디렉션
- **UI**: 사용자는 앱 스토어에서 앱 다운로드 가능

### 4. 스마트톡 vs 일반 수업

- **조건**: `curriculumType === 'SMART_TALK'`
- **동작**: 홈 이동 시 `/home/ai`로 이동 (AI Home)
- **조건**: 그 외
- **동작**: 홈 이동 시 `/home`로 이동 (일반 Home)

### 5. 필수 파라미터 누락

- **조건**: `amount`, `transactionId`, `curriculumType` 중 하나라도 누락
- **동작**:
  - GA4 이벤트 미전송
  - UI는 정상 표시 (사용자에게 영향 최소화)
  - CTA 버튼은 정상 작동

### 6. SSR 환경

- **조건**: 서버 사이드 렌더링 시 `window` 객체 없음
- **동작**: `null` 반환 (클라이언트에서만 렌더링)
- **코드**:
  ```tsx
  if (typeof window === 'undefined') return null
  ```

### 7. 디바이스 감지

- **조건**: 터치 포인트로 MOBILE/DESKTOP 구분
- **기준**: `navigator.maxTouchPoints > 1` → MOBILE
- **주의**: 터치 가능한 노트북도 MOBILE로 감지될 수 있음

---

## 개발 참고사항

**주요 API**:
- `GET /api/users/current` - 현재 사용자 정보 조회
- `GET /api/subscribes/[subscribeId]` - 수강권 정보 조회

**상태 관리**:
- React Query:
  - `userEntityQueries.getCurrentUser`: 사용자 정보
  - `SubscribesTicketEntityQueries.getSubscribesTicket`: 수강권 정보
- URL searchParams:
  - `curriculumType`: 수업 타입
  - `amount`: 결제 금액
  - `transactionId`: 거래 ID
  - `promotionType`: 프로모션 타입 (optional)

**Feature Flags**:
- 없음

**외부 서비스**:
- **OneLink (앱스플라이어)**:
  - URL: `podo.onelink.me/NtcY/...`
  - 딥링크 + 폴백 URL 제공
  - 앱 설치 여부에 따라 자동 분기

**주요 컴포넌트**:
- `SubscribePaymentSuccessView`: 메인 페이지 컴포넌트
- `PartyPodoIconLottie`: 축하 애니메이션
- `QRCode` (react-qr-code): QR 코드 생성

**디바이스 감지**:
```tsx
const device = navigator.maxTouchPoints > 1 ? 'MOBILE' : 'DESKTOP'
```

**from 값**:
- `from: 'APP'`: 앱 내 웹뷰
- `from: 'WEB'`: 일반 웹브라우저
- 출처: `useNativeBridgeStore()`

---

## 디자인 참고

- Figma: (추가 필요)
- 디자인 노트:
  - 모바일: 세로 중앙 정렬 레이아웃
  - 데스크톱: 가로/세로 중앙 정렬, QR 코드 강조
  - Lottie 애니메이션: 파티 포도 (축하 분위기)

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | Claude | 최초 작성 |
