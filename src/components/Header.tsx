import React from 'react';
import { Building2, ShieldCheck, FileText, Key } from 'lucide-react';

interface HeaderProps {
  watchlistCount: number;
  memoCount: number;
  onOpenMemo: () => void;
  onOpenApiKeyModal: () => void;
  hasUserApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  memoCount,
  onOpenMemo,
  onOpenApiKeyModal,
  hasUserApiKey,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Zone: Title & Banking Context */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-400 tracking-wider">SB 저축은행 업무용</span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-slate-400">기업여신심사팀</span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-none">
              기업 공시 모니터링 AI
            </h1>
          </div>
        </div>

        {/* Center / Right Quick Stats & Tools */}
        <div className="flex items-center gap-3">
          {/* OpenDART API Status & Settings Trigger */}
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
            title="OpenDART API 연동 설정"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">OpenDART API:</span>
            <span className="font-mono text-[11px] text-emerald-300 font-semibold">
              {hasUserApiKey ? '키 설정됨' : '실시간 연동중'}
            </span>
            <Key className="w-3 h-3 text-slate-400 ml-1" />
          </button>

          <button
            onClick={onOpenMemo}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-sm hover:shadow-indigo-500/20 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>여신 점검 메모</span>
            {memoCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white text-indigo-700 font-bold rounded-full text-[10px] font-mono">
                {memoCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
