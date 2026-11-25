// src/app/Assistant.tsx
"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
  lang: "en" | "ur";
};

export default function Assistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<"en" | "ur">("en");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [listeningMsgId, setListeningMsgId] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greeting =
        lang === "en"
          ? "Assalam-o-Alaikum! I am Sathi. Ask me anything about your reports, medicines, or this app."
          : "السلام علیکم! میں ساتھی ہوں۔ اپنی رپورٹس، ادویات یا اس ایپ کے بارے میں کچھ بھی پوچھیں۔";
      setMessages([{ role: "assistant", text: greeting, lang }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = "";
        }
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", text: input.trim(), lang };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text, lang, history }),
      });

      if (!res.ok) {
        throw new Error("Assistant request failed");
      }

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        text: data.reply,
        lang,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      const errorMsg: Message = {
        role: "assistant",
        text:
          "Sorry, I could not answer just now. Please try again. · معذرت، ابھی جواب نہیں مل سکا، دوبارہ کوشش کریں۔",
        lang,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleListen(msg: Message, msgId: string) {
    if (listeningMsgId === msgId) {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current.src = "";
        }
      }
      setListeningMsgId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current.src = "";
      }
    }

    setListeningMsgId(msgId);

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.text, lang: msg.lang }),
      });

      if (!res.ok) {
        throw new Error("Speak request failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setListeningMsgId(null);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setListeningMsgId(null);
      };

      await audio.play();
    } catch (e) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(msg.text);
        utterance.lang = msg.lang === "en" ? "en-US" : "ur-PK";
        utterance.onend = () => setListeningMsgId(null);
        utterance.onerror = () => setListeningMsgId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setListeningMsgId(null);
      }
    }
  }

  function handleMic() {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "ur" ? "ur-PK" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => handleSend(), 100);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  const micSupported =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  if (!isOpen) {
    return (
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 60,
          borderRadius: 999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        Ask Sathi · <span className="ur">ساتھی سے پوچھیں</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 60,
        width: "min(92vw, 380px)",
        maxHeight: "70vh",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          Sathi · <span className="ur">ساتھی</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="btn btn--text"
            onClick={() => setLang("en")}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              background: lang === "en" ? "var(--mint)" : "transparent",
            }}
          >
            EN
          </button>
          <button
            type="button"
            className="btn btn--text"
            onClick={() => setLang("ur")}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              background: lang === "ur" ? "var(--mint)" : "transparent",
            }}
          >
            <span className="ur">اردو</span>
          </button>
          <button
            type="button"
            className="btn btn--text"
            onClick={() => setIsOpen(false)}
            style={{ padding: "4px 8px", fontSize: 16 }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, i) => {
          const msgId = `msg-${i}`;
          const isUser = msg.role === "user";
          return (
            <div key={msgId}>
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: isUser ? "var(--pine)" : "var(--mint)",
                  color: isUser ? "#fff" : "var(--ink)",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  marginLeft: isUser ? "auto" : 0,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {msg.text}
              </div>
              {!isUser && (
                <button
                  type="button"
                  className="btn btn--text"
                  onClick={() => handleListen(msg, msgId)}
                  disabled={listeningMsgId !== null && listeningMsgId !== msgId}
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    padding: "2px 6px",
                  }}
                >
                  {listeningMsgId === msgId
                    ? "Preparing… · تیار ہو رہا ہے"
                    : "Listen · سنیں"}
                </button>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>
            Sathi is typing… · <span className="ur">ساتھی لکھ رہا ہے</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: 12,
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything… · کچھ بھی پوچھیں"
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleMic}
          disabled={!micSupported || isListening}
          title={!micSupported ? "Voice input not supported on this browser" : undefined}
          style={{ padding: "8px 12px" }}
        >
          {isListening ? (
            <>
              Listening… · <span className="ur">سن رہا ہے</span>
            </>
          ) : (
            "🎤"
          )}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{ padding: "8px 16px" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}