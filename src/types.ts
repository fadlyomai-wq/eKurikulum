export type EmploymentStatus = 'PNS' | 'PPPK' | 'GTT' | 'Honorer' | 'Tetap Yayasan';

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' | 'Dinas Luar';

export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export type LetterType = 'Pemanggilan Klarifikasi' | 'Surat Peringatan 1 (SP1)' | 'Surat Peringatan 2 (SP2)' | 'Teguran Tertulis';

export type LetterStatus = 'Draft' | 'Diterbitkan' | 'Terkirim' | 'Selesai';

export type NotificationType = 'warning_attendance' | 'daily_schedule' | 'monthly_recap' | 'general';

export type NavigationTab =
  | 'dashboard'
  | 'curriculum_master'
  | 'curriculum_plan'
  | 'teacher_admin'
  | 'academic_supervision'
  | 'evaluation_monitoring'
  | 'teachers'
  | 'schedules'
  | 'attendance'
  | 'letters'
  | 'whatsapp'
  | 'report'
  | 'settings';

export type CurriculumMasterSubmenu =
  | 'dokumen_kurikulum'
  | 'kalender_akademik'
  | 'data_rombel'
  | 'struktur_organisasi';

export type CurriculumPlanSubmenu =
  | 'prota'
  | 'promes'
  | 'atp';

export interface CurriculumDocument {
  id: string;
  section: 'master' | 'plan';
  subcategory: CurriculumMasterSubmenu | CurriculumPlanSubmenu;
  title: string;
  description?: string;
  academicYear: string;
  semester?: 'Ganjil' | 'Genap' | 'Semua';
  targetClass?: string;
  subject?: string;
  teacherName?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string; // Data URL or storage link
  uploadedBy: string;
  uploadedAt: string;
  updatedAt?: string;
}

// 1. Administrasi Guru
export type TeacherAdminSubmenu = 'sk_tugas' | 'jadwal_pelajaran';

export interface TeacherAdminDoc {
  id: string;
  type: TeacherAdminSubmenu;
  title: string;
  teacherName?: string; // for SK Pembagian Tugas
  subject?: string; // for SK Pembagian Tugas
  classGrade?: string; // for SK Pembagian Tugas
  skDate?: string; // Tanggal Terbit SK (YYYY-MM-DD)
  equivalency?: string; // Ekuivalensi (misal: "24 JP", "12 JP + 12 JP Tugas Tambahan")
  description?: string; // Keterangan
  academicYear: string;
  semester?: 'Ganjil' | 'Genap' | 'Semua';
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt?: string;
}

// 2. Supervisi Akademik
export type AcademicSupervisionSubmenu =
  | 'program_tahunan'
  | 'instrumen_supervisi'
  | 'jadwal_supervisi'
  | 'laporan_supervisi'
  | 'tindak_lanjut';

export interface SupervisionProgram {
  id: string;
  academicYear: string;
  title: string;
  background: string; // Latar Belakang
  scope: string; // Ruang Lingkup
  strategy: string; // Strategi & Pendekatan
  mechanism: string; // Mekanisme Pelaksanaan
  funding: string; // Sumber Daya Pembiayaan
  author: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SupervisionInstrument {
  id: string;
  teacherName: string;
  subject: string;
  classGrade: string;
  jpLoad: number; // Beban JP
  equivalency?: string; // Ekuivalensi (opsional)
  preliminaryScore: string; // Komponen: Kegiatan Pendahuluan
  coreScore: string; // Komponen: Kegiatan Inti
  classManagementScore: string; // Komponen: Pengelolaan Kelas
  closingScore: string; // Komponen: Kegiatan Penutup
  overallGrade?: 'Amat Baik (A)' | 'Baik (B)' | 'Cukup (C)' | 'Kurang (D)';
  supervisorName: string;
  supervisionDate: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SupervisionSchedule {
  id: string;
  dayDate: string; // Hari / Tanggal Pelaksanaan
  period: string; // Jam Pelajaran keberapa (e.g. Jam ke-1 s.d 3)
  classGrade: string; // Target Kelas
  teacherName: string; // Nama Guru yang disupervisi
  subject: string; // Mata Pelajaran yang diampu
  supervisorName: string; // Nama Supervisor
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  room?: string;
  status: 'Terjadwal' | 'Terlaksana' | 'Ditunda';
  createdAt: string;
  updatedAt?: string;
}

export interface SupervisionReport {
  id: string;
  title: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap' | 'Semua';
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt?: string;
}

export interface SupervisionFollowUp {
  id: string;
  teacherName: string;
  subject: string;
  feedback: string; // Umpan Balik (Feedback)
  coaching: string; // Pembinaan (Coaching)
  training: string; // Pelatihan/Workshop
  monitoring: string; // Monitoring Lanjutan
  supervisorName: string;
  academicYear: string;
  status: 'Direncanakan' | 'Berjalan' | 'Tuntas';
  targetDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ActivityActionType =
  | 'Keamanan'
  | 'Kurikulum Induk'
  | 'Perencanaan Kurikulum'
  | 'Administrasi Guru'
  | 'Supervisi Akademik'
  | 'Evaluasi & Monitoring'
  | 'Data Guru'
  | 'Jadwal & JP'
  | 'Presensi'
  | 'Surat Pemanggilan'
  | 'WhatsApp'
  | 'Pengaturan'
  | 'Sistem';

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorName: string;
  actionType: ActivityActionType;
  description: string;
  details?: string;
  status: 'Sukses' | 'Peringatan' | 'Gagal';
}

export interface AccessSession {
  isVerified: boolean;
  accessName: string;
  verifiedAt: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  employmentStatus: EmploymentStatus;
  targetJp: number; // e.g. 24 JP per week
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Schedule {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  classGrade: string; // e.g. 'X-IPA 1', 'XI-IPS 2', 'VII-A'
  day: DayOfWeek;
  periodStart: number; // 1 - 8
  periodEnd: number; // 1 - 8
  totalJp: number; // calculated: periodEnd - periodStart + 1
  room: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // HH:mm
  checkOutTime?: string; // HH:mm
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WarningLetter {
  id: string;
  letterNumber: string;
  teacherId: string;
  teacherName: string;
  teacherNip: string;
  attendanceRate: number; // percentage, e.g. 78.5
  totalDays: number;
  totalPresent: number;
  totalPermit: number;
  totalSick: number;
  totalAbsent: number; // Alpa
  periodMonth: string; // e.g. "Agustus 2026"
  meetingDate: string; // YYYY-MM-DD
  meetingTime: string; // HH:mm WIB
  meetingPlace: string; // e.g. "Ruang Kepala Sekolah"
  letterType: LetterType;
  status: LetterStatus;
  issuedDate: string; // YYYY-MM-DD
  contentNotes?: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  teacherId: string;
  teacherName: string;
  phone: string;
  type: NotificationType;
  message: string;
  status: 'sent' | 'pending' | 'failed';
  sentAt: string;
  createdAt: string;
}

export interface SchoolProfile {
  id: string;
  schoolName: string;
  npsn: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  principalName: string;
  principalNip: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  phone: string;
  email: string;
  website: string;
  accessPasskey?: string;
  updatedAt: string;
}

export interface TeacherAttendanceSummary {
  teacher: Teacher;
  totalScheduledDays: number;
  present: number;
  permit: number;
  sick: number;
  absent: number; // Alpa
  dinasLuar: number;
  attendancePercentage: number;
  isUnderThreshold: boolean; // < 90%
  assignedJp: number;
}

// ----------------------------------------------------
// Evaluasi dan Monitoring Types
// ----------------------------------------------------
export type EvaluationMonitoringSubmenu =
  | 'evaluasi_tengah_semester'
  | 'evaluasi_akhir_semester'
  | 'rapat_evaluasi'
  | 'laporan_mutu';

// 1. Evaluasi Tengah Semester
export interface MidSemesterEvaluation {
  id: string;
  title: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  fieldFindings: string; // Temuan Lapangan
  evaluation: string; // Evaluasi
  solutionFeedback: string; // Solusi atau Masukan
  notes?: string; // Keterangan
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileData?: string; // Data URL Base64
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// 2. Evaluasi Akhir Semester
export interface FinalSemesterEvaluation {
  id: string;
  title: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  fieldFindings: string; // Temuan Lapangan
  evaluation: string; // Evaluasi
  solutionFeedback: string; // Solusi atau Masukan
  notes?: string; // Keterangan
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileData?: string; // Data URL Base64
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// 3. Rapat Evaluasi Akademik
export interface AcademicEvaluationMeeting {
  id: string;
  title: string;
  meetingDate: string; // Tanggal Pelaksanaan
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  curriculumReview: string; // Riview Kurikulum dan Perangkat Pembelajaran
  meetingMinutes: string; // Notulensi Rapat
  newSemesterPrep: string; // Persiapan Semester Baru
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileData?: string; // Data URL Base64
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// 4. Laporan Peningkatan Mutu (8 Standar Nasional Pendidikan)
export interface QualityStandardAchievement {
  standarKompetensiLulusan: boolean; // 1. Standar Kompetensi Lulusan
  standarIsi: boolean; // 2. Standar Isi
  standarProses: boolean; // 3. Standar Proses
  standarPenilaian: boolean; // 4. Standar Penilaian Pendidikan
  standarTendik: boolean; // 5. Standar Tenaga Kependidikan
  standarSarpras: boolean; // 6. Standar Sarana & Prasarana
  standarPengelolaan: boolean; // 7. Standar Pengelolaan
  standarPembiayaan: boolean; // 8. Standar Pembiayaan
}

export interface QualityImprovementReport {
  id: string;
  title: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  background: string; // Latar Belakang
  raportPendidikanResult: string; // Hasil Raport Pendidikan
  standards: QualityStandardAchievement; // Ketercapaian 8 Standar Nasional Pendidikan
  generalNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

