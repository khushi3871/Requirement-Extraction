import { useState } from "react";
import Sidebar from "../components/sidebar";
import InputPage from "../components/input";
import RequirementsPanel from "../components/output";

export default function App() {
  const [showRequirements, setShowRequirements] = useState(false);

  return (
    <div className="flex h-screen bg-[#141121] text-slate-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {!showRequirements ? (
          <InputPage onExtract={() => setShowRequirements(true)} />
        ) : (
          <RequirementsPanel />
        )}
      </div>

    </div>
  );
}