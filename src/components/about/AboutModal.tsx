import React from 'react';
import { Modal } from '../common/Modal';
import { Award, BookOpen, ShieldCheck, MapPin, GraduationCap, Code2, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ELIMU PRO — Project Credits & Concept"
      subtitle="Smart School Management System for Tanzanian Secondary Schools"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Creator Highlight Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#102A43] to-[#1E3A5F] text-white relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#25B99A]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#25B99A] to-[#F4C95D] flex items-center justify-center text-slate-900 font-extrabold text-xl shadow-lg shrink-0">
              MS
            </div>
            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#25B99A] text-slate-950 uppercase tracking-wider">
                Concept Creator & Software Architect
              </span>
              <h4 className="text-xl font-black text-white tracking-tight">Mimi_SEVELINA DEUS</h4>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <GraduationCap className="w-4 h-4 text-[#F4C95D]" />
                <span>Software Student, Computer Science — MUST (Mbeya University of Science & Technology)</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-[#25B99A]" />
                <span>Ukerewe District, Mwanza Region, Tanzania</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
          <p className="font-bold text-slate-900 text-sm">Vision & Impact:</p>
          <p>
            ELIMU PRO was conceived to transform secondary school administration in Tanzania from burdensome paperwork to a centralized, reliable, and auditable digital ecosystem. It eliminates exam result tampering, saves teachers hours of manual report writing, ensures guardian transparency, and complies strictly with the <strong>Tanzania Personal Data Protection Act, 2022</strong>.
          </p>
        </div>

        {/* Key Architectural Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1 shadow-xs">
            <div className="flex items-center space-x-2 text-[#25B99A] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Stage Academic Approvals</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Draft → Subject Submission → Academic Master Review → Official Publication & Locking. Unapproved results are never visible to students or parents.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1 shadow-xs">
            <div className="flex items-center space-x-2 text-[#F4C95D] font-bold">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>NECTA-Aligned Grading Engine</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Full O-Level (Div I-IV, 0 best 7 calculation) and A-Level (PCM, PCB, HGL combinations with 3 principal passes) grading.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1 shadow-xs">
            <div className="flex items-center space-x-2 text-blue-600 font-bold">
              <Globe className="w-4 h-4" />
              <span>Swahili & English Bilingual</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Complete localization for Tanzanian teachers, headmasters, students, and guardians with Swahili SMS templates.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 bg-white space-y-1 shadow-xs">
            <div className="flex items-center space-x-2 text-purple-600 font-bold">
              <Code2 className="w-4 h-4" />
              <span>Combination Migration Engine</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Audited A-Level combination transitions with historical marks preservation and zero subject roster corruption.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#102A43] text-white hover:bg-[#1E3A5F] transition"
          >
            Close Credits
          </button>
        </div>
      </div>
    </Modal>
  );
};
