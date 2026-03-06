# 수업 진행 (Classroom) 화면 UI Flow

**라우트**: `/lessons/classroom/[classID]`
**부모 화면**: 예약 목록 (`/reservation`)
**타입**: 풀스크린 페이지 (Immersive)

## 개요

사용자가 실제 수업을 진행하는 화면입니다. Zoom 링크를 iframe으로 embed하여 수업에 참여하고, 강의 자료(비디오/오디오)를 재생할 수 있습니다.

**주요 기능**:
- Zoom 화상 수업 진행
- 강의 비디오 재생
- MP3 오디오 재생
- 예습 시간 추적 (PRE_STUDY 모드)
- 펜 모드 지원 (터치 디바이스)
- 수업 종료 처리

**Query Parameters**:
- `level`: 수업 레벨
- `week`: 주차
- `permission`: `true` (마이크 권한) | `false`
- `langType`: 언어 타입 (선택, 예습 모드 감지용)
- `sessionId`: 세션 ID
- `referrer`: 이전 화면 (뒤로 가기 동작 결정)
- `original*`: 원본 수업 정보 (변경 내역 추적)

**수업 타입**:
- **PRE_STUDY**: 예습 (수업 시작 2시간 전부터 가능)
  - `pre_zoom_join_url` 사용
  - 예습 시간 1분마다 서버에 전송
- **CLASS**: 실제 수업
  - `zoom_join_url` 사용 (없으면 pre_zoom_join_url fallback)
  - 수업 종료 시 리뷰 페이지로 이동

---

## 전체 UI Flow

```mermaid
graph TD
    %% ===== 초기 진입 & 검증 =====
    Start[화면 진입] --> CheckParams{Query<br/>파라미터<br/>유효?}
    CheckParams -->|무효| NotFound[404 Not Found]
    CheckParams -->|유효| CheckFeatureFlag{Feature Flag<br/>활성화?}

    CheckFeatureFlag -->|비활성| RedirectLegacy[레거시 PHP 페이지로 리디렉션]
    CheckFeatureFlag -->|활성| FetchLectureInfo[수업 정보 조회]

    FetchLectureInfo --> CheckEnterInfo{lectureEnterInfo<br/>성공?}
    CheckEnterInfo -->|실패| NotFound
    CheckEnterInfo -->|성공| DetermineType{수업 타입<br/>결정}

    DetermineType -->|수업 시작 전<br/>+ langType 있음| PreStudyMode[📚 PRE_STUDY 모드]
    DetermineType -->|수업 시작 후<br/>or langType 없음| ClassMode[🎓 CLASS 모드]

    %% ===== PRE_STUDY 모드 =====
    PreStudyMode --> CheckPenMode{Pen Mode<br/>지원?}
    CheckPenMode -->|지원| EnablePen[penMode=true]
    CheckPenMode -->|미지원<br/>or 비활성화| DisablePen[penMode=false]

    EnablePen --> RenderPreStudy[✅ 예습 화면 렌더링]
    DisablePen --> RenderPreStudy

    RenderPreStudy --> LoadZoom1[⏳ Zoom iframe 로드]
    LoadZoom1 --> ZoomLoaded1[Zoom 로드 완료]
    ZoomLoaded1 --> StartPolling[⏰ 예습 시간 추적 시작]

    StartPolling --> PollingLoop{1분마다<br/>폴링}
    PollingLoop --> UpdateTime[updatePreStudyTime API]
    UpdateTime --> PollingResult{API<br/>결과}

    PollingResult -->|성공| ResetFailures[실패 카운트 초기화]
    PollingResult -->|실패| IncrementFailures[실패 카운트 증가]

    IncrementFailures --> CheckFailures{연속 실패<br/>3회?}
    CheckFailures -->|No| PollingLoop
    CheckFailures -->|Yes| RetryCreate[createPodoClassAction 재시도]

    RetryCreate --> RetryResult{재시도<br/>결과}
    RetryResult -->|성공| ResetFailures
    RetryResult -->|실패| SentryLog[Sentry 에러 로그]

    ResetFailures --> PollingLoop
    SentryLog --> PollingLoop

    %% ===== CLASS 모드 =====
    ClassMode --> RenderClass[✅ 수업 화면 렌더링]
    RenderClass --> LoadZoom2[⏳ Zoom iframe 로드]
    LoadZoom2 --> ZoomLoaded2[Zoom 로드 완료]

    %% ===== 공통 UI =====
    ZoomLoaded2 --> ShowHeader[헤더 표시]
    ZoomLoaded1 --> ShowHeader

    ShowHeader --> CheckMaterials{강의 자료<br/>있음?}
    CheckMaterials -->|비디오 있음| ShowVideoBtn[강의 버튼 표시]
    CheckMaterials -->|오디오 있음| ShowMp3Btn[MP3 버튼 표시]
    CheckMaterials -->|없음| ShowExitBtn[나가기 버튼만 표시]

    ShowVideoBtn --> ShowExitBtn
    ShowMp3Btn --> ShowExitBtn

    ShowExitBtn --> UserAction{사용자 액션}

    %% ===== 사용자 인터랙션 =====
    UserAction -->|강의 버튼 클릭| VideoList[[비디오 목록 팝오버]]
    UserAction -->|MP3 버튼 클릭| Mp3List[[MP3 목록 팝오버]]
    UserAction -->|나가기 버튼 클릭| LeaveClick[나가기 클릭]

    VideoList --> SelectVideo{비디오 선택}
    SelectVideo --> PlayVideo[비디오 재생]
    PlayVideo --> ShowVideoPlayer[📹 비디오 플레이어 표시]

    ShowVideoPlayer --> VideoAction{사용자 액션}
    VideoAction -->|닫기 버튼| CloseVideo[비디오 닫기]
    VideoAction -->|다른 비디오 선택| SelectVideo

    CloseVideo --> UserAction

    Mp3List --> SelectMp3{MP3 선택}
    SelectMp3 --> PlayMp3[MP3 재생]
    PlayMp3 --> ShowMp3Player[🎵 MP3 플레이어 표시]

    ShowMp3Player --> Mp3Action{사용자 액션}
    Mp3Action -->|닫기 버튼| CloseMp3[MP3 닫기]
    Mp3Action -->|다른 MP3 선택| SelectMp3

    CloseMp3 --> UserAction

    %% ===== 수업 종료 =====
    LeaveClick --> CheckLeaving{이미<br/>종료 중?}
    CheckLeaving -->|Yes| IgnoreClick[클릭 무시]
    CheckLeaving -->|No| StopTimeChecker[시간 체커 중단]

    IgnoreClick --> UserAction

    StopTimeChecker --> LeaveDialog[[나가기 확인 다이얼로그]]
    LeaveDialog -->|취소| ResetLeaving[종료 플래그 초기화]
    LeaveDialog -->|확인| FinishClass[requestFinishPodoClass API]

    ResetLeaving --> UserAction

    FinishClass --> FinishResult{API<br/>결과}
    FinishResult -->|성공| CheckMode{수업 타입}
    FinishResult -->|실패| ErrorLog[에러 로그]

    ErrorLog --> GoBack

    CheckMode -->|CLASS<br/>+ 레슨 완료| GoReview[리뷰 페이지로 이동]
    CheckMode -->|CLASS<br/>+ 레슨 미완료| GoBack[이전 페이지로 이동]
    CheckMode -->|PRE_STUDY| GoBack

    GoReview --> ClearCache[레슨 쿼리 캐시 제거]
    GoBack --> ClearCache

    ClearCache --> DetermineReferrer{referrer}
    DetermineReferrer -->|lesson-list| RedirectLessons[/lessons 또는 originalUrl]
    DetermineReferrer -->|reserved| RedirectReservation[/reservation]
    DetermineReferrer -->|booking| RedirectBooking[/booking]
    DetermineReferrer -->|ai-home| RedirectAIHome[/home/ai]
    DetermineReferrer -->|기타| RedirectHome[/home]

    %% ===== 스타일링 =====
    classDef normal fill:#4A90D9,stroke:#333,color:#fff
    classDef error fill:#E74C3C,stroke:#333,color:#fff
    classDef warning fill:#F39C12,stroke:#333,color:#fff
    classDef success fill:#27AE60,stroke:#333,color:#fff
    classDef modal fill:#9B59B6,stroke:#333,color:#fff
    classDef prestudy fill:#3498DB,stroke:#333,color:#fff

    class RenderPreStudy,RenderClass,ShowHeader,ShowVideoPlayer,ShowMp3Player normal
    class NotFound,ErrorLog error
    class LoadZoom1,LoadZoom2,StartPolling,UpdateTime warning
    class GoReview,ClearCache success
    class VideoList,Mp3List,LeaveDialog modal
    class PreStudyMode,StartPolling,PollingLoop prestudy
```

---

## 상태별 상세 설명

### 1. ⏳ 로딩 상태

**표시 조건**:
- [x] 화면 최초 진입 시
  - 수업 정보 조회 (`lectureEnterInfo`, `lectureRoomInfo`)
  - Zoom URL 결정
- [x] Zoom iframe 로드 중

**UI 구성**:
- 로딩 스피너: 없음 (ClientOnly로 SSR 방지)
- Zoom iframe onLoad 이벤트로 로드 완료 감지

**timeout 처리**:
- timeout 시간: Zoom iframe 기본 타임아웃
- timeout 시 동작: 에러 상태로 전환 (구현 필요)

---

### 2. ✅ 성공 상태 (정상 컨텐츠)

**표시 조건**:
- [x] 수업 정보 조회 성공 (`lectureEnterInfo.resultCd === '200'`)
- [x] Zoom URL 유효
- [x] 사용자 인증 유효

**UI 구성**:

#### 헤더 (80px 고정)
**강의 자료 버튼** (조건부):
1. **강의 버튼** (비디오 있을 때)
   - 배경: 보라색 (`#e5d5fa`)
   - 아이콘: 리스트 아이콘
   - 클릭 시: 비디오 목록 팝오버 표시

2. **MP3 버튼** (오디오 있을 때)
   - 배경: 파란색 (`#d5e3fa`)
   - 아이콘: 스피커 아이콘
   - 클릭 시: MP3 목록 팝오버 표시

3. **나가기 버튼** (항상 표시)
   - 배경: 검정 (`#222`)
   - 아이콘: Exit 아이콘
   - 위치: 오른쪽 정렬

#### 비디오 플레이어 (조건부)
**표시 조건**: `videoState.status === 'PLAYING'`

- iframe으로 비디오 embed
- 높이: 40vh
- 닫기 버튼: 화면 상단 중앙 오버레이
- 전체 화면 지원

#### MP3 플레이어 (조건부)
**표시 조건**: `audioState.status === 'PLAYING'`

- CustomAudioPlayer 컴포넌트
- 재생/일시정지, 진행 바, 볼륨 조절
- 닫기 버튼

#### Zoom iframe (메인)
- URL: `classRoomUrl` + `?penMode={true|false}`
- 펜 모드:
  - 터치 지원 디바이스: true
  - 마우스만 지원 디바이스: false
  - Feature Flag로 강제 비활성화 가능
- 마이크 권한: `permission === 'true'` 또는 lemonboard-web URL인 경우

**인터랙션 요소**:

1. **강의 버튼 클릭**
   - 액션: 비디오 목록 팝오버 열기
   - Validation: 없음
   - 결과: 비디오 목록 표시

2. **비디오 선택**
   - 액션: 팝오버에서 비디오 아이템 클릭
   - Validation: 없음
   - 결과:
     - 비디오 플레이어 표시
     - Zoom iframe 아래에 overlay
     - 선택한 비디오 하이라이트 (노란색 배경)

3. **비디오 닫기**
   - 액션: 닫기 버튼 클릭
   - Validation: 없음
   - 결과: 비디오 플레이어 숨김

4. **MP3 버튼 클릭 & 재생**
   - 동작: 비디오와 유사
   - MP3 플레이어: audio 태그 기반 커스텀 플레이어

5. **나가기 버튼 클릭**
   - 액션: 나가기 버튼 클릭
   - Validation: 중복 클릭 방지 (`isLeavingRef`)
   - 결과: 나가기 확인 다이얼로그 표시

---

### 3. ❌ 에러 상태

**에러 타입별 처리**:

#### 3.1 Query Parameter 유효성 에러
```
조건: classID, level, week, permission 누락 또는 잘못된 형식
동작: 404 Not Found 페이지 표시
```

#### 3.2 Feature Flag 비활성
```
조건: classroom_migration === false
동작: 레거시 PHP 페이지로 자동 리디렉션
URL: /app/user/podo/classroom?{params}
```

#### 3.3 수업 정보 조회 에러
```
조건: lectureEnterInfo.resultCd !== '200'
동작: 404 Not Found 페이지 표시
```

#### 3.4 예습 시간 업데이트 에러
```
조건: updatePreStudyTime API 실패
동작:
- 연속 실패 카운트 증가
- 3회 연속 실패 시 createPodoClassAction 재시도
- Sentry에 에러 로그 전송
- 사용자에게는 에러 표시 없음 (백그라운드 처리)
```

#### 3.5 수업 종료 API 에러
```
조건: requestFinishPodoClass API 실패
동작:
- Sentry에 에러 로그 전송
- 쿼리 캐시 제거
- 이전 페이지로 이동
```

---

### 4. 📭 Empty State

Classroom 화면은 Empty State가 없습니다.
수업 정보가 없으면 404 Not Found로 처리됩니다.

---

## Validation Rules

해당 화면은 입력 폼이 없으므로 validation 불필요.

---

## 모달 & 다이얼로그

### 1. 비디오 목록 팝오버

**트리거**: 강의 버튼 클릭

**타입**: Popover

**내용**:
- 비디오 목록 (ul/li)
- 각 비디오:
  - 비디오 이름
  - 현재 재생 중: 노란색 배경 (`#fff2d0`)
  - hover: 회색 배경
- 클릭 시: 해당 비디오 재생

### 2. MP3 목록 팝오버

**트리거**: MP3 버튼 클릭

**타입**: Popover

**내용**:
- MP3 목록 (ul/li)
- 각 MP3:
  - 파일 이름
  - 현재 재생 중: 노란색 배경
  - hover: 회색 배경
- 클릭 시: 해당 MP3 재생

### 3. 나가기 확인 다이얼로그

**트리거**: 나가기 버튼 클릭

**타입**: 확인 (ConfirmDialog)

**내용**:
- 제목: "정말 나가시겠어요?"
- 메시지:
  - PRE_STUDY: "예습을 종료하시겠어요?"
  - CLASS: "수업을 종료하시겠어요?"
- 버튼:
  - 주 버튼: "나가기" → 수업 종료 API 호출
  - 보조 버튼: "취소" → 다이얼로그 닫기

---

## Edge Cases

### 1. 예습 시간 추적 폴링 실패

- **조건**: updatePreStudyTime API 연속 3회 실패
- **동작**:
  1. createPodoClassAction 재시도
  2. 성공 시: 실패 카운트 초기화, 폴링 계속
  3. 실패 시: Sentry 에러 로그, 폴링 계속
- **목적**: 네트워크 불안정 시 예습 시간 손실 방지

### 2. Pen Mode 감지

- **조건**: 터치 지원 디바이스 감지
- **동작**: `checkDevicePenMode()` 함수로 감지
  - `navigator.maxTouchPoints > 0` 또는 `navigator.msMaxTouchPoints > 0`
  - 결과: penMode=true → Zoom에서 펜 도구 활성화
- **Feature Flag 강제 비활성화**: `pen_mode_disabled_user_list`에 userId 포함 시 false

### 3. 수업 타입 자동 감지

- **조건**: `langType` query parameter 존재 & 수업 시작 전
- **동작**: PRE_STUDY 모드로 자동 전환
  - `unix_current < unix_class_start_datetime`
- **URL**: `pre_zoom_join_url` 사용

### 4. 수업 완료 후 리뷰 이동

- **조건**: CLASS 모드 & 수업 종료 & 레슨 완료
- **동작**: 리뷰 페이지로 자동 이동
  - API `requestFinishPodoClass` 응답에서 판단
- **예습 모드**: 리뷰 없이 바로 이전 페이지로 이동

### 5. 비디오/MP3 중복 재생 방지

- **조건**: 비디오 재생 중 다른 비디오 선택
- **동작**: 기존 비디오 닫고 새 비디오 재생
- **상태 관리**: `playingIndex` 객체로 현재 재생 중인 항목 추적

### 6. 쿼리 캐시 완전 제거

- **조건**: 수업 종료 후 이전 페이지로 이동
- **동작**: `queryClient.removeQueries()` 사용
- **이유**:
  - `invalidateQueries`는 stale 마킹만 함
  - `useSuspenseQuery`가 stale 데이터를 즉시 반환할 수 있음
  - `removeQueries`로 캐시 완전 제거 → suspend → fresh fetch

### 7. Referrer 기반 뒤로 가기

- **조건**: `referrer` query parameter 존재
- **동작**: referrer 값에 따라 다른 페이지로 이동
  - `lesson-list` → `/lessons` (또는 originalLessonDetailUrl)
  - `reserved` → `/reservation`
  - `booking` → `/booking`
  - `ai-home` → `/home/ai`
  - 기타 → `/home`
- **안전성 체크**: originalLessonDetailUrl이 `/`로 시작하는지 검증 (XSS 방지)

### 8. Soft Navigation Stale 값 방지

- **조건**: `next/dynamic({ ssr: false })` 사용 시
- **문제**: props와 `useSearchParams()`가 soft navigation 시 stale 값 반환 가능
- **해결**: `window.location.search`에서 직접 읽기

---

## 개발 참고사항

**주요 API**:
- `GET /api/lesson/lecture-enter-info?classId={classId}` - 수업 입장 정보 조회
- `GET /api/lesson/lecture-room-info?classId={classId}` - 수업 자료 조회
- `POST /api/lesson/update-prestudy-time` - 예습 시간 업데이트 (1분마다)
- `POST /api/lesson/create-podo-class` - 수업 세션 생성 (재시도용)
- `POST /api/lesson/finish-podo-class` - 수업 종료

**상태 관리**:
- Local State:
  - `classRoomLoaded`: Zoom iframe 로드 완료 여부
  - `audioState`: MP3 플레이어 상태 (IN_VISIBLE | PLAYING)
  - `videoState`: 비디오 플레이어 상태 (IN_VISIBLE | PLAYING)
  - `showVideoList`: 비디오 팝오버 열림 여부
  - `showMp3List`: MP3 팝오버 열림 여부
  - `playingIndex`: 현재 재생 중인 비디오/MP3 인덱스
  - `hasLeftRef`: 수업 종료 여부 (중복 종료 방지)
  - `isLeavingRef`: 나가기 진행 중 (중복 클릭 방지)
- Refs:
  - `audioRef`: audio 태그 ref
  - `lastUpdatedAtRef`: 마지막 예습 시간 업데이트 시각
  - `consecutiveFailuresRef`: 연속 실패 카운트
- React Query:
  - `lectureRoomInfo`: 수업 자료 정보
  - `lectureEnterInfo`: 수업 입장 정보
- Custom Hooks:
  - `useLessonTimeChecker`: 수업 시간 체커 (타이머)

**Feature Flags**:
- `classroom_migration`: React 페이지 활성화 여부
  - `true`: 현재 페이지 표시
  - `false`: PHP 레거시 페이지로 리디렉션
- `pen_mode_disabled_user_list`: 펜 모드 비활성화 사용자 목록
  - JSON 배열 형태 (userId 문자열)

**주요 컴포넌트**:
- `ClassRoomView`: 메인 페이지 컴포넌트
- `CustomAudioPlayer`: MP3 재생 커스텀 플레이어
- `Popover`: 비디오/MP3 목록 표시
- `ConfirmDialog`: 나가기 확인 다이얼로그

**Zoom iframe 설정**:
- URL: `classRoomUrl?penMode={true|false}`
- allow 속성: `permission === 'true'` 시 `microphone *`
- 전체 화면 지원: title 속성 필요

**폴링 간격**:
- 예습 시간 업데이트: 60초 (1분)
- 최대 연속 실패: 3회

---

## 디자인 참고

- Figma: (추가 필요)
- 디자인 노트:
  - 헤더: 80px 고정
  - 비디오 플레이어: 40vh 높이
  - Zoom iframe: flex-1 (나머지 공간 차지)
  - 강의 버튼: 보라색, MP3 버튼: 파란색, 나가기: 검정

---

## 히스토리

| 날짜 | 작성자 | 변경 내용 |
|------|--------|----------|
| 2026-03-04 | Claude | 최초 작성 |
