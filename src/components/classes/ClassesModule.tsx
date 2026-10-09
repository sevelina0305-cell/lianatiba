import React, { useState } from 'react';
import { 
  GraduationCap, Users, Plus, ArrowUpRight, CheckCircle2, Award, 
  Search, Filter, Edit, Trash2, Eye, DoorClosed, Check, AlertCircle 
} from 'lucide-react';
import { ClassStream, User, Student, Teacher } from '../../types';
import { StorageAPI } from '../../lib/storage';
import { Modal } from '../common/Modal';
import { translations, Language } from '../../lib/i18n';

interface ClassesProps {
  currentUser: User;
  lang: Language;
}

export const ClassesModule: React.FC<ClassesProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [classes, setClasses] = useState<ClassStream[]>(() => StorageAPI.getClasses());
  const teachers = StorageAPI.getTeachers();
  const students = StorageAPI.getStudents();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);
  const [selectedClassForView, setSelectedClassForView] = useState<ClassStream | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    level: string;
    streamName: string;
    classTeacherId: string;
    capacity: number;
    roomNumber: string;
    academicYear: string;
  }>({
    name: 'Form I C',
    level: 'FORM_I',
    streamName: 'C',
    classTeacherId: '',
    capacity: 45,
    roomNumber: 'Block C - 01',
    academicYear: '2026',
  });

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshClasses = () => {
    setClasses(StorageAPI.getClasses());
  };

  // Helper to format level title
  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'FORM_I': return lang === 'sw' ? 'Kidato cha I' : 'Form I';
      case 'FORM_II': return lang === 'sw' ? 'Kidato cha II' : 'Form II';
      case 'FORM_III': return lang === 'sw' ? 'Kidato cha III' : 'Form III';
      case 'FORM_IV': return lang === 'sw' ? 'Kidato cha IV' : 'Form IV';
      case 'FORM_V': return lang === 'sw' ? 'Kidato cha V (A-Level)' : 'Form V (A-Level)';
      case 'FORM_VI': return lang === 'sw' ? 'Kidato cha VI (A-Level)' : 'Form VI (A-Level)';
      default: return lvl;
    }
  };

  // Auto-generate Class Name when Level or Stream changes
  const updateClassName = (level: string, stream: string) => {
    const levelPrefix = level.replace('_', ' ').replace('FORM', 'Form');
    const autoName = `${levelPrefix} ${stream.trim()}`;
    setFormData((prev) => ({
      ...prev,
      level,
      streamName: stream,
      name: autoName,
    }));
  };

  // Open Add modal with fresh defaults
  const handleOpenAdd = () => {
    setFormData({
      name: 'Form I C',
      level: 'FORM_I',
      streamName: 'C',
      classTeacherId: '',
      capacity: 45,
      roomNumber: 'Block A - 04',
      academicYear: '2026',
    });
    setIsAddOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (cls: ClassStream) => {
    setFormData({
      id: cls.id,
      name: cls.name,
      level: cls.level,
      streamName: cls.streamName,
      classTeacherId: cls.classTeacherId || '',
      capacity: cls.capacity,
      roomNumber: cls.roomNumber || '',
      academicYear: cls.academicYear,
    });
    setIsEditOpen(true);
  };

  // Save new or updated Class
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify(lang === 'sw' ? 'Tafadhali andika jina la darasa' : 'Please provide a valid class name', 'error');
      return;
    }

    const assignedTeacher = teachers.find((t) => t.id === formData.classTeacherId);
    const isALevel = formData.level === 'FORM_V' || formData.level === 'FORM_VI';

    const classRecord: ClassStream = {
      id: formData.id || `cls_${Date.now()}`,
      name: formData.name.trim(),
      level: formData.level as any,
      educationLevel: isALevel ? 'A_LEVEL' : 'O_LEVEL',
      streamName: formData.streamName.trim() || 'A',
      academicYear: formData.academicYear || '2026',
      classTeacherId: formData.classTeacherId || undefined,
      classTeacherName: assignedTeacher?.fullName,
      capacity: Number(formData.capacity) || 45,
      roomNumber: formData.roomNumber.trim(),
    };

    StorageAPI.saveClass(classRecord);
    refreshClasses();
    setIsAddOpen(false);
    setIsEditOpen(false);

    notify(
      lang === 'sw'
        ? `Darasa la "${classRecord.name}" limesajiliwa kikamilifu katika Sekondari ya Tura!`
        : `Class "${classRecord.name}" registered successfully into Tura Secondary School!`
    );
  };

  // Delete / Remove class
  const handleDeleteClass = (cls: ClassStream) => {
    const enrolledCount = students.filter((s) => s.classId === cls.id && s.status === 'ACTIVE').length;
    if (enrolledCount > 0) {
      notify(
        lang === 'sw'
          ? `Huwezi kufuta darasa lenye wanafunzi ${enrolledCount}. Tafadhali wahamishe kwanza.`
          : `Cannot delete class with ${enrolledCount} enrolled students. Reassign students first.`,
        'error'
      );
      return;
    }

    if (window.confirm(lang === 'sw' ? `Una uhakika unataka kufuta ${cls.name}?` : `Are you sure you want to delete ${cls.name}?`)) {
      StorageAPI.deleteClass(cls.id);
      refreshClasses();
      notify(lang === 'sw' ? `Darasa la ${cls.name} limefutwa.` : `Class ${cls.name} deleted successfully.`);
    }
  };

  // Filtered classes list
  const filteredClasses = classes.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.classTeacherName && c.classTeacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.roomNumber && c.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = selectedLevelFilter === 'ALL' || c.level === selectedLevelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-between animate-in fade-in ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="underline ml-4 text-white">
            {lang === 'sw' ? 'Funga' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {lang === 'sw' ? 'Madarasa na Mikondo (Classes & Streams)' : 'Classes & Streams Management'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Tura Secondary School
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'sw' 
              ? 'Usajili wa madarasa mapya (Kidato cha I hadi VI), ugawaji wa vyumba na walimu wa madarasa'
              : 'Register new classes (Form I to Form VI), assign class teachers, rooms & capacities'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPromotionOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'sw' ? 'Upandishaji wa Madarasa' : 'Class Promotion'}</span>
          </button>

          {/* Primary Action Button to Add / Register New Class */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'sw' ? '+ Sajili Darasa Jipya' : '+ Register New Class'}</span>
          </button>
        </div>
      </div>

      {/* Search and Level Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'sw' ? 'Tafuta darasa, mwalimu wa darasa, au chumba...' : 'Search class name, class teacher, or room...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <select
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-medium"
          >
            <option value="ALL">{lang === 'sw' ? 'Ngazi Zote (Kidato I - VI)' : 'All Levels (Form I - VI)'}</option>
            <option value="FORM_I">Form I (Kidato cha I)</option>
            <option value="FORM_II">Form II (Kidato cha II)</option>
            <option value="FORM_III">Form III (Kidato cha III)</option>
            <option value="FORM_IV">Form IV (Kidato cha IV)</option>
            <option value="FORM_V">Form V (Kidato cha V - A-Level)</option>
            <option value="FORM_VI">Form VI (Kidato cha VI - A-Level)</option>
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full bg-white p-10 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {lang === 'sw' ? 'Hakuna darasa lililopatikana' : 'No classes match the filter criteria'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#102A43] text-white text-xs font-bold rounded-xl"
            >
              {lang === 'sw' ? 'Sajili Darasa Jipya Sasa' : 'Register New Class Now'}
            </button>
          </div>
        ) : (
          filteredClasses.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id && s.status === 'ACTIVE');
            const enrolled = classStudents.length;
            const percentage = Math.round((enrolled / cls.capacity) * 100);

            return (
              <div key={cls.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{cls.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                        {getLevelLabel(cls.level)}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-black text-sm border border-teal-200 shadow-xs">
                      {cls.streamName}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs mt-4">
                    <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                      <span className="font-medium">{lang === 'sw' ? 'Mwalimu wa Darasa:' : 'Class Teacher:'}</span>
                      <span className="font-bold text-slate-900">{cls.classTeacherName || (lang === 'sw' ? 'Hajapangwa' : 'Not Assigned')}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>{lang === 'sw' ? 'Chumba cha Darasa:' : 'Room Allocated:'}</span>
                      <span className="font-mono text-slate-800 font-semibold">{cls.roomNumber || (lang === 'sw' ? 'Holl Kuu' : 'General Hall')}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span>{lang === 'sw' ? 'Wanafunzi / Uwezo:' : 'Enrolled / Capacity:'}</span>
                      <span className="font-bold text-slate-900">
                        {enrolled} / {cls.capacity} {lang === 'sw' ? 'wanafunzi' : 'students'}
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percentage >= 95 ? 'bg-rose-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-[#25B99A]'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Class Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => {
                      setSelectedClassForView(cls);
                      setIsStudentsModalOpen(true);
                    }}
                    className="flex items-center space-x-1 text-teal-700 hover:text-teal-800 font-bold"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{lang === 'sw' ? `Wanafunzi (${enrolled})` : `Students (${enrolled})`}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                      title={lang === 'sw' ? 'Hariri Darasa' : 'Edit Class'}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title={lang === 'sw' ? 'Futa Darasa' : 'Delete Class'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: SAJILI DARASA JIPYA / REGISTER NEW CLASS */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={lang === 'sw' ? 'Usajili wa Darasa Jipya — Tura Secondary School' : 'Register New Class — Tura Secondary School'}
        subtitle={lang === 'sw' ? 'Weka taarifa za darasa jipya, mkondo, mwalimu wa darasa na chumba' : 'Configure level, stream name, room allocation and assigned class teacher'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
            <p className="font-bold">
              {lang === 'sw' ? 'Taarifa ya Usajili:' : 'Registration Guidance:'}
            </p>
            <p className="text-[11px] mt-0.5">
              {lang === 'sw'
                ? 'Unaweza kusajili mkondo wowote kuanzia Kidato cha I hadi VI (mfano Form I C, Form II B, au Form V PCM).'
                : 'Supports all Form levels from Form I to VI with custom streams (e.g., Form I C, Form II B, or Form V PCM).'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'sw' ? 'Kiwango cha Darasa (Level) *' : 'Form Level *'}
              </label>
              <select
                value={formData.level}
                onChange={(e) => updateClassName(e.target.value, formData.streamName)}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800"
              >
                <option value="FORM_I">Kidato cha I (Form I)</option>
                <option value="FORM_II">Kidato cha II (Form II)</option>
                <option value="FORM_III">Kidato cha III (Form III)</option>
                <option value="FORM_IV">Kidato cha IV (Form IV)</option>
                <option value="FORM_V">Kidato cha V (Form V - A-Level)</option>
                <option value="FORM_VI">Kidato cha VI (Form VI - A-Level)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'sw' ? 'Mkondo (Stream) *' : 'Stream Name *'}
              </label>
              <input
                type="text"
                required
                placeholder="A, B, C, PCM, PCB..."
                value={formData.streamName}
                onChange={(e) => updateClassName(formData.level, e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg uppercase font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {lang === 'sw' ? 'Jina Rasmi la Darasa *' : 'Official Class Name *'}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Form I C"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg font-bold text-slate-900 bg-slate-50"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {lang === 'sw' ? 'Mwalimu wa Darasa (Class Teacher)' : 'Assigned Class Teacher'}
            </label>
            <select
              value={formData.classTeacherId}
              onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              <option value="">{lang === 'sw' ? '-- Chagua Mwalimu wa Darasa --' : '-- Select a Teacher --'}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName} ({t.staffId}) — {t.departmentName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'sw' ? 'Uwezo wa Wanafunzi (Max Capacity)' : 'Max Capacity'}
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'sw' ? 'Chumba cha Darasa (Room Number)' : 'Room Allocation'}
              </label>
              <input
                type="text"
                placeholder="Block A - Chumba 04"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2 font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386] shadow-sm flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'sw' ? 'Kamilisha Usajili wa Darasa' : 'Save & Register Class'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: HARIRI DARASA / EDIT CLASS */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title={lang === 'sw' ? 'Hariri Taarifa za Darasa' : 'Edit Class Details'}
        subtitle={formData.name}
        maxWidth="md"
      >
        <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {lang === 'sw' ? 'Jina la Darasa *' : 'Class Name *'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {lang === 'sw' ? 'Mwalimu wa Darasa' : 'Class Teacher'}
            </label>
            <select
              value={formData.classTeacherId}
              onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="">{lang === 'sw' ? '-- Hakuna Mwalimu aliyepangwa --' : '-- No Teacher Assigned --'}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName} ({t.staffId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'sw' ? 'Uwezo wa Wanafunzi' : 'Capacity'}
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'sw' ? 'Chumba cha Darasa' : 'Room Number'}
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F]"
            >
              {lang === 'sw' ? 'Hifadhi Mabadiliko' : 'Update Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: TAZAMA WANAFUNZI WA DARASA HILI */}
      <Modal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
        title={selectedClassForView ? `${selectedClassForView.name} — Orodha ya Wanafunzi` : 'Wanafunzi wa Darasa'}
        subtitle={selectedClassForView ? `Jumla ya wanafunzi waliosajiliwa: ${students.filter((s) => s.classId === selectedClassForView.id && s.status === 'ACTIVE').length}` : ''}
        maxWidth="xl"
      >
        <div className="space-y-3 text-xs">
          {selectedClassForView && (
            <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#102A43] text-white sticky top-0">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Namba ya Usajili</th>
                    <th className="py-2 px-3">Jina Kamili</th>
                    <th className="py-2 px-3">Jinsia</th>
                    <th className="py-2 px-3">Mzazi / Mlezi</th>
                    <th className="py-2 px-3">Simu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => s.classId === selectedClassForView.id && s.status === 'ACTIVE')
                    .map((std, idx) => (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">{std.admissionNumber}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900">{std.fullName}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${std.gender === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                            {std.gender}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-700">{std.guardianName}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{std.guardianPhone}</td>
                      </tr>
                    ))}
                  {students.filter((s) => s.classId === selectedClassForView.id && s.status === 'ACTIVE').length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {lang === 'sw' ? 'Hakuna wanafunzi waliosajiliwa kwenye darasa hili bado.' : 'No students enrolled in this class yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsStudentsModalOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              {lang === 'sw' ? 'Funga' : 'Close'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Promotion Workflow Modal */}
      <Modal
        isOpen={isPromotionOpen}
        onClose={() => setIsPromotionOpen(false)}
        title={lang === 'sw' ? 'Upandishaji wa Madarasa Kila Mwaka' : 'Annual Student Promotion Workflow'}
        subtitle="End of Academic Year batch progression under Board approval"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <p className="font-bold">
              {lang === 'sw' ? 'Tahadhari ya Kiakademia:' : 'Promotion Safeguards (Section 7):'}
            </p>
            <p>
              {lang === 'sw' 
                ? 'Wanafunzi hawapandishwi darasa moja kwa moja bila idhini ya Bodi ya Taaluma ya Shule ya Sekondari Tura. Rekodi zote za miaka iliyopita zinalindwa.'
                : 'Students are not automatically promoted without authorized Academic Board approval of Tura Secondary School. Historical academic records remain frozen.'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">
              {lang === 'sw' ? 'Mpangilio wa Upandishaji (Progression):' : 'Promotion Mapping:'}
            </label>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
              <p>Form I (2026) → Form II (2027)</p>
              <p>Form II (2026) → Form III (2027)</p>
              <p>Form III (2026) → Form IV (2027)</p>
              <p>Form IV (2026) → NECTA CSEE Alumni</p>
              <p>Form V (2026) → Form VI (2027)</p>
              <p>Form VI (2026) → NECTA ACSEE Alumni</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsPromotionOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              {lang === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              onClick={() => {
                setIsPromotionOpen(false);
                notify(lang === 'sw' ? 'Upandishaji wa madarasa umekamilika kikamilifu!' : 'Class promotions completed successfully!');
              }}
              className="px-5 py-2 font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F]"
            >
              {lang === 'sw' ? 'Thibitisha Upandishaji' : 'Confirm Academic Promotion'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
