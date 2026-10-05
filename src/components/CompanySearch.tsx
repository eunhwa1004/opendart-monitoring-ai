import React, { useState, useRef, useEffect } from 'react';
import { Search, Building, X, Check, ChevronDown } from 'lucide-react';
import { Company, COMPANIES_DATA } from '../data/companies';

interface CompanySearchProps {
  selectedCompany: Company | null;
  onSelectCompany: (company: Company | null) => void;
}

export const CompanySearch: React.FC<CompanySearchProps> = ({
  selectedCompany,
  onSelectCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter companies based on search input (by name, stockCode, or industry)
  const filteredCompanies = COMPANIES_DATA.filter((comp) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      comp.name.toLowerCase().includes(term) ||
      comp.stockCode.toLowerCase().includes(term) ||
      comp.industry.toLowerCase().includes(term)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (company: Company | null) => {
    onSelectCompany(company);
    setSearchTerm('');
    setIsOpen(false);
  };

  const presetCompanies = COMPANIES_DATA.slice(0, 8);

  return (
    <div className="bg-slate-800/90 rounded-xl border border-slate-700/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-100">기업 검색</h2>
        </div>
        <span className="text-xs text-slate-400">
          회사명 또는 종목코드(예: 005930, 005400) 입력
        </span>
      </div>

      {/* Main Search Bar & Autocomplete Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="검색할 기업명 또는 종목코드를 입력하세요 (예: 삼성전자, 태영건설, 005930...)"
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
          />
          {searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm('');
              }}
              className="absolute right-3 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <ChevronDown className="absolute right-3 w-4 h-4 text-slate-500 pointer-events-none" />
          )}
        </div>

        {/* Autocomplete Dropdown List */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 divide-y divide-slate-800">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                selectedCompany === null ? 'bg-blue-950/40 text-blue-300 font-semibold' : 'text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>전체 기업 공시 조회</span>
                <span className="text-[11px] text-slate-500">(특정 기업 미선택)</span>
              </span>
              {selectedCompany === null && <Check className="w-4 h-4 text-blue-400" />}
            </button>

            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((comp) => {
                const isSelected = selectedCompany?.id === comp.id;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => handleSelect(comp)}
                    className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                      isSelected ? 'bg-blue-950/50 text-blue-300 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-100 text-sm">{comp.name}</span>
                      <span className="font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        종목코드: {comp.stockCode}
                      </span>
                      <span className="text-slate-500 text-[11px]">{comp.market} · {comp.industry}</span>
                    </div>
                    {comp.creditClient && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded">
                        여신거래처 ({comp.loanAmount})
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                검색 조건에 맞는 기업이 없습니다. 회사명 또는 종목코드를 다시 확인해주세요.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Company Status Bar */}
      {selectedCompany ? (
        <div className="mt-3 bg-blue-950/40 border border-blue-800/60 rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <div>
              <span className="text-slate-400">선택한 기업: </span>
              <strong className="text-blue-200 text-sm font-semibold">{selectedCompany.name}</strong>
              <span className="ml-2 font-mono text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded text-[11px]">
                종목코드: {selectedCompany.stockCode}
              </span>
              <span className="ml-2 text-slate-400">[{selectedCompany.market} · {selectedCompany.industry}]</span>
            </div>
          </div>
          <button
            onClick={() => onSelectCompany(null)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-100 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
          >
            <X className="w-3.5 h-3.5" />
            <span>기업 선택 해제 (전체)</span>
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
          <span>현재 상태: <strong>전체 관심/여신 기업</strong> 대상 공시 검색 중</span>
          <span className="text-slate-500">아래 칩을 클릭하여 빠른 기업 선택이 가능합니다.</span>
        </div>
      )}

      {/* Preset Fast Selection Chips */}
      <div className="mt-3 pt-3 border-t border-slate-700/60">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold text-slate-400">주요 관심/여신 기업 빠른 선택:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectCompany(null)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              selectedCompany === null
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
            }`}
          >
            전체 기업
          </button>
          {presetCompanies.map((comp) => {
            const isSelected = selectedCompany?.id === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => onSelectCompany(comp)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                }`}
              >
                <span>{comp.name}</span>
                <span className="font-mono text-[10px] opacity-75">({comp.stockCode})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
