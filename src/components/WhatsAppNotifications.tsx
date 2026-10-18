import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  Phone,
  RefreshCw,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  Teacher,
  NotificationLog,
  Schedule,
  SchoolProfile,
  TeacherAttendanceSummary,
  WarningLetter,
  NotificationType,
} from '../types';
import {
  createWhatsAppUrl,
  formatIndonesianDateTime,
  formatIndonesianDate,
} from '../utils/formatters';

interface WhatsAppNotificationsProps {
  teachers: Teacher[];
  schedules: Schedule[];
  summaries: TeacherAttendanceSummary[];
  warningLetters: WarningLetter[];
  schoolProfile: SchoolProfile;
  notifications: NotificationLog[];
  onLogNotification: (log: Partial<NotificationLog>) => Promise<void>;
  preselectedTeacher?: Teacher | null;
  preselectedType?: NotificationType;
}

export const WhatsAppNotifications: React.FC<WhatsAppNotificationsProps> = ({
  teachers,
  schedules,
  summaries,
  warningLetters,
  schoolProfile,
  notifications,
  onLogNotification,
  preselectedTeacher,
  preselectedType = 'warning_attendance',
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    preselectedTeacher ? preselectedTeacher.id : teachers[0]?.id || ''
  );
  const [templateType, setTemplateType] = useState<NotificationType>(preselectedType);
  const [customText, setCustomText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedSummary = summaries.find((s) => s.teacher.id === selectedTeacherId);
  const selectedLetter = warningLetters.find((l) => l.teacherId === selectedTeacherId);

  // Day of week today in Indonesian
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayDayName = dayNames[new Date().getDay()];
  const todayTeacherSchedules = schedules.filter(
    (s) => s.teacherId === selectedTeacherId && s.day === (todayDayName === 'Minggu' ? 'Senin' : todayDayName)
  );

  // Generate Message Content based on Template Type
  const generateMessage = (): string => {
    if (!selectedTeacher) return '';

    if (templateType === 'warning_attendance') {
      const rate = selectedSummary ? selectedSummary.attendancePercentage.toFixed(1) : '80.0';
      const alpa = selectedSummary ? selectedSummary.absent : 3;
      const letNum = selectedLetter ? selectedLetter.letterNumber : `421.3/086/${schoolProfile.schoolName.substring(0, 5)}/VIII/2026`;
      const meetingDate = selectedLetter ? formatIndonesianDate(selectedLetter.meetingDate) : 'Kamis, 20 Agustus 2026';
      const meetingTime = selectedLetter ? selectedLetter.meetingTime : '09:00';
      const meetingPlace = selectedLetter ? selectedLetter.meetingPlace : 'Ruang Kepala Sekolah';

      return `*PEMBERITAHUAN RESMI ${schoolProfile.schoolName.toUpperCase()}*\n\nYth. Bapak/Ibu *${selectedTeacher.name}*,\n\nBerdasarkan hasil rekapitulasi kehadiran guru pada periode berjalan, persentase presensi Anda tercatat *${rate}%* dengan *${alpa} hari Alpa/Tanpa Keterangan* (di bawah standar minimal 90%).\n\n📌 *Undangan Pemanggilan & Pembinaan Disiplin:*\n• No. Surat: ${letNum}\n• Hari/Tanggal: ${meetingDate}\n• Waktu: ${meetingTime} WIB\n• Tempat: ${meetingPlace}\n• Agenda: Klarifikasi Kehadiran & Evaluasi Disiplin Mengajar\n\nMohon hadir tepat waktu. Surat resmi tercetak telah diarsipkan di bagian Tata Usaha.\n\n_Hormat kami,_\n*${schoolProfile.principalName}*\nKepala ${schoolProfile.schoolName}`;
    }

    if (templateType === 'daily_schedule') {
      const scheduleList =
        todayTeacherSchedules.length > 0
          ? todayTeacherSchedules
              .map(
                (s, i) =>
                  `${i + 1}. *${s.subject}* (${s.classGrade})\n   ⏰ Jam ke ${s.periodStart}-${s.periodEnd} (${s.totalJp} JP) | 📍 ${s.room}`
              )
              .join('\n')
          : '• Tidak ada jadwal mengajar pada hari ini.';

      return `*PENGINGAT JADWAL MENGAJAR HARI INI*\n*${schoolProfile.schoolName.toUpperCase()}*\n\nSelamat pagi, Yth. Bapak/Ibu *${selectedTeacher.name}*.\nBerikut adalah jadwal mengajar Anda untuk hari ini (*${todayDayName === 'Minggu' ? 'Senin' : todayDayName}*):\n\n${scheduleList}\n\nMohon hadir tepat waktu di ruang kelas dan mengisi presensi harian pada sistem. Selamat beraktivitas dan mengajar!\n\n_Tim Kurikulum & SIM Presensi_`;
    }

    if (templateType === 'monthly_recap') {
      const rate = selectedSummary ? selectedSummary.attendancePercentage.toFixed(1) : '95.0';
      const hadir = selectedSummary ? selectedSummary.present : 14;
      const izin = selectedSummary ? selectedSummary.permit : 0;
      const sakit = selectedSummary ? selectedSummary.sick : 0;
      const alpa = selectedSummary ? selectedSummary.absent : 0;
      const totalJp = schedules.filter((s) => s.teacherId === selectedTeacher.id).reduce((a, b) => a + b.totalJp, 0);

      return `*LAPORAN REKAPITULASI BULANAN GURU*\n*${schoolProfile.schoolName.toUpperCase()}*\n\nYth. Bapak/Ibu *${selectedTeacher.name}*,\nBerikut kami sampaikan ringkasan kinerja dan presensi Anda untuk periode *Agustus 2026*:\n\n📊 *Statistik Kehadiran:*\n• Persentase Kehadiran: *${rate}%*\n• Total Hari Hadir: ${hadir} Hari\n• Izin: ${izin} | Sakit: ${sakit} | Alpa: ${alpa}\n• Beban Mengajar Terlaksana: *${totalJp} JP/Minggu*\n\nStatus: *${Number(rate) >= 90 ? '✅ MEMENUHI STANDAR KEDISIPLINAN' : '⚠️ PERLU PERBAIKAN DISIPLIN'}*\n\nTerima kasih atas dedikasi dan pengabdian Anda dalam mendidik siswa/i kita.\n\n_Manajemen SIM Guru & Presensi_`;
    }

    // General / Custom
    return customText || `Yth. Bapak/Ibu ${selectedTeacher.name},\n\n[Tuliskan pesan pengumuman kedinasan di sini]`;
  };

  const activeMessage = generateMessage();

  const handleSendWhatsApp = async () => {
    if (!selectedTeacher || !selectedTeacher.phone) {
      alert('Nomor telepon guru tidak valid.');
      return;
    }

    const url = createWhatsAppUrl(selectedTeacher.phone, activeMessage);

    // Save notification log to Firebase
    try {
      await onLogNotification({
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        phone: selectedTeacher.phone,
        type: templateType,
        message: activeMessage,
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to log notification', err);
    }

    // Open WhatsApp Web
    window.open(url, '_blank');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(activeMessage);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            Sistem Notifikasi Otomatis via WhatsApp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kirimkan surat pemanggilan kehadiran (&lt;90%), pengingat jadwal mengajar harian, dan laporan rekapitulasi bulanan langsung ke nomor WhatsApp guru.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: Composer & Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Konfigurasi Pesan WhatsApp
            </h3>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jenis Template Notifikasi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateType('warning_attendance')}
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                    templateType === 'warning_attendance'
                      ? 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-400'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Peringatan Kehadiran &lt; 90%</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('daily_schedule')}
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                    templateType === 'daily_schedule'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Pengingat Jadwal Hari Ini</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('monthly_recap')}
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                    templateType === 'monthly_recap'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rekapitulasi Bulanan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateType('general')}
                  className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                    templateType === 'general'
                      ? 'border-slate-800 bg-slate-100 text-slate-900 ring-2 ring-slate-400'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>Pesan Kustom / Umum</span>
                </button>
              </div>
            </div>

            {/* Select Teacher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Guru Penerima WhatsApp
              </label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-medium"
              >
                {teachers.map((t) => {
                  const sum = summaries.find((s) => s.teacher.id === t.id);
                  const isUnder = sum?.isUnderThreshold;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject} - {isUnder ? '⚠️ Kehadiran <90%' : 'Kehadiran Aman'}) - WA: {t.phone}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Target Phone number preview */}
            {selectedTeacher && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">
                    Nomor WhatsApp Tujuan: <strong className="font-mono text-emerald-700">{selectedTeacher.phone}</strong>
                  </span>
                </div>
                {selectedSummary && (
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      selectedSummary.isUnderThreshold
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Presensi: {selectedSummary.attendancePercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            )}

            {/* Custom Text Area if template is 'general' */}
            {templateType === 'general' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tulis Pesan Kustom
                </label>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Tuliskan pesan WhatsApp resmi untuk guru..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopied ? 'Tersalin!' : 'Salin Teks Pesan'}</span>
              </button>

              <button
                type="button"
                id="btn-send-whatsapp"
                onClick={handleSendWhatsApp}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Kirim via WhatsApp Web</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live WhatsApp Chat Bubble Preview (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#EFEAE2] rounded-2xl border border-slate-300 shadow-sm overflow-hidden p-4 sm:p-6 relative">
            {/* WhatsApp Header bar */}
            <div className="bg-[#075E54] -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 border border-emerald-400 flex items-center justify-center font-bold text-xs">
                  {selectedTeacher?.name ? selectedTeacher.name.charAt(0) : 'G'}
                </div>
                <div>
                  <h4 className="font-bold text-xs">{selectedTeacher?.name || 'Penerima WhatsApp'}</h4>
                  <p className="text-[10px] text-emerald-200">Online &bull; {selectedTeacher?.phone}</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-100 font-mono">
                SIM Presensi
              </span>
            </div>

            {/* Chat Bubble */}
            <div className="mt-6 flex justify-end">
              <div className="bg-[#DCF8C6] text-slate-800 p-3.5 rounded-2xl rounded-tr-xs shadow-xs max-w-md text-xs leading-relaxed whitespace-pre-wrap font-sans border border-[#c4e9aa]">
                {activeMessage}
                <div className="text-[10px] text-slate-400 text-right mt-1.5 flex items-center justify-end gap-1 font-mono">
                  <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-blue-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-[10px] text-slate-500 bg-white/70 px-3 py-1 rounded-full shadow-2xs">
                Format tebal (*teks*) dan baris baru otomatis disesuaikan untuk WhatsApp
              </span>
            </div>
          </div>

          {/* Quick Broadcast Info Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Otomatisasi Notifikasi:
            </h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Sistem secara otomatis mengolah data presensi real-time dan menyusun pesan resmi lengkap dengan nomor surat pemanggilan, rincian alpa, dan lokasi ruang Kepala Sekolah tanpa perlu mengetik manual.
            </p>
          </div>
        </div>
      </div>

      {/* Notification Logs History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Riwayat Pengiriman Pesan WhatsApp
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {notifications.length} Log Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Waktu Pengiriman</th>
                <th className="px-4 py-3">Nama Guru</th>
                <th className="px-4 py-3">No. WhatsApp</th>
                <th className="px-4 py-3">Tipe Notifikasi</th>
                <th className="px-4 py-3">Ringkasan Pesan</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    Belum ada log pengiriman WhatsApp yang tercatat.
                  </td>
                </tr>
              ) : (
                notifications.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                      {formatIndonesianDateTime(log.sentAt)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{log.teacherName}</td>
                    <td className="px-4 py-3 font-mono text-emerald-700">{log.phone}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                        {log.type === 'warning_attendance'
                          ? 'Peringatan <90%'
                          : log.type === 'daily_schedule'
                          ? 'Jadwal Harian'
                          : log.type === 'monthly_recap'
                          ? 'Rekap Bulanan'
                          : 'Pesan Umum'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-xs">
                      {log.message.replace(/\*/g, '').substring(0, 60)}...
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terkirim
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
