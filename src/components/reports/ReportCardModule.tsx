import React, { useState } from 'react';
import { 
  Award, Printer, Download, Eye, BookOpen, CheckCircle2, User, 
  Search, Filter, ChevronRight, School as SchoolIcon
} from 'lucide-react';
import { 
  Student, Examination, MarkEntry, School, ClassStream, Subject, GradingScheme 
} from '../../types';
import { StorageAPI } from '../../lib/storage';
import { calculateDivision } from '../../lib/grading';
import { translations, Language } from '../../lib/i18n';

interface ReportCardProps {
  currentUser: any;
  lang: Language;
}

export const ReportCardModule: React.FC<ReportCardProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const school = StorageAPI.getSchool();
  const exams = StorageAPI.getExaminations();
  const classes = StorageAPI.getClasses();
  const subjects = StorageAPI.getSubjects();
  const gradingSchemes = StorageAPI.getGradingSchemes();
  const allStudents = StorageAPI.getStudents();
  const allMarks = StorageAPI.getMarks();

  // If currentUser is PARENT, restrict to linked children; if STUDENT, restrict to self
  let eligibleStudents = allStudents;
  if (currentUser.role === 'PARENT') {
    eligibleStudents = allStudents.filter((s) => currentUser.linkedStudentIds?.includes(s.id));
  } else if (currentUser.role === 'STUDENT') {
    eligibleStudents = allStudents.filter((s) => s.id === currentUser.studentId);
  }

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(eligibleStudents[0]?.id || '');
  const [viewMode, setViewMode] = useState<'CARD' | 'BROADSHEET'>('CARD');

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const selectedStudent = eligibleStudents.find((s) => s.id === selectedStudentId) || eligibleStudents[0];
  const studentClass = classes.find((c) => c.id === selectedStudent?.classId);
  const activeScheme = gradingSchemes.find((s) => s.level === (selectedStudent?.educationLevel || 'O_LEVEL')) || gradingSchemes[0];

  // Fetch only PUBLISHED marks for student in selected exam
  // Note: if user is staff, allow viewing draft; if parent/student, ONLY published
  const isPrivilegedStaff = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER', 'CLASS_TEACHER'].includes(currentUser.role);
  
  const studentMarks = allMarks.filter((m) => {
    const matchesScope = m.examinationId === selectedExamId && m.studentId === selectedStudent?.id;
    return isPrivilegedStaff ? matchesScope : matchesScope && m.status === 'PUBLISHED';
  });

  // Calculate student aggregates
  const validScores = studentMarks.filter((m) => !m.isAbsent && m.rawScore !== undefined).map((m) => m.rawScore!);
  const totalScore = validScores.reduce((a, b) => a + b, 0);
  const averageScore = validScores.length > 0 ? Math.round((totalScore / validScores.length) * 10) / 10 : 0;

  const divisionCalc = calculateDivision(
    studentMarks.map((m) => ({ points: m.points || 5, grade: m.grade || 'F', isAbsent: m.isAbsent })),
    selectedStudent?.educationLevel || 'O_LEVEL',
    activeScheme
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Academic Report Cards & Broadsheets</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official NECTA secondary school terminal assessment documents with division calculations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isPrivilegedStaff && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('CARD')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === 'CARD' ? 'bg-[#102A43] text-white' : 'text-slate-600'
                }`}
              >
                Individual Card
              </button>
              <button
                onClick={() => setViewMode('BROADSHEET')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  viewMode === 'BROADSHEET' ? 'bg-[#102A43] text-white' : 'text-slate-600'
                }`}
              >
                Class Broadsheet
              </button>
            </div>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs no-print">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Select Examination</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full p-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name} ({ex.academicYear})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Select Candidate (Student)</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full p-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
          >
            {eligibleStudents.map((std) => (
              <option key={std.id} value={std.id}>{std.fullName} ({std.admissionNumber}) — {std.className}</option>
            ))}
          </select>
        </div>
      </div>

      {/* INDIVIDUAL REPORT CARD VIEW */}
      {viewMode === 'CARD' && selectedStudent && (
        <div className="bg-white rounded-2xl border border-slate-300 p-6 md:p-8 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
          {/* Official Tanzanian School Header */}
          <div className="text-center border-b-2 border-slate-800 pb-5 space-y-1">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-[#102A43] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-[#F4C95D]">
                TSS
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {school.name}
            </h1>
            <p className="text-xs font-bold text-slate-700">
              REGISTRATION NO: {school.registrationNumber} • {school.motto}
            </p>
            <p className="text-xs text-slate-600">
              {school.box} • TEL: {school.phone} • REGION: {school.region}
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-[#102A43] text-white font-black text-xs uppercase tracking-wider rounded-md">
              STUDENT ACADEMIC PROGRESS REPORT (RIPOTI YA MAENDELEO YA TAALUMA)
            </div>
          </div>

          {/* Student Meta Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 text-xs border-b border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Student Name:</span>
              <span className="font-extrabold text-slate-900 text-sm">{selectedStudent.fullName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Admission No:</span>
              <span className="font-mono font-bold text-slate-800">{selectedStudent.admissionNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Class & Stream:</span>
              <span className="font-bold text-slate-800">{selectedStudent.className}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Examination Session:</span>
              <span className="font-bold text-slate-800">{selectedExam?.name}</span>
            </div>

            {selectedStudent.combinationCode && (
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">A-Level Combination:</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {selectedStudent.combinationCode}
                </span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Academic Year / Term:</span>
              <span className="font-medium text-slate-800">{school.currentAcademicYear} • {school.currentTerm}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Gender:</span>
              <span className="font-bold text-slate-800">{selectedStudent.gender === 'M' ? 'Male (Mvulana)' : 'Female (Msichana)'}</span>
            </div>
          </div>

          {/* Results Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-[#102A43] text-white">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-400 font-bold">#</th>
                  <th className="py-2.5 px-3 border border-slate-400 font-bold">Subject Name</th>
                  <th className="py-2.5 px-3 border border-slate-400 font-bold text-center">Score (%)</th>
                  <th className="py-2.5 px-3 border border-slate-400 font-bold text-center">Grade</th>
                  <th className="py-2.5 px-3 border border-slate-400 font-bold text-center">Points</th>
                  <th className="py-2.5 px-3 border border-slate-400 font-bold">Subject Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentMarks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No published marks available for this candidate in this examination session.
                    </td>
                  </tr>
                ) : (
                  studentMarks.map((m, idx) => {
                    const subMeta = subjects.find((s) => s.id === m.subjectId);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 border border-slate-200 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-3 border border-slate-200 font-bold text-slate-900">
                          {subMeta?.name || m.subjectId} ({subMeta?.code || 'SUB'})
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-bold text-slate-900">
                          {m.isAbsent ? 'ABS' : m.rawScore}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-black text-slate-900">
                          {m.grade}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-mono font-bold text-slate-700">
                          {m.points}
                        </td>
                        <td className="py-2 px-3 border border-slate-200 text-slate-600 italic">
                          {m.teacherRemarks || (m.grade === 'A' ? 'Excellent' : m.grade === 'B' ? 'Very Good' : 'Pass')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-300 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Marks</span>
              <span className="text-xl font-black text-slate-900">{totalScore}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Average Percentage</span>
              <span className="text-xl font-black text-slate-900">{averageScore}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Points</span>
              <span className="text-xl font-black text-teal-700">{divisionCalc.totalPoints}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Official Division</span>
              <span className="text-xl font-black text-emerald-700">Division {divisionCalc.division}</span>
            </div>
          </div>

          {/* Grading Criteria Table for Transparency */}
          <div className="py-3 text-[10px] text-slate-500 border-t border-slate-200 mt-4 space-y-1">
            <span className="font-bold text-slate-700 uppercase">Applicable Tanzania Grading Criteria:</span>
            <div className="flex flex-wrap gap-2 text-slate-600">
              {activeScheme.boundaries.map((b) => (
                <span key={b.grade} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  <strong>{b.grade}</strong>: {b.minScore}-{b.maxScore}% ({b.points} pt)
                </span>
              ))}
            </div>
          </div>

          {/* Signatures & School Stamp Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-300 mt-4 text-xs">
            <div className="space-y-4">
              <span className="font-bold text-slate-800 block">Class Teacher Remarks:</span>
              <p className="text-slate-600 italic text-[11px] min-h-[40px] border-b border-dashed border-slate-400 pb-2">
                "Disciplined student with outstanding dedication to science and mathematics. Keep up the high standards."
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                Signature: ______________________
              </div>
            </div>

            <div className="space-y-4">
              <span className="font-bold text-slate-800 block">Headmaster / Head Teacher:</span>
              <p className="text-slate-600 italic text-[11px] min-h-[40px] border-b border-dashed border-slate-400 pb-2">
                {`"Promising academic record. Approved by Academic Board of ${school.name}."`}
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                Signature: ______________________
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Official School Stamp</span>
              <div className="w-20 h-20 rounded-full border-2 border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-mono text-center p-1">
                SEKONDARI YA TURA (TURA SEC)
              </div>
              <span className="text-[10px] text-slate-500">Date: {new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </div>
      )}

      {/* CLASS BROADSHEET VIEW */}
      {viewMode === 'BROADSHEET' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs overflow-x-auto">
          <div className="mb-4">
            <h3 className="font-black text-slate-900 text-base uppercase">Class Academic Broadsheet (Necta Broadsheet)</h3>
            <p className="text-xs text-slate-500">Consolidated examination scores across all candidates in class</p>
          </div>

          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-[#102A43] text-white">
              <tr>
                <th className="py-2.5 px-3 border border-slate-400 font-bold">Adm No</th>
                <th className="py-2.5 px-3 border border-slate-400 font-bold">Candidate Name</th>
                {subjects.slice(0, 7).map((s) => (
                  <th key={s.id} className="py-2.5 px-2 border border-slate-400 text-center font-bold">
                    {s.code}
                  </th>
                ))}
                <th className="py-2.5 px-3 border border-slate-400 text-center font-bold">Total</th>
                <th className="py-2.5 px-3 border border-slate-400 text-center font-bold">Average</th>
                <th className="py-2.5 px-3 border border-slate-400 text-center font-bold">Division</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allStudents.filter((s) => s.classId === selectedStudent?.classId).map((std) => {
                const stdMarks = allMarks.filter((m) => m.examinationId === selectedExamId && m.studentId === std.id);
                const scores = stdMarks.filter((m) => !m.isAbsent && m.rawScore !== undefined).map((m) => m.rawScore!);
                const tot = scores.reduce((a, b) => a + b, 0);
                const avg = scores.length > 0 ? Math.round(tot / scores.length) : 0;
                const div = calculateDivision(
                  stdMarks.map((m) => ({ points: m.points || 5, grade: m.grade || 'F', isAbsent: m.isAbsent })),
                  std.educationLevel,
                  activeScheme
                );

                return (
                  <tr key={std.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 border border-slate-200 font-mono font-bold text-slate-700">{std.admissionNumber}</td>
                    <td className="py-2 px-3 border border-slate-200 font-semibold text-slate-900">{std.fullName}</td>
                    {subjects.slice(0, 7).map((s) => {
                      const mk = stdMarks.find((m) => m.subjectId === s.id);
                      return (
                        <td key={s.id} className="py-2 px-2 border border-slate-200 text-center font-bold">
                          {mk ? (mk.isAbsent ? 'ABS' : `${mk.rawScore} (${mk.grade})`) : '—'}
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 border border-slate-200 text-center font-bold text-slate-800">{tot}</td>
                    <td className="py-2 px-3 border border-slate-200 text-center font-black text-slate-900">{avg}%</td>
                    <td className="py-2 px-3 border border-slate-200 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Div {div.division}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
