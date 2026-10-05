import type { Handler } from '@netlify/functions';

// Helper: Format OpenDART date YYYYMMDD to YYYY-MM-DD
function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

export const handler: Handler = async (event) => {
  // CORS Headers
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
    const { corp_code, bgn_de, end_de, pblntf_ty, page_no, page_count, userApiKey } = body;

    // Use Netlify environment variable OPENDART_API_KEY or DART_API_KEY or userApiKey
    const apiKey = userApiKey?.trim() || process.env.OPENDART_API_KEY || process.env.DART_API_KEY;

    if (!apiKey || apiKey === 'YOUR_OPENDART_API_KEY') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          status: 'NO_KEY',
          message: 'Netlify 환경변수(OPENDART_API_KEY) 또는 UI 설정에 OpenDART API 인증키가 등록되지 않았습니다.',
          list: [],
        }),
      };
    }

    // Build OpenDART URL
    const params = new URLSearchParams();
    params.append('crtfc_key', apiKey);
    if (corp_code) params.append('corp_code', corp_code);
    if (bgn_de) params.append('bgn_de', String(bgn_de).replace(/-/g, ''));
    if (end_de) params.append('end_de', String(end_de).replace(/-/g, ''));
    if (pblntf_ty && pblntf_ty !== '전체') params.append('pblntf_ty', pblntf_ty);
    params.append('page_no', String(page_no || 1));
    params.append('page_count', String(page_count || 100));

    const openDartUrl = `https://opendart.fss.or.kr/api/list.json?${params.toString()}`;

    const dartRes = await fetch(openDartUrl);
    const dartData = await dartRes.json();

    if (dartData.status !== '000') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: dartData.status,
          message: dartData.message || 'OpenDART API 조회 오류가 발생했습니다.',
          total_count: 0,
          list: [],
        }),
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: '000',
        message: '정상',
        total_count: dartData.total_count || transformedList.length,
        page_no: dartData.page_no || 1,
        page_count: dartData.page_count || 100,
        list: transformedList,
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'ERROR',
        message: error?.message || 'Netlify Function OpenDART 처리 실패',
        list: [],
      }),
    };
  }
};
