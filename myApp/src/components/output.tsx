import React, { useState } from 'react';
import {
  Network,
  Gauge,
  AlertCircle,
  Pencil,
  ArrowLeft,
  PlusCircle,
  Check,
  Download,
  Loader2,
  Share2,
  History,
  ChevronRight
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Reusable Components ---
function CustomCheckbox({ checked = false }: { checked?: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
      <input
        type="checkbox"
        defaultChecked={checked}
        className="peer appearance-none w-5 h-5 border border-slate-700 rounded bg-transparent checked:bg-[#4729e0] checked:border-[#4729e0] cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#4729e0]/50"
      />
      <Check strokeWidth={3} className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
    </div>
  );
}

interface RequirementItemProps { title: string; source: string; checked?: boolean; }
function RequirementCard({ title, source, checked = true }: RequirementItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#1c1a2e] border border-slate-800 rounded-xl hover:border-[#4729e0]/50 transition-all group">
      <div className="flex items-center gap-4">
        <CustomCheckbox checked={checked} />
        <div className="flex flex-col">
          <span className="text-slate-100 font-medium text-sm">{title}</span>
          <span className="text-xs text-slate-400">{source}</span>
        </div>
      </div>
      <button className="p-2 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}

interface RequirementsPanelProps {
  data: any;
  setView: (view: string) => void;
  projectId?: string;
  userId?: string;
}

export default function RequirementsPanel({ data, setView, projectId, userId }: RequirementsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // 1. Guard Clause: Check if data exists
  if (!data || !data.analysis_details) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-[#141121]">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p>No requirements data available.</p>
      </div>
    );
  }

  const { analysis_details, predicted_category } = data;

  // 2. Helper function: This matches the keys in your analysis.js (Spaces and Capitals)
  const getList = (uiTitle: string) => {
    const keyMap: { [key: string]: string } = {
      "Functional Requirements": "functional_requirements",
      "Non Functional Requirements": "non_functional_requirements",
      "Stakeholders": "stakeholders",
      "Timelines": "timelines",
      "Decisions": "decisions",
      "Feature Priority": "priority"
    };
   const backendKey = keyMap[uiTitle];
    return analysis_details[backendKey] || [];
  };
  // --- Jira Sync Logic ---
  const handleJiraSync = async () => {
    const requirementsToSync = getList("Functional Requirements");
    if (requirementsToSync.length === 0) return alert("No functional requirements found!");

    setIsSyncing(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/jira-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: requirementsToSync,
          projectKey: 'KAN' 
        }),
      });
      if (response.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Jira Error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- MongoDB Save Logic ---
  const handleSave = async () => {
    setIsSaving(true);
    const finalProjectId = projectId || data.project_id || data.metadata?.project_id;
    const finalUserId = userId || data.userId || data.metadata?.userId;

    const payload = { ...data, project_id: finalProjectId, userId: finalUserId };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) setIsSaved(true);
    } catch (error) {
      console.error("Save Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(71, 41, 224);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("ReqMind AI Report", 14, 25);
    
    let yPos = 55;
    ["Functional Requirements", "Non Functional Requirements", "Stakeholders", "Timelines"].forEach((section) => {
      const items = getList(section);
      if (items.length > 0) {
        doc.setTextColor(0, 0, 0);
        doc.text(section, 14, yPos);
        autoTable(doc, {
          startY: yPos + 5,
          head: [['Requirement']],
          body: items.map((item: string) => [item]),
          headStyles: { fillColor: [71, 41, 224] },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });
    doc.save(`ReqMind_Report.pdf`);
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
        <header className="px-8 pt-10 pb-6 shrink-0">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">Requirements Review</h2>
            <p className="text-slate-400 text-sm italic">{predicted_category} | {projectId}</p>
          </div>
        </header>

        <div className="px-8 pb-32 flex-1">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Network className="text-[#4729e0]"/> Functional Requirements</h3>
              <div className="grid gap-3">
                {getList("Functional Requirements").map((req: string, i: number) => (
                  <RequirementCard key={i} title={req} source="AI Extraction" />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Gauge className="text-[#4729e0]"/> Non Functional</h3>
              <div className="grid gap-3">
                {getList("Non Functional Requirements").map((req: string, i: number) => (
                  <RequirementCard key={i} title={req} source="Non-Functional" />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Share2 className="text-orange-400 w-4 h-4"/> Stakeholders</h3>
                <div className="flex flex-wrap gap-2">
                  {getList("Stakeholders").length > 0 ? getList("Stakeholders").map((s: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-[#4729e0]/10 border border-[#4729e0]/30 rounded-lg text-xs font-bold text-[#8b75ff]">{s}</span>
                  )) : <p className="text-slate-500 text-sm italic">None detected</p>}
                </div>
              </section>

              <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><PlusCircle className="text-emerald-400 w-4 h-4"/> Timelines</h3>
                <div className="space-y-2">
                  {getList("Timelines").length > 0 ? getList("Timelines").map((t: string, i: number) => (
                    <div key={i} className="text-sm text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t}
                    </div>
                  )) : <p className="text-slate-500 text-sm italic">None detected</p>}
                </div>
              </section>
            </div>

            <section>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Check className="text-purple-400 w-4 h-4"/> Key Decisions</h3>
              <div className="grid gap-3">
                {getList("Decisions").map((d: string, i: number) => (
                  <div key={i} className="p-4 bg-[#1c1a2e] border border-slate-800 rounded-xl text-sm text-slate-300">{d}</div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="fixed bottom-0 right-0 left-0 lg:left-64 px-8 py-6 bg-[#141121]/95 backdrop-blur-md border-t border-slate-800 z-20">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
            <div className="flex gap-3">
              <button onClick={handleJiraSync} className="px-5 py-2.5 rounded-lg border border-blue-500 text-blue-500 font-bold text-sm hover:bg-blue-500/10 transition-all">
                {isSyncing ? "Syncing..." : syncSuccess ? "Synced!" : "Export to Jira"}
              </button>
              <button onClick={downloadPDF} className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all font-bold text-sm">Download Report</button>
              {!isSaved ? (
                <button onClick={handleSave} className="px-6 py-2.5 rounded-lg bg-[#4729e0] text-white font-bold text-sm shadow-lg hover:bg-[#4729e0]/90">
                  {isSaving ? "Saving..." : "Confirm & Save"}
                </button>
              ) : (
                <button onClick={() => setView("history")} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm shadow-lg hover:bg-emerald-500 transition-all">
                  <History className="w-4 h-4" /> Saved!
                </button>
              )}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}