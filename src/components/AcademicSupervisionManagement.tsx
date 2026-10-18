import React, { useState } from 'react';
import {
  ShieldAlert,
  ClipboardList,
  CalendarCheck,
  FileText,
  FileCheck2,
  CheckCircle2,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  Search,
  Plus,
  User,
  Clock,
  BookOpen,
  Calendar,
  X,
  Save,
  AlertCircle,
  Award,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  AcademicSupervisionSubmenu,
  SupervisionProgram,
  SupervisionInstrument,
  SupervisionSchedule,
  SupervisionReport,
  SupervisionFollowUp,
  SchoolProfile,
  Teacher,
  CurriculumDocument,
} from '../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AcademicSupervisionManagementProps {
  programs: SupervisionProgram[];
  instruments: SupervisionInstrument[];
  schedules: SupervisionSchedule[];
  reports: SupervisionReport[];
  followUps: SupervisionFollowUp[];
  schoolProfile: SchoolProfile;
  teachers: Teacher[];
  currentActorName: string;
  onSaveProgram: (data: Omit<SupervisionProgram, 'id'>, existingId?: string) => Promise<void>;
  onDeleteProgram: (id: string, title: string) => Promise<void>;
  onSaveInstrument: (data: Omit<SupervisionInstrument, 'id'>, existingId?: string) => Promise<void>;
  onDeleteInstrument: (id: string, title: string) => Promise<void>;
  onSaveSchedule: (data: Omit<SupervisionSchedule, 'id'>, existingId?: string) => Promise<void>;
  onDeleteSchedule: (id: string, title: string) => Promise<void>;
  onSaveReport: (data: Omit<SupervisionReport, 'id'>, existingId?: string) => Promise<void>;
  onDeleteReport: (id: string, title: string) => Promise<void>;
  onSaveFollowUp: (data: Omit<SupervisionFollowUp, 'id'>, existingId?: string) => Promise<void>;
  onDeleteFollowUp: (id: string, title: string) => Promise<void>;
  onLogDownload: (title: string) => void;
}

export const AcademicSupervisionManagement: React.FC<AcademicSupervisionManagementProps> = ({
  programs,
  instruments,
  schedules,
  reports,
  followUps,
  schoolProfile,
  teachers,
  currentActorName,
  onSaveProgram,
  onDeleteProgram,
  onSaveInstrument,
  onDeleteInstrument,
  onSaveSchedule,
  onDeleteSchedule,
  onSaveReport,
  onDeleteReport,
  onSaveFollowUp,
  onDeleteFollowUp,
  onLogDownload,
}) => {
  const [activeSubmenu, setActiveSubmenu] =
    useState<AcademicSupervisionSubmenu>('program_tahunan');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: AcademicSupervisionSubmenu;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview modal for PDF reports
  const [previewDoc, setPreviewDoc] = useState<CurriculumDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Detail / View modal for text-based items
  const [viewItem, setViewItem] = useState<{
    type: AcademicSupervisionSubmenu;
    data: any;
  } | null>(null);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields: Program
  const [progTitle, setProgTitle] = useState('');
  const [progBackground, setProgBackground] = useState('');
  const [progScope, setProgScope] = useState('');
  const [progStrategy, setProgStrategy] = useState('');
  const [progMechanism, setProgMechanism] = useState('');
  const [progFunding, setProgFunding] = useState('');

  // Form Fields: Instrument
  const [instTeacherName, setInstTeacherName] = useState('');
  const [instSubject, setInstSubject] = useState('');
  const [instClassGrade, setInstClassGrade] = useState('');
  const [instJpLoad, setInstJpLoad] = useState<number>(24);
  const [instEquivalency, setInstEquivalency] = useState('');
  const [instPreliminary, setInstPreliminary] = useState('');
  const [instCore, setInstCore] = useState('');
  const [instClassManagement, setInstClassManagement] = useState('');
  const [instClosing, setInstClosing] = useState('');
  const [instGrade, setInstGrade] = useState<'Amat Baik (A)' | 'Baik (B)' | 'Cukup (C)' | 'Kurang (D)'>('Baik (B)');
  const [instSupervisor, setInstSupervisor] = useState(schoolProfile.principalName || currentActorName);
  const [instDate, setInstDate] = useState(new Date().toISOString().split('T')[0]);

  // Form Fields: Schedule
  const [schDayDate, setSchDayDate] = useState(new Date().toISOString().split('T')[0]);
  const [schPeriod, setSchPeriod] = useState('Jam ke-2 s.d 4 (08.00 - 10.15)');
  const [schClassGrade, setSchClassGrade] = useState('X-1');
  const [schTeacherName, setSchTeacherName] = useState('');
  const [schSubject, setSchSubject] = useState('');
  const [schSupervisor, setSchSupervisor] = useState(schoolProfile.principalName || currentActorName);
  const [schRoom, setSchRoom] = useState('Ruang Kelas');

  // Form Fields: Report (PDF)
  const [repTitle, setRepTitle] = useState('');
  const [repDesc, setRepDesc] = useState('');
  const [repFile, setRepFile] = useState<{
    name: string;
    size: number;
    type: string;
    data: string;
  } | null>(null);

  // Form Fields: Follow-Up
  const [folTeacherName, setFolTeacherName] = useState('');
  const [folSubject, setFolSubject] = useState('');
  const [folFeedback, setFolFeedback] = useState('');
  const [folCoaching, setFolCoaching] = useState('');
  const [folTraining, setFolTraining] = useState('');
  const [folMonitoring, setFolMonitoring] = useState('');
  const [folSupervisor, setFolSupervisor] = useState(schoolProfile.principalName || currentActorName);
  const [folStatus, setFolStatus] = useState<'Direncanakan' | 'Berjalan' | 'Tuntas'>('Direncanakan');

  const submenus = [
    {
      id: 'program_tahunan' as AcademicSupervisionSubmenu,
      label: 'Program Supervisi Tahunan',
      description: 'Latar Belakang, Ruang Lingkup, Strategi, Mekanisme, dan Pembiayaan.',
      icon: ClipboardList,
      count: programs.length,
    },
    {
      id: 'instrumen_supervisi' as AcademicSupervisionSubmenu,
      label: 'Instrumen Supervisi',
      description: 'Penilaian Pendahuluan, Kegiatan Inti, Pengelolaan Kelas, dan Penutup.',
      icon: Award,
      count: instruments.length,
    },
    {
      id: 'jadwal_supervisi' as AcademicSupervisionSubmenu,
      label: 'Jadwal Supervisi',
      description: 'Waktu pelaksanaan, jam pelajaran, kelas, guru, mapel, & supervisor.',
      icon: CalendarCheck,
      count: schedules.length,
    },
    {
      id: 'laporan_supervisi' as AcademicSupervisionSubmenu,
      label: 'Laporan Supervisi (PDF)',
      description: 'Berkas PDF laporan hasil supervisi akademik semester berjalan.',
      icon: FileText,
      count: reports.length,
    },
    {
      id: 'tindak_lanjut' as AcademicSupervisionSubmenu,
      label: 'Tindak Lanjut',
      description: 'Umpan Balik, Pembinaan (Coaching), Pelatihan/Workshop, & Monitoring.',
      icon: FileCheck2,
      count: followUps.length,
    },
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormError('');

    // Reset fields based on active submenu
    if (activeSubmenu === 'program_tahunan') {
      setProgTitle(`Program Supervisi Akademik TP ${schoolProfile.academicYear}`);
      setProgBackground('Dalam rangka penjaminan mutu dan peningkatan kompetensi pedagogik guru secara berkelanjutan...');
      setProgScope('Supervisi perencanaan, pelaksanaan proses pembelajaran di kelas, serta asesmen hasil belajar...');
      setProgStrategy('Pendekatan klinis kolaboratif, observasi kelas terstruktur, refleksi terbimbing, dan diskusi berkala.');
      setProgMechanism('Sosialisasi instrumen -> Observasi tatap muka -> Post-conference umpan balik -> Rekapitulasi nilai.');
      setProgFunding('Rencana Kegiatan dan Anggaran Sekolah (RKAS) pos pembinaan profesional pendidik.');
    } else if (activeSubmenu === 'instrumen_supervisi') {
      setInstTeacherName(teachers[0]?.name || '');
      setInstSubject(teachers[0]?.subject || '');
      setInstClassGrade('X-A');
      setInstJpLoad(24);
      setInstEquivalency('');
      setInstPreliminary('Apersepsi dan penyampaian tujuan pembelajaran sangat baik, membangkitkan motivasi siswa.');
      setInstCore('Penerapan model pembelajaran berdiferensiasi dan student-centered learning berjalan efektif.');
      setInstClassManagement('Suasana kelas tertib, inklusif, dan partisipasi siswa aktif merata.');
      setInstClosing('Refleksi pembelajaran bersama siswa dan penugasan terarah dengan asesmen formatif.');
      setInstGrade('Baik (B)');
      setInstSupervisor(schoolProfile.principalName || currentActorName);
      setInstDate(new Date().toISOString().split('T')[0]);
    } else if (activeSubmenu === 'jadwal_supervisi') {
      setSchDayDate(new Date().toISOString().split('T')[0]);
      setSchPeriod('Jam ke-2 s.d 4 (08.00 - 10.15)');
      setSchClassGrade('X-1');
      setSchTeacherName(teachers[0]?.name || '');
      setSchSubject(teachers[0]?.subject || '');
      setSchSupervisor(schoolProfile.principalName || currentActorName);
      setSchRoom('Ruang Kelas X-1');
    } else if (activeSubmenu === 'laporan_supervisi') {
      setRepTitle(`Laporan Hasil Supervisi Akademik TP ${schoolProfile.academicYear}`);
      setRepDesc('Laporan komprehensif ketercapaian standar proses dan instrumen supervisi klinis guru.');
      setRepFile(null);
    } else if (activeSubmenu === 'tindak_lanjut') {
      setFolTeacherName(teachers[0]?.name || '');
      setFolSubject(teachers[0]?.subject || '');
      setFolFeedback('Peningkatan variasi media ajar berbasis IT dan pengelolaan waktu pada kegiatan inti.');
      setFolCoaching('Sesi coaching 1-on-1 terkait implementasi rubrik asesmen autentik kurikulum merdeka.');
      setFolTraining('Diikutsertakan dalam Workshop Penguatan Pemanfaatan Platform Merdeka Mengajar (PMM).');
      setFolMonitoring('Supervisi siklus kedua direncanakan pada pertengahan semester genap.');
      setFolSupervisor(schoolProfile.principalName || currentActorName);
      setFolStatus('Direncanakan');
    }

    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormError('');

    if (activeSubmenu === 'program_tahunan') {
      const p = item as SupervisionProgram;
      setProgTitle(p.title);
      setProgBackground(p.background);
      setProgScope(p.scope);
      setProgStrategy(p.strategy);
      setProgMechanism(p.mechanism);
      setProgFunding(p.funding);
    } else if (activeSubmenu === 'instrumen_supervisi') {
      const ins = item as SupervisionInstrument;
      setInstTeacherName(ins.teacherName);
      setInstSubject(ins.subject);
      setInstClassGrade(ins.classGrade);
      setInstJpLoad(ins.jpLoad);
      setInstEquivalency(ins.equivalency || '');
      setInstPreliminary(ins.preliminaryScore);
      setInstCore(ins.coreScore);
      setInstClassManagement(ins.classManagementScore);
      setInstClosing(ins.closingScore);
      setInstGrade(ins.overallGrade || 'Baik (B)');
      setInstSupervisor(ins.supervisorName);
      setInstDate(ins.supervisionDate);
    } else if (activeSubmenu === 'jadwal_supervisi') {
      const sch = item as SupervisionSchedule;
      setSchDayDate(sch.dayDate);
      setSchPeriod(sch.period);
      setSchClassGrade(sch.classGrade);
      setSchTeacherName(sch.teacherName);
      setSchSubject(sch.subject);
      setSchSupervisor(sch.supervisorName);
      setSchRoom(sch.room || '');
    } else if (activeSubmenu === 'laporan_supervisi') {
      const r = item as SupervisionReport;
      setRepTitle(r.title);
      setRepDesc(r.description || '');
      if (r.fileName) {
        setRepFile({
          name: r.fileName,
          size: r.fileSize,
          type: r.fileType,
          data: r.fileData || '',
        });
      }
    } else if (activeSubmenu === 'tindak_lanjut') {
      const fol = item as SupervisionFollowUp;
      setFolTeacherName(fol.teacherName);
      setFolSubject(fol.subject);
      setFolFeedback(fol.feedback);
      setFolCoaching(fol.coaching);
      setFolTraining(fol.training);
      setFolMonitoring(fol.monitoring);
      setFolSupervisor(fol.supervisorName);
      setFolStatus(fol.status || 'Direncanakan');
    }

    setIsFormOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setFormError('Ukuran file maksimal 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRepFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        data: reader.result as string,
      });
      if (!repTitle) {
        setRepTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (activeSubmenu === 'program_tahunan') {
        if (!progTitle.trim()) throw new Error('Judul program wajib diisi');
        await onSaveProgram(
          {
            academicYear: schoolProfile.academicYear,
            title: progTitle.trim(),
            background: progBackground.trim(),
            scope: progScope.trim(),
            strategy: progStrategy.trim(),
            mechanism: progMechanism.trim(),
            funding: progFunding.trim(),
            author: currentActorName || 'Kepala Sekolah',
            createdAt: new Date().toISOString(),
          },
          editingId || undefined
        );
      } else if (activeSubmenu === 'instrumen_supervisi') {
        if (!instTeacherName.trim()) throw new Error('Nama guru wajib diisi');
        await onSaveInstrument(
          {
            teacherName: instTeacherName.trim(),
            subject: instSubject.trim(),
            classGrade: instClassGrade.trim(),
            jpLoad: Number(instJpLoad) || 24,
            equivalency: instEquivalency.trim(),
            preliminaryScore: instPreliminary.trim(),
            coreScore: instCore.trim(),
            classManagementScore: instClassManagement.trim(),
            closingScore: instClosing.trim(),
            overallGrade: instGrade,
            supervisorName: instSupervisor.trim(),
            supervisionDate: instDate,
            academicYear: schoolProfile.academicYear,
            semester: schoolProfile.semester,
            createdAt: new Date().toISOString(),
          },
          editingId || undefined
        );
      } else if (activeSubmenu === 'jadwal_supervisi') {
        if (!schTeacherName.trim()) throw new Error('Nama guru yang disupervisi wajib diisi');
        await onSaveSchedule(
          {
            dayDate: schDayDate,
            period: schPeriod.trim(),
            classGrade: schClassGrade.trim(),
            teacherName: schTeacherName.trim(),
            subject: schSubject.trim(),
            supervisorName: schSupervisor.trim(),
            academicYear: schoolProfile.academicYear,
            semester: schoolProfile.semester,
            room: schRoom.trim(),
            status: 'Terjadwal',
            createdAt: new Date().toISOString(),
          },
          editingId || undefined
        );
      } else if (activeSubmenu === 'laporan_supervisi') {
        if (!repTitle.trim()) throw new Error('Judul laporan wajib diisi');
        if (!repFile) throw new Error('Silakan pilih berkas PDF laporan');
        await onSaveReport(
          {
            title: repTitle.trim(),
            academicYear: schoolProfile.academicYear,
            semester: schoolProfile.semester,
            fileName: repFile.name,
            fileSize: repFile.size,
            fileType: repFile.type,
            fileData: repFile.data,
            description: repDesc.trim(),
            uploadedBy: currentActorName || 'Supervisor',
            uploadedAt: new Date().toISOString(),
          },
          editingId || undefined
        );
      } else if (activeSubmenu === 'tindak_lanjut') {
        if (!folTeacherName.trim()) throw new Error('Nama guru wajib diisi');
        await onSaveFollowUp(
          {
            teacherName: folTeacherName.trim(),
            subject: folSubject.trim(),
            feedback: folFeedback.trim(),
            coaching: folCoaching.trim(),
            training: folTraining.trim(),
            monitoring: folMonitoring.trim(),
            supervisorName: folSupervisor.trim(),
            academicYear: schoolProfile.academicYear,
            status: folStatus,
            createdAt: new Date().toISOString(),
          },
          editingId || undefined
        );
      }

      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan data supervisi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'program_tahunan') {
        await onDeleteProgram(deleteTarget.id, deleteTarget.title);
      } else if (deleteTarget.type === 'instrumen_supervisi') {
        await onDeleteInstrument(deleteTarget.id, deleteTarget.title);
      } else if (deleteTarget.type === 'jadwal_supervisi') {
        await onDeleteSchedule(deleteTarget.id, deleteTarget.title);
      } else if (deleteTarget.type === 'laporan_supervisi') {
        await onDeleteReport(deleteTarget.id, deleteTarget.title);
      } else if (deleteTarget.type === 'tindak_lanjut') {
        await onDeleteFollowUp(deleteTarget.id, deleteTarget.title);
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete supervision item:', err);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentSubmenuMeta = submenus.find((s) => s.id === activeSubmenu)!;
  const SubmenuIcon = currentSubmenuMeta.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Penjaminan Mutu Pembelajaran
            </span>
            <span className="text-xs text-slate-500">TP {schoolProfile.academicYear}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Supervisi Akademik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perencanaan program supervisi klinis, instrumen penilaian, jadwal observasi, berkas laporan, dan rencana tindak lanjut pembinaan guru.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeSubmenu === 'laporan_supervisi'
              ? 'Unggah Laporan PDF'
              : `Tambah ${currentSubmenuMeta.label}`}
          </span>
        </button>
      </div>

      {/* Submenu Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        {submenus.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubmenu === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSubmenu(item.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.count}
                </span>
              </div>
              <h3 className={`text-xs font-bold mt-2 truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                {item.label}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                {item.description}
              </p>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-700" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Render per Submenu */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Submenu 1: Program Supervisi Tahunan */}
        {activeSubmenu === 'program_tahunan' && (
          <div>
            {programs.length === 0 ? (
              <div className="py-14 text-center px-4 space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Belum Ada Program Supervisi Tahunan</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Susun dokumen Program Supervisi Tahunan yang mencakup latar belakang, ruang lingkup, strategi, mekanisme, dan sumber daya pembiayaan.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition-colors"
                >
                  Buat Program Supervisi
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-4">
                {programs.map((p) => (
                  <div key={p.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 hover:border-indigo-300 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                          TP {p.academicYear}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{p.title}</h3>
                        <p className="text-xs text-slate-500">Penyusun: {p.author}</p>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setViewItem({ type: 'program_tahunan', data: p })}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:border-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: p.id, title: p.title, type: 'program_tahunan' })}
                          className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <strong className="text-slate-800 block mb-1">1. Latar Belakang:</strong>
                        <p className="text-slate-600 line-clamp-2">{p.background}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <strong className="text-slate-800 block mb-1">2. Ruang Lingkup:</strong>
                        <p className="text-slate-600 line-clamp-2">{p.scope}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <strong className="text-slate-800 block mb-1">3. Strategi & Pendekatan:</strong>
                        <p className="text-slate-600 line-clamp-2">{p.strategy}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-100">
                        <strong className="text-slate-800 block mb-1">4. Sumber Daya Pembiayaan:</strong>
                        <p className="text-slate-600 line-clamp-2">{p.funding}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submenu 2: Instrumen Supervisi */}
        {activeSubmenu === 'instrumen_supervisi' && (
          <div>
            {instruments.length === 0 ? (
              <div className="py-14 text-center px-4 space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Award className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Belum Ada Instrumen Supervisi</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Catat instrumen evaluasi proses pembelajaran (Kegiatan Pendahuluan, Kegiatan Inti, Pengelolaan Kelas, dan Penutup).
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition-colors"
                >
                  Tambah Instrumen Penilaian
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Guru & Mapel</th>
                      <th className="py-3 px-4">Kelas & JP</th>
                      <th className="py-3 px-4">Aspek Perencanaan & Inti</th>
                      <th className="py-3 px-4">Predikat / Skor</th>
                      <th className="py-3 px-4">Supervisor</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {instruments.map((ins) => (
                      <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{ins.teacherName}</span>
                          <span className="text-xs text-indigo-700 font-medium">{ins.subject}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">Kelas: {ins.classGrade}</span>
                          <span className="text-[11px] text-slate-500">
                            {ins.jpLoad} JP {ins.equivalency ? `(${ins.equivalency})` : ''}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="text-[11px] text-slate-700 line-clamp-1 block">
                            <strong>Inti:</strong> {ins.coreScore}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 block">
                            <strong>Kelas:</strong> {ins.classManagementScore}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {ins.overallGrade || 'Baik'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs text-slate-800 font-medium block">{ins.supervisorName}</span>
                          <span className="text-[10px] text-slate-400">{ins.supervisionDate}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => setViewItem({ type: 'instrumen_supervisi', data: ins })}
                              className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Komponen"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(ins)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: ins.id, title: `Instrumen: ${ins.teacherName}`, type: 'instrumen_supervisi' })}
                              className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Submenu 3: Jadwal Supervisi */}
        {activeSubmenu === 'jadwal_supervisi' && (
          <div>
            {schedules.length === 0 ? (
              <div className="py-14 text-center px-4 space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CalendarCheck className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Belum Ada Jadwal Supervisi</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Susun agenda dan jadwal pelaksanaan supervisi pembelajaran di kelas untuk guru.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition-colors"
                >
                  Jadwalkan Supervisi
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Hari / Tanggal</th>
                      <th className="py-3 px-4">Jam Pelajaran</th>
                      <th className="py-3 px-4">Target Kelas</th>
                      <th className="py-3 px-4">Guru yang Disupervisi</th>
                      <th className="py-3 px-4">Mata Pelajaran</th>
                      <th className="py-3 px-4">Supervisor</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {sch.dayDate}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium">
                            {sch.period}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-indigo-700 whitespace-nowrap">
                          {sch.classGrade}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {sch.teacherName}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {sch.subject}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {sch.supervisorName}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(sch)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: sch.id, title: `Jadwal: ${sch.teacherName}`, type: 'jadwal_supervisi' })}
                              className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Submenu 4: Laporan Supervisi (PDF) */}
        {activeSubmenu === 'laporan_supervisi' && (
          <div>
            {reports.length === 0 ? (
              <div className="py-14 text-center px-4 space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Belum Ada Berkas Laporan Supervisi</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Unggah berkas laporan resmi hasil supervisi akademik dalam format PDF untuk pengarsipan dan akreditasi sekolah.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition-colors"
                >
                  Unggah Laporan PDF
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Judul Laporan</th>
                      <th className="py-3 px-4">Tahun / Semester</th>
                      <th className="py-3 px-4">Berkas PDF</th>
                      <th className="py-3 px-4">Diunggah Oleh</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block text-sm">{r.title}</span>
                          {r.description && (
                            <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{r.description}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">TP {r.academicYear}</span>
                          <span className="text-[11px] text-slate-500">Semester: {r.semester}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-slate-800 block truncate max-w-[180px]">{r.fileName}</span>
                          <span className="text-[10px] text-slate-400">{(r.fileSize / 1024).toFixed(0)} KB &bull; PDF</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs text-slate-800 font-medium block">{r.uploadedBy}</span>
                          <span className="text-[10px] text-slate-400">{new Date(r.uploadedAt).toLocaleDateString('id-ID')}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => {
                                const previewData: CurriculumDocument = {
                                  id: r.id,
                                  section: 'master',
                                  subcategory: 'dokumen_kurikulum',
                                  title: r.title,
                                  description: r.description,
                                  academicYear: r.academicYear,
                                  semester: r.semester,
                                  fileName: r.fileName,
                                  fileSize: r.fileSize,
                                  fileType: r.fileType,
                                  fileData: r.fileData,
                                  uploadedBy: r.uploadedBy,
                                  uploadedAt: r.uploadedAt,
                                };
                                setPreviewDoc(previewData);
                                setIsPreviewOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Berkas"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onLogDownload(r.title);
                                if (r.fileData) {
                                  const a = document.createElement('a');
                                  a.href = r.fileData;
                                  a.download = r.fileName;
                                  a.click();
                                }
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Unduh Berkas"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: r.id, title: r.title, type: 'laporan_supervisi' })}
                              className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Submenu 5: Tindak Lanjut */}
        {activeSubmenu === 'tindak_lanjut' && (
          <div>
            {followUps.length === 0 ? (
              <div className="py-14 text-center px-4 space-y-3">
                <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Belum Ada Rencana Tindak Lanjut</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Dokumentasikan program tindak lanjut supervisi: Umpan Balik (Feedback), Pembinaan (Coaching), Pelatihan/Workshop, dan Monitoring Lanjutan.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold hover:bg-indigo-800 transition-colors"
                >
                  Tambah Tindak Lanjut
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-6 space-y-4">
                {followUps.map((fol) => (
                  <div key={fol.id} className="p-5 border border-slate-200 rounded-xl bg-slate-50/60 hover:border-indigo-300 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{fol.teacherName}</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                            {fol.subject}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Supervisor: {fol.supervisorName} &bull; Status:{' '}
                          <span className="font-semibold text-emerald-700">{fol.status || 'Berjalan'}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setViewItem({ type: 'tindak_lanjut', data: fol })}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(fol)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: fol.id, title: `Tindak Lanjut: ${fol.teacherName}`, type: 'tindak_lanjut' })}
                          className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                        <strong className="text-indigo-900 block mb-1">1. Umpan Balik (Feedback):</strong>
                        <p className="text-slate-600">{fol.feedback}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                        <strong className="text-indigo-900 block mb-1">2. Pembinaan (Coaching):</strong>
                        <p className="text-slate-600">{fol.coaching}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                        <strong className="text-indigo-900 block mb-1">3. Pelatihan/Workshop:</strong>
                        <p className="text-slate-600">{fol.training}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                        <strong className="text-indigo-900 block mb-1">4. Monitoring Lanjutan:</strong>
                        <p className="text-slate-600">{fol.monitoring}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-6 animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <SubmenuIcon className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingId ? 'Edit Data' : 'Tambah Data'}: {currentSubmenuMeta.label}
                  </h3>
                  <p className="text-xs text-indigo-200">Supervisi Akademik</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form 1: Program Supervisi Tahunan */}
              {activeSubmenu === 'program_tahunan' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Program <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={progTitle}
                      onChange={(e) => setProgTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Latar Belakang <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={progBackground}
                      onChange={(e) => setProgBackground(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Ruang Lingkup <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={progScope}
                      onChange={(e) => setProgScope(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Strategi & Pendekatan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={progStrategy}
                      onChange={(e) => setProgStrategy(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. Mekanisme Pelaksanaan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={progMechanism}
                      onChange={(e) => setProgMechanism(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      5. Sumber Daya Pembiayaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={progFunding}
                      onChange={(e) => setProgFunding(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Form 2: Instrumen Supervisi */}
              {activeSubmenu === 'instrumen_supervisi' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Guru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={instTeacherName}
                        onChange={(e) => setInstTeacherName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        value={instSubject}
                        onChange={(e) => setInstSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kelas
                      </label>
                      <input
                        type="text"
                        value={instClassGrade}
                        onChange={(e) => setInstClassGrade(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Beban JP
                      </label>
                      <input
                        type="number"
                        value={instJpLoad}
                        onChange={(e) => setInstJpLoad(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ekuivalensi (opsional)
                      </label>
                      <input
                        type="text"
                        value={instEquivalency}
                        onChange={(e) => setInstEquivalency(e.target.value)}
                        placeholder="Misal: Wali Kelas"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <span className="text-xs font-bold text-slate-800 block">
                      Komponen Perencanaan & Pelaksanaan:
                    </span>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        a. Kegiatan Pendahuluan:
                      </label>
                      <textarea
                        rows={2}
                        value={instPreliminary}
                        onChange={(e) => setInstPreliminary(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        b. Kegiatan Inti:
                      </label>
                      <textarea
                        rows={2}
                        value={instCore}
                        onChange={(e) => setInstCore(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        c. Pengelolaan Kelas:
                      </label>
                      <textarea
                        rows={2}
                        value={instClassManagement}
                        onChange={(e) => setInstClassManagement(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        d. Kegiatan Penutup:
                      </label>
                      <textarea
                        rows={2}
                        value={instClosing}
                        onChange={(e) => setInstClosing(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Predikat Penilaian
                      </label>
                      <select
                        value={instGrade}
                        onChange={(e) => setInstGrade(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-semibold"
                      >
                        <option value="Amat Baik (A)">Amat Baik (A)</option>
                        <option value="Baik (B)">Baik (B)</option>
                        <option value="Cukup (C)">Cukup (C)</option>
                        <option value="Kurang (D)">Kurang (D)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Supervisor
                      </label>
                      <input
                        type="text"
                        value={instSupervisor}
                        onChange={(e) => setInstSupervisor(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Form 3: Jadwal Supervisi */}
              {activeSubmenu === 'jadwal_supervisi' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Hari / Tanggal Pelaksanaan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={schDayDate}
                        onChange={(e) => setSchDayDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jam Pelajaran keberapa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Jam ke-1 s.d 3"
                        value={schPeriod}
                        onChange={(e) => setSchPeriod(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Target Kelas <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: X-1, XI MIPA 2"
                        value={schClassGrade}
                        onChange={(e) => setSchClassGrade(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ruang Observasi
                      </label>
                      <input
                        type="text"
                        value={schRoom}
                        onChange={(e) => setSchRoom(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Guru yang Disupervisi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={schTeacherName}
                        onChange={(e) => setSchTeacherName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mata Pelajaran yang Diampu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={schSubject}
                        onChange={(e) => setSchSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Supervisor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={schSupervisor}
                      onChange={(e) => setSchSupervisor(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Form 4: Laporan Supervisi (PDF) */}
              {activeSubmenu === 'laporan_supervisi' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Laporan Supervisi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={repTitle}
                      onChange={(e) => setRepTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Berkas PDF Laporan <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50 relative">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <FileText className="w-7 h-7 text-indigo-600 mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-700 block">
                        {repFile ? repFile.name : 'Pilih file PDF laporan supervisi'}
                      </span>
                      <span className="text-[11px] text-slate-400">Maksimal 20MB</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Keterangan / Ringkasan
                    </label>
                    <textarea
                      rows={2}
                      value={repDesc}
                      onChange={(e) => setRepDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Form 5: Tindak Lanjut */}
              {activeSubmenu === 'tindak_lanjut' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Guru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={folTeacherName}
                        onChange={(e) => setFolTeacherName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        value={folSubject}
                        onChange={(e) => setFolSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Umpan Balik (Feedback) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={folFeedback}
                      onChange={(e) => setFolFeedback(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Pembinaan (Coaching) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={folCoaching}
                      onChange={(e) => setFolCoaching(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Pelatihan / Workshop <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={folTraining}
                      onChange={(e) => setFolTraining(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. Monitoring Lanjutan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={folMonitoring}
                      onChange={(e) => setFolMonitoring(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Status Pelaksanaan
                      </label>
                      <select
                        value={folStatus}
                        onChange={(e) => setFolStatus(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-medium"
                      >
                        <option value="Direncanakan">Direncanakan</option>
                        <option value="Berjalan">Berjalan</option>
                        <option value="Tuntas">Tuntas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Supervisor Pembina
                      </label>
                      <input
                        type="text"
                        value={folSupervisor}
                        onChange={(e) => setFolSupervisor(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / View Modal for Text Data */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-6 animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">Rincian Dokumen Supervisi</h3>
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3.5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
              {viewItem.type === 'program_tahunan' && (
                <>
                  <div className="border-b pb-2">
                    <span className="text-slate-400 text-[11px] block">Judul Program:</span>
                    <strong className="text-sm text-slate-900">{viewItem.data.title}</strong>
                  </div>
                  <div>
                    <strong className="block text-slate-900">1. Latar Belakang:</strong>
                    <p className="mt-1 leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg">{viewItem.data.background}</p>
                  </div>
                  <div>
                    <strong className="block text-slate-900">2. Ruang Lingkup:</strong>
                    <p className="mt-1 leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg">{viewItem.data.scope}</p>
                  </div>
                  <div>
                    <strong className="block text-slate-900">3. Strategi & Pendekatan:</strong>
                    <p className="mt-1 leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg">{viewItem.data.strategy}</p>
                  </div>
                  <div>
                    <strong className="block text-slate-900">4. Mekanisme Pelaksanaan:</strong>
                    <p className="mt-1 leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg">{viewItem.data.mechanism}</p>
                  </div>
                  <div>
                    <strong className="block text-slate-900">5. Sumber Daya Pembiayaan:</strong>
                    <p className="mt-1 leading-relaxed text-slate-600 bg-slate-50 p-2.5 rounded-lg">{viewItem.data.funding}</p>
                  </div>
                </>
              )}

              {viewItem.type === 'instrumen_supervisi' && (
                <>
                  <div className="border-b pb-2">
                    <span className="text-slate-400 text-[11px] block">Guru yang Dinilai:</span>
                    <strong className="text-sm text-slate-900">{viewItem.data.teacherName}</strong>
                    <span className="text-xs text-indigo-700 font-medium block">
                      Mapel: {viewItem.data.subject} &bull; Kelas: {viewItem.data.classGrade} ({viewItem.data.jpLoad} JP)
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">a. Kegiatan Pendahuluan:</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.preliminaryScore}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">b. Kegiatan Inti:</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.coreScore}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">c. Pengelolaan Kelas:</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.classManagementScore}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">d. Kegiatan Penutup:</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.closingScore}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200">
                    <span className="font-bold">Predikat Akhir:</span>
                    <strong className="text-sm">{viewItem.data.overallGrade || 'Baik'}</strong>
                  </div>
                </>
              )}

              {viewItem.type === 'tindak_lanjut' && (
                <>
                  <div className="border-b pb-2">
                    <span className="text-slate-400 text-[11px] block">Rencana Tindak Lanjut Untuk:</span>
                    <strong className="text-sm text-slate-900">{viewItem.data.teacherName}</strong>
                    <span className="text-xs text-indigo-700 font-medium">{viewItem.data.subject}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">1. Umpan Balik:</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.feedback}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">2. Pembinaan (Coaching):</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.coaching}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">3. Pelatihan / Workshop:</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.training}</p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <strong className="text-slate-900 block">4. Monitoring Lanjutan:</strong>
                      <p className="text-slate-600 mt-0.5">{viewItem.data.monitoring}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setViewItem(null)}
                className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for PDF Reports */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDoc(null);
        }}
        onDownload={(doc) => {
          const r = reports.find((rep) => rep.id === doc.id);
          if (r && r.fileData) {
            onLogDownload(r.title);
            const a = document.createElement('a');
            a.href = r.fileData;
            a.download = r.fileName;
            a.click();
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Supervisi"
        itemName={deleteTarget?.title}
        description="Data supervisi akademik ini akan dihapus secara permanen dari server."
        isDeleting={isDeleting}
      />
    </div>
  );
};
