import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/admin";
import { chatEnabledFor } from "@/lib/chat/enabled";
import type { Msg } from "@/lib/chat/types";
import SiteHeader from "@/components/SiteHeader";
import ChatShell from "@/components/ChatShell";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: { c?: string; q?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!chatEnabledFor(true, await isStaff(user.id))) {
    redirect("/");
  }

  // Past conversations, newest first. Always limited to this person's own chats.
  const { data: conversations } = await supabase
    .from("chat_conversations")
    .select("id, title, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(100);

  let activeId: string | null = null;
  let messages: Msg[] = [];

  const requested = searchParams.c;
  if (requested && UUID.test(requested)) {
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", requested)
      .eq("user_id", user.id)
      .maybeSingle();

    if (conv) {
      activeId = conv.id as string;
      const { data: rows } = await supabase
        .from("chat_messages")
        .select("role, text, search_query")
        .eq("conversation_id", activeId)
        .order("seq", { ascending: true })
        .limit(200);

      messages = (rows ?? []).map((r) => ({
        role: r.role as "user" | "assistant",
        text: r.text as string,
        searchQuery: (r.search_query as string | null) ?? undefined,
      }));
    }
  }

  // A question sent from the homepage search bar starts a new chat.
  const initialQuestion = !activeId && searchParams.q ? searchParams.q.slice(0, 1500) : undefined;

  return (
    <main className="flex h-screen flex-col bg-white text-[#14171F]">
      <SiteHeader active="Assistant" user={user} hideChatLauncher />
      <ChatShell
        conversations={conversations ?? []}
        activeId={activeId}
        initialMessages={messages}
        initialQuestion={initialQuestion}
      />
    </main>
  );
}