import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Sidebar from "../components/Sidebar";
import InputPage from "../components/input";
import RequirementsPanel from "../components/output";
import HistoryPage from "./History";
import PRDView from "../components/PRDview";
import KnowledgeGraph from "../components/KnowledgeGraph";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function Workspace() {
  const [analysisData, setAnalysisData] = useState(null);
  const [allHistory, setAllHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("analytics");

  const { projectId } = useParams();
  const { userId } = useAuth();

  // 1. Fetch User's Project Portfolio for the Dropdowns
  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/projects/${userId}`,
        );
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Portfolio fetch failed:", error);
      }
    };
    if (userId) fetchUserProjects();
  }, [userId]);

  // 2. FIXED: Fetch history correctly
  // We fetch history for the CURRENT project to keep things fast.
  // The AnalyticsDashboard will now call its own optimized aggregation route.
  useEffect(() => {
    const fetchProjectHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/history/${projectId}/${userId}`,
        );
        const data = await response.json();
        setAllHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    if (userId && projectId) fetchProjectHistory();
  }, [userId, projectId]);

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
        // Update history state so the dashboard reflects new data immediately
        setAllHistory((prev) => [data, ...prev]);
        setCurrentView("results");
      } else {
        alert("Extraction failed: Backend returned empty data.");
      }
    } catch (error) {
      alert(
        "Backend error. check if your Python AI server is running on port 8000!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistoryItem = (itemData: any) => {
    setAnalysisData(itemData);
    setCurrentView("results");
  };

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 overflow-hidden">
      <Sidebar setView={setCurrentView} currentView={currentView} />

      <div className="flex-1 overflow-auto relative">
        {loading && (
          <div className="absolute inset-0 z-50 bg-[#141121]/80 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-[#4729e0] border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[#4729e0] font-bold animate-pulse text-center">
                AI Agent Extracting Intelligence...
                <br />
                <span className="text-xs font-normal text-slate-400 italic">
                  Cleaning noise, structuring requirements
                </span>
              </p>
            </div>
          </div>
        )}

        {(() => {
          switch (currentView) {
            case "analytics":
              return <AnalyticsDashboard projectList={projects} />;

            case "history":
              return <HistoryPage onViewItem={handleViewHistoryItem} />;

            case "results":
              return analysisData ? (
                <div className="p-6 max-w-6xl mx-auto">
                  <button
                    onClick={() => setCurrentView("input")}
                    className="px-4 py-2 bg-[#4729e0]/10 text-[#4729e0] border border-[#4729e0]/20 hover:bg-[#4729e0]/20 rounded-lg text-sm font-bold mb-6 transition-all"
                  >
                    ← Back to Input
                  </button>
                  <RequirementsPanel data={analysisData} />
                </div>
              ) : (
                <div className="flex-1 h-full flex items-center justify-center text-slate-500 italic">
                  No active extraction. Go to Input Workspace to begin.
                </div>
              );

            case "prd":
              return allHistory.length > 0 ? (
                <PRDView allData={allHistory} />
              ) : (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                  <p className="mb-4">No data available for PRD generation.</p>
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
                  Select an extraction from History to view the Knowledge Map.
                </div>
              );

            case "input":
            default:
              return (
                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                  <InputPage onExtract={handleExtract} />
                </div>
              );
          }
        })()}
      </div>
    </div>
  );
}
