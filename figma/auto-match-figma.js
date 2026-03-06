#!/usr/bin/env node

/**
 * Figma 화면과 md 파일 자동 매칭 스크립트
 *
 * 63개 Figma 화면 이름과 37개 md 파일을 지능형으로 매칭합니다.
 */

const fs = require('fs');
const path = require('path');

// md 파일 목록 (CSV에서)
const mdFiles = [
  { name: 'Home', route: '/home', file: 'home.md', keywords: ['홈', 'home', '레슨권'] },
  { name: 'Home (AI)', route: '/home/ai', file: 'home.md', keywords: ['홈', 'ai', 'ai학습'] },
  { name: '수업 탐색', route: '/subscribes', file: 'subscribes.md', keywords: ['수업', '탐색', '레슨'] },
  { name: '수강권 목록', route: '/subscribes/tickets', file: 'tickets.md', keywords: ['수강권', '레슨권', '구매'] },
  { name: '체험 수업', route: '/subscribes/trial', file: 'lessons-trial.md', keywords: ['체험', '체험레슨'] },
  { name: '결제 페이지', route: '/subscribes/payment/[id]', file: 'payment.md', keywords: ['결제', '구독결제', '한 번에 결제'] },
  { name: '결제 완료', route: '/subscribes/payment/[id]/success', file: 'payment-success.md', keywords: ['결제', '완료', '성공'] },
  { name: '예약', route: '/reservation', file: 'reservation.md', keywords: ['예약', 'M_예약'] },
  { name: '정규 수업 목록', route: '/lessons/regular', file: 'lessons-regular.md', keywords: ['정규', '레슨', '수업'] },
  { name: '체험 수업 목록', route: '/lessons/trial', file: 'lessons-trial.md', keywords: ['체험', '레슨'] },
  { name: 'AI 수업 목록', route: '/lessons/ai', file: 'lessons-ai.md', keywords: ['ai', 'ai학습'] },
  { name: '수업 진행', route: '/lessons/classroom/[id]', file: 'classroom.md', keywords: ['수업', '레슨', '진행'] },
  { name: '드로잉', route: '/drawing/[id]', file: 'drawing.md', keywords: ['드로잉', '그리기'] },
  { name: '수업 리뷰', route: '/lessons/classroom/[id]/review', file: 'review.md', keywords: ['리뷰', '후기'] },
  { name: '리뷰 완료', route: '/lessons/classroom/[id]/review-complete', file: 'review-complete.md', keywords: ['리뷰', '완료'] },
  { name: '수업 리포트', route: '/lessons/classroom/[id]/report', file: 'class-report.md', keywords: ['리포트', '통계'] },
  { name: 'AI Learning', route: '/ai-learning', file: 'ai-learning.md', keywords: ['ai', 'ai학습'] },
  { name: '마이포도', route: '/my-podo', file: 'my-podo.md', keywords: ['마이포도', '마이 포도'] },
  { name: '쿠폰', route: '/my-podo/coupon', file: 'coupon.md', keywords: ['쿠폰', '마이 쿠폰'] },
  { name: '결제 수단', route: '/my-podo/payment-methods', file: 'payment-methods.md', keywords: ['결제수단', '결제 수단'] },
  { name: '결제 수단 등록', route: '/my-podo/payment-methods/register', file: 'payment-methods.md', keywords: ['결제수단', '추가'] },
  { name: '내 플랜', route: '/my-podo/plan', file: 'plan.md', keywords: ['플랜', '마이 포도 플랜'] },
  { name: '공지사항', route: '/my-podo/notices', file: 'notices.md', keywords: ['공지사항', '공지'] },
  { name: '알림 설정', route: '/my-podo/notification-settings', file: 'notification-settings.md', keywords: ['알림', '설정'] },
  { name: '튜터 제외', route: '/my-podo/tutor-exclusion', file: 'tutor-exclusion.md', keywords: ['튜터', '제외'] },
  { name: '수업 통계', route: '/class-report', file: 'class-report.md', keywords: ['통계', '리포트'] },
  { name: '레벨 테스트', route: '/selftest', file: 'selftest.md', keywords: ['레벨', '테스트'] },
  { name: '해지', route: '/podo/churn', file: 'churn.md', keywords: ['해지', '탈퇴', '구독 해지'] },
  { name: '해지 사유', route: '/podo/churn/quit-reason', file: 'quit-reason.md', keywords: ['해지', '사유'] },
];

// Figma 화면 목록
const figmaScreensText = fs.readFileSync(
  path.join(__dirname, 'figma-screens.txt'),
  'utf-8'
);
const figmaScreens = figmaScreensText
  .split('\n')
  .map(s => s.trim())
  .filter(s => s.length > 0);

// 유사도 계산 (간단한 키워드 매칭)
function calculateSimilarity(mdItem, figmaScreen) {
  const figmaLower = figmaScreen.toLowerCase();
  let score = 0;

  // 키워드 매칭
  mdItem.keywords.forEach(keyword => {
    if (figmaLower.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });

  // md 파일 이름 매칭
  const mdNameLower = mdItem.name.toLowerCase();
  if (figmaLower.includes(mdNameLower)) {
    score += 5;
  }

  return score;
}

// 매칭 수행
const matches = [];
const unmatchedMd = [];

mdFiles.forEach(mdItem => {
  let bestMatch = null;
  let bestScore = 0;

  figmaScreens.forEach(figmaScreen => {
    const score = calculateSimilarity(mdItem, figmaScreen);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = figmaScreen;
    }
  });

  if (bestScore > 0) {
    matches.push({
      mdName: mdItem.name,
      mdFile: mdItem.file,
      figmaScreen: bestMatch,
      score: bestScore,
    });
  } else {
    unmatchedMd.push(mdItem.name);
  }
});

// 결과 출력
console.log('\n🎯 자동 매칭 결과\n');
console.log('='.repeat(80));

matches
  .sort((a, b) => b.score - a.score)
  .forEach(match => {
    console.log(`✅ [${match.score}점] ${match.mdName}`);
    console.log(`   → Figma: "${match.figmaScreen}"`);
    console.log(`   → 파일: ${match.mdFile}\n`);
  });

console.log('\n❌ 매칭 실패 (Figma에 화면 없음)\n');
unmatchedMd.forEach(name => {
  console.log(`   - ${name}`);
});

// CSV 업데이트용 데이터 생성
console.log('\n\n📊 통계\n');
console.log('='.repeat(80));
console.log(`총 md 파일: ${mdFiles.length}개`);
console.log(`매칭 성공: ${matches.length}개`);
console.log(`매칭 실패: ${unmatchedMd.length}개`);

// 매칭 결과를 JSON으로 저장
const matchResults = matches.map(m => ({
  mdName: m.mdName,
  mdFile: m.mdFile,
  figmaScreen: m.figmaScreen,
  // 사용자가 나중에 각 화면 클릭해서 node-id 추가하도록 placeholder
  figmaUrl: 'https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S/-PODO--APP-DESIGN?node-id=TODO',
  note: `Figma 화면: "${m.figmaScreen}" 찾아서 URL 업데이트 필요`,
}));

fs.writeFileSync(
  path.join(__dirname, 'matched-results.json'),
  JSON.stringify(matchResults, null, 2),
  'utf-8'
);

console.log('\n✅ 매칭 결과 저장: matched-results.json');
console.log('\n💡 다음 단계:');
console.log('   1. Figma에서 매칭된 화면들 찾기');
console.log('   2. 각 화면 클릭 → URL 복사');
console.log('   3. matched-results.json 파일에서 node-id=TODO 부분 교체');
console.log('   4. 업데이트된 데이터로 md 파일에 링크 추가');
console.log('');
