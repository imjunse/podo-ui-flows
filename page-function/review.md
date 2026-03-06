# 수업 리뷰 (Lesson Review) 화면 UI Flow

**라우트**: `/lessons/classroom/[classID]/review`
**부모 화면**: 수업 진행 (`/lessons/classroom/[classID]`)
**타입**: 풀스크린 페이지

## 개요

수업 완료 후 수업 내용을 복습하는 화면입니다. 튜터가 선택한 피드백 질문들을 순차적으로 풀면서 학습 내용을 확인합니다.

**주요 기능**:
- 4가지 질문 타입 지원
- 답안 입력 및 검증
- AI 기반 정답/오답 피드백
- Funnel 패턴으로 순차 진행
- 진행 상황 표시 (Stepper)

**Query Parameters**:
- `feedbackIds`: 피드백 질문 ID 목록 (콤마 구분)

**질문 타입**:
1. **BLANK_FILLING**: 빈칸 채우기
   - 문장에서 빈칸에 들어갈 단어 입력
2. **SENTENCE_MAKING**: 문장 만들기
   - 주어진 단어들을 조합하여 문장 완성
3. **MULTI_CHOICE_SENTENCE**: 객관식 (문장)
   - 4지선다 문장 선택
4. **MULTI_CHOICE_WORD**: 객관식 (단어)
   - 4지선다 단어 선택

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 =====
    Start[수업 완료 후 진입] --> LoadQuestions[⏳ 질문 목록 로드]
    LoadQuestions --> QuestionsLoaded[질문 목록 로드 완료]

    QuestionsLoaded --> InitFunnel[Funnel 초기화]
    InitFunnel --> ShowFirstQuestion[첫 번째 질문 표시]

    %% ===== 질문 표시 =====
    ShowFirstQuestion --> DisplayUI[UI 렌더링]
    DisplayUI --> ShowStepper[진행 상황 Stepper]
    ShowStepper --> ShowQuestion[질문 텍스트 표시]
    ShowQuestion --> DetermineType{질문 타입}

    DetermineType -->|BLANK_FILLING| BlankForm[빈칸 채우기 입력 폼]
    DetermineType -->|SENTENCE_MAKING| SentenceForm[문장 만들기 입력 폼]
    DetermineType -->|MULTI_CHOICE_SENTENCE| SentenceChoice[객관식 문장 선택]
    DetermineType -->|MULTI_CHOICE_WORD| WordChoice[객관식 단어 선택]

    BlankForm --> UserInput{사용자 입력}
    SentenceForm --> UserInput
    SentenceChoice --> UserInput
    WordChoice --> UserInput

    %% ===== 답안 입력 =====
    UserInput -->|입력 중| UpdateAnswer[답안 상태 업데이트]
    UpdateAnswer --> EnableCTA[확인 버튼 활성화]
    EnableCTA --> WaitAction{사용자 액션}

    WaitAction -->|답안 수정| UpdateAnswer
    WaitAction -->|확인 버튼 클릭| SubmitAnswer[답안 제출]

    %% ===== 답안 검증 =====
    SubmitAnswer --> ShowLoading[⏳ 로딩 스피너 표시]
    ShowLoading --> CheckAPI[checkAnswer API 호출]

    CheckAPI --> APIResult{API 결과}
    APIResult -->|성공| CheckCorrect{정답<br/>여부?}
    APIResult -->|실패| ErrorDialog[[에러 다이얼로그]]

    ErrorDialog --> GoNext[다음 문제로 이동]

    %% ===== 정답 처리 =====
    CheckCorrect -->|정답| CorrectToast[[✅ 정답 토스트]]
    CorrectToast --> SetCorrectStatus[상태: CORRECT]
    SetCorrectStatus --> ShowNextBtn[다음 버튼 표시]

    %% ===== 오답 처리 =====
    CheckCorrect -->|오답| WrongToast[[❌ 오답 토스트 + AI 설명]]
    WrongToast --> SetIncorrectStatus[상태: INCORRECT]
    SetIncorrectStatus --> ShowNextBtn

    %% ===== 다음 문제로 이동 =====
    ShowNextBtn --> UserNext{사용자 액션}
    UserNext -->|답안 수정| UpdateAnswer
    UserNext -->|다음 버튼 클릭| ClearToast[토스트 닫기]

    ClearToast --> CheckLast{마지막<br/>문제?}
    CheckLast -->|No| NextQuestion[다음 Funnel Step]
    CheckLast -->|Yes| GoComplete[리뷰 완료 페이지]

    NextQuestion --> ResetStatus[상태: NOT_ANSWERED]
    ResetStatus --> ShowQuestion

    GoComplete --> ClearCache[쿼리 캐시 제거]
    ClearCache --> RedirectComplete[/classroom/[id]/review-complete]

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef warning fill:#F39C12,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef modal fill:#9B59B6,stroke:#333,color:#fff

    class DisplayUI,ShowQuestion,BlankForm,SentenceForm,SentenceChoice,WordChoice normal
    class ErrorDialog error
    class LoadQuestions,ShowLoading,UpdateAnswer warning
    class CorrectToast,SetCorrectStatus,GoComplete success
    class WrongToast,ErrorDialog modal
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시 질문 목록 로드
- [x] 답안 제출 후 API 응답 대기

**UI 구성**:
- 초기 로딩: `LessonReviewPageLoading` 컴포넌트 (Suspense fallback)
- 답안 제출 로딩: 확인 버튼에 로딩 스피너 표시
  - Lottie: LoadingIconLottie
  - 버튼 비활성화

**timeout 처리**:
- timeout 시간: API 기본 타임아웃
- timeout 시 동작: 에러 다이얼로그 표시

---

### 2. ✅ 성공 상태 (정상 컨텐츠)

**표시 조건**:
- [x] 질문 목록 로드 성공
- [x] 사용자 인증 유효

**UI 구성**:

#### 헤더
- Stepper: "N / M" 형태
  - N: 현재 문제 번호 (1-based)
  - M: 전체 문제 수
  - variant: default

#### 질문 섹션
- 질문 텍스트
  - 색상: 초록색 (`text-green-500`)
  - 크기: h1
  - 내용: 튜터가 작성한 질문

#### 답안 입력 폼 (질문 타입별)

**1. BLANK_FILLING (빈칸 채우기)**
- UI: 텍스트 입력 필드
- 기능: 빈칸에 들어갈 단어/구 입력
- Validation: 없음 (자유 입력)

**2. SENTENCE_MAKING (문장 만들기)**
- UI: 단어 카드 드래그 앤 드롭
- 기능: 단어 순서를 조합하여 문장 완성
- Validation: 모든 단어 사용 필수

**3. MULTI_CHOICE_SENTENCE (객관식 문장)**
- UI: 4개 선택지 버튼
- 기능: 하나의 문장 선택
- Validation: 1개 선택 필수

**4. MULTI_CHOICE_WORD (객관식 단어)**
- UI: 4개 선택지 버튼
- 기능: 하나의 단어 선택
- Validation: 1개 선택 필수

#### CTA 버튼 (하단 고정)
**상태별 버튼 변화**:

1. **NOT_ANSWERED (답안 미입력)**
   - 텍스트: "확인"
   - 비활성화 조건: 답안 미입력
   - 클릭: 답안 제출 → checkAnswer API

2. **API 호출 중**
   - 텍스트: (없음)
   - 아이콘: 로딩 스피너
   - 비활성화: true

3. **CORRECT (정답) / INCORRECT (오답)**
   - 텍스트: "다음"
   - 비활성화: false
   - 클릭: 다음 문제로 이동 (또는 완료 페이지)

**인터랙션 요소**:

1. **답안 입력**
   - 액션: 입력 필드에 값 입력 또는 선택지 클릭
   - Validation: 타입별 상이
   - 결과:
     - Funnel context 업데이트 (history.replace)
     - 상태를 NOT_ANSWERED로 변경 (정답 후 수정 시)
     - 확인 버튼 활성화

2. **확인 버튼 클릭**
   - 액션: CTA 버튼 클릭 (NOT_ANSWERED 상태)
   - Validation: 답안 입력 완료
   - 결과: checkAnswer API 호출

3. **다음 버튼 클릭**
   - 액션: CTA 버튼 클릭 (CORRECT/INCORRECT 상태)
   - Validation: 없음
   - 결과:
     - 마지막 문제 아님: 다음 Funnel step으로 이동
     - 마지막 문제: 리뷰 완료 페이지로 이동

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 Query Parameter 유효성 에러
```
조건: classID 누락 또는 잘못된 형식
동작: 404 Not Found 페이지 표시
```

#### 3.2 질문 목록 로드 에러
```
조건: getQuestions API 실패
동작: 에러 페이지 표시 (Suspense error boundary)
```

#### 3.3 답안 검증 API 에러
```
트리거: checkAnswer API 실패 (네트워크 오류, 서버 오류 등)

다이얼로그:
- 제목: "일시적인 오류 발생"
- 메시지: "서버와의 통신이 원활하지 않아\n요청을 처리하지 못했습니다."
- 버튼: "확인" → 다음 문제로 이동

동작:
- 에러 발생 시 현재 문제 건너뛰기
- 다음 문제로 자동 이동
```

---

### 4. 📭 Empty State

Lesson Review 화면은 Empty State가 없습니다.
질문이 없으면 이 화면으로 진입하지 않습니다.

---

## Toast 메시지

### 1. 정답 토스트

**트리거**: checkAnswer API 응답 → `correct: true`

**내용**:
- 제목: "정답입니다!"
- 색상: 초록색 (`text-green-500`)
- 아이콘: SuccessIconLottie (1회 재생)
- 지속 시간: 기본값

**동작**:
- 상태를 CORRECT로 변경
- CTA 버튼을 "다음"으로 변경

### 2. 오답 토스트

**트리거**: checkAnswer API 응답 → `correct: false`

**내용**:
- 제목: "오답입니다."
- 색상: 빨간색 (`text-[#FD6771]`)
- 아이콘: WrongIconLottie (1회 재생)
- 설명: 질문 타입별 상세 피드백
- 지속 시간: 400초 (매우 긴 시간, 수동 닫기 유도)

**질문 타입별 오답 설명**:

#### BLANK_FILLING
- 사용자 답안
- 정답 (master_answer)
- AI 설명 (ai_explanation)
- 하이라이트된 정답 부분 (master_highlight)

#### SENTENCE_MAKING
- 사용자가 만든 문장
- 정답 문장
- AI 설명
- 하이라이트된 정답 부분

#### MULTI_CHOICE_SENTENCE
- 사용자가 선택한 문장 (인덱스 포함)
- 정답 문장 (인덱스 포함)
- AI 설명
- 하이라이트된 정답 부분

#### MULTI_CHOICE_WORD
- 사용자가 선택한 단어 (인덱스 포함)
- 정답 단어 (인덱스 포함)
- AI 설명
- 하이라이트된 정답 부분

**동작**:
- 상태를 INCORRECT로 변경
- CTA 버튼을 "다음"으로 변경
- 토스트 ID를 저장 (다음 문제 이동 시 닫기용)

---

## Validation Rules

### 답안 입력 검증

| 질문 타입 | 검증 조건 | 확인 버튼 활성화 |
|----------|----------|----------------|
| BLANK_FILLING | 입력 필드 비어있지 않음 | O |
| SENTENCE_MAKING | 모든 단어 사용 완료 | O |
| MULTI_CHOICE_SENTENCE | 1개 선택지 선택 | O |
| MULTI_CHOICE_WORD | 1개 선택지 선택 | O |

---

## 모달 & 다이얼로그

### 1. API 에러 다이얼로그

**트리거**: checkAnswer API 실패

**타입**: 안내 (AlertDialog)

**내용**:
- 제목: "일시적인 오류 발생"
- 메시지: "서버와의 통신이 원활하지 않아\n요청을 처리하지 못했습니다."
- 버튼:
  - 주 버튼: "확인" → 다음 문제로 이동

---

## Edge Cases

### 1. Funnel 패턴 사용

- **조건**: @use-funnel 라이브러리 활용
- **동작**:
  - 각 질문을 Funnel step으로 관리
  - history.push: 다음 step으로 이동
  - history.replace: 현재 step의 context 업데이트
- **주의**: 라이브러리 업데이트 시 타입 변경 확인 필요

### 2. 답안 상태 관리

- **조건**: 사용자가 답안을 입력하고 다시 수정
- **동작**:
  - 정답 후 수정: 상태를 NOT_ANSWERED로 되돌리지 않음 (다음 버튼 유지)
  - 오답 후 수정: 상태를 NOT_ANSWERED로 변경 (확인 버튼으로 되돌림)
- **목적**: 정답 후 실수로 수정해도 다음으로 진행 가능

### 3. Toast 중복 방지

- **조건**: 연속으로 여러 문제 답안 제출
- **동작**: `lastToastIds` 배열에 토스트 ID 저장
- **결과**: 다음 문제 이동 시 이전 토스트 모두 닫기 (`dismissToast`)

### 4. Master Answer 전달

- **조건**: checkAnswer API 호출 시
- **데이터**:
  - `user_answer`: 사용자 입력 답안
  - `master_answer`: API 응답의 대표 정답 (LLM에 전달용)
  - `question_id`: 질문 ID
- **목적**: AI가 정확한 기준으로 채점할 수 있도록

### 5. AI 설명 하이라이트

- **조건**: 오답 토스트 표시 시
- **데이터**: `master_highlight` 배열 (인덱스 목록)
- **동작**: 정답에서 중요한 부분을 하이라이트 표시
- **필터**: `filter((num) => num >= 0)` (유효한 인덱스만)

### 6. 마지막 문제 완료

- **조건**: 마지막 Funnel step에서 "다음" 클릭
- **동작**: `/lessons/classroom/[classID]/review-complete`로 이동
- **쿼리 캐시**: 이동 전 레슨 관련 쿼리 캐시 제거

### 7. ClientOnlyV2 사용

- **조건**: CSR 전용 렌더링 필요
- **이유**: @use-funnel이 클라이언트 전용 라이브러리
- **fallback**: `<LessonReviewPageLoading />`

---

## 개발 참고사항

**주요 API**:
- `GET /api/lesson/questions?classId={classId}&feedbackIds={ids}` - 질문 목록 조회
- `POST /api/lesson/check-answer` - 답안 검증
  - Request: `{ user_answer, master_answer, question_id }`
  - Response (성공): `{ correct: true }`
  - Response (실패): `{ correct: false, user_answer, master_answer, ai_explanation, master_highlight }`

**상태 관리**:
- Funnel State (useLessonReviewQuestionFunnel):
  - `currentFunnelStepKey`: 현재 문제 키
  - `nextFunnelStepKey`: 다음 문제 키
  - `isLastFunnelStep`: 마지막 문제 여부
  - `currentFunnel`: 현재 문제 데이터
  - `context`: Funnel context (questions, answers)
  - `history`: Funnel history (push, replace)
- Local State:
  - `currentFunnelStatus`: 현재 답안 상태 (NOT_ANSWERED | CORRECT | INCORRECT)
  - `lastToastIds`: 토스트 ID 배열 (중복 방지용)
- React Query:
  - `questionPromise`: 질문 목록 (use() hook으로 unwrap)

**Feature Flags**:
- 없음

**주요 라이브러리**:
- `@use-funnel`: Funnel 패턴 구현
  - 각 질문을 step으로 관리
  - context와 history로 상태 관리

**주요 컴포넌트**:
- `LessonReviewView`: 메인 페이지 컴포넌트
- `LessonReviewFunnelView`: 질문 타입별 입력 폼 렌더링
- `LessonReviewPageLoading`: 로딩 스켈레톤
- `Stepper`: 진행 상황 표시
- Toast 설명 컴포넌트:
  - `WrongBlankFillingToastDescription`
  - `WrongSentenceMakingToastDescription`
  - `WrongMultiChoiceSentenceToastDescription`
  - `WrongMultiChoiceWordToastDescription`

**타입**:
- `BlankFillingQuestion`
- `SentenceMakingQuestion`
- `MultiChoiceSentenceQuestion`
- `MultiChoiceWordQuestion`
- `LessonReviewAnswerStatus`: `NOT_ANSWERED | CORRECT | INCORRECT`

---

## 디자인 참고

- Figma: (추가 필요)
- 디자인 노트:
  - 질문 텍스트: 초록색
  - 정답 토스트: 초록색 + 성공 아이콘
  - 오답 토스트: 빨간색 + 오답 아이콘 + AI 설명
  - Stepper: 진행 상황 명확히 표시

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | Claude | 최초 작성 |
