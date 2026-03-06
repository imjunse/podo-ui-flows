# Home Flow 화면 매핑 가이드

이 문서는 home-flow.mmd의 각 단계에 필요한 Figma 화면을 매핑한 가이드입니다.

## 📋 필요한 화면 목록

### 🏠 Basic Home Flow

#### 1. 초기 화면
- **화면명**: 로그인 완료 후 화면
- **Figma 검색어**: "login success", "home redirect"
- **설명**: 로그인 완료 직후 보이는 화면 또는 리디렉션 화면

#### 2. Basic Home 메인 화면
- **화면명**: Basic Home (`/home`)
- **Figma 검색어**: "home", "basic home", "main home"
- **설명**: 일반 홈 화면 (AI 전용이 아닌 기본 홈)

#### 3. 로딩 상태 화면
- **HomeBannerSkeleton**
  - Figma 검색어: "banner skeleton", "banner loading"
  - 설명: 배너 로딩 중 스켈레톤 화면

- **GreetingContent.Skeleton**
  - Figma 검색어: "greeting skeleton", "greeting loading"
  - 설명: 인사말 섹션 로딩 중 스켈레톤

- **ClassPrepareSkeleton**
  - Figma 검색어: "class prepare skeleton", "class loading"
  - 설명: 수업 준비 위젯 로딩 중 스켈레톤

#### 4. 콘텐츠 컴포넌트
- **HomeBannerCarousel**
  - Figma 검색어: "home banner", "banner carousel"
  - 설명: 홈 화면 배너 캐러셀

- **GreetingContent**
  - Figma 검색어: "greeting", "home greeting", "welcome"
  - 설명: 사용자 인사말 섹션

- **TrialTutorial**
  - Figma 검색어: "trial tutorial", "trial onboarding"
  - 설명: 체험 유저용 튜토리얼

- **ClassPrepareWidget**
  - Figma 검색어: "class prepare", "lesson prepare", "upcoming class"
  - 설명: 수업 준비 위젯

#### 5. 팝업/모달
- **HomePopupBottomSheet**
  - Figma 검색어: "home popup", "announcement", "notice popup"
  - 설명: 공지사항 팝업

- **WelcomeBackPopup**
  - Figma 검색어: "welcome back", "returning user"
  - 설명: 재방문 유저 환영 팝업

- **TutorProfileBottomSheet**
  - Figma 검색어: "tutor profile", "teacher profile modal"
  - 설명: 튜터 프로필 바텀시트

#### 6. 에러 화면
- **HomeViewErrorFallback**
  - Figma 검색어: "error", "home error", "fallback"
  - 설명: Basic Home 에러 화면 (Try again 버튼 포함)

---

### 🤖 AI Home Flow

#### 1. AI Home 메인 화면
- **화면명**: AI Home (`/home/ai`)
- **Figma 검색어**: "ai home", "character chat home"
- **설명**: AI 전용 수강권을 가진 유저의 홈 화면

#### 2. AI Home 로딩 상태
- **최소 높이 화면**
  - Figma 검색어: "ai loading", "minimal screen"
  - 설명: AI Home 온보딩 로딩 중 최소 높이 화면

#### 3. AI Home 콘텐츠
- **CharacterChatOnboardingSection**
  - Figma 검색어: "character chat onboarding", "ai onboarding"
  - 설명: 캐릭터 챗 온보딩 섹션

- **RecommendCharacterChatSection**
  - Figma 검색어: "recommend chat", "character recommendation", "ai character list"
  - 설명**: 추천 캐릭터 챗 섹션

#### 4. AI Home 팝업
- **HomePopupBottomSheet**
  - Figma 검색어: "ai home popup", "notice popup"
  - 설명: AI Home 공지사항 팝업 (Basic Home과 동일할 수 있음)

#### 5. AI Home 에러
- **AI Home Error**
  - Figma 검색어: "ai error", "ai home error"
  - 설명: AI Home 에러 화면

---

## 🎯 작업 순서

### Step 1: Figma에서 화면 찾기
1. Figma 파일 열기: https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S
2. 각 섹션의 "Figma 검색어"를 사용해 화면 검색 (Cmd+F / Ctrl+F)
3. 찾은 화면의 프레임명 기록

### Step 2: 화면 스크린샷 준비
각 화면에 대해:
1. Figma에서 프레임 선택
2. 우클릭 → "Copy as PNG" 또는 Export
3. 파일명을 컴포넌트명으로 저장 (예: `HomeBannerCarousel.png`)

### Step 3: FigJam에 배치
1. 새 FigJam 파일 생성
2. home-flow.mmd의 구조에 따라 노드 배치
3. 각 노드에 해당 화면 스크린샷 삽입
4. 화살표로 플로우 연결

---

## 📝 다음 단계 체크리스트

- [ ] Figma에서 Basic Home 관련 화면 찾기
- [ ] Figma에서 AI Home 관련 화면 찾기
- [ ] 로딩/스켈레톤 상태 화면 찾기
- [ ] 팝업/모달 화면 찾기
- [ ] 에러 화면 찾기
- [ ] 모든 화면 스크린샷 저장
- [ ] FigJam 파일 생성
- [ ] 플로우 다이어그램 그리기
- [ ] 화면 스크린샷 배치
- [ ] 최종 검토

---

## 💡 팁

1. **화면을 찾을 수 없는 경우**:
   - 비슷한 이름의 컴포넌트 찾기
   - 페이지별로 탐색 (Home, Components, Screens 등)
   - 레이어 패널에서 검색

2. **스크린샷 품질**:
   - Figma에서 2x 또는 3x 해상도로 export
   - PNG 형식 사용 (투명 배경 유지)

3. **FigJam 구성**:
   - 색상 코딩 사용 (Basic Home: 파랑, AI Home: 보라)
   - 스티커나 섹션으로 그룹핑
   - 주요 의사결정 포인트 강조

---

## 🔗 참고 링크

- Figma 파일: https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S
- home-flow.mmd: `./home-flow.mmd`
