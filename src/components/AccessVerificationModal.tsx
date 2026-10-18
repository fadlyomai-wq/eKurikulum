import React, { useState } from 'react';
import { Lock, ShieldCheck, UserCheck, AlertCircle, X, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AccessVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (actorName: string) => void;
  currentPasskey: string;
  targetTabName?: string;
  onRecordFailedAttempt?: (actorName: string) => void;
}

export const AccessVerificationModal: React.FC<AccessVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPasskey,
  targetTabName,
  onRecordFailedAttempt,
}) => {
  const [actorName, setActorName] = useState('');
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = actorName.trim();
    if (!trimmedName) {
      setErrorMessage('Silakan isi Nama Pengakses terlebih dahulu.');
      return;
    }

    const trimmedPasskey = passkeyInput.trim();
    if (!trimmedPasskey) {
      setErrorMessage('Silakan masukkan kode passkey keamanan.');
      return;
    }

    setIsSubmitting(true);

    // Verify passkey against current configuration (default fallback: '123456')
    const validPasskey = currentPasskey || '123456';

    if (trimmedPasskey === validPasskey) {
      setIsSubmitting(false);
      onSuccess(trimmedName);
    } else {
      setIsSubmitting(false);
      setErrorMessage('Kode passkey salah! Silakan periksa kembali atau hubungi administrator.');
      if (onRecordFailedAttempt) {
        onRecordFailedAttempt(trimmedName);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-indigo-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup & Kembali ke Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 ring-4 ring-white/20">
            <Lock className="w-7 h-7 text-indigo-200" />
          </div>
          <h3 className="text-lg font-bold">Verifikasi Akses Pengguna</h3>
          <p className="text-xs text-indigo-200 mt-1 max-w-xs mx-auto">
            {targetTabName
              ? `Untuk mengakses menu ${targetTabName}, silakan verifikasi identitas dan kode passkey Anda.`
              : 'Verifikasi identitas dan masukkan kode passkey untuk mengakses fitur ini.'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              Nama Pengakses / Petugas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Contoh: Drs. Bambang / Siti Aminah (Wakasek)"
              value={actorName}
              onChange={(e) => setActorName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Nama ini akan dicatat pada Log Aktivitas di Dashboard.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              Kode Passkey Keamanan <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan kode passkey..."
                value={passkeyInput}
                onChange={(e) => setPasskeyInput(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Masukkan kode passkey keamanan yang sah untuk membuka menu.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Batal (Ke Dashboard)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Memverifikasi...' : 'Verifikasi & Buka'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
