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
import ProtectedRoute from "./components/ProtectedRoutes.jsx";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily" element={<ProtectedRoute><Daily /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/quests" element={<ProtectedRoute><Quests /></ProtectedRoute>} />
          <Route path="/monthly" element={<ProtectedRoute><Monthly /></ProtectedRoute>} />
          <Route path="/yearly" element={<ProtectedRoute><Yearly /></ProtectedRoute>} />
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/weekly" element={<ProtectedRoute><Weekly /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
export default App;