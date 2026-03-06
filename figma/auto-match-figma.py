#!/usr/bin/env python3
"""
Figma 화면과 md 파일 자동 매칭 스크립트

63개 Figma 화면 이름과 37개 md 파일을 지능형으로 매칭합니다.
"""

import json
from pathlib import Path

# md 파일 목록
md_files = [
    {'name': 'Home', 'route': '/home', 'file': 'home.md', 'keywords': ['홈', 'home', '레슨권', '구매자', '비구매자']},
    {'name': 'Home (AI)', 'route': '/home/ai', 'file': 'home.md', 'keywords': ['홈', 'ai', 'ai학습']},
    {'name': '수업 탐색', 'route': '/subscribes', 'file': 'subscribes.md', 'keywords': ['수업', '탐색', '레슨 리스트']},
    {'name': '수강권 목록', 'route': '/subscribes/tickets', 'file': 'tickets.md', 'keywords': ['수강권', '레슨권', '구매']},
    {'name': '체험 수업', 'route': '/subscribes/trial', 'file': 'lessons-trial.md', 'keywords': ['체험', '체험레슨']},
    {'name': '결제 페이지', 'route': '/subscribes/payment/[id]', 'file': 'payment.md', 'keywords': ['결제', '구독결제', '한 번에 결제']},
    {'name': '결제 완료', 'route': '/subscribes/payment/[id]/success', 'file': 'payment-success.md', 'keywords': ['결제', '완료', '성공']},
    {'name': '예약', 'route': '/reservation', 'file': 'reservation.md', 'keywords': ['예약', 'M_예약', '예약 변경']},
    {'name': '정규 수업 목록', 'route': '/lessons/regular', 'file': 'lessons-regular.md', 'keywords': ['정규', '레슨', '수업']},
    {'name': '체험 수업 목록', 'route': '/lessons/trial', 'file': 'lessons-trial.md', 'keywords': ['체험', '레슨']},
    {'name': 'AI 수업 목록', 'route': '/lessons/ai', 'file': 'lessons-ai.md', 'keywords': ['ai', 'ai학습']},
    {'name': '수업 진행', 'route': '/lessons/classroom/[id]', 'file': 'classroom.md', 'keywords': ['수업', '레슨', '진행']},
    {'name': '드로잉', 'route': '/drawing/[id]', 'file': 'drawing.md', 'keywords': ['드로잉', '그리기']},
    {'name': '수업 리뷰', 'route': '/lessons/classroom/[id]/review', 'file': 'review.md', 'keywords': ['리뷰', '후기', '복습']},
    {'name': '리뷰 완료', 'route': '/lessons/classroom/[id]/review-complete', 'file': 'review-complete.md', 'keywords': ['리뷰', '완료']},
    {'name': '수업 리포트', 'route': '/lessons/classroom/[id]/report', 'file': 'class-report.md', 'keywords': ['리포트', '통계', '잔여 수업']},
    {'name': 'AI Learning', 'route': '/ai-learning', 'file': 'ai-learning.md', 'keywords': ['ai', 'ai학습']},
    {'name': '마이포도', 'route': '/my-podo', 'file': 'my-podo.md', 'keywords': ['마이포도', '마이 포도', '프로필']},
    {'name': '쿠폰', 'route': '/my-podo/coupon', 'file': 'coupon.md', 'keywords': ['쿠폰', '마이 쿠폰', '웰컴백']},
    {'name': '결제 수단', 'route': '/my-podo/payment-methods', 'file': 'payment-methods.md', 'keywords': ['결제수단', '결제 수단']},
    {'name': '결제 수단 등록', 'route': '/my-podo/payment-methods/register', 'file': 'payment-methods.md', 'keywords': ['결제수단', '추가']},
    {'name': '내 플랜', 'route': '/my-podo/plan', 'file': 'plan.md', 'keywords': ['플랜', '마이 포도 플랜', '수강증', '레슨권 변경', '위약금', '레슨권 연장']},
    {'name': '공지사항', 'route': '/my-podo/notices', 'file': 'notices.md', 'keywords': ['공지사항', '공지']},
    {'name': '알림 설정', 'route': '/my-podo/notification-settings', 'file': 'notification-settings.md', 'keywords': ['알림', '설정']},
    {'name': '튜터 제외', 'route': '/my-podo/tutor-exclusion', 'file': 'tutor-exclusion.md', 'keywords': ['튜터', '제외']},
    {'name': '수업 통계', 'route': '/class-report', 'file': 'class-report.md', 'keywords': ['통계', '리포트']},
    {'name': '레벨 테스트', 'route': '/selftest', 'file': 'selftest.md', 'keywords': ['레벨', '테스트']},
    {'name': '해지', 'route': '/podo/churn', 'file': 'churn.md', 'keywords': ['해지', '탈퇴', '구독 해지', '환불']},
    {'name': '해지 사유', 'route': '/podo/churn/quit-reason', 'file': 'quit-reason.md', 'keywords': ['해지', '사유']},
]

# Figma 화면 목록 읽기
figma_screens_path = Path(__file__).parent / 'figma-screens.txt'
with open(figma_screens_path, 'r', encoding='utf-8') as f:
    figma_screens = [line.strip() for line in f if line.strip()]

# 유사도 계산
def calculate_similarity(md_item, figma_screen):
    figma_lower = figma_screen.lower()
    score = 0

    # 키워드 매칭
    for keyword in md_item['keywords']:
        if keyword.lower() in figma_lower:
            score += 10

    # md 파일 이름 매칭
    if md_item['name'].lower() in figma_lower:
        score += 5

    return score

# 매칭 수행
matches = []
unmatched_md = []

for md_item in md_files:
    best_match = None
    best_score = 0

    for figma_screen in figma_screens:
        score = calculate_similarity(md_item, figma_screen)
        if score > best_score:
            best_score = score
            best_match = figma_screen

    if best_score > 0:
        matches.append({
            'mdName': md_item['name'],
            'mdFile': md_item['file'],
            'figmaScreen': best_match,
            'score': best_score,
        })
    else:
        unmatched_md.append(md_item['name'])

# 결과 출력
print('\n🎯 자동 매칭 결과\n')
print('=' * 80)

for match in sorted(matches, key=lambda x: -x['score']):
    print(f"✅ [{match['score']}점] {match['mdName']}")
    print(f"   → Figma: \"{match['figmaScreen']}\"")
    print(f"   → 파일: {match['mdFile']}\n")

print('\n❌ 매칭 실패 (Figma에 화면 없음)\n')
for name in unmatched_md:
    print(f"   - {name}")

# 통계
print('\n\n📊 통계\n')
print('=' * 80)
print(f"총 md 파일: {len(md_files)}개")
print(f"매칭 성공: {len(matches)}개")
print(f"매칭 실패: {len(unmatched_md)}개")

# 매칭 결과를 JSON으로 저장
match_results = [
    {
        'mdName': m['mdName'],
        'mdFile': m['mdFile'],
        'figmaScreen': m['figmaScreen'],
        'figmaUrl': 'https://www.figma.com/design/DUFbC6C797d9jW5HsjFh9S/-PODO--APP-DESIGN?node-id=TODO',
        'note': f"Figma 화면: \"{m['figmaScreen']}\" 찾아서 URL 업데이트 필요",
    }
    for m in matches
]

results_path = Path(__file__).parent / 'matched-results.json'
with open(results_path, 'w', encoding='utf-8') as f:
    json.dump(match_results, f, ensure_ascii=False, indent=2)

print(f'\n✅ 매칭 결과 저장: {results_path}')
print('\n💡 다음 단계:')
print('   1. Figma에서 매칭된 화면들 찾기')
print('   2. 각 화면 클릭 → URL 복사')
print('   3. matched-results.json 파일에서 node-id=TODO 부분 교체')
print('   4. 업데이트된 데이터로 md 파일에 링크 추가')
print('')
