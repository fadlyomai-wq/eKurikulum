import React, { useState } from 'react';
import {
  FileWarning,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Clock,
  Building,
  User,
  MessageSquare,
  FileText,
  X,
  Send,
  Eye,
} from 'lucide-react';
import {
  WarningLetter,
  Teacher,
  SchoolProfile,
  TeacherAttendanceSummary,
  LetterType,
  LetterStatus,
} from '../types';
import {
  formatIndonesianDate,
  generateWarningLetterNumber,
  createWhatsAppUrl,
} from '../utils/formatters';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface WarningLetterGeneratorProps {
  warningLetters: WarningLetter[];
  teachers: Teacher[];
  summaries: TeacherAttendanceSummary[];
  schoolProfile: SchoolProfile;
  onSaveLetter: (letterData: Partial<WarningLetter>) => Promise<void>;
  onDeleteLetter: (id: string) => Promise<void>;
  onOpenWhatsAppModal: (teacher: Teacher, type: 'warning_attendance') => void;
  selectedLetterToPreview?: WarningLetter | null;
}

export const WarningLetterGenerator: React.FC<WarningLetterGeneratorProps> = ({
  warningLetters,
  teachers,
  summaries,
  schoolProfile,
  onSaveLetter,
  onDeleteLetter,
  onOpenWhatsAppModal,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<WarningLetter | null>(
    warningLetters.length > 0 ? warningLetters[0] : null
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState<WarningLetter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter teachers with attendance < 90%
  const criticalTeachers = summaries.filter((s) => s.isUnderThreshold && s.teacher.active);

  // Form State for new warning letter
  const [formData, setFormData] = useState({
    teacherId: '',
    letterType: 'Pemanggilan Klarifikasi' as LetterType,
    letterNumber: '',
    periodMonth: 'Agustus 2026',
    meetingDate: '2026-08-20',
    meetingTime: '09:00',
    meetingPlace: 'Ruang Kepala Sekolah (Lt. 2)',
    contentNotes: '',
  });

  const handleOpenCreateForTeacher = (teacher: Teacher, summary?: TeacherAttendanceSummary) => {
    const sum = summary || summaries.find((s) => s.teacher.id === teacher.id);
    const newSeq = warningLetters.length + 86;
    setFormData({
      teacherId: teacher.id,
      letterType: 'Pemanggilan Klarifikasi',
      letterNumber: generateWarningLetterNumber(newSeq),
      periodMonth: 'Agustus 2026',
      meetingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      meetingTime: '09:00',
      meetingPlace: 'Ruang Kepala Sekolah (Lt. 2)',
      contentNotes: sum
        ? `Tercatat persentase kehadiran ${sum.attendancePercentage.toFixed(1)}% dengan ${sum.absent} hari ketidakhadiran tanpa keterangan.`
        : '',
    });
    setIsCreateModalOpen(true);
  };

  const handleTeacherChange = (teacherId: string) => {
    const sum = summaries.find((s) => s.teacher.id === teacherId);
    setFormData((prev) => ({
      ...prev,
      teacherId,
      contentNotes: sum
        ? `Tercatat persentase kehadiran ${sum.attendancePercentage.toFixed(1)}% dengan ${sum.absent} hari ketidakhadiran tanpa keterangan.`
        : prev.contentNotes,
    }));
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId || !formData.letterNumber.trim() || !formData.meetingDate) {
      alert('Mohon lengkapi semua data wajib.');
      return;
    }

    const teacher = teachers.find((t) => t.id === formData.teacherId);
    const summary = summaries.find((s) => s.teacher.id === formData.teacherId);
    if (!teacher) return;

    setIsSubmitting(true);
    try {
      const newLetter: Partial<WarningLetter> = {
        letterNumber: formData.letterNumber,
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherNip: teacher.nip,
        attendanceRate: summary ? summary.attendancePercentage : 85.0,
        totalDays: summary ? summary.totalScheduledDays : 14,
        totalPresent: summary ? summary.present : 10,
        totalPermit: summary ? summary.permit : 0,
        totalSick: summary ? summary.sick : 0,
        totalAbsent: summary ? summary.absent : 3,
        periodMonth: formData.periodMonth,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
        meetingPlace: formData.meetingPlace,
        letterType: formData.letterType,
        status: 'Diterbitkan',
        issuedDate: new Date().toISOString().split('T')[0],
        contentNotes: formData.contentNotes,
      };

      await onSaveLetter(newLetter);
      setIsCreateModalOpen(false);
      alert('Surat Pemanggilan Resmi berhasil diterbitkan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menerbitkan surat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-red-600" />
            Surat Pemanggilan & Peringatan Disiplin Guru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generator surat pemanggilan resmi otomatis berstandar dinas untuk tenaga pendidik dengan kehadiran di bawah ambang batas 90%.
          </p>
        </div>

        <button
          onClick={() => {
            const firstCritical = criticalTeachers[0]?.teacher || teachers[0];
            if (firstCritical) handleOpenCreateForTeacher(firstCritical);
          }}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Pemanggilan Baru</span>
        </button>
      </div>

      {/* Critical Teachers Alert Card */}
      {criticalTeachers.length > 0 && (
        <div className="bg-red-50/80 border border-red-200 p-4 rounded-xl shadow-2xs print:hidden">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-red-200/60">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="font-bold text-xs text-red-950">
                Deteksi Guru Perlu Pemanggilan Segera (Kehadiran &lt; 90%)
              </h3>
            </div>
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
              {criticalTeachers.length} Guru
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalTeachers.map((item) => (
              <div
                key={item.teacher.id}
                className="bg-white p-3 rounded-lg border border-red-200 shadow-2xs flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900">{item.teacher.name}</span>
                    <span className="text-xs font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      {item.attendancePercentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">NIP. {item.teacher.nip}</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Alpa: <strong className="text-red-600">{item.absent} Hari</strong> &bull; Sakit: {item.sick} &bull; Izin: {item.permit}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenCreateForTeacher(item.teacher, item)}
                    className="flex-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Terbitkan Surat</span>
                  </button>
                  <button
                    onClick={() => onOpenWhatsAppModal(item.teacher, 'warning_attendance')}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                    title="Kirim Notifikasi WA"
                  >
                    <MessageSquare className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Preview & History Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col: List of Issued Letters (4 Cols) */}
        <div className="lg:col-span-4 space-y-3 print:hidden">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Arsip Surat Pemanggilan</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                {warningLetters.length} Surat
              </span>
            </h3>

            <div className="mt-3 space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {warningLetters.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  Belum ada surat pemanggilan yang diterbitkan.
                </p>
              ) : (
                warningLetters.map((letter) => {
                  const isSelected = selectedLetter?.id === letter.id;
                  return (
                    <div
                      key={letter.id}
                      onClick={() => setSelectedLetter(letter)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900">{letter.teacherName}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800">
                          {letter.attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{letter.letterNumber}</p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                        <span className="font-semibold text-indigo-700">{letter.letterType}</span>
                        <span>{formatIndonesianDate(letter.issuedDate)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Official Letter Preview with Formal School Kop Surat (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedLetter ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
              {/* Action Toolbar on Preview */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span className="text-xs font-bold text-slate-700">
                    Pratinjau Format Cetak Dokumen Resmi (A4)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const teacher = teachers.find((t) => t.id === selectedLetter.teacherId);
                      if (teacher) onOpenWhatsAppModal(teacher, 'warning_attendance');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Kirim via WA</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Surat (A4 / PDF)</span>
                  </button>

                  <button
                    onClick={() => setLetterToDelete(selectedLetter)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Surat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pure Paper Letter View (Printable) */}
              <div className="p-8 sm:p-12 font-serif text-slate-900 bg-white leading-relaxed text-sm max-w-4xl mx-auto print:p-0 print:m-0">
                {/* Official Kop Surat Header */}
                <div className="text-center pb-4 relative">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-800">
                    PEMERINTAH PROVINSI {schoolProfile.province ? schoolProfile.province.toUpperCase() : 'DKI JAKARTA'}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    DINAS PENDIDIKAN & KEBUDAYAAN
                  </div>
                  <div className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950 mt-0.5">
                    {schoolProfile.schoolName}
                  </div>
                  <div className="text-[11px] font-sans text-slate-600 mt-1 leading-tight">
                    {schoolProfile.address}, {schoolProfile.city} &bull; Telp: {schoolProfile.phone} &bull; NPSN: {schoolProfile.npsn}
                    <br />
                    Email: {schoolProfile.email} | Laman: {schoolProfile.website}
                  </div>

                  {/* Official Double Border Line Kop Surat */}
                  <div className="mt-3 border-t-2 border-slate-900"></div>
                  <div className="mt-0.5 border-t border-slate-900"></div>
                </div>

                {/* Letter Metadata (Date, Number, Recipient) */}
                <div className="mt-4 flex justify-between items-start text-xs font-sans">
                  <div className="space-y-1">
                    <div>
                      <strong>Nomor</strong> : {selectedLetter.letterNumber}
                    </div>
                    <div>
                      <strong>Sifat</strong> : Rahasia / Penting
                    </div>
                    <div>
                      <strong>Lampiran</strong> : 1 (satu) Berkas Rekap Presensi
                    </div>
                    <div>
                      <strong>Perihal</strong> : <u>{selectedLetter.letterType}</u>
                    </div>
                  </div>

                  <div className="text-right">
                    <div>{schoolProfile.city}, {formatIndonesianDate(selectedLetter.issuedDate)}</div>
                  </div>
                </div>

                {/* Recipient */}
                <div className="mt-6 text-xs font-sans">
                  <div>Kepada Yth.</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{selectedLetter.teacherName}</div>
                  <div>Guru Mata Pelajaran</div>
                  <div>NIP. {selectedLetter.teacherNip}</div>
                  <div>di Tempat</div>
                </div>

                {/* Body Paragraphs */}
                <div className="mt-6 space-y-3.5 text-justify text-xs sm:text-[13px] leading-relaxed">
                  <p>
                    Dengan hormat,
                  </p>
                  <p>
                    Sehubungan dengan hasil evaluasi dan rekapitulasi tingkat kehadiran serta pemenuhan jam pelajaran guru pada <strong>{selectedLetter.periodMonth}</strong>, bersama surat ini kami sampaikan bahwa tingkat kehadiran Saudara/i tercatat sebesar <strong className="text-red-900 underline">{selectedLetter.attendanceRate.toFixed(1)}%</strong>, di mana angka tersebut berada di bawah batas standar kedisiplinan dan kepatuhan kerja yang ditetapkan instansi (minimal 90%).
                  </p>

                  {/* Detailed Table in Letter */}
                  <div className="my-3 font-sans bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="text-xs font-bold text-slate-800 mb-1">Rincian Rekapitulasi Presensi:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>Total Hari Kerja: <strong>{selectedLetter.totalDays} Hari</strong></div>
                      <div>Hadir: <strong>{selectedLetter.totalPresent} Hari</strong></div>
                      <div>Izin/Sakit: <strong>{selectedLetter.totalPermit + selectedLetter.totalSick} Hari</strong></div>
                      <div>Tanpa Keterangan: <strong className="text-red-700 font-bold">{selectedLetter.totalAbsent} Hari (Alpa)</strong></div>
                    </div>
                    {selectedLetter.contentNotes && (
                      <div className="mt-2 text-[11px] text-slate-600 italic border-t border-slate-200 pt-1.5">
                        Catatan Evaluasi: {selectedLetter.contentNotes}
                      </div>
                    )}
                  </div>

                  <p>
                    Dalam rangka pembinaan disiplin pegawai, konfirmasi kendala kedinasan, dan evaluasi komitmen mengajar demi kelancaran proses belajar mengajar peserta didik, kami mengharap kehadiran Saudara/i untuk hadir pada:
                  </p>

                  {/* Meeting Details */}
                  <div className="pl-6 space-y-1 font-sans text-xs">
                    <div className="grid grid-cols-3 sm:grid-cols-4">
                      <span className="font-semibold">Hari / Tanggal</span>
                      <span className="col-span-2 sm:col-span-3">: {formatIndonesianDate(selectedLetter.meetingDate)}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4">
                      <span className="font-semibold">Waktu</span>
                      <span className="col-span-2 sm:col-span-3">: {selectedLetter.meetingTime} WIB s.d. Selesai</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4">
                      <span className="font-semibold">Tempat</span>
                      <span className="col-span-2 sm:col-span-3">: {selectedLetter.meetingPlace}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4">
                      <span className="font-semibold">Agenda</span>
                      <span className="col-span-2 sm:col-span-3 font-bold">: {selectedLetter.letterType} & Evaluasi Disiplin Mengajar</span>
                    </div>
                  </div>

                  <p>
                    Mengingat pentingnya agenda tersebut, dimohon hadir tepat waktu. Apabila berhalangan hadir karena alasan kedaruratan yang sah, wajib memberikan konfirmasi tertulis sebelumnya kepada pihak manajemen sekolah.
                  </p>

                  <p>
                    Demikian surat pemanggilan resmi ini kami sampaikan untuk menjadi perhatian dan dilaksanakan sebagaimana mestinya. Atas kerja sama yang baik, kami ucapkan terima kasih.
                  </p>
                </div>

                {/* Signature Block */}
                <div className="mt-8 pt-4 flex justify-end font-sans text-xs">
                  <div className="text-center w-64">
                    <div>Kepala Sekolah,</div>
                    <div className="mt-14 font-bold underline text-slate-900 text-sm">
                      {schoolProfile.principalName}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      NIP. {schoolProfile.principalNip}
                    </div>
                  </div>
                </div>

                {/* Tembusan */}
                <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-sans">
                  <strong>Tembusan:</strong>
                  <ol className="list-decimal list-inside mt-0.5 space-y-0.5">
                    <li>Kepala Dinas Pendidikan Provinsi {schoolProfile.province || 'DKI Jakarta'}</li>
                    <li>Pengawas Pembina Sekolah</li>
                    <li>Wakil Kepala Sekolah Bidang Kurikulum & SDM</li>
                    <li>Arsip Kepegawaian</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <FileWarning className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Pilih salah satu surat dari arsip di sebelah kiri untuk melihat pratinjau.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create Warning Letter */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-red-600" />
                Terbitkan Surat Pemanggilan / Peringatan
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guru yang Dipanggil <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => handleTeacherChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((t) => {
                    const sum = summaries.find((s) => s.teacher.id === t.id);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} (Kehadiran: {sum ? sum.attendancePercentage.toFixed(1) : '-'}%)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Surat
                  </label>
                  <select
                    value={formData.letterType}
                    onChange={(e) => setFormData({ ...formData, letterType: e.target.value as LetterType })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none bg-white"
                  >
                    <option value="Pemanggilan Klarifikasi">Pemanggilan Klarifikasi</option>
                    <option value="Surat Peringatan 1 (SP1)">Surat Peringatan 1 (SP-1)</option>
                    <option value="Surat Peringatan 2 (SP2)">Surat Peringatan 2 (SP-2)</option>
                    <option value="Teguran Tertulis">Teguran Tertulis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Surat Resmi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.letterNumber}
                    onChange={(e) => setFormData({ ...formData, letterNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pertemuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Waktu (WIB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Pertemuan
                </label>
                <input
                  type="text"
                  value={formData.meetingPlace}
                  onChange={(e) => setFormData({ ...formData, meetingPlace: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan / Alasan Khusus
                </label>
                <textarea
                  rows={2}
                  value={formData.contentNotes}
                  onChange={(e) => setFormData({ ...formData, contentNotes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Menerbitkan...' : 'Terbitkan Surat Resmi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!letterToDelete}
        onClose={() => setLetterToDelete(null)}
        onConfirm={async () => {
          if (!letterToDelete) return;
          setIsDeleting(true);
          try {
            await onDeleteLetter(letterToDelete.id);
            if (selectedLetter?.id === letterToDelete.id) {
              setSelectedLetter(null);
            }
            setLetterToDelete(null);
          } catch (err) {
            console.error(err);
          } finally {
            setIsDeleting(false);
          }
        }}
        title="Hapus Surat Pemanggilan"
        itemName={letterToDelete?.letterNumber}
        description={`Surat ${letterToDelete?.letterType || ''} untuk guru yang bersangkutan akan dihapus dari arsip resmi.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};
