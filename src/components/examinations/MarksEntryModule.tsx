import React, { useState } from 'react';
import { 
  Award, FileSpreadsheet, CheckCircle2, AlertCircle, Save, Send, 
  HelpCircle, Download, Upload, Check
} from 'lucide-react';
import { 
  Examination, ClassStream, Subject, MarkEntry, User, Student, GradingScheme 
} from '../../types';
import { StorageAPI } from '../../lib/storage';
import { calculateSubjectGrade } from '../../lib/grading';
import { translations, Language } from '../../lib/i18n';

interface MarksEntryProps {
  currentUser: User;
  lang: Language;
}

export const MarksEntryModule: React.FC<MarksEntryProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const exams = StorageAPI.getExaminations();
  const classes = StorageAPI.getClasses();
  const subjects = StorageAPI.getSubjects();
  const gradingSchemes = StorageAPI.getGradingSchemes();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id); // Form IV A
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || ''); // Math
  const [saveToast, setSaveToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Pick grading scheme based on class education level
  const activeScheme = gradingSchemes.find(
    (s) => s.level === (selectedClass?.educationLevel || 'O_LEVEL')
  ) || gradingSchemes[0];

  // Students eligible for this class & subject
  const eligibleStudents = StorageAPI.getStudents().filter(
    (s) => s.classId === selectedClassId && s.status === 'ACTIVE'
  );

  // Existing marks
  const existingMarks = StorageAPI.getMarks(selectedExamId, selectedClassId, selectedSubjectId);

  // State map of mark entries: studentId -> { rawScore, isAbsent, remarks }
  const [marksState, setMarksState] = useState<
    Record<string, { rawScore: number | undefined; isAbsent: boolean; remarks: string }>
  >(() => {
    const map: Record<string, { rawScore: number | undefined; isAbsent: boolean; remarks: string }> = {};
    for (const std of eligibleStudents) {
      const match = existingMarks.find((m) => m.studentId === std.id);
      map[std.id] = {
        rawScore: match?.rawScore,
        isAbsent: match ? match.isAbsent : false,
        remarks: match?.teacherRemarks || '',
      };
    }
    return map;
  });

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setSaveToast({ message, type });
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const parsed = value === '' ? undefined : Number(value);
    if (parsed !== undefined && (isNaN(parsed) || parsed < 0 || parsed > (selectedExam?.maxMarks || 100))) {
      notify('Score must be between 0 and 100.', 'error');
      return;
    }
    setMarksState({
      ...marksState,
      [studentId]: {
        ...marksState[studentId],
        rawScore: parsed,
        isAbsent: false,
      },
    });
  };

  const handleToggleAbsent = (studentId: string, isAbsent: boolean) => {
    setMarksState({
      ...marksState,
      [studentId]: {
        ...marksState[studentId],
        isAbsent,
        rawScore: isAbsent ? undefined : marksState[studentId]?.rawScore,
      },
    });
  };

  const handleSaveMarks = (isSubmitForReview: boolean) => {
    if (!selectedExam || !selectedClass || !selectedSubject) return;

    // Check completeness if submitting
    if (isSubmitForReview) {
      const missingCount = eligibleStudents.filter((std) => {
        const item = marksState[std.id];
        return !item || (!item.isAbsent && item.rawScore === undefined);
      }).length;

      if (missingCount > 0) {
        notify(`Cannot submit for academic review: ${missingCount} students are missing marks without being marked ABSENT.`, 'error');
        return;
      }
    }

    const marksBatch: MarkEntry[] = eligibleStudents.map((std) => {
      const item = marksState[std.id] || { rawScore: undefined, isAbsent: false, remarks: '' };
      const gradeResult = calculateSubjectGrade(item.rawScore, item.isAbsent, activeScheme);

      return {
        id: `mk_${selectedExam.id}_${selectedClass.id}_${selectedSubject.id}_${std.id}`,
        examinationId: selectedExam.id,
        classId: selectedClass.id,
        subjectId: selectedSubject.id,
        studentId: std.id,
        studentName: std.fullName,
        admissionNumber: std.admissionNumber,
        rawScore: item.rawScore,
        isAbsent: item.isAbsent,
        grade: gradeResult.grade,
        points: gradeResult.points,
        status: isSubmitForReview ? 'SUBMITTED' : 'DRAFT',
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        teacherRemarks: item.remarks,
        updatedAt: new Date().toISOString(),
      };
    });

    StorageAPI.saveMarksBatch(marksBatch, isSubmitForReview);

    if (isSubmitForReview) {
      notify(`Marks successfully submitted to Academic Master for approval! Status: SUBMITTED.`);
    } else {
      notify('Draft scores saved successfully. You may continue editing.');
    }
  };

  // CSV Template download
  const handleDownloadTemplate = () => {
    const headers = ['AdmissionNo', 'StudentName', 'Score', 'IsAbsent(Y/N)'];
    const rows = eligibleStudents.map((s) => [s.admissionNumber, `"${s.fullName}"`, '', 'N']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `Marks_${selectedSubject?.code}_${selectedClass?.name}.csv`;
    a.click();
    notify('Marks template downloaded.');
  };

  return (
    <div className="space-y-6">
      {saveToast && (
        <div className={`p-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-between ${
          saveToast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <span>{saveToast.message}</span>
          <button onClick={() => setSaveToast(null)} className="underline ml-4">Close</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Subject Marks Entry (Kuingiza Alama)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Teacher Assessment Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter examination scores with real-time NECTA grade evaluation and validation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>CSV Template</span>
          </button>
        </div>
      </div>

      {/* Selection Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Examination Session</label>
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
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Class / Stream</label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              const newEligible = StorageAPI.getStudents().filter((s) => s.classId === e.target.value && s.status === 'ACTIVE');
              const newMarks = StorageAPI.getMarks(selectedExamId, e.target.value, selectedSubjectId);
              const map: Record<string, { rawScore: number | undefined; isAbsent: boolean; remarks: string }> = {};
              for (const std of newEligible) {
                const match = newMarks.find((m) => m.studentId === std.id);
                map[std.id] = { rawScore: match?.rawScore, isAbsent: match?.isAbsent || false, remarks: match?.teacherRemarks || '' };
              }
              setMarksState(map);
            }}
            className="w-full p-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              const newMarks = StorageAPI.getMarks(selectedExamId, selectedClassId, e.target.value);
              const map: Record<string, { rawScore: number | undefined; isAbsent: boolean; remarks: string }> = {};
              for (const std of eligibleStudents) {
                const match = newMarks.find((m) => m.studentId === std.id);
                map[std.id] = { rawScore: match?.rawScore, isAbsent: match?.isAbsent || false, remarks: match?.teacherRemarks || '' };
              }
              setMarksState(map);
            }}
            className="w-full p-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
        <div>
          <p className="font-bold">Active Tanzania Secondary Grading Scheme: {activeScheme.name}</p>
          <p className="text-[11px] text-blue-700">
            Passing mark: {selectedExam?.passMark || 30}% • Max marks: {selectedExam?.maxMarks || 100} • Absent students are recorded as ABS (does not count as 0).
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-blue-900 shadow-xs">
          Level: {selectedClass?.educationLevel}
        </span>
      </div>

      {/* Marks Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white">
              <tr>
                <th className="py-3 px-4 font-bold">#</th>
                <th className="py-3 px-4 font-bold">Admission No</th>
                <th className="py-3 px-4 font-bold">Student Name</th>
                <th className="py-3 px-4 font-bold">Raw Score (0 - {selectedExam?.maxMarks || 100})</th>
                <th className="py-3 px-4 font-bold text-center">Absent?</th>
                <th className="py-3 px-4 font-bold">Auto Grade</th>
                <th className="py-3 px-4 font-bold">Points</th>
                <th className="py-3 px-4 font-bold">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eligibleStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No active students enrolled in this class.
                  </td>
                </tr>
              ) : (
                eligibleStudents.map((std, idx) => {
                  const state = marksState[std.id] || { rawScore: undefined, isAbsent: false, remarks: '' };
                  const gradeResult = calculateSubjectGrade(state.rawScore, state.isAbsent, activeScheme);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{std.admissionNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{std.fullName}</td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          max={selectedExam?.maxMarks || 100}
                          disabled={state.isAbsent}
                          placeholder={state.isAbsent ? 'ABS' : 'Score'}
                          value={state.rawScore !== undefined ? state.rawScore : ''}
                          onChange={(e) => handleScoreChange(std.id, e.target.value)}
                          className={`w-24 p-1.5 text-xs font-bold rounded-lg border focus:ring-2 focus:ring-teal-500 ${
                            state.isAbsent ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={state.isAbsent}
                          onChange={(e) => handleToggleAbsent(std.id, e.target.checked)}
                          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-black ${
                          gradeResult.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                          gradeResult.grade === 'B' ? 'bg-teal-100 text-teal-800' :
                          gradeResult.grade === 'C' ? 'bg-blue-100 text-blue-800' :
                          gradeResult.grade === 'D' ? 'bg-amber-100 text-amber-800' :
                          gradeResult.grade === 'ABS' ? 'bg-slate-200 text-slate-600' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {gradeResult.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{gradeResult.points}</td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Excellent work in trigonometry"
                          value={state.remarks}
                          onChange={(e) =>
                            setMarksState({
                              ...marksState,
                              [std.id]: { ...marksState[std.id], remarks: e.target.value },
                            })
                          }
                          className="w-full p-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Tip: Save as <strong>Draft</strong> while marking is ongoing. Click <strong>Submit for Review</strong> when complete.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSaveMarks(false)}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSaveMarks(true)}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-[#102A43] hover:bg-[#1E3A5F] text-white transition shadow-sm"
            >
              <Send className="w-4 h-4 text-[#25B99A]" />
              <span>Submit for Academic Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
