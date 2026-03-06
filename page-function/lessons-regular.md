# 정규 수업 목록 (Regular Lesson Detail) UI Flow

**라우트**: `/lessons/regular?langType={EN|CN}&lessonTime={25|40}&level={1-8}&curriculumType={SMART|LEVEL}&classCourseId={optional}`
**부모 화면**: 수업 탐색 (`/subscribes`)
**타입**: 메인 화면

**Figma**: [레슨 디자인](https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S/-PODO--APP-DESIGN?node-id=455-3799)

## 개요

사용자가 선택한 레벨과 조건에 맞는 정규 수업 커리큘럼을 순차적으로 표시하는 화면입니다. 각 수업은 상태에 따라 다른 UI와 액션을 제공하며, 완료된 수업/예약된 수업/예약 가능한 수업 등을 구분하여 보여줍니다.

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 =====
    Start[화면 진입] --> ValidateParams{쿼리 파라미터<br/>검증}
    ValidateParams -->|실패| NotFound[404 Not Found]
    ValidateParams -->|성공| PrefetchData[데이터 프리페치]

    PrefetchData --> Loading[⏳ 로딩 상태]
    Loading --> FetchLesson[API: lessonDetail 조회]

    %% ===== 데이터 로드 =====
    FetchLesson --> DataCheck{데이터 로드<br/>성공?}
    DataCheck -->|실패| ErrorState[❌ 에러 상태]
    DataCheck -->|성공| HasCourses{수업 목록<br/>있음?}

    HasCourses -->|Yes| Success[✅ 수업 목록 표시]
    HasCourses -->|No| Empty[📭 Empty State]

    %% ===== 에러 처리 =====
    ErrorState --> ErrorAction{사용자 액션}
    ErrorAction -->|재시도| Loading
    ErrorAction -->|뒤로가기| BackToSubscribes[/subscribes 복귀]

    %% ===== 정상 플로우 =====
    Success --> ScrollToClass{classCourseId<br/>파라미터 있음?}
    ScrollToClass -->|Yes| AutoScroll[해당 수업으로<br/>자동 스크롤]
    ScrollToClass -->|No| ShowList[수업 목록 표시]

    AutoScroll --> ShowList
    ShowList --> RenderCards[수업 상태별 카드 렌더링]

    %% ===== 수업 상태별 분기 =====
    RenderCards --> StateCheck{수업 상태}
    StateCheck -->|COMPLETED| CompletedCard[✅ 완료 카드]
    StateCheck -->|ABSENT| AbsentCard[🚫 불참 카드]
    StateCheck -->|CANCELED| CanceledCard[❌ 취소 카드]
    StateCheck -->|RESERVED| ReservedCard[📅 예약 카드]
    StateCheck -->|NOT_RESERVED| NotReservedCard[📭 미예약 카드]
    StateCheck -->|PRE_STUDY| PreStudyCard[📚 예습 카드]
    StateCheck -->|PRE_STUDY_COMPLETED| PreStudyDoneCard[✅ 예습 완료 카드]

    %% ===== 카드별 액션 =====
    CompletedCard --> CompletedAction((리포트 보기))
    CompletedAction --> ClassReport[/lessons/classroom/{id}/report]

    ReservedCard --> ReservedAction((수업 상세))
    ReservedAction --> ClassDetail[수업 상세 정보]

    NotReservedCard --> BookAction((예약하기))
    BookAction --> Reservation[/reservation]

    PreStudyCard --> StudyAction((예습 시작))
    StudyAction --> PreStudyFlow[예습 플로우]

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef warning fill:#F39C12,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef empty fill:#95A5A6,stroke:#333,color:#fff
    classDef modal fill:#9B59B6,stroke:#333,color:#fff

    class Success,ShowList,CompletedCard,PreStudyDoneCard normal
    class ErrorState,AbsentCard,CanceledCard error
    class Loading,PreStudyCard warning
    class CompletedAction,ReservedCard success
    class Empty,NotReservedCard empty
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시
- [x] `lessonDetail` API 호출 중
- [x] Suspense fallback 트리거

**UI 구성**:
- 로딩 스피너 위치: 전체 화면
- 스켈레톤 UI 사용: `RegularLessonDetailLoadingView` 컴포넌트
- 로딩 텍스트: 없음 (스켈레톤만 표시)

**timeout 처리**:
- React Query suspense mode 사용
- timeout 시 에러 바운더리로 전환

---

### 2. ✅ 성공 상태 (수업 목록 표시)

**표시 조건**:
- [x] `lessonDetail` API 응답 성공
- [x] `courses` 배열에 1개 이상의 수업 존재

**UI 구성**:
- **헤더**:
  - 뒤로가기 버튼 → `/subscribes?langType={langType}`
- **레벨 정보 섹션**:
  - 왼쪽: 레벨 이름 (h1, bold) 예: "Level 1"
  - 오른쪽: 진도 표시 (body1, gray-500, bold) 예: "3 / 24"
- **수업 카드 리스트**:
  - 세로 스크롤
  - 카드 간격: 8px
  - 수업 상태별 7가지 카드 타입

**카드 타입별 UI**:

1. **✅ 완료 카드 (COMPLETED)**
   - 수업 완료 표시
   - "리포트 보기" CTA
   - 클릭 시: `/lessons/classroom/{classId}/report`

2. **🚫 불참 카드 (ABSENT)**
   - 불참 사유 표시
   - 재예약 안내
   - 회색 톤 UI

3. **❌ 취소 카드 (CANCELED)**
   - 취소 사유 표시
   - 재예약 가능 안내
   - 회색 톤 UI

4. **📅 예약 카드 (RESERVED)**
   - 예약 날짜/시간 표시
   - 튜터 정보 표시
   - "수업 준비하기" CTA
   - 클릭 시: 수업 상세 정보

5. **📭 미예약 카드 (NOT_RESERVED)**
   - "예약하기" CTA
   - 클릭 시: `/reservation?classId={classId}`

6. **📚 예습 카드 (PRE_STUDY)**
   - 예습 콘텐츠 표시
   - "예습 시작하기" CTA
   - 클릭 시: 예습 플로우 진입

7. **✅ 예습 완료 카드 (PRE_STUDY_COMPLETED)**
   - 예습 완료 표시
   - "복습하기" CTA

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 파라미터 검증 실패
```
조건: langType, lessonTime, level, curriculumType 중 하나라도 유효하지 않음
동작: notFound() 호출 → 404 페이지 표시
```

#### 3.2 네트워크 에러
```
컴포넌트: RegularLessonDetailErrorView
에러 메시지: "네트워크 연결을 확인해주세요"
CTA: [재시도 | 뒤로가기]
```

#### 3.3 인증 에러 (401)
```
에러 메시지: "로그인이 필요합니다"
CTA: 자동으로 로그인 화면 리다이렉트
fallbackDestination: 'LESSON_TAB'
```

#### 3.4 서버 에러 (5xx)
```
에러 메시지: "일시적인 오류가 발생했습니다"
CTA: [재시도 | 고객센터 문의]
```

#### 3.5 렌더링 에러
```
ErrorBoundary fallback: "렌더링 중 오류가 발생했습니다"
범위: 개별 수업 카드마다 독립적인 ErrorBoundary
영향: 한 카드 에러가 전체 목록에 영향 없음
```

---

### 4. 📭 Empty State

**표시 조건**:
- [x] API 응답 성공했지만 `courses` 배열이 비어있음
- [x] 해당 레벨/조건에 수업 커리큘럼이 없음

**UI 구성**:
- 이미지/아이콘: 빈 상태 일러스트
- 메시지: "이 레벨에는 수업이 없습니다"
- CTA 버튼: "다른 레벨 보기"
- CTA 액션: `/subscribes`로 이동

---

## Validation Rules

### URL 파라미터 검증

| 파라미터 | 검증 규칙 | 에러 처리 |
|----------|----------|----------|
| `langType` | EN \| CN | notFound() |
| `lessonTime` | 숫자 변환 가능 (25, 40) | notFound() |
| `level` | 숫자 변환 가능 (1-8) | notFound() |
| `curriculumType` | SMART \| LEVEL | notFound() |
| `classCourseId` | (선택) 숫자 변환 가능 | notFound() |

Zod 스키마: `lessonDetailSearchParamsSchema`

---

## Edge Cases

### 1. classCourseId로 특정 수업 강조
- **조건**: URL에 `classCourseId` 파라미터 존재
- **동작**:
  1. 페이지 로드 후 해당 수업으로 자동 스크롤
  2. `scrollIntoView({ behavior: 'smooth', block: 'center' })`
  3. `data-id="lesson-{classCourseId}"` 셀렉터 사용
- **UI**: 해당 수업이 화면 중앙에 위치

### 2. 중복 스크롤 효과
- **조건**: `useEffect`가 2번 실행됨 (코드에 중복 존재)
- **동작**: 동일한 스크롤이 2번 실행되지만 사용자에게 눈에 띄지 않음
- **UI**: 정상 작동

### 3. 카드 렌더링 에러
- **조건**: 특정 수업 카드 렌더링 중 에러 발생
- **동작**: 해당 카드만 ErrorBoundary fallback 표시
- **UI**: "렌더링 중 오류가 발생했습니다" 메시지

### 4. 잘못된 수업 상태
- **조건**: `calculateLessonStatus(lesson)`가 정의되지 않은 상태 반환
- **동작**: `.otherwise(() => { throw new Error('INVALID_STATUS') })`
- **UI**: ErrorBoundary 트리거

### 5. 진도율 계산
- **조건**: 완료된 수업 개수 / 전체 수업 개수
- **동작**: `completedLessonCourses.length / lessonMetaData.courses.length`
- **UI**: 우상단에 "N / M" 형식으로 표시

---

## 개발 참고사항

**주요 API**:
- `GET /api/lesson/detail?langType={}&lessonTime={}&level={}&curriculumType={}` - 레벨별 수업 커리큘럼 조회

**상태 관리**:
- React Query Suspense: `useSuspenseQuery(lessonEntityQueries.lessonDetail)`
- Context: `LessonViewModelProvider` (각 카드에 lesson entity 제공)
- 주요 상태 변수:
  - `bearerToken`: 인증 토큰
  - `lessonMetaData`: 레벨 정보 + 수업 목록
  - `completedLessonCourses`: 완료된 수업 배열

**수업 상태 계산**:
- 함수: `calculateLessonStatus(lesson)`
- 입력: lesson entity
- 출력: 'COMPLETED' | 'ABSENT' | 'CANCELED' | 'RESERVED' | 'NOT_RESERVED' | 'PRE_STUDY' | 'PRE_STUDY_COMPLETED'

**Feature Flags**:
- 없음

**라우팅**:
- 진입: `/subscribes` → 레벨 선택
- 뒤로가기: `/subscribes?langType={langType}`
- 수업 상세: 각 카드 상태별 다른 destination

**성능 최적화**:
- Server-side prefetch: `queryClient.prefetchQuery` (page.tsx)
- Hydration: `HydrationBoundary`로 서버 데이터 주입
- ErrorBoundary: 카드별 독립적인 에러 격리

---

## 디자인 참고

- Figma: [추가 필요]
- 디자인 노트:
  - 레벨 정보와 진도는 16px 아래 여백
  - 수업 카드는 8px 간격
  - 카드 타입별로 다른 색상/아이콘 사용
  - smooth scroll 애니메이션 (500ms)

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | junse | 최초 작성 |

## Figma 관련 화면

- [레슨 리스트](https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S/-PODO--APP-DESIGN?node-id=16015-10413)
