# Podo App - 사용자 여정 기반 플로우 우선순위

## 🎯 핵심 사용자 여정 (Critical Path)

```
앱 다운로드 → 로그인/가입 → 홈 화면 → 수업 탐색 → 체험/수강권 선택 → 결제 → 예약 → 수업 진행 → 리뷰
```

---

## 📊 우선순위별 플로우 정리

### Priority 1: 🔐 인증 플로우 (Auth Flow)
**목표**: 사용자가 앱에 처음 진입해서 로그인하기

**주요 화면**:
- 앱 설치 배너 (External)
- Login (`/login`)
- OAuth Redirect
- HomeRedirection 로직

**상세 플로우 파일**: `auth-flow.mmd` (생성 필요)

**다음 단계**: 로그인 완료 → Home

---

### Priority 2: 🏠 홈 화면 플로우 (Home Flow)
**목표**: 사용자가 로그인 후 처음 보는 화면, 주요 기능 접근점

**주요 화면**:
- Basic Home (`/home`)
- AI Home (`/home/ai`)
- HomeBannerCarousel
- GreetingContent
- ClassPrepareWidget
- TrialTutorial
- 각종 팝업 (공지사항, WelcomeBack, TutorProfile)

**상세 플로우 파일**: ✅ `home-flow.mmd` (이미 존재)

**다음 단계**: 수업 탐색 또는 예약

---

### Priority 3: 💳 수업 탐색 & 결제 플로우 (Subscription & Payment Flow)
**목표**: 사용자가 수강권을 선택하고 결제 완료

**주요 화면**:
- 수업 탐색 (`/subscribes`)
- 수강권 목록 (`/subscribes/tickets`, `/subscribes/tickets-v2`)
- 스마트톡 수강권 (`/subscribes/tickets/smart-talk`)
- 페이백 수강권 (`/subscribes/tickets/payback`)
- 체험 수업 (`/subscribes/trial`)
- 체험 스마트톡 (`/subscribes/trial/smart-talk`, `/subscribes/trial/smart-talk/detail`)
- 결제 페이지 (`/subscribes/payment/[id]`)
- 결제 완료 (`/subscribes/payment/[id]/success`)

**상세 플로우 파일**: `subscription-payment-flow.mmd` (생성 필요)

**다음 단계**: 결제 완료 → 예약

---

### Priority 4: 📅 예약 플로우 (Reservation Flow)
**목표**: 사용자가 수업 시간을 예약

**주요 화면**:
- 예약 (`/reservation`)
- (이전: `/booking` - Feature Flag: `RESERVATION_MIGRATION`)

**상세 플로우 파일**: `reservation-flow.mmd` (생성 필요)

**다음 단계**: 예약 완료 → 수업 진행

---

### Priority 5: 📖 수업 진행 플로우 (Lesson Flow)
**목표**: 사용자가 실제 수업을 듣고 리뷰 작성

**주요 화면**:
- 정규 수업 목록 (`/lessons/regular`)
- 체험 수업 목록 (`/lessons/trial`)
- AI 수업 목록 (`/lessons/ai`)
- AI 수업 상세 (`/lessons/ai/[id]`)
- AI 체험 리포트 (`/lessons/ai/trial-report/[uuid]`)
- 수업 진행 (`/lessons/classroom/[id]`)
- 드로잉 캔버스 (`/drawing/[id]`)
- 수업 리뷰 (`/lessons/classroom/[id]/review`)
- 리뷰 완료 (`/lessons/classroom/[id]/review-complete`)
- 수업 리포트 (`/lessons/classroom/[id]/report`)

**상세 플로우 파일**: `lesson-flow.mmd` (생성 필요)

**완료**: 수업 리포트 확인 → 홈으로 복귀 또는 다음 수업 예약

---

## 🔄 Secondary Flows (부가 기능)

### Priority 6: 🧠 AI Learning 플로우
**목표**: AI 학습 허브 탐색

**주요 화면**:
- AI Learning (`/ai-learning`)
- AI 수업 목록 (`/lessons/ai`)

**Feature Flag**: `PODOLINGO_ENABLED`

**상세 플로우 파일**: `ai-learning-flow.mmd` (생성 필요)

---

### Priority 7: 👤 마이포도 플로우 (My Podo Flow)
**목표**: 사용자 설정, 플랜 관리, 쿠폰 사용

**주요 화면**:
- 마이포도 (`/my-podo`)
- 쿠폰 (`/my-podo/coupon`, `/my-podo/coupon/[id]`)
- 결제 수단 (`/my-podo/payment-methods`, `/my-podo/payment-methods/register`)
- 내 플랜 (`/my-podo/plan`, `/my-podo/plan/[id]`)
- 공지사항 (`/my-podo/notices`, `/my-podo/notices/[id]`)
- 알림 설정 (`/my-podo/notification-settings`)
- 튜터 제외 (`/my-podo/tutor-exclusion`)

**상세 플로우 파일**: `my-podo-flow.mmd` (생성 필요)

---

### Priority 8: 🚪 해지 플로우 (Churn Flow)
**목표**: 사용자 구독 해지

**주요 화면**:
- 해지 시작 (`/podo/churn`)
- 해지 사유 선택 (`/podo/churn/quit-reason`)

**상세 플로우 파일**: `churn-flow.mmd` (생성 필요)

---

### Priority 9: 📊 기타 플로우
**주요 화면**:
- 수업 통계 (`/class-report`)
- 레벨 테스트 (`/selftest`)
- 첫 수업 부스터 다이얼로그
- 레벨 선택 다이얼로그

**상세 플로우 파일**: `misc-flow.mmd` (생성 필요)

---

## 🎨 FigJam 생성 계획

### Phase 1: Critical Path (Priority 1-5)
가장 먼저 생성해야 할 플로우:
1. ✅ Home Flow (이미 존재)
2. Auth Flow
3. Subscription & Payment Flow
4. Reservation Flow
5. Lesson Flow

### Phase 2: Secondary Flows (Priority 6-9)
부가 기능 플로우:
6. AI Learning Flow
7. My Podo Flow
8. Churn Flow
9. Misc Flow

---

## ✅ 작업 체크리스트

### Critical Path Flows
- [ ] `auth-flow.mmd` 생성
- [x] `home-flow.mmd` (이미 존재)
- [ ] `subscription-payment-flow.mmd` 생성
- [ ] `reservation-flow.mmd` 생성
- [ ] `lesson-flow.mmd` 생성

### Secondary Flows
- [ ] `ai-learning-flow.mmd` 생성
- [ ] `my-podo-flow.mmd` 생성
- [ ] `churn-flow.mmd` 생성
- [ ] `misc-flow.mmd` 생성

### FigJam Diagrams
- [ ] Critical Path FigJam (Priority 1-5)
- [ ] Secondary Flows FigJam (Priority 6-9)
- [ ] 전체 통합 FigJam

---

## 📝 다음 단계

1. **Critical Path 플로우 상세화**
   - 각 우선순위별로 `home-flow.mmd` 수준의 상세한 다이어그램 작성
   - 로딩 상태, 에러 처리, 조건부 렌더링, 팝업 등 모두 포함

2. **FigJam 생성**
   - 텍스트 기반으로 먼저 생성 (화면 스크린샷 없이)
   - 각 노드에 플레이스홀더 추가

3. **점진적 화면 매칭**
   - 나중에 Figma에서 화면 찾아서 추가
   - 우선순위 높은 플로우부터 완성도 높이기
