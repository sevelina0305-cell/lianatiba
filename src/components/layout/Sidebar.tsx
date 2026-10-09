import React from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Briefcase, Building2, BookOpen,
  CalendarCheck, UserCheck, FileSpreadsheet, CheckSquare, Award,
  MessageSquare, Bell, Smartphone, ShieldAlert, Settings, FileText, CheckCircle
} from 'lucide-react';
import { UserRole } from '../../types';
import { translations, Language } from '../../lib/i18n';

export type NavItemKey =
  | 'dashboard'
  | 'students'
  | 'classes'
  | 'teachers'
  | 'departments'
  | 'subjects'
  | 'attendance'
  | 'staffAttendance'
  | 'examinations'
  | 'marksEntry'
  | 'academicReview'
  | 'reportCards'
  | 'communication'
  | 'announcements'
  | 'smsLogs'
  | 'auditLogs'
  | 'settings'
  | 'tests';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  userRole: UserRole;
  lang: Language;
  pendingReviewsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  lang,
  pendingReviewsCount,
}) => {
  const t = translations[lang];

  // RBAC Navigation items mapping
  const navItems: { key: NavItemKey; label: string; icon: any; allowedRoles: UserRole[]; badge?: number }[] = [
    { key: 'dashboard', label: t.dashboard, icon: LayoutDashboard, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD', 'ACADEMIC_MASTER', 'HEAD_OF_DEPARTMENT', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT', 'STUDENT'] },
    { key: 'students', label: t.students, icon: Users, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD', 'ACADEMIC_MASTER', 'CLASS_TEACHER'] },
    { key: 'classes', label: t.classes, icon: GraduationCap, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER'] },
    { key: 'teachers', label: t.teachers, icon: Briefcase, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD', 'HEAD_OF_DEPARTMENT'] },
    { key: 'departments', label: t.departments, icon: Building2, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'HEAD_OF_DEPARTMENT'] },
    { key: 'subjects', label: t.subjects, icon: BookOpen, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER', 'HEAD_OF_DEPARTMENT'] },
    { key: 'attendance', label: t.attendance, icon: CalendarCheck, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT', 'STUDENT'] },
    { key: 'staffAttendance', label: t.staffAttendance, icon: UserCheck, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD'] },
    { key: 'examinations', label: t.examinations, icon: FileSpreadsheet, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER'] },
    { key: 'marksEntry', label: t.marksEntry, icon: FileText, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACADEMIC_MASTER', 'SUBJECT_TEACHER', 'HEAD_OF_DEPARTMENT'] },
    { key: 'academicReview', label: t.academicReview, icon: CheckSquare, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER'], badge: pendingReviewsCount },
    { key: 'reportCards', label: t.reportCards, icon: Award, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER', 'CLASS_TEACHER', 'PARENT', 'STUDENT'] },
    { key: 'communication', label: t.communication, icon: MessageSquare, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT'] },
    { key: 'announcements', label: t.announcements, icon: Bell, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD', 'ACADEMIC_MASTER', 'HEAD_OF_DEPARTMENT', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT', 'STUDENT'] },
    { key: 'smsLogs', label: t.smsLogs, icon: Smartphone, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER'] },
    { key: 'auditLogs', label: t.auditLogs, icon: ShieldAlert, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER'] },
    { key: 'settings', label: t.settings, icon: Settings, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'ACADEMIC_MASTER'] },
    { key: 'tests', label: t.systemTests, icon: CheckCircle, allowedRoles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HEAD_TEACHER', 'DEPUTY_HEAD', 'ACADEMIC_MASTER', 'HEAD_OF_DEPARTMENT', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT', 'STUDENT'] },
  ];

  const visibleItems = navItems.filter((item) => item.allowedRoles.includes(userRole));

  return (
    <aside className="w-64 bg-[#102A43] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 shadow-xl no-print select-none">
      {/* Role Banner */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Access Scope</p>
        <p className="text-xs font-semibold text-teal-400 mt-0.5 capitalize">
          {userRole.toLowerCase().replace('_', ' ')}
        </p>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#25B99A] to-[#1FA386] text-slate-950 font-bold shadow-md shadow-teal-950/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-950 ml-2">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Tanzania NECTA Standards</p>
        <p className="text-[10px] text-slate-500">O-Level (Div I-IV, 0) • A-Level</p>
      </div>
    </aside>
  );
};
