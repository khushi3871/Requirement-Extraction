import {
  Brain,
  LayoutDashboard,
  Folder,
  FileText,
  Settings,
  LogOut,
  Network,
  Gauge,
  Users,
  Gavel,
  Calendar,
  AlertCircle,
  Pencil,
  ArrowLeft,
  PlusCircle,
  Check
} from 'lucide-react';
// --- Mock Data ---
const functionalReqs = [
  {
    id: 1,
    title: 'System should support Google login',
    source: 'Extracted from Slack thread #auth-dev',
    checked: true,
  },
  {
    id: 2,
    title: 'User can reset password',
    source: 'Extracted from Email context "Login Flow Update"',
    checked: true,
  },
];

const nonFunctionalReqs = [
  {
    id: 3,
    title: 'System must handle 5000 concurrent users',
    source: 'Inferred from technical specs document',
    checked: true,
  },
  {
    id: 4,
    title: 'System should be secure (AES-256 encryption)',
    source: 'Security standards discussion',
    checked: true,
  },
];

const stakeholders = [
  { id: 5, title: 'Product Manager', checked: true },
  { id: 6, title: 'John (Engineering Lead)', checked: true },
];

const decisions = [
  { id: 7, title: 'Payment system approved (Stripe)', checked: true },
];

const timelines = [
  { id: 8, title: 'Release by July 2024', checked: true },
];

const priorities = [
  { id: 9, title: 'Login feature is High Priority', checked: true, badge: 'High' },
];

// --- Components ---

function CustomCheckbox({ checked = false }: { checked?: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
      <input
        type="checkbox"
        defaultChecked={checked}
        className="peer appearance-none w-5 h-5 border border-slate-700 rounded bg-transparent checked:bg-[#4729e0] checked:border-[#4729e0] cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#4729e0]/50 focus:ring-offset-1 focus:ring-offset-[#1c1a2e]"
      />
      <Check
        strokeWidth={3}
        className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
      />
    </div>
  );
}

function RequirementItem({ title, source, checked }: { title: string; source: string; checked?: boolean }) {
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

function CompactItem({ title, checked, badge }: { title: string; checked?: boolean; badge?: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#1c1a2e] border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <CustomCheckbox checked={checked} />
        <div className="flex items-center gap-2">
          <span className="text-slate-100 font-medium text-sm">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
      </div>
      <button className="p-1.5 text-slate-400 hover:text-[#4729e0] transition-colors">
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex h-screen bg-[#141121] text-slate-100 font-sans antialiased overflow-hidden selection:bg-[#4729e0]/30">

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
        
        {/* Header */}
        <header className="px-8 pt-10 pb-6 shrink-0">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Extracted Requirements Review
            </h2>
            <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
              These items were automatically extracted from the previous communication source. 
              Please review, edit, or select the relevant items before adding them to your project repository.
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="px-8 pb-24 flex-1">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Functional Requirements */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Functional Requirements</h3>
              </div>
              <div className="grid gap-3">
                {functionalReqs.map((req) => (
                  <RequirementItem key={req.id} {...req} />
                ))}
              </div>
            </section>

            {/* Non Functional Requirements */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-[#4729e0]" />
                <h3 className="text-lg font-bold text-white">Non Functional Requirements</h3>
              </div>
              <div className="grid gap-3">
                {nonFunctionalReqs.map((req) => (
                  <RequirementItem key={req.id} {...req} />
                ))}
              </div>
            </section>

            {/* 2-Column Grid for smaller sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Stakeholders */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Stakeholders</h3>
                </div>
                <div className="grid gap-3">
                  {stakeholders.map((item) => (
                    <CompactItem key={item.id} {...item} />
                  ))}
                </div>
              </section>

              {/* Decisions */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Gavel className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Decisions</h3>
                </div>
                <div className="grid gap-3">
                  {decisions.map((item) => (
                    <CompactItem key={item.id} {...item} />
                  ))}
                </div>
              </section>

              {/* Timelines */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Timelines</h3>
                </div>
                <div className="grid gap-3">
                  {timelines.map((item) => (
                    <CompactItem key={item.id} {...item} />
                  ))}
                </div>
              </section>

              {/* Feature Priority */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-[#4729e0]" />
                  <h3 className="text-lg font-bold text-white">Feature Priority</h3>
                </div>
                <div className="grid gap-3">
                  {priorities.map((item) => (
                    <CompactItem key={item.id} {...item} />
                  ))}
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 w-full px-8 py-4 bg-[#141121]/80 backdrop-blur-lg border-t border-slate-800 z-10">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors font-semibold text-sm">
              <ArrowLeft className="w-5 h-5" />
              Back to Input
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#4729e0] text-white hover:bg-[#4729e0]/90 transition-all font-bold text-sm shadow-lg shadow-[#4729e0]/20 active:scale-[0.98]">
              Add Selected to Project
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>
        </footer>

      </main>
    </div>
  );
}
