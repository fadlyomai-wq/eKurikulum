import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Users,
  Network,
  Upload,
  Download,
  Eye,
  Edit2,
  Trash2,
  Search,
  Plus,
  HardDrive,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  CurriculumDocument,
  CurriculumMasterSubmenu,
  SchoolProfile,
} from '../types';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface CurriculumMasterManagementProps {
  documents: CurriculumDocument[];
  schoolProfile: SchoolProfile;
  currentActorName: string;
  onSaveDocument: (docData: Omit<CurriculumDocument, 'id'>, existingId?: string) => Promise<void>;
  onDeleteDocument: (docId: string, docTitle: string) => Promise<void>;
  onLogDownload: (docTitle: string) => void;
}

export const CurriculumMasterManagement: React.FC<CurriculumMasterManagementProps> = ({
  documents,
  schoolProfile,
  currentActorName,
  onSaveDocument,
  onDeleteDocument,
  onLogDownload,
}) => {
  const [activeSubmenu, setActiveSubmenu] =
    useState<CurriculumMasterSubmenu>('dokumen_kurikulum');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('Semua');

  // Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<CurriculumDocument | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<CurriculumDocument | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<CurriculumDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Submenu configuration
  const submenus = [
    {
      id: 'dokumen_kurikulum' as CurriculumMasterSubmenu,
      label: 'Dokumen Kurikulum',
      description: 'KOSP, Kurikulum Satuan Pendidikan, Kurikulum Merdeka, dan Panduan Operasional.',
      icon: FileText,
      color: 'indigo',
    },
    {
      id: 'kalender_akademik' as CurriculumMasterSubmenu,
      label: 'Kalender Akademik',
      description: 'Kalender Pendidikan Provinsi, Jadwal Semester Ganjil & Genap, dan Libur Resmi.',
      icon: Calendar,
      color: 'emerald',
    },
    {
      id: 'data_rombel' as CurriculumMasterSubmenu,
      label: 'Data Rombel',
      description: 'Rombongan Belajar, Pembagian Kelas X, XI, XII, Wali Kelas, dan Rekap Siswa.',
      icon: Users,
      color: 'blue',
    },
    {
      id: 'struktur_organisasi' as CurriculumMasterSubmenu,
      label: 'Struktur Organisasi',
      description: 'Bagan Organisasi Sekolah, Pembagian Tugas Pokok & Fungsi (Tupoksi) Pendidik.',
      icon: Network,
      color: 'amber',
    },
  ];

  // Filter documents for Master section and current submenu
  const currentSubmenuDocs = documents.filter(
    (d) => d.section === 'master' && d.subcategory === activeSubmenu
  );

  const filteredDocs = currentSubmenuDocs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.targetClass && d.targetClass.toLowerCase().includes(searchQuery.toLowerCase()));

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
      console.error('Failed to delete document:', err);
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
              Dokumen Resmi
            </span>
            <span className="text-xs text-slate-500">TP {schoolProfile.academicYear}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Dokumen Induk Kurikulum
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan berkas Kurikulum Operasional, Kalender Akademik, Data Rombel, dan Struktur Organisasi dengan dukungan PDF.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenUpload}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Unggah Dokumen Baru</span>
        </button>
      </div>

      {/* Submenu Tabs Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {submenus.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubmenu === item.id;
          const count = documents.filter(
            (d) => d.section === 'master' && d.subcategory === item.id
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

      {/* Action / Filter Bar */}
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

      {/* Documents List / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          /* Placeholder Empty State */
          <div className="py-16 px-4 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <SubmenuIcon className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-800">
                Belum ada dokumen {currentSubmenuMeta.label}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Silakan unggah dokumen PDF resmi (misal format .pdf) untuk menyimpan dan mendistribusikan arsip kurikulum satuan pendidikan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Dokumen {currentSubmenuMeta.label}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Dokumen</th>
                  <th className="py-3 px-4">Tahun / Semester</th>
                  <th className="py-3 px-4">Berkas PDF</th>
                  <th className="py-3 px-4">Diunggah Oleh</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5 border border-red-200">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">
                            {doc.title}
                          </span>
                          {doc.description ? (
                            <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {doc.description}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Tanpa keterangan tambahan</span>
                          )}
                          {doc.targetClass && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                              {doc.targetClass}
                            </span>
                          )}
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
                        {formatFileSize(doc.fileSize)} &bull; {doc.fileType.includes('pdf') ? 'PDF Document' : doc.fileType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{doc.uploadedBy}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(doc.uploadedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
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
        section="master"
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
        title="Hapus Dokumen Kurikulum"
        itemName={deleteTarget?.title}
        description="Dokumen kurikulum dan berkas PDF ini akan dihapus secara permanen."
        isDeleting={isDeleting}
      />
    </div>
  );
};
