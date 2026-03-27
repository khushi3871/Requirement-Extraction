import {
  Brain,
  LayoutDashboard,
  ArrowRightToLine,
  FileText,
  Users,
  Clock,
  Star,
  Network,
  BookOpen,
  User,
  Settings,
} from "lucide-react";

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
    // These are placeholders for your other features
    { id: "stakeholders", icon: Users, label: "Stakeholders" },
    { id: "graph", icon: Network, label: "Knowledge Graph" },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[#4729e0]/20 bg-[#141121] flex flex-col h-full">
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
