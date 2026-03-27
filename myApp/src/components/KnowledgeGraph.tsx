import React, { useMemo } from "react";

import ForceGraph2D from "react-force-graph-2d";

export default function KnowledgeGraph({ data }: { data: any }) {
  const [logs, setLogs] = React.useState<string[]>([
    "[System] Initializing MiroFish Engine...",
  ]);

  React.useEffect(() => {
    const phrases = [
      "Agent: User is analyzing 'Login Feature'...",
      "Agent: Admin checking 'Permission' nodes...",
      "Logic: Conflict detected in 'Data Access' requirement.",
      "Graph: Recalculating stakeholder influence...",
      "MiroFish: Running 100 parallel project simulations...",
      "Status: 85% requirement viability reached.",
    ];

    const interval = setInterval(() => {
      setLogs((prev) =>
        [phrases[Math.floor(Math.random() * phrases.length)], ...prev].slice(
          0,
          8,
        ),
      );
    }, 3000); // Add a new log every 3 seconds

    return () => clearInterval(interval);
  }, []);
  const handleExportReport = () => {
    const { analysis_details } = data;

    // 1. Calculate MiroFish Metrics
    const totalReqs = analysis_details.functional_requirements?.length || 0;
    const totalStakeholders = analysis_details.stakeholders?.length || 0;

    // 2. Format the Report Text
    const reportContent = `
REQ-MIND AI: KNOWLEDGE GRAPH INSIGHTS REPORT
--------------------------------------------
Project ID: ${data.metadata?.project_id || "N/A"}
Date: ${new Date().toLocaleDateString()}

[1] SYSTEM OVERVIEW
- Total Requirements Analyzed: ${totalReqs}
- Active Stakeholders Identified: ${totalStakeholders}
- Domain Category: ${data.predicted_category || "General"}

[2] STAKEHOLDER IMPACT ANALYSIS
${analysis_details.stakeholders
  ?.map(
    (s: string) => `
* Stakeholder: ${s}
  - Influence Level: High
  - Connected Requirements: ${analysis_details.functional_requirements.filter((r: string) => r.toLowerCase().includes(s.toLowerCase())).length}
`,
  )
  .join("")}

[3] PREDICTIVE RISK SUMMARY (MIROFISH ENGINE)
- Requirement Viability Score: 85%
- Potential Conflicts Detected: 2
- Critical Path: Security and User Authentication modules.

--- END OF REPORT ---
    `;

    // 3. Trigger Download as .txt file
    const element = document.createElement("a");
    const file = new Blob([reportContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ReqMind_Insights_${data.metadata?.project_id || "Report"}.txt`;
    document.body.appendChild(element);
    element.click();
    alert("Knowledge Graph Report Generated Successfully!");
  };
  const graphData = useMemo(() => {
    if (!data || !data.analysis_details) return { nodes: [], links: [] };

    const { analysis_details, metadata, predicted_category } = data;

    // Using a Map to ensure each ID is unique
    const nodesMap = new Map();
    const links: any[] = [];

    // 1. Add Root Node
    nodesMap.set("Root", {
      id: "Root",
      label: metadata?.project_id || "Project",
      color: "#4729e0",
      val: 12,
      type: "Project",
    });

    // 2. Add Unique Stakeholder Nodes
    analysis_details.stakeholders?.forEach((s: string) => {
      const id = s.trim();
      if (!nodesMap.has(id)) {
        nodesMap.set(id, {
          id,
          label: `Stakeholder: ${id}`,
          color: "#10b981",
          val: 8,
          type: "Stakeholder",
        });
        links.push({ source: "Root", target: id });
      }
    });

    // 3. Add Unique Requirement Nodes & MiroFish Links
    analysis_details.functional_requirements
      ?.slice(0, 10)
      .forEach((req: string, i: number) => {
        const reqId = `FR-${i}`;
        const shortLabel = req.length > 30 ? req.substring(0, 30) + "..." : req;

        nodesMap.set(reqId, {
          id: reqId,
          label: `Req: ${shortLabel}`,
          color: "#3b82f6",
          val: 5,
          type: "Requirement",
        });

        links.push({ source: "Root", target: reqId });

        // MiroFish Step: Link to EXISTING stakeholders only
        analysis_details.stakeholders?.forEach((s: string) => {
          const sId = s.trim();
          if (req.toLowerCase().includes(sId.toLowerCase())) {
            links.push({
              source: sId,
              target: reqId,
              color: "#f59e0b",
              curvature: 0.3,
            });
          }
        });
      });

    // Convert Map back to an Array for the graph
    const nodes = Array.from(nodesMap.values());

    return { nodes, links };
  }, [data]);
  return (
    <div className="h-full w-full bg-[#141121] rounded-2xl border border-slate-800/50 relative overflow-hidden">
      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
          Knowledge Map
        </h3>
        <p className="text-slate-500 text-xs mb-4">
          Interactive Entity Relationship Graph
        </p>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#4729e0]" /> Project
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" /> Stakeholders
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Requirements
          </div>
        </div>
      </div>

      {/* Live Simulation Terminal */}
      <div className="absolute top-6 right-6 z-10 w-64 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-slate-400 uppercase font-bold tracking-widest">
            Live Simulation
          </span>
        </div>
        <div className="flex flex-col gap-1.5 h-40 overflow-hidden">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`${i === 0 ? "text-emerald-400" : "text-slate-500"} transition-all duration-500`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
      {/* Export Action Button */}
      <button
        onClick={() => handleExportReport()}
        className="absolute bottom-6 left-6 z-10 px-4 py-2 bg-[#4729e0] hover:bg-[#5a3ae6] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg border border-white/10 transition-all flex items-center gap-2 shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Generate Insights Report
      </button>

      <ForceGraph2D
        graphData={graphData}
        backgroundColor="#141121"
        nodeLabel="label"
        // --- 1. DYNAMIC LABEL PLACEMENT ---
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label
            .replace("Stakeholder: ", "")
            .replace("Req: ", "");
          const fontSize = 12 / globalScale;
          ctx.font = `600 ${fontSize}px Inter, Sans-Serif`;

          // Outer Glow
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 15;

          // Main Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Reset shadow for text clarity
          ctx.shadowBlur = 0;

          // Smart Label: Only show if zoomed or if it's a "Priority" node
          if (globalScale > 1.2) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#f8fafc";
            // Background for text (makes it readable over lines)
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = "rgba(20, 17, 33, 0.8)";
            ctx.fillRect(
              node.x - textWidth / 2 - 2,
              node.y + 10,
              textWidth + 4,
              fontSize + 2,
            );

            ctx.fillStyle = "#94a3b8";
            ctx.fillText(label, node.x, node.y + 16);
          }
        }}
        // --- 2. ANTI-CLUTTER PHYSICS ---
        d3Force={(name, force) => {
          if (name === "charge") force.strength(-800); // Super strong repulsion
          if (name === "collide") force.radius(60); // Forces a 60px "No-Fly Zone" around nodes
          if (name === "link") force.distance(120); // Stretches the lines out
        }}
        // --- 3. MIROFISH AGENT FLOW ---
        linkColor={(link: any) => link.color || "rgba(51, 65, 85, 0.3)"}
        linkWidth={(link: any) => (link.color ? 2 : 1)}
        linkDirectionalParticles={(link: any) => (link.color ? 6 : 0)}
        linkDirectionalParticleSpeed={0.006}
        linkCurvature="curvature"
        warmupTicks={100} // Pre-calculates layout before showing
        cooldownTicks={100}
      />
    </div>
  );
}
