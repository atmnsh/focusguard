import { Login } from "./pages";
import { SignUp } from "./pages";
import { Focus } from "./pages";
import { Route, Routes } from "react-router-dom";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";

function App() {
  return (
    <Routes>
      <Route element={<SignUp />} path="/signup" />
      <Route element={<Login />} path="/login" />
      <Route element={<Focus />} path="" />
    </Routes>
  );
}

export default App;
