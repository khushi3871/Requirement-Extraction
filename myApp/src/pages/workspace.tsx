import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Sidebar from "../components/Sidebar";
import InputPage from "../components/input";
import RequirementsPanel from "../components/output";
import HistoryPage from "./History";
import PRDView from "../components/PRDview";
import KnowledgeGraph from "../components/KnowledgeGraph";

export default function Workspace() {
  const [analysisData, setAnalysisData] = useState(null);
  const [allHistory, setAllHistory] = useState([]); // Master array for all project extractions
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("input");

  const { projectId } = useParams();
  const { userId } = useAuth();

  // 1. Fetch all existing requirements for this project on load
  useEffect(() => {
    const fetchProjectHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/history/${projectId}/${userId}`,
        );
        const data = await response.json();
        // Ensure data is an array before setting
        setAllHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching aggregated project data:", error);
      }
    };

    if (projectId) fetchProjectHistory();
  }, [projectId]);

  const handleExtract = async (text, sourceType) => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/analyze-requirements",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            projectId: projectId,
            userId: userId,
            source: sourceType,
          }),
        },
      );

      const data = await response.json();

      if (data && (data.analysis_details || data.requirements)) {
        setAnalysisData(data);

        // 2. Update global history so the PRD updates in real-time
        setAllHistory((prev) => [data, ...prev]);

        setCurrentView("dashboard");
      } else {
        alert("Extraction failed: Backend returned empty data.");
      }
    } catch (error) {
      alert("Backend not responding. Ensure Node and Python APIs are running!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistoryItem = (itemData: any) => {
    setAnalysisData(itemData);
    setCurrentView("dashboard");
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 overflow-hidden">
      <Sidebar setView={setCurrentView} currentView={currentView} />

      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-[#141121]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-[#4729e0] border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[#4729e0] font-bold animate-pulse">
                Processing Requirements...
              </p>
            </div>
          </div>
        )}

        {(() => {
          switch (currentView) {
            case "history":
              return <HistoryPage onViewItem={handleViewHistoryItem} />;

            case "dashboard":
              return analysisData ? (
                <RequirementsPanel data={analysisData} />
              ) : (
                <div className="flex-1 h-full flex items-center justify-center text-slate-500">
                  Please extract requirements first.
                </div>
              );

            case "prd":
              // This now renders a MASTER PRD containing every prompt uploaded so far
              return allHistory.length > 0 ? (
                <PRDView allData={allHistory} />
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                  <p className="mb-4">No project data found yet.</p>
                  <button
                    onClick={() => setCurrentView("input")}
                    className="px-4 py-2 bg-[#4729e0] text-white rounded-lg font-bold"
                  >
                    Start First Extraction
                  </button>
                </div>
              );

            case "graph":
              return analysisData ? (
                <div className="h-[calc(100vh-20px)] p-4">
                  <KnowledgeGraph data={analysisData} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Please extract requirements first to view the Knowledge Map.
                </div>
              );

            case "input":
            default:
              return <InputPage onExtract={handleExtract} />;
          }
        })()}
      </div>
    </div>
  );
}
