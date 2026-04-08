import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/EnhancedDashboard';
import Tools from './pages/Tools';
import Lending from './pages/Lending';
import Returns from './pages/Returns';
import Maintenance from './pages/Maintenance';
import Users from './pages/Users';
import Staff from './pages/Staff';
import AuditLogs from './pages/AuditLogs';
import Reservations from './pages/Reservations';
import ToolHistory from './pages/ToolHistory';
import SetupWizard from './components/SetupWizard';
import SessionTimeout from './components/SessionTimeout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }
  
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <SessionTimeout />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<SetupWizard />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="tools" element={<Tools />} />
            <Route path="issue" element={<Lending />} />
            <Route path="receive" element={<Returns />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="users" element={<Users />} />
            <Route path="staff" element={<Staff />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="tool-history/:toolId" element={<ToolHistory />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
