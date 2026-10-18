import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  Calendar,
  User,
  HardDrive,
  Printer,
  Maximize2,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import { CurriculumDocument } from '../types';

interface DocumentPreviewModalProps {
  document: CurriculumDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: CurriculumDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen || !document) return null;

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handlePrint = () => {
    if (document.fileData) {
      const printWindow = window.open(document.fileData, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'max-w-4xl w-full h-[90vh] max-h-[850px]'
        }`}
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold truncate leading-tight">
                {document.title}
              </h3>
              <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                {document.fileName} &bull; {formatFileSize(document.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDownload(document)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Unduh Berkas PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? 'Kecilkan' : 'Layar Penuh'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-red-600/80 rounded-lg transition-colors cursor-pointer"
              title="Tutup Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-2.5 text-xs text-slate-600 flex flex-wrap items-center gap-4 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Tahun: <strong className="text-slate-800">{document.academicYear || '-'}</strong></span>
          </div>
          {document.semester && (
            <div className="flex items-center gap-1.5 font-medium">
              <span>Semester: <strong className="text-slate-800">{document.semester}</strong></span>
            </div>
          )}
          {document.targetClass && (
            <div className="flex items-center gap-1.5 font-medium">
              <span>Kelas/Tingkat: <strong className="text-slate-800">{document.targetClass}</strong></span>
            </div>
          )}
          {document.subject && (
            <div className="flex items-center gap-1.5 font-medium">
              <span>Mata Pelajaran: <strong className="text-slate-800">{document.subject}</strong></span>
            </div>
          )}
          {document.teacherName && (
            <div className="flex items-center gap-1.5 font-medium">
              <span>Penyusun: <strong className="text-slate-800">{document.teacherName}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 font-medium ml-auto">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Diunggah oleh: <strong className="text-slate-800">{document.uploadedBy}</strong> ({new Date(document.uploadedAt).toLocaleDateString('id-ID')})</span>
          </div>
        </div>

        {/* Viewer Area */}
        <div className="flex-1 bg-slate-200 p-2 sm:p-4 overflow-auto flex flex-col items-center justify-center">
          {document.fileData ? (
            <div className="w-full h-full bg-white rounded-xl shadow-inner border border-slate-300 overflow-hidden flex flex-col">
              <iframe
                src={document.fileData}
                title={document.title}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">{document.title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Berkas PDF ini siap diunduh ke komputer Anda.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Dokumen:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">{document.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ukuran Berkas:</span>
                  <span className="font-mono">{formatFileSize(document.fileSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Format:</span>
                  <span className="font-semibold text-slate-800 uppercase">{document.fileType || 'PDF'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDownload(document)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas Sekarang</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        {document.description && (
          <div className="bg-white border-t border-slate-200 px-5 py-3 text-xs text-slate-600 shrink-0">
            <span className="font-bold text-slate-800 mr-1">Catatan / Deskripsi:</span>
            {document.description}
          </div>
        )}
      </div>
    </div>
  );
};
