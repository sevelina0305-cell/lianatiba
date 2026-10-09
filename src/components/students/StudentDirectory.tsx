import React, { useState } from 'react';
import { 
  Users, UserPlus, Download, Upload, Search, Filter, 
  ArrowLeftRight, FileText, CheckCircle2, AlertCircle, Edit, Archive
} from 'lucide-react';
import { Student, User, SubjectCombination, CombinationChangeHistory } from '../../types';
import { StorageAPI } from '../../lib/storage';
import { Modal } from '../common/Modal';
import { translations, Language } from '../../lib/i18n';

interface StudentDirectoryProps {
  currentUser: User;
  lang: Language;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [students, setStudents] = useState<Student[]>(StorageAPI.getStudents());
  const [classes] = useState(StorageAPI.getClasses());
  const [combinations] = useState<SubjectCombination[]>(StorageAPI.getCombinations());
  const [comboHistory, setComboHistory] = useState<CombinationChangeHistory[]>(StorageAPI.getCombinationHistory());

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    gender: 'M',
    dateOfBirth: '2008-01-01',
    admissionDate: new Date().toISOString().split('T')[0],
    classId: classes[0]?.id || '',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: 'Parent',
    address: '',
    emergencyContact: '',
    status: 'ACTIVE',
    previousSchool: '',
  });

  // Combination Change State
  const [selectedStudentForCombo, setSelectedStudentForCombo] = useState<Student | null>(null);
  const [targetComboId, setTargetComboId] = useState<string>('');
  const [comboChangeReason, setComboChangeReason] = useState<string>('');

  const refreshStudents = () => {
    setStudents(StorageAPI.getStudents());
    setComboHistory(StorageAPI.getCombinationHistory());
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered List
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardianPhone.includes(searchTerm);
    const matchesClass = selectedClass === 'ALL' || s.classId === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Register Student Handler
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.classId || !formData.guardianPhone) {
      showToast('Please fill all mandatory fields.', 'error');
      return;
    }

    const assignedClass = classes.find((c) => c.id === formData.classId);
    const admissionNo = `ELM/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: Student = {
      id: `std_${Date.now()}`,
      schoolId: StorageAPI.getSchool().id,
      admissionNumber: admissionNo,
      fullName: formData.fullName!,
      gender: formData.gender as 'M' | 'F',
      dateOfBirth: formData.dateOfBirth!,
      admissionDate: formData.admissionDate!,
      classId: formData.classId!,
      className: assignedClass?.name || 'Class',
      level: assignedClass?.level || 'FORM_I',
      educationLevel: assignedClass?.educationLevel || 'O_LEVEL',
      combinationId: formData.combinationId,
      combinationCode: combinations.find((c) => c.id === formData.combinationId)?.code,
      status: formData.status as any || 'ACTIVE',
      guardianName: formData.guardianName || 'Guardian',
      guardianPhone: formData.guardianPhone!,
      guardianRelationship: formData.guardianRelationship || 'Parent',
      address: formData.address || 'Tanzania',
      emergencyContact: formData.emergencyContact || formData.guardianPhone!,
      previousSchool: formData.previousSchool,
    };

    StorageAPI.saveStudent(newStudent);
    refreshStudents();
    setIsRegisterOpen(false);
    showToast(`Student ${newStudent.fullName} registered successfully! (Adm No: ${admissionNo})`);
  };

  // Combination Change Workflow (Section 10)
  const handleCombinationChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForCombo || !targetComboId || !comboChangeReason) {
      showToast('Please select a valid combination and provide a reason.', 'error');
      return;
    }

    const result = StorageAPI.changeStudentCombination(
      selectedStudentForCombo.id,
      targetComboId,
      comboChangeReason,
      currentUser.name
    );

    if (result.success) {
      refreshStudents();
      setIsComboModalOpen(false);
      showToast(`A-Level combination successfully updated for ${selectedStudentForCombo.fullName}. All past marks preserved!`);
    } else {
      showToast(result.error || 'Failed to change combination.', 'error');
    }
  };

  // Bulk CSV Export
  const handleExportCSV = () => {
    const headers = ['AdmissionNo', 'FullName', 'Gender', 'Class', 'Level', 'Combination', 'Status', 'GuardianName', 'GuardianPhone'];
    const rows = filteredStudents.map((s) => [
      s.admissionNumber,
      `"${s.fullName}"`,
      s.gender,
      `"${s.className}"`,
      s.level,
      s.combinationCode || 'N/A',
      s.status,
      `"${s.guardianName}"`,
      s.guardianPhone,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ElimuPro_Students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Student list exported to CSV successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-md transition-all ${
          notification.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 underline text-white">Dismiss</button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.students}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered secondary students, class rosters, A-Level combinations & guardians
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Combination History</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="ALL">All Classes (Form I - VI)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="ALL">All Enrolment Statuses</option>
            <option value="ACTIVE">Active (Yupo Shuleni)</option>
            <option value="TRANSFERRED_OUT">Transferred Out</option>
            <option value="TRANSFERRED_IN">Transferred In</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white">
              <tr>
                <th className="py-3 px-4 font-bold">{t.admissionNumber}</th>
                <th className="py-3 px-4 font-bold">{t.fullName}</th>
                <th className="py-3 px-4 font-bold">{t.gender}</th>
                <th className="py-3 px-4 font-bold">{t.class}</th>
                <th className="py-3 px-4 font-bold">Combination</th>
                <th className="py-3 px-4 font-bold">{t.guardian} & Phone</th>
                <th className="py-3 px-4 font-bold">{t.status}</th>
                <th className="py-3 px-4 font-bold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No student records match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{std.admissionNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>
                        {std.fullName}
                        {std.previousSchool && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Transferred from: {std.previousSchool}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${std.gender === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                        {std.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{std.className}</td>
                    <td className="py-3 px-4">
                      {std.combinationCode ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {std.combinationCode}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">General O-Level</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{std.guardianName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{std.guardianPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        std.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        std.status === 'TRANSFERRED_IN' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {std.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {/* Combination Change Action (Only for A-Level) */}
                      {std.educationLevel === 'A_LEVEL' && (
                        <button
                          onClick={() => {
                            setSelectedStudentForCombo(std);
                            setTargetComboId(std.combinationId || '');
                            setIsComboModalOpen(true);
                          }}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                          title="Change Combination"
                        >
                          Change Combo
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Student Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Student Registration (Usajili wa Mwanafunzi)"
        subtitle="Registers new Form I-VI student into Tanzania secondary database"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kelvin David Mushi"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="M">Male (Mvulana)</option>
                <option value="F">Female (Msichana)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Class & Stream *</label>
              <select
                required
                value={formData.classId}
                onChange={(e) => {
                  const selClass = classes.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    classId: e.target.value,
                    combinationId: selClass?.educationLevel === 'A_LEVEL' ? combinations[0]?.id : undefined,
                  });
                }}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.level.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* If A-Level, select Combination */}
            {classes.find((c) => c.id === formData.classId)?.educationLevel === 'A_LEVEL' && (
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">A-Level Subject Combination *</label>
                <select
                  value={formData.combinationId}
                  onChange={(e) => setFormData({ ...formData, combinationId: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {combinations.map((comb) => (
                    <option key={comb.id} value={comb.id}>
                      {comb.code} — {comb.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Guardian Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. David Mushi"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Guardian Phone (Tanzania +255) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 0754998877"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Enrolment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="ACTIVE">Active (New Student)</option>
                <option value="TRANSFERRED_IN">Transfer In (Kutoka Shule Nyingine)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Previous School (If Transfer)</label>
              <input
                type="text"
                placeholder="e.g. Nsumba Secondary School"
                value={formData.previousSchool}
                onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386] transition shadow-sm"
            >
              Save Student Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Combination Change Modal (Section 10) */}
      <Modal
        isOpen={isComboModalOpen}
        onClose={() => setIsComboModalOpen(false)}
        title="A-Level Combination Change Workflow"
        subtitle="Audited transition protecting historical marks and subject allocations"
        maxWidth="md"
      >
        {selectedStudentForCombo && (
          <form onSubmit={handleCombinationChangeSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-amber-900">Student: {selectedStudentForCombo.fullName}</p>
              <p className="text-amber-800">
                Current Combination: <strong className="font-bold">{selectedStudentForCombo.combinationCode || 'None'}</strong>
              </p>
              <p className="text-[11px] text-amber-700">
                Rule: Changing combination updates current semester enrolment without erasing previous examination marks.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">New Approved Combination *</label>
              <select
                value={targetComboId}
                onChange={(e) => setTargetComboId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {combinations.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Reason for Combination Change *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Student passed additional criteria for PCB; approved by Academic Board."
                value={comboChangeReason}
                onChange={(e) => setComboChangeReason(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsComboModalOpen(false)}
                className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F]"
              >
                Authorize & Migrate
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Combination Change History Log Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Combination Transition Audit Log"
        subtitle="Immutable historical audit records of student curriculum migrations"
        maxWidth="lg"
      >
        <div className="space-y-3">
          {comboHistory.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">No combination migrations recorded yet.</p>
          ) : (
            comboHistory.map((h) => (
              <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{h.studentName} ({h.admissionNumber})</span>
                  <span className="text-[10px] text-slate-500">{h.effectiveDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-slate-200 font-mono text-[10px] font-bold">{h.previousCombinationCode}</span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono text-[10px] font-bold">{h.newCombinationCode}</span>
                </div>
                <p className="text-slate-600 italic text-[11px]">Reason: {h.reason}</p>
                <p className="text-[10px] text-slate-400">Authorized by: {h.approvedBy}</p>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
