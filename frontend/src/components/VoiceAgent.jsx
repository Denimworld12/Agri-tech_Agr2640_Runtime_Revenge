import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Speech Recognition Setup ──────────────────────────────────────
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

// ── Action Executor ───────────────────────────────────────────────
function executeActions(actions, navigate) {
  for (const action of actions) {
    switch (action.type) {
      case "NAVIGATE":
        navigate(action.path);
        break;
      case "SPEAK":
        speak(action.text);
        break;
      case "CLICK": {
        const el = document.querySelector(action.selector);
        if (el) el.click();
        break;
      }
      case "FILL": {
        const inp = document.querySelector(action.selector);
        if (inp) {
          // Trigger React-compatible onChange
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
          ).set;
          nativeInputValueSetter.call(inp, action.value);
          inp.dispatchEvent(new Event("input", { bubbles: true }));
        }
        break;
      }
      case "SCROLL":
        window.scrollBy({
          top: action.direction === "down" ? 400 : -400,
          behavior: "smooth",
        });
        break;
      default:
        break;
    }
  }
}

// ── Text-to-Speech ────────────────────────────────────────────────
function speak(text) {
  if (!text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  // Prefer Hindi voice, fall back to default
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(
    (v) => v.lang.startsWith("hi") || v.name.toLowerCase().includes("hindi")
  );
  if (hindiVoice) utter.voice = hindiVoice;
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

// ── Ripple animation keyframes (injected once) ────────────────────
const STYLE_ID = "voice-agent-styles";
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes voice-ripple {
      0%   { transform: scale(1);   opacity: 0.5; }
      100% { transform: scale(2.2); opacity: 0;   }
    }
    @keyframes voice-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
      50%      { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ─────────────────────────────────────────────────────
const VoiceAgent = () => {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [showToast, setShowToast] = useState(false);
  const recognitionRef = useRef(null);
  const toastTimer = useRef(null);

  // Hide toast after delay
  const flash = useCallback((text) => {
    setLastResponse(text);
    setShowToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowToast(false), 4000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(toastTimer.current);
      if (recognitionRef.current) recognitionRef.current.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Start Listening ──────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      flash("Voice not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN"; // Hindi primary, also picks up English
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
    };

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
      setProcessing(true);

      try {
        const resp = await fetch(`${API_URL}/api/voice-command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const plan = await resp.json();

        // Speak the response
        if (plan.response_text) {
          speak(plan.response_text);
          flash(plan.response_text);
        }

        // Execute all actions
        executeActions(plan.actions || [], navigate);
      } catch (err) {
        console.error("Voice agent error:", err);
        const errMsg = "सर्वर से कनेक्ट नहीं हो पाया";
        speak(errMsg);
        flash(errMsg);
      } finally {
        setProcessing(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setListening(false);
      if (event.error !== "aborted") {
        flash("Voice error — please try again");
      }
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [navigate, flash]);

  // ── Stop listening ───────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setListening(false);
  }, []);

  // ── Render ───────────────────────────────────────────────────
  const isActive = listening || processing;

  return (
    <>
      {/* ── Toast / Transcript popup ─────────────────────────── */}
      {(showToast || transcript) && (
        <div
          className="fixed bottom-28 right-6 z-[1100] max-w-xs rounded-xl bg-base-100 
                     shadow-lg border border-base-300 px-4 py-3 transition-all duration-300"
          style={{ opacity: showToast || listening || processing ? 1 : 0 }}
        >
          {transcript && (
            <p className="text-xs text-base-content/60 mb-1">
              🎤 "{transcript}"
            </p>
          )}
          {lastResponse && (
            <p className="text-sm font-medium text-base-content">
              {lastResponse}
            </p>
          )}
          {processing && (
            <div className="flex items-center gap-2 mt-1">
              <span className="loading loading-dots loading-xs text-success" />
              <span className="text-xs text-base-content/50">Processing…</span>
            </div>
          )}
        </div>
      )}

      {/* ── Microphone FAB ───────────────────────────────────── */}
      <button
        onClick={isActive ? stopListening : startListening}
        disabled={processing}
        className={`
          fixed bottom-20 right-6 z-[1100] lg:bottom-8
          w-14 h-14 rounded-full flex items-center justify-center
          shadow-xl transition-all duration-200 select-none
          ${
            listening
              ? "bg-red-500 text-white scale-110"
              : processing
              ? "bg-yellow-500 text-white cursor-wait"
              : "bg-success text-white hover:scale-105 active:scale-95"
          }
        `}
        style={listening ? { animation: "voice-pulse 1.2s infinite" } : {}}
        aria-label={listening ? "Stop listening" : "Voice command"}
        title="Voice Agent"
      >
        {/* Ripple rings when listening */}
        {listening && (
          <>
            <span
              className="absolute inset-0 rounded-full bg-red-400"
              style={{ animation: "voice-ripple 1.5s infinite" }}
            />
            <span
              className="absolute inset-0 rounded-full bg-red-400"
              style={{ animation: "voice-ripple 1.5s 0.5s infinite" }}
            />
          </>
        )}

        {/* Icon */}
        <span className="material-symbols-outlined relative z-10 text-2xl">
          {listening ? "stop" : processing ? "hourglass_top" : "mic"}
        </span>
      </button>
    </>
  );
};

export default VoiceAgent;
