// ELIMU PRO Database & State Storage Engine
import { 
  School, ClassStream, Department, Subject, SubjectCombination, 
  Teacher, Student, Examination, MarkEntry, ExamSubmissionSummary,
  User, Announcement, MessageGroup, GroupMessage, SMSLog, AuditLog, 
  StudentAttendanceRecord, StaffAttendanceRecord, CombinationChangeHistory,
  GradingScheme, AppNotification, UserRole
} from '../types';
import { 
  INITIAL_SCHOOL, INITIAL_CLASSES, INITIAL_DEPARTMENTS, INITIAL_SUBJECTS, 
  INITIAL_COMBINATIONS, INITIAL_TEACHERS, INITIAL_STUDENTS, INITIAL_EXAMS, 
  INITIAL_MARKS, INITIAL_SUBMISSIONS, INITIAL_ATTENDANCE, INITIAL_ANNOUNCEMENTS, 
  INITIAL_GROUPS, INITIAL_MESSAGES, INITIAL_AUDIT_LOGS, INITIAL_USERS 
} from './constants';
import { DEFAULT_O_LEVEL_SCHEME, DEFAULT_A_LEVEL_SCHEME, calculateSubjectGrade } from './grading';
import { DEFAULT_SMS_CONFIG, SMSConfig } from './sms';

const STORAGE_KEYS = {
  SCHOOL: 'elimu_school',
  CLASSES: 'elimu_classes',
  DEPARTMENTS: 'elimu_departments',
  SUBJECTS: 'elimu_subjects',
  COMBINATIONS: 'elimu_combinations',
  TEACHERS: 'elimu_teachers',
  STUDENTS: 'elimu_students',
  EXAMS: 'elimu_exams',
  MARKS: 'elimu_marks',
  SUBMISSIONS: 'elimu_submissions',
  ATTENDANCE_STUDENT: 'elimu_attendance_student',
  ATTENDANCE_STAFF: 'elimu_attendance_staff',
  COMBO_HISTORY: 'elimu_combo_history',
  ANNOUNCEMENTS: 'elimu_announcements',
  GROUPS: 'elimu_groups',
  MESSAGES: 'elimu_messages',
  SMS_LOGS: 'elimu_sms_logs',
  AUDIT_LOGS: 'elimu_audit_logs',
  USERS: 'elimu_users',
  CURRENT_USER: 'elimu_current_user',
  CURRENT_LANG: 'elimu_current_lang',
  SMS_CONFIG: 'elimu_sms_config',
  GRADING_SCHEMES: 'elimu_grading_schemes',
  NOTIFICATIONS: 'elimu_notifications',
};

// Listeners for real-time reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Store listener error:', e);
    }
  });
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`LocalStorage quota or write error on key ${key}:`, e);
  }
}

// Storage State API
export const StorageAPI = {
  // Reset all data to initial seed
  resetToDefault() {
    localStorage.clear();
    setStored(STORAGE_KEYS.SCHOOL, INITIAL_SCHOOL);
    setStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    setStored(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
    setStored(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    setStored(STORAGE_KEYS.COMBINATIONS, INITIAL_COMBINATIONS);
    setStored(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    setStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    setStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
    setStored(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    setStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    setStored(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE);
    setStored(STORAGE_KEYS.ATTENDANCE_STAFF, []);
    setStored(STORAGE_KEYS.COMBO_HISTORY, []);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    setStored(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
    setStored(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    setStored(STORAGE_KEYS.SMS_LOGS, []);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[2]); // Default: Head Teacher Mwl. Baraka
    setStored(STORAGE_KEYS.SMS_CONFIG, DEFAULT_SMS_CONFIG);
    setStored(STORAGE_KEYS.GRADING_SCHEMES, [DEFAULT_O_LEVEL_SCHEME, DEFAULT_A_LEVEL_SCHEME]);
    setStored(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_01',
        userId: 'usr_academic',
        title: 'Form V Pre-National Assessment Submitted',
        message: 'Mwl. Grace K. Mwita has submitted Physics marks for review.',
        type: 'ACTION_REQUIRED',
        read: false,
        timestamp: new Date().toISOString(),
      },
    ]);
    notifyListeners();
  },

  // School
  getSchool(): School {
    const stored = getStored<School>(STORAGE_KEYS.SCHOOL, INITIAL_SCHOOL);
    if (!stored || stored.name === 'KILIMANJARO STAR HIGH SCHOOL' || stored.id === 'school_klm_01') {
      setStored(STORAGE_KEYS.SCHOOL, INITIAL_SCHOOL);
      return INITIAL_SCHOOL;
    }
    return stored;
  },
  updateSchool(school: School) {
    setStored(STORAGE_KEYS.SCHOOL, school);
    this.addAuditLog('SYSTEM', 'SCHOOL_PROFILE_UPDATE', `Updated school profile: ${school.name}`);
    notifyListeners();
  },

  // Users & Auth
  getUsers(): User[] {
    return getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getCurrentUser(): User {
    const defaultUser = INITIAL_USERS[2]; // Head Teacher
    const stored = getStored(STORAGE_KEYS.CURRENT_USER, defaultUser);
    return stored || defaultUser;
  },
  setCurrentUser(user: User) {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
    this.addAuditLog('SECURITY', 'SWITCH_USER_ROLE', `User session switched to ${user.name} (${user.role})`);
    notifyListeners();
  },
  loginAsRole(role: UserRole) {
    const users = this.getUsers();
    const match = users.find((u) => u.role === role) || users[0];
    this.setCurrentUser(match);
  },

  // Classes
  getClasses(): ClassStream[] {
    return getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  },
  saveClass(cls: ClassStream) {
    const classes = this.getClasses();
    const index = classes.findIndex((c) => c.id === cls.id);
    if (index >= 0) {
      classes[index] = cls;
    } else {
      classes.push(cls);
    }
    setStored(STORAGE_KEYS.CLASSES, classes);
    this.addAuditLog('SYSTEM', 'CLASS_SAVED', `Class saved: ${cls.name} (${cls.level})`);
    notifyListeners();
  },
  deleteClass(classId: string) {
    let classes = this.getClasses();
    const target = classes.find((c) => c.id === classId);
    classes = classes.filter((c) => c.id !== classId);
    setStored(STORAGE_KEYS.CLASSES, classes);
    this.addAuditLog('SYSTEM', 'CLASS_DELETED', `Class deleted: ${target?.name || classId}`);
    notifyListeners();
  },

  // Subjects & Combinations
  getSubjects(): Subject[] {
    return getStored(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },
  saveSubject(subject: Subject) {
    const subs = this.getSubjects();
    const idx = subs.findIndex((s) => s.id === subject.id);
    if (idx >= 0) subs[idx] = subject;
    else subs.push(subject);
    setStored(STORAGE_KEYS.SUBJECTS, subs);
    notifyListeners();
  },
  getCombinations(): SubjectCombination[] {
    return getStored(STORAGE_KEYS.COMBINATIONS, INITIAL_COMBINATIONS);
  },
  saveCombination(comb: SubjectCombination) {
    const combs = this.getCombinations();
    const idx = combs.findIndex((c) => c.id === comb.id);
    if (idx >= 0) combs[idx] = comb;
    else combs.push(comb);
    setStored(STORAGE_KEYS.COMBINATIONS, combs);
    notifyListeners();
  },

  // Departments
  getDepartments(): Department[] {
    return getStored(STORAGE_KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
  },

  // Teachers
  getTeachers(): Teacher[] {
    return getStored(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  },
  saveTeacher(teacher: Teacher) {
    const teachers = this.getTeachers();
    const idx = teachers.findIndex((t) => t.id === teacher.id);
    if (idx >= 0) teachers[idx] = teacher;
    else teachers.push(teacher);
    setStored(STORAGE_KEYS.TEACHERS, teachers);
    this.addAuditLog('STUDENT', 'TEACHER_RECORD_UPDATE', `Saved teacher profile: ${teacher.fullName}`);
    notifyListeners();
  },

  // Students
  getStudents(): Student[] {
    return getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  saveStudent(student: Student) {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.push(student);
    }
    setStored(STORAGE_KEYS.STUDENTS, students);
    this.addAuditLog('STUDENT', 'STUDENT_RECORD_UPDATE', `Updated student profile: ${student.fullName} (${student.admissionNumber})`);
    notifyListeners();
  },

  // Combination Change Workflow (Section 10)
  changeStudentCombination(
    studentId: string,
    newCombinationId: string,
    reason: string,
    approvedBy: string
  ): { success: boolean; error?: string } {
    const students = this.getStudents();
    const student = students.find((s) => s.id === studentId);
    if (!student) return { success: false, error: 'Student not found.' };

    const combinations = this.getCombinations();
    const newComb = combinations.find((c) => c.id === newCombinationId);
    if (!newComb) return { success: false, error: 'Selected combination is invalid.' };

    const history: CombinationChangeHistory = {
      id: `chg_${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      admissionNumber: student.admissionNumber,
      previousCombinationId: student.combinationId || 'NONE',
      previousCombinationCode: student.combinationCode || 'NONE',
      newCombinationId: newComb.id,
      newCombinationCode: newComb.code,
      reason,
      effectiveDate: new Date().toISOString().split('T')[0],
      approvedBy,
      timestamp: new Date().toISOString(),
    };

    // Update student's current combination while preserving historical marks
    student.combinationId = newComb.id;
    student.combinationCode = newComb.code;
    setStored(STORAGE_KEYS.STUDENTS, students);

    // Save history
    const allHistory = getStored<CombinationChangeHistory[]>(STORAGE_KEYS.COMBO_HISTORY, []);
    allHistory.unshift(history);
    setStored(STORAGE_KEYS.COMBO_HISTORY, allHistory);

    this.addAuditLog(
      'ACADEMIC',
      'COMBINATION_CHANGE',
      `Changed combination for ${student.fullName} (${student.admissionNumber}) from ${history.previousCombinationCode} to ${newComb.code}. Reason: ${reason}`
    );

    notifyListeners();
    return { success: true };
  },
  getCombinationHistory(): CombinationChangeHistory[] {
    return getStored(STORAGE_KEYS.COMBO_HISTORY, []);
  },

  // Attendance
  getStudentAttendance(classId?: string, date?: string): StudentAttendanceRecord[] {
    let records = getStored<StudentAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE);
    if (classId) records = records.filter((r) => r.classId === classId);
    if (date) records = records.filter((r) => r.date === date);
    return records;
  },
  saveStudentAttendance(records: StudentAttendanceRecord[]) {
    let all = getStored<StudentAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STUDENT, INITIAL_ATTENDANCE);
    // Replace or add
    for (const rec of records) {
      const idx = all.findIndex((r) => r.classId === rec.classId && r.date === rec.date && r.studentId === rec.studentId);
      if (idx >= 0) {
        all[idx] = rec;
      } else {
        all.push(rec);
      }
    }
    setStored(STORAGE_KEYS.ATTENDANCE_STUDENT, all);
    this.addAuditLog('ATTENDANCE', 'STUDENT_ATTENDANCE_SUBMISSION', `Attendance batch recorded (${records.length} records).`);
    notifyListeners();
  },

  // Staff Attendance
  getStaffAttendance(date?: string): StaffAttendanceRecord[] {
    let records = getStored<StaffAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STAFF, []);
    if (date) records = records.filter((r) => r.date === date);
    return records;
  },
  saveStaffAttendance(record: StaffAttendanceRecord) {
    let all = getStored<StaffAttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE_STAFF, []);
    const idx = all.findIndex((r) => r.staffId === record.staffId && r.date === record.date);
    if (idx >= 0) all[idx] = record;
    else all.push(record);
    setStored(STORAGE_KEYS.ATTENDANCE_STAFF, all);
    this.addAuditLog('ATTENDANCE', 'STAFF_ATTENDANCE_SUBMISSION', `Staff attendance recorded for ${record.staffName}.`);
    notifyListeners();
  },

  // Examinations & Marks
  getExaminations(): Examination[] {
    return getStored(STORAGE_KEYS.EXAMS, INITIAL_EXAMS);
  },
  saveExamination(exam: Examination) {
    const exams = this.getExaminations();
    const idx = exams.findIndex((e) => e.id === exam.id);
    if (idx >= 0) exams[idx] = exam;
    else exams.push(exam);
    setStored(STORAGE_KEYS.EXAMS, exams);
    this.addAuditLog('ACADEMIC', 'EXAM_SETUP', `Configured examination: ${exam.name}`);
    notifyListeners();
  },
  getMarks(examinationId?: string, classId?: string, subjectId?: string): MarkEntry[] {
    let marks = getStored<MarkEntry[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    if (examinationId) marks = marks.filter((m) => m.examinationId === examinationId);
    if (classId) marks = marks.filter((m) => m.classId === classId);
    if (subjectId) marks = marks.filter((m) => m.subjectId === subjectId);
    return marks;
  },
  saveMarksBatch(marksBatch: MarkEntry[], isSubmitForReview = false) {
    const all = getStored<MarkEntry[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    for (const m of marksBatch) {
      if (isSubmitForReview) {
        m.status = 'SUBMITTED';
      }
      const idx = all.findIndex(
        (existing) =>
          existing.examinationId === m.examinationId &&
          existing.classId === m.classId &&
          existing.subjectId === m.subjectId &&
          existing.studentId === m.studentId
      );
      if (idx >= 0) all[idx] = m;
      else all.push(m);
    }
    setStored(STORAGE_KEYS.MARKS, all);

    // If submitted, create/update submission record for Academic Master review
    if (isSubmitForReview && marksBatch.length > 0) {
      const sample = marksBatch[0];
      const submissions = this.getSubmissions();
      const validScores = marksBatch.filter((m) => !m.isAbsent && m.rawScore !== undefined).map((m) => m.rawScore!);
      const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
      const highest = validScores.length > 0 ? Math.max(...validScores) : 0;
      const lowest = validScores.length > 0 ? Math.min(...validScores) : 0;

      const submission: ExamSubmissionSummary = {
        id: `subm_${Date.now()}`,
        examinationId: sample.examinationId,
        examName: this.getExaminations().find((e) => e.id === sample.examinationId)?.name || 'Exam',
        classId: sample.classId,
        className: this.getClasses().find((c) => c.id === sample.classId)?.name || 'Class',
        subjectId: sample.subjectId,
        subjectName: this.getSubjects().find((s) => s.id === sample.subjectId)?.name || 'Subject',
        subjectCode: this.getSubjects().find((s) => s.id === sample.subjectId)?.code || 'SUB',
        teacherId: sample.teacherId,
        teacherName: sample.teacherName,
        totalStudents: marksBatch.length,
        submittedCount: marksBatch.length,
        absentCount: marksBatch.filter((m) => m.isAbsent).length,
        averageScore: Math.round(avg * 10) / 10,
        highestScore: highest,
        lowestScore: lowest,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
      };

      const existingIdx = submissions.findIndex(
        (s) => s.examinationId === sample.examinationId && s.classId === sample.classId && s.subjectId === sample.subjectId
      );
      if (existingIdx >= 0) {
        submissions[existingIdx] = { ...submissions[existingIdx], ...submission };
      } else {
        submissions.push(submission);
      }
      setStored(STORAGE_KEYS.SUBMISSIONS, submissions);
      this.addAuditLog('ACADEMIC', 'MARKS_SUBMITTED', `Teacher ${sample.teacherName} submitted ${submission.subjectName} marks for ${submission.className}.`);
    }

    notifyListeners();
  },

  // Submissions & Academic Master Approval Workflow (Section 16)
  getSubmissions(): ExamSubmissionSummary[] {
    return getStored(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },
  approveSubmission(submissionId: string, reviewerName: string) {
    const submissions = this.getSubmissions();
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;
    sub.status = 'APPROVED';
    sub.reviewedBy = reviewerName;
    sub.reviewedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Update marks status to APPROVED
    const marks = this.getMarks(sub.examinationId, sub.classId, sub.subjectId);
    marks.forEach((m) => (m.status = 'APPROVED'));
    this.saveMarksBatch(marks, false);

    this.addAuditLog('ACADEMIC', 'SUBMISSION_APPROVED', `Academic Master ${reviewerName} approved marks for ${sub.subjectName} (${sub.className}).`);
    notifyListeners();
  },
  rejectSubmission(submissionId: string, reviewerName: string, reason: string) {
    const submissions = this.getSubmissions();
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;
    sub.status = 'DRAFT';
    sub.rejectionReason = reason;
    sub.reviewedBy = reviewerName;
    sub.reviewedAt = new Date().toISOString();
    setStored(STORAGE_KEYS.SUBMISSIONS, submissions);

    // Return marks status to DRAFT so teacher can correct
    const marks = this.getMarks(sub.examinationId, sub.classId, sub.subjectId);
    marks.forEach((m) => (m.status = 'DRAFT'));
    this.saveMarksBatch(marks, false);

    this.addAuditLog('ACADEMIC', 'SUBMISSION_RETURNED', `Academic Master ${reviewerName} returned ${sub.subjectName} marks to teacher. Reason: ${reason}`);
    notifyListeners();
  },
  publishExaminationResults(examinationId: string, publisherName: string) {
    const exams = this.getExaminations();
    const exam = exams.find((e) => e.id === examinationId);
    if (exam) {
      exam.status = 'PUBLISHED';
      exam.isPublished = true;
      setStored(STORAGE_KEYS.EXAMS, exams);
    }

    // Mark all associated submissions & marks as PUBLISHED
    const submissions = this.getSubmissions();
    submissions.forEach((s) => {
      if (s.examinationId === examinationId && (s.status === 'APPROVED' || s.status === 'SUBMITTED')) {
        s.status = 'PUBLISHED';
        s.publishedAt = new Date().toISOString();
        s.publishedBy = publisherName;
      }
    });
    setStored(STORAGE_KEYS.SUBMISSIONS, submissions);

    const allMarks = getStored<MarkEntry[]>(STORAGE_KEYS.MARKS, INITIAL_MARKS);
    allMarks.forEach((m) => {
      if (m.examinationId === examinationId) {
        m.status = 'PUBLISHED';
      }
    });
    setStored(STORAGE_KEYS.MARKS, allMarks);

    this.addAuditLog('ACADEMIC', 'RESULTS_OFFICIALLY_PUBLISHED', `Results for ${exam?.name || examinationId} officially published by ${publisherName}.`);
    notifyListeners();
  },
  lockExaminationResults(examinationId: string, officerName: string) {
    const exams = this.getExaminations();
    const exam = exams.find((e) => e.id === examinationId);
    if (exam) {
      exam.status = 'LOCKED';
      setStored(STORAGE_KEYS.EXAMS, exams);
    }
    this.addAuditLog('ACADEMIC', 'RESULTS_LOCKED', `Official results for ${exam?.name} locked against modifications by ${officerName}.`);
    notifyListeners();
  },

  // Announcements & Groups
  getAnnouncements(): Announcement[] {
    return getStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },
  saveAnnouncement(ann: Announcement) {
    const list = this.getAnnouncements();
    list.unshift(ann);
    setStored(STORAGE_KEYS.ANNOUNCEMENTS, list);
    this.addAuditLog('SYSTEM', 'ANNOUNCEMENT_POSTED', `Posted announcement: ${ann.title}`);
    notifyListeners();
  },
  getGroups(): MessageGroup[] {
    return getStored(STORAGE_KEYS.GROUPS, INITIAL_GROUPS);
  },
  getMessages(groupId: string): GroupMessage[] {
    const all = getStored<GroupMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return all.filter((m) => m.groupId === groupId);
  },
  sendMessage(groupId: string, sender: User, content: string) {
    const all = getStored<GroupMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    const newMsg: GroupMessage = {
      id: `msg_${Date.now()}`,
      groupId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      content,
      timestamp: new Date().toISOString(),
    };
    all.push(newMsg);
    setStored(STORAGE_KEYS.MESSAGES, all);
    notifyListeners();
  },

  // SMS Logs & Simulator
  getSmsLogs(): SMSLog[] {
    return getStored(STORAGE_KEYS.SMS_LOGS, []);
  },
  addSmsLog(log: SMSLog) {
    const logs = this.getSmsLogs();
    logs.unshift(log);
    setStored(STORAGE_KEYS.SMS_LOGS, logs);
    notifyListeners();
  },
  getSmsConfig(): SMSConfig {
    return getStored(STORAGE_KEYS.SMS_CONFIG, DEFAULT_SMS_CONFIG);
  },
  saveSmsConfig(config: SMSConfig) {
    setStored(STORAGE_KEYS.SMS_CONFIG, config);
    notifyListeners();
  },

  // Grading Schemes
  getGradingSchemes(): GradingScheme[] {
    return getStored(STORAGE_KEYS.GRADING_SCHEMES, [DEFAULT_O_LEVEL_SCHEME, DEFAULT_A_LEVEL_SCHEME]);
  },
  saveGradingScheme(scheme: GradingScheme) {
    const schemes = this.getGradingSchemes();
    const idx = schemes.findIndex((s) => s.id === scheme.id);
    if (idx >= 0) schemes[idx] = scheme;
    else schemes.push(scheme);
    setStored(STORAGE_KEYS.GRADING_SCHEMES, schemes);
    this.addAuditLog('ACADEMIC', 'GRADING_SCHEME_UPDATE', `Updated grading scheme: ${scheme.name}`);
    notifyListeners();
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(category: AuditLog['category'], action: string, details: string) {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      category,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '197.250.21.4',
    };
    logs.unshift(newLog);
    if (logs.length > 500) logs.pop();
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // Notifications
  getNotifications(): AppNotification[] {
    return getStored(STORAGE_KEYS.NOTIFICATIONS, []);
  },
  markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const n = notifs.find((x) => x.id === id);
    if (n) n.read = true;
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
    notifyListeners();
  },
};
