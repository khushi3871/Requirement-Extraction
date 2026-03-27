import {
  Brain,
  LayoutDashboard,
  ArrowRightToLine,
  Users,
  Clock,
  Network,
  BookOpen,
  User,
  Settings,
  Share2,
} from "lucide-react";

import { useEffect, useState } from "react";

interface SidebarProps {
  setView: (view: string) => void;
  currentView: string;
}

export default function Sidebar({ setView, currentView }: SidebarProps) {
  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "input", icon: ArrowRightToLine, label: "Input Workspace" },
    { id: "history", icon: Clock, label: "History" },
    { id: "prd", icon: BookOpen, label: "BRD Generator" },
    { id: "stakeholders", icon: Users, label: "Stakeholders" },
    { id: "graph", icon: Network, label: "Knowledge Graph" },
  ];

  const [isJiraLinked, setIsJiraLinked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("jira") === "connected") {
      localStorage.setItem("jira_status", "linked");
      setIsJiraLinked(true);

      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const savedStatus = localStorage.getItem("jira_status");
      if (savedStatus === "linked") {
        setIsJiraLinked(true);
      }
    }
  }, []);

  const connectJira = () => {
    const clientId = import.meta.env.VITE_JIRA_CLIENT_ID;

    if (!clientId) {
      console.error("Jira Client ID is missing in .env");
      alert("Configuration Error: Check console.");
      return;
    }

    const redirectUri = encodeURIComponent(
      "http://localhost:5000/api/auth/jira/callback",
    );
    const scope = encodeURIComponent(
      "offline_access read:jira-work write:jira-work read:jira-user",
    );

    const authUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&state=hackathon&response_type=code&prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#4729e0]/20 bg-[#141121] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#4729e0] rounded-lg flex items-center justify-center">
            <Brain className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            ReqMind AI
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-medium px-1">
          Requirement Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#4729e0] text-white"
                  : "text-slate-400 hover:bg-[#4729e0]/10"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Jira Connect */}
      <div className="px-4 py-4">
        {isJiraLinked ? (
          <div className="w-full flex flex-col gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
                Jira Workspace Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              Syncing to: {import.meta.env.VITE_JIRA_PROJECT_KEY || "KAN"}
            </p>
          </div>
        ) : (
          <button
            onClick={connectJira}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600/10 border border-blue-500/50 rounded-xl text-blue-400 hover:bg-blue-600 hover:text-white transition-all group shadow-lg shadow-blue-900/20"
          >
            <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Connect Jira
            </span>
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#4729e0]/20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#4729e0]/20 flex items-center justify-center">
            <User className="text-[#4729e0] w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white">
              Shubham Mohite
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              Full Stack Developer
            </p>
          </div>

          <Settings className="text-slate-400 w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>
    </aside>
  );
}
