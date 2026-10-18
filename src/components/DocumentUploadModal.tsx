import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Save,
  FileCheck,
} from 'lucide-react';
import {
  CurriculumDocument,
  CurriculumMasterSubmenu,
  CurriculumPlanSubmenu,
} from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: Omit<CurriculumDocument, 'id'>, existingId?: string) => Promise<void>;
  section: 'master' | 'plan';
  defaultSubcategory: CurriculumMasterSubmenu | CurriculumPlanSubmenu;
  editingDocument?: CurriculumDocument | null;
  currentActorName: string;
  academicYear: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  section,
  defaultSubcategory,
  editingDocument,
  currentActorName,
  academicYear,
}) => {
  const [title, setTitle] = useState('');
  const [subcategory, setSubcategory] = useState<CurriculumMasterSubmenu | CurriculumPlanSubmenu>(
    defaultSubcategory
  );
  const [year, setYear] = useState(academicYear || '2026/2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap' | 'Semua'>('Semua');
  const [targetClass, setTargetClass] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    data: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingDocument) {
      setTitle(editingDocument.title);
      setSubcategory(editingDocument.subcategory);
      setYear(editingDocument.academicYear || academicYear || '2026/2027');
      setSemester(editingDocument.semester || 'Semua');
      setTargetClass(editingDocument.targetClass || '');
      setSubject(editingDocument.subject || '');
      setTeacherName(editingDocument.teacherName || '');
      setDescription(editingDocument.description || '');
      if (editingDocument.fileName) {
        setSelectedFile({
          name: editingDocument.fileName,
          size: editingDocument.fileSize,
          type: editingDocument.fileType,
          data: editingDocument.fileData || '',
        });
      } else {
        setSelectedFile(null);
      }
    } else {
      setTitle('');
      setSubcategory(defaultSubcategory);
      setYear(academicYear || '2026/2027');
      setSemester('Semua');
      setTargetClass('');
      setSubject('');
      setTeacherName('');
      setDescription('');
      setSelectedFile(null);
    }
    setErrorMessage('');
  }, [editingDocument, defaultSubcategory, academicYear, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal adalah 20MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        data: reader.result as string,
      });

      // Auto-fill title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Gagal membaca berkas. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Judul dokumen wajib diisi.');
      return;
    }

    if (!selectedFile && !editingDocument) {
      setErrorMessage('Silakan pilih berkas PDF untuk diunggah.');
      return;
    }

    setIsSubmitting(true);
    try {
      const docPayload: Omit<CurriculumDocument, 'id'> = {
        section,
        subcategory,
        title: title.trim(),
        description: description.trim(),
        academicYear: year,
        semester,
        targetClass: targetClass.trim(),
        subject: subject.trim(),
        teacherName: teacherName.trim(),
        fileName: selectedFile?.name || editingDocument?.fileName || 'Dokumen.pdf',
        fileSize: selectedFile?.size || editingDocument?.fileSize || 0,
        fileType: selectedFile?.type || editingDocument?.fileType || 'application/pdf',
        fileData: selectedFile?.data || editingDocument?.fileData || '',
        uploadedBy: editingDocument?.uploadedBy || currentActorName || 'Petugas Kurikulum',
        uploadedAt: editingDocument?.uploadedAt || new Date().toISOString(),
        updatedAt: editingDocument ? new Date().toISOString() : undefined,
      };

      await onSave(docPayload, editingDocument?.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Gagal menyimpan dokumen: ' + (err?.message || 'Terjadi kesalahan sistem.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const masterCategories = [
    { id: 'dokumen_kurikulum', label: 'Dokumen Kurikulum (KOSP / Kurikulum Merdeka)' },
    { id: 'kalender_akademik', label: 'Kalender Akademik' },
    { id: 'data_rombel', label: 'Data Rombel (Rombongan Belajar)' },
    { id: 'struktur_organisasi', label: 'Struktur Organisasi' },
  ];

  const planCategories = [
    { id: 'prota', label: 'Program Tahunan (Prota)' },
    { id: 'promes', label: 'Program Semester (Promes)' },
    { id: 'atp', label: 'Alur Tujuan Pembelajaran (ATP)' },
  ];

  const activeCategories = section === 'master' ? masterCategories : planCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Upload className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {editingDocument ? 'Edit Dokumen' : 'Unggah Dokumen Baru'}
              </h3>
              <p className="text-xs text-indigo-200">
                {section === 'master' ? 'Dokumen Induk Kurikulum' : 'Perencanaan Kurikulum'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submenu / Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori / Submenu <span className="text-red-500">*</span>
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Judul Dokumen */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Dokumen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: KOSP SMA Teladan TP 2026/2027 atau Prota Fisika Fase F"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          {/* Grid fields: Tahun Ajaran & Semester */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tahun Ajaran <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026/2027"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
              >
                <option value="Semua">Semua / Lengkap</option>
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          {/* Specific fields for Perencanaan Kurikulum */}
          {section === 'plan' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Matematika, Fisika"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tingkat / Fase / Kelas
                </label>
                <input
                  type="text"
                  placeholder="Fase E / Kelas X"
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Guru Penyusun
                </label>
                <input
                  type="text"
                  placeholder="Nama Guru Pengampu"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Specific field for Data Rombel / Tingkat for Master */}
          {section === 'master' && subcategory === 'data_rombel' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tingkat / Keterangan Rombel
              </label>
              <input
                type="text"
                placeholder="Contoh: Rombel Kelas X, XI, XII Tahun 2026/2027"
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              />
            </div>
          )}

          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Berkas Dokumen PDF <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50 relative">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center pointer-events-none">
                <FileText className="w-8 h-8 text-indigo-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">
                  {selectedFile ? selectedFile.name : 'Pilih file PDF atau seret ke sini'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Mendukung format file PDF (Maksimal 20MB)
                </span>
                {selectedFile && (
                  <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <FileCheck className="w-3.5 h-3.5" /> Berkas Siap ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Deskripsi / Catatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan / Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              placeholder="Tambahkan keterangan atau pengesahan dokumen jika ada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
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
              <span>{isSubmitting ? 'Menyimpan Dokumen...' : 'Simpan & Unggah Dokumen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
