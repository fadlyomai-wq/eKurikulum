import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  Upload,
  Download,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Sparkles,
  BookOpen,
  Users2,
  Award,
  Layers,
  ArrowRight,
  X,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import {
  EvaluationMonitoringSubmenu,
  MidSemesterEvaluation,
  FinalSemesterEvaluation,
  AcademicEvaluationMeeting,
  QualityImprovementReport,
  QualityStandardAchievement,
  SchoolProfile,
} from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface EvaluationMonitoringManagementProps {
  schoolProfile: SchoolProfile;
  currentActorName?: string;
  midSemesterEvals: MidSemesterEvaluation[];
  finalSemesterEvals: FinalSemesterEvaluation[];
  academicMeetings: AcademicEvaluationMeeting[];
  qualityReports: QualityImprovementReport[];
  onSaveMidSemester: (data: Omit<MidSemesterEvaluation, 'id'>, id?: string) => Promise<void>;
  onDeleteMidSemester: (id: string, title: string) => Promise<void>;
  onSaveFinalSemester: (data: Omit<FinalSemesterEvaluation, 'id'>, id?: string) => Promise<void>;
  onDeleteFinalSemester: (id: string, title: string) => Promise<void>;
  onSaveAcademicMeeting: (data: Omit<AcademicEvaluationMeeting, 'id'>, id?: string) => Promise<void>;
  onDeleteAcademicMeeting: (id: string, title: string) => Promise<void>;
  onSaveQualityReport: (data: Omit<QualityImprovementReport, 'id'>, id?: string) => Promise<void>;
  onDeleteQualityReport: (id: string, title: string) => Promise<void>;
  onLogDownload?: (title: string, submenu: string) => void;
}

const DEFAULT_SNP_STANDARDS: QualityStandardAchievement = {
  standarKompetensiLulusan: true,
  standarIsi: true,
  standarProses: true,
  standarPenilaian: true,
  standarTendik: false,
  standarSarpras: true,
  standarPengelolaan: true,
  standarPembiayaan: true,
};

export const EvaluationMonitoringManagement: React.FC<EvaluationMonitoringManagementProps> = ({
  schoolProfile,
  currentActorName = 'Administrator',
  midSemesterEvals,
  finalSemesterEvals,
  academicMeetings,
  qualityReports,
  onSaveMidSemester,
  onDeleteMidSemester,
  onSaveFinalSemester,
  onDeleteFinalSemester,
  onSaveAcademicMeeting,
  onDeleteAcademicMeeting,
  onSaveQualityReport,
  onDeleteQualityReport,
  onLogDownload,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<EvaluationMonitoringSubmenu>('evaluasi_tengah_semester');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState<string>('Semua');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [previewType, setPreviewType] = useState<EvaluationMonitoringSubmenu>('evaluasi_tengah_semester');

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: EvaluationMonitoringSubmenu;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Mid & Final Semester
  const [formSemesterEval, setFormSemesterEval] = useState<{
    id?: string;
    title: string;
    academicYear: string;
    semester: 'Ganjil' | 'Genap';
    fieldFindings: string;
    evaluation: string;
    solutionFeedback: string;
    notes: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileData?: string;
  }>({
    title: '',
    academicYear: schoolProfile.academicYear || '2026/2027',
    semester: schoolProfile.semester || 'Ganjil',
    fieldFindings: '',
    evaluation: '',
    solutionFeedback: '',
    notes: '',
  });

  // Form State for Meeting
  const [formMeeting, setFormMeeting] = useState<{
    id?: string;
    title: string;
    meetingDate: string;
    academicYear: string;
    semester: 'Ganjil' | 'Genap';
    curriculumReview: string;
    meetingMinutes: string;
    newSemesterPrep: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    fileData?: string;
  }>({
    title: '',
    meetingDate: new Date().toISOString().split('T')[0],
    academicYear: schoolProfile.academicYear || '2026/2027',
    semester: schoolProfile.semester || 'Ganjil',
    curriculumReview: '',
    meetingMinutes: '',
    newSemesterPrep: '',
  });

  // Form State for Quality Report
  const [formQuality, setFormQuality] = useState<{
    id?: string;
    title: string;
    academicYear: string;
    semester: 'Ganjil' | 'Genap';
    background: string;
    raportPendidikanResult: string;
    standards: QualityStandardAchievement;
    generalNotes: string;
  }>({
    title: '',
    academicYear: schoolProfile.academicYear || '2026/2027',
    semester: schoolProfile.semester || 'Ganjil',
    background: '',
    raportPendidikanResult: '',
    standards: { ...DEFAULT_SNP_STANDARDS },
    generalNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  // Handle PDF file selection
  const handlePdfUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'semester' | 'meeting'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('Berkas harus dalam format PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Ukuran berkas PDF maksimal 5MB.');
      return;
    }

    setFileError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'semester') {
        setFormSemesterEval((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: file.size,
          fileType: 'application/pdf',
          fileData: result,
        }));
      } else {
        setFormMeeting((prev) => ({
          ...prev,
          fileName: file.name,
          fileSize: file.size,
          fileType: 'application/pdf',
          fileData: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Open Form to Add
  const handleOpenAddForm = () => {
    setFileError('');
    if (activeSubmenu === 'evaluasi_tengah_semester' || activeSubmenu === 'evaluasi_akhir_semester') {
      const typeLabel = activeSubmenu === 'evaluasi_tengah_semester' ? 'Tengah Semester (PTS/STS)' : 'Akhir Semester (PAS/SAS)';
      setFormSemesterEval({
        title: `Evaluasi ${typeLabel} - ${schoolProfile.semester} ${schoolProfile.academicYear}`,
        academicYear: schoolProfile.academicYear || '2026/2027',
        semester: schoolProfile.semester || 'Ganjil',
        fieldFindings: '',
        evaluation: '',
        solutionFeedback: '',
        notes: '',
        fileName: undefined,
        fileSize: undefined,
        fileType: undefined,
        fileData: undefined,
      });
    } else if (activeSubmenu === 'rapat_evaluasi') {
      setFormMeeting({
        title: `Rapat Evaluasi Akademik & Pembelajaran - ${schoolProfile.semester} ${schoolProfile.academicYear}`,
        meetingDate: new Date().toISOString().split('T')[0],
        academicYear: schoolProfile.academicYear || '2026/2027',
        semester: schoolProfile.semester || 'Ganjil',
        curriculumReview: '',
        meetingMinutes: '',
        newSemesterPrep: '',
        fileName: undefined,
        fileSize: undefined,
        fileType: undefined,
        fileData: undefined,
      });
    } else {
      setFormQuality({
        title: `Laporan Peningkatan Mutu & Raport Pendidikan TA ${schoolProfile.academicYear || '2026/2027'}`,
        academicYear: schoolProfile.academicYear || '2026/2027',
        semester: schoolProfile.semester || 'Ganjil',
        background: '',
        raportPendidikanResult: '',
        standards: { ...DEFAULT_SNP_STANDARDS },
        generalNotes: '',
      });
    }
    setIsFormModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeSubmenu === 'evaluasi_tengah_semester') {
        await onSaveMidSemester(
          {
            title: formSemesterEval.title,
            academicYear: formSemesterEval.academicYear,
            semester: formSemesterEval.semester,
            fieldFindings: formSemesterEval.fieldFindings,
            evaluation: formSemesterEval.evaluation,
            solutionFeedback: formSemesterEval.solutionFeedback,
            notes: formSemesterEval.notes,
            fileName: formSemesterEval.fileName,
            fileSize: formSemesterEval.fileSize,
            fileType: formSemesterEval.fileType,
            fileData: formSemesterEval.fileData,
            createdBy: currentActorName,
            createdAt: new Date().toISOString(),
          },
          formSemesterEval.id
        );
      } else if (activeSubmenu === 'evaluasi_akhir_semester') {
        await onSaveFinalSemester(
          {
            title: formSemesterEval.title,
            academicYear: formSemesterEval.academicYear,
            semester: formSemesterEval.semester,
            fieldFindings: formSemesterEval.fieldFindings,
            evaluation: formSemesterEval.evaluation,
            solutionFeedback: formSemesterEval.solutionFeedback,
            notes: formSemesterEval.notes,
            fileName: formSemesterEval.fileName,
            fileSize: formSemesterEval.fileSize,
            fileType: formSemesterEval.fileType,
            fileData: formSemesterEval.fileData,
            createdBy: currentActorName,
            createdAt: new Date().toISOString(),
          },
          formSemesterEval.id
        );
      } else if (activeSubmenu === 'rapat_evaluasi') {
        await onSaveAcademicMeeting(
          {
            title: formMeeting.title,
            meetingDate: formMeeting.meetingDate,
            academicYear: formMeeting.academicYear,
            semester: formMeeting.semester,
            curriculumReview: formMeeting.curriculumReview,
            meetingMinutes: formMeeting.meetingMinutes,
            newSemesterPrep: formMeeting.newSemesterPrep,
            fileName: formMeeting.fileName,
            fileSize: formMeeting.fileSize,
            fileType: formMeeting.fileType,
            fileData: formMeeting.fileData,
            createdBy: currentActorName,
            createdAt: new Date().toISOString(),
          },
          formMeeting.id
        );
      } else {
        await onSaveQualityReport(
          {
            title: formQuality.title,
            academicYear: formQuality.academicYear,
            semester: formQuality.semester,
            background: formQuality.background,
            raportPendidikanResult: formQuality.raportPendidikanResult,
            standards: formQuality.standards,
            generalNotes: formQuality.generalNotes,
            createdBy: currentActorName,
            createdAt: new Date().toISOString(),
          },
          formQuality.id
        );
      }
      setIsFormModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Gagal menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger file download
  const handleDownloadFile = (fileName?: string, fileData?: string, fallbackTitle?: string) => {
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName || 'berkas-evaluasi.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onLogDownload?.(fileName || fallbackTitle || 'Dokumen PDF', activeSubmenu);
      return;
    }

    // Fallback: create downloadable text representation as PDF/Text
    const content = `DOKUMEN EVALUASI & MONITORING\n${schoolProfile.schoolName}\n\nJudul: ${fallbackTitle || 'Evaluasi'}\nTanggal: ${new Date().toLocaleDateString('id-ID')}\nBerkas: ${fileName || 'lampiran.pdf'}`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `${(fallbackTitle || 'dokumen').replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onLogDownload?.(fileName || fallbackTitle || 'Dokumen PDF', activeSubmenu);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'evaluasi_tengah_semester') {
        await onDeleteMidSemester(deleteTarget.id, deleteTarget.title);
      } else if (deleteTarget.type === 'evaluasi_akhir_semester') {
        await onDeleteFinalSemester(deleteTarget.id, deleteTarget.title);
      } else if (deleteTarget.type === 'rapat_evaluasi') {
        await onDeleteAcademicMeeting(deleteTarget.id, deleteTarget.title);
      } else {
        await onDeleteQualityReport(deleteTarget.id, deleteTarget.title);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Print / Export to PDF for Quality Report
  const handleExportQualityPdf = (report: QualityImprovementReport) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const standardsList = [
      { key: 'standarKompetensiLulusan', num: '1', name: 'Standar Kompetensi Lulusan' },
      { key: 'standarIsi', num: '2', name: 'Standar Isi' },
      { key: 'standarProses', num: '3', name: 'Standar Proses' },
      { key: 'standarPenilaian', num: '4', name: 'Standar Penilaian Pendidikan' },
      { key: 'standarTendik', num: '5', name: 'Standar Tenaga Kependidikan' },
      { key: 'standarSarpras', num: '6', name: 'Standar Sarana & Prasarana' },
      { key: 'standarPengelolaan', num: '7', name: 'Standar Pengelolaan' },
      { key: 'standarPembiayaan', num: '8', name: 'Standar Pembiayaan' },
    ];

    const achievedCount = standardsList.filter((s) => (report.standards as any)[s.key]).length;
    const percentage = ((achievedCount / 8) * 100).toFixed(1);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Peningkatan Mutu - ${report.title}</title>
        <style>
          @page { size: A4; margin: 18mm 18mm 18mm 18mm; }
          body { font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.5; font-size: 11pt; }
          .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 18px; }
          .header h2 { margin: 0; font-size: 15pt; text-transform: uppercase; font-weight: bold; }
          .header h3 { margin: 4px 0 0 0; font-size: 13pt; text-transform: uppercase; }
          .header p { margin: 3px 0 0 0; font-size: 9.5pt; font-family: Arial, sans-serif; }
          .title-section { text-align: center; margin: 16px 0; }
          .title-section h4 { margin: 0; font-size: 12.5pt; text-decoration: underline; text-transform: uppercase; }
          .title-section p { margin: 4px 0 0 0; font-size: 10pt; }
          .section-title { font-weight: bold; font-size: 11pt; margin-top: 14px; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
          .content-box { margin-bottom: 12px; font-size: 10.5pt; text-align: justify; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 12px; font-size: 10pt; }
          th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
          .badge-achieved { color: #047857; font-weight: bold; }
          .badge-not-yet { color: #b91c1c; font-style: italic; }
          .summary-card { background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; margin: 10px 0; border-radius: 4px; font-family: Arial, sans-serif; font-size: 10pt; }
          .signatures { margin-top: 36px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; text-align: center; }
          .signature-space { height: 65px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PEMERINTAH DAERAH PROVINSI / KABUPATEN</h2>
          <h3>DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
          <h2>${schoolProfile.schoolName}</h2>
          <p>NPSN: ${schoolProfile.npsn} &bull; ${schoolProfile.address}, ${schoolProfile.city}, ${schoolProfile.province}</p>
          <p>Telp: ${schoolProfile.phone} &bull; Email: ${schoolProfile.email} &bull; Website: ${schoolProfile.website}</p>
        </div>

        <div class="title-section">
          <h4>LAPORAN PENINGKATAN MUTU DAN CAPAIAN SNP</h4>
          <p>Tahun Ajaran: ${report.academicYear} &bull; Semester: ${report.semester}</p>
        </div>

        <div class="section-title">I. Latar Belakang & Identitas Laporan</div>
        <div class="content-box">
          <p><strong>Judul Laporan:</strong> ${report.title}</p>
          <p style="white-space: pre-wrap;">${report.background || 'Laporan peningkatan mutu ini disusun sebagai instrumen refleksi dan evaluasi berkala pelaksanaan pembelajaran, tata kelola, dan mutu lulusan di satuan pendidikan.'}</p>
        </div>

        <div class="section-title">II. Profil dan Hasil Rapor Pendidikan</div>
        <div class="content-box">
          <p style="white-space: pre-wrap;">${report.raportPendidikanResult || 'Berdasarkan analisis indikator prioritas Rapor Pendidikan Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi, kemampuan literasi, numerasi, dan karakter peserta didik menunjukkan tren positif dengan penguatan supervisi akademik.'}</p>
        </div>

        <div class="section-title">III. Ketercapaian 8 Standar Nasional Pendidikan (SNP)</div>
        <div class="summary-card">
          <strong>Ringkasan Ketercapaian Mutu:</strong> Terpenuhi ${achievedCount} dari 8 Standar Nasional Pendidikan (${percentage}%)
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">No</th>
              <th>Indikator Standar Nasional Pendidikan</th>
              <th style="width: 140px; text-align: center;">Status Ketercapaian</th>
              <th style="width: 120px; text-align: center;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${standardsList
              .map((std) => {
                const isChecked = (report.standards as any)[std.key];
                return `
                <tr>
                  <td style="text-align: center;">${std.num}</td>
                  <td><strong>${std.name}</strong></td>
                  <td style="text-align: center;">
                    <span class="${isChecked ? 'badge-achieved' : 'badge-not-yet'}">
                      ${isChecked ? '✓ TERCAPAI' : '✗ BELUM TERCAPAI'}
                    </span>
                  </td>
                  <td style="text-align: center; font-size: 9pt;">
                    ${isChecked ? 'Memenuhi Standar' : 'Perlu Intervensi'}
                  </td>
                </tr>
              `;
              })
              .join('')}
          </tbody>
        </table>

        ${
          report.generalNotes
            ? `
          <div class="section-title">IV. Catatan Rekomendasi & Tindak Lanjut</div>
          <div class="content-box">
            <p style="white-space: pre-wrap;">${report.generalNotes}</p>
          </div>
        `
            : ''
        }

        <div class="signatures">
          <div class="signature-box">
            <p>Mengetahui / Disetujui,<br>Pengawas Pembina Sekolah</p>
            <div class="signature-space"></div>
            <p><strong>(......................................................)</strong><br>NIP. .................................................</p>
          </div>
          <div class="signature-box">
            <p>${schoolProfile.city}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Kepala Sekolah,</p>
            <div class="signature-space"></div>
            <p><strong>${schoolProfile.principalName}</strong><br>NIP. ${schoolProfile.principalNip}</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Filtered Lists
  const filteredMid = midSemesterEvals.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fieldFindings.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evaluation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem = filterSemester === 'Semua' || item.semester === filterSemester;
    return matchesSearch && matchesSem;
  });

  const filteredFinal = finalSemesterEvals.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fieldFindings.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evaluation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem = filterSemester === 'Semua' || item.semester === filterSemester;
    return matchesSearch && matchesSem;
  });

  const filteredMeetings = academicMeetings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.curriculumReview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meetingMinutes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem = filterSemester === 'Semua' || item.semester === filterSemester;
    return matchesSearch && matchesSem;
  });

  const filteredQuality = qualityReports.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.background.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.raportPendidikanResult.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSem = filterSemester === 'Semua' || item.semester === filterSemester;
    return matchesSearch && matchesSem;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileCheck2 className="w-4 h-4" />
              <span>Siklus Penjaminan Mutu & Refleksi Pembelajaran</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Evaluasi & Monitoring Akademik
            </h1>
            <p className="text-emerald-100/80 text-xs mt-1 max-w-2xl leading-relaxed">
              Monitoring berkala evaluasi tengah semester, evaluasi akhir semester, notulensi rapat evaluasi kurikulum, dan laporan peningkatan mutu berbasis capaian 8 Standar Nasional Pendidikan (SNP) serta Rapor Pendidikan.
            </p>
          </div>

          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeSubmenu === 'evaluasi_tengah_semester'
                ? 'Tambah Evaluasi Tengah Semester'
                : activeSubmenu === 'evaluasi_akhir_semester'
                ? 'Tambah Evaluasi Akhir Semester'
                : activeSubmenu === 'rapat_evaluasi'
                ? 'Tambah Rapat Evaluasi'
                : 'Tambah Laporan Mutu'}
            </span>
          </button>
        </div>
      </div>

      {/* Submenu Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubmenu('evaluasi_tengah_semester')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubmenu === 'evaluasi_tengah_semester'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Evaluasi Tengah Semester</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubmenu === 'evaluasi_tengah_semester'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {midSemesterEvals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubmenu('evaluasi_akhir_semester')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubmenu === 'evaluasi_akhir_semester'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Evaluasi Akhir Semester</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubmenu === 'evaluasi_akhir_semester'
                ? 'bg-teal-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {finalSemesterEvals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubmenu('rapat_evaluasi')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubmenu === 'rapat_evaluasi'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Rapat Evaluasi Akademik</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubmenu === 'rapat_evaluasi'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {academicMeetings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubmenu('laporan_mutu')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubmenu === 'laporan_mutu'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Laporan Peningkatan Mutu (8 SNP)</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubmenu === 'laporan_mutu'
                ? 'bg-indigo-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {qualityReports.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari temuan, evaluasi, topik rapat, atau laporan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">Semester:</span>
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="Semua">Semua Semester</option>
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>
        </div>
      </div>

      {/* Submenu 1: Evaluasi Tengah Semester */}
      {activeSubmenu === 'evaluasi_tengah_semester' && (
        <div className="space-y-4">
          {filteredMid.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Belum Ada Data Evaluasi Tengah Semester</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Catat temuan lapangan, hasil analisis evaluasi pembelajaran tengah semester, dan solusi perbaikan di sini.
              </p>
              <button
                onClick={handleOpenAddForm}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Evaluasi Tengah Semester</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMid.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Semester {item.semester} &bull; {item.academicYear}
                          </span>
                          {item.fileName && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              PDF
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block text-[11px] mb-0.5">
                          🔍 Temuan Lapangan:
                        </span>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">{item.fieldFindings}</p>
                      </div>

                      <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-900 block text-[11px] mb-0.5">
                          📊 Evaluasi:
                        </span>
                        <p className="text-emerald-800 line-clamp-2 leading-relaxed">{item.evaluation}</p>
                      </div>

                      <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-900 block text-[11px] mb-0.5">
                          💡 Solusi atau Masukan:
                        </span>
                        <p className="text-blue-800 line-clamp-2 leading-relaxed">{item.solutionFeedback}</p>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-slate-500 italic">
                          <span className="font-semibold">Keterangan:</span> {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      Oleh: {item.createdBy}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setPreviewItem(item);
                          setPreviewType('evaluasi_tengah_semester');
                          setIsPreviewModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail Lengkap"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDownloadFile(item.fileName, item.fileData, item.title)}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title={item.fileName ? `Unduh ${item.fileName}` : 'Unduh Berkas PDF'}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: item.id,
                            title: item.title,
                            type: 'evaluasi_tengah_semester',
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submenu 2: Evaluasi Akhir Semester */}
      {activeSubmenu === 'evaluasi_akhir_semester' && (
        <div className="space-y-4">
          {filteredFinal.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Belum Ada Data Evaluasi Akhir Semester</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Rekam hasil evaluasi capaian kurikulum, kelulusan tujuan pembelajaran akhir semester, dan solusi komprehensif.
              </p>
              <button
                onClick={handleOpenAddForm}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Evaluasi Akhir Semester</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFinal.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                            Semester {item.semester} &bull; {item.academicYear}
                          </span>
                          {item.fileName && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              PDF
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block text-[11px] mb-0.5">
                          🔍 Temuan Lapangan:
                        </span>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">{item.fieldFindings}</p>
                      </div>

                      <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100">
                        <span className="font-bold text-teal-900 block text-[11px] mb-0.5">
                          📊 Evaluasi:
                        </span>
                        <p className="text-teal-800 line-clamp-2 leading-relaxed">{item.evaluation}</p>
                      </div>

                      <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                        <span className="font-bold text-indigo-900 block text-[11px] mb-0.5">
                          💡 Solusi atau Masukan:
                        </span>
                        <p className="text-indigo-800 line-clamp-2 leading-relaxed">{item.solutionFeedback}</p>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-slate-500 italic">
                          <span className="font-semibold">Keterangan:</span> {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      Oleh: {item.createdBy}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setPreviewItem(item);
                          setPreviewType('evaluasi_akhir_semester');
                          setIsPreviewModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail Lengkap"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDownloadFile(item.fileName, item.fileData, item.title)}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title={item.fileName ? `Unduh ${item.fileName}` : 'Unduh Berkas PDF'}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: item.id,
                            title: item.title,
                            type: 'evaluasi_akhir_semester',
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submenu 3: Rapat Evaluasi Akademik */}
      {activeSubmenu === 'rapat_evaluasi' && (
        <div className="space-y-4">
          {filteredMeetings.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
              <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Belum Ada Catatan Rapat Evaluasi Akademik</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Dokumentasikan tanggal rapat, hasil review kurikulum, notulensi lengkap, dan persiapan semester baru.
              </p>
              <button
                onClick={handleOpenAddForm}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Rapat Evaluasi Akademik</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeetings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.meetingDate}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Sem. {item.semester} {item.academicYear}
                          </span>
                          {item.fileName && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              PDF
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 block text-[11px] mb-0.5">
                          📚 Review Kurikulum & Perangkat:
                        </span>
                        <p className="text-slate-600 line-clamp-2 leading-relaxed">{item.curriculumReview}</p>
                      </div>

                      <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-900 block text-[11px] mb-0.5">
                          📝 Notulensi Rapat:
                        </span>
                        <p className="text-blue-800 line-clamp-2 leading-relaxed">{item.meetingMinutes}</p>
                      </div>

                      <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-900 block text-[11px] mb-0.5">
                          🚀 Persiapan Semester Baru:
                        </span>
                        <p className="text-emerald-800 line-clamp-2 leading-relaxed">{item.newSemesterPrep}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      Notulis/Pencatat: {item.createdBy}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setPreviewItem(item);
                          setPreviewType('rapat_evaluasi');
                          setIsPreviewModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail Rapat"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDownloadFile(item.fileName, item.fileData, item.title)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title={item.fileName ? `Unduh ${item.fileName}` : 'Unduh Berkas PDF'}
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setDeleteTarget({
                            id: item.id,
                            title: item.title,
                            type: 'rapat_evaluasi',
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Data Rapat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submenu 4: Laporan Peningkatan Mutu (8 SNP) */}
      {activeSubmenu === 'laporan_mutu' && (
        <div className="space-y-4">
          {filteredQuality.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Belum Ada Laporan Peningkatan Mutu</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Susun laporan mutu terintegrasi dengan Rapor Pendidikan dan 8 Standar Nasional Pendidikan, lengkap dengan ekspor resmi ke PDF.
              </p>
              <button
                onClick={handleOpenAddForm}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Laporan Mutu</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuality.map((item) => {
                const standards = item.standards || DEFAULT_SNP_STANDARDS;
                const achievedCount = Object.values(standards).filter(Boolean).length;
                const percentage = Math.round((achievedCount / 8) * 100);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 hover:border-indigo-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Tahun {item.academicYear} &bull; {item.semester}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {achievedCount}/8 SNP Terpenuhi ({percentage}%)
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-700 block text-[11px] mb-0.5">
                            📄 Latar Belakang:
                          </span>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed">{item.background}</p>
                        </div>

                        <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <span className="font-bold text-indigo-900 block text-[11px] mb-0.5">
                            📊 Hasil Rapor Pendidikan:
                          </span>
                          <p className="text-indigo-800 line-clamp-2 leading-relaxed">
                            {item.raportPendidikanResult}
                          </p>
                        </div>

                        {/* 8 SNP Mini Checklist View */}
                        <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                          <span className="font-bold text-slate-800 block text-[11px] mb-1.5">
                            Ketercapaian 8 Standar Nasional Pendidikan (SNP):
                          </span>
                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              {standards.standarKompetensiLulusan ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarKompetensiLulusan ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                1. SKL
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {standards.standarIsi ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarIsi ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                2. Standar Isi
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {standards.standarProses ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarProses ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                3. Standar Proses
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {standards.standarPenilaian ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarPenilaian ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                4. Standar Penilaian
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {standards.standarTendik ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarTendik ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                5. Tendik & Guru
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {standards.standarSarpras ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarSarpras ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                6. Sarana Prasarana
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {standards.standarPengelolaan ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarPengelolaan ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                7. Pengelolaan
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {standards.standarPembiayaan ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              )}
                              <span className={standards.standarPembiayaan ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                                8. Pembiayaan
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400">
                        Disusun oleh: {item.createdBy}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setPreviewItem(item);
                            setPreviewType('laporan_mutu');
                            setIsPreviewModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail Laporan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleExportQualityPdf(item)}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          title="Eksport ke PDF / Cetak Laporan"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Eksport PDF</span>
                        </button>

                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: item.id,
                              title: item.title,
                              type: 'laporan_mutu',
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Laporan Mutu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {activeSubmenu === 'evaluasi_tengah_semester'
                    ? 'Tambah Evaluasi Tengah Semester'
                    : activeSubmenu === 'evaluasi_akhir_semester'
                    ? 'Tambah Evaluasi Akhir Semester'
                    : activeSubmenu === 'rapat_evaluasi'
                    ? 'Tambah Rapat Evaluasi Akademik'
                    : 'Tambah Laporan Peningkatan Mutu (8 SNP)'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Common Header Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Ajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={
                      activeSubmenu === 'evaluasi_tengah_semester' || activeSubmenu === 'evaluasi_akhir_semester'
                        ? formSemesterEval.academicYear
                        : activeSubmenu === 'rapat_evaluasi'
                        ? formMeeting.academicYear
                        : formQuality.academicYear
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeSubmenu === 'evaluasi_tengah_semester' || activeSubmenu === 'evaluasi_akhir_semester') {
                        setFormSemesterEval((prev) => ({ ...prev, academicYear: val }));
                      } else if (activeSubmenu === 'rapat_evaluasi') {
                        setFormMeeting((prev) => ({ ...prev, academicYear: val }));
                      } else {
                        setFormQuality((prev) => ({ ...prev, academicYear: val }));
                      }
                    }}
                    placeholder="2026/2027"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      activeSubmenu === 'evaluasi_tengah_semester' || activeSubmenu === 'evaluasi_akhir_semester'
                        ? formSemesterEval.semester
                        : activeSubmenu === 'rapat_evaluasi'
                        ? formMeeting.semester
                        : formQuality.semester
                    }
                    onChange={(e) => {
                      const val = e.target.value as 'Ganjil' | 'Genap';
                      if (activeSubmenu === 'evaluasi_tengah_semester' || activeSubmenu === 'evaluasi_akhir_semester') {
                        setFormSemesterEval((prev) => ({ ...prev, semester: val }));
                      } else if (activeSubmenu === 'rapat_evaluasi') {
                        setFormMeeting((prev) => ({ ...prev, semester: val }));
                      } else {
                        setFormQuality((prev) => ({ ...prev, semester: val }));
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>

              {/* Submenu 1 & 2 Specific Fields */}
              {(activeSubmenu === 'evaluasi_tengah_semester' || activeSubmenu === 'evaluasi_akhir_semester') && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul / Topik Evaluasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formSemesterEval.title}
                      onChange={(e) => setFormSemesterEval({ ...formSemesterEval, title: e.target.value })}
                      placeholder="Contoh: Evaluasi Tengah Semester Ganjil TA 2026/2027"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Temuan Lapangan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formSemesterEval.fieldFindings}
                      onChange={(e) => setFormSemesterEval({ ...formSemesterEval, fieldFindings: e.target.value })}
                      placeholder="Jelaskan fakta observasi dan temuan proses belajar mengajar di kelas, kepatuhan administrasi guru, asesmen, dsb..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Evaluasi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formSemesterEval.evaluation}
                      onChange={(e) => setFormSemesterEval({ ...formSemesterEval, evaluation: e.target.value })}
                      placeholder="Uraikan analisis evaluatif terhadap temuan, kendala yang dihadapi guru dan peserta didik..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Solusi atau Masukan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formSemesterEval.solutionFeedback}
                      onChange={(e) => setFormSemesterEval({ ...formSemesterEval, solutionFeedback: e.target.value })}
                      placeholder="Rekomendasi tindakan, masukan pembinaan, program remedial, workshop guru..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Keterangan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formSemesterEval.notes}
                      onChange={(e) => setFormSemesterEval({ ...formSemesterEval, notes: e.target.value })}
                      placeholder="Catatan tambahan, waktu tindak lanjut, dsb."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* PDF Upload */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lampiran Berkas Pendukung (Format PDF)
                    </label>
                    <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handlePdfUpload(e, 'semester')}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                      />
                      {formSemesterEval.fileName && (
                        <p className="text-[11px] text-emerald-700 mt-2 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Berkas terpilih: {formSemesterEval.fileName} ({(formSemesterEval.fileSize ? formSemesterEval.fileSize / 1024 : 0).toFixed(0)} KB)
                        </p>
                      )}
                      {fileError && (
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {fileError}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Submenu 3 Specific Fields: Rapat Evaluasi Akademik */}
              {activeSubmenu === 'rapat_evaluasi' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul Rapat Evaluasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formMeeting.title}
                      onChange={(e) => setFormMeeting({ ...formMeeting, title: e.target.value })}
                      placeholder="Contoh: Rapat Evaluasi Kurikulum & Review Perangkat Ajar Semester Ganjil"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Pelaksanaan Rapat <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formMeeting.meetingDate}
                      onChange={(e) => setFormMeeting({ ...formMeeting, meetingDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Review Kurikulum dan Perangkat Pembelajaran <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formMeeting.curriculumReview}
                      onChange={(e) => setFormMeeting({ ...formMeeting, curriculumReview: e.target.value })}
                      placeholder="Catat evaluasi capaian ATP/Silabus, Modul Ajar, kesesuaian jam pelajaran, dan kendala implementasi Kurikulum Merdeka..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Notulensi Rapat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formMeeting.meetingMinutes}
                      onChange={(e) => setFormMeeting({ ...formMeeting, meetingMinutes: e.target.value })}
                      placeholder="Hasil pembahasan rapat pleno, kesepakatan dewan guru, keputusan pimpinan rapat..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Persiapan Semester Baru <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formMeeting.newSemesterPrep}
                      onChange={(e) => setFormMeeting({ ...formMeeting, newSemesterPrep: e.target.value })}
                      placeholder="Langkah persiapan tahun/semester baru: revisi jadwal pelajaran, pembagian tugas guru, kesiapan buku teks, kalender pendidikan..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* PDF Upload */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lampiran Dokumen Notulensi / Berita Acara Rapat (Format PDF)
                    </label>
                    <div className="p-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => handlePdfUpload(e, 'meeting')}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                      />
                      {formMeeting.fileName && (
                        <p className="text-[11px] text-blue-700 mt-2 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Berkas terpilih: {formMeeting.fileName} ({(formMeeting.fileSize ? formMeeting.fileSize / 1024 : 0).toFixed(0)} KB)
                        </p>
                      )}
                      {fileError && (
                        <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {fileError}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Submenu 4 Specific Fields: Laporan Peningkatan Mutu (8 SNP) */}
              {activeSubmenu === 'laporan_mutu' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Judul Laporan Mutu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formQuality.title}
                      onChange={(e) => setFormQuality({ ...formQuality, title: e.target.value })}
                      placeholder="Contoh: Laporan Peningkatan Mutu Satuan Pendidikan TA 2026/2027"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Latar Belakang <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formQuality.background}
                      onChange={(e) => setFormQuality({ ...formQuality, background: e.target.value })}
                      placeholder="Dasar pertimbangan dan konteks penyusunan laporan peningkatan mutu akademik satuan pendidikan..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Profil dan Capaian Mutu: Hasil Rapor Pendidikan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formQuality.raportPendidikanResult}
                      onChange={(e) => setFormQuality({ ...formQuality, raportPendidikanResult: e.target.value })}
                      placeholder="Uraikan indikator capaian Rapor Pendidikan (Literasi, Numerasi, Iklim Keamanan Belajar, Inklusivitas, Kualitas Pembelajaran)..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* 8 SNP Checkboxes Section */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        Ketercapaian 8 Standar Nasional Pendidikan (SNP):
                      </label>
                      <span className="text-[11px] font-bold text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200">
                        {Object.values(formQuality.standards).filter(Boolean).length} dari 8 Tercentang
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Beri centang pada komponen standar yang telah memenuhi kriteria capaian mutu:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarKompetensiLulusan}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarKompetensiLulusan: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">1. Standar Kompetensi Lulusan</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarIsi}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarIsi: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">2. Standar Isi</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarProses}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarProses: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">3. Standar Proses</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarPenilaian}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarPenilaian: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">4. Standar Penilaian Pendidikan</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarTendik}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarTendik: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">5. Standar Tenaga Kependidikan</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarSarpras}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarSarpras: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">6. Standar Sarana & Prasarana</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarPengelolaan}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarPengelolaan: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">7. Standar Pengelolaan</span>
                      </label>

                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formQuality.standards.standarPembiayaan}
                          onChange={(e) =>
                            setFormQuality({
                              ...formQuality,
                              standards: {
                                ...formQuality.standards,
                                standarPembiayaan: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800">8. Standar Pembiayaan</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Catatan / Rekomendasi Tambahan (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={formQuality.generalNotes}
                      onChange={(e) => setFormQuality({ ...formQuality, generalNotes: e.target.value })}
                      placeholder="Kesimpulan umum perbaikan mutu..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Preview Modal */}
      {isPreviewModalOpen && previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  {previewType === 'evaluasi_tengah_semester'
                    ? 'Evaluasi Tengah Semester'
                    : previewType === 'evaluasi_akhir_semester'
                    ? 'Evaluasi Akhir Semester'
                    : previewType === 'rapat_evaluasi'
                    ? 'Rapat Evaluasi Akademik'
                    : 'Laporan Peningkatan Mutu'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Tahun Ajaran:</span>
                  <span className="font-bold text-slate-800">{previewItem.academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Semester:</span>
                  <span className="font-bold text-slate-800">{previewItem.semester}</span>
                </div>
                {previewItem.meetingDate && (
                  <div>
                    <span className="text-slate-400 text-[10px] block">Tanggal Rapat:</span>
                    <span className="font-bold text-slate-800">{previewItem.meetingDate}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 text-[10px] block">Dibuat Oleh:</span>
                  <span className="font-bold text-slate-800">{previewItem.createdBy}</span>
                </div>
              </div>

              {/* Semester Details */}
              {(previewType === 'evaluasi_tengah_semester' || previewType === 'evaluasi_akhir_semester') && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">🔍 Temuan Lapangan:</span>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{previewItem.fieldFindings}</p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">📊 Evaluasi:</span>
                    <p className="text-emerald-800 whitespace-pre-wrap leading-relaxed">{previewItem.evaluation}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">💡 Solusi atau Masukan:</span>
                    <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">{previewItem.solutionFeedback}</p>
                  </div>

                  {previewItem.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block mb-1">ℹ️ Keterangan:</span>
                      <p className="text-slate-700">{previewItem.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Meeting Details */}
              {previewType === 'rapat_evaluasi' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">📚 Review Kurikulum & Perangkat Pembelajaran:</span>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{previewItem.curriculumReview}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">📝 Notulensi Rapat:</span>
                    <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">{previewItem.meetingMinutes}</p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">🚀 Persiapan Semester Baru:</span>
                    <p className="text-emerald-800 whitespace-pre-wrap leading-relaxed">{previewItem.newSemesterPrep}</p>
                  </div>
                </div>
              )}

              {/* Quality Report Details */}
              {previewType === 'laporan_mutu' && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">📄 Latar Belakang:</span>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{previewItem.background}</p>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <span className="font-bold text-indigo-900 block mb-1">📊 Hasil Rapor Pendidikan:</span>
                    <p className="text-indigo-800 whitespace-pre-wrap leading-relaxed">{previewItem.raportPendidikanResult}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-2">
                      Ketercapaian 8 Standar Nasional Pendidikan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'standarKompetensiLulusan', label: '1. Standar Kompetensi Lulusan' },
                        { key: 'standarIsi', label: '2. Standar Isi' },
                        { key: 'standarProses', label: '3. Standar Proses' },
                        { key: 'standarPenilaian', label: '4. Standar Penilaian Pendidikan' },
                        { key: 'standarTendik', label: '5. Standar Tenaga Kependidikan' },
                        { key: 'standarSarpras', label: '6. Standar Sarana & Prasarana' },
                        { key: 'standarPengelolaan', label: '7. Standar Pengelolaan' },
                        { key: 'standarPembiayaan', label: '8. Standar Pembiayaan' },
                      ].map((s) => {
                        const isDone = (previewItem.standards || {})[s.key];
                        return (
                          <div
                            key={s.key}
                            className={`p-2 rounded-lg border flex items-center justify-between ${
                              isDone
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}
                          >
                            <span className="font-semibold">{s.label}</span>
                            {isDone ? (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Terpenuhi
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Belum</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Berkas PDF Attachment preview / download */}
              {previewItem.fileName && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-700" />
                    <div>
                      <p className="font-bold text-emerald-900">{previewItem.fileName}</p>
                      <p className="text-[10px] text-emerald-700">
                        Ukuran: {(previewItem.fileSize ? previewItem.fileSize / 1024 : 0).toFixed(0)} KB &bull; Format PDF
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadFile(previewItem.fileName, previewItem.fileData, previewItem.title)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas PDF</span>
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              {previewType === 'laporan_mutu' && (
                <button
                  onClick={() => handleExportQualityPdf(previewItem)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Eksport ke PDF</span>
                </button>
              )}
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Evaluasi & Monitoring"
        itemName={deleteTarget?.title}
        description="Data evaluasi beserta berkas lampiran yang dihapus tidak dapat dipulihkan kembali dari sistem."
        isDeleting={isDeleting}
      />
    </div>
  );
};
