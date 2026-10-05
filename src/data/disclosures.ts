export type DisclosureType = '정기공시' | '주요사항' | '지분공시';

export interface Disclosure {
  id: string; // rcept_no (접수번호)
  companyId: string; // corp_code (8자리 고유번호)
  companyName: string; // corp_name
  stockCode: string; // stock_code
  date: string; // YYYY-MM-DD (rcept_dt)
  title: string; // report_nm
  type: DisclosureType;
  isImportant: boolean; // 주요사항/우선검토 공시
  importantReason?: string;
  dartReceiptNo: string; // rcept_no
  submitter: string; // flr_nm
  remarks?: string; // rm
  summary: string;
  dartUrl: string; // https://dart.fss.or.kr/dsaf001/main.do?rcpNo=...
  details?: {
    sectionTitle: string;
    keyPoints: string[];
    financialImpact?: string;
  }[];
  dartRawContent?: {
    documentTitle: string;
    subHeading: string;
    contentTable?: { headers: string[]; rows: string[][] };
    rawBodyText: string;
  };
}

export const DISCLOSURES_DATA: Disclosure[] = [];
