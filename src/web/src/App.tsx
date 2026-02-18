import { Login } from "./features/pages/Login/Login";
import { SignUp } from "../src/features/pages/Login/SignUp";
import { Dashboard } from "./features/pages/Dashboard";
import { Avatar } from "./features/pages/Avatar";
import { Anima } from "./features/pages/Anima";
import { Route, Routes } from "react-router-dom";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";

function App() {
  return (
    <Routes>
      <Route element={<SignUp />} path="/signup" />
      <Route element={<Login />} path="/login" />
      <Route element={<Dashboard />} path="/dash" />
      <Route element={<Avatar />} path="/av" />
      <Route element={<Anima />} path="/an" />
    </Routes>
  );
}

export default App;
