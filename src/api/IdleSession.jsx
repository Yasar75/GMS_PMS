import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorModal from "../sections/features/components/ErrorModal";
import { clearToken, touchActivity, isIdle, isAuthenticated } from "./authSession";

const IDLE_MS = 2 * 60 * 1000; // 2 minutes

export default function IdleSession() {
  const navigate = useNavigate();
  const location = useLocation();

  const [authed, setAuthed] = useState(isAuthenticated());
  const [expired, setExpired] = useState(false);

  const ticker = useRef(null);
  const detachActivityRef = useRef(() => {});

  // --- helpers --------------------------------------------------------------
  const stopTicker = () => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
  };

  const startTicker = () => {
    stopTicker();
    ticker.current = setInterval(() => {
      // bail out if logged out mid-cycle
      if (!isAuthenticated()) {
        setAuthed(false);
        setExpired(false);
        stopTicker();
        return;
      }
      if (isIdle(IDLE_MS)) {
        stopTicker();
        setExpired(true);
      }
    }, 1000);
  };

  const attachActivityListeners = () => {
    const bump = () => touchActivity();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    bump(); // seed
    detachActivityRef.current = () =>
      events.forEach((e) => window.removeEventListener(e, bump));
  };

  const detachActivityListeners = () => {
    detachActivityRef.current?.();
    detachActivityRef.current = () => {};
  };

  // React to auth changes (same tab + cross tab)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "authToken") {
        const nowAuthed = !!e.newValue;
        setAuthed(nowAuthed);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Turn the watcher on/off based on auth
  useEffect(() => {
    if (authed) {
      attachActivityListeners();
      startTicker();
    } else {
      setExpired(false);           // no modal when logged out
      stopTicker();
      detachActivityListeners();
    }
    return () => {
      stopTicker();
      detachActivityListeners();
    };
  }, [authed]);

  // Close => hide modal, clear token, flip authed false, redirect
  const handleClose = () => {
    setExpired(false);
    clearToken();
    setAuthed(false); // same-tab immediate effect (storage event won’t fire here)
    if (location.pathname !== "/") {
      navigate("/", { replace: true, state: { from: location } });
    }
  };

  // If not logged in, render nothing (no modal, no listeners)
  if (!authed || !expired) return null;

  return (
    <ErrorModal
      show
      title="Session expired"
      message="You were inactive for 2 minutes. Please sign in again."
      onHide={handleClose}
      onClose={handleClose}
      size="sm"
    />
  );
}
