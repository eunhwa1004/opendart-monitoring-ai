import React from 'react';
import { Calendar, Filter, Search, ShieldAlert, RotateCcw } from 'lucide-react';
import { DisclosureType } from '../data/disclosures';

export type PeriodOption = '1M' | '3M' | '6M' | 'CUSTOM';

interface FilterSectionProps {
  period: PeriodOption;
  onSelectPeriod: (period: PeriodOption) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  disclosureType: DisclosureType | '전체';
  onSelectType: (type: DisclosureType | '전체') => void;
  importantOnly: boolean;
  onToggleImportantOnly: (val: boolean) => void;
  onExecuteSearch: () => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  period,
  onSelectPeriod,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disclosureType,
  onSelectType,
  importantOnly,
  onToggleImportantOnly,
  onExecuteSearch,
  onResetFilters,
  totalResultsCount,
}) => {
  return (
    <div className="bg-slate-800/90 rounded-xl border border-slate-700/80 p-5 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: 조회기간 선택 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">조회기간 선택</h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-700/80 mb-3">
            <button
              type="button"
              onClick={() => onSelectPeriod('1M')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                period === '1M'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              최근 1개월
            </button>
            <button
              type="button"
              onClick={() => onSelectPeriod('3M')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                period === '3M'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              최근 3개월
            </button>
            <button
              type="button"
              onClick={() => onSelectPeriod('6M')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                period === '6M'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              최근 6개월
            </button>
            <button
              type="button"
              onClick={() => onSelectPeriod('CUSTOM')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                period === 'CUSTOM'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              직접 기간 설정
            </button>
          </div>

          {/* Custom Date Pickers when period === 'CUSTOM' */}
          {period === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/80 text-xs">
              <span className="text-slate-400 whitespace-nowrap">시작일:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="bg-slate-800 text-slate-100 border border-slate-700 px-2.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <span className="text-slate-500">~</span>
              <span className="text-slate-400 whitespace-nowrap">종료일:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="bg-slate-800 text-slate-100 border border-slate-700 px-2.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          )}
        </div>

        {/* Section 2: 공시 유형 선택 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">공시 유형 선택</h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-700/80 mb-3">
            <button
              type="button"
              onClick={() => onSelectType('전체')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                disclosureType === '전체'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => onSelectType('정기공시')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                disclosureType === '정기공시'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              정기공시
            </button>
            <button
              type="button"
              onClick={() => onSelectType('주요사항')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                disclosureType === '주요사항'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              주요사항
            </button>
            <button
              type="button"
              onClick={() => onSelectType('지분공시')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition ${
                disclosureType === '지분공시'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              지분공시
            </button>
          </div>

          {/* Important Only Toggle */}
          <div className="flex items-center justify-between bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={importantOnly}
                onChange={(e) => onToggleImportantOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span className="text-xs text-slate-200 flex items-center gap-1.5 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>주요사항보고서 등 업무 우선검토 공시만 보기</span>
              </span>
            </label>
            <span className="text-[11px] text-slate-400">
              (유상증자, CB발행, 차입금증가, 대표이사/감사인 변경 등)
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>조회 결과:</span>
          <span className="font-mono text-sm font-bold text-blue-300">{totalResultsCount}건</span>
          <span>공시 항목 검색됨</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>필터 초기화</span>
          </button>

          <button
            type="button"
            onClick={onExecuteSearch}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition flex items-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4" />
            <span>공시 조회하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
