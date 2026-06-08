"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { APP_URL } from '@/config/constant';
import CustomModal from "@/components/Layouts/CustomModal";

function formatRemaining(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return { m, s, label: `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` };
}

// Simple modal; replace with your design system if you like
function SessionExpiredModal({ onRelogin }: { onRelogin: () => void }) {
  return (
    <CustomModal
      isOpen={true}
      onClose={onRelogin}
      modalSizeClassName="modal-sm"
      title="Session Timeout"
    >
      <div className="primaryHead">Your session has been expired. Please log in again.</div>
        <div className="admin-card custom-flex-center cmt-20">
        <div className='d-flex align-items-end'>
            <button
            className="iconBtn green v2"
            onClick={onRelogin}
            >
           Log In Again
            </button>
        </div>
       </div>
    </CustomModal>
  );
}

function SessionExpiringModal({isOpen, remainingMs, onRelogin, onClose}: {
  isOpen: boolean;
  remainingMs: number;
  onRelogin: () => void;
  onClose: () => void;
}) {
  const { m, s, label } = formatRemaining(remainingMs);
  const phaseText =
    remainingMs > 60_000
      ? "Session will expire soon"
      : "Session about to expire";

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} modalSizeClassName="modal-md" title={phaseText}>
      <div className="primaryHead">
        Time’s almost up! Your session will expire in <strong>{label}</strong> min(s).
      </div>
      <div className="mt-4 d-flex justify-content-between gap-2">
        <button onClick={onClose} className="iconBtn green v2">
          Close This Popup
        </button>
        <button onClick={onRelogin} className="iconBtn grey v2">
          Log In Again
        </button>
      </div>
       {/* <div className="mt-4 flex justify-start gap-2">
        <button onClick={onRelogin} className="iconBtn red v2">Close This Window</button>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onRelogin} className="iconBtn bg-secondary v2">Log In Again</button>
      </div> */}
    </CustomModal>
  );
}

const EXPIRY_KEY = "expiresAt";
const DISMISS_KEY = "expWarnDismissedFor";
const WARN_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const FINAL_WINDOW_MS = 60 * 1000;    // last 1 minute
const TICK_MINUTE_MS = 60 * 1000;     // minute cadence
const TICK_FIVE_SEC_MS = 5 * 1000;    // 5 second cadence

/** Monotonic clock anchored at mount: immune to system time jumps & focus changes */
function makeMonotonicNow() {
  const originWall = Date.now();
  const originPerf = performance.now();
  return () => originWall + (performance.now() - originPerf);
}

function isDismissedFor(expiryAt: number | null): boolean {
  if (!expiryAt || typeof window === "undefined") return false;
  const raw = sessionStorage.getItem(DISMISS_KEY);
  return raw === String(expiryAt);
}

function setDismissedFor(expiryAt: number | null) {
  if (!expiryAt || typeof window === "undefined") return;
  sessionStorage.setItem(DISMISS_KEY, String(expiryAt));
}

function clearDismissal() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DISMISS_KEY);
}

// Read expiry from storage
function getExpiryMs(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(EXPIRY_KEY);
  if (!raw) return null;
  const ts = Number(raw);
  return Number.isFinite(ts) ? ts : null;
}

export default function SessionTimeoutHandler() {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const [expired, setExpired] = useState(false);  
  const [showWarn, setShowWarn] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [expiryAt, setExpiryAt] = useState<number | null>(null);
  
  const nowRef = useRef<() => number>(() => Date.now()); // replaced at mount
  const armedRef = useRef(false);
  const timeoutIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<number | null>(null);
  const warnTickRef = useRef<number | null>(null);    // minute/5s cadence while warning visible

  // Redirect handler (one-shot)
  const handleRelogin = () => {
    // Clear any auth artifacts if needed
    // localStorage.removeItem("your_access_token_key");
    setExpired(false);
    // Use hard redirect to be bulletproof in every state:
    dispatch(logout());
    // localStorage.clear();
    sessionStorage.clear();
    router.push(APP_URL.DEFAULT_APP_PATH);
  };

  // Clears existing timeout
  const clearTimer = () => {
    if (timeoutIdRef.current) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  };

  const clearWarnTicker = () => {
    if (warnTickRef.current) {
      window.clearInterval(warnTickRef.current);
      warnTickRef.current = null;
    }
  };

  // Arms a precise timeout if expiry is in the future
  const armPreciseTimeout = (expiryAt: number) => {
    clearTimer();
    const remaining = Math.max(0, expiryAt - Date.now());
    if (remaining === 0) {
      setExpired(true);
      return;
    }
    timeoutIdRef.current = window.setTimeout(() => setExpired(true), remaining);
  };

  // Set up the warning ticker with the requested cadence:
  // - from 5:00 to 1:00 => tick every 60s
  // - from 1:00 to 0:00 => tick every 5s
  const setupWarnTicker = (initialRemaining: number, expiryAt: number) => {
    clearWarnTicker();

    const chooseInterval = (rem: number) =>
      rem > FINAL_WINDOW_MS ? TICK_MINUTE_MS : TICK_FIVE_SEC_MS;

    let currentInterval = chooseInterval(initialRemaining);

    const tick = () => {
      const rem = Math.max(0, expiryAt - Date.now());
      setRemainingMs(rem);

      // If we crossed from >1m into <=1m, retune to 5s cadence
      const desired = chooseInterval(rem);
      if (desired !== currentInterval) {
        currentInterval = desired;
        clearWarnTicker();
        warnTickRef.current = window.setInterval(tick, currentInterval);
      }

      if (rem <= 0) {
        setShowWarn(false);
        clearWarnTicker();
        // expiry will also flip via the precise timeout, but guard here too:
        setExpired(true);
      }
    };

    warnTickRef.current = window.setInterval(tick, currentInterval);
  };

  // Lightweight poller to catch any edge cases (e.g., clocks, missed events)
  const startPoller = () => {
    if (intervalIdRef.current) return;
    intervalIdRef.current = window.setInterval(() => {
      const expiryAt = getExpiryMs();
      if (!expiryAt) return;
      setExpiryAt(expiryAt);
      const now = nowRef.current();
      const rem = expiryAt - now;
      if (Date.now() >= expiryAt) {
        clearTimer();
        setExpired(true);
        clearDismissal();
      }

      if (rem > 0 && rem <= WARN_WINDOW_MS && !showWarn && !expired && !isDismissedFor(expiryAt)) {
        if (!showWarn) {
          setShowWarn(true);
          setRemainingMs(rem);
          setupWarnTicker(rem, expiryAt);
        }
      }

      // hard expiry guard
      if (rem <= 0 && !expired) {
        setShowWarn(false);
        clearWarnTicker();
        clearTimer();
        setExpired(true);
      }
    }, 1000); // check every 5s; adjust if you want
  };

  const stopPoller = () => {
    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  };

  // Arm on mount, on auth events, on storage, and when tab becomes visible
  useEffect(() => {
    nowRef.current = makeMonotonicNow();
    const armFromStorage = () => {
      const expiryAt = getExpiryMs();
      if (!expiryAt) return;
      armPreciseTimeout(expiryAt);
      armedRef.current = true;      
      const rem = expiryAt - Date.now();

      if (rem <= 0) {
        setShowWarn(false);
        clearWarnTicker();
        setExpired(true);
        return;
      }

      if (rem <= WARN_WINDOW_MS && !isDismissedFor(expiryAt)) {
          setShowWarn(true);
          setRemainingMs(rem);
          setupWarnTicker(rem, expiryAt);
        } else {
          // No warn yet; make sure it's clean
          setShowWarn(false);
          clearWarnTicker();
        }
      }

    // Initial arm
    armFromStorage();
    startPoller();

    // Re-arm when tab becomes visible
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        armFromStorage();
      }
    };

    // Same-tab custom events from your login/refresh code
    const onArmed = (e: Event) => {
      const expiryAt =
        (e as CustomEvent)?.detail?.expiryAt ?? getExpiryMs();
      if (expiryAt) {
        setExpiryAt(expiryAt);
        clearDismissal();
        armPreciseTimeout(expiryAt);
        armedRef.current = true;
      }
    };

    // Cross-tab updates (only fires in other tabs)
    const onStorage = (e: StorageEvent) => {
      if (e.key === EXPIRY_KEY) {
        const expiryAt = getExpiryMs();
        if (expiryAt) {
          armPreciseTimeout(expiryAt);
          armedRef.current = true;
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("auth:armed", onArmed as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      clearTimer();
      stopPoller();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("auth:armed", onArmed as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleCloseWarn = () => {
    setShowWarn(false);
    clearWarnTicker();
    setDismissedFor(expiryAt);  // <-- remember dismissal for this expiry cycle
  };

  if (expired) return <SessionExpiredModal onRelogin={handleRelogin} />;

  return showWarn ? <SessionExpiringModal isOpen={showWarn} remainingMs={remainingMs} onRelogin={handleRelogin} onClose={handleCloseWarn} /> : null;
}
