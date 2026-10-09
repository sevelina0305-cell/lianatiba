import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { DashboardRouter } from './components/dashboards/DashboardRouter';
import { StudentDirectory } from './components/students/StudentDirectory';
import { ClassesModule } from './components/classes/ClassesModule';
import { TeachersModule } from './components/teachers/TeachersModule';
import { SubjectsCombinationsModule } from './components/subjects/SubjectsCombinationsModule';
import { StudentAttendanceModule } from './components/attendance/StudentAttendanceModule';
import { ExamSetupModule } from './components/examinations/ExamSetupModule';
import { MarksEntryModule } from './components/examinations/MarksEntryModule';
import { AcademicReviewModule } from './components/academic/AcademicReviewModule';
import { ReportCardModule } from './components/reports/ReportCardModule';
import { CommunicationModule } from './components/communication/CommunicationModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { TestRunnerModal } from './components/tests/TestRunnerModal';
import { AboutModal } from './components/about/AboutModal';
import { StorageAPI, subscribeToStore } from './lib/storage';
import { User } from './types';
import { Language } from './lib/i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => StorageAPI.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [submissions, setSubmissions] = useState(() => StorageAPI.getSubmissions());
  const allUsers = StorageAPI.getUsers();

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setCurrentUser(StorageAPI.getCurrentUser());
      setSubmissions(StorageAPI.getSubmissions());
    });
    return unsubscribe;
  }, []);

  const pendingReviewsCount = submissions.filter(
    (s) => s.status === 'SUBMITTED' || s.status === 'UNDER_REVIEW'
  ).length;

  const handleUserChange = (user: User) => {
    StorageAPI.setCurrentUser(user);
    setCurrentUser(user);
    // If switching to Parent or Student, ensure currentTab is accessible
    if (user.role === 'PARENT' || user.role === 'STUDENT') {
      if (!['dashboard', 'attendance', 'reportCards', 'announcements'].includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        lang={lang}
        onLangChange={setLang}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenTests={() => setIsTestModalOpen(true)}
        allUsers={allUsers}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Role-Aware Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'tests') {
              setIsTestModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          userRole={currentUser.role}
          lang={lang}
          pendingReviewsCount={pendingReviewsCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/70">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              <DashboardRouter
                currentUser={currentUser}
                onNavigate={setCurrentTab}
                lang={lang}
              />
            )}

            {currentTab === 'students' && (
              <StudentDirectory currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'classes' && (
              <ClassesModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'teachers' && (
              <TeachersModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'departments' && (
              <TeachersModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'subjects' && (
              <SubjectsCombinationsModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'attendance' && (
              <StudentAttendanceModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'staffAttendance' && (
              <StudentAttendanceModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'examinations' && (
              <ExamSetupModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'marksEntry' && (
              <MarksEntryModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'academicReview' && (
              <AcademicReviewModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'reportCards' && (
              <ReportCardModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'communication' && (
              <CommunicationModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'announcements' && (
              <CommunicationModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'smsLogs' && (
              <CommunicationModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'auditLogs' && (
              <SettingsModule currentUser={currentUser} lang={lang} />
            )}

            {currentTab === 'settings' && (
              <SettingsModule currentUser={currentUser} lang={lang} />
            )}
          </div>
        </main>
      </div>

      {/* Verification Test Runner Modal */}
      <TestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      {/* Project Credits Modal for Mimi_SEVELINA DEUS */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}
