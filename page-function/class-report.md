# 수업 리포트 (Lesson Report) UI Flow

**라우트**: `/lessons/classroom/[classID]/report`
**부모 화면**: 완료된 수업 카드 (정규/AI 수업 목록)
**타입**: 풀스크린

## 개요

수업 완료 후 AI가 생성한 진단 리포트를 표시하는 화면입니다. 리포트 생성 상태에 따라 4가지 뷰(요청됨, 처리중, 완료, 실패)를 제공하며, 완료된 리포트에서는 수업 정보, 점수, 피드백, 복습 퀴즈를 확인할 수 있습니다.

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 =====
    Start[화면 진입] --> ValidateParams{classID<br/>파라미터 검증}
    ValidateParams -->|실패| NotFound[404 Not Found]
    ValidateParams -->|성공| GenerateReport[generateDiagnosisReport<br/>API 호출]

    %% ===== 리포트 상태 확인 =====
    GenerateReport --> CheckStatus{리포트 상태}

    %% ===== 4가지 상태 분기 =====
    CheckStatus -->|REQUESTED| RequestedView[📋 요청됨 뷰]
    CheckStatus -->|PROCESSING| ProcessingView[⏳ 처리중 뷰]
    CheckStatus -->|COMPLETED| CompletedView[✅ 완료 뷰]
    CheckStatus -->|FAILED| FailedView[❌ 실패 뷰]

    %% ===== REQUESTED/PROCESSING 뷰 =====
    RequestedView --> RequestedUI[AI 수업 분석 안내<br/>최대 24시간 소요]
    ProcessingView --> RequestedUI

    RequestedUI --> NotificationCheck{앱에서 진입<br/>AND<br/>알림 권한 없음?}
    NotificationCheck -->|Yes| NotificationBottomSheet[[알림 설정 바텀시트]]
    NotificationCheck -->|No| NextLessonCTA[다음 레슨 예약하기 CTA]

    NotificationBottomSheet --> SettingsAction((알림 설정하기))
    SettingsAction --> OpenSettings[기기 설정 열기]

    NextLessonCTA --> NavigateHome[홈으로 이동<br/>/home or /home/ai]

    %% ===== COMPLETED 뷰 =====
    CompletedView --> PrefetchData[리포트 데이터<br/>프리페치]
    PrefetchData --> LoadReport[⏳ 리포트 로딩]
    LoadReport --> RenderSections[섹션 렌더링]

    RenderSections --> Section1[1️⃣ 수업 정보 섹션]
    RenderSections --> Section2[2️⃣ 점수 섹션]
    RenderSections --> Section3[3️⃣ 복습 섹션]

    Section1 --> LessonInfo[수업 날짜/시간/튜터]
    Section2 --> Scores[발음/유창성/문법<br/>정확도 등 점수]
    Section3 --> ReviewQuizzes[AI 생성 복습 문제]

    ReviewQuizzes --> ReviewCTA((복습 퀴즈 풀기))
    ReviewCTA --> NavigateReview[/lessons/classroom/{id}/review<br/>feedbackIds 전달]

    %% ===== FAILED 뷰 =====
    FailedView --> FailedUI[생성 실패 안내]
    FailedUI --> FailedCTA[다음 레슨 예약하기]
    FailedCTA --> NavigateHome

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef warning fill:#F39C12,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef empty fill:#95A5A6,stroke:#333,color:#fff
    classDef modal fill:#9B59B6,stroke:#333,color:#fff

    class CompletedView,Section1,Section2,Section3 normal
    class FailedView,FailedUI error
    class RequestedView,ProcessingView,LoadReport warning
    class ReviewCTA,NavigateReview success
    class NotificationBottomSheet modal
```

---

## 상태별 상세 설명

### 1. 📋 요청됨 / ⏳ 처리중 상태 (REQUESTED / PROCESSING)

**표시 조건**:
- [x] `generateDiagnosisReport` 응답: `REQUESTED` 또는 `PROCESSING`
- [x] 수업 완료 후 리포트 생성 대기 중

**UI 구성**:
- **메인 컨텐츠**:
  - AI 포도 아이콘 Lottie 애니메이션 (140x140px, 루프)
  - 제목: "AI 수업 분석" (h1)
  - 설명: "리포트 생성 요청이 완료되었어요. 완료까지 최대 24시간 소요될 수 있어요." (body1, gray-400)

- **안내 카드 2개**:
  1. **알림톡 안내**:
     - 아이콘: BellIcon
     - 메시지: "리포트가 생성되면 알림톡으로 알려드려요." (일부 볼드)
     - 배경: gray-100, rounded-8px

  2. **리포트 생성 조건**:
     - 아이콘: PresentationIcon
     - 메시지: "정상적으로 완료된 레슨만 리포트가 생성돼요." (일부 볼드)
     - 배경: gray-100, rounded-8px

- **하단 CTA**:
  - 버튼: "다음 레슨 예약하기" (xLarge)
  - 액션: `/home` 또는 `/home/ai`로 이동
    - `hasOnlyCharacterChatSubscriptionTicket === true` → `/home/ai`
    - `false` → `/home`

**알림 권한 바텀시트**:
- **트리거**: 앱에서 진입 AND 알림 권한 미허용
- **조건**: `from === 'APP' && notificationPermissionStatus !== 'granted'`
- **내용**:
  - 알림 아이콘 Lottie (140x140px, 루프)
  - 제목: "알림을 켜주세요." (h1)
  - 설명: "AI 리포트 생성, 레슨 시간 알림을 실시간으로 받기 위해 기기 설정에서 알림을 켜주세요." (h3, gray-500)
  - 버튼: "알림 설정하기" → `webBridge.linkingSettings()` 호출 (기기 설정 열기)

---

### 2. ✅ 완료 상태 (COMPLETED)

**표시 조건**:
- [x] `generateDiagnosisReport` 응답: `COMPLETED`
- [x] 리포트 생성 완료

**UI 구성**:
- **섹션 1: 수업 정보** (`LessonInformationSection`)
  - 수업 날짜/시간
  - 튜터 이름
  - 수업 주제

- **섹션 2: 점수** (`LessonReportScoreSection`)
  - 발음 (Pronunciation)
  - 유창성 (Fluency)
  - 문법 정확도 (Grammar)
  - 어휘력 (Vocabulary)
  - 이해도 (Comprehension)
  - 각 점수는 5점 만점 또는 백분율로 표시

- **섹션 3: 복습하기** (`LessonReportReviewSection`)
  - 제목: "복습하기" (h1, semibold)
  - 설명: "레슨 내용 기반으로 AI가 생성한 맞춤 문제예요." (body1, gray-400)
  - 복습 문제 카드 리스트 (AI 생성)
  - 각 문제 카드 클릭 가능

- **하단 CTA** (Sticky):
  - 버튼: "복습 퀴즈 풀기" (xLarge, 전체 너비)
  - 액션: `/lessons/classroom/{classId}/review?feedbackIds={ids}` 이동
  - `feedbackIds`: 리포트의 피드백 ID들을 쉼표로 연결

**로딩 처리**:
- 섹션 1, 2: `LessonReportScoreSectionLoading` (Suspense fallback)
- 섹션 3: `LessonReportReviewSectionLoading` (Suspense fallback)
- 하단 CTA: null (Suspense fallback)

**인터랙션 요소**:
1. **복습 퀴즈 풀기 버튼**
   - 액션: 리뷰 화면으로 이동
   - Validation: 없음
   - 결과: `/lessons/classroom/{classId}/review?feedbackIds={}&...` (기존 쿼리 파라미터 유지)
   - 이벤트 로깅: `{ name: UI_IDS.btn.startReview, location: 'lesson_report', action: 'navigate' }`

---

### 3. ❌ 실패 상태 (FAILED)

**표시 조건**:
- [x] `generateDiagnosisReport` 응답: `FAILED`
- [x] 리포트 생성 실패 (시스템 오류, 데이터 부족 등)

**UI 구성**:
- 실패 안내 UI (`LessonReportFailedView`)
- 에러 메시지: "리포트 생성에 실패했습니다"
- 설명: "수업 내용이 부족하거나 일시적인 오류가 발생했습니다"
- CTA: "다음 레슨 예약하기" → `/home` 또는 `/home/ai`

---

## Validation Rules

### URL 파라미터 검증

| 파라미터 | 검증 규칙 | 에러 처리 |
|----------|----------|----------|
| `classID` | 문자열 → 정수 변환 가능 | notFound() |

Zod 스키마: `paramsSchema = z.object({ classID: z.string().transform((val) => parseInt(val)) })`

---

## 모달 & 다이얼로그

### 알림 권한 요청 바텀시트

**트리거**: 앱 진입 AND 알림 권한 없음 AND 리포트 요청됨/처리중 상태
**타입**: 바텀시트 (BottomSheetRoot)

**내용**:
- 제목: "알림을 켜주세요"
- 설명: "AI 리포트 생성, 레슨 시간 알림을 실시간으로 받기 위해 기기 설정에서 알림을 켜주세요"
- 버튼:
  - 주 버튼: "알림 설정하기" → 기기 설정 앱 열기

---

## Edge Cases

### 1. 리포트 생성 24시간 초과
- **조건**: 리포트 생성 요청 후 24시간 이상 경과했지만 여전히 REQUESTED/PROCESSING
- **동작**: 상태 그대로 표시 (자동 타임아웃 없음)
- **UI**: "최대 24시간 소요" 메시지 유지

### 2. 복습 퀴즈 피드백 없음
- **조건**: `data.feedbacks` 배열이 비어있음
- **동작**: `feedbackIds`가 빈 문자열로 전달
- **UI**: 복습 퀴즈 버튼은 표시되지만 리뷰 화면에서 Empty State

### 3. 웹/앱 분기 처리
- **조건**: `from === 'APP'` (네이티브 앱에서 진입)
- **동작**: 알림 권한 체크 및 바텀시트 표시
- **UI**: 웹에서는 바텀시트 미표시

### 4. Character Chat 전용 구독
- **조건**: `hasOnlyCharacterChatSubscriptionTicket === true`
- **동작**: "다음 레슨 예약하기" 버튼이 `/home/ai`로 이동
- **UI**: AI 수업 전용 홈으로 안내

### 5. 쿼리 파라미터 병합
- **조건**: 리뷰 화면 이동 시 기존 쿼리 파라미터 유지 필요
- **동작**:
  1. 현재 쿼리 파라미터 수집
  2. 새로운 `feedbackIds` 파라미터 추가
  3. 병합된 쿼리로 리다이렉트
- **UI**: 정상 이동

### 6. 서버 프리페치 성공
- **조건**: COMPLETED 상태일 때 서버에서 리포트 데이터 프리페치
- **동작**: `queryClient.prefetchQuery(getDiagnosisReport)` → `HydrationBoundary`로 주입
- **UI**: 클라이언트 로딩 최소화

---

## 개발 참고사항

**주요 API**:
- `POST /api/lesson/diagnosis/generate` - 리포트 생성 요청 및 상태 조회
  - 응답: `{ data: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' }`
- `GET /api/lesson/diagnosis/report?classId={id}` - 완성된 리포트 조회

**상태 관리**:
- Server-side: `generateDiagnosisReport()` 호출 → 상태 확인
- Client-side: `useSuspenseQuery(getDiagnosisReport)` (COMPLETED 상태일 때만)
- Context: 없음 (각 섹션 독립적으로 데이터 fetch)

**상태 흐름**:
```
수업 완료 → generateDiagnosisReport 호출
→ REQUESTED (요청 접수)
→ PROCESSING (AI 분석 중)
→ COMPLETED (완료) or FAILED (실패)
```

**Feature Flags**:
- 없음 (리포트 기능은 항상 활성화)

**라우팅**:
- 진입: 완료된 수업 카드의 "리포트 보기" 버튼
- 리뷰: `/lessons/classroom/{classId}/review?feedbackIds={ids}`
- 홈: `/home` 또는 `/home/ai` (구독 타입에 따라)

**성능 최적화**:
- Server-side prefetch: COMPLETED 상태일 때만
- Suspense 경계: 각 섹션 독립적으로 로딩
- Lottie 애니메이션: loop + play (메모리 효율적)

**네이티브 브리지**:
- `webBridge.linkingSettings()`: 기기 설정 앱 열기
- `from`, `notificationPermissionStatus`: NativeBridgeStore에서 관리

---

## 디자인 참고

- Figma: [추가 필요]
- 디자인 노트:
  - 섹션 간 간격: 40px
  - 안내 카드 간격: 8px
  - Lottie 크기: 140x140px
  - 안내 카드: gray-100 배경, rounded-8px, 최소 높이 76px
  - 복습 퀴즈 버튼: 하단 고정 (BottomStickyContainer)

---

## 리포트 생성 조건

리포트가 **COMPLETED**되기 위한 조건:
1. 수업이 정상적으로 완료됨 (불참/취소 아님)
2. 수업 녹음 데이터 존재
3. AI 분석 완료 (발음, 유창성, 문법 등 점수 산출)
4. 피드백 생성 완료

**FAILED**되는 경우:
- 수업 녹음 데이터 부족
- AI 분석 시스템 오류
- 수업 내용이 분석 불가능 (예: 수업 시간이 너무 짧음)

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | junse | 최초 작성 |
