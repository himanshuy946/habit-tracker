import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // This is now empty, so it won't break things

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
