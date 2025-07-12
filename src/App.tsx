import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import SignUpForm from "@/components/SignUpForm";
import LoginForm from "@/components/LoginForm";
import AuthLayout from "@/components/layouts/AuthLayout";
import NotFound from "@/components/NotFound";
import Home from "@/components/Home";
import CreateTest from "./components/CreateTest";
import ProtectedRoute from "./routes/ProtectedRoute";
import TestPreviewPage from "./components/teacher/TestPreviewPage";
import EditTestPage from "./components/teacher/EditTestPage";
import TakeTest from "./components/student/TakeTest";
import TestResult from "./components/student/TestResult";
import AttemptListing from "./components/teacher/AttemptListing";
import { useAuth } from "./context/useAuth";
import Testing from "./components/Testing";

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
                <Route path="register" element={<SignUpForm />} />

                <Route path="testing" element={<Testing />} />
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AuthLayout />}>
                        {/* 🔁 Dashboard via role in Home */}
                        <Route index element={<Home />} />

                        {/* ✅ Teacher-only routes */}
                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={["teacher", "admin"]}
                                />
                            }
                        >
                            <Route path="teacher">
                                <Route
                                    path="create-test"
                                    element={<CreateTest />}
                                />
                                <Route
                                    path="test/preview/:testId"
                                    element={<TestPreviewPage />}
                                />
                                <Route
                                    path="test/edit/:testId"
                                    element={<EditTestPage />}
                                />
                                <Route
                                    path="test/attempts/:testId"
                                    element={<AttemptListing />}
                                />
                            </Route>
                        </Route>

                        {/* ✅ Student-only routes */}
                        <Route
                            element={
                                <ProtectedRoute allowedRoles={["student",'admin']} />
                            }
                        >
                            <Route path="student">
                                <Route
                                    path="test/:testId"
                                    element={<TakeTest />}
                                />
                                <Route
                                    path="result/:attemptId"
                                    element={<TestResult />}
                                />
                            </Route>
                        </Route>
                    </Route>
                </Route>

                {/* 404 fallback */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
