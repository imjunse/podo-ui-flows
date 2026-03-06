#!/usr/bin/env node

/**
 * Figma 링크 자동 삽입 스크립트
 *
 * 사용법:
 * 1. figma-mapping-template.csv를 열어서 "Figma URL" 컬럼에 링크 입력
 * 2. node add-figma-links.js 실행
 * 3. 모든 md 파일에 자동으로 Figma 링크가 추가됨!
 */

const fs = require('fs');
const path = require('path');

// CSV 파싱 함수 (간단한 버전)
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

// md 파일에 Figma 링크 추가 함수
function addFigmaLinkToMd(mdFilePath, figmaUrl, screenName) {
  if (!figmaUrl || figmaUrl === '' || figmaUrl === 'TODO') {
    console.log(`⏭️  건너뜀: ${screenName} (Figma URL 없음)`);
    return;
  }

  const fullPath = path.join(__dirname, 'page-function', mdFilePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  파일 없음: ${mdFilePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');

  // 이미 Figma 링크가 있는지 체크
  if (content.includes('**Figma**:') || content.includes('**Figma 디자인**:')) {
    console.log(`⏭️  이미 추가됨: ${screenName}`);
    return;
  }

  // **타입**: 다음 줄에 Figma 링크 추가
  const typeLineRegex = /(\*\*타입\*\*:.*\n)/;

  if (typeLineRegex.test(content)) {
    content = content.replace(
      typeLineRegex,
      `$1**Figma**: [🎨 ${screenName} 디자인](${figmaUrl})\n`
    );

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✅ 추가 완료: ${screenName} → ${mdFilePath}`);
  } else {
    console.log(`⚠️  타입 필드 못찾음: ${mdFilePath}`);
  }
}

// 메인 실행
function main() {
  const csvPath = path.join(__dirname, 'figma-mapping-template.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('❌ figma-mapping-template.csv 파일이 없습니다!');
    process.exit(1);
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const mappings = parseCSV(csvText);

  console.log('\n🚀 Figma 링크 자동 삽입 시작!\n');
  console.log(`총 ${mappings.length}개 화면 처리 중...\n`);

  let successCount = 0;
  let skipCount = 0;

  mappings.forEach(mapping => {
    const { 화면명, 'Figma URL': figmaUrl, md파일 } = mapping;

    if (figmaUrl && figmaUrl !== '' && figmaUrl !== 'TODO') {
      addFigmaLinkToMd(md파일, figmaUrl, 화면명);
      successCount++;
    } else {
      skipCount++;
    }
  });

  console.log('\n📊 결과:');
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ⏭️  건너뜀: ${skipCount}개 (URL 없음)`);
  console.log('\n✨ 완료!');
}

main();
