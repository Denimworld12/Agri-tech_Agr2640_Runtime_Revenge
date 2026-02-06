import { useRef, useState, useEffect } from "react";
import { useChat } from "../../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message, selectedLanguage, setSelectedLanguage } = useChat();
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // Track listening state in ref to avoid closure issues

  const languages = [
    { code: "en-IN", name: "English (India)", flag: "🇮🇳" },
    { code: "hi-IN", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: "mr-IN", name: "मराठी (Marathi)", flag: "🇮🇳" },
    { code: "ta-IN", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
    { code: "te-IN", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
    { code: "bn-IN", name: "বাংলা (Bengali)", flag: "🇮🇳" },
    { code: "gu-IN", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
    { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
    { code: "ml-IN", name: "മലയാളം (Malayalam)", flag: "🇮🇳" },
    { code: "pa-IN", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  ];

  // Initialize speech recognition
  // Inside UI component...
  const sendMessage = (directText) => {
    const text = typeof directText === 'string' ? directText : input.current.value;

    if (!loading && text.trim()) {
      chat(text, selectedLanguage); // Pass language to backend
      if (input.current) input.current.value = "";
      setInterimText("");
      // Force listening off after sending
      setIsListening(false);
      isListeningRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  };
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    // Enhanced settings for better accuracy
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;
    recognition.maxAlternatives = 3; // Get top 3 alternatives for better accuracy

    recognition.onstart = () => {
      console.log(`🎤 Voice recognition started (${selectedLanguage})`);
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript = transcript;
          console.log(`✅ Final transcript: "${transcript}" (confidence: ${(confidence * 100).toFixed(0)}%)`);
          // Update the input field with the final text
          if (input.current) input.current.value = transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      setInterimText(interimTranscript);
    };

    recognition.onend = () => {
      const finalValue = input.current?.value.trim();

      // If we have text and were actually listening, send it!
      if (isListeningRef.current && finalValue) {
        console.log(`📤 Sending message: "${finalValue}"`);
        sendMessage(finalValue);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
        setInterimText("");
      }
    };

    recognition.onerror = (event) => {
      console.error('🔴 Speech Error:', event.error);

      // Handle specific errors
      if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected, auto-restarting...');
        // Auto-restart for no-speech errors
        setTimeout(() => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.log('Could not restart:', e.message);
            }
          }
        }, 100);
      } else if (event.error === 'network') {
        // Network errors are common in Brave/Chrome - just log and continue
        console.warn('⚠️ Network hiccup during speech recognition. This is normal in some browsers.');
        // Don't show alert - it's too disruptive
        // The recognition will automatically retry or user can click again
      } else if (event.error === 'not-allowed') {
        alert('❌ Microphone access denied. Please enable microphone permissions in browser settings.');
        setIsListening(false);
        isListeningRef.current = false;
      } else if (event.error === 'aborted') {
        console.log('Speech recognition aborted (normal when stopping)');
        setIsListening(false);
        isListeningRef.current = false;
      } else {
        console.warn(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        isListeningRef.current = false;
      }
    };

    recognitionRef.current = recognition;
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [selectedLanguage, loading]); // Only recreate when language changes

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('❌ Speech recognition not available.\n\nThis feature requires:\n• Chrome, Edge, or Safari\n• Microphone access\n• Internet connection');
      return;
    }

    if (isListening) {
      console.log('🛑 Stopping speech recognition...');
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current.stop();
    } else {
      console.log('▶️ Starting speech recognition...');
      try {
        isListeningRef.current = true;
        recognitionRef.current.start();
        console.log('✅ Recognition started successfully');
      } catch (error) {
        console.error('❌ Start Error:', error);
        console.error('Error details:', error.message);
        alert(`Failed to start speech recognition: ${error.message}`);
        isListeningRef.current = false;
      }
    }
  };



  if (hidden) {
    return null;
  }

  return (
    <div data-theme="lemonade">
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">

        {/* Top Control Buttons */}
        <div className="w-full flex flex-col items-end justify-center gap-4 mt-20">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto btn btn-circle bg-[#064e3b] hover:bg-[#053d2e] text-[#bef264] border-none shadow-lg"
            title={cameraZoomed ? "Zoom Out" : "Zoom In"}
          >
            <span className="material-symbols-outlined">
              {cameraZoomed ? 'zoom_out' : 'zoom_in'}
            </span>
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto btn btn-circle bg-[#064e3b] hover:bg-[#053d2e] text-[#bef264] border-none shadow-lg"
            title="Toggle Background"
          >
            <span className="material-symbols-outlined">video_camera_back</span>
          </button>
        </div>

        {/* Bottom Interaction Area */}
        <div className="flex flex-col gap-4 pointer-events-auto max-w-screen-sm w-full mx-auto">

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label className="text-[#bef264] bg-[#064e3b] bg-opacity-90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
              🗣️ Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="select select-bordered flex-1 rounded-xl bg-white bg-opacity-60 backdrop-blur-md border-2 border-[#064e3b]/20 focus:border-[#064e3b] focus:outline-none font-bold text-[#064e3b]"
              disabled={isListening}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input Area */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                className="input input-ghost w-full p-4 h-14 rounded-xl bg-white bg-opacity-60 backdrop-blur-xl shadow-2xl border border-white/20 focus:bg-white/80 transition-all text-[#064e3b] placeholder:text-[#064e3b]/40 font-medium"
                placeholder="Type a message..."
                ref={input}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              {/* Interim Speech Text Overlay */}
              {interimText && (
                <div className="absolute bottom-full left-0 right-0 mb-3 p-3 bg-[#bef264] bg-opacity-95 backdrop-blur-md rounded-xl text-xs text-[#064e3b] font-bold shadow-xl animate-in slide-in-from-bottom-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#064e3b] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#064e3b]"></span>
                  </span>
                  <span className="italic">Listening: {interimText}</span>
                </div>
              )}
            </div>

            {/* Voice Button */}
            <button
              onClick={toggleSpeechRecognition}
              className={`btn btn-circle h-14 w-14 border-none shadow-xl transition-all duration-300 ${isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white'
                : 'bg-[#064e3b] hover:bg-[#053d2e] text-[#bef264]'
                }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <span className="material-symbols-outlined text-2xl">
                {isListening ? 'mic' : 'mic_off'}
              </span>
            </button>

            {/* Send Button */}
            <button
              disabled={loading}
              onClick={sendMessage}
              className={`btn bg-[#064e3b] hover:bg-[#053d2e] text-white h-14 px-8 font-black uppercase tracking-[0.2em] rounded-xl border-none shadow-xl transition-all ${loading ? "cursor-not-allowed opacity-30" : "hover:scale-105"
                }`}
            >
              {loading ? <span className="loading loading-spinner"></span> : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};