# Podo App - Screen Flow Diagram

## 전체 화면 플로우

```mermaid
graph TD
    %% ===== AUTH =====
    Login["🔐 Login"]
    OAuth["OAuth Redirect"]
    Login --> OAuth --> HomeRedirect{HomeRedirection}
    HomeRedirect -->|AI 전용 수강권만| HomeAI
    HomeRedirect -->|그 외| Home

    %% ===== BOTTOM TAB NAVIGATION =====
    subgraph BottomTabs["📱 Bottom Tab Navigation"]
        Home["🏠 Home (Basic)"]
        HomeAI["🤖 Home (Smart Talk)"]
        Subscribes["📚 수업 탐색"]
        Reservation["📅 예약"]
        AILearning["🧠 AI Learning"]
        MyPodo["👤 마이포도"]
    end

    Home <--> HomeAI

    %% ===== SUBSCRIPTION & PAYMENT FLOW =====
    subgraph SubFlow["💳 구독 & 결제 플로우"]
        Tickets["수강권 목록"]
        TicketsV2["수강권 V2"]
        SmartTalkTickets["스마트톡 수강권"]
        PaybackTickets["페이백 수강권"]
        TrialSub["체험 수업"]
        TrialSmartTalk["체험 스마트톡"]
        TrialSmartTalkDetail["체험 스마트톡 상세"]
        Payment["결제 페이지"]
        PaymentSuccess["결제 완료 ✅"]
    end

    Subscribes --> Tickets
    Subscribes --> TicketsV2
    Tickets --> SmartTalkTickets
    Tickets --> PaybackTickets
    Subscribes --> TrialSub
    TrialSub --> TrialSmartTalk
    TrialSmartTalk --> TrialSmartTalkDetail
    Tickets --> Payment
    TicketsV2 --> Payment
    SmartTalkTickets --> Payment
    PaybackTickets --> Payment
    TrialSmartTalkDetail --> Payment
    Payment --> PaymentSuccess
    PaymentSuccess -->|예습하러 가기| Subscribes
    PaymentSuccess -->|홈으로| Home
    PaymentSuccess -->|홈으로 AI| HomeAI

    %% ===== LESSON FLOW =====
    subgraph LessonFlow["📖 수업 플로우"]
        RegularLessons["정규 수업 목록"]
        TrialLessons["체험 수업 목록"]
        AILessons["AI 수업 목록"]
        AILessonDetail["AI 수업 상세"]
        AITrialReport["AI 체험 리포트"]
        Classroom["🎓 수업 진행"]
        Drawing["🎨 드로잉 캔버스"]
        Review["수업 리뷰"]
        ReviewComplete["리뷰 완료"]
        LessonReport["📊 수업 리포트"]
    end

    Home --> RegularLessons
    Home --> TrialLessons
    HomeAI --> AILessons
    AILessons --> AILessonDetail
    AILessonDetail --> AITrialReport
    PaymentSuccess --> Reservation
    Reservation --> Classroom
    Classroom --> Drawing
    Classroom --> Review
    Review --> ReviewComplete
    ReviewComplete --> LessonReport

    %% ===== AI LEARNING FLOW =====
    AILearning --> AILessons

    %% ===== MY PODO =====
    subgraph MyPodoFlow["👤 마이포도"]
        Coupon["🎟️ 쿠폰"]
        CouponDetail["쿠폰 상세"]
        PaymentMethods["💳 결제 수단"]
        RegisterPayment["결제 수단 등록"]
        MyPlan["📋 내 플랜"]
        PlanDetail["플랜 상세"]
        Notices["📢 공지사항"]
        NoticeDetail["공지 상세"]
        NotificationSettings["🔔 알림 설정"]
        TutorExclusion["🚫 튜터 제외"]
    end

    MyPodo --> Coupon --> CouponDetail
    MyPodo --> PaymentMethods --> RegisterPayment
    MyPodo --> MyPlan --> PlanDetail
    MyPodo --> Notices --> NoticeDetail
    MyPodo --> NotificationSettings
    MyPodo --> TutorExclusion

    %% ===== CHURN =====
    subgraph ChurnFlow["🚪 해지 플로우"]
        Churn["해지 시작"]
        QuitReason["해지 사유 선택"]
    end

    MyPodo --> Churn --> QuitReason

    %% ===== OTHER =====
    Home --> ClassReport["📊 수업 통계"]
    Home --> SelfTest["📝 레벨 테스트"]
    Home --> FirstLessonBooster["첫 수업 부스터 다이얼로그"]
    Home --> LevelSelect["레벨 선택 다이얼로그"]

    %% ===== EXTERNAL =====
    subgraph External["🌐 외부"]
        AppInstall["앱 설치 배너"]
        OpenInBrowser["브라우저에서 열기"]
        QRStore["QR 스토어"]
        OpenInApp["앱에서 열기"]
    end

    %% ===== STYLING =====
    classDef tab fill:#4A90D9,stroke:#333,color:#fff
    classDef auth fill:#E74C3C,stroke:#333,color:#fff
    classDef payment fill:#27AE60,stroke:#333,color:#fff
    classDef lesson fill:#F39C12,stroke:#333,color:#fff

    class Home,HomeAI,Subscribes,Reservation,AILearning,MyPodo tab
    class Login,OAuth auth
    class Payment,PaymentSuccess payment
    class Classroom,Review,ReviewComplete,LessonReport lesson
```

## 핵심 사용자 플로우 요약

### 1. 신규 유저 플로우
```
Login → Home → 수업 탐색 → 체험 수업 선택 → 결제 → 예약 → 수업 진행 → 리뷰
```

### 2. 기존 유저 - 정규 수업
```
Home → 정규 수업 목록 → 예약 → 수업 진행 → 리뷰 → 리포트
```

### 3. AI 스마트톡 플로우
```
Home(AI) → AI 수업 목록 → AI 수업 상세 → 스마트톡 수강권 → 결제
```

### 4. 마이페이지 플로우
```
마이포도 → 내 플랜 / 쿠폰 / 결제수단 / 알림설정 / 튜터제외
         → 해지 → 해지 사유
```

## 라우트 - 화면 매핑 테이블

| 화면 | 라우트 | 설명 |
|------|--------|------|
| Login | `/login` | 로그인 |
| Home (Basic) | `/home` | 기본 홈 |
| Home (Smart Talk) | `/home/ai` | AI 홈 |
| 수업 탐색 | `/subscribes` | 구독/수업 탐색 |
| 수강권 목록 | `/subscribes/tickets` | 수강권 패키지 |
| 수강권 V2 | `/subscribes/tickets-v2` | 새 수강권 UI |
| 스마트톡 수강권 | `/subscribes/tickets/smart-talk` | AI 수강권 |
| 페이백 수강권 | `/subscribes/tickets/payback` | 페이백 옵션 |
| 체험 수업 | `/subscribes/trial` | 무료 체험 |
| 체험 스마트톡 | `/subscribes/trial/smart-talk` | AI 무료 체험 |
| 결제 | `/subscribes/payment/[id]` | 결제 페이지 |
| 결제 완료 | `/subscribes/payment/[id]/success` | 결제 확인 |
| 예약 | `/reservation` | 수업 예약 |
| 정규 수업 | `/lessons/regular` | 정규 수업 목록 |
| 체험 수업 | `/lessons/trial` | 체험 수업 목록 |
| AI 수업 | `/lessons/ai` | AI 수업 목록 |
| AI 수업 상세 | `/lessons/ai/[id]` | AI 코스 상세 |
| AI 체험 리포트 | `/lessons/ai/trial-report/[uuid]` | AI 체험 결과 |
| 수업 진행 | `/lessons/classroom/[id]` | 수업 화면 |
| 드로잉 | `/drawing/[id]` | 드로잉 캔버스 |
| 수업 리뷰 | `/lessons/classroom/[id]/review` | 수업 후기 |
| 리뷰 완료 | `/lessons/classroom/[id]/review-complete` | 후기 완료 |
| 수업 리포트 | `/lessons/classroom/[id]/report` | 수업 분석 |
| AI Learning | `/ai-learning` | AI 학습 허브 |
| 마이포도 | `/my-podo` | 마이페이지 |
| 쿠폰 | `/my-podo/coupon` | 쿠폰 목록 |
| 쿠폰 상세 | `/my-podo/coupon/[id]` | 쿠폰 상세 |
| 결제 수단 | `/my-podo/payment-methods` | 결제 수단 관리 |
| 결제 수단 등록 | `/my-podo/payment-methods/register` | 카드 등록 |
| 내 플랜 | `/my-podo/plan` | 구독 현황 |
| 플랜 상세 | `/my-podo/plan/[id]` | 구독 상세 |
| 공지사항 | `/my-podo/notices` | 공지 목록 |
| 공지 상세 | `/my-podo/notices/[id]` | 공지 내용 |
| 알림 설정 | `/my-podo/notification-settings` | 알림 설정 |
| 튜터 제외 | `/my-podo/tutor-exclusion` | 튜터 차단 |
| 수업 통계 | `/class-report` | 전체 수업 통계 |
| 레벨 테스트 | `/selftest` | 영어 레벨 측정 |
| 해지 | `/podo/churn` | 해지 시작 |
| 해지 사유 | `/podo/churn/quit-reason` | 해지 이유 선택 |

## Feature Flags
- `RESERVATION_MIGRATION`: `/booking` ↔ `/reservation` 전환
- `PODOLINGO_ENABLED`: AI Learning 탭 표시 여부
- `ENABLE_REACT_HOME`: 홈 구현체 전환
