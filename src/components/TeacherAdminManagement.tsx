import React, { useState } from 'react';
import {
  FileBadge,
  Calendar,
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
  CalendarRange,
  FileText,
  FileCheck,
  X,
  Save,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import {
  TeacherAdminDoc,
  TeacherAdminSubmenu,
  SchoolProfile,
  CurriculumDocument,
} from '../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface TeacherAdminManagementProps {
  documents: TeacherAdminDoc[];
  schoolProfile: SchoolProfile;
  currentActorName: string;
  onSaveDocument: (docData: Omit<TeacherAdminDoc, 'id'>, existingId?: string) => Promise<void>;
  onDeleteDocument: (docId: string, docTitle: string) => Promise<void>;
  onLogDownload: (docTitle: string) => void;
}

export const TeacherAdminManagement: React.FC<TeacherAdminManagementProps> = ({
  documents,
  schoolProfile,
  currentActorName,
  onSaveDocument,
  onDeleteDocument,
  onLogDownload,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<TeacherAdminSubmenu>('sk_tugas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('Semua');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TeacherAdminDoc | null>(null);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<CurriculumDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<TeacherAdminDoc | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formClassGrade, setFormClassGrade] = useState('');
  const [formSkDate, setFormSkDate] = useState('');
  const [formEquivalency, setFormEquivalency] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formYear, setFormYear] = useState(schoolProfile.academicYear || '2026/2027');
  const [formSemester, setFormSemester] = useState<'Ganjil' | 'Genap' | 'Semua'>('Semua');
  const [formFile, setFormFile] = useState<{
    name: string;
    size: number;
    type: string;
    data: string;
  } | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submenus = [
    {
      id: 'sk_tugas' as TeacherAdminSubmenu,
      label: 'SK Pembagian Tugas Guru',
      description: 'SK Beban Kerja Guru, Pembagian Kelas, Ekuivalensi Jam & Dokumen SK Resmi.',
      icon: FileBadge,
      color: 'indigo',
    },
    {
      id: 'jadwal_pelajaran' as TeacherAdminSubmenu,
      label: 'Jadwal Pelajaran',
      description: 'Jadwal pelajaran efektif tiap semester dalam format PDF resmi sekolah.',
      icon: CalendarRange,
      color: 'emerald',
    },
  ];

  const currentDocs = documents.filter((d) => d.type === activeSubmenu);

  const filteredDocs = currentDocs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.teacherName && d.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.subject && d.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.classGrade && d.classGrade.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesYear = selectedYear === 'Semua' || d.academicYear === selectedYear;
    return matchesSearch && matchesYear;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const openAddModal = () => {
    setEditingDoc(null);
    setFormTeacherName('');
    setFormSubject('');
    setFormClassGrade('');
    setFormSkDate(new Date().toISOString().split('T')[0]);
    setFormEquivalency('24 JP');
    setFormDescription('');
    setFormTitle(
      activeSubmenu === 'sk_tugas'
        ? `SK Pembagian Tugas Guru TP ${schoolProfile.academicYear}`
        : `Jadwal Pelajaran Efektif TP ${schoolProfile.academicYear}`
    );
    setFormYear(schoolProfile.academicYear || '2026/2027');
    setFormSemester('Semua');
    setFormFile(null);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (doc: TeacherAdminDoc) => {
    setEditingDoc(doc);
    setFormTeacherName(doc.teacherName || '');
    setFormSubject(doc.subject || '');
    setFormClassGrade(doc.classGrade || '');
    setFormSkDate(doc.skDate || '');
    setFormEquivalency(doc.equivalency || '');
    setFormDescription(doc.description || '');
    setFormTitle(doc.title);
    setFormYear(doc.academicYear || schoolProfile.academicYear || '2026/2027');
    setFormSemester(doc.semester || 'Semua');
    if (doc.fileName) {
      setFormFile({
        name: doc.fileName,
        size: doc.fileSize,
        type: doc.fileType,
        data: doc.fileData || '',
      });
    } else {
      setFormFile(null);
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setFormError('Ukuran berkas maksimal adalah 20MB.');
      return;
    }

    setFormError('');
    const reader = new FileReader();
    reader.onload = () => {
      setFormFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        data: reader.result as string,
      });
      if (!formTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setFormTitle(cleanName);
      }
    };
    reader.onerror = () => setFormError('Gagal membaca file berkas.');
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Judul dokumen wajib diisi.');
      return;
    }

    if (activeSubmenu === 'sk_tugas' && !formTeacherName.trim()) {
      setFormError('Nama guru pengampu wajib diisi.');
      return;
    }

    if (!formFile && !editingDoc?.fileName) {
      setFormError('Silakan unggah berkas PDF terkait.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<TeacherAdminDoc, 'id'> = {
        type: activeSubmenu,
        title: formTitle.trim(),
        teacherName: formTeacherName.trim(),
        subject: formSubject.trim(),
        classGrade: formClassGrade.trim(),
        skDate: formSkDate,
        equivalency: formEquivalency.trim(),
        description: formDescription.trim(),
        academicYear: formYear,
        semester: formSemester,
        fileName: formFile?.name || editingDoc?.fileName || 'Dokumen.pdf',
        fileSize: formFile?.size || editingDoc?.fileSize || 0,
        fileType: formFile?.type || editingDoc?.fileType || 'application/pdf',
        fileData: formFile?.data || editingDoc?.fileData || '',
        uploadedBy: editingDoc?.uploadedBy || currentActorName || 'Petugas Administrasi',
        uploadedAt: editingDoc?.uploadedAt || new Date().toISOString(),
        updatedAt: editingDoc ? new Date().toISOString() : undefined,
      };

      await onSaveDocument(payload, editingDoc?.id);
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError('Gagal menyimpan: ' + (err?.message || 'Kesalahan sistem'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = (doc: TeacherAdminDoc) => {
    onLogDownload(doc.title);
    const downloadUrl = doc.fileData || `data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyMDEKJSVFT0Y=`;
    const a = window.document.createElement('a');
    a.href = downloadUrl;
    a.download = doc.fileName || `${doc.title}.pdf`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handlePreview = (doc: TeacherAdminDoc) => {
    // Convert to CurriculumDocument shape for preview modal
    const previewData: CurriculumDocument = {
      id: doc.id,
      section: 'master',
      subcategory: 'dokumen_kurikulum',
      title: doc.title,
      description: doc.description,
      academicYear: doc.academicYear,
      semester: doc.semester,
      targetClass: doc.classGrade,
      subject: doc.subject,
      teacherName: doc.teacherName,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      fileData: doc.fileData,
      uploadedBy: doc.uploadedBy,
      uploadedAt: doc.uploadedAt,
    };
    setPreviewDoc(previewData);
    setIsPreviewOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteDocument(deleteTarget.id, deleteTarget.title);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete teacher admin doc:', err);
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
              Administrasi Kepegawaian
            </span>
            <span className="text-xs text-slate-500">TP {schoolProfile.academicYear}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Administrasi Guru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan SK Pembagian Tugas Mengajar, Ekuivalensi Jam Guru, dan Jadwal Pelajaran Efektif (dukungan PDF).
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeSubmenu === 'sk_tugas' ? 'Tambah SK Tugas Guru' : 'Unggah Jadwal Pelajaran'}
          </span>
        </button>
      </div>

      {/* Submenu Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {submenus.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubmenu === item.id;
          const count = documents.filter((d) => d.type === item.id).length;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSubmenu(item.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/10'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count} Data
                </span>
              </div>
              <h3 className={`text-sm font-bold mt-2.5 ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                {item.label}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                {item.description}
              </p>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-700" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Cari dalam ${currentSubmenuMeta.label}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-medium w-full sm:w-auto"
          >
            <option value="Semua">Semua Tahun Pelajaran</option>
            <option value="2026/2027">TP 2026/2027</option>
            <option value="2025/2026">TP 2025/2026</option>
          </select>
        </div>
      </div>

      {/* Records Table / Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="py-14 px-4 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <SubmenuIcon className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-800">
                Belum ada data {currentSubmenuMeta.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeSubmenu === 'sk_tugas'
                  ? 'Catat data SK Pembagian Tugas Guru beserta ekuivalensi jam dan unggah berkas surat keputusannya.'
                  : 'Unggah jadwal pelajaran efektif semester dalam format file PDF untuk dapat diunduh oleh guru.'}
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  {activeSubmenu === 'sk_tugas' ? (
                    <>
                      <th className="py-3 px-4">Nama Guru & Mapel</th>
                      <th className="py-3 px-4">Kelas & Ekuivalensi</th>
                      <th className="py-3 px-4">Tanggal SK & Keterangan</th>
                      <th className="py-3 px-4">Berkas SK</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">Judul Dokumen Jadwal</th>
                      <th className="py-3 px-4">Tahun / Semester</th>
                      <th className="py-3 px-4">Berkas PDF</th>
                      <th className="py-3 px-4">Diunggah Oleh</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    {activeSubmenu === 'sk_tugas' ? (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                              <FileBadge className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {doc.teacherName || doc.title}
                              </span>
                              <span className="text-xs text-indigo-700 font-medium block">
                                Mapel: {doc.subject || '-'}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                                {doc.title}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800 block">
                            Kelas: {doc.classGrade || '-'}
                          </span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Ekuivalensi: {doc.equivalency || '-'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-700 block font-medium">
                            Tgl SK: {doc.skDate || '-'}
                          </span>
                          <span className="text-[11px] text-slate-500 block line-clamp-1 mt-0.5">
                            {doc.description || 'Tanpa keterangan'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-slate-800 block truncate max-w-[160px]">
                            {doc.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatFileSize(doc.fileSize)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => handlePreview(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Lihat Berkas"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Unduh Berkas"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                              <CalendarRange className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {doc.title}
                              </span>
                              <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {doc.description || 'Jadwal pelajaran resmi'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">
                            TP {doc.academicYear}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Semester: {doc.semester || 'Semua'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-slate-800 block truncate max-w-[180px]">
                            {doc.fileName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatFileSize(doc.fileSize)} &bull; PDF
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-xs text-slate-700 font-medium block">
                            {doc.uploadedBy}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(doc.uploadedAt).toLocaleDateString('id-ID')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              type="button"
                              onClick={() => handlePreview(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Lihat Berkas"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Unduh Berkas"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(doc)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Upload/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-6 animate-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <FileBadge className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingDoc ? 'Edit Data' : 'Tambah Data'}: {currentSubmenuMeta.label}
                  </h3>
                  <p className="text-xs text-indigo-200">Administrasi Guru</p>
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

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Berkas / SK <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SK Pembagian Tugas Mengajar Semester Ganjil 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              {/* Fields specific to SK Pembagian Tugas */}
              {activeSubmenu === 'sk_tugas' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Guru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama Lengkap beserta gelar"
                        value={formTeacherName}
                        onChange={(e) => setFormTeacherName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mata Pelajaran
                      </label>
                      <input
                        type="text"
                        placeholder="Mata Pelajaran yang diampu"
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
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
                        placeholder="Contoh: X-1 s/d X-4"
                        value={formClassGrade}
                        onChange={(e) => setFormClassGrade(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ekuivalensi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 24 JP / Kepala Lab"
                        value={formEquivalency}
                        onChange={(e) => setFormEquivalency(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-semibold text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tanggal Terbit SK
                      </label>
                      <input
                        type="date"
                        value={formSkDate}
                        onChange={(e) => setFormSkDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Year and Semester */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Pelajaran
                  </label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2026/2027"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="Semua">Semua Semester</option>
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Berkas Dokumen PDF <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50 relative">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center pointer-events-none">
                    <FileText className="w-7 h-7 text-indigo-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {formFile ? formFile.name : 'Pilih berkas PDF atau seret ke sini'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Maksimal ukuran file: 20MB
                    </span>
                    {formFile && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <FileCheck className="w-3.5 h-3.5" /> Berkas Siap ({(formFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Tambahkan catatan atau nomor surat jika diperlukan..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

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
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Berkas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDoc(null);
        }}
        onDownload={(doc) => {
          // Find original doc and trigger download
          const orig = documents.find((d) => d.id === doc.id);
          if (orig) handleDownload(orig);
        }}
      />

      {/* Custom Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Dokumen Administrasi"
        itemName={deleteTarget?.title}
        description="Berkas administrasi dan dokumen PDF ini akan dihapus secara permanen dari server."
        isDeleting={isDeleting}
      />
    </div>
  );
};
