# AI 수업 목록 (Tutor Lesson Topics) UI Flow

**라우트**: `/lessons/ai?langType=EN`
**부모 화면**: Home AI 탭 (`/home/ai`)
**타입**: 메인 화면

## 개요

사용자가 AI 튜터와 진행할 수업 주제를 선택하는 화면입니다. 언어 타입(EN/CN)에 따라 다른 수업 목록이 표시되며, 주제를 선택하면 새로운 수업이 생성되고 예약 화면으로 이동합니다.

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 =====
    Start[화면 진입] --> Init{쿼리 파라미터<br/>langType 확인}
    Init -->|기본값 EN| Loading[⏳ 로딩 상태]

    %% ===== 데이터 로드 =====
    Loading --> FetchTopics[API: getTutorLessonTopics]
    FetchTopics --> DataCheck{데이터 로드<br/>성공?}
    DataCheck -->|성공| HasData{주제 목록<br/>있음?}
    DataCheck -->|실패| ErrorState[❌ 에러 상태]

    HasData -->|Yes| Success[✅ 주제 목록 표시]
    HasData -->|No| Empty[📭 Empty State]

    %% ===== 에러 처리 =====
    ErrorState --> ErrorAction{사용자 액션}
    ErrorAction -->|재시도| Loading
    ErrorAction -->|뒤로가기| BackToHome[/home/ai로 복귀]

    %% ===== 정상 플로우 =====
    Success --> UserAction((주제 카드 클릭))
    UserAction --> CreateClass[⏳ 수업 생성 중<br/>createPodoClass]

    CreateClass --> CreateCheck{생성<br/>성공?}
    CreateCheck -->|성공| NavigateBooking[예약 화면 이동<br/>/reservation]
    CreateCheck -->|실패| CreateError[[❌ 생성 실패 메시지]]
    CreateError --> Success

    %% ===== Empty State =====
    Empty --> EmptyMsg[수업 주제가 없습니다]
    EmptyMsg --> BackAction((뒤로가기))
    BackAction --> BackToHome

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef warning fill:#F39C12,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef empty fill:#95A5A6,stroke:#333,color:#fff
    classDef modal fill:#9B59B6,stroke:#333,color:#fff

    class Success,NavigateBooking normal
    class ErrorState,CreateError error
    class Loading,CreateClass warning
    class Empty empty
    class CreateError modal
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시
- [x] `getTutorLessonTopics` API 호출 중
- [x] `createPodoClass` 뮤테이션 진행 중

**UI 구성**:
- 로딩 스피너 위치: 전체 오버레이
- 스켈레톤 UI 사용: `RegularLessonDetailLoadingView` 컴포넌트
- 로딩 텍스트: 없음 (스켈레톤만 표시)

**timeout 처리**:
- React Query 기본 timeout 적용
- retry: false (재시도 없음)
- timeout 시 에러 상태로 전환

---

### 2. ✅ 성공 상태 (주제 목록 표시)

**표시 조건**:
- [x] `getTutorLessonTopics` API 응답 성공
- [x] `data` 배열에 1개 이상의 주제 존재

**UI 구성**:
- **헤더**:
  - 제목: "레슨 선택"
  - 뒤로가기 버튼 → `/home/ai`
- **메인 컨텐츠**:
  - 주제 카드 리스트 (세로 스크롤)
  - 각 카드 구성:
    - 썸네일 이미지 (82x94px, rounded 12px)
    - 주제 이름 (h6, font-medium)
    - 주제 설명 (body2, gray-500)
    - 태그: 수업 시간 (예: "25m"), "1 lesson"
    - 오른쪽 화살표 아이콘

**인터랙션 요소**:
1. **주제 카드 클릭**
   - 액션:
     1. `createPodoClass` 뮤테이션 호출 (classCourseId, sessionId 전달)
     2. 수업 생성 로딩 표시
   - Validation: 없음 (인증된 사용자만 진입 가능)
   - 성공 시: `navigateLessonBooking({ classId, type: 'new', referrer: 'topic-select' })`
   - 실패 시: 에러 토스트 표시

2. **뒤로가기 버튼**
   - 액션: `/home/ai`로 이동
   - Validation: 없음
   - 결과: 홈 화면으로 복귀

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 네트워크 에러
```
컴포넌트: RegularLessonDetailErrorView
에러 메시지: "네트워크 연결을 확인해주세요"
CTA: [재시도 | 뒤로가기]
```

#### 3.2 인증 에러 (401)
```
에러 메시지: "로그인이 필요합니다"
CTA: 자동으로 로그인 화면으로 리다이렉트
```

#### 3.3 서버 에러 (5xx)
```
에러 메시지: "일시적인 오류가 발생했습니다"
CTA: [재시도 | 고객센터 문의]
```

#### 3.4 수업 생성 실패
```
에러 메시지: "수업을 생성할 수 없습니다. 다시 시도해주세요"
CTA: [확인] → 주제 목록으로 복귀
```

---

### 4. 📭 Empty State

**표시 조건**:
- [x] API 응답 성공했지만 `data` 배열이 비어있음
- [x] 해당 `langType`에 대한 주제가 없음

**UI 구성**:
- 이미지/아이콘: 빈 상태 일러스트
- 메시지: "선택 가능한 수업 주제가 없습니다"
- CTA 버튼: "홈으로 돌아가기"
- CTA 액션: `/home/ai`로 이동

---

## Validation Rules

이 화면은 입력 폼이 없으므로 Validation 없음.

---

## 모달 & 다이얼로그

### 수업 생성 실패 알림

**트리거**: `createPodoClass` 뮤테이션 실패 시
**타입**: 안내

**내용**:
- 제목: "수업 생성 실패"
- 메시지: "수업을 생성할 수 없습니다. 잠시 후 다시 시도해주세요"
- 버튼:
  - 주 버튼: "확인" → 다이얼로그 닫기

---

## Edge Cases

### 1. langType 파라미터 누락
- **조건**: URL에 `langType` 없음
- **동작**: 기본값 `EN` 적용
- **UI**: 영어 수업 주제 목록 표시

### 2. 잘못된 langType 값
- **조건**: `langType`이 EN, CN 외의 값
- **동작**: Zod 스키마 검증 실패 → 기본값 `EN` 적용
- **UI**: 영어 수업 주제 목록 표시

### 3. 동시 다중 클릭
- **조건**: 사용자가 여러 주제를 빠르게 연속 클릭
- **동작**: 첫 번째 클릭의 뮤테이션이 진행 중이면 추가 클릭 무시
- **UI**: 로딩 상태 유지

### 4. 인증 만료
- **조건**: 화면 진입 후 토큰 만료
- **동작**: API 호출 시 401 에러 → 자동 로그인 화면 리다이렉트
- **UI**: 로그인 화면 표시

---

## 개발 참고사항

**주요 API**:
- `GET /api/lesson/tutor-topics?langType={EN|CN}` - 주제 목록 조회
- `POST /api/lesson/create` - 새 수업 생성

**상태 관리**:
- React Query: `lessonEntityQueries.getTutorLessonTopics`
- Mutation: `useLessonMutations().createPodoClass`
- 주요 상태 변수:
  - `bearerToken`: 인증 토큰
  - `sessionId`: 세션 식별자
  - `langType`: 언어 타입 (EN | CN)

**Feature Flags**:
- 없음

**라우팅**:
- 진입: `/home/ai` → "레슨 선택" 버튼
- 성공: `/reservation?classId={classId}&type=new&referrer=topic-select`
- 실패: 뒤로가기 → `/home/ai`

---

## 디자인 참고

- Figma: [추가 필요]
- 디자인 노트:
  - 주제 카드는 8px 간격으로 세로 배치
  - 썸네일은 rounded-12px, 82x94px 고정 크기
  - 태그는 LessonTag 컴포넌트 사용 (4px 간격)

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | junse | 최초 작성 |
