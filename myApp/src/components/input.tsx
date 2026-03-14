/** * @license * SPDX-License-Identifier: Apache-2.0 */ 
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MessageSquare,
  Mic,
  ClipboardPaste,
  Upload,
  Sparkles,
  ArrowRight,
  Zap,
  GitBranch,
  Filter,
  ListChecks,
  FileText
} from "lucide-react";
const SourceTypeCard = ({
  icon: Icon,
  title,
  subtitle,
  selected,
  onClick,
}: {
  icon: any;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <label className="relative cursor-pointer group" onClick={onClick}>
      <input type="radio" className="sr-only peer" checked={selected} readOnly />
      <div
        className={`h-full p-4 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
          selected
            ? 'border-[#4729e0] bg-[#4729e0]/10'
            : 'border-[#4729e0]/10 bg-[#141121] hover:border-[#4729e0]/50'
        }`}
      >
        <Icon
          className={`w-8 h-8 transition-colors ${
            selected ? 'text-[#4729e0]' : 'text-slate-500 group-hover:text-[#4729e0]'
          }`}
        />
        <span className="font-bold text-sm text-white">{title}</span>
        <span className="text-[10px] text-slate-400">{subtitle}</span>
      </div>
    </label>
  );
};

const PipelineStep = ({
  icon: Icon,
  label,
  isLast = false,
}: {
  icon: any;
  label: string;
  isLast?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          isLast
            ? 'bg-[#4729e0]/20 border-2 border-[#4729e0] shadow-lg shadow-[#4729e0]/20'
            : 'bg-[#4729e0]/10 border border-[#4729e0]/20 group-hover:bg-[#4729e0]/20'
        }`}
      >
        <Icon className={`w-6 h-6 ${isLast ? 'text-[#4729e0]' : 'text-[#4729e0]'}`} />
      </div>
      <span
        className={`text-[10px] font-bold uppercase tracking-tight ${
          isLast ? 'text-[#4729e0]' : 'text-slate-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default function App({ onExtract }) {
  const [sourceType, setSourceType] = useState('email');
  const [activeTab, setActiveTab] = useState('paste');
  const navigate = useNavigate();
  const handleAnalysis = () => {
    navigate("/output");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0a14] text-slate-100 font-sans">
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <header className="p-8 pb-0">
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Source Input & Upload
            </h2>
            <p className="mt-2 text-slate-400 max-w-2xl">
              Convert unstructured communications into precise engineering requirements. Use our
              spaCy-powered pipeline to extract stakeholders, dates, and core functionality.
            </p>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Step 1: Source Type */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4729e0]/10 text-[#4729e0] text-xs font-bold">
                1
              </span>
              <h3 className="text-lg font-bold text-white">Select Source Type</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SourceTypeCard
                icon={Mail}
                title="Email"
                subtitle="Gmail, Outlook, Logs"
                selected={sourceType === 'email'}
                onClick={() => setSourceType('email')}
              />
              <SourceTypeCard
                icon={MessageSquare}
                title="Chat"
                subtitle="Slack, Teams, Discord"
                selected={sourceType === 'chat'}
                onClick={() => setSourceType('chat')}
              />
              <SourceTypeCard
                icon={Mic}
                title="Transcript"
                subtitle="Zoom, Meet, Otter.ai"
                selected={sourceType === 'transcript'}
                onClick={() => setSourceType('transcript')}
              />
              <SourceTypeCard
                icon={FileText}
                title="Document"
                subtitle="PDF, DOCX, TXT"
                selected={sourceType === 'document'}
                onClick={() => setSourceType('document')}
              />
            </div>
          </section>

          {/* Step 2: Input Content */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4729e0]/10 text-[#4729e0] text-xs font-bold">
                2
              </span>
              <h3 className="text-lg font-bold text-white">Input Content</h3>
            </div>

            <div className="bg-[#141121] rounded-xl border border-[#4729e0]/10 overflow-hidden shadow-sm">
              {/* Tabs */}
              <div className="flex border-b border-[#4729e0]/10">
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'paste'
                      ? 'border-[#4729e0] text-[#4729e0]'
                      : 'border-transparent text-slate-400 hover:bg-[#4729e0]/5'
                  }`}
                >
                  <ClipboardPaste className="w-[18px] h-[18px]" />
                  Paste Text
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'upload'
                      ? 'border-[#4729e0] text-[#4729e0]'
                      : 'border-transparent text-slate-400 hover:bg-[#4729e0]/5'
                  }`}
                >
                  <Upload className="w-[18px] h-[18px]" />
                  Upload File
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'paste' ? (
                  <textarea
                    className="w-full h-64 bg-[#1c192b] border border-[#4729e0]/20 rounded-lg p-4 text-sm text-slate-200 focus:ring-2 focus:ring-[#4729e0] focus:border-[#4729e0] transition-all resize-none outline-none"
                    placeholder="Paste your communication transcript, email thread, or meeting notes here..."
                  ></textarea>
                ) : (
                  <div className="border-2 border-dashed border-[#4729e0]/30 rounded-xl p-12 flex flex-col items-center justify-center bg-[#1c192b] hover:border-[#4729e0] transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-[#4729e0] mb-4" />
                    <p className="font-bold text-lg mb-1 text-white">Drag & drop files</p>
                    <p className="text-slate-400 text-sm mb-4">
                      Maximum size 20MB. Supports .pdf, .docx, .txt
                    </p>
                    <button className="px-6 py-2 bg-[#141121] border border-[#4729e0]/30 rounded-lg text-sm font-bold shadow-sm hover:bg-[#4729e0]/10 transition-colors">
                      Browse Files
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Action Button */}
          <div className="flex flex-col items-center justify-center py-4">
            <button className="group flex items-center gap-3 px-10 py-4 bg-[#4729e0] text-white rounded-full font-bold text-lg shadow-2xl shadow-[#4729e0]/40 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={onExtract}>
              <Sparkles className="w-5 h-5 fill-current" />
              Extract Requirements
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
              <Zap className="w-[14px] h-[14px]" />
              AI Engine: spaCy Large Model v3.5
            </p>
          </div>

          {/* Pipeline Visualization */}
          <section className="mt-12 pt-8 border-t border-[#4729e0]/10">
            <h4 className="text-center text-xs font-black uppercase tracking-widest text-slate-500 mb-8">
              Internal Extraction Pipeline
            </h4>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
              <PipelineStep icon={FileText} label="User Input" />
              <ArrowRight className="w-6 h-6 text-[#4729e0]/20 hidden md:block" />
              <PipelineStep icon={GitBranch} label="spaCy Model" />
              <ArrowRight className="w-6 h-6 text-[#4729e0]/20 hidden md:block" />
              <PipelineStep icon={Filter} label="Extraction" />
              <ArrowRight className="w-6 h-6 text-[#4729e0]/20 hidden md:block" />
              <PipelineStep icon={ListChecks} label="Structured Output" isLast={true} />
            </div>
            <div className="mt-6 p-4 rounded-lg bg-[#4729e0]/5 border border-[#4729e0]/10 max-w-2xl mx-auto">
              <p className="text-[11px] font-mono text-[#4729e0]/80 leading-relaxed text-center">
                NER (Named Entity Recognition) identifying [ORG], [PERSON], [GPE], and [PRODUCT]
                tokens to auto-map stakeholder groups and system constraints.
              </p>
            </div>
          </section>
        </div>
        
        {/* Footer Spacer */}
        <div className="h-12"></div>
      </main>
    </div>
  );
}
