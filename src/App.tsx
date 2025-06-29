import "./App.css";
import SignUpForm from "@/components/SignUpForm";
import LoginForm from "@/components/LoginForm";
import { BrowserRouter, Routes, Route } from "react-router";
import AuthLayout from "@/components/layouts/AuthLayout";
import NotFound from "@/components/NotFound";
import Home from "@/components/Home";
import CreateTest from "./components/CreateTest";
import TestPaper from "./components/TestPaper";
import ProtectedRoute from "./routes/ProtectedRoute";
import TestPreviewPage from "./components/teacher/TestPreviewPage";
import EditTestPage from "./components/teacher/EditTestPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="login" element={<LoginForm />} />
                <Route path="register" element={<SignUpForm />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route index element={<Home />} />
                        <Route path="create-test" element={<CreateTest />} />
                        <Route path="test" element={<TestPaper />} />

                           <Route path="/testpaper/maths/preview" element={<TestPreviewPage />} />
                           <Route path="/testpaper/maths/edit" element={<EditTestPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
