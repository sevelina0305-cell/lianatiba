import React, { useState } from 'react';
import { 
  Briefcase, Plus, Search, Building2, UserCheck, Mail, Phone, Award, ShieldCheck 
} from 'lucide-react';
import { Teacher, Department, User } from '../../types';
import { StorageAPI } from '../../lib/storage';
import { Modal } from '../common/Modal';
import { translations, Language } from '../../lib/i18n';

interface TeachersProps {
  currentUser: User;
  lang: Language;
}

export const TeachersModule: React.FC<TeachersProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [teachers, setTeachers] = useState<Teacher[]>(StorageAPI.getTeachers());
  const [departments] = useState<Department[]>(StorageAPI.getDepartments());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    fullName: '',
    email: '',
    phone: '',
    gender: 'M',
    qualification: 'B.Sc with Education (UDSM)',
    departmentId: departments[0]?.id || '',
    positions: ['Subject Teacher'],
    isActive: true,
  });

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.phone) return;

    const dept = departments.find((d) => d.id === newTeacher.departmentId);
    const teacher: Teacher = {
      id: `tch_${Date.now()}`,
      staffId: `TSC-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: newTeacher.fullName!,
      email: newTeacher.email!,
      phone: newTeacher.phone!,
      gender: (newTeacher.gender as 'M' | 'F') || 'M',
      qualification: newTeacher.qualification || 'B.A Ed',
      departmentId: newTeacher.departmentId!,
      departmentName: dept?.name || 'Academics',
      positions: newTeacher.positions || ['Subject Teacher'],
      roles: ['SUBJECT_TEACHER'],
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0],
    };

    StorageAPI.saveTeacher(teacher);
    setTeachers(StorageAPI.getTeachers());
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.teachers}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered teaching faculty, TSC numbers, qualifications & department affiliations
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register Teacher</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by teacher name, staff ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((tch) => (
          <div key={tch.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-[#102A43] text-white flex items-center justify-center font-bold text-base">
                  {tch.fullName.charAt(4) || 'T'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{tch.fullName}</h4>
                  <span className="font-mono text-[11px] text-teal-700 font-bold block">{tch.staffId}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Staff
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{tch.departmentName}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{tch.qualification}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{tch.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{tch.email}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {tch.positions.map((pos) => (
                <span key={pos} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                  {pos}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Teaching Staff"
        subtitle="Onboard a secondary school teacher to ELIMU PRO"
        maxWidth="md"
      >
        <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mwl. Juma K. Ally"
              value={newTeacher.fullName}
              onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email *</label>
            <input
              type="email"
              required
              placeholder="juma@kilimanjarostar.sc.tz"
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Phone Number (Tanzania +255) *</label>
            <input
              type="text"
              required
              placeholder="0754123456"
              value={newTeacher.phone}
              onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Academic Department</label>
            <select
              value={newTeacher.departmentId}
              onChange={(e) => setNewTeacher({ ...newTeacher, departmentId: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Qualifications</label>
            <input
              type="text"
              placeholder="e.g. B.Sc with Education (UDSM)"
              value={newTeacher.qualification}
              onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386]"
            >
              Save Teacher
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
