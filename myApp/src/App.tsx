import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Workplace from "./pages/workspace";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workplace" element={<Workplace />} />
      </Routes>
    </BrowserRouter>
  );
}