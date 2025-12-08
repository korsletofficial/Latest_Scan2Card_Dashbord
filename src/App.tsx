import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getUser } from './utils/auth';

// Pages
import Login from './pages/Login';
import OTPVerification from './pages/OTPVerification';
import Unauthorized from './pages/Unauthorized';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SuperAdminExhibitors from './pages/SuperAdmin/Exhibitors';
import SuperAdminFeedback from './pages/SuperAdmin/Feedback';
import ExhibitorDashboard from './pages/Exhibitor/Dashboard';
import ExhibitorEvents from './pages/Exhibitor/Events';
import ExhibitorLeads from './pages/Exhibitor/Leads';
import TeamManagerDashboard from './pages/TeamManager/Dashboard';
import TeamManagerTeam from './pages/TeamManager/Team';
import TeamManagerLeadsPage from './pages/TeamManager/LeadsPage';
import TeamManagerMeetings from './pages/TeamManager/Meetings';
import TeamManagerLicenseKeys from './pages/TeamManager/LicenseKeys';
import EndUserDashboard from './pages/EndUser/Dashboard';
import EndUserLeads from './pages/EndUser/Leads';
import EndUserEvents from './pages/EndUser/Events';
import EndUserMeetings from './pages/EndUser/Meetings';
import EndUserProfile from './pages/EndUser/Profile';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const HomeRedirect = () => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }

    const user = getUser();
    switch (user?.role) {
      case 'SUPERADMIN':
        return <Navigate to="/super-admin/dashboard" replace />;
      case 'EXHIBITOR':
        return <Navigate to="/exhibitor/dashboard" replace />;
      case 'TEAMMANAGER':
        return <Navigate to="/manager/dashboard" replace />;
      case 'ENDUSER':
        return <Navigate to="/enduser/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Super Admin Routes */}
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/exhibitors"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <SuperAdminExhibitors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/feedback"
          element={
            <ProtectedRoute allowedRoles={['SUPERADMIN']}>
              <SuperAdminFeedback />
            </ProtectedRoute>
          }
        />

        {/* Exhibitor Routes */}
        <Route
          path="/exhibitor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['EXHIBITOR']}>
              <ExhibitorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exhibitor/events"
          element={
            <ProtectedRoute allowedRoles={['EXHIBITOR']}>
              <ExhibitorEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exhibitor/leads"
          element={
            <ProtectedRoute allowedRoles={['EXHIBITOR']}>
              <ExhibitorLeads />
            </ProtectedRoute>
          }
        />

        {/* Team Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute allowedRoles={['TEAMMANAGER']}>
              <TeamManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/team"
          element={
            <ProtectedRoute allowedRoles={['TEAMMANAGER']}>
              <TeamManagerTeam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/leads"
          element={
            <ProtectedRoute allowedRoles={['TEAMMANAGER']}>
              <TeamManagerLeadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/meetings"
          element={
            <ProtectedRoute allowedRoles={['TEAMMANAGER']}>
              <TeamManagerMeetings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/license-keys"
          element={
            <ProtectedRoute allowedRoles={['TEAMMANAGER']}>
              <TeamManagerLicenseKeys />
            </ProtectedRoute>
          }
        />

        {/* End User Routes */}
                <Route
                  path="/enduser/profile"
                  element={
                    <ProtectedRoute allowedRoles={['ENDUSER']}>
                      <EndUserProfile />
                    </ProtectedRoute>
                  }
                />
        <Route
          path="/enduser/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ENDUSER']}>
              <EndUserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enduser/leads"
          element={
            <ProtectedRoute allowedRoles={['ENDUSER']}>
              <EndUserLeads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enduser/events"
          element={
            <ProtectedRoute allowedRoles={['ENDUSER']}>
              <EndUserEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enduser/meetings"
          element={
            <ProtectedRoute allowedRoles={['ENDUSER']}>
              <EndUserMeetings />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

