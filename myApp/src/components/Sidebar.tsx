import {
  Brain,
  LayoutDashboard,
  ArrowRightToLine,
  FileText,
  Users,
  Gavel,
  Clock,
  Star,
  Network,
  BookOpen,
  User,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: false },
    { icon: ArrowRightToLine, label: "Input Workspace", active: true },
    { icon: FileText, label: "Requirements", active: false },
    { icon: Users, label: "Stakeholders", active: false },
    { icon: Gavel, label: "Decisions", active: false },
    { icon: Clock, label: "Timeline", active: false },
    { icon: Star, label: "Feature Priority", active: false },
    { icon: Network, label: "Knowledge Graph", active: false },
    { icon: BookOpen, label: "PRD Generator", active: false },
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
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              item.active
                ? "bg-[#4729e0] text-white"
                : "text-slate-400 hover:bg-[#4729e0]/10"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-[#4729e0]/20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#4729e0]/20 flex items-center justify-center">
            <User className="text-[#4729e0] w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white">
              Alex Chen
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              Product Architect
            </p>
          </div>

          <Settings className="text-slate-400 w-4 h-4 cursor-pointer hover:text-white" />
        </div>
      </div>
    </aside>
  );
}