import React, { useState } from 'react';
import { Key, Globe, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  onSaveKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  onSaveKey,
}) => {
  const [inputKey, setInputKey] = useState(userApiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputKey.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">OpenDART API 인증키 설정</h3>
              <p className="text-[11px] text-slate-400">금융감독원 전자공시 실시간 연동</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <p className="leading-relaxed">
            OpenDART API 인증키를 설정하면 금융감독원에서 제공하는 <strong>실제 실시간 공시 목록</strong>을 조회할 수 있습니다.
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>서버 안전 관리:</span>
              <span className="text-emerald-400 flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5" />
                보안 백엔드 프록시
              </span>
            </div>
            <p className="text-slate-500 text-[10px] font-sans">
              입력하신 인증키는 클라이언트에 직접 노출되지 않으며 백엔드 서버(`/api/dart/search`)를 통해서만 안전하게 호출됩니다.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              OpenDART 인증키 (crtfc_key)
            </label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="예: 1234567890abcdef1234567890abcdef"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-600"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <a
              href="https://opendart.fss.or.kr/mng/authentificationKey.do"
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>OpenDART 무료 인증키 신청</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>저장 및 적용</span>
          </button>
        </div>
      </div>
    </div>
  );
};
