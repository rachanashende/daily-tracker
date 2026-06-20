import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import Study from "./pages/Study";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import CalendarPage from "./pages/CalendarPage";
import Pomodoro from "./pages/Pomodoro";
import Journal from "./pages/Journal";
import Notes from "./pages/Notes";
import SettingsPage from "./pages/SettingsPage";

function Protected({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout title={title}>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Protected title="Dashboard"><Dashboard /></Protected>} />
            <Route path="/habits" element={<Protected title="Habits"><Habits /></Protected>} />
            <Route path="/study" element={<Protected title="Study Tracker"><Study /></Protected>} />
            <Route path="/tasks" element={<Protected title="Tasks"><Tasks /></Protected>} />
            <Route path="/goals" element={<Protected title="Goals"><Goals /></Protected>} />
            <Route path="/analytics" element={<Protected title="Analytics"><Analytics /></Protected>} />
            <Route path="/calendar" element={<Protected title="Calendar"><CalendarPage /></Protected>} />
            <Route path="/pomodoro" element={<Protected title="Pomodoro Timer"><Pomodoro /></Protected>} />
            <Route path="/journal" element={<Protected title="Daily Journal"><Journal /></Protected>} />
            <Route path="/notes" element={<Protected title="Notes"><Notes /></Protected>} />
            <Route path="/settings" element={<Protected title="Settings"><SettingsPage /></Protected>} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
