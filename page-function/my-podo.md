# 마이포도 화면 UI Flow

**라우트**: `/my-podo`
**부모 화면**: Bottom Tab Navigation
**타입**: 메인 화면 (Bottom Tab)

## 개요

포도 앱의 사용자 프로필, 수강권, 결제, 설정을 관리하는 허브 화면입니다. 사용자는 여기서 자신의 정보를 확인하고, 수강권 및 결제 관리, 각종 설정에 접근할 수 있습니다.

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 =====
    Start[마이포도 탭 클릭] --> Init{초기화}
    Init --> Prefetch[⏳ 서버 측 Prefetch]

    %% ===== 데이터 Prefetch (서버 측) =====
    Prefetch --> PrefetchAll{Prefetch 4개 API<br/>병렬 실행}
    PrefetchAll -->|1| UserAPI[GET /user/current]
    PrefetchAll -->|2| TicketAPI[GET /tickets/subscribes]
    PrefetchAll -->|3| CouponAPI[GET /coupons/available]
    PrefetchAll -->|4| PaymentAPI[GET /payment-methods]

    UserAPI --> Hydrate[HydrationBoundary]
    TicketAPI --> Hydrate
    CouponAPI --> Hydrate
    PaymentAPI --> Hydrate

    %% ===== 클라이언트 렌더링 시작 =====
    Hydrate --> Render[📱 클라이언트 렌더링]

    %% ===== 섹션별 로딩 =====
    Render --> ProfileLoad{ProfileSection<br/>로드}
    ProfileLoad -->|Suspense| ProfileSkeleton[FallbackProfileSection]
    ProfileLoad -->|성공| Profile[✅ 프로필 섹션]
    ProfileLoad -->|실패| ProfileError[ErrorBoundary catch]

    Profile --> SubLoad{SubscriptionSection<br/>로드}
    SubLoad -->|Suspense| SubSkeleton[FallbackSubscriptionSection]
    SubLoad -->|성공| Subscription[✅ 레슨권 및 결제]
    SubLoad -->|실패| SubError[ErrorBoundary catch]

    Subscription --> LessonLoad{LessonManageSection<br/>로드}
    LessonLoad -->|Suspense| LessonSkeleton[최소 높이 화면]
    LessonLoad -->|성공| LessonCheck{Feature Flag<br/>TUTOR_BLOCK?}
    LessonCheck -->|enabled| Lesson[✅ 레슨 관리 섹션]
    LessonCheck -->|disabled| SkipLesson[섹션 숨김]
    LessonLoad -->|실패| SkipLesson

    Lesson --> CustomerLoad{CustomerCenterSection<br/>로드}
    SkipLesson --> CustomerLoad
    CustomerLoad -->|Suspense| CustomerSkeleton[최소 높이 화면]
    CustomerLoad -->|성공| Customer[✅ 고객센터 섹션]
    CustomerLoad -->|실패| CustomerError[ErrorBoundary catch]

    Customer --> SettingLoad{SettingSection<br/>로드}
    SettingLoad -->|Suspense| SettingSkeleton[최소 높이 화면]
    SettingLoad -->|성공| Setting[✅ 설정 섹션]
    SettingLoad -->|실패| SettingError[ErrorBoundary catch]

    Setting --> Content[✅ 마이포도 완료]

    %% ===== 에러 처리 =====
    ProfileError --> ErrorFallback[❌ SectionErrorFallback]
    SubError --> ErrorFallback
    CustomerError --> ErrorFallback
    SettingError --> ErrorFallback
    ErrorFallback --> Retry((재시도 버튼))
    Retry --> Render

    %% ===== 사용자 인터랙션 - 프로필 섹션 =====
    Content --> Actions{사용자 액션}
    Actions -->|프로필 클릭| ProfileEdit[프로필 수정 화면]

    %% ===== 사용자 인터랙션 - 레슨권 및 결제 =====
    Actions -->|마이 포도 플랜| PlanCheck{Feature Flag<br/>MY_PODO_PLAN_MIGRATION?}
    PlanCheck -->|enabled| PlanNew[/my-podo/plan]
    PlanCheck -->|disabled| PlanLegacy[레거시 플랜 화면]

    Actions -->|마이쿠폰| CouponPage[/my-podo/coupon]
    Actions -->|결제수단| PaymentPage[/my-podo/payment-methods]

    %% ===== 사용자 인터랙션 - 레슨 관리 =====
    Actions -->|차단 튜터 관리| TutorBlock[/my-podo/tutor-exclusion]

    %% ===== 사용자 인터랙션 - 고객센터 =====
    Actions -->|고객센터| FAQ[레거시 FAQ 화면]

    %% ===== 사용자 인터랙션 - 설정 =====
    Actions -->|공지사항| Notices[/my-podo/notices]
    Actions -->|알림설정| NotificationSettings[/my-podo/notification-settings]
    Actions -->|로그아웃| Logout[로그아웃 페이지 이동]
    Logout --> LoginPage[로그인 화면]

    Actions -->|회원탈퇴| RevokeCheck{Apple 로그인 &<br/>Feature Flag?}
    RevokeCheck -->|Yes| Revoke[탈퇴 페이지로 redirect]
    Revoke --> LoginPage

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef loading fill:#F39C12,stroke:#333,color:#fff
    classDef skeleton fill:#BDC3C7,stroke:#333,color:#333
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef api fill:#9B59B6,stroke:#333,color:#fff
    classDef page fill:#E67E22,stroke:#333,color:#fff

    class Profile,Subscription,Lesson,Customer,Setting,Content normal
    class Prefetch,ProfileLoad,SubLoad,LessonLoad,CustomerLoad,SettingLoad loading
    class ProfileSkeleton,SubSkeleton,LessonSkeleton,CustomerSkeleton,SettingSkeleton skeleton
    class ErrorFallback,ProfileError,SubError,CustomerError,SettingError error
    class Hydrate success
    class UserAPI,TicketAPI,CouponAPI,PaymentAPI api
    class PlanNew,PlanLegacy,CouponPage,PaymentPage,TutorBlock,FAQ,Notices,NotificationSettings page
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시
- [x] 섹션별 데이터 로드 시
- [x] Pull-to-refresh 시

**UI 구성**:
- 로딩 스피너 위치: 각 섹션별로 Suspense fallback 표시
- 스켈레톤 UI 사용 여부: **Yes**
  - `FallbackProfileSection`: 프로필 아이콘만 표시
  - `FallbackSubscriptionSection`: 섹션 제목과 메뉴 항목 표시 (데이터 없음)
  - 나머지 섹션: 최소 높이 화면
- 로딩 텍스트: 없음 (시각적 스켈레톤만)

**서버 측 Prefetch**:
- 4개 API 병렬 prefetch (Next.js 서버 컴포넌트)
  - `userEntityQueries.getCurrentUser` - 사용자 정보
  - `subscribesEntityQueries.getTicketSubscribeList` - 수강권 목록
  - `couponEntityQueries.availableCoupons` - 사용 가능 쿠폰
  - `paymentMethodsEntityQueries.getRegisteredPaymentMethods` - 등록된 결제수단

**timeout 처리**:
- timeout 시간: React Query 기본값 사용 추정
- timeout 시 동작: ErrorBoundary catch 후 `SectionErrorFallback` 표시

---

### 2. ✅ 성공 상태 (정상 컨텐츠)

**표시 조건**:
- [x] 모든 API 응답 성공
- [x] 사용자 로그인 상태

**UI 구성**:

- **헤더 (TopStickyContainer)**:
  - `AppInstallBanner`: 앱 설치 배너 (모바일 웹 전용)
  - `TitleTopNavigation`: "마이 포도" 타이틀

- **메인 컨텐츠 (순서대로)**:

  **1. ProfileSection (프로필)**
  - 프로필 아이콘
  - 사용자 이름 (h3)
  - 이메일 (body1, gray-400)
  - 우측 화살표 아이콘
  - **클릭 시**: 프로필 수정 화면 (`/app/android/update_user.php`) 이동

  **2. SubscriptionSection (레슨권 및 결제)**
  - 섹션 제목: "레슨권 및 결제" (body2, gray-400)

  - **마이 포도 플랜**:
    - Feature Flag에 따라 라우트 변경
      - `TBD_260210_MY_PODO_PLAN_MIGRATION` enabled → `/my-podo/plan`
      - disabled → `/app/user/podo/mypage/plan` (레거시)
    - 수강권 표시 로직:
      - 0개: 표시 없음
      - 1개: `{수강권 이름}` (green-500, bold)
      - 2개 이상: `{첫번째 수강권 이름} 외 {N-1}개` (green-500, bold)

  - **마이쿠폰**:
    - 라우트: `/my-podo/coupon`
    - 사용 가능 쿠폰 개수 표시 (0개면 표시 없음)
    - 개수 표시 형식: `{N}개` (green-500, bold)

  - **결제수단**:
    - 라우트: `/my-podo/payment-methods`
    - 등록된 결제수단 표시:
      - CARD: 카드 이름 표시
      - KAKAO: "카카오페이" 표시
      - 없으면: 표시 없음

  **3. LessonManageSection (레슨 관리)** - Feature Flag 제어
  - Feature Flag: `TBD_260219_TUTOR_BLOCK`
  - **enabled일 때만 표시**:
    - 섹션 제목: "레슨 관리" (body2, gray-400)
    - **차단 튜터 관리**: `/my-podo/tutor-exclusion`

  **4. CustomerCenterSection (문의)**
  - 섹션 제목: "문의" (body2, gray-400)
  - **고객센터**: 레거시 FAQ 화면 (`/app/android/podo_ticket/faq.php`)

  **5. SettingSection (설정)**
  - 섹션 제목: "설정" (body2, gray-400)
  - **공지사항**: `/my-podo/notices`
  - **알림설정**: `/my-podo/notification-settings`
  - **버전확인** (네이티브 앱에서만 표시):
    - `nativeStore.from === 'APP'`일 때만 표시
    - 현재 버전: `{runtimeVersion}` (green-500, bold)
  - **로그아웃**:
    - 클릭 시 로그아웃 API 호출
    - `/api/v2/authentication/{oauthProviderName}/logout`
  - **회원탈퇴** (조건부 표시):
    - Feature Flag: `APPLE_LOGIN` enabled
    - Runtime Version 일치: `SUBMITTING_RUNTIME_VERSION === runtimeVersion`
    - 클릭 시 Apple 계정 해지 API 호출

- **푸터**:
  - Bottom Tab Navigation (전역 컴포넌트)

**인터랙션 요소**:

1. **프로필 섹션 클릭**
   - 액션: 프로필 수정 화면 이동
   - Validation: 없음
   - 결과: `/app/android/update_user.php?UID={userId}&USER_TOKEN={token}` 이동

2. **마이 포도 플랜**
   - 액션: 플랜 상세 화면 이동
   - Validation: 없음
   - 결과: Feature Flag에 따라 `/my-podo/plan` 또는 레거시 화면

3. **마이쿠폰**
   - 액션: 쿠폰 목록 화면 이동
   - Validation: 없음
   - 결과: `/my-podo/coupon` 화면 이동

4. **결제수단**
   - 액션: 결제수단 관리 화면 이동
   - Validation: 없음
   - 결과: `/my-podo/payment-methods` 화면 이동

5. **차단 튜터 관리**
   - 액션: 차단 튜터 목록 화면 이동
   - Validation: Feature Flag 체크
   - 결과: `/my-podo/tutor-exclusion` 화면 이동

6. **고객센터**
   - 액션: FAQ 화면 이동
   - Validation: 없음
   - 결과: 레거시 FAQ 화면 (`/app/android/podo_ticket/faq.php`) 이동

7. **공지사항**
   - 액션: 공지사항 목록 화면 이동
   - Validation: 없음
   - 결과: `/my-podo/notices` 화면 이동

8. **알림설정**
   - 액션: 알림 설정 화면 이동
   - Validation: 없음
   - 결과: `/my-podo/notification-settings` 화면 이동

9. **로그아웃**
   - 액션: 로그아웃 페이지로 즉시 이동 (확인 없음)
   - Validation: 로그인 상태 체크
   - 결과: `/api/v2/authentication/{oauthProviderName}/logout` 페이지 이동 → 로그아웃 처리

10. **회원탈퇴**
    - 액션: 탈퇴 페이지로 redirect (확인 없음)
    - Validation: Apple 로그인 & Feature Flag & Runtime Version 일치
    - 결과: `/callback/oauth/delete-apple-account/{userId}` 페이지로 redirect → 별도 페이지에서 탈퇴 처리

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 섹션별 에러 (ProfileSection, SubscriptionSection, CustomerCenterSection, SettingSection)

**표시 컴포넌트**: `SectionErrorFallback`

```
에러 메시지: "정보를 불러오지 못했습니다."
CTA: [다시 시도] (Button variant="ghost")
동작: ErrorBoundary가 각 섹션을 감싸고 있어 섹션별 독립적 에러 처리
```

**특징**:
- 다른 섹션은 정상 표시 (섹션별 독립적 에러 처리)
- 재시도 버튼 클릭 시 해당 섹션만 다시 로드

#### 3.2 LessonManageSection 에러

**특징**:
- ErrorBoundary 없음 (Suspense만)
- 에러 발생 시: Feature Flag disabled와 동일하게 섹션 숨김

#### 3.3 인증 에러 (401)

```
결과: 자동 로그아웃 후 로그인 화면 이동
```

**참고**: 네트워크 에러, 서버 에러 모두 `SectionErrorFallback`으로 동일하게 처리되며, 별도 에러 메시지 분기는 없습니다.

---

### 4. 📭 Empty State

마이포도 화면은 Empty State가 없습니다. 데이터가 없어도 섹션은 항상 표시되며, 각 항목의 우측 데이터만 표시되지 않습니다.

**예시**:
- 수강권 0개: "마이 포도 플랜" 항목만 표시, 우측 수강권 이름 없음
- 쿠폰 0개: "마이쿠폰" 항목만 표시, 우측 개수 표시 없음
- 결제수단 없음: "결제수단" 항목만 표시, 우측 결제수단 이름 없음

---

## Validation Rules

마이포도 화면은 읽기 전용 화면이므로 input validation은 없습니다.

**접근 권한 Validation**:
- 로그인 필수: **Yes**
- 세션 유효성 체크: 세션 만료 시 자동 로그아웃

---

## 모달 & 다이얼로그

**마이포도 화면에는 모달이나 다이얼로그가 없습니다.**

- 로그아웃: 버튼 클릭 시 즉시 로그아웃 페이지로 이동 (확인 없음)
- 회원탈퇴: 버튼 클릭 시 즉시 탈퇴 페이지로 redirect (확인 없음, 탈퇴 페이지에서 확인 가능)

---

## Edge Cases

### 1. Feature Flag 변경

**조건**: Feature Flag 값이 세션 중 변경
**동작**:
- 화면 새로고침 전까지 이전 Flag 값 유지
- 새로고침 시 새로운 Flag 값 반영
**UI**:
- 자동 업데이트 없음 (새로고침 필요)

---

### 2. 신규 사용자 (데이터 없음)

**조건**: 수강권, 쿠폰, 결제수단 모두 없음
**동작**:
- 각 항목 우측 데이터 표시 없음
- CTA나 Empty State 없음 (항목만 표시)
**UI**:
- 정상 화면과 동일, 데이터만 없음

---

### 3. Apple 로그인 사용자 - 회원탈퇴

**조건**:
- Apple 로그인 사용자
- Feature Flag `APPLE_LOGIN` enabled
- Runtime Version 일치

**동작**:
- 회원탈퇴 버튼 표시
- 클릭 시 Apple 계정 해지 API 호출
**UI**:
- 설정 섹션 하단에 "회원탈퇴" 항목 추가

---

### 4. 네이티브 앱 vs 모바일 웹

**조건**: `nativeStore.from`에 따라 분기
**동작**:
- 네이티브 앱 (`from === 'APP'`): 버전확인 섹션 표시
- 모바일 웹: 버전확인 섹션 숨김
**UI**:
- 네이티브 앱만 "버전확인" 항목 표시

---

## 개발 참고사항

**주요 API**:
- `GET /api/users/current` - 현재 사용자 정보
- `GET /api/tickets/subscribes` - 수강권 목록
- `GET /api/coupons/available` - 사용 가능 쿠폰
- `GET /api/payment-methods` - 등록된 결제수단 (retry: false 설정)

**페이지 이동**:
- `/api/v2/authentication/{oauthProviderName}/logout` - 로그아웃 페이지
- `/callback/oauth/delete-apple-account/{userId}` - Apple 계정 탈퇴 페이지

**상태 관리**:
- React Query + Suspense + ErrorBoundary 패턴 사용
- 서버 컴포넌트에서 prefetch 후 HydrationBoundary로 전달
- 각 섹션은 독립적으로 ErrorBoundary로 감싸져 있음

**Feature Flags**:
- `TBD_260210_MY_PODO_PLAN_MIGRATION`: 마이 포도 플랜 마이그레이션
- `TBD_260219_TUTOR_BLOCK`: 튜터 차단 기능
- `APPLE_LOGIN`: Apple 로그인 & 회원탈퇴 기능
- `SUBMITTING_RUNTIME_VERSION`: 제출된 런타임 버전 (회원탈퇴 조건)

**컴포넌트 구조**:
```
Page (Server Component)
├─ HydrationBoundary (Prefetch 데이터)
├─ TopStickyContainer
│  ├─ AppInstallBanner
│  └─ TitleTopNavigation
└─ PageContent
   ├─ ErrorBoundary → Suspense → ProfileSection
   ├─ ErrorBoundary → Suspense → SubscriptionSection
   ├─ Suspense → LessonManageSection
   ├─ ErrorBoundary → Suspense → CustomerCenterSection
   └─ ErrorBoundary → Suspense → SettingSection
```

---

## 디자인 참고

- Figma: <!-- TODO: Figma 링크 추가 -->
- 디자인 노트:
  - 각 섹션은 20px 상단 여백
  - 각 항목은 14px 상하 여백
  - 우측 화살표 아이콘은 모든 클릭 가능 항목에 표시
  - 데이터가 있는 항목은 green-500 bold로 강조

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | Claude | 코드 분석 기반 초안 작성 |
