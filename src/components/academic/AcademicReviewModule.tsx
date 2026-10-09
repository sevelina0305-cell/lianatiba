import React, { useState } from 'react';
import { 
  CheckSquare, Award, AlertTriangle, CheckCircle2, XCircle, Globe, 
  Lock, Eye, ArrowRight, MessageSquare, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { 
  ExamSubmissionSummary, Examination, MarkEntry, User, ClassStream, Subject 
} from '../../types';
import { StorageAPI } from '../../lib/storage';
import { Modal } from '../common/Modal';
import { translations, Language } from '../../lib/i18n';

interface AcademicReviewProps {
  currentUser: User;
  lang: Language;
}

export const AcademicReviewModule: React.FC<AcademicReviewProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [submissions, setSubmissions] = useState<ExamSubmissionSummary[]>(StorageAPI.getSubmissions());
  const [exams, setExams] = useState<Examination[]>(StorageAPI.getExaminations());
  const [selectedSubm, setSelectedSubm] = useState<ExamSubmissionSummary | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedExamToPublish, setSelectedExamToPublish] = useState<string>(exams[0]?.id || '');
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const refreshData = () => {
    setSubmissions(StorageAPI.getSubmissions());
    setExams(StorageAPI.getExaminations());
  };

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Inspect submitted marks
  const inspectingMarks: MarkEntry[] = selectedSubm
    ? StorageAPI.getMarks(selectedSubm.examinationId, selectedSubm.classId, selectedSubm.subjectId)
    : [];

  // Approve submission
  const handleApprove = (submId: string) => {
    StorageAPI.approveSubmission(submId, currentUser.name);
    refreshData();
    setIsDetailModalOpen(false);
    notify('Subject marks approved! Now eligible for official examination publication.');
  };

  // Reject / Return with comments
  const handleReject = () => {
    if (!selectedSubm || !rejectionReason.trim()) {
      notify('Please provide feedback comments for the teacher.', 'error');
      return;
    }
    StorageAPI.rejectSubmission(selectedSubm.id, currentUser.name, rejectionReason);
    refreshData();
    setIsRejectModalOpen(false);
    setIsDetailModalOpen(false);
    setRejectionReason('');
    notify('Submission returned to teacher with correction remarks.');
  };

  // Publish All Approved Results for Examination
  const handlePublishResults = () => {
    if (!selectedExamToPublish) return;
    StorageAPI.publishExaminationResults(selectedExamToPublish, currentUser.name);
    refreshData();
    setIsPublishModalOpen(false);
    notify('Examination results officially released! Parents and students can now access report cards.');
  };

  // Lock Published Results
  const handleLockResults = (examId: string) => {
    StorageAPI.lockExaminationResults(examId, currentUser.name);
    refreshData();
    notify('Examination records locked against further edits.');
  };

  const pendingCount = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW').length;
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;
  const publishedCount = submissions.filter((s) => s.status === 'PUBLISHED').length;

  return (
    <div className="space-y-6">
      {feedbackToast && (
        <div className={`p-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-between ${
          feedbackToast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <span>{feedbackToast.message}</span>
          <button onClick={() => setFeedbackToast(null)} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Academic Master Review & Publishing</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Controlled NECTA Release
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict gatekeeping: Verify marks, return discrepancies, approve, and officially publish results
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
          >
            <Globe className="w-4 h-4" />
            <span>Publish Examination Results</span>
          </button>
        </div>
      </div>

      {/* Metrics pipeline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-800">Pending Review</span>
            <p className="text-2xl font-black text-amber-900">{pendingCount}</p>
            <p className="text-[11px] text-amber-700">Submissions awaiting audit</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-600/50" />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-800">Approved Submissions</span>
            <p className="text-2xl font-black text-blue-900">{approvedCount}</p>
            <p className="text-[11px] text-blue-700">Ready for school-wide release</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-blue-600/50" />
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-800">Published to Portals</span>
            <p className="text-2xl font-black text-emerald-900">{publishedCount}</p>
            <p className="text-[11px] text-emerald-700">Visible to parents & students</p>
          </div>
          <Globe className="w-8 h-8 text-emerald-600/50" />
        </div>
      </div>

      {/* Submissions Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Marks Approval Queue</h3>
          <span className="text-xs text-slate-500">{submissions.length} Total Batches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white">
              <tr>
                <th className="py-3 px-4 font-bold">Examination</th>
                <th className="py-3 px-4 font-bold">Class</th>
                <th className="py-3 px-4 font-bold">Subject</th>
                <th className="py-3 px-4 font-bold">Subject Teacher</th>
                <th className="py-3 px-4 font-bold text-center">Enrolled / Submitted</th>
                <th className="py-3 px-4 font-bold">Average</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{sub.examName}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{sub.className}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{sub.subjectName}</span>
                    <span className="text-[10px] font-mono text-slate-400 block">{sub.subjectCode}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-800">{sub.teacherName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-slate-800">{sub.submittedCount}</span>
                    <span className="text-slate-400"> / {sub.totalStudents}</span>
                    {sub.absentCount > 0 && (
                      <span className="block text-[10px] text-amber-600 font-semibold">{sub.absentCount} Absent</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-800">{sub.averageScore}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      sub.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      sub.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      sub.status === 'UNDER_REVIEW' || sub.status === 'SUBMITTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => {
                        setSelectedSubm(sub);
                        setIsDetailModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      Audit Marks
                    </button>
                    {sub.status === 'SUBMITTED' && (
                      <button
                        onClick={() => handleApprove(sub.id)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Marks & Feedback Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedSubm ? `${selectedSubm.subjectName} — ${selectedSubm.className} Marks Audit` : 'Audit Marks'}
        subtitle="Review individual student scores before granting Academic Master approval"
        maxWidth="2xl"
      >
        {selectedSubm && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Assigned Teacher</p>
                <p className="font-bold text-slate-800">{selectedSubm.teacherName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Average Score</p>
                <p className="font-black text-slate-900 text-base">{selectedSubm.averageScore}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                <p className="font-bold text-teal-700">{selectedSubm.status}</p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Student Name</th>
                    <th className="py-2 px-3">Score</th>
                    <th className="py-2 px-3">Grade</th>
                    <th className="py-2 px-3">Points</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspectingMarks.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{m.studentName}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{m.isAbsent ? 'ABS' : m.rawScore}</td>
                      <td className="py-2 px-3 font-black text-teal-700">{m.grade}</td>
                      <td className="py-2 px-3 text-slate-600">{m.points}</td>
                      <td className="py-2 px-3 text-slate-500 italic">{m.teacherRemarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="px-4 py-2 font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
              >
                Return with Correction Remarks
              </button>

              <div className="space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(selectedSubm.id)}
                  className="px-5 py-2 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Approve Marks
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject / Return Remarks Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Return Marks for Teacher Correction"
        subtitle="Specify what requires adjustment before approval"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Academic Master Correction Remarks *</label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Student std_04 missing paper 2 marks; please review physics score calculation and resubmit."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="px-5 py-2 font-bold rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              Confirm Return to Teacher
            </button>
          </div>
        </div>
      </Modal>

      {/* Publish Examination Results Modal */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title="Official Examination Results Release"
        subtitle="Publishes approved results to student portals, parent accounts, and SMS gateway"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
            <p className="font-bold">Confirmation Checklist:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>All subjects for this examination have been reviewed.</li>
              <li>Absent candidates are officially recorded.</li>
              <li>Division and grading boundaries calculated under NECTA standards.</li>
            </ul>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Examination to Publish *</label>
            <select
              value={selectedExamToPublish}
              onChange={(e) => setSelectedExamToPublish(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} — Status: {ex.status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsPublishModalOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handlePublishResults}
              className="px-5 py-2 font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 shadow-sm"
            >
              Confirm & Release Results
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
