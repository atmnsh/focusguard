import { Login } from "./features/pages/Login/Login";
import { SignUp } from "../src/features/pages/Login/SignUp";
import { Dashboard } from "./features/pages/Dashboard";
import { Avatar } from "./features/pages/Avatar";
import ForgotPassword from "./features/pages/Login/Forgot-password";
import ResetPassword from "./features/pages/Login/Reset-password";
import { LandingPage } from "./features/pages/LandingPage";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./features/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route element={<SignUp />} path="/signup" />
        <Route element={<Login />} path="/login" />
        <Route element={<Dashboard />} path="/dash" />
        <Route element={<Avatar />} path="/av" />
        <Route element={<ForgotPassword />} path="/password" />
        <Route element={<ResetPassword />} path="/reset-pass" />
        <Route element={<LandingPage />} path="/" />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
