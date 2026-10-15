"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "arrow-assistant-chat";
const SUGGESTIONS = ["Help me find a product", "Where is my order?", "I have a technical problem"];

function isSafeHref(href: string): boolean {
  return (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://arrowengineering.com");
}

function renderInline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const label = link[1];
      const href = link[2];
      if (!isSafeHref(href)) return <span key={i}>{label}</span>;
      const external = href.startsWith("http");
      return (
        <a
          key={i}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="font-semibold text-[#FF4438] underline underline-offset-2"
        >
          {label}
        </a>
      );
    }
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

function renderMessage(text: string) {
  return text.split("\n").map((line, i) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      return (
        <div key={i} className="flex gap-2 pl-1">
          <span>•</span>
          <span>{renderInline(bullet[1])}</span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <div key={i}>{renderInline(line)}</div>;
  });
}

export default function ChatWidget({ launcher = true }: { launcher?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // ignore unreadable saved chat
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage unavailable: the chat still works for this page
    }
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setMessages([...next, { role: "assistant", text: data.reply }]);
      }
    } catch {
      setError("Couldn't reach the assistant. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const sendRef = useRef(send);
  sendRef.current = send;
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  // The homepage search bar asks the assistant by sending this event.
  useEffect(() => {
    function onAsk(e: Event) {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (!text) return;
      setOpen(true);
      if (loadingRef.current) setInput(text);
      else sendRef.current(text);
    }
    window.addEventListener("arrow-chat:ask", onAsk);
    return () => window.removeEventListener("arrow-chat:ask", onAsk);
  }, []);

  return (
    <>
      {open && (
        <div className={`fixed ${launcher ? "bottom-24" : "bottom-6"} right-6 z-[60] flex h-[560px] max-h-[calc(100vh-8rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white shadow-[0_24px_60px_rgba(20,23,31,0.22)]`}>
          <div className="flex items-center justify-between border-b border-[#E5E5E7] px-4 py-3">
            <div>
              <div className="text-sm font-bold text-[#14171F]">Arrow Assistant</div>
              <div className="text-[11px] text-[#9AA2B1]">Beta · Answers come from our catalogue and your account</div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMessages([]);
                    setError("");
                  }}
                  className="rounded-md px-2 py-1 text-[11.5px] font-semibold text-[#6B7280] hover:bg-[#F1F2F4]"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F1F2F4]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#FAFAFB] px-4 py-4">
            {messages.length === 0 ? (
              <div>
                <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-3 text-[13.5px] leading-relaxed text-[#14171F] shadow-sm">
                  Hi, I can help you find products, check on your orders and quotes, or talk through a technical
                  problem. What do you need?
                </div>
                <div className="mt-3 flex flex-col items-start gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="rounded-full border border-[#E5E5E7] bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-[#374151] transition-colors hover:border-[#FF4438] hover:text-[#FF4438]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.role === "user"
                        ? "ml-8 self-end rounded-2xl rounded-tr-sm bg-[#14171F] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-white"
                        : "mr-6 self-start rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#14171F] shadow-sm"
                    }
                  >
                    {m.role === "user" ? m.text : renderMessage(m.text)}
                  </div>
                ))}
                {loading && (
                  <div className="mr-6 self-start rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13.5px] text-[#9AA2B1] shadow-sm">
                    Thinking…
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="mt-3 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-3 py-2 text-[12.5px] text-[#A50D24]">
                {error}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-[#E5E5E7] bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question…"
                aria-label="Message the assistant"
                maxLength={1500}
                className="h-10 grow rounded-lg border border-[#E5E5E7] px-3 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 rounded-lg bg-[#FF4438] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#E63A2F] disabled:opacity-50"
              >
                Send
              </button>
            </form>
            <p className="mt-2 text-[10.5px] leading-snug text-[#9AA2B1]">
              AI can make mistakes: an Arrow engineer should confirm technical advice. Chats are saved so we can
              improve answers, so please don&rsquo;t share confidential details.{" "}
              <a href="/rfq" className="font-semibold text-[#6B7280] underline">
                Talk to an engineer
              </a>
            </p>
          </div>
        </div>
      )}

      {launcher && <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open assistant"}
        className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#14171F] text-white shadow-[0_10px_28px_rgba(20,23,31,0.35)] transition-colors hover:bg-[#2A2E38]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>}
    </>
  );
}