import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
// Combined all necessary icons
import { FolderPlus, FolderOpen, Loader2, LayoutGrid, RefreshCw } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function ProjectSelection() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  // State Management
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false); // For Email Sync progress

  // 1. Fetch live projects - Wrapped in useCallback to reuse in Sync logic
  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/projects/${user.id}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // 2. Global Email Sync Logic
  const handleGlobalSync = async () => {
    if (!user?.id) return;
    setSyncing(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/global-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (data.status === "AUTH_REQUIRED") {
        // Redirect to Google Login if tokens are missing or expired
        window.location.href = data.url;
      } else {
        alert(data.message || "Sync completed successfully!");
        // Refresh project list to reflect any new sync timestamps or data
        fetchProjects();
      }
    } catch (error) {
      console.error("Global Sync Error:", error);
      alert("Failed to sync emails. Make sure the backend and Python AI are running.");
    } finally {
      setSyncing(false);
    }
  };

  // 3. Create Project Logic
  const handleCreateProject = async () => {
    const projectName = prompt("Enter New Project Name:");
    if (!projectName || !user?.id) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          userId: user.id,
          description: "Analysis workspace"
        }),
      });

      const newProj = await response.json();
      if (newProj._id) {
        // Redirect immediately to the new project workspace
        navigate(`/workplace/${newProj._id}?name=${encodeURIComponent(newProj.name)}`);
      }
    } catch (error) {
      console.error("Create Project Error:", error);
      alert("Failed to create project. Is the backend running?");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0c1d] text-white p-8 md:p-12">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#4729e0] mb-2">
            <LayoutGrid size={18} />
            <span className="text-xs font-bold uppercase tracking-tighter">Workspace Hub</span>
          </div>
          <h1 className="text-4xl font-black text-white">Project Selection</h1>
          <p className="text-slate-400 mt-1">
            Select a workspace to continue your analysis, {user?.firstName || "User"}.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Email Sync Button */}
          <button 
            onClick={handleGlobalSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border ${
              syncing 
              ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" 
              : "bg-slate-900 border-slate-800 text-white hover:border-[#4729e0] hover:bg-[#4729e0]/10"
            }`}
          >
            {syncing ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            {syncing ? "Analyzing Inbox..." : "Email Sync"}
          </button>

          {/* Create Project Button */}
          <button 
            onClick={handleCreateProject}
            className="group flex items-center gap-2 bg-[#4729e0] px-6 py-4 rounded-2xl font-bold shadow-xl shadow-[#4729e0]/20 hover:scale-105 transition-all"
          >
            <FolderPlus size={20} /> Create New Project
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500">
          <Loader2 className="animate-spin mb-4 text-[#4729e0]" size={40} />
          <p>Syncing your workspaces...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500">No projects found. Create your first one to get started!</p>
            </div>
          ) : (
            projects.map((proj) => (
              <div 
                key={proj._id}
                onClick={() => navigate(`/workplace/${proj._id}?name=${encodeURIComponent(proj.name)}`)}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-[#4729e0] hover:bg-[#4729e0]/5 transition-all cursor-pointer"
              >
                <div className="size-12 rounded-xl bg-[#4729e0]/10 flex items-center justify-center text-[#4729e0] mb-6 group-hover:scale-110 transition-transform">
                  <FolderOpen size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-white">{proj.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {proj.description || "Project-specific requirement analysis."}
                </p>
                <div className="pt-4 border-t border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Created {new Date(proj.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}