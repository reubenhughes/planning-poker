import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// pages and components
import HomePage from "./pages/HomePage";
import PokerSessionPage from "./pages/PokerSessionPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import NotFoundPage from "./pages/NotFoundPage";
import Ably from "./pages/AblyTestPage"
import NavBar from "./components/NavBar";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <div className="pages">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/session/:room" element={<PokerSessionPage />} />
            <Route path="/create-session" element={<CreateSessionPage />} />
            <Route path="/ably" element={<AblyTestPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
