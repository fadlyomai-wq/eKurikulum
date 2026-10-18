import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  Building,
  User,
} from 'lucide-react';
import { Schedule, Teacher, DayOfWeek } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ScheduleDistributionProps {
  schedules: Schedule[];
  teachers: Teacher[];
  onSaveSchedule: (scheduleData: Partial<Schedule>) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
}

export const ScheduleDistribution: React.FC<ScheduleDistributionProps> = ({
  schedules,
  teachers,
  onSaveSchedule,
  onDeleteSchedule,
}) => {
  const days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Senin');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    teacherId: '',
    subject: '',
    classGrade: 'X-1',
    day: 'Senin' as DayOfWeek,
    periodStart: 1,
    periodEnd: 3,
    room: 'R. 101',
  });

  const [clashWarning, setClashWarning] = useState<string | null>(null);

  // Get list of unique classes
  const existingClasses = Array.from(new Set(schedules.map((s) => s.classGrade))).sort();
  const defaultClasses = ['X-1', 'X-2', 'X-3', 'XI-MIPA 1', 'XI-MIPA 2', 'XI-IPS 1', 'XII-MIPA 1', 'XII-MIPA 2', 'XII-IPS 1'];
  const allClasses = Array.from(new Set([...defaultClasses, ...existingClasses])).sort();

  // Helper to open Add modal
  const handleOpenAdd = () => {
    setEditingSchedule(null);
    const firstTeacher = teachers.find((t) => t.active) || teachers[0];
    setFormData({
      teacherId: firstTeacher ? firstTeacher.id : '',
      subject: firstTeacher ? firstTeacher.subject : '',
      classGrade: 'X-1',
      day: activeDay,
      periodStart: 1,
      periodEnd: 3,
      room: 'R. 101',
    });
    setClashWarning(null);
    setIsModalOpen(true);
  };

  // Check clash whenever form inputs change
  const checkForClash = (teacherId: string, day: DayOfWeek, pStart: number, pEnd: number, classGrade: string, currentId?: string) => {
    // 1. Teacher clash: Same teacher teaching another class at same day and overlapping period
    const teacherClash = schedules.find((s) => {
      if (currentId && s.id === currentId) return false;
      if (s.teacherId !== teacherId || s.day !== day) return false;
      return (pStart <= s.periodEnd && pEnd >= s.periodStart);
    });

    if (teacherClash) {
      return `Bentrok Guru: Guru ini sudah memiliki jadwal di kelas ${teacherClash.classGrade} pada ${day} Jam ke ${teacherClash.periodStart}-${teacherClash.periodEnd}.`;
    }

    // 2. Class clash: Same class having another subject at same day and overlapping period
    const classClash = schedules.find((s) => {
      if (currentId && s.id === currentId) return false;
      if (s.classGrade !== classGrade || s.day !== day) return false;
      return (pStart <= s.periodEnd && pEnd >= s.periodStart);
    });

    if (classClash) {
      return `Bentrok Kelas: Kelas ${classGrade} sudah memiliki jadwal ${classClash.subject} (${classClash.teacherName}) pada ${day} Jam ke ${classClash.periodStart}-${classClash.periodEnd}.`;
    }

    return null;
  };

  const handleTeacherChange = (tId: string) => {
    const selectedT = teachers.find((t) => t.id === tId);
    const newSubject = selectedT ? selectedT.subject : formData.subject;
    setFormData({ ...formData, teacherId: tId, subject: newSubject });
    const clash = checkForClash(tId, formData.day, formData.periodStart, formData.periodEnd, formData.classGrade, editingSchedule?.id);
    setClashWarning(clash);
  };

  const handleDayOrPeriodChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    const clash = checkForClash(
      updated.teacherId,
      updated.day,
      updated.periodStart,
      updated.periodEnd,
      updated.classGrade,
      editingSchedule?.id
    );
    setClashWarning(clash);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teacherId || !formData.subject || !formData.classGrade) {
      alert('Mohon pilih Guru, Mata Pelajaran, dan Kelas.');
      return;
    }

    if (formData.periodEnd < formData.periodStart) {
      alert('Jam ke akhir tidak boleh lebih kecil dari Jam ke awal.');
      return;
    }

    const teacher = teachers.find((t) => t.id === formData.teacherId);
    const totalJp = formData.periodEnd - formData.periodStart + 1;

    setIsSubmitting(true);
    try {
      await onSaveSchedule({
        ...(editingSchedule ? { id: editingSchedule.id } : {}),
        teacherId: formData.teacherId,
        teacherName: teacher ? teacher.name : 'Guru',
        subject: formData.subject,
        classGrade: formData.classGrade,
        day: formData.day,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        totalJp,
        room: formData.room,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan jadwal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered schedules for the active day view
  const activeDaySchedules = schedules.filter((s) => {
    const matchesDay = s.day === activeDay;
    const matchesTeacher = selectedTeacherFilter === 'all' || s.teacherId === selectedTeacherFilter;
    const matchesClass = selectedClassFilter === 'all' || s.classGrade === selectedClassFilter;
    return matchesDay && matchesTeacher && matchesClass;
  }).sort((a, b) => a.periodStart - b.periodStart);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-700" />
            Distribusi Jam Pelajaran (JP) & Jadwal Mengajar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Susun jadwal mingguan, pantau pemenuhan beban 24 JP per guru, dan cegah bentrok ruang/kelas otomatis.
          </p>
        </div>

        <button
          id="btn-add-schedule"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Alokasi Jadwal</span>
        </button>
      </div>

      {/* JP Workload Breakdown Table per Teacher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Ringkasan Distribusi Beban Mengajar Guru (Target Standar Sertifikasi 24 JP)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total Terdistribusi: <strong className="text-indigo-700">{schedules.reduce((acc, s) => acc + s.totalJp, 0)} JP</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Nama Guru</th>
                <th className="px-4 py-2.5">Mata Pelajaran</th>
                <th className="px-4 py-2.5 text-center">Target JP</th>
                <th className="px-4 py-2.5 text-center">Terjadwal</th>
                <th className="px-4 py-2.5">Progres Alokasi</th>
                <th className="px-4 py-2.5 text-center">Status Pemenuhan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((teacher) => {
                const teacherSchedules = schedules.filter((s) => s.teacherId === teacher.id);
                const assignedJp = teacherSchedules.reduce((acc, s) => acc + s.totalJp, 0);
                const target = teacher.targetJp || 24;
                const isFulfilled = assignedJp >= target;
                const percentage = Math.min(100, (assignedJp / target) * 100);

                return (
                  <tr key={teacher.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                      {teacher.name}
                      <span className="block text-[10px] text-slate-500 font-normal font-mono">
                        NIP. {teacher.nip}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">{teacher.subject}</td>
                    <td className="px-4 py-2.5 text-center font-bold text-slate-800">{target} JP</td>
                    <td className="px-4 py-2.5 text-center font-extrabold text-indigo-700">
                      {assignedJp} JP <span className="text-slate-400 font-normal">({teacherSchedules.length} Sesi)</span>
                    </td>
                    <td className="px-4 py-2.5 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFulfilled ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 w-9 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {isFulfilled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Cukup ({assignedJp} JP)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          Kurang {target - assignedJp} JP
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Schedule Day Tabs & Timetable View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Day Selector Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar bg-slate-50 p-1.5 gap-1">
          {days.map((day) => {
            const countForDay = schedules.filter((s) => s.day === day).length;
            const isActive = activeDay === day;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-1 min-w-28 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <span>{day}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {countForDay} Sesi
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters for the timetable */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Jadwal {activeDay}:
            </span>

            {/* Filter by Teacher */}
            <select
              value={selectedTeacherFilter}
              onChange={(e) => setSelectedTeacherFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="all">Semua Guru</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Filter by Class */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            >
              <option value="all">Semua Kelas</option>
              {allClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-500">
            Menampilkan <strong>{activeDaySchedules.length}</strong> jadwal mengajar pada hari {activeDay}
          </span>
        </div>

        {/* Timetable List Grid */}
        <div className="p-5">
          {activeDaySchedules.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">Belum ada alokasi jadwal mengajar pada hari {activeDay}.</p>
              <button
                onClick={handleOpenAdd}
                className="mt-3 text-xs font-semibold text-indigo-700 hover:underline"
              >
                + Tambah jadwal untuk hari {activeDay}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeDaySchedules.map((sch) => (
                <div
                  key={sch.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                        Kelas {sch.classGrade}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">{sch.subject}</h4>
                    </div>

                    <button
                      onClick={() => setScheduleToDelete(sch)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-900">{sch.teacherName}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-semibold text-indigo-700">
                        <Clock className="w-3.5 h-3.5" /> Jam ke {sch.periodStart} - {sch.periodEnd} ({sch.totalJp} JP)
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Building className="w-3 h-3 text-slate-400" /> {sch.room || 'R. Kelas'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit Schedule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-700" />
                Alokasi Jadwal & Jam Pelajaran
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {clashWarning && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Peringatan Bentrok Jadwal:</strong>
                  <p className="mt-0.5">{clashWarning}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Teacher Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Guru Pengampu <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.teacherId}
                  onChange={(e) => handleTeacherChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-medium"
                >
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject} - {t.employmentStatus})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              {/* Class & Day */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelas / Rombel <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => handleDayOrPeriodChange('classGrade', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
                  >
                    {allClasses.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hari Mengajar <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => handleDayOrPeriodChange('day', e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white font-bold"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Period Start & End */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pelajaran Mulai (Ke-)
                  </label>
                  <select
                    value={formData.periodStart}
                    onChange={(e) => handleDayOrPeriodChange('periodStart', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        Jam Ke-{p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jam Pelajaran Selesai (Ke-)
                  </label>
                  <select
                    value={formData.periodEnd}
                    onChange={(e) => handleDayOrPeriodChange('periodEnd', parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        Jam Ke-{p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room & Calculated JP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ruang Kelas / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: R. 301 / Lab Komputer"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Durasi Total JP
                  </label>
                  <div className="px-3 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                    {Math.max(1, formData.periodEnd - formData.periodStart + 1)} Jam Pelajaran (JP)
                  </div>
                </div>
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
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!scheduleToDelete}
        onClose={() => setScheduleToDelete(null)}
        onConfirm={async () => {
          if (!scheduleToDelete) return;
          setIsDeleting(true);
          try {
            await onDeleteSchedule(scheduleToDelete.id);
            setScheduleToDelete(null);
          } catch (err) {
            console.error(err);
          } finally {
            setIsDeleting(false);
          }
        }}
        title="Hapus Jadwal Mengajar"
        itemName={scheduleToDelete ? `${scheduleToDelete.subject} - Kelas ${scheduleToDelete.classGrade} (${scheduleToDelete.teacherName})` : ''}
        description="Sesi jadwal mengajar ini akan dihapus dari distribusi jam pelajaran guru."
        isDeleting={isDeleting}
      />
    </div>
  );
};
