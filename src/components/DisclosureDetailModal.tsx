import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Bot,
  Sparkles,
  FileText,
  Building,
  Calendar,
  AlertCircle,
  BookmarkPlus,
  BookmarkCheck,
  Send,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Disclosure } from '../data/disclosures';

interface DisclosureDetailModalProps {
  disclosure: Disclosure | null;
  onClose: () => void;
  onOpenDartViewer: (disc: Disclosure) => void;
  onToggleBookmark: (disc: Disclosure) => void;
  isBookmarked: boolean;
}

export const DisclosureDetailModal: React.FC<DisclosureDetailModalProps> = ({
  disclosure,
  onClose,
  onOpenDartViewer,
  onToggleBookmark,
  isBookmarked,
}) => {
  if (!disclosure) return null;

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');

  // Call server-side Gemini API for AI disclosure analysis
  const handleAnalyze = async (questionPrompt?: string) => {
    setLoadingAi(true);
    try {
      const detailsText = (disclosure.details || [])
        .map((d) => `${d.sectionTitle}: ${d.keyPoints.join(', ')}`)
        .join('\n');

      const res = await fetch('/api/analyze-disclosure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: disclosure.companyName,
          stockCode: disclosure.stockCode,
          title: disclosure.title,
          disclosureType: disclosure.type,
          content: `${disclosure.summary}\n${detailsText}`,
          question: questionPrompt || customQuestion || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAiAnalysis(data.result);
      } else {
        setAiAnalysis('AI 분석 중 오류가 발생했습니다: ' + (data.error || '잠시 후 다시 시도해주세요.'));
      }
    } catch (err: any) {
      setAiAnalysis('서버 연결 중 오류가 발생했습니다: ' + err?.message);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-850 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm text-blue-400 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                {disclosure.companyName}
              </span>
              <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                종목코드: {disclosure.stockCode}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  disclosure.type === '주요사항'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                }`}
              >
                {disclosure.type}
              </span>
              {disclosure.isImportant && (
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>우선검토 공시</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-100 leading-snug">
              {disclosure.title}
            </h2>

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                공시일: {disclosure.date}
              </span>
              <span>•</span>
              <span>DART 접수번호: {disclosure.dartReceiptNo}</span>
              <span>•</span>
              <span>제출인: {disclosure.submitter}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Key Summary Callout */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>공시 핵심 개요</span>
            </h3>
            <p className="text-slate-200 leading-relaxed font-normal text-sm">
              {disclosure.summary}
            </p>
          </div>

          {/* Structured Key Details Sections if available */}
          {disclosure.details && disclosure.details.length > 0 && (
            <div className="space-y-4">
              {disclosure.details.map((sec, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3 pb-2 border-b border-slate-800">
                    {sec.sectionTitle}
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {sec.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  {sec.financialImpact && (
                    <div className="mt-3 p-2.5 bg-blue-950/30 border border-blue-900/50 rounded-lg text-xs text-blue-200">
                      <strong className="text-blue-300">재무/영향 포인트: </strong>
                      {sec.financialImpact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* AI Disclosure Analysis Section */}
          <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-5 shadow-lg relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>AI 여신 심사 분석 요약</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    저축은행 기업금융/여신 관점에서 공시 영향을 실시간 분석합니다.
                  </p>
                </div>
              </div>

              {!aiAnalysis && !loadingAi && (
                <button
                  onClick={() => handleAnalyze()}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI 분석 실행</span>
                </button>
              )}
            </div>

            {/* Quick AI Presets */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleAnalyze('여신 채무상환 능력 및 유동성에 미치는 영향 요약')}
                disabled={loadingAi}
                className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-indigo-300 hover:text-white transition disabled:opacity-50"
              >
                💡 채무상환능력 영향
              </button>
              <button
                type="button"
                onClick={() => handleAnalyze('지분 및 대표이사/경영권 변경 영향 객관적 요약')}
                disabled={loadingAi}
                className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-indigo-300 hover:text-white transition disabled:opacity-50"
              >
                💡 경영권/지분 영향
              </button>
              <button
                type="button"
                onClick={() => handleAnalyze('저축은행 여신 심사 시 확인 및 추가 징구해야 할 서류 안내')}
                disabled={loadingAi}
                className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-indigo-300 hover:text-white transition disabled:opacity-50"
              >
                💡 필요 징구 서류
              </button>
            </div>

            {/* AI Result Box */}
            {loadingAi ? (
              <div className="py-8 text-center text-xs text-indigo-300 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                <span>Gemini AI가 OpenDART 공시 내용 및 여신 영향을 분석하고 있습니다...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="mt-3 p-4 bg-slate-900/90 border border-indigo-950 rounded-lg text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {aiAnalysis}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                버튼을 누르거나 추가 질의를 입력하면 AI가 여신심사 관점의 핵심 브리핑을 작성합니다. (자의적 위험 등급을 부여하지 않는 객관적 요약 제공)
              </p>
            )}

            {/* Custom Question Input */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customQuestion.trim()) {
                    handleAnalyze(customQuestion);
                  }
                }}
                placeholder="추가 질문을 입력하세요 (예: 본 공시 관련 여신 관점 주요 체크포인트는?)"
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => handleAnalyze(customQuestion)}
                disabled={loadingAi || !customQuestion.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium transition flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>질문</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggleBookmark(disclosure)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              isBookmarked
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
            }`}
          >
            {isBookmarked ? (
              <>
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                <span>여신 점검 메모에 저장됨</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-slate-400" />
                <span>여신 점검 메모에 추가</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDartViewer(disclosure)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5 active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>DART 원문 보기</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
