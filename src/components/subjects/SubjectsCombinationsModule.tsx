import React, { useState } from 'react';
import { BookOpen, Layers, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Subject, SubjectCombination, User } from '../../types';
import { StorageAPI } from '../../lib/storage';
import { Modal } from '../common/Modal';
import { translations, Language } from '../../lib/i18n';

interface SubjectsProps {
  currentUser: User;
  lang: Language;
}

export const SubjectsCombinationsModule: React.FC<SubjectsProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'COMBINATIONS' | 'SUBJECTS'>('COMBINATIONS');
  const [combinations, setCombinations] = useState<SubjectCombination[]>(StorageAPI.getCombinations());
  const [subjects, setSubjects] = useState<Subject[]>(StorageAPI.getSubjects());
  const [isAddCombOpen, setIsAddCombOpen] = useState(false);
  const [isAddSubOpen, setIsAddSubOpen] = useState(false);

  const [combForm, setCombForm] = useState<Partial<SubjectCombination>>({
    code: '',
    name: '',
    description: '',
    subjectIds: [],
    compulsorySubIds: ['sub_gs'],
    isActive: true,
  });

  const [subForm, setSubForm] = useState<Partial<Subject>>({
    code: '',
    name: '',
    level: 'O_LEVEL',
    isCore: true,
    departmentId: 'dept_sci',
    departmentName: 'Science',
    isActive: true,
  });

  const handleSaveComb = (e: React.FormEvent) => {
    e.preventDefault();
    if (!combForm.code || !combForm.name) return;

    const newComb: SubjectCombination = {
      id: `comb_${Date.now()}`,
      code: combForm.code!.toUpperCase(),
      name: combForm.name!,
      description: combForm.description,
      subjectIds: combForm.subjectIds || [],
      compulsorySubIds: ['sub_gs'],
      isActive: true,
    };

    StorageAPI.saveCombination(newComb);
    setCombinations(StorageAPI.getCombinations());
    setIsAddCombOpen(false);
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.code || !subForm.name) return;

    const newSub: Subject = {
      id: `sub_${Date.now()}`,
      code: subForm.code!.toUpperCase(),
      name: subForm.name!,
      level: subForm.level as any || 'O_LEVEL',
      isCore: subForm.isCore ?? true,
      departmentId: subForm.departmentId || 'dept_sci',
      departmentName: subForm.departmentName || 'Science',
      isActive: true,
    };

    StorageAPI.saveSubject(newSub);
    setSubjects(StorageAPI.getSubjects());
    setIsAddSubOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.subjects}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tanzanian curriculum management: O-Level core subjects and A-Level combination mappings
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('COMBINATIONS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'COMBINATIONS' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            A-Level Combinations ({combinations.length})
          </button>
          <button
            onClick={() => setActiveTab('SUBJECTS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'SUBJECTS' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            Subject Catalogue ({subjects.length})
          </button>
        </div>
      </div>

      {/* COMBINATIONS VIEW */}
      {activeTab === 'COMBINATIONS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddCombOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Combination</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinations.map((comb) => (
              <div key={comb.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900 tracking-tight font-mono text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                    {comb.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Curriculum
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{comb.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{comb.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Mapped Subjects:</span>
                  <div className="flex flex-wrap gap-1">
                    {comb.subjectIds.map((sid) => {
                      const sub = subjects.find((s) => s.id === sid);
                      return (
                        <span key={sid} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-slate-700 text-[11px]">
                          {sub?.code || sid}
                        </span>
                      );
                    })}
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                      GS (Compulsory)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBJECTS CATALOGUE VIEW */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddSubOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102A43] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold">Subject Code</th>
                  <th className="py-3 px-4 font-bold">Subject Name</th>
                  <th className="py-3 px-4 font-bold">Education Level</th>
                  <th className="py-3 px-4 font-bold">Department</th>
                  <th className="py-3 px-4 font-bold">Core / Optional</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-black text-teal-800">{sub.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {sub.level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{sub.departmentName}</td>
                    <td className="py-3 px-4">
                      {sub.isCore ? (
                        <span className="text-emerald-700 font-bold">Core Subject</span>
                      ) : (
                        <span className="text-slate-500">Combination Specific</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Combination Modal */}
      <Modal
        isOpen={isAddCombOpen}
        onClose={() => setIsAddCombOpen(false)}
        title="Create A-Level Subject Combination"
        subtitle="e.g. PCM, PCB, EGM, HGL according to Tanzania curriculum catalogue"
        maxWidth="md"
      >
        <form onSubmit={handleSaveComb} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Combination Code (3-4 Letters) *</label>
            <input
              type="text"
              required
              placeholder="e.g. PCM"
              value={combForm.code}
              onChange={(e) => setCombForm({ ...combForm, code: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg uppercase font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Combination Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Physics, Chemistry, Advanced Mathematics"
              value={combForm.name}
              onChange={(e) => setCombForm({ ...combForm, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description / Career Direction</label>
            <input
              type="text"
              placeholder="e.g. Engineering and Physical Sciences"
              value={combForm.description}
              onChange={(e) => setCombForm({ ...combForm, description: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddCombOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386]"
            >
              Save Combination
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddSubOpen}
        onClose={() => setIsAddSubOpen(false)}
        title="Add Subject to Catalogue"
        subtitle="Register national secondary curriculum subject"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSub} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Subject Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. LIT"
              value={subForm.code}
              onChange={(e) => setSubForm({ ...subForm, code: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Literature in English"
              value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Education Level</label>
            <select
              value={subForm.level}
              onChange={(e) => setSubForm({ ...subForm, level: e.target.value as any })}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="O_LEVEL">O-Level (Form I - IV)</option>
              <option value="A_LEVEL">A-Level (Form V - VI)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddSubOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386]"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
