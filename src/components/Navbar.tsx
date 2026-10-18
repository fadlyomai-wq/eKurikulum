import React, { useState } from 'react';
import {
  Users,
  Calendar,
  ClipboardCheck,
  FileWarning,
  MessageSquare,
  BarChart3,
  Settings,
  LayoutDashboard,
  GraduationCap,
  CloudCheck,
  AlertTriangle,
  FolderKanban,
  FileSpreadsheet,
  Lock,
  Unlock,
  UserCheck,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Briefcase,
  CheckCircle2,
  FileCheck2,
} from 'lucide-react';
import { SchoolProfile, NavigationTab, AccessSession } from '../types';

export type ActiveTab = NavigationTab;

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab?: (tab: NavigationTab) => void;
  onTabChange?: (tab: NavigationTab) => void;
  schoolProfile: SchoolProfile;
  warningCount?: number;
  criticalCount?: number;
  isFirebaseConnected: boolean;
  accessSession: AccessSession;
  onRequestVerification: (targetTab: NavigationTab) => void;
  onLockSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  schoolProfile,
  warningCount,
  criticalCount,
  isFirebaseConnected,
  accessSession,
  onRequestVerification,
  onLockSession,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleTabChange = (tab: NavigationTab) => {
    setIsDrawerOpen(false);

    // Dashboard is always freely accessible without passkey
    if (tab === 'dashboard') {
      if (onTabChange) onTabChange(tab);
      else if (setActiveTab) setActiveTab(tab);
      return;
    }

    // Other menus require verified access session
    if (!accessSession.isVerified) {
      onRequestVerification(tab);
      return;
    }

    if (onTabChange) {
      onTabChange(tab);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const count = warningCount ?? criticalCount ?? 0;

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'curriculum_master' as NavigationTab, label: 'Dokumen Induk Kurikulum', icon: FolderKanban },
    { id: 'curriculum_plan' as NavigationTab, label: 'Perencanaan Kurikulum', icon: FileSpreadsheet },
    { id: 'teacher_admin' as NavigationTab, label: 'Administrasi Guru', icon: Briefcase },
    { id: 'academic_supervision' as NavigationTab, label: 'Supervisi Akademik', icon: ShieldCheck },
    { id: 'evaluation_monitoring' as NavigationTab, label: 'Evaluasi & Monitoring', icon: FileCheck2 },
    { id: 'teachers' as NavigationTab, label: 'Data Guru', icon: Users },
    { id: 'schedules' as NavigationTab, label: 'Jadwal & Distribusi JP', icon: Calendar },
    { id: 'attendance' as NavigationTab, label: 'Rekap Kehadiran', icon: ClipboardCheck },
    {
      id: 'letters' as NavigationTab,
      label: 'Surat Pemanggilan (<90%)',
      icon: FileWarning,
      badge: count > 0 ? count : undefined,
    },
    { id: 'whatsapp' as NavigationTab, label: 'Notifikasi WhatsApp', icon: MessageSquare },
    { id: 'report' as NavigationTab, label: 'Laporan Bulanan', icon: BarChart3 },
    { id: 'settings' as NavigationTab, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger Button (Mobile/Tablet) & School Identity */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-indigo-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-700 flex items-center justify-center text-white shadow-xs shrink-0">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-bold text-slate-900 leading-none tracking-tight truncate max-w-[180px] sm:max-w-[320px] md:max-w-md">
                    {schoolProfile.schoolName || 'SIM GURU & KURIKULUM'}
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    TP {schoolProfile.academicYear}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate hidden sm:block">
                  Sistem Manajemen Guru, Kurikulum, Supervisi & Presensi
                </p>
              </div>
            </div>

            {/* Right: Status & Access Verification */}
            <div className="flex items-center space-x-2">
              {/* Access Verification Indicator */}
              {accessSession.isVerified ? (
                <div className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="max-w-[80px] sm:max-w-[130px] truncate" title={accessSession.accessName}>
                    {accessSession.accessName}
                  </span>
                  <button
                    type="button"
                    onClick={onLockSession}
                    className="ml-0.5 text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                    title="Kunci Sesi / Keluar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onRequestVerification(activeTab === 'dashboard' ? 'teacher_admin' : activeTab)}
                  className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Klik untuk memverifikasi nama pengakses dan kode passkey"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xs:inline">Verifikasi Akses</span>
                  <span className="xs:hidden">Masuk</span>
                </button>
              )}

              {count > 0 && (
                <button
                  type="button"
                  onClick={() => handleTabChange('letters')}
                  className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Terdapat guru dengan kehadiran di bawah 90%"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>{count} Guru &lt;90%</span>
                </button>
              )}

              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <CloudCheck className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{isFirebaseConnected ? 'Cloud Sync' : 'Lokal'}</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile/tablet, accessible via drawer or horizontal scroll) */}
          <nav className="hidden lg:flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = item.id !== 'dashboard' && !accessSession.isVerified;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {isLocked && (
                    <Lock className={`w-3 h-3 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                  )}
                  {item.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Sidebar Drawer Geser Responsif (Mobile & Tablet) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Sliding Panel */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250 ease-out">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight truncate max-w-[180px]">
                    {schoolProfile.schoolName || 'SIM Sekolah'}
                  </h3>
                  <p className="text-[11px] text-slate-400">TP {schoolProfile.academicYear} &bull; {schoolProfile.semester}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Access Session Info in Drawer */}
            <div className="p-3 bg-slate-50 border-b border-slate-200">
              {accessSession.isVerified ? (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] text-slate-500 font-medium">Petugas Aktif</span>
                      <span className="block text-xs font-bold text-slate-800 truncate">
                        {accessSession.accessName}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onLockSession();
                      setIsDrawerOpen(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Kunci Akses"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onRequestVerification('curriculum_master');
                  }}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verifikasi Passkey Akses</span>
                </button>
              )}
            </div>

            {/* Navigation List Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                Daftar Menu Navigasi
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isLocked = item.id !== 'dashboard' && !accessSession.isVerified;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-indigo-700 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isLocked ? (
                        <Lock className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                      ) : (
                        item.id !== 'dashboard' && (
                          <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-200' : 'text-emerald-500'}`} />
                        )
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
              <p className="text-[11px] text-slate-500">
                &copy; {new Date().getFullYear()} {schoolProfile.schoolName || 'Sekolah'}
              </p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                {isFirebaseConnected ? 'Firebase Real-time Connected' : 'Mode Offline Siap'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
