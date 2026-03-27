import React, { useState } from "react";
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
  ChevronRight,
  Zap,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Reusable Components ---

interface RequirementItemProps {
  title: string;
  source: string;
}

function RequirementCard({ title, source }: RequirementItemProps) {
  return (
    <div className="flex items-start justify-between p-5 bg-[#1c1a2e] border border-slate-800 rounded-2xl hover:border-[#4729e0]/40 hover:bg-[#4729e0]/5 transition-all group relative overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="mt-2 shrink-0 w-2 h-2 rounded-full bg-[#4729e0] shadow-[0_0_8px_#4729e0] group-hover:scale-125 transition-transform" />
        <div className="flex flex-col gap-1">
          <span className="text-slate-100 font-semibold text-[15px] leading-relaxed">
            {title}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Zap size={10} className="text-[#4729e0]" /> {source}
            </span>
          </div>
        </div>
      </div>
      <button className="p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/50 rounded-lg shrink-0">
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

export default function RequirementsPanel({
  data,
  setView,
  projectId,
  userId,
}: RequirementsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // 1. Guard Clause
  if (!data || !data.analysis_details) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-[#141121]">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p>No requirements data available.</p>
      </div>
    );
  }

  const finalProjectId = projectId || data.project_id || data.metadata?.project_id || "Export";
  const finalUserId = userId || data.userId || data.metadata?.userId;
  const { analysis_details, predicted_category } = data;

  // 2. Helper function
  const getList = (uiTitle: string) => {
    const keyMap: { [key: string]: string } = {
      "Functional Requirements": "functional_requirements",
      "Non Functional Requirements": "non_functional_requirements",
      Stakeholders: "stakeholders",
      Timelines: "timelines",
      Decisions: "decisions",
      "Feature Priority": "priority",
    };
    const backendKey = keyMap[uiTitle];
    return analysis_details[backendKey] || [];
  };

  const handleJiraSync = async () => {
    const requirementsToSync = getList("Functional Requirements");
    if (requirementsToSync.length === 0) {
      alert("No functional requirements found to sync!");
      return;
    }
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/jira-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirements: requirementsToSync,
          projectKey: "KAN", 
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 4000);
      } else {
        alert(`Jira Sync Failed: ${result.error || "Check Project Key."}`);
      }
    } catch (error) {
      alert("Could not reach backend.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/save-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, project_id: finalProjectId, userId: finalUserId }),
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
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ReqMind AI Report", 14, 25);
    let yPos = 55;
    ["Functional Requirements", "Non Functional Requirements", "Stakeholders", "Timelines"].forEach((section) => {
      const items = getList(section);
      if (items.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(71, 41, 224);
        doc.text(section, 14, yPos);
        autoTable(doc, {
          startY: yPos + 5,
          head: [["Extracted Detail"]],
          body: items.map((item: string) => [item]),
          headStyles: { fillColor: [71, 41, 224] },
          alternateRowStyles: { fillColor: [245, 245, 255] },
          margin: { left: 14 },
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
    });
    doc.save(`ReqMind_Report_${finalProjectId}.pdf`);
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 overflow-hidden font-sans">
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
        
        <header className="px-8 pt-12 pb-6 shrink-0 border-b border-slate-800/50 bg-[#141121]">
          <div className="max-w-5xl mx-auto flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                Requirements Review
              </h2>
              <p className="text-[#4729e0] text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <History size={14} /> {predicted_category} workspace
              </p>
            </div>
            {/* <p className="text-slate-500 text-xs font-mono mb-1">
              PROJECT ID: {finalProjectId.substring(0, 8)}...
            </p> */}
          </div>
        </header>

        <div className="px-8 pb-40 pt-10 flex-1">
          <div className="max-w-5xl mx-auto space-y-12">
            <section>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Network className="text-[#4729e0] w-6 h-6" /> Functional Requirements
              </h3>
              <div className="grid gap-4">
                {getList("Functional Requirements").map((req: string, i: number) => (
                  <RequirementCard key={i} title={req} source="AI Extraction" />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Gauge className="text-[#4729e0] w-6 h-6" /> Non-Functional Requirements
              </h3>
              <div className="grid gap-4">
                {getList("Non Functional Requirements").map((req: string, i: number) => (
                  <RequirementCard key={i} title={req} source="System Metric" />
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/60 shadow-inner">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <Share2 className="text-orange-400 w-5 h-5" /> Stakeholders
                </h3>
                <div className="flex flex-wrap gap-3">
                  {getList("Stakeholders").length > 0 ? (
                    getList("Stakeholders").map((s: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-[#4729e0]/10 border border-[#4729e0]/30 rounded-xl text-xs font-bold text-[#8b75ff]">
                        @{s}
                      </span>
                    ))
                  ) : ( <p className="text-slate-600 text-sm italic">No stakeholders identified.</p> )}
                </div>
              </section>

              <section className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/60 shadow-inner">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <PlusCircle className="text-emerald-400 w-5 h-5" /> Project Timelines
                </h3>
                <div className="space-y-4">
                  {getList("Timelines").length > 0 ? (
                    getList("Timelines").map((t: string, i: number) => (
                      <div key={i} className="text-sm text-slate-300 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" /> {t}
                      </div>
                    ))
                  ) : ( <p className="text-slate-600 text-sm italic">No dates mentioned.</p> )}
                </div>
              </section>
            </div>

            <section className="pb-10">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Check className="text-purple-400 w-6 h-6" /> Key Extract Decisions
              </h3>
              <div className="grid gap-4">
                {getList("Decisions").map((d: string, i: number) => (
                  <div key={i} className="p-6 bg-[#1c1a2e] border border-slate-800 rounded-2xl text-sm text-slate-300 flex items-start gap-4">
                    <ChevronRight size={18} className="text-purple-400 mt-0.5 shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="fixed bottom-0 right-0 left-0 lg:left-64 px-8 py-6 bg-[#141121]/95 backdrop-blur-xl border-t border-slate-800/60 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-bold group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Reset Session
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleJiraSync}
                disabled={isSyncing || syncSuccess}
                className={`px-6 py-2.5 rounded-xl border font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                  syncSuccess
                    ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                    : "border-[#4729e0] text-[#4729e0] hover:bg-[#4729e0]/10 shadow-lg shadow-[#4729e0]/5"
                }`}
              >
                {isSyncing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Syncing...</>
                ) : syncSuccess ? (
                  <><Check className="w-4 h-4" /> Jira Active</>
                ) : ( "Sync to Jira" )}
              </button>

              <button
                onClick={downloadPDF}
                className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all font-black text-xs uppercase tracking-widest"
              >
                Export PDF
              </button>

              {!isSaved ? (
                <button
                  onClick={handleSave}
                  className="px-8 py-2.5 rounded-xl bg-[#4729e0] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#4729e0]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isSaving ? "Processing..." : "Commit Analysis"}
                </button>
              ) : (
                <button
                  onClick={() => setView("history")}
                  className="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center gap-2"
                >
                  <History className="w-4 h-4" /> View History
                </button>
              )}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}