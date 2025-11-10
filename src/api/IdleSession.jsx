import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorModal from "../sections/features/components/ErrorModal";
import { clearToken, touchActivity, isIdle } from "./authSession";

const IDLE_MS = 2 * 60 * 1000; // 2 minutes

export default function IdleSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expired, setExpired] = useState(false);
  const ticker = useRef(null);

  // ---- helpers -------------------------------------------------------------
  const startTicker = () => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = setInterval(() => {
      if (isIdle(IDLE_MS)) {
        clearInterval(ticker.current);
        setExpired(true);
      }
    }, 1000);
  };

  // record activity on any interaction
  useEffect(() => {
    const bump = () => touchActivity();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    bump();        // seed lastActiveAt on mount
    startTicker(); // begin polling
    return () => {
      events.forEach((e) => window.removeEventListener(e, bump));
      if (ticker.current) clearInterval(ticker.current);
    };
  }, []);

  // Close button: actually hide the modal, then logout + (optionally) redirect
  const handleClose = () => {
    setExpired(false);     
    clearToken();          // drop auth
    touchActivity();       // reset activity clock
    startTicker();         // resume idle monitoring

    // If you're on a protected route, send to login;
    // if already on "/", this is a no-op but modal is closed now
    if (location.pathname !== "/") {
      navigate("/", { replace: true, state: { from: location } });
    }
  };

  if (!expired) return null;

  return (
    <ErrorModal
      show
      title="Session expired"
      message="You were inactive for 2 minutes. Please sign in again."
      onHide={handleClose}
      size="sm"
      // If your ErrorModal uses a different prop name, this covers both
      onClose={handleClose}
    />
  );
}
