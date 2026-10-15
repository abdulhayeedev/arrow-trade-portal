"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export default function SearchBar({
  placeholder,
  chatPlaceholder = "Ask anything: a part, a size or a problem you're solving",
  chatEnabled = false,
  className = "",
}: {
  placeholder: string;
  chatPlaceholder?: string;
  chatEnabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent));

    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!chatEnabled) return; // normal catalogue search: the form submits to /products
    e.preventDefault();
    const text = inputRef.current?.value.trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent("arrow-chat:ask", { detail: { text } }));
    if (inputRef.current) inputRef.current.value = "";
  }

  function searchCatalogue() {
    const text = inputRef.current?.value.trim();
    if (text) window.location.href = `/products?q=${encodeURIComponent(text)}`;
  }

  return (
    <form
      action="/products"
      method="GET"
      onSubmit={handleSubmit}
      className={`relative rounded-[28px] border border-white/60 bg-white/25 p-3 shadow-[0_18px_50px_rgba(60,70,120,0.18)] backdrop-blur-xl ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-white to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/90 to-transparent"
      />

      <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_22px_rgba(50,60,110,0.12)] transition-shadow focus-within:ring-2 focus-within:ring-[#FF4438]/30">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8E94A8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          name="q"
          placeholder={chatEnabled ? chatPlaceholder : placeholder}
          aria-label={chatEnabled ? "Ask the assistant" : "Search the catalogue"}
          autoComplete="off"
          className="h-14 grow bg-transparent text-[15px] text-[#14171F] outline-none placeholder:text-[#8E94A8]"
        />
        {chatEnabled && (
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={searchCatalogue}
              className="hidden whitespace-nowrap text-[12.5px] font-semibold text-[#6B7280] transition-colors hover:text-[#14171F] sm:block"
            >
              Search catalogue
            </button>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-xl bg-[#FF4438] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#E63A2F]"
            >
              Ask
            </button>
          </div>
        )}
        <span
          aria-hidden="true"
          className={`hidden shrink-0 items-center gap-1.5 text-[#8E94A8] ${chatEnabled ? "" : "sm:flex"}`}
        >
          <kbd className="flex h-6 min-w-[26px] items-center justify-center rounded-md bg-[#E0E4F0] px-1.5 font-sans text-[11.5px] font-semibold">
            {isMac ? "⌘" : "Ctrl"}
          </kbd>
          <span className="text-xs">+</span>
          <kbd className="flex h-6 min-w-[26px] items-center justify-center rounded-md bg-[#E0E4F0] px-1.5 font-sans text-[11.5px] font-semibold">
            /
          </kbd>
        </span>
      </div>
    </form>
  );
}