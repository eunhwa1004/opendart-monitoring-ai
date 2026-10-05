import React, { useState } from 'react';
import {
  X,
  FileText,
  Trash2,
  Sparkles,
  Copy,
  Check,
  Printer,
  Download,
  Loader2,
  Building,
} from 'lucide-react';
import { Disclosure } from '../data/disclosures';

interface ExecutiveMemoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedDisclosures: Disclosure[];
  onRemoveBookmark: (id: string) => void;
  onClearAll: () => void;
}

export const ExecutiveMemoDrawer: React.FC<ExecutiveMemoDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedDisclosures,
  onRemoveBookmark,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const [aiMemo, setAiMemo] = useState<string | null>(null);
  const [loadingMemo, setLoadingMemo] = useState(false);
  const [copied, setCopied] = useState(false);

  // Group bookmarked disclosures by company
  const companies = Array.from(new Set(bookmarkedDisclosures.map((d) => d.companyName)));

  const handleGenerateMemo = async () => {
    if (bookmarkedDisclosures.length === 0) return;
    setLoadingMemo(true);
    try {
      const firstComp = bookmarkedDisclosures[0];
      const payload = {
        companyName: companies.join(', '),
        stockCode: firstComp.stockCode,
        selectedDisclosures: bookmarkedDisclosures.map((d) => ({
          date: d.date,
          companyName: d.companyName,
          title: d.title,
          type: d.type,
          summary: d.summary,
        })),
      };

      let res = await fetch('/api/generate-summary-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('text/html')) {
        res = await fetch('/.netlify/functions/generate-summary-memo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.result) {
        setAiMemo(data.result);
      } else {
        setAiMemo('보고서 생성 실패: ' + (data.error || '잠시 후 다시 시도해주세요.'));
      }
    } catch (err: any) {
      setAiMemo('오류 발생: ' + err?.message);
    } finally {
      setLoadingMemo(false);
    }
  };

  const handleCopy = () => {
    if (!aiMemo) return;
    navigator.clipboard.writeText(aiMemo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!aiMemo) return;
    const blob = new Blob([aiMemo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `기업공시_여신점검메모_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  여신 점검 보고서 작성
                </h2>
                <p className="text-xs text-slate-400">
                  선택한 공시 항목 <strong className="text-indigo-300 font-mono">{bookmarkedDisclosures.length}</strong>건을 바탕으로 내부 점검 메모를 생성합니다.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Selected Disclosures List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-slate-200 text-xs">
                  담은 공시 목록 ({bookmarkedDisclosures.length})
                </span>
                {bookmarkedDisclosures.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>전체 삭제</span>
                  </button>
                )}
              </div>

              {bookmarkedDisclosures.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {bookmarkedDisclosures.map((disc) => (
                    <div
                      key={disc.id}
                      className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-lg flex items-start justify-between gap-3 hover:border-slate-600 transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1 font-mono">
                          <span className="text-indigo-300 font-semibold flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            {disc.companyName}
                          </span>
                          <span>•</span>
                          <span>{disc.date}</span>
                        </div>
                        <p className="font-medium text-slate-200 text-xs line-clamp-1">
                          {disc.title}
                        </p>
                      </div>

                      <button
                        onClick={() => onRemoveBookmark(disc.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title="제거"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 bg-slate-850 rounded-xl border border-slate-800">
                  테이블에서 공시 항목의 북마크 아이콘을 눌러 여신 점검 메모에 추가하세요.
                </div>
              )}
            </div>

            {/* AI Executive Memo Generator Button & Output */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGenerateMemo}
                disabled={bookmarkedDisclosures.length === 0 || loadingMemo}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-xs transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
              >
                {loadingMemo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini AI 가 여신 점검 보고서를 작성하고 있습니다...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI 여신 점검 보고서 자동 작성</span>
                  </>
                )}
              </button>

              {aiMemo && (
                <div className="bg-slate-950 border border-indigo-900/80 rounded-xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>작성된 여신 점검 보고서 초안</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[10px]"
                        title="복사"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>복사</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleDownloadTxt}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-[10px]"
                        title="TXT 다운로드"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>다운로드</span>
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[10px]"
                        title="인쇄"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto pr-1">
                    {aiMemo}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">SB 저축은행 여신 심사시스템 내부 참고용</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
