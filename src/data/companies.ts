import { OPEN_DART_COMPANIES } from './openDartCompanies';

export interface Company {
  id: string; // corp_code
  corp_code: string; // OpenDART 8자리 고유번호
  name: string; // 회사명
  stockCode: string; // 6자리 종목코드
  market: string; // KOSPI, KOSDAQ, KONEX, 비상장
  industry: string;
  creditClient?: boolean;
  loanAmount?: string;
}

export const COMPANIES_DATA: Company[] = OPEN_DART_COMPANIES.map((c) => ({
  id: c.corp_code,
  corp_code: c.corp_code,
  name: c.corp_name,
  stockCode: c.stock_code || '비상장',
  market: c.corp_cls === 'Y' ? 'KOSPI' : c.corp_cls === 'K' ? 'KOSDAQ' : '비상장',
  industry: c.industry || '기타업종',
  creditClient: c.isCreditClient,
  loanAmount: c.isCreditClient ? '여신 대상기업' : undefined,
}));
