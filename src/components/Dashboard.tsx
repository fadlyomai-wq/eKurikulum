import React, { useState } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  BookOpen,
  Activity,
  Search,
  Shield,
  Trash2,
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FolderKanban,
  FileSpreadsheet,
  Briefcase,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import {
  Teacher,
  Schedule,
  AttendanceRecord,
  SchoolProfile,
  TeacherAttendanceSummary,
  NavigationTab,
  ActivityLog,
  AccessSession,
} from '../types';
import { createWhatsAppUrl } from '../utils/formatters';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface DashboardProps {
  teachers: Teacher[];
  schedules: Schedule[];
  attendance: AttendanceRecord[];
  summaries: TeacherAttendanceSummary[];
  schoolProfile?: SchoolProfile;
  activityLogs?: ActivityLog[];
  setActiveTab?: (tab: NavigationTab) => void;
  onTabChange?: (tab: NavigationTab) => void;
  onOpenLetterModal: (teacher: Teacher, summary: TeacherAttendanceSummary) => void;
  onOpenWhatsAppModal: (teacher: Teacher, type: 'warning_attendance' | 'daily_schedule') => void;
  onClearLogs?: () => Promise<void>;
  accessSession?: AccessSession;
  onRequestVerification?: (targetTab: NavigationTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  teachers,
  schedules,
  attendance,
  summaries,
  activityLogs = [],
  setActiveTab,
  onTabChange,
  onOpenLetterModal,
  onOpenWhatsAppModal,
  onClearLogs,
  accessSession,
  onRequestVerification,
}) => {
  const [logSearch, setLogSearch] = useState('');
  const [logFilterCategory, setLogFilterCategory] = useState<string>('Semua');
  const [isClearingLogs, setIsClearingLogs] = useState(false);
  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = useState(false);

  const handleTabChange = (tab: NavigationTab) => {
    if (tab === 'dashboard') {
      if (onTabChange) onTabChange(tab);
      else if (setActiveTab) setActiveTab(tab);
      return;
    }

    if (accessSession && !accessSession.isVerified && onRequestVerification) {
      onRequestVerification(tab);
      return;
    }

    if (onTabChange) {
      onTabChange(tab);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  const handleProtectedLetterModal = (teacher: Teacher, summary: TeacherAttendanceSummary) => {
    if (accessSession && !accessSession.isVerified && onRequestVerification) {
      onRequestVerification('letters');
      return;
    }
    onOpenLetterModal(teacher, summary);
  };

  const handleProtectedWhatsAppModal = (teacher: Teacher, type: 'warning_attendance' | 'daily_schedule') => {
    if (accessSession && !accessSession.isVerified && onRequestVerification) {
      onRequestVerification('whatsapp');
      return;
    }
    onOpenWhatsAppModal(teacher, type);
  };

  const activeTeachers = teachers.filter((t) => t.active);
  const totalAssignedJp = schedules.reduce((acc, s) => acc + s.totalJp, 0);
  const totalTargetJp = activeTeachers.reduce((acc, t) => acc + t.targetJp, 0);

  // Critical teachers (<90% attendance)
  const criticalTeachers = summaries.filter((s) => s.isUnderThreshold && s.teacher.active);

  // Overall average attendance
  const validSummaries = summaries.filter((s) => s.totalScheduledDays > 0);
  const averageAttendance = validSummaries.length > 0
    ? validSummaries.reduce((acc, s) => acc + s.attendancePercentage, 0) / validSummaries.length
    : 100;

  // Day of week today in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[new Date().getDay()];
  const todaySchedules = schedules.filter((s) => s.day === (todayDayName === 'Minggu' ? 'Senin' : todayDayName));

  return (
    <div className="space-y-6">
      {/* Alert Banner for Low Attendance Teachers */}
      {criticalTeachers.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 sm:p-5 rounded-r-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg text-red-700 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-900">
                  Perhatian: {criticalTeachers.length} Guru Memiliki Kehadiran di Bawah 90%
                </h3>
                <p className="text-sm text-red-700 mt-0.5">
                  Sesuai ketentuan disiplin, guru dengan presensi di bawah batas 90% wajib diberikan surat pemanggilan klarifikasi dan pembinaan dinas.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {criticalTeachers.map((item) => (
                    <span
                      key={item.teacher.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-red-800 border border-red-200"
                    >
                      <span>{item.teacher.name}</span>
                      <span className="text-red-600 font-bold">({item.attendancePercentage.toFixed(1)}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                id="btn-goto-warning-letters"
                type="button"
                onClick={() => handleTabChange('letters')}
                className="px-3.5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Kelola Surat Pemanggilan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Guru */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Guru Aktif
            </span>
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900">{activeTeachers.length}</div>
            <span className="text-xs font-medium text-slate-500">
              {teachers.filter((t) => t.employmentStatus === 'PNS').length} PNS &bull;{' '}
              {teachers.filter((t) => t.employmentStatus === 'PPPK').length} PPPK
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-medium">
            <button type="button" onClick={() => handleTabChange('teachers')} className="hover:underline flex items-center gap-1 cursor-pointer">
              Lihat data guru <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Distribusi JP */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Beban JP Terdistribusi
            </span>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900">
              {totalAssignedJp} <span className="text-sm font-normal text-slate-500">/ {totalTargetJp} JP</span>
            </div>
            <span className="text-xs font-bold text-emerald-600">
              {totalTargetJp > 0 ? `${((totalAssignedJp / totalTargetJp) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-medium">
            <button type="button" onClick={() => handleTabChange('schedules')} className="hover:underline flex items-center gap-1 cursor-pointer">
              Atur jadwal & JP <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Rata-rata Kehadiran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rata-rata Kehadiran
            </span>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className={`text-3xl font-extrabold ${averageAttendance >= 90 ? 'text-slate-900' : 'text-amber-600'}`}>
              {averageAttendance.toFixed(1)}%
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800">
              Target &ge;90%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-medium">
            <button type="button" onClick={() => handleTabChange('attendance')} className="hover:underline flex items-center gap-1 cursor-pointer">
              Buka rekap presensi <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Status Peringatan (<90%) */}
        <div className={`p-5 rounded-xl border shadow-xs transition-all ${
          criticalTeachers.length > 0
            ? 'bg-red-50/60 border-red-200'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Disiplin Guru
            </span>
            <div className={`p-2.5 rounded-lg ${
              criticalTeachers.length > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-red-600">
              {criticalTeachers.length}{' '}
              <span className="text-sm font-medium text-slate-600">Guru &lt;90%</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {teachers.length - criticalTeachers.length} Guru Aman
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-red-700 font-medium">
            <button type="button" onClick={() => handleTabChange('letters')} className="hover:underline flex items-center gap-1 cursor-pointer">
              Terbitkan surat <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monitoring Kehadiran & Distribusi JP */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guru Performance & Attendance Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ringkasan Kinerja Presensi & Distribusi JP Guru
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluasi kehadiran dan beban jam pelajaran (Standar Sertifikasi 24 JP)
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTabChange('report')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                Lihat Laporan Lengkap <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Guru</th>
                    <th className="px-4 py-3">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-center">Beban JP</th>
                    <th className="px-4 py-3 text-center">Kehadiran</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {summaries.map((item) => {
                    const isUnder = item.isUnderThreshold;
                    const jpStatus =
                      item.assignedJp >= item.teacher.targetJp
                        ? 'Cukup'
                        : `Kurang (${item.teacher.targetJp - item.assignedJp} JP)`;

                    return (
                      <tr
                        key={item.teacher.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isUnder ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">{item.teacher.name}</div>
                          <div className="text-xs text-slate-500 font-mono">NIP. {item.teacher.nip}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-800">{item.teacher.subject}</span>
                          <span className="block text-xs text-slate-500 font-medium">
                            {item.teacher.employmentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-bold text-slate-900">
                            {item.assignedJp} / {item.teacher.targetJp} JP
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.assignedJp >= item.teacher.targetJp
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {jpStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div
                            className={`text-base font-extrabold ${
                              isUnder
                                ? 'text-red-600'
                                : item.attendancePercentage >= 95
                                ? 'text-emerald-600'
                                : 'text-amber-600'
                            }`}
                          >
                            {item.attendancePercentage.toFixed(1)}%
                          </div>
                          <div className="text-[11px] text-slate-500">
                            H:{item.present} | I:{item.permit} | S:{item.sick} |{' '}
                            <span className={item.absent > 0 ? 'text-red-600 font-bold' : ''}>
                              A:{item.absent}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isUnder ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              &lt; 90% (Kritis)
                            </span>
                          ) : item.attendancePercentage >= 95 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Sangat Baik
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Baik
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          {isUnder && (
                            <button
                              type="button"
                              onClick={() => handleProtectedLetterModal(item.teacher, item)}
                              className="px-2.5 py-1.5 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                              title="Buat Surat Pemanggilan Resmi"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Surat</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleProtectedWhatsAppModal(item.teacher, isUnder ? 'warning_attendance' : 'daily_schedule')}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                            title="Kirim Notifikasi WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WA</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Jadwal Mengajar Hari Ini & Quick WhatsApp Broadcast */}
        <div className="space-y-6">
          {/* Jadwal Hari Ini */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-700" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Jadwal Mengajar ({todayDayName === 'Minggu' ? 'Senin (Besok)' : todayDayName})
                </h4>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                {todaySchedules.length} Sesi
              </span>
            </div>

            <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {todaySchedules.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  Tidak ada jadwal mengajar pada hari ini.
                </p>
              ) : (
                todaySchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 text-xs">{sch.subject}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{sch.teacherName}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold text-[11px]">
                        {sch.classGrade}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Jam ke {sch.periodStart} - {sch.periodEnd} ({sch.totalJp} JP)
                      </span>
                      <span>{sch.room}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleTabChange('schedules')}
                className="w-full py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Buka Matriks Jadwal Lengkap</span>
              </button>
            </div>
          </div>

          {/* Quick Notification Launcher */}
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-xl p-5 text-white shadow-xs">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-sm">Pemberitahuan WhatsApp Otomatis</h4>
            </div>
            <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">
              Kirimkan pengingat jadwal harian, rekapitulasi kehadiran bulanan, atau surat pemanggilan resmi secara instan via WhatsApp Web.
            </p>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleTabChange('whatsapp')}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Buka Panel Notifikasi WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modul Kurikulum & Akademik Quick Access Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Dokumen Induk Kurikulum */}
        <div
          onClick={() => handleTabChange('curriculum_master')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl group-hover:bg-indigo-700 group-hover:text-white transition-colors">
              <FolderKanban className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-3">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
              Dokumen Induk Kurikulum
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              KOSP/KTSP, Kalender Akademik, Data Rombel, & Struktur Organisasi (PDF).
            </p>
          </div>
        </div>

        {/* 2. Perencanaan Kurikulum */}
        <div
          onClick={() => handleTabChange('curriculum_plan')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl group-hover:bg-blue-700 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-3">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
              Perencanaan Kurikulum
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Program Tahunan (Prota), Program Semester (Promes), & ATP Guru (PDF).
            </p>
          </div>
        </div>

        {/* 3. Administrasi Guru */}
        <div
          onClick={() => handleTabChange('teacher_admin')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-3">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
              Administrasi Guru
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              SK Pembagian Tugas Guru, Ekuivalensi Jam, & Jadwal Pelajaran Efektif (PDF).
            </p>
          </div>
        </div>

        {/* 4. Supervisi Akademik */}
        <div
          onClick={() => handleTabChange('academic_supervision')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-violet-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-violet-50 text-violet-700 rounded-xl group-hover:bg-violet-700 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-3">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-violet-700 transition-colors">
              Supervisi Akademik
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Program Tahunan, Instrumen Skor 1-4, Jadwal, Laporan PDF & Tindak Lanjut.
            </p>
          </div>
        </div>

        {/* 5. Evaluasi & Monitoring */}
        <div
          onClick={() => handleTabChange('evaluation_monitoring')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-3">
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">
              Evaluasi & Monitoring
            </h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              PTS, PAS, Rapat Evaluasi Kurikulum, & Laporan Mutu 8 SNP (Ekspor PDF).
            </p>
          </div>
        </div>
      </div>

      {/* Log Aktivitas Sistem Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Log Aktivitas Sistem & Pengakses
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mencatat riwayat verifikasi akses, unggah berkas kurikulum, supervisi, administrasi guru, presensi, surat pemanggilan, dan pengaturan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {onClearLogs && activityLogs.length > 0 && (
              <button
                type="button"
                disabled={isClearingLogs}
                onClick={() => setIsClearLogsModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border border-slate-200"
                title="Hapus riwayat log aktivitas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isClearingLogs ? 'Membersihkan...' : 'Bersihkan Log'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar for Logs */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari aktivitas, pengakses..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <select
              value={logFilterCategory}
              onChange={(e) => setLogFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-medium"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Keamanan">Keamanan / Akses</option>
              <option value="Kurikulum Induk">Kurikulum Induk</option>
              <option value="Perencanaan Kurikulum">Perencanaan Kurikulum</option>
              <option value="Data Guru">Data Guru</option>
              <option value="Jadwal & JP">Jadwal & JP</option>
              <option value="Presensi">Presensi</option>
              <option value="Surat Pemanggilan">Surat Pemanggilan</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Pengaturan">Pengaturan</option>
            </select>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              Total: <strong>{activityLogs.length}</strong> catatan
            </span>
          </div>
        </div>

        {/* Log Entries Table */}
        {(() => {
          const filteredLogs = activityLogs.filter((log) => {
            const matchesSearch =
              log.description.toLowerCase().includes(logSearch.toLowerCase()) ||
              log.actorName.toLowerCase().includes(logSearch.toLowerCase()) ||
              (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase()));
            const matchesCategory =
              logFilterCategory === 'Semua' || log.actionType === logFilterCategory;
            return matchesSearch && matchesCategory;
          });

          const getBadgeClass = (actionType: string) => {
            switch (actionType) {
              case 'Keamanan':
                return 'bg-purple-50 text-purple-700 border-purple-200';
              case 'Kurikulum Induk':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
              case 'Perencanaan Kurikulum':
                return 'bg-blue-50 text-blue-700 border-blue-200';
              case 'Data Guru':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
              case 'Jadwal & JP':
                return 'bg-amber-50 text-amber-700 border-amber-200';
              case 'Presensi':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
              case 'Surat Pemanggilan':
                return 'bg-rose-50 text-rose-700 border-rose-200';
              case 'WhatsApp':
                return 'bg-green-50 text-green-700 border-green-200';
              case 'Pengaturan':
                return 'bg-slate-100 text-slate-700 border-slate-200';
              default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
            }
          };

          if (filteredLogs.length === 0) {
            return (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <div className="max-w-sm mx-auto">
                  <h4 className="text-sm font-bold text-slate-800">
                    {activityLogs.length === 0 ? 'Belum Ada Log Aktivitas' : 'Tidak Ditemukan Aktivitas'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {activityLogs.length === 0
                      ? 'Semua tindakan di aplikasi (verifikasi pengakses, unggah dokumen, input data guru, presensi, surat) akan otomatis tercatat di sini.'
                      : 'Tidak ada catatan log yang cocok dengan filter pencarian.'}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-4">Waktu</th>
                    <th className="py-2.5 px-4">Pengakses</th>
                    <th className="py-2.5 px-4">Kategori</th>
                    <th className="py-2.5 px-4">Aktivitas & Rincian</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredLogs.map((log) => {
                    const dateObj = new Date(log.timestamp);
                    const formattedTime = !isNaN(dateObj.getTime())
                      ? dateObj.toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : log.timestamp;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                          {formattedTime}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            {log.actorName}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeClass(
                              log.actionType
                            )}`}
                          >
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-medium text-slate-800 block">
                            {log.description}
                          </span>
                          {log.details && (
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {log.details}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          {log.status === 'Sukses' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sukses
                            </span>
                          ) : log.status === 'Gagal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              <XCircle className="w-3 h-3 text-rose-600" /> Gagal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <AlertCircle className="w-3 h-3 text-amber-600" /> Peringatan
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

      {/* Confirmation Modal for Clearing Activity Logs */}
      <ConfirmDeleteModal
        isOpen={isClearLogsModalOpen}
        onClose={() => setIsClearLogsModalOpen(false)}
        onConfirm={async () => {
          if (!onClearLogs) return;
          setIsClearingLogs(true);
          try {
            await onClearLogs();
            setIsClearLogsModalOpen(false);
          } catch (err) {
            console.error(err);
          } finally {
            setIsClearingLogs(false);
          }
        }}
        title="Bersihkan Seluruh Log Aktivitas"
        itemName={`${activityLogs.length} Entri Log Tercatat`}
        description="Semua catatan riwayat aktivitas, verifikasi pengakses, dan audit trail akan dikosongkan secara permanen."
        isDeleting={isClearingLogs}
      />
    </div>
  );
};
