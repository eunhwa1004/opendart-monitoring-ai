import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { OPEN_DART_COMPANIES } from './src/data/openDartCompanies';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini API client on server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Format OpenDART date YYYYMMDD to YYYY-MM-DD
function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

// OpenDART API Search Endpoint
app.post('/api/dart/search', async (req, res) => {
  try {
    const { corp_code, bgn_de, end_de, pblntf_ty, page_no, page_count, userApiKey } = req.body;

    // Use environment variable OPENDART_API_KEY or user-configured API key from UI settings
    const apiKey = userApiKey?.trim() || process.env.OPENDART_API_KEY || process.env.DART_API_KEY;

    if (!apiKey || apiKey === 'YOUR_OPENDART_API_KEY') {
      return res.status(400).json({
        status: 'NO_KEY',
        message: 'OpenDART API 인증키가 설정되지 않았습니다. UI 설정창이나 서버 환경변수(OPENDART_API_KEY)에 인증키를 입력해주세요.',
        list: [],
      });
    }

    // Build OpenDART URL
    const params = new URLSearchParams();
    params.append('crtfc_key', apiKey);
    if (corp_code) params.append('corp_code', corp_code);
    if (bgn_de) params.append('bgn_de', bgn_de.replace(/-/g, ''));
    if (end_de) params.append('end_de', end_de.replace(/-/g, ''));
    if (pblntf_ty && pblntf_ty !== '전체') params.append('pblntf_ty', pblntf_ty);
    params.append('page_no', String(page_no || 1));
    params.append('page_count', String(page_count || 100));

    const openDartUrl = `https://opendart.fss.or.kr/api/list.json?${params.toString()}`;
    console.log(`[OpenDART Query] Fetching: https://opendart.fss.or.kr/api/list.json?corp_code=${corp_code || 'ALL'}&bgn_de=${bgn_de}&end_de=${end_de}`);

    const dartRes = await fetch(openDartUrl);
    const dartData = await dartRes.json();

    if (dartData.status !== '000') {
      return res.json({
        status: dartData.status,
        message: dartData.message || 'OpenDART API 조회 중 오류가 발생했습니다.',
        total_count: 0,
        list: [],
      });
    }

    // Transform OpenDART response items
    const rawList = dartData.list || [];
    const transformedList = rawList.map((item: any) => {
      const title = item.report_nm || '';
      const pblntfType = item.pblntf_ty || '';

      // Determine Category Mapping
      let categoryType: '정기공시' | '주요사항' | '지분공시' = '주요사항';
      if (
        pblntfType === 'A' ||
        title.includes('사업보고서') ||
        title.includes('반기보고서') ||
        title.includes('분기보고서') ||
        title.includes('감사보고서')
      ) {
        categoryType = '정기공시';
      } else if (
        pblntfType === 'D' ||
        title.includes('지분') ||
        title.includes('대량보유') ||
        title.includes('소유상황')
      ) {
        categoryType = '지분공시';
      } else {
        categoryType = '주요사항';
      }

      // Determine Important Filing Badge (업무우선검토)
      const isImportant =
        pblntfType === 'B' ||
        title.includes('주요사항보고서') ||
        title.includes('차입금') ||
        title.includes('전환사채') ||
        title.includes('신주인수권') ||
        title.includes('유상증자') ||
        title.includes('감사보고서') ||
        title.includes('대표이사') ||
        title.includes('횡령') ||
        title.includes('배임') ||
        title.includes('영업정지') ||
        title.includes('타법인') ||
        title.includes('채무보증') ||
        title.includes('자기주식');

      return {
        id: item.rcept_no,
        companyId: item.corp_code,
        companyName: item.corp_name,
        stockCode: item.stock_code || '비상장',
        date: formatDate(item.rcept_dt),
        title: title,
        type: categoryType,
        isImportant: isImportant,
        importantReason: isImportant ? '주요경영사항 / 원문확인 필요' : undefined,
        dartReceiptNo: item.rcept_no,
        submitter: item.flr_nm || item.corp_name,
        remarks: item.rm,
        summary: `공시제출인: ${item.flr_nm || item.corp_name} | 접수번호: ${item.rcept_no} | 시장구분: ${
          item.corp_cls === 'Y' ? '유가증권(KOSPI)' : item.corp_cls === 'K' ? '코스닥' : '비상장/기타'
        }${item.rm ? ` | 비고: ${item.rm}` : ''}`,
        dartUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`,
      };
    });

    res.json({
      status: '000',
      message: '정상',
      total_count: dartData.total_count || transformedList.length,
      page_no: dartData.page_no || 1,
      page_count: dartData.page_count || 100,
      list: transformedList,
    });
  } catch (error: any) {
    console.error('OpenDART Proxy Error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: error?.message || 'OpenDART API 서버 통신 실패',
      list: [],
    });
  }
});

// Search Companies Endpoint (by name or stock code or corp code)
app.get('/api/dart/companies', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json(OPEN_DART_COMPANIES.slice(0, 20));
  }

  const matched = OPEN_DART_COMPANIES.filter(
    (c) =>
      c.corp_name.toLowerCase().includes(q) ||
      c.stock_code.toLowerCase().includes(q) ||
      c.corp_code.includes(q)
  );

  res.json(matched);
});

// AI Disclosure Detailed Analysis Endpoint
app.post('/api/analyze-disclosure', async (req, res) => {
  try {
    const { companyName, stockCode, title, disclosureType, content, question } = req.body;

    const prompt = `
당신은 저축은행 여신심사 및 기업 분석 전문가 AI입니다.
금융감독원 OpenDART 실제 공시 데이터를 바탕으로 저축은행 심사역/담당자가 업무상 파악해야 할 핵심 사항을 객관적이고 명확하게 요약 및 분석해주세요.

[기업 정보]
- 기업명: ${companyName} (${stockCode || '종목코드 미기재'})
- 공시 제목: ${title}
- 공시 유형: ${disclosureType}

[공시 원문 / 상세 정보]
${content || '주요 공시 내용 참조'}

${question ? `[사용자/심사역 추가 질의]: ${question}` : ''}

[작성 지침]
1. 공시 내용의 핵심 개요를 3~4문장으로 명확히 요약하세요.
2. 주요 확인 포인트 (재무/자금조달 영향, 지분/경영권 변동, 주요 계약/영업활동, 대출 채무상환 관련 유의사항 등)를 객관적 항목별로 정리하세요.
3. 임의의 위험 등급(High/Medium/Low, A/B/C, 점수 등)을 절대 부여하지 마세요. 객관적 사실 및 확인 서류 안내에 집중하세요.
4. 신뢰감 있고 간결한 금융기관 보고서체(-함, -임, -음)로 작성하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error?.message || 'AI 분석 중 오류가 발생했습니다.' });
  }
});

// AI Loan Monitoring Executive Memo Endpoint
app.post('/api/generate-summary-memo', async (req, res) => {
  try {
    const { companyName, stockCode, selectedDisclosures } = req.body;

    const prompt = `
당신은 저축은행 기업금융 여신관리역입니다.
다음 OpenDART 실제 기업 공시 내역을 바탕으로 저축은행 내부보고용 "기업 공시 모니터링 및 여신 점검 메모"를 작성해주세요.

[기업]: ${companyName} (${stockCode || '종목코드'})
[검토 공시 목록]
${JSON.stringify(selectedDisclosures, null, 2)}

[작성 항목]
1. 모니터링 개요 (대상 기업 및 점검 기간)
2. 최근 주요 공시 현황 요약
3. 저축은행 여신 관리점검 주요 사항 (운전자금 demand, 채무보증, 담보/주주 변동 여부, 결산 결과 등)
4. 향후 여신관리 제언 및 필요 징구 서류 (감사보고서, 이사회 의결서 등)

* 절대 기업에 대해 임의로 위험 등급이나 점수를 산정하거나 평가하지 마세요. 객관적 공시 사실만을 정리하세요.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Gemini Summary Memo API Error:', error);
    res.status(500).json({ error: error?.message || '보고서 작성 중 오류가 발생했습니다.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
