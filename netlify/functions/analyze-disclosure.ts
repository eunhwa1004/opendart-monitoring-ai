import type { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { companyName, stockCode, title, disclosureType, content, question } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }),
      };
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result: response.text }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || 'AI 분석 중 오류가 발생했습니다.' }),
    };
  }
};
