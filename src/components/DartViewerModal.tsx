import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Printer,
  FileCheck2,
  ListTree,
  Building2,
  FileText,
  Globe,
} from 'lucide-react';
import { Disclosure } from '../data/disclosures';

interface DartViewerModalProps {
  disclosure: Disclosure | null;
  onClose: () => void;
}

export const DartViewerModal: React.FC<DartViewerModalProps> = ({
  disclosure,
  onClose,
}) => {
  if (!disclosure) return null;

  const [activeSection, setActiveSection] = useState('0');

  const dartUrl = disclosure.dartUrl || `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${disclosure.dartReceiptNo}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col font-sans">
        {/* DART Top System Header Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 px-6 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xs tracking-wider shadow">
              DART
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-300">금융감독원 전자공시시스템</span>
                <span className="text-slate-500 text-xs">|</span>
                <span className="text-xs text-slate-400 font-mono">접수번호: {disclosure.dartReceiptNo}</span>
              </div>
              <h2 className="text-sm font-semibold text-slate-100 line-clamp-1">
                {disclosure.companyName} ({disclosure.stockCode}) - {disclosure.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={dartUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>DART 공식 웹사이트 원문 열기</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => window.print()}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="인쇄"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DART Document Body Layout with Sidebar */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-950">
          {/* Left Tree Index Sidebar */}
          <div className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto shrink-0 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-3 pb-2 border-b border-slate-800">
              <ListTree className="w-4 h-4 text-blue-400" />
              <span>문서 정보 (Index)</span>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveSection('0')}
                className={`w-full text-left px-2.5 py-2 rounded transition flex items-center gap-2 ${
                  activeSection === '0'
                    ? 'bg-blue-900/60 text-blue-200 font-semibold border border-blue-700/60'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>공시 표지 및 개요</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('1')}
                className={`w-full text-left px-2.5 py-2 rounded transition flex items-center gap-2 ${
                  activeSection === '1'
                    ? 'bg-blue-900/60 text-blue-200 font-semibold border border-blue-700/60'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>공시 세부 제출 정보</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection('2')}
                className={`w-full text-left px-2.5 py-2 rounded transition flex items-center gap-2 ${
                  activeSection === '2'
                    ? 'bg-blue-900/60 text-blue-200 font-semibold border border-blue-700/60'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>제출자 및 접수 정보</span>
              </button>
            </nav>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-1.5 font-mono">
              <p>접수일자: {disclosure.date}</p>
              <p>제출인: {disclosure.submitter}</p>
              <p>공시유형: {disclosure.type}</p>
              {disclosure.remarks && <p>비고: {disclosure.remarks}</p>}
            </div>
          </div>

          {/* Right Main Document Sheet */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-950 text-slate-200 font-sans">
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-inner space-y-6">
              {/* Document Header Banner inside sheet */}
              <div className="border-b-2 border-slate-700 pb-4 text-center">
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                  [금융감독원 OpenDART 공시문서]
                </span>
                <h1 className="text-2xl font-extrabold text-slate-100 mt-1">
                  {disclosure.title}
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">
                  제출회사: {disclosure.companyName} ({disclosure.stockCode}) | 공시접수일: {disclosure.date}
                </p>
              </div>

              {/* Summary Information Box */}
              <div className="bg-slate-800/80 px-4 py-3 rounded-lg border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>공시 제출 내역</span>
                  <span className="font-mono text-blue-300">DART 접수번호: {disclosure.dartReceiptNo}</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-mono">
                  {disclosure.summary}
                </p>
              </div>

              {/* Official Table if present in raw content */}
              {disclosure.dartRawContent?.contentTable && (
                <div className="overflow-x-auto border border-slate-700 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-slate-200 font-semibold border-b border-slate-700">
                        {disclosure.dartRawContent.contentTable.headers.map((h: string, i: number) => (
                          <th key={i} className="p-2.5 border-r border-slate-700 last:border-0 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {disclosure.dartRawContent.contentTable.rows.map((row: string[], rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-850">
                          {row.map((cell: string, cIdx: number) => (
                            <td key={cIdx} className="p-2.5 border-r border-slate-800 last:border-0 font-mono">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Body Content or Raw Text */}
              <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {disclosure.dartRawContent?.rawBodyText || `[공시 서류 상세 정보]
- 보고서명: ${disclosure.title}
- 공시 제출인: ${disclosure.submitter}
- 접수일자: ${disclosure.date}
- 접수번호: ${disclosure.dartReceiptNo}
- 비고: ${disclosure.remarks || '없음'}

금융감독원 DART 시스템에 정상 등록된 공식 전자공시 서류입니다.`}
              </div>

              {/* Official DART Direct Action Banner */}
              <div className="bg-blue-950/40 p-4 rounded-xl border border-blue-900/60 flex items-center justify-between gap-4">
                <div className="text-xs text-blue-200">
                  <p className="font-bold">금융감독원 DART 원문 서류 확인</p>
                  <p className="text-blue-300/80 text-[11px] mt-0.5">
                    공식 DART 웹사이트에서 첨부서류(감사보고서, 이사회 의결서 등)를 직접 확인하시려면 원문보기 버튼을 클릭하세요.
                  </p>
                </div>
                <a
                  href={dartUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shrink-0 flex items-center gap-1.5 shadow"
                >
                  <Globe className="w-4 h-4" />
                  <span>DART 원문 열기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>금융감독원 OpenDART 공식 원문 연동</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
