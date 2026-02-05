import { useRef, useState, useEffect } from "react";
import { useChat } from "../../hooks/useChat";

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // Track listening state in ref to avoid closure issues

  const languages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "hi-IN", name: "Hindi" },
  ];

  // Initialize speech recognition
  // Inside UI component...
const sendMessage = (directText) => {
    const text = typeof directText === 'string' ? directText : input.current.value;
    
    if (!loading && text.trim()) {
      chat(text);
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
    
    // Setting continuous to FALSE makes it stop and trigger 'onend' 
    // as soon as you stop speaking (the pause-to-send behavior).
    recognition.continuous = false; 
    recognition.interimResults = true;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
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
        sendMessage(finalValue);
      } else {
        setIsListening(false);
        isListeningRef.current = false;
        setInterimText("");
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech Error:', event.error);
      setIsListening(false);
      isListeningRef.current = false;
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
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="select select-bordered flex-1 rounded-xl bg-white bg-opacity-60 backdrop-blur-md border-2 border-[#064e3b]/20 focus:border-[#064e3b] focus:outline-none font-bold text-[#064e3b]"
              disabled={isListening}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
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