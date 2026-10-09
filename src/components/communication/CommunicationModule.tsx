import React, { useState } from 'react';
import { 
  MessageSquare, Send, Bell, Smartphone, Users, Pin, ShieldCheck, 
  CheckCircle2, AlertCircle, RefreshCw, PhoneCall, Radio
} from 'lucide-react';
import { 
  MessageGroup, GroupMessage, Announcement, SMSLog, User, Student 
} from '../../types';
import { StorageAPI } from '../../lib/storage';
import { sendSMS, buildResultSmsText, buildAttendanceAlertSmsText, isValidTzPhone } from '../../lib/sms';
import { Modal } from '../common/Modal';
import { translations, Language } from '../../lib/i18n';

interface CommsProps {
  currentUser: User;
  lang: Language;
}

export const CommunicationModule: React.FC<CommsProps> = ({ currentUser, lang }) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'GROUPS' | 'ANNOUNCEMENTS' | 'SMS_DISPATCHER'>('GROUPS');
  
  // State from storage
  const [groups, setGroups] = useState<MessageGroup[]>(StorageAPI.getGroups());
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [messages, setMessages] = useState<GroupMessage[]>(
    selectedGroupId ? StorageAPI.getMessages(selectedGroupId) : []
  );
  const [messageInput, setMessageInput] = useState('');

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>(StorageAPI.getAnnouncements());
  const [isNewAnnModalOpen, setIsNewAnnModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState<Partial<Announcement>>({
    title: '',
    titleSwahili: '',
    content: '',
    contentSwahili: '',
    priority: 'NORMAL',
  });

  // SMS Dispatcher State
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>(StorageAPI.getSmsLogs());
  const [smsRecipientPhone, setSmsRecipientPhone] = useState('0754998877');
  const [smsRecipientName, setSmsRecipientName] = useState('David Mushi');
  const [smsAdmissionNo, setSmsAdmissionNo] = useState('ELM/2026/0101');
  const [smsType, setSmsType] = useState<SMSLog['messageType']>('EXAM_RESULT');
  const [smsSending, setSmsSending] = useState(false);
  const [smsToast, setSmsToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedGroupId) return;

    StorageAPI.sendMessage(selectedGroupId, currentUser, messageInput.trim());
    setMessages(StorageAPI.getMessages(selectedGroupId));
    setMessageInput('');
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return;

    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: annForm.title!,
      titleSwahili: annForm.titleSwahili || annForm.title!,
      content: annForm.content!,
      contentSwahili: annForm.contentSwahili || annForm.content!,
      targetRoles: ['PARENT', 'STUDENT', 'HEAD_OF_DEPARTMENT'] as any,
      priority: annForm.priority as any || 'NORMAL',
      authorName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
    };

    StorageAPI.saveAnnouncement(newAnn);
    setAnnouncements(StorageAPI.getAnnouncements());
    setIsNewAnnModalOpen(false);
    setAnnForm({ title: '', titleSwahili: '', content: '', contentSwahili: '', priority: 'NORMAL' });
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsSending(true);

    const school = StorageAPI.getSchool();
    let text = '';
    if (smsType === 'EXAM_RESULT') {
      text = buildResultSmsText(school.name, smsRecipientName, smsAdmissionNo, 'Mid-Term Exam', 'Division I', 8, 82.5);
    } else if (smsType === 'ATTENDANCE_ALERT') {
      text = buildAttendanceAlertSmsText(school.name, smsRecipientName, new Date().toISOString().split('T')[0], 'ABSENT');
    } else {
      text = `SHULE: ${school.name}\nTangazo: Kikao cha wazazi na walimu kitafanyika ijumaa saa 3 asubuhi.`;
    }

    const res = await sendSMS(smsRecipientPhone, smsRecipientName, text, smsType, smsAdmissionNo);
    setSmsSending(false);

    if (res.success) {
      StorageAPI.addSmsLog(res.log);
      setSmsLogs(StorageAPI.getSmsLogs());
      setSmsToast({ message: `SMS dispatched successfully! Status: ${res.log.status}. Cost: ${res.log.costTZS} TZS`, type: 'success' });
    } else {
      setSmsToast({ message: res.error || 'Failed to dispatch SMS.', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {smsToast && (
        <div className={`p-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-between ${
          smsToast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <span>{smsToast.message}</span>
          <button onClick={() => setSmsToast(null)} className="underline ml-4">Close</button>
        </div>
      )}

      {/* Header and Nav */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Parent & Teacher Communication</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bilingual messaging forums, school announcements, and simulated Tanzanian SMS alerts
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('GROUPS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'GROUPS' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            Class Groups
          </button>
          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'ANNOUNCEMENTS' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('SMS_DISPATCHER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1 ${
              activeTab === 'SMS_DISPATCHER' ? 'bg-[#102A43] text-white' : 'text-slate-600'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS Dispatcher</span>
          </button>
        </div>
      </div>

      {/* CLASS GROUPS / MESSAGING TAB */}
      {activeTab === 'GROUPS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Groups List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Available Forums</h3>
            <div className="space-y-1.5">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGroupId(g.id);
                    setMessages(StorageAPI.getMessages(g.id));
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs transition border ${
                    selectedGroupId === g.id
                      ? 'bg-teal-50 border-teal-200 font-bold text-teal-950 shadow-xs'
                      : 'hover:bg-slate-50 border-transparent text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-bold">{g.name}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{g.memberCount} members</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">{g.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Conversation */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-t-2xl">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedGroup?.name}</h4>
                <p className="text-xs text-slate-500">{selectedGroup?.description}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Moderated Forum
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-600">{m.senderName}</span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-md ${
                          isMe
                            ? 'bg-[#102A43] text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <p>{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex space-x-2">
              <input
                type="text"
                placeholder="Type your message to parents and teachers..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#25B99A] hover:bg-[#1FA386] text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsNewAnnModalOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F] transition"
            >
              + Create Announcement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ann.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ann.priority} PRIORITY
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                  <p className="text-xs text-teal-700 font-medium mt-0.5 italic">{ann.titleSwahili}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <p>{ann.content}</p>
                  <p className="text-[11px] text-slate-500 italic mt-1 border-t border-slate-200 pt-1">
                    {ann.contentSwahili}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Author: {ann.authorName}</span>
                  <span className="text-teal-600 font-bold">Official School Notice</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SMS DISPATCHER & SIMULATOR TAB (Section 20) */}
      {activeTab === 'SMS_DISPATCHER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatcher Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Tanzanian SMS Notification Gateway</h3>
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 space-y-1">
              <p className="font-bold">Mode: Development Simulation Adapter</p>
              <p className="text-[11px]">
                Validates Tanzanian telecom numbers (Vodacom, Tigo, Airtel, Halotel), builds Swahili templates, and simulates real carrier delivery without requiring live API credentials.
              </p>
            </div>

            <form onSubmit={handleSendSMS} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Recipient Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0754998877"
                  value={smsRecipientPhone}
                  onChange={(e) => setSmsRecipientPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Parent Name</label>
                <input
                  type="text"
                  value={smsRecipientName}
                  onChange={(e) => setSmsRecipientName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Candidate Admission No</label>
                <input
                  type="text"
                  value={smsAdmissionNo}
                  onChange={(e) => setSmsAdmissionNo(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Template Type</label>
                <select
                  value={smsType}
                  onChange={(e) => setSmsType(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="EXAM_RESULT">Official Exam Result Release (Matokeo)</option>
                  <option value="ATTENDANCE_ALERT">Attendance Truancy Alert (Hajahudhuria)</option>
                  <option value="ANNOUNCEMENT">School Meeting / General Notice</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={smsSending}
                className="w-full py-2.5 px-4 font-bold rounded-xl bg-[#102A43] hover:bg-[#1E3A5F] text-white transition shadow-sm flex items-center justify-center space-x-2"
              >
                {smsSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-[#25B99A]" />}
                <span>Dispatch Simulated SMS</span>
              </button>
            </form>
          </div>

          {/* SMS Audit & Delivery Log */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">SMS Gateway Dispatch Logs</h3>
              <span className="text-xs text-slate-500">{smsLogs.length} Records</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto">
              {smsLogs.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-400">
                  No SMS notifications logged yet. Dispatch a test message above!
                </p>
              ) : (
                smsLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-mono text-slate-800">{log.recipientPhone}</span>
                        <span className="text-slate-500">({log.recipientName})</span>
                        <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 font-bold rounded text-[10px]">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(log.sentAt).toLocaleTimeString()}</span>
                    </div>

                    <p className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap">
                      {log.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Admission: {log.studentAdmissionNo || 'N/A'}</span>
                      <span className="font-semibold text-slate-600">Cost: {log.costTZS} TZS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Announcement Modal */}
      <Modal
        isOpen={isNewAnnModalOpen}
        onClose={() => setIsNewAnnModalOpen(false)}
        title="Publish School Announcement"
        subtitle="Broadcast to parents, students, and teaching staff"
        maxWidth="md"
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Title (English) *</label>
            <input
              type="text"
              required
              value={annForm.title}
              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Kichwa cha Habari (Swahili) *</label>
            <input
              type="text"
              required
              value={annForm.titleSwahili}
              onChange={(e) => setAnnForm({ ...annForm, titleSwahili: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Content (English) *</label>
            <textarea
              rows={2}
              required
              value={annForm.content}
              onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Maelezo (Swahili) *</label>
            <textarea
              rows={2}
              required
              value={annForm.contentSwahili}
              onChange={(e) => setAnnForm({ ...annForm, contentSwahili: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewAnnModalOpen(false)}
              className="px-4 py-2 font-semibold rounded-xl bg-slate-100 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold rounded-xl bg-[#25B99A] text-slate-950 hover:bg-[#1FA386]"
            >
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
