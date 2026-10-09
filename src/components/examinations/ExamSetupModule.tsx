import React, { useState } from 'react';
import { FileSpreadsheet, Plus, CheckCircle2, Lock, Eye, Calendar, Award } from 'lucide-react';
import { Examination, FormLevel, User } from '../../types';
import { StorageAPI } from '../../lib/storage';
import { Modal } from '../common/Modal';
import { translations, Language } from '../../lib/i18n';

interface ExamSetupProps {
  currentUser: User;
  lang: Language;
}

export const ExamSetupModule: React.FC<ExamSetupProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [exams, setExams] = useState<Examination[]>(StorageAPI.getExaminations());
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Examination>>({
    name: '',
    type: 'MID_TERM',
    academicYear: '2026',
    term: 'Term 1',
    level: 'FORM_IV',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    maxMarks: 100,
    passMark: 30,
    status: 'DRAFT',
  });

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newExam: Examination = {
      id: `exam_${Date.now()}`,
      name: formData.name!,
      type: formData.type as any || 'MID_TERM',
      academicYear: '2026',
      term: formData.term || 'Term 1',
      level: formData.level as FormLevel || 'FORM_IV',
      startDate: formData.startDate || '',
      endDate: formData.endDate || '',
      maxMarks: Number(formData.maxMarks) || 100,
      passMark: Number(formData.passMark) || 30,
      isPublished: false,
      status: 'DRAFT',
      gradingSchemeId: (formData.level === 'FORM_V' || formData.level === 'FORM_VI') ? 'scheme_a_level_standard' : 'scheme_o_level_standard',
    };

    StorageAPI.saveExamination(newExam);
    setExams(StorageAPI.getExaminations());
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.examinations}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure examination timetables, series, mocks, terminal assessments and passing thresholds
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Configure Examination</span>
        </button>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((ex) => (
          <div key={ex.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                  {ex.type.replace('_', ' ')}
                </span>
                <h4 className="font-black text-slate-900 text-base mt-1.5">{ex.name}</h4>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                ex.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                ex.status === 'LOCKED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                ex.status === 'UNDER_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {ex.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span>Target Class:</span>
                <span className="font-bold text-slate-800">{ex.level.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Pass Benchmark:</span>
                <span className="font-bold text-slate-800">{ex.passMark}% (Max: {ex.maxMarks})</span>
              </div>
              <div className="flex justify-between">
                <span>Academic Session:</span>
                <span>{ex.academicYear} • {ex.term}</span>
              </div>
              <div className="flex justify-between">
                <span>Exam Dates:</span>
                <span className="font-mono text-[11px]">{ex.startDate} to {ex.endDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Examination Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Configure New Examination"
        subtitle="Schedule a testing session for Form I to Form VI"
        maxWidth="md"
      >
        <form onSubmit={handleSaveExam} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Examination Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mid-Term Examination Form IV 2026"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Exam Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="WEEKLY">Weekly Test</option>
                <option value="MONTHLY">Monthly Test</option>
                <option value="SERIES">Series Exam</option>
                <option value="MID_TERM">Mid-Term Exam</option>
                <option value="TERMINAL">Terminal Exam</option>
                <option value="ANNUAL">Annual Exam</option>
                <option value="MOCK">Mock Examination</option>
                <option value="PRE_NECTA">Pre-National NECTA</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Form Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="FORM_I">Form I</option>
                <option value="FORM_II">Form II</option>
                <option value="FORM_III">Form III</option>
                <option value="FORM_IV">Form IV</option>
                <option value="FORM_V">Form V (A-Level)</option>
                <option value="FORM_VI">Form VI (A-Level)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Maximum Marks</label>
              <input
                type="number"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pass Mark Threshold (%)</label>
              <input
                type="number"
                value={formData.passMark}
                onChange={(e) => setFormData({ ...formData, passMark: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386]"
            >
              Save Examination
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
