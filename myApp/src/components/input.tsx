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
  FileText,
  Loader2
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
        <Icon className={`w-6 h-6 text-[#4729e0]`} />
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

export default function InputPage({ onExtract }: { onExtract: (text: string, type: string) => void }) {
  const [sourceType, setSourceType] = useState('email');
  const [activeTab, setActiveTab] = useState('paste');
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Handle Local File Reading
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      alert("Please upload a .txt file for the requirements analysis.");
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Update the local state
      setText(content); 

      // Switch to paste tab so user can see what was uploaded
      setActiveTab('paste');
      
      console.log(`🚀 File "${file.name}" loaded into editor. Click Extract to save.`);
    };

    reader.readAsText(file);
  };

  const handleManualExtract = async () => {
    if (!text || isExtracting) return;
    
    setIsExtracting(true);
    try {
      await onExtract(text, sourceType);
    } catch (error) {
      console.error("Extraction failed:", error);
    } finally {
      setIsExtracting(false);
    }
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
              Convert unstructured communications into precise engineering requirements.
            </p>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4729e0]/10 text-[#4729e0] text-xs font-bold">1</span>
              <h3 className="text-lg font-bold text-white">Select Source Type</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SourceTypeCard icon={Mail} title="Email" subtitle="Gmail, Outlook" selected={sourceType === 'email'} onClick={() => setSourceType('email')} />
              <SourceTypeCard icon={MessageSquare} title="Chat" subtitle="Slack, Teams" selected={sourceType === 'chat'} onClick={() => setSourceType('chat')} />
              <SourceTypeCard icon={Mic} title="Transcript" subtitle="Zoom, Meet" selected={sourceType === 'transcript'} onClick={() => setSourceType('transcript')} />
              <SourceTypeCard icon={FileText} title="Document" subtitle="TXT Documents" selected={sourceType === 'document'} onClick={() => setSourceType('document')} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#4729e0]/10 text-[#4729e0] text-xs font-bold">2</span>
              <h3 className="text-lg font-bold text-white">Input Content</h3>
            </div>

            <div className="bg-[#141121] rounded-xl border border-[#4729e0]/10 overflow-hidden shadow-sm">
              <div className="flex border-b border-[#4729e0]/10">
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'paste' ? 'border-[#4729e0] text-[#4729e0]' : 'border-transparent text-slate-400 hover:bg-[#4729e0]/5'
                  }`}
                >
                  <ClipboardPaste className="w-[18px] h-[18px]" />
                  Paste Text
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${
                    activeTab === 'upload' ? 'border-[#4729e0] text-[#4729e0]' : 'border-transparent text-slate-400 hover:bg-[#4729e0]/5'
                  }`}
                >
                  <Upload className="w-[18px] h-[18px]" />
                  Upload File
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'paste' ? (
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-64 bg-[#1c192b] border border-[#4729e0]/20 rounded-lg p-4 text-sm text-slate-200 focus:ring-2 focus:ring-[#4729e0] outline-none"
                    placeholder="Paste text here..."
                  ></textarea>
                ) : (
                  <div className="border-2 border-dashed border-[#4729e0]/30 rounded-xl p-12 flex flex-col items-center justify-center bg-[#1c192b] hover:border-[#4729e0] transition-colors cursor-pointer relative">
                    <Upload className="w-12 h-12 text-[#4729e0] mb-4" />
                    <p className="font-bold text-lg mb-1 text-white">Upload Requirement Document</p>
                    <p className="text-slate-400 text-sm mb-4">Demo supports .txt files</p>
                    
                    <input
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    
                    <button className="px-6 py-2 bg-[#4729e0] rounded-lg text-sm font-bold text-white shadow-lg pointer-events-none">
                      Select File from PC
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-col items-center justify-center py-4">
            <button 
              onClick={handleManualExtract}
              disabled={isExtracting || !text}
              className={`flex items-center gap-3 px-8 py-4 bg-[#4729e0] rounded-xl font-bold text-white shadow-xl shadow-[#4729e0]/20 transition-all group ${
                (isExtracting || !text) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isExtracting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 fill-current" />
              )}
              {isExtracting ? 'Extracting...' : 'Extract Requirements'}
              {!isExtracting && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
            <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
              <Zap className="w-[14px] h-[14px]" />
              AI Engine Ready
            </p>
          </div>

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
          </section>
        </div>
      </main>
    </div>
  );
}