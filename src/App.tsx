import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  db,
  seedDefaultDataIfEmpty,
  clearAllDummyData,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  Teacher,
  Schedule,
  AttendanceRecord,
  WarningLetter,
  NotificationLog,
  SchoolProfile,
  TeacherAttendanceSummary,
  NavigationTab,
  NotificationType,
  CurriculumDocument,
  ActivityLog,
  AccessSession,
  TeacherAdminDoc,
  SupervisionProgram,
  SupervisionInstrument,
  SupervisionSchedule,
  SupervisionReport,
  SupervisionFollowUp,
  MidSemesterEvaluation,
  FinalSemesterEvaluation,
  AcademicEvaluationMeeting,
  QualityImprovementReport,
} from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TeacherManagement } from './components/TeacherManagement';
import { ScheduleDistribution } from './components/ScheduleDistribution';
import { AttendanceRecap } from './components/AttendanceRecap';
import { WarningLetterGenerator } from './components/WarningLetterGenerator';
import { WhatsAppNotifications } from './components/WhatsAppNotifications';
import { MonthlyReport } from './components/MonthlyReport';
import { SchoolSettings } from './components/SchoolSettings';
import { CurriculumMasterManagement } from './components/CurriculumMasterManagement';
import { CurriculumPlanManagement } from './components/CurriculumPlanManagement';
import { TeacherAdminManagement } from './components/TeacherAdminManagement';
import { AcademicSupervisionManagement } from './components/AcademicSupervisionManagement';
import { EvaluationMonitoringManagement } from './components/EvaluationMonitoringManagement';
import { AccessVerificationModal } from './components/AccessVerificationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Access Session State (Protected Menus require verification)
  const [accessSession, setAccessSession] = useState<AccessSession>(() => {
    try {
      const stored = sessionStorage.getItem('sim_access_session');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      // Ignore sessionStorage error
    }
    return {
      isVerified: false,
      accessName: '',
      verifiedAt: '',
    };
  });

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [pendingTargetTab, setPendingTargetTab] = useState<NavigationTab | null>(null);

  // Firestore Data State
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [warningLetters, setWarningLetters] = useState<WarningLetter[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [curriculumDocs, setCurriculumDocs] = useState<CurriculumDocument[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const stored = localStorage.getItem('sim_school_profile');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return {
      id: 'main',
      schoolName: 'SMA Negeri 1 Teladan Nusantara',
      npsn: '20108921',
      address: 'Jl. Merdeka Pendidikan No. 45',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12160',
      phone: '(021) 7890123',
      email: 'info@sman1teladan.sch.id',
      website: 'https://sman1teladan.sch.id',
      principalName: 'Dr. H. Hendra Wijaya, M.Pd.',
      principalNip: '19710512 199603 1 004',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      accessPasskey: '123456',
      updatedAt: new Date().toISOString(),
    };
  });

  // Administrasi Guru & Supervisi Akademik Data States
  const [teacherAdminDocs, setTeacherAdminDocs] = useState<TeacherAdminDoc[]>([]);
  const [supervisionPrograms, setSupervisionPrograms] = useState<SupervisionProgram[]>([]);
  const [supervisionInstruments, setSupervisionInstruments] = useState<SupervisionInstrument[]>([]);
  const [supervisionSchedules, setSupervisionSchedules] = useState<SupervisionSchedule[]>([]);
  const [supervisionReports, setSupervisionReports] = useState<SupervisionReport[]>([]);
  const [supervisionFollowUps, setSupervisionFollowUps] = useState<SupervisionFollowUp[]>([]);

  // Evaluasi dan Monitoring Data States
  const [midSemesterEvals, setMidSemesterEvals] = useState<MidSemesterEvaluation[]>(() => {
    try {
      const stored = localStorage.getItem('sim_mid_semester_evals');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'eval-mid-1',
        title: 'Evaluasi Tengah Semester Ganjil TA 2026/2027',
        academicYear: '2026/2027',
        semester: 'Ganjil',
        fieldFindings: 'Ditemukan beberapa mata pelajaran memerlukan penyesuaian alokasi jam praktikum lab IPA & TIK. 88% guru telah melengkapi administrasi Modul Ajar dan asesmen formatif tepat waktu.',
        evaluation: 'Pelaksanaan asesmen sumatif tengah semester berjalan tertib. Nilai rata-rata kognitif siswa mencapai target KKM, namun literasi bacaan saintifik perlu ditingkatkan.',
        solutionFeedback: 'Mengadakan klinik remedial terstruktur bagi siswa di bawah KKM dan optimalisasi modul ajar berbasis proyek kontekstual.',
        notes: 'Disepakati pada rapat koordinasi kurikulum dan akan dievaluasi kembali pada akhir semester.',
        fileName: 'Laporan_Evaluasi_Tengah_Semester_Ganjil.pdf',
        fileSize: 185420,
        fileType: 'application/pdf',
        createdBy: 'Dr. Ahmad Fauzi, M.Pd.',
        createdAt: '2026-09-25T09:30:00Z',
      },
    ];
  });

  const [finalSemesterEvals, setFinalSemesterEvals] = useState<FinalSemesterEvaluation[]>(() => {
    try {
      const stored = localStorage.getItem('sim_final_semester_evals');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'eval-fin-1',
        title: 'Evaluasi Akhir Semester Ganjil TA 2026/2027',
        academicYear: '2026/2027',
        semester: 'Ganjil',
        fieldFindings: 'Ketuntasan belajar klasikal semester ganjil mencapai 92.4%. Administrasi rapor digital kurikulum merdeka selesai 100% sebelum pembagian rapor.',
        evaluation: 'Seluruh tujuan pembelajaran pada ATP terlaksana tuntas. Presensi guru rata-rata 95.8% dan ketepatan waktu pengumpulan perangkat meningkat signifikan.',
        solutionFeedback: 'Mempertahankan sistem monitoring presensi real-time WhatsApp dan merencanakan workshop penyusunan asesmen HOTS semester genap.',
        notes: 'Laporan telah divalidasi oleh Kepala Sekolah.',
        fileName: 'Laporan_Evaluasi_Akhir_Semester_Ganjil.pdf',
        fileSize: 245100,
        fileType: 'application/pdf',
        createdBy: 'Dr. Ahmad Fauzi, M.Pd.',
        createdAt: '2026-12-18T10:00:00Z',
      },
    ];
  });

  const [academicMeetings, setAcademicMeetings] = useState<AcademicEvaluationMeeting[]>(() => {
    try {
      const stored = localStorage.getItem('sim_academic_meetings');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'meet-1',
        title: 'Rapat Pleno Evaluasi Kurikulum & Persiapan Semester Baru',
        meetingDate: '2026-09-20',
        academicYear: '2026/2027',
        semester: 'Ganjil',
        curriculumReview: 'Evaluasi kesesuaian alokasi waktu JP pada Kurikulum Merdeka, capaian kompetensi dasar, serta ketersediaan sarana pendukung pembelajaran berdiferensiasi.',
        meetingMinutes: 'Rapat dihadiri 42 dewan guru dan staf kependidikan. Disepakati penguatan literasi dan numerasi 15 menit sebelum KBM dan penjadwalan supervisi klinis.',
        newSemesterPrep: 'Penyusunan jadwal pelajaran baru, pembagian tugas mengajar tambahan, validasi perangkat ajar guru, dan penataan ruang kelas inklusif.',
        fileName: 'Notulensi_Rapat_Evaluasi_Kurikulum.pdf',
        fileSize: 312000,
        fileType: 'application/pdf',
        createdBy: 'Nurul Hidayah, S.Pd.',
        createdAt: '2026-09-20T11:00:00Z',
      },
    ];
  });

  const [qualityReports, setQualityReports] = useState<QualityImprovementReport[]>(() => {
    try {
      const stored = localStorage.getItem('sim_quality_reports');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      {
        id: 'rep-q-1',
        title: 'Laporan Peningkatan Mutu & Analisis Rapor Pendidikan TA 2026/2027',
        academicYear: '2026/2027',
        semester: 'Ganjil',
        background: 'Laporan ini disusun untuk mengevaluasi pemenuhan Standar Nasional Pendidikan (SNP) dan menindaklanjuti capaian indikator prioritas pada platform Rapor Pendidikan Kemendikbudristek.',
        raportPendidikanResult: 'Capaian Kemampuan Literasi berada pada predikat Mahir (82.4%). Kemampuan Numerasi berada pada kategori Cakap (79.1%). Iklim Keamanan Sekolah dan Kebinekaan mencapai status Sangat Baik (Hijau). Perlu penguatan pada dimensi Kualitas Pembelajaran reflektif guru.',
        standards: {
          standarKompetensiLulusan: true,
          standarIsi: true,
          standarProses: true,
          standarPenilaian: true,
          standarTendik: true,
          standarSarpras: true,
          standarPengelolaan: true,
          standarPembiayaan: true,
        },
        generalNotes: 'Secara umum seluruh 8 SNP telah tercapai dengan baik (100%). Tindak lanjut difokuskan pada pemeliharaan sarana digital dan peningkatan kompetensi kepemimpinan pembelajaran guru.',
        createdBy: 'Dr. H. Hendra Wijaya, M.Pd.',
        createdAt: '2026-10-05T08:00:00Z',
      },
    ];
  });

  // Cross-component interaction state
  const [preselectedWhatsAppTeacher, setPreselectedWhatsAppTeacher] = useState<Teacher | null>(null);
  const [preselectedWhatsAppType, setPreselectedWhatsAppType] = useState<NotificationType>('warning_attendance');
  const [preselectedWarningTeacher, setPreselectedWarningTeacher] = useState<Teacher | null>(null);

  // Helper to record activity log in Firestore and local state
  const logActivity = async (
    actionType: ActivityLog['actionType'],
    description: string,
    details: string = '',
    status: 'Sukses' | 'Peringatan' | 'Gagal' = 'Sukses',
    overrideActor?: string
  ) => {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newLog: ActivityLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      actorName: overrideActor || accessSession.accessName || 'Pengguna',
      actionType,
      description,
      details,
      status,
    };

    setActivityLogs((prev) => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'activityLogs', logId), newLog);
    } catch (err) {
      console.warn('Could not save activity log to Firestore:', err);
    }
  };

  // 1. Initialize & Listen to Firestore Collections
  useEffect(() => {
    let unsubscribeTeachers: (() => void) | undefined;
    let unsubscribeSchedules: (() => void) | undefined;
    let unsubscribeAttendance: (() => void) | undefined;
    let unsubscribeLetters: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeCurriculum: (() => void) | undefined;
    let unsubscribeLogs: (() => void) | undefined;
    let unsubscribeTeacherAdmin: (() => void) | undefined;
    let unsubscribeSupervisionProg: (() => void) | undefined;
    let unsubscribeSupervisionInst: (() => void) | undefined;
    let unsubscribeSupervisionSch: (() => void) | undefined;
    let unsubscribeSupervisionRep: (() => void) | undefined;
    let unsubscribeSupervisionFol: (() => void) | undefined;
    let unsubscribeEvalMid: (() => void) | undefined;
    let unsubscribeEvalFin: (() => void) | undefined;
    let unsubscribeEvalMeet: (() => void) | undefined;
    let unsubscribeEvalQual: (() => void) | undefined;

    const initData = async () => {
      try {
        await seedDefaultDataIfEmpty();
        setIsFirebaseConnected(true);
      } catch (err) {
        console.warn('Firebase seeding or connection warning, using fallback listeners:', err);
        setIsFirebaseConnected(false);
      } finally {
        setIsLoading(false);
      }

      // Realtime Listeners
      try {
        unsubscribeTeachers = onSnapshot(
          collection(db, 'teachers'),
          (snapshot) => {
            const list: Teacher[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Teacher));
            setTeachers(list);
            setIsFirebaseConnected(true);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'teachers');
          }
        );

        unsubscribeSchedules = onSnapshot(
          collection(db, 'schedules'),
          (snapshot) => {
            const list: Schedule[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Schedule));
            setSchedules(list);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'schedules');
          }
        );

        unsubscribeAttendance = onSnapshot(
          collection(db, 'attendance'),
          (snapshot) => {
            const list: AttendanceRecord[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as AttendanceRecord));
            setAttendance(list);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'attendance');
          }
        );

        unsubscribeLetters = onSnapshot(
          collection(db, 'warningLetters'),
          (snapshot) => {
            const list: WarningLetter[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as WarningLetter));
            setWarningLetters(list.sort((a, b) => (b.issuedDate > a.issuedDate ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'warningLetters');
          }
        );

        unsubscribeNotifications = onSnapshot(
          collection(db, 'notifications'),
          (snapshot) => {
            const list: NotificationLog[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as NotificationLog));
            setNotifications(list.sort((a, b) => (b.sentAt > a.sentAt ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'notifications');
          }
        );

        unsubscribeProfile = onSnapshot(
          doc(db, 'schoolProfile', 'main'),
          (d) => {
            if (d.exists()) {
              const data = d.data() as SchoolProfile;
              setSchoolProfile(data);
              try {
                localStorage.setItem('sim_school_profile', JSON.stringify(data));
              } catch (e) {}
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'schoolProfile/main');
          }
        );

        unsubscribeCurriculum = onSnapshot(
          collection(db, 'curriculumDocs'),
          (snapshot) => {
            const list: CurriculumDocument[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as CurriculumDocument));
            setCurriculumDocs(list.sort((a, b) => (b.uploadedAt > a.uploadedAt ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'curriculumDocs');
          }
        );

        unsubscribeLogs = onSnapshot(
          collection(db, 'activityLogs'),
          (snapshot) => {
            const list: ActivityLog[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as ActivityLog));
            setActivityLogs(list.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'activityLogs');
          }
        );

        // Teacher Admin Listeners
        unsubscribeTeacherAdmin = onSnapshot(
          collection(db, 'teacherAdminDocs'),
          (snapshot) => {
            const list: TeacherAdminDoc[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as TeacherAdminDoc));
            setTeacherAdminDocs(list.sort((a, b) => (b.uploadedAt > a.uploadedAt ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'teacherAdminDocs');
          }
        );

        // Academic Supervision Listeners
        unsubscribeSupervisionProg = onSnapshot(
          collection(db, 'supervisionPrograms'),
          (snapshot) => {
            const list: SupervisionProgram[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as SupervisionProgram));
            setSupervisionPrograms(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'supervisionPrograms');
          }
        );

        unsubscribeSupervisionInst = onSnapshot(
          collection(db, 'supervisionInstruments'),
          (snapshot) => {
            const list: SupervisionInstrument[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as SupervisionInstrument));
            setSupervisionInstruments(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'supervisionInstruments');
          }
        );

        unsubscribeSupervisionSch = onSnapshot(
          collection(db, 'supervisionSchedules'),
          (snapshot) => {
            const list: SupervisionSchedule[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as SupervisionSchedule));
            setSupervisionSchedules(list.sort((a, b) => (b.dayDate > a.dayDate ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'supervisionSchedules');
          }
        );

        unsubscribeSupervisionRep = onSnapshot(
          collection(db, 'supervisionReports'),
          (snapshot) => {
            const list: SupervisionReport[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as SupervisionReport));
            setSupervisionReports(list.sort((a, b) => (b.uploadedAt > a.uploadedAt ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'supervisionReports');
          }
        );

        unsubscribeSupervisionFol = onSnapshot(
          collection(db, 'supervisionFollowUps'),
          (snapshot) => {
            const list: SupervisionFollowUp[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as SupervisionFollowUp));
            setSupervisionFollowUps(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'supervisionFollowUps');
          }
        );

        // Evaluasi dan Monitoring Listeners
        unsubscribeEvalMid = onSnapshot(
          collection(db, 'evalMidSemester'),
          (snapshot) => {
            const list: MidSemesterEvaluation[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as MidSemesterEvaluation));
            if (list.length > 0) {
              setMidSemesterEvals(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
              try {
                localStorage.setItem('sim_mid_semester_evals', JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'evalMidSemester');
          }
        );

        unsubscribeEvalFin = onSnapshot(
          collection(db, 'evalFinalSemester'),
          (snapshot) => {
            const list: FinalSemesterEvaluation[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as FinalSemesterEvaluation));
            if (list.length > 0) {
              setFinalSemesterEvals(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
              try {
                localStorage.setItem('sim_final_semester_evals', JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'evalFinalSemester');
          }
        );

        unsubscribeEvalMeet = onSnapshot(
          collection(db, 'evalMeetings'),
          (snapshot) => {
            const list: AcademicEvaluationMeeting[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as AcademicEvaluationMeeting));
            if (list.length > 0) {
              setAcademicMeetings(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
              try {
                localStorage.setItem('sim_academic_meetings', JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'evalMeetings');
          }
        );

        unsubscribeEvalQual = onSnapshot(
          collection(db, 'evalQualityReports'),
          (snapshot) => {
            const list: QualityImprovementReport[] = [];
            snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as QualityImprovementReport));
            if (list.length > 0) {
              setQualityReports(list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)));
              try {
                localStorage.setItem('sim_quality_reports', JSON.stringify(list));
              } catch (e) {}
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, 'evalQualityReports');
          }
        );
      } catch (err) {
        console.error('Failed to attach listeners', err);
      }
    };

    initData();

    return () => {
      if (unsubscribeTeachers) unsubscribeTeachers();
      if (unsubscribeSchedules) unsubscribeSchedules();
      if (unsubscribeAttendance) unsubscribeAttendance();
      if (unsubscribeLetters) unsubscribeLetters();
      if (unsubscribeNotifications) unsubscribeNotifications();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeCurriculum) unsubscribeCurriculum();
      if (unsubscribeLogs) unsubscribeLogs();
      if (unsubscribeTeacherAdmin) unsubscribeTeacherAdmin();
      if (unsubscribeSupervisionProg) unsubscribeSupervisionProg();
      if (unsubscribeSupervisionInst) unsubscribeSupervisionInst();
      if (unsubscribeSupervisionSch) unsubscribeSupervisionSch();
      if (unsubscribeSupervisionRep) unsubscribeSupervisionRep();
      if (unsubscribeSupervisionFol) unsubscribeSupervisionFol();
      if (unsubscribeEvalMid) unsubscribeEvalMid();
      if (unsubscribeEvalFin) unsubscribeEvalFin();
      if (unsubscribeEvalMeet) unsubscribeEvalMeet();
      if (unsubscribeEvalQual) unsubscribeEvalQual();
    };
  }, []);

  // 2. Computed Summaries for Attendance and JP Fulfillment per Teacher
  const summaries: TeacherAttendanceSummary[] = useMemo(() => {
    return teachers.map((teacher) => {
      const teacherRecords = attendance.filter((a) => a.teacherId === teacher.id);
      const teacherSchedules = schedules.filter((s) => s.teacherId === teacher.id);

      const assignedJp = teacherSchedules.reduce((acc, s) => acc + s.totalJp, 0);

      const present = teacherRecords.filter((a) => a.status === 'Hadir').length;
      const permit = teacherRecords.filter((a) => a.status === 'Izin').length;
      const sick = teacherRecords.filter((a) => a.status === 'Sakit').length;
      const absent = teacherRecords.filter((a) => a.status === 'Alpa').length;
      const dinasLuar = teacherRecords.filter((a) => a.status === 'Dinas Luar').length;

      const totalScheduledDays = teacherRecords.length || 0;
      const effectiveDays = present + dinasLuar;
      const attendancePercentage =
        totalScheduledDays > 0 ? (effectiveDays / totalScheduledDays) * 100 : 100;

      const isUnderThreshold = totalScheduledDays > 0 && attendancePercentage < 90;

      return {
        teacher,
        totalScheduledDays,
        present,
        permit,
        sick,
        absent,
        dinasLuar,
        attendancePercentage,
        isUnderThreshold,
        assignedJp,
      };
    });
  }, [teachers, attendance, schedules]);

  // Protected Tab Navigation Handler (Triggered from Navbar & Dashboard Shortcuts)
  const handleProtectedTabChange = (tab: NavigationTab) => {
    if (tab === 'dashboard') {
      setActiveTab('dashboard');
      return;
    }

    if (!accessSession.isVerified) {
      handleRequestVerification(tab);
      return;
    }

    setActiveTab(tab);
  };

  const handleRequestVerification = (targetTab: NavigationTab) => {
    setPendingTargetTab(targetTab);
    setIsVerificationModalOpen(true);
  };

  const handleVerificationSuccess = (actorName: string) => {
    const newSession: AccessSession = {
      isVerified: true,
      accessName: actorName,
      verifiedAt: new Date().toISOString(),
    };
    setAccessSession(newSession);
    try {
      sessionStorage.setItem('sim_access_session', JSON.stringify(newSession));
    } catch (e) {
      // Ignore
    }

    logActivity(
      'Keamanan',
      `Verifikasi passkey berhasil untuk pengakses: ${actorName}`,
      `Membuka akses menu: ${pendingTargetTab || 'Sistem'}`,
      'Sukses',
      actorName
    );

    setIsVerificationModalOpen(false);
    if (pendingTargetTab) {
      setActiveTab(pendingTargetTab);
      setPendingTargetTab(null);
    }
  };

  const handleVerificationFailed = (actorName: string, reason: string) => {
    logActivity(
      'Keamanan',
      `Percobaan verifikasi passkey gagal oleh: ${actorName || 'Tanpa Nama'}`,
      `Alasan: ${reason}`,
      'Peringatan',
      actorName || 'Tamu'
    );
  };

  const handleLockSession = () => {
    const actor = accessSession.accessName || 'Pengguna';
    logActivity('Keamanan', `Sesi akses dikunci oleh: ${actor}`, 'Kembali ke mode aman (Dashboard)', 'Sukses');
    const resetSession = { isVerified: false, accessName: '', verifiedAt: '' };
    setAccessSession(resetSession);
    try {
      sessionStorage.removeItem('sim_access_session');
    } catch (e) {
      // Ignore
    }
    setActiveTab('dashboard');
  };

  // CRUD Actions with Automatic Optimistic Updates & Activity Logging

  // 1. Teacher CRUD
  const handleSaveTeacher = async (teacherData: Partial<Teacher>) => {
    const id = teacherData.id || `tch-${Date.now()}`;
    const docRef = doc(db, 'teachers', id);
    const isNew = !teacherData.id;
    const dataToSave = {
      ...teacherData,
      id,
      updatedAt: new Date().toISOString(),
      ...(isNew ? { createdAt: new Date().toISOString() } : {}),
    };

    setTeachers((prev) => {
      const index = prev.findIndex((t) => t.id === id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...dataToSave } as Teacher;
        return updated;
      }
      return [...prev, dataToSave as Teacher];
    });

    try {
      await setDoc(docRef, dataToSave, { merge: true });
      await logActivity(
        'Data Guru',
        `${isNew ? 'Menambahkan' : 'Memperbarui'} Data Guru: ${teacherData.name}`,
        `NIP: ${teacherData.nip || '-'} | Mapel: ${teacherData.subject || '-'}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teachers/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    const teacherToDelete = teachers.find((t) => t.id === id);
    const teacherName = teacherToDelete?.name || id;

    // Optimistic UI update
    setTeachers((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteDoc(doc(db, 'teachers', id));
      await logActivity(
        'Data Guru',
        `Menghapus Data Guru: ${teacherName}`,
        `ID Guru: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teachers/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 2. Schedule CRUD
  const handleSaveSchedule = async (scheduleData: Partial<Schedule>) => {
    const id = scheduleData.id || `sch-${Date.now()}`;
    const docRef = doc(db, 'schedules', id);
    const isNew = !scheduleData.id;
    const dataToSave = {
      ...scheduleData,
      id,
      updatedAt: new Date().toISOString(),
      ...(isNew ? { createdAt: new Date().toISOString() } : {}),
    };

    setSchedules((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...dataToSave } as Schedule;
        return updated;
      }
      return [...prev, dataToSave as Schedule];
    });

    try {
      await setDoc(docRef, dataToSave, { merge: true });
      await logActivity(
        'Jadwal & JP',
        `${isNew ? 'Menambahkan' : 'Memperbarui'} Jadwal: ${scheduleData.subject} (${scheduleData.classGrade})`,
        `Guru: ${scheduleData.teacherName} | Hari: ${scheduleData.day} | ${scheduleData.totalJp} JP`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `schedules/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    const schToDelete = schedules.find((s) => s.id === id);

    // Optimistic UI update
    setSchedules((prev) => prev.filter((s) => s.id !== id));

    try {
      await deleteDoc(doc(db, 'schedules', id));
      await logActivity(
        'Jadwal & JP',
        `Menghapus Jadwal: ${schToDelete?.subject || 'Jadwal'} (${schToDelete?.classGrade || '-'})`,
        `Guru: ${schToDelete?.teacherName || '-'} | Hari: ${schToDelete?.day || '-'}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `schedules/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 3. Attendance CRUD
  const handleSaveDailyAttendance = async (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const copy = [...prev];
      records.forEach((rec) => {
        const idx = copy.findIndex((a) => a.id === rec.id);
        if (idx >= 0) copy[idx] = rec;
        else copy.push(rec);
      });
      return copy;
    });

    try {
      const batch = writeBatch(db);
      records.forEach((rec) => {
        const ref = doc(db, 'attendance', rec.id);
        batch.set(ref, rec, { merge: true });
      });
      await batch.commit();

      const dateStr = records[0]?.date || 'hari ini';
      await logActivity(
        'Presensi',
        `Merekap Presensi Harian Guru (${records.length} data)`,
        `Tanggal: ${dateStr}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'attendance');
      console.warn('Firestore write notice:', error);
    }
  };

  // 4. Warning Letter CRUD
  const handleSaveWarningLetter = async (letterData: Partial<WarningLetter>) => {
    const id = letterData.id || `let-${Date.now()}`;
    const docRef = doc(db, 'warningLetters', id);
    const isNew = !letterData.id;
    const dataToSave = {
      ...letterData,
      id,
      ...(isNew ? { createdAt: new Date().toISOString() } : {}),
    };

    setWarningLetters((prev) => {
      const index = prev.findIndex((l) => l.id === id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...dataToSave } as WarningLetter;
        return updated;
      }
      return [dataToSave as WarningLetter, ...prev];
    });

    try {
      await setDoc(docRef, dataToSave, { merge: true });
      await logActivity(
        'Surat Pemanggilan',
        `${isNew ? 'Menerbitkan' : 'Memperbarui'} ${letterData.letterType}: ${letterData.teacherName}`,
        `No: ${letterData.letterNumber} | Kehadiran: ${letterData.attendanceRate?.toFixed(1)}%`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `warningLetters/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteWarningLetter = async (id: string) => {
    const letToDelete = warningLetters.find((l) => l.id === id);

    // Optimistic UI update
    setWarningLetters((prev) => prev.filter((l) => l.id !== id));

    try {
      await deleteDoc(doc(db, 'warningLetters', id));
      await logActivity(
        'Surat Pemanggilan',
        `Menghapus Surat Pemanggilan: ${letToDelete?.letterNumber || id}`,
        `Guru: ${letToDelete?.teacherName || '-'} | Jenis: ${letToDelete?.letterType || '-'}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `warningLetters/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 5. WhatsApp Notification Log
  const handleLogNotification = async (notifData: Omit<NotificationLog, 'id'>) => {
    const id = `notif-${Date.now()}`;
    const docRef = doc(db, 'notifications', id);
    const fullData: NotificationLog = { ...notifData, id };

    setNotifications((prev) => [fullData, ...prev]);

    try {
      await setDoc(docRef, fullData);
      await logActivity(
        'WhatsApp',
        `Mengirim Notifikasi WA ke: ${notifData.teacherName}`,
        `Tipe: ${notifData.type} | Tujuan: ${notifData.phone}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notifications/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  // 6. Curriculum Document CRUD (Master & Plan)
  const handleSaveCurriculumDocument = async (
    docData: Omit<CurriculumDocument, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `doc-${Date.now()}`;
    const docRef = doc(db, 'curriculumDocs', id);
    const fullData: CurriculumDocument = {
      ...docData,
      id,
    };

    setCurriculumDocs((prev) => {
      const index = prev.findIndex((d) => d.id === id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = fullData;
        return updated;
      }
      return [fullData, ...prev];
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      const sectionLabel = docData.section === 'master' ? 'Kurikulum Induk' : 'Perencanaan Kurikulum';
      await logActivity(
        sectionLabel as any,
        `${existingId ? 'Memperbarui' : 'Mengunggah'} Dokumen: ${docData.title}`,
        `Submenu: ${docData.subcategory} | Berkas: ${docData.fileName}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `curriculumDocs/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteCurriculumDocument = async (id: string, title: string) => {
    const docToDelete = curriculumDocs.find((d) => d.id === id);
    const sectionLabel = docToDelete?.section === 'plan' ? 'Perencanaan Kurikulum' : 'Kurikulum Induk';

    // Optimistic UI update immediately
    setCurriculumDocs((prev) => prev.filter((d) => d.id !== id));

    try {
      await deleteDoc(doc(db, 'curriculumDocs', id));
      await logActivity(
        sectionLabel as any,
        `Menghapus Dokumen: ${title}`,
        `Submenu: ${docToDelete?.subcategory || '-'} | Berkas: ${docToDelete?.fileName || '-'}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `curriculumDocs/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  const handleLogCurriculumDownload = (docTitle: string) => {
    logActivity('Kurikulum Induk', `Mengunduh Berkas Dokumen: ${docTitle}`, '', 'Sukses');
  };

  // 7. Administrasi Guru CRUD
  const handleSaveTeacherAdminDoc = async (
    docData: Omit<TeacherAdminDoc, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `tadmin-${Date.now()}`;
    const docRef = doc(db, 'teacherAdminDocs', id);
    const fullData: TeacherAdminDoc = {
      ...docData,
      id,
    };

    setTeacherAdminDocs((prev) => {
      const index = prev.findIndex((d) => d.id === id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = fullData;
        return updated;
      }
      return [fullData, ...prev];
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Administrasi Guru',
        `${existingId ? 'Memperbarui' : 'Menambahkan'} ${docData.type === 'sk_tugas' ? 'SK Beban Tugas' : 'Jadwal Pelajaran'}: ${docData.title}`,
        `Guru: ${docData.teacherName || '-'} | Berkas: ${docData.fileName || '-'}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `teacherAdminDocs/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteTeacherAdminDoc = async (id: string, title: string) => {
    const docToDelete = teacherAdminDocs.find((d) => d.id === id);

    // Optimistic UI update
    setTeacherAdminDocs((prev) => prev.filter((d) => d.id !== id));

    try {
      await deleteDoc(doc(db, 'teacherAdminDocs', id));
      await logActivity(
        'Administrasi Guru',
        `Menghapus Dokumen Administrasi Guru: ${title}`,
        `Submenu: ${docToDelete?.type || '-'} | Berkas: ${docToDelete?.fileName || '-'}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teacherAdminDocs/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  const handleLogTeacherAdminDownload = (docTitle: string) => {
    logActivity('Administrasi Guru', `Mengunduh Berkas Administrasi Guru: ${docTitle}`, '', 'Sukses');
  };

  // 8. Supervisi Akademik CRUD
  // 8a. Program Supervisi Tahunan
  const handleSaveSupervisionProgram = async (
    data: Omit<SupervisionProgram, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `prog-${Date.now()}`;
    const docRef = doc(db, 'supervisionPrograms', id);
    const fullData: SupervisionProgram = { ...data, id };

    setSupervisionPrograms((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fullData;
        return updated;
      }
      return [fullData, ...prev];
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Supervisi Akademik',
        `${existingId ? 'Memperbarui' : 'Menyusun'} Program Supervisi Tahunan: ${data.title}`,
        `Tahun Pelajaran: ${data.academicYear}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `supervisionPrograms/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteSupervisionProgram = async (id: string, title: string) => {
    setSupervisionPrograms((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'supervisionPrograms', id));
      await logActivity(
        'Supervisi Akademik',
        `Menghapus Program Supervisi Tahunan: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supervisionPrograms/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 8b. Instrumen Supervisi
  const handleSaveSupervisionInstrument = async (
    data: Omit<SupervisionInstrument, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `inst-${Date.now()}`;
    const docRef = doc(db, 'supervisionInstruments', id);
    const fullData: SupervisionInstrument = { ...data, id };

    setSupervisionInstruments((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fullData;
        return updated;
      }
      return [fullData, ...prev];
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Supervisi Akademik',
        `${existingId ? 'Memperbarui' : 'Menilai'} Instrumen Supervisi: ${data.teacherName}`,
        `Mapel: ${data.subject} | Predikat: ${data.overallGrade || '-'}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `supervisionInstruments/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteSupervisionInstrument = async (id: string, title: string) => {
    setSupervisionInstruments((prev) => prev.filter((item) => item.id !== id));
    try {
      await deleteDoc(doc(db, 'supervisionInstruments', id));
      await logActivity(
        'Supervisi Akademik',
        `Menghapus Instrumen Penilaian: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supervisionInstruments/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 8c. Jadwal Supervisi
  const handleSaveSupervisionSchedule = async (
    data: Omit<SupervisionSchedule, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `ssch-${Date.now()}`;
    const docRef = doc(db, 'supervisionSchedules', id);
    const fullData: SupervisionSchedule = { ...data, id };

    setSupervisionSchedules((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fullData;
        return updated;
      }
      return [fullData, ...prev];
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Supervisi Akademik',
        `${existingId ? 'Memperbarui' : 'Menjadwalkan'} Observasi Kelas: ${data.teacherName}`,
        `Tanggal: ${data.dayDate} | Kelas: ${data.classGrade} | Supervisor: ${data.supervisorName}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `supervisionSchedules/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteSupervisionSchedule = async (id: string, title: string) => {
    setSupervisionSchedules((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteDoc(doc(db, 'supervisionSchedules', id));
      await logActivity(
        'Supervisi Akademik',
        `Menghapus Jadwal Supervisi: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supervisionSchedules/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 8d. Laporan Supervisi
  const handleSaveSupervisionReport = async (
    data: Omit<SupervisionReport, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `srep-${Date.now()}`;
    const docRef = doc(db, 'supervisionReports', id);
    const fullData: SupervisionReport = { ...data, id };

    setSupervisionReports((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fullData;
        return updated;
      }
      return [fullData, ...prev];
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Supervisi Akademik',
        `${existingId ? 'Memperbarui' : 'Mengunggah'} Laporan Supervisi: ${data.title}`,
        `Berkas: ${data.fileName} | Semester: ${data.semester}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `supervisionReports/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteSupervisionReport = async (id: string, title: string) => {
    setSupervisionReports((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteDoc(doc(db, 'supervisionReports', id));
      await logActivity(
        'Supervisi Akademik',
        `Menghapus Laporan Supervisi: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supervisionReports/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 8e. Tindak Lanjut Supervisi
  const handleSaveSupervisionFollowUp = async (
    data: Omit<SupervisionFollowUp, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `sfol-${Date.now()}`;
    const docRef = doc(db, 'supervisionFollowUps', id);
    const fullData: SupervisionFollowUp = { ...data, id };

    setSupervisionFollowUps((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = fullData;
        return updated;
      }
      return [fullData, ...prev];
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Supervisi Akademik',
        `${existingId ? 'Memperbarui' : 'Merumuskan'} Tindak Lanjut Supervisi: ${data.teacherName}`,
        `Status: ${data.status} | Mapel: ${data.subject}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `supervisionFollowUps/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteSupervisionFollowUp = async (id: string, title: string) => {
    setSupervisionFollowUps((prev) => prev.filter((f) => f.id !== id));
    try {
      await deleteDoc(doc(db, 'supervisionFollowUps', id));
      await logActivity(
        'Supervisi Akademik',
        `Menghapus Rencana Tindak Lanjut: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `supervisionFollowUps/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  const handleLogSupervisionDownload = (title: string) => {
    logActivity('Supervisi Akademik', `Mengunduh Berkas Laporan Supervisi: ${title}`, '', 'Sukses');
  };

  // 9. Evaluasi & Monitoring CRUD
  // 9a. Evaluasi Tengah Semester
  const handleSaveMidSemester = async (
    data: Omit<MidSemesterEvaluation, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `emid-${Date.now()}`;
    const docRef = doc(db, 'evalMidSemester', id);
    const fullData: MidSemesterEvaluation = { ...data, id };

    setMidSemesterEvals((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      const updated = idx >= 0 ? [...prev] : [fullData, ...prev];
      if (idx >= 0) updated[idx] = fullData;
      try {
        localStorage.setItem('sim_mid_semester_evals', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Evaluasi & Monitoring',
        `${existingId ? 'Memperbarui' : 'Menambahkan'} Evaluasi Tengah Semester: ${data.title}`,
        `Semester: ${data.semester} | TA: ${data.academicYear}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `evalMidSemester/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteMidSemester = async (id: string, title: string) => {
    setMidSemesterEvals((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem('sim_mid_semester_evals', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });

    try {
      await deleteDoc(doc(db, 'evalMidSemester', id));
      await logActivity(
        'Evaluasi & Monitoring',
        `Menghapus Evaluasi Tengah Semester: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `evalMidSemester/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 9b. Evaluasi Akhir Semester
  const handleSaveFinalSemester = async (
    data: Omit<FinalSemesterEvaluation, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `efin-${Date.now()}`;
    const docRef = doc(db, 'evalFinalSemester', id);
    const fullData: FinalSemesterEvaluation = { ...data, id };

    setFinalSemesterEvals((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      const updated = idx >= 0 ? [...prev] : [fullData, ...prev];
      if (idx >= 0) updated[idx] = fullData;
      try {
        localStorage.setItem('sim_final_semester_evals', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Evaluasi & Monitoring',
        `${existingId ? 'Memperbarui' : 'Menambahkan'} Evaluasi Akhir Semester: ${data.title}`,
        `Semester: ${data.semester} | TA: ${data.academicYear}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `evalFinalSemester/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteFinalSemester = async (id: string, title: string) => {
    setFinalSemesterEvals((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem('sim_final_semester_evals', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });

    try {
      await deleteDoc(doc(db, 'evalFinalSemester', id));
      await logActivity(
        'Evaluasi & Monitoring',
        `Menghapus Evaluasi Akhir Semester: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `evalFinalSemester/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 9c. Rapat Evaluasi Akademik
  const handleSaveAcademicMeeting = async (
    data: Omit<AcademicEvaluationMeeting, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `emeet-${Date.now()}`;
    const docRef = doc(db, 'evalMeetings', id);
    const fullData: AcademicEvaluationMeeting = { ...data, id };

    setAcademicMeetings((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      const updated = idx >= 0 ? [...prev] : [fullData, ...prev];
      if (idx >= 0) updated[idx] = fullData;
      try {
        localStorage.setItem('sim_academic_meetings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      await logActivity(
        'Evaluasi & Monitoring',
        `${existingId ? 'Memperbarui' : 'Mendokumentasikan'} Rapat Evaluasi Akademik: ${data.title}`,
        `Tanggal: ${data.meetingDate} | Semester: ${data.semester}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `evalMeetings/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteAcademicMeeting = async (id: string, title: string) => {
    setAcademicMeetings((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('sim_academic_meetings', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });

    try {
      await deleteDoc(doc(db, 'evalMeetings', id));
      await logActivity(
        'Evaluasi & Monitoring',
        `Menghapus Rapat Evaluasi Akademik: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `evalMeetings/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  // 9d. Laporan Peningkatan Mutu (8 SNP)
  const handleSaveQualityReport = async (
    data: Omit<QualityImprovementReport, 'id'>,
    existingId?: string
  ) => {
    const id = existingId || `equal-${Date.now()}`;
    const docRef = doc(db, 'evalQualityReports', id);
    const fullData: QualityImprovementReport = { ...data, id };

    setQualityReports((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      const updated = idx >= 0 ? [...prev] : [fullData, ...prev];
      if (idx >= 0) updated[idx] = fullData;
      try {
        localStorage.setItem('sim_quality_reports', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    try {
      await setDoc(docRef, fullData, { merge: true });
      const achievedCount = Object.values(data.standards || {}).filter(Boolean).length;
      await logActivity(
        'Evaluasi & Monitoring',
        `${existingId ? 'Memperbarui' : 'Menyusun'} Laporan Peningkatan Mutu: ${data.title}`,
        `Capaian: ${achievedCount}/8 SNP Terpenuhi | TA: ${data.academicYear}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `evalQualityReports/${id}`);
      console.warn('Firestore write notice:', error);
    }
  };

  const handleDeleteQualityReport = async (id: string, title: string) => {
    setQualityReports((prev) => {
      const filtered = prev.filter((q) => q.id !== id);
      try {
        localStorage.setItem('sim_quality_reports', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });

    try {
      await deleteDoc(doc(db, 'evalQualityReports', id));
      await logActivity(
        'Evaluasi & Monitoring',
        `Menghapus Laporan Mutu: ${title}`,
        `ID: ${id}`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `evalQualityReports/${id}`);
      console.warn('Firestore delete notice:', error);
    }
  };

  const handleLogEvaluationDownload = (title: string, submenu: string) => {
    logActivity('Evaluasi & Monitoring', `Mengunduh Berkas ${submenu}: ${title}`, '', 'Sukses');
  };

  // 10. School Profile & Passkey Updates (Fixed persistent storage)
  const handleSaveSchoolProfile = async (profileData: Partial<SchoolProfile>) => {
    const docRef = doc(db, 'schoolProfile', 'main');
    const updated: SchoolProfile = {
      ...schoolProfile,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };

    // Immediately persist to React state & localStorage
    setSchoolProfile(updated);
    try {
      localStorage.setItem('sim_school_profile', JSON.stringify(updated));
    } catch (e) {}

    try {
      await setDoc(docRef, updated, { merge: true });
      await logActivity(
        'Pengaturan',
        'Memperbarui Profil Sekolah & Kepala Sekolah',
        `Sekolah: ${updated.schoolName} | Kepala Sekolah: ${updated.principalName} (NIP: ${updated.principalNip})`,
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'schoolProfile/main');
      console.warn('Firestore write notice for school profile:', error);
    }
  };

  const handleUpdatePasskey = async (newPasskey: string) => {
    const docRef = doc(db, 'schoolProfile', 'main');
    const updated: SchoolProfile = {
      ...schoolProfile,
      accessPasskey: newPasskey,
      updatedAt: new Date().toISOString(),
    };
    setSchoolProfile(updated);
    try {
      localStorage.setItem('sim_school_profile', JSON.stringify(updated));
    } catch (e) {}

    try {
      await setDoc(docRef, { accessPasskey: newPasskey }, { merge: true });
      await logActivity(
        'Pengaturan',
        'Memperbarui Kode Passkey Akses Keamanan',
        'Passkey berhasil diperbarui oleh petugas resmi',
        'Sukses'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'schoolProfile/main');
      console.warn('Firestore passkey update notice:', error);
    }
  };

  const handleClearAllDummyData = async () => {
    try {
      await clearAllDummyData();
      setTeachers([]);
      setSchedules([]);
      setAttendance([]);
      setWarningLetters([]);
      setNotifications([]);
      setCurriculumDocs([]);
      setTeacherAdminDocs([]);
      setSupervisionPrograms([]);
      setSupervisionInstruments([]);
      setSupervisionSchedules([]);
      setSupervisionReports([]);
      setSupervisionFollowUps([]);

      await logActivity(
        'Pengaturan',
        'Menghapus Semua Data Dummy / Uji Coba',
        'Database telah dibersihkan siap untuk data riil sekolah',
        'Sukses'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleResetSeedData = async () => {
    await seedDefaultDataIfEmpty(true);
    const tSnap = await getDocs(collection(db, 'teachers'));
    const tList: Teacher[] = [];
    tSnap.forEach((d) => tList.push({ id: d.id, ...d.data() } as Teacher));
    setTeachers(tList);
  };

  const handleClearLogs = async () => {
    try {
      const snap = await getDocs(collection(db, 'activityLogs'));
      for (const d of snap.docs) {
        await deleteDoc(doc(db, 'activityLogs', d.id));
      }
      setActivityLogs([]);
    } catch (err) {
      console.error('Error clearing activity logs:', err);
      setActivityLogs([]);
    }
  };

  // Cross-Navigation helpers
  const handleOpenLetterModal = (teacher: Teacher, summary?: TeacherAttendanceSummary) => {
    setPreselectedWarningTeacher(teacher);
    handleProtectedTabChange('letters');
  };

  const handleOpenWhatsAppModal = (
    teacher: Teacher,
    type: NotificationType = 'warning_attendance'
  ) => {
    setPreselectedWhatsAppTeacher(teacher);
    setPreselectedWhatsAppType(type);
    handleProtectedTabChange('whatsapp');
  };

  const criticalCount = summaries.filter((s) => s.isUnderThreshold && s.teacher.active).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {/* Top Navigation Bar with Responsive Drawer & Hamburger Toggle */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleProtectedTabChange}
        schoolProfile={schoolProfile}
        warningCount={criticalCount}
        isFirebaseConnected={isFirebaseConnected}
        accessSession={accessSession}
        onRequestVerification={handleRequestVerification}
        onLockSession={handleLockSession}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-indigo-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-700">
                Menghubungkan ke Database Real-time Firebase...
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                teachers={teachers}
                schedules={schedules}
                attendance={attendance}
                summaries={summaries}
                schoolProfile={schoolProfile}
                activityLogs={activityLogs}
                onTabChange={handleProtectedTabChange}
                onOpenLetterModal={handleOpenLetterModal}
                onOpenWhatsAppModal={handleOpenWhatsAppModal}
                onClearLogs={handleClearLogs}
                accessSession={accessSession}
                onRequestVerification={handleRequestVerification}
              />
            )}

            {activeTab === 'curriculum_master' && (
              <CurriculumMasterManagement
                documents={curriculumDocs}
                schoolProfile={schoolProfile}
                currentActorName={accessSession.accessName}
                onSaveDocument={handleSaveCurriculumDocument}
                onDeleteDocument={handleDeleteCurriculumDocument}
                onLogDownload={handleLogCurriculumDownload}
              />
            )}

            {activeTab === 'curriculum_plan' && (
              <CurriculumPlanManagement
                documents={curriculumDocs}
                schoolProfile={schoolProfile}
                currentActorName={accessSession.accessName}
                onSaveDocument={handleSaveCurriculumDocument}
                onDeleteDocument={handleDeleteCurriculumDocument}
                onLogDownload={handleLogCurriculumDownload}
              />
            )}

            {activeTab === 'teacher_admin' && (
              <TeacherAdminManagement
                documents={teacherAdminDocs}
                schoolProfile={schoolProfile}
                currentActorName={accessSession.accessName}
                onSaveDocument={handleSaveTeacherAdminDoc}
                onDeleteDocument={handleDeleteTeacherAdminDoc}
                onLogDownload={handleLogTeacherAdminDownload}
              />
            )}

            {activeTab === 'academic_supervision' && (
              <AcademicSupervisionManagement
                programs={supervisionPrograms}
                instruments={supervisionInstruments}
                schedules={supervisionSchedules}
                reports={supervisionReports}
                followUps={supervisionFollowUps}
                schoolProfile={schoolProfile}
                teachers={teachers}
                currentActorName={accessSession.accessName}
                onSaveProgram={handleSaveSupervisionProgram}
                onDeleteProgram={handleDeleteSupervisionProgram}
                onSaveInstrument={handleSaveSupervisionInstrument}
                onDeleteInstrument={handleDeleteSupervisionInstrument}
                onSaveSchedule={handleSaveSupervisionSchedule}
                onDeleteSchedule={handleDeleteSupervisionSchedule}
                onSaveReport={handleSaveSupervisionReport}
                onDeleteReport={handleDeleteSupervisionReport}
                onSaveFollowUp={handleSaveSupervisionFollowUp}
                onDeleteFollowUp={handleDeleteSupervisionFollowUp}
                onLogDownload={handleLogSupervisionDownload}
              />
            )}

            {activeTab === 'evaluation_monitoring' && (
              <EvaluationMonitoringManagement
                schoolProfile={schoolProfile}
                currentActorName={accessSession.accessName}
                midSemesterEvals={midSemesterEvals}
                finalSemesterEvals={finalSemesterEvals}
                academicMeetings={academicMeetings}
                qualityReports={qualityReports}
                onSaveMidSemester={handleSaveMidSemester}
                onDeleteMidSemester={handleDeleteMidSemester}
                onSaveFinalSemester={handleSaveFinalSemester}
                onDeleteFinalSemester={handleDeleteFinalSemester}
                onSaveAcademicMeeting={handleSaveAcademicMeeting}
                onDeleteAcademicMeeting={handleDeleteAcademicMeeting}
                onSaveQualityReport={handleSaveQualityReport}
                onDeleteQualityReport={handleDeleteQualityReport}
                onLogDownload={handleLogEvaluationDownload}
              />
            )}

            {activeTab === 'teachers' && (
              <TeacherManagement
                teachers={teachers}
                schedules={schedules}
                onSaveTeacher={handleSaveTeacher}
                onDeleteTeacher={handleDeleteTeacher}
                onOpenWhatsAppModal={handleOpenWhatsAppModal}
              />
            )}

            {activeTab === 'schedules' && (
              <ScheduleDistribution
                schedules={schedules}
                teachers={teachers}
                onSaveSchedule={handleSaveSchedule}
                onDeleteSchedule={handleDeleteSchedule}
              />
            )}

            {activeTab === 'attendance' && (
              <AttendanceRecap
                teachers={teachers}
                attendance={attendance}
                summaries={summaries}
                onSaveDailyAttendance={handleSaveDailyAttendance}
                onOpenLetterModal={handleOpenLetterModal}
                onOpenWhatsAppModal={handleOpenWhatsAppModal}
              />
            )}

            {activeTab === 'letters' && (
              <WarningLetterGenerator
                warningLetters={warningLetters}
                teachers={teachers}
                summaries={summaries}
                schoolProfile={schoolProfile}
                onSaveLetter={handleSaveWarningLetter}
                onDeleteLetter={handleDeleteWarningLetter}
                onOpenWhatsAppModal={handleOpenWhatsAppModal}
              />
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppNotifications
                teachers={teachers}
                schedules={schedules}
                summaries={summaries}
                warningLetters={warningLetters}
                schoolProfile={schoolProfile}
                notifications={notifications}
                onLogNotification={handleLogNotification}
                preselectedTeacher={preselectedWhatsAppTeacher}
                preselectedType={preselectedWhatsAppType}
              />
            )}

            {activeTab === 'report' && (
              <MonthlyReport
                teachers={teachers}
                schedules={schedules}
                summaries={summaries}
                warningLetters={warningLetters}
                schoolProfile={schoolProfile}
              />
            )}

            {activeTab === 'settings' && (
              <SchoolSettings
                schoolProfile={schoolProfile}
                onSaveProfile={handleSaveSchoolProfile}
                onResetSeedData={handleResetSeedData}
                onClearDummyData={handleClearAllDummyData}
                onUpdatePasskey={handleUpdatePasskey}
                isFirebaseConnected={isFirebaseConnected}
                currentActorName={accessSession.accessName}
              />
            )}
          </>
        )}
      </main>

      {/* Access Verification Modal (No passkey hint shown) */}
      <AccessVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setPendingTargetTab(null);
        }}
        onSuccess={handleVerificationSuccess}
        onRecordFailedAttempt={handleVerificationFailed}
        currentPasskey={schoolProfile.accessPasskey || '123456'}
        targetTabName={
          pendingTargetTab === 'curriculum_master'
            ? 'Dokumen Induk Kurikulum'
            : pendingTargetTab === 'curriculum_plan'
            ? 'Perencanaan Kurikulum'
            : pendingTargetTab === 'teacher_admin'
            ? 'Administrasi Guru'
            : pendingTargetTab === 'academic_supervision'
            ? 'Supervisi Akademik'
            : pendingTargetTab === 'evaluation_monitoring'
            ? 'Evaluasi & Monitoring'
            : pendingTargetTab === 'teachers'
            ? 'Data Guru'
            : pendingTargetTab === 'schedules'
            ? 'Jadwal & Distribusi JP'
            : pendingTargetTab === 'attendance'
            ? 'Rekap Kehadiran'
            : pendingTargetTab === 'letters'
            ? 'Surat Pemanggilan'
            : pendingTargetTab === 'whatsapp'
            ? 'Notifikasi WhatsApp'
            : pendingTargetTab === 'report'
            ? 'Laporan Bulanan'
            : pendingTargetTab === 'settings'
            ? 'Pengaturan'
            : undefined
        }
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} {schoolProfile.schoolName} &bull; SIM Manajemen Guru, Kurikulum & Presensi
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Real-time Firebase Firestore Sync Active
          </span>
        </div>
      </footer>
    </div>
  );
}
