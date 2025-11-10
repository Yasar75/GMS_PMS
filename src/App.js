import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

import Login from "./sections/auth/pages/Login";
import Register from "./sections/auth/pages/Register";
import ForgotPassword from "./sections/auth/pages/ForgotPassword";
import Dashboard from "./sections/features/pages/Dashboard";
import ProjectList from "./sections/features/pages/ProjectList";
import ResourceList from "./sections/features/pages/ResourceList";
import TaskMonitoring from "./sections/features/pages/TaskMonitoring";

// Adjust this import path to wherever you placed ErrorModal.jsx
import ErrorModal from "../sections/features/ErrorModal";

/** Catch-all 404 that shows modal then routes to Login */
function NotFoundRedirect() {
  const navigate = useNavigate();
  const [show] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => navigate("/", { replace: true }), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  const handleClose = () => navigate("/", { replace: true });

  return (
    <ErrorModal
      show={show}
      title="Not Found"
      message={
        <div>
          The page you’re looking for doesn’t exist.
          <div className="mt-2 small text-muted">Redirecting to Login…</div>
        </div>
      }
      onHide={handleClose}
      size="sm"
    />
  );
}

function App() {
  return (
    <div>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* Features */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/resources" element={<ResourceList />} />
        <Route path="/tasks" element={<TaskMonitoring />} />

        {/* 404 -> modal + timed redirect */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>

      {/* Fallback (optional) if router fails to mount */}
      <noscript>
        <div className="text-center text-white p-4">
          <h4>Not Found</h4>
          <Link to="/" className="btn btn-light mt-3">Go to Login</Link>
        </div>
      </noscript>
    </div>
  );
}

export default App;
