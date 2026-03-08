import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import UserProfile from './pages/Profile/UserProfile';
import UserActivity from './pages/Analytics/UserActivity';

// Admin imports
import AdminRoute from './components/Routing/AdminRoute';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import ReportManagement from './pages/Admin/ReportManagement';

// Roadmap imports
import PrivateRoute from './components/Routing/PrivateRoute';
import RoadmapList from './pages/Roadmaps/RoadmapList';
import RoadmapWorkspace from './pages/Roadmaps/RoadmapWorkspace';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public & User Routes */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile/:id" element={<MainLayout><UserProfile /></MainLayout>} />

          <Route path="/roadmaps" element={
            <PrivateRoute>
              <MainLayout><RoadmapList /></MainLayout>
            </PrivateRoute>
          } />

          <Route path="/roadmaps/:id" element={
            <PrivateRoute>
              <MainLayout><RoadmapWorkspace /></MainLayout>
            </PrivateRoute>
          } />

          <Route path="/activity" element={
            <PrivateRoute>
              <MainLayout><UserActivity /></MainLayout>
            </PrivateRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportManagement />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
