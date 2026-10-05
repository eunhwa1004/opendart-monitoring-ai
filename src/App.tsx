import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CompanySearch } from './components/CompanySearch';
import { FilterSection, PeriodOption } from './components/FilterSection';
import { DisclosureTable } from './components/DisclosureTable';
import { DisclosureDetailModal } from './components/DisclosureDetailModal';
import { DartViewerModal } from './components/DartViewerModal';
import { ExecutiveMemoDrawer } from './components/ExecutiveMemoDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Company } from './data/companies';
import { Disclosure, DisclosureType } from './data/disclosures';
import { Sparkles, FileSearch, Loader2, Key, AlertCircle } from 'lucide-react';

export default function App() {
  // 1. State for selected company
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // 2. State for query filters
  const [period, setPeriod] = useState<PeriodOption>('3M'); // Default 최근 3개월
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [disclosureType, setDisclosureType] = useState<DisclosureType | '전체'>('전체');
  const [importantOnly, setImportantOnly] = useState<boolean>(false);

  // 3. User OpenDART API Key stored in state/localStorage
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem('OPENDART_API_KEY') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // 4. Real OpenDART Disclosures State
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loadingDart, setLoadingDart] = useState<boolean>(false);
  const [dartStatus, setDartStatus] = useState<string>('INIT');
  const [dartMessage, setDartMessage] = useState<string>('');

  // 5. Modals and Drawer state
  const [activeDetailDisc, setActiveDetailDisc] = useState<Disclosure | null>(null);
  const [activeDartDisc, setActiveDartDisc] = useState<Disclosure | null>(null);
  const [isMemoDrawerOpen, setIsMemoDrawerOpen] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Save API Key handler
  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem('OPENDART_API_KEY', key);
    } else {
      localStorage.removeItem('OPENDART_API_KEY');
    }
  };

  // Map disclosureType to OpenDART pblntf_ty code
  const getOpenDartCategoryCode = (type: DisclosureType | '전체'): string => {
    if (type === '정기공시') return 'A';
    if (type === '주요사항') return 'B';
    if (type === '지분공시') return 'D';
    return '';
  };

  // Fetch real disclosures from OpenDART via backend / Netlify Function
  const fetchOpenDartDisclosures = useCallback(async () => {
    setLoadingDart(true);
    setDartMessage('');
    try {
      const payload = {
        corp_code: selectedCompany ? selectedCompany.corp_code : undefined,
        bgn_de: startDate,
        end_de: endDate,
        pblntf_ty: getOpenDartCategoryCode(disclosureType),
        page_no: 1,
        page_count: 100,
        userApiKey: userApiKey || undefined,
      };

      // Primary call to /api/dart/search (which Netlify redirects to /.netlify/functions/dart-search)
      let res = await fetch('/api/dart/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';

      // If server returned HTML (e.g. static host without rewrite rule active yet), fallback to direct Netlify function path
      if (!res.ok || contentType.includes('text/html')) {
        res = await fetch('/.netlify/functions/dart-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      setDartStatus(data.status);

      if (data.status === '000') {
        let fetchedList: Disclosure[] = data.list || [];

        // Apply importantOnly filter if checked
        if (importantOnly) {
          fetchedList = fetchedList.filter((item) => item.isImportant);
        }

        setDisclosures(fetchedList);
      } else {
        setDisclosures([]);
        setDartMessage(data.message || 'OpenDART 공시를 불러오지 못했습니다.');
      }
    } catch (err: any) {
      setDartStatus('ERROR');
      setDartMessage('서버 통신 오류: ' + (err?.message || '잠시 후 다시 시도해주세요.'));
      setDisclosures([]);
    } finally {
      setLoadingDart(false);
    }
  }, [selectedCompany, startDate, endDate, disclosureType, importantOnly, userApiKey]);

  // Initial fetch and fetch on query trigger
  useEffect(() => {
    fetchOpenDartDisclosures();
  }, [fetchOpenDartDisclosures]);

  // Handle period option clicks to auto-update dates
  const handleSelectPeriod = (p: PeriodOption) => {
    setPeriod(p);
    const now = new Date();
    const endStr = now.toISOString().slice(0, 10);
    setEndDate(endStr);

    if (p === '1M') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      setStartDate(d.toISOString().slice(0, 10));
    } else if (p === '3M') {
      const d = new Date();
      d.setMonth(d.getMonth() - 3);
      setStartDate(d.toISOString().slice(0, 10));
    } else if (p === '6M') {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      setStartDate(d.toISOString().slice(0, 10));
    }
  };

  const handleResetFilters = () => {
    setSelectedCompany(null);
    setPeriod('3M');
    const now = new Date();
    setEndDate(now.toISOString().slice(0, 10));
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    setStartDate(d.toISOString().slice(0, 10));
    setDisclosureType('전체');
    setImportantOnly(false);
  };

  const handleToggleBookmark = (disc: Disclosure) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(disc.id)) {
        next.delete(disc.id);
      } else {
        next.add(disc.id);
      }
      return next;
    });
  };

  const bookmarkedDisclosures = disclosures.filter((d) => bookmarkedIds.has(d.id));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header */}
      <Header
        watchlistCount={35}
        memoCount={bookmarkedIds.size}
        onOpenMemo={() => setIsMemoDrawerOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasUserApiKey={!!userApiKey}
      />

      {/* 2. Main Content Container (PC Wide Layout max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Info Banner for Banking Officers */}
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-850 to-indigo-950/80 border border-blue-900/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>금융감독원 OpenDART 공시 실시간 연동 데스크</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.2 rounded font-mono">
                  Netlify Functions 지원
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                기업명 입력 시 해당 기업의 OpenDART 고유번호(corp_code)를 자동 매핑하여 최근 공시 내역을 실시간 수신합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>OpenDART 인증키 설정</span>
            </button>
            <button
              onClick={() => setIsMemoDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI 여신 점검 메모 ({bookmarkedIds.size})</span>
            </button>
          </div>
        </div>

        {/* 3. Corporate Search Section */}
        <CompanySearch
          selectedCompany={selectedCompany}
          onSelectCompany={(comp) => {
            setSelectedCompany(comp);
          }}
        />

        {/* 4. Query Period & Disclosure Type Filter Section */}
        <FilterSection
          period={period}
          onSelectPeriod={handleSelectPeriod}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          disclosureType={disclosureType}
          onSelectType={setDisclosureType}
          importantOnly={importantOnly}
          onToggleImportantOnly={setImportantOnly}
          onExecuteSearch={fetchOpenDartDisclosures}
          onResetFilters={handleResetFilters}
          totalResultsCount={disclosures.length}
        />

        {/* OpenDART Status / Error Notice if API Key is needed or query returned error */}
        {dartStatus !== '000' && dartStatus !== 'INIT' && !loadingDart && (
          <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold text-amber-300">OpenDART API 연동 안내 ({dartStatus})</p>
                <p className="text-amber-200/80 mt-0.5">{dartMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition shrink-0 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>인증키 입력/설정하기</span>
            </button>
          </div>
        )}

        {/* 5. Disclosure Results Table with Loading State */}
        {loadingDart ? (
          <div className="bg-slate-800/90 rounded-xl border border-slate-700 p-12 text-center text-slate-300 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="font-semibold text-sm">금융감독원 OpenDART에서 실제 공시 데이터를 실시간 수신 중입니다...</p>
            <p className="text-xs text-slate-500 font-mono">
              [API] https://opendart.fss.or.kr/api/list.json (조회기간: {startDate} ~ {endDate})
            </p>
          </div>
        ) : (
          <DisclosureTable
            disclosures={disclosures}
            onSelectDisclosure={(disc) => setActiveDetailDisc(disc)}
            onOpenDartViewer={(disc) => setActiveDartDisc(disc)}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedIds}
          />
        )}
      </main>

      {/* 6. Footer */}
      <footer className="mt-12 bg-slate-950 border-t border-slate-800/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-400">기업 공시 모니터링 AI (금융감독원 OpenDART 연동)</p>
            <p className="text-[11px] mt-0.5 text-slate-600">
              Netlify Serverless Functions & OpenDART 공식 API 연동 · 본 서비스는 여신심사역의 객관적 공시 확인을 지원하며 임의의 위험 등급을 산정하지 않습니다.
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-600">
            © 2026 Savings Bank Corporate Credit Intelligence System. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 7. Modals & Drawers */}
      <DisclosureDetailModal
        disclosure={activeDetailDisc}
        onClose={() => setActiveDetailDisc(null)}
        onOpenDartViewer={(disc) => {
          setActiveDetailDisc(null);
          setActiveDartDisc(disc);
        }}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={activeDetailDisc ? bookmarkedIds.has(activeDetailDisc.id) : false}
      />

      <DartViewerModal
        disclosure={activeDartDisc}
        onClose={() => setActiveDartDisc(null)}
      />

      <ExecutiveMemoDrawer
        isOpen={isMemoDrawerOpen}
        onClose={() => setIsMemoDrawerOpen(false)}
        bookmarkedDisclosures={bookmarkedDisclosures}
        onRemoveBookmark={(id) => {
          setBookmarkedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }}
        onClearAll={() => setBookmarkedIds(new Set())}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        userApiKey={userApiKey}
        onSaveKey={handleSaveApiKey}
      />
    </div>
  );
}
