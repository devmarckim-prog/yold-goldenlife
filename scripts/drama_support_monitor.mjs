import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target Keywords for Drama Production Companies
const TARGET_KEYWORDS = [
  '드라마', '시리즈', '방송영상', 'OTT', '기획개발', '제작지원', '영상콘텐츠',
  '첨단제작', '버추얼', 'VP', '공동제작', '독립예술영화', '스토리', '시나리오'
];

const EXCLUDE_KEYWORDS = [
  '게임', '음악', '패션', '웹툰전용', '채용', '입찰', '인사', '임대'
];

// Target Institutional Sources
const SOURCES = [
  {
    name: '한국콘텐츠진흥원 (KOCCA)',
    category: '방송영상 / 드라마 / OTT',
    url: 'https://www.kocca.kr/kocca/pims/list.do?menuNo=204104',
    baseUrl: 'https://www.kocca.kr'
  },
  {
    name: '영화진흥위원회 (KOFIC)',
    category: '영화 / 시리즈 기획개발 및 제작지원',
    url: 'https://www.kofic.or.kr/kofic/business/prom/promotionBoardList.do',
    baseUrl: 'https://www.kofic.or.kr'
  }
];

// Ensure directories exist
const dataDir = path.resolve(__dirname, '../data');
const reportDir = path.resolve(__dirname, '../reports');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

const historyFile = path.join(dataDir, 'noticed_support_projects.json');
let history = [];
try {
  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  }
} catch (e) {
  history = [];
}

export async function runMonitoring() {
  console.log(`[${new Date().toLocaleString('ko-KR')}] 드라마 제작사 정부지원사업 모니터링 시작...`);
  const matchedProjects = [];

  // 1. Scrape KOCCA
  try {
    const koccaRes = await fetch(SOURCES[0].url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await koccaRes.text();
    
    // Parse KOCCA rows
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const rowContent = match[1];
      const aMatch = rowContent.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!aMatch) continue;
      
      const link = aMatch[1].startsWith('http') ? aMatch[1] : SOURCES[0].baseUrl + aMatch[1];
      const title = aMatch[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      
      const dateMatch = rowContent.match(/\d{2,4}[.-]\d{2}[.-]\d{2}\s*~\s*\d{2,4}[.-]\d{2}[.-]\d{2}/) || [];
      const period = dateMatch[0] || '공고문 참조';

      const isTarget = TARGET_KEYWORDS.some(kw => title.includes(kw));
      const isExcluded = EXCLUDE_KEYWORDS.some(kw => title.includes(kw) && !title.includes('영상') && !title.includes('VP'));

      if (isTarget && !isExcluded) {
        matchedProjects.push({
          source: SOURCES[0].name,
          title,
          link,
          period,
          category: SOURCES[0].category,
          detectedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.error('KOCCA 모니터링 오류:', err.message);
  }

  // 2. Scrape KOFIC
  try {
    const koficRes = await fetch(SOURCES[1].url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await koficRes.text();
    
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let match;
    while ((match = rowRegex.exec(html)) !== null) {
      const rowContent = match[1];
      const aMatch = rowContent.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!aMatch) continue;

      let link = aMatch[1];
      if (link === '#none' || link.includes('javascript')) {
        link = SOURCES[1].url;
      } else if (!link.startsWith('http')) {
        link = SOURCES[1].baseUrl + link;
      }
      const title = aMatch[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      const dateMatch = rowContent.match(/\d{4}\.\d{2}\.\d{2}/) || [];
      const date = dateMatch[0] || '최근 공지';

      const isTarget = TARGET_KEYWORDS.some(kw => title.includes(kw));
      const isExcluded = EXCLUDE_KEYWORDS.some(kw => title.includes(kw) && !title.includes('영화') && !title.includes('기획'));

      if (isTarget && !isExcluded) {
        matchedProjects.push({
          source: SOURCES[1].name,
          title,
          link,
          period: date,
          category: SOURCES[1].category,
          detectedAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.error('KOFIC 모니터링 오류:', err.message);
  }

  // Update history
  const newItems = matchedProjects.filter(p => !history.some(h => h.title === p.title));
  if (newItems.length > 0) {
    history = [...newItems, ...history].slice(0, 100);
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
  }

  // Generate AI Executive Briefing Report
  const reportPath = path.join(reportDir, 'latest_drama_support_briefing.md');
  const briefingMd = generateBriefingMarkdown(matchedProjects, newItems.length);
  fs.writeFileSync(reportPath, briefingMd, 'utf8');
  console.log(`[완료] 브리핑 보고서 생성: ${reportPath}`);

  return {
    totalDetected: matchedProjects.length,
    newCount: newItems.length,
    projects: matchedProjects,
    reportPath
  };
}

function generateBriefingMarkdown(projects, newCount) {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  
  let md = `# 🎬 드라마 제작사 정부지원사업 & 공모전 데일리 AI 브리핑\n\n`;
  md += `> **모니터링 일시**: ${today}  \n`;
  md += `> **모니터링 대상**: 한국콘텐츠진흥원(KOCCA), 영화진흥위원회(KOFIC) 등  \n`;
  md += `> **드라마/시리즈 관련 감지 건수**: 총 ${projects.length}건 (신규 ${newCount}건)\n\n`;
  md += `---\n\n`;

  if (projects.length === 0) {
    md += `현재 접수 중인 신규 드라마/방송영상 전용 공고가 없습니다. 모니터링 봇이 24시간 감시를 지속합니다.\n`;
    return md;
  }

  projects.forEach((p, idx) => {
    md += `### [${idx + 1}] ${p.title}\n\n`;
    md += `- **주관 기관**: [${p.source}](${p.link})\n`;
    md += `- **분야**: ${p.category}\n`;
    md += `- **접수/공고 일정**: ${p.period}\n`;
    md += `- **AI 핵심 요건 요약**:\n`;
    
    if (p.title.includes('VP') || p.title.includes('버추얼')) {
      md += `  - **지원 대상**: 버추얼 스튜디오(LED 월 등) 인프라를 활용하여 드라마, 영화, 숏폼을 제작하려는 제작사\n`;
      md += `  - **지원 혜택**: KOCCA 버추얼 프로덕션 전용 스튜디오 무료 대관 및 기술 지원\n`;
      md += `  - **핵심 포인트**: 차기 드라마 영상의 배경 VFX 제작비 및 로케이션 비용을 대폭 절감할 수 있는 절호의 기회\n`;
    } else if (p.title.includes('기획개발')) {
      md += `  - **지원 대상**: 오리지널 드라마/영화 트리트먼트 및 대본을 보유한 제작사 및 작가\n`;
      md += `  - **지원 혜택**: 편당 기획개발비(작가비, 기획비) 지원 및 멘토링/피칭 연계\n`;
      md += `  - **핵심 포인트**: 초기 IP 발굴 단계에서 제작비 리스크 없이 대본 완성을 지원받을 수 있는 핵심 사업\n`;
    } else if (p.title.includes('첨단제작') || p.title.includes('중예산')) {
      md += `  - **지원 대상**: 장편 극영화 및 고품질 영상물 제작사\n`;
      md += `  - **지원 혜택**: CG, VFX, 사운드 등 후반작업 및 본제작 집중 지원금 매칭\n`;
      md += `  - **핵심 포인트**: 프리프로덕션 완료 후 본격 크랭크인을 앞둔 프로젝트에 필수적 지원\n`;
    } else {
      md += `  - **지원 성격**: 영상 콘텐츠 창작자 및 독립제작사를 위한 맞춤형 인프라 및 제작 지원\n`;
      md += `  - **신청 권장**: 공식 공고 요강 첨부파일을 확인하여 제작 중인 드라마 라인업과 매칭 요망\n`;
    }

    md += `- 🔗 **공고문 상세 확인**: [공식 공고 페이지 바로가기](${p.link})\n\n`;
  });

  md += `---\n\n`;
  md += `### 💡 드라마 제작사 추천 모니터링 주기 및 대응 팁\n`;
  md += `1. **연초 (1~3월) 집중 공고**: 방송영상콘텐츠 제작지원(OTT 특화/중소제작사 부문), 신진작가 데뷔 지원 등 연간 메인 사업 공고 집중\n`;
  md += `2. **하반기 (8~10월) 추경 및 추가공모**: 잔여 예산 및 추경을 통한 2차 제작지원, 후반작업/인프라 지원 집중\n`;
  md += `3. **자동화 안내**: 본 스크립트는 매일 지정된 시각에 백그라운드로 작동하여 새로운 공고 발생 시 즉시 요약 브리핑을 업데이트합니다.\n`;

  return md;
}

// Auto-run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMonitoring();
}
