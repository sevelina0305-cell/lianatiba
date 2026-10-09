import React, { useState } from 'react';
import { 
  CalendarCheck, UserCheck, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Printer, Save, Check, Filter, Calendar
} from 'lucide-react';
import { 
  Student, ClassStream, StudentAttendanceRecord, StaffAttendanceRecord, 
  AttendanceStatus, StaffAttendanceStatus, User, Teacher 
} from '../../types';
import { StorageAPI } from '../../lib/storage';
import { translations, Language } from '../../lib/i18n';

interface AttendanceProps {
  currentUser: User;
  lang: Language;
}

export const StudentAttendanceModule: React.FC<AttendanceProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'STAFF'>('STUDENT');
  const classes = StorageAPI.getClasses();
  const teachers = StorageAPI.getTeachers();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[4]?.id || classes[0]?.id); // Form IV A default
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Student list for selected class
  const classStudents = StorageAPI.getStudents().filter((s) => s.classId === selectedClassId && s.status === 'ACTIVE');
  
  // Existing attendance state
  const existingRecords = StorageAPI.getStudentAttendance(selectedClassId, attendanceDate);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remark: string }>>(() => {
    const map: Record<string, { status: AttendanceStatus; remark: string }> = {};
    for (const std of classStudents) {
      const match = existingRecords.find((r) => r.studentId === std.id);
      map[std.id] = {
        status: match ? match.status : 'PRESENT',
        remark: match?.remark || '',
      };
    }
    return map;
  });

  // Staff Attendance State
  const existingStaffRecords = StorageAPI.getStaffAttendance(attendanceDate);
  const [staffAttendanceMap, setStaffAttendanceMap] = useState<Record<string, { status: StaffAttendanceStatus; remark: string }>>(() => {
    const map: Record<string, { status: StaffAttendanceStatus; remark: string }> = {};
    for (const tch of teachers) {
      const match = existingStaffRecords.find((r) => r.staffId === tch.id);
      map[tch.id] = {
        status: match ? match.status : 'PRESENT',
        remark: match?.remark || '',
      };
    }
    return map;
  });

  // Bulk mark all
  const handleMarkAllStudents = (status: AttendanceStatus) => {
    const updated = { ...attendanceMap };
    for (const std of classStudents) {
      updated[std.id] = { ...updated[std.id], status };
    }
    setAttendanceMap(updated);
  };

  // Save Student Attendance
  const handleSaveStudentAttendance = () => {
    const recordsToSave: StudentAttendanceRecord[] = classStudents.map((std) => ({
      id: `att_${selectedClassId}_${std.id}_${attendanceDate}`,
      classId: selectedClassId,
      date: attendanceDate,
      studentId: std.id,
      studentName: std.fullName,
      admissionNumber: std.admissionNumber,
      status: attendanceMap[std.id]?.status || 'PRESENT',
      remark: attendanceMap[std.id]?.remark || '',
      markedBy: currentUser.id,
      markedByName: currentUser.name,
      updatedAt: new Date().toISOString(),
    }));

    StorageAPI.saveStudentAttendance(recordsToSave);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Save Staff Attendance
  const handleSaveStaffAttendance = () => {
    teachers.forEach((tch) => {
      const record: StaffAttendanceRecord = {
        id: `att_stf_${tch.id}_${attendanceDate}`,
        staffId: tch.id,
        staffName: tch.fullName,
        date: attendanceDate,
        status: staffAttendanceMap[tch.id]?.status || 'PRESENT',
        remark: staffAttendanceMap[tch.id]?.remark || '',
        markedBy: currentUser.name,
      };
      StorageAPI.saveStaffAttendance(record);
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Stats
  const currentTotal = classStudents.length || 1;
  const currentPresent = Object.values(attendanceMap).filter((v) => v.status === 'PRESENT').length;
  const currentAbsent = Object.values(attendanceMap).filter((v) => v.status === 'ABSENT').length;
  const currentLate = Object.values(attendanceMap).filter((v) => v.status === 'LATE').length;
  const currentRate = Math.round((currentPresent / currentTotal) * 100);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Attendance Register (Mahudhurio)</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Live Roll Call
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record daily student sessions, repeat absence flags, and staff check-ins
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Student vs Staff toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('STUDENT')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'STUDENT' ? 'bg-[#102A43] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student Roll Call
            </button>
            <button
              onClick={() => setActiveTab('STAFF')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'STAFF' ? 'bg-[#102A43] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Attendance
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Register</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Attendance records successfully saved and synchronized!</span>
        </div>
      )}

      {/* STUDENT ATTENDANCE SECTION */}
      {activeTab === 'STUDENT' && (
        <div className="space-y-6">
          {/* Controls: Class selector, Date, Summary KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 no-print">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Select Class / Stream</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  const newClassStudents = StorageAPI.getStudents().filter((s) => s.classId === e.target.value && s.status === 'ACTIVE');
                  const newExisting = StorageAPI.getStudentAttendance(e.target.value, attendanceDate);
                  const map: Record<string, { status: AttendanceStatus; remark: string }> = {};
                  for (const std of newClassStudents) {
                    const match = newExisting.find((r) => r.studentId === std.id);
                    map[std.id] = { status: match ? match.status : 'PRESENT', remark: match?.remark || '' };
                  }
                  setAttendanceMap(map);
                }}
                className="w-full p-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.level.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Roll Call Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full p-2 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2 bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-800">Class Rate Today</span>
                <p className="text-2xl font-black text-teal-900">{currentRate}%</p>
                <p className="text-[11px] text-teal-700 font-medium">
                  {currentPresent} Present • {currentAbsent} Absent • {currentLate} Late
                </p>
              </div>

              <div className="flex space-x-1">
                <button
                  onClick={() => handleMarkAllStudents('PRESENT')}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  All Present
                </button>
                <button
                  onClick={handleSaveStudentAttendance}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#102A43] text-white hover:bg-[#1E3A5F] transition flex items-center space-x-1 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Printable Official Register Header */}
          <div className="print-only hidden p-4 text-center border-b border-slate-300">
            <h1 className="text-xl font-black text-slate-900">{StorageAPI.getSchool().name}</h1>
            <p className="text-xs text-slate-600">OFFICIAL CLASS ATTENDANCE REGISTER — TAREHE: {attendanceDate}</p>
            <p className="text-xs font-bold text-slate-800">
              DARASA: {classes.find((c) => c.id === selectedClassId)?.name}
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#102A43] text-white">
                  <tr>
                    <th className="py-3 px-4 font-bold">#</th>
                    <th className="py-3 px-4 font-bold">Admission No</th>
                    <th className="py-3 px-4 font-bold">Student Name</th>
                    <th className="py-3 px-4 font-bold">Gender</th>
                    <th className="py-3 px-4 font-bold text-center">Attendance Status</th>
                    <th className="py-3 px-4 font-bold">Official Remarks / Excuses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((std, idx) => {
                    const currentStatus = attendanceMap[std.id]?.status || 'PRESENT';
                    const remark = attendanceMap[std.id]?.remark || '';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{std.admissionNumber}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{std.fullName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${std.gender === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                            {std.gender}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map((status) => {
                              const isSel = currentStatus === status;
                              const colors = {
                                PRESENT: isSel ? 'bg-emerald-600 text-white' : 'text-slate-600',
                                ABSENT: isSel ? 'bg-rose-600 text-white' : 'text-slate-600',
                                LATE: isSel ? 'bg-amber-600 text-white' : 'text-slate-600',
                                EXCUSED: isSel ? 'bg-blue-600 text-white' : 'text-slate-600',
                              }[status];

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() =>
                                    setAttendanceMap({
                                      ...attendanceMap,
                                      [std.id]: { ...attendanceMap[std.id], status },
                                    })
                                  }
                                  className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${colors}`}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Reason for absence..."
                            value={remark}
                            onChange={(e) =>
                              setAttendanceMap({
                                ...attendanceMap,
                                [std.id]: { ...attendanceMap[std.id], remark: e.target.value },
                              })
                            }
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end no-print">
              <button
                onClick={handleSaveStudentAttendance}
                className="px-6 py-2 text-xs font-bold rounded-xl bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 transition shadow-sm"
              >
                Submit Class Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF ATTENDANCE SECTION */}
      {activeTab === 'STAFF' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Staff Attendance Register</h3>
              <p className="text-xs text-slate-500">Teachers and administrative personnel daily log</p>
            </div>
            <button
              onClick={handleSaveStaffAttendance}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F] transition"
            >
              Save Staff Register
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#102A43] text-white">
              <tr>
                <th className="py-3 px-4 font-bold">Staff ID</th>
                <th className="py-3 px-4 font-bold">Teacher Name</th>
                <th className="py-3 px-4 font-bold">Department</th>
                <th className="py-3 px-4 font-bold text-center">Status</th>
                <th className="py-3 px-4 font-bold">Official Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.map((tch) => {
                const currentStatus = staffAttendanceMap[tch.id]?.status || 'PRESENT';
                const remark = staffAttendanceMap[tch.id]?.remark || '';

                return (
                  <tr key={tch.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{tch.staffId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{tch.fullName}</td>
                    <td className="py-3 px-4 text-slate-600">{tch.departmentName}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                        {(['PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE'] as StaffAttendanceStatus[]).map((status) => {
                          const isSel = currentStatus === status;
                          return (
                            <button
                              key={status}
                              onClick={() =>
                                setStaffAttendanceMap({
                                  ...staffAttendanceMap,
                                  [tch.id]: { ...staffAttendanceMap[tch.id], status },
                                })
                              }
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition ${
                                isSel ? 'bg-[#102A43] text-white' : 'text-slate-600'
                              }`}
                            >
                              {status.replace('_', ' ')}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Leave justification, etc."
                        value={remark}
                        onChange={(e) =>
                          setStaffAttendanceMap({
                            ...staffAttendanceMap,
                            [tch.id]: { ...staffAttendanceMap[tch.id], remark: e.target.value },
                          })
                        }
                        className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
