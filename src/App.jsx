import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import TopicsPage from "./pages/TopicsPage";
import MobilePage from "./pages/MobilePage";
import DesktopPage from "./pages/DesktopPage";
import { ProgressProvider } from "./contexts/ProgressContext";
import "./App.css";

function App() {
  return (
    <ProgressProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topics/:lessonNumber" element={<TopicsPage />} />
          <Route
            path="/practice/:lessonNumber/:topicId/:conversationId"
            element={<DesktopPage />}
          />
          <Route
            path="/mobile-practice/:lessonNumber/:topicId/:conversationId"
            element={<MobilePage />}
          />
        </Routes>
      </div>
    </ProgressProvider>
  );
}

export default App;
