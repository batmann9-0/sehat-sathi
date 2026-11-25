// src/app/SpeakButton.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type SpeakButtonProps = {
  englishText: string;
  urduText: string;
};

function chunkText(text: string, maxLen: number = 350): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?۔؟]+[.!?۔؟]+|[^.!?۔؟]+/g) || [];
  const validSentences = sentences.filter((s) => s.trim().length > 0);

  let currentChunk = "";
  for (const sentence of validSentences) {
    if ((currentChunk + sentence).length <= maxLen) {
      currentChunk += sentence;
    } else {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      if (sentence.length > maxLen) {
        let remaining = sentence;
        while (remaining.length > maxLen) {
          const lastSpace = remaining.lastIndexOf(" ", maxLen);
          if (lastSpace > 0) {
            chunks.push(remaining.substring(0, lastSpace).trim());
            remaining = remaining.substring(lastSpace).trim();
          } else {
            chunks.push(remaining.substring(0, maxLen).trim());
            remaining = remaining.substring(maxLen).trim();
          }
        }
        currentChunk = remaining;
      } else {
        currentChunk = sentence;
      }
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

async function fetchTTS(chunks: string[], voice: string): Promise<Blob | null> {
  const blobs: Blob[] = [];
  for (const chunk of chunks) {
    const res = await fetch("https://freeapi.pro/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunk, voice }),
    });
    if (!res.ok) {
      return null;
    }
    const blob = await res.blob();
    blobs.push(blob);
  }
  return new Blob(blobs, { type: "audio/mpeg" });
}

export default function SpeakButton({ englishText, urduText }: SpeakButtonProps) {
  const [activeLang, setActiveLang] = useState<"en" | "ur" | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [showUnsupported, setShowUnsupported] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = "";
        }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function handleSpeak(lang: "en" | "ur") {
    if (activeLang === lang) {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = "";
        }
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setActiveLang(null);
      setIsPreparing(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current.src = "";
      }
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setActiveLang(lang);
    setIsPreparing(true);

    const text = lang === "en" ? englishText : urduText;
    const voice = lang === "en" ? "voice-2" : "voice-311";
    const chunks = chunkText(text, 350);

    try {
      const audioBlob = await fetchTTS(chunks, voice);
      if (!audioBlob) {
        throw new Error("TTS fetch failed");
      }

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setActiveLang(null);
        setIsPreparing(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setActiveLang(null);
        setIsPreparing(false);
      };

      setIsPreparing(false);
      await audio.play();
    } catch (e) {
      setIsPreparing(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === "en" ? "en-US" : "ur-PK";
        utterance.onend = () => {
          setActiveLang(null);
          setIsPreparing(false);
        };
        utterance.onerror = () => {
          setActiveLang(null);
          setIsPreparing(false);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setShowUnsupported(true);
        setActiveLang(null);
      }
    }
  }

  if (showUnsupported) {
    return (
      <p className="note" style={{ marginTop: 16 }}>
        Audio not supported on this device ·{" "}
        <span className="ur">اس ڈیوائس پر آڈیو دستیاب نہیں</span>
      </p>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => handleSpeak("en")}
        disabled={isPreparing || (activeLang !== null && activeLang !== "en")}
      >
        {activeLang === "en"
          ? isPreparing
            ? "Preparing… · تیار ہو رہا ہے"
            : "Stop · روکیں"
          : "Listen in English"}
      </button>
      <button
        type="button"
        className="btn btn--secondary"
        onClick={() => handleSpeak("ur")}
        disabled={isPreparing || (activeLang !== null && activeLang !== "ur")}
      >
        {activeLang === "ur" ? (
          isPreparing ? (
            "Preparing… · تیار ہو رہا ہے"
          ) : (
            "Stop · روکیں"
          )
        ) : (
          <span className="ur">اردو میں سنیں</span>
        )}
      </button>
    </div>
  );
}