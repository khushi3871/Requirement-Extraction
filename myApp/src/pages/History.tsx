import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { useAuth } from "@clerk/clerk-react";
import { 
  Clock, 
  FileText, 
  ChevronRight, 
  Folder, 
  Calendar, 
  Loader2, 
  Trash2, 
  LayoutGrid // Added for the My Projects icon
} from "lucide-react";

interface HistoryItem {
  _id: string;
  fileName?: string;
  raw_text?: string;
  createdAt: string;
  predicted_category: string;
  analysis_details: any;
}

const getRelativeDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function HistoryPage({ onViewItem }: { onViewItem: (item: any) => void }) {
  const navigate = useNavigate(); // Hook for navigation
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { projectId } = useParams();
  const { userId } = useAuth();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get("name") || "Project Workspace";

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    
    if (!window.confirm("Are you sure you want to delete this extraction?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHistory(prev => prev.filter(item => item._id !== id));
      } else {
        alert("Failed to delete the item.");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      if (!projectId || !userId) return;

      try {
        const response = await fetch(`http://127.0.0.1:5000/api/history/${projectId}/${userId}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [projectId, userId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#141121]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#4729e0]" size={40} />
          <p className="text-[#4729e0] font-medium animate-pulse">Loading {projectName} history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section with My Projects Button */}
      <div className="mb-12 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-[#4729e0] mb-1">
            <Folder size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Project Activity</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">
            {projectName}
          </h2>
        </div>

        {/* --- MY PROJECTS REDIRECT BUTTON --- */}
        <button 
          onClick={() => navigate('/select-project')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-[#4729e0] hover:border-[#4729e0] transition-all shadow-lg shadow-black/20 group"
        >
          <LayoutGrid size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          My Projects
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center p-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <Clock className="mx-auto mb-4 text-slate-700" size={48} />
          <p className="text-xl font-bold text-slate-300">No history found</p>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">
            Analyze some requirements in the <strong>Input</strong> tab to see them listed here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(
            history.reduce((groups: Record<string, HistoryItem[]>, item) => {
              const label = getRelativeDateLabel(item.createdAt);
              if (!groups[label]) groups[label] = [];
              groups[label].push(item);
              return groups;
            }, {})
          ).map(([dateLabel, items]) => (
            <div key={dateLabel} className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-5 flex items-center gap-2">
                <Calendar size={14} className="text-[#4729e0]" />
                {dateLabel}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => onViewItem(item)}
                    className="group flex items-center justify-between p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-[#4729e0]/50 hover:bg-[#4729e0]/5 transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-5">
                      <div className="size-14 rounded-xl bg-[#4729e0]/10 flex items-center justify-center text-[#4729e0] group-hover:bg-[#4729e0] group-hover:text-white transition-all shadow-lg">
                        <FileText size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors truncate">
                          {item.fileName || (item.raw_text ? item.raw_text.split('\n')[0].substring(0, 50) : "Requirement Extraction")}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="bg-slate-800 text-[#4729e0] px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                            {item.predicted_category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleDelete(e, item._id)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all md:opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20} />
                      </button>

                      <div className="flex items-center gap-2 text-[#4729e0] opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden md:flex">
                        <span className="text-sm font-bold">Open</span>
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}