# 체험 수업 목록 (Trial Lesson Detail) UI Flow

**라우트**: `/lessons/trial?langType={EN|CN}`
**부모 화면**: 수업 탐색 (`/subscribes`)
**타입**: 메인 화면

**Figma**: [체험레슨 신청 디자인](https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S/-PODO--APP-DESIGN?node-id=455-3798)

## 개요

사용자가 선택한 언어의 체험 수업(Trial Lesson) 목록을 표시하는 화면입니다. 체험 수업은 레벨 테스트 역할을 하며, 각 등급(Grade)별로 하나의 수업 카드가 표시됩니다. 정규 수업과 달리 단일 카드 형식으로 제공됩니다.

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 =====
    Start[화면 진입] --> ValidateParams{쿼리 파라미터<br/>검증}
    ValidateParams -->|실패| NotFound[404 Not Found]
    ValidateParams -->|성공| PrefetchData[데이터 프리페치]

    PrefetchData --> Loading[⏳ 로딩 중]
    Loading --> FetchTrials[API 병렬 호출<br/>trialLessonDetail<br/>tickets<br/>getCurrentUser]

    %% ===== 데이터 로드 =====
    FetchTrials --> DataCheck{데이터 로드<br/>성공?}
    DataCheck -->|실패| ErrorState[❌ 에러 상태]
    DataCheck -->|성공| HasLessons{체험 수업<br/>있음?}

    HasLessons -->|Yes| Success[✅ 체험 수업 목록 표시]
    HasLessons -->|No| Empty[📭 Empty State]

    %% ===== 에러 처리 =====
    ErrorState --> ErrorFallback[에러 메시지 표시<br/>"수업목록을 가져오는데<br/>문제가 생겼습니다"]
    ErrorFallback --> ErrorAction{사용자 액션}
    ErrorAction -->|새로고침| Loading
    ErrorAction -->|뒤로가기| BackToSubscribes[/subscribes 복귀]

    %% ===== 정상 플로우 =====
    Success --> RenderSections[등급별 섹션 렌더링]
    RenderSections --> ForEachLesson{각 체험 수업}

    ForEachLesson --> RenderCard[TrialLessonCard 렌더링]
    RenderCard --> CardStatus{수업 상태}

    CardStatus -->|완료| CompletedCard[✅ 완료 카드]
    CardStatus -->|예약됨| ReservedCard[📅 예약 카드]
    CardStatus -->|미예약| NotReservedCard[📭 미예약 카드]

    %% ===== 카드별 액션 =====
    CompletedCard --> CompletedAction((리포트 보기))
    CompletedAction --> TrialReport[/lessons/ai/trial-report/{uuid}]

    ReservedCard --> ReservedAction((수업 상세))
    ReservedAction --> ClassDetail[수업 상세 정보]

    NotReservedCard --> BookAction((예약하기))
    BookAction --> Reservation[/reservation]

    %% ===== Empty State =====
    Empty --> EmptyMsg[체험 수업이 없습니다]
    EmptyMsg --> BackAction((뒤로가기))
    BackAction --> BackToSubscribes

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef warning fill:#F39C12,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef empty fill:#95A5A6,stroke:#333,color:#fff
    classDef modal fill:#9B59B6,stroke:#333,color:#fff

    class Success,RenderSections,CompletedCard normal
    class ErrorState,ErrorFallback error
    class Loading warning
    class CompletedAction,ReservedCard success
    class Empty,NotReservedCard empty
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시
- [x] 3개 API 병렬 호출 중:
  1. `trialLessonDetail({ bearerToken, langType })`
  2. `tickets({ bearerToken })`
  3. `getCurrentUser({ bearerToken })`

**UI 구성**:
- 로딩 스피너 위치: 전체 화면
- GlobalLoadingBoundary 사용
- 로딩 텍스트: 없음

**timeout 처리**:
- React Query 기본 설정 적용
- timeout 시 에러 상태로 전환

---

### 2. ✅ 성공 상태 (체험 수업 목록 표시)

**표시 조건**:
- [x] 모든 API 응답 성공
- [x] `trialLessons` 배열에 1개 이상의 수업 존재

**UI 구성**:
- **헤더**:
  - 뒤로가기 버튼 → `/subscribes`
- **등급별 섹션** (각 체험 수업마다):
  - 섹션 헤더:
    - 왼쪽: "Trial: {classCourseGrade}" (h1, bold)
    - 오른쪽: 완료 진도 "{완료수} / {전체수}" (body1, gray-500, bold)
  - 수업 카드: TrialLessonCard (1개)
  - 섹션 간 간격: 16px

**체험 수업 카드 구성**:
- 수업 정보 표시
- 상태별 CTA 버튼
- 티켓 정보 (필요 시)

**인터랙션 요소**:
1. **완료된 체험 수업**
   - 액션: "리포트 보기" 클릭
   - Validation: 없음
   - 결과: `/lessons/ai/trial-report/{uuid}` 이동

2. **예약된 체험 수업**
   - 액션: 수업 정보 확인
   - Validation: 없음
   - 결과: 수업 상세 화면 (모달 or 페이지)

3. **미예약 체험 수업**
   - 액션: "예약하기" 클릭
   - Validation: 티켓 보유 여부 확인
   - 결과: `/reservation?classId={classId}` 이동

4. **뒤로가기 버튼**
   - 액션: `/subscribes`로 이동
   - Validation: 없음
   - 결과: 수업 탐색 화면으로 복귀

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 파라미터 검증 실패
```
조건: langType이 EN, CN이 아님
동작: notFound() 호출 → 404 페이지 표시
Zod 스키마: trialLessonDetailSearchParamsSchema
```

#### 3.2 API 호출 실패 (네트워크/서버)
```
ErrorBoundary fallback 표시
에러 메시지: "수업목록을 가져오는데 문제가 생겼습니다"
CTA: [새로고침 | 뒤로가기]
범위: 전체 TrialLessonDetailList 컴포넌트
```

#### 3.3 인증 에러 (401)
```
에러 메시지: "로그인이 필요합니다"
CTA: 자동으로 로그인 화면 리다이렉트
fallbackDestination: 'LESSON_TAB'
```

#### 3.4 병렬 API 중 일부 실패
```
조건: Promise.all() 중 하나라도 실패
동작: try-catch에서 캐치 → Error 컴포넌트 렌더링
UI: <div>Error</div> (간소화된 에러 표시)
```

---

### 4. 📭 Empty State

**표시 조건**:
- [x] API 응답 성공했지만 `trialLessons` 배열이 비어있음
- [x] 해당 `langType`에 체험 수업이 없음

**UI 구성**:
- 이미지/아이콘: 빈 상태 일러스트
- 메시지: "선택 가능한 체험 수업이 없습니다"
- CTA 버튼: "수업 탐색하기"
- CTA 액션: `/subscribes`로 이동

---

## Validation Rules

### URL 파라미터 검증

| 파라미터 | 검증 규칙 | 에러 처리 |
|----------|----------|----------|
| `langType` | EN \| CN, 필수 | notFound() |

Zod 스키마: `trialLessonDetailSearchParamsSchema`

---

## 모달 & 다이얼로그

이 화면은 자체적으로 모달을 표시하지 않으며, 카드 내부의 인터랙션에서 모달이 트리거될 수 있습니다.

---

## Edge Cases

### 1. 진도율 계산
- **조건**: 완료된 수업 개수 / 전체 수업 개수
- **동작**: `completedLessons.length / trialLessons.length`
- **UI**: 각 섹션 우상단에 "N / M" 형식으로 표시
- **특이사항**: 체험 수업은 보통 등급당 1개이므로 "0 / 1" 또는 "1 / 1"

### 2. 다중 등급
- **조건**: 여러 등급의 체험 수업이 존재 (예: Beginner, Intermediate, Advanced)
- **동작**: 각 등급마다 독립적인 섹션으로 렌더링
- **UI**: 세로로 쌓인 섹션들, 16px 간격

### 3. 티켓 부족
- **조건**: 사용자가 체험 수업을 예약하려 하지만 티켓이 없음
- **동작**: 예약 화면에서 티켓 부족 안내
- **UI**: 티켓 구매 유도 (tickets API로 미리 조회됨)

### 4. 프리페치 실패
- **조건**: 서버에서 prefetch한 데이터 전달 실패
- **동작**: 클라이언트에서 재요청 (React Query 자동 처리)
- **UI**: 약간의 깜빡임 후 정상 표시

### 5. 빈 응답 처리
- **조건**: `trialLessons`가 `undefined` 또는 `[]`
- **동작**: `?.map()` 옵셔널 체이닝으로 안전 처리
- **UI**: 아무것도 렌더링되지 않음 (Empty State로 전환)

---

## 개발 참고사항

**주요 API**:
- `GET /api/lesson/trial?langType={EN|CN}` - 체험 수업 목록 조회
- `GET /api/tickets` - 사용자 티켓 정보 조회
- `GET /api/user/me` - 현재 사용자 정보 조회

**병렬 API 호출**:
```typescript
await Promise.all([
  queryClient.prefetchQuery(lessonEntityQueries.trialLessonDetail({ bearerToken, langType })),
  queryClient.prefetchQuery(lessonEntityQueries.tickets({ bearerToken })),
  queryClient.prefetchQuery(userEntityQueries.getCurrentUser({ bearerToken })),
])
```

**상태 관리**:
- React Query: `useQuery(lessonEntityQueries.trialLessonDetail)`
- Context: `LessonViewModelProvider` (각 카드에 lesson entity 제공)
- 주요 상태 변수:
  - `bearerToken`: 인증 토큰
  - `trialLessons`: 체험 수업 배열
  - `completedLessons`: 완료된 체험 수업 배열

**수업 상태 판단**:
- `lesson.classStatus === '완료'` → 완료 상태
- 그 외 → 예약됨 or 미예약 (TrialLessonCard 내부에서 판단)

**Feature Flags**:
- 없음

**라우팅**:
- 진입: `/subscribes` → "체험 수업" 버튼
- 뒤로가기: `/subscribes`
- 리포트: `/lessons/ai/trial-report/{uuid}`
- 예약: `/reservation?classId={classId}`

**성능 최적화**:
- Server-side prefetch: 3개 API 병렬 호출
- Hydration: `HydrationBoundary`로 서버 데이터 주입
- ErrorBoundary: TrialLessonDetailList 전체를 감싼 단일 boundary

---

## 디자인 참고

- Figma: [추가 필요]
- 디자인 노트:
  - 등급별 섹션 간격: 16px
  - 섹션 내 카드 간격: 8px (현재는 카드 1개뿐)
  - 진도율은 gray-500 컬러
  - 뒤로가기는 TopStickyContainer에 고정

---

## 정규 수업과의 차이점

| 항목 | 체험 수업 | 정규 수업 |
|------|----------|----------|
| **커리큘럼** | 등급당 1개 | 레벨당 다수 |
| **목적** | 레벨 테스트 | 정규 학습 |
| **섹션 구조** | 등급별 독립 섹션 | 단일 레벨 섹션 |
| **카드 타입** | TrialLessonCard (단일) | 7가지 상태 카드 |
| **프리페치** | 3개 API 병렬 | 1개 API |
| **리포트** | `/lessons/ai/trial-report/` | `/lessons/classroom/{id}/report` |

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | junse | 최초 작성 |
