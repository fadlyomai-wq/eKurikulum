import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  GraduationCap,
  Save,
  RefreshCw,
  Database,
  CloudCheck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { SchoolProfile } from '../types';

interface SchoolSettingsProps {
  schoolProfile: SchoolProfile;
  onSaveProfile: (profile: Partial<SchoolProfile>) => Promise<void>;
  onResetSeedData: () => Promise<void>;
  onClearDummyData?: () => Promise<void>;
  onUpdatePasskey?: (newPasskey: string) => Promise<void>;
  isFirebaseConnected: boolean;
  currentActorName?: string;
}

export const SchoolSettings: React.FC<SchoolSettingsProps> = ({
  schoolProfile,
  onSaveProfile,
  onResetSeedData,
  onClearDummyData,
  onUpdatePasskey,
  isFirebaseConnected,
  currentActorName = 'Administrator',
}) => {
  const [formData, setFormData] = useState<SchoolProfile>({ ...schoolProfile });
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Keep form in sync if schoolProfile changes from Firestore
  useEffect(() => {
    if (schoolProfile) {
      setFormData({ ...schoolProfile });
    }
  }, [schoolProfile]);

  // Passkey State
  const [currentPasskeyInput, setCurrentPasskeyInput] = useState('');
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showPasskeys, setShowPasskeys] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');
  const [passkeySuccess, setPasskeySuccess] = useState('');
  const [isSavingPasskey, setIsSavingPasskey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    try {
      await onSaveProfile({
        ...formData,
        updatedAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setSaveError('Gagal menyimpan profil sekolah: ' + (err?.message || 'Periksa koneksi jaringan.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError('');
    setPasskeySuccess('');

    const expectedPasskey = schoolProfile.accessPasskey || '123456';
    if (currentPasskeyInput !== expectedPasskey) {
      setPasskeyError('Passkey saat ini tidak cocok. Silakan masukkan passkey yang benar.');
      return;
    }

    if (!newPasskey.trim() || newPasskey.trim().length < 4) {
      setPasskeyError('Passkey baru minimal harus 4 karakter.');
      return;
    }

    if (newPasskey !== confirmPasskey) {
      setPasskeyError('Konfirmasi passkey baru tidak cocok.');
      return;
    }

    setIsSavingPasskey(true);
    try {
      if (onUpdatePasskey) {
        await onUpdatePasskey(newPasskey.trim());
      } else {
        await onSaveProfile({ accessPasskey: newPasskey.trim() });
      }
      setPasskeySuccess('Kode passkey keamanan berhasil diperbarui!');
      setCurrentPasskeyInput('');
      setNewPasskey('');
      setConfirmPasskey('');
      setTimeout(() => setPasskeySuccess(''), 4000);
    } catch (err: any) {
      setPasskeyError('Gagal memperbarui passkey: ' + (err?.message || 'Error'));
    } finally {
      setIsSavingPasskey(false);
    }
  };

  const handleClearDummy = async () => {
    if (
      confirm(
        'PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA DUMMY dari database?\n\nSemua data dummy guru, jadwal, presensi, surat pemanggilan, dan notifikasi akan dikosongkan secara permanen, menyisakan database bersih siap pakai.'
      )
    ) {
      setIsClearing(true);
      try {
        if (onClearDummyData) {
          await onClearDummyData();
          alert('Semua data dummy telah berhasil dihapus dari Firebase!');
        }
      } catch (err) {
        console.error(err);
        alert('Gagal membersihkan data dummy.');
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleReset = async () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengatur ulang data awal demo (Guru, Jadwal, Presensi, Surat Pemanggilan, dan Notifikasi WhatsApp)?'
      )
    ) {
      setIsResetting(true);
      try {
        await onResetSeedData();
        alert('Data demo berhasil dimuat ulang ke Firestore!');
      } catch (err) {
        console.error(err);
        alert('Gagal memuat ulang data.');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-700" />
            Pengaturan Identitas Sekolah & Kop Surat Resmi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi ini digunakan otomatis pada Kop Surat Pemanggilan, dokumen Laporan Bulanan, dan pesan notifikasi WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CloudCheck className="w-4 h-4 text-emerald-600" />
          <span>{isFirebaseConnected ? 'Firebase Terhubung' : 'Lokal / Offline Sync'}</span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan profil sekolah berhasil disimpan dan disinkronkan ke Firebase!</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-700" />
          Identitas Instansi Pendidikan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Resmi Sekolah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NPSN (Nomor Pokok Sekolah Nasional) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.npsn}
              onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tahun Ajaran & Semester <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder="2026/2027"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-semibold"
              />
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-semibold"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Alamat Lengkap Sekolah <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Provinsi</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Pos</label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / Fax</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Resmi</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Website</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        <h3 className="font-bold text-sm text-slate-900 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-700" />
          Pimpinan Sekolah (Penanda Tangan Surat Resmi)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Kepala Sekolah beserta Gelar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.principalName}
              onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP Kepala Sekolah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.principalNip}
              onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
          </button>
        </div>
      </form>

      {/* Passkey Security Management Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-700" />
              Pengaturan Kode Passkey Akses Aplikasi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Passkey ini digunakan untuk melindungi seluruh menu (Data Guru, Jadwal, Presensi, Surat, WhatsApp, Kurikulum, & Pengaturan).
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Keamanan Aktif
          </span>
        </div>

        {passkeySuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passkeySuccess}</span>
          </div>
        )}

        {passkeyError && (
          <div className="p-3.5 bg-red-50 border border-red-300 text-red-900 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passkeyError}</span>
          </div>
        )}

        <form onSubmit={handlePasskeySubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Passkey Saat Ini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasskeys ? 'text' : 'password'}
                  required
                  placeholder="Passkey lama (default: 123456)"
                  value={currentPasskeyInput}
                  onChange={(e) => setCurrentPasskeyInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Passkey Baru <span className="text-red-500">*</span>
              </label>
              <input
                type={showPasskeys ? 'text' : 'password'}
                required
                placeholder="Minimal 4 karakter"
                value={newPasskey}
                onChange={(e) => setNewPasskey(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Konfirmasi Passkey Baru <span className="text-red-500">*</span>
              </label>
              <input
                type={showPasskeys ? 'text' : 'password'}
                required
                placeholder="Ulangi passkey baru"
                value={confirmPasskey}
                onChange={(e) => setConfirmPasskey(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPasskeys(!showPasskeys)}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {showPasskeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasskeys ? 'Sembunyikan Karakter' : 'Perlihatkan Karakter Passkey'}</span>
            </button>

            <button
              type="submit"
              disabled={isSavingPasskey}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSavingPasskey ? 'Menyimpan Passkey...' : 'Perbarui Kode Passkey'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Maintenance & Clear Dummy Data Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-600" />
          Pemeliharaan Database & Pengosongan Data Dummy
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Sesuai arahan, aplikasi ini telah dibersihkan dari data dummy bawaan. Anda dapat mengosongkan kembali database sewaktu-waktu atau memuat ulang contoh demo jika dibutuhkan.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClearDummy}
            disabled={isClearing}
            className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
            <span>{isClearing ? 'Menghapus Data Dummy...' : 'Kosongkan Seluruh Data Dummy Sekarang'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Memuat Ulang...' : 'Muat Ulang Contoh Data Demo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
