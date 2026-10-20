export type Msg = { role: "user" | "assistant"; text: string; searchQuery?: string };

export type ConversationSummary = { id: string; title: string; updated_at: string };