import React, { useState } from 'react';
import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  Download,
  Search,
  Clock,
  UserCheck,
  Filter,
} from 'lucide-react';
import {
  Teacher,
  AttendanceRecord,
  AttendanceStatus,
  TeacherAttendanceSummary,
} from '../types';
import { formatIndonesianDate } from '../utils/formatters';

interface AttendanceRecapProps {
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  summaries: TeacherAttendanceSummary[];
  onSaveDailyAttendance: (records: AttendanceRecord[]) => Promise<void>;
  onOpenLetterModal: (teacher: Teacher, summary: TeacherAttendanceSummary) => void;
  onOpenWhatsAppModal: (teacher: Teacher, type: 'warning_attendance' | 'monthly_recap') => void;
}

export const AttendanceRecap: React.FC<AttendanceRecapProps> = ({
  teachers,
  attendance,
  summaries,
  onSaveDailyAttendance,
  onOpenLetterModal,
  onOpenWhatsAppModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-17');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'good'>('all');
  const [isSaving, setIsSaving] = useState(false);

  // Daily attendance state for the selected date
  const activeTeachers = teachers.filter((t) => t.active);
  const [dailyForm, setDailyForm] = useState<{
    [teacherId: string]: {
      status: AttendanceStatus;
      checkInTime: string;
      checkOutTime: string;
      notes: string;
    };
  }>(() => {
    const initial: any = {};
    activeTeachers.forEach((t) => {
      const existing = attendance.find((a) => a.teacherId === t.id && a.date === selectedDate);
      initial[t.id] = {
        status: existing ? existing.status : 'Hadir',
        checkInTime: existing?.checkInTime || '06:50',
        checkOutTime: existing?.checkOutTime || '15:30',
        notes: existing?.notes || '',
      };
    });
    return initial;
  });

  // Handle date change for daily attendance
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const updated: any = {};
    activeTeachers.forEach((t) => {
      const existing = attendance.find((a) => a.teacherId === t.id && a.date === newDate);
      updated[t.id] = {
        status: existing ? existing.status : 'Hadir',
        checkInTime: existing?.checkInTime || '06:50',
        checkOutTime: existing?.checkOutTime || '15:30',
        notes: existing?.notes || '',
      };
    });
    setDailyForm(updated);
  };

  const handleSetStatus = (teacherId: string, status: AttendanceStatus) => {
    setDailyForm((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        status,
        checkInTime: status === 'Hadir' ? (prev[teacherId]?.checkInTime || '06:50') : '',
        checkOutTime: status === 'Hadir' ? (prev[teacherId]?.checkOutTime || '15:30') : '',
      },
    }));
  };

  const handleQuickSetAllPresent = () => {
    const updated: any = {};
    activeTeachers.forEach((t) => {
      updated[t.id] = {
        status: 'Hadir',
        checkInTime: '06:50',
        checkOutTime: '15:30',
        notes: 'Hadir tepat waktu',
      };
    });
    setDailyForm(updated);
  };

  const handleSaveDaily = async () => {
    setIsSaving(true);
    try {
      const recordsToSave: AttendanceRecord[] = activeTeachers.map((t) => {
        const item = dailyForm[t.id] || { status: 'Hadir', checkInTime: '06:50', checkOutTime: '15:30', notes: '' };
        return {
          id: `att-${t.id}-${selectedDate}`,
          teacherId: t.id,
          teacherName: t.name,
          date: selectedDate,
          status: item.status,
          checkInTime: item.checkInTime || undefined,
          checkOutTime: item.checkOutTime || undefined,
          notes: item.notes || undefined,
          createdAt: new Date().toISOString(),
        };
      });

      await onSaveDailyAttendance(recordsToSave);
      alert('Presensi harian berhasil disimpan ke database real-time!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan presensi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export CSV summary
  const handleExportCSV = () => {
    const headers = ['No', 'NIP', 'Nama Guru', 'Mata Pelajaran', 'Total Hari', 'Hadir', 'Izin', 'Sakit', 'Alpa', 'Dinas Luar', 'Persentase Kehadiran', 'Status'];
    const rows = summaries.map((s, idx) => [
      idx + 1,
      `'${s.teacher.nip}'`,
      `"${s.teacher.name}"`,
      `"${s.teacher.subject}"`,
      s.totalScheduledDays,
      s.present,
      s.permit,
      s.sick,
      s.absent,
      s.dinasLuar,
      `${s.attendancePercentage.toFixed(1)}%`,
      s.isUnderThreshold ? 'Kritis (<90%)' : 'Aman',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Kehadiran_Guru_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered summaries
  const filteredSummaries = summaries.filter((s) => {
    const matchesSearch =
      s.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.teacher.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'critical'
        ? s.isUnderThreshold
        : !s.isUnderThreshold;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-700" />
            Rekapitulasi & Presensi Kehadiran Guru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan absensi harian dan rekapitulasi persentase kehadiran bulanan dengan batas ambang disiplin 90%.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('monthly')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'monthly'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rekapitulasi Bulanan
          </button>
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeSubTab === 'daily'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Input Presensi Harian
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Monthly Recap */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Cari guru..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="critical">🔴 Kehadiran &lt; 90% (Perlu Pemanggilan)</option>
                  <option value="good">🟢 Kehadiran &ge; 90% (Disiplin)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Rekap CSV</span>
              </button>
            </div>
          </div>

          {/* Recap Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Tabel Evaluasi Kehadiran Guru Bulan Agustus 2026
                </h3>
                <p className="text-xs text-slate-500">
                  Formula: (Jumlah Hadir &divide; Total Hari Kerja) &times; 100%
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800">
                  &lt;90% = Pemanggilan
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  &ge;90% = Memenuhi Syarat
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="px-4 py-3">Nama Guru & NIP</th>
                    <th className="px-4 py-3">Mata Pelajaran</th>
                    <th className="px-3 py-3 text-center">Hari Kerja</th>
                    <th className="px-2.5 py-3 text-center text-emerald-700">Hadir (H)</th>
                    <th className="px-2.5 py-3 text-center text-blue-700">Izin (I)</th>
                    <th className="px-2.5 py-3 text-center text-amber-700">Sakit (S)</th>
                    <th className="px-2.5 py-3 text-center text-red-700 font-bold">Alpa (A)</th>
                    <th className="px-2.5 py-3 text-center text-slate-700">Dinas Luar</th>
                    <th className="px-4 py-3 text-center">% Kehadiran</th>
                    <th className="px-4 py-3 text-center">Status Disiplin</th>
                    <th className="px-4 py-3 text-right">Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSummaries.map((item) => {
                    const isUnder = item.isUnderThreshold;
                    return (
                      <tr
                        key={item.teacher.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isUnder ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.teacher.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NIP. {item.teacher.nip}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-800 font-medium">{item.teacher.subject}</span>
                          <span className="block text-[10px] text-slate-500">{item.teacher.employmentStatus}</span>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-slate-700">
                          {item.totalScheduledDays}
                        </td>
                        <td className="px-2.5 py-3 text-center font-extrabold text-emerald-700">
                          {item.present}
                        </td>
                        <td className="px-2.5 py-3 text-center text-blue-700">{item.permit}</td>
                        <td className="px-2.5 py-3 text-center text-amber-700">{item.sick}</td>
                        <td className={`px-2.5 py-3 text-center font-bold ${item.absent > 0 ? 'text-red-600 bg-red-100/50' : 'text-slate-400'}`}>
                          {item.absent}
                        </td>
                        <td className="px-2.5 py-3 text-center text-slate-600">{item.dinasLuar}</td>
                        <td className="px-4 py-3 text-center">
                          <div
                            className={`text-sm font-extrabold ${
                              isUnder
                                ? 'text-red-600'
                                : item.attendancePercentage >= 95
                                ? 'text-emerald-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {item.attendancePercentage.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isUnder ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              &lt; 90% (Kritis)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Memenuhi Syarat
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                          {isUnder && (
                            <button
                              onClick={() => onOpenLetterModal(item.teacher, item)}
                              className="px-2.5 py-1.5 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 transition-colors shadow-2xs inline-flex items-center gap-1"
                              title="Buat Surat Pemanggilan Resmi"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Surat Pemanggilan</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenWhatsAppModal(item.teacher, isUnder ? 'warning_attendance' : 'monthly_recap')}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs inline-flex items-center gap-1"
                            title="Kirim Laporan via WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Kirim WA</span>
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
      )}

      {/* Sub-Tab 2: Daily Attendance Input Matrix */}
      {activeSubTab === 'daily' && (
        <div className="space-y-6">
          {/* Date Selector & Bulk Actions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-700 shrink-0" />
              <div>
                <label className="block text-xs font-semibold text-slate-700">Tanggal Presensi</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="mt-1 px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 self-end pb-2">
                {formatIndonesianDate(selectedDate)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickSetAllPresent}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Set Semua Hadir</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDaily}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Presensi Harian'}</span>
              </button>
            </div>
          </div>

          {/* Daily Input Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Nama Guru</th>
                    <th className="px-4 py-3 text-center">Status Kehadiran</th>
                    <th className="px-4 py-3 text-center">Jam Masuk</th>
                    <th className="px-4 py-3 text-center">Jam Pulang</th>
                    <th className="px-4 py-3">Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTeachers.map((teacher) => {
                    const rowState = dailyForm[teacher.id] || {
                      status: 'Hadir',
                      checkInTime: '06:50',
                      checkOutTime: '15:30',
                      notes: '',
                    };

                    const statuses: AttendanceStatus[] = ['Hadir', 'Izin', 'Sakit', 'Alpa', 'Dinas Luar'];

                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{teacher.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {teacher.subject} &bull; NIP. {teacher.nip}
                          </div>
                        </td>

                        {/* Status Buttons */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {statuses.map((st) => {
                              const isSelected = rowState.status === st;
                              let btnClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                              if (isSelected) {
                                if (st === 'Hadir') btnClass = 'bg-emerald-600 text-white font-bold shadow-2xs';
                                else if (st === 'Izin') btnClass = 'bg-blue-600 text-white font-bold shadow-2xs';
                                else if (st === 'Sakit') btnClass = 'bg-amber-600 text-white font-bold shadow-2xs';
                                else if (st === 'Alpa') btnClass = 'bg-red-600 text-white font-bold shadow-2xs';
                                else if (st === 'Dinas Luar') btnClass = 'bg-purple-600 text-white font-bold shadow-2xs';
                              }

                              return (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleSetStatus(teacher.id, st)}
                                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all ${btnClass}`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Check-in time */}
                        <td className="px-4 py-3 text-center">
                          <input
                            type="time"
                            disabled={rowState.status !== 'Hadir'}
                            value={rowState.checkInTime}
                            onChange={(e) =>
                              setDailyForm((prev) => ({
                                ...prev,
                                [teacher.id]: { ...prev[teacher.id], checkInTime: e.target.value },
                              }))
                            }
                            className="text-xs px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 font-mono text-center"
                          />
                        </td>

                        {/* Check-out time */}
                        <td className="px-4 py-3 text-center">
                          <input
                            type="time"
                            disabled={rowState.status !== 'Hadir'}
                            value={rowState.checkOutTime}
                            onChange={(e) =>
                              setDailyForm((prev) => ({
                                ...prev,
                                [teacher.id]: { ...prev[teacher.id], checkOutTime: e.target.value },
                              }))
                            }
                            className="text-xs px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 font-mono text-center"
                          />
                        </td>

                        {/* Notes */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="Alasan / catatan..."
                            value={rowState.notes}
                            onChange={(e) =>
                              setDailyForm((prev) => ({
                                ...prev,
                                [teacher.id]: { ...prev[teacher.id], notes: e.target.value },
                              }))
                            }
                            className="w-full text-xs px-2.5 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={handleSaveDaily}
                disabled={isSaving}
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Presensi Hari Ini'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
