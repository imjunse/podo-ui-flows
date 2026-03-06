# Podo App - Critical Path FigJam 다이어그램

신규 유저가 앱을 다운로드하여 첫 수업을 완료하기까지의 핵심 여정을 시각화한 FigJam 다이어그램 가이드입니다.

---

## 🎯 사용자 여정 (User Journey)

```
앱 다운로드 → 로그인 → 홈 화면 → 수업 탐색 → 체험/수강권 선택 → 결제 → 예약 → 수업 진행 → 리뷰
```

---

## 📋 FigJam 구성 방법

### 1. 캔버스 레이아웃

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎯 Podo App - Critical User Journey           │
│                    (신규 유저 첫 수업까지의 여정)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🔐 Auth Flow  →  🏠 Home Flow  →  💳 Payment Flow  →            │
│                                                                   │
│  →  📅 Reservation  →  📖 Lesson Flow  →  ✅ Complete            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. 색상 코드

- 🔴 **빨강 (Auth)**: 인증/로그인 관련
- 🔵 **파랑 (Home)**: 홈 화면 및 기본 네비게이션
- 🟢 **초록 (Payment)**: 구독/결제 관련
- 🟡 **노랑 (Lesson)**: 수업 진행 관련
- 🟣 **보라 (AI)**: AI/스마트톡 관련
- ⚪ **회색 (Loading/Error)**: 로딩 상태 및 에러

### 3. 노드 타입

- **사각형**: 주요 화면
- **둥근 사각형**: 컴포넌트/섹션
- **다이아몬드**: 의사결정 포인트
- **원**: 액션/이벤트
- **구름 모양**: 로딩 상태
- **육각형**: 에러/예외 처리

---

## 🗺️ 상세 플로우 다이어그램

### Flow 1: 🔐 인증 플로우 (Auth Flow)

```
[앱 설치] → [앱 실행] → [로그인 화면] → [OAuth 선택] → [OAuth 인증] → [리디렉션]
   │           │            /login
   │           └─ 첫 실행 체크
   └─ External: 앱 설치 배너

[리디렉션] → {HomeRedirection 체크}
               │
               ├─ AI 전용 수강권만? → [🤖 AI Home]
               └─ 그 외 → [🏠 Basic Home]
```

**주요 화면**:
- 🌐 외부: 앱 설치 배너
- 🔐 Login (`/login`)
- 🔄 OAuth Redirect
- 🔀 HomeRedirection 로직

**화면 플레이스홀더**:
- `[이미지] 앱 설치 배너`
- `[이미지] 로그인 화면`
- `[이미지] OAuth 선택 화면`

---

### Flow 2: 🏠 홈 화면 플로우 (Home Flow)

#### 2-1. Basic Home

```
[Basic Home] → [⏳ 로딩 시작]
                  │
                  ├─ [배너 로드]
                  │   ├─ 로딩 중 → [HomeBannerSkeleton]
                  │   ├─ 성공 → [📸 HomeBannerCarousel]
                  │   └─ 실패 → [❌ Error]
                  │
                  ├─ [인사말 로드]
                  │   ├─ 로딩 중 → [GreetingContent.Skeleton]
                  │   ├─ 성공 → [👋 GreetingContent]
                  │   │            │
                  │   │            └─ {체험 유저?}
                  │   │                ├─ Yes → [🎓 TrialTutorial]
                  │   │                └─ No → 다음 단계
                  │   └─ 실패 → [❌ Error]
                  │
                  └─ [수업 준비 로드]
                      ├─ 로딩 중 → [ClassPrepareSkeleton]
                      ├─ 성공 → [📚 ClassPrepareWidget]
                      └─ 실패 → [❌ Error]

[Basic Home 완료] → {팝업 조건}
                      ├─ 공지사항 → [[HomePopupBottomSheet]]
                      ├─ 재방문 → [[WelcomeBackPopup]]
                      ├─ tutorId 파라미터 → [[TutorProfileBottomSheet]]
                      └─ 없음 → [✅ Basic Home Ready]

[사용자 액션]
  ├─ 배너 클릭 → [배너 링크 이동]
  ├─ 인사말 섹션 → [수강권/레벨 확인]
  ├─ 수업 준비 클릭 → [수업 상세 이동]
  └─ 하단 탭 → [다른 탭]
```

#### 2-2. AI Home

```
[AI Home] → [⏳ AI 로딩 시작]
             │
             ├─ [온보딩 로드]
             │   ├─ 로딩 중 → [최소 높이 화면]
             │   ├─ 성공 → [🎯 CharacterChatOnboardingSection]
             │   └─ 실패 → [❌ AI Error]
             │
             └─ [추천 챗 로드]
                 ├─ 로딩 중 → [체험/추천 챗 타이틀]
                 ├─ 성공 → [🤖 RecommendCharacterChatSection]
                 └─ 실패 → [❌ AI Error]

[AI Home 완료] → {팝업 조건}
                  ├─ 공지사항 → [[HomePopupBottomSheet]]
                  └─ 없음 → [✅ AI Home Ready]

[사용자 액션]
  ├─ 티켓 아이콘 → {유저 타입}
  │                 ├─ 체험 → [스마트톡 수강권]
  │                 └─ 정식 → [수업 탐색]
  ├─ 캐릭터 챗 선택 → [챗 상세/시작]
  └─ 하단 탭 → [다른 탭]
```

**주요 화면**:
- 🏠 Basic Home (`/home`)
- 🤖 AI Home (`/home/ai`)
- 📸 HomeBannerCarousel
- 👋 GreetingContent
- 📚 ClassPrepareWidget
- 🎓 TrialTutorial
- 🎯 CharacterChatOnboardingSection
- 🤖 RecommendCharacterChatSection

**화면 플레이스홀더**:
- `[이미지] Basic Home 메인`
- `[이미지] AI Home 메인`
- `[이미지] 각 컴포넌트별 스크린샷`

---

### Flow 3: 💳 수업 탐색 & 결제 플로우 (Subscription & Payment Flow)

```
[Home] → [수업 탐색 탭] → [📚 수업 탐색]
                            /subscribes
                               │
                               ├─ [수강권 목록]
                               │   /subscribes/tickets
                               │   │
                               │   ├─ [수강권 V2]
                               │   │   /subscribes/tickets-v2
                               │   │
                               │   ├─ [스마트톡 수강권]
                               │   │   /subscribes/tickets/smart-talk
                               │   │
                               │   └─ [페이백 수강권]
                               │       /subscribes/tickets/payback
                               │
                               ├─ [체험 수업]
                               │   /subscribes/trial
                               │   │
                               │   └─ [체험 스마트톡]
                               │       /subscribes/trial/smart-talk
                               │       │
                               │       └─ [체험 스마트톡 상세]
                               │           /subscribes/trial/smart-talk/detail
                               │
                               └─ 선택 완료

[수강권 선택] → [💳 결제 페이지]
                 /subscribes/payment/[id]
                    │
                    ├─ 결제 정보 입력
                    ├─ 쿠폰 적용
                    ├─ 결제 수단 선택
                    └─ 결제 진행

[결제 진행] → {결제 성공?}
               ├─ 성공 → [✅ 결제 완료]
               │          /subscribes/payment/[id]/success
               │          │
               │          └─ {다음 액션}
               │              ├─ 예습하러 가기 → [수업 탐색]
               │              ├─ 홈으로 (Basic) → [🏠 Home]
               │              └─ 홈으로 (AI) → [🤖 AI Home]
               │
               └─ 실패 → [❌ 결제 실패] → [재시도]
```

**주요 화면**:
- 📚 수업 탐색 (`/subscribes`)
- 🎫 수강권 목록 (tickets, tickets-v2)
- 🤖 스마트톡 수강권
- 💰 페이백 수강권
- 🆓 체험 수업
- 💳 결제 페이지
- ✅ 결제 완료

**화면 플레이스홀더**:
- `[이미지] 수업 탐색 메인`
- `[이미지] 각 수강권 타입별 화면`
- `[이미지] 결제 페이지`
- `[이미지] 결제 완료 화면`

---

### Flow 4: 📅 예약 플로우 (Reservation Flow)

```
[결제 완료] → [📅 예약 탭] → [예약 화면]
                               /reservation
                               (구: /booking)
                                  │
                                  ├─ 수업 선택
                                  ├─ 날짜/시간 선택
                                  ├─ 튜터 선택 (optional)
                                  └─ 예약 확정

[예약 확정] → {예약 성공?}
               ├─ 성공 → [✅ 예약 완료]
               │          │
               │          └─ [홈으로 돌아가기] / [수업 준비하기]
               │
               └─ 실패 → [❌ 예약 실패]
                          │
                          └─ {실패 사유}
                              ├─ 시간대 마감 → [다른 시간 선택]
                              ├─ 수강권 없음 → [수강권 구매]
                              └─ 기타 오류 → [재시도]
```

**주요 화면**:
- 📅 예약 (`/reservation`, 구 `/booking`)

**Feature Flag**: `RESERVATION_MIGRATION`

**화면 플레이스홀더**:
- `[이미지] 예약 화면`
- `[이미지] 예약 완료 화면`

---

### Flow 5: 📖 수업 진행 플로우 (Lesson Flow)

```
[예약 완료] → [수업 시간 도래] → [🎓 수업 진행]
                                   /lessons/classroom/[id]
                                      │
                                      ├─ 수업 자료 로드
                                      ├─ 튜터 연결
                                      ├─ 비디오/오디오 연결
                                      └─ 수업 시작

[수업 중] → {인터랙션}
             ├─ [🎨 드로잉 캔버스]
             │   /drawing/[id]
             │
             ├─ 채팅
             ├─ 화면 공유
             └─ 수업 자료 참고

[수업 종료] → [수업 리뷰]
               /lessons/classroom/[id]/review
                  │
                  ├─ 별점 입력
                  ├─ 리뷰 작성
                  └─ 제출

[리뷰 제출] → [리뷰 완료]
               /lessons/classroom/[id]/review-complete
                  │
                  └─ [📊 수업 리포트]
                      /lessons/classroom/[id]/report
                         │
                         ├─ 수업 분석
                         ├─ 학습 포인트
                         ├─ 다음 수업 추천
                         └─ [홈으로] / [다음 수업 예약]
```

**관련 플로우**:

#### 정규 수업 목록
```
[Home] → [정규 수업 목록]
          /lessons/regular
             │
             └─ 수업 선택 → [예약] or [수업 진행]
```

#### 체험 수업 목록
```
[Home] → [체험 수업 목록]
          /lessons/trial
             │
             └─ 수업 선택 → [예약] or [수업 진행]
```

#### AI 수업
```
[AI Home] → [AI 수업 목록]
             /lessons/ai
                │
                ├─ [AI 수업 상세]
                │   /lessons/ai/[id]
                │
                └─ [AI 체험 리포트]
                    /lessons/ai/trial-report/[uuid]
```

**주요 화면**:
- 📚 정규 수업 목록
- 🆓 체험 수업 목록
- 🤖 AI 수업 목록
- 📄 AI 수업 상세
- 📊 AI 체험 리포트
- 🎓 수업 진행
- 🎨 드로잉 캔버스
- ⭐ 수업 리뷰
- ✅ 리뷰 완료
- 📊 수업 리포트

**화면 플레이스홀더**:
- `[이미지] 수업 목록 (정규/체험/AI)`
- `[이미지] 수업 진행 화면`
- `[이미지] 드로잉 캔버스`
- `[이미지] 리뷰 작성`
- `[이미지] 수업 리포트`

---

## 🎨 FigJam 그리기 가이드

### Step 1: 섹션 구분
1. FigJam에서 새 파일 생성
2. 큰 섹션으로 구분:
   - 🔐 Auth Flow
   - 🏠 Home Flow
   - 💳 Payment Flow
   - 📅 Reservation Flow
   - 📖 Lesson Flow

### Step 2: 각 섹션 내 노드 배치
1. **주요 화면**: 큰 사각형 (150x100px)
2. **컴포넌트**: 중간 둥근 사각형 (120x80px)
3. **의사결정**: 다이아몬드 (100x100px)
4. **로딩/에러**: 구름/육각형 (80x60px)

### Step 3: 연결선 그리기
1. 주요 플로우: 굵은 화살표
2. 조건부 플로우: 점선 화살표
3. 에러/예외: 빨간 화살표

### Step 4: 플레이스홀더 추가
각 노드에 다음 정보 포함:
```
[화면명]
라우트: /path/to/screen
설명: 간단한 설명

[📷 화면 이미지 자리]
↑ 나중에 Figma에서 가져오기
```

### Step 5: 메타 정보 추가
- 각 섹션 상단에 설명 추가
- 사용자 액션 표시 (클릭, 스와이프 등)
- 주요 의사결정 포인트 강조

---

## 📝 체크리스트

### FigJam 생성
- [ ] 캔버스 레이아웃 설정
- [ ] 🔐 Auth Flow 그리기
- [ ] 🏠 Home Flow 그리기 (Basic + AI)
- [ ] 💳 Payment Flow 그리기
- [ ] 📅 Reservation Flow 그리기
- [ ] 📖 Lesson Flow 그리기
- [ ] 색상 코딩 적용
- [ ] 연결선 그리기
- [ ] 플레이스홀더 추가

### 화면 매칭 (나중에)
- [ ] Figma에서 Auth 관련 화면 찾기
- [ ] Figma에서 Home 관련 화면 찾기
- [ ] Figma에서 Payment 관련 화면 찾기
- [ ] Figma에서 Reservation 관련 화면 찾기
- [ ] Figma에서 Lesson 관련 화면 찾기
- [ ] 각 플레이스홀더에 실제 화면 이미지 추가

---

## 🔗 참고 자료

- [podo-screen-flow.md](../podo-screen-flow.md) - 전체 화면 플로우
- [podo-screen-flow.mmd](../podo-screen-flow.mmd) - 전체 플로우 다이어그램
- [home-flow.mmd](./home-flow.mmd) - 홈 화면 상세 플로우
- [user-journey-priority.md](./user-journey-priority.md) - 우선순위 가이드
- Figma 디자인: https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S
