# 🎨 Figma 링크 자동 추가 가이드

## 목적

UI 플로우 문서(md 파일)에 Figma 디자인 링크를 **반자동으로** 추가하는 도구입니다.

## 작업 시간

- **사람 작업**: 5-10분 (Figma에서 URL 복사)
- **스크립트 실행**: 1초 (모든 md 파일에 자동 삽입)

---

## 사용 방법

### Step 1: CSV 파일 열기

[figma-mapping-template.csv](./figma-mapping-template.csv)를 **Excel이나 Google Sheets**로 열기

```
화면명,라우트,md파일,Figma URL,상태
Home,/home,home.md,,TODO
수업 탐색,/subscribes,subscribes.md,,TODO
...
```

### Step 2: Figma URL 채우기

Figma 파일: https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S/-PODO--APP-DESIGN

**방법 1: 개별 프레임 URL 복사**
1. Figma에서 원하는 화면(프레임) 선택
2. 우클릭 → "Copy link to selection" (또는 Ctrl+Shift+C)
3. CSV의 "Figma URL" 컬럼에 붙여넣기

**예시:**
```
화면명,라우트,md파일,Figma URL,상태
Home,/home,home.md,https://figma.com/design/DUFbC6C797d9jW5HsjFh9S?node-id=123-456,DONE
결제 페이지,/subscribes/payment/[id],payment.md,https://figma.com/design/DUFbC6C797d9jW5HsjFh9S?node-id=789-012,DONE
```

**방법 2: 같은 페이지면 같은 URL 재사용**
- 여러 화면이 하나의 Figma 페이지에 있다면 같은 URL 사용 가능
- node-id만 다르게 해서 각 프레임 구분

**팁: 디자인 없는 화면은 비워두기**
- Figma URL이 없으면 자동으로 건너뜀
- 나중에 디자인 추가되면 그때 URL 입력하고 스크립트 재실행

### Step 3: CSV 저장

- Excel/Google Sheets에서 저장
- **중요**: CSV 형식으로 저장해야 함 (UTF-8 인코딩 추천)

### Step 4: 스크립트 실행

터미널에서:

```bash
cd /Users/junse/Desktop/podo/ui-flows
node add-figma-links.js
```

출력 예시:
```
🚀 Figma 링크 자동 삽입 시작!

총 37개 화면 처리 중...

✅ 추가 완료: Home → home.md
✅ 추가 완료: 결제 페이지 → payment.md
⏭️  건너뜀: 튜터 제외 (Figma URL 없음)
⚠️  파일 없음: some-missing.md
⏭️  이미 추가됨: 수업 탐색

📊 결과:
   ✅ 성공: 15개
   ⏭️  건너뜀: 22개 (URL 없음)

✨ 완료!
```

---

## 결과 확인

### Before (원본 md 파일)
```markdown
# Home 화면 UI Flow

**라우트**: `/home`
**부모 화면**: Login
**타입**: 메인 화면 (Bottom Tab)

## 개요
포도 앱의 메인 홈 화면입니다...
```

### After (Figma 링크 추가 후)
```markdown
# Home 화면 UI Flow

**라우트**: `/home`
**부모 화면**: Login
**타입**: 메인 화면 (Bottom Tab)
**Figma**: [🎨 Home 디자인](https://figma.com/design/DUFbC6C797d9jW5HsjFh9S?node-id=123-456)

## 개요
포도 앱의 메인 홈 화면입니다...
```

---

## 추가 기능 (선택사항)

### 상태별 Figma 링크 추가

각 상태(로딩/성공/에러/Empty)별로 다른 Figma 프레임 링크를 추가하고 싶다면:

**수동으로 md 파일 편집:**
```markdown
## 상태별 Figma 디자인

### 1. ⏳ 로딩 상태
**Figma**: [Loading State](https://figma.com/design/...?node-id=XXX-YYY)

### 2. ✅ 성공 상태
**Figma**: [Success State](https://figma.com/design/...?node-id=AAA-BBB)

### 3. ❌ 에러 상태
**Figma**: [Error State](https://figma.com/design/...?node-id=CCC-DDD)

### 4. 📭 Empty State
**Figma**: [Empty State](https://figma.com/design/...?node-id=EEE-FFF)
```

---

## 트러블슈팅

### Q1: "파일 없음" 경고가 뜨는데?
→ md 파일이 실제로 없는 화면입니다. CSV에서 해당 행 삭제하거나 md 파일 생성 후 재실행

### Q2: "이미 추가됨" 나오는데 링크가 다른 걸로 바꾸고 싶어요
→ md 파일에서 `**Figma**:` 줄을 수동으로 삭제하고 스크립트 재실행

### Q3: CSV 저장 시 한글 깨지는데?
→ Google Sheets 사용하거나, Excel에서 "CSV UTF-8" 형식으로 저장

### Q4: 스크립트가 안 돌아가요
→ Node.js 설치되어 있는지 확인: `node --version` (없으면 https://nodejs.org 에서 설치)

---

## 다음 단계

1. **FigJam 유저플로우 생성** (선택)
   - CSV 데이터를 활용해서 FigJam에 전체 플로우 다이어그램 생성
   - 각 노드에 실제 화면 스크린샷 추가

2. **디자이너 리뷰**
   - Figma 링크가 추가된 md 파일을 디자이너와 공유
   - "이 플로우에서 이 화면이 필요해요" 라고 요청

3. **UIUX 개선 계획**
   - Figma 링크 있는 화면: 디자인 개선안 요청
   - Figma 링크 없는 화면: 우선순위에 따라 디자인 요청

---

## 파일 구조

```
ui-flows/
├── FIGMA-LINK-GUIDE.md           # 이 파일
├── figma-mapping-template.csv    # Figma URL 입력용 템플릿
├── add-figma-links.js            # 자동 삽입 스크립트
└── page-function/
    ├── home.md                   # ✅ Figma 링크 추가됨
    ├── payment.md                # ✅ Figma 링크 추가됨
    └── ...
```

---

## 🎉 완료!

이제 md 파일들이 Figma 디자인과 연결되어 있습니다!
- 개발자: 코드 보다가 디자인 확인 쉬워짐
- 디자이너: 어느 화면을 고쳐야 하는지 명확해짐
- PO: 기획 검토할 때 시각적 레퍼런스 있음

**질문이나 문제가 있으면 언제든 물어보세요!** 😊
