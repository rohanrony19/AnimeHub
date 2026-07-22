import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <App />
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 2500,
      style: {
        background: "#1e293b",
        color: "#fff",
        borderRadius: "16px",
        padding: "16px",
      },
      success: {
        style: {
          background: "#16a34a",
        },
      },
      error: {
        style: {
          background: "#dc2626",
        },
      },
    }}
  />
</BrowserRouter>
);