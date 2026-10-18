import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Teacher,
  Schedule,
  AttendanceRecord,
  WarningLetter,
  NotificationLog,
  SchoolProfile,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test Firestore Connection
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client is offline or database initializing.');
    }
    return false;
  }
}

// Default initial School Profile
export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  id: 'main',
  schoolName: 'SMA NEGERI 1 TELADAN NUSANTARA',
  npsn: '20108942',
  address: 'Jl. Pendidikan No. 45, Kompleks Ki Hajar Dewantara',
  city: 'Kota Jakarta Selatan',
  province: 'DKI Jakarta',
  postalCode: '12150',
  principalName: 'Drs. H. Bambang Suryono, M.Pd.',
  principalNip: '19680512 199303 1 004',
  academicYear: '2026/2027',
  semester: 'Ganjil',
  phone: '(021) 7890-1234',
  email: 'info@sman1teladan.sch.id',
  website: 'www.sman1teladan.sch.id',
  accessPasskey: '123456',
  updatedAt: new Date().toISOString(),
};

// Initial Seed Data for Indonesian Teachers with realistic details
export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-1',
    nip: '19750815 200003 1 002',
    name: 'Dr. Ahmad Fauzi, M.Pd.',
    phone: '6281234567890',
    email: 'ahmad.fauzi@sman1teladan.sch.id',
    subject: 'Matematika Peminatan',
    employmentStatus: 'PNS',
    targetJp: 24,
    active: true,
    notes: 'Wakil Kepala Sekolah Bidang Kurikulum',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tch-2',
    nip: '19820421 200902 2 007',
    name: 'Siti Rahmawati, S.Pd., M.Si.',
    phone: '6281398765432',
    email: 'siti.rahmawati@sman1teladan.sch.id',
    subject: 'Fisika',
    employmentStatus: 'PNS',
    targetJp: 24,
    active: true,
    notes: 'Kepala Laboratorium IPA',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tch-3',
    nip: '19901103 201801 1 003',
    name: 'Budi Santoso, S.Kom., M.T.',
    phone: '6285712349988',
    email: 'budi.santoso@sman1teladan.sch.id',
    subject: 'Informatika & TIK',
    employmentStatus: 'PPPK',
    targetJp: 24,
    active: true,
    notes: 'Koordinator IT & Server CBT',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tch-4',
    nip: '19880214 201403 2 005',
    name: 'Nurul Hidayah, S.Pd.',
    phone: '6287890123456',
    email: 'nurul.hidayah@sman1teladan.sch.id',
    subject: 'Bahasa Indonesia',
    employmentStatus: 'PNS',
    targetJp: 24,
    active: true,
    notes: 'Pembina OSIS & Ekskul Jurnalistik',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tch-5',
    nip: '19950719 202104 1 009',
    name: 'Reza Pratama, S.Pd.',
    phone: '6281987650123',
    email: 'reza.pratama@sman1teladan.sch.id',
    subject: 'Bahasa Inggris',
    employmentStatus: 'GTT',
    targetJp: 22,
    active: true,
    notes: 'Guru Bahasa Inggris Kelas X dan XI',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tch-6',
    nip: '19920310 202012 2 004',
    name: 'Dewi Lestari, S.Pd., Gr.',
    phone: '6282133445566',
    email: 'dewi.lestari@sman1teladan.sch.id',
    subject: 'Biologi',
    employmentStatus: 'PPPK',
    targetJp: 24,
    active: true,
    notes: 'Guru Penggerak Angkatan 7',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tch-7',
    nip: '19850928 201101 1 006',
    name: 'Hendro Wijaya, S.Pd.',
    phone: '6285266778899',
    email: 'hendro.wijaya@sman1teladan.sch.id',
    subject: 'Pendidikan Jasmani (PJOK)',
    employmentStatus: 'Honorer',
    targetJp: 20,
    active: true,
    notes: 'Pelatih Ekstrakurikuler Futsal & Basket',
    createdAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'tch-8',
    nip: '19790615 200604 2 008',
    name: 'Endang Kusuma, S.Sos., M.Si.',
    phone: '6281311223344',
    email: 'endang.kusuma@sman1teladan.sch.id',
    subject: 'Sosiologi',
    employmentStatus: 'PNS',
    targetJp: 24,
    active: true,
    notes: 'Koordinator BK & Bimbingan Karir',
    createdAt: '2026-08-01T08:00:00Z',
  },
];

// Initial Schedules distributed across days and classes
export const INITIAL_SCHEDULES: Schedule[] = [
  // Dr. Ahmad Fauzi (24 JP total)
  { id: 'sch-1', teacherId: 'tch-1', teacherName: 'Dr. Ahmad Fauzi, M.Pd.', subject: 'Matematika Peminatan', classGrade: 'XII-MIPA 1', day: 'Senin', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 301', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-2', teacherId: 'tch-1', teacherName: 'Dr. Ahmad Fauzi, M.Pd.', subject: 'Matematika Peminatan', classGrade: 'XII-MIPA 2', day: 'Senin', periodStart: 5, periodEnd: 8, totalJp: 4, room: 'R. 302', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-3', teacherId: 'tch-1', teacherName: 'Dr. Ahmad Fauzi, M.Pd.', subject: 'Matematika Peminatan', classGrade: 'XI-MIPA 1', day: 'Rabu', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 201', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-4', teacherId: 'tch-1', teacherName: 'Dr. Ahmad Fauzi, M.Pd.', subject: 'Matematika Peminatan', classGrade: 'XI-MIPA 2', day: 'Rabu', periodStart: 5, periodEnd: 8, totalJp: 4, room: 'R. 202', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-5', teacherId: 'tch-1', teacherName: 'Dr. Ahmad Fauzi, M.Pd.', subject: 'Matematika Peminatan', classGrade: 'X-1', day: 'Jumat', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 101', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-6', teacherId: 'tch-1', teacherName: 'Dr. Ahmad Fauzi, M.Pd.', subject: 'Matematika Peminatan', classGrade: 'X-2', day: 'Sabtu', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 102', createdAt: '2026-08-01T08:00:00Z' },

  // Siti Rahmawati (24 JP total)
  { id: 'sch-7', teacherId: 'tch-2', teacherName: 'Siti Rahmawati, S.Pd., M.Si.', subject: 'Fisika', classGrade: 'XII-MIPA 1', day: 'Selasa', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'Lab Fisika', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-8', teacherId: 'tch-2', teacherName: 'Siti Rahmawati, S.Pd., M.Si.', subject: 'Fisika', classGrade: 'XII-MIPA 2', day: 'Selasa', periodStart: 5, periodEnd: 8, totalJp: 4, room: 'Lab Fisika', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-9', teacherId: 'tch-2', teacherName: 'Siti Rahmawati, S.Pd., M.Si.', subject: 'Fisika', classGrade: 'XI-MIPA 1', day: 'Kamis', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 201', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-10', teacherId: 'tch-2', teacherName: 'Siti Rahmawati, S.Pd., M.Si.', subject: 'Fisika', classGrade: 'XI-MIPA 2', day: 'Kamis', periodStart: 5, periodEnd: 8, totalJp: 4, room: 'R. 202', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-11', teacherId: 'tch-2', teacherName: 'Siti Rahmawati, S.Pd., M.Si.', subject: 'Fisika', classGrade: 'X-1', day: 'Sabtu', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'Lab Fisika', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-12', teacherId: 'tch-2', teacherName: 'Siti Rahmawati, S.Pd., M.Si.', subject: 'Fisika', classGrade: 'X-2', day: 'Sabtu', periodStart: 5, periodEnd: 8, totalJp: 4, room: 'Lab Fisika', createdAt: '2026-08-01T08:00:00Z' },

  // Budi Santoso (24 JP total)
  { id: 'sch-13', teacherId: 'tch-3', teacherName: 'Budi Santoso, S.Kom., M.T.', subject: 'Informatika & TIK', classGrade: 'X-1', day: 'Senin', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'Lab Komputer 1', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-14', teacherId: 'tch-3', teacherName: 'Budi Santoso, S.Kom., M.T.', subject: 'Informatika & TIK', classGrade: 'X-2', day: 'Senin', periodStart: 4, periodEnd: 6, totalJp: 3, room: 'Lab Komputer 1', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-15', teacherId: 'tch-3', teacherName: 'Budi Santoso, S.Kom., M.T.', subject: 'Informatika & TIK', classGrade: 'XI-MIPA 1', day: 'Selasa', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'Lab Komputer 2', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-16', teacherId: 'tch-3', teacherName: 'Budi Santoso, S.Kom., M.T.', subject: 'Informatika & TIK', classGrade: 'XI-IPS 1', day: 'Rabu', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'Lab Komputer 1', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-17', teacherId: 'tch-3', teacherName: 'Budi Santoso, S.Kom., M.T.', subject: 'Informatika & TIK', classGrade: 'XII-MIPA 1', day: 'Kamis', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'Lab Komputer 2', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-18', teacherId: 'tch-3', teacherName: 'Budi Santoso, S.Kom., M.T.', subject: 'Informatika & TIK', classGrade: 'XII-IPS 1', day: 'Jumat', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'Lab Komputer 1', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-19', teacherId: 'tch-3', teacherName: 'Budi Santoso, S.Kom., M.T.', subject: 'Informatika & TIK', classGrade: 'X-3', day: 'Sabtu', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'Lab Komputer 1', createdAt: '2026-08-01T08:00:00Z' },

  // Reza Pratama (Bahasa Inggris - under-attendance sample)
  { id: 'sch-20', teacherId: 'tch-5', teacherName: 'Reza Pratama, S.Pd.', subject: 'Bahasa Inggris', classGrade: 'X-1', day: 'Senin', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'R. 101', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-21', teacherId: 'tch-5', teacherName: 'Reza Pratama, S.Pd.', subject: 'Bahasa Inggris', classGrade: 'X-2', day: 'Selasa', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'R. 102', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-22', teacherId: 'tch-5', teacherName: 'Reza Pratama, S.Pd.', subject: 'Bahasa Inggris', classGrade: 'XI-IPA 1', day: 'Rabu', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 201', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-23', teacherId: 'tch-5', teacherName: 'Reza Pratama, S.Pd.', subject: 'Bahasa Inggris', classGrade: 'XI-IPS 1', day: 'Kamis', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 203', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-24', teacherId: 'tch-5', teacherName: 'Reza Pratama, S.Pd.', subject: 'Bahasa Inggris', classGrade: 'XII-IPA 1', day: 'Jumat', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 301', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-25', teacherId: 'tch-5', teacherName: 'Reza Pratama, S.Pd.', subject: 'Bahasa Inggris', classGrade: 'XII-IPS 1', day: 'Sabtu', periodStart: 1, periodEnd: 4, totalJp: 4, room: 'R. 303', createdAt: '2026-08-01T08:00:00Z' },

  // Hendro Wijaya (PJOK - low attendance sample)
  { id: 'sch-26', teacherId: 'tch-7', teacherName: 'Hendro Wijaya, S.Pd.', subject: 'Pendidikan Jasmani (PJOK)', classGrade: 'X-1', day: 'Senin', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'Lapangan Utama', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-27', teacherId: 'tch-7', teacherName: 'Hendro Wijaya, S.Pd.', subject: 'Pendidikan Jasmani (PJOK)', classGrade: 'X-2', day: 'Selasa', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'Lapangan Utama', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-28', teacherId: 'tch-7', teacherName: 'Hendro Wijaya, S.Pd.', subject: 'Pendidikan Jasmani (PJOK)', classGrade: 'XI-IPA 1', day: 'Kamis', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'Lapangan Basket', createdAt: '2026-08-01T08:00:00Z' },
  { id: 'sch-29', teacherId: 'tch-7', teacherName: 'Hendro Wijaya, S.Pd.', subject: 'Pendidikan Jasmani (PJOK)', classGrade: 'XII-IPA 1', day: 'Jumat', periodStart: 1, periodEnd: 3, totalJp: 3, room: 'Lapangan Utama', createdAt: '2026-08-01T08:00:00Z' },
];

// Helper to generate attendance records for August 2026
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const daysInAugust = 17; // Up to current date Aug 17, 2026

  for (let d = 1; d <= daysInAugust; d++) {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    const date = `2026-08-${dayStr}`;
    const dayOfWeek = new Date(2026, 7, d).getDay();

    // Skip Sundays
    if (dayOfWeek === 0) continue;

    // Dr. Ahmad Fauzi: High attendance (100%)
    records.push({
      id: `att-1-${date}`,
      teacherId: 'tch-1',
      teacherName: 'Dr. Ahmad Fauzi, M.Pd.',
      date,
      status: 'Hadir',
      checkInTime: '06:45',
      checkOutTime: '15:30',
      notes: 'Tepat waktu',
      createdAt: `${date}T07:00:00Z`,
    });

    // Siti Rahmawati: High attendance (95%)
    records.push({
      id: `att-2-${date}`,
      teacherId: 'tch-2',
      teacherName: 'Siti Rahmawati, S.Pd., M.Si.',
      date,
      status: d === 6 ? 'Izin' : 'Hadir',
      checkInTime: d === 6 ? undefined : '06:55',
      checkOutTime: d === 6 ? undefined : '15:15',
      notes: d === 6 ? 'Izin seminar kurikulum nasional' : 'Hadir mengajar',
      createdAt: `${date}T07:00:00Z`,
    });

    // Budi Santoso: 92% attendance
    records.push({
      id: `att-3-${date}`,
      teacherId: 'tch-3',
      teacherName: 'Budi Santoso, S.Kom., M.T.',
      date,
      status: d === 11 ? 'Sakit' : 'Hadir',
      checkInTime: d === 11 ? undefined : '07:05',
      checkOutTime: d === 11 ? undefined : '16:00',
      notes: d === 11 ? 'Surat dokter terlampir' : 'Hadir',
      createdAt: `${date}T07:00:00Z`,
    });

    // Nurul Hidayah: 100% attendance
    records.push({
      id: `att-4-${date}`,
      teacherId: 'tch-4',
      teacherName: 'Nurul Hidayah, S.Pd.',
      date,
      status: 'Hadir',
      checkInTime: '06:50',
      checkOutTime: '15:20',
      notes: 'Hadir',
      createdAt: `${date}T07:00:00Z`,
    });

    // Reza Pratama: 78.5% attendance (< 90% Threshold Warning!)
    let rezaStatus: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' = 'Hadir';
    let rezaNotes = 'Hadir mengajar';
    if (d === 3 || d === 10 || d === 14) {
      rezaStatus = 'Alpa';
      rezaNotes = 'Tanpa Keterangan';
    } else if (d === 7) {
      rezaStatus = 'Sakit';
      rezaNotes = 'Sakit flu';
    }
    records.push({
      id: `att-5-${date}`,
      teacherId: 'tch-5',
      teacherName: 'Reza Pratama, S.Pd.',
      date,
      status: rezaStatus,
      checkInTime: rezaStatus === 'Hadir' ? '07:15' : undefined,
      checkOutTime: rezaStatus === 'Hadir' ? '15:00' : undefined,
      notes: rezaNotes,
      createdAt: `${date}T07:00:00Z`,
    });

    // Dewi Lestari: 100% attendance
    records.push({
      id: `att-6-${date}`,
      teacherId: 'tch-6',
      teacherName: 'Dewi Lestari, S.Pd., Gr.',
      date,
      status: 'Hadir',
      checkInTime: '06:40',
      checkOutTime: '15:30',
      notes: 'Hadir mengajar',
      createdAt: `${date}T07:00:00Z`,
    });

    // Hendro Wijaya: 71.4% attendance (< 90% Threshold Warning!)
    let hendroStatus: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa' = 'Hadir';
    let hendroNotes = 'Hadir mengajar';
    if (d === 4 || d === 8 || d === 12 || d === 15) {
      hendroStatus = 'Alpa';
      hendroNotes = 'Tanpa Keterangan / Tidak Mengisi Presensi';
    }
    records.push({
      id: `att-7-${date}`,
      teacherId: 'tch-7',
      teacherName: 'Hendro Wijaya, S.Pd.',
      date,
      status: hendroStatus,
      checkInTime: hendroStatus === 'Hadir' ? '07:20' : undefined,
      checkOutTime: hendroStatus === 'Hadir' ? '14:30' : undefined,
      notes: hendroNotes,
      createdAt: `${date}T07:00:00Z`,
    });

    // Endang Kusuma: 93% attendance
    records.push({
      id: `att-8-${date}`,
      teacherId: 'tch-8',
      teacherName: 'Endang Kusuma, S.Sos., M.Si.',
      date,
      status: d === 5 ? 'Dinas Luar' : 'Hadir',
      checkInTime: d === 5 ? undefined : '06:50',
      checkOutTime: d === 5 ? undefined : '15:30',
      notes: d === 5 ? 'Surat Tugas Workshop Kemendikbud' : 'Hadir',
      createdAt: `${date}T07:00:00Z`,
    });
  }

  return records;
}

export const INITIAL_ATTENDANCE = generateInitialAttendance();

// Seed initial warning letters for the low attendance teachers
export const INITIAL_WARNING_LETTERS: WarningLetter[] = [
  {
    id: 'let-1',
    letterNumber: '421.3/084/SMAN1-TN/VIII/2026',
    teacherId: 'tch-5',
    teacherName: 'Reza Pratama, S.Pd.',
    teacherNip: '19950719 202104 1 009',
    attendanceRate: 78.6,
    totalDays: 14,
    totalPresent: 10,
    totalPermit: 0,
    totalSick: 1,
    totalAbsent: 3,
    periodMonth: 'Agustus 2026',
    meetingDate: '2026-08-20',
    meetingTime: '09:00',
    meetingPlace: 'Ruang Kepala Sekolah (Lt. 2)',
    letterType: 'Pemanggilan Klarifikasi',
    status: 'Diterbitkan',
    issuedDate: '2026-08-17',
    contentNotes: 'Terdapat 3 hari Alpa dan tingkat kehadiran di bawah batas minimum 90%. Diperlukan pembinaan dan konfirmasi langsung.',
    createdAt: '2026-08-17T10:00:00Z',
  },
  {
    id: 'let-2',
    letterNumber: '421.3/085/SMAN1-TN/VIII/2026',
    teacherId: 'tch-7',
    teacherName: 'Hendro Wijaya, S.Pd.',
    teacherNip: '19850928 201101 1 006',
    attendanceRate: 71.4,
    totalDays: 14,
    totalPresent: 10,
    totalPermit: 0,
    totalSick: 0,
    totalAbsent: 4,
    periodMonth: 'Agustus 2026',
    meetingDate: '2026-08-21',
    meetingTime: '10:30',
    meetingPlace: 'Ruang Kepala Sekolah (Lt. 2)',
    letterType: 'Surat Peringatan 1 (SP1)',
    status: 'Diterbitkan',
    issuedDate: '2026-08-17',
    contentNotes: 'Tercatat 4 hari ketidakhadiran tanpa keterangan pada jam pelajaran terjadwal. Pemanggilan formal dan evaluasi komitmen mengajar.',
    createdAt: '2026-08-17T10:30:00Z',
  },
];

// Initial WhatsApp Notification Logs
export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'notif-1',
    teacherId: 'tch-5',
    teacherName: 'Reza Pratama, S.Pd.',
    phone: '6281987650123',
    type: 'warning_attendance',
    message: '*PEMBERITAHUAN RESMI SMAN 1 TELADAN NUSANTARA*\n\nYth. Bapak/Ibu Reza Pratama, S.Pd.,\n\nBerdasarkan hasil evaluasi sistem presensi periode Agustus 2026, persentase kehadiran Anda saat ini tercatat *78.6%* (di bawah standar minimal 90%).\n\n📅 Jadwal Pertemuan Klarifikasi:\nHari/Tgl: Kamis, 20 Agustus 2026\nWaktu: 09:00 WIB\nTempat: Ruang Kepala Sekolah\n\nMohon hadir tepat waktu. Terima kasih.',
    status: 'sent',
    sentAt: '2026-08-17T10:15:00Z',
    createdAt: '2026-08-17T10:15:00Z',
  },
  {
    id: 'notif-2',
    teacherId: 'tch-7',
    teacherName: 'Hendro Wijaya, S.Pd.',
    phone: '6285266778899',
    type: 'warning_attendance',
    message: '*SURAT PERINGATAN (SP-1) SMAN 1 TELADAN NUSANTARA*\n\nYth. Hendro Wijaya, S.Pd.,\n\nKami menginformasikan bahwa persentase kehadiran Anda pada bulan berjalan adalah *71.4%* dengan 4 hari Alpa.\n\nUndangan Pembinaan Disiplin Guru:\nHari/Tgl: Jumat, 21 Agustus 2026\nWaktu: 10:30 WIB\nTempat: Ruang Kepala Sekolah\n\nSurat resmi telah diterbitkan dengan No: 421.3/085/SMAN1-TN/VIII/2026.',
    status: 'sent',
    sentAt: '2026-08-17T10:45:00Z',
    createdAt: '2026-08-17T10:45:00Z',
  },
];

// Function to clear all dummy demo data from Firestore collections
export async function clearAllDummyData(): Promise<{ success: boolean; count: number }> {
  try {
    let deletedCount = 0;
    const collectionsToClean = ['teachers', 'schedules', 'attendance', 'warningLetters', 'notifications'];

    for (const colName of collectionsToClean) {
      const snap = await getDocs(collection(db, colName));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, colName, d.id));
        deletedCount++;
      }
    }

    console.log(`Successfully cleared ${deletedCount} dummy records from Firestore.`);
    return { success: true, count: deletedCount };
  } catch (err) {
    console.error('Error clearing dummy data:', err);
    throw err;
  }
}

// Function to initialize Firestore configuration without dummy data
export async function seedInitialFirestoreData(forceReset: boolean = false) {
  try {
    // Check if previous dummy teachers exist, if so clean them up once as requested by user
    const tchDoc = await getDocs(collection(db, 'teachers'));
    const hasDummyData = tchDoc.docs.some((d) => d.id.startsWith('tch-') || d.id === 'tch-1');
    if (hasDummyData) {
      console.log('Dummy data detected in Firestore. Purging dummy data as requested...');
      await clearAllDummyData();
    }

    // Ensure school profile document exists without overwriting user updates
    const schoolProfileDoc = doc(db, 'schoolProfile', 'main');
    const existingProfileSnap = await getDoc(schoolProfileDoc);
    if (!existingProfileSnap.exists()) {
      await setDoc(schoolProfileDoc, DEFAULT_SCHOOL_PROFILE);
    }

    console.log('Firestore initialization complete (Clean mode, no dummy data).');
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}

export const seedDefaultDataIfEmpty = seedInitialFirestoreData;
