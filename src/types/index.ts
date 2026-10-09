// Types for ELIMU PRO — Tanzania School Management System

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'HEAD_TEACHER'
  | 'DEPUTY_HEAD'
  | 'ACADEMIC_MASTER'
  | 'HEAD_OF_DEPARTMENT'
  | 'CLASS_TEACHER'
  | 'SUBJECT_TEACHER'
  | 'PARENT'
  | 'STUDENT';

export type EducationLevel = 'O_LEVEL' | 'A_LEVEL';

export type FormLevel = 'FORM_I' | 'FORM_II' | 'FORM_III' | 'FORM_IV' | 'FORM_V' | 'FORM_VI';

export type ExamStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'LOCKED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type StaffAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';

export type StudentStatus = 'ACTIVE' | 'TRANSFERRED_OUT' | 'TRANSFERRED_IN' | 'WITHDRAWN' | 'SUSPENDED' | 'ALUMNI';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  schoolId: string;
  avatarUrl?: string;
  linkedStudentIds?: string[]; // For PARENT role
  studentId?: string; // For STUDENT role
  staffId?: string; // For Staff roles
  departmentId?: string;
  assignedClassId?: string; // For Class Teacher
  isActive: boolean;
  twoFactorEnabled?: boolean;
}

export interface School {
  id: string;
  name: string;
  registrationNumber: string; // e.g. S.4520
  motto: string;
  region: string;
  district: string;
  box: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  currentAcademicYear: string;
  currentTerm: string;
  principalName: string;
  academicMasterName: string;
}

export interface AcademicYear {
  id: string;
  year: string; // e.g., '2026'
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: { id: string; name: string; isCurrent: boolean }[];
}

export interface ClassStream {
  id: string;
  name: string; // e.g., 'Form I A'
  level: FormLevel;
  educationLevel: EducationLevel;
  streamName: string; // 'A', 'B', etc.
  academicYear: string;
  classTeacherId?: string;
  classTeacherName?: string;
  capacity: number;
  roomNumber?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g., 'PHY', 'MATH', 'KISW'
  name: string;
  level: EducationLevel;
  isCore: boolean;
  departmentId: string;
  departmentName: string;
  isActive: boolean;
}

export interface SubjectCombination {
  id: string;
  code: string; // e.g., 'PCM', 'PCB', 'HGL', 'EGM'
  name: string; // Physics, Chemistry, Mathematics
  subjectIds: string[];
  compulsorySubIds: string[]; // e.g. General Studies, BAM
  description?: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  schoolId: string;
  admissionNumber: string; // e.g. ELM/2026/0142
  fullName: string;
  gender: 'M' | 'F';
  dateOfBirth: string;
  admissionDate: string;
  classId: string;
  className: string;
  level: FormLevel;
  educationLevel: EducationLevel;
  combinationId?: string; // For A-Level (PCM, PCB, etc.)
  combinationCode?: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelationship: string;
  address: string;
  emergencyContact: string;
  previousSchool?: string;
  notes?: string;
  avatarUrl?: string;
}

export interface CombinationChangeHistory {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  previousCombinationId: string;
  previousCombinationCode: string;
  newCombinationId: string;
  newCombinationCode: string;
  reason: string;
  effectiveDate: string;
  approvedBy: string;
  timestamp: string;
}

export interface Teacher {
  id: string;
  staffId: string; // e.g. STF-042
  fullName: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  qualification: string;
  departmentId: string;
  departmentName: string;
  positions: string[]; // e.g. ['Subject Teacher', 'Class Teacher', 'HoD']
  roles: UserRole[];
  isActive: boolean;
  joinDate: string;
}

export interface TeachingAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  academicYear: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headOfDepartmentId?: string;
  headOfDepartmentName?: string;
  description: string;
}

export interface StudentAttendanceRecord {
  id: string;
  classId: string;
  date: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  status: AttendanceStatus;
  remark?: string;
  markedBy: string;
  markedByName: string;
  updatedAt: string;
}

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  status: StaffAttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  remark?: string;
  markedBy: string;
}

export interface Examination {
  id: string;
  name: string; // e.g., 'Mid-Term Exam Form IV'
  type: 'WEEKLY' | 'MONTHLY' | 'SERIES' | 'MID_TERM' | 'TERMINAL' | 'ANNUAL' | 'MOCK' | 'PRE_NECTA';
  academicYear: string;
  term: string;
  level: FormLevel;
  startDate: string;
  endDate: string;
  maxMarks: number;
  passMark: number;
  isPublished: boolean;
  status: ExamStatus;
  gradingSchemeId: string;
}

export interface MarkEntry {
  id: string;
  examinationId: string;
  classId: string;
  subjectId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rawScore?: number;
  isAbsent: boolean;
  grade?: string;
  points?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED';
  teacherId: string;
  teacherName: string;
  teacherRemarks?: string;
  updatedAt: string;
}

export interface ExamSubmissionSummary {
  id: string;
  examinationId: string;
  examName: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  submittedCount: number;
  absentCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  status: ExamStatus;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface GradeBoundary {
  grade: string;
  minScore: number;
  maxScore: number;
  points: number;
  remark: string;
  remarkSwahili: string;
}

export interface DivisionBoundary {
  division: 'I' | 'II' | 'III' | 'IV' | '0';
  minPoints: number;
  maxPoints: number;
  description: string;
}

export interface GradingScheme {
  id: string;
  name: string;
  level: EducationLevel;
  boundaries: GradeBoundary[];
  divisions: DivisionBoundary[];
  isDefault: boolean;
}

export interface StudentReportCard {
  student: Student;
  examination: Examination;
  school: School;
  marks: {
    subjectName: string;
    subjectCode: string;
    rawScore: number | null;
    isAbsent: boolean;
    grade: string;
    points: number;
    remark: string;
    rankInClass?: number;
  }[];
  totalMarks: number;
  averageMarks: number;
  totalPoints: number;
  division: string;
  rank: number;
  totalStudentsInClass: number;
  attendancePresent: number;
  attendanceTotal: number;
  classTeacherComment: string;
  headTeacherComment: string;
  academicMasterSignatureDate: string;
  isPublished: boolean;
}

export interface MessageGroup {
  id: string;
  name: string;
  description: string;
  classId?: string;
  departmentId?: string;
  type: 'CLASS' | 'DEPARTMENT' | 'SCHOOL_WIDE' | 'STAFF';
  createdBy: string;
  createdByName: string;
  createdAt: string;
  memberCount: number;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  isPinned?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  titleSwahili: string;
  content: string;
  contentSwahili: string;
  targetRoles: UserRole[];
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  authorName: string;
  date: string;
}

export interface SMSLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  studentAdmissionNo?: string;
  messageType: 'EXAM_RESULT' | 'ATTENDANCE_ALERT' | 'FEE_NOTICE' | 'ANNOUNCEMENT';
  content: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  sentAt: string;
  costTZS: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category: 'SECURITY' | 'ACADEMIC' | 'STUDENT' | 'ATTENDANCE' | 'SYSTEM';
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ACTION_REQUIRED';
  read: boolean;
  link?: string;
  timestamp: string;
}
