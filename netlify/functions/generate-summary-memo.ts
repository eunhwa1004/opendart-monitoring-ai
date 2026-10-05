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
    const { companyName, stockCode, selectedDisclosures } = body;

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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ result: response.text }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || '보고서 작성 중 오류가 발생했습니다.' }),
    };
  }
};
