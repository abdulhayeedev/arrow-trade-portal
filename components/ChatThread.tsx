"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ConversationSummary, Msg } from "@/lib/chat/types";

const STARTERS = [
  { title: "Find a product", hint: "Search the catalogue by part, size or type", text: "Help me find a product" },
  { title: "Check an order", hint: "Status of your orders, quotes and RFQs", text: "Where is my latest order?" },
  { title: "Solve a problem", hint: "Talk through a technical issue", text: "I have a technical problem" },
];

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
    const heading = line.match(/^#{1,4}\s+(.*)$/);
    if (heading) {
      return (
        <div key={i} className="mt-2 font-bold">
          {renderInline(heading[1])}
        </div>
      );
    }
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      return (
        <div key={i} className="flex gap-2.5 pl-1">
          <span>•</span>
          <span className="min-w-0">{renderInline(bullet[1])}</span>
        </div>
      );
    }
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (numbered) {
      return (
        <div key={i} className="flex gap-2.5 pl-1">
          <span className="w-4 shrink-0 text-right">{numbered[1]}.</span>
          <span className="min-w-0">{renderInline(numbered[2])}</span>
        </div>
      );
    }
    if (!line.trim()) return <div key={i} className="h-3" />;
    return <div key={i}>{renderInline(line)}</div>;
  });
}

function ReplyFooter({ question, searchQuery }: { question: string; searchQuery?: string }) {
  const rfqHref = question
    ? `/rfq?description=${encodeURIComponent(`Question from the assistant: ${question}`.slice(0, 1500))}`
    : "/rfq";
  const catalogueHref = searchQuery ? `/products?q=${encodeURIComponent(searchQuery)}` : "/products";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-[#F1F2F4] pt-3 text-[13px] leading-snug text-[#6B7280]">
      <span>
        Need a quote or a custom part?{" "}
        <a href={rfqHref} className="font-semibold text-[#FF4438] underline underline-offset-2">
          Start an RFQ
        </a>
      </span>
      <span>
        Prefer to look yourself?{" "}
        <a href={catalogueHref} className="font-semibold text-[#FF4438] underline underline-offset-2">
          Browse the catalogue
        </a>
      </span>
    </div>
  );
}

export default function ChatThread({
  conversationId,
  initialMessages,
  initialQuestion,
  onSaved,
}: {
  conversationId: string | null;
  initialMessages: Msg[];
  initialQuestion?: string;
  onSaved: (conversation: ConversationSummary) => void;
}) {
  const startingWithQuestion = Boolean(initialQuestion) && initialMessages.length === 0;

  const [messages, setMessages] = useState<Msg[]>(() =>
    initialMessages.length > 0
      ? initialMessages
      : initialQuestion
        ? [{ role: "user", text: initialQuestion }]
        : []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(startingWithQuestion);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startedRef = useRef(false);
  const conversationIdRef = useRef<string | null>(conversationId);

  async function ask(text: string, alreadyShown = false) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!alreadyShown) setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setError("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversationIdRef.current, message: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "The assistant is unavailable right now. Please try again in a moment.");
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.reply, searchQuery: data.searchQuery ?? undefined },
        ]);
        if (data.conversationId) {
          if (!conversationIdRef.current) {
            conversationIdRef.current = data.conversationId;
            window.history.replaceState(null, "", `/assistant?c=${data.conversationId}`);
          }
          onSaved({
            id: data.conversationId,
            title: data.title ?? "",
            updated_at: data.updatedAt ?? new Date().toISOString(),
          });
        }
      }
    } catch {
      setError("Couldn't reach the assistant. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  // A question sent from the homepage search bar (?q=) is answered straight away.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (startingWithQuestion && initialQuestion) {
      window.history.replaceState(null, "", "/assistant");
      void ask(initialQuestion, true);
    } else {
      textareaRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) void ask(input);
    }
  }

  function autosize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  const empty = messages.length === 0 && !loading;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-6 py-8">
          {empty ? (
            <div className="flex min-h-[48vh] flex-col items-center justify-center text-center">
              <h1 className="text-[30px] font-bold tracking-tight">What can I help you with?</h1>
              <p className="mt-2 max-w-[500px] text-sm leading-relaxed text-[#6B7280]">
                Ask about a part, check an order or quote, or talk through a technical problem. I answer from
                Arrow&rsquo;s catalogue and your account.
              </p>
              <div className="mt-8 grid w-full grid-cols-3 gap-3">
                {STARTERS.map((s) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => void ask(s.text)}
                    className="rounded-2xl border border-[#E5E5E7] bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#FF4438] hover:shadow-[0_10px_24px_rgba(20,23,31,0.08)]"
                  >
                    <div className="text-sm font-bold">{s.title}</div>
                    <div className="mt-1 text-xs leading-snug text-[#6B7280]">{s.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-7">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="max-w-[85%] self-end whitespace-pre-wrap rounded-2xl bg-[#F1F2F4] px-4 py-2.5 text-[15px] leading-relaxed"
                  >
                    {m.text}
                  </div>
                ) : (
                  <div key={i} className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF4438] text-[11px] font-bold text-white">
                      A
                    </div>
                    <div className="min-w-0 text-[15px] leading-7">
                      {renderMessage(m.text)}
                      <ReplyFooter
                        question={messages[i - 1]?.role === "user" ? messages[i - 1].text : ""}
                        searchQuery={m.searchQuery}
                      />
                    </div>
                  </div>
                )
              )}
              {loading && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FF4438] text-[11px] font-bold text-white">
                    A
                  </div>
                  <div className="flex items-center gap-1.5 pt-2.5" aria-label="The assistant is working on it">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9AA2B1]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9AA2B1] [animation-delay:200ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#9AA2B1] [animation-delay:400ms]" />
                  </div>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
                  {error}
                </div>
              )}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-[#F1F2F4] bg-white px-6 pb-4 pt-3">
        <div className="mx-auto w-full max-w-[760px]">
          {messages.length > 0 && (
            <div className="mb-2 flex justify-end md:hidden">
              <a
                href="/assistant"
                className="rounded-md px-2.5 py-1 text-xs font-semibold text-[#6B7280] transition-colors hover:bg-[#F1F2F4]"
              >
                New chat
              </a>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loading) void ask(input);
            }}
            className="flex items-end gap-2 rounded-2xl border border-[#E5E5E7] bg-white p-2 pl-4 shadow-[0_6px_20px_rgba(20,23,31,0.07)] focus-within:border-[#14171F]"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autosize();
              }}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={1500}
              placeholder="Message the assistant…"
              aria-label="Message the assistant"
              className="max-h-40 min-h-[40px] grow resize-none bg-transparent py-2.5 text-[15px] leading-snug text-[#14171F] outline-none placeholder:text-[#9AA2B1]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF4438] text-white transition-colors hover:bg-[#E63A2F] disabled:opacity-40"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] leading-snug text-[#9AA2B1]">
            AI can make mistakes: an Arrow engineer should confirm technical advice. Chats are saved so we can
            improve answers, so please don&rsquo;t share confidential details.{" "}
            <a href="/rfq" className="font-semibold text-[#6B7280] underline">
              Talk to an engineer
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}