# 예약 (Booking) 화면 UI Flow

**라우트**: `/booking` (Feature Flag: `migration_booking_react`)
**부모 화면**: Home, 수업 탐색, 예약 목록
**타입**: 풀스크린 페이지
**Figma**: [🎨 예약 변경 디자인](https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S/-PODO--APP-DESIGN?node-id=16015-13253)

## 개요

사용자가 수업 레슨의 날짜와 시간을 선택하여 예약하거나, 기존 예약을 변경할 수 있는 화면입니다.

**주요 기능**:
- 레슨 날짜 선택 (주 단위 스크롤)
- 예약 가능한 시간대 표시
- 페널티/홀딩 기간 표시
- 신규 예약 / 예약 변경

**Query Parameters**:
- `classId`: 수업 ID (필수)
- `type`: `new` (신규 예약) | `edit` (예약 변경)
- `classType`: `regular` | `trial` (선택)
- `referrer`: 이전 화면 (뒤로 가기 동작 결정)

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 & 검증 =====
    Start[화면 진입] --> CheckParams{Query<br/>파라미터<br/>유효?}
    CheckParams -->|무효| NotFound[404 Not Found]
    CheckParams -->|유효| CheckFeatureFlag{Feature Flag<br/>활성화?}

    CheckFeatureFlag -->|비활성| RedirectLegacy[레거시 PHP 페이지로 리디렉션]
    CheckFeatureFlag -->|활성| CheckType{예약 타입}

    CheckType -->|new 신규 예약| CheckAvailable{예약 가능한<br/>날짜 있음?}
    CheckType -->|edit 예약 변경| LoadData

    CheckAvailable -->|없음| RedirectSubscribes[수업 탐색으로 리디렉션]
    CheckAvailable -->|있음| LoadData[⏳ 데이터 로딩]

    %% ===== 데이터 로딩 =====
    LoadData --> LoadSuccess{로딩<br/>성공?}
    LoadSuccess -->|실패| ErrorState[❌ 에러 표시]
    LoadSuccess -->|성공| CheckTicket{회차권<br/>있음?}

    %% ===== 회차권 확인 =====
    CheckTicket -->|없음| EmptyTicket[📭 회차권 없음 Empty State]
    CheckTicket -->|있음| RenderBooking[✅ 예약 화면 렌더링]

    EmptyTicket --> EmptyAction{사용자 액션}
    EmptyAction -->|돌아가기| BackToReferrer[이전 화면으로 이동]

    %% ===== 정상 플로우 =====
    RenderBooking --> ShowPenalty{페널티/<br/>홀딩<br/>있음?}
    ShowPenalty -->|Yes| DisplayPenalty[⚠️ 페널티/홀딩 안내 표시]
    ShowPenalty -->|No| DisplayHeader[예약 헤더 표시]

    DisplayPenalty --> DisplayHeader
    DisplayHeader --> DisplayDates[📅 날짜 선택기 표시]

    %% ===== 날짜 선택 =====
    DisplayDates --> UserSelectDate{사용자 액션}
    UserSelectDate -->|날짜 클릭| LoadSchedule[선택한 날짜의 스케줄 로드]

    LoadSchedule --> CheckSchedule{스케줄<br/>로드 완료?}
    CheckSchedule -->|로딩 중| ScheduleLoading[⏳ 스케줄 로딩]
    CheckSchedule -->|완료| CheckAvailableSlots{예약 가능한<br/>시간대 있음?}

    CheckAvailableSlots -->|없음| EmptySchedule1[📭 "예약 가능한 일정이 없어요"]
    CheckAvailableSlots -->|유효한 레슨권 없음| EmptySchedule2[📭 "유효한 레슨권이 없습니다"]
    CheckAvailableSlots -->|있음| DisplaySlots[⏰ 시간대 그리드 표시]

    EmptySchedule1 --> UserSelectDate
    EmptySchedule2 --> UserSelectDate

    %% ===== 시간 선택 =====
    DisplaySlots --> UserSelectTime{사용자 액션}
    UserSelectTime -->|시간대 클릭| SelectTime[시간 선택]

    SelectTime --> CheckSlotStatus{시간대<br/>상태?}
    CheckSlotStatus -->|예약 마감| ShowToast[[예약 마감 토스트]]
    CheckSlotStatus -->|페널티/홀딩| ShowToast
    CheckSlotStatus -->|선택 가능| EnableButton[CTA 버튼 활성화]

    ShowToast --> UserSelectTime
    EnableButton --> CheckMode{모드}

    %% ===== 예약/변경 처리 =====
    CheckMode -->|new| CTANew[신규 예약 버튼]
    CheckMode -->|edit| CheckOriginal{원래 예약과<br/>같은 시간?}

    CheckOriginal -->|Yes| DisableButton[버튼 비활성화]
    CheckOriginal -->|No| CTAEdit[예약 변경 버튼]

    DisableButton --> UserSelectTime

    CTANew --> ClickBooking{버튼 클릭}
    CTAEdit --> ClickChange{버튼 클릭}

    ClickBooking --> ConfirmDialog[[예약 확인 다이얼로그]]
    ClickChange --> ConfirmChangeDialog[[예약 변경 확인 다이얼로그]]

    ConfirmDialog -->|확인| BookingAPI[예약 API 호출]
    ConfirmDialog -->|취소| UserSelectTime

    ConfirmChangeDialog -->|확인| ChangeAPI[예약 변경 API 호출]
    ConfirmChangeDialog -->|취소| UserSelectTime

    %% ===== API 처리 =====
    BookingAPI --> BookingResult{API<br/>결과}
    BookingResult -->|성공| BookingSuccess[✅ 예약 완료]
    BookingResult -->|실패| BookingError[[예약 실패 다이얼로그]]

    ChangeAPI --> ChangeResult{API<br/>결과}
    ChangeResult -->|성공| ChangeSuccess[✅ 예약 변경 완료]
    ChangeResult -->|실패| ChangeError[[변경 실패 다이얼로그]]

    BookingError --> UserSelectTime
    ChangeError --> UserSelectTime

    BookingSuccess --> RedirectReservation[예약 목록으로 이동]
    ChangeSuccess --> RedirectReservation

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef warning fill:#F39C12,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef empty fill:#95A5A6,stroke:#333,color:#fff
    classDef modal fill:#9B59B6,stroke:#333,color:#fff

    class RenderBooking,DisplayDates,DisplaySlots,EnableButton normal
    class ErrorState,BookingError,ChangeError error
    class LoadData,ScheduleLoading,DisplayPenalty warning
    class BookingSuccess,ChangeSuccess success
    class EmptyTicket,EmptySchedule1,EmptySchedule2 empty
    class ConfirmDialog,ConfirmChangeDialog,ShowToast modal
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시 데이터 로드
  - 수업 정보 (`lectureInfo`)
  - 페널티 정보 (`penalties`)
  - 홀딩 정보 (`holdings`)
  - 예약 가능한 날짜 목록 (`classDates`)
- [x] 날짜 선택 시 해당 날짜의 스케줄 로드

**UI 구성**:
- 초기 로딩: 전체 화면 로딩 (Suspense)
- 스케줄 로딩: 시간대 영역에 빈 공간 표시 (40px 높이)
- 로딩 텍스트: 없음

**timeout 처리**:
- timeout 시간: API 기본 타임아웃
- timeout 시 동작: 에러 상태로 전환

---

### 2. ✅ 성공 상태 (정상 컨텐츠)

**표시 조건**:
- [x] 유효한 회차권 존재
- [x] 예약 가능한 날짜 존재
- [x] API 응답 성공

**UI 구성**:

#### 헤더
- 뒤로 가기 버튼
  - `type: 'edit'` → `/reservation`
  - `referrer: 'home'` → `/home`
  - `referrer: 'subscribes'` → `/subscribes`
  - `referrer: 'reserved-lessons'` → `/reservation`
  - 기타 → `router.back()`

#### 페널티/홀딩 안내 (`PenaltyNotice`)
**표시 조건**: `penalties.length > 0 || holdings.length > 0`

- 페널티 기간 표시
- 홀딩 기간 표시
- 경고 아이콘 + 메시지

#### 예약 헤더
- 제목: "레슨 일정을 선택해주세요."
- 안내 메시지:
  - "레슨 시작 2시간 전까지 언제든지 변경할 수 있어요."
  - "레슨은 N분간 진행돼요." (수업 시간)

#### 날짜 선택기 (`DateSelector`)
- 주 단위 날짜 칩 표시 (수평 스크롤)
- 각 날짜 칩:
  - 날짜 (MM/DD)
  - 요일 (월, 화, ...)
  - 선택 상태 표시
- 날짜 클릭 시 해당 날짜 선택

#### 스케줄 헤더
- 제목: "예약 가능 시간"
- 범례:
  - 페널티&홀딩 (표시 조건: 페널티/홀딩 있음)
  - 예약 마감

#### 시간대 그리드 (`TimeSlotGrid`)
**표시 조건**: 스케줄 로드 완료 & 예약 가능한 시간대 존재

- 시간대별 그룹 (오전, 오후 등)
- 각 시간대 슬롯:
  - 시간 표시 (HH:MM)
  - 상태 표시:
    - 선택 가능 (기본)
    - 선택됨 (파란색)
    - 예약 마감 (회색)
    - 페널티/홀딩 (빨간색)
  - 클릭 가능 여부

#### CTA 버튼 (하단 고정)
**신규 예약 모드** (`type: 'new'`):
- 텍스트: "선택한 날짜에 예약"
- 비활성화 조건:
  - 시간 미선택 (`!selectedTime`)
  - API 호출 중 (`bookMutation.isPending`)
- 로딩 중 텍스트: "예약 중..."

**예약 변경 모드** (`type: 'edit'`):
- 텍스트: "선택한 날짜로 예약 변경"
- 비활성화 조건:
  - 시간 미선택
  - API 호출 중
  - 원래 예약과 같은 시간 선택 (`isOriginalReservation`)
- 로딩 중 텍스트: "변경 중..."

**인터랙션 요소**:

1. **날짜 선택**
   - 액션: 날짜 칩 클릭
   - Validation: 없음
   - 결과: 해당 날짜의 스케줄 로드 및 표시

2. **시간대 선택**
   - 액션: 시간대 슬롯 클릭
   - Validation:
     - 예약 마감 시간 클릭 불가
     - 페널티/홀딩 시간 클릭 불가
   - 결과: 시간 선택 상태 업데이트, CTA 버튼 활성화

3. **예약/변경 버튼 클릭**
   - 액션: CTA 버튼 클릭
   - Validation: 시간 선택 완료
   - 결과: 확인 다이얼로그 표시

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 Query Parameter 유효성 에러
```
조건: classId 누락 또는 잘못된 형식
동작: 404 Not Found 페이지 표시
```

#### 3.2 Feature Flag 비활성
```
조건: migration_booking_react === false
동작: 레거시 PHP 페이지로 자동 리디렉션
URL: /app/user/podo/class-booking?classId={classId}&type={type}
```

#### 3.3 데이터 로드 에러
```
조건: API 호출 실패 (lectureInfo, penalties, holdings 등)
동작: 에러 페이지 표시 (구현 필요)
CTA: [재시도]
```

#### 3.4 예약 API 에러
```
조건: 예약/변경 API 호출 실패
동작: 에러 다이얼로그 표시
메시지: API 에러 메시지 또는 "예약에 실패했습니다"
CTA: [확인] → 시간 선택 화면으로 돌아감
```

---

### 4. 📭 Empty State

**Empty State 타입별 처리**:

#### 4.1 회차권 없음
**표시 조건**: `lectureInfoLoaded && !hasAnyAvailableDate`

**UI 구성**:
- Lottie 애니메이션: 빈 레슨 아이콘
- 메시지: "사용 가능한 회차권이 없습니다."
- CTA: "돌아가기" → 이전 화면으로 이동

#### 4.2 예약 가능한 일정 없음
**표시 조건**: `scheduleLoaded && timeGroups.length === 0`

**UI 구성**:
- Lottie 애니메이션: 빈 레슨 아이콘
- 메시지: "예약 가능한 일정이 없어요."
- CTA: 없음 (다른 날짜 선택 가능)

#### 4.3 유효한 레슨권 없음
**표시 조건**: `scheduleLoaded && !currentDateAvailable`

**UI 구성**:
- Lottie 애니메이션: 빈 레슨 아이콘
- 메시지: "해당 기간에 유효한 레슨권이 없습니다."
- CTA: 없음 (다른 날짜 선택 가능)

---

## Validation Rules

### 시간대 선택 검증

| 검증 항목 | 조건 | 결과 |
|----------|------|------|
| 예약 마감 | 슬롯이 이미 예약됨 | 클릭 불가, 회색 표시 |
| 페널티 기간 | 선택한 시간이 페널티 기간 내 | 클릭 불가, 빨간색 표시 |
| 홀딩 기간 | 선택한 시간이 홀딩 기간 내 | 클릭 불가, 빨간색 표시 |
| 레슨권 유효 기간 | 선택한 날짜가 레슨권 만료일 이후 | Empty State 표시 |

### 예약 변경 검증 (edit 모드)

| 검증 항목 | 조건 | 결과 |
|----------|------|------|
| 원래 예약과 동일 | 선택한 시간이 현재 예약과 같음 | 버튼 비활성화 |

---

## 모달 & 다이얼로그

### 1. 예약 확인 다이얼로그

**트리거**: 신규 예약 버튼 클릭 (`type: 'new'`)

**타입**: 확인

**내용**:
- 제목: (없음)
- 메시지: 선택한 날짜/시간 정보
- 버튼:
  - 주 버튼: "예약하기" → 예약 API 호출
  - 보조 버튼: "취소" → 다이얼로그 닫기

### 2. 예약 변경 확인 다이얼로그

**트리거**: 예약 변경 버튼 클릭 (`type: 'edit'`)

**타입**: 확인

**내용**:
- 제목: (없음)
- 메시지: 변경할 날짜/시간 정보
- 버튼:
  - 주 버튼: "변경하기" → 변경 API 호출
  - 보조 버튼: "취소" → 다이얼로그 닫기

### 3. 예약 실패 다이얼로그

**트리거**: 예약/변경 API 실패

**타입**: 안내

**내용**:
- 제목: "예약 실패"
- 메시지: API 에러 메시지
- 버튼:
  - 주 버튼: "확인" → 다이얼로그 닫기

---

## Edge Cases

### 1. 서버 검증: 예약 가능 날짜 확인

- **조건**: `type: 'new'` 신규 예약 시
- **동작**: 서버 사이드에서 `hasAvailableDates()` 함수로 사전 검증
- **결과**: 예약 가능한 날짜가 없으면 `/subscribes`로 리디렉션

### 2. 레슨 시작 2시간 전 제한

- **조건**: 레슨 시작 2시간 이내
- **동작**: 해당 시간대 자동으로 예약 마감 처리
- **UI**: 회색 표시, 클릭 불가

### 3. 페널티/홀딩 기간 중 예약

- **조건**: 사용자에게 페널티/홀딩이 적용됨
- **동작**: 해당 기간 내 모든 시간대 예약 불가
- **UI**: 빨간색 표시, 상단에 안내 메시지

### 4. 원래 예약과 같은 시간 선택 (edit 모드)

- **조건**: 예약 변경 시 원래 예약 시간과 동일한 시간 선택
- **동작**: 변경 버튼 비활성화
- **UI**: 버튼 disabled 상태

### 5. 여러 날짜 동시 스크롤

- **조건**: 날짜 선택기가 주 단위로 표시
- **동작**: 수평 스크롤로 이전/다음 주 날짜 확인 가능
- **UI**: 스크롤 가능한 날짜 칩 리스트

### 6. Feature Flag 전환

- **조건**: `migration_booking_react` Feature Flag
- **동작**:
  - `true`: React 페이지 표시
  - `false`: 레거시 PHP 페이지로 리디렉션
- **목적**: 점진적 마이그레이션

### 7. Referrer 기반 뒤로 가기

- **조건**: `referrer` query parameter 존재
- **동작**: referrer 값에 따라 다른 페이지로 이동
  - `home` → `/home`
  - `subscribes` → `/subscribes`
  - `reserved-lessons` → `/reservation`
  - 기타 → `router.back()`

---

## 개발 참고사항

**주요 API**:
- `GET /api/booking/lecture-info?classId={classId}` - 수업 정보 조회
- `GET /api/booking/week-dates` - 예약 가능한 주간 날짜 조회
- `GET /api/booking/penalties` - 페널티 정보 조회
- `GET /api/booking/holdings` - 홀딩 정보 조회
- `POST /api/booking` - 신규 예약
- `PUT /api/booking/change` - 예약 변경

**상태 관리**:
- Custom Hooks:
  - `useBookingData`: 데이터 조회 (lectureInfo, penalties, holdings, classDates)
  - `useSchedule`: 스케줄 관리 (날짜/시간 선택, 가용성 계산)
  - `useBookingMutation`: 예약/변경 mutation
  - `useHideScrollbar`: 스크롤바 숨기기
- Local State:
  - `selectedDateIndex`: 선택한 날짜 인덱스
  - `selectedTime`: 선택한 시간
  - `timeGroups`: 시간대 그룹 목록
  - `scheduleLoaded`: 스케줄 로드 완료 여부

**Feature Flags**:
- `migration_booking_react`: React 페이지 활성화 여부
  - `true`: 현재 페이지 표시
  - `false`: PHP 레거시 페이지로 리디렉션

**주요 컴포넌트**:
- `BookingView`: 메인 페이지 컴포넌트
- `DateSelector`: 날짜 선택기 (주간 캘린더)
- `TimeSlotGrid`: 시간대 그리드
- `PenaltyNotice`: 페널티/홀딩 안내
- `BookingConfirmDialog`: 예약 확인 다이얼로그

**CSS Module**:
- `booking.module.css`: 스타일 정의

---

## 디자인 참고

- Figma: (추가 필요)
- 디자인 노트:
  - 날짜 선택기: 수평 스크롤
  - 시간대 그리드: 시간별 그룹핑
  - 페널티/홀딩: 빨간색 표시
  - 예약 마감: 회색 표시

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | Claude | 최초 작성 |
