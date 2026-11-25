// src/app/SpeakButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type SpeakButtonProps = {
  englishText: string;
  urduText: string;
};

export default function SpeakButton({ englishText, urduText }: SpeakButtonProps) {
  const [speakingLang, setSpeakingLang] = useState<"en" | "ur" | null>(null);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function getVoice(langPrefix: string): SpeechSynthesisVoice | null {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => v.lang.startsWith(langPrefix)) || null;
  }

  function speak(lang: "en" | "ur") {
    if (!window.speechSynthesis) return;

    if (speakingLang === lang) {
      window.speechSynthesis.cancel();
      setSpeakingLang(null);
      return;
    }

    window.speechSynthesis.cancel();
    const text = lang === "en" ? englishText : urduText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "en" ? "en-US" : "ur-PK";
    
    const voice = getVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => setSpeakingLang(null);
    utterance.onerror = () => setSpeakingLang(null);
    
    utteranceRef.current = utterance;
    setSpeakingLang(lang);
    window.speechSynthesis.speak(utterance);
  }

  if (!supported) {
    return (
      <p className="note" style={{ marginTop: 16 }}>
        Audio not supported on this device · <span className="ur">اس ڈیوائس پر آڈیو دستیاب نہیں</span>
      </p>
    );
  }

  const isSpeakingEn = speakingLang === "en";
  const isSpeakingUr = speakingLang === "ur";

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => speak("en")}
        disabled={isSpeakingUr}
      >
        {isSpeakingEn ? "Stop · روکیں" : "Listen in English"}
      </button>
      <button
        type="button"
        className="btn btn--secondary"
        onClick={() => speak("ur")}
        disabled={isSpeakingEn}
      >
        {isSpeakingUr ? (
          "Stop · روکیں"
        ) : (
          <span className="ur">اردو میں سنیں</span>
        )}
      </button>
    </div>
  );
}