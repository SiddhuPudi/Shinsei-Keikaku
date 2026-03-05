import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./Pages/Home.jsx";
import Daily from "./Pages/Daily.jsx";
import Monthly from "./Pages/Monthly.jsx";
import Yearly from "./Pages/Yearly.jsx";
import Finance from "./Pages/Finance.jsx";
import Quests from "./Pages/Quests.jsx";
import Achievements from "./Pages/Achievements.jsx";
import Settings from "./Pages/Settings.jsx";
import Auth from "./Pages/Auth.jsx";
import Weekly from "./Pages/Weekly.jsx";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/quests" element={<Quests />} />
          <Route path="/monthly" element={<Monthly />} />
          <Route path="/yearly" element={<Yearly />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/weekly" element={<Weekly />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;