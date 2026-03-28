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
  Loader2,
  X,
  LayoutGrid
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
            ? 'border-[#4729e0] bg-[#4729e0]/10 shadow-[0_0_15px_rgba(71,41,224,0.1)]'
            : 'border-[#4729e0]/10 bg-[#141121] hover:border-[#4729e0]/50'
        }`}
      >
        <Icon
          className={`w-8 h-8 transition-colors ${
            selected ? 'text-[#4729e0]' : 'text-slate-500 group-hover:text-[#4729e0]'
          }`}
        />
        {/* Consistently Bold & Uppercase */}
        <span className="font-black text-[10px] uppercase tracking-widest text-white">{title}</span>
        <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">{subtitle}</span>
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
        className={`text-[9px] font-black uppercase tracking-[0.2em] ${
          isLast ? 'text-[#4729e0]' : 'text-slate-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default function InputPage({ onExtract }: { onExtract: (text: string, type: string) => void }) {
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState('email');
  const [activeTab, setActiveTab] = useState('paste');
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
      alert("Please upload a .txt file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      setUploadedFileName(file.name);
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

  const getEditorStyles = () => {
    switch(sourceType) {
      case 'chat': return 'font-sans border-l-4 border-l-[#4729e0]';
      case 'transcript': return 'font-mono text-emerald-400/90 bg-[#0d1117]';
      case 'document': return 'font-serif text-lg leading-relaxed bg-[#f8f9fa] text-slate-900';
      default: return 'font-sans';
    }
  };

  const getPlaceholder = () => {
    switch(sourceType) {
      case 'chat': return "[User A]: Can we add a login button?\n[User B]: Yes, let's do it by Friday...";
      case 'transcript': return "00:01 - Speaker 1: The system needs to support 10k users...\n00:45 - Speaker 2: Agreed.";
      case 'document': return "PROJECT SPECIFICATION v1.0\nSection 1: The software shall...";
      default: return "Paste your email content here...";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c0a14] text-slate-100 font-sans">
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <header className="p-8 pb-0">
          <div className="max-w-5xl mx-auto w-full flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
                <Sparkles className="text-[#4729e0]" /> ReqMind AI
              </h2>
              <p className="mt-2 text-slate-500 max-w-2xl text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
                Decoding {sourceType} into engineering specs
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/select-project')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-[#4729e0] hover:border-[#4729e0] transition-all shadow-lg group"
            >
              <LayoutGrid size={14} className="group-hover:rotate-90 transition-transform duration-300" />
              My Projects
            </button>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SourceTypeCard icon={Mail} title="Email" subtitle="Professional" selected={sourceType === 'email'} onClick={() => setSourceType('email')} />
              <SourceTypeCard icon={MessageSquare} title="Chat" subtitle="Slack/Teams" selected={sourceType === 'chat'} onClick={() => setSourceType('chat')} />
              <SourceTypeCard icon={Mic} title="Transcript" subtitle="Meeting Audio" selected={sourceType === 'transcript'} onClick={() => setSourceType('transcript')} />
              <SourceTypeCard icon={FileText} title="Document" subtitle="Raw Specs" selected={sourceType === 'document'} onClick={() => setSourceType('document')} />
            </div>
          </section>

          <section className="relative">
            <div className="bg-[#141121] rounded-2xl border border-[#4729e0]/20 overflow-hidden shadow-2xl transition-all duration-500">
              <div className="px-6 py-3 bg-slate-900/50 flex items-center justify-between border-b border-[#4729e0]/10">
                <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                   {sourceType === 'email' && <span className="flex items-center gap-1"><Mail size={12}/> New Message</span>}
                   {sourceType === 'chat' && <span className="flex items-center gap-1 text-blue-400"><MessageSquare size={12}/> #requirements</span>}
                   {sourceType === 'transcript' && <span className="flex items-center gap-1 text-red-500 animate-pulse"><Mic size={12}/> Recording_Live</span>}
                   {sourceType === 'document' && <span className="flex items-center gap-1"><FileText size={12}/> Source_Spec.txt</span>}
                </div>
              </div>

              <div className="flex border-b border-[#4729e0]/10 bg-slate-900/20">
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'paste' ? 'text-[#4729e0] bg-[#4729e0]/5' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <ClipboardPaste size={14} /> Paste
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'upload' ? 'text-[#4729e0] bg-[#4729e0]/5' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Upload size={14} /> Upload
                </button>
              </div>

              <div className="p-1">
                {activeTab === 'paste' ? (
                  <textarea 
                    value={text}
                    onChange={(e) => { setText(e.target.value); setUploadedFileName(null); }}
                    className={`w-full h-80 bg-[#1c192b]/30 p-6 text-sm outline-none transition-all duration-300 custom-scrollbar ${getEditorStyles()}`}
                    placeholder={getPlaceholder()}
                  ></textarea>
                ) : (
                  <div className="h-80 border-2 border-dashed border-[#4729e0]/20 m-2 rounded-xl flex flex-col items-center justify-center bg-[#1c192b]/20 hover:border-[#4729e0]/40 transition-all cursor-pointer relative group">
                    {uploadedFileName ? (
                      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                          <FileText className="w-12 h-12 text-emerald-500" />
                        </div>
                        <p className="font-black text-white text-sm uppercase tracking-widest">{uploadedFileName}</p>
                        <p className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Ready for Extraction</p>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 rounded-full bg-[#4729e0]/10 group-hover:scale-110 transition-transform">
                          <Upload className="w-10 h-10 text-[#4729e0]" />
                        </div>
                        <p className="font-black text-white text-[10px] uppercase tracking-[0.2em] mt-4">Drop requirement file</p>
                        <p className="text-slate-600 text-[8px] uppercase font-black tracking-widest mt-1">.TXT format only</p>
                      </>
                    )}
                    <input type="file" accept=".txt" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleManualExtract}
              disabled={isExtracting || !text}
              className={`flex items-center gap-3 px-10 py-5 bg-[#4729e0] rounded-2xl font-black text-white shadow-[0_10px_30px_rgba(71,41,224,0.3)] transition-all group overflow-hidden relative ${
                (isExtracting || !text) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.05] active:scale-[0.95]'
              }`}
            >
              {isExtracting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5 fill-current text-white" />
              )}
              {/* FIXED FONT STYLE HERE */}
              <span className="uppercase tracking-[0.3em] text-[11px] font-black">
                {isExtracting ? 'Analyzing...' : `Extract Requirements`}
              </span>
            </button>
          </div>

          <section className="mt-12 pt-8 border-t border-slate-800/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto opacity-60">
              <PipelineStep icon={FileText} label="Ingestion" />
              <div className="h-px w-8 bg-slate-800 hidden md:block" />
              <PipelineStep icon={GitBranch} label="spaCy Model" />
              <div className="h-px w-8 bg-slate-800 hidden md:block" />
              <PipelineStep icon={Filter} label="NER Engine" />
              <div className="h-px w-8 bg-slate-800 hidden md:block" />
              <PipelineStep icon={ListChecks} label="Structure" isLast={true} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}