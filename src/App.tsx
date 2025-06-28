import "./App.css";
import SignUpForm from "@/components/SignUpForm";
import LoginForm from "@/components/LoginForm";
import { BrowserRouter, Routes, Route } from "react-router";
import AuthLayout from "@/components/layouts/AuthLayout";
import NotFound from "@/components/NotFound";
import Home from "@/components/Home";
import CreateTest from "./components/CreateTest";
import TestPaper from "./components/TestPaper";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />

                <Route element={<AuthLayout />}>
                    <Route path="create-test" element={<CreateTest />} />
                    <Route path="test" element={<TestPaper />} />
                    <Route path="login" element={<LoginForm />} />
                    <Route path="register" element={<SignUpForm />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
