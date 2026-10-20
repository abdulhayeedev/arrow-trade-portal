"use client";

import { useState } from "react";
import ChatThread from "@/components/ChatThread";
import type { ConversationSummary, Msg } from "@/lib/chat/types";

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

export default function ChatShell({
  conversations: initialConversations,
  activeId,
  initialMessages,
  initialQuestion,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  initialMessages: Msg[];
  initialQuestion?: string;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>(initialConversations);
  const [currentId, setCurrentId] = useState<string | null>(activeId);
  const [menuId, setMenuId] = useState<string | null>(null);

  function handleSaved(saved: ConversationSummary) {
    setCurrentId(saved.id);
    setConversations((prev) => {
      const existing = prev.find((c) => c.id === saved.id);
      const title = existing?.title || saved.title || "New chat";
      return [{ id: saved.id, title, updated_at: saved.updated_at }, ...prev.filter((c) => c.id !== saved.id)];
    });
  }

  async function handleDelete(id: string) {
    setMenuId(null);
    if (!window.confirm("Delete this chat? This can't be undone.")) return;
    try {
      const res = await fetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
    } catch {
      window.alert("Couldn't delete that chat. Please try again.");
      return;
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (id === currentId) window.location.href = "/assistant";
  }

  // Group the list by day, keeping the newest first.
  const groups: { label: string; items: ConversationSummary[] }[] = [];
  for (const c of conversations) {
    const label = dayLabel(c.updated_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(c);
    else groups.push({ label, items: [c] });
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#E5E5E7] bg-[#FAFAFB] md:flex">
        <div className="p-3">
          <a
            href="/assistant"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#14171F] transition-colors hover:bg-[#F1F2F4]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E9EAEE]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            New chat
          </a>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {groups.length === 0 ? (
            <p className="px-3 pt-2 text-[13px] leading-snug text-[#9AA2B1]">
              Your past chats will appear here.
            </p>
          ) : (
            groups.map((g) => (
              <div key={g.label} className="mb-3">
                <div className="px-3 pb-1 pt-2 text-[11.5px] font-semibold text-[#9AA2B1]">{g.label}</div>
                {g.items.map((c) => (
                  <div key={c.id} className="group relative">
                    <a
                      href={`/assistant?c=${c.id}`}
                      title={c.title}
                      className={`block truncate rounded-lg py-2 pl-3 pr-9 text-[13.5px] transition-colors ${
                        c.id === currentId
                          ? "bg-[#EDEEF2] font-semibold text-[#14171F]"
                          : "text-[#374151] hover:bg-[#F1F2F4]"
                      }`}
                    >
                      {c.title}
                    </a>
                    <button
                      type="button"
                      aria-label="Chat options"
                      onClick={() => setMenuId(menuId === c.id ? null : c.id)}
                      className={`absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#6B7280] transition-opacity hover:bg-[#E3E5EA] ${
                        menuId === c.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                      </svg>
                    </button>
                    {menuId === c.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                        <div className="absolute right-1.5 top-9 z-20 w-36 overflow-hidden rounded-lg border border-[#E5E5E7] bg-white py-1 shadow-[0_10px_28px_rgba(20,23,31,0.14)]">
                          <button
                            type="button"
                            onClick={() => void handleDelete(c.id)}
                            className="block w-full px-3 py-2 text-left text-[13px] font-medium text-[#A50D24] hover:bg-[#FFF3F2]"
                          >
                            Delete chat
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>

      <ChatThread
        conversationId={activeId}
        initialMessages={initialMessages}
        initialQuestion={initialQuestion}
        onSaved={handleSaved}
      />
    </div>
  );
}