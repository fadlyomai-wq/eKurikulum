import React from 'react';
import {
  BarChart3,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Users,
  Award,
  Calendar,
  Building,
} from 'lucide-react';
import {
  Teacher,
  Schedule,
  SchoolProfile,
  TeacherAttendanceSummary,
  WarningLetter,
} from '../types';
import { formatIndonesianDate } from '../utils/formatters';

interface MonthlyReportProps {
  teachers: Teacher[];
  schedules: Schedule[];
  summaries: TeacherAttendanceSummary[];
  warningLetters: WarningLetter[];
  schoolProfile: SchoolProfile;
}

export const MonthlyReport: React.FC<MonthlyReportProps> = ({
  teachers,
  schedules,
  summaries,
  warningLetters,
  schoolProfile,
}) => {
  const activeTeachers = teachers.filter((t) => t.active);
  const totalAssignedJp = schedules.reduce((acc, s) => acc + s.totalJp, 0);
  const totalTargetJp = activeTeachers.reduce((acc, t) => acc + t.targetJp, 0);

  const validSummaries = summaries.filter((s) => s.totalScheduledDays > 0);
  const averageAttendance =
    validSummaries.length > 0
      ? validSummaries.reduce((acc, s) => acc + s.attendancePercentage, 0) / validSummaries.length
      : 100;

  const criticalTeachers = summaries.filter((s) => s.isUnderThreshold && s.teacher.active);
  const compliantTeachers = summaries.filter((s) => !s.isUnderThreshold && s.teacher.active);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NIP',
      'Nama Guru',
      'Status Kepegawaian',
      'Mata Pelajaran',
      'Target JP',
      'JP Terjadwal',
      'Hari Kerja',
      'Hadir',
      'Izin/Sakit',
      'Alpa',
      'Persentase Kehadiran',
      'Status Kepatuhan Disiplin',
      'Status Tindak Lanjut Surat',
    ];

    const rows = summaries.map((s, i) => {
      const letter = warningLetters.find((l) => l.teacherId === s.teacher.id);
      return [
        i + 1,
        `'${s.teacher.nip}'`,
        `"${s.teacher.name}"`,
        s.teacher.employmentStatus,
        `"${s.teacher.subject}"`,
        s.teacher.targetJp,
        s.assignedJp,
        s.totalScheduledDays,
        s.present,
        s.permit + s.sick,
        s.absent,
        `${s.attendancePercentage.toFixed(1)}%`,
        s.isUnderThreshold ? 'Perlu Pembinaan (<90%)' : 'Memenuhi Standar',
        letter ? `Surat Terbit (${letter.letterNumber})` : '-',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Progres_Kinerja_Guru_Agustus_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-700" />
            Laporan Progres Bulanan Kinerja & Presensi Guru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen laporan resmi komprehensif untuk evaluasi Kepala Sekolah, Pengawas Pembina, dan Dinas Pendidikan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen Laporan (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Formal Monthly Report */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Sekolah */}
        <div className="text-center pb-4 border-b-2 border-slate-900">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-800 font-sans">
            PEMERINTAH PROVINSI {schoolProfile.province ? schoolProfile.province.toUpperCase() : 'DKI JAKARTA'}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </div>
          <div className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-950 font-serif mt-0.5">
            {schoolProfile.schoolName}
          </div>
          <div className="text-[11px] font-sans text-slate-600 mt-1 leading-tight">
            {schoolProfile.address}, {schoolProfile.city} &bull; Telp: {schoolProfile.phone} &bull; NPSN: {schoolProfile.npsn}
          </div>
        </div>

        {/* Title of the Report */}
        <div className="text-center my-6">
          <h3 className="text-base font-bold uppercase tracking-wide text-slate-950 underline font-sans">
            LAPORAN BULANAN KINERJA PRESENSI & DISTRIBUSI JP GURU
          </h3>
          <p className="text-xs font-sans text-slate-600 mt-1">
            Periode: <strong>Agustus 2026</strong> &bull; Tahun Ajaran: <strong>{schoolProfile.academicYear} ({schoolProfile.semester})</strong>
          </p>
        </div>

        {/* Executive Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 font-sans">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Tenaga Pendidik</span>
            <span className="text-xl font-bold text-slate-900">{activeTeachers.length} Orang</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[11px] text-slate-500 font-semibold block">Rata-rata Kehadiran</span>
            <span className={`text-xl font-bold ${averageAttendance >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {averageAttendance.toFixed(1)}%
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Beban Mengajar</span>
            <span className="text-xl font-bold text-indigo-700">{totalAssignedJp} JP / Mgg</span>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <span className="text-[11px] text-red-700 font-semibold block">Pembinaan Disiplin (&lt;90%)</span>
            <span className="text-xl font-bold text-red-600">{criticalTeachers.length} Guru</span>
          </div>
        </div>

        {/* Narrative Analysis */}
        <div className="text-xs font-sans text-slate-800 leading-relaxed space-y-2 mb-6">
          <p>
            <strong>I. Ringkasan Eksekutif & Ketercapaian Pembelajaran:</strong>
          </p>
          <p className="text-justify text-slate-700">
            Berdasarkan monitoring dan evaluasi terpadu pada SIM Guru & Presensi, tingkat kedisiplinan rata-rata tenaga pendidik pada bulan ini mencapai <strong>{averageAttendance.toFixed(1)}%</strong>. Total alokasi jam pelajaran yang telah terdistribusi pada rombongan belajar mencapai <strong>{totalAssignedJp} JP</strong> dari total target <strong>{totalTargetJp} JP</strong> ({((totalAssignedJp / (totalTargetJp || 1)) * 100).toFixed(0)}%). Sebanyak <strong>{compliantTeachers.length}</strong> guru memenuhi standar kedisiplinan (&ge;90%), sedangkan <strong>{criticalTeachers.length}</strong> guru tercatat di bawah standar kehadiran dan telah diterbitkan surat pemanggilan resmi untuk pembinaan internal.
          </p>
        </div>

        {/* Detailed Evaluation Table */}
        <div className="my-6 font-sans">
          <p className="text-xs font-bold text-slate-800 mb-2">
            II. Tabel Rekapitulasi Kinerja & Presensi Per Tenaga Pendidik:
          </p>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                <th className="p-2 border-r border-slate-300">Nama Guru & NIP</th>
                <th className="p-2 border-r border-slate-300">Mata Pelajaran</th>
                <th className="p-2 border-r border-slate-300 text-center">Status</th>
                <th className="p-2 border-r border-slate-300 text-center">JP / Target</th>
                <th className="p-2 border-r border-slate-300 text-center">H</th>
                <th className="p-2 border-r border-slate-300 text-center">I/S</th>
                <th className="p-2 border-r border-slate-300 text-center text-red-700">A</th>
                <th className="p-2 border-r border-slate-300 text-center">% Kehadiran</th>
                <th className="p-2 text-center">Status Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {summaries.map((item, idx) => {
                const isUnder = item.isUnderThreshold;
                const letter = warningLetters.find((l) => l.teacherId === item.teacher.id);

                return (
                  <tr key={item.teacher.id} className={isUnder ? 'bg-red-50/50 font-medium' : ''}>
                    <td className="p-2 border-r border-slate-200 text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{item.teacher.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">NIP. {item.teacher.nip}</div>
                    </td>
                    <td className="p-2 border-r border-slate-200">{item.teacher.subject}</td>
                    <td className="p-2 border-r border-slate-200 text-center text-[10px] font-semibold">
                      {item.teacher.employmentStatus}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">
                      {item.assignedJp} / {item.teacher.targetJp} JP
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-semibold text-emerald-700">
                      {item.present}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      {item.permit + item.sick}
                    </td>
                    <td className={`p-2 border-r border-slate-200 text-center font-bold ${item.absent > 0 ? 'text-red-700' : 'text-slate-400'}`}>
                      {item.absent}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-bold">
                      <span className={isUnder ? 'text-red-700 font-extrabold' : 'text-slate-800'}>
                        {item.attendancePercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-center text-[11px]">
                      {isUnder ? (
                        <span className="text-red-700 font-bold">
                          {letter ? `SP Terbit (${letter.letterType})` : 'Perlu Pemanggilan'}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">Memenuhi Standar</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Signature Blocks for Formal Submission */}
        <div className="mt-12 pt-6 grid grid-cols-2 text-xs font-sans">
          <div className="text-center">
            <div>Mengetahui,</div>
            <div>Pengawas Pembina Sekolah</div>
            <div className="mt-16 font-bold underline">Dra. Hj. Sri Wahyuni, M.Pd.</div>
            <div className="text-[10px] text-slate-500 font-mono">NIP. 19650310 199002 2 001</div>
          </div>

          <div className="text-center">
            <div>{schoolProfile.city}, {formatIndonesianDate(new Date().toISOString().split('T')[0])}</div>
            <div>Kepala {schoolProfile.schoolName}</div>
            <div className="mt-16 font-bold underline">{schoolProfile.principalName}</div>
            <div className="text-[10px] text-slate-500 font-mono">NIP. {schoolProfile.principalNip}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
