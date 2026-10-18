import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Edit2,
  Trash2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  BookOpen,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';
import { Teacher, EmploymentStatus, Schedule } from '../types';
import { createWhatsAppUrl } from '../utils/formatters';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface TeacherManagementProps {
  teachers: Teacher[];
  schedules: Schedule[];
  onSaveTeacher: (teacherData: Partial<Teacher>) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
  onOpenWhatsAppModal: (teacher: Teacher, type: 'general' | 'daily_schedule') => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  schedules,
  onSaveTeacher,
  onDeleteTeacher,
  onOpenWhatsAppModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nip: '',
    name: '',
    phone: '',
    email: '',
    subject: '',
    employmentStatus: 'PNS' as EmploymentStatus,
    targetJp: 24,
    active: true,
    notes: '',
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      nip: '',
      name: '',
      phone: '08',
      email: '',
      subject: '',
      employmentStatus: 'PNS',
      targetJp: 24,
      active: true,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nip: teacher.nip,
      name: teacher.name,
      phone: teacher.phone,
      email: teacher.email || '',
      subject: teacher.subject,
      employmentStatus: teacher.employmentStatus,
      targetJp: teacher.targetJp || 24,
      active: teacher.active,
      notes: teacher.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nip.trim() || !formData.subject.trim()) {
      alert('Mohon lengkapi data wajib: Nama Lengkap, NIP, dan Mata Pelajaran.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveTeacher({
        ...(editingTeacher ? { id: editingTeacher.id } : {}),
        ...formData,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data guru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.employmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-700" />
            Manajemen Tenaga Pendidik (Guru)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data profil, NIP, nomor kontak WhatsApp, dan target alokasi Jam Pelajaran (JP).
          </p>
        </div>

        <button
          id="btn-add-teacher"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Data Guru</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, NIP, atau mapel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 w-full sm:w-auto"
          >
            <option value="all">Semua Status Kepegawaian</option>
            <option value="PNS">PNS</option>
            <option value="PPPK">PPPK</option>
            <option value="GTT">GTT (Guru Tidak Tetap)</option>
            <option value="Honorer">Honorer</option>
            <option value="Tetap Yayasan">Tetap Yayasan</option>
          </select>
        </div>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium">Tidak ada data guru yang sesuai kriteria pencarian.</p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => {
            const assignedSchedules = schedules.filter((s) => s.teacherId === teacher.id);
            const totalAssignedJp = assignedSchedules.reduce((acc, s) => acc + s.totalJp, 0);
            const isTargetFulfilled = totalAssignedJp >= teacher.targetJp;

            return (
              <div
                key={teacher.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between p-5"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        teacher.employmentStatus === 'PNS'
                          ? 'bg-blue-100 text-blue-800'
                          : teacher.employmentStatus === 'PPPK'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {teacher.employmentStatus}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        teacher.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {teacher.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-slate-400" />
                          <span>Non-Aktif</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Teacher Name & Subject */}
                  <div className="mt-3">
                    <h3 className="text-base font-bold text-slate-900">{teacher.name}</h3>
                    <p className="text-xs text-indigo-700 font-semibold mt-0.5">{teacher.subject}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">NIP: {teacher.nip}</p>
                  </div>

                  {/* Contact Details */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">{teacher.phone || '-'}</span>
                    </div>
                    {teacher.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate text-slate-600">{teacher.email}</span>
                      </div>
                    )}
                  </div>

                  {/* JP Target Breakdown */}
                  <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        Beban Jam Pelajaran
                      </span>
                      <span className="font-bold text-slate-900">
                        {totalAssignedJp} / {teacher.targetJp} JP
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isTargetFulfilled ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (totalAssignedJp / (teacher.targetJp || 24)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between items-center text-[10px]">
                      <span className={isTargetFulfilled ? 'text-emerald-700 font-bold' : 'text-amber-700 font-medium'}>
                        {isTargetFulfilled ? '✓ Target Terpenuhi' : `Kurang ${teacher.targetJp - totalAssignedJp} JP`}
                      </span>
                      <span className="text-slate-500">{assignedSchedules.length} Sesi Terjadwal</span>
                    </div>
                  </div>

                  {teacher.notes && (
                    <p className="mt-2 text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                      &ldquo;{teacher.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenWhatsAppModal(teacher, 'daily_schedule')}
                    className="flex-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    title="Kirim pesan WhatsApp langsung"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-2 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
                    title="Edit Data Guru"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setTeacherToDelete(teacher)}
                    className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    title="Hapus Guru"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add/Edit Teacher */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-700" />
                {editingTeacher ? 'Edit Data Tenaga Pendidik' : 'Tambah Tenaga Pendidik Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap beserta Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP / NUPTK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="19750815 200003 1 002"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mata Pelajaran Utama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Matematika"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="081234567890 / 628..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="guru@sman1teladan.sch.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kepegawaian
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, employmentStatus: e.target.value as EmploymentStatus })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
                  >
                    <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTT">GTT (Guru Tidak Tetap)</option>
                    <option value="Honorer">Honorer</option>
                    <option value="Tetap Yayasan">Tetap Yayasan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Beban JP / Minggu
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.targetJp}
                    onChange={(e) => setFormData({ ...formData, targetJp: parseInt(e.target.value, 10) || 24 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Jabatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Wakil Kepala Sekolah / Pembina OSIS"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-700 focus:ring-indigo-600"
                  />
                  <span className="text-xs font-semibold text-slate-800">Status Guru Aktif Mengajar</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : editingTeacher ? 'Perbarui Data' : 'Simpan Data Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!teacherToDelete}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={async () => {
          if (!teacherToDelete) return;
          setIsDeleting(true);
          try {
            await onDeleteTeacher(teacherToDelete.id);
            setTeacherToDelete(null);
          } catch (err) {
            console.error(err);
          } finally {
            setIsDeleting(false);
          }
        }}
        title="Hapus Data Guru"
        itemName={teacherToDelete?.name}
        description="Data profil tenaga pendidik, target jam pelajaran, dan riwayat presensi terkait akan dihapus secara permanen."
        isDeleting={isDeleting}
      />
    </div>
  );
};
