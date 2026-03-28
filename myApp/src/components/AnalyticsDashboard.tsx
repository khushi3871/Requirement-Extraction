import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Clock,
  Zap,
  Target,
  LayoutGrid,
  FileText,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

const StatCard = ({ icon, title, value, detail, color, children }: any) => (
  <div className="bg-[#141121] p-6 rounded-2xl border border-[#4729e0]/20 shadow-lg hover:border-[#4729e0]/50 transition-all group">
    <div className="flex justify-between items-start">
      <div>
        <div className={`mb-4 p-3 bg-slate-900 w-fit rounded-xl group-hover:scale-110 transition-transform ${color}`}>
          {icon}
        </div>
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
          {title}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
      </div>
      {children && <div className="w-16 h-16 flex items-center justify-center">{children}</div>}
    </div>
    <div className="text-[10px] text-slate-500 font-medium italic">
      {detail}
    </div>
  </div>
);

const ChartContainer = ({ title, children }: any) => (
  <div className="bg-[#141121] p-6 rounded-2xl border border-[#4729e0]/20 shadow-xl">
    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
      <div className="w-1 h-4 bg-[#4729e0] rounded-full" />
      {title}
    </h3>
    {children}
  </div>
);

const AnalyticsDashboard = ({ projectList = [] }: { projectList: any[] }) => {
  const { userId } = useAuth();
  const [timeRange, setTimeRange] = useState("All Time");
  const [selectedProject, setSelectedProject] = useState("All Projects");

  const [serverStats, setServerStats] = useState({
    totalRawChars: 0,
    funcCount: 0,
    nonFuncCount: 0,
    uniqueStakeholders: 0,
    weeklyHistory: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const url = `http://localhost:5000/api/analytics/${userId}?projectId=${selectedProject}&range=${timeRange}`;
        const response = await fetch(url);
        const data = await response.json();
        setServerStats(data);
      } catch (error) {
        console.error("Sync Error:", error);
      }
    };
    if (userId) fetchAnalytics();
  }, [userId, selectedProject, timeRange]);

  // Calculations
  const totalItems = serverStats.funcCount + serverStats.nonFuncCount;
  const hoursSaved = (totalItems * 0.2).toFixed(1);
  
  const inputVolume = serverStats.totalRawChars > 1000 
    ? (serverStats.totalRawChars / 1000).toFixed(1) + "k" 
    : serverStats.totalRawChars;

  const refinementRate = serverStats.totalRawChars > 0 
    ? Math.min((totalItems / (serverStats.totalRawChars / 100)) * 10, 95).toFixed(1)
    : "0";

  const funnelData = [
    { value: serverStats.totalRawChars || 100, name: "Raw Input" },
    { value: Math.round(serverStats.totalRawChars * 0.6) || 60, name: "NLP Filter" },
    { value: totalItems * 10 || 20, name: "Structured" },
  ];

  const distributionData = [
    { name: "Functional", value: serverStats.funcCount || (totalItems === 0 ? 1 : 0), color: "#4729e0" },
    { name: "Non-Functional", value: serverStats.nonFuncCount || 0, color: "#10b981" },
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="p-8 bg-[#0f0d19] min-h-screen text-slate-100 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="appearance-none bg-[#141121] border border-[#4729e0]/30 text-white px-4 py-2 pr-10 rounded-xl focus:outline-none cursor-pointer text-sm"
            >
              <option>All Projects</option>
              {projectList.map((proj: any) => (
                <option key={proj._id} value={proj._id}>{proj.name}</option>
              ))}
            </select>
            <LayoutGrid className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
          </div>
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-[#141121] border border-[#4729e0]/30 text-white px-4 py-2 pr-10 rounded-xl focus:outline-none cursor-pointer text-sm"
            >
              <option>All Time</option>
              <option>Today</option>
              <option>Monthly</option>
            </select>
            <Clock className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Zap size={20} />}
          title="Cumulative ROI"
          value={`${hoursSaved} hrs`}
          detail="Efficiency Boost"
          color="text-yellow-400"
        />

        <StatCard
          icon={<FileText size={20} />}
          title="Input Volume"
          value={inputVolume}
          detail="Total Chars Processed"
          color="text-blue-400"
        />

        <StatCard
          icon={<Sparkles size={20} />}
          title="Refinement"
          value={`${refinementRate}%`}
          detail="Data Clarity Score"
          color="text-green-400"
        />

        <StatCard
          icon={<Clock size={20} />}
          title="Stakeholders"
          value={serverStats.uniqueStakeholders}
          detail="Recognized Entities"
          color="text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartContainer title="Domain Split">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#141121", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* LEGEND TITLES */}
            <div className="flex flex-col gap-4 w-full md:w-auto min-w-[140px]">
              {distributionData.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter">
                      {item.name}
                    </span>
                  </div>
                  <div className="pl-5 text-xl font-bold text-white">
                    {totalItems > 0 ? ((item.value / totalItems) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>
        
        <ChartContainer title="Signal-to-Noise">
          <ResponsiveContainer width="100%" height={250}>
            <FunnelChart>
              <Tooltip contentStyle={{ backgroundColor: "#141121", border: "none" }} />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="bg-[#141121] p-6 rounded-2xl border border-[#4729e0]/20 shadow-xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-2">
            <Target className="text-[#4729e0]" size={20} />
            <h3 className="text-lg font-semibold text-slate-200">Weekly Activity Velocity</h3>
          </div>
          <div className="px-3 py-1 bg-[#4729e0]/20 border border-[#4729e0]/50 rounded-lg text-xs font-bold text-[#7c62ff]">
            Work Session History
          </div>
        </div>

        <div className="h-64 w-full flex items-end justify-around gap-2 px-2 pb-2 relative border-b border-slate-800">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-slate-400 w-full" />
            ))}
          </div>

          {weekDays.map((day, index) => {
            const dayNum = index + 1;
            const dayData: any = serverStats.weeklyHistory?.find((d: any) => d._id === dayNum);
            const inputCount = dayData ? dayData.totalInputs : 0;
            const barHeight = inputCount > 0 ? Math.min((inputCount / 50) * 100, 100) : 5;

            return (
              <div key={day} className="flex-1 flex flex-col items-center justify-end h-full relative z-10 group">
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] px-2 py-1 rounded font-bold z-50 whitespace-nowrap">
                  {inputCount} Inputs
                </div>
                <div
                  className="w-full max-w-[40px] rounded-t-md transition-all duration-500 ease-in-out"
                  style={{
                    height: `${barHeight}%`,
                    backgroundColor: "#4729e0",
                    boxShadow: inputCount > 0 ? "0 4px 15px rgba(71, 41, 224, 0.3)" : "none",
                    opacity: inputCount > 0 ? 1 : 0.2,
                  }}
                />
                <span className="mt-2 text-[10px] font-bold uppercase text-slate-400 group-hover:text-[#7c62ff]">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;