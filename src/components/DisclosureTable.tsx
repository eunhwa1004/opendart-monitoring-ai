import React, { useState } from 'react';
import {
  FileSearch,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  Search,
  CheckCircle2,
  BookmarkPlus,
  BookmarkCheck,
} from 'lucide-react';
import { Disclosure } from '../data/disclosures';

interface DisclosureTableProps {
  disclosures: Disclosure[];
  onSelectDisclosure: (disc: Disclosure) => void;
  onOpenDartViewer: (disc: Disclosure) => void;
  onToggleBookmark: (disc: Disclosure) => void;
  bookmarkedIds: Set<string>;
}

export const DisclosureTable: React.FC<DisclosureTableProps> = ({
  disclosures,
  onSelectDisclosure,
  onOpenDartViewer,
  onToggleBookmark,
  bookmarkedIds,
}) => {
  const [sortAsc, setSortAsc] = useState(false); // false = recent disclosures on top (내림차순)
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter within current view if tableSearch is typed
  const filtered = disclosures.filter((disc) => {
    if (!tableSearch.trim()) return true;
    const q = tableSearch.trim().toLowerCase();
    return (
      disc.companyName.toLowerCase().includes(q) ||
      disc.stockCode.toLowerCase().includes(q) ||
      disc.title.toLowerCase().includes(q) ||
      disc.summary.toLowerCase().includes(q)
    );
  });

  // Sort disclosures (default descending date)
  const sortedDisclosures = [...filtered].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedDisclosures.length / itemsPerPage) || 1;
  const paginated = sortedDisclosures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-slate-800/90 rounded-xl border border-slate-700/80 shadow-md overflow-hidden">
      {/* Table Top Controls & Sorting Indicator */}
      <div className="p-4 bg-slate-850 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>조회 결과 목록</span>
            <span className="font-mono text-blue-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {sortedDisclosures.length}건
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 px-2.5 py-1 rounded border border-slate-700 transition"
          >
            <span>정렬: {sortAsc ? '오래된 공시순' : '최근 공시순 (기본)'}</span>
            {sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Quick Search in Results */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => {
              setTableSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="결과 내 검색 (공시제목, 기업명...)"
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main Disclosure Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/80">
              <th scope="col" className="py-3 px-4 w-28 whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  className="flex items-center gap-1 hover:text-slate-200"
                >
                  <span>공시일</span>
                  {sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </th>
              <th scope="col" className="py-3 px-4 w-44 whitespace-nowrap">기업명 (종목코드)</th>
              <th scope="col" className="py-3 px-4">공시 제목</th>
              <th scope="col" className="py-3 px-4 w-28 text-center whitespace-nowrap">공시 유형</th>
              <th scope="col" className="py-3 px-4 w-32 text-center whitespace-nowrap">우선 검토</th>
              <th scope="col" className="py-3 px-4 w-48 text-center whitespace-nowrap">상세 및 원문</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-normal">
            {paginated.length > 0 ? (
              paginated.map((disc) => {
                const isBookmarked = bookmarkedIds.has(disc.id);
                return (
                  <tr
                    key={disc.id}
                    className={`hover:bg-slate-750/90 transition group ${
                      disc.isImportant ? 'bg-slate-800/60' : ''
                    }`}
                  >
                    {/* 공시일 */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {disc.date}
                    </td>

                    {/* 기업명 & 종목코드 */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 text-sm group-hover:text-blue-300 transition">
                          {disc.companyName}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-[11px] text-slate-400 bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-800">
                            {disc.stockCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 공시 제목 */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectDisclosure(disc)}
                          className="text-left font-medium text-slate-200 hover:text-blue-400 transition leading-snug line-clamp-2"
                        >
                          {disc.title}
                        </button>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {disc.summary}
                        </p>
                      </div>
                    </td>

                    {/* 공시 유형 */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-[11px] font-medium ${
                          disc.type === '주요사항'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : disc.type === '정기공시'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                            : 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                        }`}
                      >
                        {disc.type}
                      </span>
                    </td>

                    {/* 주요 공시 확인 (업무 우선검토 표시) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {disc.isImportant ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>업무우선검토</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">일반</span>
                      )}
                    </td>

                    {/* 상세보기 & DART 원문 버튼 */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectDisclosure(disc)}
                          className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition flex items-center gap-1"
                          title="공시 상세보기 및 AI 요약"
                        >
                          <FileSearch className="w-3.5 h-3.5" />
                          <span>상세보기</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenDartViewer(disc)}
                          className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition flex items-center gap-1"
                          title="DART 공식 원문 문서 확인"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                          <span>DART 원문</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleBookmark(disc)}
                          className={`p-1.5 rounded border text-[11px] transition ${
                            isBookmarked
                              ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          title={isBookmarked ? '여신 메모 해제' : '여신 점검 메모에 추가'}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <BookmarkPlus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="w-8 h-8 text-slate-600" />
                    <p className="text-sm font-medium">선택한 조건에 부합하는 기업 공시가 없습니다.</p>
                    <p className="text-xs text-slate-500">
                      조회기간을 확대하거나 공시 유형 필터를 변경해보세요.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 bg-slate-850 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            페이지 <strong className="text-slate-200 font-mono">{currentPage}</strong> / {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded font-mono text-xs ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-slate-200"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
