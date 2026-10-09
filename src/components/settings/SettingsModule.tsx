import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, ShieldCheck, Smartphone, Award, BookOpen, 
  Save, RefreshCw, CheckCircle2, Lock 
} from 'lucide-react';
import { School, GradingScheme, AuditLog, User } from '../../types';
import { StorageAPI } from '../../lib/storage';
import { SMSConfig } from '../../lib/sms';
import { translations, Language } from '../../lib/i18n';

interface SettingsProps {
  currentUser: User;
  lang: Language;
}

export const SettingsModule: React.FC<SettingsProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'SCHOOL' | 'GRADING' | 'SMS' | 'AUDIT'>('SCHOOL');

  // School Profile
  const [school, setSchool] = useState<School>(StorageAPI.getSchool());
  // Grading Schemes
  const [schemes, setSchemes] = useState<GradingScheme[]>(StorageAPI.getGradingSchemes());
  // SMS Config
  const [smsConfig, setSmsConfig] = useState<SMSConfig>(StorageAPI.getSmsConfig());
  // Audit Logs
  const [auditLogs] = useState<AuditLog[]>(StorageAPI.getAuditLogs());

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    StorageAPI.updateSchool(school);
    showToast('School profile updated successfully!');
  };

  const handleSaveSmsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    StorageAPI.saveSmsConfig(smsConfig);
    showToast('SMS Gateway settings updated!');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-4 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.settings}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional settings, grading boundaries, telecom adapters & security audit logs
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('SCHOOL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'SCHOOL' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            School Profile
          </button>
          <button
            onClick={() => setActiveTab('GRADING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'GRADING' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            Grading Schemes
          </button>
          <button
            onClick={() => setActiveTab('SMS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'SMS' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            SMS Gateway
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'AUDIT' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* SCHOOL PROFILE TAB */}
      {activeTab === 'SCHOOL' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl">
          <form onSubmit={handleSaveSchool} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Official Institutional Information (Taarifa za Shule)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">School Official Name *</label>
                <input
                  type="text"
                  required
                  value={school.name}
                  onChange={(e) => setSchool({ ...school, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Registration Number (NECTA/MoEST) *</label>
                <input
                  type="text"
                  required
                  value={school.registrationNumber}
                  onChange={(e) => setSchool({ ...school, registrationNumber: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motto / Kauli Mbiu</label>
                <input
                  type="text"
                  value={school.motto}
                  onChange={(e) => setSchool({ ...school, motto: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Region & District</label>
                <input
                  type="text"
                  value={`${school.district}, ${school.region}`}
                  onChange={(e) => setSchool({ ...school, district: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Current Academic Year</label>
                <input
                  type="text"
                  value={school.currentAcademicYear}
                  onChange={(e) => setSchool({ ...school, currentAcademicYear: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Active Term</label>
                <input
                  type="text"
                  value={school.currentTerm}
                  onChange={(e) => setSchool({ ...school, currentTerm: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Headmaster / Principal Name</label>
                <input
                  type="text"
                  value={school.principalName}
                  onChange={(e) => setSchool({ ...school, principalName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Academic Master Name</label>
                <input
                  type="text"
                  value={school.academicMasterName}
                  onChange={(e) => setSchool({ ...school, academicMasterName: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F] transition"
              >
                Save School Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GRADING SCHEMES TAB */}
      {activeTab === 'GRADING' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
            <p className="font-bold">Configurable Tanzania Secondary Grading Engine (Section 17):</p>
            <p className="mt-0.5">
              Grade boundaries and Division cut-offs can be customized according to Ministry guidelines without altering source code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schemes.map((sc) => (
              <div key={sc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-black text-slate-900 text-sm">{sc.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {sc.level}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-700">Subject Grade Boundaries:</p>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {sc.boundaries.map((b) => (
                      <div key={b.grade} className="p-2 flex items-center justify-between bg-slate-50/50">
                        <span className="font-black text-slate-900 w-8">{b.grade}</span>
                        <span className="text-slate-600 font-mono text-[11px]">{b.minScore}% - {b.maxScore}%</span>
                        <span className="text-slate-500 font-bold">{b.points} pt</span>
                        <span className="text-teal-700 font-medium italic text-[11px]">{b.remark} ({b.remarkSwahili})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-700">Division Cut-Offs:</p>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {sc.divisions.map((d) => (
                      <div key={d.division} className="p-2 flex items-center justify-between bg-slate-50/50">
                        <span className="font-bold text-emerald-700 w-16">Div {d.division}</span>
                        <span className="text-slate-600 font-mono text-[11px]">{d.minPoints} - {d.maxPoints} pts</span>
                        <span className="text-slate-500 text-[11px]">{d.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMS CONFIG TAB */}
      {activeTab === 'SMS' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-xl space-y-4">
          <form onSubmit={handleSaveSmsConfig} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Tanzania Bulk SMS Gateway Configuration
            </h3>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Provider Adapter</label>
              <select
                value={smsConfig.provider}
                onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value as any })}
                className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold"
              >
                <option value="SIMULATOR">Simulator (Development & Testing - Free)</option>
                <option value="BEEM_AFRICA">Beem Africa (Tanzania National Gateway)</option>
                <option value="NEXT_SMS">NextSMS Tanzania</option>
                <option value="TWILIO">Twilio International</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Sender ID (Branded SMS Header)</label>
              <input
                type="text"
                value={smsConfig.senderId}
                onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cost Per SMS (TZS)</label>
              <input
                type="number"
                value={smsConfig.costPerSmsTZS}
                onChange={(e) => setSmsConfig({ ...smsConfig, costPerSmsTZS: Number(e.target.value) })}
                className="w-full p-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isLive"
                checked={smsConfig.isLive}
                onChange={(e) => setSmsConfig({ ...smsConfig, isLive: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <label htmlFor="isLive" className="font-bold text-slate-700">
                Live Carrier Dispatch (Requires external gateway subscription)
              </label>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386]"
              >
                Save SMS Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AUDIT LOGS TAB (Section 26) */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Security & Administrative Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable chronological activity logging for compliance with PDP Act 2022</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{auditLogs.length} Events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#102A43] text-white">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div>{log.userName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.userRole}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.details}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{log.ipAddress || '197.250.21.4'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
