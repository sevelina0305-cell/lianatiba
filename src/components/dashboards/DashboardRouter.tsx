import React from 'react';
import { 
  Users, Award, CalendarCheck, CheckSquare, TrendingUp, AlertTriangle, 
  BookOpen, Clock, Smartphone, ShieldCheck, ArrowUpRight, CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { User, UserRole } from '../../types';
import { StorageAPI } from '../../lib/storage';
import { StatCard } from '../common/StatCard';
import { translations, Language } from '../../lib/i18n';
import { NavItemKey } from '../layout/Sidebar';

interface DashboardProps {
  currentUser: User;
  onNavigate: (tab: NavItemKey) => void;
  lang: Language;
}

export const DashboardRouter: React.FC<DashboardProps> = ({ currentUser, onNavigate, lang }) => {
  const t = translations[lang];
  const school = StorageAPI.getSchool();
  const students = StorageAPI.getStudents();
  const teachers = StorageAPI.getTeachers();
  const classes = StorageAPI.getClasses();
  const submissions = StorageAPI.getSubmissions();
  const attendance = StorageAPI.getStudentAttendance();
  const announcements = StorageAPI.getAnnouncements();
  const marks = StorageAPI.getMarks();
  const pendingReviews = submissions.filter((s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW');

  // Attendance metrics
  const todayPresent = attendance.filter((a) => a.status === 'PRESENT').length;
  const todayTotal = attendance.length || 1;
  const attendanceRate = Math.round((todayPresent / todayTotal) * 100);

  // Performance distribution demo data
  const divisionData = [
    { name: 'Div I (Distinction)', count: 18, color: '#25B99A' },
    { name: 'Div II (Merit)', count: 24, color: '#3B82F6' },
    { name: 'Div III (Credit)', count: 15, color: '#F4C95D' },
    { name: 'Div IV (Pass)', count: 8, color: '#FB923C' },
    { name: 'Div 0 (Fail)', count: 2, color: '#EF4444' },
  ];

  // Subject average scores
  const subjectPerformanceData = [
    { subject: 'Math', average: 74 },
    { subject: 'Physics', average: 76 },
    { subject: 'Chemistry', average: 72 },
    { subject: 'Biology', average: 79 },
    { subject: 'English', average: 82 },
    { subject: 'Kiswahili', average: 85 },
    { subject: 'History', average: 78 },
  ];

  // Specific Parent View
  if (currentUser.role === 'PARENT') {
    const linkedStudents = students.filter((s) => currentUser.linkedStudentIds?.includes(s.id));
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#102A43] to-[#1E3A5F] text-white p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase text-[#25B99A] tracking-wider">Parent Portal</span>
          <h2 className="text-2xl font-black mt-1">Karibu, {currentUser.name}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Tracking academic progress and official attendance for your registered children at {school.name}.
          </p>
        </div>

        {/* Linked Children Cards */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Registered Wanafunzi (Children)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedStudents.map((child) => {
              const childMarks = marks.filter((m) => m.studentId === child.id && m.status === 'PUBLISHED');
              const average = childMarks.length > 0 
                ? Math.round(childMarks.reduce((a, b) => a + (b.rawScore || 0), 0) / childMarks.length) 
                : 'N/A';

              return (
                <div key={child.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg">
                        {child.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{child.fullName}</h4>
                        <p className="text-xs text-slate-500 font-mono">{child.admissionNumber} • {child.className}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {child.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Published Avg</p>
                      <p className="text-lg font-black text-slate-800">{average}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Attendance</p>
                      <p className="text-lg font-black text-emerald-600">100%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Level</p>
                      <p className="text-sm font-black text-slate-700 mt-0.5">{child.level.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => onNavigate('reportCards')}
                      className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F] transition text-center"
                    >
                      View Report Card
                    </button>
                    <button
                      onClick={() => onNavigate('communication')}
                      className="py-2 px-3 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                      Message Teacher
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Announcements for Parents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm">School Announcements</h3>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{lang === 'sw' ? ann.titleSwahili : ann.title}</span>
                  <span className="text-[10px] text-slate-400">{ann.date}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{lang === 'sw' ? ann.contentSwahili : ann.content}</p>
                <span className="text-[10px] text-teal-600 font-semibold mt-1 block">— {ann.authorName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Specific Student View
  if (currentUser.role === 'STUDENT') {
    const student = students.find((s) => s.id === currentUser.studentId) || students[0];
    const myMarks = marks.filter((m) => m.studentId === student.id && m.status === 'PUBLISHED');

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#102A43] to-[#1E3A5F] text-white p-6 rounded-2xl shadow-sm">
          <span className="text-xs font-bold uppercase text-[#F4C95D] tracking-wider">Student Academic Portal</span>
          <h2 className="text-2xl font-black mt-1">Karibu, {student.fullName}</h2>
          <p className="text-xs text-slate-300 mt-1">
            {student.className} • Reg: {student.admissionNumber} • {student.combinationCode ? `Combination: ${student.combinationCode}` : 'O-Level'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Published Subjects" value={myMarks.length} icon={BookOpen} colorScheme="teal" />
          <StatCard title="Attendance Rate" value="100%" icon={CalendarCheck} colorScheme="emerald" />
          <StatCard title="Term Conduct" value="Excellent" icon={Award} colorScheme="amber" />
        </div>

        {/* My Official Published Results */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Official Published Results</h3>
            <button
              onClick={() => onNavigate('reportCards')}
              className="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              Print Official Report Card →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Subject</th>
                  <th className="py-2.5 px-3 font-bold">Score (%)</th>
                  <th className="py-2.5 px-3 font-bold">Grade</th>
                  <th className="py-2.5 px-3 font-bold">Points</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myMarks.map((mk) => (
                  <tr key={mk.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{mk.subjectId.replace('sub_', '').toUpperCase()}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{mk.rawScore}</td>
                    <td className="py-2.5 px-3 font-black text-teal-700">{mk.grade}</td>
                    <td className="py-2.5 px-3 text-slate-600">{mk.points}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Official Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Administrative & Leadership Dashboards (Headmaster, Academic Master, Admin, Teachers)
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-[#102A43] via-[#16385B] to-[#1E3A5F] text-white shadow-sm space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-[#25B99A]/20 text-[#25B99A] border border-[#25B99A]/40 text-[10px] font-bold uppercase tracking-wider">
              {currentUser.role.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-300">Academic Year {school.currentAcademicYear} • {school.currentTerm}</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            {school.name}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Centralized secondary school administration platform for Form I to Form VI (O-Level & A-Level NECTA modules).
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2">
          {currentUser.role === 'ACADEMIC_MASTER' || currentUser.role === 'HEAD_TEACHER' ? (
            <button
              onClick={() => onNavigate('academicReview')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 font-bold text-xs transition shadow-sm"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Review Results ({pendingReviews.length})</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('marksEntry')}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 font-bold text-xs transition shadow-sm"
            >
              <Award className="w-4 h-4" />
              <span>Enter Marks</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('classes')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs border border-teal-500/40 transition"
          >
            <GraduationCap className="w-4 h-4" />
            <span>{lang === 'sw' ? '+ Sajili Darasa' : '+ Add Class'}</span>
          </button>

          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.studentCount}
          value={students.length}
          subtitle="Form I - VI enrolled"
          icon={Users}
          colorScheme="navy"
        />
        <StatCard
          title={t.teacherCount}
          value={teachers.length}
          subtitle="5 Departments active"
          icon={BookOpen}
          colorScheme="teal"
        />
        <StatCard
          title={t.attendanceRate}
          value={`${attendanceRate}%`}
          subtitle="Today's live roll call"
          icon={CalendarCheck}
          colorScheme="emerald"
        />
        <StatCard
          title={t.pendingReview}
          value={pendingReviews.length}
          subtitle="Awaiting Academic Master"
          icon={CheckSquare}
          colorScheme="amber"
        />
      </div>

      {/* Performance & Attendance Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tanzanian Division Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">NECTA Division Performance Analysis</h3>
              <p className="text-xs text-slate-500">Form IV & Form VI Candidates (Mid-Term 2026)</p>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              National Criteria
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={divisionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {divisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Pass Rate Analysis */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Subject Average Scores (%)</h3>
              <p className="text-xs text-slate-500">Core Sciences, Mathematics & Humanities</p>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Pass Benchmark 30%
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subjectPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="average" stroke="#102A43" strokeWidth={3} dot={{ r: 5, fill: '#25B99A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Alerts & Recent Administrative Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Exam Approvals */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Subject Marks Submission & Approval Pipeline</h3>
            <button
              onClick={() => onNavigate('academicReview')}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
            >
              <span>Manage Approvals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {submissions.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{sub.subjectName}</span>
                    <span className="text-xs text-slate-500 font-medium">({sub.className})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      sub.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      sub.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Teacher: {sub.teacherName} • Total: {sub.totalStudents} students • Avg: {sub.averageScore}%
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('academicReview')}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">{t.announcements}</h3>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-bold text-teal-600 hover:text-teal-700"
            >
              All →
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 2).map((ann) => (
              <div key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-xs text-slate-800 line-clamp-1">
                  {lang === 'sw' ? ann.titleSwahili : ann.title}
                </span>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {lang === 'sw' ? ann.contentSwahili : ann.content}
                </p>
                <span className="text-[10px] text-slate-400 block">{ann.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
