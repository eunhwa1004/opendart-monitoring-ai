export interface OpenDartCompany {
  corp_code: string; // OpenDART 8자리 고유번호
  corp_name: string; // 회사명
  stock_code: string; // 6자리 종목코드 (비상장은 '')
  corp_cls: 'Y' | 'K' | 'N' | 'E'; // Y: KOSPI, K: KOSDAQ, N: KONEX, E: 기타/비상장
  industry?: string;
  isCreditClient?: boolean;
}

export const OPEN_DART_COMPANIES: OpenDartCompany[] = [
  { corp_code: '00126380', corp_name: '삼성전자', stock_code: '005930', corp_cls: 'Y', industry: '전기전자 / 반도체', isCreditClient: true },
  { corp_code: '00164779', corp_name: 'SK하이닉스', stock_code: '000660', corp_cls: 'Y', industry: '전기전자 / 메모리', isCreditClient: true },
  { corp_code: '00164742', corp_name: '현대자동차', stock_code: '005380', corp_cls: 'Y', industry: '자동차 및 부품', isCreditClient: true },
  { corp_code: '00258801', corp_name: '카카오', stock_code: '035720', corp_cls: 'Y', industry: '정보통신 / 서비스', isCreditClient: false },
  { corp_code: '00266961', corp_name: 'NAVER', stock_code: '035420', corp_cls: 'Y', industry: '정보통신 / 포털', isCreditClient: false },
  { corp_code: '00413046', corp_name: '셀트리온', stock_code: '068270', corp_cls: 'Y', industry: '바이오 / 제약', isCreditClient: true },
  { corp_code: '01188012', corp_name: '에코프로비엠', stock_code: '247540', corp_cls: 'K', industry: '이차전지 / 소재', isCreditClient: true },
  { corp_code: '00158307', corp_name: '한화', stock_code: '000880', corp_cls: 'Y', industry: '화학 / 금융', isCreditClient: true },
  { corp_code: '00149232', corp_name: '태영건설', stock_code: '005400', corp_cls: 'Y', industry: '건설업 / 토목', isCreditClient: true },
  { corp_code: '00143636', corp_name: 'POSCO홀딩스', stock_code: '005490', corp_cls: 'Y', industry: '철강 / 지주사', isCreditClient: false },
  { corp_code: '01502429', corp_name: 'LG에너지솔루션', stock_code: '373220', corp_cls: 'Y', industry: '전기전자 / 배터리', isCreditClient: true },
  { corp_code: '00158495', corp_name: '한신공영', stock_code: '004960', corp_cls: 'Y', industry: '건설업 / 주택', isCreditClient: true },
  { corp_code: '00181934', corp_name: 'HLB', stock_code: '028300', corp_cls: 'K', industry: '제약 / 바이오', isCreditClient: false },
  { corp_code: '00382348', corp_name: '다날', stock_code: '064260', corp_cls: 'K', industry: 'IT / 전자결제', isCreditClient: true },
  { corp_code: '00382199', corp_name: '신한지주', stock_code: '055550', corp_cls: 'Y', industry: '금융업', isCreditClient: false },
  { corp_code: '00401731', corp_name: 'LG전자', stock_code: '066570', corp_cls: 'Y', industry: '전기전자 / 가전', isCreditClient: true },
  { corp_code: '00106641', corp_name: '기아', stock_code: '000270', corp_cls: 'Y', industry: '자동차 및 부품', isCreditClient: true },
  { corp_code: '00126423', corp_name: '삼성SDI', stock_code: '006400', corp_cls: 'Y', industry: '전기전자 / 이차전지', isCreditClient: true },
  { corp_code: '00164788', corp_name: '현대모비스', stock_code: '012330', corp_cls: 'Y', industry: '자동차 부품', isCreditClient: false },
  { corp_code: '00665089', corp_name: 'KB금융', stock_code: '105560', corp_cls: 'Y', industry: '금융업', isCreditClient: false },
  { corp_code: '00877059', corp_name: '삼성바이오로직스', stock_code: '207940', corp_cls: 'Y', industry: '바이오 / 위탁생산', isCreditClient: false },
  { corp_code: '01168285', corp_name: '카카오뱅크', stock_code: '377300', corp_cls: 'Y', industry: '금융업 / 인터넷은행', isCreditClient: false },
  { corp_code: '01257451', corp_name: '크래프톤', stock_code: '259960', corp_cls: 'Y', industry: '게임 / 소프트웨어', isCreditClient: false },
  { corp_code: '01428282', corp_name: '하이브', stock_code: '352820', corp_cls: 'Y', industry: '엔터테인먼트', isCreditClient: false },
  { corp_code: '00236322', corp_name: '엔씨소프트', stock_code: '036570', corp_cls: 'Y', industry: '게임 / 소프트웨어', isCreditClient: false },
  { corp_code: '00115047', corp_name: '두산에너빌리티', stock_code: '034020', corp_cls: 'Y', industry: '중공업 / 발전설비', isCreditClient: true },
  { corp_code: '00110031', corp_name: 'GS건설', stock_code: '006360', corp_cls: 'Y', industry: '건설업', isCreditClient: true },
  { corp_code: '00110828', corp_name: '대우건설', stock_code: '047040', corp_cls: 'Y', industry: '건설업', isCreditClient: true },
  { corp_code: '00164627', corp_name: '현대건설', stock_code: '000720', corp_cls: 'Y', industry: '건설업', isCreditClient: true },
  { corp_code: '00161833', corp_name: 'HMM', stock_code: '011200', corp_cls: 'Y', industry: '해운업 / 물류', isCreditClient: false },
  { corp_code: '00116240', corp_name: '대한항공', stock_code: '003490', corp_cls: 'Y', industry: '항공운송업', isCreditClient: true },
  { corp_code: '00159227', corp_name: '한국전력공사', stock_code: '015760', corp_cls: 'Y', industry: '전기 / 에너지', isCreditClient: false },
  { corp_code: '00190321', corp_name: 'KT', stock_code: '030200', corp_cls: 'Y', industry: '통신 / IT', isCreditClient: false },
  { corp_code: '00164803', corp_name: 'SK텔레콤', stock_code: '017670', corp_cls: 'Y', industry: '통신 / IT', isCreditClient: false },
  { corp_code: '00216489', corp_name: 'LG유플러스', stock_code: '032640', corp_cls: 'Y', industry: '통신 / IT', isCreditClient: false },
];
