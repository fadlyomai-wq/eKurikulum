import React, { useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  GitFork,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  Search,
  Plus,
  User,
  GraduationCap,
  FileText,
  Filter,
} from 'lucide-react';
import {
  CurriculumDocument,
  CurriculumPlanSubmenu,
  SchoolProfile,
} from '../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface CurriculumPlanManagementProps {
  documents: CurriculumDocument[];
  schoolProfile: SchoolProfile;
  currentActorName: string;
  onSaveDocument: (docData: Omit<CurriculumDocument, 'id'>, existingId?: string) => Promise<void>;
  onDeleteDocument: (docId: string, docTitle: string) => Promise<void>;
  onLogDownload: (docTitle: string) => void;
}

export const CurriculumPlanManagement: React.FC<CurriculumPlanManagementProps> = ({
  documents,
  schoolProfile,
  currentActorName,
  onSaveDocument,
  onDeleteDocument,
  onLogDownload,
}) => {
  const [activeSubmenu, setActiveSubmenu] =
    useState<CurriculumPlanSubmenu>('prota');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Semua');
  const [selectedYear, setSelectedYear] = useState<string>('Semua');

  // Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<CurriculumDocument | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<CurriculumDocument | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<CurriculumDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const submenus = [
    {
      id: 'prota' as CurriculumPlanSubmenu,
      label: 'Program Tahunan (Prota)',
      description: 'Rencana alokasi waktu 1 tahun pelajaran untuk mencapai capaian pembelajaran (CP).',
      icon: BookOpen,
      color: 'indigo',
    },
    {
      id: 'promes' as CurriculumPlanSubmenu,
      label: 'Program Semester (Promes)',
      description: 'Penjabaran alokasi waktu per minggu efektif dalam semester ganjil dan genap.',
      icon: CalendarDays,
      color: 'emerald',
    },
    {
      id: 'atp' as CurriculumPlanSubmenu,
      label: 'Alur Tujuan Pembelajaran (ATP)',
      description: 'Rangkaian tujuan pembelajaran yang disusun logis menurut urutan pembelajaran tiap fase.',
      icon: GitFork,
      color: 'purple',
    },
  ];

  // Documents for Plan section and active submenu
  const currentSubmenuDocs = documents.filter(
    (d) => d.section === 'plan' && d.subcategory === activeSubmenu
  );

  // Extract unique subjects for filtering
  const availableSubjects = Array.from(
    new Set(currentSubmenuDocs.map((d) => d.subject).filter(Boolean))
  ) as string[];

  const filteredDocs = currentSubmenuDocs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.subject && d.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.teacherName && d.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.targetClass && d.targetClass.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === 'Semua' || d.subject === selectedSubject;
    const matchesYear = selectedYear === 'Semua' || d.academicYear === selectedYear;

    return matchesSearch && matchesSubject && matchesYear;
  });

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleDownload = (doc: CurriculumDocument) => {
    onLogDownload(doc.title);
    const downloadUrl = doc.fileData || `data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY4IDAwMDAwIG4gCjAwMDAwMDAxMjUgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA0Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyMDEKJSVFT0Y=`;
    const a = window.document.createElement('a');
    a.href = downloadUrl;
    a.download = doc.fileName || `${doc.title}.pdf`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenPreview = (doc: CurriculumDocument) => {
    setSelectedDocForPreview(doc);
    setIsPreviewOpen(true);
  };

  const handleOpenEdit = (doc: CurriculumDocument) => {
    setSelectedDocForEdit(doc);
    setIsUploadOpen(true);
  };

  const handleOpenUpload = () => {
    setSelectedDocForEdit(null);
    setIsUploadOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await onDeleteDocument(deleteTarget.id, deleteTarget.title);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete plan document:', err);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const currentSubmenuMeta = submenus.find((s) => s.id === activeSubmenu)!;
  const SubmenuIcon = currentSubmenuMeta.icon;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Perencanaan Pembelajaran
            </span>
            <span className="text-xs text-slate-500">TP {schoolProfile.academicYear}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Perencanaan Kurikulum
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen dokumen Program Tahunan (Prota), Program Semester (Promes), dan Alur Tujuan Pembelajaran (ATP) guru mata pelajaran.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenUpload}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Unggah Berkas Perencanaan</span>
        </button>
      </div>

      {/* Submenu Tabs Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {submenus.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubmenu === item.id;
          const count = documents.filter(
            (d) => d.section === 'plan' && d.subcategory === item.id
          ).length;

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
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count} Berkas
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

      {/* Action & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Cari mapel, guru, atau judul ${currentSubmenuMeta.label}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {availableSubjects.length > 0 && (
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-medium"
            >
              <option value="Semua">Semua Mata Pelajaran</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-medium"
          >
            <option value="Semua">Semua Tahun Pelajaran</option>
            <option value="2026/2027">TP 2026/2027</option>
            <option value="2025/2026">TP 2025/2026</option>
          </select>
        </div>
      </div>

      {/* Document Records List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          /* Placeholder Empty State */
          <div className="py-16 px-4 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <SubmenuIcon className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-800">
                Belum ada berkas {currentSubmenuMeta.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unggah berkas PDF perencanaan pembelajaran guru mata pelajaran untuk memudahkan monitoring dan supervisi kurikulum.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah {currentSubmenuMeta.label}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mata Pelajaran & Judul</th>
                  <th className="py-3 px-4">Tingkat / Fase</th>
                  <th className="py-3 px-4">Guru Penyusun</th>
                  <th className="py-3 px-4">Berkas PDF</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                          <SubmenuIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-900 text-sm">
                              {doc.subject || 'Mata Pelajaran'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              TP {doc.academicYear}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                            {doc.title}
                          </span>
                          {doc.description && (
                            <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {doc.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 block">
                        {doc.targetClass || 'Semua Tingkat'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Semester: {doc.semester || 'Semua'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-800 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.teacherName || doc.uploadedBy}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Diunggah: {new Date(doc.uploadedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-slate-800 block truncate max-w-[180px]">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatFileSize(doc.fileSize)} &bull; {doc.fileType.includes('pdf') ? 'PDF Document' : doc.fileType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Lihat (Preview) */}
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(doc)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Lihat Dokumen PDF"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Download */}
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Unduh Berkas PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Informasi Dokumen"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Dokumen"
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

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={selectedDocForPreview}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedDocForPreview(null);
        }}
        onDownload={handleDownload}
      />

      {/* Upload/Edit Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setSelectedDocForEdit(null);
        }}
        onSave={onSaveDocument}
        section="plan"
        defaultSubcategory={activeSubmenu}
        editingDocument={selectedDocForEdit}
        currentActorName={currentActorName}
        academicYear={schoolProfile.academicYear}
      />

      {/* Custom Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Dokumen Perencanaan"
        itemName={deleteTarget?.title}
        description="Berkas perencanaan pembelajaran kurikulum ini akan dihapus secara permanen."
        isDeleting={isDeleting}
      />
    </div>
  );
};
