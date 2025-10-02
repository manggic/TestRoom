import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router';
// import SignUpForm from "@/components/SignUpForm";
import LoginForm from '@/components/LoginForm';
import AuthLayout from '@/components/layouts/AuthLayout';
import NotFound from '@/components/NotFound';
import CreateTest from './components/CreateTest';
import ProtectedRoute from './routes/ProtectedRoute';
import TestPreviewPage from './components/teacher/TestPreviewPage';
import EditTestPage from './components/teacher/EditTestPage';
import TakeTest from './components/student/TakeTest';
import TestResult from './components/student/TestResult';
import AttemptListing from './components/teacher/AttemptListing';
import { useAuth } from './context/useAuth';
import LandingPage from './components/LandingPage';
import Contact from './components/Contact';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import RegisterOrg from './components/RegisterOrg';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import OrgDetails from './components/superadmin/OrgDetails';
import DemoPage from './components/demo/DemoPage';
import ForgotPassword from './components/ForgotPassword';
import UpdatePassword from './components/UpdatePassword';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="text-center p-6">Loading App...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="login" element={<LoginForm />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="update-password" element={<UpdatePassword />} />
        {/* <Route path="register" element={<SignUpForm />} /> */}

        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="contact-us" element={<Contact />} />
          <Route path="demo" element={<DemoPage />} />
        </Route>

        <Route path="register-org" element={<RegisterOrg />} />

        {/* <Route path="testing" element={<Testing />} /> */}
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthLayout />}>
            {/* 🔁 Dashboard via role in Home */}
            {/* <Route index element={<Home />} /> */}

            <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
              <Route path="superadmin" element={<SuperAdminDashboard />} />
              <Route path="superadmin/org/:orgId" element={<OrgDetails />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            {/* ✅ Teacher-only routes */}
            <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
              <Route path="teacher">
                <Route index element={<TeacherDashboard />} />
                <Route path="create-test" element={<CreateTest />} />
                <Route path="test/preview/:testId" element={<TestPreviewPage />} />
                <Route path="test/edit/:testId" element={<EditTestPage />} />
                <Route path="test/attempts/:testId" element={<AttemptListing />} />
              </Route>
            </Route>

            {/* ✅ Student-only routes */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
              <Route path="student">
                <Route index element={<StudentDashboard />} />
                <Route path="test/:testId" element={<TakeTest />} />
              </Route>
            </Route>

            <Route
              path="student/result/:attemptId"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin', 'teacher']}>
                  <TestResult />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
