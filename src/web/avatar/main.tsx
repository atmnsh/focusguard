import React from "react";
import ReactDOM from "react-dom/client";
import { AvatarApp } from "./AvatarApp";
import "../ui/index.css"; // Reuse existing styles if needed

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AvatarApp />
  </React.StrictMode>
);
