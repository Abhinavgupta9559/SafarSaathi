import { useState, useRef, useCallback, useEffect } from "react";
import { FiMic, FiMicOff } from "react-icons/fi";
import { useLanguage } from "../context/LanguageContext";

/**
 * A microphone button that uses the browser's built-in SpeechRecognition
 * API (no external service, no API key needed) to convert speech to text.
 * Recognition language follows the app's current language (Hindi/English)
 * so users can simply speak their destination instead of typing it.
 *
 * onResult(transcript: string) is called once a final result is ready.
 */
export default function MicButton({ onResult, size = "md" }) {
  const { language, t } = useLanguage();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResult]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === "hi" ? "hi-IN" : "en-IN";
    }
  }, [language]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        // start() throws if already started; ignore.
      }
    }
  }, [listening]);

  if (!supported) return null;

  const dimension = size === "sm" ? 36 : 44;

  return (
    <button
      type="button"
      onClick={toggleListening}
      aria-label={listening ? t("common.listening") : "Speak"}
      title={listening ? t("common.listening") : "Speak instead of typing"}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: "50%",
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0,
        background: listening ? "var(--color-danger)" : "var(--color-teal)",
        color: "#fff",
        transition: "transform 0.15s ease, background 0.15s ease",
        transform: listening ? "scale(1.08)" : "scale(1)",
        boxShadow: listening ? "0 0 0 6px rgba(192,57,43,0.15)" : "none",
      }}
    >
      {listening ? <FiMicOff size={18} /> : <FiMic size={18} />}
    </button>
  );
}
