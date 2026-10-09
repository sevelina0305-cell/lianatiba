import React, { useState } from 'react';
import { 
  Bell, Globe, UserCheck, Shield, BookOpen, LogOut, Info, 
  CheckCircle, ChevronDown, Award
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { translations, Language } from '../../lib/i18n';
import { StorageAPI } from '../../lib/storage';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  onOpenAbout: () => void;
  onOpenTests: () => void;
  allUsers: User[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  lang,
  onLangChange,
  onOpenAbout,
  onOpenTests,
  allUsers,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const t = translations[lang];
  const school = StorageAPI.getSchool();
  const notifications = StorageAPI.getNotifications();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const roleLabels: Record<UserRole, { en: string; sw: string; color: string }> = {
    SUPER_ADMIN: { en: 'Super Admin', sw: 'Msimamizi Mkuu', color: 'bg-purple-900 text-purple-200 border-purple-700' },
    SCHOOL_ADMIN: { en: 'School Admin', sw: 'Msimamizi wa Shule', color: 'bg-indigo-900 text-indigo-200 border-indigo-700' },
    HEAD_TEACHER: { en: 'Headmaster', sw: 'Mkuu wa Shule', color: 'bg-amber-900 text-amber-200 border-amber-700' },
    DEPUTY_HEAD: { en: 'Deputy Head', sw: 'Makamu Mkuu', color: 'bg-blue-900 text-blue-200 border-blue-700' },
    ACADEMIC_MASTER: { en: 'Academic Master', sw: 'Taaluma', color: 'bg-emerald-900 text-emerald-200 border-emerald-700' },
    HEAD_OF_DEPARTMENT: { en: 'Head of Dept (HoD)', sw: 'Mkuu wa Idara', color: 'bg-cyan-900 text-cyan-200 border-cyan-700' },
    CLASS_TEACHER: { en: 'Class Teacher', sw: 'Mwalimu wa Darasa', color: 'bg-teal-900 text-teal-200 border-teal-700' },
    SUBJECT_TEACHER: { en: 'Subject Teacher', sw: 'Mwalimu wa Somo', color: 'bg-sky-900 text-sky-200 border-sky-700' },
    PARENT: { en: 'Parent / Guardian', sw: 'Mzazi / Mlezi', color: 'bg-rose-900 text-rose-200 border-rose-700' },
    STUDENT: { en: 'Student', sw: 'Mwanafunzi', color: 'bg-violet-900 text-violet-200 border-violet-700' },
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#102A43] text-white shadow-md border-b border-slate-700/50">
      {/* Brand & School Details */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#25B99A] to-[#F4C95D] text-slate-900 font-black shadow-lg">
          <BookOpen className="w-5 h-5 text-slate-900" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold tracking-tight text-white text-base">ELIMU PRO</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#25B99A]/20 text-[#25B99A] border border-[#25B99A]/40 uppercase">
              Tanzania
            </span>
          </div>
          <p className="text-xs text-slate-300 truncate max-w-[240px] md:max-w-md">
            {school.name} ({school.registrationNumber}) • {school.district}
          </p>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Verification Test Runner Button */}
        <button
          onClick={onOpenTests}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition shadow-xs"
          title="Run 12 Automated Verification Tests"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">12 QA Tests</span>
        </button>

        {/* Language Selector */}
        <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
          <button
            onClick={() => onLangChange('en')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              lang === 'en' ? 'bg-[#25B99A] text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLangChange('sw')}
            className={`px-2 py-1 text-xs font-medium rounded ${
              lang === 'sw' ? 'bg-[#25B99A] text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            SWA
          </button>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-200 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{t.notifications}</span>
                <span className="text-xs text-slate-500">{notifications.length} alerts</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-500 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => StorageAPI.markNotificationRead(n.id)}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer ${
                        !n.read ? 'bg-amber-50/60 font-medium' : ''
                      }`}
                    >
                      <p className="font-semibold text-slate-800">{n.title}</p>
                      <p className="text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* About & Credits Modal Trigger */}
        <button
          onClick={onOpenAbout}
          className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-[#F4C95D] transition"
          title="About Elimu Pro & Project Credits"
        >
          <Award className="w-4 h-4" />
        </button>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-teal-300">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{currentUser.name}</p>
              <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border font-semibold ${roleLabels[currentUser.role]?.color}`}>
                {lang === 'sw' ? roleLabels[currentUser.role]?.sw : roleLabels[currentUser.role]?.en}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.switchRole}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Test any role without relogging</p>
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {allUsers.map((u) => {
                  const roleMeta = roleLabels[u.role];
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onUserChange(u);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-center space-x-3 text-xs hover:bg-slate-50 transition ${
                        isSelected ? 'bg-teal-50 border-l-4 border-teal-500 font-semibold' : ''
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-slate-900 truncate font-medium">{u.name}</p>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {lang === 'sw' ? roleMeta?.sw : roleMeta?.en}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-slate-100 px-4 py-2 bg-slate-50/80">
                <button
                  onClick={() => {
                    StorageAPI.resetToDefault();
                    window.location.reload();
                  }}
                  className="w-full text-center text-xs text-rose-600 hover:text-rose-700 font-medium py-1"
                >
                  Reset Demo Database
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
